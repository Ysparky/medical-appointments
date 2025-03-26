import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSEvent,
  SQSRecord,
} from "aws-lambda";
import { container } from "../container";
import { Appointment } from "../../domain/entities/appointment.entity";

async function handleHttpRequest(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
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
  } catch (error) {
    console.error("Error creating appointment:", error);
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
}

async function handleSqsEvent(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    console.log("Processing SQS record:", record);

    try {
      const eventBridgeMessage = JSON.parse(record.body);
      console.log("Parsed EventBridge message:", eventBridgeMessage);

      if (eventBridgeMessage["detail-type"] !== "APPOINTMENT_PROCESSED") {
        console.log("Skipping non-appointment event:", eventBridgeMessage);
        continue;
      }

      const appointmentData = eventBridgeMessage.detail;
      console.log("Processing appointment data:", appointmentData);

      const appointment = Appointment.fromJSON(appointmentData);
      await container.completeAppointmentUseCase.execute(appointment);
      console.log("Successfully completed appointment:", appointment.id);
    } catch (error) {
      console.error("Error processing EventBridge message:", error);
    }
  }
}

export const handler = async (
  event: APIGatewayProxyEvent | SQSEvent
): Promise<APIGatewayProxyResult | void> => {
  if ("httpMethod" in event) {
    return handleHttpRequest(event);
  }

  await handleSqsEvent(event);
};
