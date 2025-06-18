import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Return status indicating Socket.io is not available in serverless environment
    return NextResponse.json({ 
      status: 'unavailable',
      message: 'Socket.io server cannot be initialized in Next.js App Router serverless functions',
      connections: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Socket route error:', error);
    return NextResponse.json(
      { error: 'Socket server unavailable' },
      { status: 500 }
    );
  }
}