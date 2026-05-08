'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  UserPlus,
  FileText,
  Briefcase,
  Handshake,
  Search,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Star,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */
const faqDataEn = [
  {
    q: 'How do I register as a worker on MazdoorPing?',
    a: 'Simply click the "Register" button, select "Worker" as your role, and fill in your details including your CNIC number for verification. You can list your skills, set your hourly rates, upload photos of your previous work, and build a complete professional profile. The entire process takes less than 5 minutes and your profile will be reviewed by our team within 24 hours.',
  },
  {
    q: 'Is CNIC verification mandatory for all workers?',
    a: 'Yes, CNIC verification is a mandatory step for every worker who joins MazdoorPing. This ensures the safety and trust of both workers and employers. Your CNIC data is securely encrypted and only used for identity verification purposes. We follow strict data protection policies in compliance with Pakistani regulations.',
  },
  {
    q: 'How does the payment system work?',
    a: 'MazdoorPing uses a secure built-in digital wallet system. When an employer hires a worker, the payment is held in escrow until the job is completed and confirmed by both parties. Workers can withdraw their earnings directly to their bank account, JazzCash, or EasyPaisa. There are no hidden fees — we charge a small, transparent service commission on each transaction.',
  },
  {
    q: 'What is the SOS Safety feature?',
    a: 'The SOS Safety feature is a one-tap emergency alert system designed to protect workers on the job. If a worker feels unsafe at any point, they can press the SOS button which immediately sends an alert with their live GPS location to their emergency contacts and our safety team. This feature works even without an active internet connection in many cases, ensuring help is always just a tap away.',
  },
  {
    q: 'Can I find workers in my specific city or area?',
    a: 'Absolutely! MazdoorPing uses location-based search to help you find skilled workers near you. We have workers registered across all major Pakistani cities including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta. You can filter workers by city, area, skills, ratings, and availability to find the perfect match for your job.',
  },
  {
    q: 'How do employers post a job?',
    a: 'Employers can post a job in just a few simple steps. After registering and logging in, navigate to "Post a Job," describe your requirements including the job category, location, budget, and timeline. Qualified workers will be notified and can apply directly. You can review worker profiles, chat with candidates, and hire the best fit — all from one convenient platform.',
  },
  {
    q: 'Is MazdoorPing free to use?',
    a: 'Registration is completely free for both workers and employers. Workers can create profiles, browse jobs, and apply without any charges. Employers can post jobs and browse worker profiles at no cost. A small service fee is only charged when a job is successfully completed and payment is processed. This transparent model ensures fair pricing for everyone.',
  },
];

