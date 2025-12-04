import { useState, useEffect, useRef } from 'react'
import { Edit, Trash2, Copy, MoreVertical } from 'lucide-react'

export default function ContextMenu({ items = [], children, onRightClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => setIsOpen(false)

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen])

  const handleContextMenu = (e) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setIsOpen(true)
    if (onRightClick) onRightClick(e)
  }

  const handleItemClick = (item) => {
    if (item.onClick) item.onClick()
    setIsOpen(false)
  }

  const defaultItems = items.length > 0 ? items : [
    { label: 'Edit', icon: Edit, onClick: () => {} },
    { label: 'Copy', icon: Copy, onClick: () => {} },
    { label: 'Delete', icon: Trash2, onClick: () => {}, destructive: true },
  ]

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {children}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-primary-200 rounded-lg shadow-xl z-50 py-1 min-w-[160px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-100%, 0)'
          }}
        >
          {defaultItems.map((item, index) => {
            const Icon = item.icon || MoreVertical
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-primary-50 transition-colors ${
                  item.destructive ? 'text-red-600' : 'text-primary-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

