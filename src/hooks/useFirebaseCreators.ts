import { useState, useEffect } from 'react'
import { firebaseService, FirebaseCreator, convertLocalToFirebase, convertFirebaseToLocal } from '@/lib/firebase'
import { useToast } from '@/components/ui/toast'

// Default demo data
const defaultCreators = [
  {
    id: 1,
    name: "Kurama",
    email: "kurama@example.com",
    phone: "+1 (555) 123-4567",
    category: "Gaming",
    region: "US",
    phase: "Phase 2: Launch Week",
    phaseNumber: 2,
    cardsSold: 67,
    totalCards: 100,
    cardPrice: 100,
    daysInPhase: 2,
    nextTask: "Post group chat screenshot",
    salesVelocity: "High",
    avatar: "🎮",
    bio: "Top Smash Bros player with 500K+ following",
    socialMedia: {
      instagram: "@kurama_smash",
      twitter: "@KuramaPlays",
      youtube: "@KuramaGaming",
      tiktok: "@kurama.gaming"
    },
    assets: { profileImages: [], videos: [], pressKit: [] },
    strategy: {
      launchDate: "2025-06-20",
      targetAudience: "Competitive gaming fans",
      contentPlan: "Daily gameplay tips"
    },
    createdAt: "2025-06-10",
    lastUpdated: "2025-06-16"
  },
  {
    id: 2,
    name: "Nina Lin",
    email: "nina@example.com",
    phone: "+1 (555) 234-5678",
    category: "Streaming",
    region: "US",
    phase: "Phase 1: Drop Prep",
    phaseNumber: 1,
    cardsSold: 0,
    totalCards: 100,
    cardPrice: 75,
    daysInPhase: 5,
    nextTask: "Record teaser video",
    salesVelocity: "Pending",
    avatar: "📺",
    bio: "Popular streamer and co-founder",
    socialMedia: {
      instagram: "@ninalin",
      twitter: "@NinaStreams",
      tiktok: "@nina.streams"
    },
    assets: { profileImages: [], videos: [], pressKit: [] },
    strategy: {
      launchDate: "2025-06-25",
      targetAudience: "Streaming community",
      contentPlan: "Stream highlights"
    },
    createdAt: "2025-06-12",
    lastUpdated: "2025-06-16"
  },
  {
    id: 3,
    name: "Edward So",
    email: "edward@example.com",
    phone: "+1 (555) 345-6789",
    category: "Music",
    region: "Brazil",
    phase: "Phase 3: Sell-Out Push",
    phaseNumber: 3,
    cardsSold: 85,
    totalCards: 100,
    cardPrice: 90,
    daysInPhase: 1,
    nextTask: "Post 'only 15 left' story",
    salesVelocity: "Medium",
    avatar: "🎵",
    bio: "DJ and creative entrepreneur",
    socialMedia: {
      instagram: "@edwardso",
      twitter: "@EdwardSoMusic",
      tiktok: "@edward.djmusic"
    },
    assets: { profileImages: [], videos: [], pressKit: [] },
    strategy: {
      launchDate: "2025-06-18",
      targetAudience: "Music fans",
      contentPlan: "Live sets and remixes"
    },
    createdAt: "2025-06-08",
    lastUpdated: "2025-06-16"
  }
]