const faqDataUr = [
  {
    q: 'میں مزدور پنگ پر ورکر کے طور پر کیسے رجسٹر ہوں؟',
    a: 'صرف "رجسٹر" بٹن پر کلک کریں، اپنا کردار "ورکر" منتخب کریں، اور اپنی تفصیلات شامل اپنا شناختی کارڈ نمبر تصدیق کے لیے بھریں۔ آپ اپنی مہارتیں فہرست بنا سکتے ہیں، اپنے شرحی اوقات مقرر کرسکتے ہیں، اپنے پچھلے کام کی تصاویر اپ لوڈ کرسکتے ہیں، اور ایک مکمل پروفیشنل پروفائل بناسکتے ہیں۔ پورا عمل 5 منٹ سے کم وقت میں مکمل ہوجاتا ہے۔',
  },
  {
    q: 'کیا تمام ورکرز کے لیے شناختی کارڈ تصدیق ضروری ہے؟',
    a: 'جی ہاں، مزدور پنگ پر شامل ہونے والے ہر ورکر کے لیے شناختی کارڈ تصدیق ایک لازمی مرحلہ ہے۔ یہ ورکرز اور آجرو دونوں کی حفاظت اور اعتماد کو یقینی بناتا ہے۔ آپ کا شناختی کارڈ ڈیٹا محفوظ طریقے سے خفیہ کیا جاتا ہے اور صرف شناخت کی تصدیق کے لیے استعمال ہوتا ہے۔',
  },
  {
    q: 'ادائیگی کا نظام کیسے کام کرتا ہے؟',
    a: 'مزدور پنگ ایک محفوظ بلٹ ان ڈیجیٹل والٹ سسٹم استعمال کرتا ہے۔ جب کوئیاجر ورکر کو ملازمت دیتا ہے، ادائیگی کام مکمل ہونے اور دونوں فریقین کی تصدیق تک ان کیش میں رکھی جاتی ہے۔ ورکرز اپنی کمائی براہ راست اپنے بینک اکاؤنٹ، جاز کیش، یا ایزی پیسا میں نکال سکتے ہیں۔ کوئی پوشیدہ فیس نہیں ہے۔',
  },
  {
    q: 'ایس او ایس سیفٹی فیچر کیا ہے؟',
    a: 'ایس او ایس سیفٹی فیچر جاب پر ورکرز کی حفاظت کے لیے ڈیزائن کیا گیا ایک ون ٹاپ ایمرجنسی الرٹ سسٹم ہے۔ اگر کسی ورکر کو کسی بھی نقطہ پر غیر محفوظ محسوس ہوتا ہے، تو وہ ایس او ایس بٹن دبا سکتا ہے جو فوری طور پر ان کے جی پی ایس مقام کے ساتھ الرٹ بھیجتا ہے۔ یہ فیچر بغیر انٹرنیٹ کنکشن کے بھی کام کرتا ہے۔',
  },
  {
    q: 'کیا میں اپنے مخصوص شہر یا علاقے میں ورکر تلاش کر سکتا ہوں؟',
    a: 'بالکل! مزدور پنگ مقام پر مبنی تلاش استعمال کرتا ہے تاکہ آپ اپنے قریب مہارت ور ورکر تلاش کرسکیں۔ ہمارے پاس لاہور، کراچی، اسلام آباد، راولپنڈی، فیصل آباد، ملتان، پشاور، اور کوئٹہ سمیت تمام بڑے پاکستانی شہروں میں رجسٹرڈ ورکرز ہیں۔ آپ شہر، علاقہ، مہارت، درجہ بندی، اور دستیابی کے مطابق فلٹر کر سکتے ہیں۔',
  },
  {
    q: 'آجرو کام کیسے پوسٹ کرتے ہیں؟',
    a: 'آجرو چند آسان مراحل میں کام پوسٹ کرسکتے ہیں۔ رجسٹریشن اور لاگ ان کے بعد، "پوسٹ ایک جاب" پر جائیں، اپنی ضروریات بشمول کام کی قسم، مقام، بجٹ، اور ٹائم لائن کا بیان کریں۔ اہل ورکرز کو مطلع کیا جائے گا اور وہ براہ راست درخواست دے سکتے ہیں۔ آپ ورکر پروفائلز کا جائزہ لے سکتے ہیں۔',
  },
  {
    q: 'کیا مزدور پنگ استعمال کرنا مفت ہے؟',
    a: 'رجسٹریشن ورکرز اور آجرو دونوں کے لیے مکمل طور پر مفت ہے۔ ورکرز پروفائل بناسکتے ہیں، کام تلاش کرسکتے ہیں، اور بغیر کسی خرچے کے درخواست دے سکتے ہیں۔ آجرو مفت میں کام پوسٹ اور ورکر پروفائلز براؤز کرسکتے ہیں۔ ایک چھوٹی سروس فیس صرف اس وقت لی جاتی ہے جب کام کامیابی سے مکمل ہوجاتا ہے۔',
  },
];

