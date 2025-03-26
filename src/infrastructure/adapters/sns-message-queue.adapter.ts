import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from "@aws-sdk/client-sns";
import { IMessageQueueAdapter } from "../../domain/adapters/message-queue.adapter";
import { Appointment } from "../../domain/entities/appointment.entity";

export class SNSMessageQueueAdapter implements IMessageQueueAdapter {
  private readonly snsClient: SNSClient;
  private readonly topicArn: string;

  constructor() {
    this.snsClient = new SNSClient({ region: "us-east-1" });
    this.topicArn = process.env.SNS_TOPIC_ARN!;
    console.log("SNS Topic ARN:", this.topicArn);
  }

  async publishAppointment(appointment: Appointment): Promise<void> {
    const params: PublishCommandInput = {
      TopicArn: this.topicArn,
      Message: JSON.stringify(appointment.toObject()),
      MessageAttributes: {
        countryISO: {
          DataType: "String",
          StringValue: appointment.countryISO,
        },
      },
    };

    console.log(
      "Publishing to SNS with params:",
      JSON.stringify(params, null, 2)
    );
    try {
      await this.snsClient.send(new PublishCommand(params));
      console.log("Successfully published to SNS");
    } catch (error) {
      console.error("Error publishing to SNS:", error);
      throw error;
    }
  }
}