export function useFirebaseCreators() {
  const [creators, setCreators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const { success, error } = useToast()

  // Check if Firebase is initialized
  const isInitialized = () => {
    try {
      // This will throw an error if not initialized
      firebaseService.testConnection()
      return true
    } catch (err) {
      return false
    }
  }

  // Load creators on mount
  useEffect(() => {
    loadCreators()
    
    // Set up real-time subscription if Firebase is initialized
    if (isInitialized()) {
      const unsubscribe = firebaseService.subscribeToCreators((updatedCreators) => {
        const convertedCreators = updatedCreators.map(convertFirebaseToLocal)
        setCreators(convertedCreators)
        setIsOnline(true)
        console.log('🔄 Real-time update: Creators synced from Firebase')
      })
      
      return () => {
        unsubscribe()
      }
    }
  }, [])

  const loadCreators = async () => {
    setIsLoading(true)
    
    try {
      // Check if Firebase is initialized
      if (isInitialized()) {
        // Try to load from Firebase
        const firebaseCreators = await firebaseService.getCreators()
        
        if (firebaseCreators.length > 0) {
          // Convert Firebase format to local format
          const convertedCreators = firebaseCreators.map(convertFirebaseToLocal)
          setCreators(convertedCreators)
          setIsOnline(true)
          console.log('✅ Loaded creators from Firebase:', convertedCreators.length)
          
          // Backup to localStorage
          localStorage.setItem('stacked-creators', JSON.stringify(convertedCreators))
        } else {
          // No creators in Firebase, try localStorage
          loadFromLocalStorage()
        }
      } else {
        // Firebase not initialized, use localStorage
        loadFromLocalStorage()
      }
    } catch (err) {
      console.error('❌ Failed to load creators from Firebase:', err)
      loadFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const localData = localStorage.getItem('stacked-creators')
      if (localData) {
        const parsedData = JSON.parse(localData)
        setCreators(parsedData)
        console.log('📱 Loaded creators from localStorage:', parsedData.length)
      } else {
        // Use default demo data if no local data
        setCreators(defaultCreators)
        localStorage.setItem('stacked-creators', JSON.stringify(defaultCreators))
        console.log('📱 Initialized with default creators')
      }
      setIsOnline(false)
    } catch (err) {
      console.error('Failed to load from localStorage:', err)
      setCreators(defaultCreators)
      setIsOnline(false)
    }
  }

  const addCreator = async (creator: any) => {
    try {
      if (isInitialized()) {
        // Add to Firebase
        const fbCreator = convertLocalToFirebase(creator)
        const creatorId = await firebaseService.addCreator(fbCreator)
        
        // Return the new creator with Firebase ID
        const newCreator = { ...creator, id: parseInt(creatorId, 10) }
        setIsOnline(true)
        success('Creator added and synced to Firebase')
        
        return newCreator
      } else {
        // Fallback to local storage
        const localCreator = { ...creator, id: Date.now() }
        setCreators(prev => [...prev, localCreator])
        
        // Save to localStorage
        const updatedCreators = [...creators, localCreator]
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
        
        return localCreator
      }
    } catch (err) {
      console.error('❌ Failed to add creator:', err)
      error('Failed to add creator. Using local storage instead.')
      
      // Fallback to local storage
      const localCreator = { ...creator, id: Date.now() }
      setCreators(prev => [...prev, localCreator])
      
      // Save to localStorage
      const updatedCreators = [...creators, localCreator]
      localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
      
      return localCreator
    }
  }

  const updateCreator = async (id: number, updates: any) => {
    try {
      if (isInitialized()) {
        // Find the creator to update
        const creator = creators.find(c => c.id === id)
        if (!creator) throw new Error('Creator not found')
        
        // Get the Firebase ID (string) for this creator
        const firebaseId = creator.firebaseId || id.toString()
        
        // Update in Firebase
        const updatedCreator = { ...creator, ...updates }
        const fbUpdates = convertLocalToFirebase(updatedCreator)
        await firebaseService.updateCreator(firebaseId, fbUpdates)
        
        setIsOnline(true)
        success('Creator updated and synced to Firebase')
        
        // Firebase subscription will update the state
        return updatedCreator
      } else {
        // Fallback to local storage
        const updatedCreators = creators.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
        setCreators(updatedCreators)
        
        // Save to localStorage
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
        
        return updatedCreators.find(c => c.id === id)
      }
    } catch (err) {
      console.error('❌ Failed to update creator:', err)
      error('Failed to update creator in Firebase. Using local storage instead.')
      
      // Fallback to local storage
      const updatedCreators = creators.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
      setCreators(updatedCreators)
      
      // Save to localStorage
      localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
      
      return updatedCreators.find(c => c.id === id)
    }
  }

  const deleteCreator = async (id: number) => {
    try {
      if (isInitialized()) {
        // Find the creator to delete
        const creator = creators.find(c => c.id === id)
        if (!creator) throw new Error('Creator not found')
        
        // Get the Firebase ID (string) for this creator
        const firebaseId = creator.firebaseId || id.toString()
        
        // Delete from Firebase
        await firebaseService.deleteCreator(firebaseId)
        
        setIsOnline(true)
        success('Creator deleted and synced to Firebase')
        
        // Firebase subscription will update the state
      } else {
        // Fallback to local storage
        const updatedCreators = creators.filter(c => c.id !== id)
        setCreators(updatedCreators)
        
        // Save to localStorage
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
      }
    } catch (err) {
      console.error('❌ Failed to delete creator:', err)
      error('Failed to delete creator in Firebase. Using local storage instead.')
      
      // Fallback to local storage
      const updatedCreators = creators.filter(c => c.id !== id)
      setCreators(updatedCreators)
      
      // Save to localStorage
      localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
    }
  }

  return {
    creators,
    isLoading,
    isOnline,
    addCreator,
    updateCreator,
    deleteCreator,
    refreshCreators: loadCreators
  }
}