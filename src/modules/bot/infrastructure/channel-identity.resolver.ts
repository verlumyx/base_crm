import 'server-only';
import { randomBytes } from 'node:crypto';
import { toE164 } from '@/lib/phone';
import { getTelegramBot } from '../channels/telegram/telegram.gateway';
import type { ChannelIdentityResolver } from '../services/bot-channel-create.service';
import type { CreateBotChannelInput } from '../validation/create-bot-channel.schema';

/**
 * WhatsApp: the admin configures their WhatsApp number (E.164) and YCloud webhook signing secret.
 * Telegram: the token itself identifies the bot, so we ask `getMe` and mint the webhook secret
 * that will authenticate every future update (Telegram does not sign its payloads).
 */
export class LiveChannelIdentityResolver implements ChannelIdentityResolver {
  async resolve(input: CreateBotChannelInput) {
    if (input.provider === 'telegram') {
      const bot = await getTelegramBot(input.accessToken);
      return {
        externalId: bot.id,
        displayName: input.displayName || (bot.username ? `@${bot.username}` : bot.id),
        webhookSecret: randomBytes(32).toString('hex'),
      };
    }

    const normalizedExternalId = input.externalId ? (toE164(input.externalId) ?? input.externalId) : '';

    return {
      externalId: normalizedExternalId,
      displayName: input.displayName,
      webhookSecret: input.webhookSecret ?? null,
    };
  }
}
