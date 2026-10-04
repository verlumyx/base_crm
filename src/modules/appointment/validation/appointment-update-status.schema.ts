import { z } from 'zod';
import { APPOINTMENT_STATUSES } from '../models/appointment.model';

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
});
