import { DynamoDBAppointmentRepository } from "../repositories/dynamodb-appointment.repository";
import { CreateAppointmentUseCase } from "../../application/use-cases/create-appointment.use-case";

// Container for dependency injection
export const container = {
  // Repositories
  appointmentRepository: new DynamoDBAppointmentRepository(),

  // Use cases
  createAppointmentUseCase: null as unknown as CreateAppointmentUseCase,
};

// Initialize use cases with their dependencies
container.createAppointmentUseCase = new CreateAppointmentUseCase(
  container.appointmentRepository
);
