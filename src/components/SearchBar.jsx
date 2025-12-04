import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar({ onSearch, placeholder = 'Search...', className = '' }) {
  const [query, setQuery] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (onSearch) onSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    if (onSearch) onSearch('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400 dark:text-primary-500" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100 placeholder:text-primary-400 dark:placeholder:text-primary-500"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

