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

// Mock socket implementation for serverless environment
class MockSocket {
  connected = false;
  id = 'mock-socket';

  emit(event: string, data: any) {
    console.log('📤 Mock socket emit:', event, data);
  }

  on(event: string, callback: Function) {
    console.log('📥 Mock socket listener registered for:', event);
  }

  off(event: string, callback: Function) {
    console.log('📥 Mock socket listener removed for:', event);
  }

  disconnect() {
    console.log('🔌 Mock socket disconnected');
  }
}

// Socket.io client instance (disabled in serverless environment)
let socket: MockSocket | null = null;

// Initialize mock socket connection
export const initializeSocket = (): MockSocket => {
  if (socket) return socket;

  console.log('🔌 Initializing mock socket (Socket.io unavailable in serverless environment)');

  socket = new MockSocket();

  // Simulate connection events
  setTimeout(() => {
    console.log('🔌 Mock socket connected with ID:', socket?.id);
  }, 100);

  return socket;
};

// Emit a sync event (mock implementation)
export const emitSyncEvent = (event: Omit<SyncEvent, 'userId' | 'timestamp'>) => {
  if (!socket) {
    socket = initializeSocket();
  }

  const fullEvent: SyncEvent = {
    ...event,
    userId,
    timestamp: Date.now()
  };

  socket.emit('sync', fullEvent);
  console.log('📤 Mock sync event emitted:', fullEvent.type, fullEvent.action);
};

// Hook for subscribing to sync events (mock implementation)
export function useSyncEvents(
  eventType: SyncEvent['type'],
  callback: (event: SyncEvent) => void
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize mock socket if not already done
    if (!socket) {
      socket = initializeSocket();
    }

    // Simulate connection
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 100);

    console.log('📥 Mock sync event listener registered for:', eventType);

    // Clean up on unmount
    return () => {
      clearTimeout(connectTimer);
      setIsConnected(false);
    };
  }, [eventType, callback]);

  return { isConnected };
}

// Close socket connection (mock implementation)
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};