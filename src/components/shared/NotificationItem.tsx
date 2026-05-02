'use client';

import { Bell, MessageCircle, Shield, AlertTriangle, Settings } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Notification } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  job: <Bell className="w-4 h-4 text-blue-400" />,
  bid: <MessageCircle className="w-4 h-4 text-emerald-400" />,
  payment: <span className="text-sm font-bold text-yellow-400">₨</span>,
  verification: <Shield className="w-4 h-4 text-violet-400" />,
  sos: <AlertTriangle className="w-4 h-4 text-red-400" />,
  system: <Settings className="w-4 h-4 text-white/50" />,
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <div
      onClick={() => onRead?.(notification.id)}
      className={`flex items-start gap-3 p-4 rounded-xl transition-all cursor-pointer ${
        notification.is_read ? 'bg-transparent hover:bg-white/3' : 'bg-white/5 hover:bg-white/8'
      }`}
    >
      <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">
        {iconMap[notification.type] || iconMap.system}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-white truncate">{notification.title}</h4>
          {!notification.is_read && <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
        </div>
        <p className="text-sm text-white/50 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-white/30 mt-1">{timeAgo(notification.created_at)}</p>
      </div>
    </div>
  );
}
