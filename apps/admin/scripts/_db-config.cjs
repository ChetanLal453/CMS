require('dotenv/config')

function getDatabaseConfig(overrides = {}) {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '',
    database: process.env.DB_NAME || 'admin',
    ...overrides,
  }
}

module.exports = {
  getDatabaseConfig,
}
