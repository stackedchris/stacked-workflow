'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle2,
  Clock,
  Zap,
  Database,
  Cloud,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Star,
  Users,
  Shield
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { EnhancedLocalStorage } from '@/lib/simple-storage'

const storageOptions = [
  {
    id: 'enhanced-local',
    name: 'Enhanced Local Storage',
    subtitle: 'Recommended - Works Immediately',
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    setup: '0 minutes',
    reliability: '100%',
    cost: 'Free',
    pros: [
      'Works instantly - no setup required',
      'No external dependencies or accounts',
      'Perfect for development and testing', 
      'Can export/import data for team sharing',
      'No rate limits or API failures',
      'Already working in your platform!'
    ],
    cons: [
      'Data stored locally in browser',
      'Manual export/import for team sharing'
    ],
    status: 'ready',
    description: 'Your platform already uses this and it works perfectly! We can enhance it with team sharing features.'
  },
  {
    id: 'firebase',
    name: 'Firebase Firestore',
    subtitle: 'Google\'s Real-time Database',
    icon: <Database className="w-6 h-6 text-orange-500" />,
    setup: '5 minutes',
    reliability: '99.9%',
    cost: 'Free tier generous',
    pros: [
      'Real-time sync across team members',
      'Excellent documentation and support',
      'No SQL migrations or schema conflicts',
      'Built-in authentication system',
      'Scales automatically'
    ],
    cons: [
      'NoSQL structure (different from SQL)',
      'Google account dependency'
    ],
    status: 'recommended',
    description: 'Firebase is incredibly reliable and has zero setup conflicts. Perfect for teams.'
  },
  {
    id: 'airtable-db',
    name: 'Airtable as Database',
    subtitle: 'Visual Database Interface',
    icon: <Users className="w-6 h-6 text-blue-500" />,
    setup: '2 minutes',
    reliability: '99.5%',
    cost: 'Free tier available',
    pros: [
      'Visual database your team can edit directly',
      'No code needed for data management',
      'Built-in forms, views, and collaboration',
      'Already integrated in your platform!',
      'Team can manage data without coding'
    ],
    cons: [
      'Rate limits on free tier',
      'Less flexible than traditional databases'
    ],
    status: 'integrated',
    description: 'You already have Airtable integration! We can use it as your primary database.'
  },
  {
    id: 'planetscale',
    name: 'PlanetScale MySQL',
    subtitle: 'Serverless MySQL Database',
    icon: <Cloud className="w-6 h-6 text-purple-500" />,
    setup: '3 minutes',
    reliability: '99.9%',
    cost: 'Free tier available',
    pros: [
      'Serverless MySQL - no server management',
      'Database branching for safe changes',
      'No migration conflicts like Supabase',
      'Excellent performance and scaling',
      'Simple connection string setup'
    ],
    cons: [
      'MySQL syntax instead of PostgreSQL',
      'Requires GitHub account for signup'
    ],
    status: 'alternative',
    description: 'Built specifically to avoid the migration headaches you\'ve experienced with Supabase.'
  }
]

