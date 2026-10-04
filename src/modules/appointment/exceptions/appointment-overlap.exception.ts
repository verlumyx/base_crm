import { DomainError } from '@/modules/shared/exceptions/domain-error';

export class AppointmentOverlapException extends DomainError {
  constructor() {
    super('La hora seleccionada choca con una cita existente.');
    this.name = 'AppointmentOverlapException';
  }
}
