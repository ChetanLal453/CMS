'use client'

import React, { useEffect, useState } from 'react'

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

interface VersionTimelineProps {
  versions: Version[]
  onRestore: (version: Version) => void
  onCompare: (versions: Version[]) => void
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  onRestore,
  onCompare
}) => {
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSelectedVersions(new Set())
  }, [versions])

  const handleVersionSelect = (versionId: string) => {
    const newSelected = new Set(selectedVersions)
    if (newSelected.has(versionId)) {
      newSelected.delete(versionId)
    } else {
      newSelected.add(versionId)
    }
    setSelectedVersions(newSelected)
  }

  const handleCompare = () => {
    const selectedVersionObjects = versions.filter(v => selectedVersions.has(v.id))
    if (selectedVersionObjects.length >= 2) {
      onCompare(selectedVersionObjects)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Compare Actions */}
      {selectedVersions.size >= 2 && (
        <div className="rounded-2xl border border-[rgba(124,92,252,0.26)] bg-[rgba(124,92,252,0.08)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-[var(--t1)]">
              {selectedVersions.size} versions selected
            </span>
            <button
              type="button"
              onClick={handleCompare}
              className="gbtn pu"
            >
              Compare Versions
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {versions.map((version, index) => (
          <div key={version.id} className="relative">
            {/* Timeline line */}
            {index < versions.length - 1 && (
              <div className="absolute left-[1.45rem] top-12 h-16 w-px bg-white/10" />
            )}

            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="mt-2 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedVersions.has(version.id)}
                  onChange={() => handleVersionSelect(version.id)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                  style={{ accentColor: 'var(--pu)' }}
                />
              </div>

              {/* Timeline dot */}
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(124,92,252,0.96),rgba(99,68,232,0.9))] shadow-[0_12px_28px_rgba(124,92,252,0.28)]">
                  <span className="text-sm font-semibold text-white">
                    {version.version_number}
                  </span>
                </div>
              </div>

              {/* Version content */}
              <div
                className={`flex-1 rounded-2xl border p-4 shadow-[0_14px_40px_rgba(0,0,0,0.2)] transition-colors ${
                  selectedVersions.has(version.id)
                    ? 'border-[rgba(124,92,252,0.38)] bg-[rgba(124,92,252,0.08)]'
                    : 'border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))]'
                }`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[var(--t1)]">
                      {version.name || version.version_name || `Version ${version.version_number}`}
                    </h3>
                    {version.description && (
                      <p className="mt-2 text-sm leading-6 text-[var(--t2)]">{version.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--t3)]">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Created by {version.created_by || 'Unknown'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {formatDate(version.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onRestore(version)}
                      className="gbtn"
                    >
                      Restore
                    </button>
                  </div>
                </div>

                {/* Version preview (simplified) */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-sm text-[var(--t2)]">
                    Sections: {version.layout?.sections?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {versions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-8 text-center text-[var(--t2)]">
          No versions found
        </div>
      )}
    </div>
  )
}

export default VersionTimeline
