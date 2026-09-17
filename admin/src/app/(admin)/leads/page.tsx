'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import {
  FilterClearButton,
  FilterDropdown,
  FilterGrid,
  FilterPanel,
  FilterSearch,
  FilterSortDropdown,
  FilterTagChips,
  FilterSwitch,
  type FilterOption,
} from '@/components/filters'
import ModuleShell from '@/components/admin/ModuleShell'

type LeadStatus = 'new' | 'read' | 'replied'
type LeadType = 'contact_form' | 'appointment_request' | 'newsletter_subscriber'

type LeadHistoryEntry = {
  id: string
  note: string
  created_at: string
  kind?: 'note' | 'follow_up' | 'status'
}

type Lead = {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: LeadStatus
  lead_type?: LeadType | string | null
  source?: string | null
  notes?: string | null
  follow_up_history?: LeadHistoryEntry[] | string | null
  created_at: string
}

const statusClassMap: Record<LeadStatus, string> = {
  new: 'bb',
  read: 'ba',
  replied: 'bu',
}

const statusLabelMap: Record<LeadStatus, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
}

const leadTypeLabelMap: Record<LeadType, string> = {
  contact_form: 'Contact form',
  appointment_request: 'Appointment request',
  newsletter_subscriber: 'Newsletter subscriber',
}

const leadTypeBadgeMap: Record<LeadType, string> = {
  contact_form: 'text-bg-primary',
  appointment_request: 'text-bg-warning',
  newsletter_subscriber: 'text-bg-success',
}

const statusOptions: FilterOption[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
]

const leadTypeOptions: FilterOption[] = [
  { value: 'contact_form', label: 'Contact form' },
  { value: 'appointment_request', label: 'Appointment request' },
  { value: 'newsletter_subscriber', label: 'Newsletter subscriber' },
]

const sortOptions: FilterOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
]

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function parseDateValue(value?: string | null) {
  const time = new Date(value || '').getTime()
  return Number.isNaN(time) ? 0 : time
}

function normalizeHistory(value: Lead['follow_up_history']) {
  if (!value) {
    return []
  }

  const rawValue = typeof value === 'string'
    ? (() => {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      })()
    : value

  if (!Array.isArray(rawValue)) {
    return []
  }

  return rawValue
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return {
          id: `legacy-${index}`,
          note: entry,
          created_at: '',
          kind: 'note' as const,
        }
      }

      const note = typeof entry?.note === 'string' ? entry.note : typeof entry?.message === 'string' ? entry.message : ''
      const createdAt =
        typeof entry?.created_at === 'string'
          ? entry.created_at
          : typeof entry?.createdAt === 'string'
            ? entry.createdAt
            : ''

      return {
        id: typeof entry?.id === 'string' ? entry.id : `legacy-${index}`,
        note,
        created_at: createdAt,
        kind: entry?.kind === 'status' || entry?.kind === 'note' ? entry.kind : 'follow_up',
      }
    })
    .filter((entry) => Boolean(entry.note.trim()))
}

function getLeadType(lead: Lead): LeadType {
  if (lead.lead_type === 'appointment_request' || lead.lead_type === 'newsletter_subscriber' || lead.lead_type === 'contact_form') {
    return lead.lead_type
  }

  const haystack = [lead.subject, lead.message, lead.notes, lead.source]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes('newsletter') || haystack.includes('subscribe')) {
    return 'newsletter_subscriber'
  }

  if (haystack.includes('appointment') || haystack.includes('book') || haystack.includes('meeting') || haystack.includes('consult')) {
    return 'appointment_request'
  }

  return 'contact_form'
}

function getLeadSource(lead: Lead) {
  const source = lead.source?.trim()
  if (source) {
    return source
  }

  const subject = lead.subject?.trim()
  if (subject?.startsWith('/')) {
    return subject
  }

  return '/contact'
}

