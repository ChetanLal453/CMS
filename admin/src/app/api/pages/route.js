import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import pool from '../../../lib/db.js'
import { getExistingColumns, parsePaginationParams, tableExists } from '../_utils/crud.js'
import { requireAdmin } from '../../../lib/require-admin.js'
import { clearPublicPageBundleCache } from '../../../lib/public-page-cache.js'
import { normalizeLayoutToCanonical, normalizeLayoutToEditor } from '../../../lib/page-layout-normalizer.js'
import { createRevision, getNextRevisionNumber, revisionsTableReady } from '../../../lib/repositories/page-revision-repository.js'
import { createPageEditorApiError } from '../../../../../shared/page/apiContract'

function normalizeStatus(page) {
  if (page.status === 'published') {
    return 'live'
  }

  if (page.status) {
    return page.status
  }

  return page.disabled ? 'draft' : 'live'
}

function jsonPageEditorError(status, {
  code,
  message,
  traceId,
  details,
}) {
  return NextResponse.json(
    createPageEditorApiError({
      code,
      message,
      traceId,
      details,
    }),
    { status },
  )
}

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('pages'))) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'pages' is unavailable.",
        details: { table: 'pages' },
      })
    }

    const columns = await getExistingColumns('pages', [
      'id',
      'slug',
      'title',
      'name',
      'status',
      'disabled',
      'header_slug',
      'footer_slug',
      'banner_slug',
      'current_revision_id',
      'published_revision_id',
    ])

    const { limit, offset, applyPagination } = parsePaginationParams(request, { maxLimit: 200 })
    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM pages')
    const values = []
    let query = `SELECT ${columns.join(', ')} FROM pages ORDER BY COALESCE(title, name, slug) ASC`

    if (applyPagination && limit !== null) {
      query += ' LIMIT ? OFFSET ?'
      values.push(limit, offset)
    }

    const [rows] = await pool.query(query, values)

    const pages = rows.map((page) => ({
      id: page.id,
      slug: page.slug || '',
      title: page.title || page.name || page.slug || 'Untitled Page',
      name: page.name || page.title || page.slug || 'Untitled Page',
      label: page.title || page.name || page.slug || 'Untitled Page',
      disabled: Boolean(page.disabled),
      header_slug: page.header_slug ?? null,
      footer_slug: page.footer_slug ?? null,
      banner_slug: page.banner_slug ?? null,
      current_revision_id: page.current_revision_id ?? null,
      published_revision_id: page.published_revision_id ?? null,
      url: page.slug === 'home' ? '/' : `/${page.slug || ''}`.replace(/\/+/g, '/'),
      status: normalizeStatus(page),
    }))

    return NextResponse.json({
      success: true,
      pages,
      total: Number(countRows[0]?.total || 0),
      limit: limit ?? pages.length,
      offset,
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch pages',
    })
  }
}

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonPageEditorError(400, {
      code: 'INVALID_JSON_BODY',
      message: 'Invalid JSON body',
    })
  }

  try {
    if (!(await tableExists('pages'))) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'pages' is unavailable.",
        details: { table: 'pages' },
      })
    }

    const name = String(body?.name || body?.title || '').trim()

    if (!name) {
      return jsonPageEditorError(400, {
        code: 'NAME_REQUIRED',
        message: 'name is required',
      })
    }

    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    slug = slug || `page-${Date.now()}`
    const originalSlug = slug
    let counter = 1

    while (true) {
      const [existing] = await pool.execute('SELECT id FROM pages WHERE slug = ? LIMIT 1', [slug])
      if (!existing.length) {
        break
      }

      slug = `${originalSlug}-${counter}`
      counter += 1
    }

    const initialLayout = {
      id: randomUUID(),
      name,
      sections: [],
    }
    const canonicalLayout = normalizeLayoutToCanonical(initialLayout, { name })
    const editorLayout = normalizeLayoutToEditor(canonicalLayout, { name })

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const pageColumns = await getExistingColumns('pages')
      const payload = {
        slug,
        title: name,
        name,
      }
      const insertFields = Object.keys(payload).filter((field) => pageColumns.includes(field))
      const [result] = await connection.execute(
        `INSERT INTO pages (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
        insertFields.map((field) => payload[field]),
      )

      let currentRevisionId = null
      if (pageColumns.includes('current_revision_id') && (await revisionsTableReady())) {
        const nextRevisionNumber = await getNextRevisionNumber(result.insertId, connection)
        const revision = await createRevision(
          {
            pageId: result.insertId,
            revisionNumber: nextRevisionNumber,
            revisionType: 'draft',
            layoutJson: canonicalLayout,
            createdBy: 'admin',
          },
          connection,
        )
        currentRevisionId = revision?.id ?? null

        if (currentRevisionId != null) {
          await connection.execute(
            'UPDATE pages SET current_revision_id = ?, updated_at = NOW() WHERE id = ?',
            [currentRevisionId, result.insertId],
          )
        }
      }

      await connection.commit()

      clearPublicPageBundleCache(slug)

      return NextResponse.json(
        {
          success: true,
          page: {
            id: result.insertId,
            slug,
            title: name,
            name,
            disabled: false,
            layout: editorLayout,
            current_revision_id: currentRevisionId,
            published_revision_id: null,
          },
        },
        { status: 201 },
      )
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error creating page:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Failed to create page',
    })
  }
}
