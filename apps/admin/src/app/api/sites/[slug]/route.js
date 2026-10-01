import { NextResponse } from 'next/server'
import pool from '../../../../lib/db.js'
import { requireAdmin } from '../../../../lib/require-admin.js'

export async function GET(request, context) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { slug } = await context.params

  try {
    // 1. Fetch site
    const [siteRows] = await pool.query(
      'SELECT id, name, slug, domain, status, created_at, updated_at FROM sites WHERE slug = ? LIMIT 1',
      [slug]
    )

    if (siteRows.length === 0) {
      return NextResponse.json(
        { success: false, error: `Site with slug "${slug}" not found` },
        { status: 404 }
      )
    }

    const site = siteRows[0]
    const siteId = site.id

    // 2. Fetch pages for this site
    const [pages] = await pool.query(
      `SELECT id, slug, title, status, meta_title, meta_description, disabled, updated_at
       FROM pages
       WHERE site_id = ?
       ORDER BY (slug = 'home') DESC, id ASC`,
      [siteId]
    )

    // Format display title and path
    const formattedPages = pages.map((p) => {
      const displayTitle =
        p.title && p.title.trim().length > 0
          ? p.title.trim()
          : p.slug.charAt(0).toUpperCase() + p.slug.slice(1).replace(/-/g, ' ')
      const path = p.slug === 'home' ? '/' : `/${p.slug}`
      return {
        id: p.id,
        slug: p.slug,
        title: displayTitle,
        path,
        status: p.status || 'draft',
        metaTitle: p.meta_title || `${displayTitle} | ${site.name}`,
        metaDescription: p.meta_description || `Welcome to ${site.name}`,
        disabled: Boolean(p.disabled),
        updatedAt: p.updated_at,
      }
    })

    // 3. Fetch media library items
    let mediaItems = []
    try {
      const [mediaRows] = await pool.query(
        'SELECT id, filename, original_name, url, size, type, updated_at FROM media_library ORDER BY id DESC LIMIT 50'
      )
      mediaItems = mediaRows
    } catch (e) {
      console.warn('Error fetching media:', e.message)
    }

    // 4. Fetch layout & theme settings
    let header = null
    let footer = null
    let siteSettings = null

    try {
      const [headerRows] = await pool.query(
        'SELECT id, slug, name, component_name, is_active FROM headers WHERE is_active = 1 LIMIT 1'
      )
      header = headerRows[0] || null
    } catch {}

    try {
      const [footerRows] = await pool.query(
        'SELECT id, slug, name, copyright, bg_color, settings, is_active FROM footers WHERE is_active = 1 LIMIT 1'
      )
      footer = footerRows[0] || null
    } catch {}

    try {
      const [settingRows] = await pool.query(
        'SELECT * FROM site_settings WHERE site_id = ? LIMIT 1',
        [siteId]
      )
      if (settingRows.length > 0) {
        siteSettings = settingRows[0]
      } else {
        const [fallbackSettings] = await pool.query('SELECT * FROM site_settings LIMIT 1')
        siteSettings = fallbackSettings[0] || null
      }
    } catch {}

    // 5. Fetch leads for this site
    let leads = []
    try {
      const [leadRows] = await pool.query(
        `SELECT id, name, phone, email, subject, message, status, created_at
         FROM contact
         WHERE site_id = ? OR site_id IS NULL
         ORDER BY id DESC LIMIT 100`,
        [siteId]
      )
      leads = leadRows.map((l) => ({
        id: l.id,
        name: l.name || 'Anonymous',
        phone: l.phone || '—',
        email: l.email || '—',
        service: l.subject || 'General Inquiry',
        message: l.message || '',
        status: l.status || 'new',
        createdAt: l.created_at,
      }))
    } catch (e) {
      console.warn('Error fetching leads:', e.message)
    }

    // 6. Fetch backups / version history from page_revisions
    let revisions = []
    try {
      const [revisionRows] = await pool.query(
        `SELECT r.id, r.page_id, r.revision_number, r.revision_type, r.created_by, r.created_at, p.slug AS page_slug
         FROM page_revisions r
         JOIN pages p ON p.id = r.page_id
         WHERE p.site_id = ?
         ORDER BY r.id DESC
         LIMIT 10`,
        [siteId]
      )
      revisions = revisionRows.map((r) => ({
        id: r.id,
        pageId: r.page_id,
        pageSlug: r.page_slug,
        revisionNumber: r.revision_number,
        type: r.revision_type,
        createdBy: r.created_by || 'Developer',
        createdAt: r.created_at,
      }))
    } catch (e) {
      console.warn('Error fetching revisions:', e.message)
    }

    return NextResponse.json({
      success: true,
      site: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        domain: site.domain || `${site.slug}.curvemetrics.com`,
        status: site.status || 'draft',
        createdAt: site.created_at,
        updatedAt: site.updated_at,
      },
      pages: formattedPages,
      media: mediaItems,
      theme: {
        header: header || { name: 'Default Header', component_name: 'Header' },
        footer: footer || { name: 'Default Footer', copyright: `© ${new Date().getFullYear()} ${site.name}` },
        colors: {
          primary: siteSettings?.primary_color || '#378ADD',
          secondary: siteSettings?.secondary_color || '#639922',
        },
        typography: {
          headingFont: siteSettings?.heading_font || 'Inter',
          bodyFont: siteSettings?.body_font || 'Inter',
        },
        contactEmail: siteSettings?.contact_email || 'hello@' + (site.domain || `${site.slug}.com`),
        analytics: {
          googleAnalyticsId: siteSettings?.google_analytics_id || '',
          facebookPixelId: siteSettings?.facebook_pixel_id || '',
        },
      },
      leads,
      revisions,
    })
  } catch (error) {
    console.error('API /api/sites/[slug] GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    )
  }
}