function getLeadSearchText(lead: Lead) {
  const history = normalizeHistory(lead.follow_up_history)
    .map((entry) => entry.note)
    .join(' ')

  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.subject,
    lead.message,
    lead.notes,
    getLeadSource(lead),
    leadTypeLabelMap[getLeadType(lead)],
    history,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getLeadTypeLabel(type: LeadType) {
  return leadTypeLabelMap[type] || 'Contact form'
}

function getLeadTypeBadge(type: LeadType) {
  return leadTypeBadgeMap[type] || 'text-bg-secondary'
}

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<LeadStatus[]>([])
  const [leadTypeFilter, setLeadTypeFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [followUpDraft, setFollowUpDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load leads')
      }

      const nextLeads = data.submissions || []
      setLeads(nextLeads)
      setSelectedId((current) => current ?? nextLeads[0]?.id ?? null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchLeads()
  }, [fetchLeads])

  const sourceOptions = useMemo(() => {
    const counts = new Map<string, number>()

    for (const lead of leads) {
      const source = getLeadSource(lead)
      counts.set(source, (counts.get(source) || 0) + 1)
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([value, count]) => ({
        value,
        label: value,
        badge: count,
      }))
  }, [leads])

  const filteredLeads = useMemo(() => {
    const lowered = query.toLowerCase().trim()

    const nextLeads = leads.filter((lead) => {
      const leadType = getLeadType(lead)
      const source = getLeadSource(lead)
      const matchesQuery = !lowered || getLeadSearchText(lead).includes(lowered)
      const matchesStatus = !statusFilters.length || statusFilters.includes(lead.status)
      const matchesLeadType = !leadTypeFilter || leadTypeFilter === leadType
      const matchesSource = !sourceFilter || sourceFilter === source
      const matchesUnread = !unreadOnly || lead.status === 'new'

      return matchesQuery && matchesStatus && matchesLeadType && matchesSource && matchesUnread
    })

    return nextLeads.sort((left, right) => {
      const leftTime = parseDateValue(left.created_at)
      const rightTime = parseDateValue(right.created_at)

      switch (sortBy) {
        case 'oldest':
          return leftTime - rightTime
        case 'name-asc':
          return left.name.localeCompare(right.name)
        case 'name-desc':
          return right.name.localeCompare(left.name)
        default:
          return rightTime - leftTime
      }
    })
  }, [leads, query, statusFilters, leadTypeFilter, sourceFilter, unreadOnly, sortBy])

  const selectedLead = leads.find((lead) => lead.id === selectedId) || null
  const selectedLeadType = selectedLead ? getLeadType(selectedLead) : 'contact_form'
  const selectedLeadSource = selectedLead ? getLeadSource(selectedLead) : '/contact'
  const selectedLeadHistory = useMemo(() => {
    if (!selectedLead) {
      return []
    }

    return normalizeHistory(selectedLead.follow_up_history).sort(
      (left, right) => parseDateValue(right.created_at) - parseDateValue(left.created_at),
    )
  }, [selectedLead])

  useEffect(() => {
    if (!selectedLead) {
      setNotesDraft('')
      setFollowUpDraft('')
      return
    }

    setNotesDraft(selectedLead.notes ?? '')
    setFollowUpDraft('')
  }, [selectedLead])

  const updateLeadRecord = async (lead: Lead, payload: Partial<Lead>, successMessage?: string) => {
    setSaving(true)

    try {
      const response = await fetch(`/api/contact/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update lead')
      }

      const updatedLead = (data.submission || data.item || { ...lead, ...payload }) as Lead
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, ...updatedLead } : item)))

      if (successMessage) {
        toast.success(successMessage)
      }

      return updatedLead
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead')
      return null
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (lead: Lead, status: LeadStatus, shouldToast = true) => {
    const updatedLead = await updateLeadRecord(lead, { status }, shouldToast ? 'Lead status updated' : undefined)
    if (!updatedLead) {
      return
    }
  }

  const handleSelect = async (lead: Lead) => {
    setSelectedId(lead.id)

    if (lead.status === 'new') {
      await updateStatus(lead, 'read', false)
    }
  }

  const saveNotes = async () => {
    if (!selectedLead) {
      return
    }

    const nextNotes = notesDraft.trim()
    const updatedLead = await updateLeadRecord(
      selectedLead,
      { notes: nextNotes || null },
      nextNotes ? 'Notes saved' : 'Notes cleared',
    )

    if (updatedLead) {
      setNotesDraft(updatedLead.notes ?? '')
    }
  }

  const addFollowUp = async () => {
    if (!selectedLead) {
      return
    }

    const note = followUpDraft.trim()
    if (!note) {
      toast.error('Add a follow-up note first')
      return
    }

    const nextHistory = [
      ...selectedLeadHistory,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        note,
        created_at: new Date().toISOString(),
        kind: 'follow_up' as const,
      },
    ]

    const updatedLead = await updateLeadRecord(selectedLead, { follow_up_history: nextHistory }, 'Follow-up saved')
    if (updatedLead) {
      setFollowUpDraft('')
    }
  }

  const exportCsv = () => {
    const header = [
      'Name',
      'Email',
      'Phone',
      'Lead Type',
      'Source',
      'Subject',
      'Status',
      'Created At',
      'Notes',
      'Follow-up History',
      'Message',
    ]

    const rows = leads.map((lead) => {
      const history = normalizeHistory(lead.follow_up_history)
        .map((entry) => `${entry.created_at ? dateTimeFormatter.format(new Date(entry.created_at)) : 'Legacy'}: ${entry.note}`)
        .join(' | ')

      return [
        lead.name,
        lead.email,
        lead.phone,
        getLeadTypeLabel(getLeadType(lead)),
        getLeadSource(lead),
        lead.subject,
        statusLabelMap[lead.status],
        lead.created_at,
        lead.notes || '',
        history,
        lead.message.replace(/\r?\n/g, ' '),
      ]
    })

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setQuery('')
    setStatusFilters([])
    setLeadTypeFilter('')
    setSourceFilter('')
    setSortBy('newest')
    setUnreadOnly(false)
  }

  const totalLeadCount = leads.length
  const filteredLeadCount = filteredLeads.length

  return (
    <ModuleShell
      className="leads-wrap"
      title="Leads"
      description="Track contact form submissions, appointment requests, newsletter subscribers, and follow-up history."
      actions={(
        <button className="gbtn" type="button" onClick={exportCsv}>
          Export CSV
        </button>
      )}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181f',
            color: '#eeeeff',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />

      <div className="mb-3">
        <FilterPanel
          title="Lead filters"
          description="Search by name, email, source, message, notes, or history. Narrow by status, lead type, and source."
          actions={<FilterClearButton onClick={clearFilters} />}>
          <FilterGrid>
            <FilterSearch label="Search input" value={query} onChange={setQuery} onClear={() => setQuery('')} placeholder="Search leads..." />
            <FilterDropdown
              label="Lead type"
              value={leadTypeFilter}
              onChange={setLeadTypeFilter}
              options={leadTypeOptions}
              placeholder="All lead types"
            />
            <FilterDropdown
              label="Source"
              value={sourceFilter}
              onChange={setSourceFilter}
              options={sourceOptions}
              placeholder="All sources"
              searchable
            />
            <FilterSortDropdown value={sortBy} onChange={setSortBy} options={sortOptions} />
            <FilterSwitch label="Unread only" checked={unreadOnly} onChange={setUnreadOnly} hint="Only show leads still marked new" />
          </FilterGrid>

          <FilterTagChips
            label="Status"
            value={statusFilters}
            onChange={(values) => setStatusFilters(values as LeadStatus[])}
            options={statusOptions}
          />
        </FilterPanel>
      </div>

      <div className="row g-3 align-items-start">
        <div className="col-12 col-xl-8">
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const leadType = getLeadType(lead)
                  const source = getLeadSource(lead)
                  const dateLabel = dateFormatter.format(new Date(lead.created_at))

                  return (
                    <tr key={lead.id} className={`cm-click-row ${lead.id === selectedId ? 'active' : ''}`} onClick={() => void handleSelect(lead)}>
                      <td style={{ color: 'var(--t1)', fontWeight: 500 }}>
                        <div className="d-flex flex-column">
                          <span>{lead.name}</span>
                          <span className="text-muted" style={{ fontSize: 11 }}>
                            {lead.phone || 'No phone provided'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 10 }}>
                        <div className="d-flex flex-column">
                          <span>{lead.email}</span>
                          <span className="text-muted" style={{ fontSize: 11 }}>
                            {lead.subject || 'No subject'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getLeadTypeBadge(leadType)}`}>{getLeadTypeLabel(leadType)}</span>
                      </td>
                      <td>
                        <span className="cm-source-chip">{source}</span>
                      </td>
                      <td className="cm-lead-cell">{lead.message}</td>
                      <td className="mono">{dateLabel}</td>
                      <td>
                        <span className={`badge ${statusClassMap[lead.status]}`}>{statusLabelMap[lead.status]}</span>
                      </td>
                    </tr>
                  )
                })}
                {!filteredLeads.length && !loading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No leads found.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Loading leads...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-3">
            <span className="badge text-bg-secondary">{totalLeadCount} total</span>
            <span className="badge text-bg-info text-dark">{filteredLeadCount} visible</span>
            <span className="badge text-bg-dark">{statusFilters.length ? `${statusFilters.length} status filters` : 'All statuses'}</span>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card bg-transparent border border-white border-opacity-10 shadow-sm h-100">
            <div className="card-body d-flex flex-column gap-3">
              {selectedLead ? (
                <>
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div>
                      <h4 className="card-title mb-1">{selectedLead.name}</h4>
                      <div className="text-muted small">{selectedLead.email}</div>
                    </div>
                    <span className={`badge ${statusClassMap[selectedLead.status]}`}>{statusLabelMap[selectedLead.status]}</span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <span className={`badge ${getLeadTypeBadge(selectedLeadType)}`}>{getLeadTypeLabel(selectedLeadType)}</span>
                    <span className="cm-source-chip">{selectedLeadSource}</span>
                  </div>

                  <div className="d-grid gap-2">
                    <div>
                      <div className="text-uppercase small text-muted mb-1">Phone</div>
                      <div>{selectedLead.phone || 'No phone provided'}</div>
                    </div>
                    <div>
                      <div className="text-uppercase small text-muted mb-1">Subject</div>
                      <div>{selectedLead.subject || 'No subject provided'}</div>
                    </div>
                    <div>
                      <div className="text-uppercase small text-muted mb-1">Created</div>
                      <div>{dateTimeFormatter.format(new Date(selectedLead.created_at))}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-uppercase small text-muted mb-2">Status tracking</div>
                    <div className="d-flex flex-wrap gap-2">
                      {statusOptions.map((option) => {
                        const isActive = selectedLead.status === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-light'}`}
                            disabled={saving || isActive}
                            onClick={() => void updateStatus(selectedLead, option.value as LeadStatus)}>
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-uppercase small text-muted mb-2">Lead notes</div>
                    <textarea
                      className="form-control bg-transparent text-light border-white border-opacity-10"
                      rows={5}
                      value={notesDraft}
                      onChange={(event) => setNotesDraft(event.target.value)}
                      placeholder="Add internal notes, context, or reminders..."
                      disabled={saving}
                    />
                    <div className="d-flex justify-content-end mt-2">
                      <button className="btn btn-sm btn-outline-light" type="button" onClick={() => void saveNotes()} disabled={saving}>
                        Save notes
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-uppercase small text-muted mb-2">Follow-up history</div>
                    <div className="d-flex flex-column gap-2">
                      {selectedLeadHistory.length ? (
                        selectedLeadHistory.map((entry) => (
                          <div key={entry.id} className="rounded border border-white border-opacity-10 p-2">
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                              <span className="badge text-bg-secondary">{entry.kind === 'status' ? 'Status' : 'Follow-up'}</span>
                              <small className="text-muted">{entry.created_at ? dateTimeFormatter.format(new Date(entry.created_at)) : 'Legacy entry'}</small>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{entry.note}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted small">No follow-up history yet.</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-uppercase small text-muted mb-2">Add follow-up</div>
                    <textarea
                      className="form-control bg-transparent text-light border-white border-opacity-10"
                      rows={3}
                      value={followUpDraft}
                      onChange={(event) => setFollowUpDraft(event.target.value)}
                      placeholder="Log the next action, call outcome, or next step..."
                      disabled={saving}
                    />
                    <div className="d-flex justify-content-end mt-2">
                      <button className="btn btn-sm btn-primary" type="button" onClick={() => void addFollowUp()} disabled={saving}>
                        Add follow-up
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-uppercase small text-muted mb-2">Message</div>
                    <div className="rounded border border-white border-opacity-10 p-3" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedLead.message || 'No message provided.'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted">Select a lead to review the full submission, notes, and follow-up history.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  )
}

export default LeadsPage
