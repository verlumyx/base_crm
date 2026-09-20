import type { BotSettingsRow } from '../models/bot-settings.model';
import type { BotTool } from './bot-tool';
import { buscarInformacionTool } from './knowledge.tool';
import { consultarMiCuentaTool, registrarClienteTool } from './client.tools';
import { escalarAHumanoTool } from './handoff.tool';

/**
 * Every capability the assistant has, and nothing else.
 *
 * This list IS the security boundary: there is no free-form SQL tool, and nothing here can read
 * `app_accounts` (streaming credentials, costs) or another company's data — each tool takes its
 * `companyId` from the runtime context, never from the model's arguments.
 */
export function buildToolRegistry(settings: BotSettingsRow): BotTool[] {
  const tools: BotTool[] = [
    buscarInformacionTool,
    consultarMiCuentaTool,
  ];

  if (settings.autoCreateClient) tools.push(registrarClienteTool);
  if (settings.handoffEnabled) tools.push(escalarAHumanoTool);

  return tools;
}
