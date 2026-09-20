import type { ClientRow } from '../models/client.model';
import type { ClientRepository } from '../repositories/client.repository';
import { ClientNotFoundException } from '../exceptions/client-not-found.exception';

/** Ver (detail page): the client. */
export class ClientOverviewService {
  constructor(private readonly repository: ClientRepository) {}

  async execute(
    id: string,
    companyId: string,
  ): Promise<{ client: ClientRow }> {
    const client = await this.repository.findById(id, companyId);
    if (!client) throw new ClientNotFoundException();

    return { client };
  }
}