/* ------------------------------------------------------------------ */
/*  Worker steps                                                       */
/* ------------------------------------------------------------------ */
const workerStepsEn = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Register & Create Profile',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    desc: 'Sign up as a skilled worker on MazdoorPing by providing your basic details, uploading a profile photo, and entering your CNIC number for identity verification. List all your professional skills — whether you are a plumber, electrician, carpenter, painter, mason, or any other trade specialist. You can also set your preferred working hours, hourly rates, and service areas to attract the right employers. A complete and verified profile significantly increases your chances of getting hired quickly.',
  },
  {
    step: 2,
    icon: Briefcase,
    title: 'Browse & Apply for Jobs',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    desc: 'Explore hundreds of job listings posted by employers across Pakistan using our powerful search and filter tools. Search by location, job category, budget range, and work type to find opportunities that perfectly match your skills and availability. Read job descriptions carefully, check employer ratings and reviews, and apply with a single tap. You can also save jobs for later and receive real-time notifications when new matching jobs are posted in your area.',
  },
  {
    step: 3,
    icon: Handshake,
    title: 'Get Hired & Complete Work',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    desc: 'Once an employer selects you, use our built-in chat system to discuss job details, negotiate terms, and coordinate schedules before starting work. MazdoorPing provides you with the employer\'s exact location through our integrated map system. Complete the work professionally while staying connected with your employer through the platform. Our SOS safety feature is always available if you ever feel unsafe at the workplace, giving you complete peace of mind.',
  },
  {
    step: 4,
    icon: FileText,
    title: 'Receive Payment Securely',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    desc: 'After completing the job and receiving confirmation from the employer, your payment is instantly released from escrow into your MazdoorPing digital wallet. You can withdraw funds directly to your bank account, JazzCash, or EasyPaisa at any time. All transactions are fully transparent with detailed records available in your wallet history. Build a strong work history and earn positive reviews to unlock higher-paying opportunities and premium job recommendations.',
  },
];

const workerStepsUr = [
  {
    step: 1,
    icon: UserPlus,
    title: 'رجسٹر کریں اور پروفائل بنائیں',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    desc: 'مزدور پنگ پر مہارت ور ورکر کے طور پر سائن اپ کریں۔ اپنی بنیادی تفصیلات فراہم کریں، پروفائل تصویر اپ لوڈ کریں، اور شناختی کی تصدیق کے لیے اپنا شناختی کارڈ نمبر درج کریں۔ اپنی تمام پیشہ ورانہ مہارتیں فہرست کریں — چاہے آپ پلمبر، الیکٹریشن، در(saazgar)، پینٹر، یا کسی بھی دوسرے تجارتی ماہر ہوں۔ آپ اپنے ترجیحی کام کے اوقات اور شرحی اوقات بھی مقرر کرسکتے ہیں۔',
  },
  {
    step: 2,
    icon: Briefcase,
    title: 'کام تلاش کریں اور درخواست دیں',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    desc: 'ہمارے طاقتور تلاش اور فلٹر ٹولز کا استعمال کرتے ہوئے پاکستان بھر میں آجروں کی طرف سے پوسٹ کیے گئے سواریوں کی فہرستوں کو تلاش کریں۔ مقام، کام کی قسم، بجٹ رینج، اور کام کی قسم کے مطابق تلاش کریں تاکہ آپ کی مہارت اور دستیابی سے بالکل مماثل مواقع مل سکیں۔ ایک ٹاپ سے درخواست دیں اور ریئل ٹائم نوٹیفکیشن حاصل کریں۔',
  },
  {
    step: 3,
    icon: Handshake,
    title: 'ملازمت حاصل کریں اور کام مکمل کریں',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    desc: 'جب کوئیاجر آپ کو منتخب کرتا ہے، تو کام شروع کرنے سے پہلے ہماری بلٹ ان چیٹ سسٹم کا استعمال کرتے ہوئے کام کی تفصیلات پر بات چیت کریں۔ مزدور پنگ آپ کو اپنے انٹیگریٹڈ میپ سسٹم کے ذریعےاجر کی دقیق مقام فراہم کرتا ہے۔ کام کو پیشہ ورانہ طریقے سے مکمل کریں۔ ہمارا ایس او ایس سیفٹی فیچر ہمیشہ دستیاب ہے۔',
  },
  {
    step: 4,
    icon: FileText,
    title: 'محفوظ طور پر ادائیگی حاصل کریں',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    desc: 'کام مکمل ہونے اوراجر سے تصدیق ملنے کے بعد، آپ کی ادائیگی فوری طور پر اسکیرو سے آپ کے مزدور پنگ ڈیجیٹل والٹ میں جاری ہوجاتی ہے۔ آپ فنڈز کو براہ راست اپنے بینک اکاؤنٹ، جاز کیش، یا ایزی پیسا میں کسی بھی وقت نکال سکتے ہیں۔ تمام لین دین مکمل طور پر شفاف ہیں۔ مضبوط کام کی تاریخ بنائیں اور پریmium کام کی سفارشات حاصل کریں۔',
  },
];

