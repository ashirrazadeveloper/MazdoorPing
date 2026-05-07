'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { cn, getInitials, timeAgo } from '@/lib/utils';
import { ChatBubble } from '@/components/shared/ChatBubble';
import {
  Search,
  Send,
  ArrowLeft,
  MessageSquare,
  MoreVertical,
  Phone,
  Image,
  Paperclip,
  X,
} from 'lucide-react';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  isRead: boolean;
  senderName?: string;
  senderAvatar?: string | null;
}

// Mock data for fallback
const mockConversations: Conversation[] = [
  {
    id: '1',
    otherUserId: 'emp1',
    otherUserName: 'Fatima Malik',
    otherUserAvatar: null,
    lastMessage: 'I need an electrician for my new office in Gulberg.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    otherUserId: 'emp2',
    otherUserName: 'Ahmed Khan',
    otherUserAvatar: null,
    lastMessage: 'Your bid has been accepted. When can you start?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    otherUserId: 'emp3',
    otherUserName: 'Bilal Builders',
    otherUserAvatar: null,
    lastMessage: 'The project will start next Monday InshaAllah.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    isOnline: true,
  },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      senderId: 'emp1',
      content: 'Assalam o Alaikum! I saw your profile on MazdoorPing.',
      type: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isRead: true,
      senderName: 'Fatima Malik',
    },
    {
      id: 'm2',
      senderId: 'me',
      content: 'Walaikum Assalam! Yes, I am an experienced electrician. How can I help?',
      type: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      isRead: true,
    },
    {
      id: 'm3',
      senderId: 'emp1',
      content: 'I need an electrician for my new office in Gulberg.',
      type: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
      senderName: 'Fatima Malik',
    },
  ],
  '2': [
    {
      id: 'm4',
      senderId: 'me',
      content: 'I can do the plumbing work for Rs. 15,000.',
      type: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
    },
    {
      id: 'm5',
      senderId: 'emp2',
      content: 'Your bid has been accepted. When can you start?',
      type: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isRead: true,
      senderName: 'Ahmed Khan',
    },
  ],
  '3': [
    {
      id: 'm6',
      senderId: 'emp3',
      content: 'The project will start next Monday InshaAllah.',
      type: 'text',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      senderName: 'Bilal Builders',
    },
  ],
};

export default function WorkerChatPage() {
  const { t } = useLanguageStore();
  const { profile } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConvs() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .eq('worker_id', profile?.id)
          .order('last_message_at', { ascending: false })
          .limit(20);

        if (cancelled) return;
        if (data && data.length > 0) {
          setConversations(
            data.map((conv: Record<string, unknown>) => ({
              id: conv.id as string,
              otherUserId: conv.employer_id as string,
              otherUserName: (conv.employer_name as string) || 'Employer',
              otherUserAvatar: (conv.employer_avatar as string) || null,
              lastMessage: (conv.last_message as string) || '',
              lastMessageTime: (conv.last_message_at as string) || '',
              unreadCount: (conv.unread_count as number) || 0,
              isOnline: (conv.is_online as boolean) || false,
            }))
          );
        } else {
          setConversations(mockConversations);
        }
      } catch {
        if (!cancelled) setConversations(mockConversations);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (profile?.id) loadConvs();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const loadMessages = async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50);

        if (data && data.length > 0) {
          setMessages(
            data.map((msg: Record<string, unknown>) => ({
              id: msg.id as string,
              senderId: msg.sender_id as string,
              content: msg.content as string,
              type: (msg.type as 'text' | 'image' | 'file') || 'text',
              createdAt: msg.created_at as string,
              isRead: (msg.is_read as boolean) || false,
              senderName: msg.sender_name as string,
              senderAvatar: msg.sender_avatar as string,
            }))
          );
        } else {
          setMessages(mockMessages[conversationId] || []);
        }
      } catch {
        setMessages(mockMessages[conversationId] || []);
      }
  };

  const openConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    loadMessages(conv.id);
    setShowMobileChat(true);
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const goBack = () => {
    setShowMobileChat(false);
    setActiveConversation(null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: profile?.id || 'me',
      content,
      type: 'text',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await supabase.from('messages').insert({
        conversation_id: activeConversation.id,
        sender_id: profile?.id,
        content,
        type: 'text',
      });
    } catch {
      // Silently fail - message already shown optimistically
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">{t('chat.chatTitle')}</h1>
        <div className="glass-card p-6">
          <div className="skeleton h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-24 mb-2" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="text-2xl font-bold text-white">{t('chat.chatTitle')}</h1>

      <div className="glass-card overflow-hidden flex flex-col lg:flex-row" style={{ minHeight: '70vh' }}>
        {/* Conversation List */}
        <div
          className={cn(
            'w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-e border-white/[0.06] flex flex-col',
            showMobileChat ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Search */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder={t('chat.searchConversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-10 pr-10 py-2.5 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MessageSquare className="w-12 h-12 text-white/10 mb-3" />
                <p className="text-sm text-white/30">{t('chat.noConversations')}</p>
                <p className="text-xs text-white/20 mt-1">{t('chat.noConversationsDesc')}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors text-start',
                    activeConversation?.id === conv.id && 'bg-white/[0.05]'
                  )}
                >
                  <div className="relative shrink-0">
                    {conv.otherUserAvatar ? (
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10">
                        <img
                          src={conv.otherUserAvatar}
                          alt={conv.otherUserName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                        {getInitials(conv.otherUserName)}
                      </div>
                    )}
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[hsl(222.2,84%,4.9%)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white truncate">{conv.otherUserName}</h3>
                      <span className="text-[10px] text-white/25 shrink-0 ml-2">
                        {timeAgo(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-white/35 truncate pr-2">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold px-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div
          className={cn(
            'flex-1 flex flex-col min-h-0',
            !showMobileChat ? 'hidden lg:flex' : 'flex'
          )}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={goBack}
                    className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    {activeConversation.otherUserAvatar ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                        <img
                          src={activeConversation.otherUserAvatar}
                          alt={activeConversation.otherUserName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {getInitials(activeConversation.otherUserName)}
                      </div>
                    )}
                    {activeConversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[hsl(222.2,84%,4.9%)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{activeConversation.otherUserName}</h3>
                    <p className="text-[11px] text-white/35">
                      {activeConversation.isOnline ? t('chat.online') : t('chat.offline')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg.content}
                    isOwn={msg.senderId === profile?.id || msg.senderId === 'me'}
                    time={
                      msg.createdAt === new Date().toISOString()
                        ? t('chat.justNow')
                        : timeAgo(msg.createdAt)
                    }
                    senderName={msg.senderName || activeConversation.otherUserName}
                    senderAvatar={msg.senderAvatar || activeConversation.otherUserAvatar}
                    type={msg.type}
                    accentColor="emerald"
                    isRead={msg.isRead}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-xl hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0">
                    <Image className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder={t('chat.typeMessage')}
                      className="glass-input w-full px-4 py-2.5 text-sm pr-12"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={cn(
                      'p-2.5 rounded-xl transition-all shrink-0',
                      newMessage.trim()
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-400/40" />
              </div>
              <p className="text-sm text-white/30">{t('chat.noConversations')}</p>
              <p className="text-xs text-white/20 mt-1 max-w-xs">{t('chat.noConversationsDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
