import { DynamoDBAppointmentRepository } from "../repositories/dynamodb-appointment.repository";
import { CreateAppointmentUseCase } from "../../application/use-cases/create-appointment.use-case";
import { ProcessAppointmentUseCase } from "../../application/use-cases/process-appointment.use-case";
import { CompleteAppointmentUseCase } from "../../application/use-cases/complete-appointment.use-case";
import { SNSMessageQueueAdapter } from "../adapters/sns-message-queue.adapter";
import { EventBridgeEventBusAdapter } from "../adapters/event-bridge-event-bus.adapter";

// Container for dependency injection
export const container = {
  // Adapters
  messageQueueAdapter: new SNSMessageQueueAdapter(),
  eventBusAdapter: new EventBridgeEventBusAdapter(),

  // Repositories
  appointmentRepository: new DynamoDBAppointmentRepository(),

  // Use cases
  createAppointmentUseCase: null as unknown as CreateAppointmentUseCase,
  processAppointmentUseCase: null as unknown as ProcessAppointmentUseCase,
  completeAppointmentUseCase: null as unknown as CompleteAppointmentUseCase,
};

// Initialize use cases with their dependencies
container.createAppointmentUseCase = new CreateAppointmentUseCase(
  container.appointmentRepository,
  container.messageQueueAdapter
);

container.processAppointmentUseCase = new ProcessAppointmentUseCase(
  container.eventBusAdapter
);

container.completeAppointmentUseCase = new CompleteAppointmentUseCase(
  container.appointmentRepository
);
