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
        className="flex items-center space-x-2 px-4 py-2 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>{selectedSort ? selectedSort.label : label}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-white border border-primary-200 rounded-lg shadow-lg z-50 min-w-[200px] py-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSort(option)}
              className={`w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors ${
                selectedSort?.value === option.value ? 'bg-primary-50 text-primary-600' : ''
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

