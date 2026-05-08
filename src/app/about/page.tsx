'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Building2,
  ShieldCheck,
  Heart,
  Target,
  Globe,
  Award,
  MapPin,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

export default function AboutPage() {
  const { language, t } = useLanguageStore();

  // ── Stats Data ──
  const stats = [
    { value: '10,000+', label: language === 'ur' ? 'رجسٹرڈ مزدور' : 'Registered Workers', icon: Users, color: 'text-emerald-400', glow: 'glow-green' },
    { value: '5,000+', label: language === 'ur' ? 'آجرو' : 'Employers', icon: Building2, color: 'text-blue-400', glow: 'glow-blue' },
    { value: '50,000+', label: language === 'ur' ? 'مکمل ہونے والے کام' : 'Jobs Completed', icon: CheckCircle2, color: 'text-purple-400', glow: 'glow-purple' },
    { value: '4.8', label: language === 'ur' ? 'اوسط ریٹنگ' : 'Average Rating', icon: Award, color: 'text-amber-400', glow: 'glow-green' },
  ];

  // ── Values Data ──
  const values = [
    {
      icon: ShieldCheck,
      title: language === 'ur' ? 'اعتماد اور بھروسہ' : 'Trust & Reliability',
      description:
        language === 'ur'
          ? 'ہر مزدور کی شناختی کارڈ (CNIC) سے تصدیق کی جاتی ہے تاکہ آجرووں کو کامل بھروسہ ہو کہ وہ قابل اور سچے پیشہ ور کو رکھ رہے ہیں۔ ہمارے پلیٹ فارم پر جائزے اور ریٹنگز کا نظام آپ کو بہترین فیصلہ کرنے میں مدد دیتا ہے۔'
          : 'Every worker on MazdoorPing is CNIC-verified so employers can hire with complete confidence. Our transparent review and rating system ensures accountability at every step, building a community founded on genuine trust between workers and employers across Pakistan.',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
    },
    {
      icon: Heart,
      title: language === 'ur' ? 'مزدوروں کی حفاظت' : 'Worker Safety',
      description:
        language === 'ur'
          ? 'ہمارا ایک کلک SOS ایلارٹ سسٹم مزدوروں کی حفاظت کے لیے ڈیزائن کیا گیا ہے۔ کام کے دوران ہنگامی صورت میں، مزدور فوری طور پر اپنی جائے وقوعہ کے ساتھ ایلارٹ بھیج سکتے ہیں اور مدد آسانی سے پہنچ جاتی ہے۔'
          : 'Our one-tap SOS emergency alert system is designed with the safety of every worker in mind. During any job, workers can instantly share their live location with our support team, ensuring rapid response in emergencies — because no job is worth compromising someone\'s safety.',
      gradient: 'from-red-500/20 to-red-600/5',
      iconColor: 'text-red-400',
      borderHover: 'hover:border-red-500/30',
    },
    {
      icon: TrendingUp,
      title: language === 'ur' ? 'اختیار اور ترقی' : 'Empowerment & Growth',
      description:
        language === 'ur'
          ? 'ہم مزدوروں کو صرف کام نہیں دلاتے — ہم انہیں بااختیار بنتے ہیں۔ بجیٹ مینجمنٹ، آمدنی کا تجزیہ، اور پیشہ ورانہ بیجز کے ذریعے، ہر مزدور اپنی آمدنی اور کیریئر کو نئی بلندیوں تک پہنچا سکتا ہے۔'
          : 'We don\'t just connect workers with jobs — we empower them to build better livelihoods. With built-in tools for income analytics, budget management, and professional skill badges, every worker on MazdoorPing has the resources to grow their career and increase their earnings over time.',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
    },
    {
      icon: Globe,
      title: language === 'ur' ? 'جدت اور ٹیکنالوجی' : 'Innovation & Technology',
      description:
        language === 'ur'
          ? 'مزدورپنگ جدید ٹیکنالوجی کا استعمال کرتا ہے — AI سے مچنگ، سیکیور پیمنٹس، ریئل ٹائم لائیو لوکیشن، اور موبائل فرسٹ ڈیزائن — تاکہ پاکستان کے ہر کونے تک بااختیار مزدوری کی سہولت پہنچ سکے۔'
          : 'MazdoorPing leverages cutting-edge technology — AI-powered smart matching, secure escrow payments, real-time location tracking, and a mobile-first design — to bridge the gap between skilled workers and quality job opportunities across every corner of Pakistan.',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
    },
  ];

  // ── Team Data ──
  const team = [
    { name: language === 'ur' ? 'احمد رضا' : 'Ahmed Raza', role: language === 'ur' ? 'بانی اور سی ای او' : 'Founder & CEO', initials: 'AR', gradient: 'from-emerald-500 to-emerald-600' },
    { name: language === 'ur' ? 'سارہ خان' : 'Sara Khan', role: language === 'ur' ? 'چیف ٹیکنالوجی آفیسر' : 'Chief Technology Officer', initials: 'SK', gradient: 'from-blue-500 to-blue-600' },
    { name: language === 'ur' ? 'عمر فاروق' : 'Umar Farooq', role: language === 'ur' ? 'چیف آپریٹنگ آفیسر' : 'Chief Operating Officer', initials: 'UF', gradient: 'from-purple-500 to-purple-600' },
    { name: language === 'ur' ? 'فاطمہ ذہرا' : 'Fatima Zahra', role: language === 'ur' ? 'ویس پریسڈنٹ، پروڈکٹ' : 'VP of Product', initials: 'FZ', gradient: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-mesh">
      {/* ═══════════════════════════ NAVBAR ═══════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="glass mt-2 rounded-2xl px-3 py-2 sm:mt-3 sm:px-6 sm:py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                <Image
                  src="/logo.png"
                  alt="MazdoorPing"
                  width={28}
                  height={28}
                  className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg object-cover"
                />
                <span className="text-sm font-bold text-white sm:text-lg">
                  Mazdoor<span className="text-emerald-400">Ping</span>
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden items-center gap-6 md:flex">
                <Link href="/about" className="text-sm text-white/90 transition-colors hover:text-white">
                  {language === 'ur' ? 'ہمارے بارے میں' : 'About Us'}
                </Link>
                <Link href="/how-it-works" className="text-sm text-white/60 transition-colors hover:text-white">
                  {language === 'ur' ? 'کیسے کام کرتا ہے' : 'How It Works'}
                </Link>
                <Link href="/features" className="text-sm text-white/60 transition-colors hover:text-white">
                  {language === 'ur' ? 'خصوصیات' : 'Features'}
                </Link>
                <Link href="/pricing" className="text-sm text-white/60 transition-colors hover:text-white">
                  {language === 'ur' ? 'قیمتوں' : 'Pricing'}
                </Link>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="scale-[0.85] sm:scale-100">
                  <LanguageToggle />
                </div>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white sm:inline-flex sm:px-4"
                >
                  {t('landing.signInNav')}
                </Link>
                <Link
                  href="/register"
                  className="glass-button whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                >
                  {t('landing.getStartedNav')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-36 sm:pb-28">
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
                {language === 'ur'
                  ? 'پاکستان کی سب سے بڑی مزدور آجرو پلیٹ فارم'
                  : "Pakistan's Premier Worker-Employer Platform"}
              </span>
            </div>

            {/* Title */}
            <h1
              className="animate-fade-in text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animationDelay: '0.1s' }}
            >
              {language === 'ur' ? 'ہمارے بارے میں ' : 'About '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                MazdoorPing
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-fade-in mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/50 sm:mt-6 sm:text-lg"
              style={{ animationDelay: '0.2s' }}
            >
              {language === 'ur'
                ? 'مزدورپنگ پاکستان کی پہلی ٹیک کی بنیاد پر مبنی پلیٹ فارم ہے جو ماہر مزدوروں — بشمول بجلی کار، پلمبر، تھنکڑی کا کام، پینٹر، سنار اور مزید — کو معتبر آجرووں سے جوڑتی ہے۔ ہم لاہور، کراچی، اسلام آباد، فیصل آباد اور ملک بھر میں کام کے مواقع فراہم کرتے ہیں۔'
                : 'MazdoorPing is Pakistan\'s first tech-powered platform purpose-built to connect skilled workers — electricians, plumbers, carpenters, painters, welders, masons, and dozens more — with verified employers. From Lahore and Karachi to Islamabad and beyond, we are transforming how Pakistan finds and hires blue-collar talent.'}
            </p>

            {/* Trust Badges */}
            <div
              className="animate-fade-in mt-8 flex flex-wrap items-center justify-center gap-3 text-white/30 sm:mt-10 sm:gap-8"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500/50" />
                <span className="text-[11px] font-medium sm:text-sm">
                  {language === 'ur' ? 'CNIC تصدیق شدہ' : 'CNIC Verified'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-500/50" />
                <span className="text-[11px] font-medium sm:text-sm">
                  {language === 'ur' ? '40+ شہروں میں موجود' : 'Available in 40+ Cities'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 shrink-0 text-red-500/50" />
                <span className="text-[11px] font-medium sm:text-sm">
                  {language === 'ur' ? 'مزدوروں کی حفاظت' : 'Worker Safety First'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 shrink-0 text-purple-500/50" />
                <span className="text-[11px] font-medium sm:text-sm">
                  {language === 'ur' ? 'AI سے مچنگ' : 'AI-Powered Matching'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ MISSION & VISION ═══════════════════════════ */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Mission */}
            <div className="animate-fade-in glass-card p-6 sm:p-8 hover:border-emerald-500/30" style={{ animationDelay: '0.1s' }}>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20">
                <Target className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">
                {language === 'ur' ? 'ہمارا مشن' : 'Our Mission'}
              </h2>
              <p className="text-sm leading-relaxed text-white/50 sm:text-base">
                {language === 'ur'
                  ? 'ہمارا مشن پاکستان کے lacunoں ماہر مزدوروں کو رواں سال بہترین کام کے مواقع سے جوڑنا ہے۔ ہم جانتے ہیں کہ ایک بجلی کار لاہور کے بھڑک مہلوں میں، ایک پلمبر کراچی کی گرمیاں میں، یا ایک سنار اسلام آباد کی سرما میں — سب کو معتبر کام اور منصفانہ ادائیگی کی ضرورت ہے۔ مزدورپنگ انہیں ڈیجیٹل شناخت، آن لائن جائزے، اور محفوظ ادائیگی کا نظام دیتا ہے تاکہ وہ باوقار زندگی گزار سکیں۔'
                  : 'Our mission is to empower millions of skilled workers across Pakistan by connecting them with quality job opportunities through a trusted, technology-driven platform. Whether it\'s an electrician in the bustling streets of Lahore, a plumber in the coastal neighborhoods of Karachi, or a carpenter in the growing sectors of Islamabad — every worker deserves access to fair pay, safe working conditions, and a dignified livelihood. MazdoorPing gives them the digital identity, transparent reviews, and secure payments they need to thrive.'}
              </p>
            </div>

            {/* Vision */}
            <div className="animate-fade-in glass-card p-6 sm:p-8 hover:border-blue-500/30" style={{ animationDelay: '0.2s' }}>
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20">
                <Globe className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">
                {language === 'ur' ? 'ہمارا وژن' : 'Our Vision'}
              </h2>
              <p className="text-sm leading-relaxed text-white/50 sm:text-base">
                {language === 'ur'
                  ? 'ہماری نظر میں ایک ایسا پاکستان ہے جہاں کوئی بھی ماہر مزدور بے روزگار نہ رہے — جہاں ہر گھر، دفتر اور فیکٹری باآسانی قابل مزدور کو تلاش کر سکے۔ ہم پاکستان کی غیر رسمی لیبر مارکیٹ کو ڈیجیٹل بنانا چاہتے ہیں، ایک ایسی نظم و ضبط بنانا چاہتے ہیں جو مزدوروں کے حقوق، عزت اور معیارِ زندگی کو بڑھائے۔ مزدورپنگ محض ایک ایپ نہیں ہے — یہ تحریک ہے۔'
                  : 'We envision a Pakistan where no skilled worker ever struggles to find work, and no employer wastes weeks searching for reliable talent. By digitizing Pakistan\'s informal labor market, we aim to create a transparent ecosystem that upholds workers\' rights, dignifies their trades, and drives economic growth in every community. MazdoorPing is not just an app — it\'s a movement to modernize how Pakistan builds, repairs, and creates.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ OUR STORY ═══════════════════════════ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl sm:mb-16">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Heart className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs font-medium text-white/60">
                {language === 'ur' ? 'ہماری کہانی' : 'Our Story'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              {language === 'ur' ? 'ایک سادہ سوچ سے ' : 'From a Simple Idea to a '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                {language === 'ur' ? 'قومی تحریک' : 'National Movement'}
              </span>
            </h2>
          </div>

          <div className="glass-card p-6 sm:p-10">
            <div className="space-y-6 text-sm leading-relaxed text-white/60 sm:text-base">
              <p className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                {language === 'ur'
                  ? 'مزدورپنگ کی کہانی ایک عام دن سے شروع ہوئی جب ہمارے بانی لاہور میں ایک پلمبر تلاش کرنے کے لیے پورے محله میں گھومے۔ گلیوں میں پوچھنا، فون کالز کرنا، اور پھر بھی کوئی قابل بجلی کار یا پلمبر نہ ملنا — یہ مسئلہ صرف ان کا نہیں تھا۔ پورے پاکستان میں lacunoں خاندانوں کا یہی حال تھا۔'
                  : 'MazdoorPing\'s story started on a scorching summer afternoon in Lahore, when our founder spent an entire day wandering through neighborhoods searching for a reliable plumber. Calling random numbers, asking neighbors, driving to hardware shops — only to end up with someone untrained, unverified, and overcharging. That frustration wasn\'t unique. Across Pakistan, millions of households and businesses face the exact same challenge every single day.'}
              </p>
              <p className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                {language === 'ur'
                  ? 'اس مشکل نے ہمیں سوچنے پر مجبور کیا: پاکستان میں لاکھوں ماہر مزدور ہیں — بجلی کار، پلمبر، تھنکڑی کا کام کرنے والے، پینٹر، سنار، گڑیگر — جن کے پاس سالوں کا تجربہ ہے لیکن ان کے پاس کوئی ڈیجیٹل شناخت نہیں ہے۔ وہ روزانہ چوک پر انتظار کرتے ہیں کہ کوئی آجرو آئے۔ دوسری طرف، آجرووں کو معتبر اور قابل مزدور ملنا مشکل ہے۔ یہ خلاء ہی مزدورپنگ نے پُر کرنے کا فیصلہ کیا۔'
                  : 'On one side, Pakistan has millions of incredibly skilled workers — electricians who can wire an entire building, plumbers who fix complex systems, carpenters who craft furniture that lasts generations, painters whose artistry transforms homes, and masons who build the foundations of our cities. These workers have years of hands-on experience, yet they have zero digital presence. They stand at chowks and addas every morning, waiting for someone to offer them a day\'s work. On the other side, homeowners, contractors, and business owners desperately search for reliable help but have no way to verify skill or trustworthiness. That massive gap is what MazdoorPing was born to bridge.'}
              </p>
              <p className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                {language === 'ur'
                  ? 'ہم نے 2024 میں مزدورپنگ شروع کیا — ایک موبائل فرسٹ پلیٹ فارم جو مزدوروں کو مفت رجسٹریشن، CNIC تصدیق، اور ڈیجیٹل پروفائل فراہم کرتا ہے۔ آج ہم لاہور، کراچی، اسلام آباد، فیصل آباد، ملتان، پشاور، کوئٹہ اور 40 سے زائد شہروں میں سرگرم ہیں۔ 10,000 سے زائد مزدور اور 5,000 آجرو ہمارے پلیٹ فارم پر بھروسہ کرتے ہیں۔'
                  : 'We launched MazdoorPing in 2024 with a bold vision: build a mobile-first platform where any worker in Pakistan can register for free, get their CNIC verified, create a digital profile with skills and reviews, and start receiving job offers from verified employers in their city. Starting from Lahore, we rapidly expanded to Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and over 40 cities. Today, with more than 10,000 registered workers and 5,000 employers trusting our platform, we are just getting started.'}
              </p>
              <p className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
                {language === 'ur'
                  ? 'مزدورپنگ صرف ایک ملازمت پورٹل نہیں ہے — یہ پاکستان کے ماہر مزدوروں کے لیے ایک مکمل ایکوسسٹم ہے: محفوظ ایسکرو ادائیگیاں، SOS حفاظتی ایلارٹ، AI سے مچنگ، آمدنی کا تجزیہ، پیشہ ورانہ بیجز، اور ایک مضبوط جائزہ سسٹم۔ ہر فیچر ایک مقصد کے ساتھ بنایا گیا ہے: مزدوروں کی زندگیاں بہتر بنانا۔'
                  : 'MazdoorPing is far more than just a job portal — it\'s a comprehensive ecosystem for Pakistan\'s skilled workforce. From secure escrow payments that protect both parties to our SOS safety alert system, AI-powered smart matching that connects the right worker to the right job, income analytics dashboards, professional achievement badges, and a robust review system — every feature is designed with one purpose: to make life measurably better for Pakistan\'s workers while making hiring effortless for employers.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ STATS ═══════════════════════════ */}
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

      {/* ═══════════════════════════ VALUES ═══════════════════════════ */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white/60">
                {language === 'ur' ? 'ہماری اقدار' : 'Our Core Values'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              {language === 'ur' ? 'ہم کیا ' : 'What We '}
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                {language === 'ur' ? 'جعتا کرتے ہیں' : 'Stand For'}
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-sm text-white/50 sm:text-base" style={{ animationDelay: '0.2s' }}>
              {language === 'ur'
                ? 'ہر فیچر، ہر فیصلہ، اور ہر قدم ان چار بنیادی اقدار سے متاثر ہے۔'
                : 'Every feature we build, every decision we make, and every partnership we form is guided by these four core values.'}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className={`animate-fade-in glass-card p-6 sm:p-8 ${value.borderHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${value.gradient}`}>
                    <Icon className={`h-6 w-6 ${value.iconColor}`} />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ TEAM ═══════════════════════════ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-white/60">
                {language === 'ur' ? 'ہماری ٹیم' : 'Our Team'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              {language === 'ur' ? 'پیچھے ' : 'The People '}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {language === 'ur' ? 'لوگ' : 'Behind the Mission'}
              </span>
            </h2>
            <p className="animate-fade-in mt-4 text-sm text-white/50 sm:text-base" style={{ animationDelay: '0.2s' }}>
              {language === 'ur'
                ? 'ایک سرگرم ٹیم جو پاکستان کے ماہر مزدوروں کے لیے مددگار ٹیکنالوجی بنا رہی ہے۔'
                : 'A passionate team of technologists, designers, and problem-solvers committed to building technology that serves Pakistan\'s skilled workforce.'}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <div
                key={member.name}
                className="animate-fade-in glass-card p-6 text-center sm:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient} text-lg font-bold text-white shadow-lg`}
                >
                  {member.initials}
                </div>
                <h3 className="text-base font-semibold text-white">{member.name}</h3>
                <p className="mt-1 text-sm text-white/40">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CTA ═══════════════════════════ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                {language === 'ur' ? 'آج ہی ' : 'Join '}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  MazdoorPing
                </span>{' '}
                {language === 'ur' ? 'میں شامل ہوں' : 'Today'}
              </h2>
              <p className="mt-4 text-sm text-white/50 sm:text-base lg:text-lg">
                {language === 'ur'
                  ? 'چاہے آپ ایک مزدور ہیں جو کام تلاش کر رہا ہو یا ایک آجرو جو قابل اور قابل بھروسہ مزدوروں کو رکھنا چاہتا ہو — مزدورپنگ آپ کے لیے ہے۔ رجسٹریشن مفت ہے اور صرف ایک منٹ لگتی ہے۔ لاکھوں لوگوں کی برادری میں شامل ہوں جو پاکستان کے ماہر مزدوروں کو بااختیار بنا رہے ہیں۔'
                  : 'Whether you\'re a skilled worker looking for your next job, or an employer searching for reliable and verified talent — MazdoorPing is for you. Registration is completely free and takes less than a minute. Join the thousands of workers and employers who are already transforming how Pakistan hires and gets hired.'}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register?role=worker"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <span>{t('landing.joinAsWorker')}</span>
                  <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=employer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <span>{t('landing.joinAsEmployer')}</span>
                  <Building2 className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <footer className="border-t border-white/5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
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

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {language === 'ur' ? 'فوری لنکس' : 'Quick Links'}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/about" className="text-sm text-white/40 transition-colors hover:text-white/70">
                    {language === 'ur' ? 'ہمارے بارے میں' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-white/40 transition-colors hover:text-white/70">
                    {language === 'ur' ? 'کیسے کام کرتا ہے' : 'How It Works'}
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-sm text-white/40 transition-colors hover:text-white/70">
                    {language === 'ur' ? 'خصوصیات' : 'Features'}
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-white/40 transition-colors hover:text-white/70">
                    {language === 'ur' ? 'قیمتوں' : 'Pricing'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Workers */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">{t('landing.forWorkers')}</h4>
              <ul className="space-y-2.5">
                {[
                  t('landing.findJobs'),
                  t('landing.createProfile'),
                  t('landing.getVerified'),
                  t('landing.workerSafety'),
                ].map((item) => (
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
              <h4 className="mb-4 text-sm font-semibold text-white">{t('landing.forEmployers')}</h4>
              <ul className="space-y-2.5">
                {[
                  t('landing.postAJob'),
                  t('landing.findWorkersLink'),
                  t('landing.manageProjects'),
                  t('landing.billing'),
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} MazdoorPing. {t('landing.allRightsReserved')}
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {t('landing.termsOfService')}
              </Link>
              <Link href="/privacy" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {t('landing.privacyPolicy')}
              </Link>
              <Link href="/contact" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {t('landing.contact')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
