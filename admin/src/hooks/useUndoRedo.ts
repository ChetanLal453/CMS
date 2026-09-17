import { useCallback, useEffect, useRef, useState } from 'react'

interface UseUndoRedoReturn<T> {
  state: T
  setState: (newState: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  reset: (newState: T) => void
  clear: () => void
}

export function useUndoRedo<T>(initialState: T, maxHistory: number = 50): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentIndexRef = useRef(0)
  const serializedHistoryRef = useRef<string[]>([JSON.stringify(initialState)])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  const state = history[currentIndex]
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prevHistory) => {
      const activeIndex = currentIndexRef.current
      const currentState = prevHistory[activeIndex]
      const nextState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(currentState)
        : newState;
      const currentSerialized = serializedHistoryRef.current[activeIndex] ?? JSON.stringify(currentState)
      const nextSerialized = JSON.stringify(nextState)

      if (Object.is(nextState, currentState) || nextSerialized === currentSerialized) {
        return prevHistory
      }

      const nextHistory = prevHistory.slice(0, activeIndex + 1)
      nextHistory.push(nextState)
      const nextSerializedHistory = serializedHistoryRef.current.slice(0, activeIndex + 1)
      nextSerializedHistory.push(nextSerialized)

      if (nextHistory.length > maxHistory) {
        nextHistory.shift()
        nextSerializedHistory.shift()
      }

      const nextIndex = nextHistory.length - 1
      currentIndexRef.current = nextIndex
      serializedHistoryRef.current = nextSerializedHistory
      setCurrentIndex(nextIndex)

      return nextHistory
    })
  }, [maxHistory])

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [canUndo])

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [canRedo])

  const reset = useCallback((newState: T) => {
    currentIndexRef.current = 0
    setHistory([newState])
    serializedHistoryRef.current = [JSON.stringify(newState)]
    setCurrentIndex(0)
  }, [])

  const clear = useCallback(() => {
    const snapshot = history[currentIndexRef.current]
    currentIndexRef.current = 0
    setHistory([snapshot])
    serializedHistoryRef.current = [JSON.stringify(snapshot)]
    setCurrentIndex(0)
  }, [history])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clear,
  }
}
