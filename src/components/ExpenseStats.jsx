import { BarChart3, TrendingUp, Tag, Users } from 'lucide-react'
import { calculateExpenseStats } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'

export default function ExpenseStats({ group }) {
  const stats = calculateExpenseStats(group)
  
  const getMemberName = (memberId) => {
    return group.members.find(m => m.id === memberId)?.name || 'Unknown'
  }

  if (group.bills.length === 0) {
    return (
      <div className="card text-center py-8">
        <BarChart3 className="w-12 h-12 text-primary-300 mx-auto mb-3" />
        <p className="text-primary-600">Add bills to see expense statistics</p>
      </div>
    )
  }

  const topCategory = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])[0]
  
  const topSpender = Object.entries(stats.byMember)
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.total)}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Average per Person</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.averagePerPerson)}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Bills</p>
              <p className="text-2xl font-bold">{stats.billCount}</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Expenses by Category</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = ((amount / stats.total) * 100).toFixed(1)
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary-900">{category}</span>
                      <span className="text-sm font-semibold text-primary-700">
                        {formatCurrency(amount)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-primary-100 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Top Spenders */}
      {Object.keys(stats.byMember).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Who Paid the Most</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byMember)
              .sort((a, b) => b[1] - a[1])
              .map(([memberId, amount]) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 bg-primary-50 rounded-lg"
                >
                  <span className="font-medium text-primary-900">{getMemberName(memberId)}</span>
                  <span className="font-semibold text-primary-700">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

