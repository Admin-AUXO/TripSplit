import { Trash2, Edit, X } from 'lucide-react'

export default function MultiSelectBar({ selectedIds, onClear, onBulkDelete, onBulkEdit, itemType = 'items' }) {
  if (selectedIds.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary-600 dark:bg-primary-500 text-white p-4 shadow-lg z-[60] md:bottom-auto md:top-16 md:left-auto md:right-4 md:w-auto md:rounded-lg" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-7xl mx-auto md:mx-0 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium">
            {selectedIds.length} {itemType} selected
          </span>
          <button
            onClick={onClear}
            className="text-white hover:text-primary-200 dark:hover:text-primary-300 underline text-sm"
          >
            Clear selection
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {onBulkEdit && (
            <button
              onClick={onBulkEdit}
              className="bg-white dark:bg-primary-700 text-primary-600 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-primary-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          {onBulkDelete && (
            <button
              onClick={onBulkDelete}
              className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
          <button
            onClick={onClear}
            className="text-white hover:text-primary-200 dark:hover:text-primary-300 p-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

