'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sparkles, MapPin, DollarSign, ChevronDown, ChevronUp, Briefcase, SlidersHorizontal, ArrowRight, Zap, Loader2, Brain, RefreshCw, AlertCircle } from 'lucide-react';
import { MatchScoreBadge } from '@/components/shared/MatchScoreBadge';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { Job, Worker as WorkerType, Category, WorkerSkill } from '@/types';

type SortOption = 'bestMatch' | 'newest' | 'highestPay';

interface RecommendedJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  city: string;
  matchScore: number;
  postedDaysAgo: number;
  matchReasons: string[];
  employerName?: string;
}

// Fallback mock jobs when Supabase returns no data
const fallbackJobs: Omit<RecommendedJob, 'matchScore' | 'matchReasons'>[] = [
  { id: '1', title: 'House Wiring & Electrical Installation', description: 'Complete house wiring for 5-marla house', category: 'Electrician', budgetMin: 15000, budgetMax: 25000, city: 'Lahore', postedDaysAgo: 1 },
  { id: '2', title: 'AC Repair and Maintenance', description: 'Split AC repair and gas refilling', category: 'Electrician', budgetMin: 8000, budgetMax: 12000, city: 'Lahore', postedDaysAgo: 2 },
  { id: '3', title: 'Bathroom Plumbing Renovation', description: 'Complete bathroom plumbing overhaul', category: 'Plumber', budgetMin: 20000, budgetMax: 35000, city: 'Lahore', postedDaysAgo: 3 },
  { id: '4', title: 'Complete Home Wiring', description: 'New construction 10-marla house wiring', category: 'Electrician', budgetMin: 30000, budgetMax: 50000, city: 'Islamabad', postedDaysAgo: 1 },
  { id: '5', title: 'Office Furniture Assembly', description: 'Office desks, chairs, and cabinets assembly', category: 'Carpenter', budgetMin: 10000, budgetMax: 18000, city: 'Rawalpindi', postedDaysAgo: 5 },
  { id: '6', title: 'Geyser Installation', description: 'Instant gas geyser installation with piping', category: 'Plumber', budgetMin: 5000, budgetMax: 8000, city: 'Lahore', postedDaysAgo: 4 },
];

