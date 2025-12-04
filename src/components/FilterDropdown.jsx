import { Filter } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function FilterDropdown({ options = [], onFilter, label = 'Filter' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])
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

  const toggleFilter = (value) => {
    const newFilters = selectedFilters.includes(value)
      ? selectedFilters.filter(f => f !== value)
      : [...selectedFilters, value]
    setSelectedFilters(newFilters)
    if (onFilter) onFilter(newFilters)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>{label}</span>
        {selectedFilters.length > 0 && (
          <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
            {selectedFilters.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-white border border-primary-200 rounded-lg shadow-lg z-50 min-w-[200px] py-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-primary-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedFilters.includes(option.value)}
                onChange={() => toggleFilter(option.value)}
                className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

