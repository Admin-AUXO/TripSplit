import { Receipt, Users, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

export default function QuickStats({ groups }) {
  const totalGroups = groups.length
  const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0)
  const totalBills = groups.reduce((sum, group) => sum + group.bills.length, 0)
  const totalExpenses = groups.reduce((sum, group) => {
    return sum + group.bills.reduce((billSum, bill) => billSum + (bill.amount || 0), 0)
  }, 0)

  const recentBills = groups
    .flatMap(group => 
      group.bills.map(bill => ({
        ...bill,
        groupName: group.name,
        date: new Date(bill.createdAt || 0)
      }))
    )
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)

  const categoryStats = groups
    .flatMap(group => group.bills)
    .reduce((acc, bill) => {
      const cat = bill.category || 'Other'
      acc[cat] = (acc[cat] || 0) + (bill.amount || 0)
      return acc
    }, {})

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Total Groups</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{totalGroups}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-700 p-3 rounded-lg">
              <Receipt className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Total Members</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{totalMembers}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-700 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{totalBills}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-700 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-700 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => {
              const percentage = (amount / totalExpenses) * 100
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary-900 dark:text-primary-100">{category}</span>
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-primary-100 dark:bg-primary-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {recentBills.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Bills
          </h3>
          <div className="space-y-2">
            {recentBills.map((bill, index) => (
              <div
                key={`${bill.groupName}-${bill.id}-${index}`}
                className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-900 dark:text-primary-100 truncate">
                    {bill.description}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {bill.groupName} • {bill.category}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                    {formatCurrency(bill.amount)}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {bill.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

