import { useState } from 'react'
import { Users, Plus, Receipt, Calculator, ArrowLeft, BarChart3, Save, CheckCircle } from 'lucide-react'
import MemberList from './MemberList'
import BillList from './BillList'
import ExpenseTally from './ExpenseTally'
import ExpenseStats from './ExpenseStats'
import NewMemberModal from './NewMemberModal'
import NewBillModal from './NewBillModal'
import SearchBar from './SearchBar'
import FilterDropdown from './FilterDropdown'
import SortDropdown from './SortDropdown'

export default function GroupView({ group, onUpdateGroup, onBack, onSave, onShowToast }) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [lastSaved, setLastSaved] = useState(null)
  const [activeTab, setActiveTab] = useState('bills')
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)
  const [showNewBillModal, setShowNewBillModal] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [billSearchQuery, setBillSearchQuery] = useState('')
  const [billFilters, setBillFilters] = useState([])
  const [billSort, setBillSort] = useState(null)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  const addMember = (name) => {
    const newMember = {
      id: Date.now().toString(),
      name: name.trim()
    }
    onUpdateGroup({
      members: [...group.members, newMember]
    })
    setShowNewMemberModal(false)
  }

  const editMember = (memberId, newName) => {
    onUpdateGroup({
      members: group.members.map(m => 
        m.id === memberId ? { ...m, name: newName.trim() } : m
      )
    })
    setEditingMember(null)
  }

  const removeMember = (memberId) => {
    const updatedBills = group.bills.filter(bill => 
      bill.paidBy !== memberId && 
      !Object.keys(bill.splitRatio).includes(memberId)
    )
    
    onUpdateGroup({
      members: group.members.filter(m => m.id !== memberId),
      bills: updatedBills
    })
  }

  const addBill = (bill) => {
    if (editingBill) {
      onUpdateGroup({
        bills: group.bills.map(b => b.id === editingBill.id ? bill : b)
      })
      setEditingBill(null)
    } else {
      onUpdateGroup({
        bills: [...group.bills, bill]
      })
    }
    setShowNewBillModal(false)
  }

  const handleEditBill = (bill) => {
    setEditingBill(bill)
    setShowNewBillModal(true)
  }

  const deleteBill = (billId) => {
    onUpdateGroup({
      bills: group.bills.filter(b => b.id !== billId)
    })
  }

  const getFilteredAndSortedBills = () => {
    let filtered = group.bills

    // Filter by search
    if (billSearchQuery) {
      filtered = filtered.filter(bill =>
        bill.description.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
        bill.category.toLowerCase().includes(billSearchQuery.toLowerCase())
      )
    }

    // Filter by category/member
    if (billFilters.length > 0) {
      filtered = filtered.filter(bill =>
        billFilters.includes(bill.category) ||
        billFilters.includes(bill.paidBy)
      )
    }

    // Sort
    if (billSort) {
      filtered = [...filtered].sort((a, b) => {
        switch (billSort.value) {
          case 'amount-asc':
            return a.amount - b.amount
          case 'amount-desc':
            return b.amount - a.amount
          case 'date-asc':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          case 'date-desc':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          case 'category':
            return a.category.localeCompare(b.category)
          default:
            return 0
        }
      })
    }

    return filtered
  }

  const getFilteredMembers = () => {
    if (!memberSearchQuery) return group.members
    return group.members.filter(member =>
      member.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
    )
  }

  const categoryOptions = [
    ...new Set(group.bills.map(b => b.category))
  ].map(cat => ({ value: cat, label: cat }))

  const memberOptions = group.members.map(m => ({
    value: m.id,
    label: m.name
  }))

  const sortOptions = [
    { value: 'amount-desc', label: 'Amount (High to Low)' },
    { value: 'amount-asc', label: 'Amount (Low to High)' },
    { value: 'date-desc', label: 'Date (Newest)' },
    { value: 'date-asc', label: 'Date (Oldest)' },
    { value: 'category', label: 'Category' },
  ]

  const handleSave = async () => {
    if (!onSave) return
    
    setIsSaving(true)
    setSaveStatus(null)
    
    try {
      const success = await onSave()
      if (success) {
        setSaveStatus('success')
        setLastSaved(new Date())
        if (onShowToast) {
          onShowToast('Data saved successfully!', 'success')
        }
      } else {
        setSaveStatus('error')
        if (onShowToast) {
          onShowToast('Failed to save data. Please try again.', 'error')
        }
      }
      
      setTimeout(() => {
        setSaveStatus(null)
      }, 2000)
    } catch (error) {
      console.error('Error saving:', error)
      setSaveStatus('error')
      if (onShowToast) {
        onShowToast('Error saving data. Please try again.', 'error')
      }
      setTimeout(() => {
        setSaveStatus(null)
      }, 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const formatLastSaved = (date) => {
    if (!date) return null
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const tabs = [
    { id: 'members', label: 'Members', icon: Users },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'tally', label: 'Settle Up', icon: Calculator }
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <button
            onClick={onBack}
            className="text-primary-600 hover:text-primary-800 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Groups</span>
          </button>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="text-xs text-primary-600 hidden sm:block">
                Last saved: {formatLastSaved(lastSaved)}
              </div>
            )}
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  saveStatus === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : saveStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'btn-primary'
                }`}
                title="Save all changes to shared storage"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 break-words">{group.name}</h2>
      </div>

      <div className="border-b border-primary-200 mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex space-x-1 min-w-max sm:min-w-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-xs sm:text-sm transition-colors duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-primary-500 hover:text-primary-700'
                }`}
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {activeTab === 'members' && (
          <div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-primary-900 dark:text-primary-100">Group Members</h3>
              <button
                onClick={() => setShowNewMemberModal(true)}
                className="btn-primary flex items-center justify-center space-x-2"
                disabled={group.members.length >= 20}
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
            <div className="mb-4">
              <SearchBar
                onSearch={setMemberSearchQuery}
                placeholder="Search members..."
              />
            </div>
            <MemberList
              members={getFilteredMembers()}
              onRemove={removeMember}
              onEdit={setEditingMember}
            />
          </div>
        )}

        {activeTab === 'bills' && (
          <div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-primary-900 dark:text-primary-100">Bills</h3>
              <button
                onClick={() => setShowNewBillModal(true)}
                className="btn-primary flex items-center justify-center space-x-2"
                disabled={group.members.length === 0}
              >
                <Plus className="w-4 h-4" />
                <span>Add Bill</span>
              </button>
            </div>
            {group.members.length === 0 ? (
              <div className="card text-center py-8">
                <Users className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                <p className="text-primary-600 dark:text-primary-400">Add members to the group before adding bills</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <SearchBar
                      onSearch={setBillSearchQuery}
                      placeholder="Search bills..."
                    />
                  </div>
                  <FilterDropdown
                    options={[...categoryOptions, ...memberOptions]}
                    onFilter={setBillFilters}
                    label="Filter"
                  />
                  <SortDropdown
                    options={sortOptions}
                    onSort={setBillSort}
                    label="Sort"
                  />
                </div>
              <BillList
                bills={getFilteredAndSortedBills()}
                members={group.members}
                onDelete={deleteBill}
                onEdit={handleEditBill}
                onReorder={(reorderedBills) => {
                  onUpdateGroup({ bills: reorderedBills })
                }}
                enableMultiSelect={true}
              />
              </>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <ExpenseStats
            group={group}
          />
        )}

        {activeTab === 'tally' && (
          <ExpenseTally
            group={group}
            onUpdateGroup={onUpdateGroup}
            onSave={onSave}
          />
        )}
      </div>

      {showNewMemberModal && (
        <NewMemberModal
          onClose={() => setShowNewMemberModal(false)}
          onAdd={addMember}
          existingMembers={group.members}
        />
      )}

      {showNewBillModal && (
        <NewBillModal
          onClose={() => {
            setShowNewBillModal(false)
            setEditingBill(null)
          }}
          onAdd={addBill}
          members={group.members}
          editingBill={editingBill}
        />
      )}

      {editingMember && (
        <NewMemberModal
          onClose={() => setEditingMember(null)}
          onAdd={(name) => editMember(editingMember.id, name)}
          existingMembers={group.members.filter(m => m.id !== editingMember.id)}
          editingMember={editingMember}
        />
      )}
    </div>
  )
}

