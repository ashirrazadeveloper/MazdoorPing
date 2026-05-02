'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Camera,
  Building2,
  Globe,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  SkipForward,
  Upload,
  X,
  Briefcase,
  DollarSign,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Wrench,
  Paintbrush,
  Zap,
  Thermometer,
  Shield,
  Car,
  Scissors,
  TreePine,
  ChefHat,
  Flame,
  Hammer,
  Wind,
  HardHat,
  Edit3,
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const COMPANY_TYPES = [
  'Individual',
  'Private Ltd',
  'Partnership',
  'Sole Proprietor',
  'NGO',
  'Government',
];

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const CITIES: Record<string, string[]> = {
  Punjab: [
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sahiwal',
    'Gujrat',
    'Jhelum',
  ],
  Sindh: [
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Larkana',
    'Nawabshah',
    'Mirpurkhas',
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar',
    'Abbottabad',
    'Mardan',
    'Mingora',
    'Kohat',
    'Bannu',
    'Dera Ismail Khan',
  ],
  Balochistan: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza'],
  'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli'],
};

const WORKER_CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: 'Plumber', icon: Wrench },
  { label: 'Electrician', icon: Zap },
  { label: 'Carpenter', icon: Hammer },
  { label: 'Painter', icon: Paintbrush },
  { label: 'Mason', icon: HardHat },
  { label: 'Welder', icon: Flame },
  { label: 'AC Technician', icon: Wind },
  { label: 'Cleaner', icon: Sparkles },
  { label: 'Driver', icon: Car },
  { label: 'Laborer', icon: HardHat },
  { label: 'Tailor', icon: Scissors },
  { label: 'Mechanic', icon: Wrench },
  { label: 'Gardener', icon: TreePine },
  { label: 'Cook', icon: ChefHat },
  { label: 'Security Guard', icon: Shield },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'EasyPaisa' },
];

const STEP_LABELS = [
  { step: 1, title: 'Personal Info', icon: User },
  { step: 2, title: 'Business', icon: Building2 },
  { step: 3, title: 'Preferences', icon: Sparkles },
  { step: 4, title: 'Review', icon: CheckCircle2 },
];

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface WizardFormData {
  // Step 1
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;

  // Step 2
  companyName: string;
  companyType: string;
  businessAddress: string;
  city: string;
  province: string;
  phoneOffice: string;
  bio: string;
  website: string;
  logoUrl: string;

  // Step 3
  workerCategories: string[];
  budgetMin: number;
  budgetMax: number;
  paymentMethod: string;
  notifications: {
    emailBids: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
  };

  // Step 4
  termsAccepted: boolean;
}

const INITIAL_FORM: WizardFormData = {
  fullName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  companyName: '',
  companyType: '',
  businessAddress: '',
  city: '',
  province: '',
  phoneOffice: '',
  bio: '',
  website: '',
  logoUrl: '',
  workerCategories: [],
  budgetMin: 500,
  budgetMax: 50000,
  paymentMethod: 'cash',
  notifications: {
    emailBids: true,
    emailUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
  },
  termsAccepted: false,
};

/* ──────────────────────────────────────────────
   Helper: Upload file to Supabase Storage
   ────────────────────────────────────────────── */