/* ------------------------------------------------------------------ */
/*  Employer steps                                                     */
/* ------------------------------------------------------------------ */
const employerStepsEn = [
  {
    step: 1,
    icon: FileText,
    title: 'Post Your Job Requirements',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    desc: 'Create a detailed job posting in minutes by describing exactly what you need done. Specify the job category (plumbing, electrical, construction, painting, etc.), your preferred location, budget range, expected timeline, and any special requirements. Upload reference photos if helpful. Our system will automatically notify the most relevant and highly-rated skilled workers in your area, ensuring you receive quality applications from day one.',
  },
  {
    step: 2,
    icon: Search,
    title: 'Find & Hire Skilled Workers',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    desc: 'Browse through a curated pool of CNIC-verified, reviewed, and rated workers using our intelligent search and filtering system. Compare workers based on their skills, experience, ratings, proximity to your location, and past work photos. Use our AI-powered smart matching feature to get instant recommendations for the best-fit workers for your specific job. Review applications, check worker profiles thoroughly, and hire the perfect candidate with confidence.',
  },
  {
    step: 3,
    icon: MessageSquare,
    title: 'Manage & Track Progress',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    desc: 'Stay in complete control of your project from start to finish using our comprehensive management tools. Communicate directly with your hired worker through the in-app chat system, share updates, photos, and instructions in real time. Track work progress, set milestones for larger projects, and manage schedules effortlessly. Receive notifications at every key stage of the project so you are always informed and can provide timely feedback or approvals.',
  },
  {
    step: 4,
    icon: CheckCircle2,
    title: 'Make Secure Payments',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    desc: 'Pay your workers safely and conveniently through our secure escrow-based payment system. The payment is held securely until you confirm the work has been completed to your satisfaction. Support multiple payment methods including bank transfers, JazzCash, EasyPaisa, and credit/debit cards. Every transaction is recorded with a digital receipt and complete history for your records. Rate and review the worker after completion to help maintain platform quality.',
  },
];

