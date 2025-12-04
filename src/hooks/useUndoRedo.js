import { useState, useCallback, useRef } from 'react'

export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState)
  const historyRef = useRef([initialState])
  const historyIndexRef = useRef(0)

  const updateState = useCallback((newState) => {
    const nextIndex = historyIndexRef.current + 1
    const newHistory = historyRef.current.slice(0, nextIndex)
    
    newHistory.push(newState)
    if (newHistory.length > maxHistory) {
      newHistory.shift()
    } else {
      historyIndexRef.current = nextIndex
    }
    
    historyRef.current = newHistory
    setState(newState)
  }, [maxHistory])

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      setState(historyRef.current[historyIndexRef.current])
      return true
    }
    return false
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      setState(historyRef.current[historyIndexRef.current])
      return true
    }
    return false
  }, [])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  return {
    state,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}

