'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Category } from '@/types';
import {
  User,
  ShieldCheck,
  Wrench,
  MapPin,
  ClipboardCheck,
  Camera,
  Upload,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Edit3,
  AlertCircle,
  Star,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
} from 'lucide-react';

const MapPicker = dynamic(() => import('@/components/shared/MapPicker'), { ssr: false });

// ─── Constants ───────────────────────────────────────────────────────────────────

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
  'Larkana', 'Mardan', 'Mingora', 'Dera Ghazi Khan', 'Sahiwal',
];

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT'];

const SKILL_OPTIONS = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason',
  'Welder', 'AC Technician', 'Cleaner', 'Driver', 'Laborer',
  'Tailor', 'Mechanic', 'Gardener', 'Cook', 'Security Guard',
];

const TOOL_OPTIONS = [
  'Power Drill', 'Hammer', 'Screwdriver Set', 'Wrench Set',
  'Measuring Tape', 'Level', 'Saw', 'Pliers', 'Wire Stripper',
  'Paint Brushes', 'Soldering Iron', ' Welding Machine',
  'Ladder', 'Tool Box', 'Voltage Tester',
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', emoji: '👨' },
  { value: 'female', label: 'Female', emoji: '👩' },
  { value: 'other', label: 'Other', emoji: '🧑' },
];

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'CNIC Verification', icon: ShieldCheck },
  { id: 3, label: 'Skills & Experience', icon: Wrench },
  { id: 4, label: 'Location', icon: MapPin },
  { id: 5, label: 'Review & Submit', icon: ClipboardCheck },
];

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SetupFormData {
  // Step 1
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  city: string;
  province: string;
  address: string;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  // Step 2
  cnicNumber: string;
  cnicFrontFile: File | null;
  cnicFrontPreview: string | null;
  cnicBackFile: File | null;
  cnicBackPreview: string | null;
  // Step 3
  primarySkill: string;
  experienceYears: number;
  hourlyRate: string;
  additionalSkills: string[];
  tools: string[];
  availability: boolean;
  // Step 4
  latitude: number | null;
  longitude: number | null;
  // Step 5
  termsAccepted: boolean;
}

function createDefaultForm(profile: { full_name?: string | null; phone?: string | null } | null): SetupFormData {
  return {
    fullName: profile?.full_name || '',
    dateOfBirth: '',
    gender: '',
    phone: profile?.phone || '',
    city: '',
    province: '',
    address: '',
    bio: '',
    avatarFile: null,
    avatarPreview: null,
    cnicNumber: '',
    cnicFrontFile: null,
    cnicFrontPreview: null,
    cnicBackFile: null,
    cnicBackPreview: null,
    primarySkill: '',
    experienceYears: 0,
    hourlyRate: '',
    additionalSkills: [],
    tools: [],
    availability: true,
    latitude: null,
    longitude: null,
    termsAccepted: false,
  };
}

// ─── Upload Helper ──────────────────────────────────────────────────────────────

