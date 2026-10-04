export class UpdateAppointmentCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly clientId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly durationMinutes: number,
    public readonly notes: string | null
  ) {}

  static fromInput(input: { id: string; clientId: string; startTime: Date; endTime: Date; durationMinutes: number; notes?: string | null }, companyId: string): UpdateAppointmentCommand {
    return new UpdateAppointmentCommand(
      input.id,
      companyId,
      input.clientId,
      input.startTime,
      input.endTime,
      input.durationMinutes,
      input.notes ?? null
    );
  }
}
