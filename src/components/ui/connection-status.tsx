'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react'

interface ConnectionStatusProps {
  isOnline: boolean
  label: string
  className?: string
}

export function ConnectionStatus({ isOnline, label, className = '' }: ConnectionStatusProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Auto-hide success status after 3 seconds
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [isOnline])

  if (!isVisible && isOnline) return null

  return (
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
  )
}

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

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