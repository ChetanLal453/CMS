import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => boolean | void | Promise<boolean | void>
  interval?: number
  debounceMs?: number
  enabled?: boolean
  identityKey?: string | number | null
}

interface UseAutoSaveReturn {
  lastSaved: Date | null
  isSaving: boolean
  hasPendingChanges: boolean
  saveNow: (force?: boolean) => Promise<boolean>
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000,
  debounceMs = 800,
  enabled = true,
  identityKey,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef('')
  const latestDataRef = useRef(data)
  const latestOnSaveRef = useRef(onSave)
  const wasEnabledRef = useRef(enabled)
  const serializedData = useMemo(() => JSON.stringify(data), [data])

  useEffect(() => {
    latestDataRef.current = data
  }, [data])

  useEffect(() => {
    latestOnSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    if (enabled && !wasEnabledRef.current) {
      // When autosave is re-enabled (e.g., after page switch hydration),
      // take current state as baseline to avoid immediate stale saves.
      previousDataRef.current = serializedData
      setHasPendingChanges(false)
    }
    wasEnabledRef.current = enabled
  }, [enabled, serializedData])

  useEffect(() => {
    // Prevent a pending debounce from the previous identity from saving into the new identity.
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    previousDataRef.current = serializedData
    latestDataRef.current = data
    setHasPendingChanges(false)
    setIsSaving(false)
  }, [identityKey])

  useEffect(() => {
    const changed = serializedData !== previousDataRef.current
    setHasPendingChanges(changed)
  }, [serializedData])

  const saveNow = useCallback(
    async (force = false) => {
      if (!enabled || isSaving) {
        return false
      }

      const currentSerialized = JSON.stringify(latestDataRef.current)
      if (!force && currentSerialized === previousDataRef.current) {
        return false
      }

      try {
        setIsSaving(true)
        const saveResult = await latestOnSaveRef.current(latestDataRef.current)
        if (saveResult === false) {
          return false
        }
        previousDataRef.current = currentSerialized
        setLastSaved(new Date())
        setHasPendingChanges(false)
        return true
      } catch (error) {
        console.error('Auto-save failed:', error)
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [enabled, isSaving],
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (debounceMs && debounceMs > 0 && serializedData !== previousDataRef.current) {
      debounceTimeoutRef.current = setTimeout(() => {
        void saveNow()
      }, debounceMs)
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }
  }, [debounceMs, enabled, saveNow, serializedData])

  useEffect(() => {
    if (!enabled) {
      return
    }

    intervalRef.current = setInterval(() => {
      if (previousDataRef.current !== JSON.stringify(latestDataRef.current)) {
        void saveNow()
      }
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, saveNow])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    lastSaved,
    isSaving,
    hasPendingChanges,
    saveNow,
  }
}
