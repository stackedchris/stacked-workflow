import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Socket.io API route is available',
    timestamp: new Date().toISOString(),
    info: 'This route is used for WebSocket connections. Use the Socket.io client to connect.'
  });
}