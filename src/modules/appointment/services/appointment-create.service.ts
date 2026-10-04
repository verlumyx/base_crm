import { type AppointmentRepository } from '../repositories/appointment.repository';
import { type CreateAppointmentCommand } from '../commands/create-appointment.command';
import { AppointmentOverlapException } from '../exceptions/appointment-overlap.exception';

export class AppointmentCreateService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: CreateAppointmentCommand): Promise<void> {
    const overlapping = await this.repository.findOverlapping(
      command.companyId,
      command.startTime,
      command.endTime
    );

    if (overlapping) {
      throw new AppointmentOverlapException();
    }

    await this.repository.create(command);
  }
}
