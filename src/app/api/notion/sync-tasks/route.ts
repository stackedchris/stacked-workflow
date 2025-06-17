import { type NextRequest, NextResponse } from 'next/server'
import { NotionService, type NotionTask } from '@/lib/notion'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, tasksDatabaseId, tasks } = body

    if (!token || !tasksDatabaseId || !tasks) {
      return NextResponse.json(
        { success: false, error: 'Token, tasks database ID, and tasks data are required' },
        { status: 400 }
      )
    }

    const notionService = new NotionService({
      token,
      creatorsDatabaseId: '', // Not needed for tasks sync
      tasksDatabaseId,
    })

    // Test connection first
    const isConnected = await notionService.testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Notion' },
        { status: 401 }
      )
    }

    // Sync tasks
    await notionService.syncTasksToNotion(tasks as NotionTask[])

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${tasks.length} tasks to Notion`,
      syncedCount: tasks.length,
    })

  } catch (error) {
    console.error('Notion tasks sync failed:', error)

    // Handle specific Notion API errors
    if ((error as any).code === 'object_not_found') {
      return NextResponse.json(
        { success: false, error: 'Tasks database not found. Check your database ID.' },
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
      { success: false, error: `Tasks sync failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
