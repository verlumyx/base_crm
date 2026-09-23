import { db } from '@/db/client';
import { isUuid } from '@/modules/shared/uuid';
import { createBotContainer } from '@/modules/bot/container';
import { YCloudChannelGateway } from '@/modules/bot/channels/whatsapp/ycloud.gateway';
import { webhookRateLimiter } from '@/modules/bot/infrastructure/bot-rate-limits';
import { scheduleDrain } from '@/modules/bot/infrastructure/schedule-drain';

/** `node:crypto` for the HMAC. */
export const runtime = 'nodejs';

type Params = { params: Promise<{ channelId: string }> };

const gateway = new YCloudChannelGateway();

/**
 * WhatsApp (YCloud) webhook. The channel id is in the URL to route the inbound event to
 * the correct company and verify against its webhook signing secret.
 *
 * This is a Route Handler rather than a Server Action on purpose: it is an inbound HTTP call from
 * a third party, which a Server Action cannot receive.
 */
export async function GET(request: Request, { params }: Params): Promise<Response> {
  const { channelId } = await params;
  if (!isUuid(channelId)) return new Response('Not found', { status: 404 });

  const channel = await createBotContainer(db).channelRepository.findActiveWithCredentials(channelId);
  if (!channel) return new Response('Not found', { status: 404 });

  return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

export async function POST(request: Request, { params }: Params): Promise<Response> {
  const { channelId } = await params;
  if (!isUuid(channelId)) return new Response('Not found', { status: 404 });

  const retryAfter = webhookRateLimiter.hit(`wa:${channelId}`);
  if (retryAfter !== null) {
    return new Response('Too many requests', { status: 429, headers: { 'Retry-After': String(retryAfter) } });
  }

  // The signature covers the exact bytes: re-serializing the parsed JSON would never match.
  const rawBody = await request.text();

  const container = createBotContainer(db);
  const channel = await container.channelRepository.findActiveWithCredentials(channelId);
  if (!channel) return new Response('Not found', { status: 404 });

  if (!gateway.verify({ rawBody, headers: request.headers }, channel.credentials)) {
    console.warn('[whatsapp-webhook] Firma inválida para el canal', channelId, {
      hasWebhookSecret: Boolean(channel.credentials.webhookSecret),
      signatureHeader:
        request.headers.get('ycloud-signature') ?? request.headers.get('x-ycloud-signature') ?? null,
    });
    return Response.json({ status: 'invalid_signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ status: 'invalid_payload' }, { status: 400 });
  }

  const { messages, statuses } = gateway.parse(payload);

  try {
    if (statuses.length > 0) await container.messageStatusService.execute(channel.row.companyId, statuses);
    // Delivery receipts and unsupported media are acknowledged without queuing anything.
    if (messages.length === 0) return Response.json({ status: 'ignored' }, { status: 200 });

    const report = await container.eventEnqueueService.execute(messages, channel.row);
    await container.channelRepository.touch(channel.row.id, null);

    // Answer first, work after: a slow model call must never make Meta time out and retry.
    scheduleDrain(() => container.drainQueue());

    return Response.json({ status: 'queued', ...report }, { status: 200 });
  } catch (error) {
    // 500 on purpose: Meta retries with backoff, and the message is not lost.
    console.error('[whatsapp-webhook]', error);
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
