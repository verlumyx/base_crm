import type { ClientRow } from '../models/client.model';
import type { ClientRepository } from '../repositories/client.repository';
import type { SearchClientCommand } from '../commands/search-client.command';

/** Listar: page of clients. */
export class ClientSearchService {
  constructor(private readonly repository: ClientRepository) {}

  async execute(
    command: SearchClientCommand,
  ): Promise<{ data: ClientRow[]; total: number }> {
    const { data, total } = await this.repository.search(command);
    return { data, total };
  }
}
