'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { supabase } from '@/lib/supabase';
import { NotificationItem } from '@/components/shared/NotificationItem';
import { BellOff, CheckCheck, Loader2 } from 'lucide-react';
import type { Notification } from '@/types';

export default function AdminNotificationsPage() {
  const { profile } = useAuthStore();
  const { t } = useLanguageStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!profile) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!cancelled) {
        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications((data as Notification[]) || []);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [profile]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification || notification.is_read) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setMarkingAll(true);

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-48 mb-2" />
            <div className="skeleton h-4 w-64" />
          </div>
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>
        <div className="glass-card p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <div className="skeleton h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-2 w-2 rounded-full" />
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('admin.notifications')}</h1>
          <p className="text-white/50 mt-1">{t('admin.notificationsSubtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm font-medium disabled:opacity-50 min-h-[44px]"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            {markingAll ? t('common.processing') : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{notifications.length}</p>
          <p className="text-xs text-white/40 mt-1">Total</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{unreadCount}</p>
          <p className="text-xs text-white/40 mt-1">Unread</p>
        </div>
        <div className="glass-card p-4 text-center hidden sm:block">
          <p className="text-2xl font-bold text-emerald-400">{notifications.length - unreadCount}</p>
          <p className="text-xs text-white/40 mt-1">Read</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="p-4 rounded-2xl bg-white/5 mb-4">
              <BellOff className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
            <p className="text-white/40 text-sm max-w-md">
              Platform notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex items-center justify-between text-xs text-white/30 px-1">
          <span>Total: {notifications.length} notifications</span>
          <span>{unreadCount} unread</span>
        </div>
      )}
    </div>
  );
}
