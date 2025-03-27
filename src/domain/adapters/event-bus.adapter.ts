import { Appointment } from '../entities/appointment.entity';

export interface IEventBusAdapter {
  publishProcessedAppointment(appointment: Appointment): Promise<void>;
}
