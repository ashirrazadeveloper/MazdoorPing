'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  earnedDate?: string | null;
  color?: string;
}

export function BadgeCard({ name, description, icon, isUnlocked, earnedDate, color = 'emerald' }: BadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const colorMap: Record<string, { border: string; bg: string; glow: string; text: string; shimmerBg: string }> = {
    emerald: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      glow: '0 0 24px hsl(var(--worker-glow))',
      text: 'text-emerald-400',
      shimmerBg: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    },
    blue: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-500/10',
      glow: '0 0 24px rgba(59, 130, 246, 0.3)',
      text: 'text-blue-400',
      shimmerBg: 'from-blue-500/20 via-blue-400/10 to-transparent',
    },
    yellow: {
      border: 'border-yellow-500/40',
      bg: 'bg-yellow-500/10',
      glow: '0 0 24px rgba(234, 179, 8, 0.3)',
      text: 'text-yellow-400',
      shimmerBg: 'from-yellow-500/20 via-yellow-400/10 to-transparent',
    },
    purple: {
      border: 'border-violet-500/40',
      bg: 'bg-violet-500/10',
      glow: '0 0 24px rgba(139, 92, 246, 0.3)',
      text: 'text-violet-400',
      shimmerBg: 'from-violet-500/20 via-violet-400/10 to-transparent',
    },
    rose: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      glow: '0 0 24px rgba(244, 63, 94, 0.3)',
      text: 'text-rose-400',
      shimmerBg: 'from-rose-500/20 via-rose-400/10 to-transparent',
    },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <div
      className={`relative rounded-2xl p-5 transition-all duration-300 cursor-default ${
        isUnlocked
          ? `${c.border} ${c.bg} hover:shadow-lg`
          : 'bg-white/[0.02] border border-white/5 opacity-70'
      }`}
      style={{
        ...(isUnlocked ? { boxShadow: isHovered ? c.glow : 'none' } : {}),
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer effect for unlocked badges */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Lock overlay for locked badges */}
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-2xl bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="p-2 rounded-full bg-white/10">
            <Lock className="w-4 h-4 text-white/40" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-0 flex flex-col items-center text-center gap-3">
        {/* Icon */}
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-2xl text-3xl transition-all duration-300 ${
            isUnlocked ? '' : 'grayscale opacity-40'
          }`}
        >
          {icon}
        </div>

        {/* Name */}
        <h3
          className={`text-sm font-bold transition-colors duration-300 ${
            isUnlocked ? 'text-white' : 'text-white/40'
          }`}
        >
          {name}
        </h3>

        {/* Description */}
        <p
          className={`text-xs leading-relaxed transition-colors duration-300 line-clamp-2 ${
            isUnlocked ? 'text-white/60' : 'text-white/30'
          }`}
        >
          {description}
        </p>

        {/* Status */}
        {isUnlocked && earnedDate ? (
          <p className={`text-[10px] font-medium ${c.text}`}>
            {formatDate(earnedDate)}
          </p>
        ) : !isUnlocked ? (
          <p className="text-[10px] font-medium text-white/20">
            <Lock className="w-3 h-3 inline mr-1" />
            Locked
          </p>
        ) : null}
      </div>
    </div>
  );
}
