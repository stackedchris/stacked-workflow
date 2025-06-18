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
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Don't auto-initialize to avoid SSR issues
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log('SyncService: Skipping initialization in SSR environment');
      return;
    }
    
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
      
      // Set up window unload handler - only in browser
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          this.triggerEvent('disconnected', { userId });
        });
        
        // Set up storage event listener for cross-browser sync
        window.addEventListener('storage', this.handleStorageEvent);
      }
      
      // Set up polling for cross-browser sync
      this.setupPolling();
      
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  private setupPolling() {
    // Poll for changes every 2 seconds
    this.pollInterval = setInterval(() => {
      this.pollForChanges();
    }, 2000);
    
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }

  private async pollForChanges() {
    try {
      // Check for changes in localStorage
      const syncData = localStorage.getItem(this.syncKey);
      if (syncData) {
        const parsedData = JSON.parse(syncData);
        
        // Only process if it's newer than our last sync and from a different user
        if (parsedData.timestamp > this.lastSyncTime && parsedData.userId !== userId) {
          this.triggerEvent('sync', parsedData);
          this.lastSyncTime = parsedData.timestamp;
        }
      }
      
      // Also check for creators and content directly
      const creatorsData = localStorage.getItem('stacked-creators');
      const contentData = localStorage.getItem('stacked-content');
      
      // Store the current data in memory for comparison in future polls
      if (creatorsData) {
        this.storeDataForComparison('creators', creatorsData);
      }
      
      if (contentData) {
        this.storeDataForComparison('content', contentData);
      }
    } catch (error) {
      console.error('Error polling for changes:', error);
    }
  }
  
  // Store data in memory for comparison
  private dataCache: Record<string, string> = {};
  
  private storeDataForComparison(key: string, data: string) {
    // If we have previous data and it's different, trigger a sync event
    if (this.dataCache[key] && this.dataCache[key] !== data) {
      try {
        const parsedData = JSON.parse(data);
        this.triggerEvent('sync', {
          type: key as SyncEvent['type'],
          action: 'update',
          data: parsedData,
          userId: 'system',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`Error parsing ${key} data:`, error);
      }
    }
    
    // Update cache
    this.dataCache[key] = data;
  }

  private async sendHeartbeat() {
    try {
      // Send heartbeat to server to track active users
      const response = await fetch('/api/sync/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: userId,
          action: 'heartbeat'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update connected clients count
        if (data.connectedClients > 1) {
          this.triggerEvent('users', data.connectedClients);
        }
      }
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    // Process events for our sync key
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
    
    // Also process direct changes to creators and content
    if (event.key === 'stacked-creators' && event.newValue) {
      try {
        const creators = JSON.parse(event.newValue);
        this.triggerEvent('sync', {
          type: 'creators',
          action: 'update',
          data: creators,
          userId: 'storage-event',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error processing creators storage event:', error);
      }
    }
    
    if (event.key === 'stacked-content' && event.newValue) {
      try {
        const content = JSON.parse(event.newValue);
        this.triggerEvent('sync', {
          type: 'content',
          action: 'update',
          data: content,
          userId: 'storage-event',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error processing content storage event:', error);
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
    
    // Store in localStorage for cross-browser sync - only in browser
    if (event === 'sync' && typeof localStorage !== 'undefined') {
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
    
    // Clear intervals
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Only remove event listeners in browser environment
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    
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