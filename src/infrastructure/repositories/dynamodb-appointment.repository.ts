import { Appointment } from "../../domain/entities/appointment.entity";
import { IAppointmentRepository } from "../../domain/repositories/appointment.repository";
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export class DynamoDBAppointmentRepository implements IAppointmentRepository {
  private readonly dynamoDBClient: DynamoDBClient;
  private readonly tableName: string;

  constructor() {
    this.dynamoDBClient = new DynamoDBClient();
    this.tableName = process.env.DYNAMODB_TABLE_NAME || "appointments";
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: appointment.toDynamoDBItem(),
    };
    await this.dynamoDBClient.send(new PutItemCommand(params));
    return appointment;
  }
}
