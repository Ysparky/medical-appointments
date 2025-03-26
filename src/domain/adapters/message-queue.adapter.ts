import { Appointment } from "../entities/appointment.entity";

export interface IMessageQueueAdapter {
  publishAppointment(appointment: Appointment): Promise<void>;
}
