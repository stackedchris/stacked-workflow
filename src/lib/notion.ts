import { Client } from '@notionhq/client'

export interface NotionConfig {
  token: string
  creatorsDatabaseId: string
  tasksDatabaseId?: string
  templatesDatabaseId?: string
}

export interface Creator {
  id: number
  name: string
  email: string
  phone: string
  category: string
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
    tiktok?: string
    youtube?: string
  }
  assets: {
    profileImages: string[]
    videos: string[]
    pressKit: string[]
  }
  strategy: {
    launchDate?: string
    pricingStructure?: string
    targetAudience?: string
    contentPlan?: string
  }
  createdAt: string
  lastUpdated: string
}

export interface NotionTask {
  id: string
  name: string
  creator: string
  phase: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'In Progress' | 'Completed'
  assignedTo: 'Creator' | 'Team'
  dueDate: string
  automationRule?: string
}

export interface NotionTemplate {
  id: string
  name: string
  platform: string
  phase: string
  category: string
  content: string
  successRate: number
  engagement: string
  uses: number
  tags: string[]
}

export class NotionService {
  private client: Client
  private config: NotionConfig

  constructor(config: NotionConfig) {
    this.config = config
    this.client = new Client({
      auth: config.token,
    })
  }

  // Test connection to Notion
  async testConnection(): Promise<boolean> {
    try {
      await this.client.users.me()
      return true
    } catch (error) {
      console.error('Notion connection failed:', error)
      return false
    }
  }

  // Get database info
  async getDatabaseInfo(databaseId: string) {
    try {
      const database = await this.client.databases.retrieve({
        database_id: databaseId,
      })
      return database
    } catch (error) {
      console.error('Failed to get database info:', error)
      throw error
    }
  }

  // Sync creators to Notion
  async syncCreatorsToNotion(creators: Creator[]): Promise<void> {
    if (!this.config.creatorsDatabaseId) {
      throw new Error('Creators database ID not configured')
    }

    try {
      // First, get existing pages to update vs create
      const existingPages = await this.getExistingCreators()
      const existingCreatorNames = new Set(existingPages.map(page =>
        (page.properties.Name as any)?.title?.[0]?.plain_text
      ))

      for (const creator of creators) {
        if (existingCreatorNames.has(creator.name)) {
          // Update existing creator
          await this.updateCreatorInNotion(creator, existingPages)
        } else {
          // Create new creator
          await this.createCreatorInNotion(creator)
        }
      }
    } catch (error) {
      console.error('Failed to sync creators to Notion:', error)
      throw error
    }
  }

  // Get existing creators from Notion
  private async getExistingCreators() {
    const response = await this.client.databases.query({
      database_id: this.config.creatorsDatabaseId,
    })
    return response.results
  }

