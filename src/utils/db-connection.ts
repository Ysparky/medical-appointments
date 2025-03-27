import { Pool, PoolClient } from 'pg';

const pools: Record<string, Pool> = {};

export class ConnectionPoolManager {
  public static getPool(key: string, config: any): Pool {
    if (!pools[key]) {
      pools[key] = new Pool({
        ...config,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      console.log(`Created new PostgreSQL connection pool for ${key}`);
    }

    return pools[key];
  }

  public static async getConnection(key: string): Promise<PoolClient> {
    const pool = pools[key];
    if (!pool) {
      throw new Error(`No pool exists for key: ${key}`);
    }

    try {
      return await pool.connect();
    } catch (error) {
      console.error(`Failed to get PostgreSQL connection for ${key}:`, error);
      throw error;
    }
  }

  public static async closePool(key: string): Promise<void> {
    const pool = pools[key];
    if (pool) {
      await pool.end();
      delete pools[key];
      console.log(`Closed and removed PostgreSQL pool for ${key}`);
    }
  }
}
