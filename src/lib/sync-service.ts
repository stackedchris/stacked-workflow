// Cross-browser synchronization service
// Uses BroadcastChannel for same-device sync and localStorage for persistence

// Define event types for type safety
export interface SyncEvent {
  type: 'creators' | 'content' | 'employees' | 'strategies' | 'categories' | 'settings';
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

class SyncService {
  private channel: BroadcastChannel | null = null;
  private eventListeners: Record<string, Function[]> = {};
  private isInitialized = false;
  private lastSyncTime = 0;
  private syncKey = 'stacked-sync-data';

  constructor() {
    this.initialize();
  }

  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Set up broadcast channel for cross-tab communication
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('stacked-sync');
        
        // Listen for messages from other tabs/windows
        this.channel.onmessage = (event) => {
          const { eventName, data } = event.data;
          
          // Don't process events from the same user
          if (data && data.userId === userId) return;
          
          // Trigger event listeners
          this.triggerEvent(eventName, data);
          
          // Update last sync time
          this.lastSyncTime = Date.now();
        };
        
        console.log('📡 Broadcast channel initialized for cross-tab sync');
      } else {
        console.warn('BroadcastChannel not supported in this browser');
      }
      
      this.isInitialized = true;
      
      // Trigger connected event
      this.triggerEvent('connected', { userId });
      
      // Set up window unload handler
      window.addEventListener('beforeunload', () => {
        this.triggerEvent('disconnected', { userId });
      });
      
      // Set up storage event listener for cross-browser sync
      window.addEventListener('storage', this.handleStorageEvent);
      
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    // Only process events for our sync key
    if (event.key === this.syncKey && event.newValue) {
      try {
        const syncData = JSON.parse(event.newValue);
        
        // Don't process events from the same user
        if (syncData.userId === userId) return;
        
        // Trigger event listeners
        this.triggerEvent('sync', syncData);
        
        // Update last sync time
        this.lastSyncTime = Date.now();
      } catch (error) {
        console.error('Error processing storage event:', error);
      }
    }
  };

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
    console.log('📤 Sync emit:', event, data);
    
    // Add user ID and timestamp
    const enhancedData = {
      ...data,
      userId,
      timestamp: Date.now()
    };
    
    // Broadcast to other tabs/windows
    if (this.channel) {
      this.channel.postMessage({ eventName: event, data: enhancedData });
    }
    
    // Also trigger local listeners (for same-tab updates)
    this.triggerEvent(event, enhancedData);
    
    // Update last sync time
    this.lastSyncTime = Date.now();
    
    // Store in localStorage for cross-browser sync
    if (event === 'sync') {
      localStorage.setItem(this.syncKey, JSON.stringify(enhancedData));
    }
  }

  on(event: string, callback: Function) {
    console.log('📥 Sync listener registered for:', event);
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
    return this;
  }

  off(event: string, callback: Function) {
    console.log('📥 Sync listener removed for:', event);
    
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
    
    return this;
  }

  // Emit a sync event
  emitSyncEvent(event: Omit<SyncEvent, 'userId' | 'timestamp'>) {
    const fullEvent: SyncEvent = {
      ...event,
      userId,
      timestamp: Date.now()
    };

    this.emit('sync', fullEvent);
    console.log('📤 Sync event emitted:', fullEvent.type, fullEvent.action);
  }

  // Get last sync time
  getLastSyncTime() {
    return this.lastSyncTime;
  }

  // Clean up resources
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    window.removeEventListener('storage', this.handleStorageEvent);
    this.eventListeners = {};
    this.isInitialized = false;
  }
}

// Create singleton instance
export const syncService = new SyncService();

// Helper functions
export const emitSyncEvent = (event: Omit<SyncEvent, 'userId' | 'timestamp'>) => {
  syncService.emitSyncEvent(event);
};

export const onSyncEvent = (
  eventType: SyncEvent['type'],
  callback: (event: SyncEvent) => void
) => {
  const handleSyncEvent = (event: SyncEvent) => {
    // Only process events for the specified type
    // And ignore events from the same user
    if (event.type === eventType && event.userId !== userId) {
      console.log('📥 Sync event received:', event.type, event.action);
      callback(event);
    }
  };

  syncService.on('sync', handleSyncEvent);
  
  // Return cleanup function
  return () => {
    syncService.off('sync', handleSyncEvent);
  };
};