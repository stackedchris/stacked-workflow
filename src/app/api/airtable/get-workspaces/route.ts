import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey')

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      )
    }

    console.log('Fetching Airtable workspaces...')

    const response = await fetch('https://api.airtable.com/v0/meta/workspaces', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch workspaces:', errorText)
      
      return NextResponse.json(
        { success: false, error: `Failed to fetch workspaces: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`Found ${data.workspaces?.length || 0} workspaces`)
    
    return NextResponse.json({
      success: true,
      workspaces: data.workspaces || []
    })

  } catch (error) {
    console.error('Failed to get workspaces:', error)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}