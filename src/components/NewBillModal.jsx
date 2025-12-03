import { X, Check, Users, Receipt, DollarSign, Tag, User, Divide } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatCurrency } from '../utils/currency'

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Groceries',
  'Utilities',
  'Other'
]

export default function NewBillModal({ onClose, onAdd, members, editingBill }) {
  const [description, setDescription] = useState(editingBill?.description || '')
  const [amount, setAmount] = useState(editingBill?.amount?.toString() || '')
  const [category, setCategory] = useState(editingBill?.category || CATEGORIES[0])
  const [paidBy, setPaidBy] = useState(editingBill?.paidBy || members[0]?.id || '')
  const [splitType, setSplitType] = useState(editingBill ? 'custom' : 'equal') // 'equal' or 'custom'
  const [customSplit, setCustomSplit] = useState(editingBill?.splitRatio || {})
  const [selectedMembers, setSelectedMembers] = useState(() => {
    if (editingBill) {
      // For editing, select members who have non-zero split ratio
      return new Set(Object.entries(editingBill.splitRatio)
        .filter(([_, share]) => share > 0)
        .map(([memberId]) => memberId))
    }
    // Initialize with all members selected
    return new Set(members.map(m => m.id))
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const billAmount = parseFloat(amount)
    
    if (!description.trim() || !amount || billAmount <= 0) {
      alert('Please fill in all required fields with valid values')
      return
    }

    if (!paidBy) {
      alert('Please select who paid for this bill')
      return
    }

    let splitRatio = {}
    
    if (splitType === 'equal') {
      // Only include selected members in equal split
      const selectedCount = selectedMembers.size
      if (selectedCount === 0) {
        alert('Please select at least one member to split the bill')
        return
      }
      // Optimized: Only store non-zero split ratios to save space
      // But for consistency, we'll store all members with 0 for excluded ones
      members.forEach(member => {
        splitRatio[member.id] = selectedMembers.has(member.id) ? 1 : 0
      })
    } else {
      // Custom split
      const totalShares = Object.values(customSplit).reduce((sum, share) => sum + parseFloat(share || 0), 0)
      if (totalShares === 0) {
        alert('Please set split ratios for at least one member')
        return
      }
      members.forEach(member => {
        splitRatio[member.id] = parseFloat(customSplit[member.id] || 0)
      })
    }

    const bill = {
      id: editingBill?.id || Date.now().toString(),
      description: description.trim(),
      amount: billAmount,
      category,
      paidBy,
      splitRatio,
      createdAt: editingBill?.createdAt || new Date().toISOString()
    }

    onAdd(bill)
    
    // Reset form only if not editing
    if (!editingBill) {
      setDescription('')
      setAmount('')
      setCategory(CATEGORIES[0])
      setPaidBy(members[0]?.id || '')
      setSplitType('equal')
      setCustomSplit({})
      setSelectedMembers(new Set(members.map(m => m.id)))
    }
  }

  // Update selected members when members list changes
  useEffect(() => {
    const newSelected = new Set(selectedMembers)
    members.forEach(member => {
      if (!newSelected.has(member.id)) {
        newSelected.add(member.id)
      }
    })
    // Remove members that no longer exist
    selectedMembers.forEach(memberId => {
      if (!members.find(m => m.id === memberId)) {
        newSelected.delete(memberId)
      }
    })
    setSelectedMembers(newSelected)
  }, [members])

  // Calculate preview for equal split
  const calculateEqualSplitPreview = () => {
    if (!amount || parseFloat(amount) <= 0) return null
    const billAmount = parseFloat(amount)
    const selectedCount = selectedMembers.size
    if (selectedCount === 0) return null
    return billAmount / selectedCount
  }

  const toggleMember = (memberId) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const selectAllMembers = () => {
    setSelectedMembers(new Set(members.map(m => m.id)))
  }

  const deselectAllMembers = () => {
    setSelectedMembers(new Set())
  }

  // Quick action: Exclude the person who paid (common case - they already paid)
  const excludePaidBy = () => {
    const newSelected = new Set(selectedMembers)
    if (paidBy) {
      newSelected.delete(paidBy)
    }
    setSelectedMembers(newSelected)
  }

  // Quick action: Include only the person who paid (for personal expenses)
  const includeOnlyPaidBy = () => {
    if (paidBy) {
      setSelectedMembers(new Set([paidBy]))
    }
  }

  const equalSplitPreview = calculateEqualSplitPreview()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start sm:items-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="card max-w-2xl w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-900">
            {editingBill ? 'Edit Bill' : 'Add New Bill'}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800 p-1 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Details Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Receipt className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-primary-900">Bill Details</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner at Restaurant"
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Amount <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 font-semibold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-900 mb-2">
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Paid By <span className="text-red-500">*</span></span>
                </div>
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="input-field"
                required
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-primary-200"></div>

          {/* Split Options Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Divide className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-primary-900">Split Options</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-3">
                How would you like to split this bill?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  splitType === 'equal'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-primary-200 bg-white hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    value="equal"
                    checked={splitType === 'equal'}
                    onChange={(e) => setSplitType(e.target.value)}
                    className="mr-3 w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-primary-900">Equal Split</div>
                    <div className="text-xs text-primary-600 mt-1">Divide equally among selected members</div>
                  </div>
                </label>
                <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  splitType === 'custom'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-primary-200 bg-white hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    value="custom"
                    checked={splitType === 'custom'}
                    onChange={(e) => setSplitType(e.target.value)}
                    className="mr-3 w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-semibold text-primary-900">Custom Split</div>
                    <div className="text-xs text-primary-600 mt-1">Set custom amounts for each member</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {splitType === 'equal' && (
            <div className="border-2 border-primary-200 rounded-xl p-4 sm:p-5 bg-gradient-to-br from-primary-50 to-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-1">
                    Select Members to Include
                  </label>
                  <p className="text-xs text-primary-600">Choose who should share this expense</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className="text-xs px-3 py-1.5 text-primary-700 bg-white hover:text-primary-900 hover:bg-primary-100 rounded-md transition-colors border border-primary-300 font-medium"
                  >
                    Select All
                  </button>
                  {paidBy && (
                    <>
                      <button
                        type="button"
                        onClick={excludePaidBy}
                        className="text-xs px-2 sm:px-3 py-1.5 text-primary-700 bg-white hover:text-primary-900 hover:bg-primary-100 rounded-md transition-colors border border-primary-300 font-medium"
                        title="Exclude the person who paid"
                      >
                        <span className="hidden sm:inline">Exclude Paid By</span>
                        <span className="sm:hidden">Exclude</span>
                      </button>
                      <button
                        type="button"
                        onClick={includeOnlyPaidBy}
                        className="text-xs px-2 sm:px-3 py-1.5 text-primary-700 bg-white hover:text-primary-900 hover:bg-primary-100 rounded-md transition-colors border border-primary-300 font-medium"
                        title="Include only the person who paid"
                      >
                        <span className="hidden sm:inline">Only Paid By</span>
                        <span className="sm:hidden">Only</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {members.map(member => {
                  const isSelected = selectedMembers.has(member.id)
                  const isPaidBy = member.id === paidBy
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-2 border-primary-500 shadow-sm'
                          : 'bg-white border-2 border-primary-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-primary-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className={`font-semibold text-sm sm:text-base truncate ${isSelected ? 'text-primary-900' : 'text-primary-700'}`}>
                            {member.name}
                          </span>
                          {isPaidBy && (
                            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && equalSplitPreview && (
                        <div className="ml-3 flex-shrink-0 text-right">
                          <div className="text-sm font-bold text-primary-900">
                            {formatCurrency(equalSplitPreview)}
                          </div>
                          <div className="text-xs text-primary-600">each</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {equalSplitPreview && selectedMembers.size > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-100 to-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary-600" />
                      <div>
                        <div className="text-sm font-medium text-primary-700">Split Summary</div>
                        <div className="text-xs text-primary-600">{selectedMembers.size} {selectedMembers.size === 1 ? 'person' : 'people'} included</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-primary-600 mb-1">Each person pays</div>
                      <div className="text-2xl font-bold text-primary-900">
                        {formatCurrency(equalSplitPreview)}
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-primary-200 flex items-center justify-between">
                    <span className="text-sm text-primary-600 font-medium">Total Bill Amount:</span>
                    <span className="text-lg font-bold text-primary-900">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                </div>
              )}

              {selectedMembers.size === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex items-start space-x-3">
                  <span className="text-yellow-600 font-bold text-lg flex-shrink-0">⚠️</span>
                  <div>
                    <div className="text-sm font-semibold text-yellow-900 mb-1">No members selected</div>
                    <div className="text-xs text-yellow-800">Please select at least one member to split this bill</div>
                  </div>
                </div>
              )}
            </div>
          )}

              {splitType === 'custom' && (
            <div className="border-2 border-primary-200 rounded-xl p-4 sm:p-5 bg-gradient-to-br from-primary-50 to-white">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-primary-900 mb-1">
                  Custom Split Ratios
                </label>
                <p className="text-xs text-primary-600">Enter the share for each member (use 0 to exclude)</p>
              </div>
              <div className="space-y-3 mb-4">
                {members.map(member => {
                  const share = parseFloat(customSplit[member.id] || 0)
                  const totalShares = Object.values(customSplit).reduce((sum, s) => sum + parseFloat(s || 0), 0)
                  const memberShare = totalShares > 0 && parseFloat(amount) > 0 
                    ? (share / totalShares) * parseFloat(amount) 
                    : 0
                  const isPaidBy = member.id === paidBy
                  
                  return (
                    <div key={member.id} className="bg-white border border-primary-200 rounded-lg p-3 hover:border-primary-300 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <User className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-primary-900 truncate">{member.name}</span>
                          {isPaidBy && (
                            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                              Paid
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                          <div className="relative flex-1 sm:flex-initial sm:w-32">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={customSplit[member.id] || ''}
                              onChange={(e) => setCustomSplit({
                                ...customSplit,
                                [member.id]: e.target.value
                              })}
                              placeholder="0.00"
                              className="input-field text-sm"
                            />
                          </div>
                          {share > 0 && memberShare > 0 && (
                            <div className="text-right flex-shrink-0 sm:w-28">
                              <div className="text-sm font-bold text-primary-900">
                                {formatCurrency(memberShare)}
                              </div>
                              <div className="text-xs text-primary-600">share</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {parseFloat(amount) > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-primary-200 bg-gradient-to-r from-primary-100 to-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-700">Total Shares:</span>
                    <span className="text-lg font-bold text-primary-900">
                      {Object.values(customSplit).reduce((sum, s) => sum + parseFloat(s || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary-200">
                    <span className="text-sm font-medium text-primary-700">Total Bill Amount:</span>
                    <span className="text-lg font-bold text-primary-900">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 order-2 sm:order-1 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 order-1 sm:order-2 py-3 text-base font-semibold shadow-lg hover:shadow-xl"
            >
              {editingBill ? 'Update Bill' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

