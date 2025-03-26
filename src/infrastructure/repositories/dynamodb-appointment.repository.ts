import { marshall } from "@aws-sdk/util-dynamodb";
import { Appointment } from "../../domain/entities/appointment.entity";
import { IAppointmentRepository } from "../../domain/repositories/appointment.repository";
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
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

  async processAppointment(appointment: Appointment): Promise<Appointment> {
    const params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: marshall({ id: appointment.id }),
      UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: marshall({
        ":status": appointment.status,
        ":updatedAt": appointment.updatedAt,
      }),
      ReturnValues: "UPDATED_NEW",
    };

    const result = await this.dynamoDBClient.send(
      new UpdateItemCommand(params)
    );
    console.log("Appointment updated:", result);
    return Appointment.fromJSON(result.Attributes);
  }
}
