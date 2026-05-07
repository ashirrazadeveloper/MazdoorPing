'use client';

import { useEffect, useState } from 'react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getColor(score: number) {
  if (score >= 90) return { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'text-emerald-400' };
  if (score >= 70) return { stroke: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: 'text-blue-400' };
  return { stroke: 'rgba(255, 255, 255, 0.3)', bg: 'rgba(255, 255, 255, 0.05)', text: 'text-white/50' };
}

function getSize(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm': return { outer: 40, inner: 32, strokeW: 3.5, fontSize: 'text-[10px]' };
    case 'md': return { outer: 56, inner: 46, strokeW: 4, fontSize: 'text-xs' };
    case 'lg': return { outer: 72, inner: 60, strokeW: 5, fontSize: 'text-sm' };
  }
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { outer, inner, strokeW, fontSize } = getSize(size);
  const color = getColor(score);

  const radius = (inner - strokeW) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;
  const center = outer / 2;

  useEffect(() => {
    let frame: number;
    let start = 0;
    const duration = 800;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: outer, height: outer }}>
      <svg width={outer} height={outer} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeW}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.1s ease' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-bold ${color.text} ${fontSize}`}>
        {animatedScore}%
      </span>
    </div>
  );
}
