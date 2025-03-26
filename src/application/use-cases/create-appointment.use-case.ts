import { Appointment } from "../../domain/entities/appointment.entity";
import { IAppointmentRepository } from "../../domain/repositories/appointment.repository";

export class CreateAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute({
    insuredId,
    scheduleId,
    countryISO,
  }: Appointment): Promise<Appointment> {
    const appointment = new Appointment(insuredId, scheduleId, countryISO);
    return this.appointmentRepository.create(appointment);
  }
}
