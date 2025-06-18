import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Define event types for type safety
export interface SyncEvent {
  type: 'creators' | 'content' | 'employees' | 'strategies';
  action: 'create' | 'update' | 'delete';
  data: any;
  userId?: string;
  timestamp: number;
}

// Generate a unique user ID for this session
const generateUserId = () => {
  return `user_${Math.random().toString(36).substring(2, 9)}`;
};

// Store the user ID in memory
const userId = generateUserId();

// Socket.io client instance
let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (): Socket => {
  if (socket) return socket;

  // In production, connect to the deployed server
  // In development, connect to the current host with the correct API path
  const socketUrl = process.env.NODE_ENV === 'production'
    ? 'https://stacked-sync-server.netlify.app'
    : undefined;

  socket = io(socketUrl, {
    path: '/api/socket',
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
    query: {
      userId
    }
  });

  // Set up event listeners
  socket.on('connect', () => {
    console.log('🔌 Connected to sync server with ID:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from sync server:', reason);
  });

  return socket;
};

// Emit a sync event
export const emitSyncEvent = (event: Omit<SyncEvent, 'userId' | 'timestamp'>) => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Socket not connected, initializing...');
    socket = initializeSocket();
  }

  const fullEvent: SyncEvent = {
    ...event,
    userId,
    timestamp: Date.now()
  };

  socket.emit('sync', fullEvent);
  console.log('📤 Emitted sync event:', fullEvent.type, fullEvent.action);
};

// Hook for subscribing to sync events
export function useSyncEvents(
  eventType: SyncEvent['type'],
  callback: (event: SyncEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket if not already done
    if (!socket) {
      socket = initializeSocket();
    }

    // Set up connection status listener
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Set up event listener
    const handleSyncEvent = (event: SyncEvent) => {
      // Only process events of the specified type and not from this user
      if (event.type === eventType && event.userId !== userId) {
        console.log('📥 Received sync event:', event.type, event.action);
        callback(event);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('sync', handleSyncEvent);
    setIsConnected(socket.connected);

    // Clean up listeners on unmount
    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('sync', handleSyncEvent);
    };
  }, [eventType, callback]);

  return { isConnected };
}

// Close socket connection (useful for cleanup)
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};