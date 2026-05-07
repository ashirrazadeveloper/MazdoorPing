'use client';

import { useState } from 'react';
import { Star, Send, Clock, Wrench, Handshake, Coins, MessageCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

interface CategoryRating {
  key: string;
  labelKey: string;
  labelUr: string;
  icon: React.ReactNode;
  value: number;
  hoverValue: number;
}

interface RatingSubmitData {
  punctuality: number;
  workQuality: number;
  behavior: number;
  valueForMoney: number;
  communication: number;
  overall: number;
  review: string;
}

interface AdvancedRatingFormProps {
  workerName?: string;
  onSubmit: (data: RatingSubmitData) => void;
}

export function AdvancedRatingForm({ workerName, onSubmit }: AdvancedRatingFormProps) {
  const { t } = useLanguageStore();
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<CategoryRating[]>([
    { key: 'punctuality', labelKey: 'rating.punctuality', labelUr: 'وقت کی پابندی', icon: <Clock className="w-4 h-4" />, value: 0, hoverValue: 0 },
    { key: 'workQuality', labelKey: 'rating.workQuality', labelUr: 'کام کے معیار', icon: <Wrench className="w-4 h-4" />, value: 0, hoverValue: 0 },
    { key: 'behavior', labelKey: 'rating.behavior', labelUr: 'برتاؤ اور پیشہ ورانہ پن', icon: <Handshake className="w-4 h-4" />, value: 0, hoverValue: 0 },
    { key: 'valueForMoney', labelKey: 'rating.valueForMoney', labelUr: 'پیسے کی قدر', icon: <Coins className="w-4 h-4" />, value: 0, hoverValue: 0 },
    { key: 'communication', labelKey: 'rating.communication', labelUr: 'مواصلت', icon: <MessageCircle className="w-4 h-4" />, value: 0, hoverValue: 0 },
  ]);

  const overallRating = categories.reduce((sum, c) => sum + c.value, 0) / categories.length;
  const allRated = categories.every(c => c.value > 0);

  const handleRate = (catIndex: number, star: number) => {
    setCategories(prev => prev.map((c, i) =>
      i === catIndex ? { ...c, value: star } : c
    ));
  };

  const handleHover = (catIndex: number, star: number) => {
    setCategories(prev => prev.map((c, i) =>
      i === catIndex ? { ...c, hoverValue: star } : c
    ));
  };

  const handleLeave = (catIndex: number) => {
    setCategories(prev => prev.map((c, i) =>
      i === catIndex ? { ...c, hoverValue: 0 } : c
    ));
  };

  const handleSubmit = async () => {
    if (!allRated) return;
    setSubmitting(true);

    const data: RatingSubmitData = {
      punctuality: categories[0].value,
      workQuality: categories[1].value,
      behavior: categories[2].value,
      valueForMoney: categories[3].value,
      communication: categories[4].value,
      overall: Math.round(overallRating * 10) / 10,
      review,
    };

    await onSubmit(data);
    setSubmitting(false);
  };

  const renderStars = (catIndex: number) => {
    const displayValue = categories[catIndex].hoverValue || categories[catIndex].value;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(catIndex, star)}
            onMouseEnter={() => handleHover(catIndex, star)}
            onMouseLeave={() => handleLeave(catIndex)}
            className="p-0.5 transition-transform hover:scale-110"
            aria-label={`${star} star`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= displayValue
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/15'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">{t('rating.rateWorker')}</h2>
        {workerName && (
          <p className="text-white/50 mt-1">
            {t('rating.ratingFor')}: <span className="text-emerald-400 font-medium">{workerName}</span>
          </p>
        )}
      </div>

      {/* Rating Categories */}
      <div className="space-y-4">
        {categories.map((cat, index) => (
          <div
            key={cat.key}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-400">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">{t(cat.labelKey)}</p>
              {cat.value > 0 && (
                <p className="text-xs text-white/30">{cat.value}/5</p>
              )}
            </div>
            {renderStars(index)}
          </div>
        ))}
      </div>

      {/* Overall Rating */}
      <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/10">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">
            {allRated ? overallRating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-white/40 mt-1">{t('rating.overallRating')}</p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                allRated && star <= Math.round(overallRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Text Area */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          {t('rating.writeReview')}
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={t('rating.reviewPlaceholder')}
          rows={3}
          className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/25 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allRated || submitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('common.processing')}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t('rating.submitReview')}
          </>
        )}
      </button>
    </div>
  );
}
