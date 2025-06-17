import { type NextRequest, NextResponse } from 'next/server'
import { NotionService } from '@/lib/notion'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, creatorsDatabaseId } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const notionService = new NotionService({
      token,
      creatorsDatabaseId: creatorsDatabaseId || '',
    })

    // Test basic connection
    const isConnected = await notionService.testConnection()

    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Notion. Check your token.' },
        { status: 401 }
      )
    }

    // Test database access if provided
    let databaseInfo = null
    if (creatorsDatabaseId) {
      try {
        databaseInfo = await notionService.getDatabaseInfo(creatorsDatabaseId)
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Connected to Notion but cannot access database. Check database ID and permissions.'
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Notion',
      databaseInfo: databaseInfo ? {
        id: databaseInfo.id,
        title: (databaseInfo as any).title?.[0]?.plain_text || 'Untitled',
        properties: Object.keys((databaseInfo as any).properties || {}),
      } : null,
    })

  } catch (error) {
    console.error('Notion connection test failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
