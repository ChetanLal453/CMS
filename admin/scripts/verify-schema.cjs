require('dotenv/config')

const mysql = require('mysql2/promise')
const { getDatabaseConfig } = require('./_db-config.cjs')

const requiredTables = [
  'navigation_items',
  'headers',
  'footers',
  'banners',
  'page_revisions',
  'page_templates',
  'site_settings',
  'services',
  'stats',
  'team',
  'blog',
  'gallery',
  'social',
  'contact',
  'faqs',
  'pricing',
  'projects',
  'partners',
  'timeline',
  'awards',
]

const requiredColumnsByTable = {
  pages: [
    'disabled',
    'status',
    'header_slug',
    'footer_slug',
    'banner_slug',
    'header_id',
    'footer_id',
    'banner_id',
    'meta_title',
    'meta_description',
    'meta_image',
    'meta_image_id',
    'current_revision_id',
    'published_revision_id',
    'published_at',
    'scheduled_for',
  ],
  page_revisions: ['page_id', 'revision_number', 'revision_type', 'layout_json', 'created_by'],
  page_templates: ['name', 'layout_json', 'category', 'updated_at'],
  media_library: ['filename', 'original_filename', 'alt', 'tags', 'uploaded_at'],
  contact: ['lead_type', 'source', 'notes', 'follow_up_history'],
}

const optionalLegacyColumnsByTable = {
  pages: ['layout', 'published_layout'],
  custom_templates: ['layout', 'description', 'thumbnail', 'updated_at'],
  page_versions: ['version_number', 'layout', 'description', 'created_by', 'name'],
  sections: ['props', 'type', 'sticky_enabled', 'sticky_column_index', 'sticky_position', 'sticky_offset'],
}

async function getExistingTables(connection) {
  const [rows] = await connection.query(
    'SELECT TABLE_NAME AS table_name FROM information_schema.tables WHERE table_schema = DATABASE()',
  )

  return new Set(rows.map((row) => row.table_name))
}

async function getExistingColumns(connection, tableName) {
  const [rows] = await connection.query(
    'SELECT COLUMN_NAME AS column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?',
    [tableName],
  )

  return new Set(rows.map((row) => row.column_name))
}

async function run() {
  const connection = await mysql.createConnection(getDatabaseConfig())

  try {
    const existingTables = await getExistingTables(connection)
    const missingTables = requiredTables.filter((tableName) => !existingTables.has(tableName))

    const missingColumns = []
    for (const [tableName, requiredColumns] of Object.entries(requiredColumnsByTable)) {
      if (!existingTables.has(tableName)) {
        missingColumns.push(tableName + ': table missing')
        continue
      }

      const existingColumns = await getExistingColumns(connection, tableName)
      const absent = requiredColumns.filter((columnName) => !existingColumns.has(columnName))
      if (absent.length) {
        missingColumns.push(tableName + ': ' + absent.join(', '))
      }
    }

    const legacyStatus = []
    for (const [tableName, legacyColumns] of Object.entries(optionalLegacyColumnsByTable)) {
      if (!existingTables.has(tableName)) {
        legacyStatus.push(tableName + ': table absent (ok in post-legacy mode)')
        continue
      }

      const existingColumns = await getExistingColumns(connection, tableName)
      const present = legacyColumns.filter((columnName) => existingColumns.has(columnName))
      legacyStatus.push(
        tableName + ': ' + (present.length ? 'legacy columns still present -> ' + present.join(', ') : 'no tracked legacy columns present'),
      )
    }

    if (!missingTables.length && !missingColumns.length) {
      console.log('Schema verification passed.')
      console.log('Legacy compatibility status:')
      for (const entry of legacyStatus) {
        console.log('- ' + entry)
      }
      return
    }

    if (missingTables.length) {
      console.log('Missing tables: ' + missingTables.join(', '))
    }

    if (missingColumns.length) {
      console.log('Missing columns:')
      for (const entry of missingColumns) {
        console.log('- ' + entry)
      }
    }

    console.log('Legacy compatibility status:')
    for (const entry of legacyStatus) {
      console.log('- ' + entry)
    }

    process.exit(1)
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  console.error('Schema verification failed.')
  console.error(error.message)
  process.exit(1)
})
