'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';
import { type AppointmentDto } from '../../serializers/appointment.serializer';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Lunes
  getDay,
  locales,
});

type Props = {
  appointments: AppointmentDto[];
  companyId: string;
};

export function AppointmentCalendar({ appointments, companyId }: Props) {
  const router = useRouter();
  const [view, setView] = useState<any>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), []);
  const handleView = useCallback((newView: any) => setView(newView), []);

  const events = appointments.map((appt) => ({
    id: appt.id,
    title: `${appt.code} - ${appt.status === 'cancelled' ? '(Cancelada)' : 'Cita'}`,
    start: new Date(appt.startTime),
    end: new Date(appt.endTime),
    resource: appt,
  }));

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // start contains the date and time
    const dateStr = format(start, 'yyyy-MM-dd');
    const timeStr = format(start, 'HH:mm');
    router.push(`/${companyId}/appointments/create?date=${dateStr}&time=${timeStr}`);
  };

  const handleSelectEvent = (event: any) => {
    router.push(`/${companyId}/appointments/${event.id}/edit`);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    if (event.resource.status === 'cancelled') {
      backgroundColor = '#e11d48'; // destructive
    } else if (event.resource.status === 'completed') {
      backgroundColor = '#16a34a'; // success
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <Card className="h-[700px] w-full rounded-2xl p-5">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={handleView}
        date={date}
        onNavigate={handleNavigate}
        views={['month', 'week', 'day']}
        culture="es"
        messages={{
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          noEventsInRange: 'No hay citas en este rango',
        }}
      />
    </Card>
  );
}
