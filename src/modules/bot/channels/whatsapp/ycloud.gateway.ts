import { createHmac, timingSafeEqual } from 'node:crypto';
import { toE164 } from '@/lib/phone';
import type { BotProvider } from '../../models/bot-channel.model';
import type {
  ChannelCredentials,
  ChannelGateway,
  InboundMessage,
  InboundStatus,
  SendResult,
} from '../channel-gateway';

const MAX_MESSAGE_LENGTH = 4096;

/** YCloud webhook event shape. */
export type YCloudEvent = {
  id?: string;
  type?: string;
  apiVersion?: string;
  createTime?: string;
  whatsappInboundMessage?: {
    id?: string;
    wamid?: string;
    wabaId?: string;
    from?: string;
    to?: string;
    type?: string;
    text?: { body?: string };
    customerProfile?: { name?: string };
    interactive?: {
      type?: string;
      buttonReply?: { id?: string; title?: string };
      listReply?: { id?: string; title?: string; description?: string };
    };
    sendTime?: string;
  };
  whatsappMessage?: {
    id?: string;
    wamid?: string;
    status?: string;
    errorCode?: string;
    errorMessage?: string;
  };
};

export class YCloudChannelGateway implements ChannelGateway {
  readonly provider: BotProvider = 'whatsapp';
  readonly maxMessageLength = MAX_MESSAGE_LENGTH;

  parse(payload: unknown): { messages: InboundMessage[]; statuses: InboundStatus[] } {
    const messages: InboundMessage[] = [];
    const statuses: InboundStatus[] = [];

    const events: YCloudEvent[] = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object'
        ? [payload as YCloudEvent]
        : [];

    for (const event of events) {
      if (event.type === 'whatsapp.inbound_message.received' && event.whatsappInboundMessage) {
        const msg = event.whatsappInboundMessage;
        if (!msg.from) continue;

        let text: string | null = null;
        if (msg.type === 'text') {
          text = msg.text?.body ?? null;
        } else if (msg.type === 'interactive' && msg.interactive) {
          text = msg.interactive.buttonReply?.title ?? msg.interactive.listReply?.title ?? null;
        }

        const phoneE164 = toE164(msg.from);
        const contactExternalId = phoneE164 ?? msg.from;
        const channelExternalId = msg.to ? (toE164(msg.to) ?? msg.to) : '';
        const eventId = msg.wamid ?? msg.id ?? event.id ?? `wa:${Date.now()}`;
        const sentAt = msg.sendTime ?? event.createTime ?? new Date().toISOString();

        messages.push({
          provider: 'whatsapp',
          channelExternalId,
          eventId,
          contactExternalId,
          contactName: msg.customerProfile?.name ?? null,
          phoneE164,
          text,
          kind: text === null ? 'unsupported' : 'text',
          sentAt,
        });
      } else if (event.type === 'whatsapp.message.updated' && event.whatsappMessage) {
        const msg = event.whatsappMessage;
        const externalId = msg.wamid ?? msg.id;
        if (!externalId) continue;

        if (msg.status === 'delivered' || msg.status === 'read') {
          statuses.push({ externalMessageId: externalId, status: 'delivered', error: null });
        } else if (msg.status === 'failed') {
          statuses.push({
            externalMessageId: externalId,
            status: 'failed',
            error:
              [msg.errorCode, msg.errorMessage].filter(Boolean).join(': ') ||
              'Error en entrega de WhatsApp (YCloud)',
          });
        }
      }
    }

    return { messages, statuses };
  }

  /**
   * YCloud signs requests using the `YCloud-Signature` header (or `X-YCloud-Signature`):
   * Format: `t=timestamp,s=signature`
   * The signature is HMAC-SHA256 of `${timestamp}.${rawBody}` using the webhook secret.
   */
  verify(input: { rawBody: string; headers: Headers }, credentials: ChannelCredentials): boolean {
    if (!credentials.webhookSecret) return false;

    const signatureHeader =
      input.headers.get('ycloud-signature') ??
      input.headers.get('x-ycloud-signature') ??
      '';
    if (!signatureHeader) return false;

    const parsed = parseSignatureHeader(signatureHeader);
    if (!parsed) return false;

    const secret = credentials.webhookSecret.trim();
    const signedPayload = `${parsed.timestamp}.${input.rawBody}`;
    const expected = createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    return parsed.signatures.some((sig) =>
      constantTimeEquals(sig.toLowerCase(), expected.toLowerCase()),
    );
  }

  async send(to: string, text: string, credentials: ChannelCredentials): Promise<SendResult> {
    const url = 'https://api.ycloud.com/v2/whatsapp/messages/sendDirectly';
    const recipient = toE164(to) ?? to;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': credentials.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: credentials.externalId,
        to: recipient,
        type: 'text',
        text: { body: text },
      }),
    });

    const body = (await response.json().catch(() => null)) as {
      id?: string;
      wamid?: string;
      error?: {
        message?: string;
        code?: string | number;
        type?: string;
        whatsappApiError?: {
          message?: string;
          code?: number;
          error_subcode?: number;
        };
      };
      message?: string;
    } | null;

    if (!response.ok) {
      const waError = body?.error?.whatsappApiError;
      const errorMessage =
        waError?.message ??
        body?.error?.message ??
        body?.message ??
        `YCloud WhatsApp respondió ${response.status}.`;
      const providerCode = waError?.code ?? body?.error?.code ?? null;

      throw new ChannelSendError(errorMessage, response.status, providerCode);
    }

    return { externalMessageId: body?.wamid ?? body?.id ?? null };
  }
}

/** A provider refused the message. `retryable` decides whether the event goes back to the queue. */
export class ChannelSendError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly providerCode: number | string | null,
  ) {
    super(message);
    this.name = 'ChannelSendError';
  }

  /** 4xx means the request itself is wrong: retrying would just spam the customer. */
  get retryable(): boolean {
    return this.httpStatus >= 500 || this.httpStatus === 429;
  }

  /** Check if outside the 24-hour service window. */
  get outsideServiceWindow(): boolean {
    return (
      this.providerCode === 131047 ||
      this.providerCode === '131047' ||
      this.providerCode === 'outside_service_window' ||
      this.providerCode === 'service_window_expired' ||
      /24\s*hours|service\s*window|outside.*window/i.test(this.message)
    );
  }
}

function parseSignatureHeader(header: string): { timestamp: string; signatures: string[] } | null {
  const parts = header.split(',').map((p) => p.trim());
  const tPart = parts.find((p) => p.startsWith('t='));
  if (!tPart) return null;

  const timestamp = tPart.slice(2).trim();
  const signatures = parts
    .filter((p) => p.startsWith('s='))
    .map((p) => p.slice(2).trim())
    .filter(Boolean);

  if (!timestamp || signatures.length === 0) return null;
  return { timestamp, signatures };
}

export function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}
