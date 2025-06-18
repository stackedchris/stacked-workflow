import { Server } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import type { SyncEvent } from '@/lib/socket';

// Define a custom type for the response with socket.io
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    };
  };
};

// Track connected clients
const connectedClients: Record<string, { userId: string; lastSeen: number }> = {};

// Initialize Socket.io server
const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('🚀 Initializing Socket.io server...');
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      addTrailingSlash: false,
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
      socket.on('sync', (event: SyncEvent) => {
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

    // Store the io instance
    res.socket.server.io = io;
  } else {
    console.log('⚡ Socket.io server already running');
  }
  
  return res.socket.server.io;
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // Only allow websocket connections
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize socket server
  const io = initSocketServer(res);
  
  // Return basic status for health checks
  res.status(200).json({ 
    status: 'ok',
    connections: Object.keys(connectedClients).length,
    timestamp: new Date().toISOString()
  });
}