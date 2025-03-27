import { PoolConfig } from 'pg';
import {
  Appointment,
  AppointmentStatus,
  CountryISO,
} from '../../domain/entities/appointment.entity';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository';
import { ConnectionPoolManager } from '../../utils/db-connection';

export abstract class PostgreSQLAppointmentRepository implements IAppointmentRepository {
  protected abstract getConnectionConfig(): PoolConfig;
  protected abstract getTableName(): string;
  protected abstract getPoolKey(): string;

  protected async getConnection() {
    const poolKey = this.getPoolKey();
    ConnectionPoolManager.getPool(poolKey, this.getConnectionConfig());
    return ConnectionPoolManager.getConnection(this.getPoolKey());
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const client = await this.getConnection();
    const appointmentData = appointment.toObject();

    try {
      await client.query(
        `INSERT INTO ${this.getTableName()} (id, insured_id, schedule_id, created_at) VALUES ($1, $2, $3, $4)`,
        [
          appointmentData.id,
          appointmentData.insuredId,
          appointmentData.scheduleId,
          appointmentData.createdAt,
        ],
      );

      console.log(`Appointment saved to PostgreSQL (${this.getPoolKey()}):`, appointmentData.id);
      return appointment;
    } catch (error) {
      console.error('Error creating appointment in PostgreSQL:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async processAppointment(appointment: Appointment): Promise<Appointment> {
    // Since we're not tracking status in PostgreSQL, this is a no-op
    // But we return the appointment to satisfy the interface
    return appointment;
  }

  async findAllByInsuredId(insuredId: string): Promise<Appointment[]> {
    const client = await this.getConnection();

    try {
      const result = await client.query(
        `SELECT id, insured_id, schedule_id, created_at FROM ${this.getTableName()} WHERE insured_id = $1`,
        [insuredId],
      );

      return result.rows.map(
        row =>
          new Appointment(
            row.insured_id,
            row.schedule_id,
            this.getPoolKey() === 'PE' ? CountryISO.PERU : CountryISO.CHILE,
            row.id,
            AppointmentStatus.COMPLETED,
            row.created_at,
            row.created_at,
          ),
      );
    } catch (error) {
      console.error('Error finding appointments by insured ID in PostgreSQL:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export class PostgreSQLAppointmentRepositoryPE extends PostgreSQLAppointmentRepository {
  protected getConnectionConfig(): PoolConfig {
    return {
      host: process.env.RDS_HOST_PE,
      user: process.env.RDS_USER_PE,
      password: process.env.RDS_PASSWORD_PE,
      database: process.env.RDS_DATABASE_PE,
      port: parseInt(process.env.RDS_PORT_PE || '5432'),
      ssl: process.env.RDS_SSL_PE === 'true',
    };
  }

  protected getTableName(): string {
    return 'appointments_pe';
  }

  protected getPoolKey(): string {
    return 'PE';
  }
}

export class PostgreSQLAppointmentRepositoryCL extends PostgreSQLAppointmentRepository {
  protected getConnectionConfig(): PoolConfig {
    return {
      host: process.env.RDS_HOST_CL,
      user: process.env.RDS_USER_CL,
      password: process.env.RDS_PASSWORD_CL,
      database: process.env.RDS_DATABASE_CL,
      port: parseInt(process.env.RDS_PORT_CL || '5432'),
      ssl: process.env.RDS_SSL_CL === 'true',
    };
  }

  protected getTableName(): string {
    return 'appointments_cl';
  }

  protected getPoolKey(): string {
    return 'CL';
  }
}
