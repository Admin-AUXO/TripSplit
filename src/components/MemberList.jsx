import { User, X, Edit } from 'lucide-react'
import SwipeableItem from './SwipeableItem'
import ContextMenu from './ContextMenu'
import EmptyState from './EmptyState'

export default function MemberList({ members, onRemove, onEdit }) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No members yet"
        description="Add members to your group so you can start splitting bills together."
        suggestions={[
          'Click "Add Member" to invite someone',
          'Add yourself first',
          'You can add up to 20 members per group',
          'Members can be edited or removed anytime'
        ]}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(member => {
        const contextMenuItems = [
          { label: 'Edit', icon: Edit, onClick: () => onEdit && onEdit(member) },
          { label: 'Remove', icon: X, onClick: () => {
            if (confirm(`Remove ${member.name} from the group?`)) {
              onRemove(member.id)
            }
          }, destructive: true },
        ]
        
        return (
          <ContextMenu key={member.id} items={contextMenuItems}>
            <SwipeableItem
              onSwipeLeft={() => {
                if (confirm(`Remove ${member.name} from the group?`)) {
                  onRemove(member.id)
                }
              }}
              onSwipeRight={() => onEdit && onEdit(member)}
              className="card flex items-center justify-between p-4 hover:shadow-md transition-shadow"
            >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-medium text-primary-900 truncate">{member.name}</span>
          </div>
          <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(member)}
                className="text-primary-600 hover:text-primary-800 p-1.5 rounded hover:bg-primary-50 transition-colors"
                title="Edit member"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Remove ${member.name} from the group?`)) {
                  onRemove(member.id)
                }
              }}
              className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
              title="Remove member"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
            </SwipeableItem>
          </ContextMenu>
        )
      })}
    </div>
  )
}

