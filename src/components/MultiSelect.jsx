import { useState } from 'react'

export default function MultiSelect({ items = [], onSelectionChange, renderItem, className = '' }) {
  const [selectedIds, setSelectedIds] = useState(new Set())

  const toggleSelection = (id) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection))
    }
  }

  const selectAll = () => {
    const allIds = new Set(items.map(item => item.id))
    setSelectedIds(allIds)
    if (onSelectionChange) {
      onSelectionChange(Array.from(allIds))
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    if (onSelectionChange) {
      onSelectionChange([])
    }
  }

  return (
    <div className={className}>
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between p-3 bg-primary-50 rounded-lg">
          <span className="text-sm font-medium text-primary-700">
            {selectedIds.size} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={selectAll}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleSelection(item.id)}
            className={`cursor-pointer transition-all ${
              selectedIds.has(item.id) ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            {renderItem(item, selectedIds.has(item.id))}
          </div>
        ))}
      </div>
    </div>
  )
}

