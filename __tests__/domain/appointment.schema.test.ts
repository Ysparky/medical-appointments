import { z } from "zod";
import {
  appointmentCreateSchema,
  appointmentGetSchema,
} from "../../src/domain/schemas/appointment.schema";
import {
  AppointmentStatus,
  CountryISO,
} from "../../src/domain/entities/appointment.entity";

describe("Appointment Schemas", () => {
  describe("appointmentCreateSchema", () => {
    it("should validate valid appointment creation data", () => {
      const validData = {
        insuredId: "12345",
        scheduleId: 100,
        countryISO: "PE",
      };

      const result = appointmentCreateSchema.parse(validData);

      expect(result).toEqual({
        insuredId: "12345",
        scheduleId: 100,
        countryISO: CountryISO.PERU,
      });
    });

    it("should convert string scheduleId to number", () => {
      const data = {
        insuredId: "12345",
        scheduleId: "100",
        countryISO: "PE",
      };

      const result = appointmentCreateSchema.parse(data);

      expect(result.scheduleId).toBe(100);
      expect(typeof result.scheduleId).toBe("number");
    });

    it("should validate optional fields when provided", () => {
      const data = {
        insuredId: "12345",
        scheduleId: 100,
        countryISO: "CL",
        id: "123e4567-e89b-12d3-a456-426614174000",
        status: "COMPLETED",
        createdAt: "2023-01-01T10:00:00.000Z",
        updatedAt: "2023-01-01T11:00:00.000Z",
      };

      const result = appointmentCreateSchema.parse(data);

      expect(result).toEqual({
        insuredId: "12345",
        scheduleId: 100,
        countryISO: CountryISO.CHILE,
        id: "123e4567-e89b-12d3-a456-426614174000",
        status: AppointmentStatus.COMPLETED,
        createdAt: "2023-01-01T10:00:00.000Z",
        updatedAt: "2023-01-01T11:00:00.000Z",
      });
    });

    it("should reject invalid insuredId", () => {
      const invalidData = [
        { insuredId: "", scheduleId: 100, countryISO: "PE" },
        { insuredId: "123", scheduleId: 100, countryISO: "PE" },
        { insuredId: "1234A", scheduleId: 100, countryISO: "PE" },
        { insuredId: "123456", scheduleId: 100, countryISO: "PE" },
      ];

      invalidData.forEach((data) => {
        expect(() => appointmentCreateSchema.parse(data)).toThrow();
      });
    });

    it("should reject invalid scheduleId", () => {
      const invalidData = [
        { insuredId: "12345", scheduleId: 0, countryISO: "PE" },
        { insuredId: "12345", scheduleId: -1, countryISO: "PE" },
        { insuredId: "12345", scheduleId: 1.5, countryISO: "PE" },
      ];

      invalidData.forEach((data) => {
        expect(() => appointmentCreateSchema.parse(data)).toThrow();
      });
    });

    it("should reject invalid countryISO", () => {
      const invalidData = [
        { insuredId: "12345", scheduleId: 100, countryISO: "US" },
        { insuredId: "12345", scheduleId: 100, countryISO: "pe" },
        { insuredId: "12345", scheduleId: 100, countryISO: "" },
      ];

      invalidData.forEach((data) => {
        expect(() => appointmentCreateSchema.parse(data)).toThrow();
      });
    });
  });

  describe("appointmentGetSchema", () => {
    it("should validate valid appointment get data", () => {
      const validData = {
        insuredId: "12345",
      };

      const result = appointmentGetSchema.parse(validData);

      expect(result).toEqual({
        insuredId: "12345",
      });
    });

    it("should reject invalid insuredId", () => {
      const invalidData = [
        { insuredId: "" },
        { insuredId: "123" },
        { insuredId: "1234A" },
        { insuredId: "123456" },
      ];

      invalidData.forEach((data) => {
        expect(() => appointmentGetSchema.parse(data)).toThrow();
      });
    });
  });
});
