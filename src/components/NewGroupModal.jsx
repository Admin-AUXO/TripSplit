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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800 p-1"
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
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
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

