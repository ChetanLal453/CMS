import { notFound } from 'next/navigation'
import { PublicPage } from '@/components/public/PublicPage'
import { getPreviewPageBundle } from '@/lib/public-pages.js'

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { revisionId?: string }
}) {
  const revisionIdParam = searchParams?.revisionId
  const parsedRevisionId =
    revisionIdParam == null ? null : Number.parseInt(revisionIdParam, 10)
  if (revisionIdParam != null && Number.isNaN(parsedRevisionId)) {
    notFound()
  }

  const revisionId = parsedRevisionId == null || Number.isNaN(parsedRevisionId) ? null : parsedRevisionId
  const bundle = await getPreviewPageBundle(params.slug, { revisionId })

  if (!bundle) {
    notFound()
  }

  if (revisionId != null && !bundle.revision) {
    notFound()
  }

  return (
    <div className="admin-preview-shell">
      <div className="admin-preview-stage">
        <div className="admin-preview-toolbar">
          <div>
            <div className="admin-preview-toolbar__eyebrow">
              <span aria-hidden="true">●</span>
              Preview Draft
            </div>
            <h1 className="admin-preview-toolbar__title">/{params.slug}</h1>
          </div>
          <div className="admin-preview-toolbar__meta">
            <span className="admin-preview-chip admin-preview-chip--live">Shared Render Pipeline</span>
            <span className="admin-preview-chip">Mode: Draft Preview</span>
            {bundle.revision ? <span className="admin-preview-chip">Revision #{bundle.revision.id}</span> : null}
          </div>
        </div>

        <div className="admin-preview-canvas">
          <PublicPage bundle={bundle} />
        </div>
      </div>
    </div>
  )
}
