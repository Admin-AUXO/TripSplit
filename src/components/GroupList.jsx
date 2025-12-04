import { Plus, Trash2, Users, Calendar, Receipt } from 'lucide-react'
import EmptyState from './EmptyState'

export default function GroupList({ groups, selectedGroupId, onSelectGroup, onCreateGroup, onDeleteGroup }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 dark:text-primary-100">Your Groups</h2>
        <button onClick={onCreateGroup} className="btn-primary flex items-center justify-center space-x-2">
          <Plus className="w-4 h-5" />
          <span>New Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create your first trip group to start splitting bills and expenses with your friends!"
          action={
            <button onClick={onCreateGroup} className="btn-primary">
              Create Your First Group
            </button>
          }
          suggestions={[
            'Add members to your group',
            'Create bills for shared expenses',
            'Track who paid for what',
            'Automatically calculate splits',
            'View statistics and settle up'
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div
              key={group.id}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-xl ${
                selectedGroupId === group.id ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100">{group.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${group.name}"? This cannot be undone.`)) {
                      onDeleteGroup(group.id)
                    }
                  }}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-primary-600 dark:text-primary-400">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4" />
                  <span>{group.bills.length} {group.bills.length === 1 ? 'bill' : 'bills'}</span>
                </div>
                {group.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

