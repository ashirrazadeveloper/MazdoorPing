'use client';

import { useState, useCallback } from 'react';
import { useLanguageStore } from '@/store/language-store';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Clock,
} from 'lucide-react';

interface DaySlot {
  day: string;
  dayKey: string;
  isAvailable: boolean;
  isAllDay: boolean;
  startTime: string;
  endTime: string;
  note: string;
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getWeekDates(offset: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const label = `${monday.toLocaleDateString('en-US', opts)} - ${sunday.toLocaleDateString('en-US', opts)}`;

  return { start: monday, end: sunday, label };
}

function getDefaultSlots(): DaySlot[] {
  return DAY_KEYS.map((key) => ({
    day: key,
    dayKey: key,
    isAvailable: key !== 'sun',
    isAllDay: false,
    startTime: '09:00',
    endTime: '17:00',
    note: '',
  }));
}

export default function AvailabilityPage() {
  const { t } = useLanguageStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<DaySlot[]>(getDefaultSlots);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const weekInfo = getWeekDates(weekOffset);
  const availableCount = slots.filter((s) => s.isAvailable).length;

  const toggleAvailability = (dayKey: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayKey === dayKey ? { ...s, isAvailable: !s.isAvailable } : s
      )
    );
  };

  const toggleAllDay = (dayKey: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayKey === dayKey ? { ...s, isAllDay: !s.isAllDay, isAvailable: true } : s
      )
    );
  };

  const updateTime = (dayKey: string, field: 'startTime' | 'endTime', value: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayKey === dayKey ? { ...s, [field]: value } : s
      )
    );
  };

  const updateNote = (dayKey: string, value: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayKey === dayKey ? { ...s, note: value } : s
      )
    );
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  const getDayLabel = (key: string): string => {
    return t(`availability.${key}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('availability.title')}</h1>
          <p className="text-white/50 mt-1 text-sm lg:text-base">{t('availability.subtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold disabled:opacity-50 min-h-[44px]"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? t('availability.scheduleSaved') : t('availability.saveSchedule')}
        </button>
      </div>

      {/* Week Navigation */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm min-h-[40px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('availability.previousWeek')}</span>
          </button>
          <div className="text-center">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                {weekOffset === 0 ? t('availability.thisWeek') : weekInfo.label}
              </span>
            </div>
            <p className="text-xs text-white/30 mt-1">{weekInfo.label}</p>
          </div>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm min-h-[40px]"
          >
            <span className="hidden sm:inline">{t('availability.nextWeek')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-400">
              {availableCount} / 7
            </p>
            <p className="text-xs text-white/50">
              {t('availability.availableDays')} {t('availability.daysThisWeek')}
            </p>
          </div>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="space-y-3">
        {slots.map((slot) => (
          <div
            key={slot.dayKey}
            className={`glass-card p-4 transition-all ${
              slot.isAvailable
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-white/[0.02] border-white/5 opacity-60'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Day Name + Toggle */}
              <div className="flex items-center gap-3 lg:w-40 shrink-0">
                <button
                  onClick={() => toggleAvailability(slot.dayKey)}
                  className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${
                    slot.isAvailable ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                      slot.isAvailable ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-semibold text-white">{getDayLabel(slot.dayKey)}</p>
                  <p
                    className={`text-xs font-medium ${
                      slot.isAvailable ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    {slot.isAvailable ? t('availability.available') : t('availability.unavailable')}
                  </p>
                </div>
              </div>

              {/* Time Controls */}
              {slot.isAvailable && (
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleAllDay(slot.dayKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] ${
                      slot.isAllDay
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'
                    }`}
                  >
                    {t('availability.allDay')}
                  </button>

                  {!slot.isAllDay && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <label className="text-xs text-white/30">{t('availability.startTime')}</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTime(slot.dayKey, 'startTime', e.target.value)}
                          className="glass-input px-3 py-1.5 text-xs text-white min-w-[100px]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <label className="text-xs text-white/30">{t('availability.endTime')}</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTime(slot.dayKey, 'endTime', e.target.value)}
                          className="glass-input px-3 py-1.5 text-xs text-white min-w-[100px]"
                        />
                      </div>
                    </>
                  )}

                  {slot.isAllDay && (
                    <span className="text-xs text-emerald-400 font-medium">
                      24h - {t('availability.allDay')}
                    </span>
                  )}
                </div>
              )}

              {/* Note */}
              {slot.isAvailable && (
                <input
                  type="text"
                  value={slot.note}
                  onChange={(e) => updateNote(slot.dayKey, e.target.value)}
                  placeholder={t('availability.note')}
                  className="glass-input w-full lg:w-48 px-3 py-2 text-xs text-white placeholder:text-white/30 shrink-0"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
