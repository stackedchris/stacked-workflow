import { useState, useEffect } from 'react'
import { 
  CreatorService, 
  ContentService, 
  convertCreatorToDatabase, 
  convertDatabaseToCreator,
  convertContentToDatabase,
  convertDatabaseToContent,
  initializeDatabase
} from '@/lib/supabase'
import { useToast } from '@/components/ui/toast'

// Hook for cloud-synced creators
export function useCloudCreators() {
  const [creators, setCreators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const { success, error } = useToast()

  // Load creators from cloud on mount
  useEffect(() => {
    initializeAndLoadCreators()
  }, [])

  const initializeAndLoadCreators = async () => {
    try {
      setIsLoading(true)
      
      // Initialize database first
      const dbReady = await initializeDatabase()
      if (!dbReady) {
        console.log('⚠️ Database not ready, using local storage fallback')
        loadFromLocalStorage()
        setIsOnline(false)
        return
      }

      // Load from cloud
      await loadCreators()
      
      // Set up real-time subscription
      const subscription = CreatorService.subscribeToCreators((updatedCreators) => {
        const convertedCreators = updatedCreators.map(convertDatabaseToCreator)
        setCreators(convertedCreators)
        console.log('🔄 Real-time update: Creators synced from cloud')
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (err) {
      console.error('❌ Failed to initialize cloud storage:', err)
      loadFromLocalStorage()
      setIsOnline(false)
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
            stackedProfileUrl: "https://stacked.com/kurama",
            createdAt: "2025-06-10",
            lastUpdated: "2025-06-16"
          }
        ]
        setCreators(defaultCreators)
        localStorage.setItem('stacked-creators', JSON.stringify(defaultCreators))
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err)
      setCreators([])
    }
  }

  const loadCreators = async () => {
    try {
      const dbCreators = await CreatorService.getAllCreators()
      const convertedCreators = dbCreators.map(convertDatabaseToCreator)
      setCreators(convertedCreators)
      setIsOnline(true)
      console.log('✅ Loaded creators from cloud:', convertedCreators.length)
      
      // Backup to localStorage
      localStorage.setItem('stacked-creators', JSON.stringify(convertedCreators))
    } catch (err) {
      console.error('❌ Failed to load creators from cloud:', err)
      setIsOnline(false)
      error('Failed to load creators from cloud. Using local data.')
      loadFromLocalStorage()
    }
  }

  const addCreator = async (creator: any) => {
    try {
      const dbCreator = convertCreatorToDatabase(creator)
      const newCreator = await CreatorService.createCreator(dbCreator)
      
      if (newCreator) {
        const convertedCreator = convertDatabaseToCreator(newCreator)
        setCreators(prev => [...prev, convertedCreator])
        setIsOnline(true)
        success('Creator added and synced to cloud')
        console.log('✅ Creator added to cloud:', convertedCreator.name)
        
        // Backup to localStorage
        const updatedCreators = [...creators, convertedCreator]
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
        
        return convertedCreator
      } else {
        throw new Error('Failed to create creator')
      }
    } catch (err) {
      console.error('❌ Failed to add creator to cloud:', err)
      setIsOnline(false)
      error('Failed to sync creator to cloud. Saved locally.')
      
      // Fallback to local storage
      const localCreator = { ...creator, id: Date.now() }
      setCreators(prev => [...prev, localCreator])
      
      // Save to localStorage as backup
      try {
        localStorage.setItem('stacked-creators', JSON.stringify([...creators, localCreator]))
      } catch (localErr) {
        console.error('Failed to save to local storage:', localErr)
      }
      
      return localCreator
    }
  }

  const updateCreator = async (id: number, updates: any) => {
    try {
      const currentCreator = creators.find(c => c.id === id)
      if (!currentCreator) {
        throw new Error('Creator not found')
      }

      const mergedCreator = { ...currentCreator, ...updates }
      const dbUpdates = convertCreatorToDatabase(mergedCreator)
      const updatedCreator = await CreatorService.updateCreator(id, dbUpdates)
      
      if (updatedCreator) {
        const convertedCreator = convertDatabaseToCreator(updatedCreator)
        setCreators(prev => prev.map(c => c.id === id ? convertedCreator : c))
        setIsOnline(true)
        success('Creator updated and synced to cloud')
        console.log('✅ Creator updated in cloud:', convertedCreator.name)
        
        // Backup to localStorage
        const updatedCreators = creators.map(c => c.id === id ? convertedCreator : c)
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
        
        return convertedCreator
      } else {
        throw new Error('Failed to update creator')
      }
    } catch (err) {
      console.error('❌ Failed to update creator in cloud:', err)
      setIsOnline(false)
      error('Failed to sync update to cloud. Saved locally.')
      
      // Fallback to local update
      setCreators(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
      
      // Save to localStorage as backup
      try {
        const updatedCreators = creators.map(c => c.id === id ? { ...c, ...updates } : c)
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
      } catch (localErr) {
        console.error('Failed to save to local storage:', localErr)
      }
    }
  }

  const deleteCreator = async (id: number) => {
    try {
      const success = await CreatorService.deleteCreator(id)
      
      if (success) {
        setCreators(prev => prev.filter(c => c.id !== id))
        setIsOnline(true)
        console.log('✅ Creator deleted from cloud:', id)
        
        // Backup to localStorage
        const updatedCreators = creators.filter(c => c.id !== id)
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
      } else {
        throw new Error('Failed to delete creator')
      }
    } catch (err) {
      console.error('❌ Failed to delete creator from cloud:', err)
      setIsOnline(false)
      error('Failed to sync deletion to cloud. Removed locally.')
      
      // Fallback to local deletion
      setCreators(prev => prev.filter(c => c.id !== id))
      
      // Save to localStorage as backup
      try {
        const updatedCreators = creators.filter(c => c.id !== id)
        localStorage.setItem('stacked-creators', JSON.stringify(updatedCreators))
      } catch (localErr) {
        console.error('Failed to save to local storage:', localErr)
      }
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

// Hook for cloud-synced content
export function useCloudContent() {
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const { success, error } = useToast()

  // Load content from cloud on mount
  useEffect(() => {
    initializeAndLoadContent()
  }, [])

  const initializeAndLoadContent = async () => {
    try {
      setIsLoading(true)
      
      // Initialize database first
      const dbReady = await initializeDatabase()
      if (!dbReady) {
        console.log('⚠️ Database not ready, using local storage fallback')
        loadFromLocalStorage()
        setIsOnline(false)
        return
      }

      // Load from cloud
      await loadContent()
      
      // Set up real-time subscription
      const subscription = ContentService.subscribeToContent((updatedContent) => {
        const convertedContent = updatedContent.map(convertDatabaseToContent)
        setContent(convertedContent)
        console.log('🔄 Real-time update: Content synced from cloud')
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (err) {
      console.error('❌ Failed to initialize content cloud storage:', err)
      loadFromLocalStorage()
      setIsOnline(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const localData = localStorage.getItem('stacked-content')
      if (localData) {
        const parsedData = JSON.parse(localData)
        setContent(parsedData)
        console.log('📱 Loaded content from localStorage:', parsedData.length)
      } else {
        setContent([])
      }
    } catch (err) {
      console.error('Failed to load content from localStorage:', err)
      setContent([])
    }
  }

  const loadContent = async () => {
    try {
      const dbContent = await ContentService.getAllContent()
      const convertedContent = dbContent.map(convertDatabaseToContent)
      setContent(convertedContent)
      setIsOnline(true)
      console.log('✅ Loaded content from cloud:', convertedContent.length)
      
      // Backup to localStorage
      localStorage.setItem('stacked-content', JSON.stringify(convertedContent))
    } catch (err) {
      console.error('❌ Failed to load content from cloud:', err)
      setIsOnline(false)
      error('Failed to load content from cloud. Using local data.')
      loadFromLocalStorage()
    }
  }

  const addContent = async (contentItem: any) => {
    try {
      const dbContent = convertContentToDatabase(contentItem)
      const newContent = await ContentService.createContent(dbContent)
      
      if (newContent) {
        const convertedContent = convertDatabaseToContent(newContent)
        setContent(prev => [...prev, convertedContent])
        setIsOnline(true)
        success('Content added and synced to cloud')
        console.log('✅ Content added to cloud:', convertedContent.name)
        
        // Backup to localStorage
        const updatedContent = [...content, convertedContent]
        localStorage.setItem('stacked-content', JSON.stringify(updatedContent))
        
        return convertedContent
      } else {
        throw new Error('Failed to create content')
      }
    } catch (err) {
      console.error('❌ Failed to add content to cloud:', err)
      setIsOnline(false)
      error('Failed to sync content to cloud. Saved locally.')
      
      // Fallback to local storage
      setContent(prev => [...prev, contentItem])
      
      // Save to localStorage as backup
      try {
        localStorage.setItem('stacked-content', JSON.stringify([...content, contentItem]))
      } catch (localErr) {
        console.error('Failed to save to local storage:', localErr)
      }
      
      return contentItem
    }
  }

  const updateContent = async (id: string, updates: any) => {
    try {
      const currentContent = content.find(c => c.id === id)
      if (!currentContent) {
        throw new Error('Content not found')
      }

      const mergedContent = { ...currentContent, ...updates }
      const dbUpdates = convertContentToDatabase(mergedContent)
      const updatedContent = await ContentService.updateContent(id, dbUpdates)
      
      if (updatedContent) {
        const convertedContent = convertDatabaseToContent(updatedContent)
        setContent(prev => prev.map(c => c.id === id ? convertedContent : c))
        setIsOnline(true)
        success('Content updated and synced to cloud')
        console.log('✅ Content updated in cloud:', convertedContent.name)
        
        // Backup to localStorage
        const updatedContentList = content.map(c => c.id === id ? convertedContent : c)
        localStorage.setItem('stacked-content', JSON.stringify(updatedContentList))
        
        return convertedContent
      } else {
        throw new Error('Failed to update content')
      }
    } catch (err) {
      console.error('❌ Failed to update content in cloud:', err)
      setIsOnline(false)
      error('Failed to sync update to cloud. Saved locally.')
      
      // Fallback to local update
      setContent(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
      
      // Save to localStorage as backup
      try {
        const updatedContent = content.map(c => c.id === id ? { ...c, ...updates } : c)
        localStorage.setItem('stacked-content', JSON.stringify(updatedContent))
      } catch (localErr) {
        console.error('Failed to save to local storage:', localErr)
      }
    }
  }

  const deleteContent = async (id: string) => {
    try {
      const success = await ContentService.deleteContent(id)
      
      if (success) {
        setContent(prev => prev.filter(c => c.id !== id))
        setIsOnline(true)
        console.log('✅ Content deleted from cloud:', id)
        
        // Backup to localStorage
        const updatedContent = content.filter(c => c.id !== id)
        localStorage.setItem('stacked-content', JSON.stringify(updatedContent))
      } else {
        throw new Error('Failed to delete content')
      }
    } catch (err) {
      console.error('❌ Failed to delete content from cloud:', err)
      setIsOnline(false)
      error('Failed to sync deletion to cloud. Removed locally.')
      
      // Fallback to local deletion
      setContent(prev => prev.filter(c => c.id !== id))
      
      // Save to localStorage as backup
      try {
        const updatedContent = content.filter(c => c.id !== id)
        localStorage.setItem('stacked-content', JSON.stringify(updatedContent))
      } catch (localErr) {
        console.error('Failed to save to local storage:', localErr)
      }
    }
  }

  return {
    content,
    isLoading,
    isOnline,
    addContent,
    updateContent,
    deleteContent,
    refreshContent: loadContent
  }
}