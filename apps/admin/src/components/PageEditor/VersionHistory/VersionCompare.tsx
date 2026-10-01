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

interface VersionCompareProps {
  versions: Version[]
  onClose: () => void
  className?: string
}

export const VersionCompare: React.FC<VersionCompareProps> = ({
  versions,
  onClose,
  className = ''
}) => {
  const [leftVersion, setLeftVersion] = useState<Version | null>(versions[0] ?? null)
  const [rightVersion, setRightVersion] = useState<Version | null>(versions[1] || versions[0] || null)

  useEffect(() => {
    if (versions.length < 2) {
      return
    }

    setLeftVersion(versions[0] ?? null)
    setRightVersion(versions[1] || versions[0] || null)
  }, [versions])

  if (versions.length < 2 || !leftVersion || !rightVersion) {
    return (
      <div className={`flex flex-col gap-4 ${className}`.trim()}>
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(28,30,42,0.96),rgba(16,18,27,0.96))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Compare Versions</div>
          <p className="mt-3 text-sm leading-6 text-[var(--t2)]">Need at least 2 versions to compare.</p>
          <button type="button" onClick={onClose} className="gbtn ghost mt-4">
            Close
          </button>
        </div>
      </div>
    )
  }

  const getLayoutSummary = (layout: any) => {
    if (!layout || !layout.sections) return 'No layout data'

    const sections = layout.sections || []
    const totalComponents = sections.reduce((total: number, section: any) => {
      const rows = Array.isArray(section?.rows)
        ? section.rows
        : Array.isArray(section?.container?.rows)
          ? section.container.rows
          : []

      return total + rows.reduce((sectionTotal: number, row: any) => {
        const columns = Array.isArray(row?.columns) ? row.columns : []
        return sectionTotal + columns.reduce((rowTotal: number, column: any) => {
          return rowTotal + (Array.isArray(column?.components) ? column.components.length : 0)
        }, 0)
      }, 0)
    }, 0)

    return `${sections.length} sections, ${totalComponents} components`
  }

  const compareLayouts = (layout1: any, layout2: any) => {
    const changes = []

    const sections1 = layout1?.sections || []
    const sections2 = layout2?.sections || []

    if (sections1.length !== sections2.length) {
      changes.push(`Sections: ${sections1.length} → ${sections2.length}`)
    }

    // Simple comparison - in a real implementation, you'd do deep diffing
    if (JSON.stringify(layout1) !== JSON.stringify(layout2)) {
      changes.push('Layout structure has changed')
    }

    return changes
  }

  const changes = compareLayouts(leftVersion.layout, rightVersion.layout)

  const selectedFrameClass = 'rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] shadow-[0_14px_40px_rgba(0,0,0,0.2)]'

  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()}>
      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(28,30,42,0.96),rgba(16,18,27,0.96))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--t3)]">Compare Versions</div>
            <h2 className="mt-2 text-xl font-semibold text-[var(--t1)]">Compare layout changes between versions</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--t2)]">
              Review how the structure evolved before restoring or saving a new checkpoint.
            </p>
          </div>
          <button type="button" onClick={onClose} className="gbtn ghost">
            Close
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">
              Left Version
            </label>
            <select
              value={leftVersion.id}
              onChange={(e) => {
                const version = versions.find(v => v.id === e.target.value)
                if (version) setLeftVersion(version)
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]">
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  v{version.version_number}: {version.name || version.version_name || `Version ${version.version_number}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">
              Right Version
            </label>
            <select
              value={rightVersion.id}
              onChange={(e) => {
                const version = versions.find(v => v.id === e.target.value)
                if (version) setRightVersion(version)
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]">
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  v{version.version_number}: {version.name || version.version_name || `Version ${version.version_number}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left Version */}
          <div className={selectedFrameClass}>
            <div className="border-b border-white/10 px-4 py-3">
              <h3 className="text-base font-semibold text-[var(--t1)]">
              Version {leftVersion.version_number}: {leftVersion.name || leftVersion.version_name || `Version ${leftVersion.version_number}`}
              </h3>
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Created</div>
                <div className="text-sm text-[var(--t1)]">{new Date(leftVersion.created_at).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Layout Summary</div>
                <div className="text-sm text-[var(--t1)]">{getLayoutSummary(leftVersion.layout)}</div>
              </div>
              {leftVersion.description && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Description</div>
                  <div className="text-sm leading-6 text-[var(--t1)]">{leftVersion.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Version */}
          <div className={selectedFrameClass}>
            <div className="border-b border-white/10 px-4 py-3">
              <h3 className="text-base font-semibold text-[var(--t1)]">
              Version {rightVersion.version_number}: {rightVersion.name || rightVersion.version_name || `Version ${rightVersion.version_number}`}
              </h3>
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Created</div>
                <div className="text-sm text-[var(--t1)]">{new Date(rightVersion.created_at).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Layout Summary</div>
                <div className="text-sm text-[var(--t1)]">{getLayoutSummary(rightVersion.layout)}</div>
              </div>
              {rightVersion.description && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Description</div>
                  <div className="text-sm leading-6 text-[var(--t1)]">{rightVersion.description}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Changes Summary */}
        <div className="mt-6">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Changes Detected</h4>
          {changes.length > 0 ? (
            <div className="space-y-2">
              {changes.map((change, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-[rgba(255,176,32,0.24)] bg-[rgba(255,176,32,0.08)] p-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--am)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm leading-6 text-[var(--aml)]">{change}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[rgba(16,217,130,0.24)] bg-[rgba(16,217,130,0.08)] p-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[var(--gr)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-[var(--grl)]">No changes detected between versions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VersionCompare
