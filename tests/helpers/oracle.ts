type QueryBinds = Record<string, unknown> | unknown[];
type QueryRow = Record<string, unknown>;

type QueryResult<T> = {
  rows?: T[];
};

type OracleConnection = {
  execute: <T = QueryRow>(
    sql: string,
    binds?: QueryBinds,
    options?: Record<string, unknown>,
  ) => Promise<QueryResult<T>>;
  close: () => Promise<void>;
};

type OraclePool = {
  getConnection: () => Promise<OracleConnection>;
  close: (drainTime?: number) => Promise<void>;
};

type OracleDb = {
  OUT_FORMAT_OBJECT: number;
  outFormat: number;
  createPool: (options: {
    user: string;
    password: string;
    connectString: string;
    poolMin?: number;
    poolMax?: number;
  }) => Promise<OraclePool>;
};

const oracledb = require('oracledb') as OracleDb;

let pool: OraclePool | undefined;

export function isDbConfigured() {
  return Boolean(process.env.ORACLE_USER && process.env.ORACLE_PASSWORD && process.env.ORACLE_CONNECT_STRING);
}

export async function query<T = QueryRow>(sql: string, binds: QueryBinds = {}) {
  const connection = await getPool().then((dbPool) => dbPool.getConnection());

  try {
    const result = await connection.execute<T>(sql, binds);
    return result.rows ?? [];
  } finally {
    await connection.close();
  }
}

export async function queryOne<T = QueryRow>(sql: string, binds: QueryBinds = {}) {
  const rows = await query<T>(sql, binds);
  return rows[0];
}

export async function closeDb() {
  if (!pool) return;

  await pool.close(0);
  pool = undefined;
}

async function getPool() {
  if (pool) return pool;

  if (!isDbConfigured()) {
    throw new Error('Oracle DB env eksik: ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING');
  }

  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER!,
    password: process.env.ORACLE_PASSWORD!,
    connectString: process.env.ORACLE_CONNECT_STRING!,
    poolMin: 0,
    poolMax: Number(process.env.ORACLE_POOL_MAX ?? 5),
  });

  return pool;
}
