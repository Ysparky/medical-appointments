import { SQSEvent, SQSRecord } from 'aws-lambda';
import { handler as peHandler } from '../../src/infrastructure/lambdas/appointment_pe';
import { handler as clHandler } from '../../src/infrastructure/lambdas/appointment_cl';
import { container } from '../../src/infrastructure/container';
import { Appointment, CountryISO } from '../../src/domain/entities/appointment.entity';

// Mock the container
jest.mock('../../src/infrastructure/container', () => ({
  container: {
    processAppointmentUseCase: {
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

describe('Country-Specific Lambda Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Peru Lambda Handler', () => {
    it('should process Peru appointment messages', async () => {
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

      (container.processAppointmentUseCase.execute as jest.Mock).mockResolvedValue({});

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData),
            }),
          ),
        ],
      };

      // Act
      await peHandler(sqsEvent);

      // Assert
      expect(container.processAppointmentUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          insuredId: '12345',
          countryISO: CountryISO.PERU,
        }),
      );
    });

    it('should handle multiple records', async () => {
      // Arrange
      const appointmentData1 = {
        id: 'test-id-1',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'PE',
      };

      const appointmentData2 = {
        id: 'test-id-2',
        insuredId: '12346',
        scheduleId: 101,
        countryISO: 'PE',
      };

      (container.processAppointmentUseCase.execute as jest.Mock).mockResolvedValue({});

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData1),
            }),
          ),
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData2),
            }),
          ),
        ],
      };

      // Act
      await peHandler(sqsEvent);

      // Assert
      expect(container.processAppointmentUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const appointmentData = {
        id: 'test-id',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'PE',
      };

      const error = new Error('Processing error');
      (container.processAppointmentUseCase.execute as jest.Mock).mockRejectedValue(error);

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData),
            }),
          ),
        ],
      };

      // Act & Assert
      await expect(peHandler(sqsEvent)).rejects.toThrow('Processing error');
      expect(container.processAppointmentUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('Chile Lambda Handler', () => {
    it('should process Chile appointment messages', async () => {
      // Arrange
      const appointmentData = {
        id: 'test-id',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'CL',
        status: 'PENDING',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z',
      };

      (container.processAppointmentUseCase.execute as jest.Mock).mockResolvedValue({});

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData),
            }),
          ),
        ],
      };

      // Act
      await clHandler(sqsEvent);

      // Assert
      expect(container.processAppointmentUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          insuredId: '12345',
          countryISO: CountryISO.CHILE,
        }),
      );
    });

    it('should handle multiple records', async () => {
      // Arrange
      const appointmentData1 = {
        id: 'test-id-1',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'CL',
      };

      const appointmentData2 = {
        id: 'test-id-2',
        insuredId: '12346',
        scheduleId: 101,
        countryISO: 'CL',
      };

      (container.processAppointmentUseCase.execute as jest.Mock).mockResolvedValue({});

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData1),
            }),
          ),
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData2),
            }),
          ),
        ],
      };

      // Act
      await clHandler(sqsEvent);

      // Assert
      expect(container.processAppointmentUseCase.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const appointmentData = {
        id: 'test-id',
        insuredId: '12345',
        scheduleId: 100,
        countryISO: 'CL',
      };

      const error = new Error('Processing error');
      (container.processAppointmentUseCase.execute as jest.Mock).mockRejectedValue(error);

      const sqsEvent: SQSEvent = {
        Records: [
          createMockSQSRecord(
            JSON.stringify({
              Message: JSON.stringify(appointmentData),
            }),
          ),
        ],
      };

      // Act & Assert
      await expect(clHandler(sqsEvent)).rejects.toThrow('Processing error');
      expect(container.processAppointmentUseCase.execute).toHaveBeenCalled();
    });
  });
});
