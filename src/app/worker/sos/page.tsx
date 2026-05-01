'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import {
  AlertTriangle,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Loader2,
  Navigation,
} from 'lucide-react';
import type { SOSAlert, Bid } from '@/types';

export default function SOSPage() {
  const { workerProfile } = useAuthStore();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [formData, setFormData] = useState({
    message: '',
    jobId: '',
  });

  // Fetch alerts and active bids on mount
  useEffect(() => {
    if (!workerProfile) return;

    let cancelled = false;

    (async () => {
      const [alertsRes, bidsRes] = await Promise.all([
        supabase
          .from('sos_alerts')
          .select('*')
          .eq('worker_id', workerProfile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('bids')
          .select('*, job:jobs(id, title)')
          .eq('worker_id', workerProfile.id)
          .eq('status', 'accepted'),
      ]);

      if (!cancelled) {
        if (alertsRes.data) setAlerts(alertsRes.data as SOSAlert[]);
        if (bidsRes.data) setActiveBids(bidsRes.data as unknown as Bid[]);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [workerProfile]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSubmitMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setSubmitMessage({ type: 'error', text: 'Location permission denied. Please enable location access.' });
            break;
          case error.POSITION_UNAVAILABLE:
            setSubmitMessage({ type: 'error', text: 'Location information is unavailable.' });
            break;
          case error.TIMEOUT:
            setSubmitMessage({ type: 'error', text: 'Location request timed out. Please try again.' });
            break;
          default:
            setSubmitMessage({ type: 'error', text: 'An unknown error occurred getting your location.' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmitSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerProfile?.id) return;
    if (!formData.message.trim()) {
      setSubmitMessage({ type: 'error', text: 'Please describe your emergency.' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    const lat = location?.lat ?? 0;
    const lng = location?.lng ?? 0;

    if (!location) {
      setSubmitting(false);
      setSubmitMessage({ type: 'error', text: 'Could not get your location. Please enable GPS and try again.' });
      return;
    }

    try {
      const { error } = await supabase.from('sos_alerts').insert({
        worker_id: workerProfile.id,
        job_id: formData.jobId || null,
        latitude: lat,
        longitude: lng,
        message: formData.message.trim(),
        status: 'active',
      });

      if (error) {
        setSubmitMessage({ type: 'error', text: error.message });
        return;
      }

      setSubmitMessage({ type: 'success', text: 'SOS Alert sent successfully! Help is on the way. Stay safe.' });
      setFormData({ message: '', jobId: '' });
      setShowForm(false);

      // Refresh alerts
      const { data: alertsData } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('worker_id', workerProfile.id)
        .order('created_at', { ascending: false });
      if (alertsData) setAlerts(alertsData as SOSAlert[]);
    } catch {
      setSubmitMessage({ type: 'error', text: 'Failed to send SOS alert. Please try calling emergency services.' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-white/40" />;
      default:
        return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">SOS Alert</h1>
        <p className="text-white/50 mt-1">Emergency assistance when you need it most</p>
      </div>

      {/* Warning Banner */}
      <div className="glass-card p-4 border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-400">Emergency Use Only</h3>
            <p className="text-sm text-white/50 mt-1">
              Use the SOS button only in genuine emergencies. False alarms may result in account suspension.
              Always try to contact local authorities first.
            </p>
          </div>
        </div>
      </div>

      {/* SOS Button / Form */}
      <div className="glass-card p-6 lg:p-8">
        {!showForm ? (
          <div className="flex flex-col items-center text-center">
            <button
              onClick={() => {
                setShowForm(true);
                setSubmitMessage(null);
                getCurrentLocation();
              }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all hover:scale-105 active:scale-95 mb-6"
            >
              <AlertTriangle className="w-14 h-14 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Activate SOS</h2>
            <p className="text-white/40 text-sm max-w-sm">
              Tap the button to send an emergency alert with your current location to our support team.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Send SOS Alert
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitSOS} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Emergency Description *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="glass-input w-full px-4 py-3 text-sm text-white resize-none"
                  rows={3}
                  placeholder="Describe your emergency situation..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Related Job (optional)</label>
                <select
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="glass-input w-full px-4 py-2.5 text-sm text-white appearance-none"
                >
                  <option value="" className="bg-gray-900">No related job</option>
                  {activeBids.map((bid) => (
                    <option key={bid.id} value={bid.job_id} className="bg-gray-900">
                      {bid.job?.title || 'Unknown Job'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium text-white/70">Your Location</span>
                  {locationLoading && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
                </div>
                {location ? (
                  <p className="text-xs text-white/40">
                    📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    <span className="text-emerald-400 ml-2">Location acquired</span>
                  </p>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-yellow-400">Location not yet acquired</p>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      Get Location
                    </button>
                  </div>
                )}
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-xl border ${
                  submitMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <p className="text-sm">{submitMessage.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all text-sm disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Alert...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send SOS Alert
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Location</h2>
        <div className="w-full h-48 lg:h-64 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/30">Map view</p>
            <p className="text-xs text-white/20 mt-1">Location displayed when SOS is activated</p>
          </div>
        </div>
      </div>

      {/* SOS History */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Alert History</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldAlert className="w-12 h-12 text-white/20 mb-3" />
            <p className="text-white/40 text-sm">No SOS alerts sent</p>
            <p className="text-white/20 text-xs mt-1">Your emergency alert history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/3 transition-all">
                <div className="p-2.5 rounded-lg bg-red-500/10 shrink-0 mt-0.5">
                  {statusIcon(alert.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-white">SOS Alert</h3>
                    <span className={`badge text-xs ${getStatusColor(alert.status)}`}>{alert.status}</span>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">{alert.message}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(alert.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </span>
                    {alert.admin_notes && (
                      <span className="text-yellow-400/60">Note: {alert.admin_notes}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
