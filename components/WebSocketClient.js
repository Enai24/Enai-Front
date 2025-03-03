// src/components/WebSocketClient.js

import React, { useEffect, useState } from 'react';

const WebSocketClient = ({ threadId }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use dynamic thread ID in the WebSocket URL
    const ws = new WebSocket(`ws://localhost:8000/ws/realtime/${threadId}/`);

    ws.onopen = () => {
      console.log('✅ WebSocket connection opened.');
      ws.send(JSON.stringify({ message: 'Hello, server!' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 Received:', data);
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err);
        setError('Error parsing WebSocket message');
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('🔴 WebSocket connection closed.');
    };

    // Clean up the connection on component unmount
    return () => {
      ws.close();
    };
  }, [threadId]);

  return (
    <div>
      <h3>WebSocket Client Connected</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>Type:</strong> {msg.type} <br />
            <strong>Message:</strong> {msg.message || 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketClient;