
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
};

export default ChatWindow;
