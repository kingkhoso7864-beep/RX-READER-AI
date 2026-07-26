import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, AlertTriangle, User, RefreshCw, Sparkles, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';

export const FloatingChatBot: React.FC = () => {
  const { isChatOpen, setIsChatOpen, scans, schedule, language } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('rx_reader_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: language === 'ur'
          ? 'میں ایک AI معاون ہوں اور ڈاکٹر نہیں ہوں۔ یہ صرف معلومات کے لیے ہے۔ آپ مجھ سے ادویات، خوراک، اور سائیڈ ایفیکٹس کے بارے میں پوچھ سکتے ہیں۔'
          : 'I am an AI assistant and not a doctor. This is for information only. How can I help you understand your prescriptions or dosages today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('rx_reader_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build prescription context from current scans & schedule
      const currentMedicines = [
        ...schedule.map((s) => ({ name: s.medicineName, dosage: s.dosage, time: s.time })),
        ...scans.flatMap((sc) => sc.medicines.map((m) => ({ name: m.name, dosage: m.dosage, advice: m.foodAdvice }))),
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          prescriptionContext: currentMedicines,
          language: language,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'I am an AI assistant and not a doctor. This is for information only.\n\nCould you please rephrase your question?',
        warning: data.warning || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'I am an AI assistant and not a doctor. This is for information only.\n\nSorry, I encountered a connection issue. Please check your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'bot',
      text: language === 'ur'
        ? 'میں ایک AI معاون ہوں اور ڈاکٹر نہیں ہوں۔ یہ صرف معلومات کے لیے ہے۔ آپ اپنی ادویات کے بارے میں سوال پوچھ سکتے ہیں۔'
        : 'I am an AI assistant and not a doctor. This is for information only. How can I help you understand your prescriptions, side effects, or dosages today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
  };

  return (
    <>
      {/* FLOATING CHAT BUTTON */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0D9488] hover:bg-teal-700 text-white font-sora font-semibold shadow-2xl shadow-teal-600/40 hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse hover:animate-none group"
          aria-label="Open AI Assistant Chat"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#0D9488]" />
          </div>
          <span className="hidden sm:inline text-sm">Ask AI Assistant</span>
        </button>
      )}

      {/* CHAT DRAWER */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:w-[400px] h-full bg-white dark:bg-[#1E293B] shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            
            {/* CHAT HEADER */}
            <div className="p-4 bg-teal-700 dark:bg-teal-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-6 h-6 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-base text-white flex items-center gap-1.5">
                    AI Medical Assistant
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-xs text-teal-100/90">
                    {language === 'ur' ? 'ادویات، خوراک اور سائیڈ ایفیکٹس پوچھیں' : 'Ask about medicines, dosage, side effects'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
                  title="Clear Chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MANDATORY SUBHEADER DISCLAIMER */}
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>I am an AI assistant and not a doctor. This is for information only.</span>
            </div>

            {/* CHAT MESSAGES BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      {isBot ? (
                        <>
                          <Bot className="w-3 h-3 text-teal-600" />
                          <span className="font-semibold text-teal-700 dark:text-teal-400">RxBot</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">You</span>
                          <User className="w-3 h-3" />
                        </>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        isBot
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-xs'
                          : 'bg-[#0D9488] text-white rounded-tr-xs font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* DANGEROUS INTERACTION RED WARNING CARD */}
                    {msg.warning && (
                      <div className="mt-2 max-w-[85%] bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block mb-0.5">Safety Precaution Notice:</strong>
                          <span>{msg.warning}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* THINKING SKELETON */}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-teal-600 font-semibold">
                    <Bot className="w-3 h-3" />
                    <span>RxBot Thinking...</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 rounded-tl-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* PRE-BUILT SUGGESTIONS */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setInputQuestion("Can I take Panadol with Amoxil?")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                Panadol + Amoxil safe?
              </button>
              <button
                onClick={() => setInputQuestion("What are the side effects of Metformin?")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                Metformin side effects?
              </button>
              <button
                onClick={() => setInputQuestion("How to take Risek 20mg?")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                When to take Risek?
              </button>
            </div>

            {/* CHAT INPUT FORM */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1E293B] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={language === 'ur' ? 'سوال یا دوا کا نام لکھیے...' : 'Ask about your medicines...'}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white hover:scale-105 active:scale-95 transition-all shadow-md shadow-teal-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
