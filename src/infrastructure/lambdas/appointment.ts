import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSEvent,
} from "aws-lambda";
import { container } from "../container";
import { Appointment } from "../../domain/entities/appointment.entity";
import {
  ValidationError,
  ValidationService,
} from "../../domain/validation/validation.service";
import {
  appointmentCreateSchema,
  AppointmentCreateInput,
  appointmentGetSchema,
  AppointmentGetInput,
} from "../../domain/schemas/appointment.schema";

async function handleHttpRequest(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (event.httpMethod === "GET") {
      try {
        const query = event.queryStringParameters || {};
        const input = ValidationService.validate<AppointmentGetInput>(
          appointmentGetSchema,
          query
        );

        const appointments =
          await container.getAppointmentsByInsuredIdUseCase.execute(
            input.insuredId
          );

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Appointments retrieved successfully",
            data: appointments,
          }),
        };
      } catch (error) {
        if (error instanceof ValidationError) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Validation error",
              errors: ValidationService.formatZodError(error.errors),
            }),
          };
        }
        throw error;
      }
    }

    if (event.httpMethod === "POST") {
      try {
        const requestBody = JSON.parse(event.body || "{}");
        const input = ValidationService.validate<AppointmentCreateInput>(
          appointmentCreateSchema,
          requestBody
        );

        const appointment = Appointment.fromJSON(input);
        const result = await container.createAppointmentUseCase.execute(
          appointment
        );

        return {
          statusCode: 201,
          body: JSON.stringify({
            message: "Appointment created successfully",
            data: result,
          }),
        };
      } catch (error) {
        if (error instanceof ValidationError) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Validation error",
              errors: ValidationService.formatZodError(error.errors),
            }),
          };
        } else if (error instanceof SyntaxError) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Invalid request body",
              error: "Request body must be valid JSON",
            }),
          };
        }
        throw error;
      }
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Error processing appointment:", error);
    return {
      statusCode: 500,
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
