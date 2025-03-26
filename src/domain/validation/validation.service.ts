import { z } from "zod";

export class ValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super("Validation error");
    this.name = "ValidationError";
  }
}

export class ValidationService {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }
  }

  static formatZodError(error: z.ZodError): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    for (const err of error.errors) {
      const path = err.path.join(".");
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    }

    return formattedErrors;
  }
}
