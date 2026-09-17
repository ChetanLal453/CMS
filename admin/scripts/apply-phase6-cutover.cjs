require('dotenv/config')

const mysql = require('mysql2/promise')
const { getDatabaseConfig } = require('./_db-config.cjs')

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName],
  )
  return Number(rows[0]?.count || 0) > 0
}

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName],
  )
  return Number(rows[0]?.count || 0) > 0
}

async function ensurePreconditions(connection) {
  const [[missingCurrent]] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM pages
     WHERE current_revision_id IS NULL`,
  )
  const [[missingPublished]] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM pages
     WHERE status = 'published' AND published_revision_id IS NULL`,
  )

  if (Number(missingCurrent?.total || 0) > 0) {
    throw new Error('Cannot run Phase 6 cutover: some pages are missing current_revision_id')
  }

  if (Number(missingPublished?.total || 0) > 0) {
    throw new Error('Cannot run Phase 6 cutover: some published pages are missing published_revision_id')
  }
}

async function renameTableIfNeeded(connection, source, target, actions) {
  const sourceExists = await tableExists(connection, source)
  const targetExists = await tableExists(connection, target)

  if (sourceExists && targetExists) {
    throw new Error(`Cannot rename ${source} -> ${target}: both tables already exist`)
  }

  if (sourceExists && !targetExists) {
    await connection.query(`RENAME TABLE ${source} TO ${target}`)
    actions.push(`renamed table ${source} -> ${target}`)
    return
  }

  if (!sourceExists && targetExists) {
    actions.push(`table ${source} already retired as ${target}`)
    return
  }

  actions.push(`table ${source} not present, nothing to rename`)
}

async function backupLegacyPageColumns(connection, actions) {
  const hasLayout = await columnExists(connection, 'pages', 'layout')
  const hasPublishedLayout = await columnExists(connection, 'pages', 'published_layout')
  const backupTableExists = await tableExists(connection, 'backup_pages_legacy_layout_phase6')

  if (!hasLayout && !hasPublishedLayout) {
    actions.push('legacy page layout columns already absent')
    return
  }

  if (!backupTableExists) {
    await connection.query(
      `CREATE TABLE backup_pages_legacy_layout_phase6 AS
       SELECT id, slug, layout, published_layout, updated_at
       FROM pages`,
    )
    actions.push('created backup table backup_pages_legacy_layout_phase6')
  } else {
    actions.push('backup table backup_pages_legacy_layout_phase6 already exists')
  }

  if (hasLayout) {
    await connection.query('ALTER TABLE pages DROP COLUMN layout')
    actions.push('dropped pages.layout')
  }

  if (hasPublishedLayout) {
    await connection.query('ALTER TABLE pages DROP COLUMN published_layout')
    actions.push('dropped pages.published_layout')
  }
}

async function run() {
  const connection = await mysql.createConnection(getDatabaseConfig())

  try {
    await ensurePreconditions(connection)
    await connection.beginTransaction()

    const actions = []
    await backupLegacyPageColumns(connection, actions)
    await renameTableIfNeeded(connection, 'page_versions', 'page_versions_legacy_backup', actions)
    await renameTableIfNeeded(connection, 'sections', 'sections_legacy_backup', actions)

    await connection.commit()

    console.log('Phase 6 destructive cutover applied successfully.')
    for (const action of actions) {
      console.log(`- ${action}`)
    }
  } catch (error) {
    try {
      await connection.rollback()
    } catch {
      // ignore rollback errors
    }
    throw error
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  console.error('Phase 6 destructive cutover failed.')
  console.error(error.message)
  process.exit(1)
})
