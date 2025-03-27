import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from '@aws-sdk/client-eventbridge';
import { IEventBusAdapter } from '../../domain/adapters/event-bus.adapter';
import { Appointment } from '../../domain/entities/appointment.entity';

export class EventBridgeEventBusAdapter implements IEventBusAdapter {
  private readonly eventBus: EventBridgeClient;
  private readonly eventBusName: string;

  constructor() {
    this.eventBus = new EventBridgeClient({ region: 'us-east-1' });
    this.eventBusName = process.env.EVENTBRIDGE_BUS_NAME!;
  }

  async publishProcessedAppointment(appointment: Appointment): Promise<void> {
    const params: PutEventsCommandInput = {
      Entries: [
        {
          Source: `appointment.${appointment.countryISO.toLowerCase()}`,
          DetailType: 'APPOINTMENT_PROCESSED',
          Detail: JSON.stringify(appointment.toObject()),
          EventBusName: this.eventBusName,
          Time: new Date(),
        },
      ],
    };

    console.log('Publishing to EventBridge with params:', JSON.stringify(params, null, 2));
    try {
      await this.eventBus.send(new PutEventsCommand(params));
      console.log('Successfully published to EventBridge');
    } catch (error) {
      console.error('Error publishing to EventBridge:', error);
      throw error;
    }
  }
}
