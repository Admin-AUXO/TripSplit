import { X } from 'lucide-react'
import { useState } from 'react'

export default function NewGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim())
      setName('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start sm:items-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="card max-w-md w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-900">Create New Group</h2>
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
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Trip 2024"
              className="input-field"
              autoFocus
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 order-1 sm:order-2"
              disabled={!name.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

