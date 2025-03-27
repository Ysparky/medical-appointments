import { Appointment } from '../../domain/entities/appointment.entity';
import { IEventBusAdapter } from '../../domain/adapters/event-bus.adapter';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository';

export class ProcessAppointmentUseCase {
  constructor(
    private readonly eventBusAdapter: IEventBusAdapter,
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(appointment: Appointment): Promise<void> {
    console.log(`Storing appointment in ${appointment.countryISO} MySQL database:`, appointment.id);
    await this.appointmentRepository.create(appointment);

    console.log(`Publishing processed appointment to EventBridge:`, appointment.id);
    await this.eventBusAdapter.publishProcessedAppointment(appointment);
  }
}
