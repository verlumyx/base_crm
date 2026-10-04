'use client';

import { useActionState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export function AppointmentForm({ companyId, clients, initialData, initialDate, initialTime }: Props) {
  const router = useRouter();
  const isEditing = !!initialData;

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
                <Select name="clientId" defaultValue={initialData?.clientId}>
                  <SelectTrigger id="clientId" className="h-[42px] rounded-[10px]">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select name="durationMinutes" defaultValue={initialData?.durationMinutes?.toString() ?? '60'}>
                  <SelectTrigger id="durationMinutes" className="h-[42px] rounded-[10px]">
                    <SelectValue placeholder="Duración de la cita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1.5 horas</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                  </SelectContent>
                </Select>
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
