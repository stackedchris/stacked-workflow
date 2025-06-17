// Airtable integration for Stacked Workflow Platform
import type { Creator } from '@/components/CreatorManagement'

export interface AirtableConfig {
  apiKey: string
  baseId: string
  tableName: string
}

export interface AirtableCreator {
  id?: string
  fields: {
    Name: string
    Email?: string
    Phone?: string
    Category: string
    Phase: string
    'Phase Number': number
    'Cards Sold': number
    'Total Cards': number
    'Card Price': number
    'Days in Phase': number
    'Next Task': string
    'Sales Velocity': string
    Avatar?: string
    Bio?: string
    Instagram?: string
    Twitter?: string
    YouTube?: string
    TikTok?: string
    'Launch Date'?: string
    'Target Audience'?: string
    'Content Plan'?: string
    'Created Date': string
    'Last Updated': string
    Revenue?: number
    'Progress Percentage'?: number
  }
}

export class AirtableService {
  private config: AirtableConfig
  private baseUrl: string

  constructor(config: AirtableConfig) {
    this.config = config
    this.baseUrl = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`
  }

  // Test connection to Airtable
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      return response.ok
    } catch (error) {
      console.error('Airtable connection failed:', error)
      return false
    }
  }

  // Get all creators from Airtable
  async getCreators(): Promise<Creator[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.records.map((record: AirtableCreator) => this.mapAirtableToCreator(record))
    } catch (error) {
      console.error('Failed to get creators from Airtable:', error)
      throw error
    }
  }

  // Sync creators to Airtable
  async syncCreatorsToAirtable(creators: Creator[]): Promise<void> {
    try {
      // Get existing records to update vs create
      const existingRecords = await this.getAirtableRecords()
      const existingCreatorNames = new Set(existingRecords.map(record => record.fields.Name))

      for (const creator of creators) {
        if (existingCreatorNames.has(creator.name)) {
          // Update existing creator
          await this.updateCreatorInAirtable(creator, existingRecords)
        } else {
          // Create new creator
          await this.createCreatorInAirtable(creator)
        }
      }
    } catch (error) {
      console.error('Failed to sync creators to Airtable:', error)
      throw error
    }
  }

  // Get raw Airtable records
  private async getAirtableRecords(): Promise<AirtableCreator[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.records
  }

  // Create new creator in Airtable
  private async createCreatorInAirtable(creator: Creator): Promise<void> {
    try {
      // Get available fields from the table first
      const availableFields = await this.getTableFields()
      const mappedFields = this.mapCreatorToAirtable(creator, availableFields)

      const airtableCreator: Omit<AirtableCreator, 'id'> = {
        fields: mappedFields
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableCreator)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Airtable create error:', errorData)
        throw new Error(`Failed to create creator in Airtable: ${response.statusText}. ${errorData.error?.message || ''}`)
      }
    } catch (error) {
      console.error('Error creating creator in Airtable:', error)
      throw error
    }
  }

  // Update existing creator in Airtable
  private async updateCreatorInAirtable(creator: Creator, existingRecords: AirtableCreator[]): Promise<void> {
    const existingRecord = existingRecords.find(record => record.fields.Name === creator.name)
    if (!existingRecord?.id) return

    try {
      const availableFields = await this.getTableFields()
      const mappedFields = this.mapCreatorToAirtable(creator, availableFields)

      const updateData = {
        fields: mappedFields
      }

      const response = await fetch(`${this.baseUrl}/${existingRecord.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Airtable update error:', errorData)
        throw new Error(`Failed to update creator in Airtable: ${response.statusText}. ${errorData.error?.message || ''}`)
      }
    } catch (error) {
      console.error('Error updating creator in Airtable:', error)
      throw error
    }
  }

  // Get available fields from the Airtable table
  private async getTableFields(): Promise<Set<string>> {
    try {
      // Get table schema
      const baseUrl = `https://api.airtable.com/v0/meta/bases/${this.config.baseId}/tables`
      const response = await fetch(baseUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn('Could not fetch table schema, using all fields')
        return new Set()
      }

      const data = await response.json()
      const table = data.tables.find((t: any) => t.name === this.config.tableName)

      if (table) {
        const fieldNames = table.fields.map((field: any) => field.name)
        console.log('Available Airtable fields:', fieldNames)
        return new Set(fieldNames)
      }

      return new Set()
    } catch (error) {
      console.warn('Error fetching table fields:', error)
      return new Set()
    }
  }

  // Map Creator to Airtable format (only include fields that exist in the table)
  private mapCreatorToAirtable(creator: Creator, availableFields?: Set<string>): Partial<AirtableCreator['fields']> {
    const allFields = {
      'Name': creator.name,
      'Email': creator.email || undefined,
      'Phone': creator.phone || undefined,
      'Category': creator.category,
      'Phase': creator.phase,
      'Phase Number': creator.phaseNumber,
      'Cards Sold': creator.cardsSold,
      'Total Cards': creator.totalCards,
      'Card Price': creator.cardPrice,
      'Days in Phase': creator.daysInPhase,
      'Next Task': creator.nextTask,
      'Sales Velocity': creator.salesVelocity,
      'Avatar': creator.avatar || undefined,
      'Bio': creator.bio || undefined,
      'Instagram': creator.socialMedia.instagram || undefined,
      'Twitter': creator.socialMedia.twitter || undefined,
      'YouTube': creator.socialMedia.youtube || undefined,
      'TikTok': creator.socialMedia.tiktok || undefined,
      'Launch Date': creator.strategy.launchDate || undefined,
      'Target Audience': creator.strategy.targetAudience || undefined,
      'Content Plan': creator.strategy.contentPlan || undefined,
      'Created Date': creator.createdAt,
      'Last Updated': creator.lastUpdated,
      'Revenue': creator.cardsSold * creator.cardPrice,
      'Progress Percentage': Math.round((creator.cardsSold / creator.totalCards) * 100)
    }

    // If no field information available, return all fields
    if (!availableFields || availableFields.size === 0) {
      console.log('No field constraints, sending all fields')
      return allFields
    }

    // Filter to only include fields that exist in the table
    const filteredFields: Partial<AirtableCreator['fields']> = {}

    // Always include Name if it exists (required field)
    if (availableFields.has('Name') && allFields.Name) {
      filteredFields.Name = allFields.Name
    }

    for (const [fieldName, value] of Object.entries(allFields)) {
      if (fieldName === 'Name') continue // Already handled above

      if (availableFields.has(fieldName)) {
        // Only include non-undefined values
        if (value !== undefined && value !== null && value !== '') {
          filteredFields[fieldName as keyof AirtableCreator['fields']] = value
        }
      } else {
        console.log(`Skipping field '${fieldName}' - not found in table schema`)
      }
    }

    // Ensure we have at least Name for the record to be valid
    if (!filteredFields.Name) {
      console.error('Cannot sync creator without Name field')
      throw new Error('Creator sync requires a "Name" field in your Airtable table')
    }

    console.log('Filtered fields for Airtable:', Object.keys(filteredFields))
    return filteredFields
  }

  // Map Airtable record to Creator
  private mapAirtableToCreator(record: AirtableCreator): Creator {
    const fields = record.fields

    return {
      id: this.generateIdFromAirtableId(record.id || ''),
      name: fields.Name || '',
      email: fields.Email || '',
      phone: fields.Phone || '',
      category: fields.Category || '',
      phase: fields.Phase || '',
      phaseNumber: fields['Phase Number'] || 0,
      cardsSold: fields['Cards Sold'] || 0,
      totalCards: fields['Total Cards'] || 100,
      cardPrice: fields['Card Price'] || 0,
      daysInPhase: fields['Days in Phase'] || 0,
      nextTask: fields['Next Task'] || '',
      salesVelocity: fields['Sales Velocity'] || 'Pending',
      avatar: fields.Avatar || '👤',
      bio: fields.Bio || '',
      socialMedia: {
        instagram: fields.Instagram || '',
        twitter: fields.Twitter || '',
        youtube: fields.YouTube || '',
        tiktok: fields.TikTok || ''
      },
      assets: {
        profileImages: [],
        videos: [],
        pressKit: []
      },
      strategy: {
        launchDate: fields['Launch Date'] || '',
        targetAudience: fields['Target Audience'] || '',
        contentPlan: fields['Content Plan'] || ''
      },
      createdAt: fields['Created Date'] || new Date().toISOString().split('T')[0],
      lastUpdated: fields['Last Updated'] || new Date().toISOString().split('T')[0]
    }
  }

  // Generate numeric ID from Airtable record ID
  private generateIdFromAirtableId(airtableId: string): number {
    // Convert Airtable ID to a numeric ID for consistency
    let hash = 0
    for (let i = 0; i < airtableId.length; i++) {
      const char = airtableId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Export creators as CSV for Airtable import (original method)
  static exportToCSV(creators: Creator[]): string {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Category',
      'Phase',
      'Phase Number',
      'Cards Sold',
      'Total Cards',
      'Card Price',
      'Days in Phase',
      'Next Task',
      'Sales Velocity',
      'Avatar',
      'Bio',
      'Instagram',
      'Twitter',
      'YouTube',
      'TikTok',
      'Launch Date',
      'Target Audience',
      'Content Plan',
      'Created Date',
      'Last Updated',
      'Revenue',
      'Progress Percentage'
    ]

    const rows = creators.map(creator => [
      creator.name,
      creator.email,
      creator.phone,
      creator.category,
      creator.phase,
      creator.phaseNumber.toString(),
      creator.cardsSold.toString(),
      creator.totalCards.toString(),
      creator.cardPrice.toString(),
      creator.daysInPhase.toString(),
      creator.nextTask,
      creator.salesVelocity,
      creator.avatar,
      creator.bio,
      creator.socialMedia.instagram || '',
      creator.socialMedia.twitter || '',
      creator.socialMedia.youtube || '',
      creator.socialMedia.tiktok || '',
      creator.strategy.launchDate || '',
      creator.strategy.targetAudience || '',
      creator.strategy.contentPlan || '',
      creator.createdAt,
      creator.lastUpdated,
      (creator.cardsSold * creator.cardPrice).toString(),
      Math.round((creator.cardsSold / creator.totalCards) * 100).toString()
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  // Enhanced CSV export for perfect Airtable import (new method)
  static exportCreatorsToAirtable(creators: Creator[]): string {
    const headers = [
      'Name', 'Email', 'Phone', 'Category', 'Avatar', 'Bio',
      'Phase', 'Phase Number', 'Cards Sold', 'Total Cards', 'Card Price',
      'Sales Velocity', 'Days in Phase', 'Next Task',
      'Instagram', 'Twitter', 'YouTube', 'TikTok',
      'Launch Date', 'Target Audience', 'Content Plan',
      'Created Date', 'Last Updated'
    ]

    const rows = creators.map(creator => [
      creator.name,
      creator.email || '',
      creator.phone || '',
      creator.category,
      creator.avatar,
      creator.bio || '',
      creator.phase,
      creator.phaseNumber.toString(),
      creator.cardsSold.toString(),
      creator.totalCards.toString(),
      creator.cardPrice.toString(),
      creator.salesVelocity,
      creator.daysInPhase.toString(),
      creator.nextTask,
      creator.socialMedia.instagram || '',
      creator.socialMedia.twitter || '',
      creator.socialMedia.youtube || '',
      creator.socialMedia.tiktok || '',
      creator.strategy.launchDate || '',
      creator.strategy.targetAudience || '',
      creator.strategy.contentPlan || '',
      creator.createdAt,
      creator.lastUpdated
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  // Export content data for Airtable
  static exportContentToAirtable(content: any[]): string {
    const headers = [
      'Name', 'Type', 'Category', 'Status', 'Creator ID', 'Creator Name',
      'Priority', 'Scheduled Date', 'Posted Date', 'Notes', 'Tags',
      'Description', 'Upload Date', 'File Size'
    ]

    const rows = content.map(item => [
      item.name || '',
      item.type || '',
      item.category || '',
      item.status || '',
      item.creatorId?.toString() || '',
      item.creatorName || '',
      item.priority || '',
      item.scheduledDate || '',
      item.postedDate || '',
      item.notes || '',
      item.tags ? (Array.isArray(item.tags) ? item.tags.join(', ') : item.tags) : '',
      item.description || '',
      item.uploadDate || '',
      item.size?.toString() || ''
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  // Generate complete Airtable setup script with exact field configurations
  static generateBaseSetupScript(): string {
    return `# 🚀 Auto-Setup Script for Stacked Workflow Airtable Integration

## Quick Setup (Option 1): Import CSV Method - 3 Minutes ⚡

### Step 1: Create Base
1. Go to [airtable.com](https://airtable.com) → "Create a base" → "Start from scratch"
2. Name it: **"Stacked Creator Pipeline"**

### Step 2: Import Creators Data
1. **Delete the default "Table 1"** (we'll replace it)
2. Click **"Import data"** → **"CSV file"**
3. Upload **"stacked-creators-[date].csv"** file
4. **Name the table: "Creators"**
5. Click **"Import"** - Airtable auto-creates all fields! ✨

### Step 3: Set Up Field Types (3 minutes)
After import, update these field types for better functionality:

**🔧 Fields to Update:**
- **Email** → Change to "Email" type
- **Phone** → Change to "Phone number" type
- **Category** → Change to "Single select" (Gaming, Music, Streaming, Lifestyle, Comedy, Fashion)
- **Phase** → Change to "Single select" (Phase 0: Strategy Call, Phase 1: Drop Prep, etc.)
- **Cards Sold** → Change to "Number" type
- **Card Price** → Change to "Currency" type (USD)
- **Sales Velocity** → Change to "Single select" (High, Medium, Low, Pending)
- **Launch Date** → Change to "Date" type

**📊 Add Formula Fields:**
- **Revenue** → Formula: \`{Cards Sold} * {Card Price}\` (Currency format)
- **Progress Percentage** → Formula: \`ROUND(({Cards Sold} / {Total Cards}) * 100, 0)\` (Percent format)

### Step 4: Create Content Table (Optional)
1. Click **"+"** next to table tabs → **"Import data"** → **"CSV file"**
2. Upload **"stacked-content-[date].csv"** file
3. Name it: **"Content"**
4. Update field types as needed

### Step 5: Create Views
**📊 Recommended Views for Creators Table:**

1. **Pipeline Dashboard**
   - Group by: Phase
   - Sort: Days in Phase (Descending)
   - Show: Name, Category, Cards Sold, Sales Velocity, Next Task

2. **Revenue Tracking**
   - Group by: Category
   - Sort: Revenue (Descending)
   - Show: Name, Cards Sold, Revenue, Progress Percentage

3. **High Priority**
   - Filter: Sales Velocity = "Low" OR Days in Phase > 7
   - Sort: Days in Phase (Descending)
   - Color: Red for urgent items

4. **Launch Calendar**
   - View type: Calendar
   - Date field: Launch Date
   - Color by: Category

---

## 🎯 Final Steps

### Connect Platform
1. **Copy Base ID** from URL (starts with "app...")
2. In Stacked Platform: **Airtable** tab → **Setup**
3. Enter API Key + Base ID + Table Name ("Creators")
4. Click **"Connect to Airtable"**
5. Test sync - watch your data flow! 🔄

### Success Checklist ✅
- [ ] Base created and named correctly
- [ ] Creators table imported/created with all fields
- [ ] Content table set up (if using)
- [ ] Formula fields working (Revenue, Progress %)
- [ ] Views created for different workflows
- [ ] Platform connected and syncing
- [ ] Real-time updates working

🎉 **Congratulations!** Your Stacked workflow is now professional-grade with Airtable integration!

**⏱️ Total Time:** 3-10 minutes depending on method
**🎯 Result:** Professional creator pipeline database with real-time sync
**💰 Value:** Enterprise-level workflow management`;
  }

  // Generate complete setup package
  static generateCompleteSetupPackage(creators: Creator[], content: any[] = []): {
    setupScript: string
    creatorsCSV: string
    contentCSV: string
    quickStartGuide: string
  } {
    const setupScript = this.generateBaseSetupScript()
    const creatorsCSV = this.exportCreatorsToAirtable(creators)
    const contentCSV = this.exportContentToAirtable(content)

    const quickStartGuide = `# 🚀 Stacked → Airtable Quick Start Guide

## 🎯 What You Just Downloaded

**Complete Setup Package for Professional Creator Pipeline Database**

### 📦 Package Contents:
- ✅ **Setup Script** (airtable-setup-script.md) - Complete field configurations
- ✅ **Creators CSV** (stacked-creators-[date].csv) - ${creators.length} creators ready for import
- ✅ **Content CSV** (stacked-content-[date].csv) - ${content.length} content items ready for import
- ✅ **This Guide** (airtable-quick-start.md) - You're reading it now!

---

## ⚡ Super Quick Setup (3 Minutes)

### Step 1: Create Airtable Base (30 seconds)
1. Go to [airtable.com](https://airtable.com)
2. Click **"Create a base"** → **"Start from scratch"**
3. Name it: **"Stacked Creator Pipeline"**

### Step 2: Import Your Data (1 minute)
1. **Delete** the default "Table 1"
2. Click **"Import data"** → **"CSV file"**
3. Upload **"stacked-creators-[date].csv"**
4. Name the table: **"Creators"**
5. Click **"Import"** - All fields auto-created! ✨

### Step 3: Add Content Table (1 minute) - Optional
1. Click **"+"** next to table tabs
2. **"Import data"** → Upload **"stacked-content-[date].csv"**
3. Name it: **"Content"**

### Step 4: Connect Platform (30 seconds)
1. **Copy Base ID** from your Airtable URL (starts with "app...")
2. In Stacked Platform: **Airtable** tab → **Setup**
3. Enter API Key + Base ID + "Creators" as table name
4. Click **"Connect to Airtable"**
5. Test sync and watch magic happen! 🪄

---

## 🎉 Congratulations!

You've just set up a **professional-grade creator pipeline database** with:
- ⚡ **Real-time synchronization**
- 📊 **Advanced analytics and reporting**
- 👥 **Team collaboration features**
- 📱 **Mobile accessibility**
- 🔧 **Customizable workflows**

**Total Setup Time:** ~3-5 minutes
**Result:** Enterprise-level creator management system

🚀 **Welcome to professional creator pipeline management!**`

    return {
      setupScript,
      creatorsCSV,
      contentCSV,
      quickStartGuide
    }
  }

  // Create Airtable base structure
  static getAirtableBaseTemplate(): string {
    return `
# Stacked Creators - Airtable Base Template

## Table: Creators

### Fields Setup:

**Basic Info:**
- Name (Single line text) - Primary field
- Email (Email)
- Phone (Phone number)
- Category (Single select): Gaming, Music, Streaming, Lifestyle, Comedy, Fashion
- Avatar (Single line text)
- Bio (Long text)

**Pipeline:**
- Phase (Single select): Phase 0: Strategy Call, Phase 1: Drop Prep, Phase 2: Launch Week, Phase 3: Sell-Out Push, Phase 4: Post-Sellout
- Phase Number (Number)
- Days in Phase (Number)
- Next Task (Single line text)

**Performance:**
- Cards Sold (Number)
- Total Cards (Number) - Default: 100
- Card Price (Currency)
- Sales Velocity (Single select): High, Medium, Low, Pending
- Revenue (Formula): {Cards Sold} * {Card Price}
- Progress Percentage (Formula): ROUND(({Cards Sold} / {Total Cards}) * 100, 0)

**Social Media:**
- Instagram (URL)
- Twitter (URL)
- YouTube (URL)
- TikTok (URL)

**Strategy:**
- Launch Date (Date)
- Target Audience (Long text)
- Content Plan (Long text)

**Metadata:**
- Created Date (Date)
- Last Updated (Date)

### Views Setup:

**1. Pipeline Dashboard**
- Group by: Phase
- Sort: Days in Phase (descending)
- Show: Name, Category, Cards Sold, Sales Velocity, Next Task

**2. High Priority**
- Filter: Sales Velocity = "Low" OR Days in Phase > 7
- Sort: Days in Phase (descending)

**3. Revenue Tracking**
- Group by: Category
- Sort: Revenue (descending)
- Show: Name, Cards Sold, Card Price, Revenue, Progress Percentage

**4. Launch Calendar**
- Calendar view by Launch Date
- Show: Name, Phase, Target Audience

**5. Social Media**
- Show: Name, Instagram, Twitter, YouTube, Category
- Filter: Social media fields are not empty
    `
  }
}
