import { SQSEvent } from "aws-lambda";
import { container } from "../container";
import { Appointment } from "../../domain/entities/appointment.entity";

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      const appointmentData = JSON.parse(message.Message);
      console.log("Processing CL appointment:", appointmentData);

      const appointment = Appointment.fromJSON(appointmentData);
      await container.processAppointmentUseCase.execute(appointment);

      console.log("Successfully processed CL appointment:", appointment.id);
    }
  } catch (error) {
    console.error("Error processing CL appointment:", error);
    throw error;
  }
};
