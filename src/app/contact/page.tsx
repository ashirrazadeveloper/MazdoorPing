'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { LanguageToggle } from '@/components/shared/LanguageToggle';

const contactInfo = [
  {
    icon: Mail,
    labelEn: 'Email',
    labelUr: 'ای میل',
    value: 'support@mazdoorping.com',
    href: 'mailto:support@mazdoorping.com',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Phone,
    labelEn: 'Phone',
    labelUr: 'فون',
    value: '+92 300 1234567',
    href: 'tel:+923001234567',
    gradient: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: MapPin,
    labelEn: 'Address',
    labelUr: 'پتہ',
    value: 'Lahore, Pakistan',
    href: '#',
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
];

const subjectOptions = [
  { value: 'general', en: 'General Inquiry', ur: 'عام استفسار' },
  { value: 'technical', en: 'Technical Support', ur: 'تکنیکی مدد' },
  { value: 'billing', en: 'Billing', ur: 'بلنگ' },
  { value: 'partnership', en: 'Partnership', ur: 'اشتراک' },
  { value: 'complaint', en: 'Complaint', ur: 'شکایت' },
];

const officeHours = [
  { dayEn: 'Monday - Friday', dayUr: 'پیر - جمعہ', time: '9:00 AM - 6:00 PM' },
  { dayEn: 'Saturday', dayUr: 'ہفتہ', time: '10:00 AM - 2:00 PM' },
  { dayEn: 'Sunday', dayUr: 'اتوار', time: 'Closed' },
];

const socialLinks = [
  { label: 'Facebook', href: '#', color: 'hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/30' },
  { label: 'Instagram', href: '#', color: 'hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-500/30' },
  { label: 'Twitter / X', href: '#', color: 'hover:bg-white/10 hover:text-white hover:border-white/30' },
];

export default function ContactPage() {
  const { language } = useLanguageStore();
  const isUrdu = language === 'ur';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);

    // Simulate sending — no backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset success after 4 seconds
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const footerLinks = [
    { href: '/about', en: 'About', ur: 'ہمارے بارے میں' },
    { href: '/how-it-works', en: 'How It Works', ur: 'یہ کیسے کام کرتا ہے' },
    { href: '/features', en: 'Features', ur: 'خصوصیات' },
    { href: '/pricing', en: 'Pricing', ur: 'قیمت' },
    { href: '/terms', en: 'Terms', ur: 'شرائط' },
    { href: '/privacy', en: 'Privacy', ur: 'رازداری' },
    { href: '/contact', en: 'Contact', ur: 'رابطہ' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-mesh">
      {/* ─── Top Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="glass mt-2 rounded-2xl px-3 py-2 sm:mt-3 sm:px-6 sm:py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 sm:h-9 sm:w-9">
                  <span className="text-xs font-bold text-white sm:text-sm">MP</span>
                </div>
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

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/70">
                {isUrdu ? 'ہم آپ کی مدد کے لیے یہاں ہیں' : 'We are here to help'}
              </span>
            </div>

            <h1
              className="animate-fade-in text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              {isUrdu ? 'ہم سے ' : 'Get '}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
                {isUrdu ? 'رابطہ کریں' : 'In Touch'}
              </span>
            </h1>

            <p
              className={`animate-fade-in mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:mt-6 sm:text-lg ${isUrdu ? 'urdu-font text-right' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              {isUrdu
                ? 'مزدورپنگ ٹیم سے بات کریں۔ ہم آپ کے سوالات، تجاویز، یا شکایات کے لیے ہر وقت تیار ہیں۔'
                : 'Have a question, feedback, or need support? Reach out to the MazdoorPing team — we\'d love to hear from you.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact Info Cards ─── */}
      <section className="relative pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={info.labelEn}
                  href={info.href}
                  className="animate-fade-in glass-card group p-6 sm:p-8 transition-all hover:border-emerald-500/30"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${info.gradient}`}
                  >
                    <Icon className={`h-6 w-6 ${info.iconColor}`} />
                  </div>
                  <h3
                    className={`mb-1 text-base font-semibold text-white sm:text-lg ${isUrdu ? 'text-right' : ''}`}
                  >
                    {isUrdu ? info.labelUr : info.labelEn}
                  </h3>
                  <p className={`text-sm text-white/50 sm:text-base ${isUrdu ? 'text-right' : ''}`}>
                    {info.value}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Contact Form ─── */}
      <section className="relative pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="animate-fade-in glass-card p-6 sm:p-8" style={{ animationDelay: '0.15s' }}>
              <div className={`mb-6 flex items-center gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Send className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold text-white ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu ? 'ہمیں پیغام بھیجیں' : 'Send Us a Message'}
                  </h2>
                  <p className={`text-sm text-white/40 ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu ? 'ہم 24 گھنٹوں کے اندر جواب دیں گے' : 'We\'ll get back to you within 24 hours'}
                  </p>
                </div>
              </div>

              {/* Success Toast */}
              {isSubmitted && (
                <div className="animate-fade-in mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <p className={`text-sm text-emerald-300 ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu
                      ? 'آپ کا پیغام کامیابی سے بھیج دیا گیا! شکریہ۔'
                      : 'Your message has been sent successfully! Thank you.'}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className={`block text-sm font-medium text-white/70 ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu ? 'نام' : 'Your Name'}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={isUrdu ? 'اپنا نام درج کریں' : 'Enter your name'}
                    className="glass-input w-full py-3 px-4 text-sm text-white placeholder:text-white/25"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className={`block text-sm font-medium text-white/70 ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu ? 'ای میل' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isUrdu ? 'ای میل درج کریں' : 'Enter your email'}
                      className="glass-input w-full py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="subject" className={`block text-sm font-medium text-white/70 ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu ? 'موضوع' : 'Subject'}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="glass-input w-full py-3 px-4 text-sm text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0c0c1c] text-white/50">
                      {isUrdu ? 'موضوع منتخب کریں' : 'Select a subject'}
                    </option>
                    {subjectOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0c0c1c] text-white">
                        {isUrdu ? opt.ur : opt.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className={`block text-sm font-medium text-white/70 ${isUrdu ? 'text-right' : ''}`}>
                    {isUrdu ? 'پیغام' : 'Message'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={isUrdu ? 'اپنا پیغام یہاں لکھیں...' : 'Write your message here...'}
                    className="glass-input w-full py-3 px-4 text-sm text-white placeholder:text-white/25 resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-button flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:pointer-events-none disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isUrdu ? 'بھیجا جا رہا ہے...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {isUrdu ? 'پیغام بھیجیں' : 'Send Message'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Office Hours ─── */}
      <section className="relative pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="animate-fade-in glass-card p-6 sm:p-8" style={{ animationDelay: '0.2s' }}>
              <div className={`mb-6 flex items-center gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className={`text-xl font-bold text-white ${isUrdu ? 'text-right' : ''}`}>
                  {isUrdu ? 'دفتری اوقات' : 'Office Hours'}
                </h2>
              </div>

              <div className="space-y-0 divide-y divide-white/5">
                {officeHours.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between py-4 first:pt-0 last:pb-0 ${isUrdu ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center gap-3 ${isUrdu ? 'flex-row-reverse' : ''}`}>
                      {item.time === 'Closed' ? (
                        <div className="flex h-2 w-2 rounded-full bg-red-400/60" />
                      ) : (
                        <div className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span
                        className={`text-sm font-medium text-white/70 ${isUrdu ? 'text-right' : ''}`}
                      >
                        {isUrdu ? item.dayUr : item.dayEn}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        item.time === 'Closed' ? 'text-red-400/70' : 'text-white/50'
                      }`}
                    >
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Media ─── */}
      <section className="relative pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in text-center" style={{ animationDelay: '0.25s' }}>
            <h2 className={`text-xl font-bold text-white sm:text-2xl ${isUrdu ? 'text-right' : ''}`}>
              {isUrdu ? 'سوشل میڈیا پر فالو کریں' : 'Follow Us on Social Media'}
            </h2>
            <p className={`mt-2 text-sm text-white/40 sm:text-base ${isUrdu ? 'text-right' : ''}`}>
              {isUrdu
                ? 'تازہ ترین اپ ڈیٹس اور خبروں کے لیے ہمیں فالو کریں'
                : 'Stay updated with the latest news and updates'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-white/50 transition-all hover:-translate-y-1 ${social.color}`}
                >
                  <span className="text-sm font-bold">{social.label.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/30 transition-colors hover:text-white/60 sm:text-sm"
              >
                {isUrdu ? link.ur : link.en}
              </Link>
            ))}
          </div>

          {/* Divider + Copyright */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600">
                <span className="text-[9px] font-bold text-white">MP</span>
              </div>
              <span className="text-sm font-bold text-white/70">
                Mazdoor<span className="text-emerald-400/70">Ping</span>
              </span>
            </div>

            <p className="text-xs text-white/25">
              &copy; {new Date().getFullYear()} MazdoorPing Pvt. Limited.{' '}
              {isUrdu ? 'جملہ حقوق محفوظ ہیں۔' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
