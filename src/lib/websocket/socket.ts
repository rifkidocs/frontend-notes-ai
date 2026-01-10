import { io, Socket } from 'socket.io-client';
import { authApi } from '@/lib/api/auth';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

type SocketEventCallback = (data: any) => void;

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Set<SocketEventCallback>> = new Map();

  constructor() {
    // Bind methods to prevent "not a function" errors when passed as references
    this.connect = this.connect.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.getSocket = this.getSocket.bind(this);
    this.isConnected = this.isConnected.bind(this);
  }

  connect(): Socket | null {
    if (typeof window === 'undefined') return null;
    
    if (this.socket?.connected) {
      return this.socket;
    }

    const tokens = authApi.getTokens();
    if (!tokens) {
      console.warn('[SocketManager] No tokens found, cannot connect');
      return null;
    }

    this.socket = io(WS_URL, {
      auth: { token: tokens.accessToken },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      // Forward internal events
      const callbacks = this.eventListeners.get('connected');
      callbacks?.forEach(cb => cb({ socketId: this.socket?.id }));
    });

    this.socket.on('disconnect', (reason) => {
      const callbacks = this.eventListeners.get('disconnected');
      callbacks?.forEach(cb => cb({ reason }));
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketManager] Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[SocketManager] Max reconnection attempts reached');
        const callbacks = this.eventListeners.get('maxReconnectAttemptsReached');
        callbacks?.forEach(cb => cb({}));
      }
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('[SocketManager] Error:', data.message);
      const callbacks = this.eventListeners.get('error');
      callbacks?.forEach(cb => cb(data));
    });

    // Set up event forwarding for registered listeners
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: SocketEventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: SocketEventCallback) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.eventListeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[SocketManager] Cannot emit event: socket not connected', event);
    }
  }

  getSocket(): Socket | null {
    if (typeof window === 'undefined') return null;
    
    if (this.socket?.connected) {
      return this.socket;
    }

    // If we have a socket but it's not connected, try to connect it
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      return this.socket;
    }

    // Otherwise try to create a new connection
    return this.connect();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
const socketManagerInstance = new SocketManager();

// Explicitly export methods to avoid "not a function" errors if the instance is lost or proxied
export const socketManager = {
  connect: socketManagerInstance.connect,
  disconnect: socketManagerInstance.disconnect,
  on: socketManagerInstance.on,
  off: socketManagerInstance.off,
  emit: socketManagerInstance.emit,
  getSocket: socketManagerInstance.getSocket,
  isConnected: socketManagerInstance.isConnected,
  getSocketId: socketManagerInstance.getSocketId
};
