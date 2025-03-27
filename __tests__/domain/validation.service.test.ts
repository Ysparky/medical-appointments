import { z } from 'zod';
import { ValidationService, ValidationError } from '../../src/domain/validation/validation.service';

describe('ValidationService', () => {
  describe('validate', () => {
    const testSchema = z.object({
      name: z.string().min(2),
      age: z.number().int().positive(),
    });

    it('should successfully validate valid data', () => {
      const validData = { name: 'John', age: 30 };

      const result = ValidationService.validate(testSchema, validData);

      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for invalid data', () => {
      const invalidData = { name: 'J', age: -5 };

      try {
        ValidationService.validate(testSchema, invalidData);
        fail('Expected ValidationError but no error was thrown');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('Validation Error');
        expect(error.errors).toBeDefined();
      }
    });

    it('should rethrow other errors', () => {
      const schema = {
        parse: () => {
          throw new Error('Unexpected error');
        },
      } as unknown as z.ZodSchema;

      expect(() => {
        ValidationService.validate(schema, {});
      }).toThrow('Unexpected error');
    });
  });

  describe('formatZodError', () => {
    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        nested: z.object({
          value: z.number().positive(),
        }),
      });

      try {
        schema.parse({
          name: 'J',
          email: 'not-an-email',
          nested: {
            value: -1,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = ValidationService.formatZodError(error);

          expect(formatted).toEqual({
            name: ['String must contain at least 2 character(s)'],
            email: ['Invalid email'],
            'nested.value': ['Number must be greater than 0'],
          });
        }
      }
    });
  });
});
