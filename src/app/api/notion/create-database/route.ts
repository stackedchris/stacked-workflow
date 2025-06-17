import { type NextRequest, NextResponse } from 'next/server'
import { NotionService } from '@/lib/notion'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, parentPageId } = body

    if (!token || !parentPageId) {
      return NextResponse.json(
        { success: false, error: 'Token and parent page ID are required' },
        { status: 400 }
      )
    }

    const notionService = new NotionService({
      token,
      creatorsDatabaseId: '', // Will be created
    })

    // Test connection first
    const isConnected = await notionService.testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Notion' },
        { status: 401 }
      )
    }

    // Create the creators database
    const databaseId = await notionService.createCreatorsDatabase(parentPageId)

    return NextResponse.json({
      success: true,
      message: 'Successfully created Stacked Creators database',
      databaseId,
      notionUrl: `https://notion.so/${databaseId.replace(/-/g, '')}`,
    })

  } catch (error) {
    console.error('Failed to create Notion database:', error)

    // Handle specific Notion API errors
    if ((error as any).code === 'object_not_found') {
      return NextResponse.json(
        { success: false, error: 'Parent page not found. Check your page ID and permissions.' },
        { status: 404 }
      )
    }

    if ((error as any).code === 'unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Check your integration token and page permissions.' },
        { status: 401 }
      )
    }

    if ((error as any).code === 'validation_error') {
      return NextResponse.json(
        { success: false, error: 'Invalid page ID format. Make sure you copied the correct ID.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Database creation failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
