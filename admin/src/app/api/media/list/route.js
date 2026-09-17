import { NextResponse } from 'next/server'
import pool from '../../../../lib/db.js'
import { requireAdmin } from '../../../../lib/require-admin.js'
import {
  databaseErrorResponse,
  missingTableResponse,
  parseJsonRows,
  parsePaginationParams,
  tableExists,
} from '../../_utils/crud.js'

function safeParseInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function normalizeMediaRow(row) {
  return {
    id: row.id,
    filename: row.filename || '',
    original_filename: row.original_filename || row.filename || '',
    url: row.url || '',
    alt: row.alt || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    uploaded_at: row.uploaded_at || null,
  }
}

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const pagination = parsePaginationParams(request, { defaultLimit: 50, maxLimit: 200 })
  const limit = pagination.limit ?? safeParseInteger(searchParams.get('limit'), 50)
  const offset = pagination.offset

  try {
    if (!(await tableExists('media_library'))) {
      return missingTableResponse('media_library')
    }

    let fromClause = `
      FROM media_library
      WHERE 1 = 1
    `
    const values = []

    if (search) {
      fromClause += ' AND (COALESCE(filename, name) LIKE ? OR COALESCE(original_filename, original_name, name) LIKE ? OR alt LIKE ?)'
      values.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${fromClause}`, values)

    let query = `
      SELECT
        id,
        COALESCE(filename, name) AS filename,
        COALESCE(original_filename, original_name, name) AS original_filename,
        url,
        alt,
        tags,
        uploaded_at
      ${fromClause}
    `

    query += ' ORDER BY uploaded_at DESC LIMIT ? OFFSET ?'
    values.push(Math.max(limit, 1), Math.max(offset, 0))

    const [rows] = await pool.query(query, values)
    const media = parseJsonRows(rows, ['tags']).map(normalizeMediaRow)

    return NextResponse.json({
      success: true,
      data: media,
      media,
      total: Number(countRows[0]?.total || 0),
      limit,
      offset,
    })
  } catch (error) {
    return databaseErrorResponse(error)
  }
}
