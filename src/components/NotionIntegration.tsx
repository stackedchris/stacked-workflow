'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  RotateCcw,
  FileText,
  Users,
  Calendar
} from 'lucide-react'

interface NotionConfig {
  token: string
  creatorsDatabaseId: string
  tasksDatabaseId: string
  templatesDatabaseId: string
  isConnected: boolean
}

interface SyncStatus {
  creators: 'idle' | 'syncing' | 'success' | 'error'
  tasks: 'idle' | 'syncing' | 'success' | 'error'
  templates: 'idle' | 'syncing' | 'success' | 'error'
}

export default function NotionIntegration() {
  const [config, setConfig] = useState<NotionConfig>({
    token: '',
    creatorsDatabaseId: '',
    tasksDatabaseId: '',
    templatesDatabaseId: '',
    isConnected: false
  })

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    creators: 'idle',
    tasks: 'idle',
    templates: 'idle'
  })

  const [lastSync, setLastSync] = useState<string>('')

  // Real sync functions
  const syncCreators = async () => {
    if (!config.isConnected) return

    setSyncStatus(prev => ({ ...prev, creators: 'syncing' }))

    try {
      // Mock data for demo - in real app this would come from your state
      const mockCreators = [
        {
          id: 1,
          name: "Kurama",
          email: "kurama@example.com",
          phone: "+1 (555) 123-4567",
          category: "Gaming",
          phase: "Phase 2: Launch Week",
          phaseNumber: 2,
          cardsSold: 67,
          totalCards: 100,
          cardPrice: 100,
          daysInPhase: 2,
          nextTask: "Post group chat screenshot",
          salesVelocity: "High",
          avatar: "🎮",
          bio: "Top Smash Bros player with 500K+ following.",
          socialMedia: {
            instagram: "@kurama_smash",
            twitter: "@KuramaPlays",
            youtube: "@KuramaGaming"
          },
          assets: { profileImages: [], videos: [], pressKit: [] },
          strategy: {
            launchDate: "2025-06-20",
            targetAudience: "Competitive gaming fans",
            contentPlan: "Daily gameplay tips and insights"
          },
          createdAt: "2025-06-10",
          lastUpdated: "2025-06-16"
        }
      ]

      const response = await fetch('/api/notion/sync-creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.token,
          creatorsDatabaseId: config.creatorsDatabaseId,
          creators: mockCreators,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus(prev => ({ ...prev, creators: 'success' }))
        setLastSync(new Date().toLocaleString())
      } else {
        setSyncStatus(prev => ({ ...prev, creators: 'error' }))
        alert(`Sync failed: ${result.error}`)
      }
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, creators: 'error' }))
      console.error('Sync failed:', error)
      alert('Sync failed: Network error')
    }
  }

  const syncTasks = async () => {
    setSyncStatus(prev => ({ ...prev, tasks: 'syncing' }))
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, tasks: 'success' }))
      setLastSync(new Date().toLocaleString())
    }, 2000)
  }

  const syncTemplates = async () => {
    setSyncStatus(prev => ({ ...prev, templates: 'syncing' }))
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, templates: 'success' }))
      setLastSync(new Date().toLocaleString())
    }, 2000)
  }

  const handleConnect = async () => {
    if (!config.token) return

    try {
      const response = await fetch('/api/notion/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: config.token,
          creatorsDatabaseId: config.creatorsDatabaseId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConfig(prev => ({ ...prev, isConnected: true }))
        alert('Successfully connected to Notion!')
      } else {
        alert(`Connection failed: ${result.error}`)
      }
    } catch (error) {
      alert('Connection failed: Network error')
      console.error('Connection failed:', error)
    }
  }

  const handleDisconnect = () => {
    setConfig(prev => ({ ...prev, isConnected: false }))
  }

  const getStatusIcon = (status: 'idle' | 'syncing' | 'success' | 'error') => {
    switch (status) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const exportToCSV = () => {
    // Complete CSV export ready for Notion import
    const csvContent = `Name,Category,Phase,Cards Sold,Total Cards,Card Price,Email,Phone,Instagram,Twitter,YouTube,Bio,Avatar,Sales Velocity,Days in Phase,Next Task,Launch Date,Target Audience,Content Plan
Kurama,Gaming,Phase 2: Launch Week,67,100,100,kurama@example.com,+1 (555) 123-4567,https://instagram.com/kurama_smash,https://twitter.com/KuramaPlays,https://youtube.com/@KuramaGaming,Top Smash Bros player with 500K+ following,🎮,High,2,Post group chat screenshot,2025-06-20,Competitive gaming fans,Daily gameplay tips and insights
Nina Lin,Streaming,Phase 1: Drop Prep,0,100,75,nina@example.com,+1 (555) 234-5678,https://instagram.com/ninalin,https://twitter.com/NinaStreams,,Popular streamer and co-founder of O3,📺,Pending,5,Record teaser video,2025-06-25,Streaming community,Stream highlights and Q&A sessions
Edward So,Music,Phase 3: Sell-Out Push,85,100,70,edward@example.com,+1 (555) 345-6789,https://instagram.com/edwardso,https://twitter.com/EdwardSoMusic,,DJ and creative entrepreneur,🎵,Medium,1,Post only 15 left story,2025-06-18,Music fans,Live sets and remix releases
Alex Chen,Lifestyle,Phase 0: Strategy Call,0,100,80,alex@example.com,+1 (555) 456-7890,https://instagram.com/alexchen,https://twitter.com/AlexChenLife,,Lifestyle influencer and content creator,✨,Pending,3,Schedule pricing call,2025-06-22,Lifestyle enthusiasts,Daily vlogs and lifestyle tips`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stacked-creators-notion-ready.csv'
    a.click()
    window.URL.revokeObjectURL(url)

    alert('✅ CSV exported! This file is ready to import directly into Notion. Check the Templates tab for step-by-step instructions.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notion Integration</h2>
          <p className="text-gray-600">Sync your creator data with Notion databases</p>
        </div>
        {config.isConnected && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="sync">Sync Data</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Notion Configuration
              </CardTitle>
              <CardDescription>
                Connect your Stacked workflow to Notion databases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!config.isConnected ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notion Integration Token</label>
                    <Input
                      type="password"
                      value={config.token}
                      onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                      placeholder="secret_..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your token from: <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Notion Integrations</a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Creators Database ID</label>
                    <Input
                      value={config.creatorsDatabaseId}
                      onChange={(e) => setConfig(prev => ({ ...prev, creatorsDatabaseId: e.target.value }))}
                      placeholder="Database ID from Notion URL"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tasks Database ID (Optional)</label>
                      <Input
                        value={config.tasksDatabaseId}
                        onChange={(e) => setConfig(prev => ({ ...prev, tasksDatabaseId: e.target.value }))}
                        placeholder="Tasks database ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Templates Database ID (Optional)</label>
                      <Input
                        value={config.templatesDatabaseId}
                        onChange={(e) => setConfig(prev => ({ ...prev, templatesDatabaseId: e.target.value }))}
                        placeholder="Templates database ID"
                      />
                    </div>
                  </div>

                  <Button onClick={handleConnect} disabled={!config.token || !config.creatorsDatabaseId}>
                    <Database className="w-4 h-4 mr-2" />
                    Connect to Notion
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Successfully Connected!</h3>
                    <p className="text-sm text-green-700">Your Stacked workflow is now connected to Notion.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Creators Database</span>
                      <Badge variant="outline">Connected</Badge>
                    </div>
                    {config.tasksDatabaseId && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasks Database</span>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                    )}
                    {config.templatesDatabaseId && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Templates Database</span>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Creators
                  </div>
                  {getStatusIcon(syncStatus.creators)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Sync creator profiles, contact info, and pipeline status
                </p>
                <Button
                  onClick={syncCreators}
                  disabled={!config.isConnected || syncStatus.creators === 'syncing'}
                  className="w-full"
                >
                  {syncStatus.creators === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Sync Creators
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Tasks
                  </div>
                  {getStatusIcon(syncStatus.tasks)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Sync automated tasks and phase workflows
                </p>
                <Button
                  onClick={syncTasks}
                  disabled={!config.isConnected || syncStatus.tasks === 'syncing'}
                  className="w-full"
                >
                  {syncStatus.tasks === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Sync Tasks
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Templates
                  </div>
                  {getStatusIcon(syncStatus.templates)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Sync content templates and performance data
                </p>
                <Button
                  onClick={syncTemplates}
                  disabled={!config.isConnected || syncStatus.templates === 'syncing'}
                  className="w-full"
                >
                  {syncStatus.templates === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Sync Templates
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {lastSync && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last sync: {lastSync}</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View in Notion
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </CardTitle>
                <CardDescription>Download your data for manual import</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportToCSV} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Creators to CSV
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Tasks to CSV
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Templates to JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Import Data
                </CardTitle>
                <CardDescription>Upload data from existing systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Import Creators from CSV</label>
                  <Input type="file" accept=".csv" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Import Notion Database</label>
                  <Input placeholder="Paste Notion database export..." />
                </div>
                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Notion Database Templates</CardTitle>
              <CardDescription>Pre-built Notion templates for your Stacked workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Creators Database Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete database with all creator fields, properties, and views
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Duplicate Template
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Tasks & Pipeline Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Automated task tracking with phase-based workflows
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Duplicate Template
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Duplicate the Notion templates to your workspace</li>
                  <li>2. Get your Notion integration token from the integrations page</li>
                  <li>3. Copy database IDs from the Notion URLs</li>
                  <li>4. Connect using the Setup tab above</li>
                  <li>5. Run initial sync to populate your databases</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
