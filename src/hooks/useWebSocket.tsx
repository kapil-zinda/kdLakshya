// import { useCallback, useEffect, useState } from 'react';

// WebSocketModal.tsx
import { useEffect } from 'react';

import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';

interface WebSocketModalProps {
  url: string;
  operationId: string;
  onOperationComplete: (operationId: string) => void;
}

const WebSocketModal: React.FC<WebSocketModalProps> = ({
  url,
  operationId,
  onOperationComplete,
}) => {
  useEffect(() => {
    const bearerToken = getItemWithTTL('bearerToken');

    const encodedUrl = url + `?Authorization=Bearer ${bearerToken}`;
    const ws = new WebSocket(encodedUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.status === 'completed') {
        onOperationComplete(operationId);
        ws.close();
      }

      if (message.status === 'error') {
        console.log('WebSocket error');
        ws.close(); // Close WebSocket on error
      }
    };

    return () => {
      ws.close();
    };
  }, [url, operationId, onOperationComplete]);

  return null; // The modal renders nothing, just manages WebSocket connections
};

export default WebSocketModal;
