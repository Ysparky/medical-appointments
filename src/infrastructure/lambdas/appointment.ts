import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { container } from '../container';
import { Appointment } from '../../domain/entities/appointment.entity';
import { ValidationService } from '../../domain/validation/validation.service';
import {
  appointmentCreateSchema,
  AppointmentCreateInput,
  appointmentGetSchema,
  AppointmentGetInput,
} from '../../domain/schemas/appointment.schema';
import { createErrorResponse } from '../../utils/http-errors';

async function handleGetRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const query = event.queryStringParameters || {};
  const input = ValidationService.validate<AppointmentGetInput>(appointmentGetSchema, query);

  const appointments = await container.getAppointmentsByInsuredIdUseCase.execute(input.insuredId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Appointments retrieved successfully',
      data: appointments,
    }),
  };
}

async function handlePostRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const requestBody = JSON.parse(event.body || '{}');
  const input = ValidationService.validate<AppointmentCreateInput>(
    appointmentCreateSchema,
    requestBody,
  );

  const appointment = Appointment.fromJSON(input);
  const result = await container.createAppointmentUseCase.execute(appointment);

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Appointment created successfully',
      data: result,
    }),
  };
}

async function handleHttpRequest(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (event.httpMethod === 'GET') {
      return await handleGetRequest(event);
    }

    if (event.httpMethod === 'POST') {
      return await handlePostRequest(event);
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  } catch (error) {
    return createErrorResponse(error);
  }
}

async function handleSqsEvent(event: SQSEvent): Promise<void> {
  for (const record of event.Records) {
    console.log('Processing SQS record:', record);

    try {
      const eventBridgeMessage = JSON.parse(record.body);
      console.log('Parsed EventBridge message:', eventBridgeMessage);

      if (eventBridgeMessage['detail-type'] !== 'APPOINTMENT_PROCESSED') {
        console.log('Skipping non-appointment event:', eventBridgeMessage);
        continue;
      }

      const appointmentData = eventBridgeMessage.detail;
      console.log('Processing appointment data:', appointmentData);

      const appointment = Appointment.fromJSON(appointmentData);
      await container.completeAppointmentUseCase.execute(appointment);
      console.log('Successfully completed appointment:', appointment.id);
    } catch (error) {
      console.error('Error processing EventBridge message:', error);
    }
  }
}

export const handler = async (
  event: APIGatewayProxyEvent | SQSEvent,
): Promise<APIGatewayProxyResult | void> => {
  if ('httpMethod' in event) {
    return handleHttpRequest(event);
  }

  await handleSqsEvent(event);
};
