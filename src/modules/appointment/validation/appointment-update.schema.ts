import { z } from 'zod';
import { createAppointmentSchema } from './appointment-create.schema';

export const updateAppointmentSchema = createAppointmentSchema.omit({ id: true });
