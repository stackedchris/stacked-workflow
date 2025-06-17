// Firebase integration for Stacked Workflow Platform
// Simple, reliable, no migration conflicts!

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth'

// Firebase configuration interface
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Creator interface for Firebase
export interface FirebaseCreator {
  id?: string
  name: string
  email: string
  phone: string
  category: string
  region: string
  phase: string
  phaseNumber: number
  cardsSold: number
  totalCards: number
  cardPrice: number
  daysInPhase: number
  nextTask: string
  salesVelocity: string
  avatar: string
  bio: string
  socialMedia: {
    instagram?: string
    twitter?: string
    youtube?: string
    tiktok?: string
  }
  assets: {
    profileImages: string[]
    videos: string[]
    pressKit: string[]
  }
  strategy: {
    launchDate?: string
    targetAudience?: string
    contentPlan?: string
  }
  createdAt: string
  lastUpdated: string
}

// Content interface for Firebase
export interface FirebaseContent {
  id?: string
  name: string
  type: 'image' | 'video' | 'document'
  category: string
  status: 'draft' | 'scheduled' | 'posted'
  creatorId?: string
  scheduledDate?: string
  postedDate?: string
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  tags: string[]
  description: string
  uploadDate: string
  size: number
  createdAt: string
  updatedAt: string
}

class FirebaseService {
  private app: FirebaseApp | null = null
  private db: Firestore | null = null
  private auth: Auth | null = null
  private isInitialized = false

