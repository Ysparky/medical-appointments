import { Appointment } from "../entities/appointment.entity";

export interface IAppointmentRepository {
  create(appointment: Appointment): Promise<Appointment>;
  // findAll(): Promise<Appointment[]>;
  // findById(id: string): Promise<Appointment>;
  // update(appointment: Appointment): Promise<Appointment>;
  // delete(id: string): Promise<void>;
}
