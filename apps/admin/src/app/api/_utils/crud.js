import pool from '../../../lib/db.js'
import { requireAdmin } from '../../../lib/require-admin.js'

const columnCache = new Map()
let databaseNamePromise = null

async function getDatabaseName() {
  if (!databaseNamePromise) {
    databaseNamePromise = pool
      .execute('SELECT DATABASE() AS db_name')
      .then(([rows]) => rows[0]?.db_name || process.env.DB_NAME || 'admin')
      .catch(() => process.env.DB_NAME || 'admin')
  }

  return databaseNamePromise
}

export async function tableExists(tableName) {
  const databaseName = await getDatabaseName()
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [databaseName, tableName],
  )

  return Number(rows[0]?.count || 0) > 0
}

export async function getExistingColumns(tableName, requestedColumns = []) {
  if (!columnCache.has(tableName)) {
    const databaseName = await getDatabaseName()
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME AS column_name
       FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ?`,
      [databaseName, tableName],
    )

    columnCache.set(
      tableName,
      rows.map((row) => row.column_name),
    )
  }

  const columns = columnCache.get(tableName) || []
  if (!requestedColumns.length) {
    return columns
  }

  return requestedColumns.filter((column) => columns.includes(column))
}

export function invalidateColumnCache(tableName) {
  if (typeof tableName === 'string' && tableName.trim()) {
    columnCache.delete(tableName)
  }
}

export async function resolveOrderBy(tableName, orderBy = 'id DESC') {
  const availableColumns = await getExistingColumns(tableName)

  const resolvedParts = String(orderBy)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const [columnName] = part.split(/\s+/)
      return availableColumns.includes(columnName)
    })

  if (resolvedParts.length) {
    return resolvedParts.join(', ')
  }

  if (availableColumns.includes('created_at')) {
    return 'created_at DESC, id ASC'
  }

  return 'id ASC'
}

export function missingTableResponse(tableName) {
  return Response.json(
    {
      success: false,
      error: `Database table '${tableName}' is unavailable.`,
    },
    { status: 503 },
  )
}

export function missingColumnsResponse(tableName, columns) {
  return Response.json(
    {
      success: false,
      error: `Database columns unavailable on '${tableName}': ${columns.join(', ')}.`,
    },
    { status: 503 },
  )
}

export function databaseErrorResponse(error, message = 'Database error') {
  console.error('DB ERROR:', error)
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status: 500 },
  )
}

export function parseJsonValue(value, fallback = null) {
  if (value == null || value === '') {
    return fallback
  }

  if (typeof value === 'object' && !Buffer.isBuffer(value)) {
    return value
  }

  try {
    const raw = Buffer.isBuffer(value) ? value.toString('utf8') : value
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function parseJsonRow(row, jsonFields = []) {
  if (!row) {
    return row
  }

  const nextRow = { ...row }
  for (const field of jsonFields) {
    if (field in nextRow) {
      nextRow[field] = parseJsonValue(nextRow[field], null)
    }
  }
  return nextRow
}

export function parseJsonRows(rows, jsonFields = []) {
  return rows.map((row) => parseJsonRow(row, jsonFields))
}

export function pickDefined(body, allowedFields = []) {
  const payload = {}

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      payload[field] = body[field]
    }
  }

  return payload
}

export function normalizeBoolean(value) {
  if (value === true || value === false) {
    return value
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false
  }

  return value
}

export function parsePaginationParams(request, options = {}) {
  const { defaultLimit = null, maxLimit = 100 } = options
  const url = request?.url ? new URL(request.url) : null
  const limitParam = url?.searchParams.get('limit')
  const offsetParam = url?.searchParams.get('offset')
  const parsedLimit = limitParam == null ? defaultLimit : Number.parseInt(limitParam, 10)
  const parsedOffset = offsetParam == null ? 0 : Number.parseInt(offsetParam, 10)
  let limit =
    parsedLimit == null || Number.isNaN(parsedLimit) ? null : Math.min(Math.max(parsedLimit, 1), Math.max(maxLimit, 1))
  const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0)

  if (limit === null && offset > 0) {
    limit = Math.max(defaultLimit ?? maxLimit, 1)
  }

  return {
    limit,
    offset,
    applyPagination: limit !== null || offset > 0,
  }
}

function serializeValue(field, value, jsonFieldSet, booleanFieldSet) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (jsonFieldSet.has(field)) {
    return JSON.stringify(value)
  }

  if (booleanFieldSet.has(field)) {
    return normalizeBoolean(value)
  }

  return value
}

async function fetchRowById(tableName, id, selectColumns, jsonFields = []) {
  const existingColumns = await getExistingColumns(tableName, selectColumns)
  if (!existingColumns.length) {
    return null
  }

  const [rows] = await pool.execute(
    `SELECT ${existingColumns.join(', ')} FROM ${tableName} WHERE id = ? LIMIT 1`,
    [id],
  )

  return parseJsonRow(rows[0], jsonFields)
}

export function createCollectionHandlers(config) {
  const {
    tableName,
    listKey = 'items',
    itemKey = 'item',
    selectColumns = ['id'],
    createFields = [],
    requiredCreateFields = [],
    jsonFields = [],
    booleanFields = [],
    defaultCreateValues = {},
    orderBy = 'id DESC',
    buildCreatePayload,
    requireAdminForRead = false,
    requireAdminForWrite = false,
  } = config

  return {
    async GET(request) {
      try {
        if (requireAdminForRead) {
          const unauthorizedResponse = await requireAdmin()
          if (unauthorizedResponse) {
            return unauthorizedResponse
          }
        }

        if (!(await tableExists(tableName))) {
          return missingTableResponse(tableName)
        }

        const existingColumns = await getExistingColumns(tableName, selectColumns)
        if (!existingColumns.length) {
          return missingColumnsResponse(tableName, selectColumns)
        }

        const safeOrderBy = await resolveOrderBy(tableName, orderBy)
        const { limit, offset, applyPagination } = parsePaginationParams(request)
        const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM ${tableName}`)
        const queryParts = [`SELECT ${existingColumns.join(', ')} FROM ${tableName}`, `ORDER BY ${safeOrderBy}`]
        const values = []

        if (applyPagination && limit !== null) {
          queryParts.push('LIMIT ? OFFSET ?')
          values.push(limit, offset)
        }

        const [rows] = await pool.execute(queryParts.join(' '), values)

        const items = parseJsonRows(rows, jsonFields)
        return Response.json({
          success: true,
          [listKey]: items,
          items,
          total: Number(countRows[0]?.total || 0),
          limit: limit ?? items.length,
          offset,
        })
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error)
        return Response.json(
          {
            success: false,
            error: `Failed to fetch ${tableName}`,
          },
          { status: 500 },
        )
      }
    },

    async POST(request) {
      try {
        if (requireAdminForWrite) {
          const unauthorizedResponse = await requireAdmin()
          if (unauthorizedResponse) {
            return unauthorizedResponse
          }
        }

        if (!(await tableExists(tableName))) {
          return missingTableResponse(tableName)
        }

        const body = await request.json()
        const basePayload = {
          ...defaultCreateValues,
          ...pickDefined(body, createFields),
        }
        const payload = buildCreatePayload ? buildCreatePayload(basePayload, body) : basePayload

        for (const field of requiredCreateFields) {
          if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
            return Response.json(
              {
                success: false,
                error: `${field} is required`,
              },
              { status: 400 },
            )
          }
        }

        const existingColumns = await getExistingColumns(tableName, Object.keys(payload))
        const jsonFieldSet = new Set(jsonFields)
        const booleanFieldSet = new Set(booleanFields)
        const insertFields = existingColumns.filter((field) => payload[field] !== undefined)

        if (!insertFields.length) {
          return Response.json(
            {
              success: false,
              error: 'No valid fields provided',
            },
            { status: 400 },
          )
        }

        const values = insertFields.map((field) =>
          serializeValue(field, payload[field], jsonFieldSet, booleanFieldSet),
        )
        const placeholders = insertFields.map(() => '?').join(', ')

        const [result] = await pool.execute(
          `INSERT INTO ${tableName} (${insertFields.join(', ')}) VALUES (${placeholders})`,
          values,
        )

        const item = await fetchRowById(tableName, result.insertId, selectColumns, jsonFields)

        return Response.json(
          {
            success: true,
            [itemKey]: item,
            item,
          },
          { status: 201 },
        )
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error)
        return Response.json(
          {
            success: false,
            error: `Failed to create ${tableName.slice(0, -1) || tableName}`,
          },
          { status: 500 },
        )
      }
    },
  }
}

