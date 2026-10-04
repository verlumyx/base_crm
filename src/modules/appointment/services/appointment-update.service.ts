import { type AppointmentRepository } from '../repositories/appointment.repository';
import { type UpdateAppointmentCommand } from '../commands/update-appointment.command';
import { AppointmentOverlapException } from '../exceptions/appointment-overlap.exception';

export class AppointmentUpdateService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: UpdateAppointmentCommand): Promise<void> {
    const overlapping = await this.repository.findOverlapping(
      command.companyId,
      command.startTime,
      command.endTime,
      command.id
    );

    if (overlapping) {
      throw new AppointmentOverlapException();
    }

    await this.repository.update(command);
  }
}
