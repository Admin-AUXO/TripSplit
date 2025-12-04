// Simple shared storage using jsonbin.io
// This uses jsonbin.io API for storing and retrieving JSON data
// Reference: https://jsonbin.io/api-reference
//
// Optimizations to minimize API requests:
// - Polling interval: 5 seconds (instead of 1 second) - 80% reduction
// - Debounced auto-save: 2 second delay after last change
// - Skip duplicate saves: Only save if data actually changed
// - Removed verification reads: Skip read-after-write to save API calls

const JSONBIN_API_BASE = 'https://api.jsonbin.io/v3/b'

// API Keys for jsonbin.io
// Get your API keys from https://jsonbin.io/api-keys
// For public bins, these can be exposed in client-side code
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY || '$2a$10$g7iT2hmHMBIoiIPfngh7bumI343YP0ZxWah62esACMww2j4/4l7.u'
const ACCESS_KEY = import.meta.env.VITE_JSONBIN_ACCESS_KEY || '$2a$10$htXfOoDZFL37PUTmkMjoJOiw9qjqr5g5omyjWfNaBANY1aYmLSMIO'

// Storage ID key in localStorage
const STORAGE_ID_KEY = 'tripsplit_storage_id'
const DEFAULT_STORAGE_ID = 'tripsplit-shared-public'

// Get storage ID from localStorage or return default
export const getStorageId = () => {
  try {
    const storedId = localStorage.getItem(STORAGE_ID_KEY)
    return storedId || DEFAULT_STORAGE_ID
  } catch {
    return DEFAULT_STORAGE_ID
  }
}

// Set storage ID in localStorage
export const setStorageId = (id) => {
  try {
    if (id && id.trim()) {
      localStorage.setItem(STORAGE_ID_KEY, id.trim())
      // Reset saved hash when bin ID changes to ensure new bin gets saved
      if (typeof lastSavedGroupsHash !== 'undefined') {
        lastSavedGroupsHash = null
      }
    } else {
      localStorage.removeItem(STORAGE_ID_KEY)
      if (typeof lastSavedGroupsHash !== 'undefined') {
        lastSavedGroupsHash = null
      }
    }
  } catch (error) {
    console.error('Error saving storage ID:', error)
  }
}

// Create a new bin on jsonbin.io
export const createNewBin = async (initialData = { groups: [] }) => {
  if (!MASTER_KEY && !ACCESS_KEY) {
    throw new Error('No API keys configured')
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Bin-Private': 'false' // Make it public
  }

  if (MASTER_KEY) {
    headers['X-Master-Key'] = MASTER_KEY
  } else if (ACCESS_KEY) {
    headers['X-Access-Key'] = ACCESS_KEY
  }

  const body = {
    ...initialData,
    lastUpdated: new Date().toISOString()
  }

  const response = await fetch(JSONBIN_API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(`Failed to create bin: ${errorData.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const newBinId = data.metadata?.id

  if (newBinId) {
    setStorageId(newBinId)
    return newBinId
  }

  throw new Error('Failed to get bin ID from response')
}

// Fallback to LocalStorage
const STORAGE_KEY = 'tripsplit_data'

const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data).groups || [] : []
  } catch {
    return []
  }
}

const saveToLocalStorage = (groups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ groups }))
  } catch (error) {
    console.error('Error saving to LocalStorage:', error)
  }
}

// Load all groups
export const loadGroups = async () => {
  try {
    const binId = getStorageId()
    
    // If no API key is configured, fall back to localStorage
    if (!MASTER_KEY && !ACCESS_KEY) {
      console.warn(
        '⚠️ No JSONBin.io API key configured.\n' +
        '📝 To enable cloud sync:\n' +
        '   1. Get API keys from https://jsonbin.io/api-keys\n' +
        '   2. Create a .env file in the project root\n' +
        '   3. Add: VITE_JSONBIN_MASTER_KEY=your_key_here\n' +
        '   4. Restart the dev server\n' +
        '💾 Currently using LocalStorage only (data won\'t sync across devices/browsers)'
      )
      return loadFromLocalStorage()
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      // jsonbin.io read endpoint: GET /v3/b/{binId}/latest
      const headers = {
        'Content-Type': 'application/json'
      }
      
      // Use Master Key if available, otherwise use Access Key
      if (MASTER_KEY) {
        headers['X-Master-Key'] = MASTER_KEY
      } else if (ACCESS_KEY) {
        headers['X-Access-Key'] = ACCESS_KEY
      }
      
      const response = await fetch(`${JSONBIN_API_BASE}/${binId}/latest`, {
        method: 'GET',
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          // Bin doesn't exist yet - return empty array (this is normal for first use)
          return []
        }
        
        // Handle 400 "Invalid Bin Id" - treat as bin doesn't exist
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({ message: '' }))
          if (errorData.message && errorData.message.includes('Invalid Bin Id')) {
            console.warn('Bin ID does not exist. Using empty data. Create a new bin or update the Bin ID in Settings.')
            return []
          }
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`)
      }

      const data = await response.json()
      // jsonbin.io returns data in { record: {...} } format
      const groups = data.record?.groups || []
      
      // Also update LocalStorage as backup (but don't use it as primary source)
      if (groups.length > 0) {
        saveToLocalStorage(groups)
      }
      
      return groups
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    // Check if it's a network error or timeout
    if (error.name === 'AbortError') {
      console.error('Request timeout loading from JSONBin.io')
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error loading from JSONBin.io:', error.message)
    } else {
      console.error('Error loading from JSONBin.io:', error.message)
    }
    // Only use LocalStorage as last resort if we can't connect at all
    // But warn the user that data might be stale
    const localGroups = loadFromLocalStorage()
    if (localGroups.length > 0) {
      console.warn('Using LocalStorage backup - data may not be synced with others')
    }
    return localGroups
  }
}

