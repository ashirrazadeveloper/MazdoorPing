'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Briefcase,
  ShieldCheck,
  Wallet,
  ShieldAlert,
  Sparkles,
  MapPin,
  MessageSquare,
  Bot,
  Bell,
  Star,
  BarChart3,
  FileText,
  Users,
  Building2,
  CheckCircle2,
  Globe,
  Zap,
  TrendingUp,
  Eye,
  Lock,
  Smartphone,
  Clock,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

/* ────────────────────────────────────────────
   Feature data – Workers
   ──────────────────────────────────────────── */
const workerFeatures = {
  en: [
    {
      icon: Search,
      title: 'Browse Jobs',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'Search through thousands of job listings across dozens of trades — from plumbing and electrical to carpentry and painting. Filter by location, pay rate, and skill level to find the perfect match for your expertise.',
    },
    {
      icon: MapPin,
      title: 'Nearby Jobs',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'Discover work opportunities right in your neighbourhood. Our GPS-powered location services surface jobs closest to you so you spend less time commuting and more time earning.',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'Our AI analyses your skills, past jobs, and ratings to recommend opportunities you are most likely to win. The more you work, the smarter the suggestions become.',
    },
    {
      icon: MessageSquare,
      title: 'Chat System',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'Communicate directly with employers through our built-in messaging system. Share photos, documents, and project details without ever leaving the app.',
    },
    {
      icon: Wallet,
      title: 'Wallet & Payments',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'Receive payments securely via JazzCash, EasyPaisa, or bank transfer. Track your earnings, view transaction history, and withdraw funds with just a few taps.',
    },
    {
      icon: ShieldAlert,
      title: 'SOS Safety',
      gradient: 'from-red-500/20 to-red-600/5',
      iconColor: 'text-red-400',
      borderHover: 'hover:border-red-500/30',
      description:
        'Your safety comes first. Tap the SOS button to instantly alert emergency contacts and share your live location with trusted people when you feel unsafe on a job site.',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'Get instant answers about job tips, payment queries, or account issues with our smart AI chatbot — available 24/7 in both English and Urdu.',
    },
    {
      icon: FileText,
      title: 'Portfolio',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'Upload photos of your completed projects, certifications, and work samples to build a professional portfolio that impresses employers and wins more jobs.',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'Track your earnings over time, monitor job completion rates, and see how your profile ranks. Data-driven insights help you grow your career and maximise income.',
    },
  ],
  ur: [
    {
      icon: Search,
      title: 'ملازمتیں تلاش کریں',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'درجنوں پیشوں میں ہزاروں ملازمت کی فہرستیں تلاش کریں — پلمبنگ اور الیکٹریکل سے لے کر نجاری اور پینٹنگ تک۔ مقام، تنخواہ اور مہارت کی سطح کے لحاظ سے فلٹر کریں۔',
    },
    {
      icon: MapPin,
      title: 'قریبی ملازمتیں',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'اپنے پڑوس میں کام کے مواقع دریافت کریں۔ ہمارے GPS پر مبنی مقام کی خدمات آپ کے قریب ترین ملازمتیں پیش کرتی ہیں تاکہ آپ کم سفر اور زیادہ کمانے میں صرف کریں۔',
    },
    {
      icon: Sparkles,
      title: 'سمارٹ تجاویز',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'ہمارا AI آپ کی مہارت، گزرے ہوئے کاموں اور درجہ بندیوں کا تجزیہ کر کے وہ مواقع تجویز کرتا ہے جو آپ جیتنے کی زیادہ可能性 رکھتے ہیں۔',
    },
    {
      icon: MessageSquare,
      title: 'چیٹ سسٹم',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'ہمارے ان بینڈ میسجنگ سسٹم کے ذریعے آجرووں سے براہ راست بات چیت کریں۔ تصاویر، دستاویزات اور منصوبے کی تفصیلات شیئر کریں بغیر ایپ چھوڑے۔',
    },
    {
      icon: Wallet,
      title: 'والٹ اور ادائیگیاں',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'جاز کیش، ایزی پیسہ یا بینک ٹرانسفر کے ذریعے محفوظ طریقے سے ادائیگی حاصل کریں۔ اپنی آمدنی ٹریک کریں اور چند ٹیپس میں فنڈز واپس لیں۔',
    },
    {
      icon: ShieldAlert,
      title: 'ایس او ایس حفاظت',
      gradient: 'from-red-500/20 to-red-600/5',
      iconColor: 'text-red-400',
      borderHover: 'hover:border-red-500/30',
      description:
        'آپ کی حفاظت سب سے پہلے ہے۔ جب آپ کام کی جگہ پر غیر محفوظ محسوس کریں تو SOS بٹن دبائیں اور فوری طور پر ایمرجنسی رابطوں کو الرٹ کریں۔',
    },
    {
      icon: Bot,
      title: 'AI اسسٹنٹ',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'کام کے ٹپس، ادائیگی کے سوالات یا اکاؤنٹ کے مسائل کے بارے میں فوری جوابات حاصل کریں — انگریزی اور اردو دونوں میں ۲۴/۷ دستیاب۔',
    },
    {
      icon: FileText,
      title: 'پورٹ فولیو',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'اپنے مکمل منصوبوں، سرٹیفکیٹس اور کام کے نمونوں کی تصاویر اپ لوڈ کر کے ایک پیشہ ورانہ پورٹ فولیو بنائیں جو آجروں کو متاثر کرے۔',
    },
    {
      icon: BarChart3,
      title: 'تجزیات',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'وقت کے ساتھ اپنی آمدنی ٹریک کریں، ملازمت کی تکمیل کی شرحوں کو نگرانی کریں، اور دیکھیں کہ آپ کا پروفائل کتنا بہترین ہے۔',
    },
  ],
};

