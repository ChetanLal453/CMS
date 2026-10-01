require('dotenv/config')

const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const { getDatabaseConfig } = require('./_db-config.cjs')

const runtimeFiles = [
  path.join(process.cwd(), 'src', 'lib', 'services', 'page-render-service.js'),
  path.join(process.cwd(), 'src', 'lib', 'layout-sync.js'),
  path.join(process.cwd(), 'src', 'app', 'api', 'choose', 'route.js'),
  path.join(process.cwd(), 'src', 'app', 'api', 'page', '[slug]', 'route.js'),
  path.join(process.cwd(), 'src', 'app', 'api', 'pages', '[page_id]', 'route.js'),
]

const forbiddenRuntimePatterns = [
  { label: 'legacy page.layout reads', pattern: /page\.layout\b/ },
  { label: 'legacy page.published_layout reads', pattern: /page\.published_layout\b/ },
  { label: 'sections table snapshot queries', pattern: /SELECT\s+props\s+FROM\s+sections|DELETE\s+FROM\s+sections|INSERT\s+INTO\s+sections/i },
  { label: 'oldFormat compatibility payload', pattern: /\boldFormat\b/ },
  { label: 'direct legacy layout SELECT', pattern: /SELECT\s+layout\s+FROM\s+pages/i },
]

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [tableName, columnName],
  )

  return Number(rows[0]?.count || 0) > 0
}

function readFileSafe(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

async function run() {
  const connection = await mysql.createConnection(getDatabaseConfig())

  try {
    const hasLegacyLayout = await columnExists(connection, 'pages', 'layout')
    const hasLegacyPublishedLayout = await columnExists(connection, 'pages', 'published_layout')

    const [rows] = await connection.query(
      `SELECT
        COUNT(*) AS total_pages,
        SUM(CASE WHEN current_revision_id IS NOT NULL THEN 1 ELSE 0 END) AS pages_with_current_revision,
        SUM(CASE WHEN published_revision_id IS NOT NULL THEN 1 ELSE 0 END) AS pages_with_published_revision
      FROM pages`,
    )

    const summary = rows[0] || {}
    console.log('Revision cutover summary:')
    console.log(`- Total pages: ${Number(summary.total_pages || 0)}`)
    console.log(`- Pages with current revision: ${Number(summary.pages_with_current_revision || 0)}`)
    console.log(`- Pages with published revision: ${Number(summary.pages_with_published_revision || 0)}`)
    console.log(`- Legacy layout column present: ${hasLegacyLayout ? 'yes' : 'no'}`)
    console.log(`- Legacy published_layout column present: ${hasLegacyPublishedLayout ? 'yes' : 'no'}`)

    const [revisionRows] = await connection.query(
      `SELECT revision_type, COUNT(*) AS total
       FROM page_revisions
       GROUP BY revision_type
       ORDER BY revision_type ASC`,
    )

    console.log('Revision counts by type:')
    for (const row of revisionRows) {
      console.log(`- ${row.revision_type}: ${Number(row.total || 0)}`)
    }

    const [missingCurrent] = await connection.query(
      `SELECT id, slug
       FROM pages
       WHERE current_revision_id IS NULL
       ORDER BY id ASC`,
    )
    const [missingPublished] = await connection.query(
      `SELECT id, slug
       FROM pages
       WHERE status = 'published' AND published_revision_id IS NULL
       ORDER BY id ASC`,
    )

    const runtimeIssues = []
    for (const filePath of runtimeFiles) {
      const content = readFileSafe(filePath)
      for (const check of forbiddenRuntimePatterns) {
        if (check.pattern.test(content)) {
          runtimeIssues.push(`${path.relative(process.cwd(), filePath)} -> ${check.label}`)
        }
      }
    }

    if (missingCurrent.length) {
      console.log('Pages missing current revision:')
      for (const page of missingCurrent) {
        console.log(`- ${page.id}: ${page.slug}`)
      }
    }

    if (missingPublished.length) {
      console.log('Published pages missing published revision:')
      for (const page of missingPublished) {
        console.log(`- ${page.id}: ${page.slug}`)
      }
    }

    if (runtimeIssues.length) {
      console.log('Runtime legacy dependency findings:')
      for (const issue of runtimeIssues) {
        console.log(`- ${issue}`)
      }
    }

    if (missingCurrent.length || missingPublished.length || runtimeIssues.length) {
      process.exit(1)
    }

    console.log('Revision cutover verification passed.')
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  console.error('Revision cutover verification failed.')
  console.error(error.message)
  process.exit(1)
})
