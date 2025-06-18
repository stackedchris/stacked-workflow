import { useState, useEffect } from 'react'
import { isBrowser, safeLocalStorage } from '@/lib/utils'
import { emitSyncEvent, useSyncEvents } from '@/lib/socket'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (isBrowser) {
      try {
        const item = safeLocalStorage.getItem(key)
        if (item) {
          const parsedValue = JSON.parse(item)
          setStoredValue(parsedValue)
        }
      } catch (error) {
        console.log(`Error reading localStorage key "${key}":`, error)
      }
      setIsHydrated(true)
    }
  }, [key])

  // Subscribe to sync events for this key
  useSyncEvents(getEventTypeFromKey(key), (event) => {
    if (event.action === 'update') {
      // Update local state with the synced data
      setStoredValue(event.data)
      
      // Also update localStorage
      safeLocalStorage.setItem(key, JSON.stringify(event.data))
      console.log(`🔄 Synced ${key} from remote update`)
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (isBrowser) {
        safeLocalStorage.setItem(key, JSON.stringify(valueToStore))
        console.log(`Saved to localStorage [${key}]:`, valueToStore)
        
        // Emit sync event to other clients
        emitSyncEvent({
          type: getEventTypeFromKey(key),
          action: 'update',
          data: valueToStore
        })
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, isHydrated] as const
}

// Helper function to determine event type from localStorage key
function getEventTypeFromKey(key: string): 'creators' | 'content' | 'employees' | 'strategies' {
  if (key.includes('creator')) return 'creators'
  if (key.includes('content')) return 'content'
  if (key.includes('employee')) return 'employees'
  if (key.includes('strateg')) return 'strategies'
  
  // Default fallback
  return 'creators'
}