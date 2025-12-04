import { useState, useEffect, useCallback } from 'react'

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState(() => {
    const stored = localStorage.getItem('offlineQueue')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addToQueue = useCallback((action) => {
    const newQueue = [...queue, { ...action, id: Date.now(), timestamp: new Date().toISOString() }]
    setQueue(newQueue)
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue))
  }, [queue])

  const processQueue = useCallback(async (processAction) => {
    if (!isOnline || queue.length === 0) return

    const processed = []
    const failed = []

    for (const action of queue) {
      try {
        await processAction(action)
        processed.push(action.id)
      } catch (error) {
        console.error('Failed to process queued action:', error)
        failed.push(action)
      }
    }

    const remainingQueue = failed
    setQueue(remainingQueue)
    localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue))

    return { processed, failed: failed.length }
  }, [isOnline, queue])

  const clearQueue = useCallback(() => {
    setQueue([])
    localStorage.removeItem('offlineQueue')
  }, [])

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      // Auto-process queue when coming back online
      // The actual processing should be handled by the component
    }
  }, [isOnline, queue.length])

  return {
    isOnline,
    queue,
    addToQueue,
    processQueue,
    clearQueue,
    hasPendingActions: queue.length > 0,
  }
}

