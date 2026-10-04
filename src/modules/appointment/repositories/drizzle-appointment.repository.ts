import { and, asc, count, desc, eq, gte, ilike, lte, ne, or, sql } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { appointments, APPOINTMENT_CODE_PREFIX, APPOINTMENT_CODE_WIDTH, type AppointmentRow } from '../models/appointment.model';
import { type AppointmentFilters } from './appointment.filters';
import { type AppointmentRepository } from './appointment.repository';
import { type CreateAppointmentCommand } from '../commands/create-appointment.command';
import { type UpdateAppointmentCommand } from '../commands/update-appointment.command';
import { type UpdateAppointmentStatusCommand } from '../commands/update-appointment-status.command';

export class DrizzleAppointmentRepository implements AppointmentRepository {
  constructor(private readonly db: DbExecutor) {}

  async findById(id: string, companyId: string): Promise<AppointmentRow | undefined> {
    const [row] = await this.db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.companyId, companyId)));
    return row;
  }

  async findOverlapping(
    companyId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<AppointmentRow | undefined> {
    const conditions = [
      eq(appointments.companyId, companyId),
      eq(appointments.status, 'scheduled'),
      // new.start < existing.end AND new.end > existing.start
      sql`${startTime.toISOString()}::timestamptz < ${appointments.endTime}`,
      sql`${endTime.toISOString()}::timestamptz > ${appointments.startTime}`
    ];
    if (excludeId) {
      conditions.push(ne(appointments.id, excludeId));
    }

    const [row] = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .limit(1);

    return row;
  }

  async search(
    companyId: string,
    filters: AppointmentFilters,
    limit: number,
    offset: number
  ): Promise<{ data: AppointmentRow[]; total: number }> {
    const conditions = [eq(appointments.companyId, companyId)];

    if (filters.q) {
      conditions.push(
        sql`(${appointments.code} ILIKE ${`%${filters.q}%`} OR ${appointments.notes} ILIKE ${`%${filters.q}%`})`
      );
    }
    if (filters.code) conditions.push(eq(appointments.code, filters.code));
    if (filters.status) conditions.push(eq(appointments.status, filters.status as any));
    if (filters.clientId) conditions.push(eq(appointments.clientId, filters.clientId));
    if (filters.dateFrom) conditions.push(gte(appointments.startTime, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(appointments.endTime, filters.dateTo));

    const where = and(...conditions);

    const [totalRow] = await this.db.select({ value: count() }).from(appointments).where(where);
    const data = await this.db
      .select()
      .from(appointments)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(appointments.startTime));

    return { data, total: totalRow.value };
  }

  private async generateNextCode(companyId: string): Promise<string> {
    const [row] = await this.db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.companyId, companyId))
      .for('update');

    const nextNumber = (row?.count ?? 0) + 1;
    return `${APPOINTMENT_CODE_PREFIX}${String(nextNumber).padStart(APPOINTMENT_CODE_WIDTH, '0')}`;
  }

  async create(command: CreateAppointmentCommand): Promise<void> {
    const code = await this.generateNextCode(command.companyId);

    await this.db.insert(appointments).values({
      id: command.id,
      companyId: command.companyId,
      clientId: command.clientId,
      code,
      startTime: command.startTime,
      endTime: command.endTime,
      durationMinutes: command.durationMinutes,
      notes: command.notes,
      status: 'scheduled',
      createdBy: command.createdBy,
    });
  }

  async update(command: UpdateAppointmentCommand): Promise<void> {
    await this.db
      .update(appointments)
      .set({
        clientId: command.clientId,
        startTime: command.startTime,
        endTime: command.endTime,
        durationMinutes: command.durationMinutes,
        notes: command.notes,
      })
      .where(and(eq(appointments.id, command.id), eq(appointments.companyId, command.companyId)));
  }

  async updateStatus(command: UpdateAppointmentStatusCommand): Promise<void> {
    await this.db
      .update(appointments)
      .set({ status: command.status })
      .where(and(eq(appointments.id, command.id), eq(appointments.companyId, command.companyId)));
  }
}
