'use client';

import { Star, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import { getInitials, getStatusColor } from '@/lib/utils';
import type { Worker } from '@/types';

interface WorkerCardProps {
  worker: Worker;
  showActions?: boolean;
  onViewProfile?: (workerId: string) => void;
  onSave?: (workerId: string) => void;
}

export function WorkerCard({ worker, showActions, onViewProfile, onSave }: WorkerCardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
          {worker.profile ? getInitials(worker.profile.full_name) : 'W'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate">
              {worker.profile?.full_name || 'Worker'}
            </h3>
            <span className={`badge ${getStatusColor(worker.status)}`}>
              {worker.status}
            </span>
          </div>
          {worker.profile?.phone && (
            <p className="text-sm text-white/40 mb-2">{worker.profile.phone}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-1 text-sm text-white/50">
              <MapPin className="w-3.5 h-3.5" />
              <span>{worker.city}, {worker.province}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-white/50">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{worker.completed_jobs} jobs</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span>{worker.rating.toFixed(1)} ({worker.total_reviews})</span>
            </div>
          </div>
          {worker.skills && worker.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {worker.skills.map((skill) => (
                <span key={skill.id} className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/50 border border-white/10">
                  {skill.category?.name || 'Skill'}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm font-medium text-emerald-400">
            PKR {worker.hourly_rate}/hr {worker.availability && <CheckCircle className="w-3.5 h-3.5 inline text-emerald-400 ml-1" />}
          </p>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
          {onViewProfile && (
            <button onClick={() => onViewProfile(worker.id)} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all">
              View Profile
            </button>
          )}
          {onSave && (
            <button onClick={() => onSave(worker.id)} className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all">
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
}
