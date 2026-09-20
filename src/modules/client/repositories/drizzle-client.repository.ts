import { and, asc, count, desc, eq, inArray, isNull, ne, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import { generateNextCode, lockCompanySequence } from '@/modules/shared/infrastructure/sequential-code';
import { clients, CLIENT_CODE_PREFIX, type ClientRow } from '../models/client.model';
import { ClientNotFoundException } from '../exceptions/client-not-found.exception';
import { clientFilters } from './client.filters';
import type { ClientRepository } from './client.repository';
import type { CreateClientCommand } from '../commands/create-client.command';
import type { SearchClientCommand } from '../commands/search-client.command';
import type { UpdateClientCommand } from '../commands/update-client.command';
import type { UpdateStatusClientCommand } from '../commands/update-status-client.command';
import { toE164 } from '@/lib/phone';

export class DrizzleClientRepository implements ClientRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreateClientCommand): Promise<void> {
    await lockCompanySequence(this.db, command.companyId, CLIENT_CODE_PREFIX);
    const code = await generateNextCode(this.db, clients, command.companyId, CLIENT_CODE_PREFIX);

    await this.db.insert(clients).values({
      id: command.id,
      companyId: command.companyId,
      code,
      name: command.name,
      phone: command.phone,
      phoneE164: toE164(command.phone),
      email: command.email,
      notes: command.notes,
      status: 'active',
      createdBy: command.createdBy,
    });
  }

  async findById(id: string, companyId: string): Promise<ClientRow | null> {
    const [row] = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.companyId, companyId)))
      .limit(1);
    return row ?? null;
  }

  async findOrFail(id: string, companyId: string): Promise<ClientRow> {
    const row = await this.findById(id, companyId);
    if (!row) throw new ClientNotFoundException();
    return row;
  }

  async update(row: ClientRow, command: UpdateClientCommand): Promise<void> {
    await this.db
      .update(clients)
      .set({
        name: command.name,
        phone: command.phone,
        phoneE164: toE164(command.phone),
        email: command.email,
        notes: command.notes,
      })
      .where(eq(clients.id, row.id));
  }

  async updateStatus(row: ClientRow, command: UpdateStatusClientCommand): Promise<void> {
    await this.db.update(clients).set({ status: command.status }).where(eq(clients.id, row.id));
  }

  async search(command: SearchClientCommand): Promise<{ data: ClientRow[]; total: number }> {
    const where = and(eq(clients.companyId, command.companyId), ...applyFilters(clientFilters, command.filters));

    const [{ total }] = await this.db.select({ total: count() }).from(clients).where(where);
    const data = await this.db
      .select()
      .from(clients)
      .where(where)
      .orderBy(desc(clients.createdAt), desc(clients.id))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total };
  }

  async existsByEmail(email: string, companyId: string, ignoreId?: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(
          eq(clients.companyId, companyId),
          sql`lower(${clients.email}) = lower(${email})`,
          ignoreId ? ne(clients.id, ignoreId) : undefined,
        ),
      )
      .limit(1);
    return Boolean(row);
  }

}
