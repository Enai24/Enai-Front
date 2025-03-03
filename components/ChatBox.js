// src/components/ChatBox.jsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ChatBox = ({ threadId }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    // Add user's message locally
    setConversation((prev) => [...prev, { role: 'user', content: message }]);
    try {
      const response = await axios.post('/api/conversational-reply/', { thread_id: threadId, message });
      const reply = response.data.reply;
      setConversation((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Error getting assistant reply:', error);
      toast.error("Failed to get reply from assistant.");
    }
    setMessage('');
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Assistant Chat</h2>
      <div className="h-64 overflow-y-auto mb-4 bg-gray-700 p-2 rounded">
        {conversation.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'assistant' ? 'text-blue-400' : 'text-green-400'}`}>
            <strong>{msg.role === 'assistant' ? 'Assistant' : 'You'}: </strong>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex">
        <textarea
          className="w-full p-2 rounded-l-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        ></textarea>
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;