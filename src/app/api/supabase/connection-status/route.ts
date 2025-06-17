import { type NextRequest, NextResponse } from 'next/server'
import { testSupabaseConnection } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const connectionStatus = await testSupabaseConnection()
    
    return NextResponse.json({
      success: true,
      isConnected: connectionStatus.success,
      message: connectionStatus.success 
        ? 'Successfully connected to Supabase' 
        : `Connection failed: ${connectionStatus.error}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to check Supabase connection:', error)
    return NextResponse.json(
      { 
        success: false, 
        isConnected: false,
        error: `Connection check failed: ${(error as Error).message}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}