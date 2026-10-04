import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { user } from '@/db/auth-schema';
import { companies } from '@/modules/company/models/company.model';
import { clients } from '@/modules/client/models/client.model';

export const APPOINTMENT_CODE_PREFIX = 'CIT';
export const APPOINTMENT_CODE_WIDTH = 6;
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const appointments = pgTable(
  'app_appointments',
  {
    id: uuid('id').primaryKey(), // sent by the client (UUID v7)
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 12 }).notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    status: varchar('status', { length: 20 })
      .notNull()
      .default('scheduled')
      .$type<AppointmentStatus>(),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex('app_appointments_company_id_code_unique').on(t.companyId, t.code),
    index('app_appointments_company_id_idx').on(t.companyId),
    index('app_appointments_company_id_start_time_idx').on(t.companyId, t.startTime),
    index('app_appointments_status_idx').on(t.status),
    index('app_appointments_client_id_idx').on(t.clientId),
  ]
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  company: one(companies, { fields: [appointments.companyId], references: [companies.id] }),
  client: one(clients, { fields: [appointments.clientId], references: [clients.id] }),
  creator: one(user, { fields: [appointments.createdBy], references: [user.id] }),
}));

export type AppointmentRow = InferSelectModel<typeof appointments>;
export type NewAppointmentRow = InferInsertModel<typeof appointments>;
