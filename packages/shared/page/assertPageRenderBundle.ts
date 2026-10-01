import type { PageRenderBundle } from './PageRenderBundle'
import { validatePageRenderBundle } from './validatePageRenderBundle'

type UnknownBlockDiagnostic = {
  type: string
  sectionId?: string | number
  blockId?: string | number
}

function collectUnknownBlocks(bundle: PageRenderBundle): UnknownBlockDiagnostic[] {
  const sections = Array.isArray(bundle.view?.content) ? bundle.view.content : []
  const unknownBlocks: UnknownBlockDiagnostic[] = []

  for (const section of sections) {
    const rows = Array.isArray(section.container?.rows)
      ? section.container.rows
      : Array.isArray(section.rows)
        ? section.rows
        : []

    for (const row of rows) {
      const columns = Array.isArray(row?.columns) ? row.columns : []

      for (const column of columns) {
        const components = Array.isArray(column?.components) ? column.components : []

        for (const component of components) {
          const type = String(component?.type || '').trim()
          if (type) {
            unknownBlocks.push({
              type,
              sectionId: section?.id,
              blockId: component?.id,
            })
          }
        }
      }
    }
  }

  return unknownBlocks
}

export function assertPageRenderBundle(data: unknown): PageRenderBundle {
  const bundle = validatePageRenderBundle(data)
  const traceId = bundle.diagnostics?.traceId || bundle.view?.traceId || 'unknown-trace'

  bundle.diagnostics = {
    ...(bundle.diagnostics || {}),
    traceId,
    unknownBlocks: collectUnknownBlocks(bundle),
  }

  return bundle
}
