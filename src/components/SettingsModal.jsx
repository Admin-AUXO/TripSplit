import { X, Copy, Check, Plus, Loader2, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getStorageId, setStorageId, createNewBin } from '../utils/simpleStorage'
import { useDarkMode } from '../hooks/useDarkMode'

// Helper to lock/unlock body scroll
const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isLocked])
}

export default function SettingsModal({ onClose, onStorageIdChange }) {
  const [isDark, toggleDarkMode] = useDarkMode()
  const [storageId, setStorageIdValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingBin, setIsCreatingBin] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  useBodyScrollLock(true)

  useEffect(() => {
    setStorageIdValue(getStorageId())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (storageId.trim()) {
      setIsLoading(true)
      try {
        setStorageId(storageId.trim())
        if (onStorageIdChange) {
          await onStorageIdChange(storageId.trim())
        }
        onClose()
      } catch (error) {
        console.error('Error updating storage ID:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleReset = () => {
    setStorageIdValue('tripsplit-shared-public')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storageId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCreateNewBin = async () => {
    setIsCreatingBin(true)
    setMessage({ type: '', text: '' })
    try {
      const newBinId = await createNewBin({ groups: [] })
      setStorageIdValue(newBinId)
      setStorageId(newBinId)
      setMessage({ type: 'success', text: `New bin created! Bin ID: ${newBinId}` })
      
      if (onStorageIdChange) {
        await onStorageIdChange(newBinId)
      }
    } catch (error) {
      console.error('Error creating bin:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to create bin' })
    } finally {
      setIsCreatingBin(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start sm:items-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card max-w-md w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 p-1 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              Bin ID (jsonbin.io)
            </label>
            <p className="text-xs text-primary-600 dark:text-primary-400 mb-2">
              Users with the same Bin ID will see the same groups. Share this ID with others to collaborate.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={storageId}
                onChange={(e) => setStorageIdValue(e.target.value)}
                placeholder="tripsplit-shared-public"
                className="input-field flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary px-3 flex items-center justify-center"
                title="Copy Bin ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 underline"
              >
                Reset to default
              </button>
              <button
                type="button"
                onClick={handleCreateNewBin}
                disabled={isCreatingBin}
                className="text-xs btn-secondary px-3 py-1.5 flex items-center space-x-1"
                title="Create a new empty bin"
              >
                {isCreatingBin ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Create New Bin</span>
                  </>
                )}
              </button>
            </div>
            {message.text && (
              <div className={`mt-2 p-2 rounded text-xs ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
              }`}>
                {message.text}
              </div>
            )}
          </div>

          <div className="mb-4 pt-4 border-t border-primary-200 dark:border-primary-700">
            <label className="block text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              Appearance
            </label>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center justify-between w-full p-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-700 hover:bg-primary-50 dark:hover:bg-primary-600 transition-colors"
            >
              <span className="text-sm text-primary-900 dark:text-primary-100">Dark Mode</span>
              {isDark ? (
                <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              ) : (
                <Sun className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              )}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 order-2 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 order-1 sm:order-2"
              disabled={!storageId.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

