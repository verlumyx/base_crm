import type { ClientRow } from '../models/client.model';
import type { CreateClientCommand } from '../commands/create-client.command';
import type { SearchClientCommand } from '../commands/search-client.command';
import type { UpdateClientCommand } from '../commands/update-client.command';
import type { UpdateStatusClientCommand } from '../commands/update-status-client.command';

export interface ClientRepository {
  create(command: CreateClientCommand): Promise<void>;
  findById(id: string, companyId: string): Promise<ClientRow | null>;
  findOrFail(id: string, companyId: string): Promise<ClientRow>;
  update(row: ClientRow, command: UpdateClientCommand): Promise<void>;
  updateStatus(row: ClientRow, command: UpdateStatusClientCommand): Promise<void>;
  search(command: SearchClientCommand): Promise<{ data: ClientRow[]; total: number }>;

  existsByEmail(email: string, companyId: string, ignoreId?: string): Promise<boolean>;
}
