import { Home, Plus, Settings } from 'lucide-react'

import { isMobile } from '../utils/mobileDetect'

export default function BottomNavigation({ activeView, onNavigate }) {
  if (!isMobile()) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-primary-800 border-t border-primary-200 dark:border-primary-700 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onNavigate('groups')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeView === 'groups'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-primary-400 dark:text-primary-500'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Groups</span>
        </button>
        <button
          onClick={() => onNavigate('create')}
          className="flex flex-col items-center justify-center flex-1 h-full text-primary-600 dark:text-primary-400 transition-colors"
        >
          <div className="bg-primary-600 dark:bg-primary-500 rounded-full p-2 mb-1">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium">Create</span>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeView === 'settings'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-primary-400 dark:text-primary-500'
          }`}
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </div>
    </nav>
  )
}