async function uploadFileToStorage(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      console.warn('Storage upload failed:', error.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function EmployerSetupPage() {
  const router = useRouter();
  const { profile, employerProfile, fetchProfiles } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  /* ── Load existing data ── */
  useEffect(() => {
    if (!profile && !employerProfile) {
      // Wait for auth store to initialize
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }

    if (profile || employerProfile) {
      setForm((prev) => ({
        ...prev,
        fullName: profile?.full_name || prev.fullName,
        email: profile?.email || prev.email,
        phone: profile?.phone || prev.phone,
        avatarUrl: profile?.avatar_url || prev.avatarUrl,
        companyName: employerProfile?.company_name || prev.companyName,
        companyType: employerProfile?.company_type || prev.companyType,
        businessAddress: employerProfile?.business_address || prev.businessAddress,
        city: employerProfile?.city || prev.city,
        province: employerProfile?.province || prev.province,
        phoneOffice: employerProfile?.phone_office || prev.phoneOffice,
        bio: employerProfile?.bio || prev.bio,
      }));

      // Load preferences from localStorage
      try {
        const saved = localStorage.getItem('employer-preferences');
        if (saved) {
          const prefs = JSON.parse(saved);
          setForm((prev) => ({
            ...prev,
            ...(prefs.workerCategories ? { workerCategories: prefs.workerCategories } : {}),
            ...(prefs.budgetMin !== undefined ? { budgetMin: prefs.budgetMin } : {}),
            ...(prefs.budgetMax !== undefined ? { budgetMax: prefs.budgetMax } : {}),
            ...(prefs.paymentMethod ? { paymentMethod: prefs.paymentMethod } : {}),
            ...(prefs.notifications ? { notifications: { ...prev.notifications, ...prefs.notifications } } : {}),
          }));
        }
      } catch {
        /* ignore */
      }

      setLoading(false);
    }
  }, [profile, employerProfile]);

  /* ── Field updater ── */
  const updateField = useCallback(
    <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    []
  );

  const updateNested = useCallback(
    (
      parent: 'notifications',
      key: string,
      value: boolean
    ) => {
      setForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [key]: value },
      }));
    },
    []
  );

  /* ── File upload handler ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!profile?.id) return;

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${profile.id}/${Date.now()}.${ext}`;
    const url = await uploadFileToStorage(file, 'avatars', path);
    if (url) updateField('avatarUrl', url);
    setUploadingAvatar(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!profile?.id) return;

    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const path = `logos/${profile.id}/${Date.now()}.${ext}`;
    const url = await uploadFileToStorage(file, 'employers', path);
    if (url) updateField('logoUrl', url);
    setUploadingLogo(false);
  };

  /* ── API save helper ── */
  const saveStep = async (
    step: number,
    data: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/employer/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to save');
        return false;
      }
      return true;
    } catch {
      setError('Network error. Please check your connection.');
      return false;
    }
  };

  /* ── Step navigation ── */
  const goNext = async () => {
    setSaving(true);
    setError(null);

    if (currentStep === 1) {
      if (!form.fullName.trim()) {
        setError('Full name is required.');
        setSaving(false);
        return;
      }
      const ok = await saveStep(1, {
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
      });
      if (!ok) {
        setSaving(false);
        return;
      }
    }

    if (currentStep === 2) {
      const ok = await saveStep(2, {
        companyName: form.companyName,
        companyType: form.companyType,
        businessAddress: form.businessAddress,
        city: form.city,
        province: form.province,
        phoneOffice: form.phoneOffice,
        bio: form.bio,
      });
      if (!ok) {
        setSaving(false);
        return;
      }
    }

    if (currentStep === 3) {
      // Save preferences to localStorage
      try {
        localStorage.setItem(
          'employer-preferences',
          JSON.stringify({
            workerCategories: form.workerCategories,
            budgetMin: form.budgetMin,
            budgetMax: form.budgetMax,
            paymentMethod: form.paymentMethod,
            notifications: form.notifications,
          })
        );
      } catch {
        /* ignore */
      }
    }

    setSaving(false);
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setError(null);
      setCurrentStep((s) => s - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < 4) {
      setError(null);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!form.termsAccepted) {
      setError('Please accept the Terms & Conditions.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const ok = await saveStep(4, {
      personal: {
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
      },
      business: {
        companyName: form.companyName,
        companyType: form.companyType,
        businessAddress: form.businessAddress,
        city: form.city,
        province: form.province,
        phoneOffice: form.phoneOffice,
        bio: form.bio,
      },
    });

    if (ok) {
      await fetchProfiles();
      localStorage.removeItem('employer-setup-step');
      router.push('/employer');
    } else {
      setSubmitting(false);
    }
  };

  const goToStep = (step: number) => {
    // Allow jumping to completed or current step
    setError(null);
    setCurrentStep(step);
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
        <p className="text-white/50 text-sm">Loading your profile data...</p>
      </div>
    );
  }

  /* ──────────────────────────────────────────────
     Render
     ────────────────────────────────────────────── */

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Profile Setup
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Complete Your Employer Profile
        </h1>
        <p className="text-white/40 mt-2 text-sm max-w-md mx-auto">
          Set up your profile to start posting jobs and hiring skilled workers.
          You can always update it later.
        </p>
      </div>

      {/* ── Progress Bar ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <div key={s.step} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => goToStep(s.step)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30 scale-110'
                        : isCompleted
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/50'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-blue-400'
                        : isCompleted
                          ? 'text-white/60'
                          : 'text-white/30'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>

                {idx < STEP_LABELS.length - 1 && (
                  <div className="flex-1 mx-3 hidden sm:block">
                    <div
                      className={`h-0.5 rounded-full transition-all duration-500 ${
                        currentStep > s.step
                          ? 'bg-blue-500'
                          : 'bg-white/10'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Step Content ── */}
      <div
        key={currentStep}
        className="glass-card p-6 lg:p-8 animate-fade-in"
      >
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Personal Information
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Let&apos;s start with your basic details.
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group-hover:border-blue-500/30 transition-all">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white/30">
                      {getInitials(form.fullName || 'U')}
                    </span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <User className="w-3.5 h-3.5" />
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="glass-input w-full px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Business Details
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Tell us about your company or business.
              </p>
            </div>

            {/* Logo Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 group-hover:border-blue-500/30 transition-all">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/20" />
                      <span className="text-[10px] text-white/30">Company Logo</span>
                    </>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  Company Name
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Briefcase className="w-3.5 h-3.5" />
                  Company Type
                </label>
                <select
                  value={form.companyType}
                  onChange={(e) => updateField('companyType', e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm appearance-none"
                >
                  <option value="" className="bg-[#0a0a19]">
                    Select type...
                  </option>
                  {COMPANY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0a0a19]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  Province
                </label>
                <select
                  value={form.province}
                  onChange={(e) => {
                    updateField('province', e.target.value);
                    // Reset city when province changes
                    if (form.city) updateField('city', '');
                  }}
                  className="glass-input w-full px-4 py-3 text-sm appearance-none"
                >
                  <option value="" className="bg-[#0a0a19]">
                    Select province...
                  </option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p} className="bg-[#0a0a19]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  City
                </label>
                <select
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  disabled={!form.province}
                  className="glass-input w-full px-4 py-3 text-sm appearance-none disabled:opacity-40"
                >
                  <option value="" className="bg-[#0a0a19]">
                    {form.province ? 'Select city...' : 'Select province first'}
                  </option>
                  {(form.province && CITIES[form.province]
                    ? CITIES[form.province]
                    : []
                  ).map((c) => (
                    <option key={c} value={c} className="bg-[#0a0a19]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  Office Phone
                </label>
                <input
                  type="tel"
                  value={form.phoneOffice}
                  onChange={(e) => updateField('phoneOffice', e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Globe className="w-3.5 h-3.5" />
                  Website URL
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  Business Address
                </label>
                <input
                  type="text"
                  value={form.businessAddress}
                  onChange={(e) =>
                    updateField('businessAddress', e.target.value)
                  }
                  className="glass-input w-full px-4 py-3 text-sm"
                  placeholder="Full business address"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  Business Description / Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={4}
                  className="glass-input w-full px-4 py-3 text-sm resize-none"
                  placeholder="Tell workers about your company, what you do, and the kind of work you offer..."
                />
                <p className="text-[10px] text-white/20">
                  {form.bio.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Preferences
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Customize your experience. Select worker types, budget, and notification preferences.
              </p>
            </div>

            {/* Worker Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                Preferred Worker Categories
                {form.workerCategories.length > 0 && (
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {form.workerCategories.length} selected
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WORKER_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = form.workerCategories.includes(cat.label);
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? form.workerCategories.filter((c) => c !== cat.label)
                          : [...form.workerCategories, cat.label];
                        updateField('workerCategories', updated);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                          : 'bg-white/3 border-white/8 text-white/50 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {cat.label}
                      {isSelected && (
                        <Check className="w-3 h-3 ml-auto text-blue-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                Default Job Budget Range
              </h3>
              <div className="glass-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Budget Range</span>
                  <span className="text-sm font-semibold text-blue-400">
                    PKR {form.budgetMin.toLocaleString()} — PKR {form.budgetMax.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block">
                      Minimum: PKR {form.budgetMin.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min={100}
                      max={200000}
                      step={500}
                      value={form.budgetMin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < form.budgetMax)
                          updateField('budgetMin', val);
                      }}
                      className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 mb-1 block">
                      Maximum: PKR {form.budgetMax.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min={100}
                      max={500000}
                      step={500}
                      value={form.budgetMax}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > form.budgetMin)
                          updateField('budgetMax', val);
                      }}
                      className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Preferred Payment Method
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => updateField('paymentMethod', pm.value)}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                      form.paymentMethod === pm.value
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                        : 'bg-white/3 border-white/8 text-white/50 hover:bg-white/5'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-medium">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                Notification Preferences
              </h3>
              <div className="space-y-2">
                {[
                  {
                    key: 'emailBids' as const,
                    label: 'Email on New Bids',
                    desc: 'Get notified when workers bid on your jobs',
                  },
                  {
                    key: 'emailUpdates' as const,
                    label: 'Email on Job Updates',
                    desc: 'Status changes and completion alerts',
                  },
                  {
                    key: 'smsAlerts' as const,
                    label: 'SMS Alerts',
                    desc: 'Urgent notifications via SMS',
                  },
                  {
                    key: 'pushNotifications' as const,
                    label: 'Push Notifications',
                    desc: 'Browser push notifications for real-time updates',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white/70">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-white/30">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.notifications[item.key]}
                      onClick={() =>
                        updateNested('notifications', item.key, !form.notifications[item.key])
                      }
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                        form.notifications[item.key]
                          ? 'bg-blue-500'
                          : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          form.notifications[item.key]
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                Review & Submit
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Review your information before completing setup.
              </p>
            </div>

            {/* Personal Info Summary */}
            <ReviewSection
              title="Personal Information"
              icon={User}
              onEdit={() => goToStep(1)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center overflow-hidden shrink-0">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white/40">
                      {getInitials(form.fullName || 'U')}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {form.fullName || 'Not provided'}
                  </p>
                  <p className="text-xs text-white/40">{form.email}</p>
                </div>
              </div>
              {form.phone && (
                <ReviewItem icon={Phone} label="Phone" value={form.phone} />
              )}
            </ReviewSection>

            {/* Business Details Summary */}
            <ReviewSection
              title="Business Details"
              icon={Building2}
              onEdit={() => goToStep(2)}
            >
              {form.logoUrl && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {form.companyName || 'Company name not set'}
                    </p>
                    {form.companyType && (
                      <p className="text-xs text-white/40">
                        {form.companyType}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!form.logoUrl && (
                <ReviewItem
                  icon={Building2}
                  label="Company Name"
                  value={form.companyName || 'Not set'}
                />
              )}
              {form.companyType && (
                <ReviewItem
                  icon={Briefcase}
                  label="Company Type"
                  value={form.companyType}
                />
              )}
              {form.businessAddress && (
                <ReviewItem
                  icon={MapPin}
                  label="Address"
                  value={form.businessAddress}
                />
              )}
              {(form.city || form.province) && (
                <ReviewItem
                  icon={MapPin}
                  label="Location"
                  value={[form.city, form.province].filter(Boolean).join(', ')}
                />
              )}
              {form.phoneOffice && (
                <ReviewItem
                  icon={Phone}
                  label="Office Phone"
                  value={form.phoneOffice}
                />
              )}
              {form.website && (
                <ReviewItem
                  icon={Globe}
                  label="Website"
                  value={form.website}
                />
              )}
              {form.bio && (
                <div className="mt-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <p className="text-xs text-white/30 mb-1">Bio</p>
                  <p className="text-sm text-white/60 line-clamp-3">{form.bio}</p>
                </div>
              )}
              {!form.companyName && !form.companyType && !form.businessAddress && (
                <p className="text-sm text-white/30 italic">
                  No business details provided
                </p>
              )}
            </ReviewSection>

            {/* Preferences Summary */}
            <ReviewSection
              title="Preferences"
              icon={Sparkles}
              onEdit={() => goToStep(3)}
            >
              {form.workerCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.workerCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-medium text-blue-400"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              <ReviewItem
                icon={DollarSign}
                label="Budget Range"
                value={`PKR ${form.budgetMin.toLocaleString()} — PKR ${form.budgetMax.toLocaleString()}`}
              />
              <ReviewItem
                icon={CreditCard}
                label="Payment Method"
                value={
                  PAYMENT_METHODS.find((m) => m.value === form.paymentMethod)
                    ?.label || 'Cash'
                }
              />
              <div className="mt-3 space-y-1">
                <p className="text-xs text-white/30">Notifications Enabled:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(form.notifications)
                    .filter(([, v]) => v)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] text-emerald-400"
                      >
                        {key === 'emailBids'
                          ? 'Email Bids'
                          : key === 'emailUpdates'
                            ? 'Email Updates'
                            : key === 'smsAlerts'
                              ? 'SMS Alerts'
                              : 'Push Notifications'}
                      </span>
                    ))}
                  {Object.values(form.notifications).every((v) => !v) && (
                    <span className="text-xs text-white/20">None</span>
                  )}
                </div>
              </div>
            </ReviewSection>

            {/* Terms & Conditions */}
            <div className="p-4 rounded-xl bg-white/3 border border-white/5">
              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={form.termsAccepted}
                  onClick={() =>
                    updateField('termsAccepted', !form.termsAccepted)
                  }
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                    form.termsAccepted
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  {form.termsAccepted && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
                <div>
                  <p className="text-sm text-white/70">
                    I agree to the{' '}
                    <span className="text-blue-400 underline cursor-pointer">
                      Terms & Conditions
                    </span>{' '}
                    and{' '}
                    <span className="text-blue-400 underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </p>
                  <p className="text-[11px] text-white/30 mt-1">
                    By completing setup, you confirm all information is accurate.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Buttons ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentStep === 1
              ? 'opacity-0 pointer-events-none'
              : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Skip button (steps 2 & 3) */}
        {currentStep >= 2 && currentStep <= 3 && (
          <button
            onClick={skipStep}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/50 transition-all disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
        )}

        {/* Next / Submit button */}
        {currentStep < 4 ? (
          <button
            onClick={goNext}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {currentStep === 3 ? 'Review' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.termsAccepted}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Complete Setup
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function ReviewSection({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: LucideIcon;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          {title}
        </h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <Edit3 className="w-3 h-3" />
          Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="p-1.5 rounded-md bg-white/5">
        <Icon className="w-3.5 h-3.5 text-white/30" />
      </div>
      <div>
        <p className="text-[10px] text-white/30">{label}</p>
        <p className="text-white/70">{value}</p>
      </div>
    </div>
  );
}
