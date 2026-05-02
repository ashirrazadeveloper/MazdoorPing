'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { formatDate, getInitials } from '@/lib/utils';
import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import type { Review } from '@/types';
import { useLanguageStore } from '@/store/language-store';

export default function ReviewsPage() {
  const { workerProfile } = useAuthStore();
  const { t } = useLanguageStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingBreakdown, setRatingBreakdown] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [overallRating, setOverallRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!workerProfile) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, from_profile:profiles!reviews_from_user_id_fkey(id, full_name, avatar_url)')
        .eq('to_user_id', workerProfile.user_id)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
        return;
      }

      const fetchedReviews = (data as unknown as Review[]) || [];
      setReviews(fetchedReviews);

      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;

      fetchedReviews.forEach((review) => {
        const r = Math.round(review.rating);
        if (r >= 1 && r <= 5) {
          breakdown[r as keyof typeof breakdown] += 1;
        }
        totalRating += review.rating;
      });

      setRatingBreakdown(breakdown);
      setTotalReviews(fetchedReviews.length);
      setOverallRating(fetchedReviews.length > 0 ? totalRating / fetchedReviews.length : 0);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [workerProfile]);

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className={`${size} text-yellow-400 fill-yellow-400`} />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${size} text-white/10`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${size} text-yellow-400 fill-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className={`${size} text-white/10`} />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center">
            <div className="skeleton h-16 w-16 rounded-2xl mb-4" />
            <div className="skeleton h-8 w-20 mb-2" />
            <div className="skeleton h-4 w-32 mb-6" />
            <div className="w-full max-w-md space-y-3">
              {[5, 4, 3, 2, 1].map((r) => (
                <div key={r} className="flex items-center gap-3">
                  <div className="skeleton h-4 w-4" />
                  <div className="skeleton h-2.5 flex-1 rounded-full" />
                  <div className="skeleton h-4 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t("worker.reviewsTitle")}</h1>
        <p className="text-white/50 mt-1">{t("worker.reviewsSubtitle")}</p>
      </div>

      {/* Overall Rating Card */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-6xl font-bold text-white mb-2">{overallRating.toFixed(1)}</p>
            <div className="flex items-center gap-1 mb-2">
              {renderStars(overallRating, 'w-5 h-5')}
            </div>
            <p className="text-sm text-white/40">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 w-full max-w-md space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown[star as keyof typeof ratingBreakdown];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 shrink-0 w-12">
                    <span className="text-sm text-white/50">{star}</span>
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <MessageSquare className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('worker.noReviews')}</h3>
          <p className="text-white/40 text-sm max-w-md">
            Once you complete jobs, employers can leave reviews about your work. Keep delivering great results!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {review.from_profile?.avatar_url ? (
                    <Image
                      src={review.from_profile.avatar_url}
                      alt={review.from_profile.full_name || 'Reviewer'}
                      className="w-10 h-10 rounded-lg object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-semibold text-white">
                      {getInitials(review.from_profile?.full_name || 'User')}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-white">
                        {review.from_profile?.full_name || 'Anonymous'}
                      </h3>
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.rating, 'w-3.5 h-3.5')}
                      </div>
                    </div>
                    <span className="text-xs text-white/30 shrink-0">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment ? (
                    <p className="text-sm text-white/60 mt-2 leading-relaxed">{review.comment}</p>
                  ) : (
                    <p className="text-sm text-white/30 italic mt-2">{t("worker.noReviewsSub")}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
