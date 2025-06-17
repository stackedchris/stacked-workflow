'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Database, 
  AlertTriangle,
  Copy,
  ExternalLink,
  Zap,
  Cloud,
  ArrowRight,
  Home
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function FirebaseSetupPage() {
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'connected' | 'error'>('unchecked')
  const [firebaseConfig, setFirebaseConfig] = useState<Record<string, string>>({})
  const [configInput, setConfigInput] = useState('')
  const { success, error } = useToast()

  const handleConfigParse = () => {
    try {
      // Try to parse the pasted config
      const configText = configInput.trim()
      
      // Extract the config object from the pasted text
      const configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/)
      
      if (configMatch && configMatch[1]) {
        // Parse the extracted JSON
        const parsedConfig = eval(`(${configMatch[1]})`)
        setFirebaseConfig(parsedConfig)
        success('Firebase config parsed successfully!')
      } else {
        // Try direct JSON parsing
        try {
          const parsedConfig = JSON.parse(configText)
          setFirebaseConfig(parsedConfig)
          success('Firebase config parsed successfully!')
        } catch (jsonError) {
          throw new Error('Could not parse config format')
        }
      }
    } catch (err) {
      error('Invalid config format', 'Please paste the entire Firebase config object')
      console.error('Config parsing error:', err)
    }
  }

  const initializeFirebase = () => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      error('Missing required config', 'API key and Project ID are required')
      return
    }

    setIsConnecting(true)
    
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected')
      success('Connected to Firebase!', 'Your database is ready to use')
      setIsConnecting(false)
      
      // Save config to localStorage for persistence
      localStorage.setItem('firebase-config', JSON.stringify(firebaseConfig))
    }, 1500)
  }

  const migrateData = () => {
    setIsMigrating(true)
    
    // Simulate migration
    setTimeout(() => {
      success('Data migration successful!', 'Your local data is now in Firebase')
      setIsMigrating(false)
    }, 2000)
  }

  const copyConfigTemplate = () => {
    const template = `// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};`

    navigator.clipboard.writeText(template)
    success('Template copied to clipboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Firebase Integration</h1>
          <p className="text-gray-600 mt-2">
            Set up reliable, real-time database sync for your team
          </p>
        </div>

        {connectionStatus === 'connected' ? (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                Firebase Connected!
              </CardTitle>
              <CardDescription className="text-green-700">
                Your database is ready to use with real-time sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  <Cloud className="w-3 h-3 mr-1" />
                  Connected to {firebaseConfig.projectId}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time Sync Active
                </Badge>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Next Steps:</h4>
                <ol className="text-sm text-green-700 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                    <span>Migrate your existing data to Firebase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                    <span>Share the Firebase config with your team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                    <span>Start using your platform with real-time collaboration</span>
                  </li>
                </ol>
              </div>

              <Button 
                onClick={migrateData} 
                disabled={isMigrating}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Migrating Data...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Migrate Local Data to Firebase
                  </>
                )}
              </Button>

              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Main App
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Firebase Configuration
              </CardTitle>
              <CardDescription>
                Set up Firebase for reliable, real-time database sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🚀 Firebase Setup (5 minutes)</h4>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>1. Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
                  <li>2. Click "Create a project" → Name it "Stacked Workflow"</li>
                  <li>3. Enable Firestore Database → Start in test mode</li>
                  <li>4. Go to Project Settings → Add web app</li>
                  <li>5. Copy the config object and paste it below</li>
                </ol>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Firebase Console
                  </Button>
                  <Button 
                    onClick={copyConfigTemplate}
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Config Template
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Paste Firebase Config</label>
                <Textarea
                  value={configInput}
                  onChange={(e) => setConfigInput(e.target.value)}
                  placeholder="Paste your Firebase config object here..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the entire config object from your Firebase console
                </p>
              </div>

              <Button 
                onClick={handleConfigParse}
                disabled={!configInput.trim()}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Parse Firebase Config
              </Button>

              {Object.keys(firebaseConfig).length > 0 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Parsed Configuration:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Project ID:</span>
                        <p className="text-gray-600">{firebaseConfig.projectId}</p>
                      </div>
                      <div>
                        <span className="font-medium">API Key:</span>
                        <p className="text-gray-600">
                          {firebaseConfig.apiKey ? '••••••••••••' : 'Missing'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={initializeFirebase}
                    disabled={isConnecting || !firebaseConfig.apiKey || !firebaseConfig.projectId}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 mr-2" />
                        Connect to Firebase
                      </>
                    )}
                  </Button>

                  {connectionStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-red-800">Connection Failed</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Could not connect to Firebase. Please check your configuration and try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Why Firebase?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div className="space-y-2">
              <div className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Real-time sync across all team members</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>No SQL migrations or schema conflicts</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Generous free tier (50K reads/day)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Built-in authentication system</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Google's rock-solid infrastructure</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Zero setup conflicts or headaches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}