import { NextResponse } from 'next/server'

// Track connected clients (in memory - would use Redis in production)
let connectedClients: Record<string, { lastSeen: number, userAgent: string }> = {}

// Clean up stale clients (inactive for more than 5 minutes)
const cleanupStaleClients = () => {
  const now = Date.now()
  const staleThreshold = 5 * 60 * 1000 // 5 minutes
  
  Object.keys(connectedClients).forEach(clientId => {
    if (now - connectedClients[clientId].lastSeen > staleThreshold) {
      delete connectedClients[clientId]
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, action } = body
    
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    // Clean up stale clients
    cleanupStaleClients()
    
    // Handle client actions
    if (action === 'connect') {
      connectedClients[clientId] = {
        lastSeen: Date.now(),
        userAgent: request.headers.get('user-agent') || 'Unknown'
      }
    } else if (action === 'heartbeat') {
      if (connectedClients[clientId]) {
        connectedClients[clientId].lastSeen = Date.now()
      } else {
        // New client
        connectedClients[clientId] = {
          lastSeen: Date.now(),
          userAgent: request.headers.get('user-agent') || 'Unknown'
        }
      }
    } else if (action === 'disconnect') {
      delete connectedClients[clientId]
    }
    
    return NextResponse.json({
      success: true,
      connectedClients: Object.keys(connectedClients).length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Clean up stale clients
    cleanupStaleClients()
    
    return NextResponse.json({
      success: true,
      connectedClients: Object.keys(connectedClients).length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}