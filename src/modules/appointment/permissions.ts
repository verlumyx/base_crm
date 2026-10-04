import type { ModuleDefinition } from '../shared/permissions/types';

export const APPOINTMENT_MODULE: ModuleDefinition = {
  id: 'appointments',
  label: 'Citas',
  icon: 'CalendarDays',
  order: 40,
  permissions: [
    { id: 'appointments.list', label: 'Ver citas', order: 1 },
    { id: 'appointments.create', label: 'Crear citas', order: 2 },
    { id: 'appointments.update', label: 'Editar citas', order: 3 },
    { id: 'appointments.delete', label: 'Eliminar citas', order: 4 },
  ],
};
