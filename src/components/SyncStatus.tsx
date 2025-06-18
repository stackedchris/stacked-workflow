import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { initializeSocket } from '@/lib/socket'

export function SyncStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(1)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket()
    
    // Set up connection status listener
    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }
    
    // Set up user count listener
    const handleUserCount = (count: number) => {
      setUserCount(count)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('users', handleUserCount)
    
    // Set initial connection status
    setIsConnected(socket.connected)

    // Clean up listeners on unmount
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('users', handleUserCount)
    }
  }, [])

  const reconnect = () => {
    setIsChecking(true)
    const socket = initializeSocket()
    socket.connect()
    
    // Reset checking state after a delay
    setTimeout(() => {
      setIsChecking(false)
    }, 2000)
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
        <span>Sync {isConnected ? 'Connected' : 'Disconnected'}</span>
      </Badge>
      
      {isConnected && userCount > 1 && (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center space-x-1 text-xs">
          <Users className="w-3 h-3" />
          <span>{userCount} user{userCount !== 1 ? 's' : ''} online</span>
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