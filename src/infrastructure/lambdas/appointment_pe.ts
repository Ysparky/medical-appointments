import { SQSEvent } from 'aws-lambda';
import { container } from '../container';
import { Appointment } from '../../domain/entities/appointment.entity';
import { ProcessAppointmentUseCase } from '../../application/use-cases/process-appointment.use-case';

const processAppointmentUseCase = new ProcessAppointmentUseCase(
  container.eventBusAdapter,
  container.postgresqlAppointmentRepositoryPE,
);

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const appointmentData = JSON.parse(message.Message);
      console.log('Processing PE appointment:', appointmentData);

      const appointment = Appointment.fromJSON(appointmentData);

      await processAppointmentUseCase.execute(appointment);

      console.log('Successfully processed PE appointment:', appointment.id);
    }
  } catch (error) {
    console.error('Error processing PE appointment:', error);
    throw error;
  }
};
