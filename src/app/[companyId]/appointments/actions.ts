'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { createAppointmentContainer } from '@/modules/appointment/container';
import { createAppointmentSchema } from '@/modules/appointment/validation/appointment-create.schema';
import { updateAppointmentSchema } from '@/modules/appointment/validation/appointment-update.schema';
import { CreateAppointmentCommand } from '@/modules/appointment/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '@/modules/appointment/commands/update-appointment.command';
import { UpdateAppointmentStatusCommand } from '@/modules/appointment/commands/update-appointment-status.command';
import { AppointmentOverlapException } from '@/modules/appointment/exceptions/appointment-overlap.exception';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { getSessionUser } from '@/modules/shared/auth/session';
import { setFlash } from '@/modules/shared/flash/flash';
import { redirect } from 'next/navigation';

export async function createAppointmentAction(
  companyId: string,
  _prev: any,
  formData: FormData
) {
  await requirePermission(companyId, 'appointments.create');
  const user = await getSessionUser();

  const id = formData.get('id') as string;
  const clientId = formData.get('clientId') as string;
  const dateStr = formData.get('date') as string;
  const timeStr = formData.get('time') as string;
  const durationMinutes = Number(formData.get('durationMinutes'));
  const notes = formData.get('notes') as string;

  const parsed = createAppointmentSchema.safeParse({ id, clientId, date: dateStr, time: timeStr, durationMinutes, notes });

  if (!parsed.success) {
    return {
      type: 'error' as const,
      message: 'Revisa los campos obligatorios.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Generate start and end dates based on user timezone / local input
  // Since we don't have timezone input, we assume the input corresponds to server local time or we construct a UTC date.
  // Better yet, we should construct the date object correctly.
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const startTime = new Date(year, month - 1, day, hours, minutes);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const command = CreateAppointmentCommand.fromInput(
    {
      id,
      clientId,
      startTime,
      endTime,
      durationMinutes,
      notes,
    },
    companyId,
    user?.id ?? null
  );

  let redirectPath = '';

  try {
    await db.transaction(async (tx) => {
      const container = createAppointmentContainer(tx);
      await container.createService.execute(command);
    });

    await setFlash('success', 'Cita creada exitosamente.');
    redirectPath = `/${companyId}/appointments`;
  } catch (error: any) {
    if (error instanceof AppointmentOverlapException) {
      return { type: 'error' as const, message: error.message };
    }
    return { type: 'error' as const, message: error.message };
    // return { type: 'error' as const, message: 'Ocurrió un error inesperado al crear la cita.' };
  }

  revalidatePath(`/${companyId}/appointments`);
  redirect(redirectPath);
}

export async function updateAppointmentAction(
  companyId: string,
  _prev: any,
  formData: FormData
) {
  await requirePermission(companyId, 'appointments.update');

  const id = formData.get('id') as string;
  const clientId = formData.get('clientId') as string;
  const dateStr = formData.get('date') as string;
  const timeStr = formData.get('time') as string;
  const durationMinutes = Number(formData.get('durationMinutes'));
  const notes = formData.get('notes') as string;

  const parsed = updateAppointmentSchema.safeParse({ clientId, date: dateStr, time: timeStr, durationMinutes, notes });

  if (!parsed.success) {
    return {
      type: 'error' as const,
      message: 'Revisa los campos obligatorios.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const startTime = new Date(year, month - 1, day, hours, minutes);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const command = UpdateAppointmentCommand.fromInput(
    {
      id,
      clientId,
      startTime,
      endTime,
      durationMinutes,
      notes,
    },
    companyId
  );

  let redirectPath = '';

  try {
    await db.transaction(async (tx) => {
      const container = createAppointmentContainer(tx);
      await container.updateService.execute(command);
    });

    await setFlash('success', 'Cita actualizada exitosamente.');
    redirectPath = `/${companyId}/appointments`;
  } catch (error: any) {
    if (error instanceof AppointmentOverlapException) {
      return { type: 'error' as const, message: error.message };
    }
    return { type: 'error' as const, message: 'Ocurrió un error inesperado al actualizar la cita.' };
  }

  revalidatePath(`/${companyId}/appointments`);
  redirect(redirectPath);
}

export async function updateAppointmentStatusAction(
  companyId: string,
  id: string,
  status: 'scheduled' | 'completed' | 'cancelled'
) {
  await requirePermission(companyId, 'appointments.delete');

  const command = UpdateAppointmentStatusCommand.fromInput({ id, status }, companyId);

  try {
    await db.transaction(async (tx) => {
      const container = createAppointmentContainer(tx);
      await container.updateStatusService.execute(command);
    });
    revalidatePath(`/${companyId}/appointments`);
  } catch (error) {
    throw new Error('No se pudo actualizar el estado de la cita.');
  }
}
