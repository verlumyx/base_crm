import { type AppointmentStatus } from '../models/appointment.model';

export class UpdateAppointmentStatusCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly status: AppointmentStatus
  ) {}

  static fromInput(input: { id: string; status: AppointmentStatus }, companyId: string): UpdateAppointmentStatusCommand {
    return new UpdateAppointmentStatusCommand(input.id, companyId, input.status);
  }
}
