import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketServer } from 'socket.io';

// Global variable to store the Socket.io server instance
let io: SocketServer;

// Track connected clients
const connectedClients: Record<string, { userId: string; lastSeen: number }> = {};

export async function GET(req: NextRequest) {
  try {
    // Get the raw Node.js HTTP server from the Next.js request
    const res = new NextResponse();
    const { server } = res.socket as any;
    
    // Initialize Socket.io server if it doesn't exist
    if (!io) {
      console.log('🚀 Initializing Socket.io server in app router...');
      io = new SocketServer(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      // Set up connection handler
      io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId as string;
        console.log(`🔌 Client connected: ${socket.id} (User: ${userId})`);
        
        // Track this client
        connectedClients[socket.id] = {
          userId,
          lastSeen: Date.now()
        };
        
        // Broadcast current user count
        io.emit('users', Object.keys(connectedClients).length);

        // Handle sync events
        socket.on('sync', (event) => {
          console.log(`📡 Sync event received: ${event.type} ${event.action} from ${event.userId}`);
          
          // Broadcast to all other clients
          socket.broadcast.emit('sync', event);
          
          // Update last seen timestamp
          if (connectedClients[socket.id]) {
            connectedClients[socket.id].lastSeen = Date.now();
          }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log(`🔌 Client disconnected: ${socket.id}`);
          delete connectedClients[socket.id];
          io.emit('users', Object.keys(connectedClients).length);
        });
      });
    }

    // Return basic status for health checks
    return NextResponse.json({ 
      status: 'ok',
      connections: Object.keys(connectedClients).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize socket server' },
      { status: 500 }
    );
  }
}