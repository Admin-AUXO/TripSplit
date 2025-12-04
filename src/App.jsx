import { useState, useEffect, useRef } from 'react'
import { Users, Plus, Receipt, Calculator, Home, Wifi, WifiOff, Settings, Copy, Check } from 'lucide-react'
import { saveData, loadData, subscribeToGroups, getStorageId } from './utils/simpleStorage'
import GroupList from './components/GroupList'
import GroupView from './components/GroupView'
import NewGroupModal from './components/NewGroupModal'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'

function App() {
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeView, setActiveView] = useState('groups') // 'groups' or 'group'
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const unsubscribeRef = useRef(null)
  const isUpdatingRef = useRef(false)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [binIdCopied, setBinIdCopied] = useState(false)
  const [currentBinId, setCurrentBinId] = useState(getStorageId())

  // Function to initialize data loading and subscription
  const initializeData = () => {
    // Unsubscribe from previous subscription if exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    setIsLoading(true)
    
    // Load initial data
    loadData().then(data => {
      const loadedGroups = data.groups || []
      setGroups(loadedGroups)
      // Set first group as selected if we have groups and no selection
      setSelectedGroupId(prevId => {
        if (loadedGroups.length > 0 && !prevId) {
          return loadedGroups[0].id
        }
        return prevId
      })
      setIsConnected(true) // Successfully loaded from shared storage
      setIsLoading(false)
    }).catch(error => {
      console.error('Error loading initial data:', error)
      // Don't set offline immediately - might be a temporary network issue
      setIsLoading(false)
    })

    // Subscribe to real-time updates
    unsubscribeRef.current = subscribeToGroups((updatedGroups) => {
      if (!isUpdatingRef.current) {
        setGroups(updatedGroups)
        setIsConnected(true) // Successfully received updates
      }
    })
  }

  // Initialize and subscribe to real-time updates
  useEffect(() => {
    initializeData()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // Handle storage ID change - reload data with new storage ID
  const handleStorageIdChange = async (newStorageId) => {
    // Clear current groups
    setGroups([])
    setSelectedGroupId(null)
    
    // Reinitialize with new storage ID
    initializeData()
  }

  // Save groups when they change (but not from real-time updates)
  // Use debouncing to avoid excessive API calls
  useEffect(() => {
    if (groups.length >= 0 && !isLoading) {
      // Debounce auto-save: wait 2 seconds after last change before saving
      // This prevents saving on every keystroke or rapid changes
      const saveTimeout = setTimeout(() => {
        isUpdatingRef.current = true
        saveData({ groups })
          .then(() => {
            isUpdatingRef.current = false
            setIsConnected(true)
          })
          .catch(error => {
            console.error('Error saving data:', error)
            // Only set offline if it's a persistent error, not a temporary network issue
            // The polling will recover connection status
            isUpdatingRef.current = false
          })
      }, 2000) // Wait 2 seconds after last change

      // Cleanup: cancel pending save if groups change again
      return () => {
        clearTimeout(saveTimeout)
      }
    }
  }, [groups, isLoading])

  const createGroup = async (name) => {
    const newGroup = {
      id: Date.now().toString(),
      name,
      members: [],
      bills: [],
      paidSettlements: [],
      createdAt: new Date().toISOString()
    }
    const updatedGroups = [...groups, newGroup]
    
    // Immediately save to shared storage before updating state
    isUpdatingRef.current = true
    try {
      await saveData({ groups: updatedGroups })
      setIsConnected(true)
    } catch (error) {
      console.error('Error saving new group:', error)
      // Don't set offline immediately - might be temporary, polling will recover
    } finally {
      isUpdatingRef.current = false
    }
    
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

  // Explicit save function for manual saving
  const saveGroupData = async () => {
    if (groups.length === 0) return
    
    isUpdatingRef.current = true
    try {
      await saveData({ groups })
      setIsConnected(true)
      setToast({ message: 'Data saved successfully!', type: 'success' })
      return true
    } catch (error) {
      console.error('Error saving data:', error)
      setIsConnected(false)
      setToast({ message: 'Failed to save data. Please try again.', type: 'error' })
      return false
    } finally {
      isUpdatingRef.current = false
    }
  }

  const handleCopyBinId = async () => {
    try {
      await navigator.clipboard.writeText(currentBinId)
      setBinIdCopied(true)
      setToast({ message: 'Bin ID copied to clipboard!', type: 'success' })
      setTimeout(() => setBinIdCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      setToast({ message: 'Failed to copy Bin ID', type: 'error' })
    }
  }

  // Update bin ID when it changes
  useEffect(() => {
    setCurrentBinId(getStorageId())
  }, [showSettingsModal])

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b border-primary-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="bg-primary-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-900 truncate">TripSplit</h1>
              <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4 flex-shrink-0">
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-600 text-xs sm:text-sm">
                    <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Shared</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600 text-xs sm:text-sm">
                    <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
                <div className="hidden sm:flex items-center space-x-1 text-primary-600 text-xs border-l border-primary-200 pl-2">
                  <span className="truncate max-w-[120px]" title={currentBinId}>
                    Bin: {currentBinId.substring(0, 12)}...
                  </span>
                  <button
                    onClick={handleCopyBinId}
                    className="p-1 hover:bg-primary-100 rounded transition-colors"
                    title="Copy Bin ID"
                  >
                    {binIdCopied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="btn-secondary flex items-center justify-center space-x-2"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              {activeView === 'group' && selectedGroup && (
                <button
                  onClick={() => setActiveView('groups')}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">All Groups</span>
                  <span className="sm:hidden">Groups</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
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
            onSave={saveGroupData}
            onShowToast={(message, type) => setToast({ message, type })}
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

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onStorageIdChange={handleStorageIdChange}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
    </div>
  )
}

export default App