const employerStepsUr = [
  {
    step: 1,
    icon: FileText,
    title: 'اپنی ملازمت کی ضروریات پوسٹ کریں',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    desc: 'منٹوں میں ایک تفصیلی کام کی پوسٹنگ بنائیں۔ کام کی قسم، ترجیحی مقام، بجٹ رینج، متوقع ٹائم لائن، اور کسی بھی خاص ضروریات کا بیان کریں۔ حوالہ تصاویر اپ لوڈ کریں۔ ہمارا سسٹم آپ کے علاقے میں سب سے متعلقہ اور اعلیٰ درجہ بندی والے مہارت ور ورکرز کو خود بخود مطلع کرے گا۔',
  },
  {
    step: 2,
    icon: Search,
    title: 'مہارت ور ورکرز تلاش اور ملازمت دیں',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    desc: 'ہمارے ذہین تلاش اور فلٹرنگ سسٹم کا استعمال کرتے ہوئے شناختی کارڈ سے تصدیق شدہ، ناقد، اور درجہ بندی شدہ ورکرز کے ایک منتخب حصے کو براؤز کریں۔ ورکرز کو ان کی مہارت، تجربہ، درجہ بندی، آپ کے مقام کی قربت، اور پچھلے کام کی تصاویر کی بنیاد پر موازنہ کریں۔ اعلیٰ ترین امیدوار کو اعتماد سے ملازمت دیں۔',
  },
  {
    step: 3,
    icon: MessageSquare,
    title: 'پیش رفت کو منتظم اور ٹریک کریں',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    desc: 'ہمارے جامع مینجمنٹ ٹولز کا استعمال کرتے ہوئے شروع سے آخر تک اپنے پروجیکٹ پر مکمل کنٹرول رکھیں۔ ان ایپ چیٹ سسٹم کے ذریعے اپنے ملازم ورکر سے براہ راست بات کریں۔ کام کی پیش رفت ٹریک کریں، بڑے پروجیکٹس کے لیے میل اسٹونز سیٹ کریں۔',
  },
  {
    step: 4,
    icon: CheckCircle2,
    title: 'محفوظ ادائیگی کریں',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    desc: 'ہمارے محفوظ اسکیرو بیسڈ ادائیگی سسٹم کے ذریعے اپنے ورکرز کو محفوظ طریقے سے ادائیگی کریں۔ ادائیگی محفوظ طور پر رکھی جاتی ہے جب تک آپ تصدیق نہ کریں کہ کام آپ کی اطمینان کے مطابق مکمل ہو گیا ہے۔ بینک ٹرانسفر، جاز کیش، ایزی پیسا، اور کریڈٹ/ڈیبٹ کارڈز کی حمایت کریں۔',
  },
];

/* ------------------------------------------------------------------ */
/*  Why Choose Us features                                             */
/* ------------------------------------------------------------------ */
const featuresEn = [
  {
    icon: ShieldCheck,
    title: 'Verified Workers',
    desc: 'Every worker on MazdoorPing goes through a rigorous CNIC verification process. We verify identities, check credentials, and maintain detailed worker profiles with real reviews and ratings from previous employers, so you can hire with complete confidence and peace of mind.',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/30',
  },
  {
    icon: Zap,
    title: 'SOS Safety Feature',
    desc: 'Worker safety is our top priority. Our one-tap SOS emergency alert system instantly shares your live GPS location with emergency contacts and our dedicated safety response team. This life-saving feature works even in low-connectivity areas, ensuring protection on every job.',
    gradient: 'from-red-500/20 to-red-600/5',
    iconColor: 'text-red-400',
    borderHover: 'hover:border-red-500/30',
  },
  {
    icon: Star,
    title: 'Smart Matching',
    desc: 'Our AI-powered intelligent matching algorithm analyzes job requirements, worker skills, location proximity, ratings, and availability to recommend the best possible matches. This saves time for both workers and employers, resulting in faster hires and better job satisfaction.',
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/30',
  },
  {
    icon: FileText,
    title: 'Secure Payments',
    desc: 'All financial transactions are protected by our escrow-based payment system. Funds are held securely until both parties confirm job completion. We support bank transfers, JazzCash, EasyPaisa, and card payments with full transparency, digital receipts, and complete transaction history.',
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/30',
  },
];

