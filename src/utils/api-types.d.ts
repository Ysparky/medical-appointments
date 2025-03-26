// Define types for API input/output
export enum CountryISO {
  PERU = "PE",
  CHILE = "CL",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export interface Appointment {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateInput {
  insuredId: string;
  scheduleId: number;
  countryISO: CountryISO;
}

export interface AppointmentCreateOutput {
  message: string;
  data: Appointment;
}

export interface AppointmentGetInput {
  insuredId: string;
}

export interface AppointmentGetOutput {
  message: string;
  data: Appointment[];
}

export interface Error {
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}