export function createItemHandlers(config) {
  const {
    tableName,
    itemKey = 'item',
    selectColumns = ['id'],
    updateFields = [],
    jsonFields = [],
    booleanFields = [],
    requireAdminForRead = false,
    requireAdminForWrite = false,
  } = config

  return {
    async GET(_request, { params }) {
      try {
        if (requireAdminForRead) {
          const unauthorizedResponse = await requireAdmin()
          if (unauthorizedResponse) {
            return unauthorizedResponse
          }
        }

        if (!(await tableExists(tableName))) {
          return missingTableResponse(tableName)
        }

        const id = Number.parseInt(params.id, 10)
        if (Number.isNaN(id)) {
          return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
        }

        const item = await fetchRowById(tableName, id, selectColumns, jsonFields)
        if (!item) {
          return Response.json({ success: false, error: 'Item not found' }, { status: 404 })
        }

        return Response.json({ success: true, [itemKey]: item, item })
      } catch (error) {
        console.error(`Error fetching ${tableName} item:`, error)
        return Response.json({ success: false, error: 'Failed to fetch item' }, { status: 500 })
      }
    },

    async PUT(request, { params }) {
      try {
        if (requireAdminForWrite) {
          const unauthorizedResponse = await requireAdmin()
          if (unauthorizedResponse) {
            return unauthorizedResponse
          }
        }

        if (!(await tableExists(tableName))) {
          return missingTableResponse(tableName)
        }

        const id = Number.parseInt(params.id, 10)
        if (Number.isNaN(id)) {
          return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
        }

        const body = await request.json()
        const payload = pickDefined(body, updateFields)
        const existingColumns = await getExistingColumns(tableName, Object.keys(payload))
        const jsonFieldSet = new Set(jsonFields)
        const booleanFieldSet = new Set(booleanFields)
        const updatePairs = existingColumns
          .filter((field) => payload[field] !== undefined)
          .map((field) => `${field} = ?`)

        if (!updatePairs.length) {
          return Response.json({ success: false, error: 'Nothing to update' }, { status: 400 })
        }

        const values = existingColumns
          .filter((field) => payload[field] !== undefined)
          .map((field) => serializeValue(field, payload[field], jsonFieldSet, booleanFieldSet))

        values.push(id)
        const [result] = await pool.execute(
          `UPDATE ${tableName} SET ${updatePairs.join(', ')} WHERE id = ?`,
          values,
        )

        if (!result.affectedRows) {
          return Response.json({ success: false, error: 'Item not found' }, { status: 404 })
        }

        const item = await fetchRowById(tableName, id, selectColumns, jsonFields)
        return Response.json({ success: true, [itemKey]: item, item })
      } catch (error) {
        console.error(`Error updating ${tableName} item:`, error)
        return Response.json({ success: false, error: 'Failed to update item' }, { status: 500 })
      }
    },

    async DELETE(_request, { params }) {
      try {
        if (requireAdminForWrite) {
          const unauthorizedResponse = await requireAdmin()
          if (unauthorizedResponse) {
            return unauthorizedResponse
          }
        }

        if (!(await tableExists(tableName))) {
          return missingTableResponse(tableName)
        }

        const id = Number.parseInt(params.id, 10)
        if (Number.isNaN(id)) {
          return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
        }

        const [result] = await pool.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id])
        if (!result.affectedRows) {
          return Response.json({ success: false, error: 'Item not found' }, { status: 404 })
        }

        return Response.json({ success: true })
      } catch (error) {
        console.error(`Error deleting ${tableName} item:`, error)
        return Response.json({ success: false, error: 'Failed to delete item' }, { status: 500 })
      }
    },
  }
}
