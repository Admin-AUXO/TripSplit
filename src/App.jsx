import { useState, useEffect, useRef } from 'react'
import { Users, Plus, Receipt, Calculator, Home, Wifi, WifiOff } from 'lucide-react'
import { saveData, loadData, subscribeToGroups } from './utils/simpleStorage'
import GroupList from './components/GroupList'
import GroupView from './components/GroupView'
import NewGroupModal from './components/NewGroupModal'

function App() {
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [activeView, setActiveView] = useState('groups') // 'groups' or 'group'
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const unsubscribeRef = useRef(null)
  const isUpdatingRef = useRef(false)

  // Initialize and subscribe to real-time updates
  useEffect(() => {
    // Load initial data
    loadData().then(data => {
      setGroups(data.groups || [])
      if (data.groups && data.groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data.groups[0].id)
      }
      setIsLoading(false)
    }).catch(error => {
      console.error('Error loading initial data:', error)
      setIsLoading(false)
    })

    // Subscribe to real-time updates
    unsubscribeRef.current = subscribeToGroups((updatedGroups) => {
      if (!isUpdatingRef.current) {
        setGroups(updatedGroups)
        setIsConnected(true)
      }
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // Save groups when they change (but not from real-time updates)
  useEffect(() => {
    if (groups.length >= 0 && !isLoading) {
      isUpdatingRef.current = true
      saveData({ groups })
        .then(() => {
          isUpdatingRef.current = false
        })
        .catch(error => {
          console.error('Error saving data:', error)
          setIsConnected(false)
          isUpdatingRef.current = false
        })
    }
  }, [groups, isLoading])

  const createGroup = async (name) => {
    const newGroup = {
      id: Date.now().toString(),
      name,
      members: [],
      bills: [],
      createdAt: new Date().toISOString()
    }
    const updatedGroups = [...groups, newGroup]
    setGroups(updatedGroups)
    setSelectedGroupId(newGroup.id)
    setShowNewGroupModal(false)
    setActiveView('group')
  }

  const deleteGroup = async (groupId) => {
    const updatedGroups = groups.filter(g => g.id !== groupId)
    setGroups(updatedGroups)
    if (selectedGroupId === groupId) {
      if (updatedGroups.length > 0) {
        setSelectedGroupId(updatedGroups[0]?.id || null)
      } else {
        setSelectedGroupId(null)
        setActiveView('groups')
      }
    }
  }

  const updateGroup = async (groupId, updates) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ))
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary-900">TripSplit</h1>
              <div className="flex items-center space-x-2 ml-4">
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <Wifi className="w-4 h-4" />
                    <span>Shared</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </div>
                )}
              </div>
            </div>
            {activeView === 'group' && selectedGroup && (
              <button
                onClick={() => setActiveView('groups')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>All Groups</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-primary-600">Loading shared data...</p>
          </div>
        )}
        {!isLoading && (
          <>
          {activeView === 'groups' ? (
          <GroupList
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={(groupId) => {
              setSelectedGroupId(groupId)
              setActiveView('group')
            }}
            onCreateGroup={() => setShowNewGroupModal(true)}
            onDeleteGroup={deleteGroup}
          />
        ) : selectedGroup ? (
          <GroupView
            group={selectedGroup}
            onUpdateGroup={(updates) => updateGroup(selectedGroupId, updates)}
            onBack={() => setActiveView('groups')}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-primary-600 mb-4">No group selected</p>
            <button onClick={() => setActiveView('groups')} className="btn-primary">
              Go to Groups
            </button>
          </div>
        )}
          </>
        )}
      </main>

      {showNewGroupModal && (
        <NewGroupModal
          onClose={() => setShowNewGroupModal(false)}
          onCreate={createGroup}
        />
      )}
    </div>
  )
}

export default App

