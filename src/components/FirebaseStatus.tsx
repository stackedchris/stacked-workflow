'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { firebaseService } from '@/lib/firebase'

export function FirebaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const checkConnection = async () => {
    try {
      setIsChecking(true)
      
      // Check if Firebase is initialized
      try {
        const connected = await firebaseService.testConnection()
        setIsConnected(connected)
      } catch (err) {
        // Not initialized
        setIsConnected(false)
      }
      
      setLastChecked(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Failed to check Firebase connection:', error)
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
    
    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isConnected === null) {
    return (
      <Badge className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-800 border-gray-200">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Checking Firebase...</span>
      </Badge>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        className={`
          flex items-center space-x-1 text-xs
          ${isConnected 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'
          }
        `}
      >
        {isConnected ? (
          <Cloud className="w-3 h-3" />
        ) : (
          <CloudOff className="w-3 h-3" />
        )}
        <span>Firebase {isConnected ? 'Connected' : 'Disconnected'}</span>
      </Badge>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="h-6 px-2 text-xs"
        onClick={checkConnection}
        disabled={isChecking}
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Checking...' : 'Check'}
      </Button>
      
      {!isConnected && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={() => window.location.href = '/firebase-setup'}
        >
          Setup
        </Button>
      )}
      
      {lastChecked && (
        <span className="text-xs text-gray-500">
          Last checked: {lastChecked}
        </span>
      )}
    </div>
  )
}