import { useState } from 'react'
import { Users, Plus, Receipt, Calculator, ArrowLeft, BarChart3 } from 'lucide-react'
import MemberList from './MemberList'
import BillList from './BillList'
import ExpenseTally from './ExpenseTally'
import ExpenseStats from './ExpenseStats'
import NewMemberModal from './NewMemberModal'
import NewBillModal from './NewBillModal'

export default function GroupView({ group, onUpdateGroup, onBack }) {
  const [activeTab, setActiveTab] = useState('bills') // 'members', 'bills', 'tally'
  const [showNewMemberModal, setShowNewMemberModal] = useState(false)
  const [showNewBillModal, setShowNewBillModal] = useState(false)

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

  const removeMember = (memberId) => {
    // Remove member and all bills associated with them
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
    onUpdateGroup({
      bills: [...group.bills, bill]
    })
    setShowNewBillModal(false)
  }

  const deleteBill = (billId) => {
    onUpdateGroup({
      bills: group.bills.filter(b => b.id !== billId)
    })
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
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-800 mb-4 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
        <h2 className="text-3xl font-bold text-primary-900">{group.name}</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-primary-200 mb-6">
        <div className="flex space-x-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-primary-500 hover:text-primary-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary-900">Group Members</h3>
              <button
                onClick={() => setShowNewMemberModal(true)}
                className="btn-primary flex items-center space-x-2"
                disabled={group.members.length >= 20}
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
            <MemberList
              members={group.members}
              onRemove={removeMember}
            />
          </div>
        )}

        {activeTab === 'bills' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary-900">Bills</h3>
              <button
                onClick={() => setShowNewBillModal(true)}
                className="btn-primary flex items-center space-x-2"
                disabled={group.members.length === 0}
              >
                <Plus className="w-4 h-4" />
                <span>Add Bill</span>
              </button>
            </div>
            {group.members.length === 0 ? (
              <div className="card text-center py-8">
                <Users className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                <p className="text-primary-600">Add members to the group before adding bills</p>
              </div>
            ) : (
              <BillList
                bills={group.bills}
                members={group.members}
                onDelete={deleteBill}
              />
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
          onClose={() => setShowNewBillModal(false)}
          onAdd={addBill}
          members={group.members}
        />
      )}
    </div>
  )
}

