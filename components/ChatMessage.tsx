import React from 'react';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div
        className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-emerald-600 text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
        } ${message.isError ? 'bg-red-50 border-red-200 text-red-800' : ''}`}
      >
        <div className="flex flex-col gap-1">
          {/* Header for AI */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-1 opacity-75 border-b border-gray-100 pb-1">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                 <span className="text-xs font-bold text-emerald-700">⚖️</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                BD Law Assistant Pro
              </span>
            </div>
          )}

          {/* Content */}
          <div className={`${isUser ? 'text-white' : 'text-gray-800'}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
            ) : (
              <MarkdownRenderer content={message.text} />
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-emerald-100' : 'text-gray-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
