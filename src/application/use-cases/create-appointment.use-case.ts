import { Appointment } from "../../domain/entities/appointment.entity";
import { IAppointmentRepository } from "../../domain/repositories/appointment.repository";
import { IMessageQueueAdapter } from "../../domain/adapters/message-queue.adapter";
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly messageQueueAdapter: IMessageQueueAdapter
  ) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    console.log("Creating appointment with:", appointment.toObject());

    // Create appointment in DynamoDB
    await this.appointmentRepository.create(appointment);
    console.log("Appointment created in DynamoDB");
    // Publish appointment to SNS
    await this.messageQueueAdapter.publishAppointment(appointment);
    console.log("Appointment published to SNS");

    return appointment;
  }
}
