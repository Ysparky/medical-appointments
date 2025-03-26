import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSEvent,
  SQSRecord,
} from "aws-lambda";
import { container } from "../container";
import { Appointment } from "../../domain/entities/appointment.entity";

export const handler = async (
  event: APIGatewayProxyEvent | SQSEvent
): Promise<APIGatewayProxyResult | void> => {
  try {
    // Handle HTTP POST request for appointment creation
    if ("httpMethod" in event) {
      const requestBody = JSON.parse(event.body || "{}");
      const appointment = Appointment.fromJSON(requestBody);
      const result = await container.createAppointmentUseCase.execute(
        appointment
      );

      return {
        statusCode: 201,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Appointment created successfully",
          data: result,
        }),
      };
    }

    // Handle SQS events for appointment completion
    else {
      for (const record of event.Records) {
        console.log("Processing SQS record:", record);

        try {
          const sqsMessage = JSON.parse(record.body);
          console.log("Parsed SQS message:", sqsMessage);

          // Handle direct SQS messages (like your manual test)
          if (
            sqsMessage["detail-type"] === "APPOINTMENT_PROCESSED" &&
            sqsMessage.detail
          ) {
            const appointmentData = sqsMessage.detail;
            console.log("Processing direct appointment data:", appointmentData);

            const appointment = Appointment.fromJSON(appointmentData);
            await container.completeAppointmentUseCase.execute(appointment);
            console.log("Successfully completed appointment:", appointment.id);
          }
          // Handle EventBridge events via SQS (this is the normal flow)
          else if (
            sqsMessage.source &&
            sqsMessage["detail-type"] === "APPOINTMENT_PROCESSED"
          ) {
            // For EventBridge events through SQS, the appointment data is directly in the detail
            const appointmentData = sqsMessage.detail;
            console.log(
              "Processing EventBridge appointment data:",
              appointmentData
            );

            const appointment = Appointment.fromJSON(appointmentData);
            await container.completeAppointmentUseCase.execute(appointment);
            console.log("Successfully completed appointment:", appointment.id);
          } else {
            console.log("Skipping non-appointment event:", sqsMessage);
          }
        } catch (error) {
          console.error("Error processing SQS message:", error);
          // Continue processing other records
        }
      }
    }
  } catch (error) {
    console.error("Error processing appointment:", error);
    if ("httpMethod" in event) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Error processing appointment",
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      };
    }
    throw error;
  }
};
