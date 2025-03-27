# Medical Appointments API Challenge

## Challenge Overview

This project implements a backend system for medical appointment scheduling for insured patients in Peru and Chile. The system allows users to schedule medical appointments by selecting a medical center, specialty, doctor, and date/time. The scheduling processing flow differs by country.

## Architecture

The application follows Clean Architecture principles, with a clear separation of:

- **Domain Layer**: Core business logic, entities, and rules
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Implementation details (AWS services, databases, etc.)

### AWS Services Used

The solution leverages the following AWS services:

- **API Gateway**: Exposes RESTful endpoints
- **Lambda**: Serverless functions for processing appointment requests
- **DynamoDB**: NoSQL database for storing appointment information
- **SNS**: Notification service for publishing appointment events
- **SQS**: Message queues for country-specific processing
- **EventBridge**: Event bus for handling completed appointments
- **RDS (MySQL)**: Relational database for country-specific appointment storage

## Project Structure

```
├── src/
│   ├── domain/            # Domain models, entities, repositories interfaces
│   ├── application/       # Use cases and application services
│   ├── infrastructure/    # Implementation details for AWS services
│   │   ├── lambdas/       # Lambda function implementations
│   │   ├── repositories/  # Repository implementations
│   │   ├── adapters/      # Adapters between layers
│   │   └── container/     # Dependency injection container
│   └── utils/             # Common utilities and helper functions
├── __tests__/             # Unit tests
│   ├── domain/            # Tests for domain layer components
│   ├── application/       # Tests for application layer use cases
│   └── infrastructure/    # Tests for infrastructure components
├── serverless.yml        # Infrastructure as code definition
├── package.json          # Project dependencies
├── jest.config.js        # Jest configuration for testing
├── LICENSE               # MIT License file
└── tsconfig.json         # TypeScript configuration
```

## Features

- **Appointment Creation**: Create new medical appointments
- **Appointment Retrieval**: Get all appointments for a specific insured ID
- **Country-Specific Processing**: Different processing flows for Peru (PE) and Chile (CL)
- **Asynchronous Processing**: Event-driven architecture for appointment completion
- **API Documentation**: OpenAPI/Swagger documentation

## Implementation Details

### API Endpoints

- **POST /appointment**: Create a new appointment

  - Input: `{insuredId: string, scheduleId: number, countryISO: string}`
  - Response: Appointment creation confirmation with status "pending"

- **GET /appointment?insuredId=<id>**: Retrieve appointments for a specific insured ID
  - Response: List of appointments with their statuses

### Data Flow

1. Client sends appointment request to API Gateway
2. `appointment` Lambda stores the request in DynamoDB with "pending" status
3. `appointment` Lambda sends the request to SNS with country-specific attributes
4. SNS filters messages by country code and routes to appropriate SQS queue
5. Country-specific Lambdas (`appointment_pe` or `appointment_cl`) process the messages
6. Country Lambdas store data in MySQL RDS and send completion event to EventBridge
7. EventBridge routes the completion event to a dedicated SQS queue
8. `appointment` Lambda processes the completion message and updates DynamoDB status to "completed"

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- AWS CLI configured with appropriate permissions
- Serverless Framework

### Installation

```bash
# Clone the repository
git clone https://github.com/Ysparky/medical-appointments.git
cd medical-appointments

# Install dependencies
yarn install
```

### Deployment

```bash
# Deploy to AWS (dev stage)
yarn deploy

# Package the service
yarn package
```

### Local Development

```bash
# Install serverless-offline plugin
yarn add --dev serverless-offline

# Start the service locally
serverless offline start
```

## Testing

The project uses Jest for unit testing. The tests are organized to match the application's architecture, with separate test folders for domain, application, and infrastructure layers.

```bash
# Run all tests
yarn test

# Run tests with watch mode
yarn test:watch

# Generate test coverage report
yarn test:coverage
```

### Test Structure

- **Domain Layer Tests**: Tests for entities, validation, and repository interfaces
- **Application Layer Tests**: Tests for use cases and application services
- **Infrastructure Layer Tests**: Tests for repositories, adapters, and Lambda handlers

### Mocking Strategies

- **AWS SDK Mocks**: Tests for infrastructure components mock AWS service clients
- **Repository Mocks**: Application layer tests use mocked repositories
- **Time Manipulation**: Tests use Jest's timer mocks to control timestamps

### Coverage Report

To view the test coverage report, run:

```bash
yarn test:coverage
```

This will generate a coverage report in the `coverage` directory.

## API Testing

The API can be tested using tools like Postman or curl:

```bash
# Create a new appointment
curl -X POST https://ndb5xw6gyk.execute-api.us-east-1.amazonaws.com/dev/appointment \
  -H "Content-Type: application/json" \
  -d '{"insuredId": "12345", "scheduleId": 100, "countryISO": "PE"}'

# Get appointments for an insured ID
curl -X GET https://ndb5xw6gyk.execute-api.us-east-1.amazonaws.com/dev/appointment?insuredId=12345
```

## API Documentation

Swagger documentation is available at:

```
https://ndb5xw6gyk.execute-api.us-east-1.amazonaws.com/dev/docs
```

## Implementation Checklist

- [x] Project setup with Serverless Framework
- [x] TypeScript configuration
- [x] Domain layer implementation
  - [x] Entity models
  - [x] Repository interfaces
  - [x] Validation schemas
- [x] Application layer implementation
  - [x] Use cases
- [x] Infrastructure layer implementation
  - [x] Lambda functions
  - [x] Repository implementations
  - [x] Adapters
- [x] AWS services configuration
  - [x] DynamoDB
  - [x] SNS
  - [x] SQS
  - [x] EventBridge
- [x] API endpoints
  - [x] POST /appointment
  - [x] GET /appointment
- [x] OpenAPI/Swagger documentation
- [x] Unit tests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