export async function PUT(request, context) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { slug } = await context.params

  try {
    const body = await request.json()
    const { name, domain, status } = body

    const updates = []
    const params = []

    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name.trim())
    }
    if (domain !== undefined) {
      updates.push('domain = ?')
      params.push(domain.trim())
    }
    if (status !== undefined) {
      if (!['live', 'draft'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Status must be "live" or "draft"' },
          { status: 400 }
        )
      }
      updates.push('status = ?')
      params.push(status)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, message: 'No updates provided' })
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(slug)

    const [result] = await pool.query(
      `UPDATE sites SET ${updates.join(', ')} WHERE slug = ?`,
      params
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: `Site with slug "${slug}" not found` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Site updated successfully',
    })
  } catch (error) {
    console.error('API /api/sites/[slug] PUT error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    )
  }
}

export async function POST(request, context) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { slug } = await context.params

  try {
    const [siteRows] = await pool.query(
      'SELECT id, name, slug, domain FROM sites WHERE slug = ? LIMIT 1',
      [slug]
    )

    if (siteRows.length === 0) {
      return NextResponse.json(
        { success: false, error: `Site with slug "${slug}" not found` },
        { status: 404 }
      )
    }

    const site = siteRows[0]
    const siteId = site.id
    const body = await request.json()
    const { action } = body

    if (action === 'create_page') {
      const pageTitle = (body.title || '').trim()
      let pageSlug = (body.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      if (!pageSlug) {
        pageSlug = pageTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      }
      if (!pageSlug) {
        return NextResponse.json(
          { success: false, error: 'Page title or slug is required' },
          { status: 400 }
        )
      }

      // Check duplicate slug for this site
      const [existing] = await pool.query(
        'SELECT id FROM pages WHERE site_id = ? AND slug = ? LIMIT 1',
        [siteId, pageSlug]
      )
      if (existing.length > 0) {
        pageSlug = `${pageSlug}-${Date.now().toString().slice(-4)}`
      }

      const [insertResult] = await pool.query(
        `INSERT INTO pages (site_id, slug, title, name, status, meta_title, meta_description, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'draft', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [siteId, pageSlug, pageTitle || pageSlug, pageTitle || pageSlug, pageTitle, `Discover ${pageTitle} on ${site.name}`]
      )

      return NextResponse.json({
        success: true,
        message: 'Page created successfully',
        pageId: insertResult.insertId,
        slug: pageSlug,
      })
    }

    if (action === 'duplicate_page') {
      const { pageId } = body
      if (!pageId) {
        return NextResponse.json(
          { success: false, error: 'pageId is required' },
          { status: 400 }
        )
      }

      const [sourcePageRows] = await pool.query(
        'SELECT * FROM pages WHERE id = ? AND site_id = ? LIMIT 1',
        [pageId, siteId]
      )
      if (sourcePageRows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Source page not found' },
          { status: 404 }
        )
      }

      const src = sourcePageRows[0]
      const newSlug = `${src.slug}-copy-${Date.now().toString().slice(-4)}`
      const newTitle = src.title ? `${src.title} (Copy)` : `${src.slug} (Copy)`

      const [newResult] = await pool.query(
        `INSERT INTO pages (site_id, slug, title, name, status, meta_title, meta_description, content, settings, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [siteId, newSlug, newTitle, newTitle, newTitle, src.meta_description, src.content, src.settings]
      )

      const newPageId = newResult.insertId

      // Copy latest revision if exists
      const [revRows] = await pool.query(
        'SELECT layout_json FROM page_revisions WHERE page_id = ? ORDER BY id DESC LIMIT 1',
        [pageId]
      )
      if (revRows.length > 0) {
        await pool.query(
          `INSERT INTO page_revisions (page_id, revision_number, revision_type, layout_json, created_by, created_at)
           VALUES (?, 1, 'draft', ?, 'admin', CURRENT_TIMESTAMP)`,
          [newPageId, JSON.stringify(revRows[0].layout_json)]
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Page duplicated successfully',
        newPageId,
        newSlug,
      })
    }

    if (action === 'delete_page') {
      const { pageId } = body
      if (!pageId) {
        return NextResponse.json(
          { success: false, error: 'pageId is required' },
          { status: 400 }
        )
      }

      const [pageRows] = await pool.query(
        'SELECT slug FROM pages WHERE id = ? AND site_id = ? LIMIT 1',
        [pageId, siteId]
      )
      if (pageRows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Page not found' },
          { status: 404 }
        )
      }

      if (pageRows[0].slug === 'home') {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the Home page' },
          { status: 400 }
        )
      }

      // Delete revisions first
      await pool.query('DELETE FROM page_revisions WHERE page_id = ?', [pageId])
      // Delete page
      await pool.query('DELETE FROM pages WHERE id = ?', [pageId])

      return NextResponse.json({
        success: true,
        message: 'Page deleted successfully',
      })
    }

    if (action === 'update_seo') {
      const { pageId, metaTitle, metaDescription, disabled } = body
      if (!pageId) {
        return NextResponse.json(
          { success: false, error: 'pageId is required' },
          { status: 400 }
        )
      }

      await pool.query(
        `UPDATE pages 
         SET meta_title = ?, seo_title = ?, meta_description = ?, seo_description = ?, disabled = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND site_id = ?`,
        [metaTitle || null, metaTitle || null, metaDescription || null, metaDescription || null, disabled ? 1 : 0, pageId, siteId]
      )

      return NextResponse.json({
        success: true,
        message: 'SEO settings updated successfully',
      })
    }

    if (action === 'update_theme') {
      const { primaryColor, secondaryColor, headingFont, bodyFont } = body

      // Check if site_settings exists for this site
      const [existing] = await pool.query(
        'SELECT id FROM site_settings WHERE site_id = ? LIMIT 1',
        [siteId]
      )

      if (existing.length > 0) {
        await pool.query(
          `UPDATE site_settings
           SET primary_color = COALESCE(?, primary_color),
               secondary_color = COALESCE(?, secondary_color),
               heading_font = COALESCE(?, heading_font),
               body_font = COALESCE(?, body_font),
               updated_at = CURRENT_TIMESTAMP
           WHERE site_id = ?`,
          [primaryColor || null, secondaryColor || null, headingFont || null, bodyFont || null, siteId]
        )
      } else {
        await pool.query(
          `INSERT INTO site_settings (site_id, primary_color, secondary_color, heading_font, body_font, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [siteId, primaryColor || '#378ADD', secondaryColor || '#639922', headingFont || 'Inter', bodyFont || 'Inter']
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Theme settings updated successfully',
      })
    }

    if (action === 'restore_revision') {
      const { revisionId } = body
      if (!revisionId) {
        return NextResponse.json(
          { success: false, error: 'revisionId is required' },
          { status: 400 }
        )
      }

      const [targetRev] = await pool.query(
        `SELECT r.page_id, r.layout_json, p.slug
         FROM page_revisions r
         JOIN pages p ON p.id = r.page_id
         WHERE r.id = ? AND p.site_id = ? LIMIT 1`,
        [revisionId, siteId]
      )

      if (targetRev.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Revision not found' },
          { status: 404 }
        )
      }

      const { page_id: pageId, layout_json: layoutJson } = targetRev[0]

      // Find max revision_number
      const [maxRev] = await pool.query(
        'SELECT MAX(revision_number) AS max_rev FROM page_revisions WHERE page_id = ?',
        [pageId]
      )
      const nextRevNum = (Number(maxRev[0]?.max_rev) || 0) + 1

      // Insert new restore revision
      await pool.query(
        `INSERT INTO page_revisions (page_id, revision_number, revision_type, layout_json, created_by, created_at)
         VALUES (?, ?, 'restore', ?, 'admin', CURRENT_TIMESTAMP)`,
        [pageId, nextRevNum, JSON.stringify(layoutJson)]
      )

      // Update page timestamp
      await pool.query(
        'UPDATE pages SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [pageId]
      )

      return NextResponse.json({
        success: true,
        message: `Restored to revision #${targetRev[0].revision_number || revisionId} successfully!`,
      })
    }

    if (action === 'update_lead_status') {
      const { leadId, status } = body
      if (!leadId || !status) {
        return NextResponse.json(
          { success: false, error: 'leadId and status are required' },
          { status: 400 }
        )
      }

      await pool.query(
        'UPDATE contact SET status = ? WHERE id = ?',
        [status, leadId]
      )

      return NextResponse.json({
        success: true,
        message: 'Lead status updated successfully',
      })
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: "${action}"` },
      { status: 400 }
    )
  } catch (error) {
    console.error('API /api/sites/[slug] POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Database error' },
      { status: 500 }
    )
  }
}
