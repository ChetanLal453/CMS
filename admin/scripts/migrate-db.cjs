require('dotenv/config')

const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const { getDatabaseConfig } = require('./_db-config.cjs')

const migrationsDir = path.join(process.cwd(), 'src', 'migrations')

function readStatements(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8')
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
}

function getMigrationFiles() {
  return fs
    .readdirSync(migrationsDir)
    .filter((fileName) => fileName.toLowerCase().endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => path.join(migrationsDir, fileName))
}

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) AS count ' +
      'FROM information_schema.columns ' +
      'WHERE table_schema = DATABASE() ' +
      'AND table_name = ? ' +
      'AND column_name = ?',
    [tableName, columnName],
  )

  return Number(rows[0] && rows[0].count ? rows[0].count : 0) > 0
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) AS count ' +
      'FROM information_schema.tables ' +
      'WHERE table_schema = DATABASE() ' +
      'AND table_name = ?',
    [tableName],
  )

  return Number(rows[0] && rows[0].count ? rows[0].count : 0) > 0
}

function parseAlterTableAddColumns(statement) {
  const match = statement.match(/^ALTER\s+TABLE\s+([^\s]+)\s+([\s\S]+)$/i)
  if (!match) {
    return null
  }

  const tableName = match[1]
  const operationsRaw = match[2]
  const operations = operationsRaw
    .split(/,\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (!operations.every((item) => /^ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+/i.test(item))) {
    return null
  }

  return { tableName, operations }
}

function parseUpdateStatement(statement) {
  const match = statement.match(/^UPDATE\s+([^\s]+)\s+SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i)
  if (!match) {
    return null
  }

  return {
    tableName: match[1],
    setClause: match[2],
    whereClause: match[3],
  }
}

function extractReferencedColumns(segment) {
  const identifiers = new Set()
  const cleaned = segment
    .replace(/'[^']*'/g, ' ')
    .replace(/"[^"]*"/g, ' ')

  const matches = cleaned.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []
  const reserved = new Set([
    'UPDATE',
    'SET',
    'WHERE',
    'COALESCE',
    'NULL',
    'TRUE',
    'FALSE',
    'CURRENT_TIMESTAMP',
    'DEFAULT',
    'AND',
    'OR',
    'NOT',
    'ON',
    'IF',
    'EXISTS',
  ])

  for (const token of matches) {
    if (reserved.has(token.toUpperCase())) {
      continue
    }

    identifiers.add(token)
  }

  return [...identifiers]
}

async function executeCompatUpdate(connection, statement) {
  const parsed = parseUpdateStatement(statement)
  if (!parsed) {
    await connection.query(statement)
    return
  }

  if (!(await tableExists(connection, parsed.tableName))) {
    return
  }

  const referencedColumns = extractReferencedColumns(parsed.setClause + ' ' + parsed.whereClause)
  for (const columnName of referencedColumns) {
    if (!(await columnExists(connection, parsed.tableName, columnName))) {
      console.log(
        'SKIP legacy update for ' +
          parsed.tableName +
          ' because column "' +
          columnName +
          '" does not exist',
      )
      return
    }
  }

  await connection.query(statement)
}

async function executeCompatAlterTable(connection, statement) {
  const parsed = parseAlterTableAddColumns(statement)
  if (!parsed) {
    await executeCompatUpdate(connection, statement)
    return
  }

  for (const operation of parsed.operations) {
    const columnMatch = operation.match(/^ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+([^\s]+)\s+([\s\S]+)$/i)
    if (!columnMatch) {
      continue
    }

    const columnName = columnMatch[1]
    const definition = columnMatch[2]
    if (await columnExists(connection, parsed.tableName, columnName)) {
      continue
    }

    await connection.query('ALTER TABLE ' + parsed.tableName + ' ADD COLUMN ' + columnName + ' ' + definition)
  }
}

async function run() {
  const connection = await mysql.createConnection(
    getDatabaseConfig({
      multipleStatements: false,
    }),
  )

  try {
    const migrationFiles = getMigrationFiles()
    let executed = 0

    for (const migrationPath of migrationFiles) {
      const statements = readStatements(migrationPath)
      console.log('Running ' + statements.length + ' migration statements from ' + migrationPath)

      for (const [index, statement] of statements.entries()) {
        await executeCompatAlterTable(connection, statement)
        executed += 1
        console.log('OK ' + (index + 1) + '/' + statements.length + ': ' + statement.split('\n')[0])
      }
    }

    console.log('Schema migration completed successfully. Statements executed: ' + executed)
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  console.error('Schema migration failed.')
  console.error(error.message)
  process.exit(1)
})

