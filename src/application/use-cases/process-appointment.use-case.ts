import {
  Appointment,
  AppointmentStatus,
} from "../../domain/entities/appointment.entity";
import { IEventBusAdapter } from "../../domain/adapters/event-bus.adapter";

export class ProcessAppointmentUseCase {
  constructor(private readonly eventBusAdapter: IEventBusAdapter) {}

  async execute(appointment: Appointment): Promise<void> {
    await this.eventBusAdapter.publishProcessedAppointment(appointment);
  }
}
