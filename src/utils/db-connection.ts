import * as mysql from 'mysql2/promise';

const pools: Record<string, mysql.Pool> = {};

export class ConnectionPoolManager {
  public static getPool(key: string, config: mysql.PoolOptions): mysql.Pool {
    if (!pools[key]) {
      pools[key] = mysql.createPool({
        ...config,
        connectionLimit: 10,
        queueLimit: 0,
        waitForConnections: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      console.log(`Created new connection pool for ${key}`);
    }

    return pools[key];
  }

  public static async getConnection(key: string): Promise<mysql.PoolConnection> {
    const pool = pools[key];
    if (!pool) {
      throw new Error(`No pool exists for key: ${key}`);
    }

    try {
      return await pool.getConnection();
    } catch (error) {
      console.error(`Failed to get connection for ${key}:`, error);
      throw error;
    }
  }

  public static async closePool(key: string): Promise<void> {
    const pool = pools[key];
    if (pool) {
      await pool.end();
      delete pools[key];
      console.log(`Closed and removed pool for ${key}`);
    }
  }
}
