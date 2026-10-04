import { notFound } from 'next/navigation';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { PageShell } from '@/components/page-shell';
import { AppointmentForm } from '@/modules/appointment/ui/components/AppointmentForm';
import { createClientContainer } from '@/modules/client/container';
import { SearchClientCommand } from '@/modules/client/commands/search-client.command';
import { db } from '@/db/client';

export default async function CreateAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ date?: string; time?: string }>;
}) {
  const { companyId } = await params;
  const { date, time } = await searchParams;

  await requirePermission(companyId, 'appointments.create');

  const { data: clients } = await createClientContainer(db).searchService.execute(
    new SearchClientCommand({ companyId, limit: 1000 })
  );

  return (
    <PageShell title="Nueva Cita" subtitle="Agenda una nueva cita para un cliente.">
      <div className="mt-6">
        <AppointmentForm 
          companyId={companyId} 
          clients={clients.map(c => ({ id: c.id, name: c.name }))} 
          initialDate={date} 
          initialTime={time} 
        />
      </div>
    </PageShell>
  );
}
