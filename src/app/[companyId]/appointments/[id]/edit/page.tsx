import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { PageShell } from '@/components/page-shell';
import { AppointmentForm } from '@/modules/appointment/ui/components/AppointmentForm';
import { createAppointmentContainer } from '@/modules/appointment/container';
import { createClientContainer } from '@/modules/client/container';
import { SearchClientCommand } from '@/modules/client/commands/search-client.command';
import { toAppointmentDto } from '@/modules/appointment/serializers/appointment.serializer';
import { db } from '@/db/client';

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ companyId: string; id: string }>;
}) {
  const { companyId, id } = await params;

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  await requirePermission(companyId, 'appointments.update');

  const appointment = await createAppointmentContainer(db).findService.execute(id, companyId);
  if (!appointment) {
    notFound();
  }

  const { data: clients } = await createClientContainer(db).searchService.execute(
    new SearchClientCommand({ companyId, limit: 1000 })
  );

  return (
    <PageShell title="Editar Cita" subtitle={`Editando la cita ${appointment.code}`}>
      <div className="mt-6">
        <AppointmentForm 
          companyId={companyId} 
          clients={clients.map(c => ({ id: c.id, name: c.name }))} 
          initialData={toAppointmentDto(appointment)} 
        />
      </div>
    </PageShell>
  );
}
