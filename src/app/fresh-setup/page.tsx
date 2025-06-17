'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Database, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface SetupResult {
  success: boolean
  step?: string
  error?: string
  solution?: string
  sqlToRun?: string
  data?: any
  message?: string
}

export default function FreshSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)
  const { success, error } = useToast()

  const runFreshSetup = async () => {
    setIsLoading(true)
    setSetupResult(null)

    try {
      console.log('🔄 Running fresh database setup...')
      
      const response = await fetch('/api/supabase/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setSetupResult(result)

      if (result.success) {
        success('Database is ready!', `Found ${result.data?.creatorsCount || 0} creators`)
      } else {
        error('Setup needed', result.error || 'Unknown error')
      }

    } catch (err) {
      console.error('❌ Setup check failed:', err)
      const errorResult = {
        success: false,
        step: 'network',
        error: 'Network error - could not reach Supabase',
        solution: 'Check your internet connection and try again'
      }
      setSetupResult(errorResult)
      error('Network error', 'Could not reach Supabase')
    } finally {
      setIsLoading(false)
    }
  }

  const copySQL = () => {
    if (setupResult?.sqlToRun) {
      navigator.clipboard.writeText(setupResult.sqlToRun)
      success('SQL copied to clipboard', 'Paste this in your Supabase SQL editor')
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/idmgjyhbpizcuptrmrky', '_blank')
  }

  const goToMainApp = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Fresh Supabase Setup</h1>
          <p className="text-gray-600 mt-2">
            Clean database setup to resolve all conflicts and get your platform working
          </p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Database Setup Status</span>
            </CardTitle>
            <CardDescription>
              This will check your database and provide setup instructions if needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <strong>URL:</strong> https://idmgjyhbpizcuptrmrky.supabase.co
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Status:</strong> {setupResult ? (setupResult.success ? '✅ Ready' : '❌ Needs Setup') : '⏳ Not Checked'}
                </p>
              </div>
              <Button 
                onClick={openSupabaseDashboard}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Dashboard
              </Button>
            </div>

            <Button 
              onClick={runFreshSetup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Check Database Status
                </>
              )}
            </Button>

            {setupResult && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {setupResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-medium ${setupResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {setupResult.success ? 'Database Ready!' : 'Setup Required'}
                  </span>
                </div>

                {setupResult.success && setupResult.data && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">✅ Database is Working</h4>
                    <div className="space-y-1 text-sm text-green-800">
                      <p>• Found {setupResult.data.creatorsCount} creators in database</p>
                      <p>• Connection verified and working</p>
                      <p>• Ready for your team to use</p>
                    </div>
                    <Button 
                      onClick={goToMainApp}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                    >
                      🚀 Go to Main App
                    </Button>
                  </div>
                )}

                {!setupResult.success && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Database Setup Needed</h4>
                        <p className="text-sm text-red-800 mt-1">{setupResult.error}</p>
                        
                        {setupResult.solution && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-red-900">Solution:</p>
                            <p className="text-sm text-red-800">{setupResult.solution}</p>
                          </div>
                        )}

                        {setupResult.sqlToRun && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-red-900">🔧 Fresh Setup SQL:</p>
                              <Button
                                onClick={copySQL}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy SQL
                              </Button>
                            </div>
                            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-64">
                              <pre>{setupResult.sqlToRun}</pre>
                            </div>
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-medium text-blue-900 mb-2">📋 Setup Instructions:</p>
                              <ol className="text-xs text-blue-800 space-y-1">
                                <li>1. Click "Open Dashboard" above to go to Supabase</li>
                                <li>2. Go to SQL Editor in the left sidebar</li>
                                <li>3. Click "Copy SQL" above and paste the entire script</li>
                                <li>4. Click "Run" to execute the setup</li>
                                <li>5. Come back here and click "Check Database Status" again</li>
                              </ol>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {setupResult.message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">{setupResult.message}</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">🧹 Fresh Setup Benefits:</p>
              <ul className="space-y-1">
                <li>• Completely clean database with no conflicts</li>
                <li>• Removes all problematic policies and migrations</li>
                <li>• Creates optimized table structure</li>
                <li>• Includes 3 demo creators for immediate testing</li>
                <li>• Resolves all previous setup issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            This fresh setup approach bypasses all migration conflicts and gives you a clean, working database.
          </p>
        </div>
      </div>
    </div>
  )
}