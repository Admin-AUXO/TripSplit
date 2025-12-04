import { Plus } from 'lucide-react'
import { isMobile } from '../utils/mobileDetect'

export default function FloatingActionButton({ onClick, icon: Icon = Plus, label = 'Create' }) {
  const mobile = isMobile()
  if (!mobile) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-[60] md:hidden"
      aria-label={label}
      style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <Icon className="w-6 h-6" />
    </button>
  )
}

