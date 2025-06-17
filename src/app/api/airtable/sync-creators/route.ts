import { type NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import type { Creator } from '@/components/CreatorManagement'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, baseId, tableName, creators } = body

    if (!apiKey || !baseId || !tableName || !creators) {
      return NextResponse.json(
        { success: false, error: 'API key, base ID, table name, and creators data are required' },
        { status: 400 }
      )
    }

    const airtableService = new AirtableService({
      apiKey,
      baseId,
      tableName
    })

    // Test connection first
    const isConnected = await airtableService.testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Airtable' },
        { status: 401 }
      )
    }

    // Sync creators
    await airtableService.syncCreatorsToAirtable(creators as Creator[])

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${creators.length} creators to Airtable`,
      syncedCount: creators.length
    })

  } catch (error) {
    console.error('Airtable creators sync failed:', error)

    return NextResponse.json(
      { success: false, error: `Sync failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey')
    const baseId = searchParams.get('baseId')
    const tableName = searchParams.get('tableName')

    if (!apiKey || !baseId || !tableName) {
      return NextResponse.json(
        { success: false, error: 'API key, base ID, and table name are required' },
        { status: 400 }
      )
    }

    const airtableService = new AirtableService({
      apiKey,
      baseId,
      tableName
    })

    // Get creators from Airtable
    const creators = await airtableService.getCreators()

    return NextResponse.json({
      success: true,
      creators,
      count: creators.length
    })

  } catch (error) {
    console.error('Failed to get creators from Airtable:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch creators: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
