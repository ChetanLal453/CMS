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

const pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;
