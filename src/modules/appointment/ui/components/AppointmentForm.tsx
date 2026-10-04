'use client';

import { useActionState, useEffect, startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FormSectionHead } from '@/components/form-section-head';
import { uuidv7 } from '@/modules/shared/uuid';
import { type AppointmentDto } from '../../serializers/appointment.serializer';
import { createAppointmentAction, updateAppointmentAction } from '@/app/[companyId]/appointments/actions';
import { toast } from 'sonner';

type Props = {
  companyId: string;
  clients: { id: string; name: string }[];
  initialData?: AppointmentDto;
  initialDate?: string;
  initialTime?: string;
};

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
  { value: '240', label: '4 horas' },
];

export function AppointmentForm({ companyId, clients, initialData, initialDate, initialTime }: Props) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [clientId, setClientId] = useState<string | null>(initialData?.clientId ?? null);
  const [duration, setDuration] = useState<string | null>(initialData?.durationMinutes?.toString() ?? '60');

  const [state, action, isPending] = useActionState(
    isEditing
      ? updateAppointmentAction.bind(null, companyId)
      : createAppointmentAction.bind(null, companyId),
    null
  );

  useEffect(() => {
    if (state?.type === 'error') {
      toast.error(state.message);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!isEditing) {
      formData.set('id', uuidv7());
    }
    startTransition(() => action(formData));
  };

  const defaultDate = initialData
    ? initialData.startTime.split('T')[0]
    : initialDate ?? new Date().toISOString().split('T')[0];

  const defaultTime = initialData
    ? new Date(initialData.startTime).toTimeString().substring(0, 5)
    : initialTime ?? '09:00';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_320px]">
      {isEditing && <input type="hidden" name="id" value={initialData.id} />}

      <div className="flex min-w-0 flex-col gap-5">
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <FormSectionHead step={1} title="Detalles de la cita" sub="Selecciona cliente y fecha" />
          <div className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientId" className="text-[13px] font-semibold">Cliente *</Label>
                <SearchableSelect
                  id="clientId"
                  name="clientId"
                  options={clients.map((c) => ({ value: c.id, label: c.name }))}
                  value={clientId}
                  onChange={setClientId}
                  placeholder="Seleccionar cliente"
                  searchPlaceholder="Buscar cliente..."
                  className="h-[42px] rounded-[10px]"
                />
                {state?.errors?.clientId && <p className="text-sm text-destructive">{state.errors.clientId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[13px] font-semibold">Fecha *</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} required className="h-[42px] rounded-[10px]" />
                {state?.errors?.date && <p className="text-sm text-destructive">{state.errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-[13px] font-semibold">Hora de inicio *</Label>
                <Input id="time" name="time" type="time" defaultValue={defaultTime} required className="h-[42px] rounded-[10px]" />
                {state?.errors?.time && <p className="text-sm text-destructive">{state.errors.time}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="durationMinutes" className="text-[13px] font-semibold">Duración *</Label>
                <SearchableSelect
                  id="durationMinutes"
                  name="durationMinutes"
                  options={DURATION_OPTIONS}
                  value={duration}
                  onChange={setDuration}
                  placeholder="Duración de la cita"
                  searchPlaceholder="Buscar duración..."
                  className="h-[42px] rounded-[10px]"
                />
                {state?.errors?.durationMinutes && <p className="text-sm text-destructive">{state.errors.durationMinutes}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[13px] font-semibold">Notas</Label>
              <Textarea id="notes" name="notes" rows={4} defaultValue={initialData?.notes ?? ''} className="rounded-[10px]" />
              {state?.errors?.notes && <p className="text-sm text-destructive">{state.errors.notes}</p>}
            </div>
          </div>
        </Card>
      </div>

      <Card className="gap-3.5 rounded-2xl p-5 xl:sticky xl:top-[86px]">
        <div className="text-base font-bold tracking-tight">Acciones</div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full justify-center rounded-[11px] font-semibold shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_28%,transparent)]"
        >
          <Check className="mr-2 h-4 w-4" />
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear cita'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="bg-card h-10 w-full justify-center rounded-[11px] font-semibold"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </Card>
    </form>
  );
}
