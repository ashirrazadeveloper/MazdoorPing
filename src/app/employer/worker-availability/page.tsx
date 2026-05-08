'use client';

import { useLanguageStore } from '@/store/language-store';
import {
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';

interface MockDaySlot {
  dayKey: string;
  isAvailable: boolean;
  isAllDay: boolean;
  startTime: string;
  endTime: string;
  note: string;
}

const MOCK_WORKER = {
  name: 'Ahmed Khan',
  role: 'Electrician',
  rating: 4.8,
  city: 'Lahore',
  avatar: null,
};

const MOCK_SCHEDULE: MockDaySlot[] = [
  { dayKey: 'mon', isAvailable: true, isAllDay: false, startTime: '08:00', endTime: '17:00', note: 'Regular hours' },
  { dayKey: 'tue', isAvailable: true, isAllDay: false, startTime: '08:00', endTime: '17:00', note: '' },
  { dayKey: 'wed', isAvailable: true, isAllDay: false, startTime: '09:00', endTime: '16:00', note: 'Late start' },
  { dayKey: 'thu', isAvailable: true, isAllDay: false, startTime: '08:00', endTime: '17:00', note: '' },
  { dayKey: 'fri', isAvailable: true, isAllDay: false, startTime: '08:00', endTime: '13:00', note: 'Half day - Friday prayer' },
  { dayKey: 'sat', isAvailable: false, isAllDay: false, startTime: '09:00', endTime: '17:00', note: '' },
  { dayKey: 'sun', isAvailable: false, isAllDay: false, startTime: '09:00', endTime: '17:00', note: 'Day off' },
];

function getWorkerStatus(schedule: MockDaySlot[]): { status: 'available_now' | 'available_today' | 'not_available'; label: string; color: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon
  const todaySlot = schedule[dayIndex];

  if (!todaySlot || !todaySlot.isAvailable) {
    return { status: 'not_available', label: 'Not Available', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }

  if (todaySlot.isAllDay) {
    return { status: 'available_now', label: 'Available Now', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = todaySlot.startTime.split(':').map(Number);
  const [endH, endM] = todaySlot.endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (currentTime >= startMinutes && currentTime < endMinutes) {
    return { status: 'available_now', label: 'Available Now', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  }

  return { status: 'available_today', label: 'Available Today', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
}

export default function WorkerAvailabilityPage() {
  const { t } = useLanguageStore();
  const workerStatus = getWorkerStatus(MOCK_SCHEDULE);
  const availableCount = MOCK_SCHEDULE.filter((s) => s.isAvailable).length;

  const StatusIcon = workerStatus.status === 'available_now'
    ? CheckCircle2
    : workerStatus.status === 'available_today'
    ? Clock
    : XCircle;

  const getDayLabel = (key: string): string => {
    return t(`availability.${key}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('availability.workerAvailability')}</h1>
        <p className="text-white/50 mt-1 text-sm lg:text-base">
          {MOCK_WORKER.name} - {MOCK_WORKER.role}
        </p>
      </div>

      {/* Worker Card + Status */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-emerald-400">
              {MOCK_WORKER.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">{MOCK_WORKER.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-white/50">{MOCK_WORKER.role}</span>
              <span className="text-white/20">|</span>
              <span className="text-sm text-white/50">{MOCK_WORKER.city}</span>
              <span className="text-white/20">|</span>
              <span className="text-sm text-yellow-400">★ {MOCK_WORKER.rating}</span>
            </div>
          </div>
          <div className={`badge ${workerStatus.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {workerStatus.status === 'available_now'
              ? t('availability.availableNow')
              : workerStatus.status === 'available_today'
              ? t('availability.availableToday')
              : t('availability.notAvailable')}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-bold text-emerald-400">{availableCount}</p>
            <p className="text-xs text-white/40">{t('availability.availableDays')} / 7 {t('availability.daysThisWeek')}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-bold text-blue-400">{MOCK_SCHEDULE.filter(s => s.isAvailable && !s.isAllDay).length}</p>
            <p className="text-xs text-white/40">Part-time days</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-2xl font-bold text-white">{7 - availableCount}</p>
            <p className="text-xs text-white/40">{t('availability.unavailable')} days</p>
          </div>
        </div>
      </div>

      {/* Availability Grid - Read Only */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">{t('availability.viewSchedule')}</h3>
        <div className="space-y-3">
          {MOCK_SCHEDULE.map((slot) => (
            <div
              key={slot.dayKey}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl transition-all ${
                slot.isAvailable
                  ? 'bg-emerald-500/5 border border-emerald-500/10'
                  : 'bg-white/[0.02] border border-white/5 opacity-50'
              }`}
            >
              {/* Day Name */}
              <div className="flex items-center gap-3 sm:w-40 shrink-0">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    slot.isAvailable ? 'bg-emerald-400' : 'bg-gray-500'
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-white">{getDayLabel(slot.dayKey)}</p>
                  <p
                    className={`text-xs font-medium ${
                      slot.isAvailable ? 'text-emerald-400/70' : 'text-white/30'
                    }`}
                  >
                    {slot.isAvailable ? t('availability.available') : t('availability.unavailable')}
                  </p>
                </div>
              </div>

              {/* Time */}
              {slot.isAvailable && (
                <div className="flex items-center gap-3 flex-1">
                  {slot.isAllDay ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      {t('availability.allDay')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-white/60">
                      <Clock className="w-3.5 h-3.5" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                  )}

                  {slot.note && (
                    <span className="flex items-center gap-1 text-xs text-white/30">
                      <MessageSquare className="w-3 h-3" />
                      {slot.note}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
