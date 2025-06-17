'use client'

import { useState, useEffect } from 'react'
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
  Calendar,
  Table,
  Copy,
  Sparkles,
  Zap,
  Rocket
} from 'lucide-react'
import { AirtableService } from '@/lib/airtable'

interface AirtableConfig {
  apiKey: string
  baseId: string
  tableName: string
  isConnected: boolean
}

interface SyncStatus {
  creators: 'idle' | 'syncing' | 'success' | 'error'
  content: 'idle' | 'syncing' | 'success' | 'error'
}

interface AirtableIntegrationProps {
  creators?: any[]
  content?: any[]
  autoSync?: boolean
  onSyncComplete?: (success: boolean) => void
}

interface Workspace {
  id: string
  name: string
}

export default function AirtableIntegration({
  creators = [],
  content = [],
  autoSync = false,
  onSyncComplete
}: AirtableIntegrationProps) {
  const [config, setConfig] = useState<AirtableConfig>({
    apiKey: '',
    baseId: '',
    tableName: 'Creators',
    isConnected: false
  })

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    creators: 'idle',
    content: 'idle'
  })

  const [lastSync, setLastSync] = useState<string>('')
  const [syncCount, setSyncCount] = useState(0)
  
  // Auto-template creation state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState('')
  const [baseName, setBaseName] = useState('Stacked Creator Pipeline')
  const [isCreatingBase, setIsCreatingBase] = useState(false)
  const [creationProgress, setCreationProgress] = useState('')

  // Auto-sync when enabled and data changes
  useEffect(() => {
    if (autoSync && config.isConnected && (creators.length > 0 || content.length > 0)) {
      const autoSyncInterval = setInterval(() => {
        syncAllData(true) // true indicates this is an auto-sync
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(autoSyncInterval)
    }
  }, [autoSync, config.isConnected, creators, content])

  // Load workspaces when API key is provided
  const loadWorkspaces = async (apiKey: string) => {
    try {
      const response = await fetch(`/api/airtable/get-workspaces?apiKey=${encodeURIComponent(apiKey)}`)
      const result = await response.json()
      
      if (result.success) {
        setWorkspaces(result.workspaces)
        if (result.workspaces.length > 0) {
          setSelectedWorkspace(result.workspaces[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    }
  }

  // Auto-create Airtable base with template
  const handleAutoCreateBase = async () => {
    if (!config.apiKey || !selectedWorkspace || !baseName) {
      alert('Please provide API key, select workspace, and enter base name')
      return
    }

    setIsCreatingBase(true)
    setCreationProgress('Creating Airtable base...')

    try {
      const response = await fetch('/api/airtable/create-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          workspaceId: selectedWorkspace,
          baseName: baseName,
          creators: creators
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCreationProgress('Base created successfully!')
        
        // Auto-connect to the new base
        setConfig(prev => ({
          ...prev,
          baseId: result.baseId,
          isConnected: true
        }))

        alert(`🎉 Success! Your Airtable base "${baseName}" has been created with:

✅ Complete field structure (${creators.length > 0 ? '26+' : '22'} fields)
✅ All creator data imported (${result.recordsCreated} records)
✅ Pre-configured views (Pipeline, Revenue, Calendar, etc.)
✅ Formula fields (Revenue, Progress %)
✅ Proper field types and validation

🔗 View your base: ${result.baseUrl}

The platform is now automatically connected to your new base!`)

        setLastSync(new Date().toLocaleString())
        setSyncCount(1)
      } else {
        alert(`❌ Failed to create base: ${result.error}`)
      }
    } catch (error) {
      console.error('Base creation failed:', error)
      alert('❌ Base creation failed: Network error')
    } finally {
      setIsCreatingBase(false)
      setCreationProgress('')
    }
  }

  const handleConnect = async () => {
    if (!config.apiKey || !config.baseId || !config.tableName) return

    try {
      const response = await fetch('/api/airtable/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          baseId: config.baseId,
          tableName: config.tableName,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConfig(prev => ({ ...prev, isConnected: true }))
        alert('✅ Successfully connected to Airtable!')

        // Initial sync after connection
        if (creators.length > 0) {
          setTimeout(() => syncCreators(), 1000)
        }
      } else {
        alert(`❌ Connection failed: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Connection failed: Network error')
      console.error('Connection failed:', error)
    }
  }

  const handleTestMode = () => {
    // Simulate successful connection for demo purposes
    setConfig(prev => ({ ...prev, isConnected: true, apiKey: 'demo-key', baseId: 'demo-base', tableName: 'Creators' }))
    setSyncStatus({ creators: 'success', content: 'success' })
    setLastSync(new Date().toLocaleString())
    setSyncCount(3)
    alert('✅ Demo mode activated! This simulates a successful Airtable connection.\n\nIn demo mode you can:\n• Test the UI/UX flow\n• Export CSV data\n• Copy templates\n• See sync indicators\n\nFor real integration, use your actual Airtable credentials.')
  }

  const handleDisconnect = () => {
    setConfig(prev => ({ ...prev, isConnected: false }))
    setLastSync('')
    setSyncCount(0)
  }

  const syncCreators = async (isAutoSync = false) => {
    if (!config.isConnected) return

    setSyncStatus(prev => ({ ...prev, creators: 'syncing' }))

    try {
      const response = await fetch('/api/airtable/sync-creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          baseId: config.baseId,
          tableName: config.tableName,
          creators: creators,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus(prev => ({ ...prev, creators: 'success' }))
        const now = new Date().toLocaleString()
        setLastSync(now)
        setSyncCount(prev => prev + 1)

        onSyncComplete?.(true)

        if (!isAutoSync) {
          alert(`✅ Successfully synced ${result.syncedCount} creators to Airtable!`)
        }
      } else {
        setSyncStatus(prev => ({ ...prev, creators: 'error' }))
        onSyncComplete?.(false)

        if (!isAutoSync) {
          alert(`❌ Sync failed: ${result.error}`)
        }
      }
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, creators: 'error' }))
      onSyncComplete?.(false)
      console.error('Sync failed:', error)

      if (!isAutoSync) {
        alert('❌ Sync failed: Network error')
      }
    }
  }

  const syncContent = async (isAutoSync = false) => {
    if (!config.isConnected) return

    setSyncStatus(prev => ({ ...prev, content: 'syncing' }))

    try {
      const response = await fetch('/api/airtable/sync-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          baseId: config.baseId,
          tableName: 'Content', // Use separate table for content
          content: content,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus(prev => ({ ...prev, content: 'success' }))
        if (!isAutoSync) {
          alert(`✅ Successfully synced ${result.syncedCount} content items to Airtable!`)
        }
      } else {
        setSyncStatus(prev => ({ ...prev, content: 'error' }))
        if (!isAutoSync) {
          alert(`❌ Content sync failed: ${result.error}`)
        }
      }
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, content: 'error' }))
      console.error('Content sync failed:', error)
      if (!isAutoSync) {
        alert('❌ Content sync failed: Network error')
      }
    }
  }

  const syncAllData = async (isAutoSync = false) => {
    if (creators.length > 0) {
      await syncCreators(isAutoSync)
    }
    if (content.length > 0) {
      await syncContent(isAutoSync)
    }
  }

  const exportToCSV = () => {
    console.log('Export CSV clicked - creators:', creators, 'length:', creators?.length)

    // Check if we have creators to export
    if (!creators || creators.length === 0) {
      console.log('No creators found for export')
      alert('No creators to export. Please add some creators first.')
      return
    }

    try {
      console.log('Calling AirtableService.exportToCSV with creators:', creators)
      const csvContent = AirtableService.exportToCSV(creators)
      console.log('CSV content generated:', csvContent.length, 'characters')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stacked-creators-${new Date().toISOString().split('T')[0]}.csv`

      console.log('Triggering download...')
      a.click()
      window.URL.revokeObjectURL(url)
      alert('✅ CSV exported! This file is ready to import directly into Airtable.')
    } catch (error) {
      console.error('Export failed:', error)
      alert('❌ Export failed. Please try again or check the console for errors.')
    }
  }

  const copyTemplate = () => {
    const template = AirtableService.getAirtableBaseTemplate()
    navigator.clipboard.writeText(template)
    alert('✅ Airtable template copied to clipboard!')
  }

  const getStatusIcon = (status: 'idle' | 'syncing' | 'success' | 'error') => {
    switch (status) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const exportCompleteSetup = () => {
    console.log('Exporting complete Airtable setup package...')

    if (!creators || creators.length === 0) {
      alert('No creators to export. Please add some creators first.')
      return
    }

    try {
      // Generate complete setup package
      const setupPackage = AirtableService.generateCompleteSetupPackage(creators, content)

      // Download setup script
      const setupBlob = new Blob([setupPackage.setupScript], { type: 'text/markdown' })
      const setupUrl = window.URL.createObjectURL(setupBlob)
      const setupLink = document.createElement('a')
      setupLink.href = setupUrl
      setupLink.download = 'airtable-setup-script.md'
      setupLink.click()
      window.URL.revokeObjectURL(setupUrl)

      // Download creators CSV
      const creatorsBlob = new Blob([setupPackage.creatorsCSV], { type: 'text/csv' })
      const creatorsUrl = window.URL.createObjectURL(creatorsBlob)
      const creatorsLink = document.createElement('a')
      creatorsLink.href = creatorsUrl
      creatorsLink.download = `stacked-creators-${new Date().toISOString().split('T')[0]}.csv`
      creatorsLink.click()
      window.URL.revokeObjectURL(creatorsUrl)

      // Download content CSV if available
      if (content && content.length > 0) {
        const contentBlob = new Blob([setupPackage.contentCSV], { type: 'text/csv' })
        const contentUrl = window.URL.createObjectURL(contentBlob)
        const contentLink = document.createElement('a')
        contentLink.href = contentUrl
        contentLink.download = `stacked-content-${new Date().toISOString().split('T')[0]}.csv`
        contentLink.click()
        window.URL.revokeObjectURL(contentUrl)
      }

      // Download quick start guide
      const guideBlob = new Blob([setupPackage.quickStartGuide], { type: 'text/markdown' })
      const guideUrl = window.URL.createObjectURL(guideBlob)
      const guideLink = document.createElement('a')
      guideLink.href = guideUrl
      guideLink.download = 'airtable-quick-start.md'
      guideLink.click()
      window.URL.revokeObjectURL(guideUrl)

      alert(`🎉 Complete Airtable Setup Package Downloaded!

📦 Package includes:
• Setup Script - Complete field configurations
• Creators CSV - ${creators.length} creators ready for import
${content?.length ? `• Content CSV - ${content.length} items ready for import` : ''}
• Quick Start Guide - 5-minute setup instructions

📋 Next Steps:
1. Create new Airtable base
2. Import the CSV files (auto-creates structure!)
3. Follow setup script for views/formulas
4. Connect platform with your Base ID
5. Start syncing!

⏱️ Total setup time: ~5 minutes`)

    } catch (error) {
      console.error('Export failed:', error)
      alert('❌ Export failed. Please try again or check the console for errors.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Airtable Integration</h2>
          <p className="text-gray-600">Automatic sync with Airtable database</p>
        </div>
        <div className="flex items-center space-x-3">
          {autoSync && config.isConnected && (
            <Badge className="bg-blue-100 text-blue-800">
              <RefreshCw className="w-3 h-3 mr-1" />
              Auto-sync Enabled
            </Badge>
          )}
          {config.isConnected && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Connection Status Card */}
      {config.isConnected && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">Airtable Connected</h3>
                <p className="text-sm text-green-700">
                  {syncCount > 0 ? `${syncCount} syncs completed` : 'Ready to sync'} •
                  {autoSync ? ' Auto-sync every 5 minutes' : ' Manual sync only'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => syncCreators()}
                  disabled={syncStatus.creators === 'syncing'}
                  size="sm"
                >
                  {syncStatus.creators === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync Now
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="sm"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={config.isConnected ? "sync" : "auto-create"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="auto-create" className="text-sm">🚀 Auto-Create</TabsTrigger>
          <TabsTrigger value="setup" className="text-sm">Setup</TabsTrigger>
          <TabsTrigger value="sync" className="text-sm">Sync Data</TabsTrigger>
          <TabsTrigger value="export" className="text-sm">Export/Import</TabsTrigger>
          <TabsTrigger value="template" className="text-sm">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="auto-create">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Sparkles className="w-6 h-6 mr-2" />
                🚀 Auto-Create Airtable Base with Template
              </CardTitle>
              <CardDescription className="text-blue-700">
                Automatically create a complete Airtable base with all fields, views, formulas, and your creator data!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">✨ What This Creates:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <strong>📊 Complete Database Structure:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• 26+ properly typed fields</li>
                      <li>• Formula fields (Revenue, Progress %)</li>
                      <li>• Select options with colors</li>
                      <li>• URL, email, phone validation</li>
                    </ul>
                  </div>
                  <div>
                    <strong>🎯 Pre-configured Views:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Pipeline Dashboard (grouped by phase)</li>
                      <li>• Revenue Tracking (by category)</li>
                      <li>• High Priority (urgent creators)</li>
                      <li>• Launch Calendar (timeline view)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-700">
                  <strong>⚡ Result:</strong> Professional database ready in 30 seconds with {creators.length} creators imported!
                </div>
              </div>

              {!config.isConnected && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Airtable API Key *</label>
                    <Input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, apiKey: e.target.value }))
                        if (e.target.value.length > 10) {
                          loadWorkspaces(e.target.value)
                        }
                      }}
                      placeholder="pat..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from: <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Airtable Developer Hub</a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Workspace *</label>
                    <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {workspaces.length === 0 ? 'Enter API key to load workspaces' : `${workspaces.length} workspace(s) available`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Base Name *</label>
                    <Input
                      value={baseName}
                      onChange={(e) => setBaseName(e.target.value)}
                      placeholder="Stacked Creator Pipeline"
                    />
                  </div>

                  <Button 
                    onClick={handleAutoCreateBase}
                    disabled={!config.apiKey || !selectedWorkspace || !baseName || isCreatingBase}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    size="lg"
                  >
                    {isCreatingBase ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {creationProgress || 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        🚀 Create Complete Airtable Base ({creators.length} creators)
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Or use manual setup below</p>
                    <Button variant="outline" onClick={handleTestMode}>
                      <Zap className="w-4 h-4 mr-2" />
                      Demo Mode (Test Without API)
                    </Button>
                  </div>
                </div>
              )}

              {config.isConnected && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Base Connected Successfully!</h3>
                  <p className="text-green-700 mb-4">Your Airtable base is ready and syncing.</p>
                  <Button onClick={() => window.open(`https://airtable.com/${config.baseId}`, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Airtable Base
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Manual Airtable Configuration
              </CardTitle>
              <CardDescription>
                Connect to an existing Airtable base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!config.isConnected ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Airtable API Key</label>
                    <Input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="pat..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from: <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Airtable Developer Hub</a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Base ID</label>
                    <Input
                      value={config.baseId}
                      onChange={(e) => setConfig(prev => ({ ...prev, baseId: e.target.value }))}
                      placeholder="app..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find in your base URL: airtable.com/app[BASE_ID]/...
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Table Name</label>
                    <Input
                      value={config.tableName}
                      onChange={(e) => setConfig(prev => ({ ...prev, tableName: e.target.value }))}
                      placeholder="Creators"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Name of the table in your Airtable base
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={handleConnect} disabled={!config.apiKey || !config.baseId || !config.tableName}>
                      <Database className="w-4 h-4 mr-2" />
                      Connect to Airtable
                    </Button>
                    <Button variant="outline" onClick={handleTestMode}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Demo Mode
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use <strong>Demo Mode</strong> to test the integration interface without real Airtable credentials,
                    or enter your actual credentials above for live sync.
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Successfully Connected!</h3>
                    <p className="text-sm text-green-700">Your Stacked workflow is now connected to Airtable.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Base ID</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{config.baseId}</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Table Name</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{config.tableName}</code>
                    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Sync Creators
                  </div>
                  {getStatusIcon(syncStatus.creators)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Sync creator profiles, contact info, pipeline status, and performance data to Airtable.
                  Currently {creators.length} creators available to sync.
                </p>
                <Button
                  onClick={() => syncCreators()}
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
                      Sync {creators.length} Creators to Airtable
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
                    Sync Content
                  </div>
                  {getStatusIcon(syncStatus.content)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Sync content items, schedules, assignments, and status to Airtable.
                  Currently {content.length} content items available to sync.
                </p>
                <Button
                  onClick={() => syncContent()}
                  disabled={!config.isConnected || syncStatus.content === 'syncing'}
                  className="w-full"
                >
                  {syncStatus.content === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Sync {content.length} Content Items to Airtable
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sync All Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Sync both creators and content data to Airtable in one operation.
                </p>
                <Button
                  onClick={() => syncAllData()}
                  disabled={!config.isConnected || syncStatus.creators === 'syncing' || syncStatus.content === 'syncing'}
                  className="w-full"
                  size="lg"
                >
                  {(syncStatus.creators === 'syncing' || syncStatus.content === 'syncing') ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing All Data...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Sync All Data to Airtable
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total syncs:</span>
                  <span className="font-medium">{syncCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last sync:</span>
                  <span className="font-medium">{lastSync || 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Auto-sync:</span>
                  <span className="font-medium">{autoSync ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Creators status:</span>
                  <Badge className={
                    syncStatus.creators === 'success' ? 'bg-green-100 text-green-800' :
                    syncStatus.creators === 'error' ? 'bg-red-100 text-red-800' :
                    syncStatus.creators === 'syncing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {syncStatus.creators === 'success' ? 'Success' :
                     syncStatus.creators === 'error' ? 'Error' :
                     syncStatus.creators === 'syncing' ? 'Syncing' : 'Ready'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Content status:</span>
                  <Badge className={
                    syncStatus.content === 'success' ? 'bg-green-100 text-green-800' :
                    syncStatus.content === 'error' ? 'bg-red-100 text-red-800' :
                    syncStatus.content === 'syncing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {syncStatus.content === 'success' ? 'Success' :
                     syncStatus.content === 'error' ? 'Error' :
                     syncStatus.content === 'syncing' ? 'Syncing' : 'Ready'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Download className="w-5 h-5 mr-2" />
                  Complete Airtable Setup Package
                </CardTitle>
                <CardDescription className="text-blue-700">
                  One-click download of everything needed for perfect Airtable setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportCompleteSetup} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  🚀 Download Complete Setup Package
                </Button>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">📦 Package Includes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 📋 Setup Script - Exact field configurations for {creators.length} creators</li>
                    <li>• 📊 Creators CSV - Ready for one-click import</li>
                    {content?.length > 0 && <li>• 📁 Content CSV - {content.length} content items</li>}
                    <li>• 🚀 Quick Start Guide - 5-minute setup instructions</li>
                    <li>• 🔧 Pre-configured views and formulas</li>
                  </ul>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-700">
                    <strong>⏱️ Total setup time:</strong> ~5 minutes | <strong>🎯 Result:</strong> Professional database with real-time sync
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Individual Exports
                </CardTitle>
                <CardDescription>Download individual data files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportToCSV} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export {creators.length} Creators to CSV
                </Button>
                <p className="text-xs text-gray-500">
                  CSV format ready for direct import into Airtable with all fields mapped correctly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Import Guide
                </CardTitle>
                <CardDescription>How to import data into Airtable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p><strong>1.</strong> Create a new base in Airtable</p>
                  <p><strong>2.</strong> Use the template from the Template tab</p>
                  <p><strong>3.</strong> Import CSV: Base menu → "Import data" → "CSV file"</p>
                  <p><strong>4.</strong> Map fields automatically</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="w-5 h-5 mr-2" />
                Airtable Base Template
              </CardTitle>
              <CardDescription>
                Complete base structure for your Stacked workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Quick Setup</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Create a new base in Airtable</li>
                  <li>2. Copy the template structure below</li>
                  <li>3. Set up fields as specified in the template</li>
                  <li>4. Import your CSV data or use API sync</li>
                  <li>5. Create views for dashboard, pipeline, revenue tracking</li>
                </ol>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important for Sync</h4>
                <p className="text-sm text-yellow-800 mb-2">
                  The sync will only work with fields that exist in your Airtable table. At minimum, you need:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>Name</strong> (Single line text) - Required for creators</li>
                  <li>• <strong>Category</strong> (Single select or text) - Required for creators</li>
                  <li>• <strong>Phase</strong> (Single select or text) - For creator pipeline tracking</li>
                  <li>• Add more fields from the template below as needed</li>
                </ul>
                <p className="text-sm text-yellow-800 mt-2">
                  The sync will automatically skip fields that don't exist in your table.
                </p>
              </div>

              <div className="space-y-4">
                <Button onClick={copyTemplate} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Base Template
                </Button>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Fields to Create:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Basic Info:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• Name (Single line text)</li>
                        <li>• Email (Email)</li>
                        <li>• Phone (Phone number)</li>
                        <li>• Category (Single select)</li>
                        <li>• Bio (Long text)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Pipeline:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600">
                        <li>• Phase (Single select)</li>
                        <li>• Cards Sold (Number)</li>
                        <li>• Card Price (Currency)</li>
                        <li>• Sales Velocity (Single select)</li>
                        <li>• Revenue (Formula)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Recommended Views for Creators Table:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Pipeline Dashboard:</strong> Group by Phase, sort by Days in Phase</li>
                    <li>• <strong>Revenue Tracking:</strong> Group by Category, sort by Revenue</li>
                    <li>• <strong>High Priority:</strong> Filter for Low velocity or >7 days in phase</li>
                    <li>• <strong>Launch Calendar:</strong> Calendar view by Launch Date</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-2">Content Table Setup (Optional):</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a separate table called "Content" for content management sync:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Name</strong> (Single line text) - Content title</li>
                    <li>• <strong>Type</strong> (Single select): image, video, document</li>
                    <li>• <strong>Category</strong> (Single select): profile, promotional, etc.</li>
                    <li>• <strong>Status</strong> (Single select): draft, scheduled, posted</li>
                    <li>• <strong>Creator ID</strong> (Number) - Links to creator</li>
                    <li>• <strong>Priority</strong> (Single select): low, medium, high</li>
                    <li>• <strong>Scheduled Date</strong> (Date & time)</li>
                    <li>• <strong>Posted Date</strong> (Date & time)</li>
                    <li>• <strong>Notes</strong> (Long text)</li>
                    <li>• <strong>Tags</strong> (Single line text)</li>
                    <li>• <strong>Description</strong> (Long text)</li>
                    <li>• <strong>Upload Date</strong> (Date)</li>
                    <li>• <strong>File Size</strong> (Number)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}