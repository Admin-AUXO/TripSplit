// Simple shared storage using jsonstorage.net
// This uses a free public JSON hosting service with API key authentication

const JSON_STORAGE_URL = 'https://jsonstorage.net/api/items/'

// API Keys for jsonstorage.net
// These are safe to expose in client-side code for public bins
const MASTER_KEY = import.meta.env.VITE_JSONSTORAGE_MASTER_KEY || '$2a$10$g7iT2hmHMBIoiIPfngh7bumI343YP0ZxWah62esACMww2j4/4l7.u'
const ACCESS_KEY = import.meta.env.VITE_JSONSTORAGE_ACCESS_KEY || '$2a$10$htXfOoDZFL37PUTmkMjoJOiw9qjqr5g5omyjWfNaBANY1aYmLSMIO'

// Use a fixed storage ID so ALL users share the same data
// This ensures groups created by anyone are visible to everyone
const getStorageId = () => {
  // Fixed ID - same for all users so everyone sees the same groups
  // This is the shared storage that everyone accesses
  return 'tripsplit-shared-public'
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
    const storageId = getStorageId()
    const response = await fetch(`${JSON_STORAGE_URL}${storageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
        'X-Access-Key': ACCESS_KEY
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Storage doesn't exist yet - return empty array
        return []
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const groups = data.groups || []
    
    // Also update LocalStorage as backup (but don't use it as primary source)
    if (groups.length > 0) {
      saveToLocalStorage(groups)
    }
    
    return groups
  } catch (error) {
    console.error('Error loading from JSON storage:', error.message)
    // Only use LocalStorage as last resort if we can't connect at all
    // But warn the user that data might be stale
    const localGroups = loadFromLocalStorage()
    if (localGroups.length > 0) {
      console.warn('Using LocalStorage backup - data may not be synced with others')
    }
    return localGroups
  }
}

// Save all groups
export const saveGroups = async (groups) => {
  // Always save to LocalStorage as backup
  saveToLocalStorage(groups)

  try {
    const storageId = getStorageId()
    const body = {
      groups,
      lastUpdated: new Date().toISOString()
    }

    // Try PUT first (update existing)
    let response = await fetch(`${JSON_STORAGE_URL}${storageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
        'X-Access-Key': ACCESS_KEY
      },
      body: JSON.stringify(body)
    })

    // If item doesn't exist (404), create it
    if (response.status === 404) {
      response = await fetch(JSON_STORAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY,
          'X-Access-Key': ACCESS_KEY
        },
        body: JSON.stringify({
          id: storageId,
          ...body
        })
      })
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    // Verify the save was successful by reading it back
    const verifyResponse = await fetch(`${JSON_STORAGE_URL}${storageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
        'X-Access-Key': ACCESS_KEY
      }
    })

    if (verifyResponse.ok) {
      const savedData = await verifyResponse.json()
      if (JSON.stringify(savedData.groups || []) !== JSON.stringify(groups)) {
        console.warn('Data verification failed - saved data may differ')
      }
    }
  } catch (error) {
    console.error('Error saving to JSON storage:', error.message)
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

    // Poll every 1 second for faster updates
    if (isActive) {
      setTimeout(poll, 1000)
    }
  }

  // Initial load
  loadGroups().then(groups => {
    callback(groups)
    lastDataHash = JSON.stringify(groups)
    // Start polling immediately
    setTimeout(poll, 1000)
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

