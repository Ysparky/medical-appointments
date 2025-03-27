import { APIGatewayProxyEvent, SQSEvent, SQSRecord } from 'aws-lambda';
import { handler } from '../../src/infrastructure/lambdas/appointment';
import { container } from '../../src/infrastructure/container';
import {
  Appointment,
  AppointmentStatus,
  CountryISO,
} from '../../src/domain/entities/appointment.entity';
import { ValidationError, ValidationService } from '../../src/domain/validation/validation.service';
import { z } from 'zod';

// Make sure we have proper access to the original ValidationError
const originalValidationModule = jest.requireActual(
  '../../src/domain/validation/validation.service',
);
const originalValidationError = originalValidationModule.ValidationError;

// Mock ValidationService
jest.mock('../../src/domain/validation/validation.service', () => {
  const originalModule = jest.requireActual('../../src/domain/validation/validation.service');

  return {
    ...originalModule,
    ValidationService: {
      validate: jest.fn(),
      formatZodError: jest.fn().mockReturnValue({
        insuredId: ['Insured ID must be 5 characters long'],
      }),
    },
  };
});

// Mock the container
jest.mock('../../src/infrastructure/container', () => ({
  container: {
    createAppointmentUseCase: {
      execute: jest.fn(),
    },
    getAppointmentsByInsuredIdUseCase: {
      execute: jest.fn(),
    },
    completeAppointmentUseCase: {
      execute: jest.fn(),
    },
  },
}));

// Create mock SQSRecord with all required properties
const createMockSQSRecord = (body: string): SQSRecord => ({
  messageId: 'mock-message-id',
  receiptHandle: 'mock-receipt-handle',
  body,
  attributes: {
    ApproximateReceiveCount: '1',
    SentTimestamp: '1545082649183',
    SenderId: 'AIDAIENQZJOLO23YVJ4VO',
    ApproximateFirstReceiveTimestamp: '1545082649185',
  },
  messageAttributes: {},
  md5OfBody: 'mock-md5',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:region:account-id:queue-name',
  awsRegion: 'us-east-1',
});

