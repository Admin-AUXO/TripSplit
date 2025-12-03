import { Receipt, Trash2, DollarSign, Tag, User } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

export default function BillList({ bills, members, onDelete }) {
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
          <div key={bill.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-semibold text-primary-900">{bill.description}</h4>
                  <span className="text-sm text-primary-500 bg-primary-100 px-2 py-1 rounded">
                    {bill.category}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-primary-600">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-primary-900">{formatCurrency(bill.amount)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Paid by {paidByName}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Delete this bill?')) {
                    onDelete(bill.id)
                  }
                }}
                className="text-red-500 hover:text-red-700 p-1 ml-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="border-t border-primary-100 pt-3 mt-3">
              <p className="text-xs text-primary-600 mb-2 font-medium">Split among:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bill.splitRatio).map(([memberId, share]) => {
                  if (share === 0) return null
                  const memberName = getMemberName(memberId)
                  const memberShare = (share / totalShares) * bill.amount
                  const isPaidBy = memberId === bill.paidBy
                  return (
                    <span
                      key={memberId}
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        isPaidBy
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-50 text-primary-700'
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

