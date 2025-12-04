const JSONBIN_API_BASE = 'https://api.jsonbin.io/v3/b'

const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY || '$2a$10$g7iT2hmHMBIoiIPfngh7bumI343YP0ZxWah62esACMww2j4/4l7.u'
const ACCESS_KEY = import.meta.env.VITE_JSONBIN_ACCESS_KEY || '$2a$10$htXfOoDZFL37PUTmkMjoJOiw9qjqr5g5omyjWfNaBANY1aYmLSMIO'

const STORAGE_ID_KEY = 'tripsplit_storage_id'
const DEFAULT_STORAGE_ID = 'tripsplit-shared-public'

export const getStorageId = () => {
  try {
    const storedId = localStorage.getItem(STORAGE_ID_KEY)
    return storedId || DEFAULT_STORAGE_ID
  } catch {
    return DEFAULT_STORAGE_ID
  }
}

export const setStorageId = (id) => {
  try {
    if (id && id.trim()) {
      localStorage.setItem(STORAGE_ID_KEY, id.trim())
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

export const createNewBin = async (initialData = { groups: [] }) => {
  if (!MASTER_KEY && !ACCESS_KEY) {
    throw new Error('No API keys configured')
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Bin-Private': 'false'
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

export const loadGroups = async () => {
  try {
    const binId = getStorageId()
    
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
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      }
      
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
          return []
        }
        
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
      const groups = data.record?.groups || []
      
      if (groups.length > 0) {
        saveToLocalStorage(groups)
      }
      
      return groups
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout loading from JSONBin.io')
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error loading from JSONBin.io:', error.message)
    } else {
      console.error('Error loading from JSONBin.io:', error.message)
    }
    const localGroups = loadFromLocalStorage()
    if (localGroups.length > 0) {
      console.warn('Using LocalStorage backup - data may not be synced with others')
    }
    return localGroups
  }
}

let lastSavedGroupsHash = null

export const saveGroups = async (groups) => {
  saveToLocalStorage(groups)

  if (!MASTER_KEY && !ACCESS_KEY) {
    console.warn(
      '⚠️ No JSONBin.io API key configured.\n' +
      '💾 Data saved to LocalStorage only (won\'t sync across devices).\n' +
      '📝 See console for setup instructions.'
    )
    return
  }

  const currentHash = JSON.stringify(groups)
  if (currentHash === lastSavedGroupsHash) {
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
    
    if (MASTER_KEY) {
      headers['X-Master-Key'] = MASTER_KEY
    } else if (ACCESS_KEY) {
      headers['X-Access-Key'] = ACCESS_KEY
    }

    let response = await fetch(`${JSONBIN_API_BASE}/${binId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })

    if (response.status === 404 || response.status === 400) {
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({ message: '' }))
        if (!errorData.message || !errorData.message.includes('Invalid Bin Id')) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`)
        }
      }
      const createHeaders = {
        ...headers,
        'X-Bin-Private': 'false'
      }
      
      response = await fetch(JSONBIN_API_BASE, {
        method: 'POST',
        headers: createHeaders,
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const createData = await response.json()
        const newBinId = createData.metadata?.id
        if (newBinId) {
          setStorageId(newBinId)
          console.log('Created new bin. Bin ID:', newBinId)
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Failed to create bin: ${errorData.message || 'Unknown error'}`)
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error saving to JSONBin.io:', error.message)
    throw error
  }
}

export const subscribeToGroups = (callback) => {
  let isActive = true
  let lastDataHash = null

  const poll = async () => {
    if (!isActive) return

    try {
      const groups = await loadGroups()
      const dataHash = JSON.stringify(groups)
      
      if (dataHash !== lastDataHash) {
        callback(groups)
        lastDataHash = dataHash
      }
    } catch (error) {
      console.error('Error polling storage:', error)
    }

    if (isActive) {
      setTimeout(poll, 5000)
    }
  }

  loadGroups().then(groups => {
    callback(groups)
    lastDataHash = JSON.stringify(groups)
    setTimeout(poll, 5000)
  })

  return () => {
    isActive = false
  }
}

export const loadData = async () => {
  const groups = await loadGroups()
  return { groups }
}

export const saveData = async (data) => {
  await saveGroups(data.groups || [])
}

