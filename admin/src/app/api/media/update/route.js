import pool from '../../../../lib/db.js'
import { requireAdmin } from '../../../../lib/require-admin.js'

function normalizeMediaRow(row) {
  return {
    id: row.id,
    filename: row.filename || '',
    original_filename: row.original_filename || row.filename || '',
    url: row.url || '',
    type: row.type || '',
    size: Number(row.size || 0),
    alt: row.alt || '',
    tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
    uploaded_at: row.uploaded_at || null,
  }
}

export async function PUT(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const { id, alt, tags } = await request.json()

    if (!id) {
      return Response.json({ success: false, error: 'Media ID is required' }, { status: 400 })
    }

    await pool.execute(
      'UPDATE media_library SET alt = ?, tags = ?, updated_at = NOW() WHERE id = ?',
      [alt || null, JSON.stringify(tags || []), id],
    )

    const [rows] = await pool.execute(
      `SELECT
        id,
        COALESCE(filename, name) AS filename,
        COALESCE(original_filename, original_name, name) AS original_filename,
        url,
        type,
        size,
        alt,
        tags,
        uploaded_at
      FROM media_library
      WHERE id = ?`,
      [id],
    )

    if (rows.length === 0) {
      return Response.json({ success: false, error: 'Media not found' }, { status: 404 })
    }

    const media = normalizeMediaRow(rows[0])

    return Response.json({ success: true, media, message: 'Media updated successfully' })
  } catch (error) {
    console.error('Error updating media:', error)
    return Response.json({ success: false, error: 'Failed to update media' }, { status: 500 })
  }
}
