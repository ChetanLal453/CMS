import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { Page, PageLayout } from '@/types/page-editor'
import { normalizeLayoutToEditor } from '@uadmin/shared/page/layout'
import { getApiErrorMessage } from '@/lib/apiHelpers'

type EditorPage = Page & {
  slug?: string
  title?: string
  banner_slug?: string | null
  current_revision_id?: number | null
  published_revision_id?: number | null
}

const emptyLayout = (pageId = '', pageName = ''): PageLayout => ({
  id: pageId,
  name: pageName,
  sections: [],
})

const coerceEditorLayout = (layout: unknown, page?: Partial<EditorPage>): PageLayout =>
  normalizeLayoutToEditor(layout, {
    id: page?.id,
    name: page?.name,
    title: page?.title,
  }) as PageLayout

export const usePageData = (initialPageId?: string) => {
  const [pages, setPages] = useState<EditorPage[]>([])
  const [currentPageId, setCurrentPageId] = useState<string | null>(initialPageId || null)
  const [layout, setLayout] = useState<PageLayout>(emptyLayout())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRevisionId, setCurrentRevisionId] = useState<number | null>(null)
  const [publishedRevisionId, setPublishedRevisionId] = useState<number | null>(null)
  const [saveConflict, setSaveConflict] = useState(false)
  const activePagesFetchRequestRef = useRef(0)
  const activeLoadRequestRef = useRef(0)
  const activeSaveRequestRef = useRef(0)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const hasResolvedInitialPageRef = useRef(false)
  const currentPageIdRef = useRef<string | null>(initialPageId || null)
  const currentRevisionIdRef = useRef<number | null>(null)
  const saveConflictRef = useRef(false)

  useEffect(() => {
    currentPageIdRef.current = currentPageId
  }, [currentPageId])

  useEffect(() => {
    currentRevisionIdRef.current = currentRevisionId
  }, [currentRevisionId])

  useEffect(() => {
    saveConflictRef.current = saveConflict
  }, [saveConflict])

  const syncRevisionState = useCallback((nextCurrentRevisionId?: number | null, nextPublishedRevisionId?: number | null) => {
    const normalizedCurrentRevisionId = nextCurrentRevisionId == null ? null : Number(nextCurrentRevisionId)
    const normalizedPublishedRevisionId = nextPublishedRevisionId == null ? null : Number(nextPublishedRevisionId)

    currentRevisionIdRef.current = normalizedCurrentRevisionId
    setCurrentRevisionId(normalizedCurrentRevisionId)
    setPublishedRevisionId(normalizedPublishedRevisionId)
  }, [])

  const clearSaveConflict = useCallback(() => {
    saveConflictRef.current = false
    setSaveConflict(false)
  }, [])

  const fetchPages = useCallback(async () => {
    const requestId = activePagesFetchRequestRef.current + 1
    activePagesFetchRequestRef.current = requestId

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/pages')
      const data = await response.json()

      if (!response.ok || !data.success) {
        if (requestId !== activePagesFetchRequestRef.current) return
        setError(getApiErrorMessage(data, 'Failed to fetch pages'))
        return
      }

      const pagesPayload = Array.isArray(data?.pages) ? data.pages : []

      const pagesData: EditorPage[] = pagesPayload.map((page: any) => ({
        id: String(page.id),
        name: page.name || page.title || 'Untitled Page',
        title: page.title || page.name || 'Untitled Page',
        slug: page.slug || '',
        sections: [],
        active: page.active !== false,
        disabled: Boolean(page.disabled),
        header_slug: page.header_slug ?? null,
        footer_slug: page.footer_slug ?? null,
        banner_slug: page.banner_slug ?? null,
        current_revision_id: page.current_revision_id ?? null,
        published_revision_id: page.published_revision_id ?? null,
      }))

      if (requestId !== activePagesFetchRequestRef.current) return
      setPages(pagesData)

      if (!pagesData.length) {
        currentPageIdRef.current = null
        setCurrentPageId(null)
        setLayout(emptyLayout())
        return
      }

      const defaultPage = pagesData.find((page) => String(page.slug || '').toLowerCase() === 'home') || pagesData[0]

      let nextPage: EditorPage | undefined
      if (!hasResolvedInitialPageRef.current) {
        nextPage = initialPageId
          ? pagesData.find((page) => String(page.id) === String(initialPageId))
          : defaultPage
        hasResolvedInitialPageRef.current = true
      } else {
        const selectedPageId = currentPageIdRef.current
        nextPage = selectedPageId
          ? pagesData.find((page) => String(page.id) === String(selectedPageId))
          : defaultPage
      }

      if (nextPage?.id && String(nextPage.id) !== String(currentPageIdRef.current ?? '')) {
        currentPageIdRef.current = String(nextPage.id)
        setCurrentPageId(nextPage.id)
      }
    } catch (fetchError) {
      console.error('Error fetching pages:', fetchError)
      if (requestId !== activePagesFetchRequestRef.current) return
      setError('Error fetching pages')
    } finally {
      if (requestId !== activePagesFetchRequestRef.current) return
      setLoading(false)
    }
  }, [initialPageId])

  const loadPage = useCallback(async (pageId: string | null) => {
    const normalizedPageId = pageId == null ? null : String(pageId)
    const requestId = activeLoadRequestRef.current + 1
    activeLoadRequestRef.current = requestId

    if (!normalizedPageId) {
      clearSaveConflict()
      setLayout(emptyLayout())
      syncRevisionState(null, null)
      return
    }

    const currentPage = pages.find((page) => String(page.id) === normalizedPageId)
    if (!currentPage) {
      clearSaveConflict()
      setLayout(emptyLayout(normalizedPageId, 'Untitled Page'))
      syncRevisionState(null, null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const idResponse = await fetch(`/api/pages/${encodeURIComponent(normalizedPageId)}`)
      const idData = await idResponse.json()

      if (!idResponse.ok || !idData.success) {
        if (requestId !== activeLoadRequestRef.current) return
        setError(getApiErrorMessage(idData, 'Failed to load page'))
        setLayout(emptyLayout(normalizedPageId, currentPage.name))
        return
      }

      if (requestId !== activeLoadRequestRef.current) return

      const responsePageId = idData.page?.id == null ? null : String(idData.page.id)
      if (responsePageId && responsePageId !== normalizedPageId) {
        setError(`Page ID mismatch (requested ${normalizedPageId}, got ${responsePageId})`)
        setLayout(emptyLayout(normalizedPageId, currentPage.name))
        return
      }

      setLayout(
        coerceEditorLayout(idData.page?.layout, {
          id: idData.page?.id ?? currentPage.id,
          name: idData.page?.name ?? currentPage.name,
          title: idData.page?.title ?? currentPage.title,
        }),
      )
      syncRevisionState(
        idData.revision?.id ?? idData.page?.current_revision_id ?? null,
        idData.page?.published_revision_id ?? null,
      )
      clearSaveConflict()
    } catch (loadError) {
      console.error('Error loading page:', loadError)
      if (requestId !== activeLoadRequestRef.current) return
      setError('Error loading page')
      setLayout(emptyLayout(normalizedPageId, currentPage.name))
    } finally {
      if (requestId !== activeLoadRequestRef.current) return
      setLoading(false)
    }
  }, [clearSaveConflict, pages, syncRevisionState])

  const setCurrentPageIdHandler = useCallback((pageId: string | null) => {
    const normalizedPageId = pageId == null ? null : String(pageId)
    if (normalizedPageId === currentPageIdRef.current) return
    currentPageIdRef.current = normalizedPageId
    clearSaveConflict()
    setCurrentPageId(normalizedPageId)
  }, [clearSaveConflict])

  const buildValidatedLayout = useCallback((nextLayout: PageLayout, pageId: string) => {
    return coerceEditorLayout(nextLayout, {
      id: pageId,
      name: nextLayout?.name,
    })
  }, [])

  const enqueuePersistence = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    const nextTask = saveQueueRef.current
      .catch(() => undefined)
      .then(task)

    saveQueueRef.current = nextTask.then(() => undefined, () => undefined)

    return nextTask
  }, [])

  const saveLayout = useCallback(async (newLayout: PageLayout): Promise<boolean> => {
    const layoutPageId = newLayout?.id == null ? null : String(newLayout.id)
    const selectedPageId = currentPageIdRef.current == null ? null : String(currentPageIdRef.current)
    if (layoutPageId && selectedPageId && layoutPageId !== selectedPageId) {
      // Ignore stale autosave attempts from a page that is no longer selected.
      return false
    }
    const savePageId = selectedPageId || layoutPageId

    if (!savePageId) {
      setError('No page selected')
      return false
    }
    if (saveConflictRef.current) {
      return false
    }
    const requestId = activeSaveRequestRef.current + 1
    activeSaveRequestRef.current = requestId

    const validatedLayout = buildValidatedLayout(newLayout, savePageId)

    return enqueuePersistence(async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/pages/${savePageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            layout: validatedLayout,
            base_revision_id: currentRevisionIdRef.current,
          }),
        })
        const data = await response.json()

        if (!response.ok || !data.success) {
          if (response.status === 409 && currentPageIdRef.current === savePageId) {
            clearSaveConflict()
            setSaveConflict(true)
            setError(getApiErrorMessage(data, 'This page changed in another session'))
            return false
          }
          if (requestId === activeSaveRequestRef.current && currentPageIdRef.current === savePageId) {
            setError(getApiErrorMessage(data, 'Failed to save layout'))
          }
          return false
        }

        const savedLayout = coerceEditorLayout(data.page?.layout ?? validatedLayout, {
          id: data.page?.id ?? savePageId,
          name: data.page?.name ?? validatedLayout.name,
          title: data.page?.title ?? validatedLayout.name,
        })

        // Always sync the revision ID returned from a successful save
        const returnedRevId = data.revision?.id ?? data.page?.current_revision_id
        if (returnedRevId != null && currentPageIdRef.current === savePageId) {
          syncRevisionState(
            Number(returnedRevId),
            data.page?.published_revision_id ?? publishedRevisionId,
          )
        }

        if (requestId === activeSaveRequestRef.current && currentPageIdRef.current === savePageId) {
          setLayout(savedLayout)
        }
        return true
      } catch (saveError) {
        console.error('Error saving layout:', saveError)
        if (requestId === activeSaveRequestRef.current && currentPageIdRef.current === savePageId) {
          setError('Error saving layout')
        }
        return false
      } finally {
        if (requestId === activeSaveRequestRef.current) {
          setLoading(false)
        }
      }
    })
  }, [buildValidatedLayout, clearSaveConflict, enqueuePersistence, publishedRevisionId, syncRevisionState])

  const notifyPagesUpdated = useCallback((detail?: { pageId?: string }) => {
    if (typeof window === 'undefined') {
      return
    }

    window.dispatchEvent(new CustomEvent('cm-pages-updated', { detail }))
  }, [])

  const autosaveLayout = useCallback(async (newLayout: PageLayout): Promise<boolean> => {
    const layoutPageId = newLayout?.id == null ? null : String(newLayout.id)
    const selectedPageId = currentPageIdRef.current == null ? null : String(currentPageIdRef.current)
    if (layoutPageId && selectedPageId && layoutPageId !== selectedPageId) {
      return false
    }

    const savePageId = selectedPageId || layoutPageId
    if (!savePageId) {
      return false
    }
    if (saveConflictRef.current) {
      return false
    }

    const validatedLayout = buildValidatedLayout(newLayout, savePageId)

    return enqueuePersistence(async () => {
      try {
        const response = await fetch(`/api/pages/${savePageId}/autosave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            layout: validatedLayout,
            base_revision_id: currentRevisionIdRef.current,
          }),
        })
        const data = await response.json()

        if (!response.ok || !data.success) {
          if (response.status === 409 && currentPageIdRef.current === savePageId) {
            // Attempt silent re-sync with server's latest revision
            try {
              const checkRes = await fetch(`/api/pages/${savePageId}`)
              const checkData = await checkRes.json()
              const latestRevId = checkData.page?.current_revision_id ?? checkData.revision?.id
              if (latestRevId && latestRevId !== currentRevisionIdRef.current) {
                syncRevisionState(Number(latestRevId), checkData.page?.published_revision_id ?? publishedRevisionId)
              }
            } catch (err) {
              console.error('Failed to re-sync revision after autosave 409:', err)
            }
            clearSaveConflict()
            setSaveConflict(true)
            setError(getApiErrorMessage(data, 'This page changed in another session'))
          }
          return false
        }

        // Always sync the revision ID returned from a successful autosave
        const returnedRevId = data.revision?.id ?? data.page?.current_revision_id
        if (returnedRevId != null && currentPageIdRef.current === savePageId) {
          syncRevisionState(
            Number(returnedRevId),
            data.page?.published_revision_id ?? publishedRevisionId,
          )
        }

        if (currentPageIdRef.current === savePageId) {
          const savedLayout = coerceEditorLayout(data.layout ?? validatedLayout, {
            id: data.page?.id ?? savePageId,
            name: data.page?.name ?? validatedLayout.name,
            title: data.page?.title ?? validatedLayout.name,
          })
          setLayout(savedLayout)
        }

        return true
      } catch (saveError) {
        console.error('Error autosaving layout:', saveError)
        return false
      }
    })
  }, [buildValidatedLayout, clearSaveConflict, enqueuePersistence, publishedRevisionId, syncRevisionState])

  const resolveSaveConflict = useCallback(async (action: 'overwrite' | 'reload', customLayout?: PageLayout) => {
    const savePageId = currentPageIdRef.current
    if (!savePageId) return

    if (action === 'reload') {
      clearSaveConflict()
      setError(null)
      await loadPage(savePageId)
      toast.success('Reloaded latest version from server')
      return
    }

    if (action === 'overwrite') {
      try {
        setLoading(true)
        setError(null)
        // Fetch latest revision to use as fresh base
        const checkRes = await fetch(`/api/pages/${savePageId}`)
        const checkData = await checkRes.json()
        const latestRevId = checkData.page?.current_revision_id ?? checkData.revision?.id ?? null
        syncRevisionState(latestRevId, checkData.page?.published_revision_id ?? publishedRevisionId)
        clearSaveConflict()

        // Force save with latest base revision
        const layoutToSave = customLayout || layout
        const validatedLayout = buildValidatedLayout(layoutToSave, savePageId)
        const saveRes = await fetch(`/api/pages/${savePageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            layout: validatedLayout,
            base_revision_id: latestRevId,
          }),
        })
        const saveData = await saveRes.json()
        if (saveRes.ok && saveData.success) {
          const newRevId = saveData.revision?.id ?? saveData.page?.current_revision_id
          if (newRevId) {
            syncRevisionState(Number(newRevId), saveData.page?.published_revision_id ?? publishedRevisionId)
            setLayout(validatedLayout)
          }
          toast.success('Changes saved successfully!')
        } else {
          toast.error(getApiErrorMessage(saveData, 'Failed to save changes'))
        }
      } catch (err) {
        console.error('Error resolving conflict:', err)
        toast.error('Failed to overwrite changes')
      } finally {
        setLoading(false)
      }
    }
  }, [buildValidatedLayout, clearSaveConflict, layout, loadPage, publishedRevisionId, syncRevisionState])

  const createPage = useCallback(async (name: string): Promise<Page | null> => {
    setLoading(true)
    setError(null)
    clearSaveConflict()

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(getApiErrorMessage(data, 'Failed to create page'))
        return null
      }

      const newPage: EditorPage = {
        id: String(data.page.id),
        name: data.page.name || name,
        title: data.page.title || data.page.name || name,
        slug: data.page.slug || '',
        sections: [],
        active: true,
        disabled: false,
        header_slug: data.page.header_slug ?? null,
        footer_slug: data.page.footer_slug ?? null,
        banner_slug: data.page.banner_slug ?? null,
        current_revision_id: data.page.current_revision_id ?? null,
        published_revision_id: data.page.published_revision_id ?? null,
      }

      setPages((previousPages) => [...previousPages, newPage])
      currentPageIdRef.current = newPage.id
      setCurrentPageId(newPage.id)
      setLayout(coerceEditorLayout(data.page.layout, { id: newPage.id, name: newPage.name }))
      syncRevisionState(data.page.current_revision_id ?? null, data.page.published_revision_id ?? null)
      notifyPagesUpdated({ pageId: newPage.id })
      return newPage
    } catch (createError) {
      console.error('Error creating page:', createError)
      setError('Error creating page')
      return null
    } finally {
      setLoading(false)
    }
  }, [clearSaveConflict, notifyPagesUpdated, syncRevisionState])

  const applyTemplate = useCallback(async (
    templateId: string,
    options: { applyAssignments?: boolean } = {},
  ): Promise<PageLayout | null> => {
    const pageId = currentPageIdRef.current
    if (!pageId) {
      setError('No page selected')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/templates/${encodeURIComponent(templateId)}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: Number.parseInt(pageId, 10),
          base_revision_id: currentRevisionIdRef.current,
          apply_assignments: Boolean(options.applyAssignments),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(getApiErrorMessage(data, 'Failed to apply template'))
        return null
      }

      const nextLayout = coerceEditorLayout(data.layout, {
        id: data.page?.id ?? pageId,
        name: data.page?.name ?? layout?.name ?? 'Untitled Page',
        title: data.page?.title ?? layout?.name ?? 'Untitled Page',
      })

      setLayout(nextLayout)
      syncRevisionState(
        data.revision?.id ?? data.page?.current_revision_id ?? currentRevisionIdRef.current,
        data.page?.published_revision_id ?? publishedRevisionId,
      )

      if (data.page) {
        setPages((previousPages) =>
          previousPages.map((page) =>
            String(page.id) === String(pageId)
              ? {
                  ...page,
                  name: data.page?.name || page.name,
                  title: data.page?.title || page.title,
                  header_slug: data.page?.header_slug ?? page.header_slug ?? null,
                  footer_slug: data.page?.footer_slug ?? page.footer_slug ?? null,
                  banner_slug: data.page?.banner_slug ?? page.banner_slug ?? null,
                  current_revision_id: data.page?.current_revision_id ?? page.current_revision_id ?? null,
                  published_revision_id: data.page?.published_revision_id ?? page.published_revision_id ?? null,
                }
              : page,
          ),
        )
      }

      return nextLayout
    } catch (applyError) {
      console.error('Error applying template:', applyError)
      setError('Error applying template')
      return null
    } finally {
      setLoading(false)
    }
  }, [layout?.name, publishedRevisionId, syncRevisionState])

  const deletePage = useCallback(async (pageId: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        const message = getApiErrorMessage(data, 'Failed to delete page')
        setError(message)
        return { success: false, error: message }
      }

      const remainingPages = pages.filter((page) => page.id !== pageId)
      setPages(remainingPages)

      if (currentPageId === pageId) {
        const fallbackPage = remainingPages.find((page) => page.slug === 'home') || remainingPages[0] || null
        currentPageIdRef.current = fallbackPage?.id || null
        setCurrentPageId(fallbackPage?.id || null)
        setLayout(emptyLayout(fallbackPage?.id || '', fallbackPage?.name || ''))
      }

      notifyPagesUpdated({ pageId })

      return { success: true }
    } catch (deleteError) {
      console.error('Error deleting page:', deleteError)
      const message = 'Error deleting page'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [currentPageId, notifyPagesUpdated, pages])

  const disablePage = useCallback(async (pageId: string, disabled: boolean): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pages/${pageId}/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(getApiErrorMessage(data, 'Failed to update page status'))
        return false
      }

      setPages((previousPages) =>
        previousPages.map((page) => (page.id === pageId ? { ...page, disabled } : page)),
      )
      notifyPagesUpdated({ pageId })
      return true
    } catch (disableError) {
      console.error('Error updating page status:', disableError)
      setError('Error updating page status')
      return false
    } finally {
      setLoading(false)
    }
  }, [notifyPagesUpdated])

  const renamePage = useCallback(async (pageId: string, nextName: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = String(nextName || '').trim()
    if (!trimmedName) {
      return { success: false, error: 'Page name cannot be empty' }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          title: trimmedName,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        const message = getApiErrorMessage(data, 'Failed to rename page')
        setError(message)
        return { success: false, error: message }
      }

      const resolvedName = data.page?.name || data.page?.title || trimmedName
      setPages((previousPages) =>
        previousPages.map((page) =>
          String(page.id) === String(pageId)
            ? {
                ...page,
                name: resolvedName,
                title: data.page?.title || resolvedName,
              }
            : page,
        ),
      )

      setLayout((previousLayout) =>
        String(previousLayout?.id ?? '') === String(pageId)
          ? {
              ...previousLayout,
              name: resolvedName,
            }
          : previousLayout,
      )

      notifyPagesUpdated({ pageId })

      return { success: true }
    } catch (renameError) {
      console.error('Error renaming page:', renameError)
      const message = 'Error renaming page'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [notifyPagesUpdated])

  const togglePageActive = useCallback((pageId: string, active: boolean) => {
    setPages((previousPages) =>
      previousPages.map((page) => (page.id === pageId ? { ...page, active } : page)),
    )
  }, [])

  useEffect(() => {
    void fetchPages()
  }, [fetchPages])

  useEffect(() => {
    if (!pages.length || !currentPageId) {
      return
    }

    void loadPage(currentPageId)
  }, [currentPageId, loadPage, pages])

  return {
    pages,
    currentPageId,
    setCurrentPageId: setCurrentPageIdHandler,
    layout,
    setLayout,
    loading,
    error,
    saveConflict,
    resolveSaveConflict,
    currentRevisionId,
    publishedRevisionId,
    fetchPages,
    saveLayout,
    autosaveLayout,
    applyTemplate,
    createPage,
    deletePage,
    disablePage,
    renamePage,
    togglePageActive,
  }
}
