import {
  Appointment,
  AppointmentStatus,
} from "../../domain/entities/appointment.entity";
import { IAppointmentRepository } from "../../domain/repositories/appointment.repository";

export class CompleteAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    appointment.updateStatus(AppointmentStatus.COMPLETED);

    return this.appointmentRepository.processAppointment(appointment);
  }
}
