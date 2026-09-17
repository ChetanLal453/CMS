import { NextResponse } from 'next/server'
import pool from '../../../lib/db.js'
import { requireAdmin } from '../../../lib/require-admin.js'
import { missingTableResponse, tableExists } from '../_utils/crud.js'

function normalizeBannerRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    component_name: null,
    preview_image: null,
    type: null,
    content: row.content || null,
    is_active: Boolean(row.is_active),
    created_at: row.created_at || null,
  }
}

export async function GET() {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('banners'))) {
      return missingTableResponse('banners')
    }

    const [rows] = await pool.execute(
      'SELECT id, slug, name, content, is_active, created_at FROM banners WHERE is_active = 1 ORDER BY id ASC',
    )

    return NextResponse.json({ success: true, banners: rows.map(normalizeBannerRow) })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 })
  }
}