describe('Appointment Lambda Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // By default, let validation succeed
    (ValidationService.validate as jest.Mock).mockImplementation((schema, data) => data);
  });

  describe('HTTP API Requests', () => {
    describe('POST /appointment', () => {
      it('should create an appointment successfully', async () => {
        // Arrange
        const mockAppointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
        (container.createAppointmentUseCase.execute as jest.Mock).mockResolvedValue(
          mockAppointment,
        );

        const event = {
          httpMethod: 'POST',
          body: JSON.stringify({
            insuredId: '12345',
            scheduleId: 100,
            countryISO: 'PE',
          }),
        } as unknown as APIGatewayProxyEvent;

        // Act
        const response = (await handler(event)) as any;

        // Assert
        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body)).toEqual({
          message: 'Appointment created successfully',
          data: expect.any(Object),
        });
        expect(container.createAppointmentUseCase.execute).toHaveBeenCalled();
      });

      it('should return 400 for Validation Errors', async () => {
        // Create a real ZodError
        const validationError = new originalValidationError(
          new z.ZodError([
            {
              code: 'too_small',
              minimum: 5,
              type: 'string',
              inclusive: true,
              exact: true,
              message: 'Insured ID must be 5 characters long',
              path: ['insuredId'],
            },
          ]),
        );

        // Make validation throw real ValidationError
        (ValidationService.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        const event = {
          httpMethod: 'POST',
          body: JSON.stringify({
            insuredId: '123', // Invalid (not 5 digits)
            scheduleId: 100,
            countryISO: 'PE',
          }),
        } as unknown as APIGatewayProxyEvent;

        // Act
        const response = (await handler(event)) as any;

        // Assert
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({
          message: 'Validation Error',
          errors: expect.any(Object),
        });
      });

      it('should return 400 for invalid JSON', async () => {
        // Arrange
        const event = {
          httpMethod: 'POST',
          body: '{invalid-json',
        } as unknown as APIGatewayProxyEvent;

        // Act
        const response = (await handler(event)) as any;

        // Assert
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({
          message: 'Invalid request body',
          error: 'Request body must be valid JSON',
        });
      });

      it('should return 500 for unexpected errors', async () => {
        // Arrange
        const error = new Error('Unexpected error');
        (container.createAppointmentUseCase.execute as jest.Mock).mockRejectedValue(error);

        const event = {
          httpMethod: 'POST',
          body: JSON.stringify({
            insuredId: '12345',
            scheduleId: 100,
            countryISO: 'PE',
          }),
        } as unknown as APIGatewayProxyEvent;

        // Act
        const response = (await handler(event)) as any;

        // Assert
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({
          message: 'Internal Server Error',
          error: 'Unexpected error',
        });
      });
    });

    describe('GET /appointment', () => {
      it('should get appointments by insuredId successfully', async () => {
        // Arrange
        const mockAppointments = [
          new Appointment('12345', 100, CountryISO.PERU, 'appointment-1'),
          new Appointment('12345', 101, CountryISO.CHILE, 'appointment-2'),
        ];

        (container.getAppointmentsByInsuredIdUseCase.execute as jest.Mock).mockResolvedValue(
          mockAppointments,
        );

        const event = {
          httpMethod: 'GET',
          queryStringParameters: {
            insuredId: '12345',
          },
        } as unknown as APIGatewayProxyEvent;

        // Act
        const response = (await handler(event)) as any;

        // Assert
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
          message: 'Appointments retrieved successfully',
          data: expect.any(Array),
        });
        expect(container.getAppointmentsByInsuredIdUseCase.execute).toHaveBeenCalledWith('12345');
      });

      it('should return 400 for Validation Errors', async () => {
        // Create a real ZodError
        const validationError = new originalValidationError(
          new z.ZodError([
            {
              code: 'too_small',
              minimum: 5,
              type: 'string',
              inclusive: true,
              exact: true,
              message: 'Insured ID must be 5 characters long',
              path: ['insuredId'],
            },
          ]),
        );

        // Make validation throw our custom error
        (ValidationService.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        const event = {
          httpMethod: 'GET',
          queryStringParameters: {
            insuredId: '123', // Invalid (not 5 digits)
          },
        } as unknown as APIGatewayProxyEvent;

        // Act
        const response = (await handler(event)) as any;

        // Assert
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({
          message: 'Validation Error',
          errors: expect.any(Object),
        });
      });
    });

    it('should return 405 for unsupported HTTP methods', async () => {
      // Arrange
      const event = {
        httpMethod: 'DELETE',
      } as unknown as APIGatewayProxyEvent;

      // Act
      const response = (await handler(event)) as any;

      // Assert
      expect(response.statusCode).toBe(405);
      expect(JSON.parse(response.body)).toEqual({
        message: 'Method not allowed',
      });
    });
  });

  describe('SQS Event Processing', () => {
    it('should process SQS appointment completion events', async () => {
      // Arrange
      const appointmentData = {
        id: 'test-id',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'PE',
        status: 'PENDING',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z',
      };

      const mockAppointment = new Appointment(
        appointmentData.insuredId,
        appointmentData.scheduleId,
        CountryISO.PERU,
        appointmentData.id,
        AppointmentStatus.PENDING,
        appointmentData.createdAt,
        appointmentData.updatedAt,
      );

      (container.completeAppointmentUseCase.execute as jest.Mock).mockResolvedValue(
        mockAppointment,
      );

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              'detail-type': 'APPOINTMENT_PROCESSED',
              detail: appointmentData,
            }),
          ),
        ],
      };

      // Act
      await handler(sqsEvent);

      // Assert
      expect(container.completeAppointmentUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          insuredId: '12345',
        }),
      );
    });

    it('should skip non-appointment events', async () => {
      // Arrange
      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              'detail-type': 'OTHER_EVENT',
              detail: {},
            }),
          ),
        ],
      };

      // Act
      await handler(sqsEvent);

      // Assert
      expect(container.completeAppointmentUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully during SQS processing', async () => {
      // Arrange
      const error = new Error('Processing error');
      (container.completeAppointmentUseCase.execute as jest.Mock).mockRejectedValue(error);

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              'detail-type': 'APPOINTMENT_PROCESSED',
              detail: {
                id: 'test-id',
                insuredId: '12345',
                scheduleId: 100,
                countryISO: 'PE',
              },
            }),
          ),
        ],
      };

      // Act & Assert
      // This should not throw even though there's an error
      await expect(handler(sqsEvent)).resolves.not.toThrow();
      expect(container.completeAppointmentUseCase.execute).toHaveBeenCalled();
    });
  });
});
