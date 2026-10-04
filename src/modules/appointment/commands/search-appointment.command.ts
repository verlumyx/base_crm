import { type AppointmentFilters } from '../repositories/appointment.filters';

export class SearchAppointmentCommand {
  public readonly companyId: string;
  public readonly filters: AppointmentFilters;
  public readonly limit: number;
  public readonly offset: number;

  constructor(params: { companyId: string; filters?: AppointmentFilters; limit?: number; offset?: number }) {
    this.companyId = params.companyId;
    this.filters = params.filters ?? {};
    this.limit = params.limit ?? 50;
    this.offset = params.offset ?? 0;
  }
}
