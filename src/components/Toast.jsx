import { CheckCircle, XCircle, X } from 'lucide-react'
import { useEffect } from 'react'

export default function Toast({ message, type, onClose, duration = 3000 }) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  if (!message) return null

  const bgColor = type === 'success' 
    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200' 
    : type === 'error'
    ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
    : 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'

  const Icon = type === 'success' ? CheckCircle : XCircle

  return (
    <div className={`fixed top-4 right-4 z-[60] flex items-center space-x-3 p-4 rounded-lg border-2 shadow-lg max-w-md ${bgColor} animate-slide-in`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1 break-words">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 flex-shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

