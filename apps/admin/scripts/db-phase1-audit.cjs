require('dotenv/config')

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const mysql = require('mysql2/promise')
const { getDatabaseConfig } = require('./_db-config.cjs')

const OUTPUT_ROOT = path.join(process.cwd(), 'database', 'phase1')

function formatTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

function toPlainNumber(value, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8')
}

function writeText(filePath, value) {
  fs.writeFileSync(filePath, value, 'utf8')
}

async function runDump({ host, port, user, password, database }, filePath) {
  return new Promise((resolve) => {
    let child

    try {
      child = spawn(
        'mysqldump',
        [
          '--single-transaction',
          '--routines',
          '--events',
          '--triggers',
          '--databases',
          database,
          '--host',
          host,
          '--port',
          String(port),
          '--user',
          user,
          '--result-file',
          filePath,
        ],
        {
          env: {
            ...process.env,
            MYSQL_PWD: password || '',
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )
    } catch (error) {
      resolve({ ok: false, error: error.message })
      return
    }

    let stderr = ''

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      resolve({ ok: false, error: error.message })
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, error: null })
        return
      }

      resolve({ ok: false, error: stderr.trim() || 'mysqldump exited with code ' + code })
    })
  })
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName],
  )
  return Number(rows[0]?.count || 0) > 0
}

async function getColumns(connection, tableName) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME AS column_name
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName],
  )
  return new Set(rows.map((row) => row.column_name))
}

