import type { ModuleDefinition } from './types';
import { USER_MODULE } from '@/modules/user/permissions';
import { ROLE_MODULE } from '@/modules/role/permissions';
import { COMPANY_MODULE } from '@/modules/company/permissions';
import { CLIENT_MODULE } from '@/modules/client/permissions';
import { CLAIM_MODULE } from '@/modules/claim/permissions';
import { BOT_MODULE } from '@/modules/bot/permissions';

/** Every module's permission catalogue. Seeded into `app_modules` / `app_permissions` by `pnpm db:seed`. */
export const PERMISSION_REGISTRY: readonly ModuleDefinition[] = [
  USER_MODULE,
  ROLE_MODULE,
  COMPANY_MODULE,
  CLIENT_MODULE,
  CLAIM_MODULE,
  BOT_MODULE,
];

/** Modules gated on `is_system_owner` only: hidden from the roles tree and excluded from `permissionType = 'all'`. */
export const OWNER_ONLY_MODULES = ['companies'] as const;

export const ALL_PERMISSION_ACTIONS: readonly string[] = PERMISSION_REGISTRY.flatMap((m) =>
  m.permissions.map((p) => p.id),
);