/* ────────────────────────────────────────────
   Feature data – Employers
   ──────────────────────────────────────────── */
const employerFeatures = {
  en: [
    {
      icon: Briefcase,
      title: 'Post Jobs',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'Create detailed job postings in under a minute. Add project scope, budget, timeline, and location — then watch verified workers start applying immediately.',
    },
    {
      icon: Users,
      title: 'Find Workers',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'Search our database of thousands of verified skilled workers by trade, experience, location, and rating. Filter results to match your exact project requirements.',
    },
    {
      icon: ShieldCheck,
      title: 'Worker Verification',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'Every worker on MazdoorPing is CNIC-verified. Browse profiles with confidence knowing their identity, skills, and certifications have been authenticated.',
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'Instantly message workers to discuss project details, negotiate terms, and coordinate schedules. Share images, voice notes, and documents seamlessly.',
    },
    {
      icon: Star,
      title: 'Favorites',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'Bookmark your best workers for quick re-hiring on future projects. Build a personal shortlist of trusted professionals you can rely on again and again.',
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'Read honest reviews from other employers before hiring. Our transparent rating system helps you pick workers with proven track records and high satisfaction scores.',
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'Get smart hiring recommendations, cost estimates for common projects, and answers to platform questions from our AI-powered assistant available around the clock.',
    },
    {
      icon: Bell,
      title: 'Notifications',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'Stay on top of every update — new worker applications, message alerts, booking confirmations, and payment receipts, all delivered instantly to your device.',
    },
  ],
  ur: [
    {
      icon: Briefcase,
      title: 'ملازمتیں پوسٹ کریں',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'ایک منٹ سے کم میں تفصیلی ملازمت کی پوسٹنگ بنائیں۔ منصوبے کا دائرہ کار، بجٹ، ٹائم لائن اور مقام شامل کریں — اور تصدیق شدہ مزدور فوری طور پر درخواست دینا شروع کر دیں۔',
    },
    {
      icon: Users,
      title: 'مزدور تلاش کریں',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'ہزاروں تصدیق شدہ ماہر مزدوروں کے ڈیٹا بیس کو پیشے، تجربے، مقام اور درجہ بندی کے لحاظ سے تلاش کریں۔ اپنی منصوبے کی ضروریات کے عین مطابق نتائج فلٹر کریں۔',
    },
    {
      icon: ShieldCheck,
      title: 'مزدور کی تصدیق',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/30',
      description:
        'مزدورپنگ پر ہر مزدور شناختی کارڈ سے تصدیق شدہ ہے۔ یقین دہانی کے ساتھ پروفائل دیکھیں کہ ان کی شناخت، مہارت اور سرٹیفکیٹس کی توثیق ہو چکی ہے۔',
    },
    {
      icon: MessageSquare,
      title: 'ریئل ٹائم چیٹ',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'مزدوروں کے ساتھ منصوبے کی تفصیلات، شرائط اور شیڈول پر فوری طور پر بات چیت کریں۔ تصاویر، آوازی نوٹس اور دستاویزات بے عیب شیئر کریں۔',
    },
    {
      icon: Star,
      title: 'پسندیدہ',
      gradient: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-amber-500/30',
      description:
        'مستقبل کے منصوبوں پر تیزی سے دوبارہ بھرتی کے لیے اپنے بہترین مزدوروں کو بک مارک کریں۔ قابل اعتماد پیشہ ور افراد کا ذاتی شارٹ لسٹ بنائیں۔',
    },
    {
      icon: Star,
      title: 'جائزے اور درجہ بندیاں',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'بھرتی سے پہلے دوسرے آجروں کے دیے گئے دیانتدار جائزے پڑھیں۔ ہماری شفاف درجہ بندی کا نظام آپ کو ثابت کارکردگی والے مزدور چننے میں مدد کرتا ہے۔',
    },
    {
      icon: Bot,
      title: 'AI اسسٹنٹ',
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderHover: 'hover:border-purple-500/30',
      description:
        'ہمارے AI پر مبنی اسسٹنٹ سے سمارٹ بھرتی کی تجاویز، عام منصوبوں کے لیے لاگت کا تخمینہ اور پلیٹ فارم کے سوالات کے جوابات حاصل کریں۔',
    },
    {
      icon: Bell,
      title: 'اطلاعات',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderHover: 'hover:border-blue-500/30',
      description:
        'ہر اپ ڈیٹ پر نظر رکھیں — نئی مزدور کی درخواستیں، میسج الرٹس، بکنگ کی تصدیق اور ادائیگی کی رسیدیں، سب آپ کے آلہ پر فوری طور پر پہنچائی جاتی ہیں۔',
    },
  ],
};

