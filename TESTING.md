# Testing Strategy for Medical Appointments Challenge

This document outlines the testing strategy implemented for the Medical Appointments Challenge project, which follows Clean Architecture principles.

## Test Structure

The tests are organized to match the application's architecture:

```
__tests__/
├── domain/                 # Tests for domain entities, schemas, and validation
├── application/            # Tests for use cases
└── infrastructure/         # Tests for repositories, adapters, and Lambda handlers
```

## Testing Framework

- **Jest**: Primary testing framework
- **ts-jest**: TypeScript support for Jest
- **jest-mock-extended**: Mocking library for TypeScript interfaces

## Test Configuration

The Jest configuration is in `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/infrastructure/lambdas/**/*.ts",
  ],
  // ...
};
```

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate test coverage report
yarn test:coverage

# Run tests for specific layer
yarn test __tests__/domain
yarn test __tests__/application
yarn test __tests__/infrastructure
```

## Mocking Strategies

### Domain Layer

- **UUID Generation**: Mocked to provide consistent IDs for testing
- **Date/Time**: Used Jest's timer mocks to control timestamps

### Application Layer

- **Repositories**: Mocked using jest-mock-extended
- **Adapters**: Mocked using jest-mock-extended

### Infrastructure Layer

- **AWS SDK Clients**: Mocked with Jest manual mocks
- **DynamoDB Commands**: Mocked PutItemCommand, QueryCommand, UpdateItemCommand
- **Environment Variables**: Controlled for testing with process.env

## Test Examples

### Domain Layer Tests

1. **Entity Testing**: Verifying entity construction, serialization, and methods

   ```typescript
   describe("Appointment Entity", () => {
     it("should create a new appointment with default values", () => {
       const appointment = new Appointment("12345", 100, CountryISO.PERU);
       expect(appointment.id).toBeDefined();
       expect(appointment.status).toBe(AppointmentStatus.PENDING);
     });
   });
   ```

2. **Validation Testing**: Testing schema validation rules
   ```typescript
   describe("appointmentCreateSchema", () => {
     it("should validate valid appointment creation data", () => {
       const validData = {
         insuredId: "12345",
         scheduleId: 100,
         countryISO: "PE",
       };
       const result = appointmentCreateSchema.parse(validData);
       expect(result).toEqual(expect.objectContaining(validData));
     });
   });
   ```

### Application Layer Tests

1. **Use Case Testing**: Testing business logic in isolation

   ```typescript
   describe("CreateAppointmentUseCase", () => {
     const mockAppointmentRepository = mock<IAppointmentRepository>();
     const mockMessageQueueAdapter = mock<IMessageQueueAdapter>();
     const createAppointmentUseCase = new CreateAppointmentUseCase(
       mockAppointmentRepository,
       mockMessageQueueAdapter
     );

     it("should create an appointment and publish it to the message queue", async () => {
       // Test implementation
     });
   });
   ```

### Infrastructure Layer Tests

1. **Repository Testing**: Testing data access logic

   ```typescript
   describe("DynamoDBAppointmentRepository", () => {
     it("should create an appointment in DynamoDB", async () => {
       // Arrange
       const appointment = new Appointment("12345", 100, CountryISO.PERU);
       mockDynamoDBClient.send.mockResolvedValue({});

       // Act
       const result = await repository.create(appointment);

       // Assert
       expect(PutItemCommand).toHaveBeenCalledWith({
         TableName: "test-appointments",
         Item: appointment.toDynamoDBItem(),
       });
     });
   });
   ```

2. **Lambda Handler Testing**: Testing AWS Lambda handlers
   ```typescript
   describe("Appointment Lambda Handler", () => {
     it("should create an appointment successfully", async () => {
       // Test implementation
     });
   });
   ```

## Testing Challenges

1. **AWS SDK Mocking**: The AWS SDK presents challenges for mocking due to its modular structure and complex types. We used manual mocks to overcome these challenges.

2. **Lambda Context**: Testing Lambda handlers requires mocking the entire Lambda context, including events and AWS service interactions.

3. **Clean Architecture Boundaries**: Maintaining clean boundaries between layers in tests requires careful mocking of interfaces.

## Testing Best Practices

1. **Arrange-Act-Assert Pattern**: Tests follow the AAA pattern for clarity.

2. **Isolated Tests**: Each test runs in isolation without dependencies on other tests.

3. **Mock at Boundaries**: External dependencies are mocked at their boundaries.

4. **Test Error Handling**: Tests include error scenarios to ensure proper error handling.

5. **Consider Edge Cases**: Tests include edge cases such as empty arrays and invalid inputs.

## Future Improvements

1. **Integration Tests**: Add integration tests to verify the integration between different layers.

2. **E2E Tests**: Implement end-to-end tests using tools like AWS SAM or the Serverless Framework's testing capabilities.

3. **API Tests**: Add API tests using tools like Supertest or Postman.

4. **Property-Based Testing**: Consider adding property-based testing for complex validation logic.
