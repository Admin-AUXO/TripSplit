import { Receipt, Trash2, Tag, User, Edit } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

export default function BillList({ bills, members, onDelete, onEdit }) {
  const getMemberName = (memberId) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown'
  }

  if (bills.length === 0) {
    return (
      <div className="card text-center py-8">
        <Receipt className="w-12 h-12 text-primary-300 mx-auto mb-3" />
        <p className="text-primary-600">No bills yet. Add your first bill!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bills.map(bill => {
        const totalShares = Object.values(bill.splitRatio).reduce((sum, share) => sum + share, 0)
        const paidByName = getMemberName(bill.paidBy)
        
        return (
          <div key={bill.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start sm:items-center flex-wrap gap-2 mb-2">
                  <h4 className="text-base sm:text-lg font-semibold text-primary-900 break-words flex-1 min-w-0">{bill.description}</h4>
                  <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                    {bill.category}
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="font-semibold text-primary-900 text-sm sm:text-base">{formatCurrency(bill.amount)}</span>
                  <div className="flex items-center space-x-1.5 text-primary-600">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Paid by {paidByName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(bill)}
                    className="text-primary-600 hover:text-primary-800 p-1.5 rounded hover:bg-primary-50 transition-colors"
                    title="Edit bill"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Delete this bill?')) {
                      onDelete(bill.id)
                    }
                  }}
                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                  title="Delete bill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="border-t border-primary-100 pt-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-primary-600 font-medium">Split among:</p>
                <p className="text-xs text-primary-500">
                  {Object.values(bill.splitRatio).filter(share => share > 0).length} {Object.values(bill.splitRatio).filter(share => share > 0).length === 1 ? 'person' : 'people'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bill.splitRatio).map(([memberId, share]) => {
                  if (share === 0) return null
                  const memberName = getMemberName(memberId)
                  const memberShare = (share / totalShares) * bill.amount
                  const isPaidBy = memberId === bill.paidBy
                  return (
                    <span
                      key={memberId}
                      className={`text-xs px-2.5 py-1.5 rounded font-medium ${
                        isPaidBy
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-50 text-primary-700 border border-primary-200'
                      }`}
                    >
                      {memberName}: {formatCurrency(memberShare)}
                    </span>
                  )
                })}
              </div>
              {Object.values(bill.splitRatio).filter(share => share === 0).length > 0 && (
                <p className="text-xs text-primary-500 mt-2 italic">
                  {Object.values(bill.splitRatio).filter(share => share === 0).length} member(s) excluded
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

