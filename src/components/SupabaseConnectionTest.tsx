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
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface TestResult {
  success: boolean
  step?: string
  error?: string
  solution?: string
  sqlToRun?: string
  data?: any
  message?: string
}

export default function SupabaseConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const { success, error } = useToast()

  const runConnectionTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('🔍 Running Supabase connection test...')
      
      const response = await fetch('/api/supabase/verify-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setTestResult(result)

      if (result.success) {
        success('Supabase connection verified!', `Found ${result.data?.creatorsCount || 0} creators in database`)
      } else {
        error('Connection test failed', result.error || 'Unknown error')
      }

    } catch (err) {
      console.error('❌ Connection test failed:', err)
      const errorResult = {
        success: false,
        step: 'network',
        error: 'Network error - could not reach Supabase',
        solution: 'Check your internet connection and try again'
      }
      setTestResult(errorResult)
      error('Network error', 'Could not reach Supabase')
    } finally {
      setIsLoading(false)
    }
  }

  const copySQL = () => {
    if (testResult?.sqlToRun) {
      navigator.clipboard.writeText(testResult.sqlToRun)
      success('SQL copied to clipboard', 'Paste this in your Supabase SQL editor')
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/idmgjyhbpizcuptrmrky', '_blank')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Supabase Connection Test</span>
        </CardTitle>
        <CardDescription>
          Verify your Supabase database connection and setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              <strong>URL:</strong> https://idmgjyhbpizcuptrmrky.supabase.co
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
          onClick={runConnectionTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Test Supabase Connection
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
              </span>
            </div>

            {testResult.success && testResult.data && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✅ Database Ready</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>• Found {testResult.data.creatorsCount} creators in database</p>
                  <p>• Tables verified: {testResult.data.tablesVerified?.join(', ')}</p>
                  <p>• Row Level Security: {testResult.data.rlsEnabled ? 'Enabled' : 'Disabled'}</p>
                  {testResult.data.sampleDataPopulated && (
                    <p>• Sample data populated for testing</p>
                  )}
                </div>
              </div>
            )}

            {!testResult.success && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Issue Found</h4>
                    <p className="text-sm text-red-800 mt-1">{testResult.error}</p>
                    
                    {testResult.solution && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-900">Solution:</p>
                        <p className="text-sm text-red-800">{testResult.solution}</p>
                      </div>
                    )}

                    {testResult.sqlToRun && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-red-900">Run this SQL in Supabase:</p>
                          <Button
                            onClick={copySQL}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy SQL
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                          {testResult.sqlToRun}
                        </pre>
                        <p className="text-xs text-red-700 mt-2">
                          1. Open your Supabase dashboard → SQL Editor
                          <br />
                          2. Paste the SQL above and run it
                          <br />
                          3. Come back and test the connection again
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {testResult.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{testResult.message}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">What this test checks:</p>
          <ul className="space-y-1">
            <li>• Basic connection to Supabase</li>
            <li>• Database tables exist (creators, content)</li>
            <li>• Row Level Security is configured</li>
            <li>• Sample data is available</li>
            <li>• Read/write permissions work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}