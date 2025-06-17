import { createClient } from '@supabase/supabase-js'

// Supabase configuration with your credentials
const supabaseUrl = 'https://idmgjyhbpizcuptrmrky.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWdqeWhicGl6Y3VwdHJta3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MDE4NjI4NiwiZXhwIjoyMDY1NzYyMjg2fQ.5ryQP5WVc4PhUoqXTn0c5CrwBwGjeT7w1NP_OqjRirk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('creators')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Supabase connection successful!')
    return { success: true, data }
  } catch (err) {
    console.error('❌ Network error connecting to Supabase:', err)
    return { success: false, error: 'Network connection failed' }
  }
}

// Database types
export interface DatabaseCreator {
  id: number
  name: string
  email: string
  phone: string
  category: string
  region: string
  phase: string
  phase_number: number
  cards_sold: number
  total_cards: number
  card_price: number
  days_in_phase: number
  next_task: string
  sales_velocity: string
  avatar: string
  bio: string
  social_media: any
  assets: any
  strategy: any
  stacked_profile_url: string
  created_at: string
  updated_at: string
}

export interface DatabaseContent {
  id: string
  name: string
  type: string
  category: string
  status: string
  creator_id?: number
  scheduled_date?: string
  posted_date?: string
  priority?: string
  notes?: string
  tags: string[]
  description: string
  upload_date: string
  size: number
  created_at: string
  updated_at: string
}

// Creator database operations
export class CreatorService {
  static async getAllCreators(): Promise<DatabaseCreator[]> {
    try {
      console.log('📥 Fetching creators from Supabase...')
      
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching creators:', error)
        throw error
      }

      console.log(`✅ Fetched ${data?.length || 0} creators from Supabase`)
      return data || []
    } catch (error) {
      console.error('❌ Network error fetching creators:', error)
      throw error
    }
  }

  static async createCreator(creator: Omit<DatabaseCreator, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCreator | null> {
    try {
      console.log('📤 Creating creator in Supabase:', creator.name)
      
      const { data, error } = await supabase
        .from('creators')
        .insert([{
          ...creator,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating creator:', error)
        throw error
      }

      console.log('✅ Creator created successfully:', data.name)
      return data
    } catch (error) {
      console.error('❌ Network error creating creator:', error)
      throw error
    }
  }

  static async updateCreator(id: number, updates: Partial<DatabaseCreator>): Promise<DatabaseCreator | null> {
    try {
      console.log('📝 Updating creator in Supabase:', id)
      
      const { data, error } = await supabase
        .from('creators')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating creator:', error)
        throw error
      }

      console.log('✅ Creator updated successfully:', data.name)
      return data
    } catch (error) {
      console.error('❌ Network error updating creator:', error)
      throw error
    }
  }

  static async deleteCreator(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Deleting creator from Supabase:', id)
      
      const { error } = await supabase
        .from('creators')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting creator:', error)
        throw error
      }

      console.log('✅ Creator deleted successfully')
      return true
    } catch (error) {
      console.error('❌ Network error deleting creator:', error)
      throw error
    }
  }

  // Real-time subscription to creator changes
  static subscribeToCreators(callback: (creators: DatabaseCreator[]) => void) {
    console.log('🔄 Setting up real-time subscription for creators...')
    
    const subscription = supabase
      .channel('creators-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'creators' },
        async (payload) => {
          console.log('🔄 Real-time update received:', payload.eventType)
          // Fetch updated data when any change occurs
          try {
            const creators = await this.getAllCreators()
            callback(creators)
          } catch (error) {
            console.error('❌ Failed to fetch updated creators:', error)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })

    return subscription
  }
}

// Content database operations
export class ContentService {
  static async getAllContent(): Promise<DatabaseContent[]> {
    try {
      console.log('📥 Fetching content from Supabase...')
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching content:', error)
        throw error
      }

      console.log(`✅ Fetched ${data?.length || 0} content items from Supabase`)
      return data || []
    } catch (error) {
      console.error('❌ Network error fetching content:', error)
      throw error
    }
  }

  static async createContent(content: Omit<DatabaseContent, 'created_at' | 'updated_at'>): Promise<DatabaseContent | null> {
    try {
      console.log('📤 Creating content in Supabase:', content.name)
      
      const { data, error } = await supabase
        .from('content')
        .insert([{
          ...content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating content:', error)
        throw error
      }

      console.log('✅ Content created successfully:', data.name)
      return data
    } catch (error) {
      console.error('❌ Network error creating content:', error)
      throw error
    }
  }

  static async updateContent(id: string, updates: Partial<DatabaseContent>): Promise<DatabaseContent | null> {
    try {
      console.log('📝 Updating content in Supabase:', id)
      
      const { data, error } = await supabase
        .from('content')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating content:', error)
        throw error
      }

      console.log('✅ Content updated successfully:', data.name)
      return data
    } catch (error) {
      console.error('❌ Network error updating content:', error)
      throw error
    }
  }

  static async deleteContent(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting content from Supabase:', id)
      
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting content:', error)
        throw error
      }

      console.log('✅ Content deleted successfully')
      return true
    } catch (error) {
      console.error('❌ Network error deleting content:', error)
      throw error
    }
  }

  // Real-time subscription to content changes
  static subscribeToContent(callback: (content: DatabaseContent[]) => void) {
    console.log('🔄 Setting up real-time subscription for content...')
    
    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'content' },
        async (payload) => {
          console.log('🔄 Real-time update received:', payload.eventType)
          // Fetch updated data when any change occurs
          try {
            const content = await this.getAllContent()
            callback(content)
          } catch (error) {
            console.error('❌ Failed to fetch updated content:', error)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Content subscription status:', status)
      })

    return subscription
  }
}

