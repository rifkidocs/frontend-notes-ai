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

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const tokens = authApi.getTokens();
    if (!tokens) {
      throw new Error('No authentication tokens available');
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
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('maxReconnectAttemptsReached', {});
      }
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('WebSocket error:', data.message);
      this.emit('error', data);
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
      this.eventListeners.clear();
    }
  }

  on(event: string, callback: SocketEventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);

    // If socket is already connected, register the listener immediately
    if (this.socket?.connected) {
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

    if (this.socket?.connected) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: socket not connected', event);
    }
  }

  getSocket() {
    return this.socket || this.connect();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
export const socketManager = new SocketManager();
