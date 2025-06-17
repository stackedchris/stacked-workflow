import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, workspaceId, baseName, creators } = body

    if (!apiKey || !workspaceId || !baseName) {
      return NextResponse.json(
        { success: false, error: 'API key, workspace ID, and base name are required' },
        { status: 400 }
      )
    }

    // Create new base
    const createBaseResponse = await fetch('https://api.airtable.com/v0/meta/bases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: baseName,
        workspaceId: workspaceId,
        tables: [
          {
            name: 'Creators',
            description: 'Creator pipeline management and tracking',
            fields: [
              {
                name: 'Name',
                type: 'singleLineText',
                description: 'Creator name'
              },
              {
                name: 'Email',
                type: 'email',
                description: 'Contact email'
              },
              {
                name: 'Phone',
                type: 'phoneNumber',
                description: 'Contact phone number'
              },
              {
                name: 'Category',
                type: 'singleSelect',
                description: 'Creator category',
                options: {
                  choices: [
                    { name: 'Gaming', color: 'purpleLight2' },
                    { name: 'Music', color: 'pinkLight2' },
                    { name: 'Streaming', color: 'blueLight2' },
                    { name: 'Lifestyle', color: 'greenLight2' },
                    { name: 'Comedy', color: 'yellowLight2' },
                    { name: 'Fashion', color: 'orangeLight2' }
                  ]
                }
              },
              {
                name: 'Avatar',
                type: 'singleLineText',
                description: 'Creator avatar emoji or image'
              },
              {
                name: 'Bio',
                type: 'multilineText',
                description: 'Creator biography'
              },
              {
                name: 'Phase',
                type: 'singleSelect',
                description: 'Current pipeline phase',
                options: {
                  choices: [
                    { name: 'Phase 0: Strategy Call', color: 'blueLight2' },
                    { name: 'Phase 1: Drop Prep', color: 'yellowLight2' },
                    { name: 'Phase 2: Launch Week', color: 'greenLight2' },
                    { name: 'Phase 3: Sell-Out Push', color: 'orangeLight2' },
                    { name: 'Phase 4: Post-Sellout', color: 'purpleLight2' }
                  ]
                }
              },
              {
                name: 'Phase Number',
                type: 'number',
                description: 'Phase number for sorting',
                options: {
                  precision: 0
                }
              },
              {
                name: 'Cards Sold',
                type: 'number',
                description: 'Number of cards sold',
                options: {
                  precision: 0
                }
              },
              {
                name: 'Total Cards',
                type: 'number',
                description: 'Total cards available',
                options: {
                  precision: 0
                }
              },
              {
                name: 'Card Price',
                type: 'currency',
                description: 'Price per card',
                options: {
                  precision: 2,
                  symbol: '$'
                }
              },
              {
                name: 'Sales Velocity',
                type: 'singleSelect',
                description: 'Sales performance indicator',
                options: {
                  choices: [
                    { name: 'High', color: 'greenLight2' },
                    { name: 'Medium', color: 'yellowLight2' },
                    { name: 'Low', color: 'redLight2' },
                    { name: 'Pending', color: 'grayLight2' }
                  ]
                }
              },
              {
                name: 'Days in Phase',
                type: 'number',
                description: 'Days spent in current phase',
                options: {
                  precision: 0
                }
              },
              {
                name: 'Next Task',
                type: 'singleLineText',
                description: 'Next action item'
              },
              {
                name: 'Instagram',
                type: 'url',
                description: 'Instagram profile URL'
              },
              {
                name: 'Twitter',
                type: 'url',
                description: 'Twitter profile URL'
              },
              {
                name: 'YouTube',
                type: 'url',
                description: 'YouTube channel URL'
              },
              {
                name: 'TikTok',
                type: 'url',
                description: 'TikTok profile URL'
              },
              {
                name: 'Launch Date',
                type: 'date',
                description: 'Planned or actual launch date',
                options: {
                  dateFormat: {
                    name: 'us'
                  }
                }
              },
              {
                name: 'Target Audience',
                type: 'multilineText',
                description: 'Target audience description'
              },
              {
                name: 'Content Plan',
                type: 'multilineText',
                description: 'Content strategy and plan'
              },
              {
                name: 'Created Date',
                type: 'date',
                description: 'Date creator was added',
                options: {
                  dateFormat: {
                    name: 'us'
                  }
                }
              },
              {
                name: 'Last Updated',
                type: 'date',
                description: 'Last modification date',
                options: {
                  dateFormat: {
                    name: 'us'
                  }
                }
              },
              {
                name: 'Revenue',
                type: 'formula',
                description: 'Calculated revenue',
                options: {
                  formula: '{Cards Sold} * {Card Price}',
                  isValid: true,
                  referencedFieldIds: [],
                  result: {
                    type: 'currency',
                    options: {
                      precision: 2,
                      symbol: '$'
                    }
                  }
                }
              },
              {
                name: 'Progress Percentage',
                type: 'formula',
                description: 'Completion percentage',
                options: {
                  formula: 'ROUND(({Cards Sold} / {Total Cards}) * 100, 0)',
                  isValid: true,
                  referencedFieldIds: [],
                  result: {
                    type: 'percent',
                    options: {
                      precision: 0
                    }
                  }
                }
              }
            ]
          }
        ]
      })
    })

    if (!createBaseResponse.ok) {
      const errorData = await createBaseResponse.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: `Failed to create base: ${errorData.error?.message || createBaseResponse.statusText}` },
        { status: createBaseResponse.status }
      )
    }

    const baseData = await createBaseResponse.json()
    const baseId = baseData.id
    const tableId = baseData.tables[0].id

    // Create views
    const viewsToCreate = [
      {
        name: 'Pipeline Dashboard',
        type: 'grid',
        groupLevels: [
          {
            fieldId: baseData.tables[0].fields.find((f: any) => f.name === 'Phase')?.id,
            order: 'asc'
          }
        ],
        sortLevels: [
          {
            fieldId: baseData.tables[0].fields.find((f: any) => f.name === 'Days in Phase')?.id,
            order: 'desc'
          }
        ],
        visibleFieldIds: [
          baseData.tables[0].fields.find((f: any) => f.name === 'Name')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Category')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Cards Sold')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Sales Velocity')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Next Task')?.id
        ].filter(Boolean)
      },
      {
        name: 'Revenue Tracking',
        type: 'grid',
        groupLevels: [
          {
            fieldId: baseData.tables[0].fields.find((f: any) => f.name === 'Category')?.id,
            order: 'asc'
          }
        ],
        sortLevels: [
          {
            fieldId: baseData.tables[0].fields.find((f: any) => f.name === 'Revenue')?.id,
            order: 'desc'
          }
        ],
        visibleFieldIds: [
          baseData.tables[0].fields.find((f: any) => f.name === 'Name')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Cards Sold')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Card Price')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Revenue')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Progress Percentage')?.id
        ].filter(Boolean)
      },
      {
        name: 'High Priority',
        type: 'grid',
        filterByFormula: 'OR({Sales Velocity} = "Low", {Days in Phase} > 7)',
        sortLevels: [
          {
            fieldId: baseData.tables[0].fields.find((f: any) => f.name === 'Days in Phase')?.id,
            order: 'desc'
          }
        ]
      },
      {
        name: 'Launch Calendar',
        type: 'calendar',
        dateFieldId: baseData.tables[0].fields.find((f: any) => f.name === 'Launch Date')?.id,
        visibleFieldIds: [
          baseData.tables[0].fields.find((f: any) => f.name === 'Name')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Phase')?.id,
          baseData.tables[0].fields.find((f: any) => f.name === 'Target Audience')?.id
        ].filter(Boolean)
      }
    ]

    // Create each view
    for (const viewConfig of viewsToCreate) {
      try {
        await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/views`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(viewConfig)
        })
      } catch (error) {
        console.warn(`Failed to create view ${viewConfig.name}:`, error)
      }
    }

    // If creators data is provided, populate the base
    if (creators && creators.length > 0) {
      const records = creators.map((creator: any) => ({
        fields: {
          'Name': creator.name,
          'Email': creator.email || '',
          'Phone': creator.phone || '',
          'Category': creator.category,
          'Avatar': creator.avatar || '👤',
          'Bio': creator.bio || '',
          'Phase': creator.phase,
          'Phase Number': creator.phaseNumber,
          'Cards Sold': creator.cardsSold,
          'Total Cards': creator.totalCards,
          'Card Price': creator.cardPrice,
          'Sales Velocity': creator.salesVelocity,
          'Days in Phase': creator.daysInPhase,
          'Next Task': creator.nextTask,
          'Instagram': creator.socialMedia?.instagram || '',
          'Twitter': creator.socialMedia?.twitter || '',
          'YouTube': creator.socialMedia?.youtube || '',
          'TikTok': creator.socialMedia?.tiktok || '',
          'Launch Date': creator.strategy?.launchDate || '',
          'Target Audience': creator.strategy?.targetAudience || '',
          'Content Plan': creator.strategy?.contentPlan || '',
          'Created Date': creator.createdAt,
          'Last Updated': creator.lastUpdated
        }
      }))

      // Add records in batches of 10 (Airtable limit)
      const batchSize = 10
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        await fetch(`https://api.airtable.com/v0/${baseId}/Creators`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: batch,
            typecast: true
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Airtable base created successfully with complete template structure',
      baseId,
      baseUrl: `https://airtable.com/${baseId}`,
      creatorsTableId: tableId,
      recordsCreated: creators?.length || 0
    })

  } catch (error) {
    console.error('Failed to create Airtable base:', error)
    return NextResponse.json(
      { success: false, error: `Base creation failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}