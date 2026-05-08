'use client';

import { Star, Clock, Wrench, Handshake, Coins, MessageCircle, TrendingUp } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

interface CategoryRatingData {
  key: string;
  labelKey: string;
  value: number;
  icon: React.ReactNode;
}

interface RatingBreakdownProps {
  overallRating: number;
  totalReviews: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  categories?: CategoryRatingData[];
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-emerald-400';
  if (rating >= 3) return 'text-amber-400';
  return 'text-red-400';
}

function getBarColor(rating: number): string {
  if (rating >= 4) return 'from-emerald-500 to-emerald-400';
  if (rating >= 3) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
}

function getCategoryIcon(key: string) {
  const icons: Record<string, React.ReactNode> = {
    punctuality: <Clock className="w-3.5 h-3.5" />,
    workQuality: <Wrench className="w-3.5 h-3.5" />,
    behavior: <Handshake className="w-3.5 h-3.5" />,
    valueForMoney: <Coins className="w-3.5 h-3.5" />,
    communication: <MessageCircle className="w-3.5 h-3.5" />,
  };
  return icons[key] || null;
}

export function RatingBreakdown({
  overallRating,
  totalReviews,
  distribution,
  categories,
}: RatingBreakdownProps) {
  const { t } = useLanguageStore();

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= full) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
      } else if (i === full + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-white/10" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-white/10" />);
      }
    }
    return stars;
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Overall Rating Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex flex-col items-center text-center">
          <p className={`text-5xl font-bold ${getRatingColor(overallRating)}`}>
            {overallRating.toFixed(1)}
          </p>
          <div className="flex items-center gap-0.5 mt-2">
            {renderStars(overallRating)}
          </div>
          <p className="text-sm text-white/40 mt-2">
            {t('rating.basedOn')} {totalReviews} {t('rating.reviewsLower')}
          </p>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 w-full max-w-xs space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star as keyof typeof distribution];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-8 text-right shrink-0">{star}★</span>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getBarColor(star)} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-white/30 w-10 text-right shrink-0">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Ratings */}
      {categories && categories.length > 0 && (
        <div className="border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-semibold text-white/60">{t('rating.categoryRatings')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  cat.value >= 4 ? 'bg-emerald-500/15 text-emerald-400'
                    : cat.value >= 3 ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {cat.icon || getCategoryIcon(cat.key)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50">{t(cat.labelKey)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= Math.round(cat.value) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'
                        }`}
                      />
                    ))}
                    <span className={`text-xs font-semibold ml-1 ${getRatingColor(cat.value)}`}>
                      {cat.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
