import { type AppointmentRepository } from '../repositories/appointment.repository';
import { type AppointmentRow } from '../models/appointment.model';

export class AppointmentFindService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(id: string, companyId: string): Promise<AppointmentRow | undefined> {
    return this.repository.findById(id, companyId);
  }
}
