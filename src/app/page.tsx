'use client';

import Link from 'next/link';
import {
  Search,
  Briefcase,
  ShieldCheck,
  Wallet,
  ShieldAlert,
  Sparkles,
  UserPlus,
  FileText,
  Handshake,
  ArrowRight,
  Star,
  Quote,
  Users,
  Building2,
  CheckCircle2,
  ChevronRight,
  Zap,
  Globe,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import { useLanguageStore } from '@/store/language-store';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

const featureKeys = [
  { icon: Search, titleKey: 'landing.findWorkers', descKey: 'landing.findWorkersDesc', gradient: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', borderHover: 'hover:border-emerald-500/30' },
  { icon: Briefcase, titleKey: 'landing.postJobs', descKey: 'landing.postJobsDesc', gradient: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', borderHover: 'hover:border-blue-500/30' },
  { icon: ShieldCheck, titleKey: 'landing.verifiedProfiles', descKey: 'landing.verifiedProfilesDesc', gradient: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', borderHover: 'hover:border-emerald-500/30' },
  { icon: Wallet, titleKey: 'landing.securePayments', descKey: 'landing.securePaymentsDesc', gradient: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', borderHover: 'hover:border-blue-500/30' },
  { icon: ShieldAlert, titleKey: 'landing.sosSafety', descKey: 'landing.sosSafetyDesc', gradient: 'from-red-500/20 to-red-600/5', iconColor: 'text-red-400', borderHover: 'hover:border-red-500/30' },
  { icon: Sparkles, titleKey: 'landing.smartMatching', descKey: 'landing.smartMatchDesc', gradient: 'from-purple-500/20 to-purple-600/5', iconColor: 'text-purple-400', borderHover: 'hover:border-purple-500/30' },
];

const stepKeys = [
  { step: '01', titleKey: 'landing.step1Title', descKey: 'landing.step1Desc', icon: UserPlus, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { step: '02', titleKey: 'landing.step2Title', descKey: 'landing.step2Desc', icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { step: '03', titleKey: 'landing.step3Title', descKey: 'landing.step3Desc', icon: Briefcase, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  { step: '04', titleKey: 'landing.step4Title', descKey: 'landing.step4Desc', icon: Handshake, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
];

const testimonialKeys = [
  { nameKey: 'landing.test1Name', roleKey: 'landing.test1Role', locationKey: 'landing.test1Location', textKey: 'landing.test1Text', rating: 5, avatar: 'AK', gradient: 'from-emerald-500 to-emerald-600' },
  { nameKey: 'landing.test2Name', roleKey: 'landing.test2Role', locationKey: 'landing.test2Location', textKey: 'landing.test2Text', rating: 5, avatar: 'FM', gradient: 'from-blue-500 to-blue-600' },
  { nameKey: 'landing.test3Name', roleKey: 'landing.test3Role', locationKey: 'landing.test3Location', textKey: 'landing.test3Text', rating: 5, avatar: 'RK', gradient: 'from-purple-500 to-purple-600' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguageStore();

  const stats = [
    { value: '10K+', label: t('landing.workersStat'), icon: Users, color: 'text-emerald-400', glow: 'glow-green' },
    { value: '5K+', label: t('landing.employersStat'), icon: Building2, color: 'text-blue-400', glow: 'glow-blue' },
    { value: '50K+', label: t('landing.jobsCompleted'), icon: CheckCircle2, color: 'text-purple-400', glow: 'glow-purple' },
    { value: '4.8', label: t('landing.avgRating'), icon: Star, color: 'text-amber-400', glow: 'glow-green' },
  ];

  const footerLinks = {
    quickLinks: [t('landing.aboutUs'), t('landing.howItWorksLink'), t('landing.featuresLink'), t('landing.pricing')],
    forWorkers: [t('landing.findJobs'), t('landing.createProfile'), t('landing.getVerified'), t('landing.workerSafety')],
    forEmployers: [t('landing.postAJob'), t('landing.findWorkersLink'), t('landing.manageProjects'), t('landing.billing')],
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass mt-3 rounded-2xl px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="MazdoorPing" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                <span className="text-lg font-bold text-white">
                  Mazdoor<span className="text-emerald-400">Ping</span>
                </span>
              </Link>
              <div className="hidden items-center gap-6 md:flex">
                <a href="#features" className="text-sm text-white/60 transition-colors hover:text-white">
                  {t('landing.features')}
                </a>
                <a href="#how-it-works" className="text-sm text-white/60 transition-colors hover:text-white">
                  {t('landing.howItWorks')}
                </a>
                <a href="#testimonials" className="text-sm text-white/60 transition-colors hover:text-white">
                  {t('landing.testimonials')}
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <LanguageToggle />
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white sm:px-4"
                >
                  {t('landing.signInNav')}
                </Link>
                <Link
                  href="/register"
                  className="glass-button rounded-lg px-3 py-2 text-sm sm:px-4"
                >
                  {t('landing.getStartedNav')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/70">
                {t('landing.badge')}
              </span>
              <ChevronRight className="h-3 w-3 text-white/40" />
            </div>

            <h1 className="animate-fade-in text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
              {t('landing.heroTitle1')}{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                {t('landing.heroTitleHighlight1')}
              </span>
              <br />
              {t('landing.heroTitle2')}{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                {t('landing.heroTitleHighlight2')}
              </span>
            </h1>

            <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              {t('landing.heroSubtitle')}
            </p>

            <div className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/register?role=worker"
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
              >
                <span>{t('landing.imAWorker')}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/register?role=employer"
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3.5 text-sm font-semibold text-blue-400 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/15 sm:w-auto"
              >
                <span>{t('landing.imAnEmployer')}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="animate-fade-in mt-10 flex flex-wrap items-center justify-center gap-6 text-white/30 sm:gap-8" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
                <span className="text-xs font-medium sm:text-sm">{t('landing.cnicVerified')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-blue-500/50" />
                <span className="text-xs font-medium sm:text-sm">{t('landing.securePayments')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500/50" />
                <span className="text-xs font-medium sm:text-sm">{t('landing.sosProtection')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-purple-500/50" />
                <span className="text-xs font-medium sm:text-sm">{t('landing.smartMatching')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card grid grid-cols-2 gap-4 p-6 sm:gap-6 sm:p-8 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`animate-fade-in flex flex-col items-center gap-2 rounded-xl p-4 text-center sm:p-6 ${stat.glow}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  <div className={`text-3xl font-extrabold ${stat.color} sm:text-4xl`}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-white/50 sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium text-white/60">{t('landing.features')}</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              {t('landing.everythingYouNeed')}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {t('landing.succeed')}
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.titleKey}
                  className={`animate-fade-in glass-card group cursor-pointer p-6 sm:p-8 ${feature.borderHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {t(feature.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[150px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/60">{t('landing.availablePakistan')}</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              {t('landing.findWorkersNear')}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {t('landing.nearYou')}
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              {t('landing.nearYouSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { city: 'Lahore', workers: '2,400+', icon: '🏙️', active: true },
              { city: 'Karachi', workers: '3,100+', icon: '🌊', active: true },
              { city: 'Islamabad', workers: '1,800+', icon: '🕌', active: true },
              { city: 'Rawalpindi', workers: '1,200+', icon: '🏗️', active: true },
              { city: 'Faisalabad', workers: '950+', icon: '🏭', active: true },
              { city: 'Multan', workers: '680+', icon: '☀️', active: true },
              { city: 'Peshawar', workers: '520+', icon: '⛰️', active: true },
              { city: 'Quetta', workers: '340+', icon: '🏔️', active: true },
              { city: 'Sialkot', workers: '420+', icon: '⚽', active: false },
              { city: 'Hyderabad', workers: '380+', icon: '🏛️', active: false },
              { city: 'Abbottabad', workers: '290+', icon: '🌲', active: false },
              { city: 'Gujranwala', workers: '310+', icon: '🔧', active: false },
            ].map((item, index) => (
              <div
                key={item.city}
                className="animate-fade-in glass-card group cursor-pointer p-4 sm:p-5 hover:border-emerald-500/30"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  {item.active && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t('landing.live')}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.city}</h3>
                <p className="text-xs text-white/40">{item.workers} {t('landing.workersLabel')}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3 h-3" />
                  <span>{t('landing.viewWorkers')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white/60">{t('landing.howItWorks')}</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t('landing.easySteps')}
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              {t('landing.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stepKeys.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="animate-fade-in relative"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {index < stepKeys.length - 1 && (
                    <div className="absolute right-0 top-12 hidden h-px w-1/2 translate-x-1/2 bg-gradient-to-r from-white/10 to-transparent lg:block" />
                  )}

                  <div className="glass-card p-6 text-center sm:p-8">
                    <div className="mx-auto mb-2 text-xs font-bold tracking-widest text-white/20 uppercase">
                      {t('landing.stepLabel')} {step.step}
                    </div>
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bgColor} border ${step.borderColor}`}>
                      <Icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white sm:text-lg">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/register"
              className="group glass-button inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
            >
              {t('landing.startNow')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Quote className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/60">{t('landing.testimonials')}</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              {t('landing.trustedBy')}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                {t('landing.thousands')}
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              {t('landing.testimonialsSubtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonialKeys.map((testimonial, index) => (
              <div
                key={testimonial.nameKey}
                className="animate-fade-in glass-card p-6 sm:p-8"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-sm font-bold text-white shadow-lg`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t(testimonial.nameKey)}</div>
                    <div className="text-xs text-white/40">
                      {t(testimonial.roleKey)} &middot; {t(testimonial.locationKey)}
                    </div>
                  </div>
                </div>
                <StarRating rating={testimonial.rating} />
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  &ldquo;{t(testimonial.textKey)}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {t('landing.readyToStart')}{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {t('landing.getStartedQ')}
                </span>
              </h2>
              <p className="mt-4 text-base text-white/50 sm:text-lg">
                {t('landing.readySubtitle')}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register?role=worker"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <span>{t('landing.joinAsWorker')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=employer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <span>{t('landing.joinAsEmployer')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="MazdoorPing" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                <span className="text-lg font-bold text-white">
                  Mazdoor<span className="text-emerald-400">Ping</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                {t('landing.footerDesc')}
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">{t('landing.quickLinks')}</h4>
              <ul className="space-y-2.5">
                {footerLinks.quickLinks.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">{t('landing.forWorkers')}</h4>
              <ul className="space-y-2.5">
                {footerLinks.forWorkers.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">{t('landing.forEmployers')}</h4>
              <ul className="space-y-2.5">
                {footerLinks.forEmployers.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} MazdoorPing. {t('landing.allRightsReserved')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {t('landing.privacyPolicy')}
              </a>
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {t('landing.termsOfService')}
              </a>
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {t('landing.contact')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