/* ────────────────────────────────────────────
   Platform features (simple row)
   ──────────────────────────────────────────── */
const platformFeatures = {
  en: [
    { icon: Globe, label: 'Multi-language\n(English / Urdu)', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { icon: Smartphone, label: 'Mobile\nResponsive', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { icon: ShieldCheck, label: 'CNIC\nVerification', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: Lock, label: 'Secure\nPayments', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: ShieldAlert, label: 'SOS Safety\nSystem', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { icon: Sparkles, label: 'Smart Job\nMatching', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ],
  ur: [
    { icon: Globe, label: 'ملٹی لینگویج\n(انگریزی / اردو)', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { icon: Smartphone, label: 'موبائل\nریسپانسو', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { icon: ShieldCheck, label: 'شناختی کارڈ\nتصدیق', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: Lock, label: 'محفوظ\nادائیگیاں', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: ShieldAlert, label: 'ایس او ایس حفاظتی\nنظام', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { icon: Sparkles, label: 'سمارٹ ملازمت\nمیچنگ', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ],
};

/* ────────────────────────────────────────────
   Shared FeatureCard component
   ──────────────────────────────────────────── */
function FeatureCard({
  feature,
  index,
}: {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    gradient: string;
    iconColor: string;
    borderHover: string;
    description: string;
  };
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <div
      className={`animate-fade-in glass-card group p-6 sm:p-8 ${feature.borderHover}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
      >
        <Icon className={`h-6 w-6 ${feature.iconColor}`} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
    </div>
  );
}

/* ────────────────────────────────────────────
   Page component
   ──────────────────────────────────────────── */
export default function FeaturesPage() {
  const { language } = useLanguageStore();
  const isUrdu = language === 'ur';

  const wFeatures = isUrdu ? workerFeatures.ur : workerFeatures.en;
  const eFeatures = isUrdu ? employerFeatures.ur : employerFeatures.en;
  const pFeatures = isUrdu ? platformFeatures.ur : platformFeatures.en;

  return (
    <div className={`min-h-screen overflow-x-hidden ${isUrdu ? 'urdu-font' : ''}`}>
      {/* ── Navbar ─────────────────────────── */}
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

              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="scale-[0.85] sm:scale-100">
                  <LanguageToggle />
                </div>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white sm:inline-flex sm:px-4"
                >
                  {isUrdu ? 'لاگ ان' : 'Login'}
                </Link>
                <Link
                  href="/register"
                  className="glass-button whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                >
                  {isUrdu ? 'رجسٹر' : 'Register'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium text-white/60">
                {isUrdu ? 'خصوصیات' : 'Features'}
              </span>
            </div>

            <h1
              className="animate-fade-in text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu ? 'طاقتور' : 'Powerful'}{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                {isUrdu ? 'خصوصیات' : 'Features'}
              </span>
            </h1>

            <p
              className="animate-fade-in mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-6 sm:text-lg"
              style={{ animationDelay: '0.2s' }}
            >
              {isUrdu
                ? 'مزدورپنگ آپ کو ہر وہ چیز فراہم کرتا ہے جو آپ کو کامیابی سے کام تلاش کرنے یا مزدور بھرتی کرنے کی ضرورت ہے۔ ہر خصوصیت آپ کے لیے ڈیزائن کی گئی ہے۔'
                : 'Everything you need to find work or hire skilled professionals — all in one platform. Explore the powerful features built for workers and employers across Pakistan.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── For Workers ────────────────────── */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400/80">
                {isUrdu ? 'مزدوروں کے لیے' : 'For Workers'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-2xl font-bold text-white sm:text-4xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu
                ? 'مزدوروں کے لیے '
                : 'Built for '}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                {isUrdu ? 'خصوصیات' : 'Workers'}
              </span>
            </h2>
            <p
              className="animate-fade-in mt-3 text-sm text-white/50 sm:mt-4 sm:text-base"
              style={{ animationDelay: '0.15s' }}
            >
              {isUrdu
                ? 'ماہر پیشہ ور افراد کو بہتر کام تلاش کرنے، محفوظ ادائیگیاں حاصل کرنے اور اپنے کیرئر کو بڑھانے میں مدد کرنے کے لیے خصوصیات۔'
                : 'Tools and features to help skilled professionals find better work, get paid securely, and grow their careers.'}
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── For Employers ──────────────────── */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-blue-400/80">
                {isUrdu ? 'آجرووں کے لیے' : 'For Employers'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-2xl font-bold text-white sm:text-4xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu
                ? 'آجرووں کے لیے '
                : 'Built for '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                {isUrdu ? 'خصوصیات' : 'Employers'}
              </span>
            </h2>
            <p
              className="animate-fade-in mt-3 text-sm text-white/50 sm:mt-4 sm:text-base"
              style={{ animationDelay: '0.15s' }}
            >
              {isUrdu
                ? 'ماہر مزدوروں کو تیزی سے تلاش کرنے، منصوبوں کا نظم کرنے اور بہترین نتائج حاصل کرنے کے لیے طاقتور ٹولز۔'
                : 'Powerful tools to find skilled workers quickly, manage projects seamlessly, and get the best results for every hire.'}
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Features ──────────────── */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white/60">
                {isUrdu ? 'پلیٹ فارم' : 'Platform'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-2xl font-bold text-white sm:text-4xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu ? 'پلیٹ فارم' : 'Platform'}{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {isUrdu ? 'خصوصیات' : 'Features'}
              </span>
            </h2>
            <p
              className="animate-fade-in mt-3 text-sm text-white/50 sm:mt-4 sm:text-base"
              style={{ animationDelay: '0.15s' }}
            >
              {isUrdu
                ? 'مزدورپنگ کو خاص بنانے والی بنیادی صلاحیتیں جو آپ کے تجربے کو بہتر بناتی ہیں۔'
                : 'Core capabilities that make MazdoorPing the most trusted platform for skilled work in Pakistan.'}
            </p>
          </div>

          {/* Grid of platform pillars */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {pFeatures.map((pf, i) => {
              const Icon = pf.icon;
              return (
                <div
                  key={pf.label}
                  className="animate-fade-in glass-card flex flex-col items-center gap-4 p-6 text-center sm:p-8"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pf.bg} border ${pf.border}`}>
                    <Icon className={`h-7 w-7 ${pf.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug whitespace-pre-line">
                    {pf.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Highlight strip */}
          <div className="animate-fade-in mt-10 glass-card grid grid-cols-3 gap-4 p-6 sm:p-8" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col items-center gap-2 text-center">
              <Eye className="h-6 w-6 text-emerald-400" />
              <span className="text-lg sm:text-2xl font-bold text-white">10K+</span>
              <span className="text-xs text-white/40">{isUrdu ? 'فعال مزدور' : 'Active Workers'}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-lg sm:text-2xl font-bold text-white">5K+</span>
              <span className="text-xs text-white/40">{isUrdu ? 'رجسٹرڈ آجرو' : 'Employers'}</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <span className="text-lg sm:text-2xl font-bold text-white">50K+</span>
              <span className="text-xs text-white/40">{isUrdu ? 'مکمل منصوبے' : 'Jobs Done'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────── */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                {isUrdu ? 'تمام خصوصیات' : 'Experience All'}{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {isUrdu ? 'کا تجربہ کریں' : 'Features'}
                </span>
              </h2>
              <p className="mt-4 text-sm text-white/50 sm:mt-6 sm:text-base sm:text-lg">
                {isUrdu
                  ? 'مزدورپنگ شامل ہوں اور پاکستان کے سب سے بڑے ماہر مزدوروں کے نیٹ ورک کا حصہ بنیں۔ آج ہی مفت رجسٹر کریں۔'
                  : 'Join MazdoorPing today and be part of Pakistan\'s largest network of skilled workers and employers. Registration is free and takes less than a minute.'}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register?role=worker"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <span>{isUrdu ? 'مزدور کے طور پر شامل ہوں' : 'Join as Worker'}</span>
                  <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=employer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <span>{isUrdu ? 'آجرو کے طور پر شامل ہوں' : 'Join as Employer'}</span>
                  <Building2 className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────── */}
      <footer className="border-t border-white/5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="MazdoorPing"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg object-cover"
                />
                <span className="text-lg font-bold text-white">
                  Mazdoor<span className="text-emerald-400">Ping</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-white/40">
                {isUrdu
                  ? 'پاکستان کا سب سے بڑا پلیٹ فارم جو ماہر مزدوروں کو آجرووں سے جوڑتا ہے۔'
                  : 'Pakistan\'s premier platform connecting skilled workers with employers across the country.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {isUrdu ? 'فوری لنکس' : 'Quick Links'}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/about', label: isUrdu ? 'ہمارے بارے میں' : 'About Us' },
                  { href: '/how-it-works', label: isUrdu ? 'کیسے کام کرتا ہے' : 'How It Works' },
                  { href: '/features', label: isUrdu ? 'خصوصیات' : 'Features' },
                  { href: '/pricing', label: isUrdu ? 'قیمتیں' : 'Pricing' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/70"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {isUrdu ? 'قانونی' : 'Legal'}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/terms', label: isUrdu ? 'شرائط و ضوابط' : 'Terms of Service' },
                  { href: '/privacy', label: isUrdu ? 'رازداری کی پالیسی' : 'Privacy Policy' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/70"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {isUrdu ? 'رابطہ' : 'Contact'}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    {isUrdu ? 'ہم سے رابطہ کریں' : 'Contact Us'}
                  </Link>
                </li>
                <li className="text-sm text-white/30">
                  support@mazdoorping.pk
                </li>
                <li className="text-sm text-white/30">
                  {isUrdu ? 'لاہور، پنجاب، پاکستان' : 'Lahore, Punjab, Pakistan'}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} MazdoorPing Pvt. Limited.{' '}
              {isUrdu ? 'جملہ حقوق محفوظ ہیں۔' : 'All rights reserved.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/about" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'ہمارے بارے میں' : 'About'}
              </Link>
              <Link href="/how-it-works" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'کیسے کام کرتا ہے' : 'How It Works'}
              </Link>
              <Link href="/features" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'خصوصیات' : 'Features'}
              </Link>
              <Link href="/pricing" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'قیمتیں' : 'Pricing'}
              </Link>
              <Link href="/terms" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'شرائط' : 'Terms'}
              </Link>
              <Link href="/privacy" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'رازداری' : 'Privacy'}
              </Link>
              <Link href="/contact" className="text-xs text-white/30 transition-colors hover:text-white/60">
                {isUrdu ? 'رابطہ' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
