import React from 'react';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  // Assuming threadId is obtained from context or props
  const threadId = 'unique-thread-id'; // Replace with actual thread ID logic

  return (
    <div className="p-8">
      <ChatBox threadId={threadId} />
    </div>
  );
};

export default ChatPage;