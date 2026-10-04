import { type AppointmentRow } from '../models/appointment.model';

export type AppointmentDto = {
  id: string;
  code: string;
  clientId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export function toAppointmentDto(row: AppointmentRow): AppointmentDto {
  return {
    id: row.id,
    code: row.code,
    clientId: row.clientId,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    durationMinutes: row.durationMinutes,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
  };
}
