import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { initializeChat, sendMessageStream } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import { GenerateContentResponse } from "@google/genai";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with greeting
  useEffect(() => {
    const startChat = async () => {
      try {
        await initializeChat();
        setMessages([
          {
            id: 'init-1',
            role: 'model',
            text: "আসসালামু আলাইকুম/নমস্কার! আমি BD Law Assistant Pro। বাংলাদেশের আইনি প্রশ্ন করুন – ধারা, শাস্তি, অধিকার সবকিছু জানান। ফিচার চেঞ্জ করতে 'Help' বলুন। মনে রাখবেন, এটা তথ্য মাত্র – আইনজীবীর পরামর্শ নিন।",
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        console.error("Initialization error", e);
        setMessages([
            {
                id: 'err-1',
                role: 'model',
                text: "সিস্টেম চালু করতে সমস্যা হচ্ছে। দয়া করে API Key চেক করুন।",
                timestamp: new Date(),
                isError: true
            }
        ])
      }
    };
    startChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create a placeholder for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          role: 'model',
          text: '...', // Loading state
          timestamp: new Date(),
        },
      ]);

      const streamResult = await sendMessageStream(userText);
      let fullText = '';

      for await (const chunk of streamResult) {
        const chunkText = (chunk as GenerateContentResponse).text || '';
        fullText += chunkText;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: fullText } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: 'দুঃখিত, একটি ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus back on input after sending (desktop only mainly)
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QuickChip = ({ text, onClick }: { text: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-full transition-colors border border-emerald-200 whitespace-nowrap"
    >
      {text}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden relative border-x border-gray-100">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 shadow-md z-10 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight">BD Law Assistant Pro</h1>
            <div className="flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <p className="text-xs">AI Powered • 2025 Laws</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative scrollbar-hide">
        <div className="flex flex-col gap-2 pb-20">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Suggested Actions (Floating) */}
      <div className="absolute bottom-[88px] left-0 w-full px-4">
        {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade">
                <QuickChip text="মিথ্যা মামলা কি করব?" onClick={() => setInput('মিথ্যা মামলা কি করব?')} />
                <QuickChip text="জমি রেজিস্ট্রেশন খরচ" onClick={() => setInput('জমি রেজিস্ট্রেশন খরচ কত?')} />
                <QuickChip text="তালাক আইন" onClick={() => setInput('তালাক আইন সম্পর্কে বলুন')} />
                <QuickChip text="English Mode" onClick={() => setInput('Switch to English mode')} />
                <QuickChip text="ধারা ৩০২" onClick={() => setInput('ধারা ৩০২ এর শাস্তি কি?')} />
            </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="bg-white p-4 border-t border-gray-200 shrink-0">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-4 py-2 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
             <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="বাংলাদেশের আইন সম্পর্কে প্রশ্ন লিখুন..."
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 py-2 max-h-32 overflow-y-auto"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-full flex items-center justify-center transition-all duration-200 ${
              !input.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200'
            }`}
          >
            {isLoading ? (
               <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
                সতর্কতা: এটি আইনি পরামর্শ নয়। তথ্যের জন্য আইনজীবীর সাহায্য নিন।
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
