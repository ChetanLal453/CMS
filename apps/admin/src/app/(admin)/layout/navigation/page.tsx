'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type NavItem = {
  id: string
  label: string
  url: string
  status: 'live' | 'draft'
  isDropdown: boolean
  newTab: boolean
  children: NavItem[]
}

type PagePoolItem = {
  id?: number
  name: string
  label: string
  url: string
  status: 'live' | 'draft'
}

const makeItem = (partial: Partial<NavItem> = {}): NavItem => ({
  id: partial.id || `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: partial.label || 'New Link',
  url: partial.url || '/new-link',
  status: partial.status === 'draft' ? 'draft' : 'live',
  isDropdown: Boolean(partial.isDropdown),
  newTab: Boolean(partial.newTab),
  children: Array.isArray(partial.children) ? partial.children : [],
})

const normalizeComparableUrl = (url: string) => {
  const value = String(url || '').trim()
  return !value ? '' : value === '/' ? '/' : value.replace(/\/+$/, '')
}

const normalizeItem = (item: any): NavItem => ({
  id: String(item?.id || `nav-${Date.now()}`),
  label: item?.label || 'Untitled Link',
  url: item?.url || item?.href || '/',
  status: item?.status === 'draft' ? 'draft' : 'live',
  isDropdown: Boolean(item?.is_dropdown ?? item?.isDropdown ?? (Array.isArray(item?.children) && item.children.length)),
  newTab: Boolean(item?.new_tab ?? item?.open_new_tab),
  children: Array.isArray(item?.children) ? item.children.map(normalizeItem) : [],
})

const flattenTree = (items: NavItem[], depth = 0, parentId: string | null = null): Array<NavItem & { depth: number; parentId: string | null }> =>
  items.flatMap((item) => [
    { ...item, depth, parentId },
    ...flattenTree(item.children || [], depth + 1, item.id),
  ])

const updateTree = (items: NavItem[], targetId: string, updater: (item: NavItem) => NavItem): NavItem[] =>
  items.map((item) => (item.id === targetId ? updater(item) : { ...item, children: updateTree(item.children || [], targetId, updater) }))

const removeTreeItem = (items: NavItem[], targetId: string): NavItem[] =>
  items.filter((item) => item.id !== targetId).map((item) => ({ ...item, children: removeTreeItem(item.children || [], targetId) }))

const containsItem = (items: NavItem[], targetId: string): boolean =>
  items.some((item) => item.id === targetId || containsItem(item.children || [], targetId))

const collectItemIds = (items: NavItem[]): Set<string> => {
  const ids = new Set<string>()
  const visit = (list: NavItem[]) => {
    for (const item of list) {
      ids.add(item.id)
      visit(item.children || [])
    }
  }
  visit(items)
  return ids
}

const extractTreeItem = (
  items: NavItem[],
  targetId: string,
): {
  tree: NavItem[]
  removed: NavItem | null
} => {
  let removed: NavItem | null = null
  const tree = items.flatMap((item) => {
    if (item.id === targetId) {
      removed = item
      return []
    }

    const nextChildren = extractTreeItem(item.children || [], targetId)
    if (nextChildren.removed) {
      removed = nextChildren.removed
    }

    return [
      {
        ...item,
        children: nextChildren.tree,
      },
    ]
  })

  return { tree, removed }
}

const pruneDropdown = (items: NavItem[]): NavItem[] =>
  items.map((item) => {
    const children = pruneDropdown(item.children || [])
    return { ...item, children, isDropdown: item.isDropdown || children.length > 0 }
  })

const reorderItems = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

const moveTreeItem = (items: NavItem[], parentId: string | null, fromIndex: number, toIndex: number): NavItem[] =>
  parentId === null
    ? reorderItems(items, fromIndex, toIndex)
    : updateTree(items, parentId, (item) => ({ ...item, children: reorderItems(item.children || [], fromIndex, toIndex) }))

const moveItemToParent = (items: NavItem[], targetId: string, parentId: string | null): NavItem[] => {
  const source = extractTreeItem(items, targetId)
  const removed = source.removed
  if (!removed) {
    return items
  }

  if (parentId === targetId) {
    return items
  }

  if (parentId && containsItem(removed.children || [], parentId)) {
    return items
  }

  const nextParent = parentId === null
    ? [...source.tree, { ...removed, children: removed.children || [] }]
    : updateTree(source.tree, parentId, (item) => ({
        ...item,
        isDropdown: true,
        children: [...(item.children || []), { ...removed, children: removed.children || [] }],
      }))

  return pruneDropdown(nextParent)
}

const findTreeItem = (items: NavItem[], targetId: string, parentId: string | null = null): { item: NavItem; parentId: string | null } | null => {
  for (const item of items) {
    if (item.id === targetId) return { item, parentId }
    const nested = findTreeItem(item.children || [], targetId, item.id)
    if (nested) return nested
  }
  return null
}

const serializeItems = (items: NavItem[]): any[] =>
  items.map((item) => ({
    label: item.label,
    url: item.url,
    status: item.status,
    is_dropdown: item.isDropdown,
    new_tab: item.newTab,
    children: serializeItems(item.children || []),
  }))

export default function NavigationAdminPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [pages, setPages] = useState<PagePoolItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [pageParentId, setPageParentId] = useState('root')
  const [externalLabel, setExternalLabel] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [loadingNav, setLoadingNav] = useState(true)
  const [loadingPages, setLoadingPages] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveNote, setSaveNote] = useState('')
  const [dragState, setDragState] = useState<{ parentId: string | null; index: number } | null>(null)

  const selectedContext = useMemo(() => (selectedId ? findTreeItem(items, selectedId) : null), [items, selectedId])
  const selectedItem = selectedContext?.item ?? null
  const selectedIsRoot = selectedContext?.parentId === null
  const flattenedItems = useMemo(() => flattenTree(items), [items])
  const selectedDescendantIds = useMemo(
    () => (selectedItem ? collectItemIds(selectedItem.children || []) : new Set<string>()),
    [selectedItem],
  )
  const parentOptions = useMemo(
    () => [{ id: 'root', label: 'Top level' }, ...flattenedItems.map((item) => ({ id: item.id, label: `${'— '.repeat(item.depth)}${item.label}` }))],
    [flattenedItems],
  )
  const moveParentOptions = useMemo(
    () => parentOptions.filter((option) => option.id === 'root' || (option.id !== selectedId && !selectedDescendantIds.has(option.id))),
    [parentOptions, selectedDescendantIds, selectedId],
  )
  const availablePages = useMemo(() => {
    const existing = new Set(flattenedItems.map((item) => normalizeComparableUrl(item.url)))
    return pages.filter((page) => !existing.has(normalizeComparableUrl(page.url)))
  }, [flattenedItems, pages])

  const loadNavigation = useCallback(async () => {
    setLoadingNav(true)
    try {
      const response = await fetch('/api/navigation', { credentials: 'include' })
      const data = await response.json().catch(() => null)
      if (response.ok && data?.success) {
        const nextItems = Array.isArray(data.navigation)
          ? data.navigation.map(normalizeItem)
          : Array.isArray(data.items)
            ? data.items.map(normalizeItem)
            : []
        setItems(nextItems)
        setExpanded(
          flattenTree(nextItems).reduce<Record<string, boolean>>((acc, item) => {
            if (item.children.length) acc[item.id] = true
            return acc
          }, {}),
        )
      }
    } finally {
      setLoadingNav(false)
    }
  }, [])

  const loadPages = useCallback(async () => {
    setLoadingPages(true)
    try {
      const response = await fetch('/api/pages', { credentials: 'include' })
      const data = await response.json().catch(() => null)
      if (response.ok && Array.isArray(data?.pages)) {
        setPages(
          data.pages
            .map((page: any) => ({
              id: page.id,
              name: page.name || page.label || 'Untitled Page',
              label: page.label || page.name || 'Untitled Page',
              url: page.url || '/',
              status: page.status === 'draft' ? 'draft' : 'live',
            }))
            .sort((a: PagePoolItem, b: PagePoolItem) => Number(b.id ?? 0) - Number(a.id ?? 0)),
        )
      }
    } finally {
      setLoadingPages(false)
    }
  }, [])

  useEffect(() => {
    void loadNavigation()
    void loadPages()
  }, [loadNavigation, loadPages])

  useEffect(() => {
    const onPagesUpdated = () => void loadPages()
    window.addEventListener('cm-pages-updated', onPagesUpdated)
    return () => window.removeEventListener('cm-pages-updated', onPagesUpdated)
  }, [loadPages])

  useEffect(() => {
    if (!saveNote) return
    const timer = window.setTimeout(() => setSaveNote(''), 2800)
    return () => window.clearTimeout(timer)
  }, [saveNote])

  const persist = async (nextItems: NavItem[]) => {
    setSaving(true)
    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: serializeItems(nextItems) }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Failed to save navigation')
      setSaveNote('Navigation saved. Public site will reflect changes on next page load.')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cm-navigation-updated'))
      }
      return true
    } catch (error) {
      setSaveNote(error instanceof Error ? error.message : 'Failed to save navigation')
      return false
    } finally {
      setSaving(false)
    }
  }

  const addTopLevel = async () => {
    const next = [...items, makeItem({ label: 'New Link', url: '/new-link', status: 'draft' })]
    setItems(next)
    await persist(next)
  }

  const addSubItem = async (parentId: string) => {
    const child = makeItem({ label: 'Sub Link', url: '/sub-link', status: 'draft' })
    const next = updateTree(items, parentId, (parent) => ({
      ...parent,
      isDropdown: true,
      children: [...(parent.children || []), child],
    }))
    setItems(next)
    setExpanded((current) => ({ ...current, [parentId]: true }))
    setSelectedId(child.id)
    await persist(next)
  }

  const addFromPage = async (page: PagePoolItem) => {
    const parentId = pageParentId === 'root' ? null : pageParentId
    const comparable = normalizeComparableUrl(page.url)
    if (flattenedItems.some((item) => normalizeComparableUrl(item.url) === comparable)) {
      window.alert(`"${page.label}" is already in the nav.`)
      return
    }

    const newItem = makeItem({ label: page.label || page.name, url: page.url, status: page.status })
    const next = parentId === null
      ? [...items, newItem]
      : updateTree(items, parentId, (parent) => ({
          ...parent,
          isDropdown: true,
          children: [...(parent.children || []), newItem],
        }))

    setItems(next)
    if (parentId) setExpanded((current) => ({ ...current, [parentId]: true }))
    setSelectedId(newItem.id)
    await persist(next)
  }

  const addExternal = async () => {
    const label = externalLabel.trim()
    const url = externalUrl.trim()
    if (!label || !url) return
    const next = [...items, makeItem({ label, url, status: 'live', newTab: true })]
    setItems(next)
    setExternalLabel('')
    setExternalUrl('')
    setSelectedId(next[next.length - 1].id)
    await persist(next)
  }

  const deleteItem = async (id: string) => {
    const next = pruneDropdown(removeTreeItem(items, id))
    setItems(next)
    if (selectedId === id) setSelectedId(null)
    await persist(next)
  }

  const moveItem = async (id: string, dir: number) => {
    const index = items.findIndex((item) => item.id === id)
    const nextIndex = index + dir
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return
    const next = reorderItems(items, index, nextIndex)
    setItems(next)
    await persist(next)
  }

  const moveDragged = async (parentId: string | null, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const next = moveTreeItem(items, parentId, fromIndex, toIndex)
    setItems(next)
    await persist(next)
  }

  const updateItem = (id: string, key: keyof NavItem, value: string | boolean) => {
    setItems((current) => updateTree(current, id, (item) => ({ ...item, [key]: value } as NavItem)))
  }

  const moveSelectedItem = async (nextParentId: string | null) => {
    if (!selectedItem) return
    if (selectedContext?.parentId === nextParentId) return
    const next = moveItemToParent(items, selectedItem.id, nextParentId)
    setItems(next)
    if (nextParentId) {
      setExpanded((current) => ({ ...current, [nextParentId]: true }))
    }
    await persist(next)
  }

  const renderPreview = (tree: NavItem[], depth = 0): React.ReactNode =>
    tree.map((item) => (
      <span key={`preview-${item.id}`} className={`prev-item ${item.isDropdown ? 'has-drop' : ''}`} style={{ marginLeft: depth ? `${depth * 18}px` : 0 }}>
        {item.label}
      </span>
    ))

  const renderTree = (tree: NavItem[], parentId: string | null = null, depth = 0): React.ReactNode =>
    tree.map((item, index) => {
      const hasChildren = item.children.length > 0
      const isExpanded = expanded[item.id] ?? true
      const isSelected = selectedId === item.id

      return (
        <div key={item.id} className={`nav-item ${isSelected ? 'selected' : ''}`} onDragOver={(event) => event.preventDefault()}>
          <div
            className="nav-row"
            style={{ paddingLeft: `${12 + depth * 18}px` }}
            draggable
            onDragStart={() => setDragState({ parentId, index })}
            onDrop={() => {
              if (dragState && dragState.parentId === parentId && dragState.index !== index) {
                void moveDragged(parentId, dragState.index, index)
              }
              setDragState(null)
            }}
            onClick={() => setSelectedId(item.id)}>
            <span className="drag-handle">⠿</span>
            <button type="button" className={`nav-expand ${hasChildren ? '' : 'empty'}`} onClick={(event) => { event.stopPropagation(); if (hasChildren) toggle(item.id) }} title={hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : 'No children'}>
              {hasChildren ? (isExpanded ? '▾' : '▸') : ''}
            </button>
            <span className="nav-label">{item.label}</span>
            <span className="nav-url">{item.url}</span>
            <span className="nav-badges">
              <span className={`badge ${item.status === 'live' ? 'badge-live' : 'badge-draft'}`}>{item.status}</span>
              {item.isDropdown || hasChildren ? <span className="badge badge-drop">dropdown</span> : null}
              {item.newTab ? <span className="badge badge-ext">↗</span> : null}
            </span>
            <span className="nav-actions">
              <span className="nav-act" onClick={(event) => { event.stopPropagation(); void moveItem(item.id, -1) }} title="Move up">↑</span>
              <span className="nav-act" onClick={(event) => { event.stopPropagation(); void moveItem(item.id, 1) }} title="Move down">↓</span>
              <span className="nav-act del" onClick={(event) => { event.stopPropagation(); void deleteItem(item.id) }} title="Delete">⌫</span>
            </span>
          </div>

          {hasChildren ? (
            <div className={`sub-items ${isExpanded ? 'open' : ''}`}>
              {isExpanded ? renderTree(item.children || [], item.id, depth + 1) : null}
              <button type="button" className="add-sub" style={{ marginLeft: `${30 + depth * 18}px` }} onClick={(event) => { event.stopPropagation(); void addSubItem(item.id) }}>
                + Add sub-link under {item.label || 'this item'}
              </button>
            </div>
          ) : null}
        </div>
      )
    })

  const toggle = (id: string) => setExpanded((current) => ({ ...current, [id]: !current[id] }))

  const editPanel = () => {
    if (!selectedItem) {
      return <div className="note" style={{ textAlign: 'center' }}>Click any nav item to edit it</div>
    }

    return (
      <>
        <div className="rp-label" style={{ marginTop: 0 }}>Parent Item</div>
        <select
          className="rp-select"
          value={selectedContext?.parentId ?? 'root'}
          onChange={(event) => void moveSelectedItem(event.target.value === 'root' ? null : event.target.value)}>
          {moveParentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="rp-label" style={{ marginTop: 0 }}>Label</div>
        <input className="rp-input" value={selectedItem.label} onChange={(event) => updateItem(selectedItem.id, 'label', event.target.value)} placeholder="Link label" />

        <div className="rp-label">URL / Path</div>
        <input className="rp-input" value={selectedItem.url} onChange={(event) => updateItem(selectedItem.id, 'url', event.target.value)} placeholder="/about" />

        {selectedIsRoot ? (
          <>
            <div className="rp-label">Options</div>
            <div style={{ border: '1px solid var(--b2)', borderRadius: '8px', padding: '0 9px' }}>
              <div className="tgrow">
                <span className="tglbl">Has dropdown children</span>
                <div className={`tg ${selectedItem.isDropdown ? 'on' : ''}`} onClick={() => updateItem(selectedItem.id, 'isDropdown', !selectedItem.isDropdown)} />
              </div>
              <div className="tgrow">
                <span className="tglbl">Open in new tab</span>
                <div className={`tg ${selectedItem.newTab ? 'on' : ''}`} onClick={() => updateItem(selectedItem.id, 'newTab', !selectedItem.newTab)} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rp-label">Status</div>
            <div style={{ border: '1px solid var(--b2)', borderRadius: '8px', padding: '0 9px' }}>
              <div className="tgrow">
                <span className="tglbl">Live</span>
                <div className={`tg ${selectedItem.status === 'live' ? 'on' : ''}`} onClick={() => updateItem(selectedItem.id, 'status', 'live')} />
              </div>
              <div className="tgrow">
                <span className="tglbl">Draft</span>
                <div className={`tg ${selectedItem.status === 'draft' ? 'on' : ''}`} onClick={() => updateItem(selectedItem.id, 'status', 'draft')} />
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
          <button className="btn del" style={{ color: 'var(--rd)', borderColor: 'var(--rdd)', flex: 1 }} onClick={() => void deleteItem(selectedItem.id)}>
            Delete
          </button>
          {selectedIsRoot && selectedItem.isDropdown ? (
            <button className="btn pu" style={{ flex: 1, fontSize: '10px' }} onClick={() => void addSubItem(selectedItem.id)}>
              + Add sub-link
            </button>
          ) : null}
        </div>
      </>
    )
  }

  return (
    <div className="navmgr-shell">
      <div className="shell">
        <div className="topbar">
          <div>
            <div className="topbar-title">Navigation Manager</div>
            <div className="topbar-sub">Drag to reorder · Click item to edit · Save Navigation to publish field changes</div>
          </div>
          <div className="topbar-btns">
            <button className="btn" type="button" onClick={() => void addTopLevel()}>+ Add Link</button>
            <button className="btn pu" type="button" onClick={() => void persist(items)} disabled={saving}>{saving ? 'Saving...' : 'Save Navigation'}</button>
          </div>
        </div>

        <div className="body">
          <div className="left">
            <div className="section-label">Live preview</div>
            <div className="preview-bar">{loadingNav ? <span className="note" style={{ padding: '6px 8px' }}>Loading navigation...</span> : renderPreview(items)}</div>

            <div className="section-label">Navigation structure</div>
            <div className="nav-builder">
              {loadingNav ? <div className="note" style={{ width: '100%' }}>Loading navigation...</div> : items.length ? renderTree(items) : <div className="note" style={{ width: '100%' }}>No navigation items yet.</div>}
            </div>

            <div className="add-zone" onClick={() => void addTopLevel()}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#50506a" strokeWidth="2" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg>
              Add top-level link - or drag a page from the right panel
            </div>

            <div className="note" style={{ display: saveNote ? 'block' : 'none', background: 'var(--grd)', borderColor: 'rgba(16,217,130,.2)', color: 'var(--grl)' }}>{saveNote}</div>
          </div>

          <div className="right">
            <div className="section-label">Edit selected item</div>
            {editPanel()}

            <div className="rp-label" style={{ marginTop: '16px' }}>Add from your pages</div>
            <div className="ig">
              <label>Parent Item</label>
              <select className="rp-select" value={pageParentId} onChange={(event) => setPageParentId(event.target.value)}>
                {parentOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </div>
            <div className="pages-pool">
              {loadingPages ? <div className="note">Loading pages...</div> : availablePages.map((page) => (
                <div key={page.url} className="pool-item" onClick={() => void addFromPage(page)}>
                  <span className="dot" style={{ background: page.status === 'live' ? 'var(--gr)' : 'var(--am)' }} />
                  <span className="pool-name">{page.label}</span>
                  <span className="pool-url">{page.url}</span>
                  <span className="add-icon">+ add</span>
                </div>
              ))}
            </div>

            <div className="rp-label">Add external link</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <input className="rp-input" placeholder="Label" style={{ margin: 0, flex: 1 }} value={externalLabel} onChange={(event) => setExternalLabel(event.target.value)} />
              <input className="rp-input" placeholder="URL" style={{ margin: 0, flex: 1 }} value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} />
              <button className="btn" style={{ flexShrink: 0, fontSize: '10px' }} onClick={() => void addExternal()}>+</button>
            </div>

            <div className="note">When you create a new page in Page Editor, it appears in "Add from your pages" above automatically.</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .navmgr-shell { padding: 0; }
        .navmgr-shell .shell { background: var(--bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--b2); }
        .navmgr-shell .topbar { background: var(--s1); border-bottom: 1px solid var(--b1); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
        .navmgr-shell .topbar-title { font-size: 13px; font-weight: 600; color: var(--t1); }
        .navmgr-shell .topbar-sub { font-size: 10px; color: var(--t3); margin-top: 1px; }
        .navmgr-shell .topbar-btns { display: flex; gap: 6px; }
        .navmgr-shell .btn { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer; border: 1px solid var(--b2); background: var(--s2); color: var(--t2); font-family: inherit; }
        .navmgr-shell .btn:hover { border-color: var(--b3); color: var(--t1); }
        .navmgr-shell .btn.pu { background: var(--pu); border-color: var(--pu2); color: #fff; }
        .navmgr-shell .btn.pu:hover { background: var(--pu2); }
        .navmgr-shell .body { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 0; }
        .navmgr-shell .left { padding: 16px; }
        .navmgr-shell .right { background: var(--s1); border-left: 1px solid var(--b1); padding: 14px; }
        .navmgr-shell .section-label { font-size: 9px; font-weight: 700; color: var(--t4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .navmgr-shell .preview-bar { background: var(--s2); border: 1px solid var(--b1); border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; min-height: 36px; }
        .navmgr-shell .add-zone { border: 1.5px dashed var(--b3); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--t4); font-size: 11px; transition: all 0.15s; margin-bottom: 16px; }
        .navmgr-shell .add-zone:hover { border-color: var(--pu); color: var(--pul); background: var(--pud); }
        .navmgr-shell .note { font-size: 9px; color: var(--t4); line-height: 1.5; padding: 7px 9px; background: var(--s2); border-radius: 6px; border: 1px solid var(--b1); }
        .navmgr-shell .rp-label { font-size: 9px; font-weight: 700; color: var(--t4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; margin-top: 12px; }
        .navmgr-shell .rp-input, .navmgr-shell .rp-select { width: 100%; background: var(--s2); border: 1px solid var(--b1); color: var(--t2); padding: 6px 9px; border-radius: 6px; font-size: 11px; outline: none; font-family: inherit; margin-bottom: 8px; }
        .navmgr-shell .rp-input:focus, .navmgr-shell .rp-select:focus { border-color: rgba(124, 92, 252, 0.6); color: var(--t1); }
        .navmgr-shell .pages-pool { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
        .navmgr-shell .pool-item { display: flex; align-items: center; gap: 7px; padding: 6px 9px; background: var(--s2); border: 1px solid var(--b1); border-radius: 6px; cursor: pointer; font-size: 11px; color: var(--t2); transition: all 0.12s; }
        .navmgr-shell .pool-item:hover { border-color: rgba(124, 92, 252, 0.4); color: var(--pul); background: var(--pud); }
        .navmgr-shell .pool-item .dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .navmgr-shell .pool-item .add-icon { margin-left: auto; font-size: 10px; color: var(--t4); }
        .navmgr-shell .pool-item:hover .add-icon { color: var(--pul); }
        .navmgr-shell .tgrow { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid var(--b1); }
        .navmgr-shell .tgrow:last-child { border: none; }
        .navmgr-shell .tglbl { font-size: 10px; color: var(--t2); }
        .navmgr-shell .tg { width: 28px; height: 15px; background: var(--s4); border-radius: 8px; position: relative; cursor: pointer; border: 1px solid var(--b2); transition: background 0.15s; flex-shrink: 0; }
        .navmgr-shell .tg.on { background: var(--pu); border-color: var(--pu2); }
        .navmgr-shell .tg::after { content: ''; position: absolute; width: 9px; height: 9px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: left 0.15s; }
        .navmgr-shell .tg.on::after { left: 15px; }
        .navmgr-shell .sub-items { background: var(--s2); border-top: 1px solid var(--b1); border-radius: 0 0 8px 8px; padding: 6px 6px 6px 10px; margin-top: -2px; display: none; }
        .navmgr-shell .sub-items.open { display: block; }
        .navmgr-shell .add-sub { display: flex; align-items: center; gap: 6px; padding: 6px 10px 6px 40px; border-top: 1px solid var(--b1); cursor: pointer; color: var(--t4); font-size: 10px; transition: all 0.12s; background: transparent; border-left: 0; border-right: 0; border-bottom: 0; width: 100%; text-align: left; }
        .navmgr-shell .add-sub:hover { color: var(--pul); background: var(--pud); }
        @media (max-width: 980px) { .navmgr-shell .body { grid-template-columns: 1fr; } .navmgr-shell .right { border-left: 0; border-top: 1px solid var(--b1); } }
      `}</style>
    </div>
  )
}
