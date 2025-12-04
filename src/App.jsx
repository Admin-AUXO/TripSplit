import { useState, useEffect, useRef } from 'react'
import { Users, Plus, Receipt, Calculator, Home, Wifi, WifiOff, Settings, Copy, Check, Moon, Sun, Search, Download, Upload, Share2, Undo, Redo, HelpCircle } from 'lucide-react'
import { saveData, loadData, subscribeToGroups, getStorageId } from './utils/simpleStorage'
import GroupList from './components/GroupList'
import GroupView from './components/GroupView'
import NewGroupModal from './components/NewGroupModal'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'
import BottomNavigation from './components/BottomNavigation'
import FloatingActionButton from './components/FloatingActionButton'
import PullToRefresh from './components/PullToRefresh'
import SearchBar from './components/SearchBar'
import Tooltip from './components/Tooltip'
import Sidebar from './components/Sidebar'
import QuickStats from './components/QuickStats'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDarkMode } from './hooks/useDarkMode'
import { useUndoRedo } from './hooks/useUndoRedo'
import { useOfflineQueue } from './hooks/useOfflineQueue'
import { exportToJSON, exportToCSV, importFromJSON, generateShareLink } from './utils/exportImport'
import { isMobile } from './utils/mobileDetect'

function App() {
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeView, setActiveView] = useState('groups')
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const unsubscribeRef = useRef(null)
  const isUpdatingRef = useRef(false)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [binIdCopied, setBinIdCopied] = useState(false)
  const [currentBinId, setCurrentBinId] = useState(getStorageId())
  const [searchQuery, setSearchQuery] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile())
  const [showStats, setShowStats] = useState(false)
  
  // Hooks
  const [isDark, toggleDarkMode] = useDarkMode()
  const { state: undoState, updateState: updateUndoState, undo, redo, canUndo, canRedo } = useUndoRedo(groups)
  const { isOnline, queue, processQueue, clearQueue, hasPendingActions } = useOfflineQueue()
  
  // Update undo state when groups change
  useEffect(() => {
    if (groups.length > 0 || undoState.length === 0) {
      updateUndoState(groups)
    }
  }, [groups])

  const initializeData = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    setIsLoading(true)
    
    loadData().then(data => {
      const loadedGroups = data.groups || []
      setGroups(loadedGroups)
      setSelectedGroupId(prevId => {
        if (loadedGroups.length > 0 && !prevId) {
          return loadedGroups[0].id
        }
        return prevId
      })
      setIsConnected(true)
      setIsLoading(false)
    }).catch(error => {
      console.error('Error loading initial data:', error)
      setIsLoading(false)
    })

    unsubscribeRef.current = subscribeToGroups((updatedGroups) => {
      if (!isUpdatingRef.current) {
        setGroups(updatedGroups)
        setIsConnected(true)
      }
    })
  }

  useEffect(() => {
    initializeData()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: () => {
        if (activeView === 'groups') {
          setShowNewGroupModal(true)
        }
      }
    },
    {
      key: 's',
      ctrl: true,
      handler: (e) => {
        e.preventDefault()
        if (activeView === 'group' && selectedGroupId) {
          saveGroupData()
        }
      }
    },
    {
      key: 'f',
      ctrl: true,
      handler: (e) => {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    },
    {
      key: 'Escape',
      handler: () => {
        if (showNewGroupModal) setShowNewGroupModal(false)
        if (showSettingsModal) setShowSettingsModal(false)
        if (showHelp) setShowHelp(false)
      }
    },
    {
      key: 'z',
      ctrl: true,
      shift: false,
      handler: (e) => {
        e.preventDefault()
        if (canUndo) {
          const previousState = undo()
          if (previousState) setGroups(previousState)
        }
      }
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: (e) => {
        e.preventDefault()
        if (canRedo) {
          const nextState = redo()
          if (nextState) setGroups(nextState)
        }
      }
    }
  ])

  // Process offline queue when coming online
  useEffect(() => {
    if (isOnline && hasPendingActions && queue.length > 0) {
      processQueue(async (action) => {
        // Process queued actions - in a real app, these would be stored actions
        // For now, we'll just sync the current state
        await saveData({ groups })
        setToast({ message: 'Offline changes synced!', type: 'success' })
      })
    }
  }, [isOnline, hasPendingActions, queue.length])

  const handleStorageIdChange = async (newStorageId) => {
    setGroups([])
    setSelectedGroupId(null)
    initializeData()
  }

  useEffect(() => {
    if (groups.length >= 0 && !isLoading) {
      const saveTimeout = setTimeout(() => {
        isUpdatingRef.current = true
        saveData({ groups })
          .then(() => {
            isUpdatingRef.current = false
            setIsConnected(true)
          })
          .catch(error => {
            console.error('Error saving data:', error)
            isUpdatingRef.current = false
          })
      }, 2000)

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
    
    setGroups(updatedGroups)
    setSelectedGroupId(newGroup.id)
    setShowNewGroupModal(false)
    setActiveView('group')
    
    isUpdatingRef.current = true
    try {
      if (isOnline) {
        await saveData({ groups: updatedGroups })
        setIsConnected(true)
      } else {
        // Add to offline queue
        // Note: In a production app, you'd queue the specific action
        // For now, we'll just mark as offline
        setIsConnected(false)
        setToast({ message: 'Offline - changes will sync when online', type: 'info' })
      }
    } catch (error) {
      console.error('Error saving new group:', error)
      setIsConnected(false)
    } finally {
      isUpdatingRef.current = false
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await loadData()
      setGroups(data.groups || [])
      setIsConnected(true)
      setToast({ message: 'Refreshed successfully', type: 'success' })
    } catch (error) {
      console.error('Error refreshing:', error)
      setToast({ message: 'Failed to refresh', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportJSON = () => {
    try {
      exportToJSON({ groups }, `tripsplit-export-${new Date().toISOString().split('T')[0]}.json`)
      setToast({ message: 'Exported to JSON successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to export', type: 'error' })
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(groups, `tripsplit-export-${new Date().toISOString().split('T')[0]}.csv`)
      setToast({ message: 'Exported to CSV successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to export', type: 'error' })
    }
  }

  const handleImport = async (file) => {
    try {
      const data = await importFromJSON(file)
      if (data.groups && Array.isArray(data.groups)) {
        setGroups(data.groups)
        setToast({ message: 'Imported successfully', type: 'success' })
      } else {
        setToast({ message: 'Invalid file format', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Failed to import file', type: 'error' })
    }
  }

  const handleShare = async () => {
    try {
      const shareLink = generateShareLink(currentBinId)
      await navigator.clipboard.writeText(shareLink)
      setToast({ message: 'Share link copied to clipboard!', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to copy share link', type: 'error' })
    }
  }

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  useEffect(() => {
    setCurrentBinId(getStorageId())
  }, [showSettingsModal])

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

  const handleBottomNav = (view) => {
    if (view === 'create') {
      setShowNewGroupModal(true)
    } else if (view === 'settings') {
      setShowSettingsModal(true)
    } else {
      setActiveView('groups')
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <Sidebar
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(groupId) => {
          setSelectedGroupId(groupId)
          setActiveView('group')
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <header className="bg-white dark:bg-primary-800 shadow-sm border-b border-primary-200 dark:border-primary-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              {!isMobile() && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-primary-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <Home className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </button>
              )}
              <div className="bg-primary-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-100 truncate">TripSplit</h1>
              <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4 flex-shrink-0">
                {isConnected && isOnline ? (
                  <Tooltip text="Online - data is synced">
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-xs sm:text-sm">
                      <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Shared</span>
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip text={!isOnline ? 'Offline - changes will sync when online' : 'Disconnected'}>
                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs sm:text-sm">
                      <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{!isOnline ? 'Offline' : 'Disconnected'}</span>
                    </div>
                  </Tooltip>
                )}
                {hasPendingActions && (
                  <Tooltip text={`${queue.length} action(s) queued for sync`}>
                    <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400 text-xs">
                      <span className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full">
                        {queue.length}
                      </span>
                    </div>
                  </Tooltip>
                )}
                <div className="hidden sm:flex items-center space-x-1 text-primary-600 dark:text-primary-400 text-xs border-l border-primary-200 dark:border-primary-700 pl-2">
                  <span className="truncate max-w-[120px]" title={currentBinId}>
                    Bin: {currentBinId.substring(0, 12)}...
                  </span>
                  <button
                    onClick={handleCopyBinId}
                    className="p-1 hover:bg-primary-100 dark:hover:bg-primary-700 rounded transition-colors"
                    title="Copy Bin ID"
                  >
                    {binIdCopied ? (
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {!isMobile() && (
                <>
                  <Tooltip text="Search groups (Ctrl+F)">
                    <SearchBar
                      onSearch={setSearchQuery}
                      placeholder="Search groups..."
                      className="hidden md:block w-48 mr-2"
                    />
                  </Tooltip>
                  <Tooltip text="Toggle dark mode">
                    <button
                      onClick={toggleDarkMode}
                      className="btn-secondary flex items-center justify-center space-x-2"
                    >
                      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  </Tooltip>
                  {(canUndo || canRedo) && (
                    <>
                      <Tooltip text="Undo (Ctrl+Z)">
                        <button
                          onClick={() => {
                            const prev = undo()
                            if (prev) setGroups(prev)
                          }}
                          disabled={!canUndo}
                          className="btn-secondary p-2 disabled:opacity-50"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Redo (Ctrl+Shift+Z)">
                        <button
                          onClick={() => {
                            const next = redo()
                            if (next) setGroups(next)
                          }}
                          disabled={!canRedo}
                          className="btn-secondary p-2 disabled:opacity-50"
                        >
                          <Redo className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </>
              )}
              <Tooltip text="Settings">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </Tooltip>
              <Tooltip text="Help & keyboard shortcuts">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Help</span>
                </button>
              </Tooltip>
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

      <main className={`max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 pb-20 md:pb-8 transition-all overflow-x-hidden ${
        sidebarOpen && !isMobile() ? 'lg:ml-64' : ''
      }`} style={{ paddingBottom: isMobile() ? 'calc(5rem + env(safe-area-inset-bottom, 0px))' : undefined }}>
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-primary-600 dark:text-primary-400">Loading shared data...</p>
          </div>
        )}
        {!isLoading && (
          <>
          {activeView === 'groups' ? (
            <PullToRefresh onRefresh={handleRefresh}>
              {isMobile() && (
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="Search groups..."
                  className="mb-4"
                />
              )}
              <div className="flex items-center justify-between mb-4">
                {!isMobile() && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowStats(!showStats)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>{showStats ? 'Hide' : 'Show'} Stats</span>
                    </button>
                  </div>
                )}
              </div>
              {showStats && !isMobile() && (
                <div className="mb-6">
                  <QuickStats groups={groups} />
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {!isMobile() && (
                    <>
                      <Tooltip text="Export as JSON">
                        <button
                          onClick={handleExportJSON}
                          className="btn-secondary p-2"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Export as CSV">
                        <button
                          onClick={handleExportCSV}
                          className="btn-secondary p-2"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Share group">
                        <button
                          onClick={handleShare}
                          className="btn-secondary p-2"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
                <input
                  id="file-import"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) handleImport(file)
                    e.target.value = ''
                  }}
                  className="hidden"
                />
                {!isMobile() && (
                  <Tooltip text="Import from JSON file">
                    <label className="btn-secondary p-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                    </label>
                  </Tooltip>
                )}
              </div>
              <GroupList
                groups={filteredGroups}
                selectedGroupId={selectedGroupId}
                onSelectGroup={(groupId) => {
                  setSelectedGroupId(groupId)
                  setActiveView('group')
                }}
                onCreateGroup={() => setShowNewGroupModal(true)}
                onDeleteGroup={deleteGroup}
              />
            </PullToRefresh>
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
            <p className="text-primary-600 dark:text-primary-400 mb-4">No group selected</p>
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

      <BottomNavigation
        activeView={activeView}
        onNavigate={handleBottomNav}
      />

      <FloatingActionButton
        onClick={() => {
          if (activeView === 'groups') {
            setShowNewGroupModal(true)
          } else if (selectedGroup) {
            // Could open quick add menu
            setShowNewGroupModal(true)
          }
        }}
      />

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setShowHelp(false)}>
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100">Help & Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
                  <div className="flex justify-between">
                    <span><kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">N</kbd></span>
                    <span>New Group</span>
                  </div>
                  <div className="flex justify-between">
                    <span><kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">S</kbd></span>
                    <span>Save</span>
                  </div>
                  <div className="flex justify-between">
                    <span><kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">F</kbd></span>
                    <span>Search</span>
                  </div>
                  <div className="flex justify-between">
                    <span><kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Esc</kbd></span>
                    <span>Close modals</span>
                  </div>
                  <div className="flex justify-between">
                    <span><kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Z</kbd></span>
                    <span>Undo</span>
                  </div>
                  <div className="flex justify-between">
                    <span><kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-700 rounded">Z</kbd></span>
                    <span>Redo</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">Mobile Features</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-primary-700 dark:text-primary-300">
                  <li>Swipe left on bills/members to delete</li>
                  <li>Swipe right to edit</li>
                  <li>Pull down to refresh</li>
                  <li>Bottom navigation for quick access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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

