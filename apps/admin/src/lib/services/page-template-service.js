import { randomUUID } from 'crypto'
import { normalizeLayoutToCanonical } from '../page-layout-normalizer.js'
import {
  createTemplateRecord,
  deleteTemplateRecord,
  getTemplateById,
  listTemplates,
  updateTemplateRecord,
} from '../repositories/page-template-repository.js'
import { saveDraftRevision } from './page-editor-service.js'

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function listTemplateRecords() {
  const result = await listTemplates()
  return result.items
}

export async function createTemplate(input) {
  const id = input?.id || randomUUID()
  const name = String(input?.name || '').trim()
  const slug = slugify(input?.slug || name) || `template-${Date.now()}`
  const layout = normalizeLayoutToCanonical(input?.layout ?? input?.layout_json ?? input?.content ?? {}, {})

  return createTemplateRecord({
    ...input,
    id,
    slug,
    name,
    layout,
  })
}

export async function updateTemplate(id, input) {
  const name = String(input?.name || '').trim()
  const slug = slugify(input?.slug || name) || `template-${Date.now()}`
  const layout = normalizeLayoutToCanonical(input?.layout ?? input?.layout_json ?? input?.content ?? {}, {})

  return updateTemplateRecord(id, {
    ...input,
    slug,
    name,
    layout,
  })
}

export async function removeTemplate(id) {
  return deleteTemplateRecord(id)
}

export async function applyTemplateToPage({
  templateId,
  pageId,
  actor = null,
  applyAssignments = false,
  baseRevisionId = null,
}) {
  const { item: template } = await getTemplateById(templateId)
  if (!template) {
    return null
  }

  const extraPageFields = applyAssignments
    ? {
        ...(template.header_id != null ? { header_id: template.header_id } : {}),
        ...(template.footer_id != null ? { footer_id: template.footer_id } : {}),
        ...(template.banner_id != null ? { banner_id: template.banner_id } : {}),
      }
    : {}

  const result = await saveDraftRevision({
    pageId,
    layout: template.layout_json ?? template.layout ?? template.content ?? {},
    pageName: null,
    extraPageFields,
    baseRevisionId,
    actor,
  })

  return {
    template,
    result,
  }
}
