'use client';

import Link from 'next/link';
import { formatCurrency, formatDate, getUrgencyColor, getStatusColor } from '@/lib/utils';
import { MapPin, Navigation, Clock, Users, Briefcase, Star } from 'lucide-react';
import type { Job } from '@/types';
import { useLanguageStore } from '@/store/language-store';

interface NearbyJobCardProps {
  job: Job;
  distance: number;
}

export function NearbyJobCard({ job, distance }: NearbyJobCardProps) {
  const { t } = useLanguageStore();

  return (
    <div className="glass-card-premium p-5 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Distance badge */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
          <Navigation className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/worker/jobs/${job.id}`} className="text-base font-semibold text-white hover:text-emerald-400 transition-colors truncate block">
                {job.title}
              </Link>
              <p className="text-xs text-white/40 mt-0.5">
                {job.category?.name || t('cards.general')} &bull; {job.city}
              </p>
            </div>
            {/* Distance badge */}
            <div className="flex-shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <p className="text-xs font-bold text-emerald-400">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm text-white/50">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.city}, {job.province}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-white/50">
              <Clock className="w-3.5 h-3.5" />
              <span>{job.duration_days} {t('cards.days')}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-white/50">
              <Users className="w-3.5 h-3.5" />
              <span>{job.workers_needed} {t('cards.needed')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div>
              <p className={`text-sm font-bold ${getUrgencyColor(job.urgency)}`}>
                {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">
                {t('cards.posted')} {formatDate(job.created_at)}
              </p>
            </div>
            <Link
              href={`/worker/jobs/${job.id}`}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
            >
              {t('cards.placeBid')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
