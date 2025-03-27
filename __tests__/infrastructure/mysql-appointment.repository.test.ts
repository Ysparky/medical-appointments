import {
  MySQLAppointmentRepository,
  MySQLAppointmentRepositoryPE,
  MySQLAppointmentRepositoryCL,
} from '../../src/infrastructure/repositories/mysql-appointment.repository';
import { Appointment, CountryISO } from '../../src/domain/entities/appointment.entity';
import { ConnectionPoolManager } from '../../src/utils/db-connection';

// Mock the ConnectionPoolManager
jest.mock('../../src/utils/db-connection', () => {
  return {
    ConnectionPoolManager: {
      getPool: jest.fn(),
      getConnection: jest.fn().mockResolvedValue({
        execute: jest.fn(),
        release: jest.fn(),
      }),
    },
  };
});

describe('MySQL Appointment Repositories', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      RDS_HOST_PE: 'pe-host',
      RDS_USER_PE: 'pe-user',
      RDS_PASSWORD_PE: 'pe-password',
      RDS_DATABASE_PE: 'pe-database',
      RDS_HOST_CL: 'cl-host',
      RDS_USER_CL: 'cl-user',
      RDS_PASSWORD_CL: 'cl-password',
      RDS_DATABASE_CL: 'cl-database',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('MySQLAppointmentRepositoryPE', () => {
    let repository: MySQLAppointmentRepositoryPE;

    beforeEach(() => {
      repository = new MySQLAppointmentRepositoryPE();
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

    it('should create an appointment in MySQL database', async () => {
      // Arrange
      const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
      const mockConnection = await ConnectionPoolManager.getConnection('');
      (mockConnection.execute as jest.Mock).mockResolvedValue([{ insertId: 1 }]);

      // Act
      const result = await repository.create(appointment);

      // Assert
      expect(ConnectionPoolManager.getPool).toHaveBeenCalledWith('PE', expect.any(Object));
      expect(ConnectionPoolManager.getConnection).toHaveBeenCalledWith('PE');
      expect(mockConnection.execute).toHaveBeenCalledWith(
        'INSERT INTO appointments (id, insured_id, schedule_id, country_iso, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          appointment.id,
          appointment.insuredId,
          appointment.scheduleId,
          appointment.countryISO,
          appointment.status,
          appointment.createdAt,
          appointment.updatedAt,
        ],
      );
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toBe(appointment);
    });

    it('should handle database errors', async () => {
      // Arrange
      const appointment = new Appointment('12345', 100, CountryISO.PERU, 'test-id');
      const mockConnection = await ConnectionPoolManager.getConnection('');
      const error = new Error('Database error');
      (mockConnection.execute as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.create(appointment)).rejects.toThrow('Database error');
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('MySQLAppointmentRepositoryCL', () => {
    let repository: MySQLAppointmentRepositoryCL;

    beforeEach(() => {
      repository = new MySQLAppointmentRepositoryCL();
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

    it('should create an appointment in MySQL database', async () => {
      // Arrange
      const appointment = new Appointment('12345', 100, CountryISO.CHILE, 'test-id');
      const mockConnection = await ConnectionPoolManager.getConnection('');
      (mockConnection.execute as jest.Mock).mockResolvedValue([{ insertId: 1 }]);

      // Act
      const result = await repository.create(appointment);

      // Assert
      expect(ConnectionPoolManager.getPool).toHaveBeenCalledWith('CL', expect.any(Object));
      expect(ConnectionPoolManager.getConnection).toHaveBeenCalledWith('CL');
      expect(mockConnection.execute).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toBe(appointment);
    });
  });
});
