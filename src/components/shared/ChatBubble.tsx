'use client';

import { cn } from '@/lib/utils';
import { Check, CheckCheck, ImageIcon, FileText } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface ChatBubbleProps {
  message: string;
  isOwn: boolean;
  time?: string;
  senderName?: string;
  senderAvatar?: string | null;
  type?: 'text' | 'image' | 'file';
  accentColor?: 'emerald' | 'blue';
  isRead?: boolean;
}

export function ChatBubble({
  message,
  isOwn,
  time,
  senderName,
  senderAvatar,
  type = 'text',
  accentColor = 'emerald',
  isRead = false,
}: ChatBubbleProps) {
  const colorClasses =
    accentColor === 'emerald'
      ? {
          own: 'bg-emerald-600/20 border-emerald-500/20',
          other: 'bg-white/[0.04] border-white/[0.08]',
          avatar: 'bg-emerald-500/20 text-emerald-400',
          readIcon: 'text-emerald-400',
        }
      : {
          own: 'bg-blue-600/20 border-blue-500/20',
          other: 'bg-white/[0.04] border-white/[0.08]',
          avatar: 'bg-blue-500/20 text-blue-400',
          readIcon: 'text-blue-400',
        };

  return (
    <div className={cn('flex gap-2.5 animate-fade-in', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {!isOwn && (
        <div className="shrink-0 mt-auto">
          {senderAvatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img
                src={senderAvatar}
                alt={senderName || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                colorClasses.avatar
              )}
            >
              {getInitials(senderName || 'U')}
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={cn('max-w-[75%] sm:max-w-[65%] group', isOwn && 'flex flex-col items-end')}>
        {/* Sender name */}
        {!isOwn && senderName && (
          <p className="text-xs text-white/40 mb-1 px-1 font-medium">{senderName}</p>
        )}

        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl border backdrop-blur-sm',
            isOwn
              ? cn('rounded-br-md', colorClasses.own)
              : cn('rounded-bl-md', colorClasses.other)
          )}
        >
          {/* Image type */}
          {type === 'image' ? (
            <div className="space-y-2">
              <div className="w-full h-48 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                <ImageIcon className="w-8 h-8 text-white/20" />
              </div>
              {message && <p className="text-sm text-white/80">{message}</p>}
            </div>
          ) : /* File type */
          type === 'file' ? (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5">
                <FileText className="w-5 h-5 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{message}</p>
                <p className="text-xs text-white/30">File</p>
              </div>
            </div>
          ) : (
            /* Text type */
            <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap break-words">
              {message}
            </p>
          )}
        </div>

        {/* Time and read receipt */}
        <div className={cn('flex items-center gap-1.5 mt-1 px-1', isOwn && 'flex-row-reverse')}>
          {time && <span className="text-[10px] text-white/25">{time}</span>}
          {isOwn && (
            <span className={cn('flex items-center', isRead ? colorClasses.readIcon : 'text-white/20')}>
              {isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
