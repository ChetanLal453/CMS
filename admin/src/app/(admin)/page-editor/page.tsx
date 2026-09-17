'use client'

import PageEditor from '@/components/PageEditor/index-unified'
import { PageEditorErrorBoundary } from '@/components/PageEditor/PageEditorErrorBoundary'

export default function AdminPageEditorPage() {
  return (
    <PageEditorErrorBoundary>
      <PageEditor />
    </PageEditorErrorBoundary>
  )
}
