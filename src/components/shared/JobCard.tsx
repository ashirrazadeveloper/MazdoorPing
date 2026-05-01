'use client';

import Link from 'next/link';
import { formatCurrency, formatDate, getUrgencyColor, getStatusColor } from '@/lib/utils';
import { MapPin, Clock, Users, Briefcase, Star } from 'lucide-react';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  showActions?: boolean;
  onBid?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
}

export function JobCard({ job, showActions, onBid, onSave }: JobCardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link href={`/worker/jobs/${job.id}`} className="text-lg font-semibold text-white hover:text-white/80 transition-colors truncate block">
            {job.title}
          </Link>
          <p className="text-sm text-white/40 mt-1">
            {job.category?.name || 'General'} • Posted {formatDate(job.created_at)}
          </p>
        </div>
        <span className={`badge ${getStatusColor(job.status)}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-white/60 text-sm mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-white/50">
          <MapPin className="w-3.5 h-3.5" />
          <span>{job.city}, {job.province}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-white/50">
          <Clock className="w-3.5 h-3.5" />
          <span>{job.duration_days} days</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-white/50">
          <Users className="w-3.5 h-3.5" />
          <span>{job.workers_needed} needed</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-white/50">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{job.bids_count || 0} bids</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div>
          <p className={`text-sm font-bold ${getUrgencyColor(job.urgency)}`}>
            {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
          </p>
          <p className="text-xs text-white/30">{job.budget_type}</p>
        </div>
        {showActions && (
          <div className="flex gap-2">
            {onBid && (
              <button onClick={() => onBid(job.id)} className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all">
                Place Bid
              </button>
            )}
            {onSave && (
              <button onClick={() => onSave(job.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <Star className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