const featuresUr = [
  {
    icon: ShieldCheck,
    title: 'تصدیق شدہ ورکرز',
    desc: 'مزدور پنگ پر ہر ورکر ایک سخت شناختی کارڈ تصدیق کے عمل سے گزرتا ہے۔ ہم شناخت کی تصدیق کرتے ہیں، اعتبار چیک کرتے ہیں، اور حقیقی جائزے اور درجہ بندی کے ساتھ تفصیلی ورکر پروفائلز برقرار رکھتے ہیں، تاکہ آپ مکمل اعتماد کے ساتھ ملازمت دے سکیں۔',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/30',
  },
  {
    icon: Zap,
    title: 'ایس او ایس سیفٹی فیچر',
    desc: 'ورکر سیفٹی ہماری سب سے اہم ترجیح ہے۔ ہمارا ون ٹپ ایس او ایس ایمرجنسی الرٹ سسٹم فوری طور پر آپ کی لائیو جی پی ایس مقام آپ کے ایمرجنسی رابطوں اور ہماری سیفٹی ری سپانس ٹیم کے ساتھ شیئر کرتا ہے۔ یہ فیچر کم کنیکٹیویٹی علاقوں میں بھی کام کرتا ہے۔',
    gradient: 'from-red-500/20 to-red-600/5',
    iconColor: 'text-red-400',
    borderHover: 'hover:border-red-500/30',
  },
  {
    icon: Star,
    title: 'سمارٹ میچنگ',
    desc: 'ہمارے اے آئی پر مبنی ذہین میچنگ الگورتھم کام کی ضروریات، ورکر مہارت، مقام کی قربت، درجہ بندی، اور دستیابی کا تجزیہ کرکے بہترین ممکنہ میچز کی سفارش کرتا ہے۔ یہ ورکرز اور آجروں دونوں کے لیے وقت بچاتا ہے۔',
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderHover: 'hover:border-purple-500/30',
  },
  {
    icon: FileText,
    title: 'محفوظ ادائیگیاں',
    desc: 'تمام مالیاتی لین دین ہمارے اسکیرو بیسڈ ادائیگی سسٹم کے ذریعے محفوط ہیں۔ فنڈز محفوظ طور پر رکھے جاتے ہیں جب تک دونوں فریقین کام کی تکمیل کی تصدیق نہ کریں۔ بینک ٹرانسفر، جاز کیش، ایزی پیسا، اور کارڈ ادائیگیوں کی حمایت کی جاتی ہے۔',
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    borderHover: 'hover:border-amber-500/30',
  },
];