export default function StorageSetup() {
  const [selectedOption, setSelectedOption] = useState('enhanced-local')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importData, setImportData] = useState('')
  const { success, error } = useToast()

  const storage = EnhancedLocalStorage.getInstance()

  const handleExportData = () => {
    setIsExporting(true)
    try {
      const { data, instructions } = storage.generateShareableData()
      
      // Create downloadable file
      const blob = new Blob([instructions], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stacked-data-export-${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      URL.revokeObjectURL(url)
      
      success('Data exported successfully!', 'Share the downloaded file with your team')
    } catch (err) {
      error('Export failed', 'Please try again')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = () => {
    if (!importData.trim()) {
      error('Please paste the data string first')
      return
    }

    setIsImporting(true)
    try {
      const decodedData = atob(importData.trim())
      const success = storage.importData(decodedData)
      
      if (success) {
        success('Data imported successfully!', 'Refresh the page to see the imported data')
        setImportData('')
      } else {
        error('Import failed', 'Please check the data format')
      }
    } catch (err) {
      error('Import failed', 'Invalid data format')
    } finally {
      setIsImporting(false)
    }
  }

  const selectedStorage = storageOptions.find(opt => opt.id === selectedOption)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Storage Solution</h2>
        <p className="text-gray-600 mt-2">
          Simple, reliable alternatives to Supabase that work immediately
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storageOptions.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedOption === option.id ? 'border-blue-500 shadow-md' : ''
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <div>
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    <CardDescription>{option.subtitle}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={
                    option.status === 'ready' ? 'bg-green-100 text-green-800' :
                    option.status === 'recommended' ? 'bg-blue-100 text-blue-800' :
                    option.status === 'integrated' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {option.status === 'ready' ? '✅ Ready' :
                     option.status === 'recommended' ? '⭐ Recommended' :
                     option.status === 'integrated' ? '🔗 Integrated' :
                     '🔄 Alternative'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{option.description}</p>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="font-medium">Setup:</span>
                  <p className="text-gray-600">{option.setup}</p>
                </div>
                <div>
                  <span className="font-medium">Reliability:</span>
                  <p className="text-gray-600">{option.reliability}</p>
                </div>
                <div>
                  <span className="font-medium">Cost:</span>
                  <p className="text-gray-600">{option.cost}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStorage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedStorage.icon}
              <span>{selectedStorage.name}</span>
            </CardTitle>
            <CardDescription>{selectedStorage.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Pros</h4>
                <ul className="space-y-1">
                  {selectedStorage.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-2">⚠️ Considerations</h4>
                <ul className="space-y-1">
                  {selectedStorage.cons.map((con, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <Clock className="w-3 h-3 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedOption === 'enhanced-local' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🎉 Already Working!</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Your platform is already using enhanced local storage and it's working perfectly! 
                    All your creators and content are saved locally and persist across browser sessions.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-green-900 mb-2">Team Collaboration Features:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Button 
                            onClick={handleExportData}
                            disabled={isExporting}
                            variant="outline"
                            className="w-full"
                          >
                            {isExporting ? (
                              <>
                                <Download className="w-4 h-4 mr-2 animate-pulse" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Export Team Data
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-600 mt-1">
                            Download all your data to share with team members
                          </p>
                        </div>
                        <div>
                          <Button 
                            onClick={() => setIsImporting(!isImporting)}
                            variant="outline"
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Import Team Data
                          </Button>
                          <p className="text-xs text-gray-600 mt-1">
                            Import data shared by a team member
                          </p>
                        </div>
                      </div>
                    </div>

                    {isImporting && (
                      <div className="border-t pt-3">
                        <h5 className="font-medium text-green-900 mb-2">Import Team Data:</h5>
                        <Textarea
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          placeholder="Paste the data string from your team member here..."
                          rows={4}
                          className="mb-2"
                        />
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleImportData}
                            disabled={isImporting || !importData.trim()}
                            size="sm"
                          >
                            {isImporting ? 'Importing...' : 'Import Data'}
                          </Button>
                          <Button 
                            onClick={() => setIsImporting(false)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedOption === 'firebase' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">🚀 Firebase Setup (5 minutes)</h4>
                <ol className="text-sm text-orange-800 space-y-2">
                  <li>1. Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a></li>
                  <li>2. Click "Create a project" → Name it "Stacked Workflow"</li>
                  <li>3. Enable Firestore Database → Start in test mode</li>
                  <li>4. Go to Project Settings → Add web app</li>
                  <li>5. Copy the config and I'll integrate it for you!</li>
                </ol>
                <Button className="mt-3" onClick={() => window.open('https://console.firebase.google.com', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Firebase Console
                </Button>
              </div>
            )}

            {selectedOption === 'airtable-db' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🔗 Use Existing Airtable Integration</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Your platform already has a complete Airtable integration! We can use it as your primary database 
                  instead of just for sync. Your team can manage creators directly in Airtable.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => window.location.href = '/?tab=airtable'}>
                    <Database className="w-4 h-4 mr-2" />
                    Go to Airtable Integration
                  </Button>
                  <p className="text-xs text-blue-700">
                    Set up your Airtable base and use it as your main database - no Supabase needed!
                  </p>
                </div>
              </div>
            )}

            {selectedOption === 'planetscale' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">🌟 PlanetScale Setup (3 minutes)</h4>
                <ol className="text-sm text-purple-800 space-y-2">
                  <li>1. Go to <a href="https://planetscale.com" target="_blank" className="text-blue-600 hover:underline">PlanetScale</a> → Sign up with GitHub</li>
                  <li>2. Create new database → Name it "stacked-workflow"</li>
                  <li>3. Copy the connection string from the dashboard</li>
                  <li>4. I'll set up the integration with zero migration conflicts!</li>
                </ol>
                <Button className="mt-3" onClick={() => window.open('https://planetscale.com', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open PlanetScale
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Recommendation</h4>
        <p className="text-sm text-yellow-800">
          <strong>For immediate use:</strong> Your platform already works perfectly with Enhanced Local Storage! 
          You can start using it right now with your team using the export/import features.
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          <strong>For team collaboration:</strong> Firebase or Airtable are excellent choices that set up in minutes 
          without the migration headaches you experienced with Supabase.
        </p>
      </div>
    </div>
  )
}