export default function RecommendationsPage() {
  const { t } = useLanguageStore();
  const { workerProfile } = useAuthStore();
  const [sortBy, setSortBy] = useState<SortOption>('bestMatch');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [workerSkills, setWorkerSkills] = useState<WorkerSkill[]>([]);
  const [workerCity, setWorkerCity] = useState('');
  const [workerExpYears, setWorkerExpYears] = useState(0);
  const [workerRating, setWorkerRating] = useState(0);
  const [allJobs, setAllJobs] = useState<Omit<RecommendedJob, 'matchScore' | 'matchReasons'>[]>(fallbackJobs);
  const [profileSummary, setProfileSummary] = useState('');

  // Fetch worker profile data
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!workerProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch worker skills
        const { data: skills } = await supabase
          .from('worker_skills')
          .select('*, category:categories(*)')
          .eq('worker_id', workerProfile.id);

        if (skills && skills.length > 0) {
          setWorkerSkills(skills as WorkerSkill[]);
        }

        // Fetch worker details for city and experience
        const { data: worker } = await supabase
          .from('workers')
          .select('*')
          .eq('id', workerProfile.id)
          .single();

        if (worker) {
          setWorkerCity(worker.city || '');
          const totalExp = (skills || []).reduce((sum: number, s: WorkerSkill) => sum + (s.experience_years || 0), 0);
          const calculatedExp = skills && skills.length > 0 ? Math.round(totalExp / skills.length) : 0;
          setWorkerExpYears(calculatedExp);
          setWorkerRating(worker.rating || 0);

          // Build profile summary
          const skillNames = (skills as WorkerSkill[]).map(s => s.category?.name || 'Unknown').join(', ');
          setProfileSummary(`Worker in ${worker.city || 'Pakistan'}. Skills: ${skillNames}. Rating: ${worker.rating || 'New'}. Experience: ${calculatedExp} years avg.`);
        }

        // Fetch open jobs from Supabase
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*, category:categories(*), employer:employers(profile:profiles(*))')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(30);

        if (jobs && jobs.length > 0) {
          const mappedJobs: Omit<RecommendedJob, 'matchScore' | 'matchReasons'>[] = jobs.map((job: Job) => {
            const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: job.id,
              title: job.title,
              description: job.description,
              category: job.category?.name || 'General',
              budgetMin: job.budget_min,
              budgetMax: job.budget_max,
              city: job.city,
              postedDaysAgo: daysAgo,
              employerName: (job as unknown as { employer?: { profile?: { full_name?: string } } }).employer?.profile?.full_name,
            };
          });
          setAllJobs(mappedJobs);
        }
      } catch (err) {
        console.error('Error fetching worker data for recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, [workerProfile?.id]);

  // AI-based match scoring with full profile analysis
  const calculateMatchScore = (job: Omit<RecommendedJob, 'matchScore' | 'matchReasons'>): { score: number; reasons: string[] } => {
    let score = 30; // Base score
    const reasons: string[] = [];
    const skillNames = workerSkills.map(s => s.category?.name?.toLowerCase() || '');
    const jobCategory = job.category.toLowerCase();

    // === SKILL MATCHING (0-35 points) ===
    const exactSkillMatch = skillNames.some(s => s.includes(jobCategory) || jobCategory.includes(s));
    const partialSkillMatch = skillNames.some(s => {
      const related: Record<string, string[]> = {
        'electrician': ['ac technician', 'electronics', 'solar'],
        'plumber': ['pipe fitter', 'sanitary'],
        'carpenter': ['furniture', 'woodwork', 'joiner'],
        'painter': ['wall finish', 'interior design', 'decorator'],
        'ac technician': ['electrician', 'refrigeration', 'hvac'],
        'mason': ['construction', 'builder', 'concrete'],
        'welder': ['metal work', 'fabrication', 'iron work'],
      };
      return (related[jobCategory] || []).some(r => s.includes(r));
    });

    if (exactSkillMatch) {
      score += 35;
      reasons.push(t('recommendations.exactSkillMatch') || `Perfect skill match: ${job.category}`);
    } else if (partialSkillMatch) {
      score += 20;
      reasons.push(t('recommendations.relatedSkill') || `Related skills match: ${job.category}`);
    } else if (workerSkills.length > 0) {
      // Check if any skill is in the same domain
      score += 5;
      reasons.push(t('recommendations.transferableSkill') || 'Transferable skills applicable');
    }

    // === LOCATION MATCHING (0-20 points) ===
    if (workerCity && job.city) {
      if (job.city.toLowerCase() === workerCity.toLowerCase()) {
        score += 20;
        reasons.push(t('recommendations.sameCity') || `In your city: ${job.city}`);
      } else {
        // Check nearby cities
        const cityGroups: Record<string, string[]> = {
          'lahore': ['lahore', 'sheikhupura', 'kasur', 'gujranwala'],
          'karachi': ['karachi', 'hyderabad', 'thatta', 'badin'],
          'islamabad': ['islamabad', 'rawalpindi', 'taxila', 'murree'],
          'rawalpindi': ['rawalpindi', 'islamabad', 'taxila', 'attock'],
          ' faisalabad': ['faisalabad', 'sargodha', 'jhang', 'toba tek singh'],
          'multan': ['multan', 'bahawalpur', 'sahiwal', 'vehari'],
          'peshawar': ['peshawar', 'nowshera', 'mardan', 'swabi'],
          'quetta': ['quetta', 'sibi', 'zhob', 'chaman'],
        };
        const workerGroup = Object.entries(cityGroups).find(([_, cities]) =>
          cities.some(c => c.toLowerCase() === workerCity.toLowerCase())
        );
        if (workerGroup && workerGroup[1].some(c => c.toLowerCase() === job.city.toLowerCase())) {
          score += 12;
          reasons.push(t('recommendations.nearbyCity') || `Nearby city: ${job.city}`);
        }
      }
    }

    // === RECENCY (0-10 points) ===
    if (job.postedDaysAgo <= 1) {
      score += 10;
      reasons.push(t('recommendations.postedToday') || 'Posted today - apply now!');
    } else if (job.postedDaysAgo <= 3) {
      score += 7;
      reasons.push(t('recommendations.postedRecently') || 'Recently posted');
    } else if (job.postedDaysAgo <= 7) {
      score += 3;
    }

    // === BUDGET VALUE (0-5 points) ===
    if (job.budgetMax >= 30000) {
      score += 5;
      reasons.push(t('recommendations.highValue') || 'High-value opportunity');
    } else if (job.budgetMax >= 15000) {
      score += 3;
    }

    // === EXPERIENCE BONUS (0-5 points) ===
    if (workerExpYears >= 5 && exactSkillMatch) {
      score += 5;
      reasons.push(t('recommendations.experiencedWorker') || 'Your experience makes you ideal');
    } else if (workerExpYears >= 2 && exactSkillMatch) {
      score += 3;
    }

    // === RATING BONUS (0-5 points) ===
    if (workerRating >= 4.5) {
      score += 5;
      reasons.push(t('recommendations.topRated') || 'Your top rating gives you an edge');
    } else if (workerRating >= 4.0) {
      score += 3;
    } else if (workerRating >= 3.5) {
      score += 1;
    }

    score = Math.min(99, Math.max(10, score));

    if (reasons.length === 0) {
      reasons.push(t('recommendations.basedOnProfile') || 'Based on your profile and preferences');
    }

    return { score, reasons };
  };

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
  }, [allJobs, sortBy, workerSkills, workerCity, workerExpYears, workerRating]);

  const handleAIAnalysis = async () => {
    if (analyzing) return;
    setAnalyzing(true);

    try {
      // Use AI to get personalized recommendations
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${profileSummary}\n\nBased on my complete worker profile, suggest the top 3 types of jobs I should focus on to maximize my earnings on MazdoorPing. Also suggest any new skills I should learn. Be specific with job types and expected earnings in PKR.`,
          role: 'worker',
          lang: useLanguageStore.getState().language,
        }),
      });

      const data = await res.json();
      if (data.content) {
        alert(data.content);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const sortOptions: { key: SortOption; labelKey: string }[] = [
    { key: 'bestMatch', labelKey: 'recommendations.bestMatch' },
    { key: 'newest', labelKey: 'recommendations.newest' },
    { key: 'highestPay', labelKey: 'recommendations.highestPay' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('recommendations.analyzingProfile') || 'Analyzing Your Profile...'}</h1>
            <p className="text-white/50 mt-0.5 text-sm">{t('recommendations.pleaseWait') || 'Please wait while we find the best matches for you'}</p>
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          {/* AI Analysis Button */}
          <button
            onClick={handleAIAnalysis}
            disabled={analyzing || workerSkills.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {t('recommendations.aiAnalysis') || 'AI Analysis'}
          </button>
          <Link
            href="/worker/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('recommendations.improveMatches')}
          </Link>
        </div>
      </div>

      {/* Profile Analysis Summary */}
      {workerSkills.length > 0 && (
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {t('recommendations.profileAnalysis') || 'Your Profile Analysis'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-lg font-bold text-white">{workerSkills.length}</p>
              <p className="text-[11px] text-white/40">{t('recommendations.skillsCount') || 'Skills'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-lg font-bold text-white">{workerCity || t('recommendations.notSet') || 'Not Set'}</p>
              <p className="text-[11px] text-white/40">{t('recommendations.cityLabel') || 'City'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-lg font-bold text-white">{workerExpYears} {t('recommendations.years') || 'yrs'}</p>
              <p className="text-[11px] text-white/40">{t('recommendations.avgExp') || 'Avg Experience'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-lg font-bold text-white">{workerRating > 0 ? `${workerRating}` : t('recommendations.newWorker') || 'New'}</p>
              <p className="text-[11px] text-white/40">{t('recommendations.ratingLabel') || 'Rating'}</p>
            </div>
          </div>
          {workerSkills.length === 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300/80">
                {t('recommendations.addSkillsForBetter') || 'Add skills to your profile for more accurate recommendations!'}
              </p>
            </div>
          )}
        </div>
      )}

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
                    {job.description && (
                      <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{job.description}</p>
                    )}
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
                      {job.employerName && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-400/60 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          {job.employerName}
                        </span>
                      )}
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

      {/* Empty State */}
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