async function countRows(connection, tableName) {
  if (!(await tableExists(connection, tableName))) {
    return 0
  }

  const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM ${tableName}`)
  return Number(rows[0]?.total || 0)
}

function buildHealthSummary({
  tableCounts,
  pages,
  revisionCounts,
  templateCounts,
  collationMismatches,
  relationCoverage,
}) {
  const draftPages = pages.filter((page) => page.status === 'draft').length
  const publishedPages = pages.filter((page) => page.status === 'published').length

  return {
    totals: tableCounts,
    pageStatus: {
      draft: draftPages,
      published: publishedPages,
      other: pages.length - draftPages - publishedPages,
    },
    revisionCoverage: revisionCounts,
    templateCoverage: templateCounts,
    relationCoverage,
    collationMismatches,
    dataQuality: {
      blankTitleOrName: pages
        .filter((page) => !String(page.title || '').trim() || !String(page.name || '').trim())
        .map((page) => ({ id: page.id, slug: page.slug, title: page.title || '', name: page.name || '' })),
      missingCurrentRevision: pages
        .filter((page) => page.current_revision_id == null)
        .map((page) => ({ id: page.id, slug: page.slug, status: page.status })),
      missingPublishedRevisionForPublishedPages: pages
        .filter((page) => page.status === 'published' && page.published_revision_id == null)
        .map((page) => ({ id: page.id, slug: page.slug })),
    },
  }
}

function buildMarkdownSummary({ timestamp, databaseName, dumpResult, snapshotFileName, healthFileName, health }) {
  const lines = [
    '# Phase 1 Database Audit',
    '',
    `Generated at: ${timestamp}`,
    `Database: ${databaseName}`,
    '',
    '## Outputs',
    '',
    '- Schema snapshot: `' + snapshotFileName + '`',
    '- Data health report: `' + healthFileName + '`',
    '- SQL backup: `' + dumpResult.fileName + '`' + (dumpResult.ok ? '' : ' (not created successfully)'),
    '',
    '## Current State',
    '',
    `- Pages: ${health.totals.pages}`,
    `- Draft pages: ${health.pageStatus.draft}`,
    `- Published pages: ${health.pageStatus.published}`,
    `- page_revisions rows: ${health.totals.page_revisions}`,
    `- page_versions rows: ${health.totals.page_versions}`,
    `- page_templates rows: ${health.totals.page_templates}`,
    `- custom_templates rows: ${health.totals.custom_templates}`,
    `- Sections snapshot rows: ${health.totals.sections}`,
    '',
    '## Key Findings',
    '',
    `- Pages missing current_revision_id: ${health.dataQuality.missingCurrentRevision.length}`,
    `- Published pages missing published_revision_id: ${health.dataQuality.missingPublishedRevisionForPublishedPages.length}`,
    `- Pages with blank title or name fields: ${health.dataQuality.blankTitleOrName.length}`,
    `- Slug collation mismatches detected: ${health.collationMismatches.length}`,
    '',
    '## Relation Coverage',
    '',
    `- header_slug matches: ${health.relationCoverage.headerSlugMatches}/${health.totals.pages}`,
    `- footer_slug matches: ${health.relationCoverage.footerSlugMatches}/${health.totals.pages}`,
    `- banner_slug matches: ${health.relationCoverage.bannerSlugMatches}/${health.totals.pages}`,
    `- pages already using header_id: ${health.relationCoverage.headerIdPopulated}/${health.totals.pages}`,
    `- pages already using footer_id: ${health.relationCoverage.footerIdPopulated}/${health.totals.pages}`,
    `- pages already using banner_id: ${health.relationCoverage.bannerIdPopulated}/${health.totals.pages}`,
    '',
    '## Backup Status',
    '',
    dumpResult.ok ? '- SQL backup completed successfully.' : `- SQL backup failed: ${dumpResult.error || 'unknown error'}`,
  ]

  return lines.join('\n') + '\n'
}

async function main() {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true })

  const timestamp = formatTimestamp()
  const config = getDatabaseConfig()
  const { host, port, user, password, database: databaseName } = config

  const connection = await mysql.createConnection(config)

  try {
    const [[serverInfo]] = await connection.query(
      'SELECT DATABASE() AS database_name, VERSION() AS server_version, @@collation_database AS database_collation',
    )

    const [tableRows] = await connection.query(
      `SELECT table_name, engine, table_collation, table_rows, data_length, index_length, create_time, update_time
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
       ORDER BY table_name ASC`,
    )

    const [columnRows] = await connection.query(
      `SELECT table_name, ordinal_position, column_name, data_type, column_type, is_nullable, column_default,
              column_key, extra, character_set_name, collation_name
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
       ORDER BY table_name ASC, ordinal_position ASC`,
    )

    const [indexRows] = await connection.query(
      `SELECT table_name, index_name, non_unique, seq_in_index, column_name
       FROM information_schema.statistics
       WHERE table_schema = DATABASE()
       ORDER BY table_name ASC, index_name ASC, seq_in_index ASC`,
    )

    const [foreignKeyRows] = await connection.query(
      `SELECT table_name, constraint_name, column_name, referenced_table_name, referenced_column_name
       FROM information_schema.key_column_usage
       WHERE table_schema = DATABASE() AND referenced_table_name IS NOT NULL
       ORDER BY table_name ASC, constraint_name ASC, ordinal_position ASC`,
    )

    const pageColumns = await getColumns(connection, 'pages')
    const pageSelectFields = [
      'id',
      'slug',
      pageColumns.has('title') ? 'title' : 'NULL AS title',
      pageColumns.has('name') ? 'name' : 'NULL AS name',
      pageColumns.has('status') ? 'status' : 'NULL AS status',
      pageColumns.has('disabled') ? 'disabled' : '0 AS disabled',
      pageColumns.has('header_slug') ? 'header_slug' : 'NULL AS header_slug',
      pageColumns.has('footer_slug') ? 'footer_slug' : 'NULL AS footer_slug',
      pageColumns.has('banner_slug') ? 'banner_slug' : 'NULL AS banner_slug',
      pageColumns.has('header_id') ? 'header_id' : 'NULL AS header_id',
      pageColumns.has('footer_id') ? 'footer_id' : 'NULL AS footer_id',
      pageColumns.has('banner_id') ? 'banner_id' : 'NULL AS banner_id',
      pageColumns.has('current_revision_id') ? 'current_revision_id' : 'NULL AS current_revision_id',
      pageColumns.has('published_revision_id') ? 'published_revision_id' : 'NULL AS published_revision_id',
      pageColumns.has('layout') ? `JSON_LENGTH(layout, '$.sections') AS layout_section_count` : 'NULL AS layout_section_count',
      pageColumns.has('published_layout') ? `JSON_LENGTH(published_layout, '$.sections') AS published_layout_section_count` : 'NULL AS published_layout_section_count',
    ]

    const [pages] = await connection.query(`SELECT ${pageSelectFields.join(', ')} FROM pages ORDER BY id ASC`)

    const tableCounts = {
      pages: pages.length,
      page_revisions: await countRows(connection, 'page_revisions'),
      page_versions: await countRows(connection, 'page_versions'),
      page_templates: await countRows(connection, 'page_templates'),
      custom_templates: await countRows(connection, 'custom_templates'),
      headers: await countRows(connection, 'headers'),
      footers: await countRows(connection, 'footers'),
      banners: await countRows(connection, 'banners'),
      navigation_items: await countRows(connection, 'navigation_items'),
      media_library: await countRows(connection, 'media_library'),
      sections: await countRows(connection, 'sections'),
    }

    const [revisionRows] = await connection.query(
      `SELECT
         COUNT(*) AS total_revisions,
         SUM(CASE WHEN revision_type = 'draft' THEN 1 ELSE 0 END) AS draft_revisions,
         SUM(CASE WHEN revision_type = 'published' THEN 1 ELSE 0 END) AS published_revisions,
         SUM(CASE WHEN revision_type = 'autosave' THEN 1 ELSE 0 END) AS autosave_revisions
       FROM page_revisions`,
    )

    let relationCoverage = {
      headerSlugMatches: 0,
      footerSlugMatches: 0,
      bannerSlugMatches: 0,
      headerIdPopulated: pages.filter((page) => page.header_id != null).length,
      footerIdPopulated: pages.filter((page) => page.footer_id != null).length,
      bannerIdPopulated: pages.filter((page) => page.banner_id != null).length,
    }

    if ((await tableExists(connection, 'headers')) && (await tableExists(connection, 'footers')) && (await tableExists(connection, 'banners'))) {
      const [relationRows] = await connection.query(
        `SELECT
           SUM(CASE WHEN p.header_slug IS NOT NULL AND h.id IS NOT NULL THEN 1 ELSE 0 END) AS header_slug_matches,
           SUM(CASE WHEN p.footer_slug IS NOT NULL AND f.id IS NOT NULL THEN 1 ELSE 0 END) AS footer_slug_matches,
           SUM(CASE WHEN p.banner_slug IS NOT NULL AND b.id IS NOT NULL THEN 1 ELSE 0 END) AS banner_slug_matches
         FROM pages p
         LEFT JOIN headers h ON h.slug = p.header_slug
         LEFT JOIN footers f ON f.slug = p.footer_slug
         LEFT JOIN banners b ON b.slug = p.banner_slug`,
      )
      relationCoverage = {
        ...relationCoverage,
        headerSlugMatches: toPlainNumber(relationRows[0]?.header_slug_matches),
        footerSlugMatches: toPlainNumber(relationRows[0]?.footer_slug_matches),
        bannerSlugMatches: toPlainNumber(relationRows[0]?.banner_slug_matches),
      }
    }

    const [collationRows] = await connection.query(
      `SELECT table_name, column_name, collation_name
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND ((table_name = 'pages' AND column_name IN ('slug', 'header_slug', 'footer_slug', 'banner_slug'))
           OR (table_name IN ('headers', 'footers', 'banners') AND column_name = 'slug'))
       ORDER BY table_name ASC, column_name ASC`,
    )

    const slugCollations = Object.fromEntries(
      collationRows.map((row) => [ `${row.table_name || row.TABLE_NAME}.${row.column_name || row.COLUMN_NAME}`, row.collation_name || row.COLLATION_NAME ]),
    )
    const canonicalSlugCollation = slugCollations['pages.slug'] || null
    const collationMismatches = Object.entries(slugCollations)
      .filter(([key, value]) => key !== 'pages.slug' && value !== canonicalSlugCollation)
      .map(([key, value]) => ({ column: key, expected: canonicalSlugCollation, actual: value }))

    const snapshot = {
      generated_at: timestamp,
      database: {
        host,
        port,
        name: databaseName,
        server_version: serverInfo?.server_version || null,
        database_collation: serverInfo?.database_collation || null,
      },
      tables: tableRows.map((row) => ({
        table_name: row.table_name,
        engine: row.engine,
        table_collation: row.table_collation,
        table_rows: toPlainNumber(row.table_rows),
        data_length: toPlainNumber(row.data_length),
        index_length: toPlainNumber(row.index_length),
        create_time: row.create_time,
        update_time: row.update_time,
      })),
      columns: columnRows,
      indexes: indexRows,
      foreign_keys: foreignKeyRows,
    }

    const pageRevisionSummary = revisionRows[0] || {}
    const health = buildHealthSummary({
      tableCounts,
      pages,
      revisionCounts: {
        total: toPlainNumber(pageRevisionSummary.total_revisions),
        draft: toPlainNumber(pageRevisionSummary.draft_revisions),
        published: toPlainNumber(pageRevisionSummary.published_revisions),
        autosave: toPlainNumber(pageRevisionSummary.autosave_revisions),
      },
      templateCounts: {
        page_templates: tableCounts.page_templates,
        custom_templates: tableCounts.custom_templates,
      },
      relationCoverage,
      collationMismatches,
    })

    const snapshotFileName = `schema-snapshot-${timestamp}.json`
    const healthFileName = `data-health-${timestamp}.json`
    const summaryFileName = `summary-${timestamp}.md`
    const dumpFileName = `backup-${timestamp}.sql`

    writeJson(path.join(OUTPUT_ROOT, snapshotFileName), snapshot)
    writeJson(path.join(OUTPUT_ROOT, healthFileName), health)

    const dumpFilePath = path.join(OUTPUT_ROOT, dumpFileName)
    const dumpResult = await runDump({ host, port, user, password, database: databaseName }, dumpFilePath)
    const summary = buildMarkdownSummary({
      timestamp,
      databaseName,
      dumpResult: { ...dumpResult, fileName: dumpFileName },
      snapshotFileName,
      healthFileName,
      health,
    })

    writeText(path.join(OUTPUT_ROOT, summaryFileName), summary)
    writeText(path.join(OUTPUT_ROOT, 'LATEST_SUMMARY.md'), summary)

    console.log(`Phase 1 audit complete for database "${databaseName}".`)
    console.log(`- Snapshot: ${path.join('database', 'phase1', snapshotFileName)}`)
    console.log(`- Health: ${path.join('database', 'phase1', healthFileName)}`)
    console.log(`- Summary: ${path.join('database', 'phase1', summaryFileName)}`)
    if (dumpResult.ok) {
      console.log(`- Backup: ${path.join('database', 'phase1', dumpFileName)}`)
    } else {
      console.log(`- Backup failed: ${dumpResult.error}`)
    }
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('Phase 1 audit failed.')
  console.error(error.message)
  process.exit(1)
})
