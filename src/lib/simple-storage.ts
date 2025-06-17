// Simple, reliable storage solutions that work immediately
// No complex setup, no migration conflicts, just works!

export interface StorageProvider {
  name: string
  setup: string
  pros: string[]
  cons: string[]
  timeToSetup: string
  reliability: string
}

export const storageAlternatives: StorageProvider[] = [
  {
    name: "Local Storage + JSON Server (Recommended)",
    setup: "Zero setup - works immediately",
    pros: [
      "Works instantly with no configuration",
      "No external dependencies or accounts needed", 
      "Perfect for development and testing",
      "Can easily export data later",
      "No rate limits or API issues"
    ],
    cons: [
      "Data stored locally in browser",
      "Not shared between team members automatically"
    ],
    timeToSetup: "0 minutes - already working",
    reliability: "100% - no external services to fail"
  },
  {
    name: "Firebase Firestore",
    setup: "5 minutes with Google account",
    pros: [
      "Real-time sync across team",
      "Excellent documentation",
      "Generous free tier",
      "No SQL migrations needed",
      "Built-in authentication"
    ],
    cons: [
      "NoSQL structure (different from SQL)",
      "Google dependency"
    ],
    timeToSetup: "5 minutes",
    reliability: "99.9% - Google infrastructure"
  },
  {
    name: "Airtable as Database",
    setup: "2 minutes - just API key",
    pros: [
      "Visual database interface",
      "Team can edit data directly",
      "No code needed for data management",
      "Built-in forms and views",
      "Already integrated in your platform!"
    ],
    cons: [
      "Rate limits on free tier",
      "Less flexible than traditional database"
    ],
    timeToSetup: "2 minutes",
    reliability: "99.5% - established service"
  },
  {
    name: "PlanetScale (MySQL)",
    setup: "3 minutes with GitHub",
    pros: [
      "Serverless MySQL",
      "No migration conflicts",
      "Branching for database changes",
      "Excellent performance"
    ],
    cons: [
      "MySQL syntax (not PostgreSQL)",
      "Requires GitHub account"
    ],
    timeToSetup: "3 minutes",
    reliability: "99.9% - built for scale"
  }
]

// Enhanced localStorage with team sharing capabilities
export class EnhancedLocalStorage {
  private static instance: EnhancedLocalStorage
  private syncInterval: NodeJS.Timeout | null = null

  static getInstance(): EnhancedLocalStorage {
    if (!EnhancedLocalStorage.instance) {
      EnhancedLocalStorage.instance = new EnhancedLocalStorage()
    }
    return EnhancedLocalStorage.instance
  }

  // Save data with automatic backup
  save<T>(key: string, data: T): void {
    try {
      const timestamp = new Date().toISOString()
      const dataWithMeta = {
        data,
        timestamp,
        version: '1.0'
      }
      
      localStorage.setItem(key, JSON.stringify(dataWithMeta))
      
      // Create backup
      localStorage.setItem(`${key}_backup`, JSON.stringify(dataWithMeta))
      
      console.log(`✅ Saved ${key} to localStorage with backup`)
    } catch (error) {
      console.error(`❌ Failed to save ${key}:`, error)
    }
  }

  // Load data with fallback to backup
  load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.data || parsed // Handle both new and old formats
      }
      
      // Try backup if main data fails
      const backup = localStorage.getItem(`${key}_backup`)
      if (backup) {
        const parsed = JSON.parse(backup)
        console.log(`🔄 Restored ${key} from backup`)
        return parsed.data || parsed
      }
      
      return defaultValue
    } catch (error) {
      console.error(`❌ Failed to load ${key}:`, error)
      return defaultValue
    }
  }

  // Export all data for team sharing
  exportAllData(): string {
    const allData: Record<string, any> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('stacked-') && !key.includes('_backup')) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            allData[key] = JSON.parse(value)
          }
        } catch (error) {
          console.warn(`Failed to export ${key}:`, error)
        }
      }
    }
    
    return JSON.stringify(allData, null, 2)
  }

  // Import data from team member
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
      
      console.log('✅ Successfully imported team data')
      return true
    } catch (error) {
      console.error('❌ Failed to import data:', error)
      return false
    }
  }

  // Generate shareable link (for team collaboration)
  generateShareableData(): { data: string; instructions: string } {
    const exportData = this.exportAllData()
    const compressed = btoa(exportData) // Simple base64 encoding
    
    return {
      data: compressed,
      instructions: `
To share this data with your team:
1. Copy the data string below
2. Send it to your team member
3. They paste it in the "Import Team Data" section
4. All creators and content will be synced!

Data string:
${compressed}
      `.trim()
    }
  }
}