import { ArrowUpDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function SortDropdown({ options = [], onSort, label = 'Sort' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSort = (option) => {
    setSelectedSort(option)
    setIsOpen(false)
    if (onSort) onSort(option)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-primary-300 dark:border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>{selectedSort ? selectedSort.label : label}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-white dark:bg-primary-800 border border-primary-200 dark:border-primary-600 rounded-lg shadow-lg z-[60] min-w-[200px] max-h-[300px] overflow-y-auto py-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSort(option)}
              className={`w-full text-left px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors text-primary-900 dark:text-primary-100 ${
                selectedSort?.value === option.value ? 'bg-primary-50 dark:bg-primary-700 text-primary-600 dark:text-primary-400' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

