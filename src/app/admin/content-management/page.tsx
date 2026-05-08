'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import {
  Globe, Info, ListOrdered, Sparkles, DollarSign, Phone, FileText, Shield,
  Save, Loader2, CheckCircle2, AlertTriangle, MessageCircle, MapPin, Clock,
  Mail, Building2, Link2, ExternalLink, Play, Camera, AtSign, ChevronRight, Languages
} from 'lucide-react';

interface SiteContent {
  id?: string;
  page_slug: string;
  section_key: string;
  content_en: string;
  content_ur: string;
  content_type: string;
  sort_order: number;
  is_active: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface SectionField {
  section_key: string;
  labelEn: string;
  labelUr: string;
  content_type: 'text' | 'textarea' | 'url';
  sort_order: number;
  icon?: React.ElementType;
  group?: string;
}

const PAGE_TABS = [
  { slug: 'general', labelEn: 'General', labelUr: 'عام', icon: Globe },
  { slug: 'about', labelEn: 'About Us', labelUr: 'ہمارے بارے میں', icon: Info },
  { slug: 'how-it-works', labelEn: 'How It Works', labelUr: 'کیسے کام کرتا ہے', icon: ListOrdered },
  { slug: 'features', labelEn: 'Features', labelUr: 'خصوصیات', icon: Sparkles },
  { slug: 'pricing', labelEn: 'Pricing', labelUr: 'قیمت', icon: DollarSign },
  { slug: 'contact', labelEn: 'Contact', labelUr: 'رابطہ', icon: Phone },
  { slug: 'terms', labelEn: 'Terms & Conditions', labelUr: 'شرائط و ضوابط', icon: FileText },
  { slug: 'privacy', labelEn: 'Privacy Policy', labelUr: 'رازداری کی پالیسی', icon: Shield },
];

const SECTION_FIELDS: Record<string, SectionField[]> = {
  general: [
    { section_key: 'company_name', labelEn: 'Company Name', labelUr: 'کمپنی کا نام', content_type: 'text', sort_order: 1, icon: Building2, group: 'branding' },
    { section_key: 'company_tagline', labelEn: 'Company Tagline', labelUr: 'کمپنی کا ٹیگ لائن', content_type: 'text', sort_order: 2, icon: Sparkles, group: 'branding' },
    { section_key: 'hero_title_en', labelEn: 'Hero Title (English)', labelUr: 'ہیرو ٹائٹل (انگریزی)', content_type: 'text', sort_order: 3, icon: FileText, group: 'branding' },
    { section_key: 'hero_title_ur', labelEn: 'Hero Title (Urdu)', labelUr: 'ہیرو ٹائٹل (اردو)', content_type: 'text', sort_order: 4, icon: FileText, group: 'branding' },
    { section_key: 'hero_subtitle_en', labelEn: 'Hero Subtitle (English)', labelUr: 'ہیرو سب ٹائٹل (انگریزی)', content_type: 'textarea', sort_order: 5, icon: FileText, group: 'branding' },
    { section_key: 'hero_subtitle_ur', labelEn: 'Hero Subtitle (Urdu)', labelUr: 'ہیرو سب ٹائٹل (اردو)', content_type: 'textarea', sort_order: 6, icon: FileText, group: 'branding' },
    { section_key: 'footer_description_en', labelEn: 'Footer Description (English)', labelUr: 'فوٹر تفصیل (انگریزی)', content_type: 'textarea', sort_order: 7, icon: FileText, group: 'branding' },
    { section_key: 'footer_description_ur', labelEn: 'Footer Description (Urdu)', labelUr: 'فوٹر تفصیل (اردو)', content_type: 'textarea', sort_order: 8, icon: FileText, group: 'branding' },
    { section_key: 'contact_email', labelEn: 'Contact Email', labelUr: 'رابطہ ای میل', content_type: 'url', sort_order: 10, icon: Mail, group: 'contact' },
    { section_key: 'contact_phone', labelEn: 'Contact Phone', labelUr: 'رابطہ فون', content_type: 'text', sort_order: 11, icon: Phone, group: 'contact' },
    { section_key: 'contact_address_en', labelEn: 'Office Address (English)', labelUr: 'دفتر کا پتہ (انگریزی)', content_type: 'textarea', sort_order: 12, icon: MapPin, group: 'contact' },
    { section_key: 'contact_address_ur', labelEn: 'Office Address (Urdu)', labelUr: 'دفتر کا پتہ (اردو)', content_type: 'textarea', sort_order: 13, icon: MapPin, group: 'contact' },
    { section_key: 'working_hours_en', labelEn: 'Working Hours (English)', labelUr: 'کام کے اوقات (انگریزی)', content_type: 'text', sort_order: 14, icon: Clock, group: 'contact' },
    { section_key: 'working_hours_ur', labelEn: 'Working Hours (Urdu)', labelUr: 'کام کے اوقات (اردو)', content_type: 'text', sort_order: 15, icon: Clock, group: 'contact' },
    { section_key: 'facebook_url', labelEn: 'Facebook URL', labelUr: 'فیس بک URL', content_type: 'url', sort_order: 20, icon: Globe, group: 'social' },
    { section_key: 'instagram_url', labelEn: 'Instagram URL', labelUr: 'انسٹاگرام URL', content_type: 'url', sort_order: 21, icon: Camera, group: 'social' },
    { section_key: 'twitter_url', labelEn: 'Twitter / X URL', labelUr: 'ٹوئٹر / X URL', content_type: 'url', sort_order: 22, icon: AtSign, group: 'social' },
    { section_key: 'linkedin_url', labelEn: 'LinkedIn URL', labelUr: 'لنکڈ ان URL', content_type: 'url', sort_order: 23, icon: Link2, group: 'social' },
    { section_key: 'youtube_url', labelEn: 'YouTube URL', labelUr: 'یوٹیوب URL', content_type: 'url', sort_order: 24, icon: Play, group: 'social' },
    { section_key: 'whatsapp_url', labelEn: 'WhatsApp URL', labelUr: 'واٹس ایپ URL', content_type: 'url', sort_order: 25, icon: MessageCircle, group: 'social' },
  ],
  about: [
    { section_key: 'about_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: Info, group: 'main' },
    { section_key: 'about_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: Info, group: 'main' },
    { section_key: 'about_subtitle_en', labelEn: 'Page Subtitle (English)', labelUr: 'صفحہ کا سب عنوان (انگریزی)', content_type: 'textarea', sort_order: 3, icon: Info, group: 'main' },
    { section_key: 'about_subtitle_ur', labelEn: 'Page Subtitle (Urdu)', labelUr: 'صفحہ کا سب عنوان (اردو)', content_type: 'textarea', sort_order: 4, icon: Info, group: 'main' },
    { section_key: 'about_mission_en', labelEn: 'Our Mission (English)', labelUr: 'ہمارا مشن (انگریزی)', content_type: 'textarea', sort_order: 5, icon: Info, group: 'content' },
    { section_key: 'about_mission_ur', labelEn: 'Our Mission (Urdu)', labelUr: 'ہمارا مشن (اردو)', content_type: 'textarea', sort_order: 6, icon: Info, group: 'content' },
    { section_key: 'about_vision_en', labelEn: 'Our Vision (English)', labelUr: 'ہمارا وژن (انگریزی)', content_type: 'textarea', sort_order: 7, icon: Sparkles, group: 'content' },
    { section_key: 'about_vision_ur', labelEn: 'Our Vision (Urdu)', labelUr: 'ہمارا وژن (اردو)', content_type: 'textarea', sort_order: 8, icon: Sparkles, group: 'content' },
    { section_key: 'about_story_en', labelEn: 'Our Story (English)', labelUr: 'ہماری کہانی (انگریزی)', content_type: 'textarea', sort_order: 9, icon: FileText, group: 'content' },
    { section_key: 'about_story_ur', labelEn: 'Our Story (Urdu)', labelUr: 'ہماری کہانی (اردو)', content_type: 'textarea', sort_order: 10, icon: FileText, group: 'content' },
    { section_key: 'about_team_en', labelEn: 'Team Description (English)', labelUr: 'ٹیم کی تفصیل (انگریزی)', content_type: 'textarea', sort_order: 11, icon: Globe, group: 'content' },
    { section_key: 'about_team_ur', labelEn: 'Team Description (Urdu)', labelUr: 'ٹیم کی تفصیل (اردو)', content_type: 'textarea', sort_order: 12, icon: Globe, group: 'content' },
  ],
  'how-it-works': [
    { section_key: 'hiw_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: ListOrdered, group: 'main' },
    { section_key: 'hiw_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: ListOrdered, group: 'main' },
    { section_key: 'hiw_subtitle_en', labelEn: 'Page Subtitle (English)', labelUr: 'صفحہ کا سب عنوان (انگریزی)', content_type: 'textarea', sort_order: 3, icon: ListOrdered, group: 'main' },
    { section_key: 'hiw_subtitle_ur', labelEn: 'Page Subtitle (Urdu)', labelUr: 'صفحہ کا سب عنوان (اردو)', content_type: 'textarea', sort_order: 4, icon: ListOrdered, group: 'main' },
    { section_key: 'hiw_step1_title_en', labelEn: 'Step 1 Title (English)', labelUr: 'مرحلہ 1 عنوان (انگریزی)', content_type: 'text', sort_order: 10, group: 'steps' },
    { section_key: 'hiw_step1_title_ur', labelEn: 'Step 1 Title (Urdu)', labelUr: 'مرحلہ 1 عنوان (اردو)', content_type: 'text', sort_order: 11, group: 'steps' },
    { section_key: 'hiw_step1_desc_en', labelEn: 'Step 1 Description (English)', labelUr: 'مرحلہ 1 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 12, group: 'steps' },
    { section_key: 'hiw_step1_desc_ur', labelEn: 'Step 1 Description (Urdu)', labelUr: 'مرحلہ 1 تفصیل (اردو)', content_type: 'textarea', sort_order: 13, group: 'steps' },
    { section_key: 'hiw_step2_title_en', labelEn: 'Step 2 Title (English)', labelUr: 'مرحلہ 2 عنوان (انگریزی)', content_type: 'text', sort_order: 14, group: 'steps' },
    { section_key: 'hiw_step2_title_ur', labelEn: 'Step 2 Title (Urdu)', labelUr: 'مرحلہ 2 عنوان (اردو)', content_type: 'text', sort_order: 15, group: 'steps' },
    { section_key: 'hiw_step2_desc_en', labelEn: 'Step 2 Description (English)', labelUr: 'مرحلہ 2 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 16, group: 'steps' },
    { section_key: 'hiw_step2_desc_ur', labelEn: 'Step 2 Description (Urdu)', labelUr: 'مرحلہ 2 تفصیل (اردو)', content_type: 'textarea', sort_order: 17, group: 'steps' },
    { section_key: 'hiw_step3_title_en', labelEn: 'Step 3 Title (English)', labelUr: 'مرحلہ 3 عنوان (انگریزی)', content_type: 'text', sort_order: 18, group: 'steps' },
    { section_key: 'hiw_step3_title_ur', labelEn: 'Step 3 Title (Urdu)', labelUr: 'مرحلہ 3 عنوان (اردو)', content_type: 'text', sort_order: 19, group: 'steps' },
    { section_key: 'hiw_step3_desc_en', labelEn: 'Step 3 Description (English)', labelUr: 'مرحلہ 3 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 20, group: 'steps' },
    { section_key: 'hiw_step3_desc_ur', labelEn: 'Step 3 Description (Urdu)', labelUr: 'مرحلہ 3 تفصیل (اردو)', content_type: 'textarea', sort_order: 21, group: 'steps' },
    { section_key: 'hiw_step4_title_en', labelEn: 'Step 4 Title (English)', labelUr: 'مرحلہ 4 عنوان (انگریزی)', content_type: 'text', sort_order: 22, group: 'steps' },
    { section_key: 'hiw_step4_title_ur', labelEn: 'Step 4 Title (Urdu)', labelUr: 'مرحلہ 4 عنوان (اردو)', content_type: 'text', sort_order: 23, group: 'steps' },
    { section_key: 'hiw_step4_desc_en', labelEn: 'Step 4 Description (English)', labelUr: 'مرحلہ 4 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 24, group: 'steps' },
    { section_key: 'hiw_step4_desc_ur', labelEn: 'Step 4 Description (Urdu)', labelUr: 'مرحلہ 4 تفصیل (اردو)', content_type: 'textarea', sort_order: 25, group: 'steps' },
    { section_key: 'hiw_cta_title_en', labelEn: 'CTA Title (English)', labelUr: 'CTA عنوان (انگریزی)', content_type: 'text', sort_order: 30, group: 'cta' },
    { section_key: 'hiw_cta_title_ur', labelEn: 'CTA Title (Urdu)', labelUr: 'CTA عنوان (اردو)', content_type: 'text', sort_order: 31, group: 'cta' },
    { section_key: 'hiw_cta_subtitle_en', labelEn: 'CTA Subtitle (English)', labelUr: 'CTA سب عنوان (انگریزی)', content_type: 'textarea', sort_order: 32, group: 'cta' },
    { section_key: 'hiw_cta_subtitle_ur', labelEn: 'CTA Subtitle (Urdu)', labelUr: 'CTA سب عنوان (اردو)', content_type: 'textarea', sort_order: 33, group: 'cta' },
  ],
  features: [
    { section_key: 'features_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: Sparkles, group: 'main' },
    { section_key: 'features_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: Sparkles, group: 'main' },
    { section_key: 'features_subtitle_en', labelEn: 'Page Subtitle (English)', labelUr: 'صفحہ کا سب عنوان (انگریزی)', content_type: 'textarea', sort_order: 3, icon: Sparkles, group: 'main' },
    { section_key: 'features_subtitle_ur', labelEn: 'Page Subtitle (Urdu)', labelUr: 'صفحہ کا سب عنوان (اردو)', content_type: 'textarea', sort_order: 4, icon: Sparkles, group: 'main' },
    { section_key: 'feat1_title_en', labelEn: 'Feature 1 Title (English)', labelUr: 'خصوصیت 1 عنوان (انگریزی)', content_type: 'text', sort_order: 10, group: 'feature1' },
    { section_key: 'feat1_title_ur', labelEn: 'Feature 1 Title (Urdu)', labelUr: 'خصوصیت 1 عنوان (اردو)', content_type: 'text', sort_order: 11, group: 'feature1' },
    { section_key: 'feat1_desc_en', labelEn: 'Feature 1 Description (English)', labelUr: 'خصوصیت 1 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 12, group: 'feature1' },
    { section_key: 'feat1_desc_ur', labelEn: 'Feature 1 Description (Urdu)', labelUr: 'خصوصیت 1 تفصیل (اردو)', content_type: 'textarea', sort_order: 13, group: 'feature1' },
    { section_key: 'feat2_title_en', labelEn: 'Feature 2 Title (English)', labelUr: 'خصوصیت 2 عنوان (انگریزی)', content_type: 'text', sort_order: 14, group: 'feature2' },
    { section_key: 'feat2_title_ur', labelEn: 'Feature 2 Title (Urdu)', labelUr: 'خصوصیت 2 عنوان (اردو)', content_type: 'text', sort_order: 15, group: 'feature2' },
    { section_key: 'feat2_desc_en', labelEn: 'Feature 2 Description (English)', labelUr: 'خصوصیت 2 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 16, group: 'feature2' },
    { section_key: 'feat2_desc_ur', labelEn: 'Feature 2 Description (Urdu)', labelUr: 'خصوصیت 2 تفصیل (اردو)', content_type: 'textarea', sort_order: 17, group: 'feature2' },
    { section_key: 'feat3_title_en', labelEn: 'Feature 3 Title (English)', labelUr: 'خصوصیت 3 عنوان (انگریزی)', content_type: 'text', sort_order: 18, group: 'feature3' },
    { section_key: 'feat3_title_ur', labelEn: 'Feature 3 Title (Urdu)', labelUr: 'خصوصیت 3 عنوان (اردو)', content_type: 'text', sort_order: 19, group: 'feature3' },
    { section_key: 'feat3_desc_en', labelEn: 'Feature 3 Description (English)', labelUr: 'خصوصیت 3 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 20, group: 'feature3' },
    { section_key: 'feat3_desc_ur', labelEn: 'Feature 3 Description (Urdu)', labelUr: 'خصوصیت 3 تفصیل (اردو)', content_type: 'textarea', sort_order: 21, group: 'feature3' },
    { section_key: 'feat4_title_en', labelEn: 'Feature 4 Title (English)', labelUr: 'خصوصیت 4 عنوان (انگریزی)', content_type: 'text', sort_order: 22, group: 'feature4' },
    { section_key: 'feat4_title_ur', labelEn: 'Feature 4 Title (Urdu)', labelUr: 'خصوصیت 4 عنوان (اردو)', content_type: 'text', sort_order: 23, group: 'feature4' },
    { section_key: 'feat4_desc_en', labelEn: 'Feature 4 Description (English)', labelUr: 'خصوصیت 4 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 24, group: 'feature4' },
    { section_key: 'feat4_desc_ur', labelEn: 'Feature 4 Description (Urdu)', labelUr: 'خصوصیت 4 تفصیل (اردو)', content_type: 'textarea', sort_order: 25, group: 'feature4' },
    { section_key: 'feat5_title_en', labelEn: 'Feature 5 Title (English)', labelUr: 'خصوصیت 5 عنوان (انگریزی)', content_type: 'text', sort_order: 26, group: 'feature5' },
    { section_key: 'feat5_title_ur', labelEn: 'Feature 5 Title (Urdu)', labelUr: 'خصوصیت 5 عنوان (اردو)', content_type: 'text', sort_order: 27, group: 'feature5' },
    { section_key: 'feat5_desc_en', labelEn: 'Feature 5 Description (English)', labelUr: 'خصوصیت 5 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 28, group: 'feature5' },
    { section_key: 'feat5_desc_ur', labelEn: 'Feature 5 Description (Urdu)', labelUr: 'خصوصیت 5 تفصیل (اردو)', content_type: 'textarea', sort_order: 29, group: 'feature5' },
    { section_key: 'feat6_title_en', labelEn: 'Feature 6 Title (English)', labelUr: 'خصوصیت 6 عنوان (انگریزی)', content_type: 'text', sort_order: 30, group: 'feature6' },
    { section_key: 'feat6_title_ur', labelEn: 'Feature 6 Title (Urdu)', labelUr: 'خصوصیت 6 عنوان (اردو)', content_type: 'text', sort_order: 31, group: 'feature6' },
    { section_key: 'feat6_desc_en', labelEn: 'Feature 6 Description (English)', labelUr: 'خصوصیت 6 تفصیل (انگریزی)', content_type: 'textarea', sort_order: 32, group: 'feature6' },
    { section_key: 'feat6_desc_ur', labelEn: 'Feature 6 Description (Urdu)', labelUr: 'خصوصیت 6 تفصیل (اردو)', content_type: 'textarea', sort_order: 33, group: 'feature6' },
  ],
  pricing: [
    { section_key: 'pricing_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: DollarSign, group: 'main' },
    { section_key: 'pricing_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: DollarSign, group: 'main' },
    { section_key: 'pricing_subtitle_en', labelEn: 'Page Subtitle (English)', labelUr: 'صفحہ کا سب عنوان (انگریزی)', content_type: 'textarea', sort_order: 3, icon: DollarSign, group: 'main' },
    { section_key: 'pricing_subtitle_ur', labelEn: 'Page Subtitle (Urdu)', labelUr: 'صفحہ کا سب عنوان (اردو)', content_type: 'textarea', sort_order: 4, icon: DollarSign, group: 'main' },
    { section_key: 'pricing_free_title_en', labelEn: 'Free Plan Title (English)', labelUr: 'مفت پلان عنوان (انگریزی)', content_type: 'text', sort_order: 10, group: 'free' },
    { section_key: 'pricing_free_title_ur', labelEn: 'Free Plan Title (Urdu)', labelUr: 'مفت پلان عنوان (اردو)', content_type: 'text', sort_order: 11, group: 'free' },
    { section_key: 'pricing_free_desc_en', labelEn: 'Free Plan Description (English)', labelUr: 'مفت پلان تفصیل (انگریزی)', content_type: 'textarea', sort_order: 12, group: 'free' },
    { section_key: 'pricing_free_desc_ur', labelEn: 'Free Plan Description (Urdu)', labelUr: 'مفت پلان تفصیل (اردو)', content_type: 'textarea', sort_order: 13, group: 'free' },
    { section_key: 'pricing_basic_title_en', labelEn: 'Basic Plan Title (English)', labelUr: 'بیسک پلان عنوان (انگریزی)', content_type: 'text', sort_order: 14, group: 'basic' },
    { section_key: 'pricing_basic_title_ur', labelEn: 'Basic Plan Title (Urdu)', labelUr: 'بیسک پلان عنوان (اردو)', content_type: 'text', sort_order: 15, group: 'basic' },
    { section_key: 'pricing_basic_desc_en', labelEn: 'Basic Plan Description (English)', labelUr: 'بیسک پلان تفصیل (انگریزی)', content_type: 'textarea', sort_order: 16, group: 'basic' },
    { section_key: 'pricing_basic_desc_ur', labelEn: 'Basic Plan Description (Urdu)', labelUr: 'بیسک پلان تفصیل (اردو)', content_type: 'textarea', sort_order: 17, group: 'basic' },
    { section_key: 'pricing_premium_title_en', labelEn: 'Premium Plan Title (English)', labelUr: 'پریمیئم پلان عنوان (انگریزی)', content_type: 'text', sort_order: 18, group: 'premium' },
    { section_key: 'pricing_premium_title_ur', labelEn: 'Premium Plan Title (Urdu)', labelUr: 'پریمیئم پلان عنوان (اردو)', content_type: 'text', sort_order: 19, group: 'premium' },
    { section_key: 'pricing_premium_desc_en', labelEn: 'Premium Plan Description (English)', labelUr: 'پریمیئم پلان تفصیل (انگریزی)', content_type: 'textarea', sort_order: 20, group: 'premium' },
    { section_key: 'pricing_premium_desc_ur', labelEn: 'Premium Plan Description (Urdu)', labelUr: 'پریمیئم پلان تفصیل (اردو)', content_type: 'textarea', sort_order: 21, group: 'premium' },
    { section_key: 'pricing_faq_title_en', labelEn: 'FAQ Section Title (English)', labelUr: 'FAQ سیکشن عنوان (انگریزی)', content_type: 'text', sort_order: 30, group: 'faq' },
    { section_key: 'pricing_faq_title_ur', labelEn: 'FAQ Section Title (Urdu)', labelUr: 'FAQ سیکشن عنوان (اردو)', content_type: 'text', sort_order: 31, group: 'faq' },
    { section_key: 'pricing_faq_content_en', labelEn: 'FAQ Content (English)', labelUr: 'FAQ مواد (انگریزی)', content_type: 'textarea', sort_order: 32, group: 'faq' },
    { section_key: 'pricing_faq_content_ur', labelEn: 'FAQ Content (Urdu)', labelUr: 'FAQ مواد (اردو)', content_type: 'textarea', sort_order: 33, group: 'faq' },
  ],
  contact: [
    { section_key: 'contact_page_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: Phone, group: 'main' },
    { section_key: 'contact_page_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: Phone, group: 'main' },
    { section_key: 'contact_page_subtitle_en', labelEn: 'Page Subtitle (English)', labelUr: 'صفحہ کا سب عنوان (انگریزی)', content_type: 'textarea', sort_order: 3, icon: Phone, group: 'main' },
    { section_key: 'contact_page_subtitle_ur', labelEn: 'Page Subtitle (Urdu)', labelUr: 'صفحہ کا سب عنوان (اردو)', content_type: 'textarea', sort_order: 4, icon: Phone, group: 'main' },
    { section_key: 'contact_support_email', labelEn: 'Support Email', labelUr: 'سپورٹ ای میل', content_type: 'url', sort_order: 10, icon: Mail, group: 'details' },
    { section_key: 'contact_support_phone', labelEn: 'Support Phone', labelUr: 'سپورٹ فون', content_type: 'text', sort_order: 11, icon: Phone, group: 'details' },
    { section_key: 'contact_office_address_en', labelEn: 'Office Address (English)', labelUr: 'دفتر کا پتہ (انگریزی)', content_type: 'textarea', sort_order: 12, icon: MapPin, group: 'details' },
    { section_key: 'contact_office_address_ur', labelEn: 'Office Address (Urdu)', labelUr: 'دفتر کا پتہ (اردو)', content_type: 'textarea', sort_order: 13, icon: MapPin, group: 'details' },
    { section_key: 'contact_hours_en', labelEn: 'Business Hours (English)', labelUr: 'کاروباری اوقات (انگریزی)', content_type: 'text', sort_order: 14, icon: Clock, group: 'details' },
    { section_key: 'contact_hours_ur', labelEn: 'Business Hours (Urdu)', labelUr: 'کاروباری اوقات (اردو)', content_type: 'text', sort_order: 15, icon: Clock, group: 'details' },
    { section_key: 'contact_map_embed', labelEn: 'Map Embed URL', labelUr: 'نقشہ ایمبیڈ URL', content_type: 'url', sort_order: 20, icon: MapPin, group: 'map' },
    { section_key: 'contact_form_title_en', labelEn: 'Contact Form Title (English)', labelUr: 'رابطہ فارم عنوان (انگریزی)', content_type: 'text', sort_order: 25, group: 'form' },
    { section_key: 'contact_form_title_ur', labelEn: 'Contact Form Title (Urdu)', labelUr: 'رابطہ فارم عنوان (اردو)', content_type: 'text', sort_order: 26, group: 'form' },
  ],
  terms: [
    { section_key: 'terms_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: FileText, group: 'main' },
    { section_key: 'terms_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: FileText, group: 'main' },
    { section_key: 'terms_last_updated_en', labelEn: 'Last Updated (English)', labelUr: 'آخری اپ ڈیٹ (انگریزی)', content_type: 'text', sort_order: 3, icon: Clock, group: 'main' },
    { section_key: 'terms_last_updated_ur', labelEn: 'Last Updated (Urdu)', labelUr: 'آخری اپ ڈیٹ (اردو)', content_type: 'text', sort_order: 4, icon: Clock, group: 'main' },
    { section_key: 'terms_intro_en', labelEn: 'Introduction (English)', labelUr: 'تعارف (انگریزی)', content_type: 'textarea', sort_order: 5, icon: FileText, group: 'content' },
    { section_key: 'terms_intro_ur', labelEn: 'Introduction (Urdu)', labelUr: 'تعارف (اردو)', content_type: 'textarea', sort_order: 6, icon: FileText, group: 'content' },
    { section_key: 'terms_section1_title_en', labelEn: 'Section 1 Title (English)', labelUr: 'سیکشن 1 عنوان (انگریزی)', content_type: 'text', sort_order: 10, group: 'sec1' },
    { section_key: 'terms_section1_title_ur', labelEn: 'Section 1 Title (Urdu)', labelUr: 'سیکشن 1 عنوان (اردو)', content_type: 'text', sort_order: 11, group: 'sec1' },
    { section_key: 'terms_section1_content_en', labelEn: 'Section 1 Content (English)', labelUr: 'سیکشن 1 مواد (انگریزی)', content_type: 'textarea', sort_order: 12, group: 'sec1' },
    { section_key: 'terms_section1_content_ur', labelEn: 'Section 1 Content (Urdu)', labelUr: 'سیکشن 1 مواد (اردو)', content_type: 'textarea', sort_order: 13, group: 'sec1' },
    { section_key: 'terms_section2_title_en', labelEn: 'Section 2 Title (English)', labelUr: 'سیکشن 2 عنوان (انگریزی)', content_type: 'text', sort_order: 14, group: 'sec2' },
    { section_key: 'terms_section2_title_ur', labelEn: 'Section 2 Title (Urdu)', labelUr: 'سیکشن 2 عنوان (اردو)', content_type: 'text', sort_order: 15, group: 'sec2' },
    { section_key: 'terms_section2_content_en', labelEn: 'Section 2 Content (English)', labelUr: 'سیکشن 2 مواد (انگریزی)', content_type: 'textarea', sort_order: 16, group: 'sec2' },
    { section_key: 'terms_section2_content_ur', labelEn: 'Section 2 Content (Urdu)', labelUr: 'سیکشن 2 مواد (اردو)', content_type: 'textarea', sort_order: 17, group: 'sec2' },
    { section_key: 'terms_section3_title_en', labelEn: 'Section 3 Title (English)', labelUr: 'سیکشن 3 عنوان (انگریزی)', content_type: 'text', sort_order: 18, group: 'sec3' },
    { section_key: 'terms_section3_title_ur', labelEn: 'Section 3 Title (Urdu)', labelUr: 'سیکشن 3 عنوان (اردو)', content_type: 'text', sort_order: 19, group: 'sec3' },
    { section_key: 'terms_section3_content_en', labelEn: 'Section 3 Content (English)', labelUr: 'سیکشن 3 مواد (انگریزی)', content_type: 'textarea', sort_order: 20, group: 'sec3' },
    { section_key: 'terms_section3_content_ur', labelEn: 'Section 3 Content (Urdu)', labelUr: 'سیکشن 3 مواد (اردو)', content_type: 'textarea', sort_order: 21, group: 'sec3' },
    { section_key: 'terms_section4_title_en', labelEn: 'Section 4 Title (English)', labelUr: 'سیکشن 4 عنوان (انگریزی)', content_type: 'text', sort_order: 22, group: 'sec4' },
    { section_key: 'terms_section4_title_ur', labelEn: 'Section 4 Title (Urdu)', labelUr: 'سیکشن 4 عنوان (اردو)', content_type: 'text', sort_order: 23, group: 'sec4' },
    { section_key: 'terms_section4_content_en', labelEn: 'Section 4 Content (English)', labelUr: 'سیکشن 4 مواد (انگریزی)', content_type: 'textarea', sort_order: 24, group: 'sec4' },
    { section_key: 'terms_section4_content_ur', labelEn: 'Section 4 Content (Urdu)', labelUr: 'سیکشن 4 مواد (اردو)', content_type: 'textarea', sort_order: 25, group: 'sec4' },
  ],
  privacy: [
    { section_key: 'privacy_title_en', labelEn: 'Page Title (English)', labelUr: 'صفحہ کا عنوان (انگریزی)', content_type: 'text', sort_order: 1, icon: Shield, group: 'main' },
    { section_key: 'privacy_title_ur', labelEn: 'Page Title (Urdu)', labelUr: 'صفحہ کا عنوان (اردو)', content_type: 'text', sort_order: 2, icon: Shield, group: 'main' },
    { section_key: 'privacy_last_updated_en', labelEn: 'Last Updated (English)', labelUr: 'آخری اپ ڈیٹ (انگریزی)', content_type: 'text', sort_order: 3, icon: Clock, group: 'main' },
    { section_key: 'privacy_last_updated_ur', labelEn: 'Last Updated (Urdu)', labelUr: 'آخری اپ ڈیٹ (اردو)', content_type: 'text', sort_order: 4, icon: Clock, group: 'main' },
    { section_key: 'privacy_intro_en', labelEn: 'Introduction (English)', labelUr: 'تعارف (انگریزی)', content_type: 'textarea', sort_order: 5, icon: Shield, group: 'content' },
    { section_key: 'privacy_intro_ur', labelEn: 'Introduction (Urdu)', labelUr: 'تعارف (اردو)', content_type: 'textarea', sort_order: 6, icon: Shield, group: 'content' },
    { section_key: 'privacy_section1_title_en', labelEn: 'Section 1 Title (English)', labelUr: 'سیکشن 1 عنوان (انگریزی)', content_type: 'text', sort_order: 10, group: 'sec1' },
    { section_key: 'privacy_section1_title_ur', labelEn: 'Section 1 Title (Urdu)', labelUr: 'سیکشن 1 عنوان (اردو)', content_type: 'text', sort_order: 11, group: 'sec1' },
    { section_key: 'privacy_section1_content_en', labelEn: 'Section 1 Content (English)', labelUr: 'سیکشن 1 مواد (انگریزی)', content_type: 'textarea', sort_order: 12, group: 'sec1' },
    { section_key: 'privacy_section1_content_ur', labelEn: 'Section 1 Content (Urdu)', labelUr: 'سیکشن 1 مواد (اردو)', content_type: 'textarea', sort_order: 13, group: 'sec1' },
    { section_key: 'privacy_section2_title_en', labelEn: 'Section 2 Title (English)', labelUr: 'سیکشن 2 عنوان (انگریزی)', content_type: 'text', sort_order: 14, group: 'sec2' },
    { section_key: 'privacy_section2_title_ur', labelEn: 'Section 2 Title (Urdu)', labelUr: 'سیکشن 2 عنوان (اردو)', content_type: 'text', sort_order: 15, group: 'sec2' },
    { section_key: 'privacy_section2_content_en', labelEn: 'Section 2 Content (English)', labelUr: 'سیکشن 2 مواد (انگریزی)', content_type: 'textarea', sort_order: 16, group: 'sec2' },
    { section_key: 'privacy_section2_content_ur', labelEn: 'Section 2 Content (Urdu)', labelUr: 'سیکشن 2 مواد (اردو)', content_type: 'textarea', sort_order: 17, group: 'sec2' },
    { section_key: 'privacy_section3_title_en', labelEn: 'Section 3 Title (English)', labelUr: 'سیکشن 3 عنوان (انگریزی)', content_type: 'text', sort_order: 18, group: 'sec3' },
    { section_key: 'privacy_section3_title_ur', labelEn: 'Section 3 Title (Urdu)', labelUr: 'سیکشن 3 عنوان (اردو)', content_type: 'text', sort_order: 19, group: 'sec3' },
    { section_key: 'privacy_section3_content_en', labelEn: 'Section 3 Content (English)', labelUr: 'سیکشن 3 مواد (انگریزی)', content_type: 'textarea', sort_order: 20, group: 'sec3' },
    { section_key: 'privacy_section3_content_ur', labelEn: 'Section 3 Content (Urdu)', labelUr: 'سیکشن 3 مواد (اردو)', content_type: 'textarea', sort_order: 21, group: 'sec3' },
    { section_key: 'privacy_section4_title_en', labelEn: 'Section 4 Title (English)', labelUr: 'سیکشن 4 عنوان (انگریزی)', content_type: 'text', sort_order: 22, group: 'sec4' },
    { section_key: 'privacy_section4_title_ur', labelEn: 'Section 4 Title (Urdu)', labelUr: 'سیکشن 4 عنوان (اردو)', content_type: 'text', sort_order: 23, group: 'sec4' },
    { section_key: 'privacy_section4_content_en', labelEn: 'Section 4 Content (English)', labelUr: 'سیکشن 4 مواد (انگریزی)', content_type: 'textarea', sort_order: 24, group: 'sec4' },
    { section_key: 'privacy_section4_content_ur', labelEn: 'Section 4 Content (Urdu)', labelUr: 'سیکشن 4 مواد (اردو)', content_type: 'textarea', sort_order: 25, group: 'sec4' },
  ],
};

const DEFAULT_CONTENT: Record<string, Record<string, { en: string; ur: string }>> = {
  general: {
    company_name: { en: 'MazdoorPing', ur: 'مزدور پنگ' },
    company_tagline: { en: "Pakistan's Trusted Platform for Skilled Workers", ur: 'پاکستان کے ماہر مزدوروں کے لیے قابل اعتماد پلیٹ فارم' },
    hero_title_en: { en: 'Find Trusted Skilled Workers Near You', ur: 'اپنے قریب قابل اعتماد ماہر مزدور تلاش کریں' },
    hero_title_ur: { en: 'اپنے قریب قابل اعتماد ماہر مزدور تلاش کریں', ur: 'اپنے قریب قابل اعتماد ماہر مزدور تلاش کریں' },
    hero_subtitle_en: { en: 'Connect with verified electricians, plumbers, carpenters, painters, AC technicians and hundreds of skilled professionals across Pakistan.', ur: 'پاکستان بھر کے تصدیق شدہ الیکٹریشن، پلمبر، درودگر، پینٹر، اے سی تکنیشن اور سینکڑوں ماہر پیشہ ور افراد سے جڑیں۔' },
    hero_subtitle_ur: { en: 'پاکستان بھر کے تصدیق شدہ الیکٹریشن، پلمبر، درودگر، پینٹر، اے سی تکنیشن اور سینکڑوں ماہر پیشہ ور افراد سے جڑیں۔', ur: 'پاکستان بھر کے تصدیق شدہ الیکٹریشن، پلمبر، درودگر، پینٹر، اے سی تکنیشن اور سینکڑوں ماہر پیشہ ور افراد سے جڑیں۔' },
    footer_description_en: { en: 'MazdoorPing is Pakistan\'s leading platform connecting skilled workers with employers. Find trusted professionals for all your home and business needs.', ur: 'مزدور پنگ پاکستان کی سرکردہ پلیٹ فارم ہے جو ماہر مزدوروں کو آجروں سے جوڑتی ہے۔ اپنی تمام گھریلو اور کاروباری ضروریات کے لیے قابل اعتماد پیشہ ور تلاش کریں۔' },
    footer_description_ur: { en: 'مزدور پنگ پاکستان کی سرکردہ پلیٹ فارم ہے جو ماہر مزدوروں کو آجروں سے جوڑتی ہے۔', ur: 'مزدور پنگ پاکستان کی سرکردہ پلیٹ فارم ہے جو ماہر مزدوروں کو آجروں سے جوڑتی ہے۔ اپنی تمام گھریلو اور کاروباری ضروریات کے لیے قابل اعتماد پیشہ ور تلاش کریں۔' },
    contact_email: { en: 'support@mazdoorping.com', ur: 'support@mazdoorping.com' },
    contact_phone: { en: '+92-300-1234567', ur: '+92-300-1234567' },
    contact_address_en: { en: 'Office 42, Blue Area, Jinnah Avenue, Islamabad, Pakistan', ur: 'آفس 42، بلیو ایریا، جناح ایونیو، اسلام آباد، پاکستان' },
    contact_address_ur: { en: 'آفس 42، بلیو ایریا، جناح ایونیو، اسلام آباد، پاکستان', ur: 'آفس 42، بلیو ایریا، جناح ایونیو، اسلام آباد، پاکستان' },
    working_hours_en: { en: 'Mon - Sat: 9:00 AM - 6:00 PM', ur: 'پیر - ہفتہ: صبح 9:00 بجے - شام 6:00 بجے' },
    working_hours_ur: { en: 'پیر - ہفتہ: صبح 9:00 بجے - شام 6:00 بجے', ur: 'پیر - ہفتہ: صبح 9:00 بجے - شام 6:00 بجے' },
    facebook_url: { en: 'https://facebook.com/mazdoorping', ur: 'https://facebook.com/mazdoorping' },
    instagram_url: { en: 'https://instagram.com/mazdoorping', ur: 'https://instagram.com/mazdoorping' },
    twitter_url: { en: 'https://twitter.com/mazdoorping', ur: 'https://twitter.com/mazdoorping' },
    linkedin_url: { en: 'https://linkedin.com/company/mazdoorping', ur: 'https://linkedin.com/company/mazdoorping' },
    youtube_url: { en: 'https://youtube.com/@mazdoorping', ur: 'https://youtube.com/@mazdoorping' },
    whatsapp_url: { en: 'https://wa.me/923001234567', ur: 'https://wa.me/923001234567' },
  },
  about: {
    about_title_en: { en: 'About MazdoorPing', ur: 'مزدور پنگ کے بارے میں' },
    about_title_ur: { en: 'مزدور پنگ کے بارے میں', ur: 'مزدور پنگ کے بارے میں' },
    about_subtitle_en: { en: 'Empowering skilled workers across Pakistan with technology', ur: 'پاکستان بھر کے ماہر مزدوروں کو ٹیکنالوجی کے ساتھ بااختیار بنانا' },
    about_subtitle_ur: { en: 'پاکستان بھر کے ماہر مزدوروں کو ٹیکنالوجی کے ساتھ بااختیار بنانا', ur: 'پاکستان بھر کے ماہر مزدوروں کو ٹیکنالوجی کے ساتھ بااختیار بنانا' },
    about_mission_en: { en: 'Our mission is to revolutionize the skilled labor market in Pakistan by creating a trusted, technology-driven platform that connects skilled workers with employment opportunities while ensuring fair wages, dignity of labor, and professional growth for every worker on our platform.\n\nWe believe that every skilled worker deserves access to a steady stream of job opportunities, transparent pricing, timely payments, and a safe working environment. Through MazdoorPing, we are building an ecosystem that not only facilitates job matching but also provides workers with tools for professional development, financial management, and community support.', ur: 'ہمارا مشن پاکستان میں ماہر محنت کے بازار میں انقلاب لانا ہے ایک قابل اعتماد، ٹیکنالوجی پر مبنی پلیٹ فارم بنائیں جو ماہر مزدوروں کو روزگار کے مواقع سے جوڑتا ہو اور ہر مزدور کے لیے منصفانہ تنخواہ، محنت کی عزت اور پیشہ ورانہ ترقی یقینی بناتا ہو۔\n\nہمارا یقین ہے کہ ہر ماہر مزدور کو کام کے مستقل مواقع تک رسائی، شفاف قیمت کاری، وقت پر ادائیگی اور محفوظ کام کے ماحول کا حق ہے۔ مزدور پنگ کے ذریعے، ہم ایک ایکو سسٹم بنا رہے ہیں جو نہ صرف کام کی میچنگ کو آسان بناتا ہے بلکہ مزدوروں کو پیشہ ورانہ ترقی، مالیہ کا انتظام اور برادری کی مدد کے لیے ٹولز بھی فراہم کرتا ہے۔' },
    about_mission_ur: { en: 'ہمارا مشن پاکستان میں ماہر محنت کے بازار میں انقلاب لانا ہے ایک قابل اعتماد، ٹیکنالوجی پر مبنی پلیٹ فارم بنائیں جو ماہر مزدوروں کو روزگار کے مواقع سے جوڑتا ہو اور ہر مزدور کے لیے منصفانہ تنخواہ، محنت کی عزت اور پیشہ ورانہ ترقی یقینی بناتا ہو۔', ur: 'ہمارا مشن پاکستان میں ماہر محنت کے بازار میں انقلاب لانا ہے ایک قابل اعتماد، ٹیکنالوجی پر مبنی پلیٹ فارم بنائیں جو ماہر مزدوروں کو روزگار کے مواقع سے جوڑتا ہو اور ہر مزدور کے لیے منصفانہ تنخواہ، محنت کی عزت اور پیشہ ورانہ ترقی یقینی بناتا ہو۔' },
    about_vision_en: { en: 'Our vision is to become the largest and most trusted platform for skilled workers in Pakistan, where every worker can find dignified work and every employer can find reliable professionals.\n\nWe envision a future where the informal labor sector in Pakistan is fully digitized, where workers have access to financial services, insurance, and professional development tools, and where the dignity of labor is recognized and celebrated.', ur: 'ہمارا وژن پاکستان میں ماہر مزدوروں کے لیے سب سے بڑا اور سب سے قابل اعتماد پلیٹ فارم بننا ہے، جہاں ہر مزدور عزت کے ساتھ کام تلاش کر سکے اور ہر مقصد کار قابل اعتماد پیشہ ور تلاش کر سکے۔\n\nہم ایسے مستقبل کا تصور کرتے ہیں جہاں پاکستان میں غیر رسمی محنت کا شعبہ مکمل طور پر ڈیجیٹائز ہو، جہاں مزدوروں کو مالیہ خدمات، انشورنس اور پیشہ ورانہ ترقی کے ٹولز تک رسائی ہو، اور جہاں محنت کی عزت کو پہچانا اور منایا جائے۔' },
    about_vision_ur: { en: 'ہمارا وژن پاکستان میں ماہر مزدوروں کے لیے سب سے بڑا اور سب سے قابل اعتماد پلیٹ فارم بننا ہے، جہاں ہر مزدور عزت کے ساتھ کام تلاش کر سکے اور ہر مقصد کار قابل اعتماد پیشہ ور تلاش کر سکے۔', ur: 'ہمارا وژن پاکستان میں ماہر مزدوروں کے لیے سب سے بڑا اور سب سے قابل اعتماد پلیٹ فارم بننا ہے، جہاں ہر مزدور عزت کے ساتھ کام تلاش کر سکے اور ہر مقصد کار قابل اعتماد پیشہ ور تلاش کر سکے۔' },
    about_story_en: { en: 'MazdoorPing was born out of a simple yet powerful observation: millions of skilled workers in Pakistan struggle to find consistent work, while employers face immense difficulty in locating reliable, verified professionals. Traditional methods of finding workers through word-of-mouth or local contractors are inefficient, unreliable, and often exploitative.\n\nFounded in 2024, MazdoorPing set out to digitize and democratize access to skilled labor across Pakistan. Our platform leverages technology to create a transparent, efficient, and fair marketplace where workers can showcase their skills, build their reputation, and connect directly with employers who need their services.\n\nFrom electricians and plumbers in Karachi to carpenters and painters in Lahore, from AC technicians in Islamabad to masons and welders in Peshawar — MazdoorPing is building a nationwide network that empowers every skilled worker with digital tools, fair opportunities, and the respect they deserve.', ur: 'مزدور پنگ ایک سادہ لیکن طاقتور مشاہدے سے پیدا ہوا: پاکستان میں لاکھوں ماہر مزدوروں کو مستقل کام تلاش کرنے میں مشکلات کا سامنا ہے، جبکہ آجروں کو قابل اعتماد اور تصدیق شدہ پیشہ ور افراد تلاش کرنے میں بہت مشکلات کا سامنا ہے۔\n\n2024 میں قائم کی گئی، مزدور پنگ نے پورے پاکستان میں ماہر محنت کی رسائی کو ڈیجیٹائز کرنے اور جمہوری بنانے کا ارادہ کیا۔ ہمارا پلیٹ فارم ٹیکنالوجی کا استعمال کرتے ہوئے ایک شفاف، موثر اور منصفانہ بازار بناتا ہے جہاں مزدور اپنی مہارتوں کو پیش کر سکتے ہیں، اپنی شہرت بناسکتے ہیں، اور براہ راست ان آجروں سے جڑ سکتے ہیں جو ان کی خدمات کی ضرورت رکھتے ہیں۔' },
    about_story_ur: { en: 'مزدور پنگ ایک سادہ لیکن طاقتور مشاہدے سے پیدا ہوا: پاکستان میں لاکھوں ماہر مزدوروں کو مستقل کام تلاش کرنے میں مشکلات کا سامنا ہے، جبکہ آجروں کو قابل اعتماد اور تصدیق شدہ پیشہ ور افراد تلاش کرنے میں بہت مشکلات کا سامنا ہے۔', ur: 'مزدور پنگ ایک سادہ لیکن طاقتور مشاہدے سے پیدا ہوا: پاکستان میں لاکھوں ماہر مزدوروں کو مستقل کام تلاش کرنے میں مشکلات کا سامنا ہے، جبکہ آجروں کو قابل اعتماد اور تصدیق شدہ پیشہ ور افراد تلاش کرنے میں بہت مشکلات کا سامنا ہے۔' },
    about_team_en: { en: 'MazdoorPing is built by a passionate team of technologists, designers, and social impact enthusiasts who share a common vision: to transform the lives of skilled workers through technology.\n\nWe are backed by advisors and mentors from Pakistan\'s leading technology companies and social enterprises, who bring invaluable expertise in scaling digital platforms and creating sustainable social impact.', ur: 'مزدور پنگ ایک پرجوش ٹیم کے ذریعے بنایا گیا ہے جس میں ٹیکنالوجسٹس، ڈیزائنرز اور سوشل امپیکٹ کے شوقین ہیں جو ایک مشترک وژن رکھتے ہیں: ماہر مزدوروں کی زندگیوں کو ٹیکنالوجی کے ذریعے تبدیل کرنا۔' },
    about_team_ur: { en: 'مزدور پنگ ایک پرجوش ٹیم کے ذریعے بنایا گیا ہے جس میں ٹیکنالوجسٹس، ڈیزائنرز اور سوشل امپیکٹ کے شوقین ہیں۔', ur: 'مزدور پنگ ایک پرجوش ٹیم کے ذریعے بنایا گیا ہے جس میں ٹیکنالوجسٹس، ڈیزائنرز اور سوشل امپیکٹ کے شوقین ہیں۔' },
  },
  'how-it-works': {
    hiw_title_en: { en: 'How It Works', ur: 'کیسے کام کرتا ہے' },
    hiw_title_ur: { en: 'کیسے کام کرتا ہے', ur: 'کیسے کام کرتا ہے' },
    hiw_subtitle_en: { en: 'Getting started with MazdoorPing is simple. Follow these easy steps to find the right worker or job.', ur: 'مزدور پنگ کے ساتھ شروع کرنا آسان ہے۔ مناسب مزدور یا ملازمت تلاش کرنے کے لیے ان آسان مراحل پر عمل کریں۔' },
    hiw_subtitle_ur: { en: 'مزدور پنگ کے ساتھ شروع کرنا آسان ہے۔ مناسب مزدور یا ملازمت تلاش کرنے کے لیے ان آسان مراحل پر عمل کریں۔', ur: 'مزدور پنگ کے ساتھ شروع کرنا آسان ہے۔ مناسب مزدور یا ملازمت تلاش کرنے کے لیے ان آسان مراحل پر عمل کریں۔' },
    hiw_step1_title_en: { en: 'Create Your Account', ur: 'اپنا اکاؤنٹ بنائیں' },
    hiw_step1_title_ur: { en: 'اپنا اکاؤنٹ بنائیں', ur: 'اپنا اکاؤنٹ بنائیں' },
    hiw_step1_desc_en: { en: 'Sign up as a worker or employer. Workers can create a detailed profile showcasing their skills, experience, and portfolio. Employers can set up their company profile and verification details.', ur: 'مزدور یا مقصد کار کے طور پر سائن اپ کریں۔ مزدور اپنی مہارت، تجربہ اور پورٹ فولیو دکھاتے ہوئے تفصیلی پروفائل بنا سکتے ہیں۔ آجروں اپنی کمپنی کی پروفائل اور تصدیق کی تفصیلات سیٹ اپ کر سکتے ہیں۔' },
    hiw_step1_desc_ur: { en: 'مزدور یا مقصد کار کے طور پر سائن اپ کریں۔ مزدور اپنی مہارت، تجربہ اور پورٹ فولیو دکھاتے ہوئے تفصیلی پروفائل بنا سکتے ہیں۔', ur: 'مزدور یا مقصد کار کے طور پر سائن اپ کریں۔ مزدور اپنی مہارت، تجربہ اور پورٹ فولیو دکھاتے ہوئے تفصیلی پروفائل بنا سکتے ہیں۔' },
    hiw_step2_title_en: { en: 'Post or Find Jobs', ur: 'ملازمتیں پوسٹ کریں یا تلاش کریں' },
    hiw_step2_title_ur: { en: 'ملازمتیں پوسٹ کریں یا تلاش کریں', ur: 'ملازمتیں پوسٹ کریں یا تلاش کریں' },
    hiw_step2_desc_en: { en: 'Employers post job listings with details about the work required, location, and budget. Workers browse available jobs, filter by their skills and location, and apply to the ones that match their expertise.', ur: 'آجروں ملازمت کی فہرستیں تفصیلات کے ساتھ پوسٹ کریں جس میں مطلوبہ کام، مقام اور بجٹ شامل ہو۔ مزدور دستیاب ملازمتیں دیکھتے ہیں، اپنی مہارت اور مقام کے مطابق فلٹر کرتے ہیں، اور ان پر اپلائی کرتے ہیں جو ان کی مہارت سے ملتی ہوں۔' },
    hiw_step2_desc_ur: { en: 'آجروں ملازمت کی فہرستیں تفصیلات کے ساتھ پوسٹ کریں جس میں مطلوبہ کام، مقام اور بجٹ شامل ہو۔', ur: 'آجروں ملازمت کی فہرستیں تفصیلات کے ساتھ پوسٹ کریں جس میں مطلوبہ کام، مقام اور بجٹ شامل ہو۔' },
    hiw_step3_title_en: { en: 'Connect & Negotiate', ur: 'جڑیں اور بات چیت کریں' },
    hiw_step3_title_ur: { en: 'جڑیں اور بات چیت کریں', ur: 'جڑیں اور بات چیت کریں' },
    hiw_step3_desc_en: { en: 'Use our built-in chat to discuss job details, negotiate pricing, and finalize terms. Both parties can verify each other\'s profiles, reviews, and ratings before committing to the work.', ur: 'ملازمت کی تفصیلات پر بات چیت کرنے، قیمت پر مذاکرات کرنے اور شرائط حتمی بنانے کے لیے ہمارے درون تعمیر شدہ چیٹ کا استعمال کریں۔ کام کرنے کے چک میں آنے سے پہلے دونوں فریق ایک دوسرے کی پروفائل، جائزے اور درجات کی تصدیق کر سکتے ہیں۔' },
    hiw_step3_desc_ur: { en: 'ملازمت کی تفصیلات پر بات چیت کرنے، قیمت پر مذاکرات کرنے اور شرائط حتمی بنانے کے لیے ہمارے درون تعمیر شدہ چیٹ کا استعمال کریں۔', ur: 'ملازمت کی تفصیلات پر بات چیت کرنے، قیمت پر مذاکرات کرنے اور شرائط حتمی بنانے کے لیے ہمارے درون تعمیر شدہ چیٹ کا استعمال کریں۔' },
    hiw_step4_title_en: { en: 'Get Work Done & Pay', ur: 'کام کروائیں اور ادائیگی کریں' },
    hiw_step4_title_ur: { en: 'کام کروائیں اور ادائیگی کریں', ur: 'کام کروائیں اور ادائیگی کریں' },
    hiw_step4_desc_en: { en: 'Once terms are agreed, the job begins. Employers can track progress through the platform. After completion, payments are processed securely through our wallet system with proper invoicing and receipts.', ur: 'جب شرائط پر اتفاق ہو جائے تو کام شروع ہوتا ہے۔ آجروں پلیٹ فارم کے ذریعے پیشرفت کو ٹریک کر سکتے ہیں۔ مکمل ہونے کے بعد، ادائیگیاں ہمارے والٹ سسٹم کے ذریعے مناسب انوائسنگ اور رسید کے ساتھ محفوظ طریقے سے پروسیس ہوتی ہیں۔' },
    hiw_step4_desc_ur: { en: 'جب شرائط پر اتفاق ہو جائے تو کام شروع ہوتا ہے۔ آجروں پلیٹ فارم کے ذریعے پیشرفت کو ٹریک کر سکتے ہیں۔', ur: 'جب شرائط پر اتفاق ہو جائے تو کام شروع ہوتا ہے۔ آجروں پلیٹ فارم کے ذریعے پیشرفت کو ٹریک کر سکتے ہیں۔' },
    hiw_cta_title_en: { en: 'Ready to get started?', ur: 'شروع کرنے کے لیے تیار ہیں؟' },
    hiw_cta_title_ur: { en: 'شروع کرنے کے لیے تیار ہیں؟', ur: 'شروع کرنے کے لیے تیار ہیں؟' },
    hiw_cta_subtitle_en: { en: 'Join thousands of workers and employers already using MazdoorPing. Create your free account today!', ur: 'ہزاروں مزدوروں اور آجروں سے جوڑیں جو پہلے سے مزدور پنگ استعمال کر رہے ہیں۔ آج اپنا مفت اکاؤنٹ بنائیں!' },
    hiw_cta_subtitle_ur: { en: 'ہزاروں مزدوروں اور آجروں سے جوڑیں جو پہلے سے مزدور پنگ استعمال کر رہے ہیں۔ آج اپنا مفت اکاؤنٹ بنائیں!', ur: 'ہزاروں مزدوروں اور آجروں سے جوڑیں جو پہلے سے مزدور پنگ استعمال کر رہے ہیں۔ آج اپنا مفت اکاؤنٹ بنائیں!' },
  },
  features: {
    features_title_en: { en: 'Platform Features', ur: 'پلیٹ فارم کی خصوصیات' },
    features_title_ur: { en: 'پلیٹ فارم کی خصوصیات', ur: 'پلیٹ فارم کی خصوصیات' },
    features_subtitle_en: { en: 'MazdoorPing offers a comprehensive suite of tools designed for both workers and employers in Pakistan.', ur: 'مزدور پنگ پاکستان میں مزدوروں اور آجروں دونوں کے لیے ڈیزائن کیے گئے ٹولز کا ایک جامع سیٹ فراہم کرتا ہے۔' },
    features_subtitle_ur: { en: 'مزدور پنگ پاکستان میں مزدوروں اور آجروں دونوں کے لیے ڈیزائن کیے گئے ٹولز کا ایک جامع سیٹ فراہم کرتا ہے۔', ur: 'مزدور پنگ پاکستان میں مزدوروں اور آجروں دونوں کے لیے ڈیزائن کیے گئے ٹولز کا ایک جامع سیٹ فراہم کرتا ہے۔' },
    feat1_title_en: { en: 'Smart Job Matching', ur: 'سمارٹ جاب میچنگ' },
    feat1_title_ur: { en: 'سمارٹ جاب میچنگ', ur: 'سمارٹ جاب میچنگ' },
    feat1_desc_en: { en: 'Our intelligent matching algorithm connects workers with the most relevant jobs based on their skills, location, experience, and preferences. This ensures better job-fit and higher satisfaction for both parties.', ur: 'ہمارا ذہین میچنگ الگورتھم مزدوروں کو ان کی مہارت، مقام، تجربہ اور ترجیحات کی بنیاد پر سب سے متعلقہ ملازمتوں سے جوڑتا ہے۔ یہ دونوں فریقوں کے لیے بہتر جاب فٹ اور اعلی satisfication یقینی بناتا ہے۔' },
    feat1_desc_ur: { en: 'ہمارا ذہین میچنگ الگورتھم مزدوروں کو ان کی مہارت، مقام، تجربہ اور ترجیحات کی بنیاد پر سب سے متعلقہ ملازمتوں سے جوڑتا ہے۔', ur: 'ہمارا ذہین میچنگ الگورتھم مزدوروں کو ان کی مہارت، مقام، تجربہ اور ترجیحات کی بنیاد پر سب سے متعلقہ ملازمتوں سے جوڑتا ہے۔' },
    feat2_title_en: { en: 'Verified Profiles & Reviews', ur: 'تصدیق شدہ پروفائلز اور جائزے' },
    feat2_title_ur: { en: 'تصدیق شدہ پروفائلز اور جائزے', ur: 'تصدیق شدہ پروفائلز اور جائزے' },
    feat2_desc_en: { en: 'Every worker on MazdoorPing goes through a verification process including CNIC verification. Employers and workers can leave reviews and ratings after each job, building a transparent reputation system.', ur: 'مزدور پنگ پر ہر مزدور تصدیق کے عمل سے گزرتا ہے جس میں شناختی کارڈ کی تصدیق شامل ہے۔ آجروں اور مزدور ہر کام کے بعد جائزے اور درجات دے سکتے ہیں، ایک شفاف شہرت کا نظام بناتے ہیں۔' },
    feat2_desc_ur: { en: 'مزدور پنگ پر ہر مزدور تصدیق کے عمل سے گزرتا ہے جس میں شناختی کارڈ کی تصدیق شامل ہے۔', ur: 'مزدور پنگ پر ہر مزدور تصدیق کے عمل سے گزرتا ہے جس میں شناختی کارڈ کی تصدیق شامل ہے۔' },
    feat3_title_en: { en: 'Secure Payment System', ur: 'محفوظ ادائیگی کا نظام' },
    feat3_title_ur: { en: 'محفوظ ادائیگی کا نظام', ur: 'محفوظ ادائیگی کا نظام' },
    feat3_desc_en: { en: 'Our built-in wallet system ensures secure and timely payments. Workers can withdraw earnings via JazzCash, EasyPaisa, or bank transfer. Employers can manage payments with complete transparency and proper invoicing.', ur: 'ہمارا درون تعمیر شدہ والٹ سسٹم محفوظ اور وقت پر ادائیگی کو یقینی بناتا ہے۔ مزدور جاز کیش، ایزی پیسہ یا بینک ٹرانسفر کے ذریعے کمائی وصول کر سکتے ہیں۔ آجروں مکمل شفافیت اور مناسب انوائسنگ کے ساتھ ادائیگیاں مدیریت کر سکتے ہیں۔' },
    feat3_desc_ur: { en: 'ہمارا درون تعمیر شدہ والٹ سسٹم محفوظ اور وقت پر ادائیگی کو یقینی بناتا ہے۔', ur: 'ہمارا درون تعمیر شدہ والٹ سسٹم محفوظ اور وقت پر ادائیگی کو یقینی بناتا ہے۔' },
    feat4_title_en: { en: 'Real-time Chat & Notifications', ur: 'ریئل ٹائم چیٹ اور اطلاعات' },
    feat4_title_ur: { en: 'ریئل ٹائم چیٹ اور اطلاعات', ur: 'ریئل ٹائم چیٹ اور اطلاعات' },
    feat4_desc_en: { en: 'Communicate directly with workers or employers through our in-app messaging system. Stay updated with push notifications for new jobs, messages, booking updates, and important announcements.', ur: 'ہمارے ایپ کے اندر میسجنگ سسٹم کے ذریعے براہ راست مزدوروں یا آجروں سے بات چیت کریں۔ نئی ملازمتوں، پیغامات، بکنگ اپڈیٹس اور اہم اعلانات کے لیے پش نوٹیفیکیشنز کے ساتھ اپ ڈیٹ رہیں۔' },
    feat4_desc_ur: { en: 'ہمارے ایپ کے اندر میسجنگ سسٹم کے ذریعے براہ راست مزدوروں یا آجروں سے بات چیت کریں۔', ur: 'ہمارے ایپ کے اندر میسجنگ سسٹم کے ذریعے براہ راست مزدوروں یا آجروں سے بات چیت کریں۔' },
    feat5_title_en: { en: 'SOS Safety Feature', ur: 'ایس او ایس حفاظت کی خصوصیت' },
    feat5_title_ur: { en: 'ایس او ایس حفاظت کی خصوصیت', ur: 'ایس او ایس حفاظت کی خصوصیت' },
    feat5_desc_en: { en: 'Worker safety is our top priority. The SOS feature allows workers to send emergency alerts with their live location to designated emergency contacts and the platform support team in case of unsafe situations.', ur: 'مزدور کی حفاظت ہماری سب سے اولیت ہے۔ SOS خصوصیت مزدوروں کو غیر محفوظ صورتوں کی صورت میں اپنی موجودہ مقام کے ساتھ ایمرجنسی الرٹ بھیجنے کی اجازت دیتی ہے جو نامزد ایمرجنسی کنٹیکٹس اور پلیٹ فارم سپورٹ ٹیم کو جاتا ہے۔' },
    feat5_desc_ur: { en: 'مزدور کی حفاظت ہماری سب سے اولیت ہے۔ SOS خصوصیت مزدوروں کو ایمرجنسی الرٹ بھیجنے کی اجازت دیتی ہے۔', ur: 'مزدور کی حفاظت ہماری سب سے اولیت ہے۔ SOS خصوصیت مزدوروں کو ایمرجنسی الرٹ بھیجنے کی اجازت دیتی ہے۔' },
    feat6_title_en: { en: 'Portfolio & Work Gallery', ur: 'پورٹ فولیو اور کام کی گیلری' },
    feat6_title_ur: { en: 'پورٹ فولیو اور کام کی گیلری', ur: 'پورٹ فولیو اور کام کی گیلری' },
    feat6_desc_en: { en: 'Workers can showcase their previous work through photos and descriptions in their portfolio. This helps employers make informed hiring decisions and gives workers a professional platform to display their craftsmanship.', ur: 'مزدور اپنے پچھلے کام کی تصاویر اور تفصیلات کے ذریعے اپنے پورٹ فولیو میں پیش کر سکتے ہیں۔ یہ آجروں کو باخبر的决定 لینے میں مدد کرتا ہے اور مزدوروں کو ان کی دستکاری پیش کرنے کے لیے ایک پیشہ ورانہ پلیٹ فارم دیتا ہے۔' },
    feat6_desc_ur: { en: 'مزدور اپنے پچھلے کام کی تصاویر اور تفصیلات کے ذریعے اپنے پورٹ فولیو میں پیش کر سکتے ہیں۔', ur: 'مزدور اپنے پچھلے کام کی تصاویر اور تفصیلات کے ذریعے اپنے پورٹ فولیو میں پیش کر سکتے ہیں۔' },
  },
  pricing: {
    pricing_title_en: { en: 'Pricing Plans', ur: 'قیمت کے منصوبے' },
    pricing_title_ur: { en: 'قیمت کے منصوبے', ur: 'قیمت کے منصوبے' },
    pricing_subtitle_en: { en: 'Choose the plan that fits your needs. Start free and upgrade as your business grows.', ur: 'وہ منصوبہ منتخب کریں جو آپ کی ضروریات کو پورا کرے۔ مفت شروع کریں اور جیسے جیسے آپ کا کاروبار بڑھے اپ گریڈ کریں۔' },
    pricing_subtitle_ur: { en: 'وہ منصوبہ منتخب کریں جو آپ کی ضروریات کو پورا کرے۔', ur: 'وہ منصوبہ منتخب کریں جو آپ کی ضروریات کو پورا کرے۔' },
    pricing_free_title_en: { en: 'Free Plan', ur: 'مفت منصوبہ' },
    pricing_free_title_ur: { en: 'مفت منصوبہ', ur: 'مفت منصوبہ' },
    pricing_free_desc_en: { en: 'Perfect for employers who are just getting started. Post up to 3 jobs per month, access basic features, and explore the platform.', ur: 'ان آجروں کے لیے بہترین ہے جو ابھی شروع کر رہے ہیں۔ ماہ میں 3 ملازمتیں پوسٹ کریں، بنیادی خصوصیات تک رسائی حاصل کریں، اور پلیٹ فارم کو تلاش کریں۔' },
    pricing_free_desc_ur: { en: 'ان آجروں کے لیے بہترین ہے جو ابھی شروع کر رہے ہیں۔', ur: 'ان آجروں کے لیے بہترین ہے جو ابھی شروع کر رہے ہیں۔' },
    pricing_basic_title_en: { en: 'Basic Plan - Rs. 2,999/mo', ur: 'بیسک پلان - 2,999 روپے/ماہ' },
    pricing_basic_title_ur: { en: 'بیسک پلان - 2,999 روپے/ماہ', ur: 'بیسک پلان - 2,999 روپے/ماہ' },
    pricing_basic_desc_en: { en: 'For growing businesses. Post up to 20 jobs per month, get featured listings, priority support, and advanced worker search filters.', ur: 'بڑھتے ہوئے کاروباروں کے لیے۔ ماہ میں 20 ملازمتیں پوسٹ کریں، خصوصی فہرستیں حاصل کریں، ترجیحی سپورٹ، اور اعلی مزدور تلاش فلٹرز۔' },
    pricing_basic_desc_ur: { en: 'بڑھتے ہوئے کاروباروں کے لیے۔ ماہ میں 20 ملازمتیں پوسٹ کریں۔', ur: 'بڑھتے ہوئے کاروباروں کے لیے۔ ماہ میں 20 ملازمتیں پوسٹ کریں۔' },
    pricing_premium_title_en: { en: 'Premium Plan - Rs. 7,999/mo', ur: 'پریمیئم پلان - 7,999 روپے/ماہ' },
    pricing_premium_title_ur: { en: 'پریمیئم پلان - 7,999 روپے/ماہ', ur: 'پریمیئم پلان - 7,999 روپے/ماہ' },
    pricing_premium_desc_en: { en: 'For established businesses. Unlimited jobs, featured listings, dedicated support, advanced analytics, and all premium features.', ur: 'قائم کاروباروں کے لیے۔ غیر محدود ملازمتیں، خصوصی فہرستیں، خصوصی سپورٹ، اعلی تجزیات، اور تمام پریمیئم خصوصیات۔' },
    pricing_premium_desc_ur: { en: 'قائم کاروباروں کے لیے۔ غیر محدود ملازمتیں، خصوصی فہرستیں۔', ur: 'قائم کاروباروں کے لیے۔ غیر محدود ملازمتیں، خصوصی فہرستیں۔' },
    pricing_faq_title_en: { en: 'Frequently Asked Questions', ur: 'اکثر پوچھے گئے سوالات' },
    pricing_faq_title_ur: { en: 'اکثر پوچھے گئے سوالات', ur: 'اکثر پوچھے گئے سوالات' },
    pricing_faq_content_en: { en: 'Q: Can I change my plan anytime?\nA: Yes, you can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle.\n\nQ: Is there a refund policy?\nA: Yes, if you are not satisfied, you can request a refund within 7 days of your purchase.\n\nQ: Do workers need to pay?\nA: Workers pay a one-time registration fee of Rs. 500. There are no monthly charges for workers.\n\nQ: What payment methods are accepted?\nA: We accept JazzCash, EasyPaisa, and bank transfers.\n\nQ: Can I cancel anytime?\nA: Yes, you can cancel your subscription at any time with no cancellation fees.', ur: 'س: کیا میں کسی بھی وقت اپنا منصوبہ تبدیل کر سکتا ہوں؟\nج: ہاں، آپ کسی بھی وقت اپ گریڈ یا ڈاؤن گریڈ کر سکتے ہیں۔ تبدیلیاں اگلے بلنگ سائیکل سے موثر ہوتی ہیں۔\n\nس: کیا واپسی کی پالیسی ہے؟\nج: ہاں، اگر آپ مطمئن نہیں ہیں تو خرید کے 7 دنوں کے اندر واپسی کی درخواست کر سکتے ہیں۔\n\nس: کیا مزدوروں کو ادائیگی کرنی ہے؟\nج: مزدوروں کو ایک بار کی رجسٹریشن فیس 500 روپے ادا کرنی ہوگی۔ مزدوروں کے لیے کوئی ماہانہ چارجز نہیں ہیں۔\n\nس: کون سی ادائیگی کے طریقے قبول کیے جاتے ہیں؟\nج: ہم جاز کیش، ایزی پیسہ اور بینک ٹرانسفر قبول کرتے ہیں۔\n\nس: کیا میں کسی بھی وقت منسوخ کر سکتا ہوں؟\nج: ہاں، آپ بغیر کسی منسوخی فیس کے کسی بھی وقت اپنی سبسکرپشن منسوخ کر سکتے ہیں۔' },
    pricing_faq_content_ur: { en: 'س: کیا میں کسی بھی وقت اپنا منصوبہ تبدیل کر سکتا ہوں؟\nج: ہاں، آپ کسی بھی وقت اپ گریڈ یا ڈاؤن گریڈ کر سکتے ہیں۔', ur: 'س: کیا میں کسی بھی وقت اپنا منصوبہ تبدیل کر سکتا ہوں؟\nج: ہاں، آپ کسی بھی وقت اپ گریڈ یا ڈاؤن گریڈ کر سکتے ہیں۔' },
  },
  contact: {
    contact_page_title_en: { en: 'Contact Us', ur: 'ہم سے رابطہ کریں' },
    contact_page_title_ur: { en: 'ہم سے رابطہ کریں', ur: 'ہم سے رابطہ کریں' },
    contact_page_subtitle_en: { en: 'We would love to hear from you. Reach out to us through any of the channels below.', ur: 'ہم آپ سے سننا پسند کریں گے۔ نیچے دی گئی کسی بھی چینل کے ذریعے ہم سے رابطہ کریں۔' },
    contact_page_subtitle_ur: { en: 'ہم آپ سے سننا پسند کریں گے۔', ur: 'ہم آپ سے سننا پسند کریں گے۔' },
    contact_support_email: { en: 'support@mazdoorping.com', ur: 'support@mazdoorping.com' },
    contact_support_phone: { en: '+92-300-1234567', ur: '+92-300-1234567' },
    contact_office_address_en: { en: 'Office 42, Blue Area, Jinnah Avenue, Islamabad, Pakistan', ur: 'آفس 42، بلیو ایریا، جناح ایونیو، اسلام آباد، پاکستان' },
    contact_office_address_ur: { en: 'آفس 42، بلیو ایریا، جناح ایونیو، اسلام آباد، پاکستان', ur: 'آفس 42، بلیو ایریا، جناح ایونیو، اسلام آباد، پاکستان' },
    contact_hours_en: { en: 'Monday - Saturday: 9:00 AM - 6:00 PM', ur: 'پیر - ہفتہ: صبح 9:00 بجے - شام 6:00 بجے' },
    contact_hours_ur: { en: 'پیر - ہفتہ: صبح 9:00 بجے - شام 6:00 بجے', ur: 'پیر - ہفتہ: صبح 9:00 بجے - شام 6:00 بجے' },
    contact_form_title_en: { en: 'Send us a message', ur: 'ہمیں ایک پیغام بھیجیں' },
    contact_form_title_ur: { en: 'ہمیں ایک پیغام بھیجیں', ur: 'ہمیں ایک پیغام بھیجیں' },
  },
  terms: {
    terms_title_en: { en: 'Terms & Conditions', ur: 'شرائط و ضوابط' },
    terms_title_ur: { en: 'شرائط و ضوابط', ur: 'شرائط و ضوابط' },
    terms_last_updated_en: { en: 'Last Updated: May 2025', ur: 'آخری اپ ڈیٹ: مئی 2025' },
    terms_last_updated_ur: { en: 'آخری اپ ڈیٹ: مئی 2025', ur: 'آخری اپ ڈیٹ: مئی 2025' },
    terms_intro_en: { en: 'Welcome to MazdoorPing. These Terms and Conditions govern your use of our platform. By accessing or using MazdoorPing, you agree to be bound by these terms. Please read them carefully before using our services.', ur: 'مزدور پنگ میں خوش آمدید۔ یہ شرائط و ضوابط آپ کے ہمارے پلیٹ فارم کے استعمال کو کنٹرول کرتی ہیں۔ مزدور پنگ تک رسائی حاصل کرنے یا استعمال کرنے کے ذریعے، آپ ان شرائط سے منسلک ہونے پر اتفاق کرتے ہیں۔ براہ کرم ہماری خدمات استعمال کرنے سے پہلے انہیں احتیاط سے پڑھیں۔' },
    terms_intro_ur: { en: 'مزدور پنگ میں خوش آمدید۔ یہ شرائط و ضوابط آپ کے ہمارے پلیٹ فارم کے استعمال کو کنٹرول کرتی ہیں۔', ur: 'مزدور پنگ میں خوش آمدید۔ یہ شرائط و ضوابط آپ کے ہمارے پلیٹ فارم کے استعمال کو کنٹرول کرتی ہیں۔' },
    terms_section1_title_en: { en: '1. Acceptance of Terms', ur: '1. شرائط کی قبولیت' },
    terms_section1_title_ur: { en: '1. شرائط کی قبولیت', ur: '1. شرائط کی قبولیت' },
    terms_section1_content_en: { en: 'By accessing or using the MazdoorPing platform (website and mobile application), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our platform.\n\nThese terms apply to all users including workers, employers, and visitors of the platform.', ur: 'مزدور پنگ پلیٹ فارم (ویب سائٹ اور موبائل ایپلیکیشن) تک رسائی حاصل کرنے یا استعمال کرنے کے ذریعے، آپ تسلیم کرتے ہیں کہ آپ نے ان شرائط و ضوابط کو پڑھ لیا ہے، سمجھا ہے، اور ان سے منسلک ہونے پر اتفاق کرتے ہیں۔ اگر آپ ان شرائط کے کسی حصے سے اتفاق نہیں کرتے تو آپ کو ہمارا پلیٹ فارم استعمال نہیں کرنا چاہیے۔\n\nیہ شرائط تمام صارفین پر لاگو ہوتی ہیں جن میں مزدور، آجروں اور پلیٹ فارم کے وزٹرز شامل ہیں۔' },
    terms_section1_content_ur: { en: 'مزدور پنگ پلیٹ فارم تک رسائی حاصل کرنے یا استعمال کرنے کے ذریعے، آپ تسلیم کرتے ہیں کہ آپ نے ان شرائط و ضوابط کو پڑھ لیا ہے۔', ur: 'مزدور پنگ پلیٹ فارم تک رسائی حاصل کرنے یا استعمال کرنے کے ذریعے، آپ تسلیم کرتے ہیں کہ آپ نے ان شرائط و ضوابط کو پڑھ لیا ہے۔' },
    terms_section2_title_en: { en: '2. User Accounts', ur: '2. صارف اکاؤنٹس' },
    terms_section2_title_ur: { en: '2. صارف اکاؤنٹس', ur: '2. صارف اکاؤنٹس' },
    terms_section2_content_en: { en: 'To use most features of MazdoorPing, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.\n\nYou must provide accurate and complete information during registration. You agree to update your information whenever it changes. Creating multiple accounts is not permitted.', ur: 'مزدور پنگ کی زیادہ تر خصوصیات استعمال کرنے کے لیے، آپ کو ایک اکاؤنٹ بنانا ہوگا۔ آپ اپنے اکاؤنٹ کی اسناد کی رازداری کے لیے اور اپنے اکاؤنٹ کے تحت ہونے والی تمام سرگرمیوں کے لیے ذمہ دار ہیں۔\n\nآپ کو رجسٹریشن کے دوران درست اور مکمل معلومات فراہم کرنی ہوں گی۔ آپ متفق ہیں کہ جب بھی آپ کی معلومات تبدیل ہوں گی تو آپ انہیں اپ ڈیٹ کریں گے۔ متعدد اکاؤنٹس بنانا اجازت نہیں ہے۔' },
    terms_section2_content_ur: { en: 'مزدور پنگ کی زیادہ تر خصوصیات استعمال کرنے کے لیے، آپ کو ایک اکاؤنٹ بنانا ہوگا۔', ur: 'مزدور پنگ کی زیادہ تر خصوصیات استعمال کرنے کے لیے، آپ کو ایک اکاؤنٹ بنانا ہوگا۔' },
    terms_section3_title_en: { en: '3. Services', ur: '3. خدمات' },
    terms_section3_title_ur: { en: '3. خدمات', ur: '3. خدمات' },
    terms_section3_content_en: { en: 'MazdoorPing provides an online marketplace platform that connects skilled workers with employers. We facilitate communication and payment between parties but we are not a party to any agreement between workers and employers.\n\nWe do not guarantee the quality of work performed by workers or the payment capability of employers. Users are encouraged to verify credentials and perform due diligence before engaging in any work arrangement.', ur: 'مزدور پنگ ایک آن لائن مارکیٹ پلیس پلیٹ فارم فراہم کرتا ہے جو ماہر مزدوروں کو آجروں سے جوڑتا ہے۔ ہم فریقوں کے درمیان بات چیت اور ادائیگی کے لیے سہولت فراہم کرتے ہیں لیکن ہم مزدوروں اور آجروں کے درمیان کسی بھی معاہدے کی فریق نہیں ہیں۔\n\nہم مزدوروں کے ذریعے کیے گئے کام کے معیار یا آجروں کی ادائیگی کی صلاحیت کی ضمانت نہیں دیتے۔ صارفین کو کار کے انتظام میں شامل ہونے سے پہلے اسناد کی تصدیق اور احتیاطی مراحل انجام دینے کی ترغیب دی جاتی ہے۔' },
    terms_section3_content_ur: { en: 'مزدور پنگ ایک آن لائن مارکیٹ پلیس پلیٹ فارم فراہم کرتا ہے جو ماہر مزدوروں کو آجروں سے جوڑتا ہے۔', ur: 'مزدور پنگ ایک آن لائن مارکیٹ پلیس پلیٹ فارم فراہم کرتا ہے جو ماہر مزدوروں کو آجروں سے جوڑتا ہے۔' },
    terms_section4_title_en: { en: '4. Payments & Fees', ur: '4. ادائیگیاں اور فیس' },
    terms_section4_title_ur: { en: '4. ادائیگیاں اور فیس', ur: '4. ادائیگیاں اور فیس' },
    terms_section4_content_en: { en: 'All payments for services arranged through MazdoorPing are processed through our secure payment system. Workers are charged a one-time registration fee and a commission on each completed job as per the rates displayed on the platform.\n\nEmployers on paid subscription plans are billed monthly. Payment details are displayed in the employer billing section. All prices are in Pakistani Rupees (PKR).', ur: 'مزدور پنگ کے ذریعے ترتیب دی گئی تمام خدمات کے لیے ادائیگیاں ہمارے محفوظ ادائیگی سسٹم کے ذریعے پروسیس ہوتی ہیں۔ مزدوروں سے ایک بار کی رجسٹریشن فیس اور ہر مکمل ہونے والے کام پر کمیشن وصول کیا جاتا ہے جیسا کہ پلیٹ فارم پر دکھائی گئی شرحوں کے مطابق۔\n\nادا شدہ سبسکرپشن پلانز پر آجروں سے ماہانہ بل لیا جاتا ہے۔ ادائیگی کی تفصیلات مقصد کار بلنگ سیکشن میں دکھائی جاتی ہیں۔ تمام قیمت دار Pakistani Rupees (PKR) میں ہیں۔' },
    terms_section4_content_ur: { en: 'مزدور پنگ کے ذریعے ترتیب دی گئی تمام خدمات کے لیے ادائیگیاں ہمارے محفوظ ادائیگی سسٹم کے ذریعے پروسیس ہوتی ہیں۔', ur: 'مزدور پنگ کے ذریعے ترتیب دی گئی تمام خدمات کے لیے ادائیگیاں ہمارے محفوظ ادائیگی سسٹم کے ذریعے پروسیس ہوتی ہیں۔' },
  },
  privacy: {
    privacy_title_en: { en: 'Privacy Policy', ur: 'رازداری کی پالیسی' },
    privacy_title_ur: { en: 'رازداری کی پالیسی', ur: 'رازداری کی پالیسی' },
    privacy_last_updated_en: { en: 'Last Updated: May 2025', ur: 'آخری اپ ڈیٹ: مئی 2025' },
    privacy_last_updated_ur: { en: 'آخری اپ ڈیٹ: مئی 2025', ur: 'آخری اپ ڈیٹ: مئی 2025' },
    privacy_intro_en: { en: 'MazdoorPing is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.', ur: 'مزدور پنگ آپ کی رازداری کے تحفظ کے لیے پرعزم ہے۔ یہ رازداری کی پالیسی وضاحت کرتی ہے کہ جب آپ ہمارا پلیٹ فارم استعمال کرتے ہیں تو ہم آپ کی معلومات کیسے جمع، استعمال، افشا اور محفوظ کرتے ہیں۔ براہ کرم اس پالیسی کو احتیاط سے پڑھیں۔' },
    privacy_intro_ur: { en: 'مزدور پنگ آپ کی رازداری کے تحفظ کے لیے پرعزم ہے۔', ur: 'مزدور پنگ آپ کی رازداری کے تحفظ کے لیے پرعزم ہے۔' },
    privacy_section1_title_en: { en: '1. Information We Collect', ur: '1. ہم جو معلومات جمع کرتے ہیں' },
    privacy_section1_title_ur: { en: '1. ہم جو معلومات جمع کرتے ہیں', ur: '1. ہم جو معلومات جمع کرتے ہیں' },
    privacy_section1_content_en: { en: 'MazdoorPing collects the following types of information to provide and improve our services:\n\nPersonal Information: Name, email address, phone number, CNIC number, profile photo, and location data.\n\nProfessional Information: Skills, work experience, portfolio items, certifications, and ratings/reviews.\n\nTechnical Information: Device information, IP address, browser type, operating system, and usage data.\n\nFinancial Information: Payment method details (processed securely through our payment partners), transaction history, and wallet balance.', ur: 'مزدور پنگ اپنی خدمات فراہم کرنے اور بہتر بنانے کے لیے درج ذیل اقسام کی معلومات جمع کرتا ہے:\n\nذاتی معلومات: نام، ای میل پتہ، فون نمبر، شناختی کارڈ نمبر، پروفائل تصویر، اور مقام کا ڈیٹا۔\n\nپیشہ ورانہ معلومات: مہارت، کام کا تجربہ، پورٹ فولیو آئٹمز، سرٹیفیکیشنز، اور درجات/جائزے۔\n\nتکنیکی معلومات: ڈیوائس کی معلومات، IP ایڈریس، براؤزر کی قسم، آپریٹنگ سسٹم، اور استعمال کا ڈیٹا۔\n\nمالی معلومات: ادائیگی کے طریقے کی تفصیلات (ہمارے ادائیگی شراکی داروں کے ذریعے محفوظ طریقے سے پروسیس)، لین دین کی تاریخ، اور والٹ بیلنس۔' },
    privacy_section1_content_ur: { en: 'مزدور پنگ اپنی خدمات فراہم کرنے اور بہتر بنانے کے لیے معلومات جمع کرتا ہے۔', ur: 'مزدور پنگ اپنی خدمات فراہم کرنے اور بہتر بنانے کے لیے معلومات جمع کرتا ہے۔' },
    privacy_section2_title_en: { en: '2. How We Use Your Information', ur: '2. ہم آپ کی معلومات کیسے استعمال کرتے ہیں' },
    privacy_section2_title_ur: { en: '2. ہم آپ کی معلومات کیسے استعمال کرتے ہیں', ur: '2. ہم آپ کی معلومات کیسے استعمال کرتے ہیں' },
    privacy_section2_content_en: { en: 'We use the information we collect for the following purposes:\n\nTo provide and maintain our platform services\nTo match workers with relevant job opportunities\nTo process payments and manage financial transactions\nTo send notifications about jobs, messages, and platform updates\nTo improve our platform and develop new features\nTo comply with legal obligations\nTo prevent fraud and ensure platform security\nTo provide customer support', ur: 'ہم اپنے ذریعے جمع کی گئی معلومات مندرجہ ذیل مقاصد کے لیے استعمال کرتے ہیں:\n\nہماری پلیٹ فارم خدمات فراہم کرنے اور برقرار رکھنے کے لیے\nمزدوروں کو متعلقہ ملازمت کے مواقع سے جوڑنے کے لیے\nادائیگیاں پروسیس کرنے اور مالی لین دین کا انتظام کرنے کے لیے\nملازمتوں، پیغامات اور پلیٹ فارم اپڈیٹس کے بارے میں اطلاعات بھیجنے کے لیے\nہمارا پلیٹ فارم بہتر بنانے اور نئی خصوصیات تیار کرنے کے لیے\nقانونی فرائض کو پورا کرنے کے لیے\nدھوکہ دہی روکنے اور پلیٹ فارم کی سیکیورتی یقینی بنانے کے لیے\nکسٹمر سپورٹ فراہم کرنے کے لیے' },
    privacy_section2_content_ur: { en: 'ہم اپنے ذریعے جمع کی گئی معلومات مندرجہ ذیل مقاصد کے لیے استعمال کرتے ہیں۔', ur: 'ہم اپنے ذریعے جمع کی گئی معلومات مندرجہ ذیل مقاصد کے لیے استعمال کرتے ہیں۔' },
    privacy_section3_title_en: { en: '3. Data Sharing', ur: '3. ڈیٹا شیئرنگ' },
    privacy_section3_title_ur: { en: '3. ڈیٹا شیئرنگ', ur: '3. ڈیٹا شیئرنگ' },
    privacy_section3_content_en: { en: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with:\n\nService Providers: Companies that help us operate our platform (payment processors, cloud hosting, etc.)\n\nOther Users: Your profile information will be visible to other users of the platform as part of the matching process\n\nLegal Requirements: When required by law, court order, or government regulation\n\nProtection of Rights: To protect the rights, property, or safety of MazdoorPing, our users, or the public', ur: 'ہم آپ کی ذاتی معلومات تھرڈ پارٹیوں کو فروخت، تجارت یا کرایہ نہیں دیتے۔ ہم آپ کی معلومات مندرجہ ذیل کے ساتھ شیئر کر سکتے ہیں:\n\nسروس فراہم کنندگان: کمپنیاں جو ہمیں پلیٹ فارم چلانے میں مدد کرتی ہیں (ادائیگی پروسیسرز، کلاؤڈ ہوسٹنگ وغیرہ)\n\nدیگر صارفین: آپ کی پروفائل کی معلومات پلیٹ فارم کے دیگر صارفین کو میچنگ کے عمل کے حصے کے طور پر نظر آئیں گی\n\nقانونی ضروریات: جب قانون، عدالتی حکم یا حکومتی ضابطے کے ذریعے مطلوب ہو\n\nحقوق کے تحفظ: مزدور پنگ، ہمارے صارفین یا عوام کے حقوق، جائیداد یا حفاظت کے لیے' },
    privacy_section3_content_ur: { en: 'ہم آپ کی ذاتی معلومات تھرڈ پارٹیوں کو فروخت نہیں کرتے۔', ur: 'ہم آپ کی ذاتی معلومات تھرڈ پارٹیوں کو فروخت نہیں کرتے۔' },
    privacy_section4_title_en: { en: '4. Data Security', ur: '4. ڈیٹا سیکیورٹی' },
    privacy_section4_title_ur: { en: '4. ڈیٹا سیکیورٹی', ur: '4. ڈیٹا سیکیورٹی' },
    privacy_section4_content_en: { en: 'We implement industry-standard security measures to protect your personal information. These include encryption in transit and at rest, regular security audits, access controls, and secure authentication mechanisms.\n\nHowever, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.', ur: 'ہم غیر مجاز رسائی، تبدیلی، انکشاف یا تباہی سے آپ کی ذاتی معلومات کی حفاظت کے لیے انڈسٹری معیار سیکیورٹی اقدامات نافذ کرتے ہیں۔ ان میں ٹرانزٹ اور ریست میں انکرپشن، باقاعدہ سیکیورٹی آڈٹ، رسائی کنٹرولز، اور محفوظ تصدیق کے میکانزمز شامل ہیں۔\n\nتاہم، انٹرنیٹ پر کوئی بھی ترسیل کا طریقہ یا الیکٹرانک ذخیرہ 100% محفوظ نہیں ہے۔ حالانکہ ہم آپ کی معلومات کی حفاظت کے لیے کوشش کرتے ہیں، ہم مکمل سیکیورٹی کی ضمانت نہیں دے سکتے۔' },
    privacy_section4_content_ur: { en: 'ہم آپ کی ذاتی معلومات کی حفاظت کے لیے سیکیورٹی اقدامات نافذ کرتے ہیں۔', ur: 'ہم آپ کی ذاتی معلومات کی حفاظت کے لیے سیکیورٹی اقدامات نافذ کرتے ہیں۔' },
  },
};

const GROUP_LABELS: Record<string, Record<string, { en: string; ur: string }>> = {
  general: {
    branding: { en: 'Branding', ur: 'برانڈنگ' },
    contact: { en: 'Contact Information', ur: 'رابطہ کی معلومات' },
    social: { en: 'Social Media Links', ur: 'سوشل میڈیا لنکس' },
  },
  about: {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    content: { en: 'Page Content', ur: 'صفحہ کا مواد' },
  },
  'how-it-works': {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    steps: { en: 'Steps', ur: 'مراحل' },
    cta: { en: 'Call to Action', ur: 'کال ٹو اکشن' },
  },
  features: {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    feature1: { en: 'Feature 1', ur: 'خصوصیت 1' },
    feature2: { en: 'Feature 2', ur: 'خصوصیت 2' },
    feature3: { en: 'Feature 3', ur: 'خصوصیت 3' },
    feature4: { en: 'Feature 4', ur: 'خصوصیت 4' },
    feature5: { en: 'Feature 5', ur: 'خصوصیت 5' },
    feature6: { en: 'Feature 6', ur: 'خصوصیت 6' },
  },
  pricing: {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    free: { en: 'Free Plan', ur: 'مفت پلان' },
    basic: { en: 'Basic Plan', ur: 'بیسک پلان' },
    premium: { en: 'Premium Plan', ur: 'پریمیئم پلان' },
    faq: { en: 'FAQ', ur: 'FAQ' },
  },
  contact: {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    details: { en: 'Contact Details', ur: 'رابطہ کی تفصیلات' },
    map: { en: 'Map', ur: 'نقشہ' },
    form: { en: 'Contact Form', ur: 'رابطہ فارم' },
  },
  terms: {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    content: { en: 'Introduction', ur: 'تعارف' },
    sec1: { en: 'Section 1', ur: 'سیکشن 1' },
    sec2: { en: 'Section 2', ur: 'سیکشن 2' },
    sec3: { en: 'Section 3', ur: 'سیکشن 3' },
    sec4: { en: 'Section 4', ur: 'سیکشن 4' },
  },
  privacy: {
    main: { en: 'Page Header', ur: 'صفحہ کا ہیڈر' },
    content: { en: 'Introduction', ur: 'تعارف' },
    sec1: { en: 'Section 1', ur: 'سیکشن 1' },
    sec2: { en: 'Section 2', ur: 'سیکشن 2' },
    sec3: { en: 'Section 3', ur: 'سیکشن 3' },
    sec4: { en: 'Section 4', ur: 'سیکشن 4' },
  },
};

export default function ContentManagementPage() {
  const { language } = useLanguageStore();
  const isUrdu = language === 'ur';

  const [activeTab, setActiveTab] = useState('general');
  const [contentMap, setContentMap] = useState<Record<string, { en: string; ur: string; id?: string }>>({});
  const [originalMap, setOriginalMap] = useState<Record<string, { en: string; ur: string; id?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showLangToggle, setShowLangToggle] = useState(false);

  const showToast = (message: string, type: Toast['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchContent = useCallback(async (pageSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/site-content?page_slug=${encodeURIComponent(pageSlug)}`);
      if (!res.ok) throw new Error('Failed to fetch content');
      const { data } = await res.json();
      const map: Record<string, { en: string; ur: string; id?: string }> = {};
      if (data && Array.isArray(data)) {
        data.forEach((item: SiteContent) => {
          map[item.section_key] = {
            en: item.content_en || '',
            ur: item.content_ur || '',
            id: item.id,
          };
        });
      }
      // Merge: use DB data where available, fill defaults, and ensure ALL fields from SECTION_FIELDS exist
      const defaults = DEFAULT_CONTENT[pageSlug] || {};
      const fields = SECTION_FIELDS[pageSlug] || [];
      const merged: Record<string, { en: string; ur: string; id?: string }> = {};
      for (const f of fields) {
        const key = f.section_key;
        if (map[key] && (map[key].en || map[key].ur)) {
          merged[key] = map[key];
        } else if (defaults[key]) {
          merged[key] = { en: defaults[key].en, ur: defaults[key].ur };
        } else {
          merged[key] = { en: '', ur: '' };
        }
      }
      setContentMap(merged);
      setOriginalMap(JSON.parse(JSON.stringify(merged)));
    } catch (err) {
      console.error('Failed to fetch content:', err);
      showToast(isUrdu ? 'مواد لوڈ نہ ہو سکا' : 'Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, [isUrdu]);

  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab, fetchContent]);

  const updateField = (sectionKey: string, lang: 'en' | 'ur', value: string) => {
    setContentMap((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [lang]: value,
      },
    }));
  };

  const hasChanges = (pageSlug: string) => {
    const fields = SECTION_FIELDS[pageSlug] || [];
    return fields.some((f) => {
      const current = contentMap[f.section_key];
      const original = originalMap[f.section_key];
      if (!current && !original) return false;
      if (!current || !original) return true;
      return current.en !== original.en || current.ur !== original.ur;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields = SECTION_FIELDS[activeTab] || [];
      const content = fields
        .filter((f) => {
          const val = contentMap[f.section_key];
          return val && (val.en || val.ur);
        })
        .map((f) => {
          const val = contentMap[f.section_key];
          return {
            page_slug: activeTab,
            section_key: f.section_key,
            content_en: val.en,
            content_ur: val.ur,
            content_type: f.content_type,
            sort_order: f.sort_order,
          };
        });

      if (content.length === 0) {
        showToast(isUrdu ? 'محفوظ کرنے کے لیے مواد نہیں' : 'No content to save', 'error');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(errData.error || 'Save failed');
      }

      setOriginalMap(JSON.parse(JSON.stringify(contentMap)));
      showToast(isUrdu ? 'مواد کامیابی سے محفوظ ہو گیا' : 'Content saved successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to save content:', msg);
      showToast(isUrdu ? `محفوظ نہ ہو سکا: ${msg.slice(0, 60)}` : `Failed to save: ${msg.slice(0, 60)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentFields = SECTION_FIELDS[activeTab] || [];
  const currentGroups = GROUP_LABELS[activeTab] || {};
  const groupedFields = currentFields.reduce<Record<string, SectionField[]>>((acc, field) => {
    const group = field.group || 'main';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  const changedCount = currentFields.filter((f) => {
    const current = contentMap[f.section_key];
    const original = originalMap[f.section_key];
    if (!current && !original) return false;
    if (!current || !original) return true;
    return current.en !== original.en || current.ur !== original.ur;
  }).length;

  const SocialIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'facebook': return <Globe className="w-4 h-4" />;
      case 'instagram': return <Camera className="w-4 h-4" />;
      case 'twitter': return <AtSign className="w-4 h-4" />;
      case 'linkedin': return <Link2 className="w-4 h-4" />;
      case 'youtube': return <Play className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in flex items-center gap-2',
            toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10">
              <FileText className="w-7 h-7 text-violet-400" />
            </div>
            {isUrdu ? 'مواد کا انتظام' : 'Content Management'}
          </h1>
          <p className="text-white/50 mt-1">
            {isUrdu ? 'ویب سائٹ کے تمام صفحات کے مواد کو ترمیم کریں' : 'Edit content for all website pages'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges(activeTab)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px]',
            hasChanges(activeTab) && !saving
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20'
              : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving
            ? (isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...')
            : (isUrdu ? 'مواد محفوظ کریں' : 'Save Content')}
          {changedCount > 0 && !saving && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
              {changedCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max">
          {PAGE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveTab(tab.slug)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap',
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                    : 'bg-white/[0.03] text-white/50 hover:text-white/70 border border-white/5 hover:border-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {isUrdu ? tab.labelUr : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-40 mb-4" />
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="skeleton h-3 w-24" />
                    <div className="skeleton h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFields).map(([groupKey, fields]) => {
            const groupLabel = currentGroups[groupKey];
            if (!groupLabel) return null;

            const isSocialGroup = groupKey === 'social';

            return (
              <div key={groupKey} className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  {isSocialGroup ? (
                    <Globe className="w-5 h-5 text-violet-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-violet-400" />
                  )}
                  <h3 className="text-base font-semibold text-white">
                    {isUrdu ? groupLabel.ur : groupLabel.en}
                  </h3>
                </div>

                <div className={cn(
                  isSocialGroup
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                    : 'space-y-5'
                )}>
                  {fields.map((field) => {
                    const current = contentMap[field.section_key] || { en: '', ur: '' };
                    const original = originalMap[field.section_key] || { en: '', ur: '' };
                    const isChanged = current.en !== original.en || current.ur !== original.ur;
                    const isSocial = isSocialGroup;
                    const socialType = field.section_key.replace('_url', '').replace('contact_', '');

                    if (isSocial) {
                      return (
                        <div
                          key={field.section_key}
                          className={cn(
                            'p-3.5 rounded-xl border transition-all',
                            isChanged
                              ? 'bg-violet-500/5 border-violet-500/15'
                              : 'bg-white/[0.02] border-white/5'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-white/5 text-white/50">
                              <SocialIcon type={socialType} />
                            </div>
                            <span className="text-xs font-medium text-white/60">
                              {isUrdu ? field.labelUr : field.labelEn}
                            </span>
                          </div>
                          <input
                            type="url"
                            value={current.en}
                            onChange={(e) => updateField(field.section_key, 'en', e.target.value)}
                            placeholder="https://..."
                            className={cn(
                              'w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/20',
                              'bg-white/[0.05] border border-white/10',
                              'focus:outline-none focus:border-violet-500/30 transition-colors',
                              field.content_type === 'url' && current.en && 'pr-8'
                            )}
                          />
                          {field.content_type === 'url' && current.en && (
                            <a
                              href={current.en}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                              style={{ position: 'relative', float: 'right', marginTop: '-28px', marginRight: '4px' }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={field.section_key}>
                        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                          {field.icon && (
                            <div className="p-1 rounded-md bg-white/5 text-white/40">
                              <field.icon className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {isUrdu ? field.labelUr : field.labelEn}
                          {isChanged && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                          )}
                        </label>

                        <div className={cn(
                          field.content_type === 'text'
                            ? 'space-y-2'
                            : 'space-y-2'
                        )}>
                          {/* English field */}
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/30 flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              EN
                            </span>
                            {field.content_type === 'text' || field.content_type === 'url' ? (
                              <input
                                type={field.content_type === 'url' ? 'url' : 'text'}
                                value={current.en}
                                onChange={(e) => updateField(field.section_key, 'en', e.target.value)}
                                placeholder={
                                  field.content_type === 'url' ? 'https://...' : `Enter ${isUrdu ? field.labelUr : field.labelEn} (English)...`
                                }
                                className={cn(
                                  'w-full pl-14 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20',
                                  'glass-input transition-colors'
                                )}
                              />
                            ) : (
                              <textarea
                                value={current.en}
                                onChange={(e) => updateField(field.section_key, 'en', e.target.value)}
                                placeholder={`Enter ${isUrdu ? field.labelUr : field.labelEn} (English)...`}
                                rows={5}
                                className={cn(
                                  'w-full pl-14 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20',
                                  'glass-input transition-colors resize-none'
                                )}
                              />
                            )}
                          </div>

                          {/* Urdu field */}
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/30 flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              UR
                            </span>
                            {field.content_type === 'text' || field.content_type === 'url' ? (
                              <input
                                type="text"
                                dir="rtl"
                                value={current.ur}
                                onChange={(e) => updateField(field.section_key, 'ur', e.target.value)}
                                placeholder={isUrdu ? `...${field.labelUr} (اردو) درج کریں` : `Enter ${isUrdu ? field.labelUr : field.labelEn} (Urdu)...`}
                                className={cn(
                                  'w-full pl-14 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20',
                                  'glass-input transition-colors'
                                )}
                              />
                            ) : (
                              <textarea
                                dir="rtl"
                                value={current.ur}
                                onChange={(e) => updateField(field.section_key, 'ur', e.target.value)}
                                placeholder={isUrdu ? `...${field.labelUr} (اردو) درج کریں` : `Enter ${isUrdu ? field.labelUr : field.labelEn} (Urdu)...`}
                                rows={5}
                                className={cn(
                                  'w-full pl-14 pr-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20',
                                  'glass-input transition-colors resize-none'
                                )}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Empty state when no fields */}
          {Object.keys(groupedFields).length === 0 && (
            <div className="glass-card p-12 text-center">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                {isUrdu ? 'اس صفحے کے لیے کوئی حصہ نہیں ملا' : 'No sections found for this page'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
