import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { db } from '@/db/client';
import { DrizzleAppointmentRepository } from './repositories/drizzle-appointment.repository';
import { AppointmentCreateService } from './services/appointment-create.service';
import { AppointmentUpdateService } from './services/appointment-update.service';
import { AppointmentUpdateStatusService } from './services/appointment-update-status.service';
import { AppointmentFindService } from './services/appointment-find.service';
import { AppointmentSearchService } from './services/appointment-search.service';

export function createAppointmentContainer(executor: DbExecutor = db) {
  const repository = new DrizzleAppointmentRepository(executor);

  return {
    createService: new AppointmentCreateService(repository),
    updateService: new AppointmentUpdateService(repository),
    updateStatusService: new AppointmentUpdateStatusService(repository),
    findService: new AppointmentFindService(repository),
    searchService: new AppointmentSearchService(repository),
  };
}
