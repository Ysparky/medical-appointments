import { mock } from 'jest-mock-extended';
import { CreateAppointmentUseCase } from '../../src/application/use-cases/create-appointment.use-case';
import { IAppointmentRepository } from '../../src/domain/repositories/appointment.repository';
import { IMessageQueueAdapter } from '../../src/domain/adapters/message-queue.adapter';
import { Appointment, CountryISO } from '../../src/domain/entities/appointment.entity';

describe('CreateAppointmentUseCase', () => {
  const mockAppointmentRepository = mock<IAppointmentRepository>();
  const mockMessageQueueAdapter = mock<IMessageQueueAdapter>();
  const createAppointmentUseCase = new CreateAppointmentUseCase(
    mockAppointmentRepository,
    mockMessageQueueAdapter,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an appointment and publish it to the message queue', async () => {
    // Arrange
    const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
    mockAppointmentRepository.create.mockResolvedValue(appointment);
    mockMessageQueueAdapter.publishAppointment.mockResolvedValue();

    // Act
    const result = await createAppointmentUseCase.execute(appointment);

    // Assert
    expect(mockAppointmentRepository.create).toHaveBeenCalledWith(appointment);
    expect(mockMessageQueueAdapter.publishAppointment).toHaveBeenCalledWith(appointment);
    expect(result).toBe(appointment);
  });

  it('should throw an error if repository create fails', async () => {
    // Arrange
    const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
    const error = new Error('Database error');
    mockAppointmentRepository.create.mockRejectedValue(error);

    // Act & Assert
    await expect(createAppointmentUseCase.execute(appointment)).rejects.toThrow('Database error');
    expect(mockAppointmentRepository.create).toHaveBeenCalledWith(appointment);
    expect(mockMessageQueueAdapter.publishAppointment).not.toHaveBeenCalled();
  });

  it('should throw an error if message queue publish fails', async () => {
    // Arrange
    const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
    mockAppointmentRepository.create.mockResolvedValue(appointment);
    const error = new Error('Message queue error');
    mockMessageQueueAdapter.publishAppointment.mockRejectedValue(error);

    // Act & Assert
    await expect(createAppointmentUseCase.execute(appointment)).rejects.toThrow(
      'Message queue error',
    );
    expect(mockAppointmentRepository.create).toHaveBeenCalledWith(appointment);
    expect(mockMessageQueueAdapter.publishAppointment).toHaveBeenCalledWith(appointment);
  });
});
