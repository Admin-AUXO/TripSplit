import { X, Home } from 'lucide-react'
import { isMobile } from '../utils/mobileDetect'

export default function Sidebar({ groups, selectedGroupId, onSelectGroup, isOpen, onClose }) {
  if (isMobile()) return null

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-primary-800 border-r border-primary-200 dark:border-primary-700 z-40 overflow-y-auto">
        <div className="p-4 border-b border-primary-200 dark:border-primary-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-bold text-primary-900 dark:text-primary-100">Groups</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-2">
          {groups.length === 0 ? (
            <div className="p-4 text-center text-sm text-primary-600 dark:text-primary-400">
              No groups yet
            </div>
          ) : (
            <ul className="space-y-1">
              {groups.map(group => (
                <li key={group.id}>
                  <button
                    onClick={() => {
                      onSelectGroup(group.id)
                      onClose()
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedGroupId === group.id
                        ? 'bg-primary-600 text-white'
                        : 'text-primary-900 dark:text-primary-100 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  >
                    <div className="font-medium truncate">{group.name}</div>
                    <div className={`text-xs mt-1 ${
                      selectedGroupId === group.id
                        ? 'text-white opacity-80'
                        : 'text-primary-600 dark:text-primary-400'
                    }`}>
                      {group.members.length} members • {group.bills.length} bills
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  )
}

