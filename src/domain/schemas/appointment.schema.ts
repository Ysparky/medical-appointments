import { z } from 'zod';
import { AppointmentStatus, CountryISO } from '../entities/appointment.entity';

export const appointmentCreateSchema = z.object({
  insuredId: z
    .string()
    .min(1, 'Insured ID is required')
    .length(5, 'Insured ID must be 5 characters long')
    .regex(/^[0-9]+$/, 'Insured ID must be a 5-digit number'),
  scheduleId: z.coerce.number().int().positive('Schedule ID must be a positive integer'),
  countryISO: z.nativeEnum(CountryISO, {
    errorMap: () => ({ message: 'Country ISO must be PE or CL' }),
  }),
  id: z.string().uuid().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const appointmentGetSchema = z.object({
  insuredId: z
    .string()
    .min(1, 'Insured ID is required')
    .length(5, 'Insured ID must be 5 characters long')
    .regex(/^[0-9]+$/, 'Insured ID must be a 5-digit number'),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentGetInput = z.infer<typeof appointmentGetSchema>;
