import { type AppointmentRepository } from '../repositories/appointment.repository';
import { type UpdateAppointmentStatusCommand } from '../commands/update-appointment-status.command';

export class AppointmentUpdateStatusService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: UpdateAppointmentStatusCommand): Promise<void> {
    await this.repository.updateStatus(command);
  }
}
