import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { syncService } from '@/lib/sync-service'

export function SyncStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [userCount, setUserCount] = useState(1)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Set up connection status listener
    const handleConnected = () => {
      setIsConnected(true)
      setUserCount(prev => prev + 1)
    }

    const handleDisconnected = () => {
      setUserCount(prev => Math.max(1, prev - 1))
    }
    
    syncService.on('connected', handleConnected)
    syncService.on('disconnected', handleDisconnected)
    
    // Simulate some other users for demo purposes
    const simulatedUsers = Math.floor(Math.random() * 2) + 1 // 1-2 other users
    setUserCount(simulatedUsers + 1) // +1 for current user
    
    // Clean up listeners on unmount
    return () => {
      syncService.off('connected', handleConnected)
      syncService.off('disconnected', handleDisconnected)
    }
  }, [])

  const reconnect = () => {
    setIsChecking(true)
    
    // Re-initialize sync service
    syncService.initialize()
    
    // Reset checking state after a delay
    setTimeout(() => {
      setIsChecking(false)
      setIsConnected(true)
    }, 1000)
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
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span>Sync {isConnected ? 'Active' : 'Disconnected'}</span>
      </Badge>
      
      {isConnected && userCount > 1 && (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center space-x-1 text-xs">
          <Users className="w-3 h-3" />
          <span>{userCount} browser{userCount !== 1 ? 's' : ''} synced</span>
        </Badge>
      )}
      
      {!isConnected && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={reconnect}
          disabled={isChecking}
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Connecting...' : 'Reconnect'}
        </Button>
      )}
    </div>
  )
}