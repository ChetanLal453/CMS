import { NextResponse } from 'next/server'
import pool from '../../../lib/db.js'
import { requireAdmin } from '../../../lib/require-admin.js'

function formatBytes(bytes) {
  const num = Number(bytes) || 0
  if (num === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(num) / Math.log(k))
  return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    // 1. Fetch all sites with real aggregated counts
    const [sites] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.domain,
        s.status,
        s.created_at,
        s.updated_at,
        COUNT(DISTINCT p.id) AS pages_count,
        SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) AS live_pages_count,
        SUM(CASE WHEN p.status != 'published' OR p.status IS NULL THEN 1 ELSE 0 END) AS draft_pages_count,
        MAX(p.updated_at) AS latest_page_updated_at
      FROM sites s
      LEFT JOIN pages p ON p.site_id = s.id
      GROUP BY s.id
      ORDER BY s.id ASC
    `)

    // 2. Fetch total leads from contact table
    let totalLeads = 0
    try {
      const [contactRows] = await pool.query('SELECT COUNT(*) AS count FROM contact')
      totalLeads = Number(contactRows[0]?.count || 0)
    } catch {
      totalLeads = 0
    }

    // 3. Fetch total storage used from media_library
    let totalStorageBytes = 0
    let totalMediaFiles = 0
    try {
      const [mediaRows] = await pool.query('SELECT SUM(size) AS total_size, COUNT(*) AS count FROM media_library')
      totalStorageBytes = Number(mediaRows[0]?.total_size || 0)
      totalMediaFiles = Number(mediaRows[0]?.count || 0)
    } catch {
      totalStorageBytes = 0
      totalMediaFiles = 0
    }

    const sitesWithMeta = sites.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      domain: s.domain || `${s.slug}.curvemetrics.com`,
      status: s.status || 'draft',
      pagesCount: Number(s.pages_count || 0),
      livePagesCount: Number(s.live_pages_count || 0),
      draftPagesCount: Number(s.draft_pages_count || 0),
      leadsCount: 0, // Per-site leads will count here once site_id is wired to contact
      lastEdited: s.latest_page_updated_at || s.updated_at || s.created_at,
    }))

    const totalWebsites = sites.length
    const liveWebsites = sites.filter((s) => s.status === 'live').length
    const draftWebsites = sites.filter((s) => s.status !== 'live').length

    return NextResponse.json({
      success: true,
      stats: {
        totalWebsites,
        liveWebsites,
        draftWebsites,
        totalLeads,
        totalMediaFiles,
        storageUsedBytes: totalStorageBytes,
        storageUsedFormatted: formatBytes(totalStorageBytes),
        storageLimitFormatted: '10 GB',
        systemHealth: '100% online',
      },
      sites: sitesWithMeta,
    })
  } catch (error) {
    console.error('API /api/sites GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const body = await request.json()
    const name = String(body.name || '').trim()
    let slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    const domain = String(body.domain || '').trim()

    if (!name) {
      return NextResponse.json({ success: false, error: 'Site name is required.' }, { status: 400 })
    }

    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    }

    // Insert new site
    const [result] = await pool.query(
      'INSERT INTO sites (name, slug, domain, status) VALUES (?, ?, ?, ?)',
      [name, slug, domain || null, 'draft']
    )

    const newSiteId = result.insertId

    // Automatically create default 'home' page for the new site
    await pool.query(
      `INSERT INTO pages (site_id, slug, title, name, status, layout)
       VALUES (?, 'home', 'Home', 'Home', 'draft', JSON_OBJECT('sections', JSON_ARRAY()))`,
      [newSiteId]
    )

    return NextResponse.json({
      success: true,
      site: {
        id: newSiteId,
        name,
        slug,
        domain,
        status: 'draft',
      },
    })
  } catch (error) {
    console.error('API /api/sites POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    )
  }
}
