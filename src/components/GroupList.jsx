import { Plus, Trash2, Users, Calendar, Receipt } from 'lucide-react'

export default function GroupList({ groups, selectedGroupId, onSelectGroup, onCreateGroup, onDeleteGroup }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary-900">Your Groups</h2>
        <button onClick={onCreateGroup} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">No groups yet</h3>
          <p className="text-primary-600 mb-6">Create your first trip group to start splitting bills!</p>
          <button onClick={onCreateGroup} className="btn-primary">
            Create Your First Group
          </button>
        </div>
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
                <h3 className="text-xl font-bold text-primary-900">{group.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${group.name}"? This cannot be undone.`)) {
                      onDeleteGroup(group.id)
                    }
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-primary-600">
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