async function uploadFile(file: File, path: string): Promise<string | null> {
  try {
    const { error } = await supabase.storage.from('worker-documents').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data: urlData } = supabase.storage.from('worker-documents').getPublicUrl(path);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

// ─── CNIC Format Helper ─────────────────────────────────────────────────────────

function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function isValidCnic(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 13;
}

// ─── Drag & Drop Image Zone ─────────────────────────────────────────────────────

function ImageDropZone({
  label,
  file,
  preview,
  existingUrl,
  onFileChange,
  onRemove,
}: {
  label: string;
  file: File | null;
  preview: string | null;
  existingUrl?: string | null;
  onFileChange: (f: File | null) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const src = preview || existingUrl || null;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      onFileChange(droppedFile);
    }
  }, [onFileChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/70">{label}</label>
      {src ? (
        <div className="relative rounded-xl overflow-hidden border border-emerald-500/20">
          <div className="relative w-full h-48 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={label} className="w-full h-full object-contain" />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-xs text-white/80 truncate">
              {file?.name || 'Previously uploaded'}
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            w-full h-48 rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-all
            ${dragOver
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-white/10 hover:border-white/20 hover:bg-white/3'
            }
          `}
        >
          <div className="p-3 rounded-xl bg-white/5">
            <Upload className="w-6 h-6 text-white/40" />
          </div>
          <div className="text-center">
            <p className="text-sm text-white/60">Drag & drop or <span className="text-emerald-400 font-medium">browse</span></p>
            <p className="text-xs text-white/30 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />
    </div>
  );
}

// ─── Step Icons ─────────────────────────────────────────────────────────────────

function StepIcon({ step, isActive, isCompleted }: { step: typeof STEPS[number]; isActive: boolean; isCompleted: boolean }) {
  const Icon = step.icon;
  return (
    <div className={`
      w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
      ${isCompleted
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
        : isActive
          ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'bg-white/5 text-white/30 border border-white/10'
      }
    `}>
      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function WorkerSetupPage() {
  const router = useRouter();
  const { profile, workerProfile, fetchProfiles } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState<SetupFormData>(() => createDefaultForm(profile));

  // Load categories
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (data) setCategories(data);
    })();
  }, []);

  // Load existing worker data
  useEffect(() => {
    if (!workerProfile || !profile) {
      setInitialLoading(false);
      return;
    }

    // If profile is already complete, redirect
    if (workerProfile.status === 'active') {
      router.replace('/worker');
      return;
    }

    const updates: Partial<SetupFormData> = {};

    if (workerProfile.date_of_birth) updates.dateOfBirth = workerProfile.date_of_birth.split('T')[0];
    if (workerProfile.gender) updates.gender = workerProfile.gender;
    if (workerProfile.city) updates.city = workerProfile.city;
    if (workerProfile.province) updates.province = workerProfile.province;
    if (workerProfile.address) updates.address = workerProfile.address;
    if (workerProfile.bio) updates.bio = workerProfile.bio;
    if (workerProfile.cnic_number) updates.cnicNumber = workerProfile.cnic_number;
    if (workerProfile.cnic_front_url) updates.cnicFrontPreview = workerProfile.cnic_front_url;
    if (workerProfile.cnic_back_url) updates.cnicBackPreview = workerProfile.cnic_back_url;
    // avatar_url comes from profiles table, not workers
    if (profile?.avatar_url) updates.avatarPreview = profile.avatar_url;
    if (workerProfile.hourly_rate) updates.hourlyRate = String(workerProfile.hourly_rate);
    if (workerProfile.latitude) updates.latitude = workerProfile.latitude;
    if (workerProfile.longitude) updates.longitude = workerProfile.longitude;
    if (typeof workerProfile.availability === 'boolean') updates.availability = workerProfile.availability;

    // Load skills
    if (workerProfile.skills && workerProfile.skills.length > 0) {
      const primary = workerProfile.skills.find((s) => s.is_primary);
      if (primary) {
        updates.primarySkill = primary.category?.name || '';
        updates.experienceYears = primary.experience_years;
      }
      const additional = workerProfile.skills
        .filter((s) => !s.is_primary)
        .map((s) => s.category?.name || '');
      if (additional.length > 0) updates.additionalSkills = additional;
    }

    setFormData((prev) => ({ ...prev, ...updates }));
    setInitialLoading(false);
  }, [profile, workerProfile, router, setFormData]);

  // Update form helper
  const updateForm = useCallback((updates: Partial<SetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setMessage(null);
  }, [setFormData]);

  // File preview helper
  const handleFileChange = useCallback((field: 'avatarFile' | 'cnicFrontFile' | 'cnicBackFile', previewField: 'avatarPreview' | 'cnicFrontPreview' | 'cnicBackPreview') => {
    return (file: File | null) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          updateForm({ [field]: file, [previewField]: reader.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        updateForm({ [field]: null, [previewField]: null });
      }
    };
  }, [updateForm]);

  // Auto-save worker data
  const autoSave = useCallback(async (stepData: Partial<SetupFormData>) => {
    if (!workerProfile?.user_id) return;
    try {
      const payload: Record<string, unknown> = {};
      if (stepData.dateOfBirth !== undefined) payload.date_of_birth = stepData.dateOfBirth || null;
      if (stepData.gender !== undefined) payload.gender = stepData.gender || null;
      if (stepData.city !== undefined) payload.city = stepData.city || null;
      if (stepData.province !== undefined) payload.province = stepData.province || null;
      if (stepData.address !== undefined) payload.address = stepData.address || null;
      if (stepData.bio !== undefined) payload.bio = stepData.bio || null;
      if (stepData.cnicNumber !== undefined) payload.cnic_number = stepData.cnicNumber || null;
      if (stepData.hourlyRate !== undefined) payload.hourly_rate = parseFloat(stepData.hourlyRate) || 0;
      if (stepData.availability !== undefined) payload.availability = stepData.availability;
      if (stepData.avatarPreview !== undefined) {
        // avatar_url belongs to profiles table, not workers
        await supabase.from('profiles').update({ avatar_url: stepData.avatarPreview }).eq('id', profile?.id);
      }
      if (stepData.cnicFrontPreview !== undefined) payload.cnic_front_url = stepData.cnicFrontPreview;
      if (stepData.cnicBackPreview !== undefined) payload.cnic_back_url = stepData.cnicBackPreview;

      await supabase
        .from('workers')
        .update(payload)
        .eq('user_id', workerProfile.user_id);
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [workerProfile?.user_id]);

  // Upload files & save step 1
  const saveStep1 = useCallback(async () => {
    if (!workerProfile?.user_id || !profile?.id) return false;
    setSaving(true);
    try {
      // Upload avatar
      if (formData.avatarFile) {
        const ext = formData.avatarFile.name.split('.').pop();
        const path = `${workerProfile.user_id}/avatar.${ext}`;
        const url = await uploadFile(formData.avatarFile, path);
        if (url) updateForm({ avatarPreview: url });
      }

      // Save worker details to workers table (NO avatar_url here - it belongs to profiles)
      const { error: workerError } = await supabase
        .from('workers')
        .update({
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          city: formData.city || null,
          province: formData.province || null,
          address: formData.address || null,
          bio: formData.bio || null,
        })
        .eq('user_id', workerProfile.user_id);

      if (workerError) {
        setMessage({ type: 'error', text: workerError.message });
        setSaving(false);
        return false;
      }

      // Save name + avatar to profiles table
      if (formData.fullName.trim() || formData.avatarPreview) {
        const profileUpdates: Record<string, unknown> = {};
        if (formData.fullName.trim()) profileUpdates.full_name = formData.fullName.trim();
        if (formData.avatarPreview) profileUpdates.avatar_url = formData.avatarPreview;
        await supabase.from('profiles').update(profileUpdates).eq('id', profile.id);
      }

      await fetchProfiles();
      setMessage({ type: 'success', text: 'Personal info saved!' });
      setSaving(false);
      return true;
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
      setSaving(false);
      return false;
    }
  }, [formData, workerProfile, profile, fetchProfiles, updateForm]);

  // Upload CNIC & save step 2
  const saveStep2 = useCallback(async () => {
    if (!workerProfile?.user_id) return false;
    setSaving(true);
    try {
      // Upload CNIC front
      if (formData.cnicFrontFile) {
        const ext = formData.cnicFrontFile.name.split('.').pop();
        const path = `${workerProfile.user_id}/cnic-front.${ext}`;
        const url = await uploadFile(formData.cnicFrontFile, path);
        if (url) updateForm({ cnicFrontPreview: url });
      }

      // Upload CNIC back
      if (formData.cnicBackFile) {
        const ext = formData.cnicBackFile.name.split('.').pop();
        const path = `${workerProfile.user_id}/cnic-back.${ext}`;
        const url = await uploadFile(formData.cnicBackFile, path);
        if (url) updateForm({ cnicBackPreview: url });
      }

      const { error } = await supabase
        .from('workers')
        .update({
          cnic_number: formData.cnicNumber || null,
          cnic_front_url: formData.cnicFrontPreview || null,
          cnic_back_url: formData.cnicBackPreview || null,
        })
        .eq('user_id', workerProfile.user_id);

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setSaving(false);
        return false;
      }

      await fetchProfiles();
      setMessage({ type: 'success', text: 'CNIC info saved!' });
      setSaving(false);
      return true;
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
      setSaving(false);
      return false;
    }
  }, [formData, workerProfile, fetchProfiles, updateForm]);

  // Save step 3
  const saveStep3 = useCallback(async () => {
    if (!workerProfile?.user_id) return false;
    setSaving(true);
    try {
      // Save to workers table
      const { error } = await supabase
        .from('workers')
        .update({
          hourly_rate: parseFloat(formData.hourlyRate) || 0,
          availability: formData.availability,
        })
        .eq('user_id', workerProfile.user_id);

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setSaving(false);
        return false;
      }

      // Save skills - delete old skills and insert new ones
      await supabase.from('worker_skills').delete().eq('worker_id', workerProfile.id);

      const allSkills = [
        formData.primarySkill,
        ...formData.additionalSkills.filter((s) => s !== formData.primarySkill),
      ].filter(Boolean);

      for (const skillName of allSkills) {
        const category = categories.find((c) => c.name === skillName);
        if (category) {
          await supabase.from('worker_skills').insert({
            worker_id: workerProfile.id,
            category_id: category.id,
            experience_years: skillName === formData.primarySkill ? formData.experienceYears : Math.max(1, formData.experienceYears - 2),
            is_primary: skillName === formData.primarySkill,
          });
        }
      }

      await fetchProfiles();
      setMessage({ type: 'success', text: 'Skills saved!' });
      setSaving(false);
      return true;
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
      setSaving(false);
      return false;
    }
  }, [formData, workerProfile, categories, fetchProfiles]);

  // Save step 4
  const saveStep4 = useCallback(async () => {
    if (!workerProfile?.user_id) return false;
    setSaving(true);
    try {
      // Skip location save if no location selected
      if (!formData.latitude || !formData.longitude) {
        setMessage({ type: 'success', text: 'Location step skipped (no location selected).' });
        setSaving(false);
        return true;
      }

      const { error } = await supabase
        .from('workers')
        .update({
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        .eq('user_id', workerProfile.user_id);

      if (error) {
        // If columns don't exist yet, don't block - location will work after migration
        console.warn('Location save warning (run migration to add lat/lng columns):', error.message);
        setMessage({ type: 'success', text: 'Profile saved! (Location columns pending migration)' });
        setSaving(false);
        return true;
      }

      await fetchProfiles();
      setMessage({ type: 'success', text: 'Location saved!' });
      setSaving(false);
      return true;
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
      setSaving(false);
      return false;
    }
  }, [formData, workerProfile, fetchProfiles]);

  // Validation
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) { setMessage({ type: 'error', text: 'Please enter your full name' }); return false; }
        if (formData.bio.length > 0 && formData.bio.length < 50) { setMessage({ type: 'error', text: 'Bio must be at least 50 characters' }); return false; }
        return true;
      case 2:
        if (formData.cnicNumber && !isValidCnic(formData.cnicNumber)) { setMessage({ type: 'error', text: 'Please enter a valid CNIC number (XXXXX-XXXXXXX-X)' }); return false; }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        if (!formData.termsAccepted) { setMessage({ type: 'error', text: 'Please accept the Terms & Conditions' }); return false; }
        return true;
      default:
        return true;
    }
  }, [formData]);

  // Next handler
  const handleNext = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    let success = true;
    if (currentStep === 1) success = await saveStep1();
    else if (currentStep === 2) success = await saveStep2();
    else if (currentStep === 3) success = await saveStep3();
    else if (currentStep === 4) success = await saveStep4();

    if (success) {
      setCurrentStep((s) => Math.min(s + 1, 5));
      setMessage(null);
    }
  }, [currentStep, validateStep, saveStep1, saveStep2, saveStep3, saveStep4]);

  // Skip handler
  const handleSkip = useCallback(() => {
    if (currentStep === 1) return; // Cannot skip step 1
    setCurrentStep((s) => Math.min(s + 1, 5));
    setMessage(null);
  }, [currentStep]);

  // Back handler
  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    setMessage(null);
  }, []);

  // Go to step
  const goToStep = useCallback((step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setMessage(null);
    }
  }, [currentStep]);

  // Final submit
  const handleSubmit = useCallback(async () => {
    if (!validateStep(5)) return;
    if (!workerProfile?.user_id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', workerProfile.user_id);

      if (error) {
        setMessage({ type: 'error', text: error.message });
        setSubmitting(false);
        return;
      }

      await fetchProfiles();
      router.replace('/worker');
    } catch {
      setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
      setSubmitting(false);
    }
  }, [formData, workerProfile, fetchProfiles, router, validateStep]);

  // Compute progress
  const stepProgress = useMemo(() => {
    return STEPS.map((s) => {
      const isCompleted = currentStep > s.id;
      const isActive = currentStep === s.id;
      return { ...s, isCompleted, isActive };
    });
  }, [currentStep]);

  // Step-specific completeness check for review
  const stepCompleteness = useMemo(() => ({
    1: !!(formData.fullName && formData.city && formData.province),
    2: !!(formData.cnicNumber && formData.cnicFrontPreview && formData.cnicBackPreview),
    3: !!(formData.primarySkill),
    4: !!(formData.latitude && formData.longitude),
  }), [formData]);

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Complete Your Profile</h1>
        <p className="text-white/50 mt-2">Set up your worker profile to start receiving job offers</p>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-4">
        {/* Desktop Steps */}
        <div className="hidden md:flex items-center justify-between">
          {stepProgress.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => goToStep(step.id)}
                className="flex flex-col items-center gap-2 group"
                disabled={step.id > currentStep}
              >
                <StepIcon step={step} isActive={step.isActive} isCompleted={step.isCompleted} />
                <span className={`text-xs font-medium transition-colors ${
                  step.isActive ? 'text-emerald-400' : step.isCompleted ? 'text-white/60' : 'text-white/30'
                }`}>
                  {step.label}
                </span>
              </button>
              {i < stepProgress.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 mt-[-1.25rem] transition-colors duration-300 ${
                  step.isCompleted ? 'bg-emerald-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-emerald-400">Step {currentStep} of 5</span>
            <span className="text-xs text-white/40">{STEPS[currentStep - 1].label}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border animate-fade-in ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="glass-card p-6 lg:p-8">
        <div className="animate-fade-in" key={currentStep}>
          {/* ─── Step 1: Personal Info ─────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                <p className="text-white/40 text-sm mt-1">Tell us about yourself</p>
              </div>

              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border-2 border-emerald-500/20 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                    {formData.avatarPreview ? (
                      <Image src={formData.avatarPreview} alt="Avatar" className="w-full h-full object-cover" width={96} height={96} />
                    ) : (
                      getInitials(formData.fullName || 'W')
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange('avatarFile', 'avatarPreview')(e.target.files?.[0] || null)}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateForm({ fullName: e.target.value })}
                  className="glass-input w-full px-4 py-3 text-white placeholder:text-white/30"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateForm({ dateOfBirth: e.target.value })}
                    className="glass-input w-full px-4 py-3 text-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    className="glass-input w-full px-4 py-3 text-white placeholder:text-white/30"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => updateForm({ gender: g.value })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.gender === g.value
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/10 bg-white/3 text-white/60 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{g.emoji}</span>
                      <span className="text-sm font-medium">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">City <span className="text-red-400">*</span></label>
                  <select
                    value={formData.city}
                    onChange={(e) => updateForm({ city: e.target.value })}
                    className="glass-input w-full px-4 py-3 text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-gray-900">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Province <span className="text-red-400">*</span></label>
                  <select
                    value={formData.province}
                    onChange={(e) => updateForm({ province: e.target.value })}
                    className="glass-input w-full px-4 py-3 text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">Select province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p} className="bg-gray-900">{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Complete Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateForm({ address: e.target.value })}
                  className="glass-input w-full px-4 py-3 text-white placeholder:text-white/30 resize-none"
                  rows={2}
                  placeholder="House #, Street, Area..."
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Bio / About Yourself
                  {formData.bio.length > 0 && formData.bio.length < 50 && (
                    <span className="text-yellow-400 ml-2">({50 - formData.bio.length} more characters needed)</span>
                  )}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateForm({ bio: e.target.value })}
                  className="glass-input w-full px-4 py-3 text-white placeholder:text-white/30 resize-none"
                  rows={4}
                  placeholder="Describe your experience, expertise, and what makes you a great worker... (min 50 characters)"
                />
                <p className="text-xs text-white/30 mt-1 text-right">{formData.bio.length} / 500 characters</p>
              </div>
            </div>
          )}

          {/* ─── Step 2: CNIC Verification ──────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white">CNIC Verification</h2>
                <p className="text-white/40 text-sm mt-1">Upload your CNIC for identity verification</p>
              </div>

              {/* Info Card */}
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex gap-3">
                  <Eye className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-white/60 space-y-1">
                    <p>• Make sure all text on your CNIC is clearly readable</p>
                    <p>• Upload both front and back sides of your CNIC</p>
                    <p>• The image should not be blurry or cropped</p>
                    <p>• Your information is kept secure and private</p>
                  </div>
                </div>
              </div>

              {/* CNIC Number */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">CNIC Number</label>
                <input
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => updateForm({ cnicNumber: formatCnic(e.target.value) })}
                  className="glass-input w-full px-4 py-3 text-white placeholder:text-white/30 font-mono tracking-wider"
                  placeholder="XXXXX-XXXXXXX-X"
                  maxLength={15}
                />
                {formData.cnicNumber && !isValidCnic(formData.cnicNumber) && (
                  <p className="text-xs text-yellow-400 mt-1">Format: XXXXX-XXXXXXX-X (13 digits)</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* CNIC Front */}
                <ImageDropZone
                  label="CNIC Front"
                  file={formData.cnicFrontFile}
                  preview={formData.cnicFrontPreview}
                  existingUrl={workerProfile?.cnic_front_url}
                  onFileChange={handleFileChange('cnicFrontFile', 'cnicFrontPreview')}
                  onRemove={() => updateForm({ cnicFrontFile: null, cnicFrontPreview: null })}
                />

                {/* CNIC Back */}
                <ImageDropZone
                  label="CNIC Back"
                  file={formData.cnicBackFile}
                  preview={formData.cnicBackPreview}
                  existingUrl={workerProfile?.cnic_back_url}
                  onFileChange={handleFileChange('cnicBackFile', 'cnicBackPreview')}
                  onRemove={() => updateForm({ cnicBackFile: null, cnicBackPreview: null })}
                />
              </div>
            </div>
          )}

          {/* ─── Step 3: Skills & Experience ────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Skills & Experience</h2>
                <p className="text-white/40 text-sm mt-1">Show employers what you can do</p>
              </div>

              {/* Primary Skill */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Primary Skill</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => updateForm({ primarySkill: formData.primarySkill === skill ? '' : skill })}
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        formData.primarySkill === skill
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/10 bg-white/3 text-white/60 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {formData.primarySkill === skill && <Check className="w-3 h-3 inline mr-1" />}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Slider */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Experience: <span className="text-emerald-400 font-bold">{formData.experienceYears} years</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={formData.experienceYears}
                  onChange={(e) => updateForm({ experienceYears: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>0 years</span>
                  <span>15 years</span>
                  <span>30 years</span>
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Hourly Rate (PKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">Rs.</span>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => updateForm({ hourlyRate: e.target.value })}
                    className="glass-input w-full pl-12 pr-4 py-3 text-white placeholder:text-white/30"
                    placeholder="e.g. 500"
                    min="0"
                  />
                </div>
              </div>

              {/* Additional Skills */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Additional Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS
                    .filter((s) => s !== formData.primarySkill)
                    .map((skill) => {
                      const selected = formData.additionalSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            const updated = selected
                              ? formData.additionalSkills.filter((s) => s !== skill)
                              : [...formData.additionalSkills, skill];
                            updateForm({ additionalSkills: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selected
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : 'border-white/10 bg-white/3 text-white/50 hover:bg-white/5'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 inline mr-1" />}
                          {skill}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Tools Available */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Tools Available</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TOOL_OPTIONS.map((tool) => {
                    const checked = formData.tools.includes(tool);
                    return (
                      <label
                        key={tool}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          checked
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const updated = checked
                              ? formData.tools.filter((t) => t !== tool)
                              : [...formData.tools, tool];
                            updateForm({ tools: updated });
                          }}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                        }`}>
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs text-white/70">{tool}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white/80">Availability</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {formData.availability ? 'You are available for work' : 'You are currently unavailable'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm({ availability: !formData.availability })}
                  className="text-emerald-400 transition-colors"
                >
                  {formData.availability ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-white/30" />}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 4: Location ───────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Set Your Location</h2>
                <p className="text-white/40 text-sm mt-1">Click on the map to set your work area</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                  {formData.latitude && formData.longitude ? (
                    <>
                      <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white/80">Location Selected</p>
                        <p className="text-xs text-white/40 font-mono">
                          {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-emerald-400 ml-auto" />
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-white/30 shrink-0" />
                      <p className="text-sm text-white/40">Click on the map to select your location</p>
                    </>
                  )}
                </div>

                <MapPicker
                  latitude={formData.latitude || 30.3753}
                  longitude={formData.longitude || 69.3451}
                  onLocationSelect={(lat, lng) => updateForm({ latitude: lat, longitude: lng })}
                />

                <p className="text-xs text-white/30 text-center">
                  This helps employers find workers near them. Your exact location is not shown publicly.
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 5: Review & Submit ────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Review & Submit</h2>
                <p className="text-white/40 text-sm mt-1">Make sure everything looks correct</p>
              </div>

              {/* Personal Info Summary */}
              <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white/80">Personal Information</h3>
                  </div>
                  <button
                    onClick={() => goToStep(1)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/30">Name</span>
                    <p className="text-white/70">{formData.fullName || '—'}</p>
                  </div>
                  <div>
                    <span className="text-white/30">Phone</span>
                    <p className="text-white/70">{formData.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-white/30">DOB</span>
                    <p className="text-white/70">{formData.dateOfBirth || '—'}</p>
                  </div>
                  <div>
                    <span className="text-white/30">Gender</span>
                    <p className="text-white/70 capitalize">{formData.gender || '—'}</p>
                  </div>
                  <div>
                    <span className="text-white/30">City</span>
                    <p className="text-white/70">{formData.city || '—'}</p>
                  </div>
                  <div>
                    <span className="text-white/30">Province</span>
                    <p className="text-white/70">{formData.province || '—'}</p>
                  </div>
                </div>
                {formData.bio && (
                  <p className="text-xs text-white/50 mt-2 line-clamp-2">{formData.bio}</p>
                )}
                <div className={`flex items-center gap-1.5 text-xs ${stepCompleteness[1] ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {stepCompleteness[1] ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {stepCompleteness[1] ? 'Complete' : 'Incomplete — name, city, and province are recommended'}
                </div>
              </div>

              {/* CNIC Summary */}
              <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white/80">CNIC Verification</h3>
                  </div>
                  <button
                    onClick={() => goToStep(2)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <span className="text-white/30">CNIC Number</span>
                    <p className="text-white/70 font-mono">{formData.cnicNumber || '—'}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-white/30">Front</span>
                      <p className={formData.cnicFrontPreview ? 'text-emerald-400' : 'text-white/30'}>
                        {formData.cnicFrontPreview ? 'Uploaded ✓' : 'Not uploaded'}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/30">Back</span>
                      <p className={formData.cnicBackPreview ? 'text-emerald-400' : 'text-white/30'}>
                        {formData.cnicBackPreview ? 'Uploaded ✓' : 'Not uploaded'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${stepCompleteness[2] ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {stepCompleteness[2] ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {stepCompleteness[2] ? 'Complete' : 'Incomplete — CNIC helps speed up verification'}
                </div>
              </div>

              {/* Skills Summary */}
              <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white/80">Skills & Experience</h3>
                  </div>
                  <button
                    onClick={() => goToStep(3)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <div className="text-xs space-y-1">
                  {formData.primarySkill && (
                    <p><span className="text-white/30">Primary:</span> <span className="text-emerald-400 font-medium">{formData.primarySkill}</span></p>
                  )}
                  <p><span className="text-white/30">Experience:</span> <span className="text-white/70">{formData.experienceYears} years</span></p>
                  <p><span className="text-white/30">Rate:</span> <span className="text-white/70">{formData.hourlyRate ? `PKR ${formData.hourlyRate}/hr` : '—'}</span></p>
                  {formData.additionalSkills.length > 0 && (
                    <p><span className="text-white/30">Additional:</span> <span className="text-white/70">{formData.additionalSkills.join(', ')}</span></p>
                  )}
                  {formData.tools.length > 0 && (
                    <p><span className="text-white/30">Tools:</span> <span className="text-white/70">{formData.tools.join(', ')}</span></p>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${stepCompleteness[3] ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {stepCompleteness[3] ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {stepCompleteness[3] ? 'Complete' : 'Incomplete — select a primary skill'}
                </div>
              </div>

              {/* Location Summary */}
              <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-semibold text-white/80">Location</h3>
                  </div>
                  <button
                    onClick={() => goToStep(4)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <div className="text-xs">
                  {formData.latitude && formData.longitude ? (
                    <p className="text-white/70 font-mono">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                  ) : (
                    <p className="text-white/30">Location not set</p>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${stepCompleteness[4] ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {stepCompleteness[4] ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {stepCompleteness[4] ? 'Complete' : 'Incomplete — helps employers find you'}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateForm({ termsAccepted: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-all shrink-0 ${
                    formData.termsAccepted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-white/20'
                  }`}>
                    {formData.termsAccepted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-xs text-white/60">
                    I agree to the <span className="text-emerald-400 cursor-pointer hover:underline">Terms & Conditions</span> and{' '}
                    <span className="text-emerald-400 cursor-pointer hover:underline">Privacy Policy</span> of MazdoorPing.
                    I confirm that the information provided is accurate and I am at least 18 years old.
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && currentStep < 5 && (
              <button
                onClick={handleSkip}
                className="px-5 py-2.5 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 transition-all text-sm font-medium"
              >
                Skip for now
              </button>
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-medium disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.termsAccepted}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
