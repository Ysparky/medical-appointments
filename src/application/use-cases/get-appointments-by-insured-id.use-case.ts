import { Appointment } from "../../domain/entities/appointment.entity";
import { DynamoDBAppointmentRepository } from "../../infrastructure/repositories/dynamodb-appointment.repository";

export class GetAppointmentsByInsuredIdUseCase {
  constructor(
    private readonly appointmentRepository: DynamoDBAppointmentRepository
  ) {}

  async execute(insuredId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findAllByInsuredId(insuredId);
  }
}
