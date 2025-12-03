import { User, X } from 'lucide-react'

export default function MemberList({ members, onRemove }) {
  if (members.length === 0) {
    return (
      <div className="card text-center py-8">
        <User className="w-12 h-12 text-primary-300 mx-auto mb-3" />
        <p className="text-primary-600">No members yet. Add your first member!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(member => (
        <div
          key={member.id}
          className="card flex items-center justify-between p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-medium text-primary-900">{member.name}</span>
          </div>
          <button
            onClick={() => {
              if (confirm(`Remove ${member.name} from the group?`)) {
                onRemove(member.id)
              }
            }}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

