'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import {
  Award,
  Star,
  Zap,
  Trophy,
  TrendingUp,
  Lock,
  Crown,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WorkerBadgeItem {
  id: string;
  name: string;
  name_ur: string;
  icon: string;
  description: string;
  unlocked: boolean;
  earnedAt?: string;
  xp: number;
}

const badges: WorkerBadgeItem[] = [
  { id: '1', name: 'First Job', name_ur: 'پہلی ملازمت', icon: '🎯', description: 'Complete your first job', unlocked: true, earnedAt: '2024-01-15', xp: 100 },
  { id: '2', name: '5 Jobs Done', name_ur: '5 ملازمتیں', icon: '⭐', description: 'Complete 5 jobs', unlocked: true, earnedAt: '2024-02-20', xp: 250 },
  { id: '3', name: '10 Jobs Star', name_ur: '10 ملازمتیں', icon: '🌟', description: 'Complete 10 jobs', unlocked: false, xp: 500 },
  { id: '4', name: '5 Star Rating', name_ur: '5 اسٹار', icon: '💎', description: 'Maintain 5.0 rating with 5+ reviews', unlocked: true, earnedAt: '2024-03-10', xp: 300 },
  { id: '5', name: 'Top Earner', name_ur: 'ٹاپ کمائنے والا', icon: '💰', description: 'Earn over PKR 100,000', unlocked: false, xp: 750 },
  { id: '6', name: 'Quick Responder', name_ur: 'فوری جواب', icon: '⚡', description: 'Respond within 1 hour', unlocked: true, earnedAt: '2024-01-20', xp: 200 },
  { id: '7', name: '7 Day Streak', name_ur: '7 دن سٹرک', icon: '🔥', description: 'Login 7 consecutive days', unlocked: true, earnedAt: '2024-01-10', xp: 150 },
  { id: '8', name: '30 Day Streak', name_ur: '30 دن سٹرک', icon: '🏆', description: 'Login 30 consecutive days', unlocked: false, xp: 600 },
  { id: '9', name: 'Verified Pro', name_ur: 'تصدیق شدہ', icon: '✅', description: 'CNIC verified + 20 jobs', unlocked: false, xp: 1000 },
  { id: '10', name: 'Review Master', name_ur: 'جائزہ ماسٹر', icon: '🏅', description: 'Receive 20+ positive reviews', unlocked: false, xp: 800 },
];

export default function BadgesPage() {
  const { t, language } = useLanguageStore();
  const [animatedXP, setAnimatedXP] = useState(0);

  const currentXP = 650;
  const maxXP = 1000;
  const currentLevel = 3;
  const totalXP = 1000;
  const unlockedCount = badges.filter(b => b.unlocked).length;

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const increment = currentXP / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= currentXP) {
        setAnimatedXP(currentXP);
        clearInterval(timer);
      } else {
        setAnimatedXP(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [currentXP]);

  const xpPercentage = Math.round((currentXP / maxXP) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3" style={{ animationDelay: '0ms' }}>
        <div className="p-2.5 rounded-xl bg-emerald-500/15">
          <Trophy className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('badges.title')}</h1>
          <p className="text-white/50 mt-0.5 text-sm">{t('badges.subtitle')}</p>
        </div>
      </div>

      {/* Level Progress Card */}
      <div
        className="glass-card p-6 relative overflow-hidden"
        style={{ animationDelay: '100ms' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
                <Crown className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {t('badges.level')} {currentLevel}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {t('badges.professional')}
                  </span>
                </div>
                <p className="text-white/40 text-sm mt-0.5">
                  {animatedXP} / {maxXP} {t('badges.xp')}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-5 h-5" />
              <span className="text-2xl font-bold">{animatedXP}</span>
              <span className="text-white/40 text-sm">{t('badges.xp')}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="progress-bar mb-2">
            <div
              className="progress-bar-fill bg-gradient-to-r from-emerald-600 to-emerald-400"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mb-6">
            {maxXP - currentXP} {t('badges.xpToNext')}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-white/40 text-xs">{t('badges.statsBadges')}</span>
              </div>
              <p className="text-lg font-bold text-white">{unlockedCount}/{badges.length}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-white/40 text-xs">{t('badges.statsLevel')}</span>
              </div>
              <p className="text-lg font-bold text-white">{currentLevel}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-4 h-4 text-emerald-400" />
                <span className="text-white/40 text-xs">{t('badges.totalXp')}</span>
              </div>
              <p className="text-lg font-bold text-white">{totalXP.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        style={{ animationDelay: '200ms' }}
      >
        {badges.map((badge, index) => (
          <div
            key={badge.id}
            className="animate-fade-in"
            style={{ animationDelay: `${200 + index * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <div
              className={`glass-card p-5 text-center relative ${
                badge.unlocked
                  ? 'border-emerald-500/20 hover:border-emerald-500/40'
                  : 'opacity-50'
              }`}
            >
              {/* Lock Icon for Locked Badges */}
              {!badge.unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
              )}

              {/* Unlocked glow shimmer */}
              {badge.unlocked && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/[0.04] to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
                </div>
              )}

              {/* Content */}
              <div className="relative flex flex-col items-center gap-2.5">
                {/* Emoji Icon */}
                <div
                  className={`text-4xl transition-transform duration-300 hover:scale-110 ${
                    !badge.unlocked ? 'grayscale' : ''
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Name */}
                <h3 className={`text-sm font-bold ${badge.unlocked ? 'text-white' : 'text-white/40'}`}>
                  {language === 'ur' ? badge.name_ur : badge.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>

                {/* Earned Date or XP */}
                {badge.unlocked && badge.earnedAt ? (
                  <p className="text-xs text-emerald-400 font-medium">
                    {t('badges.earned')}: {formatDate(badge.earnedAt)}
                  </p>
                ) : (
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-[10px] text-white/40 font-medium">
                      +{badge.xp} XP
                    </span>
                  </div>
                )}

                {/* XP Badge for Unlocked */}
                {badge.unlocked && (
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      +{badge.xp} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
