'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Loader2,
  ArrowRight,
  Briefcase,
  Wrench,
  Check,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

type Role = 'worker' | 'employer' | '';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || null;
  const preselectedRole = searchParams.get('role') as Role | null;

  const { signUp, profile, isLoading, supabaseReady } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>(() => {
    if (preselectedRole === 'worker' || preselectedRole === 'employer') return preselectedRole;
    return '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  // Redirect if already logged in with a role
  useEffect(() => {
    if (profile?.role && !isSubmitting && !signupSuccess) {
      if (redirect) {
        router.push(redirect);
      } else if (profile.role === 'worker') {
        router.push('/worker');
      } else if (profile.role === 'employer') {
        router.push('/employer');
      } else if (profile.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [profile, redirect, router, isSubmitting, signupSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Worker ya Employer select karein.');
      return;
    }
    if (!fullName.trim()) {
      setError('Apna naam enter karein.');
      return;
    }
    if (!email.trim()) {
      setError('Email address enter karein.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number enter karein.');
      return;
    }
    if (password.length < 8) {
      setError('Password kam az kam 8 characters ka hona chahiye.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Dono passwords match nahi karte.');
      return;
    }
    if (!agreed) {
      setError('Terms of Service accept karein.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signUpError, needsConfirmation } = await signUp(email, password, fullName.trim(), role, phone.trim());

      if (signUpError) {
        setError(signUpError);
        setIsSubmitting(false);
        return;
      }

      if (needsConfirmation) {
        setSignupEmail(email);
        setSignupSuccess(true);
      } else {
        // Auto-logged in, redirect to setup page
        await new Promise(resolve => setTimeout(resolve, 500));
        if (role === 'worker') {
          window.location.href = '/worker/setup';
        } else if (role === 'employer') {
          window.location.href = '/employer/setup';
        } else {
          window.location.href = '/';
        }
      }
    } catch {
      setError('Account create mein masla aaya. Dobara try karein.');
      setIsSubmitting(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
        <div className="relative w-full max-w-md animate-fade-in">
          <div className="glass-card p-8 sm:p-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Check Karein!</h2>
            <p className="text-white/50 text-sm mb-6">
              Humne confirmation link bheja hai is email par:
            </p>
            <div className="glass-input px-4 py-3 rounded-xl mb-8">
              <p className="text-emerald-400 font-medium text-sm truncate">{signupEmail}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <svg className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-400">Zaroori</p>
                  <p className="text-xs text-white/40 mt-0.5">Email mein aayi confirmation link par click karein account activate karne ke liye. Agar email nahi aaya toh spam folder check karein.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <svg className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-400">Worker Verification</p>
                  <p className="text-xs text-white/40 mt-0.5">Agar Worker ki taraf se sign up kiya hai toh profile verify hone tak wait karna hoga.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="glass-button w-full py-3 text-sm font-semibold"
              >
                Login Page Par Jayen
              </button>
              <button
                onClick={() => { setSignupSuccess(false); setSignupEmail(''); }}
                className="w-full py-2.5 text-sm font-medium text-white/50 hover:text-white/70 transition-colors"
              >
                Dusri email se sign up karein
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Mazdoor<span className="text-emerald-400">Ping</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
            Account Banayein
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Workers aur employers ko connect karne wali platform
          </p>
        </div>

        {/* Supabase Not Configured Warning */}
        {!supabaseReady && (
          <div className="mb-4 animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-400">Supabase Not Connected</p>
                <p className="mt-1 text-xs text-white/50">
                  Account create nahi hoga jab tak Supabase configure nahi hota. Vercel mein environment variables add karein:
                </p>
                <code className="mt-2 block rounded-lg bg-black/30 p-2 text-[10px] text-red-300 font-mono">
                  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
                </code>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="animate-fade-in rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/70">
                Main hoon
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={cn(
                    'relative flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all duration-300',
                    role === 'worker'
                      ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  )}
                >
                  {role === 'worker' && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                      role === 'worker' ? 'bg-emerald-500/20' : 'bg-white/5'
                    )}
                  >
                    <Wrench
                      className={cn(
                        'h-6 w-6 transition-colors',
                        role === 'worker' ? 'text-emerald-400' : 'text-white/40'
                      )}
                    />
                  </div>
                  <span className={cn('text-sm font-semibold transition-colors', role === 'worker' ? 'text-emerald-400' : 'text-white/60')}>
                    Worker
                  </span>
                  <span className="text-center text-[11px] leading-tight text-white/30">
                    Jobs dhundhein aur paise kamayein
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={cn(
                    'relative flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all duration-300',
                    role === 'employer'
                      ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  )}
                >
                  {role === 'employer' && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                      role === 'employer' ? 'bg-blue-500/20' : 'bg-white/5'
                    )}
                  >
                    <Briefcase
                      className={cn(
                        'h-6 w-6 transition-colors',
                        role === 'employer' ? 'text-blue-400' : 'text-white/40'
                      )}
                    />
                  </div>
                  <span className={cn('text-sm font-semibold transition-colors', role === 'employer' ? 'text-blue-400' : 'text-white/60')}>
                    Employer
                  </span>
                  <span className="text-center text-[11px] leading-tight text-white/30">
                    Workers hire karein aur grow karein
                  </span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-white/70">
                Poora Naam
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Muhammad Ali"
                  autoComplete="name"
                  className="glass-input w-full py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/70">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="glass-input w-full py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-white/70">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX XXXXXXX"
                  autoComplete="tel"
                  className="glass-input w-full py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/70">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kam az kam 8 characters"
                  autoComplete="new-password"
                  className="glass-input w-full py-3 pl-10 pr-12 text-sm text-white placeholder:text-white/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all',
                        password.length >= level * 3
                          ? password.length >= 12 ? 'bg-emerald-500' : password.length >= 8 ? 'bg-amber-500' : 'bg-red-500'
                          : 'bg-white/10'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70">
                Password Dobara Likhein
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Password dobara enter karein"
                  autoComplete="new-password"
                  className={cn(
                    'glass-input w-full py-3 pl-10 pr-12 text-sm text-white placeholder:text-white/25',
                    confirmPassword.length > 0 && confirmPassword !== password && 'border-red-500/30 focus:border-red-500/50 focus:ring-red-500/15'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-xs text-red-400">Passwords match nahi karte</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all"
                aria-label="Agree to terms"
                style={{
                  borderColor: agreed ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: agreed ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                }}
              >
                {agreed && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
              <p className="text-xs leading-relaxed text-white/40">
                Main{' '}
                <a href="#" className="font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                  Terms of Service
                </a>{' '}
                aur{' '}
                <a href="#" className="font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                  Privacy Policy
                </a>{' '}
                se agree karta/karti hoon
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !supabaseReady}
              className={cn(
                'glass-button flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold',
                (isSubmitting || isLoading || !supabaseReady) && 'pointer-events-none opacity-70'
              )}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Account Bana Rahay Hain...
                </>
              ) : !supabaseReady ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Supabase Not Connected
                </>
              ) : (
                <>
                  Account Banayein
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Pehle se account hai?{' '}
            <Link
              href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
              className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-white/60"
          >
            <ChevronLeft className="h-3 w-3" />
            Wapas home par
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
