import { z } from 'zod';

export const createAppointmentSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid('Debes seleccionar un cliente.'),
  date: z.string().min(1, 'La fecha es requerida.'),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora debe ser HH:mm'),
  durationMinutes: z.coerce.number().min(15, 'La duración mínima es de 15 minutos.').max(480, 'La duración máxima es de 8 horas.'),
  notes: z.string().max(1000, 'Las notas no pueden exceder los 1000 caracteres.').optional().nullable(),
});
