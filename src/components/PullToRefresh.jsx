import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { RefreshCw } from 'lucide-react'
import { isMobile } from '../utils/mobileDetect'

export default function PullToRefresh({ onRefresh, children }) {
  const isMobileDevice = isMobile()
  const { pullHandlers, isPulling, pullDistance } = usePullToRefresh({
    onRefresh,
    threshold: 80
  })

  if (!isMobileDevice) {
    return <div>{children}</div>
  }

  return (
    <div {...pullHandlers} className="relative">
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center py-2 z-[45] transition-opacity"
          style={{ 
            height: `${Math.min(pullDistance, 80)}px`,
            opacity: Math.min(pullDistance / 80, 1)
          }}
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${pullDistance >= 80 ? 'animate-spin' : ''}`} />
          <span>{pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}
      <div style={{ paddingTop: isPulling ? `${Math.min(pullDistance, 80)}px` : '0' }}>
        {children}
      </div>
    </div>
  )
}

