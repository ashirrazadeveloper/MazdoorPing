'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
} from 'lucide-react';
import type { Category } from '@/types';
import { useLanguageStore } from '@/store/language-store';

interface JobFormData {
  title: string;
  description: string;
  category_id: string;
  budget_min: string;
  budget_max: string;
  budget_type: 'fixed' | 'hourly';
  city: string;
  province: string;
  address: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  duration_days: string;
  workers_needed: string;
  requirements: string[];
  is_featured: boolean;
}

const initialFormData: JobFormData = {
  title: '',
  description: '',
  category_id: '',
  budget_min: '',
  budget_max: '',
  budget_type: 'fixed',
  city: '',
  province: '',
  address: '',
  urgency: 'medium',
  start_date: '',
  duration_days: '',
  workers_needed: '1',
  requirements: [''],
  is_featured: false,
};

const provinces = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
];

export default function PostJobPage() {
  const { employerProfile } = useAuthStore();
  const { t } = useLanguageStore();
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (data) setCategories(data);
      setLoading(false);
    })();
  }, []);

  const updateField = (field: keyof JobFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((r, i) => (i === index ? value : r)),
    }));
  };

  const validate = (): boolean => {
    if (!formData.title.trim()) { setError('Job title is required'); return false; }
    if (!formData.description.trim()) { setError('Description is required'); return false; }
    if (!formData.category_id) { setError('Please select a category'); return false; }
    if (!formData.budget_min || parseFloat(formData.budget_min) < 0) { setError('Minimum budget must be a positive number'); return false; }
    if (!formData.budget_max || parseFloat(formData.budget_max) < 0) { setError('Maximum budget must be a positive number'); return false; }
    if (parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) { setError('Minimum budget cannot exceed maximum budget'); return false; }
    if (!formData.city.trim()) { setError('City is required'); return false; }
    if (!formData.province) { setError('Province is required'); return false; }
    if (!formData.start_date) { setError('Start date is required'); return false; }
    if (!formData.duration_days || parseInt(formData.duration_days) < 1) { setError('Duration must be at least 1 day'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;
    if (!employerProfile?.id) {
      setError('Employer profile not found. Please complete your profile first.');
      return;
    }

    setSubmitting(true);

    try {
      const validRequirements = formData.requirements.filter((r) => r.trim());

      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          employer_id: employerProfile.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category_id: formData.category_id,
          budget_min: parseFloat(formData.budget_min),
          budget_max: parseFloat(formData.budget_max),
          budget_type: formData.budget_type,
          city: formData.city.trim(),
          province: formData.province,
          address: formData.address.trim(),
          urgency: formData.urgency,
          start_date: formData.start_date,
          duration_days: parseInt(formData.duration_days),
          workers_needed: parseInt(formData.workers_needed) || 1,
          requirements: validRequirements,
          is_featured: formData.is_featured,
          status: 'open',
          views_count: 0,
          bids_count: 0,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setSubmitting(false);
        return;
      }

      await supabase.rpc('increment_employer_job_count', { employer_id: employerProfile.id });

      setSuccess(true);
      setFormData(initialFormData);
    } catch {
      setError('Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-72" />
        <div className="glass-card p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Job Posted Successfully!</h2>
          <p className="text-white/50 mb-6">
            Your job listing is now live and workers can start bidding on it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/employer/my-bookings')}
              className="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-medium"
            >
              View My Bookings
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData(initialFormData);
              }}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium"
            >
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Post a New Job</h1>
        <p className="text-white/50 mt-1">Fill in the details to create a new job listing</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Job Details
          </h2>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.jobTitle")} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Need Electrician for Office Wiring"
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.description")} *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the job in detail — scope of work, expectations, special requirements..."
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.category")} *</label>
            <select
              value={formData.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              className="glass-input w-full px-4 py-3 text-sm text-white appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Budget
          </h2>

          <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
            <button
              type="button"
              onClick={() => updateField('budget_type', 'fixed')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                formData.budget_type === 'fixed'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Fixed Price
            </button>
            <button
              type="button"
              onClick={() => updateField('budget_type', 'hourly')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                formData.budget_type === 'hourly'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              Hourly Rate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.budgetMin")} *</label>
              <input
                type="number"
                value={formData.budget_min}
                onChange={(e) => updateField('budget_min', e.target.value)}
                placeholder="e.g., 5000"
                className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.budgetMax")} *</label>
              <input
                type="number"
                value={formData.budget_max}
                onChange={(e) => updateField('budget_max', e.target.value)}
                placeholder="e.g., 15000"
                className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Location
          </h2>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.city")} *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="e.g., Lahore"
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">{t("postJob.province")} *</label>
            <select
              value={formData.province}
              onChange={(e) => updateField('province', e.target.value)}
              className="glass-input w-full px-4 py-3 text-sm text-white appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Select province</option>
              {provinces.map((p) => (
                <option key={p} value={p} className="bg-gray-900">{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Full address for the job location"
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Schedule & Urgency */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Schedule & Urgency
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Duration (days) *</label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) => updateField('duration_days', e.target.value)}
                placeholder="e.g., 7"
                className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Workers Needed
              </label>
              <input
                type="number"
                value={formData.workers_needed}
                onChange={(e) => updateField('workers_needed', e.target.value)}
                placeholder="1"
                className="glass-input w-full px-4 py-3 text-sm text-white placeholder:text-white/30"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => updateField('urgency', e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm text-white appearance-none cursor-pointer"
              >
                <option value="low" className="bg-gray-900">{t("postJob.low")}</option>
                <option value="medium" className="bg-gray-900">{t("postJob.medium")}</option>
                <option value="high" className="bg-gray-900">{t("postJob.high")}</option>
                <option value="urgent" className="bg-gray-900">{t("postJob.urgent")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              Requirements
            </h2>
            <button
              type="button"
              onClick={addRequirement}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder={`Requirement ${index + 1}`}
                  className="glass-input flex-1 px-4 py-2.5 text-sm text-white placeholder:text-white/30"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="glass-card p-6">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Feature this Job</p>
                <p className="text-xs text-white/40">Featured jobs appear at the top of search results</p>
              </div>
            </div>
            <div
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                formData.is_featured ? 'bg-blue-500' : 'bg-white/10'
              }`}
              onClick={() => updateField('is_featured', !formData.is_featured)}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  formData.is_featured ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Briefcase className="w-4 h-4" />
            )}
            {submitting ? 'Posting Job...' : 'Post Job'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
