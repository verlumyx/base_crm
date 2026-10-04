import { requirePermission } from '@/modules/shared/auth/require-permission';
import { PageShell } from '@/components/page-shell';
import { db } from '@/db/client';
import { createAppointmentContainer } from '@/modules/appointment/container';
import { SearchAppointmentCommand } from '@/modules/appointment/commands/search-appointment.command';
import { toAppointmentDto } from '@/modules/appointment/serializers/appointment.serializer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List, Plus } from 'lucide-react';
import { AppointmentList } from '@/modules/appointment/ui/components/AppointmentList';
import { AppointmentCalendarWrapper } from '@/modules/appointment/ui/components/AppointmentCalendarWrapper';

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ view?: string; q?: string; status?: string; page?: string }>;
}) {
  const { companyId } = await params;
  const { view, q, status, page } = await searchParams;

  await requirePermission(companyId, 'appointments.list');

  const offset = page ? (Number(page) - 1) * 50 : 0;
  
  // If we are in calendar view, maybe fetch more, otherwise fetch 50
  const limit = view === 'calendar' ? 500 : 50;

  const { data, total } = await createAppointmentContainer(db).searchService.execute(
    new SearchAppointmentCommand({ 
      companyId, 
      limit, 
      offset,
      filters: {
        q,
        status,
      } 
    })
  );

  const appointments = data.map(toAppointmentDto);

  if (view === 'calendar') {
    return (
      <PageShell
        title="Citas - Calendario"
        subtitle="Gestiona las citas agendadas visualmente."
        actions={
          <div className="flex gap-2">
            <Link href={`/${companyId}/appointments`}>
              <Button variant="outline">
                <List className="mr-2 h-4 w-4" /> Ver Lista
              </Button>
            </Link>
            <Link href={`/${companyId}/appointments/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Cita
              </Button>
            </Link>
          </div>
        }
      >
        <div className="mt-4">
          <AppointmentCalendarWrapper appointments={appointments} companyId={companyId} />
        </div>
      </PageShell>
    );
  }

  return (
    <AppointmentList
      companyId={companyId}
      appointments={appointments}
      meta={{
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      }}
      filters={{ q, status: status as any }}
    />
  );
}
