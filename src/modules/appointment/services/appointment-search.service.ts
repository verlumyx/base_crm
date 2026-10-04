import { type AppointmentRepository } from '../repositories/appointment.repository';
import { type SearchAppointmentCommand } from '../commands/search-appointment.command';
import { type AppointmentRow } from '../models/appointment.model';

export class AppointmentSearchService {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: SearchAppointmentCommand): Promise<{ data: AppointmentRow[]; total: number }> {
    return this.repository.search(command.companyId, command.filters, command.limit, command.offset);
  }
}
