import { createHmac } from 'node:crypto';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { encrypt } from '@/modules/shared/crypto';
import { uuidv7 } from '@/modules/shared/uuid';
import { botChannels, type BotChannelRow, type BotProvider } from '@/modules/bot/models/bot-channel.model';
import { botSettings, type BotSettingsRow } from '@/modules/bot/models/bot-settings.model';
import { DrizzleBotSettingsRepository } from '@/modules/bot/repositories/drizzle-bot-settings.repository';
import { eq } from 'drizzle-orm';

export const YCLOUD_WEBHOOK_SECRET = 'whsec_test_secret_for_tests';
export const META_APP_SECRET = 'meta-app-secret-for-tests';
export const META_VERIFY_TOKEN = 'verify-token-for-tests';
export const TELEGRAM_SECRET = 'telegram-secret-for-tests';
export const WHATSAPP_PHONE_NUMBER = '+15550783881';
export const WHATSAPP_PHONE_NUMBER_ID = '+15550783881';
export const TELEGRAM_BOT_ID = '7654321';

/** Creates the bot user, role, membership and settings row exactly as the setup action does. */
export async function seedBotSettings(
  db: DbExecutor,
  companyId: string,
  overrides: Partial<BotSettingsRow> = {},
): Promise<BotSettingsRow> {
  const repository = new DrizzleBotSettingsRepository(db);
  const { userId } = await repository.ensureAgentIdentity(companyId);
  await repository.create(uuidv7(), companyId, userId);

  if (Object.keys(overrides).length > 0) {
    await db.update(botSettings).set(overrides).where(eq(botSettings.companyId, companyId));
  }

  return repository.findOrFail(companyId);
}

export async function seedChannel(
  db: DbExecutor,
  companyId: string,
  provider: BotProvider = 'whatsapp',
  overrides: Partial<BotChannelRow> = {},
): Promise<BotChannelRow> {
  const id = uuidv7();

  await db.insert(botChannels).values({
    id,
    companyId,
    provider,
    externalId: provider === 'whatsapp' ? WHATSAPP_PHONE_NUMBER : TELEGRAM_BOT_ID,
    displayName: provider === 'whatsapp' ? 'Ventas WhatsApp' : '@ventas_bot',
    accessTokenEncrypted: encrypt('access-token'),
    appSecretEncrypted: null,
    verifyTokenEncrypted: null,
    webhookSecretEncrypted: encrypt(provider === 'whatsapp' ? YCLOUD_WEBHOOK_SECRET : TELEGRAM_SECRET),
    status: 'active',
    ...overrides,
  });

  const [row] = await db.select().from(botChannels).where(eq(botChannels.id, id));
  return row;
}

/** A signed YCloud WhatsApp webhook request. */
export function whatsappRequest(channelId: string, body: unknown, secret = YCLOUD_WEBHOOK_SECRET): Request {
  const rawBody = JSON.stringify(body);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');

  return new Request(`http://localhost/api/bot/webhooks/whatsapp/${channelId}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ycloud-signature': `t=${timestamp},s=${signature}`,
    },
    body: rawBody,
  });
}

export function telegramRequest(channelId: string, body: unknown, secret = TELEGRAM_SECRET): Request {
  return new Request(`http://localhost/api/bot/webhooks/telegram/${channelId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': secret },
    body: JSON.stringify(body),
  });
}

/** An inbound WhatsApp text payload with a unique `wamid` (YCloud format). */
export function whatsappTextPayload(text: string, options: { from?: string; wamid?: string; name?: string } = {}) {
  const from = options.from ?? '+584121234567';
  const wamid = options.wamid ?? `wamid.${uuidv7()}`;
  return {
    id: `evt_${uuidv7()}`,
    type: 'whatsapp.inbound_message.received',
    apiVersion: 'v2',
    createTime: new Date().toISOString(),
    whatsappInboundMessage: {
      id: uuidv7(),
      wamid,
      from,
      to: WHATSAPP_PHONE_NUMBER,
      type: 'text',
      text: { body: text },
      customerProfile: { name: options.name ?? 'Camila Rojas' },
      sendTime: new Date().toISOString(),
    },
  };
}

export function telegramTextPayload(text: string, options: { updateId?: number; chatId?: number } = {}) {
  return {
    update_id: options.updateId ?? Math.floor(Math.random() * 1_000_000),
    message: {
      message_id: 1,
      from: { id: options.chatId ?? 987654321, is_bot: false, first_name: 'Camila', last_name: 'Rojas' },
      chat: { id: options.chatId ?? 987654321, type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text,
    },
  };
}
