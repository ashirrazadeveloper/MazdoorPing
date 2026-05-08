'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { Clock, ShieldCheck, LogOut, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalPage() {
  const { user, profile, signOut, fetchProfiles } = useAuthStore();
  const { language, t } = useLanguageStore();
  const [checking, setChecking] = useState(false);

  // Auto-check approval status every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchProfiles();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchProfiles]);

  const handleRefresh = async () => {
    setChecking(true);
    await fetchProfiles();
    setTimeout(() => setChecking(false), 2000);
  };

  // If approved, redirect to appropriate dashboard
  if (profile?.is_approved) {
    const redirectPath =
      profile.role === 'worker' ? '/worker' :
      profile.role === 'employer' ? '/employer' :
      profile.role === 'admin' ? '/admin' : '/';
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
    return null;
  }

  const isUrdu = language === 'ur';

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isUrdu ? 'اکاؤنٹ تصدیق کا منتظر' : 'Account Pending Approval'}
          </h1>
          <p className="text-white/50 text-sm">
            {isUrdu ? 'آپ کا اکاؤنٹ جلد فعال ہو جائے گا' : 'Your account will be activated soon'}
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-6 sm:p-8 mb-6">
          {/* Animated Clock */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">!</span>
              </div>
            </div>
          </div>

          {/* Premium Message */}
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
              {isUrdu
                ? 'براہ کرم انتظار کریں'
                : 'Please Wait for Verification'}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              {isUrdu
                ? 'آپ کا رجسٹریشن کامیابی سے مکمل ہو گیا ہے۔ ہمارا ایڈمن ٹیم آپ کی تفصیلات کی جانچ کر رہا ہے۔'
                : 'Your registration has been successfully completed. Our admin team is currently reviewing your details to ensure the safety and quality of our platform.'}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">
                  {isUrdu ? 'رجسٹریشن مکمل' : 'Registration Complete'}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {isUrdu ? 'آپ کا اکاؤنٹ کامیابی سے بنا دیا گیا ہے' : 'Your account has been successfully created'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">
                  {isUrdu ? 'ایڈمن تصدیق جاری ہے' : 'Admin Review in Progress'}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {isUrdu ? 'ایڈمن ٹیم آپ کی پروفائل کی تصدیق کر رہا ہے' : 'Admin team is verifying your profile'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-40">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">
                  {isUrdu ? 'اکاؤنٹ فعال' : 'Account Activated'}
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {isUrdu ? 'تصدیق کے بعد آپ مکمل ایپ استعمال کر سکیں گے' : 'Full app access after approval'}
                </p>
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center mb-6">
            <p className="text-amber-400 font-bold text-lg sm:text-xl mb-1">
              24 - 48 {isUrdu ? 'گھنٹے' : 'Hours'}
            </p>
            <p className="text-white/50 text-xs">
              {isUrdu
                ? 'عام طور پر اکاؤنٹ 24 سے 48 گھنٹوں میں فعال ہو جاتا ہے'
                : 'Accounts are typically activated within 24-48 hours'}
            </p>
          </div>

          {/* User Info */}
          {profile && (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/30 text-xs mb-0.5">{isUrdu ? 'نام' : 'Name'}</p>
                  <p className="text-white font-medium truncate">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-0.5">{isUrdu ? 'کردار' : 'Role'}</p>
                  <p className="text-white font-medium capitalize">{profile.role}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/30 text-xs mb-0.5">{isUrdu ? 'ای میل' : 'Email'}</p>
                  <p className="text-white font-medium truncate text-xs">{profile.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {profile?.rejection_reason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-red-400 mb-1">
                {isUrdu ? 'مسترد کرنے کی وجہ' : 'Rejection Reason'}
              </h3>
              <p className="text-xs text-red-300/70">{profile.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {isUrdu
                ? checking ? 'چیک ہو رہا ہے...' : 'اسٹیٹس چیک کریں'
                : checking ? 'Checking...' : 'Check Approval Status'}
            </button>

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              {isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-white/30 text-xs">
            {isUrdu
              ? 'کوئی مدد چاہیے؟ contact@mazdoorping.pk پر رابطہ کریں'
              : 'Need help? Contact us at contact@mazdoorping.pk'}
          </p>
        </div>
      </div>
    </div>
  );
}
