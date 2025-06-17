import { type NextRequest, NextResponse } from 'next/server'
import { NotionService, type Creator } from '@/lib/notion'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, creatorsDatabaseId, creators } = body

    if (!token || !creatorsDatabaseId || !creators) {
      return NextResponse.json(
        { success: false, error: 'Token, database ID, and creators data are required' },
        { status: 400 }
      )
    }

    const notionService = new NotionService({
      token,
      creatorsDatabaseId,
    })

    // Test connection first
    const isConnected = await notionService.testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Notion' },
        { status: 401 }
      )
    }

    // Sync creators
    await notionService.syncCreatorsToNotion(creators as Creator[])

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${creators.length} creators to Notion`,
      syncedCount: creators.length,
    })

  } catch (error) {
    console.error('Notion creators sync failed:', error)

    // Handle specific Notion API errors
    if ((error as any).code === 'object_not_found') {
      return NextResponse.json(
        { success: false, error: 'Database not found. Check your database ID.' },
        { status: 404 }
      )
    }

    if ((error as any).code === 'unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Check your integration token and database permissions.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Sync failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const creatorsDatabaseId = searchParams.get('creatorsDatabaseId')

    if (!token || !creatorsDatabaseId) {
      return NextResponse.json(
        { success: false, error: 'Token and database ID are required' },
        { status: 400 }
      )
    }

    const notionService = new NotionService({
      token,
      creatorsDatabaseId,
    })

    // Get creators from Notion
    const creators = await notionService.getCreatorsFromNotion()

    return NextResponse.json({
      success: true,
      creators,
      count: creators.length,
    })

  } catch (error) {
    console.error('Failed to get creators from Notion:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch creators: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
