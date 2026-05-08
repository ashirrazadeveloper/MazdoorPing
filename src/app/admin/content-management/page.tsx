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
      setContentMap(map);
      setOriginalMap(JSON.parse(JSON.stringify(map)));
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
