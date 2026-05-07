'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';
import {
  Send,
  Bot,
  Sparkles,
  Lightbulb,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const EMPLOYER_SYSTEM_PROMPT =
  'You are a helpful business assistant for employers on the MazdoorPing platform. Provide advice in the same language the user writes in (Urdu or English). Keep responses practical and concise. Topics include: writing effective job postings, screening workers, setting budgets, managing projects, team building, and business growth. Be professional and supportive.';

export default function EmployerAIAssistantPage() {
  const { t } = useLanguageStore();
  const welcomeMessage = t('aiChat.welcomeMsg');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    t('aiChat.sugE1'),
    t('aiChat.sugE2'),
    t('aiChat.sugE3'),
    t('aiChat.sugE4'),
    t('aiChat.sugE5'),
    t('aiChat.sugE6'),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || inputValue.trim();
    if (!content || isThinking) return;

    setInputValue('');
    const timestamp = new Date().toISOString();
    const userMsg: AIMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      content,
      createdAt: timestamp,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, role: 'employer' }),
      });
      const data = await res.json();

      const aiTimestamp = new Date().toISOString();
      const aiContent = data.content || 'Sorry, could not generate a response.';
      const aiMsg: AIMessage = {
        id: `ai-${aiTimestamp}`,
        role: 'assistant',
        content: aiContent,
        createdAt: aiTimestamp,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errTimestamp = new Date().toISOString();
      const errorMsg: AIMessage = {
        id: `err-${errTimestamp}`,
        role: 'assistant',
        content: t('aiChat.errorMsg'),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20">
            <Bot className="w-7 h-7 text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{t('aiChat.title')}</h1>
            <p className="text-sm text-white/40">{t('aiChat.subtitleEmployer')}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">{t('aiChat.poweredByAI')}</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card overflow-hidden flex flex-col" style={{ minHeight: '60vh' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar max-h-[50vh]">
          {messages.map((msg) => (
            <div key={msg.id} className="animate-fade-in">
              {msg.role === 'assistant' ? (
                <div className="flex gap-3 max-w-[85%] sm:max-w-[70%]">
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-[10px] text-white/20 mt-1 ml-1">
                      {new Date(msg.createdAt).toLocaleTimeString('en-PK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[70%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-blue-600/15 border border-blue-500/15 backdrop-blur-sm">
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-[10px] text-white/20 mt-1 mr-1 text-end">
                      {new Date(msg.createdAt).toLocaleTimeString('en-PK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex gap-3 animate-fade-in">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-white/40">{t('aiChat.thinking')}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 1 && !isThinking && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-400/50" />
              <span className="text-xs text-white/30 font-medium">Suggestions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(sug)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-start group"
                >
                  <span className="text-xs text-white/40 group-hover:text-blue-400 transition-colors">
                    {i < 3 ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : (
                      <Lightbulb className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors flex-1 truncate">
                    {sug}
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-blue-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 sm:px-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiChat.typeMessage')}
              disabled={isThinking}
              className="glass-input flex-1 px-4 py-3 text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isThinking}
              className={cn(
                'p-3 rounded-xl transition-all shrink-0',
                inputValue.trim() && !isThinking
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-1">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400/50 shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/25 leading-relaxed">{t('aiChat.disclaimer')}</p>
      </div>
    </div>
  );
}
