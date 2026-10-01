import mysql from 'mysql2/promise';

function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '',
    database: process.env.DB_NAME || 'admin',
  };
}

/**
 * Global singleton pattern for MySQL connection pool in Next.js.
 * In development, Next.js rebuilds modules frequently during Fast Refresh.
 * Without attaching the pool to globalThis, each reload instantiates a new pool,
 * leading to connection accumulation and "Too many connections" (ER_CON_COUNT_ERROR).
 */
const globalForDb = globalThis;

if (!globalForDb.__mysqlPool) {
  globalForDb.__mysqlPool = mysql.createPool({
    ...getDatabaseConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 30000, // Automatically close idle connections after 30s
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });
}

const pool = globalForDb.__mysqlPool;

export default pool;
