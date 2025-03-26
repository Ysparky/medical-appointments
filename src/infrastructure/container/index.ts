import { DynamoDBAppointmentRepository } from "../repositories/dynamodb-appointment.repository";
import { CreateAppointmentUseCase } from "../../application/use-cases/create-appointment.use-case";
import { SNSMessageQueueAdapter } from "../adapters/sns-message-queue.adapter";

// Container for dependency injection
export const container = {
  // Adapters
  messageQueueAdapter: new SNSMessageQueueAdapter(),

  // Repositories
  appointmentRepository: new DynamoDBAppointmentRepository(),

  // Use cases
  createAppointmentUseCase: null as unknown as CreateAppointmentUseCase,
};

// Initialize use cases with their dependencies
container.createAppointmentUseCase = new CreateAppointmentUseCase(
  container.appointmentRepository,
  container.messageQueueAdapter
);
