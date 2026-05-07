'use client';

import { useState, useMemo } from 'react';
import { Sparkles, MapPin, DollarSign, ChevronDown, ChevronUp, Briefcase, SlidersHorizontal, ArrowRight, Zap } from 'lucide-react';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { useLanguageStore } from '@/store/language-store';
import Link from 'next/link';

type SortOption = 'bestMatch' | 'newest' | 'highestPay';

interface RecommendedJob {
  id: string;
  title: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  city: string;
  matchScore: number;
  postedDaysAgo: number;
  matchReasons: string[];
}

const mockSkills = ['Electrician', 'Plumber', 'Carpenter'];

const allJobs: Omit<RecommendedJob, 'matchScore' | 'matchReasons'>[] = [
  { id: '1', title: 'House Wiring & Electrical Installation', category: 'Electrician', budgetMin: 15000, budgetMax: 25000, city: 'Lahore', postedDaysAgo: 1 },
  { id: '2', title: 'AC Repair and Maintenance', category: 'Electrician', budgetMin: 8000, budgetMax: 12000, city: 'Lahore', postedDaysAgo: 2 },
  { id: '3', title: 'Bathroom Plumbing Renovation', category: 'Plumber', budgetMin: 20000, budgetMax: 35000, city: 'Lahore', postedDaysAgo: 3 },
  { id: '4', title: 'Complete Home Wiring', category: 'Electrician', budgetMin: 30000, budgetMax: 50000, city: 'Islamabad', postedDaysAgo: 1 },
  { id: '5', title: 'Office Furniture Assembly', category: 'Carpenter', budgetMin: 10000, budgetMax: 18000, city: 'Rawalpindi', postedDaysAgo: 5 },
  { id: '6', title: 'Geyser Installation', category: 'Plumber', budgetMin: 5000, budgetMax: 8000, city: 'Lahore', postedDaysAgo: 4 },
  { id: '7', title: 'Electrical Panel Upgrade', category: 'Electrician', budgetMin: 25000, budgetMax: 40000, city: 'Karachi', postedDaysAgo: 6 },
  { id: '8', title: 'Wooden Door Installation', category: 'Carpenter', budgetMin: 12000, budgetMax: 20000, city: 'Lahore', postedDaysAgo: 2 },
  { id: '9', title: 'Generator Wiring', category: 'Electrician', budgetMin: 7000, budgetMax: 10000, city: 'Faisalabad', postedDaysAgo: 7 },
  { id: '10', title: 'Kitchen Cabinet Work', category: 'Carpenter', budgetMin: 40000, budgetMax: 65000, city: 'Islamabad', postedDaysAgo: 1 },
];

const workerCity = 'Lahore';

function calculateMatchScore(job: Omit<RecommendedJob, 'matchScore' | 'matchReasons'>): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  if (mockSkills.includes(job.category)) {
    score += 25;
    reasons.push(`Based on your skills: ${job.category}`);
  } else {
    score -= 10;
  }

  if (job.city === workerCity) {
    score += 15;
    reasons.push(`Near your location: ${job.city}`);
  } else if (['Rawalpindi', 'Islamabad'].includes(job.city)) {
    score += 5;
    reasons.push(`In nearby city: ${job.city}`);
  }

  if (job.postedDaysAgo <= 2) {
    score += 10;
    reasons.push('Recently posted - apply now!');
  }

  if (job.budgetMax >= 30000) {
    score += 5;
    reasons.push('High-value opportunity');
  }

  score = Math.min(99, Math.max(10, score));

  if (reasons.length === 0) {
    reasons.push('Based on your profile and preferences');
  }

  return { score, reasons };
}

export default function RecommendationsPage() {
  const { t } = useLanguageStore();
  const [sortBy, setSortBy] = useState<SortOption>('bestMatch');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    return allJobs.map(job => {
      const { score, reasons } = calculateMatchScore(job);
      return { ...job, matchScore: score, matchReasons: reasons };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'bestMatch': return b.matchScore - a.matchScore;
        case 'newest': return a.postedDaysAgo - b.postedDaysAgo;
        case 'highestPay': return b.budgetMax - a.budgetMax;
        default: return 0;
      }
    });
  }, [sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const sortOptions: { key: SortOption; labelKey: string }[] = [
    { key: 'bestMatch', labelKey: 'recommendations.bestMatch' },
    { key: 'newest', labelKey: 'recommendations.newest' },
    { key: 'highestPay', labelKey: 'recommendations.highestPay' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('recommendations.title')}</h1>
            <p className="text-white/50 mt-0.5 text-sm">{t('recommendations.subtitle')}</p>
          </div>
        </div>
        <Link
          href="/worker/profile"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t('recommendations.improveMatches')}
        </Link>
      </div>

      {/* Sort Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-white/40 shrink-0 mr-1">{t('recommendations.sortBy')}:</span>
        {sortOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              sortBy === opt.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-3">
        {recommendations.map((job) => (
          <div
            key={job.id}
            className="glass-card p-5 hover:border-emerald-500/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 pt-1">
                <MatchScoreBadge score={job.matchScore} size="md" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Briefcase className="w-3 h-3" />
                        {job.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-white/40">
                        <MapPin className="w-3 h-3" />
                        {job.city}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-white/40">
                        <DollarSign className="w-3 h-3" />
                        PKR {job.budgetMin.toLocaleString()} - {job.budgetMax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable Match Reasons */}
                <button
                  onClick={() => toggleExpand(job.id)}
                  className="flex items-center gap-1 mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  {t('recommendations.whyMatch')}
                  {expandedId === job.id ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {expandedId === job.id && (
                  <div className="mt-2 ml-4 space-y-1.5 animate-fade-in">
                    {job.matchReasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-xs text-white/50">{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/worker/jobs"
                className="shrink-0 hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/10"
              >
                {t('recommendations.viewJob')}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (shown when no recommendations) */}
      {recommendations.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <Sparkles className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('recommendations.noSkillsTitle')}</h3>
          <p className="text-white/40 text-sm max-w-md mb-4">
            {t('recommendations.noSkillsDesc')}
          </p>
          <Link
            href="/worker/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all border border-emerald-500/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('recommendations.addSkills')}
          </Link>
        </div>
      )}
    </div>
  );
}
