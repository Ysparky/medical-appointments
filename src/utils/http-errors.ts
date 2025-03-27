import { APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError, ValidationService } from '../domain/validation/validation.service';

// Helper function to check if an error is a ValidationError
export function isValidationError(error: unknown): error is ValidationError {
  return (
    error instanceof Error &&
    error.name === 'ValidationError' &&
    typeof (error as any).errors !== 'undefined'
  );
}

// Helper function to handle common error responses
export function createErrorResponse(error: unknown): APIGatewayProxyResult {
  if (isValidationError(error)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Validation Error',
        errors: ValidationService.formatZodError(error.errors),
      }),
    };
  } else if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid request body',
        error: 'Request body must be valid JSON',
      }),
    };
  }

  console.error('Error processing request:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }),
  };
}
