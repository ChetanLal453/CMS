require("dotenv/config")

const mysql = require("mysql2/promise")
const { getDatabaseConfig } = require("./_db-config.cjs")

function parseJsonValue(value, fallback = null) {
  if (value == null || value === "") {
    return fallback
  }

  if (typeof value === "object" && !Buffer.isBuffer(value)) {
    return value
  }

  try {
    const raw = Buffer.isBuffer(value) ? value.toString("utf8") : value
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function ensureColumns(rawColumns, sectionIndex, rowIndex) {
  const safeColumns = Array.isArray(rawColumns) && rawColumns.length
    ? rawColumns
    : [{ id: `column-${sectionIndex + 1}-${rowIndex + 1}-1`, width: 100, components: [] }]

  return safeColumns.map((column, columnIndex) => ({
    id: column?.id || `column-${sectionIndex + 1}-${rowIndex + 1}-${columnIndex + 1}`,
    width: column?.width ?? 100,
    components: Array.isArray(column?.components)
      ? column.components.map((component, componentIndex) => ({
          id:
            component?.id ||
            `component-${sectionIndex + 1}-${rowIndex + 1}-${columnIndex + 1}-${componentIndex + 1}`,
          type: component?.type || "custom",
          label: component?.label || component?.type || "custom",
          props: component?.props && typeof component.props === "object" ? component.props : {},
        }))
      : [],
  }))
}

function normalizeLayout(layout, page) {
  const rawLayout = parseJsonValue(layout, null)
  const baseLayout = rawLayout && typeof rawLayout === "object" ? rawLayout : {}
  const rawSections = Array.isArray(baseLayout.sections) ? baseLayout.sections : []

  return {
    id: String(baseLayout.id || page.id),
    name: String(baseLayout.name || page.name || page.title || `Page ${page.id}`),
    sections: rawSections.map((section, sectionIndex) => {
      let rows = []

      if (Array.isArray(section?.rows) && section.rows.length) {
        rows = section.rows
      } else if (Array.isArray(section?.container?.rows) && section.container.rows.length) {
        rows = section.container.rows
      } else if (Array.isArray(section?.columns)) {
        rows = [{ id: `row-${sectionIndex + 1}-1`, columns: section.columns }]
      } else {
        rows = [{ id: `row-${sectionIndex + 1}-1`, columns: [] }]
      }

      return {
        id: section?.id || `section-${sectionIndex + 1}`,
        name: section?.name || section?.title || `Section ${sectionIndex + 1}`,
        type: section?.type || "custom",
        props: section?.props && typeof section.props === "object" ? section.props : {},
        settings: section?.settings && typeof section.settings === "object" ? section.settings : {},
        rows: rows.map((row, rowIndex) => ({
          id: row?.id || `row-${sectionIndex + 1}-${rowIndex + 1}`,
          columns: ensureColumns(row?.columns, sectionIndex, rowIndex),
        })),
      }
    }),
  }
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

async function getNextRevisionNumber(connection, pageId) {
  const [rows] = await connection.query(
    "SELECT COALESCE(MAX(revision_number), 0) + 1 AS next_revision_number FROM page_revisions WHERE page_id = ?",
    [pageId],
  )

  return Number(rows[0]?.next_revision_number || 1)
}

async function insertRevision(connection, pageId, revisionType, layoutJson) {
  const revisionNumber = await getNextRevisionNumber(connection, pageId)
  const [result] = await connection.query(
    `INSERT INTO page_revisions (
      page_id,
      revision_number,
      revision_type,
      layout_json,
      created_by,
      created_at
    ) VALUES (?, ?, ?, ?, ?, NOW())`,
    [pageId, revisionNumber, revisionType, JSON.stringify(layoutJson), "backfill"],
  )

  return {
    id: result.insertId,
    revisionNumber,
  }
}

function resolveLegacyLayoutSource(page, pageColumns) {
  if (!pageColumns.has('layout')) {
    return null
  }

  return page.layout
}

function resolveLegacyPublishedLayoutSource(page, pageColumns) {
  const publishedLayout = pageColumns.has('published_layout') ? parseJsonValue(page.published_layout, null) : null
  const layout = pageColumns.has('layout') ? parseJsonValue(page.layout, null) : null
  return publishedLayout ?? layout
}

async function run() {
  const connection = await mysql.createConnection(getDatabaseConfig())

  try {
    if (!(await tableExists(connection, "pages"))) {
      throw new Error("pages table not found")
    }

    if (!(await tableExists(connection, "page_revisions"))) {
      throw new Error("page_revisions table not found")
    }

    const pageColumns = await getColumns(connection, "pages")
    const selectFields = [
      "id",
      "slug",
      pageColumns.has("title") ? "title" : "NULL AS title",
      pageColumns.has("name") ? "name" : "NULL AS name",
      pageColumns.has("layout") ? "layout" : "NULL AS layout",
      pageColumns.has("published_layout") ? "published_layout" : "NULL AS published_layout",
      pageColumns.has("status") ? "status" : "NULL AS status",
      pageColumns.has("current_revision_id") ? "current_revision_id" : "NULL AS current_revision_id",
      pageColumns.has("published_revision_id") ? "published_revision_id" : "NULL AS published_revision_id",
    ]

    const [pages] = await connection.query(`SELECT ${selectFields.join(", ")} FROM pages ORDER BY id ASC`)
    let draftBackfilled = 0
    let publishedBackfilled = 0
    let skippedDrafts = 0
    let skippedPublished = 0

    for (const page of pages) {
      if (page.current_revision_id == null) {
        const legacyDraftSource = resolveLegacyLayoutSource(page, pageColumns)
        if (legacyDraftSource == null) {
          skippedDrafts += 1
        } else {
          const draftLayout = normalizeLayout(legacyDraftSource, page)
          const draftRevision = await insertRevision(connection, page.id, "draft", draftLayout)
          await connection.query(
            "UPDATE pages SET current_revision_id = ?, updated_at = NOW() WHERE id = ?",
            [draftRevision.id, page.id],
          )
          draftBackfilled += 1
        }
      }

      if (page.published_revision_id == null && page.status === "published") {
        const sourcePublishedLayout = resolveLegacyPublishedLayoutSource(page, pageColumns)
        if (sourcePublishedLayout) {
          const publishedLayout = normalizeLayout(sourcePublishedLayout, page)
          const publishedRevision = await insertRevision(connection, page.id, "published", publishedLayout)
          await connection.query(
            "UPDATE pages SET published_revision_id = ?, updated_at = NOW() WHERE id = ?",
            [publishedRevision.id, page.id],
          )
          publishedBackfilled += 1
        } else {
          skippedPublished += 1
        }
      }
    }

    console.log(`Draft revisions backfilled: ${draftBackfilled}`)
    console.log(`Published revisions backfilled: ${publishedBackfilled}`)
    console.log(`Draft backfill skipped due to missing legacy source: ${skippedDrafts}`)
    console.log(`Published backfill skipped due to missing legacy source: ${skippedPublished}`)
    console.log("Revision backfill completed successfully.")
  } finally {
    await connection.end()
  }
}

run().catch((error) => {
  console.error("Revision backfill failed.")
  console.error(error.message)
  process.exit(1)
})
