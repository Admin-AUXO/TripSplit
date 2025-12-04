import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getStorageId, setStorageId } from '../utils/simpleStorage'

export default function SettingsModal({ onClose, onStorageIdChange }) {
  const [storageId, setStorageIdValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load current storage ID when modal opens
    setStorageIdValue(getStorageId())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (storageId.trim()) {
      setIsLoading(true)
      try {
        setStorageId(storageId.trim())
        // Notify parent to reload data with new storage ID
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start sm:items-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="card max-w-md w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800 p-1 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Bin ID (jsonbin.io)
            </label>
            <p className="text-xs text-primary-600 mb-2">
              Users with the same Bin ID will see the same groups. Share this ID with others to collaborate.
            </p>
            <input
              type="text"
              value={storageId}
              onChange={(e) => setStorageIdValue(e.target.value)}
              placeholder="tripsplit-shared-public"
              className="input-field"
              autoFocus
            />
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-primary-600 hover:text-primary-800 mt-2 underline"
            >
              Reset to default
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

