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

const features = [
  {
    icon: Search,
    title: 'Find Workers',
    description: 'Search thousands of verified skilled workers by category, location, rating, and availability.',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/30',
  },
  {
    icon: Briefcase,
    title: 'Post Jobs',
    description: 'Create detailed job postings with budget, timeline, and requirements in under 2 minutes.',
    gradient: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderHover: 'hover:border-blue-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Profiles',
    description: 'CNIC-verified workers with complete profiles, skill tags, and authentic reviews.',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/30',
  },
  {
    icon: Wallet,
    title: 'Secure Payments',
    description: 'Escrow-based payment system ensuring workers get paid and employers get quality work.',
    gradient: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderHover: 'hover:border-blue-500/30',
  },
  {
    icon: ShieldAlert,
    title: 'SOS Safety',
    description: 'One-tap emergency alert with live location sharing for worker safety on the job.',
    gradient: 'from-red-500/20 to-red-600/5',
    iconColor: 'text-red-400',
    borderHover: 'hover:border-red-500/30',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching',
    description: 'AI-powered recommendations match the right workers to the right jobs automatically.',
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/30',
  },
];

const steps = [
  {
    step: '01',
    title: 'Register',
    description: 'Sign up as a worker or employer with your basic details.',
    icon: UserPlus,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    step: '02',
    title: 'Complete Profile',
    description: 'Add your skills, experience, location, and verification documents.',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    step: '03',
    title: 'Find / Post',
    description: 'Browse jobs or post work requirements with budget and timeline.',
    icon: Briefcase,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    step: '04',
    title: 'Connect & Work',
    description: 'Accept bids, communicate, and get the job done securely.',
    icon: Handshake,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
];

const stats = [
  { value: '10K+', label: 'Workers', icon: Users, color: 'text-emerald-400', glow: 'glow-green' },
  { value: '5K+', label: 'Employers', icon: Building2, color: 'text-blue-400', glow: 'glow-blue' },
  { value: '50K+', label: 'Jobs Completed', icon: CheckCircle2, color: 'text-purple-400', glow: 'glow-purple' },
  { value: '4.8', label: 'Average Rating', icon: Star, color: 'text-amber-400', glow: 'glow-green' },
];

const testimonials = [
  {
    name: 'Ahmed Khan',
    role: 'Electrician',
    location: 'Lahore',
    text: 'MazdoorPing changed my life. I went from searching for daily work to having a steady stream of quality jobs. The verification badge boosted my credibility significantly.',
    rating: 5,
    avatar: 'AK',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    name: 'Fatima Malik',
    role: 'Construction Company Owner',
    location: 'Karachi',
    text: 'Finding reliable skilled workers was always a nightmare. With MazdoorPing, I can browse verified profiles, check ratings, and hire with confidence within hours.',
    rating: 5,
    avatar: 'FM',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Plumber',
    location: 'Islamabad',
    text: 'The SOS feature gives me peace of mind when working at new sites. The secure payment system means I never have to chase clients for my hard-earned money.',
    rating: 5,
    avatar: 'RK',
    gradient: 'from-purple-500 to-purple-600',
  },
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
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass mt-3 rounded-2xl px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Mazdoor<span className="text-emerald-400">Ping</span>
                </span>
              </Link>
              <div className="hidden items-center gap-6 md:flex">
                <a href="#features" className="text-sm text-white/60 transition-colors hover:text-white">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm text-white/60 transition-colors hover:text-white">
                  How It Works
                </a>
                <a href="#testimonials" className="text-sm text-white/60 transition-colors hover:text-white">
                  Testimonials
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white sm:px-4"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="glass-button rounded-lg px-3 py-2 text-sm sm:px-4"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/70">
                Pakistan&apos;s #1 Worker-Employer Platform
              </span>
              <ChevronRight className="h-3 w-3 text-white/40" />
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
              Connecting{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                Skilled Workers
              </span>
              <br />
              with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                Real Opportunities
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              MazdoorPing bridges the gap between talented workers and employers across Pakistan.
              Find work, hire talent, and build your future — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/register?role=worker"
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
              >
                <span>I&apos;m a Worker</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/register?role=employer"
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3.5 text-sm font-semibold text-blue-400 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/15 sm:w-auto"
              >
                <span>I&apos;m an Employer</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-in mt-10 flex flex-wrap items-center justify-center gap-6 text-white/30 sm:gap-8" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
                <span className="text-xs font-medium sm:text-sm">CNIC Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-blue-500/50" />
                <span className="text-xs font-medium sm:text-sm">Secure Payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500/50" />
                <span className="text-xs font-medium sm:text-sm">SOS Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-purple-500/50" />
                <span className="text-xs font-medium sm:text-sm">Smart Matching</span>
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
              <span className="text-xs font-medium text-white/60">Features</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              Powerful tools designed to make hiring and finding work effortless, safe, and efficient.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`animate-fade-in glass-card group cursor-pointer p-6 sm:p-8 ${feature.borderHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {feature.description}
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
              <span className="text-xs font-medium text-white/60">Available Across Pakistan</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              Find Workers{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Near You
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              Workers available in all major cities across Pakistan. Real-time location tracking coming soon.
            </p>
          </div>

          {/* City Cards Grid */}
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
                      Live
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.city}</h3>
                <p className="text-xs text-white/40">{item.workers} workers</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                  <MapPin className="w-3 h-3" />
                  <span>View workers</span>
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
              <span className="text-xs font-medium text-white/60">How It Works</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              Get Started in{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                4 Easy Steps
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              From registration to your first job — it takes less than 15 minutes.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="animate-fade-in relative"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Connector line (hidden on mobile and last item) */}
                  {index < steps.length - 1 && (
                    <div className="absolute right-0 top-12 hidden h-px w-1/2 translate-x-1/2 bg-gradient-to-r from-white/10 to-transparent lg:block" />
                  )}

                  <div className="glass-card p-6 text-center sm:p-8">
                    <div className="mx-auto mb-2 text-xs font-bold tracking-widest text-white/20 uppercase">
                      Step {step.step}
                    </div>
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bgColor} border ${step.borderColor}`}>
                      <Icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50">
                      {step.description}
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
              Start Now — It&apos;s Free
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
              <span className="text-xs font-medium text-white/60">Testimonials</span>
            </div>
            <h2 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style={{ animationDelay: '0.1s' }}>
              Trusted by{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-base text-white/50 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              Real stories from workers and employers who found success on MazdoorPing.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
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
                    <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-white/40">
                      {testimonial.role} &middot; {testimonial.location}
                    </div>
                  </div>
                </div>
                <StarRating rating={testimonial.rating} />
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  &ldquo;{testimonial.text}&rdquo;
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
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Ready to{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Get Started?
                </span>
              </h2>
              <p className="mt-4 text-base text-white/50 sm:text-lg">
                Join thousands of workers and employers already using MazdoorPing. Registration is free and takes under a minute.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register?role=worker"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <span>Join as Worker</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=employer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <span>Join as Employer</span>
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
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Mazdoor<span className="text-emerald-400">Ping</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                Pakistan&apos;s premier platform connecting skilled workers with employers.
                Building bridges, creating opportunities.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2.5">
                {['About Us', 'How It Works', 'Features', 'Pricing'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Workers */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">For Workers</h4>
              <ul className="space-y-2.5">
                {['Find Jobs', 'Create Profile', 'Get Verified', 'Worker Safety'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">For Employers</h4>
              <ul className="space-y-2.5">
                {['Post a Job', 'Find Workers', 'Manage Projects', 'Billing'].map((item) => (
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
              &copy; {new Date().getFullYear()} MazdoorPing. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                Terms of Service
              </a>
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
