import * as mysql from "mysql2/promise";
import { Appointment } from "../../domain/entities/appointment.entity";
import { IAppointmentRepository } from "../../domain/repositories/appointment.repository";
import { ConnectionPoolManager } from "../../utils/db-connection";

export abstract class MySQLAppointmentRepository
  implements IAppointmentRepository
{
  protected abstract getConnectionConfig(): mysql.ConnectionOptions;
  protected abstract getTableName(): string;
  protected abstract getPoolKey(): string;

  protected async getConnection(): Promise<mysql.PoolConnection> {
    const poolKey = this.getPoolKey();
    ConnectionPoolManager.getPool(poolKey, this.getConnectionConfig());
    return ConnectionPoolManager.getConnection(this.getPoolKey());
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const connection = await this.getConnection();
    const appointmentData = appointment.toObject();

    try {
      const [result] = await connection.execute(
        `INSERT INTO ${this.getTableName()} 
        (id, insured_id, schedule_id, country_iso, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          appointmentData.id,
          appointmentData.insuredId,
          appointmentData.scheduleId,
          appointmentData.countryISO,
          appointmentData.status,
          appointmentData.createdAt,
          appointmentData.updatedAt,
        ]
      );

      return appointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export class MySQLAppointmentRepositoryPE extends MySQLAppointmentRepository {
  protected getConnectionConfig(): mysql.ConnectionOptions {
    return {
      host: process.env.RDS_HOST_PE,
      user: process.env.RDS_USER_PE,
      password: process.env.RDS_PASSWORD_PE,
      database: process.env.RDS_DATABASE_PE,
    };
  }

  protected getTableName(): string {
    return "appointments";
  }

  protected getPoolKey(): string {
    return "PE";
  }
}

export class MySQLAppointmentRepositoryCL extends MySQLAppointmentRepository {
  protected getConnectionConfig(): mysql.ConnectionOptions {
    return {
      host: process.env.RDS_HOST_CL,
      user: process.env.RDS_USER_CL,
      password: process.env.RDS_PASSWORD_CL,
      database: process.env.RDS_DATABASE_CL,
    };
  }

  protected getTableName(): string {
    return "appointments";
  }

  protected getPoolKey(): string {
    return "CL";
  }
}
