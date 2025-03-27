import { DynamoDBAppointmentRepository } from '../repositories/dynamodb-appointment.repository';
import {
  PostgreSQLAppointmentRepositoryPE,
  PostgreSQLAppointmentRepositoryCL,
} from '../repositories/postgresql-appointment.repository';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { ProcessAppointmentUseCase } from '../../application/use-cases/process-appointment.use-case';
import { CompleteAppointmentUseCase } from '../../application/use-cases/complete-appointment.use-case';
import { GetAppointmentsByInsuredIdUseCase } from '../../application/use-cases/get-appointments-by-insured-id.use-case';
import { SNSMessageQueueAdapter } from '../adapters/sns-message-queue.adapter';
import { EventBridgeEventBusAdapter } from '../adapters/event-bridge-event-bus.adapter';

// Container for dependency injection
export const container = {
  // Adapters
  messageQueueAdapter: new SNSMessageQueueAdapter(),
  eventBusAdapter: new EventBridgeEventBusAdapter(),

  // Repositories
  appointmentRepository: new DynamoDBAppointmentRepository(),
  postgresqlAppointmentRepositoryPE: new PostgreSQLAppointmentRepositoryPE(),
  postgresqlAppointmentRepositoryCL: new PostgreSQLAppointmentRepositoryCL(),

  // Use cases
  createAppointmentUseCase: null as unknown as CreateAppointmentUseCase,
  processAppointmentUseCase: null as unknown as ProcessAppointmentUseCase,
  completeAppointmentUseCase: null as unknown as CompleteAppointmentUseCase,
  getAppointmentsByInsuredIdUseCase: null as unknown as GetAppointmentsByInsuredIdUseCase,
};

// Initialize use cases with their dependencies
container.createAppointmentUseCase = new CreateAppointmentUseCase(
  container.appointmentRepository,
  container.messageQueueAdapter,
);

container.completeAppointmentUseCase = new CompleteAppointmentUseCase(
  container.appointmentRepository,
);

container.getAppointmentsByInsuredIdUseCase = new GetAppointmentsByInsuredIdUseCase(
  container.appointmentRepository,
);
