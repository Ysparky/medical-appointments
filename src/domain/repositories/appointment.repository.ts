import { Appointment } from '../entities/appointment.entity';

export interface IAppointmentRepository {
  create(appointment: Appointment): Promise<Appointment>;
  processAppointment(appointment: Appointment): Promise<Appointment>;
  findAllByInsuredId(insuredId: string): Promise<Appointment[]>;
}
