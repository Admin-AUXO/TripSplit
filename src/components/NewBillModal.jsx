import { X, Check, Users } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-900">
            {editingBill ? 'Edit Bill' : 'Add New Bill'}
          </h2>
          <button
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Description *
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Category
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
              Paid By *
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

          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              Split Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="equal"
                  checked={splitType === 'equal'}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="mr-2 w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-primary-900 font-medium">Equal Split</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="custom"
                  checked={splitType === 'custom'}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="mr-2 w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-primary-900 font-medium">Custom Split</span>
              </label>
            </div>
          </div>

          {splitType === 'equal' && (
            <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-primary-900">
                  Select Members to Include
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllMembers}
                    className="text-xs px-2 py-1 text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded transition-colors"
                  >
                    All
                  </button>
                  {paidBy && (
                    <>
                      <button
                        type="button"
                        onClick={excludePaidBy}
                        className="text-xs px-2 py-1 text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded transition-colors"
                        title="Exclude the person who paid"
                      >
                        Exclude Paid By
                      </button>
                      <button
                        type="button"
                        onClick={includeOnlyPaidBy}
                        className="text-xs px-2 py-1 text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded transition-colors"
                        title="Include only the person who paid"
                      >
                        Only Paid By
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                {members.map(member => {
                  const isSelected = selectedMembers.has(member.id)
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-white border-2 border-primary-500'
                          : 'bg-primary-100 border-2 border-transparent hover:bg-primary-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-primary-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-primary-700'}`}>
                          {member.name}
                        </span>
                        {member.id === paidBy && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                            Paid
                          </span>
                        )}
                      </div>
                      {isSelected && equalSplitPreview && (
                        <span className="text-sm font-semibold text-primary-700">
                          {formatCurrency(equalSplitPreview)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {equalSplitPreview && selectedMembers.size > 0 && (
                <div className="mt-3 pt-3 border-t border-primary-200 bg-white rounded p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-primary-600 font-medium">Each person pays:</span>
                    <span className="font-bold text-primary-900 text-lg">
                      {formatCurrency(equalSplitPreview)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-primary-500">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{selectedMembers.size} {selectedMembers.size === 1 ? 'person' : 'people'} included</span>
                    </span>
                    <span className="font-medium">Total: {formatCurrency(parseFloat(amount))}</span>
                  </div>
                </div>
              )}

              {selectedMembers.size === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800 flex items-center space-x-2">
                  <span className="text-yellow-600 font-bold">⚠️</span>
                  <span>Please select at least one member to split the bill</span>
                </div>
              )}
            </div>
          )}

          {splitType === 'custom' && (
            <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
              <label className="block text-sm font-medium text-primary-900 mb-3">
                Custom Split Ratios (use 0 to exclude a member)
              </label>
              <div className="space-y-2 mb-3">
                {members.map(member => {
                  const share = parseFloat(customSplit[member.id] || 0)
                  const totalShares = Object.values(customSplit).reduce((sum, s) => sum + parseFloat(s || 0), 0)
                  const memberShare = totalShares > 0 && parseFloat(amount) > 0 
                    ? (share / totalShares) * parseFloat(amount) 
                    : 0
                  
                  return (
                    <div key={member.id} className="flex items-center space-x-3">
                      <span className="w-32 text-sm text-primary-900 font-medium flex items-center space-x-2">
                        <span>{member.name}</span>
                        {member.id === paidBy && (
                          <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded">
                            Paid
                          </span>
                        )}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customSplit[member.id] || ''}
                        onChange={(e) => setCustomSplit({
                          ...customSplit,
                          [member.id]: e.target.value
                        })}
                        placeholder="0"
                        className="input-field flex-1"
                      />
                      {share > 0 && memberShare > 0 && (
                        <span className="text-sm font-semibold text-primary-700 w-24 text-right">
                          {formatCurrency(memberShare)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {parseFloat(amount) > 0 && (
                <div className="mt-3 pt-3 border-t border-primary-200">
                  <div className="flex items-center justify-between text-xs text-primary-600">
                    <span>Total shares: {Object.values(customSplit).reduce((sum, s) => sum + parseFloat(s || 0), 0).toFixed(2)}</span>
                    <span>Total amount: {formatCurrency(parseFloat(amount))}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingBill ? 'Update Bill' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

