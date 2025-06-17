import { useState, useEffect } from 'react'
import { firebaseService, FirebaseContent } from '@/lib/firebase'
import { useToast } from '@/components/ui/toast'

// Convert between local and Firebase content formats
const convertLocalToFirebase = (content: any): Omit<FirebaseContent, 'id'> => ({
  name: content.name,
  type: content.type,
  category: content.category,
  status: content.status,
  creatorId: content.creatorId?.toString(),
  scheduledDate: content.scheduledDate,
  postedDate: content.postedDate,
  priority: content.priority,
  notes: content.notes,
  tags: content.tags || [],
  description: content.description,
  uploadDate: content.uploadDate,
  size: content.size,
  createdAt: content.createdAt || new Date().toISOString(),
  updatedAt: content.updatedAt || new Date().toISOString()
})

const convertFirebaseToLocal = (fbContent: FirebaseContent): any => ({
  id: fbContent.id,
  name: fbContent.name,
  type: fbContent.type,
  category: fbContent.category,
  status: fbContent.status,
  creatorId: fbContent.creatorId ? parseInt(fbContent.creatorId, 10) : undefined,
  scheduledDate: fbContent.scheduledDate,
  postedDate: fbContent.postedDate,
  priority: fbContent.priority,
  notes: fbContent.notes,
  tags: fbContent.tags || [],
  description: fbContent.description,
  uploadDate: fbContent.uploadDate,
  size: fbContent.size
})

export function useFirebaseContent() {
  const [content, setContent] = useState<any[]>([])
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

  // Load content on mount
  useEffect(() => {
    loadContent()
    
    // Set up real-time subscription if Firebase is initialized
    if (isInitialized()) {
      const unsubscribe = firebaseService.subscribeToContent((updatedContent) => {
        const convertedContent = updatedContent.map(convertFirebaseToLocal)
        setContent(convertedContent)
        setIsOnline(true)
        console.log('🔄 Real-time update: Content synced from Firebase')
      })
      
      return () => {
        unsubscribe()
      }
    }
  }, [])

  const loadContent = async () => {
    setIsLoading(true)
    
    try {
      // Check if Firebase is initialized
      if (isInitialized()) {
        // Try to load from Firebase
        const firebaseContent = await firebaseService.getContent()
        
        if (firebaseContent.length > 0) {
          // Convert Firebase format to local format
          const convertedContent = firebaseContent.map(convertFirebaseToLocal)
          setContent(convertedContent)
          setIsOnline(true)
          console.log('✅ Loaded content from Firebase:', convertedContent.length)
          
          // Backup to localStorage
          localStorage.setItem('stacked-content', JSON.stringify(convertedContent))
        } else {
          // No content in Firebase, try localStorage
          loadFromLocalStorage()
        }
      } else {
        // Firebase not initialized, use localStorage
        loadFromLocalStorage()
      }
    } catch (err) {
      console.error('❌ Failed to load content from Firebase:', err)
      loadFromLocalStorage()
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
      setIsOnline(false)
    } catch (err) {
      console.error('Failed to load from localStorage:', err)
      setContent([])
      setIsOnline(false)
    }
  }

  const addContent = async (contentItem: any) => {
    try {
      if (isInitialized()) {
        // Add to Firebase
        const fbContent = convertLocalToFirebase(contentItem)
        const contentId = await firebaseService.addContent(fbContent)
        
        // Return the new content with Firebase ID
        const newContent = { ...contentItem, id: contentId }
        setIsOnline(true)
        success('Content added and synced to Firebase')
        
        return newContent
      } else {
        // Fallback to local storage
        const localContent = { ...contentItem, id: Date.now().toString() }
        setContent(prev => [...prev, localContent])
        
        // Save to localStorage
        const updatedContent = [...content, localContent]
        localStorage.setItem('stacked-content', JSON.stringify(updatedContent))
        
        return localContent
      }
    } catch (err) {
      console.error('❌ Failed to add content:', err)
      error('Failed to add content. Using local storage instead.')
      
      // Fallback to local storage
      const localContent = { ...contentItem, id: Date.now().toString() }
      setContent(prev => [...prev, localContent])
      
      // Save to localStorage
      const updatedContent = [...content, localContent]
      localStorage.setItem('stacked-content', JSON.stringify(updatedContent))
      
      return localContent
    }
  }

  const updateContent = async (id: string, updates: any) => {
    try {
      if (isInitialized()) {
        // Update in Firebase
        const contentItem = content.find(c => c.id === id)
        if (!contentItem) throw new Error('Content not found')
        
        const updatedContent = { ...contentItem, ...updates }
        const fbUpdates = convertLocalToFirebase(updatedContent)
        await firebaseService.updateContent(id, fbUpdates)
        
        setIsOnline(true)
        success('Content updated and synced to Firebase')
        
        // Firebase subscription will update the state
        return updatedContent
      } else {
        // Fallback to local storage
        const updatedItems = content.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
        setContent(updatedItems)
        
        // Save to localStorage
        localStorage.setItem('stacked-content', JSON.stringify(updatedItems))
        
        return updatedItems.find(c => c.id === id)
      }
    } catch (err) {
      console.error('❌ Failed to update content:', err)
      error('Failed to update content in Firebase. Using local storage instead.')
      
      // Fallback to local storage
      const updatedItems = content.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
      setContent(updatedItems)
      
      // Save to localStorage
      localStorage.setItem('stacked-content', JSON.stringify(updatedItems))
      
      return updatedItems.find(c => c.id === id)
    }
  }

  const deleteContent = async (id: string) => {
    try {
      if (isInitialized()) {
        // Delete from Firebase
        await firebaseService.deleteContent(id)
        
        setIsOnline(true)
        success('Content deleted and synced to Firebase')
        
        // Firebase subscription will update the state
      } else {
        // Fallback to local storage
        const updatedItems = content.filter(c => c.id !== id)
        setContent(updatedItems)
        
        // Save to localStorage
        localStorage.setItem('stacked-content', JSON.stringify(updatedItems))
      }
    } catch (err) {
      console.error('❌ Failed to delete content:', err)
      error('Failed to delete content in Firebase. Using local storage instead.')
      
      // Fallback to local storage
      const updatedItems = content.filter(c => c.id !== id)
      setContent(updatedItems)
      
      // Save to localStorage
      localStorage.setItem('stacked-content', JSON.stringify(updatedItems))
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