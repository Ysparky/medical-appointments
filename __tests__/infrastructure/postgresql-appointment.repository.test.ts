import {
  PostgreSQLAppointmentRepository,
  PostgreSQLAppointmentRepositoryPE,
  PostgreSQLAppointmentRepositoryCL,
} from '../../src/infrastructure/repositories/postgresql-appointment.repository';
import { Appointment, CountryISO } from '../../src/domain/entities/appointment.entity';
import { ConnectionPoolManager } from '../../src/utils/db-connection';

// Mock the ConnectionPoolManager
jest.mock('../../src/utils/db-connection', () => {
  return {
    ConnectionPoolManager: {
      getPool: jest.fn(),
      getConnection: jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn(),
      }),
    },
  };
});

describe('PostgreSQL Appointment Repositories', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      RDS_HOST_PE: 'pe-host',
      RDS_USER_PE: 'pe-user',
      RDS_PASSWORD_PE: 'pe-password',
      RDS_DATABASE_PE: 'pe-database',
      RDS_PORT_PE: '5432',
      RDS_SSL_PE: 'false',
      RDS_HOST_CL: 'cl-host',
      RDS_USER_CL: 'cl-user',
      RDS_PASSWORD_CL: 'cl-password',
      RDS_DATABASE_CL: 'cl-database',
      RDS_PORT_CL: '5432',
      RDS_SSL_CL: 'false',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('PostgreSQLAppointmentRepositoryPE', () => {
    let repository: PostgreSQLAppointmentRepositoryPE;

    beforeEach(() => {
      repository = new PostgreSQLAppointmentRepositoryPE();
    });

    it('should have correct connection configuration for Peru', () => {
      // Act
      const config = (repository as any).getConnectionConfig();

      // Assert
      expect(config).toEqual({
        host: 'pe-host',
        user: 'pe-user',
        password: 'pe-password',
        database: 'pe-database',
        port: 5432,
        ssl: false,
      });
    });

    it('should have correct table name', () => {
      // Act
      const tableName = (repository as any).getTableName();

      // Assert
      expect(tableName).toBe('appointments');
    });

    it('should have correct pool key', () => {
      // Act
      const poolKey = (repository as any).getPoolKey();

      // Assert
      expect(poolKey).toBe('PE');
    });

    it('should create an appointment in PostgreSQL database', async () => {
      // Arrange
      const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
      const mockConnection = await ConnectionPoolManager.getConnection('');
      (mockConnection.query as jest.Mock).mockResolvedValue({ rows: [] });

      // Act
      const result = await repository.create(appointment);

      // Assert
      expect(ConnectionPoolManager.getPool).toHaveBeenCalledWith('PE', expect.any(Object));
      expect(ConnectionPoolManager.getConnection).toHaveBeenCalledWith('PE');
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT INTO appointments (id, insured_id, schedule_id, created_at) VALUES ($1, $2, $3, $4)',
        [appointment.id, appointment.insuredId, appointment.scheduleId, appointment.createdAt],
      );
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toBe(appointment);
    });

    it('should handle database errors', async () => {
      // Arrange
      const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
      const mockConnection = await ConnectionPoolManager.getConnection('');
      const error = new Error('Database error');
      (mockConnection.query as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.create(appointment)).rejects.toThrow('Database error');
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should find appointments by insured ID', async () => {
      // Arrange
      const insuredId = '12345';
      const mockConnection = await ConnectionPoolManager.getConnection('');
      const mockRows = [
        {
          id: 'test-id-1',
          insured_id: insuredId,
          schedule_id: 100,
          created_at: new Date(),
        },
        {
          id: 'test-id-2',
          insured_id: insuredId,
          schedule_id: 101,
          created_at: new Date(),
        },
      ];
      (mockConnection.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      // Act
      const result = await repository.findAllByInsuredId(insuredId);

      // Assert
      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, insured_id, schedule_id, created_at FROM appointments WHERE insured_id = $1',
        [insuredId],
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('test-id-1');
      expect(result[0].insuredId).toBe(insuredId);
      expect(result[1].id).toBe('test-id-2');
      expect(result[1].insuredId).toBe(insuredId);
    });
  });

  describe('PostgreSQLAppointmentRepositoryCL', () => {
    let repository: PostgreSQLAppointmentRepositoryCL;

    beforeEach(() => {
      repository = new PostgreSQLAppointmentRepositoryCL();
    });

    it('should have correct connection configuration for Chile', () => {
      // Act
      const config = (repository as any).getConnectionConfig();

      // Assert
      expect(config).toEqual({
        host: 'cl-host',
        user: 'cl-user',
        password: 'cl-password',
        database: 'cl-database',
        port: 5432,
        ssl: false,
      });
    });

    it('should have correct table name', () => {
      // Act
      const tableName = (repository as any).getTableName();

      // Assert
      expect(tableName).toBe('appointments');
    });

    it('should have correct pool key', () => {
      // Act
      const poolKey = (repository as any).getPoolKey();

      // Assert
      expect(poolKey).toBe('CL');
    });

    it('should create an appointment in PostgreSQL database', async () => {
      // Arrange
      const appointment = new Appointment('12345', 100, CountryISO.CHILE, 'test-id');
      const mockConnection = await ConnectionPoolManager.getConnection('');
      (mockConnection.query as jest.Mock).mockResolvedValue({ rows: [] });

      // Act
      const result = await repository.create(appointment);

      // Assert
      expect(ConnectionPoolManager.getPool).toHaveBeenCalledWith('CL', expect.any(Object));
      expect(ConnectionPoolManager.getConnection).toHaveBeenCalledWith('CL');
      expect(mockConnection.query).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toBe(appointment);
    });
  });
});
