import { useCallback, useEffect, useState } from 'react';

import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';

interface WSOperation {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  error?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface WebSocketConfig {
  url: string;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onComplete?: (data: any) => void;
}

export const useWebSocketOperation = ({
  url,
  onMessage,
  onError,
  onComplete,
}: WebSocketConfig) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [operation, setOperation] = useState<WSOperation | null>(null);

  const bearerToken = getItemWithTTL('bearerToken');

  useEffect(() => {
    const encodedUrl = url + `?Bearer%20${bearerToken}`;
    const ws = new WebSocket(encodedUrl);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      setOperation((prev) => {
        if (!prev || prev.id !== message.operation_id) return prev;

        const updatedOperation: WSOperation = {
          ...prev,
          status: message.type.includes('completed')
            ? 'completed'
            : message.type.includes('error')
              ? 'error'
              : 'processing',
          message: message.message,
          error: message.error,
          timestamp: message.timestamp,
          metadata: message.metadata,
        };

        if (updatedOperation.status === 'completed' && onComplete) {
          onComplete(message);
          ws.close(); // Close WebSocket on completion
        }

        if (updatedOperation.status === 'error' && onError) {
          onError(message);
          ws.close(); // Close WebSocket on error
        }

        if (onMessage) {
          onMessage(message);
        }

        return updatedOperation;
      });
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url, onMessage, onError, onComplete]);

  const startOperation = useCallback(
    (type: string, metadata?: Record<string, any>) => {
      if (socket && isConnected) {
        const operationId = `${type}_${Date.now()}`;
        const newOperation: WSOperation = {
          id: operationId,
          type,
          status: 'pending',
          metadata,
          timestamp: new Date().toISOString(),
        };

        setOperation(newOperation);

        socket.send(
          JSON.stringify({
            type: `${type}_started`,
            operation_id: operationId,
            ...metadata,
          }),
        );

        return operationId;
      }
      return null;
    },
    [socket, isConnected],
  );

  return { isConnected, operation, startOperation };
};
