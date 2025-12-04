import { useSwipeGesture } from '../hooks/useSwipeGesture'
import { Trash2, Edit } from 'lucide-react'
import { isTouchDevice } from '../utils/mobileDetect'

export default function SwipeableItem({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  leftAction = 'Delete',
  rightAction = 'Edit',
  className = ''
}) {
  const isTouch = isTouchDevice()
  const { swipeHandlers, swipeOffset } = useSwipeGesture({
    onSwipeLeft: onSwipeLeft || (() => {}),
    onSwipeRight: onSwipeRight || (() => {}),
    threshold: 80
  })

  if (!isTouch) {
    return <div className={className}>{children}</div>
  }

  const showLeftAction = swipeOffset < -20
  const showRightAction = swipeOffset > 20

  return (
    <div className="relative overflow-hidden">
      <div
        {...swipeHandlers}
        className={`transition-transform duration-200 ${className}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {children}
      </div>
      {showLeftAction && (
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      )}
      {showRightAction && (
        <div className="absolute top-0 left-0 bottom-0 w-20 bg-primary-600 flex items-center justify-center">
          <Edit className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  )
}

