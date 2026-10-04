export class CreateAppointmentCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly clientId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly durationMinutes: number,
    public readonly notes: string | null,
    public readonly createdBy: string | null
  ) {}

  static fromInput(input: { id: string; clientId: string; startTime: Date; endTime: Date; durationMinutes: number; notes?: string | null }, companyId: string, createdBy: string | null): CreateAppointmentCommand {
    return new CreateAppointmentCommand(
      input.id,
      companyId,
      input.clientId,
      input.startTime,
      input.endTime,
      input.durationMinutes,
      input.notes ?? null,
      createdBy
    );
  }
}
