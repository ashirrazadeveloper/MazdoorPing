'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn, formatDateTime, getStatusColor, timeAgo, getInitials } from '@/lib/utils';
import {
  AlertTriangle, MapPin, Clock, Filter, CheckCircle, XCircle,
  X, MessageSquare, User,
} from 'lucide-react';
import type { SOSAlert, SOSStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: SOSStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Dismissed', value: 'dismissed' },
];

type SOSAlertWithWorker = SOSAlert & {
  worker: {
    id: string;
    profile: { id: string; full_name: string; phone: string; email: string };
  };
};

export default function SOSAlertsPage() {
  const [alerts, setAlerts] = useState<SOSAlertWithWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SOSStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SOSAlertWithWorker | null>(null);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchAlerts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sos_alerts')
          .select('*, worker:workers(id, profile:profiles(id, full_name, phone, email))')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!cancelled) setAlerts((data as SOSAlertWithWorker[]) || []);
      } catch (err) {
        console.error('Failed to fetch SOS alerts:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAlerts();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filteredAlerts = alerts.filter(
    (a) => statusFilter === 'all' || a.status === statusFilter
  );

  const activeAlerts = filteredAlerts.filter((a) => a.status === 'active');
  const otherAlerts = filteredAlerts.filter((a) => a.status !== 'active');

  const handleAction = async () => {
    if (!activeAlert || !actionType) return;
    if (!adminNotes.trim()) {
      showToast('Please provide notes', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const newStatus = actionType === 'resolve' ? 'resolved' : 'dismissed';
      const { error } = await supabase
        .from('sos_alerts')
        .update({
          status: newStatus,
          admin_notes: adminNotes.trim(),
          resolved_at: new Date().toISOString(),
        })
        .eq('id', activeAlert.id);

      if (error) throw error;

      showToast(
        `SOS alert ${actionType === 'resolve' ? 'resolved' : 'dismissed'}`,
        'success'
      );
      setActiveAlert(null);
      setActionType(null);
      setAdminNotes('');
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to process SOS alert:', err);
      showToast('Failed to process SOS alert', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (alert: SOSAlertWithWorker, type: 'resolve' | 'dismiss') => {
    setActiveAlert(alert);
    setActionType(type);
    setAdminNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in',
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        )}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            SOS Alerts
          </h1>
          <p className="text-white/50 mt-1">
            {activeAlerts.length > 0 ? (
              <span className="text-red-400 font-medium">{activeAlerts.length} active alert{activeAlerts.length > 1 ? 's' : ''}</span>
            ) : (
              'No active alerts'
            )}
            {' · '}{alerts.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  statusFilter === f.value
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      {activeAlerts.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Active Alert Locations</h2>
          <div className="h-48 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-red-400/50 mx-auto mb-2" />
              <p className="text-sm text-white/30">Map View</p>
              <p className="text-xs text-white/20 mt-1">
                {activeAlerts.length} active alert{activeAlerts.length > 1 ? 's' : ''} on map
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 flex gap-4 items-start">
              <div className="skeleton h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-64" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No SOS alerts found</p>
          <p className="text-white/20 text-sm mt-1">
            {statusFilter !== 'all' ? 'Try a different filter' : 'No alerts have been triggered'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Active Alerts ({activeAlerts.length})
              </h2>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="glass-card p-4 border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent glow-orange animate-fade-in"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 animate-pulse">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                              {getInitials(alert.worker?.profile?.full_name || 'W')}
                            </div>
                            <h3 className="text-sm font-semibold text-white">
                              {alert.worker?.profile?.full_name || 'Unknown Worker'}
                            </h3>
                          </div>
                          <span className="badge text-xs bg-red-500/20 text-red-400 border-red-500/30">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mt-2">{alert.message}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <MapPin className="w-3.5 h-3.5" />
                            {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Clock className="w-3.5 h-3.5" />
                            {timeAgo(alert.created_at)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <User className="w-3.5 h-3.5" />
                            {alert.worker?.profile?.phone || 'N/A'}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => openAction(alert, 'resolve')}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 text-xs font-medium transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Resolve
                          </button>
                          <button
                            onClick={() => openAction(alert, 'dismiss')}
                            disabled={actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Alerts */}
          {otherAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">
                {statusFilter === 'all' ? 'Past Alerts' : `Filtered (${otherAlerts.length})`}
              </h2>
              <div className="space-y-2">
                {otherAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'glass-card p-4',
                      alert.status === 'resolved' && 'border-emerald-500/10',
                      alert.status === 'dismissed' && 'opacity-70'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        alert.status === 'resolved' ? 'bg-emerald-500/10' : 'bg-white/5'
                      )}>
                        {alert.status === 'resolved' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-white/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-white">
                            {alert.worker?.profile?.full_name || 'Unknown Worker'}
                          </h3>
                          <span className={`badge text-xs ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1 truncate">{alert.message}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-white/30">
                            <MapPin className="w-3 h-3" />
                            {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/30">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(alert.created_at)}
                          </div>
                          {alert.resolved_at && (
                            <div className="flex items-center gap-1.5 text-xs text-white/30">
                              <CheckCircle className="w-3 h-3" />
                              Resolved {timeAgo(alert.resolved_at)}
                            </div>
                          )}
                        </div>
                        {alert.admin_notes && (
                          <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-white/[0.02]">
                            <MessageSquare className="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" />
                            <p className="text-xs text-white/30">{alert.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Modal */}
      {activeAlert && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setActiveAlert(null); setActionType(null); }} />
          <div className="relative glass-card p-6 w-full max-w-md">
            <button
              onClick={() => { setActiveAlert(null); setActionType(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'p-2 rounded-lg',
                actionType === 'resolve' ? 'bg-emerald-500/20' : 'bg-white/5'
              )}>
                {actionType === 'resolve' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-white/50" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-white">
                {actionType === 'resolve' ? 'Resolve Alert' : 'Dismiss Alert'}
              </h2>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Worker</span>
                <span className="text-white font-medium">
                  {activeAlert.worker?.profile?.full_name || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Message</span>
                <span className="text-white text-right max-w-[240px] truncate">
                  {activeAlert.message}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Location</span>
                <span className="text-white">
                  {activeAlert.latitude.toFixed(4)}, {activeAlert.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Time</span>
                <span className="text-white">{formatDateTime(activeAlert.created_at)}</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <label className="text-xs text-white/40 uppercase tracking-wider">
                Admin Notes *
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === 'resolve'
                    ? 'Describe the resolution actions taken...'
                    : 'Reason for dismissal...'
                }
                className="glass-input w-full px-4 py-3 text-sm text-white resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setActiveAlert(null); setActionType(null); }}
                className="flex-1 py-2.5 px-4 rounded-xl text-white/50 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!adminNotes.trim() || actionLoading}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  actionType === 'resolve'
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                )}
              >
                {actionLoading ? 'Processing...' : actionType === 'resolve' ? 'Resolve' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
