import pool from '../../../lib/db.js'
import { requireAdmin } from '../../../lib/require-admin.js'
import {
  getExistingColumns,
  missingTableResponse,
  pickDefined,
  tableExists,
} from '../_utils/crud.js'

const TABLE_NAME = 'site_settings'
const SELECT_COLUMNS = [
  'id',
  'site_name',
  'site_url',
  'logo',
  'logo_dark',
  'favicon',
  'primary_color',
  'secondary_color',
  'heading_font',
  'body_font',
  'google_analytics_id',
  'facebook_pixel_id',
  'contact_email',
  'contact_phone',
  'address',
  'meta_description',
  'whatsapp_number',
  'instagram_url',
  'linkedin_url',
  'twitter_url',
  'facebook_url',
  'youtube_url',
  'custom_css',
  'custom_js',
  'robots_txt',
  'created_at',
  'updated_at',
]

async function getOrCreateSettingsRow() {
  const [rows] = await pool.execute(`SELECT id FROM ${TABLE_NAME} ORDER BY id ASC LIMIT 1`)
  if (rows.length) {
    return rows[0].id
  }

  const [result] = await pool.execute(`INSERT INTO ${TABLE_NAME} () VALUES ()`)
  return result.insertId
}

export async function GET() {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const id = await getOrCreateSettingsRow()
    const columns = await getExistingColumns(TABLE_NAME, SELECT_COLUMNS)
    const [rows] = await pool.execute(
      `SELECT ${columns.join(', ')} FROM ${TABLE_NAME} WHERE id = ? LIMIT 1`,
      [id],
    )

    return Response.json({ success: true, settings: rows[0] || null, item: rows[0] || null })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return Response.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const id = await getOrCreateSettingsRow()
    const body = await request.json()
    const payload = pickDefined(body, SELECT_COLUMNS.filter((column) => column !== 'id'))
    const columns = await getExistingColumns(TABLE_NAME, Object.keys(payload))
    const updates = columns.map((column) => `${column} = ?`)

    if (!updates.length) {
      return Response.json({ success: false, error: 'Nothing to update' }, { status: 400 })
    }

    const values = columns.map((column) => payload[column])
    values.push(id)

    await pool.execute(`UPDATE ${TABLE_NAME} SET ${updates.join(', ')} WHERE id = ?`, values)

    const selectColumns = await getExistingColumns(TABLE_NAME, SELECT_COLUMNS)
    const [rows] = await pool.execute(
      `SELECT ${selectColumns.join(', ')} FROM ${TABLE_NAME} WHERE id = ? LIMIT 1`,
      [id],
    )

    return Response.json({ success: true, settings: rows[0], item: rows[0] })
  } catch (error) {
    console.error('Error updating settings:', error)
    return Response.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}

export const POST = PUT
