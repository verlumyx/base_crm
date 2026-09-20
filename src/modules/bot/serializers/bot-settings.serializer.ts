import type { BotSettingsRow, BotSettingsStatus } from '../models/bot-settings.model';

export type BotSettingsDto = {
  id: string;
  status: BotSettingsStatus;
  assistantName: string;
  systemPrompt: string | null;
  personaPrompt: string | null;
  chatModel: string;
  embeddingModel: string;
  embeddingDimensions: number;
  temperature: number;
  maxToolIterations: number;
  retrievalTopK: number;
  retrievalMinScore: number;
  historyWindow: number;
  handoffEnabled: boolean;
  handoffMinutes: number;
  autoCreateClient: boolean;
  contactDailyMessageLimit: number;
  updatedAt: string | null;
};

export function toBotSettingsDto(row: BotSettingsRow): BotSettingsDto {
  return {
    id: row.id,
    status: row.status,
    assistantName: row.assistantName,
    systemPrompt: row.systemPrompt,
    personaPrompt: row.personaPrompt,
    chatModel: row.chatModel,
    embeddingModel: row.embeddingModel,
    embeddingDimensions: row.embeddingDimensions,
    temperature: Number(row.temperature),
    maxToolIterations: row.maxToolIterations,
    retrievalTopK: row.retrievalTopK,
    retrievalMinScore: Number(row.retrievalMinScore),
    historyWindow: row.historyWindow,
    handoffEnabled: row.handoffEnabled,
    handoffMinutes: row.handoffMinutes,
    autoCreateClient: row.autoCreateClient,
    contactDailyMessageLimit: row.contactDailyMessageLimit,
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
