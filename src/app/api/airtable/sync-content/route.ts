import { type NextRequest, NextResponse } from 'next/server'

interface ContentItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  category: string
  status: 'draft' | 'scheduled' | 'posted'
  creatorId?: number
  scheduledDate?: string
  postedDate?: string
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  tags: string[]
  description: string
  uploadDate: string
  size: number
}

interface AirtableContentItem {
  fields: {
    'Name': string
    'Type': string
    'Category': string
    'Status': string
    'Creator ID'?: number
    'Creator Name'?: string
    'Scheduled Date'?: string
    'Posted Date'?: string
    'Priority'?: string
    'Notes'?: string
    'Tags'?: string
    'Description'?: string
    'Upload Date': string
    'File Size'?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, baseId, tableName, content } = body

    if (!apiKey || !baseId || !tableName || !content) {
      return NextResponse.json(
        { success: false, error: 'API key, base ID, table name, and content data are required' },
        { status: 400 }
      )
    }

    const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`

    // Test connection first
    const testResponse = await fetch(`${baseUrl}?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!testResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Airtable content table' },
        { status: 401 }
      )
    }

    // Get table schema to see available fields
    let availableFields: Set<string> = new Set()
    try {
      const schemaUrl = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
      const schemaResponse = await fetch(schemaUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json()
        const table = schemaData.tables.find((t: any) => t.name === tableName)
        if (table) {
          availableFields = new Set(table.fields.map((field: any) => field.name))
          console.log('Available content fields:', Array.from(availableFields))
        }
      }
    } catch (error) {
      console.warn('Could not fetch content table schema:', error)
    }

    // Get existing records to update vs create
    const existingResponse = await fetch(baseUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    let existingRecords: any[] = []
    if (existingResponse.ok) {
      const existingData = await existingResponse.json()
      existingRecords = existingData.records || []
    }

    const existingContentNames = new Set(
      existingRecords.map(record => record.fields.Name || record.fields.name)
    )

    let syncedCount = 0
    const errors: string[] = []

    // Sync each content item
    for (const contentItem of content as ContentItem[]) {
      try {
        const mappedFields = mapContentToAirtable(contentItem, availableFields)

        if (existingContentNames.has(contentItem.name)) {
          // Update existing content
          const existingRecord = existingRecords.find(
            record => (record.fields.Name || record.fields.name) === contentItem.name
          )

          if (existingRecord?.id) {
            const updateResponse = await fetch(`${baseUrl}/${existingRecord.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fields: mappedFields })
            })

            if (updateResponse.ok) {
              syncedCount++
            } else {
              const errorData = await updateResponse.json().catch(() => ({}))
              errors.push(`Failed to update ${contentItem.name}: ${errorData.error?.message || updateResponse.statusText}`)
            }
          }
        } else {
          // Create new content
          const createResponse = await fetch(baseUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: mappedFields })
          })

          if (createResponse.ok) {
            syncedCount++
          } else {
            const errorData = await createResponse.json().catch(() => ({}))
            errors.push(`Failed to create ${contentItem.name}: ${errorData.error?.message || createResponse.statusText}`)
          }
        }
      } catch (error) {
        errors.push(`Error processing ${contentItem.name}: ${(error as Error).message}`)
      }
    }

    if (errors.length > 0) {
      console.warn('Content sync errors:', errors)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} content items to Airtable`,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Airtable content sync failed:', error)
    return NextResponse.json(
      { success: false, error: `Sync failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}

function mapContentToAirtable(contentItem: ContentItem, availableFields: Set<string>): Partial<AirtableContentItem['fields']> {
  const allFields = {
    'Name': contentItem.name,
    'Type': contentItem.type,
    'Category': contentItem.category,
    'Status': contentItem.status,
    'Creator ID': contentItem.creatorId,
    'Scheduled Date': contentItem.scheduledDate,
    'Posted Date': contentItem.postedDate,
    'Priority': contentItem.priority,
    'Notes': contentItem.notes,
    'Tags': contentItem.tags.join(', '),
    'Description': contentItem.description,
    'Upload Date': contentItem.uploadDate,
    'File Size': contentItem.size
  }

  // If no field information available, return all fields
  if (availableFields.size === 0) {
    console.log('No field constraints for content, sending all fields')
    return allFields
  }

  // Filter to only include fields that exist in the table
  const filteredFields: any = {}

  for (const [fieldName, value] of Object.entries(allFields)) {
    if (availableFields.has(fieldName)) {
      // Only include non-undefined values
      if (value !== undefined && value !== null && value !== '') {
        filteredFields[fieldName] = value
      }
    } else {
      console.log(`Skipping content field '${fieldName}' - not found in table schema`)
    }
  }

  console.log('Filtered content fields for Airtable:', Object.keys(filteredFields))
  return filteredFields
}
