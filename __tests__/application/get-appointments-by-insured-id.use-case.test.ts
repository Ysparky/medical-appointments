import { mock } from 'jest-mock-extended';
import { GetAppointmentsByInsuredIdUseCase } from '../../src/application/use-cases/get-appointments-by-insured-id.use-case';
import { DynamoDBAppointmentRepository } from '../../src/infrastructure/repositories/dynamodb-appointment.repository';
import { Appointment, CountryISO } from '../../src/domain/entities/appointment.entity';

jest.mock('../../src/infrastructure/repositories/dynamodb-appointment.repository');

describe('GetAppointmentsByInsuredIdUseCase', () => {
  const mockDynamoDBRepository = mock<DynamoDBAppointmentRepository>();
  const getAppointmentsByInsuredIdUseCase = new GetAppointmentsByInsuredIdUseCase(
    mockDynamoDBRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve appointments by insured ID', async () => {
    // Arrange
    const insuredId = '12345';
    const appointments = [
      new Appointment('12345', 100, CountryISO.PERU, 'appointment-1'),
      new Appointment('12345', 101, CountryISO.CHILE, 'appointment-2'),
    ];
    mockDynamoDBRepository.findAllByInsuredId.mockResolvedValue(appointments);

    // Act
    const result = await getAppointmentsByInsuredIdUseCase.execute(insuredId);

    // Assert
    expect(mockDynamoDBRepository.findAllByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(result).toEqual(appointments);
    expect(result.length).toBe(2);
  });

  it('should return empty array if no appointments found', async () => {
    // Arrange
    const insuredId = '12345';
    mockDynamoDBRepository.findAllByInsuredId.mockResolvedValue([]);

    // Act
    const result = await getAppointmentsByInsuredIdUseCase.execute(insuredId);

    // Assert
    expect(mockDynamoDBRepository.findAllByInsuredId).toHaveBeenCalledWith(insuredId);
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should throw an error if repository throws an error', async () => {
    // Arrange
    const insuredId = '12345';
    const error = new Error('Database error');
    mockDynamoDBRepository.findAllByInsuredId.mockRejectedValue(error);

    // Act & Assert
    await expect(getAppointmentsByInsuredIdUseCase.execute(insuredId)).rejects.toThrow(
      'Database error',
    );
    expect(mockDynamoDBRepository.findAllByInsuredId).toHaveBeenCalledWith(insuredId);
  });
});
