import { type AppointmentRow } from '../models/appointment.model';
import { type AppointmentFilters } from './appointment.filters';
import { type CreateAppointmentCommand } from '../commands/create-appointment.command';
import { type UpdateAppointmentCommand } from '../commands/update-appointment.command';
import { type UpdateAppointmentStatusCommand } from '../commands/update-appointment-status.command';

export interface AppointmentRepository {
  findById(id: string, companyId: string): Promise<AppointmentRow | undefined>;
  findOverlapping(
    companyId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<AppointmentRow | undefined>;
  search(
    companyId: string,
    filters: AppointmentFilters,
    limit: number,
    offset: number
  ): Promise<{ data: AppointmentRow[]; total: number }>;
  create(command: CreateAppointmentCommand): Promise<void>;
  update(command: UpdateAppointmentCommand): Promise<void>;
  updateStatus(command: UpdateAppointmentStatusCommand): Promise<void>;
}
