'use client';

import dynamic from 'next/dynamic';
import { type AppointmentDto } from '../../serializers/appointment.serializer';

const AppointmentCalendar = dynamic(
  () => import('./AppointmentCalendar').then((m) => m.AppointmentCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-lg border">
        <span className="text-muted-foreground font-medium">Cargando calendario...</span>
      </div>
    ),
  }
);

export function AppointmentCalendarWrapper(props: { appointments: AppointmentDto[]; companyId: string }) {
  return <AppointmentCalendar {...props} />;
}
