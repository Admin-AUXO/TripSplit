import { Calculator, ArrowRight, Users, CheckCircle2, Download, Printer, Clock, CheckCircle, Save } from 'lucide-react'
import { calculateBalances, calculateSettlements } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { useState, useMemo, useEffect } from 'react'

export default function ExpenseTally({ group, onUpdateGroup, onSave }) {
  // Initialize paidSettlements from group data or empty Set
  const [paidSettlements, setPaidSettlements] = useState(() => {
    if (group.paidSettlements && Array.isArray(group.paidSettlements)) {
      return new Set(group.paidSettlements)
    }
    return new Set()
  })
  const [activeTab, setActiveTab] = useState('pending')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update local state when group data changes (from external updates)
  // Only sync if the data actually changed to avoid unnecessary updates
  useEffect(() => {
    const groupPaidSettlements = group.paidSettlements && Array.isArray(group.paidSettlements) 
      ? new Set(group.paidSettlements) 
      : new Set()
    
    const currentArray = Array.from(paidSettlements).sort()
    const groupArray = Array.from(groupPaidSettlements).sort()
    
    if (JSON.stringify(currentArray) !== JSON.stringify(groupArray)) {
      setPaidSettlements(groupPaidSettlements)
      setHasUnsavedChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.paidSettlements])
  
  // Calculate balances considering paid settlements
  const balances = useMemo(() => {
    const baseBalances = calculateBalances(group)
    const settlements = calculateSettlements(baseBalances)
    
    // Adjust balances based on paid settlements
    const adjustedBalances = { ...baseBalances }
    
    settlements.forEach((settlement, index) => {
      if (paidSettlements.has(index)) {
        // Settlement is paid - adjust balances
        adjustedBalances[settlement.from] = (adjustedBalances[settlement.from] || 0) + settlement.amount
        adjustedBalances[settlement.to] = (adjustedBalances[settlement.to] || 0) - settlement.amount
      }
    })
    
    return adjustedBalances
  }, [group, paidSettlements])
  
  const settlements = useMemo(() => calculateSettlements(calculateBalances(group)), [group])
  
  const getMemberName = (memberId) => {
    return group.members.find(m => m.id === memberId)?.name || 'Unknown'
  }

  const toggleSettlementPaid = (index) => {
    const newPaid = new Set(paidSettlements)
    if (newPaid.has(index)) {
      newPaid.delete(index)
    } else {
      newPaid.add(index)
    }
    setPaidSettlements(newPaid)
    setHasUnsavedChanges(true)
    
    // Update group data immediately
    if (onUpdateGroup) {
      onUpdateGroup({
        paidSettlements: Array.from(newPaid)
      })
    }
  }

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave()
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Error saving:', error)
        // Keep hasUnsavedChanges true on error so user can retry
      }
    }
  }

  const exportSettlements = () => {
    const settlementText = settlements.map((settlement, index) => {
      const from = getMemberName(settlement.from)
      const to = getMemberName(settlement.to)
      const status = paidSettlements.has(index) ? '✓ PAID' : 'Pending'
      return `${from} → ${to}: ${formatCurrency(settlement.amount)} (${status})`
    }).join('\n')

    const summary = `
Settlement Summary for "${group.name}"
Generated: ${new Date().toLocaleString()}

Total Expenses: ${formatCurrency(group.bills.reduce((sum, bill) => sum + bill.amount, 0))}
Number of Settlements: ${settlements.length}

SETTLEMENTS:
${settlementText}

Total to Settle: ${formatCurrency(settlements.reduce((sum, s) => sum + s.amount, 0))}
    `.trim()

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settlement-${group.name}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printSettlements = () => {
    const printWindow = window.open('', '_blank')
    const settlementHTML = settlements.map((settlement, index) => {
      const from = getMemberName(settlement.from)
      const to = getMemberName(settlement.to)
      const status = paidSettlements.has(index) ? '✓ PAID' : 'Pending'
      return `<tr>
        <td>${from}</td>
        <td>→</td>
        <td>${to}</td>
        <td><strong>${formatCurrency(settlement.amount)}</strong></td>
        <td>${status}</td>
      </tr>`
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Settlement Summary - ${group.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0369a1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #0369a1; color: white; }
            .paid { color: green; }
          </style>
        </head>
        <body>
          <h1>Settlement Summary</h1>
          <p><strong>Group:</strong> ${group.name}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Expenses:</strong> ${formatCurrency(group.bills.reduce((sum, bill) => sum + bill.amount, 0))}</p>
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th></th>
                <th>To</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${settlementHTML}
            </tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const totalExpenses = group.bills.reduce((sum, bill) => sum + bill.amount, 0)

  if (group.members.length === 0) {
    return (
      <div className="card text-center py-8">
        <Users className="w-12 h-12 text-primary-300 mx-auto mb-3" />
        <p className="text-primary-600">Add members to see expense tallies</p>
      </div>
    )
  }

  if (group.bills.length === 0) {
    return (
      <div className="card text-center py-8">
        <Calculator className="w-12 h-12 text-primary-300 mx-auto mb-3" />
        <p className="text-primary-600">Add bills to see who owes whom</p>
      </div>
    )
  }

  const creditors = useMemo(() => 
    Object.entries(balances)
      .filter(([_, balance]) => balance > 0.01)
      .map(([memberId, balance]) => ({ memberId, balance }))
      .sort((a, b) => b.balance - a.balance),
    [balances]
  )

  const debtors = useMemo(() =>
    Object.entries(balances)
      .filter(([_, balance]) => balance < -0.01)
      .map(([memberId, balance]) => ({ memberId, balance: Math.abs(balance) }))
      .sort((a, b) => b.balance - a.balance),
    [balances]
  )

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm mb-1">Total Expenses</p>
            <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Calculator className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Current Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {creditors.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">
              Gets Back
            </h3>
            <div className="space-y-2">
              {creditors.map(({ memberId, balance }) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <span className="font-medium text-primary-900">{getMemberName(memberId)}</span>
                  <span className="font-semibold text-green-700">+{formatCurrency(balance)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {debtors.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">
              Owes
            </h3>
            <div className="space-y-2">
              {debtors.map(({ memberId, balance }) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <span className="font-medium text-primary-900">{getMemberName(memberId)}</span>
                  <span className="font-semibold text-red-700">-{formatCurrency(balance)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settlement Suggestions */}
      {settlements.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-primary-900">Settlement Suggestions</h3>
              <p className="text-xs sm:text-sm text-primary-600 mt-1">
                {settlements.length} payment{settlements.length !== 1 ? 's' : ''} needed • Optimized to minimize transactions
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {onSave && (
                <button
                  onClick={handleSave}
                  className={`flex items-center justify-center space-x-2 text-xs sm:text-sm py-2 px-3 flex-1 sm:flex-initial ${
                    hasUnsavedChanges
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                  title="Save settlement changes"
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="w-4 h-4" />
                  <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
                </button>
              )}
              <button
                onClick={exportSettlements}
                className="btn-secondary flex items-center justify-center space-x-2 text-xs sm:text-sm py-2 px-3 flex-1 sm:flex-initial"
                title="Export as text file"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={printSettlements}
                className="btn-secondary flex items-center justify-center space-x-2 text-xs sm:text-sm py-2 px-3 flex-1 sm:flex-initial"
                title="Print settlement summary"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-primary-200 mb-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 flex items-center space-x-2 ${
                  activeTab === 'pending'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-primary-500 hover:text-primary-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pending ({settlements.length - paidSettlements.size})</span>
              </button>
              <button
                onClick={() => setActiveTab('paid')}
                className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 flex items-center space-x-2 ${
                  activeTab === 'paid'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-primary-500 hover:text-primary-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Paid ({paidSettlements.size})</span>
              </button>
            </div>
          </div>

          {/* Settlement List */}
          <div className="space-y-3">
            {settlements
              .filter((_, index) => {
                const isPaid = paidSettlements.has(index)
                return activeTab === 'pending' ? !isPaid : isPaid
              })
              .map((settlement, originalIndex) => {
                const index = settlements.findIndex(s => 
                  s.from === settlement.from && 
                  s.to === settlement.to && 
                  s.amount === settlement.amount
                )
                const isPaid = paidSettlements.has(index)
                return (
                  <div
                    key={`${settlement.from}-${settlement.to}-${settlement.amount}-${index}`}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isPaid
                        ? 'bg-green-50 border-green-300'
                        : 'bg-primary-50 border-primary-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSettlementPaid(index)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isPaid
                            ? 'bg-green-600 border-green-600'
                            : 'border-primary-300 bg-white hover:border-primary-500'
                        }`}
                        title={isPaid ? 'Mark as unpaid' : 'Mark as paid'}
                      >
                        {isPaid && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary-900 text-sm sm:text-base truncate">{getMemberName(settlement.from)}</p>
                        <p className="text-xs sm:text-sm text-primary-600">should pay</p>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-right">
                        <p className="font-medium text-primary-900 text-sm sm:text-base truncate">{getMemberName(settlement.to)}</p>
                        <p className="text-xs sm:text-sm text-primary-600">should receive</p>
                      </div>
                    </div>
                    <div className={`ml-2 sm:ml-4 px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base flex-shrink-0 ${
                      isPaid
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-600 text-white'
                    }`}>
                      {formatCurrency(settlement.amount)}
                    </div>
                  </div>
                )
              })}
          </div>

          {activeTab === 'pending' && settlements.filter((_, index) => !paidSettlements.has(index)).length === 0 && (
            <div className="text-center py-8 text-primary-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All settlements are paid!</p>
            </div>
          )}

          {activeTab === 'paid' && paidSettlements.size === 0 && (
            <div className="text-center py-8 text-primary-600">
              <Clock className="w-12 h-12 mx-auto mb-3 text-primary-300" />
              <p className="font-medium">No paid settlements yet</p>
            </div>
          )}
        </div>
      )}

      {settlements.length === 0 && creditors.length === 0 && debtors.length === 0 && (
        <div className="card text-center py-8">
          <Calculator className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-primary-600">All expenses are balanced! No settlements needed.</p>
        </div>
      )}
    </div>
  )
}