  // Initialize Firebase with config
  initialize(config: FirebaseConfig): boolean {
    try {
      console.log('🔥 Initializing Firebase...')
      
      // Check if already initialized
      if (getApps().length === 0) {
        this.app = initializeApp(config)
      } else {
        this.app = getApps()[0]
      }
      
      this.db = getFirestore(this.app)
      this.auth = getAuth(this.app)
      this.isInitialized = true
      
      console.log('✅ Firebase initialized successfully!')
      return true
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error)
      return false
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    if (!this.isInitialized || !this.db) {
      console.error('❌ Firebase not initialized')
      return false
    }

    try {
      // Try to read from a collection (this will work even if empty)
      const creatorsRef = collection(this.db, 'creators')
      await getDocs(query(creatorsRef, orderBy('createdAt', 'desc')))
      console.log('✅ Firebase connection test successful')
      return true
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error)
      return false
    }
  }

  // Creator operations
  async getCreators(): Promise<FirebaseCreator[]> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const creatorsRef = collection(this.db, 'creators')
      const snapshot = await getDocs(query(creatorsRef, orderBy('createdAt', 'desc')))
      
      const creators: FirebaseCreator[] = []
      snapshot.forEach((doc) => {
        creators.push({ id: doc.id, ...doc.data() } as FirebaseCreator)
      })
      
      console.log(`✅ Fetched ${creators.length} creators from Firebase`)
      return creators
    } catch (error) {
      console.error('❌ Failed to get creators:', error)
      throw error
    }
  }

  async addCreator(creator: Omit<FirebaseCreator, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const creatorsRef = collection(this.db, 'creators')
      const docRef = await addDoc(creatorsRef, {
        ...creator,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
      
      console.log('✅ Creator added to Firebase:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Failed to add creator:', error)
      throw error
    }
  }

  async updateCreator(id: string, updates: Partial<FirebaseCreator>): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const creatorRef = doc(this.db, 'creators', id)
      await updateDoc(creatorRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      })
      
      console.log('✅ Creator updated in Firebase:', id)
    } catch (error) {
      console.error('❌ Failed to update creator:', error)
      throw error
    }
  }

  async deleteCreator(id: string): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const creatorRef = doc(this.db, 'creators', id)
      await deleteDoc(creatorRef)
      
      console.log('✅ Creator deleted from Firebase:', id)
    } catch (error) {
      console.error('❌ Failed to delete creator:', error)
      throw error
    }
  }

  // Content operations
  async getContent(): Promise<FirebaseContent[]> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const contentRef = collection(this.db, 'content')
      const snapshot = await getDocs(query(contentRef, orderBy('createdAt', 'desc')))
      
      const content: FirebaseContent[] = []
      snapshot.forEach((doc) => {
        content.push({ id: doc.id, ...doc.data() } as FirebaseContent)
      })
      
      console.log(`✅ Fetched ${content.length} content items from Firebase`)
      return content
    } catch (error) {
      console.error('❌ Failed to get content:', error)
      throw error
    }
  }

  async addContent(content: Omit<FirebaseContent, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const contentRef = collection(this.db, 'content')
      const docRef = await addDoc(contentRef, {
        ...content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      console.log('✅ Content added to Firebase:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Failed to add content:', error)
      throw error
    }
  }

  async updateContent(id: string, updates: Partial<FirebaseContent>): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const contentRef = doc(this.db, 'content', id)
      await updateDoc(contentRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      console.log('✅ Content updated in Firebase:', id)
    } catch (error) {
      console.error('❌ Failed to update content:', error)
      throw error
    }
  }

  async deleteContent(id: string): Promise<void> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      const contentRef = doc(this.db, 'content', id)
      await deleteDoc(contentRef)
      
      console.log('✅ Content deleted from Firebase:', id)
    } catch (error) {
      console.error('❌ Failed to delete content:', error)
      throw error
    }
  }

  // Real-time subscriptions
  subscribeToCreators(callback: (creators: FirebaseCreator[]) => void) {
    if (!this.db) throw new Error('Firebase not initialized')

    const creatorsRef = collection(this.db, 'creators')
    return onSnapshot(
      query(creatorsRef, orderBy('createdAt', 'desc')),
      (snapshot) => {
        const creators: FirebaseCreator[] = []
        snapshot.forEach((doc) => {
          creators.push({ id: doc.id, ...doc.data() } as FirebaseCreator)
        })
        callback(creators)
      },
      (error) => {
        console.error('❌ Creators subscription error:', error)
      }
    )
  }

  subscribeToContent(callback: (content: FirebaseContent[]) => void) {
    if (!this.db) throw new Error('Firebase not initialized')

    const contentRef = collection(this.db, 'content')
    return onSnapshot(
      query(contentRef, orderBy('createdAt', 'desc')),
      (snapshot) => {
        const content: FirebaseContent[] = []
        snapshot.forEach((doc) => {
          content.push({ id: doc.id, ...doc.data() } as FirebaseContent)
        })
        callback(content)
      },
      (error) => {
        console.error('❌ Content subscription error:', error)
      }
    )
  }

  // Authentication
  async signIn(email: string, password: string): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized')

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      console.log('✅ User signed in:', userCredential.user.uid)
      return userCredential.user
    } catch (error) {
      console.error('❌ Sign in failed:', error)
      throw error
    }
  }

  async signUp(email: string, password: string): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized')

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      console.log('✅ User created:', userCredential.user.uid)
      return userCredential.user
    } catch (error) {
      console.error('❌ Sign up failed:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    if (!this.auth) throw new Error('Firebase not initialized')

    try {
      await signOut(this.auth)
      console.log('✅ User signed out')
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      throw error
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    if (!this.auth) throw new Error('Firebase not initialized')

    return onAuthStateChanged(this.auth, callback)
  }

  // Utility functions
  getCurrentUser(): User | null {
    if (!this.auth) throw new Error('Firebase not initialized')
    return this.auth.currentUser
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser()
  }

  // Migration utilities
  async migrateFromLocalStorage(): Promise<boolean> {
    if (!this.db) throw new Error('Firebase not initialized')

    try {
      console.log('🔄 Starting migration from localStorage...')
      
      // Get creators from localStorage
      const creatorsJson = localStorage.getItem('stacked-creators')
      if (creatorsJson) {
        const creators = JSON.parse(creatorsJson)
        console.log(`Found ${creators.length} creators in localStorage`)
        
        // Add each creator to Firebase
        for (const creator of creators) {
          // Convert numeric ID to string and remove it (Firebase will generate a new ID)
          const { id, ...creatorData } = creator
          await this.addCreator(creatorData)
        }
      }
      
      // Get content from localStorage
      const contentJson = localStorage.getItem('stacked-content')
      if (contentJson) {
        const content = JSON.parse(contentJson)
        console.log(`Found ${content.length} content items in localStorage`)
        
        // Add each content item to Firebase
        for (const item of content) {
          // Convert numeric creatorId to string if it exists
          const { id, ...contentData } = item
          if (contentData.creatorId) {
            contentData.creatorId = contentData.creatorId.toString()
          }
          await this.addContent(contentData)
        }
      }
      
      console.log('✅ Migration from localStorage completed successfully!')
      return true
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return false
    }
  }
}

// Singleton instance
export const firebaseService = new FirebaseService()

// Helper function to convert between local and Firebase formats
export const convertLocalToFirebase = (creator: any): Omit<FirebaseCreator, 'id'> => ({
  name: creator.name,
  email: creator.email || '',
  phone: creator.phone || '',
  category: creator.category,
  region: creator.region || 'US',
  phase: creator.phase,
  phaseNumber: creator.phaseNumber,
  cardsSold: creator.cardsSold,
  totalCards: creator.totalCards,
  cardPrice: creator.cardPrice,
  daysInPhase: creator.daysInPhase,
  nextTask: creator.nextTask,
  salesVelocity: creator.salesVelocity,
  avatar: creator.avatar,
  bio: creator.bio || '',
  socialMedia: creator.socialMedia || {},
  assets: creator.assets || { profileImages: [], videos: [], pressKit: [] },
  strategy: creator.strategy || {},
  createdAt: creator.createdAt || new Date().toISOString().split('T')[0],
  lastUpdated: creator.lastUpdated || new Date().toISOString().split('T')[0]
})

export const convertFirebaseToLocal = (fbCreator: FirebaseCreator): any => ({
  id: parseInt(fbCreator.id || '1', 10), // Convert string ID to number for compatibility
  name: fbCreator.name,
  email: fbCreator.email,
  phone: fbCreator.phone,
  category: fbCreator.category,
  region: fbCreator.region,
  phase: fbCreator.phase,
  phaseNumber: fbCreator.phaseNumber,
  cardsSold: fbCreator.cardsSold,
  totalCards: fbCreator.totalCards,
  cardPrice: fbCreator.cardPrice,
  daysInPhase: fbCreator.daysInPhase,
  nextTask: fbCreator.nextTask,
  salesVelocity: fbCreator.salesVelocity,
  avatar: fbCreator.avatar,
  bio: fbCreator.bio,
  socialMedia: fbCreator.socialMedia || {},
  assets: fbCreator.assets || { profileImages: [], videos: [], pressKit: [] },
  strategy: fbCreator.strategy || {},
  createdAt: fbCreator.createdAt,
  lastUpdated: fbCreator.lastUpdated
})