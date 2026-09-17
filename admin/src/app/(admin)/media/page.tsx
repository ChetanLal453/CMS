import ModuleShell from '@/components/admin/ModuleShell'
import MediaLibrary from '@/components/PageEditor/MediaLibrary'

export default function MediaPage() {
  return (
    <ModuleShell
      className="media-page-shell"
      title="Media"
      description="Upload, organize, preview, and reuse site assets."
    >
      <MediaLibrary className="media-page-library" />
    </ModuleShell>
  )
}
