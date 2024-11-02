import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';

const BaseURLWebsocket = process.env.NEXT_PUBLIC_BaseURLWebSocket || '';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Singleton instance getter
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // Connect to WebSocket if not already connected
  public connect(
    onMessage: (message: any) => void,
    onError: (error: any) => void,
  ): void {
    if (this.isConnected && this.socket) {
      console.log('WebSocket is already connected.');
      return;
    }

    const bearerToken = getItemWithTTL('bearerToken');

    const encodedUrl =
      BaseURLWebsocket + `?Authorization=Bearer ${bearerToken}`;

    this.socket = new WebSocket(encodedUrl);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      onMessage(message);

      // Close the connection on receiving a completion message
      this.disconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError(error);
      this.disconnect();
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      this.socket = null;
      console.log('WebSocket connection closed');
    };
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket manually closed');
    }
  }

  // Check if WebSocket is already connected
  public isConnectedStatus(): boolean {
    return this.isConnected;
  }
}