// Utility functions to convert between local and database formats
export const convertCreatorToDatabase = (creator: any): Omit<DatabaseCreator, 'id' | 'created_at' | 'updated_at'> => ({
  name: creator.name,
  email: creator.email || '',
  phone: creator.phone || '',
  category: creator.category,
  region: creator.region || 'US',
  phase: creator.phase,
  phase_number: creator.phaseNumber,
  cards_sold: creator.cardsSold,
  total_cards: creator.totalCards,
  card_price: creator.cardPrice,
  days_in_phase: creator.daysInPhase,
  next_task: creator.nextTask,
  sales_velocity: creator.salesVelocity,
  avatar: creator.avatar,
  bio: creator.bio || '',
  social_media: creator.socialMedia || {},
  assets: creator.assets || { profileImages: [], videos: [], pressKit: [] },
  strategy: creator.strategy || {},
  stacked_profile_url: creator.stackedProfileUrl || ''
})

export const convertDatabaseToCreator = (dbCreator: DatabaseCreator): any => ({
  id: dbCreator.id,
  name: dbCreator.name,
  email: dbCreator.email,
  phone: dbCreator.phone,
  category: dbCreator.category,
  region: dbCreator.region,
  phase: dbCreator.phase,
  phaseNumber: dbCreator.phase_number,
  cardsSold: dbCreator.cards_sold,
  totalCards: dbCreator.total_cards,
  cardPrice: dbCreator.card_price,
  daysInPhase: dbCreator.days_in_phase,
  nextTask: dbCreator.next_task,
  salesVelocity: dbCreator.sales_velocity,
  avatar: dbCreator.avatar,
  bio: dbCreator.bio,
  socialMedia: dbCreator.social_media || {},
  assets: dbCreator.assets || { profileImages: [], videos: [], pressKit: [] },
  strategy: dbCreator.strategy || {},
  stackedProfileUrl: dbCreator.stacked_profile_url,
  createdAt: dbCreator.created_at.split('T')[0],
  lastUpdated: dbCreator.updated_at.split('T')[0]
})

export const convertContentToDatabase = (content: any): Omit<DatabaseContent, 'created_at' | 'updated_at'> => ({
  id: content.id,
  name: content.name,
  type: content.type,
  category: content.category,
  status: content.status,
  creator_id: content.creatorId,
  scheduled_date: content.scheduledDate,
  posted_date: content.postedDate,
  priority: content.priority,
  notes: content.notes,
  tags: content.tags || [],
  description: content.description,
  upload_date: content.uploadDate,
  size: content.size
})

export const convertDatabaseToContent = (dbContent: DatabaseContent): any => ({
  id: dbContent.id,
  name: dbContent.name,
  type: dbContent.type,
  category: dbContent.category,
  status: dbContent.status,
  creatorId: dbContent.creator_id,
  scheduledDate: dbContent.scheduled_date,
  postedDate: dbContent.posted_date,
  priority: dbContent.priority,
  notes: dbContent.notes,
  tags: dbContent.tags || [],
  description: dbContent.description,
  uploadDate: dbContent.upload_date,
  size: dbContent.size
})

// Initialize database connection and test
export const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing Supabase database connection...')
    
    // Test connection first
    const connectionTest = await testSupabaseConnection()
    if (!connectionTest.success) {
      console.error('❌ Database connection failed:', connectionTest.error)
      return false
    }

    // Check if tables exist and have data
    try {
      const { data: creators, error: creatorsError } = await supabase
        .from('creators')
        .select('id')
        .limit(1)

      const { data: content, error: contentError } = await supabase
        .from('content')
        .select('id')
        .limit(1)

      if (creatorsError || contentError) {
        console.error('❌ Database tables not accessible:', { creatorsError, contentError })
        return false
      }

      console.log('✅ Database initialized successfully!')
      console.log(`📊 Found ${creators?.length || 0} creators, ${content?.length || 0} content items`)
      
      return true
    } catch (err) {
      console.error('❌ Database tables check failed:', err)
      return false
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}