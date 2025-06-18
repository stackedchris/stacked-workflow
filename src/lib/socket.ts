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
  private eventListeners: Record<string, Function[]> = {};

  constructor() {
    this.connected = true;
    
    // Set up broadcast channel for cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      this.setupBroadcastChannel();
    }
  }

  private setupBroadcastChannel() {
    const channel = new BroadcastChannel('stacked-sync');
    
    // Listen for messages from other tabs/windows
    channel.onmessage = (event) => {
      const { eventName, data } = event.data;
      
      // Don't process events from the same user
      if (data && data.userId === userId) return;
      
      // Trigger event listeners
      this.triggerEvent(eventName, data);
    };
    
    // Store channel reference
    (this as any).channel = channel;
  }

  private triggerEvent(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  emit(event: string, data: any) {
    console.log('📤 Socket emit:', event, data);
    
    // Broadcast to other tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = (this as any).channel || new BroadcastChannel('stacked-sync');
      channel.postMessage({ eventName: event, data });
    }
    
    // Also trigger local listeners (for same-tab updates)
    this.triggerEvent(event, data);
  }

  on(event: string, callback: Function) {
    console.log('📥 Socket listener registered for:', event);
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
    return this;
  }

  off(event: string, callback: Function) {
    console.log('📥 Socket listener removed for:', event);
    
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
    
    return this;
  }

  connect() {
    this.connected = true;
    this.triggerEvent('connect', null);
    console.log('🔌 Socket connected with ID:', this.id);
    return this;
  }

  disconnect() {
    this.connected = false;
    this.triggerEvent('disconnect', null);
    
    // Close broadcast channel
    if (typeof BroadcastChannel !== 'undefined' && (this as any).channel) {
      (this as any).channel.close();
    }
    
    console.log('🔌 Socket disconnected');
  }
}

// Socket instance (shared across the application)
let socket: MockSocket | null = null;

// Initialize socket connection
export const initializeSocket = (): MockSocket => {
  if (socket) return socket;

  console.log('🔌 Initializing socket connection');
  socket = new MockSocket();
  
  // Simulate connection events
  setTimeout(() => {
    if (socket) {
      socket.triggerEvent('connect', null);
      
      // Simulate user count (1-3 users)
      const randomUserCount = Math.floor(Math.random() * 3) + 1;
      socket.triggerEvent('users', randomUserCount);
      
      console.log('🔌 Socket connected with ID:', socket.id);
    }
  }, 100);

  return socket;
};

// Emit a sync event
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
  console.log('📤 Sync event emitted:', fullEvent.type, fullEvent.action);
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

    // Set up sync event listener
    const handleSyncEvent = (event: SyncEvent) => {
      // Only process events for the specified type
      // And ignore events from the same user
      if (event.type === eventType && event.userId !== userId) {
        console.log('📥 Sync event received:', event.type, event.action);
        callback(event);
      }
    };

    // Set up connection listeners
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Register listeners
    socket.on('sync', handleSyncEvent);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set initial connection status
    setIsConnected(socket.connected);

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.off('sync', handleSyncEvent);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, [eventType, callback]);

  return { isConnected };
}

// Close socket connection
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};