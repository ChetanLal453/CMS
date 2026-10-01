import pool from '../db.js'
import { getExistingColumns, parseJsonValue, tableExists } from '../../app/api/_utils/crud.js'

function normalizeRevisionRow(row) {
  if (!row) {
    return null
  }

  return {
    ...row,
    layout_json: parseJsonValue(row.layout_json ?? row.layout, null),
  }
}

export async function revisionsTableReady() {
  if (!(await tableExists('page_revisions'))) {
    return false
  }

  const columns = await getExistingColumns('page_revisions')
  return columns.includes('page_id') && columns.includes('layout_json')
}

export async function getRevisionById(revisionId, connection = pool) {
  if (!(await revisionsTableReady())) {
    return null
  }

  const [rows] = await connection.query(
    `SELECT id, page_id, revision_number, revision_type, layout_json, created_by, created_at
     FROM page_revisions
     WHERE id = ?
     LIMIT 1`,
    [revisionId],
  )

  return normalizeRevisionRow(rows[0] || null)
}

export async function getNextRevisionNumber(pageId, connection = pool) {
  if (!(await revisionsTableReady())) {
    return 1
  }

  const [rows] = await connection.query(
    'SELECT COALESCE(MAX(revision_number), 0) + 1 AS next_revision_number FROM page_revisions WHERE page_id = ? FOR UPDATE',
    [pageId],
  )

  return Number(rows[0]?.next_revision_number || 1)
}

export async function listRevisionsForPage(pageId, connection = pool, { limit = 50, offset = 0 } = {}) {
  if (!(await revisionsTableReady())) {
    return []
  }

  const safeLimit = Math.max(1, Number(limit) || 50)
  const safeOffset = Math.max(0, Number(offset) || 0)
  const [rows] = await connection.query(
    `SELECT id, page_id, revision_number, revision_type, layout_json, created_by, created_at
     FROM page_revisions
     WHERE page_id = ?
     ORDER BY revision_number DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [pageId, safeLimit, safeOffset],
  )

  return rows.map(normalizeRevisionRow)
}

export async function countRevisionsForPage(pageId, connection = pool) {
  if (!(await revisionsTableReady())) {
    return 0
  }

  const [rows] = await connection.query(
    'SELECT COUNT(*) AS total FROM page_revisions WHERE page_id = ?',
    [pageId],
  )

  return Number(rows[0]?.total || 0)
}

export async function createRevision(
  {
    pageId,
    revisionNumber,
    revisionType,
    layoutJson,
    createdBy = null,
  },
  connection = pool,
) {
  if (!(await revisionsTableReady())) {
    return null
  }

  let finalRevNum = revisionNumber || (await getNextRevisionNumber(pageId, connection))

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [result] = await connection.query(
        `INSERT INTO page_revisions (
          page_id,
          revision_number,
          revision_type,
          layout_json,
          created_by,
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [pageId, finalRevNum, revisionType, JSON.stringify(layoutJson), createdBy],
      )

      return getRevisionById(result.insertId, connection)
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && attempt < 2) {
        finalRevNum = await getNextRevisionNumber(pageId, connection)
        continue
      }
      throw err
    }
  }
}
