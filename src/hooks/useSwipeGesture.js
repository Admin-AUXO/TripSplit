import { useRef, useState, useCallback } from 'react'

export const useSwipeGesture = ({ onSwipeLeft, onSwipeRight, threshold = 50 }) => {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const startX = useRef(null)
  const startY = useRef(null)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    isDragging.current = false
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (startX.current === null) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - startX.current
    const deltaY = touch.clientY - startY.current
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      isDragging.current = true
      e.preventDefault()
      setSwipeOffset(deltaX)
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (startX.current === null) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX.current
    
    if (isDragging.current && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    
    setSwipeOffset(0)
    startX.current = null
    startY.current = null
    isDragging.current = false
  }, [onSwipeLeft, onSwipeRight, threshold])

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swipeOffset,
  }
}

