import { useState, useCallback } from 'react'
import { isMobile } from '../utils/mobileDetect'

export default function DragDropContainer({ children, onReorder, items }) {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  if (isMobile()) {
    return <div>{children}</div>
  }

  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null)
      setDragOverIndex(null)
      return
    }

    const newItems = [...items]
    const [removed] = newItems.splice(draggedItem, 1)
    newItems.splice(dropIndex, 0, removed)
    
    onReorder(newItems)
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  // If children is not an array (e.g., a single element), wrap it
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div className="space-y-4">
      {childrenArray.map((child, index) => (
        <div
          key={child?.key || index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-all ${
            dragOverIndex === index ? 'opacity-50 scale-95' : ''
          } ${draggedItem === index ? 'opacity-50' : ''}`}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

