'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

type Primitive = string | number | boolean | null | undefined

type FieldType = 'text' | 'textarea' | 'email' | 'url' | 'image' | 'checkbox'

type FieldConfig<T> = {
  key: keyof T
  label: string
  type?: FieldType
  placeholder?: string
}

type CollectionManagerPageProps<T extends Record<string, any>> = {
  title: string
  subtitle: string
  endpoint: string
  listKey: string
  itemLabel: string
  emptyItem: () => T
  fields: FieldConfig<T>[]
  titleField: keyof T
  descriptionField?: keyof T
  reorderable?: boolean
  searchable?: boolean
}

const uploadAsset = async (file: File) => {
  const formData = new FormData()
  formData.append('files', file)

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  })
  const data = await response.json()

  if (!response.ok || !data.success || !data.uploaded?.[0]?.url) {
    throw new Error(data.error || 'Upload failed')
  }

  return data.uploaded[0].url as string
}

const normalizeBoolean = (value: Primitive) => value === true || value === 1 || value === '1'

const CollectionManagerPage = <T extends Record<string, any>>({
  title,
  subtitle,
  endpoint,
  listKey,
  itemLabel,
  emptyItem,
  fields,
  titleField,
  descriptionField,
  reorderable = false,
  searchable = true,
}: CollectionManagerPageProps<T>) => {
  const [items, setItems] = useState<T[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<T>(emptyItem())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [loadNotice, setLoadNotice] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setLoadNotice('')
    try {
      const response = await fetch(endpoint)
      const data = await response.json().catch(() => null)

      if (response.status === 503 || data?.available === false || data?.error?.includes('unavailable')) {
        setItems([])
        setSelectedId(null)
        setDraft(emptyItem())
        setLoadNotice(data?.notice || `${itemLabel} is not available yet.`)
        return
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to load ${itemLabel}`)
      }

      const nextItems = data[listKey] || []
      setItems(nextItems)
      setSelectedId((current) => {
        if (current && nextItems.some((item: T) => item.id === current)) {
          return current
        }
        return nextItems[0]?.id ?? null
      })

      if (!nextItems.length) {
        setDraft(emptyItem())
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to load ${itemLabel}`)
    } finally {
      setLoading(false)
    }
  }, [endpoint, itemLabel, listKey, emptyItem])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (selectedId == null) {
      return
    }

    const selectedItem = items.find((item) => item.id === selectedId)
    if (selectedItem) {
      setDraft(selectedItem)
    }
  }, [items, selectedId])

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items
    }

    const lowered = query.toLowerCase()
    return items.filter((item) => {
      const titleValue = String(item[titleField] ?? '').toLowerCase()
      const descriptionValue = descriptionField ? String(item[descriptionField] ?? '').toLowerCase() : ''
      return titleValue.includes(lowered) || descriptionValue.includes(lowered)
    })
  }, [descriptionField, items, query, titleField])

  const handleCreate = () => {
    setSelectedId(null)
    setDraft(emptyItem())
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = draft.id ? 'PUT' : 'POST'
      const url = draft.id ? `${endpoint}/${draft.id}` : endpoint

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to save ${itemLabel}`)
      }

      const saved = data.item || data[itemLabel] || data.service || data.member || data.faq
      await fetchItems()
      setSelectedId(saved?.id ?? null)
      if (saved) {
        setDraft(saved)
      }
      toast.success(`${itemLabel} saved`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to save ${itemLabel}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft.id) {
      setDraft(emptyItem())
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`${endpoint}/${draft.id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to delete ${itemLabel}`)
      }

      toast.success(`${itemLabel} deleted`)
      setSelectedId(null)
      setDraft(emptyItem())
      await fetchItems()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to delete ${itemLabel}`)
    } finally {
      setSaving(false)
    }
  }

  const persistOrder = async (nextItems: T[]) => {
    try {
      await Promise.all(
        nextItems
          .filter((item) => item.id)
          .map((item, index) =>
            fetch(`${endpoint}/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_index: index }),
            }),
          ),
      )
      toast.success('Order updated')
      await fetchItems()
    } catch {
      toast.error('Failed to update order')
    }
  }

  const reorderItems = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return
    }

    const nextItems = [...items]
    const [moved] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, moved)
    setItems(nextItems)
    await persistOrder(nextItems)
  }

  const updateField = (key: keyof T, value: Primitive) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleUpload = async (field: keyof T, file: File) => {
    setUploadingField(String(field))
    try {
      const url = await uploadAsset(file)
      updateField(field, url)
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div className="info-wrap">
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

      <div className="pg-hd">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="pg-actions">
          <button className="gbtn" type="button" onClick={handleCreate}>
            + New {itemLabel}
          </button>
          <button className="gbtn pu" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : `Save ${itemLabel}`}
          </button>
        </div>
      </div>

      {loadNotice ? <div className="layout-side-empty">{loadNotice}</div> : null}

      <div className="cm-manager-grid">
        <div className="ic">
          <div className="ic-h">Library</div>
          <div className="cm-manager-list-wrap">
            {searchable ? (
              <div className="tbl-toolbar">
                <input
                  className="srch"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${itemLabel.toLowerCase()}...`}
                />
              </div>
            ) : null}
            <div className="cm-manager-list">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id ?? `new-${index}`}
                  type="button"
                  draggable={reorderable}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => reorderable && event.preventDefault()}
                  onDrop={() => {
                    if (reorderable && dragIndex != null) {
                      void reorderItems(dragIndex, index)
                    }
                    setDragIndex(null)
                  }}
                  className={`cm-manager-item ${item.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(item.id ?? null)}>
                  <div className="cm-manager-item-top">
                    <strong>{String(item[titleField] || `Untitled ${itemLabel}`)}</strong>
                    {'is_active' in item ? (
                      <span className={`badge ${normalizeBoolean(item.is_active) ? 'bu' : 'bb'}`}>
                        {normalizeBoolean(item.is_active) ? 'Active' : 'Inactive'}
                      </span>
                    ) : null}
                  </div>
                  {descriptionField ? (
                    <span className="cm-manager-subtle">{String(item[descriptionField] || '').slice(0, 90) || 'No summary yet'}</span>
                  ) : null}
                </button>
              ))}
              {!filteredItems.length && !loading ? <div className="cm-manager-empty">No items found.</div> : null}
            </div>
          </div>
        </div>

        <div className="ic">
          <div className="ic-h">Editor</div>
          <div className="ic-b">
            {fields.map((field) => (
              <div className={`ig ${field.type === 'textarea' ? 'full' : ''}`} key={String(field.key)}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={String(draft[field.key] ?? '')}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'checkbox' ? (
                  <label className="cm-check-row">
                    <input
                      type="checkbox"
                      checked={normalizeBoolean(draft[field.key])}
                      onChange={(event) => updateField(field.key, event.target.checked)}
                    />
                    <span>Enabled</span>
                  </label>
                ) : (
                  <>
                    <input
                      type={field.type === 'image' ? 'text' : field.type || 'text'}
                      value={String(draft[field.key] ?? '')}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                    {field.type === 'image' ? (
                      <>
                        <input
                          type="file"
                          className="form-control mt-2"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              void handleUpload(field.key, file)
                            }
                          }}
                        />
                        <small className="text-muted">
                          {uploadingField === String(field.key) ? 'Uploading...' : 'Upload image'}
                        </small>
                        {draft[field.key] ? (
                          <div className="cm-settings-asset-preview">
                            <img src={String(draft[field.key])} alt={field.label} />
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="cm-manager-footer">
            <button className="gbtn" type="button" onClick={handleCreate}>
              Reset
            </button>
            <button className="gbtn danger" type="button" onClick={handleDelete} disabled={!draft.id || saving}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionManagerPage
