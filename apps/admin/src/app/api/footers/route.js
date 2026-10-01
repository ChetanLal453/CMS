import pool from '../../../lib/db.js'
import { requireAdmin } from '../../../lib/require-admin.js'
import {
  getExistingColumns,
  invalidateColumnCache,
  missingTableResponse,
  parseJsonRow,
  parseJsonRows,
  tableExists,
} from '../_utils/crud.js'
import { clearPublicPageBundleCache } from '../../../lib/public-page-cache.js'

const TABLE_NAME = 'footers'
const SELECT_COLUMNS = [
  'id',
  'slug',
  'name',
  'columns',
  'copyright',
  'social_links',
  'bg_color',
  'settings',
  'created_at',
  'updated_at',
]

function normalizeFooterRow(footer) {
  if (!footer) {
    return null
  }

  const settings = footer.settings || {}

  return {
    ...footer,
    copyright_text: settings.copyright_text || footer.copyright || '',
    logo_url: settings.logo_url || '',
    newsletter_enabled:
      typeof settings.newsletter_enabled === 'boolean' ? settings.newsletter_enabled : true,
    company_address: settings.company_address || '',
    company_email: settings.company_email || '',
    company_phone: settings.company_phone || '',
    social_style: settings.social_style || 'text',
  }
}

function parseFooterId(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

async function ensureFooterSchema() {
  if (!(await tableExists(TABLE_NAME))) {
    return false
  }

  const existingColumns = await getExistingColumns(TABLE_NAME)
  const statements = []

  if (!existingColumns.includes('columns')) {
    statements.push('ADD COLUMN `columns` JSON NULL')
  }
  if (!existingColumns.includes('copyright')) {
    statements.push('ADD COLUMN `copyright` VARCHAR(500) NULL')
  }
  if (!existingColumns.includes('social_links')) {
    statements.push('ADD COLUMN `social_links` JSON NULL')
  }
  if (!existingColumns.includes('bg_color')) {
    statements.push('ADD COLUMN `bg_color` VARCHAR(50) NULL')
  }
  if (!existingColumns.includes('settings')) {
    statements.push('ADD COLUMN `settings` JSON NULL')
  }

  if (!statements.length) {
    return true
  }

  await pool.execute(`ALTER TABLE ${TABLE_NAME} ${statements.join(', ')}`)
  invalidateColumnCache(TABLE_NAME)
  return true
}

function resolveManagedFooter(footers, body = {}) {
  const explicitId = parseFooterId(body.id)
  if (explicitId !== null) {
    const byId = footers.find((footer) => Number(footer.id) === explicitId)
    if (byId) {
      return byId
    }
  }

  const explicitSlug = typeof body.slug === 'string' ? body.slug.trim() : ''
  if (explicitSlug) {
    const bySlug = footers.find((footer) => footer.slug === explicitSlug)
    if (bySlug) {
      return bySlug
    }
  }

  return footers.find((footer) => footer.slug === 'global-footer') || footers[0] || null
}

async function fetchFooters() {
  const columns = await getExistingColumns(TABLE_NAME, SELECT_COLUMNS)
  const [rows] = await pool.execute(
    `SELECT ${columns.join(', ')} FROM ${TABLE_NAME} ORDER BY id ASC`,
  )

  return parseJsonRows(rows, ['columns', 'social_links', 'settings']).map(normalizeFooterRow)
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

    await ensureFooterSchema()

    const footers = await fetchFooters()
    const footer = resolveManagedFooter(footers)
    return Response.json({
      success: true,
      footer,
      footers,
      items: footers,
    })
  } catch (error) {
    console.error('Error fetching footers:', error)
    return Response.json({ success: false, error: 'Failed to fetch footers' }, { status: 500 })
  }
}

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    await ensureFooterSchema()

    const body = await request.json()
    const footers = await fetchFooters()
    const existing = resolveManagedFooter(footers, body)
    const currentSettings = existing?.settings || {}
    const nextSettings = {
      ...currentSettings,
      logo_url: body.logo_url ?? currentSettings.logo_url ?? '',
      newsletter_enabled:
        body.newsletter_enabled ?? currentSettings.newsletter_enabled ?? true,
      copyright_text:
        body.copyright_text ?? body.copyright ?? currentSettings.copyright_text ?? '',
      company_address: body.company_address ?? currentSettings.company_address ?? '',
      company_email: body.company_email ?? currentSettings.company_email ?? '',
      company_phone: body.company_phone ?? currentSettings.company_phone ?? '',
      social_style: body.social_style ?? currentSettings.social_style ?? 'text',
    }

    const savedFooterId = existing?.id ?? null
    let finalFooterId = savedFooterId
    const payload = {
      slug: body.slug || existing?.slug || 'global-footer',
      name: body.name || existing?.name || 'Global Footer',
      columns: JSON.stringify(body.columns ?? existing?.columns ?? []),
      copyright:
        body.copyright ?? body.copyright_text ?? existing?.copyright ?? nextSettings.copyright_text,
      social_links: JSON.stringify(body.social_links ?? existing?.social_links ?? []),
      bg_color: body.bg_color ?? existing?.bg_color ?? '#111116',
      settings: JSON.stringify(nextSettings),
    }

    const writeColumns = await getExistingColumns(TABLE_NAME, Object.keys(payload))

    if (savedFooterId !== null) {
      const updates = writeColumns.map((column) => `${column} = ?`)
      const values = writeColumns.map((column) => payload[column])
      values.push(savedFooterId)
      await pool.execute(`UPDATE ${TABLE_NAME} SET ${updates.join(', ')} WHERE id = ?`, values)
    } else {
      const values = writeColumns.map((column) => payload[column])
      const [result] = await pool.execute(
        `INSERT INTO ${TABLE_NAME} (${writeColumns.join(', ')}) VALUES (${writeColumns.map(() => '?').join(', ')})`,
        values,
      )
      if (result?.insertId != null) {
        payload.id = result.insertId
        finalFooterId = result.insertId
      }
    }

    const savedFooters = await fetchFooters()
    const footer =
      savedFooters.find((item) => Number(item.id) === Number(finalFooterId)) ||
      savedFooters.find((item) => item.slug === payload.slug) ||
      resolveManagedFooter(savedFooters, payload)

    const responseFooter =
      footer || {
        id: finalFooterId ?? savedFooterId ?? null,
        slug: payload.slug,
        name: payload.name,
        columns: body.columns ?? existing?.columns ?? [],
        copyright: payload.copyright,
        social_links: body.social_links ?? existing?.social_links ?? [],
        bg_color: payload.bg_color,
        settings: nextSettings,
        copyright_text: nextSettings.copyright_text,
        logo_url: nextSettings.logo_url,
        newsletter_enabled: nextSettings.newsletter_enabled,
        company_address: nextSettings.company_address,
        company_email: nextSettings.company_email,
        company_phone: nextSettings.company_phone,
        social_style: nextSettings.social_style,
      }

    clearPublicPageBundleCache()
    return Response.json({
      success: true,
      footer: responseFooter,
      footers: savedFooters,
      item: responseFooter,
    })
  } catch (error) {
    console.error('Error saving footer:', error)
    return Response.json({ success: false, error: 'Failed to save footer' }, { status: 500 })
  }
}
