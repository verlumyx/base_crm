import type { ClientRow, ClientStatus } from '../models/client.model';

export type ClientDto = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export function toClientDto(row: ClientRow): ClientDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
