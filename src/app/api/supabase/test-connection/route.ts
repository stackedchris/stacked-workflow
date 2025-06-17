import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, key } = body

    // Use provided credentials or defaults
    const supabaseUrl = url || 'https://idmgjyhbpizcuptrmrky.supabase.co'
    const supabaseKey = key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWdqeWhicGl6Y3VwdHJta3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MDE4NjI4NiwiZXhwIjoyMDY1NzYyMjg2fQ.5ryQP5WVc4PhUoqXTn0c5CrwBwGjeT7w1NP_OqjRirk'

    console.log('🔍 Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey.substring(0, 20) + '...')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Basic connection
    console.log('Test 1: Basic connection test...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth test failed:', authError)
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError.message}`,
        details: authError
      })
    }

    console.log('✅ Basic connection successful')

    // Test 2: Check if creators table exists
    console.log('Test 2: Checking creators table...')
    const { data: creatorsData, error: creatorsError } = await supabase
      .from('creators')
      .select('count')
      .limit(1)

    if (creatorsError) {
      console.error('❌ Creators table test failed:', creatorsError)
      
      // Check if it's a table not found error
      if (creatorsError.code === 'PGRST116' || creatorsError.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Database tables not found. Please run the database migrations.',
          needsMigration: true,
          details: creatorsError
        })
      }

      return NextResponse.json({
        success: false,
        error: `Database query failed: ${creatorsError.message}`,
        details: creatorsError
      })
    }

    console.log('✅ Creators table accessible')

    // Test 3: Check if content table exists
    console.log('Test 3: Checking content table...')
    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .select('count')
      .limit(1)

    if (contentError) {
      console.error('❌ Content table test failed:', contentError)
      return NextResponse.json({
        success: false,
        error: `Content table access failed: ${contentError.message}`,
        details: contentError
      })
    }

    console.log('✅ Content table accessible')

    // Test 4: Try to get actual data
    console.log('Test 4: Fetching sample data...')
    const { data: sampleCreators, error: sampleError } = await supabase
      .from('creators')
      .select('id, name, category')
      .limit(5)

    if (sampleError) {
      console.error('❌ Sample data fetch failed:', sampleError)
      return NextResponse.json({
        success: false,
        error: `Data fetch failed: ${sampleError.message}`,
        details: sampleError
      })
    }

    console.log('✅ Sample data fetch successful:', sampleCreators?.length || 0, 'creators found')

    return NextResponse.json({
      success: true,
      message: 'Supabase connection fully verified!',
      data: {
        creatorsCount: sampleCreators?.length || 0,
        sampleCreators: sampleCreators || [],
        connectionTime: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Connection test failed with exception:', error)
    return NextResponse.json({
      success: false,
      error: `Connection test failed: ${(error as Error).message}`,
      details: error
    }, { status: 500 })
  }
}

export async function GET() {
  // Quick health check
  return NextResponse.json({
    status: 'ready',
    message: 'Supabase test endpoint is available'
  })
}