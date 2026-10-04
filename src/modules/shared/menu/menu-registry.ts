import { SYSTEM_OWNER_PERMISSION, type MenuSection } from '@/modules/menu/models/menu.model';

export type MenuDefinition = {
  /** Fixed UUID so the seed is idempotent. */
  id: string;
  parentId: string | null;
  title: string;
  /** Relative to the company (`/clients`); the sidebar prepends `/{companyId}`. */
  url: string | null;
  /** Permission action, `system_owner`, or null (always visible). */
  permission: string | null;
  /** Lucide icon name (see `src/components/lucide-icon.tsx`). */
  icon: string;
  order: number;
  section: MenuSection;
};

const CATALOG_ID = '019e8a10-0001-7000-a000-000000000001';
const REPORTS_ID = '019e8a10-0004-7000-a000-000000000004';
const BOT_ID = '019f1000-0001-7000-a000-000000000001';

/** Sidebar entries (single source of truth). Merge of the original SQL seed and MenuSeeder. */
export const MENU_REGISTRY: readonly MenuDefinition[] = [
  // main
  { id: '019cf226-1284-73f5-9291-d4615db63499', parentId: null, title: 'Dashboard', url: '/dashboard', permission: null, icon: 'LayoutGrid', order: 1, section: 'main' },
  { id: '019e7fa4-43bb-7208-ae00-65a4bef96502', parentId: null, title: 'Clientes', url: '/clients', permission: 'clients.list', icon: 'Contact', order: 2, section: 'main' },
  { id: '019f2000-0001-7000-a000-000000000001', parentId: null, title: 'Reclamos', url: '/claims', permission: 'claims.list', icon: 'MessageSquareWarning', order: 7, section: 'main' },
  { id: '019f5000-0001-7000-a000-000000000001', parentId: null, title: 'Citas', url: '/appointments', permission: 'appointments.list', icon: 'CalendarDays', order: 8, section: 'main' },
  { id: BOT_ID, parentId: null, title: 'Bot IA', url: '/bot', permission: 'bot.show', icon: 'Bot', order: 10, section: 'main' },
  { id: '019f1000-0006-7000-a000-000000000006', parentId: BOT_ID, title: 'Panel', url: '/bot', permission: 'bot.show', icon: 'Bot', order: 1, section: 'main' },
  { id: '019f1000-0002-7000-a000-000000000002', parentId: BOT_ID, title: 'Conversaciones', url: '/bot/conversations', permission: 'bot.conversations', icon: 'MessagesSquare', order: 2, section: 'main' },
  { id: '019f1000-0003-7000-a000-000000000003', parentId: BOT_ID, title: 'Base de conocimiento', url: '/bot/knowledge', permission: 'bot.knowledge', icon: 'BookOpen', order: 3, section: 'main' },
  { id: '019f1000-0004-7000-a000-000000000004', parentId: BOT_ID, title: 'Canales', url: '/bot/channels', permission: 'bot.channels', icon: 'Radio', order: 4, section: 'main' },
  { id: '019f1000-0005-7000-a000-000000000005', parentId: BOT_ID, title: 'Cola de eventos', url: '/bot/events', permission: 'bot.events', icon: 'ListChecks', order: 5, section: 'main' },
  // footer
  { id: '019cf226-1285-723c-ba82-f582cf993210', parentId: null, title: 'Usuarios', url: '/users', permission: 'users.list', icon: 'UserCheck', order: 1, section: 'footer' },
  { id: '019cf226-1285-723c-ba82-f582d08b1c08', parentId: null, title: 'Roles', url: '/roles', permission: 'roles.list', icon: 'Users', order: 2, section: 'footer' },
  { id: 'a14ea90e-9177-47d7-ba5e-ff768d0ad6fa', parentId: null, title: 'Empresas', url: '/companies', permission: SYSTEM_OWNER_PERMISSION, icon: 'Building2', order: 3, section: 'footer' },
];
