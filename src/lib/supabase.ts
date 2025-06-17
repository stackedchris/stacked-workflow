import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching creators:', error)
      return []
    }

    return data || []
  }

  static async createCreator(creator: Omit<DatabaseCreator, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCreator | null> {
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
      console.error('Error creating creator:', error)
      return null
    }

    return data
  }

  static async updateCreator(id: number, updates: Partial<DatabaseCreator>): Promise<DatabaseCreator | null> {
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
      console.error('Error updating creator:', error)
      return null
    }

    return data
  }

  static async deleteCreator(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting creator:', error)
      return false
    }

    return true
  }

  // Real-time subscription to creator changes
  static subscribeToCreators(callback: (creators: DatabaseCreator[]) => void) {
    const subscription = supabase
      .channel('creators-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'creators' },
        async () => {
          // Fetch updated data when any change occurs
          const creators = await this.getAllCreators()
          callback(creators)
        }
      )
      .subscribe()

    return subscription
  }
}

// Content database operations
export class ContentService {
  static async getAllContent(): Promise<DatabaseContent[]> {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching content:', error)
      return []
    }

    return data || []
  }

  static async createContent(content: Omit<DatabaseContent, 'created_at' | 'updated_at'>): Promise<DatabaseContent | null> {
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
      console.error('Error creating content:', error)
      return null
    }

    return data
  }

  static async updateContent(id: string, updates: Partial<DatabaseContent>): Promise<DatabaseContent | null> {
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
      console.error('Error updating content:', error)
      return null
    }

    return data
  }

  static async deleteContent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting content:', error)
      return false
    }

    return true
  }

  // Real-time subscription to content changes
  static subscribeToContent(callback: (content: DatabaseContent[]) => void) {
    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'content' },
        async () => {
          // Fetch updated data when any change occurs
          const content = await this.getAllContent()
          callback(content)
        }
      )
      .subscribe()

    return subscription
  }
}

// Utility functions to convert between local and database formats
export const convertCreatorToDatabase = (creator: any): Omit<DatabaseCreator, 'id' | 'created_at' | 'updated_at'> => ({
  name: creator.name,
  email: creator.email || '',
  phone: creator.phone || '',
  category: creator.category,
  region: creator.region,
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
  social_media: creator.socialMedia,
  assets: creator.assets,
  strategy: creator.strategy,
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