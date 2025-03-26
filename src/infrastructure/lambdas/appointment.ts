import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "../container";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = JSON.parse(event.body || "{}");

    const result = await container.createAppointmentUseCase.execute(
      requestBody
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
        message: "Error creating appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
