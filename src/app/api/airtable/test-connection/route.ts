import { type NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, baseId, tableName } = body

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

    const isConnected = await airtableService.testConnection()

    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Airtable. Check your credentials and table setup.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Airtable'
    })

  } catch (error) {
    console.error('Airtable connection test failed:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