  // Create new creator in Notion
  private async createCreatorInNotion(creator: Creator) {
    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: creator.name,
            },
          },
        ],
      },
      Category: {
        select: {
          name: creator.category,
        },
      },
      Phase: {
        select: {
          name: creator.phase,
        },
      },
      'Cards Sold': {
        number: creator.cardsSold,
      },
      'Total Cards': {
        number: creator.totalCards,
      },
      'Card Price': {
        number: creator.cardPrice,
      },
      Email: {
        email: creator.email,
      },
      Phone: {
        phone_number: creator.phone,
      },
      Bio: {
        rich_text: [
          {
            text: {
              content: creator.bio,
            },
          },
        ],
      },
      Avatar: {
        rich_text: [
          {
            text: {
              content: creator.avatar,
            },
          },
        ],
      },
      'Sales Velocity': {
        select: {
          name: creator.salesVelocity,
        },
      },
      'Days in Phase': {
        number: creator.daysInPhase,
      },
      'Next Task': {
        rich_text: [
          {
            text: {
              content: creator.nextTask,
            },
          },
        ],
      },
    }

    // Add social media if available
    if (creator.socialMedia.instagram) {
      properties.Instagram = {
        url: creator.socialMedia.instagram.startsWith('http')
          ? creator.socialMedia.instagram
          : `https://instagram.com/${creator.socialMedia.instagram.replace('@', '')}`
      }
    }

    if (creator.socialMedia.twitter) {
      properties.Twitter = {
        url: creator.socialMedia.twitter.startsWith('http')
          ? creator.socialMedia.twitter
          : `https://twitter.com/${creator.socialMedia.twitter.replace('@', '')}`
      }
    }

    if (creator.socialMedia.youtube) {
      properties.YouTube = {
        url: creator.socialMedia.youtube.startsWith('http')
          ? creator.socialMedia.youtube
          : `https://youtube.com/${creator.socialMedia.youtube.replace('@', '')}`
      }
    }

    // Add strategy fields if available
    if (creator.strategy.launchDate) {
      properties['Launch Date'] = {
        date: {
          start: creator.strategy.launchDate,
        },
      }
    }

    if (creator.strategy.targetAudience) {
      properties['Target Audience'] = {
        rich_text: [
          {
            text: {
              content: creator.strategy.targetAudience,
            },
          },
        ],
      }
    }

    if (creator.strategy.contentPlan) {
      properties['Content Plan'] = {
        rich_text: [
          {
            text: {
              content: creator.strategy.contentPlan,
            },
          },
        ],
      }
    }

    await this.client.pages.create({
      parent: {
        database_id: this.config.creatorsDatabaseId,
      },
      properties,
    })
  }

  // Update existing creator in Notion
  private async updateCreatorInNotion(creator: Creator, existingPages: any[]) {
    const existingPage = existingPages.find(page =>
      (page.properties.Name as any)?.title?.[0]?.plain_text === creator.name
    )

    if (!existingPage) return

    const properties: any = {
      Category: {
        select: {
          name: creator.category,
        },
      },
      Phase: {
        select: {
          name: creator.phase,
        },
      },
      'Cards Sold': {
        number: creator.cardsSold,
      },
      'Card Price': {
        number: creator.cardPrice,
      },
      'Sales Velocity': {
        select: {
          name: creator.salesVelocity,
        },
      },
      'Days in Phase': {
        number: creator.daysInPhase,
      },
      'Next Task': {
        rich_text: [
          {
            text: {
              content: creator.nextTask,
            },
          },
        ],
      },
    }

    await this.client.pages.update({
      page_id: existingPage.id,
      properties,
    })
  }

  // Get creators from Notion
  async getCreatorsFromNotion(): Promise<Creator[]> {
    if (!this.config.creatorsDatabaseId) {
      throw new Error('Creators database ID not configured')
    }

    try {
      const response = await this.client.databases.query({
        database_id: this.config.creatorsDatabaseId,
      })

      return response.results.map(page => this.mapNotionPageToCreator(page as any))
    } catch (error) {
      console.error('Failed to get creators from Notion:', error)
      throw error
    }
  }

  // Map Notion page to Creator object
  private mapNotionPageToCreator(page: any): Creator {
    const props = page.properties

    return {
      id: Number.parseInt(page.id.replace(/-/g, '').slice(-8), 16), // Generate numeric ID from Notion ID
      name: props.Name?.title?.[0]?.plain_text || '',
      email: props.Email?.email || '',
      phone: props.Phone?.phone_number || '',
      category: props.Category?.select?.name || '',
      phase: props.Phase?.select?.name || '',
      phaseNumber: this.getPhaseNumber(props.Phase?.select?.name || ''),
      cardsSold: props['Cards Sold']?.number || 0,
      totalCards: props['Total Cards']?.number || 100,
      cardPrice: props['Card Price']?.number || 0,
      daysInPhase: props['Days in Phase']?.number || 0,
      nextTask: props['Next Task']?.rich_text?.[0]?.plain_text || '',
      salesVelocity: props['Sales Velocity']?.select?.name || 'Pending',
      avatar: props.Avatar?.rich_text?.[0]?.plain_text || '👤',
      bio: props.Bio?.rich_text?.[0]?.plain_text || '',
      socialMedia: {
        instagram: props.Instagram?.url || '',
        twitter: props.Twitter?.url || '',
        youtube: props.YouTube?.url || '',
      },
      assets: {
        profileImages: [],
        videos: [],
        pressKit: [],
      },
      strategy: {
        launchDate: props['Launch Date']?.date?.start || '',
        targetAudience: props['Target Audience']?.rich_text?.[0]?.plain_text || '',
        contentPlan: props['Content Plan']?.rich_text?.[0]?.plain_text || '',
      },
      createdAt: page.created_time.split('T')[0],
      lastUpdated: page.last_edited_time.split('T')[0],
    }
  }

  // Helper to get phase number from phase name
  private getPhaseNumber(phaseName: string): number {
    if (phaseName.includes('Phase 0')) return 0
    if (phaseName.includes('Phase 1')) return 1
    if (phaseName.includes('Phase 2')) return 2
    if (phaseName.includes('Phase 3')) return 3
    if (phaseName.includes('Phase 4')) return 4
    return 0
  }

  // Sync tasks to Notion (if tasks database is configured)
  async syncTasksToNotion(tasks: NotionTask[]): Promise<void> {
    if (!this.config.tasksDatabaseId) {
      console.log('Tasks database not configured, skipping task sync')
      return
    }

    try {
      for (const task of tasks) {
        await this.createTaskInNotion(task)
      }
    } catch (error) {
      console.error('Failed to sync tasks to Notion:', error)
      throw error
    }
  }

  // Create task in Notion
  private async createTaskInNotion(task: NotionTask) {
    if (!this.config.tasksDatabaseId) return

    const properties: any = {
      'Task Name': {
        title: [
          {
            text: {
              content: task.name,
            },
          },
        ],
      },
      Creator: {
        rich_text: [
          {
            text: {
              content: task.creator,
            },
          },
        ],
      },
      Phase: {
        select: {
          name: task.phase,
        },
      },
      Priority: {
        select: {
          name: task.priority,
        },
      },
      Status: {
        select: {
          name: task.status,
        },
      },
      'Assigned To': {
        select: {
          name: task.assignedTo,
        },
      },
      'Due Date': {
        date: {
          start: task.dueDate,
        },
      },
    }

    if (task.automationRule) {
      properties['Automation Rule'] = {
        rich_text: [
          {
            text: {
              content: task.automationRule,
            },
          },
        ],
      }
    }

    await this.client.pages.create({
      parent: {
        database_id: this.config.tasksDatabaseId,
      },
      properties,
    })
  }

  // Create database with proper schema
  async createCreatorsDatabase(parentPageId: string): Promise<string> {
    try {
      const database = await this.client.databases.create({
        parent: {
          type: 'page_id',
          page_id: parentPageId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: 'Stacked Creators',
            },
          },
        ],
        properties: {
          Name: {
            title: {},
          },
          Category: {
            select: {
              options: [
                { name: 'Gaming', color: 'purple' },
                { name: 'Music', color: 'pink' },
                { name: 'Streaming', color: 'blue' },
                { name: 'Lifestyle', color: 'green' },
                { name: 'Comedy', color: 'yellow' },
                { name: 'Fashion', color: 'orange' },
              ],
            },
          },
          Phase: {
            select: {
              options: [
                { name: 'Phase 0: Strategy Call', color: 'blue' },
                { name: 'Phase 1: Drop Prep', color: 'yellow' },
                { name: 'Phase 2: Launch Week', color: 'green' },
                { name: 'Phase 3: Sell-Out Push', color: 'orange' },
                { name: 'Phase 4: Post-Sellout', color: 'purple' },
              ],
            },
          },
          'Cards Sold': {
            number: {
              format: 'number',
            },
          },
          'Total Cards': {
            number: {
              format: 'number',
            },
          },
          'Card Price': {
            number: {
              format: 'dollar',
            },
          },
          Email: {
            email: {},
          },
          Phone: {
            phone_number: {},
          },
          Instagram: {
            url: {},
          },
          Twitter: {
            url: {},
          },
          YouTube: {
            url: {},
          },
          Bio: {
            rich_text: {},
          },
          Avatar: {
            rich_text: {},
          },
          'Sales Velocity': {
            select: {
              options: [
                { name: 'High', color: 'green' },
                { name: 'Medium', color: 'yellow' },
                { name: 'Low', color: 'red' },
                { name: 'Pending', color: 'gray' },
              ],
            },
          },
          'Days in Phase': {
            number: {
              format: 'number',
            },
          },
          'Next Task': {
            rich_text: {},
          },
          'Launch Date': {
            date: {},
          },
          'Target Audience': {
            rich_text: {},
          },
          'Content Plan': {
            rich_text: {},
          },
        },
      })

      return database.id
    } catch (error) {
      console.error('Failed to create creators database:', error)
      throw error
    }
  }
}
