'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  X,
  Star,
  Crown,
  Zap,
  Briefcase,
  Users,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { useState } from 'react';

export default function PricingPage() {
  const { language } = useLanguageStore();
  const isUrdu = language === 'ur';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // --- DATA ---

  const workerFeatures = isUrdu
    ? [
        'تمام ملازمتیں مفت دیکھیں',
        'بے_limits ملازمتوں کی درخواست دیں',
        'آجروں سے چیٹ کریں',
        'والٹ اور ادائیگیاں',
        'SOS حفاظت',
        'مکمل ہونے والی ملازمتوں پر 10% پلیٹ فارم کمیشن',
      ]
    : [
        'Browse all jobs free',
        'Apply to unlimited jobs',
        'Chat with employers',
        'Wallet & payments',
        'SOS Safety feature',
        '10% platform commission on completed jobs',
      ];

  const faqItems = isUrdu
    ? [
        {
          q: 'کیا مجھے واپسی ملی سکتی ہے؟',
          a: 'اس وقت، سبسکرپشن فیس کی واپسی دستیاب نہیں ہے۔ تاہم، آپ کسی بھی وقت اپنا پلان منسوخ کر سکتے ہیں اور اپنے موجودہ بلنگ مدت کے اختتام تک اسے استعمال جاری رکھ سکتے ہیں۔',
        },
        {
          q: 'کیا میں اپنا پلان تبدیل کر سکتا ہوں؟',
          a: 'ہاں! آپ کسی بھی وقت اپنے پلان کو اپ گریڈ یا ڈاؤن گریڈ کر سکتے ہیں۔ اپ گریڈ فوری اطلاق ہوتی ہے اور فرق کی رقم بل کی جائے گی۔ ڈاؤن گریڈ اگلے بلنگ سائیکل پر لاگو ہوگی۔',
        },
        {
          q: '10% کمیشن کیسے کام کرتا ہے؟',
          a: 'جب ملازمت مکمل ہو جاتی ہے، آجرو ادائیگی کی کل رقم سے 10% کمیشن کاٹا جاتا ہے۔ باقی 90% رقم سیدھے مزدور کے والٹ میں جاتی ہے۔ یہ فیس پلیٹ فارم کو چلانے اور بہتر بنانے کے لیے استعمال ہوتی ہے۔',
        },
        {
          q: 'کیا میں پلیٹ فارم سے باہر ادائیگی لے سکتا ہوں؟',
          a: 'ہم مضبوط سفارش کرتے ہیں کہ آپ تمام لین دین پلیٹ فارم کے ذریعے کریں تاکہ آپ کو SOS حفاظت، تنازع کا حل، اور ادائیگی کی ضمانت ملیے۔ پلیٹ فارم سے باہر لین دین پر یہ حفاظت دستیاب نہیں ہوگی۔',
        },
        {
          q: 'آجرو کے لیے ڈیمو کیا ہے؟',
          a: 'آجرو کو مفت پلان ملتی ہے جس میں ماہانہ 3 ملازمتیں، بنیادی مزدور تلاش، اور چیٹ شامل ہے۔ یہ آپ کو پلیٹ فارم آزمانے کا موقع دیتی ہے۔',
        },
      ]
    : [
        {
          q: 'Can I get a refund?',
          a: 'Currently, subscription fees are non-refundable. However, you can cancel your plan at any time and continue using it until the end of your current billing period.',
        },
        {
          q: 'Can I change my plan?',
          a: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately and the difference will be prorated. Downgrades will apply at the start of the next billing cycle.',
        },
        {
          q: 'How does the 10% commission work?',
          a: 'When a job is completed, 10% commission is deducted from the total payment amount made by the employer. The remaining 90% goes directly to the worker\'s wallet. This fee helps us maintain and improve the platform.',
        },
        {
          q: 'Can I pay outside the platform?',
          a: 'We strongly recommend conducting all transactions through the platform so you receive SOS protection, dispute resolution, and payment security. Transactions outside the platform won\'t be covered by our protections.',
        },
        {
          q: 'Is there a free trial for employers?',
          a: 'Employers get a Free plan with 3 job posts per month, basic worker search, and chat. This allows you to try out the platform and see if it meets your needs before upgrading.',
        },
      ];

  const employerPlans = [
    {
      name: isUrdu ? 'فری پلان' : 'Free Plan',
      price: isUrdu ? 'Rs. 0' : 'Rs. 0',
      period: isUrdu ? '/ماہ' : '/mo',
      description: isUrdu
        ? 'شروع کرنے کے لیے بہترین'
        : 'Perfect to get started',
      badge: null,
      badgeColor: '',
      features: [
        {
          text: isUrdu ? '3 ملازمتیں پوسٹ کریں' : '3 Job posts per month',
          included: true,
        },
        {
          text: isUrdu ? 'بنیادی مزدور تلاش' : 'Basic worker search',
          included: true,
        },
        {
          text: isUrdu ? 'چیٹ سہولت' : 'Chat with workers',
          included: true,
        },
        {
          text: isUrdu ? '1 فیچرڈ لسٹنگ' : '1 Featured listing',
          included: true,
        },
        {
          text: isUrdu ? 'ترجیحی سپورٹ' : 'Priority support',
          included: false,
        },
        {
          text: isUrdu ? 'تجزیات' : 'Analytics dashboard',
          included: false,
        },
        {
          text: isUrdu ? 'اعلیٰ تلاش فلٹرز' : 'Advanced search filters',
          included: false,
        },
        {
          text: isUrdu ? 'ڈیڈیکیٹڈ اکاؤنٹ مینیجر' : 'Dedicated account manager',
          included: false,
        },
      ],
      buttonLabel: isUrdu ? 'مفت شروع کریں' : 'Get Started Free',
      buttonHref: '/register?role=employer',
      cardClass: 'border-white/10',
      buttonClass:
        'border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30',
      icon: Zap,
    },
    {
      name: isUrdu ? 'بیسک پلان' : 'Basic Plan',
      price: isUrdu ? 'Rs. 2,999' : 'Rs. 2,999',
      period: isUrdu ? '/ماہ' : '/mo',
      description: isUrdu
        ? 'بیچ جائزوں کے لیے بہترین'
        : 'Best for growing businesses',
      badge: isUrdu ? 'سب سے مقبول' : 'Most Popular',
      badgeColor:
        'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      features: [
        {
          text: isUrdu ? '20 ملازمتیں پوسٹ کریں' : '20 Job posts per month',
          included: true,
        },
        {
          text: isUrdu ? 'اعلیٰ تلاش فلٹرز' : 'Advanced search filters',
          included: true,
        },
        {
          text: isUrdu ? 'ترجیحی سپورٹ' : 'Priority support',
          included: true,
        },
        {
          text: isUrdu ? '5 فیچرڈ لسٹنگز' : '5 Featured listings',
          included: true,
        },
        {
          text: isUrdu ? 'تجزیات ڈیش بورڈ' : 'Analytics dashboard',
          included: true,
        },
        {
          text: isUrdu ? 'چیٹ سہولت' : 'Chat with workers',
          included: true,
        },
        {
          text: isUrdu ? 'ڈیڈیکیٹڈ اکاؤنٹ مینیجر' : 'Dedicated account manager',
          included: false,
        },
        {
          text: isUrdu ? 'بے_limits فیچرڈ لسٹنگز' : 'Unlimited featured listings',
          included: false,
        },
      ],
      buttonLabel: isUrdu ? 'بیسک پلان منتخب کریں' : 'Choose Basic Plan',
      buttonHref: '/register?role=employer',
      cardClass: 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      buttonClass:
        'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
      icon: Star,
    },
    {
      name: isUrdu ? 'پریمیم پلان' : 'Premium Plan',
      price: isUrdu ? 'Rs. 7,999' : 'Rs. 7,999',
      period: isUrdu ? '/ماہ' : '/mo',
      description: isUrdu
        ? 'بڑے کاروباروں کے لیے'
        : 'For large-scale operations',
      badge: isUrdu ? 'بہترین ویلیو' : 'Best Value',
      badgeColor:
        'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      features: [
        {
          text: isUrdu ? 'بے_limits ملازمتیں' : 'Unlimited job posts',
          included: true,
        },
        {
          text: isUrdu ? 'تمام خصوصیات تک رسائی' : 'Access to all features',
          included: true,
        },
        {
          text: isUrdu ? 'ڈیڈیکیٹڈ سپورٹ' : 'Dedicated support',
          included: true,
        },
        {
          text: isUrdu
            ? 'بے_limits فیچرڈ لسٹنگز'
            : 'Unlimited featured listings',
          included: true,
        },
        {
          text: isUrdu ? 'اعلیٰ تجزیات' : 'Advanced analytics',
          included: true,
        },
        {
          text: isUrdu
            ? 'ڈیڈیکیٹڈ اکاؤنٹ مینیجر'
            : 'Dedicated account manager',
          included: true,
        },
        {
          text: isUrdu ? 'چیٹ سہولت' : 'Chat with workers',
          included: true,
        },
        {
          text: isUrdu ? 'اعلیٰ تلاش فلٹرز' : 'Advanced search filters',
          included: true,
        },
      ],
      buttonLabel: isUrdu ? 'پریمیم پلان منتخب کریں' : 'Choose Premium Plan',
      buttonHref: '/register?role=employer',
      cardClass: 'border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]',
      buttonClass:
        'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30',
      icon: Crown,
    },
  ];

  // --- RENDER ---

  return (
    <div className={`min-h-screen overflow-x-hidden bg-mesh ${isUrdu ? 'urdu-font' : ''}`}>
      {/* ===== TOP NAVBAR ===== */}
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
              <div className="hidden items-center gap-6 md:flex">
                <Link
                  href="/features"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUrdu ? 'خصوصیات' : 'Features'}
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUrdu ? 'کیسے کام کرتا ہے' : 'How It Works'}
                </Link>
                <Link
                  href="/about"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUrdu ? 'ہمارے بارے میں' : 'About'}
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

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white/70">
                {isUrdu ? 'شفاف قیمتیں' : 'Transparent Pricing'}
              </span>
            </div>

            <h1
              className="animate-fade-in text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu ? 'آسان، ' : 'Simple, '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
                {isUrdu ? 'شفاف قیمتوں' : 'Transparent'}
              </span>{' '}
              {isUrdu ? 'کے ساتھ' : 'Pricing'}
            </h1>

            <p
              className={`animate-fade-in mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-6 sm:text-base ${isUrdu ? 'text-right' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              {isUrdu
                ? 'مزدورپنگ پر مزدوروں اور آجروں دونوں کے لیے سادہ اور منصفانہ قیمتوں کا نظام۔ کوئی چھپے ہوئے charges نہیں۔'
                : 'Simple and fair pricing for both workers and employers on MazdoorPing. No hidden charges.'}
            </p>
          </div>
        </div>
      </section>

      {/* ===== WORKER PRICING ===== */}
      <section className="relative py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
              <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                {isUrdu ? 'مزدور پلان' : 'Worker Plan'}
              </span>
            </div>
            <h2
              className={`animate-fade-in text-2xl font-bold text-white sm:text-3xl ${isUrdu ? 'text-right' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu
                ? 'مزدوروں کے لیے — صرف ایک بار'
                : 'For Workers — Pay Once, Access Forever'}
            </h2>
          </div>

          <div
            className={`animate-fade-in mx-auto max-w-2xl`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-emerald-500/[0.04] p-6 sm:p-10 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-[60px]" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-500/5 blur-[60px]" />

              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      {isUrdu ? 'ون ٹائم رجسٹریشن فیس' : 'One-time Registration Fee'}
                    </h3>
                    <p className="text-sm text-white/50 mt-1">
                      {isUrdu
                        ? 'زندگی بھر کی رسائی — دوبارہ کبھی ادائیگی نہیں'
                        : 'Lifetime access — never pay again'}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-emerald-400 sm:text-5xl">Rs. 500</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-6" />

                <p className={`text-sm text-white/50 mb-6 ${isUrdu ? 'text-right' : ''}`}>
                  {isUrdu
                    ? 'مزدوروں کو صرف ایک بار Rs. 500 کی رجسٹریشن فیس ادا کرنی ہوتی ہے۔ اس کے بعد وہ پلیٹ فارم کی تمام بنیادی سہولیات تک زندگی بھر مفت رسائی حاصل کر سکتے ہیں۔ پلیٹ فارم صرف مکمل ہونے والی ملازمتوں سے 10% کمیشن وصول کرتا ہے۔'
                    : 'Workers pay a one-time Rs. 500 registration fee. After that, they get lifetime free access to all essential platform features. The platform only charges a 10% commission on completed jobs.'}
                </p>

                <ul className={`space-y-3 ${isUrdu ? 'text-right' : ''}`}>
                  {workerFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/register?role=worker"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                  >
                    <span>{isUrdu ? 'مزدور کے طور پر رجسٹر کریں' : 'Register as Worker'}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EMPLOYER PRICING ===== */}
      <section className="relative py-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">
                {isUrdu ? 'آجرو پلانز' : 'Employer Plans'}
              </span>
            </div>
            <h2
              className={`animate-fade-in text-2xl font-bold text-white sm:text-3xl ${isUrdu ? 'text-right' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu
                ? 'اپنے کاروبار کے لیے صحیح پلان منتخب کریں'
                : 'Choose the Right Plan for Your Business'}
            </h2>
            <p
              className={`animate-fade-in mt-3 text-sm text-white/50 sm:text-base ${isUrdu ? 'text-right' : ''}`}
              style={{ animationDelay: '0.15s' }}
            >
              {isUrdu
                ? 'چاہے آپ چھوٹا کاروبار شروع کر رہے ہوں یا بڑی کمپنی، ہمارے پاس آپ کے لیے مناسب پلان ہے۔'
                : 'Whether you\'re starting out or running a large operation, we have the right plan for you.'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {employerPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`animate-fade-in relative flex flex-col rounded-2xl border bg-[rgba(12,12,28,0.95)] backdrop-blur-xl p-6 sm:p-8 transition-all hover:translate-y-[-4px] ${plan.cardClass}`}
                  style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-3 ${isUrdu ? 'left-6' : 'right-6'} rounded-full px-3 py-1 text-xs font-semibold ${plan.badgeColor}`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    <Icon className="h-6 w-6 text-white/70" />
                  </div>

                  {/* Name & Price */}
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-white/40 mt-1 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-white sm:text-4xl">{plan.price}</span>
                    <span className="text-sm text-white/40">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-white/20 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${feature.included ? 'text-white/70' : 'text-white/30'}`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Link
                    href={plan.buttonHref}
                    className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${plan.buttonClass}`}
                  >
                    <span>{plan.buttonLabel}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== COMMISSION EXPLANATION ===== */}
      <section className="relative py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1">
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">
                {isUrdu ? 'کمیشن کی وضاحت' : 'Commission Explained'}
              </span>
            </div>
            <h2
              className={`animate-fade-in text-2xl font-bold text-white sm:text-3xl ${isUrdu ? 'text-right' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu ? 'ہمارا کمیشن کیسے کام کرتا ہے؟' : 'How Our Commission Works'}
            </h2>
          </div>

          <div
            className={`animate-fade-in mx-auto max-w-2xl`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="rounded-2xl border border-white/10 bg-[rgba(12,12,28,0.95)] backdrop-blur-xl p-6 sm:p-10">
              <p className={`text-sm leading-relaxed text-white/60 mb-8 ${isUrdu ? 'text-right' : ''}`}>
                {isUrdu
                  ? 'مزدورپنگ مکمل ہونے والی ہر ملازمت پر 10% کمیشن وصول کرتا ہے۔ یہ فیس آجرو کی ادائیگی سے کاٹی جاتی ہے، اس لیے مزدور کو آگے بڑھ کر کوئی اضافی فیس ادا نہیں کرنی پڑتی۔ یہ نموذنیہ دیکھیں:'
                  : 'MazdoorPing charges a 10% commission on every completed job. This fee is deducted from the employer\'s payment, so the worker doesn\'t pay anything extra upfront. Here\'s an example:'}
              </p>

              {/* Example Calculation */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h4 className={`text-sm font-semibold text-white mb-5 ${isUrdu ? 'text-right' : ''}`}>
                  {isUrdu ? '📋 حساب کتاب کی مثال' : '📋 Example Calculation'}
                </h4>

                <div className="space-y-4">
                  <div className={`flex items-center justify-between ${isUrdu ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-white/50">
                      {isUrdu ? 'ملازمت کی کل قیمت' : 'Total Job Value'}
                    </span>
                    <span className="text-sm font-semibold text-white">Rs. 10,000</span>
                  </div>

                  <div className="h-px w-full bg-white/5" />

                  <div className={`flex items-center justify-between ${isUrdu ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-white/50">
                      {isUrdu ? 'پلیٹ فارم کمیشن (10%)' : 'Platform Commission (10%)'}
                    </span>
                    <span className="text-sm font-semibold text-red-400">- Rs. 1,000</span>
                  </div>

                  <div className="h-px w-full bg-white/5" />

                  <div className={`flex items-center justify-between ${isUrdu ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-white/50">
                      {isUrdu ? 'مزدور کو موصول ہوگی' : 'Worker Receives'}
                    </span>
                    <span className="text-lg font-bold text-emerald-400">Rs. 9,000</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <p className={`text-xs text-white/50 leading-relaxed ${isUrdu ? 'text-right' : ''}`}>
                  {isUrdu
                    ? 'یہ 10% فیس پلیٹ فارم کو محفوظ ادائیگی، تنازع کا حل، SOS حفاظت، اور بہتر خدمات فراہم کرنے میں مدد کرتی ہے۔ مزدور کے لیے بے دخل وصولی کے لیے کوئی اضافی فیس نہیں ہے۔'
                    : 'This 10% fee helps us maintain secure payments, dispute resolution, SOS safety features, and continuous platform improvements. There are no additional charges for withdrawals.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative py-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium text-white/60">
                {isUrdu ? 'سوالات' : 'FAQ'}
              </span>
            </div>
            <h2
              className={`animate-fade-in text-2xl font-bold text-white sm:text-3xl ${isUrdu ? 'text-right' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu ? 'قیمتوں کے بارے میں سوالات' : 'Pricing FAQ'}
            </h2>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="animate-fade-in rounded-xl border border-white/10 bg-[rgba(12,12,28,0.95)] backdrop-blur-xl overflow-hidden transition-all"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] ${isUrdu ? 'text-right flex-row-reverse' : ''}`}
                >
                  <span className="text-sm font-medium text-white/80">{item.q}</span>
                  <ChevronIcon isOpen={openFaq === index} />
                </button>
                {openFaq === index && (
                  <div className={`px-5 pb-4 ${isUrdu ? 'text-right' : ''}`}>
                    <div className="h-px w-full bg-white/5 mb-3" />
                    <p className="text-sm leading-relaxed text-white/50">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[60px]" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                {isUrdu ? 'اپنا پلان ' : 'Choose Your '}
                <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {isUrdu ? 'منتخب کریں' : 'Plan'}
                </span>
              </h2>
              <p
                className={`mt-4 text-sm text-white/50 sm:text-base ${isUrdu ? 'text-right' : ''}`}
              >
                {isUrdu
                  ? 'آج ہی شروع کریں اور مزدورپنگ کے ساتھ اپنے کاروبار کو نئی بلندیوں تک پہنچائیں۔'
                  : 'Start today and take your workforce to the next level with MazdoorPing.'}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register?role=worker"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{isUrdu ? 'مزدور کے طور پر رجسٹر کریں' : 'Register as Worker'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=employer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <Crown className="h-4 w-4" />
                  <span>{isUrdu ? 'آجرو کے طور پر رجسٹر کریں' : 'Register as Employer'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="MazdoorPing"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg object-cover"
              />
              <span className="text-sm font-bold text-white">
                Mazdoor<span className="text-emerald-400">Ping</span>
              </span>
            </Link>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link
                href="/about"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'ہمارے بارے میں' : 'About'}
              </Link>
              <Link
                href="/how-it-works"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'کیسے کام کرتا ہے' : 'How It Works'}
              </Link>
              <Link
                href="/features"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'خصوصیات' : 'Features'}
              </Link>
              <Link
                href="/pricing"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'قیمتیں' : 'Pricing'}
              </Link>
              <Link
                href="/terms"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'شرائط' : 'Terms'}
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'رازداری' : 'Privacy'}
              </Link>
              <Link
                href="/contact"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUrdu ? 'رابطہ' : 'Contact'}
              </Link>
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-between">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} MazdoorPing.{' '}
              {isUrdu ? 'جملہ حقوق محفوظ ہیں۔' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/20">
              <Globe className="h-3 w-3" />
              <span>{isUrdu ? 'پاکستان بھر میں دستیاب' : 'Available across Pakistan'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Small helper for the FAQ chevron */
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
