'use client'

import React, { useEffect, useState } from 'react'
import { VersionTimeline } from './VersionTimeline'
import { VersionCompare } from './VersionCompare'
import { getApiErrorMessage } from '@/lib/apiHelpers'

interface Version {
  id: string
  page_id: string
  version_number: number
  version_name?: string
  revision_type?: string
  name: string
  description: string
  layout: any
  created_by: string
  created_at: string
}

interface VersionHistoryProps {
  pageId: string
  currentLayout: any
  onRestore: (version: Version) => void
  className?: string
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  pageId,
  currentLayout,
  onRestore,
  className = ''
}) => {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [compareVersions, setCompareVersions] = useState<Version[]>([])
  const [showCompare, setShowCompare] = useState(false)

  useEffect(() => {
    setLoading(true)
    setCompareVersions([])
    setShowCompare(false)
    void fetchVersions()
  }, [pageId])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/versions/list?page_id=${pageId}`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        console.error('Error fetching versions:', getApiErrorMessage(data, 'Failed to fetch versions'))
        setVersions([])
        return
      }

      setVersions(Array.isArray(data.versions) ? data.versions : [])
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVersion = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/versions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: pageId,
          name,
          description,
          layout: currentLayout
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        window.alert(getApiErrorMessage(data, 'Failed to save version'))
        return
      }

      setVersions(prev => [data.version, ...prev])
    } catch (error) {
      console.error('Error saving version:', error)
    }
  }

  const handleRestore = async (version: Version) => {
    if (!window.confirm(`Are you sure you want to restore to version "${version.name}"? This will overwrite the current layout.`)) {
      return
    }

    try {
      const response = await fetch('/api/versions/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_id: version.id
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        window.alert(getApiErrorMessage(data, 'Failed to restore version'))
        return
      }

      onRestore(data.version || {
        ...version,
        layout: data.layout ?? version.layout,
      })
      alert('Version restored successfully!')
    } catch (error) {
      console.error('Error restoring version:', error)
    }
  }

  const handleCompare = (versionsToCompare: Version[]) => {
    setCompareVersions(versionsToCompare)
    setShowCompare(true)
  }

  if (showCompare) {
    return (
      <VersionCompare
        versions={compareVersions}
        onClose={() => {
          setShowCompare(false)
          setCompareVersions([])
        }}
        className={className}
      />
    )
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()}>
      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(28,30,42,0.96),rgba(16,18,27,0.96))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--t3)]">Version History</div>
            <h2 className="mt-2 text-xl font-semibold text-[var(--t1)]">Track changes and restore previous versions</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--t2)]">
              Save checkpoints, compare revisions, and restore layouts without leaving the editor.
            </p>
          </div>

          <button
            type="button"
            className="gbtn pu"
            onClick={() => {
              const name = window.prompt('Version name:')
              if (name) {
                const description = window.prompt('Description (optional):')
                void handleSaveVersion(name, description || '')
              }
            }}>
            <span>Save Version</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-[var(--t2)]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[var(--pu)]" />
            <span>Loading versions...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center">
            <svg className="mx-auto mb-4 h-14 w-14 text-[var(--t3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-semibold text-[var(--t1)]">No versions yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--t2)]">
              Save your first version to start tracking changes.
            </p>
            <button
              type="button"
              className="gbtn pu mt-5"
              onClick={() => {
                const name = window.prompt('Version name:')
                if (name) {
                  const description = window.prompt('Description (optional):')
                  void handleSaveVersion(name, description || '')
                }
              }}>
              Save First Version
            </button>
          </div>
        ) : (
          <VersionTimeline versions={versions} onRestore={handleRestore} onCompare={handleCompare} />
        )}
      </div>
    </div>
  )
}

export default VersionHistory
