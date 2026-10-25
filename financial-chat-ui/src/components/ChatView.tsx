import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { AssistantCard } from './AssistantCard';

interface ChatViewProps {
  messages: ChatMessage[];
  onRetry: (messageId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, onRetry }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex flex-col space-y-6 pb-24 pt-4"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message) => (
        <div key={message.id} id={message.id} className="animate-fade-slide-up">
          {message.role === 'user' ? (
            <MessageBubble message={message} />
          ) : (
            <AssistantCard
              message={message}
              onRetry={message.error ? () => onRetry(message.id) : undefined}
            />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};