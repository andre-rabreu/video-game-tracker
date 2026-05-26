import 'server-only';
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getRdsSecret } from './aws-secrets';

const DB_NAME = 'tracker_db';

let pool: Pool | null = null;
let inFlight: Promise<Pool> | null = null;

async function createPool(): Promise<Pool> {
  const { host, port, username, password } = await getRdsSecret();
  return mysql.createPool({
    host,
    port,
    user: username,
    password,
    database: DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    enableKeepAlive: true,
  });
}

export async function getPool(): Promise<Pool> {
  if (pool) return pool;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const created = await createPool();
      pool = created;
      return created;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

type SqlParam = string | number | boolean | null | Date | Buffer;

export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: SqlParam[]
): Promise<T> {
  const p = await getPool();
  const [rows] = await p.execute<T>(sql, params);
  return rows;
}
