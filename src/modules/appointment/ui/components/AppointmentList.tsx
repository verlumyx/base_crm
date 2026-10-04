'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, MoreHorizontal, Plus, Power, Search, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { StatusPill } from '@/components/status-pill';
import {
  ListFooter,
  ListGrid,
  ListGridBody,
  ListGridHeadCell,
  ListGridHeader,
  ListGridRow,
  PageShell,
} from '@/components/page-shell';
import { ListPagination } from '@/components/list-pagination';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { usePermission } from '@/modules/shared/auth/company-context';
import { appointmentRoutes } from '@/modules/appointment/routes';
import { updateAppointmentStatusAction } from '@/app/[companyId]/appointments/actions';
import type { AppointmentDto } from '@/modules/appointment/serializers/appointment.serializer';
import type { AppointmentFilters, AppointmentMeta } from '../types/Appointment';

const COLUMNS = 'lg:grid-cols-[0.9fr_2fr_1.5fr_1.2fr_1.2fr]';

type Props = { companyId: string; appointments: AppointmentDto[]; meta: AppointmentMeta; filters: AppointmentFilters };

export function AppointmentList({ companyId, appointments, meta, filters: initialFilters }: Props) {
  const router = useRouter();
  const { can } = usePermission();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState<AppointmentFilters>(initialFilters);
  const rows = appointments;

  const applyFilters = (next: AppointmentFilters) => {
    setFilters(next);
    router.push(appointmentRoutes.index(companyId, next));
  };

  const clearFilters = () => {
    setFilters({});
    router.push(appointmentRoutes.index(companyId));
  };

  const cancelAppointment = (appointment: AppointmentDto) => {
    startTransition(async () => {
      try {
        await updateAppointmentStatusAction(companyId, appointment.id, 'cancelled');
        toast.success('Cita cancelada correctamente');
      } catch (error) {
        toast.error('No se pudo cancelar la cita.');
      }
    });
  };

  return (
    <PageShell
      title="Citas"
      subtitle={`${meta.total} cita${meta.total !== 1 ? 's' : ''}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-[11px] px-4 font-semibold shadow-sm"
            onClick={() => router.push(appointmentRoutes.index(companyId, { view: 'calendar' }))}
          >
            <CalendarDays className="mr-2 size-4" />
            Ver Calendario
          </Button>
          {can('appointments.create') && (
            <Button
              className="h-10 rounded-[11px] px-4 font-semibold shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_28%,transparent)]"
              onClick={() => router.push(appointmentRoutes.create(companyId))}
            >
              <Plus className="mr-2 size-4" />
              Nueva cita
            </Button>
          )}
        </div>
      }
    >
      <div className="bg-card rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-q">Búsqueda general</Label>
            <Input
              id="filter-q"
              type="text"
              placeholder={`Código o notas...`}
              value={filters.q ?? ''}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters(filters)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-status">Estado</Label>
            <SearchableSelect
              id="filter-status"
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'scheduled', label: 'Programadas' },
                { value: 'completed', label: 'Completadas' },
                { value: 'cancelled', label: 'Canceladas' },
              ]}
              value={filters.status ?? 'todos'}
              onChange={(value) =>
                applyFilters({
                  ...filters,
                  status: !value || value === 'todos' ? undefined : (value as AppointmentFilters['status']),
                })
              }
              placeholder="Estado"
              emptyText="Sin resultados"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => applyFilters(filters)}>
            <Search className="mr-2 size-4" />
            Buscar
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar
          </Button>
        </div>
      </div>

      <ListGrid>
        <ListGridHeader columns={COLUMNS}>
          <ListGridHeadCell>Código</ListGridHeadCell>
          <ListGridHeadCell>Fecha</ListGridHeadCell>
          <ListGridHeadCell>Hora y Duración</ListGridHeadCell>
          <ListGridHeadCell>Estado</ListGridHeadCell>
          <ListGridHeadCell align="right">Acciones</ListGridHeadCell>
        </ListGridHeader>
        <ListGridBody>
          {rows.map((appointment) => {
            const startDate = new Date(appointment.startTime);
            const statusKind = appointment.status === 'scheduled' ? 'activo' : appointment.status === 'completed' ? 'pagado' : 'inactivo';
            const statusLabel = appointment.status === 'scheduled' ? 'Programada' : appointment.status === 'completed' ? 'Completada' : 'Cancelada';

            return (
              <ListGridRow
                key={appointment.id}
                columns={COLUMNS}
                onClick={() => router.push(appointmentRoutes.edit(companyId, appointment.id))}
              >
                <div className="hidden lg:block">
                  <span className="text-muted-foreground font-semibold tabular-nums">{appointment.code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold capitalize">{format(startDate, "EEEE d 'de' MMMM", { locale: es })}</span>
                  <span className="text-muted-foreground text-[12.5px]">{format(startDate, "yyyy", { locale: es })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{format(startDate, "HH:mm")}</span>
                  <span className="text-muted-foreground text-[12.5px]">{appointment.durationMinutes} minutos</span>
                </div>
                <div className="hidden lg:block">
                  <StatusPill kind={statusKind}>{statusLabel}</StatusPill>
                </div>
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-card rounded-[10px]" aria-label="Opciones">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {can('appointments.update') && (
                        <DropdownMenuItem onSelect={() => router.push(appointmentRoutes.edit(companyId, appointment.id))}>
                          <Edit className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {can('appointments.delete') && appointment.status === 'scheduled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={pending} onSelect={() => cancelAppointment(appointment)}>
                            <Power className="mr-2 size-4" />
                            Cancelar cita
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </ListGridRow>
            );
          })}
          {rows.length === 0 && (
            <div className="text-muted-foreground p-12 text-center text-sm">Sin resultados para tu búsqueda.</div>
          )}
        </ListGridBody>
        <ListFooter shown={rows.length} total={meta.total} noun="cita">
          <ListPagination meta={meta} href={(query) => appointmentRoutes.index(companyId, query)} />
        </ListFooter>
      </ListGrid>
    </PageShell>
  );
}
