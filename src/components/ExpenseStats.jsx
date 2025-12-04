import { BarChart3, TrendingUp, Tag, Users, Calendar, Receipt } from 'lucide-react'
import { calculateExpenseStats, calculateBalances } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'

export default function ExpenseStats({ group }) {
  const stats = calculateExpenseStats(group)
  const balances = calculateBalances(group)
  
  const getMemberName = (memberId) => {
    return group.members.find(m => m.id === memberId)?.name || 'Unknown'
  }

  if (group.bills.length === 0) {
    return (
      <div className="card text-center py-8">
        <BarChart3 className="w-12 h-12 text-primary-300 dark:text-primary-600 mx-auto mb-3" />
        <p className="text-primary-600 dark:text-primary-400">Add bills to see expense statistics</p>
      </div>
    )
  }

  const topCategory = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])[0]
  
  const topSpender = Object.entries(stats.byMember)
    .sort((a, b) => b[1] - a[1])[0]

  const largestBill = group.bills.reduce((max, bill) => 
    bill.amount > max.amount ? bill : max, group.bills[0])
  const smallestBill = group.bills.reduce((min, bill) => 
    bill.amount < min.amount ? bill : min, group.bills[0])
  
  const billsByDate = group.bills
    .map(bill => new Date(bill.createdAt))
    .sort((a, b) => b - a)
  const firstBillDate = billsByDate[billsByDate.length - 1]
  const lastBillDate = billsByDate[0]
  
  const totalOwed = Object.values(balances)
    .filter(b => b < 0)
    .reduce((sum, b) => sum + Math.abs(b), 0)
  const totalToReceive = Object.values(balances)
    .filter(b => b > 0)
    .reduce((sum, b) => sum + b, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 dark:text-blue-50 text-sm mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.total)}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 dark:text-green-50 text-sm mb-1">Average per Person</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.averagePerPerson)}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 dark:text-purple-50 text-sm mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-white">{stats.billCount}</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {Object.keys(stats.byCategory).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center space-x-2">
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
                      <span className="text-sm font-medium text-primary-900 dark:text-primary-100">{category}</span>
                      <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {formatCurrency(amount)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-primary-100 dark:bg-primary-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {Object.keys(stats.byMember).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Who Paid the Most</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byMember)
              .sort((a, b) => b[1] - a[1])
              .map(([memberId, amount]) => {
                const percentage = ((amount / stats.total) * 100).toFixed(1)
                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-primary-900 dark:text-primary-100">{getMemberName(memberId)}</span>
                      <span className="text-xs text-primary-500 dark:text-primary-400 ml-2">({percentage}%)</span>
                    </div>
                    <span className="font-semibold text-primary-700 dark:text-primary-300">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Bill Insights</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
              <span className="text-sm text-primary-700 dark:text-primary-300">Largest Bill</span>
              <span className="font-semibold text-primary-900 dark:text-primary-100">
                {formatCurrency(largestBill.amount)}
              </span>
            </div>
            <div className="text-xs text-primary-600 dark:text-primary-400 pl-2">
              {largestBill.description}
            </div>
            <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
              <span className="text-sm text-primary-700 dark:text-primary-300">Smallest Bill</span>
              <span className="font-semibold text-primary-900 dark:text-primary-100">
                {formatCurrency(smallestBill.amount)}
              </span>
            </div>
            <div className="text-xs text-primary-600 dark:text-primary-400 pl-2">
              {smallestBill.description}
            </div>
            <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
              <span className="text-sm text-primary-700 dark:text-primary-300">Average Bill</span>
              <span className="font-semibold text-primary-900 dark:text-primary-100">
                {formatCurrency(stats.total / stats.billCount)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Timeline</span>
          </h3>
          <div className="space-y-3">
            {firstBillDate && (
              <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
                <span className="text-sm text-primary-700 dark:text-primary-300">First Bill</span>
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  {firstBillDate.toLocaleDateString()}
                </span>
              </div>
            )}
            {lastBillDate && (
              <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
                <span className="text-sm text-primary-700 dark:text-primary-300">Last Bill</span>
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  {lastBillDate.toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
              <span className="text-sm text-primary-700 dark:text-primary-300">Total Outstanding</span>
              <span className="font-semibold text-primary-900 dark:text-primary-100">
                {formatCurrency(totalOwed)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-700 rounded">
              <span className="text-sm text-primary-700 dark:text-primary-300">Total to Receive</span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                {formatCurrency(totalToReceive)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