// Track last saved data to avoid unnecessary saves
let lastSavedGroupsHash = null

// Save all groups
export const saveGroups = async (groups) => {
  // Always save to LocalStorage as backup
  saveToLocalStorage(groups)

  // If no API key is configured, only save to localStorage
  if (!MASTER_KEY && !ACCESS_KEY) {
    console.warn(
      '⚠️ No JSONBin.io API key configured.\n' +
      '💾 Data saved to LocalStorage only (won\'t sync across devices).\n' +
      '📝 See console for setup instructions.'
    )
    return
  }

  // Check if data actually changed to avoid unnecessary API calls
  const currentHash = JSON.stringify(groups)
  if (currentHash === lastSavedGroupsHash) {
    // Data hasn't changed, skip API call
    return
  }
  lastSavedGroupsHash = currentHash

  try {
    const binId = getStorageId()
    const body = {
      groups,
      lastUpdated: new Date().toISOString()
    }

    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Use Master Key if available, otherwise use Access Key
    if (MASTER_KEY) {
      headers['X-Master-Key'] = MASTER_KEY
    } else if (ACCESS_KEY) {
      headers['X-Access-Key'] = ACCESS_KEY
    }

    // Try PUT first (update existing bin)
    // jsonbin.io update endpoint: PUT /v3/b/{binId}
    let response = await fetch(`${JSONBIN_API_BASE}/${binId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })

    // If bin doesn't exist (404) or invalid (400), create it
    if (response.status === 404 || response.status === 400) {
      // Check if it's an invalid bin ID error
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({ message: '' }))
        if (!errorData.message || !errorData.message.includes('Invalid Bin Id')) {
          // Not an invalid bin ID error, re-throw
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`)
        }
      }
      // jsonbin.io create endpoint: POST /v3/b
      // For public bins, set X-Bin-Private: false
      const createHeaders = {
        ...headers,
        'X-Bin-Private': 'false' // Make it public so anyone with the bin ID can access
      }
      
      // jsonbin.io generates the ID automatically during creation
      // We'll create a new bin and the user will need to update their bin ID in settings
      response = await fetch(JSONBIN_API_BASE, {
        method: 'POST',
        headers: createHeaders,
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const createData = await response.json()
        const newBinId = createData.metadata?.id
        if (newBinId) {
          // Store the new bin ID so it can be used going forward
          setStorageId(newBinId)
          console.log('✅ Created new bin. Bin ID:', newBinId)
          console.log('💡 This Bin ID has been saved. Share it with others to collaborate!')
        }
      } else {
        // If creation failed, throw error
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Failed to create bin: ${errorData.message || 'Unknown error'}`)
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`)
    }

    // Skip verification read to save API requests - jsonbin.io PUT/POST responses are reliable
    // Only verify on explicit save requests if needed (not on auto-save)
  } catch (error) {
    console.error('Error saving to JSONBin.io:', error.message)
    throw error // Re-throw so caller knows save failed
  }
}

// Subscribe to updates (polling)
export const subscribeToGroups = (callback) => {
  let isActive = true
  let lastDataHash = null

  const poll = async () => {
    if (!isActive) return

    try {
      const groups = await loadGroups()
      const dataHash = JSON.stringify(groups)
      
      // Only update if data has changed
      if (dataHash !== lastDataHash) {
        callback(groups)
        lastDataHash = dataHash
      }
    } catch (error) {
      console.error('Error polling storage:', error)
      // Don't stop polling on error - might be temporary network issue
    }

    // Poll every 5 seconds to minimize API requests while still being responsive
    // This reduces API calls by 80% compared to 1 second polling
    if (isActive) {
      setTimeout(poll, 5000)
    }
  }

  // Initial load
  loadGroups().then(groups => {
    callback(groups)
    lastDataHash = JSON.stringify(groups)
    // Start polling after initial load (5 seconds)
    setTimeout(poll, 5000)
  })

  // Return unsubscribe function
  return () => {
    isActive = false
  }
}

// For backward compatibility
export const loadData = async () => {
  const groups = await loadGroups()
  return { groups }
}

export const saveData = async (data) => {
  await saveGroups(data.groups || [])
}

