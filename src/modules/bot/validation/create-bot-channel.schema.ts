import { z } from 'zod';
import { requiredText, requiredUuid } from '@/modules/shared/validation/fields';
import { BOT_PROVIDERS } from '../models/bot-channel.model';
import { updateBotChannelSchema } from './update-bot-channel.schema';

/**
 * Crear. The access token is required here (there is nothing stored to fall back on).
 * `externalId` is only asked for WhatsApp: Telegram's is read from `getMe`.
 */
export const createBotChannelSchema = updateBotChannelSchema
  .extend({
    id: requiredUuid(),
    provider: z.enum(BOT_PROVIDERS, { message: 'El canal no es válido.' }),
    accessToken: requiredText('El token de acceso', 500),
    externalId: requiredText('El identificador del canal', 64).optional(),
  })
  .refine((data) => data.provider !== 'whatsapp' || Boolean(data.externalId), {
    path: ['externalId'],
    message: 'El número de WhatsApp es obligatorio (ej. +584121234567).',
  })
  .refine((data) => data.provider !== 'whatsapp' || Boolean(data.webhookSecret), {
    path: ['webhookSecret'],
    message: 'El Webhook Signing Secret de YCloud es obligatorio.',
  });

export type CreateBotChannelInput = z.infer<typeof createBotChannelSchema>;
