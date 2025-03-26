import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

export enum AppointmentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export enum CountryISO {
  PERU = "PE",
  CHILE = "CL",
}

export interface IAppointment {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export class Appointment implements IAppointment {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;

  constructor(
    insuredId: string,
    scheduleId: number,
    countryISO: CountryISO,
    id?: string,
    status?: AppointmentStatus,
    createdAt?: string,
    updatedAt?: string
  ) {
    this.id = id ?? uuidv4();
    this.insuredId = insuredId;
    this.scheduleId = scheduleId;
    this.countryISO = countryISO;
    this.status = status ?? AppointmentStatus.PENDING;
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? new Date().toISOString();
  }

  static fromJSON(json: any): Appointment {
    return new Appointment(
      json.insuredId,
      json.scheduleId,
      json.countryISO as CountryISO,
      json.id,
      json.status as AppointmentStatus,
      json.createdAt,
      json.updatedAt
    );
  }

  toObject(): IAppointment {
    return {
      id: this.id,
      insuredId: this.insuredId,
      scheduleId: this.scheduleId,
      countryISO: this.countryISO,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toDynamoDBItem(): Record<string, AttributeValue> {
    return marshall(this.toObject());
  }

  updateStatus(status: AppointmentStatus): void {
    this.status = status;
    this.updatedAt = new Date().toISOString();
  }
}
