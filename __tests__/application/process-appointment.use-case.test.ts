import { mock } from "jest-mock-extended";
import { ProcessAppointmentUseCase } from "../../src/application/use-cases/process-appointment.use-case";
import { IEventBusAdapter } from "../../src/domain/adapters/event-bus.adapter";
import {
  Appointment,
  CountryISO,
} from "../../src/domain/entities/appointment.entity";

describe("ProcessAppointmentUseCase", () => {
  const mockEventBusAdapter = mock<IEventBusAdapter>();
  const processAppointmentUseCase = new ProcessAppointmentUseCase(
    mockEventBusAdapter
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should publish processed appointment to event bus", async () => {
    // Arrange
    const appointment = new Appointment(
      "12345",
      100,
      CountryISO.PERU,
      "test-id"
    );
    mockEventBusAdapter.publishProcessedAppointment.mockResolvedValue();

    // Act
    await processAppointmentUseCase.execute(appointment);

    // Assert
    expect(
      mockEventBusAdapter.publishProcessedAppointment
    ).toHaveBeenCalledWith(appointment);
  });

  it("should throw an error if event bus publish fails", async () => {
    // Arrange
    const appointment = new Appointment(
      "12345",
      100,
      CountryISO.PERU,
      "test-id"
    );
    const error = new Error("Event bus error");
    mockEventBusAdapter.publishProcessedAppointment.mockRejectedValue(error);

    // Act & Assert
    await expect(
      processAppointmentUseCase.execute(appointment)
    ).rejects.toThrow("Event bus error");
    expect(
      mockEventBusAdapter.publishProcessedAppointment
    ).toHaveBeenCalledWith(appointment);
  });
});