/* ================================================================== */
/*  PAGE COMPONENT                                                     */
/* ================================================================== */
export default function HowItWorksPage() {
  const { language } = useLanguageStore();
  const isUr = language === 'ur';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = isUr ? faqDataUr : faqDataEn;
  const workerSteps = isUr ? workerStepsUr : workerStepsEn;
  const employerSteps = isUr ? employerStepsUr : employerStepsEn;
  const features = isUr ? featuresUr : featuresEn;

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ============================================================ */}
      {/*  NAVBAR                                                      */}
      {/* ============================================================ */}
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
                  href="/"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUr ? 'ہوم' : 'Home'}
                </Link>
                <Link
                  href="/about"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUr ? 'ہمارے بارے میں' : 'About'}
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm text-white transition-colors"
                >
                  {isUr ? 'کام کیسے کرتا ہے' : 'How It Works'}
                </Link>
                <Link
                  href="/features"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUr ? 'خصوصیات' : 'Features'}
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {isUr ? 'قیمتیں' : 'Pricing'}
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
                  {isUr ? 'سائن ان' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  className="glass-button whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                >
                  {isUr ? 'شروع کریں' : 'Get Started'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-36 sm:pb-24">
        {/* background glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
              style={{ animationDelay: '0s' }}
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white/70">
                {isUr ? 'آسان مراحل' : 'Simple Steps'}
              </span>
              <ChevronRight className="h-3 w-3 text-white/40" />
            </div>

            <h1
              className="animate-fade-in text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUr ? 'مزدور پنگ ' : 'How '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                {isUr ? 'کیسے کام کرتا ہے' : 'MazdoorPing Works'}
              </span>
            </h1>

            <p
              className="animate-fade-in mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:mt-6 sm:text-lg"
              style={{ animationDelay: '0.2s' }}
            >
              {isUr
                ? 'مزدور پنگ پاکستان کا سب سے قابل اعتماد پلیٹ فارم ہے جو مہارت ور ورکرز کو آجروں سے جوڑتا ہے۔ چاہے آپ کام تلاش کرنے والے ورکر ہوں یا قابل ورکر حاصل کرنے والےاجر — ہمارا عمل آسان، محفوظ، اور تیز ہے۔'
                : 'MazdoorPing is Pakistan\'s most trusted platform connecting skilled workers with employers. Whether you\'re a worker looking for your next opportunity or an employer seeking reliable talent — our process is simple, secure, and fast.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOR WORKERS – 4 STEPS                                       */}
      {/* ============================================================ */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div
              className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5"
              style={{ animationDelay: '0s' }}
            >
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400/80">
                {isUr ? 'ورکرز کے لیے' : 'For Workers'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-2xl font-bold text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUr ? 'آج ہی کام شروع کریں' : 'Start Working Today'}
            </h2>
            <p
              className="animate-fade-in mt-4 text-sm text-white/50 sm:text-base"
              style={{ animationDelay: '0.2s' }}
            >
              {isUr
                ? 'چار آسان مراحل میں اپنی مہارت سے کمائی شروع کریں اور قابل اعتماد آجروں سے جڑیں۔'
                : 'Follow four simple steps to start earning and connect with trusted employers across Pakistan.'}
            </p>
          </div>

          {/* Step cards */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {workerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="glass-card p-6 sm:p-8 h-full">
                    {/* step number + icon */}
                    <div className="mb-5 flex items-center gap-4">
                      <span className="text-3xl font-extrabold text-white/10 sm:text-4xl">
                        {String(step.step).padStart(2, '0')}
                      </span>
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgColor} border ${step.borderColor}`}
                      >
                        <Icon className={`h-7 w-7 ${step.color}`} />
                      </div>
                    </div>

                    <h3 className="mb-3 text-lg font-semibold text-white sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50 sm:text-base">
                      {step.desc}
                    </p>

                    {/* connector arrow on larger screens */}
                    {index < workerSteps.length - 1 && (
                      <div className="mt-6 flex items-center gap-2 text-white/20">
                        <div className="h-px flex-1 bg-white/10" />
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOR EMPLOYERS – 4 STEPS                                     */}
      {/* ============================================================ */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div
              className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5"
              style={{ animationDelay: '0s' }}
            >
              <Briefcase className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-blue-400/80">
                {isUr ? 'آجروں کے لیے' : 'For Employers'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-2xl font-bold text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUr ? 'بہترین ورکر حاصل کریں' : 'Hire the Best Talent'}
            </h2>
            <p
              className="animate-fade-in mt-4 text-sm text-white/50 sm:text-base"
              style={{ animationDelay: '0.2s' }}
            >
              {isUr
                ? 'چار آسان مراحل میں قابل اعتماد اور مہارت ور ورکرز کو ملازمت دیں۔'
                : 'Post jobs, find verified workers, and get your work done with our streamlined process.'}
            </p>
          </div>

          {/* Step cards */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {employerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="glass-card p-6 sm:p-8 h-full">
                    <div className="mb-5 flex items-center gap-4">
                      <span className="text-3xl font-extrabold text-white/10 sm:text-4xl">
                        {String(step.step).padStart(2, '0')}
                      </span>
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bgColor} border ${step.borderColor}`}
                      >
                        <Icon className={`h-7 w-7 ${step.color}`} />
                      </div>
                    </div>

                    <h3 className="mb-3 text-lg font-semibold text-white sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50 sm:text-base">
                      {step.desc}
                    </p>

                    {index < employerSteps.length - 1 && (
                      <div className="mt-6 flex items-center gap-2 text-white/20">
                        <div className="h-px flex-1 bg-white/10" />
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHY CHOOSE US                                               */}
      {/* ============================================================ */}
      <section className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <div
              className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
              style={{ animationDelay: '0s' }}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/60">
                {isUr ? 'ہمیں کیوں منتخب کریں' : 'Why Choose Us'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUr ? 'پاکستان پر اعتماد کیا گیا' : 'Trusted Across Pakistan'}
            </h2>
            <p
              className="animate-fade-in mt-4 text-sm text-white/50 sm:text-base"
              style={{ animationDelay: '0.2s' }}
            >
              {isUr
                ? 'ہزاروں ورکرز اور آجروں نے مزدور پنگ پر اعتماد کیا ہے۔ یہ ہیں وجوہات۔'
                : 'Thousands of workers and employers trust MazdoorPing. Here\'s why.'}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`animate-fade-in glass-card group p-6 sm:p-8 ${feature.borderHover}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ ACCORDION                                              */}
      {/* ============================================================ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 text-center sm:mb-16">
            <div
              className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"
              style={{ animationDelay: '0s' }}
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-white/60">
                {isUr ? 'سوالات و جوابات' : 'FAQ'}
              </span>
            </div>
            <h2
              className="animate-fade-in text-2xl font-bold text-white sm:text-4xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUr ? 'اکثر پوچھے گئے سوالات' : 'Frequently Asked Questions'}
            </h2>
            <p
              className="animate-fade-in mt-4 text-sm text-white/50 sm:text-base"
              style={{ animationDelay: '0.15s' }}
            >
              {isUr
                ? 'مزدور پنگ کے بارے میں عام سوالات کے جوابات تلاش کریں۔'
                : 'Find answers to the most common questions about MazdoorPing.'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="animate-fade-in glass-card overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.02] sm:p-6"
                >
                  <span className="text-sm font-semibold text-white sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-90 text-emerald-400' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96 pb-5 sm:pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 text-sm leading-relaxed text-white/50 sm:px-6 sm:text-base">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                {isUr ? 'شروع کرنے کے لیے تیار ہیں؟' : 'Ready to Get Started?'}
              </h2>
              <p className="mt-4 text-sm text-white/50 sm:text-lg">
                {isUr
                  ? 'ابھی رجسٹر کریں اور پاکستان کے سب سے بڑے ورکرز نیٹ ورک میں شامل ہوں۔'
                  : 'Join thousands of workers and employers already using MazdoorPing. Register now and get started in minutes.'}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/register?role=worker"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isUr ? 'ورکر کے طور پر شامل ہوں' : 'Join as Worker'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/register?role=employer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{isUr ? 'اجر کے طور پر شامل ہوں' : 'Join as Employer'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
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
                {isUr
                  ? 'پاکستان کا سب سے قابل اعتماد پلیٹ فارم جو مہارت ور ورکرز کو آجروں سے جوڑتا ہے۔'
                  : 'Pakistan\'s most trusted platform connecting skilled workers with employers.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {isUr ? 'فوری روابط' : 'Quick Links'}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: isUr ? 'ہمارے بارے میں' : 'About', href: '/about' },
                  { label: isUr ? 'کام کیسے کرتا ہے' : 'How It Works', href: '/how-it-works' },
                  { label: isUr ? 'خصوصیات' : 'Features', href: '/features' },
                  { label: isUr ? 'قیمتیں' : 'Pricing', href: '/pricing' },
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
                {isUr ? 'قانونی' : 'Legal'}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: isUr ? 'شرائط و ضوابط' : 'Terms of Service', href: '/terms' },
                  { label: isUr ? 'رازداری کی پالیسی' : 'Privacy Policy', href: '/privacy' },
                  { label: isUr ? 'ہمارے سے رابطہ کریں' : 'Contact Us', href: '/contact' },
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

            {/* For Workers */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {isUr ? 'ورکرز کے لیے' : 'For Workers'}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: isUr ? 'کام تلاش کریں' : 'Find Jobs', href: '/register?role=worker' },
                  { label: isUr ? 'پروفائل بنائیں' : 'Create Profile', href: '/register?role=worker' },
                  { label: isUr ? 'تصدیق حاصل کریں' : 'Get Verified', href: '/register?role=worker' },
                ].map((link, i) => (
                  <li key={i}>
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
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} MazdoorPing.{' '}
              {isUr ? 'جملہ حقوق محفوظ ہیں۔' : 'All rights reserved.'}
            </p>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUr ? 'شرائط و ضوابط' : 'Terms of Service'}
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUr ? 'رازداری کی پالیسی' : 'Privacy Policy'}
              </Link>
              <Link
                href="/contact"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {isUr ? 'رابطہ' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
