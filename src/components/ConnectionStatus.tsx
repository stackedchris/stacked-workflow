'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionStatusProps {
  isOnline: boolean
  label: string
  className?: string
  onRefresh?: () => void
}

export function ConnectionStatus({ 
  isOnline, 
  label, 
  className = '',
  onRefresh
}: ConnectionStatusProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Auto-hide success status after 5 seconds
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => setIsVisible(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [isOnline])

  if (!isVisible && isOnline) return null

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        className={`
          flex items-center space-x-1 text-xs
          ${isOnline 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-red-100 text-red-800 border-red-200'
          }
          ${className}
        `}
      >
        {isOnline ? (
          <Cloud className="w-3 h-3" />
        ) : (
          <CloudOff className="w-3 h-3" />
        )}
        <span>{label} {isOnline ? 'Online' : 'Offline'}</span>
      </Badge>
      
      {!isOnline && onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={onRefresh}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  )
}

export function SupabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const checkConnection = async () => {
    try {
      setIsChecking(true)
      const response = await fetch('/api/supabase/connection-status')
      const data = await response.json()
      
      setIsConnected(data.isConnected)
      setLastChecked(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Failed to check Supabase connection:', error)
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
        <span>Checking Supabase...</span>
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
        <span>Supabase {isConnected ? 'Connected' : 'Disconnected'}</span>
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
      
      {lastChecked && (
        <span className="text-xs text-gray-500">
          Last checked: {lastChecked}
        </span>
      )}
    </div>
  )
}

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Badge 
      className={`
        flex items-center space-x-1 text-xs
        ${isOnline 
          ? 'bg-blue-100 text-blue-800 border-blue-200' 
          : 'bg-red-100 text-red-800 border-red-200'
        }
      `}
    >
      {isOnline ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span>Network {isOnline ? 'Connected' : 'Disconnected'}</span>
    </Badge>
  )
}