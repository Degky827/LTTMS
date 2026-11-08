import { io, Socket } from 'socket.io-client';

export const PRODUCTION_SOCKET_URL = 'https://lttms.onrender.com';

export function resolveSocketUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_SOCKET_URL || '').trim();

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local');

    if (!isLocalhost) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return PRODUCTION_SOCKET_URL;
      }
      return envUrl;
    }
  }

  if (envUrl) {
    return envUrl;
  }

  return 'http://localhost:5000';
}

let socket: Socket | null = null;

export const connectSocket = (token?: string | null): Socket => {
  if (socket?.connected) return socket;

  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const targetUrl = resolveSocketUrl();

  socket = io(targetUrl, {
    auth: { token: authToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

// Realtime Messaging Events
export const onReceiveMessage = (callback: (msg: any) => void) => {
  if (socket) socket.on('message:receive', callback);
};

export const onSentMessage = (callback: (msg: any) => void) => {
  if (socket) socket.on('message:sent', callback);
};

export const emitSendMessage = (data: { receiver: string; content: string }, callback?: (res: any) => void) => {
  if (socket) {
    socket.emit('message:send', data, callback);
  }
};

// Domain Event Listeners
export const onBookingUpdate = (callback: (booking: any) => void) => {
  if (socket) socket.on('booking:update', callback);
};

export const onPaymentUpdate = (callback: (payment: any) => void) => {
  if (socket) socket.on('payment:update', callback);
};

export const onVendorUpdate = (callback: (vendor: any) => void) => {
  if (socket) socket.on('vendor:update', callback);
};

export const onAnnouncement = (callback: (announcement: any) => void) => {
  if (socket) socket.on('announcement', callback);
};

export const offSocketEvent = (event: string, callback?: (...args: any[]) => void) => {
  if (socket) {
    if (callback) socket.off(event, callback);
    else socket.off(event);
  }
};

// Join specialized rooms
export const joinUserRoom = (userId: string) => {
  if (socket && userId) socket.emit('join:user', userId);
};

export const joinVendorRoom = (vendorId: string) => {
  if (socket && vendorId) socket.emit('join:vendor', vendorId);
};

export const joinAdminRoom = () => {
  if (socket) socket.emit('join:admin');
};
