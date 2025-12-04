import { useRef, useState, useCallback } from 'react'

export const usePullToRefresh = ({ onRefresh, threshold = 80 }) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(null)
  const touchStart = useRef(null)

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      touchStart.current = e.touches[0].clientY
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (touchStart.current === null || window.scrollY > 0) return
    
    const touchY = e.touches[0].clientY
    const distance = touchY - touchStart.current
    
    if (distance > 0) {
      setIsPulling(true)
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }, [threshold])

  const handleTouchEnd = useCallback(async () => {
    if (touchStart.current === null) return
    
    if (pullDistance >= threshold && onRefresh) {
      await onRefresh()
    }
    
    setIsPulling(false)
    setPullDistance(0)
    touchStart.current = null
    startY.current = null
  }, [pullDistance, threshold, onRefresh])

  return {
    pullHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isPulling,
    pullDistance,
  }
}

