import {
  Appointment,
  AppointmentStatus,
  CountryISO,
} from "../../src/domain/entities/appointment.entity";
import { marshall } from "@aws-sdk/util-dynamodb";

jest.mock("uuid", () => ({
  v4: () => "mocked-uuid",
}));

describe("Appointment Entity", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-01-01T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("constructor", () => {
    it("should create a new appointment with default values", () => {
      const appointment = new Appointment("12345", 100, CountryISO.PERU);

      expect(appointment.id).toBe("mocked-uuid");
      expect(appointment.insuredId).toBe("12345");
      expect(appointment.scheduleId).toBe(100);
      expect(appointment.countryISO).toBe(CountryISO.PERU);
      expect(appointment.status).toBe(AppointmentStatus.PENDING);
      expect(appointment.createdAt).toBe("2023-01-01T12:00:00.000Z");
      expect(appointment.updatedAt).toBe("2023-01-01T12:00:00.000Z");
    });

    it("should create a new appointment with provided values", () => {
      const appointment = new Appointment(
        "12345",
        100,
        CountryISO.CHILE,
        "test-id",
        AppointmentStatus.COMPLETED,
        "2023-01-01T10:00:00.000Z",
        "2023-01-01T11:00:00.000Z"
      );

      expect(appointment.id).toBe("test-id");
      expect(appointment.insuredId).toBe("12345");
      expect(appointment.scheduleId).toBe(100);
      expect(appointment.countryISO).toBe(CountryISO.CHILE);
      expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
      expect(appointment.createdAt).toBe("2023-01-01T10:00:00.000Z");
      expect(appointment.updatedAt).toBe("2023-01-01T11:00:00.000Z");
    });
  });

  describe("fromJSON", () => {
    it("should create an appointment from JSON object", () => {
      const json = {
        id: "test-id",
        insuredId: "12345",
        scheduleId: 100,
        countryISO: "PE",
        status: "COMPLETED",
        createdAt: "2023-01-01T10:00:00.000Z",
        updatedAt: "2023-01-01T11:00:00.000Z",
      };

      const appointment = Appointment.fromJSON(json);

      expect(appointment.id).toBe("test-id");
      expect(appointment.insuredId).toBe("12345");
      expect(appointment.scheduleId).toBe(100);
      expect(appointment.countryISO).toBe(CountryISO.PERU);
      expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
      expect(appointment.createdAt).toBe("2023-01-01T10:00:00.000Z");
      expect(appointment.updatedAt).toBe("2023-01-01T11:00:00.000Z");
    });
  });

  describe("toObject", () => {
    it("should convert appointment to plain object", () => {
      const appointment = new Appointment(
        "12345",
        100,
        CountryISO.PERU,
        "test-id",
        AppointmentStatus.COMPLETED,
        "2023-01-01T10:00:00.000Z",
        "2023-01-01T11:00:00.000Z"
      );

      const result = appointment.toObject();

      expect(result).toEqual({
        id: "test-id",
        insuredId: "12345",
        scheduleId: 100,
        countryISO: CountryISO.PERU,
        status: AppointmentStatus.COMPLETED,
        createdAt: "2023-01-01T10:00:00.000Z",
        updatedAt: "2023-01-01T11:00:00.000Z",
      });
    });
  });

  describe("toDynamoDBItem", () => {
    it("should convert appointment to DynamoDB item", () => {
      const appointment = new Appointment(
        "12345",
        100,
        CountryISO.PERU,
        "test-id",
        AppointmentStatus.COMPLETED,
        "2023-01-01T10:00:00.000Z",
        "2023-01-01T11:00:00.000Z"
      );

      const expectedObject = {
        id: "test-id",
        insuredId: "12345",
        scheduleId: 100,
        countryISO: CountryISO.PERU,
        status: AppointmentStatus.COMPLETED,
        createdAt: "2023-01-01T10:00:00.000Z",
        updatedAt: "2023-01-01T11:00:00.000Z",
      };

      const expected = marshall(expectedObject);
      const result = appointment.toDynamoDBItem();

      expect(result).toEqual(expected);
    });
  });

  describe("updateStatus", () => {
    it("should update status and updatedAt timestamp", () => {
      const appointment = new Appointment(
        "12345",
        100,
        CountryISO.PERU,
        "test-id",
        AppointmentStatus.PENDING,
        "2023-01-01T10:00:00.000Z",
        "2023-01-01T10:00:00.000Z"
      );

      appointment.updateStatus(AppointmentStatus.COMPLETED);

      expect(appointment.status).toBe(AppointmentStatus.COMPLETED);
      expect(appointment.updatedAt).toBe("2023-01-01T12:00:00.000Z");
    });
  });
});
