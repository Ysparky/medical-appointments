import { mock } from "jest-mock-extended";
import { CompleteAppointmentUseCase } from "../../src/application/use-cases/complete-appointment.use-case";
import { IAppointmentRepository } from "../../src/domain/repositories/appointment.repository";
import {
  Appointment,
  AppointmentStatus,
  CountryISO,
} from "../../src/domain/entities/appointment.entity";

describe("CompleteAppointmentUseCase", () => {
  const mockAppointmentRepository = mock<IAppointmentRepository>();
  const completeAppointmentUseCase = new CompleteAppointmentUseCase(
    mockAppointmentRepository
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-01-01T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should update appointment status to COMPLETED", async () => {
    // Arrange
    const appointment = new Appointment(
      "12345",
      100,
      CountryISO.PERU,
      "test-id",
      AppointmentStatus.PENDING,
      "2023-01-01T10:00:00.000Z",
      "2023-01-01T10:00:00.000Z"
    );

    const completedAppointment = new Appointment(
      "12345",
      100,
      CountryISO.PERU,
      "test-id",
      AppointmentStatus.COMPLETED,
      "2023-01-01T10:00:00.000Z",
      "2023-01-01T12:00:00.000Z"
    );

    mockAppointmentRepository.processAppointment.mockResolvedValue(
      completedAppointment
    );

    // Act
    const result = await completeAppointmentUseCase.execute(appointment);

    // Assert
    expect(mockAppointmentRepository.processAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-id",
        status: AppointmentStatus.COMPLETED,
        updatedAt: "2023-01-01T12:00:00.000Z",
      })
    );
    expect(result).toBe(completedAppointment);
    expect(result.status).toBe(AppointmentStatus.COMPLETED);
  });

  it("should throw an error if repository update fails", async () => {
    // Arrange
    const appointment = new Appointment(
      "12345",
      100,
      CountryISO.PERU,
      "test-id",
      AppointmentStatus.PENDING
    );

    const error = new Error("Database error");
    mockAppointmentRepository.processAppointment.mockRejectedValue(error);

    // Act & Assert
    await expect(
      completeAppointmentUseCase.execute(appointment)
    ).rejects.toThrow("Database error");

    expect(mockAppointmentRepository.processAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-id",
        status: AppointmentStatus.COMPLETED,
      })
    );
  });
});
