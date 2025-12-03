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
        return []
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.groups || []
  } catch (error) {
    console.warn('Error loading from JSON storage, using LocalStorage:', error.message)
    return loadFromLocalStorage()
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

    const response = await fetch(`${JSON_STORAGE_URL}${storageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
        'X-Access-Key': ACCESS_KEY
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      // If item doesn't exist, try to create it
      if (response.status === 404) {
        const createResponse = await fetch(JSON_STORAGE_URL, {
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
        
        if (!createResponse.ok) {
          throw new Error(`HTTP error creating item! status: ${createResponse.status}`)
        }
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.warn('Error saving to JSON storage:', error.message)
    // Don't throw - LocalStorage backup is already saved
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
    }

    // Poll every 2 seconds
    if (isActive) {
      setTimeout(poll, 2000)
    }
  }

  // Initial load
  loadGroups().then(groups => {
    callback(groups)
    lastDataHash = JSON.stringify(groups)
    // Start polling
    setTimeout(poll, 2000)
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

