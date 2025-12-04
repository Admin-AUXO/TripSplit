import { Receipt, Trash2, Tag, User, Edit, GripVertical } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import SwipeableItem from './SwipeableItem'
import ContextMenu from './ContextMenu'
import DragDropContainer from './DragDropContainer'
import MultiSelect from './MultiSelect'
import EmptyState from './EmptyState'
import { isMobile } from '../utils/mobileDetect'
import { useState } from 'react'

export default function BillList({ bills, members, onDelete, onEdit, onReorder, enableMultiSelect = false }) {
  const [selectedIds, setSelectedIds] = useState([])
  const isMobileDevice = isMobile()
  const getMemberName = (memberId) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown'
  }

  if (bills.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No bills yet"
        description="Start tracking expenses by adding your first bill to this group."
        suggestions={[
          'Click "Add Bill" to create a new expense',
          'Assign who paid for the bill',
          'Choose how to split it among members',
          'Add categories to organize expenses'
        ]}
      />
    )
  }

  const handleReorder = (reorderedBills) => {
    if (onReorder) {
      onReorder(reorderedBills)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} selected bill(s)?`)) {
      selectedIds.forEach(id => onDelete(id))
      setSelectedIds([])
    }
  }

  const handleBulkEdit = () => {
    if (selectedIds.length === 1 && onEdit) {
      const bill = bills.find(b => b.id === selectedIds[0])
      if (bill) onEdit(bill)
      setSelectedIds([])
    }
  }

  if (enableMultiSelect && !isMobileDevice) {
    return (
      <div>
        <MultiSelect
          items={bills}
          onSelectionChange={setSelectedIds}
          renderItem={(bill, isSelected) => (
            <div
              className={`card hover:shadow-md transition-shadow ${
                isSelected ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-5 h-5 rounded border-primary-300 text-primary-600"
                  readOnly
                />
                {renderBillContent(bill)}
              </div>
            </div>
          )}
        />
        {selectedIds.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-4">
            <span>{selectedIds.length} selected</span>
            {selectedIds.length === 1 && (
              <button
                onClick={handleBulkEdit}
                className="bg-white text-primary-600 px-3 py-1 rounded hover:bg-primary-50"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-white hover:text-primary-200"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    )
  }

  if (onReorder && !isMobileDevice) {
    return (
      <DragDropContainer items={bills} onReorder={handleReorder}>
        {bills.map((bill, index) => {
          return renderBill(bill, index)
        })}
      </DragDropContainer>
    )
  }

  return (
    <div className="space-y-4">
      {bills.map((bill, index) => {
        return renderBill(bill, index)
      })}
    </div>
  )

  function renderBill(bill, index) {
        const totalShares = Object.values(bill.splitRatio).reduce((sum, share) => sum + share, 0)
        const paidByName = getMemberName(bill.paidBy)
        
        const contextMenuItems = [
          { label: 'Edit', icon: Edit, onClick: () => onEdit && onEdit(bill) },
          { label: 'Delete', icon: Trash2, onClick: () => {
            if (confirm('Delete this bill?')) {
              onDelete(bill.id)
            }
          }, destructive: true },
        ]
        
        return (
          <div key={bill.id}>
            <ContextMenu items={contextMenuItems}>
              <SwipeableItem
                onSwipeLeft={() => {
                  if (confirm('Delete this bill?')) {
                    onDelete(bill.id)
                  }
                }}
                onSwipeRight={() => onEdit && onEdit(bill)}
                className="card hover:shadow-md transition-shadow flex items-start"
              >
                {!isMobile() && onReorder && (
                  <div className="mr-2 mt-1 cursor-move text-primary-400 hover:text-primary-600">
                    <GripVertical className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center flex-wrap gap-2 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-primary-900 dark:text-primary-100 break-words flex-1 min-w-0">{bill.description}</h4>
                        <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                          {bill.category}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                        <span className="font-semibold text-primary-900 dark:text-primary-100 text-sm sm:text-base">{formatCurrency(bill.amount)}</span>
                        <div className="flex items-center space-x-1.5 text-primary-600 dark:text-primary-400">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">Paid by {paidByName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(bill)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 p-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
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
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                        title="Delete bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-primary-100 dark:border-primary-700 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Split among:</p>
                      <p className="text-xs text-primary-500 dark:text-primary-400">
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
                                : 'bg-primary-50 dark:bg-primary-700 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-600'
                            }`}
                          >
                            {memberName}: {formatCurrency(memberShare)}
                          </span>
                        )
                      })}
                    </div>
                    {Object.values(bill.splitRatio).filter(share => share === 0).length > 0 && (
                      <p className="text-xs text-primary-500 dark:text-primary-400 mt-2 italic">
                        {Object.values(bill.splitRatio).filter(share => share === 0).length} member(s) excluded
                      </p>
                    )}
                  </div>
                </div>
              </SwipeableItem>
            </ContextMenu>
          </div>
        )
  }

  function renderBillContent(bill) {
    const totalShares = Object.values(bill.splitRatio).reduce((sum, share) => sum + share, 0)
    const paidByName = getMemberName(bill.paidBy)

    return (
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center flex-wrap gap-2 mb-2">
              <h4 className="text-base sm:text-lg font-semibold text-primary-900 dark:text-primary-100 break-words flex-1 min-w-0">{bill.description}</h4>
              <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                {bill.category}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="font-semibold text-primary-900 dark:text-primary-100 text-sm sm:text-base">{formatCurrency(bill.amount)}</span>
              <div className="flex items-center space-x-1.5 text-primary-600 dark:text-primary-400">
                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Paid by {paidByName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(bill)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 p-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
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
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              title="Delete bill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="border-t border-primary-100 dark:border-primary-700 pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Split among:</p>
            <p className="text-xs text-primary-500 dark:text-primary-400">
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
                      : 'bg-primary-50 dark:bg-primary-700 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-600'
                  }`}
                >
                  {memberName}: {formatCurrency(memberShare)}
                </span>
              )
            })}
          </div>
          {Object.values(bill.splitRatio).filter(share => share === 0).length > 0 && (
            <p className="text-xs text-primary-500 dark:text-primary-400 mt-2 italic">
              {Object.values(bill.splitRatio).filter(share => share === 0).length} member(s) excluded
            </p>
          )}
        </div>
      </div>
    )
  }
}

