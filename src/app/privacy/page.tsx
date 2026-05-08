'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/store/language-store';
import { ArrowLeft, Shield, Database, Share2, Lock, Cookie, UserCheck, Clock, Baby, Flag, RefreshCw, Phone } from 'lucide-react';

const privacyContent = {
  en: {
    pageTitle: 'Privacy Policy',
    pageSubtitle: 'Last updated: January 2025',
    intro: 'MazdoorPing Pvt. Limited ("MazdoorPing", "we", "us", or "our") is committed to protecting the privacy and personal data of our users. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our platform. This policy is compliant with the applicable laws of the Islamic Republic of Pakistan, including the Prevention of Electronic Crimes Act 2016 (PECA) and any subsequent data protection legislation.',
    infoCollection: {
      title: '1. Information We Collect',
      icon: Database,
      content: [
        'Personal Identification Information: We collect your full name, CNIC number, phone number, email address, profile photograph, date of birth, gender, and residential address when you create an account or update your profile.',
        'Professional Information: For Workers, we collect skills, trade categories, work experience, certifications, portfolio images, hourly rates or project pricing, and availability schedule. For Employers, we collect business name, industry, project requirements, and hiring preferences.',
        'Location Data: We collect your precise GPS location (with your consent) to enable location-based features such as finding nearby workers or jobs, and to display your service area on the platform map.',
        'Transaction Data: We record all payment transactions, including payment method details (JazzCash, EasyPaisa, bank account), transaction amounts, timestamps, and escrow activity.',
        'Communication Data: We collect messages exchanged between Workers and Employers through our in-app chat system to facilitate dispute resolution and ensure platform safety.',
        'Device & Usage Data: We automatically collect device information (hardware model, operating system, unique device identifiers), IP address, browser type, pages visited, features used, and interaction patterns to improve our services.',
        'CNIC & Verification Data: To verify your identity, we may collect photographs of your CNIC (front and back), selfie verification images, and biometric consent data where applicable.',
      ],
    },
    howWeUse: {
      title: '2. How We Use Your Data',
      icon: Database,
      content: [
        'Platform Operations: To create and manage your account, facilitate connections between Workers and Employers, process payments and escrow transactions, and provide customer support.',
        'Service Improvement: To analyze usage patterns, improve platform features, fix bugs, optimize performance, and develop new services that better meet your needs.',
        'Communication: To send you transaction notifications, booking confirmations, safety alerts, platform updates, and promotional materials (with your opt-in consent).',
        'Safety & Security: To detect and prevent fraud, verify user identities, enforce our Terms & Conditions, investigate suspicious activities, and maintain platform integrity.',
        'Matchmaking & Recommendations: To provide personalized job recommendations for Workers and worker suggestions for Employers based on skills, location, preferences, and past interactions.',
        'Legal Compliance: To comply with applicable Pakistani laws, respond to legal processes, government requests, and protect the rights, property, or safety of MazdoorPing, our users, or the public.',
        'Analytics & Reporting: To generate aggregated, anonymized analytics reports that help us understand platform trends and improve our services. These reports do not contain personally identifiable information.',
      ],
    },
    dataSharing: {
      title: '3. Data Sharing & Disclosure',
      icon: Share2,
      content: [
        'Between Users: Workers\' professional profiles, ratings, and availability are visible to Employers. Employers\' business profiles and job listings are visible to Workers. Personal contact details are only shared when both parties agree to a booking.',
        'Payment Processors: We share necessary transaction data with our payment gateway partners (JazzCash, EasyPaisa, banks) to process payments securely.',
        'Service Providers: We may share data with trusted third-party service providers who assist us in operating the platform, including cloud hosting providers, analytics services, and communication tools. These providers are contractually bound to protect your data.',
        'Law Enforcement: We may disclose your information to Pakistani law enforcement authorities, government agencies, or courts when required by law, regulation, legal process, or to protect our rights and safety.',
        'Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity. We will notify you of any such transfer.',
        'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.',
      ],
    },
    dataSecurity: {
      title: '4. Data Security',
      icon: Lock,
      content: [
        'We implement industry-standard security measures to protect your personal data, including AES-256 encryption for data at rest, TLS 1.3 encryption for data in transit, secure server infrastructure hosted in Pakistan, regular security audits, and intrusion detection systems.',
        'Payment data is processed through PCI-DSS compliant payment gateways. We never store your full payment card details or mobile wallet PINs on our servers.',
        'Access to your personal data is restricted to authorized personnel on a need-to-know basis. All employees and contractors are bound by confidentiality agreements.',
        'Despite our best efforts, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.',
      ],
    },
    cookies: {
      title: '5. Cookies & Tracking Technologies',
      icon: Cookie,
      content: [
        'We use cookies and similar tracking technologies to enhance your experience on the Platform. These include essential cookies (required for platform functionality), authentication cookies (to keep you logged in), preference cookies (to remember your language and settings), and analytics cookies (to understand usage patterns).',
        'You can control cookie settings through your browser preferences. However, disabling essential cookies may prevent you from using certain features of the Platform.',
        'We use local storage to save your preferences, session data, and cached content for faster loading. This data is stored on your device and is not transmitted to our servers.',
        'We do not use third-party advertising cookies or participate in cross-site tracking.',
      ],
    },
    userRights: {
      title: '6. Your Rights',
      icon: UserCheck,
      content: [
        'Right to Access: You have the right to request a copy of the personal data we hold about you. You can view most of your data through your account settings.',
        'Right to Rectification: You can update or correct your personal information at any time through your account settings or by contacting our support team.',
        'Right to Deletion: You may request the deletion of your personal data and account. We will process such requests within 30 days, except where we are required to retain certain data for legal or legitimate business purposes.',
        'Right to Portability: You can request your data in a structured, commonly used format (JSON/CSV) that can be transferred to another service.',
        'Right to Withdraw Consent: Where our processing of your data is based on your consent, you can withdraw that consent at any time through your account settings.',
        'To exercise any of these rights, please contact us at privacy@mazdoorping.pk. We will respond to your request within 30 days.',
      ],
    },
    dataRetention: {
      title: '7. Data Retention',
      icon: Clock,
      content: [
        'We retain your personal data for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your personal data within 90 days, except where retention is required by law.',
        'Transaction records are retained for a minimum of 7 years as required by Pakistani tax and financial regulations.',
        'Chat messages and communication records are retained for 12 months after the related transaction is completed, to facilitate dispute resolution.',
        'Verification data (CNIC images, selfies) is retained for the duration of your account plus 90 days after deletion, as required for ongoing fraud prevention.',
        'Anonymous, aggregated analytics data may be retained indefinitely for platform improvement purposes.',
      ],
    },
    childrenPrivacy: {
      title: '8. Children\'s Privacy',
      icon: Baby,
      content: [
        'MazdoorPing is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.',
        'If we discover that we have inadvertently collected data from a person under 18, we will promptly delete that information from our servers.',
        'If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at privacy@mazdoorping.pk and we will take appropriate action.',
      ],
    },
    pakistanCompliance: {
      title: '9. Pakistan Data Protection Compliance',
      icon: Flag,
      content: [
        'MazdoorPing operates in full compliance with the laws of the Islamic Republic of Pakistan. Our data practices adhere to the Prevention of Electronic Crimes Act 2016 (PECA), the Pakistan Telecommunication (Re-Organization) Act 1996, and any applicable provincial data protection regulations.',
        'All personal data of Pakistani citizens is stored and processed on servers located within Pakistan or in jurisdictions that provide adequate data protection as recognized by Pakistani authorities.',
        'We cooperate with the Pakistan Telecommunication Authority (PTA), Federal Investigation Agency (FIA), and other relevant government bodies as required by law.',
        'In the event of any data breach affecting Pakistani users, we will notify the relevant authorities and affected users within 72 hours, as required by applicable law.',
        'Our data processing activities are designed to respect the cultural and religious values of Pakistan and the fundamental rights of our users.',
      ],
    },
    changesToPolicy: {
      title: '10. Changes to This Policy',
      icon: RefreshCw,
      content: [
        'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.',
        'Material changes will be communicated to you via email notification and/or a prominent notice on the Platform at least 30 days before they take effect.',
        'Your continued use of the Platform after changes are posted constitutes acceptance of the updated Privacy Policy.',
        'We maintain a version history of this policy and previous versions can be provided upon request.',
      ],
    },
    contact: {
      title: '11. Contact Us',
      icon: Phone,
      content: [
        'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
        'MazdoorPing Pvt. Limited — Data Protection Officer',
        'Email: privacy@mazdoorping.pk',
        'Phone: +92-3XX-XXXXXXX',
        'Address: Lahore, Punjab, Pakistan',
        'Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM (PKT)',
        'We aim to respond to all privacy-related inquiries within 30 business days.',
      ],
    },
  },
  ur: {
    pageTitle: 'رازداری کی پالیسی',
    pageSubtitle: 'آخری اپڈیٹ: جنوری 2025',
    intro: 'مزدورپنگ پرائیویٹ لمیٹڈ ("مزدورپنگ"، "ہم"، "ہمارا" یا "ہماری") اپنے صارفین کی رازداری اور ذاتی ڈیٹا کے تحفظ کے لیے پرعزم ہے۔ یہ رازداری کی پالیسی وضاحت کرتی ہے کہ جب آپ ہمارا پلیٹ فارم استعمال کرتے ہیں تو ہم آپ کی معلومات کیسے جمع، استعمال، شیئر اور محفوظ کرتے ہیں۔ یہ پالیسی اسلامی جمہوریہ پاکستان کے لاگو قوانین کے مطابق ہے، بشمول الیکٹرانک جرائم کی روک تھام ایکٹ 2016 (PECA) اور کسی بھی متعلقہ ڈیٹا پروٹیکشن قانون۔',
    infoCollection: {
      title: '۱۔ ہم جو معلومات جمع کرتے ہیں',
      icon: Database,
      content: [
        'ذاتی شناختی معلومات: ہم آپ کا مکمل نام، شناختی کارڈ نمبر، فون نمبر، ای میل پتہ، پروفائل تصویر، پیدائش کی تاریخ، جنس، اور رہائشی پتہ اکاؤنٹ بنانے یا پروفائل اپ ڈیٹ کرنے پر جمع کرتے ہیں۔',
        'پیشہ ورانہ معلومات: مزدوروں کے لیے، ہم مہارت، تجارتی زمرے، کام کا تجربہ، سرٹیفکیٹس، پورٹ فولیو امیجز، گھنٹہ وار شرح یا منصوبے کی قیمت، اور دستیابی شیڈول جمع کرتے ہیں۔ آجرووں کے لیے، ہم کاروباری نام، انڈسٹری، منصوبے کی ضروریات، اور بھرتی کی ترجیحات جمع کرتے ہیں۔',
        'مقام کا ڈیٹا: ہم آپ کی درست GPS مقام (آپ کی رضامندی سے) مقام پر مبنی خصوصیات جیسے قریبی مزدور یا ملازمتیں تلاش کرنے اور پلیٹ فارم کے نقشے پر آپ کے سروس کے علاقے کو دکھانے کے لیے جمع کرتے ہیں۔',
        'لین دین کا ڈیٹا: ہم تمام ادائیگی لین دین ریکارڈ کرتے ہیں، بشمول ادائیگی کے طریقے کی تفصیلات (جاز کیش، ایزی پیسہ، بینک اکاؤنٹ)، لین دین کی رقم، ٹائم اسٹیمپس، اور ایسکرو سرگرمی۔',
        'مواصلت کا ڈیٹا: ہم تنازع کے حل اور پلیٹ فارم کی حفاظت کو آسان بنانے کے لیے ہمارے ان ایپ چیٹ سسٹم کے ذریعے مزدوروں اور آجرووں کے درمیان تبادلہ پیغامات جمع کرتے ہیں۔',
        'ڈیوائس اور استعمال کا ڈیٹا: ہم خود بخود ڈیوائس کی معلومات (ہارڈویئر ماڈل، آپریٹنگ سسٹم، منفرد ڈیوائس شناخت کار)، IP پتہ، براؤزر کی قسم، دیکھی گئی صفحات، استعمال شدہ خصوصیات، اور تعامل کے نمونوں کو بہتر خدمات فراہم کرنے کے لیے جمع کرتے ہیں۔',
        'شناختی کارڈ اور تصدیق کا ڈیٹا: آپ کی شناخت کی تصدیق کے لیے، ہم آپ کے شناختی کارڈ (سامنے اور پیچھے) کی تصاویر، سیلفی تصدیق کی تصاویر، اور جہاں لاگو ہو بائیو میٹرک رضامندی کا ڈیٹا جمع کر سکتے ہیں۔',
      ],
    },
    howWeUse: {
      title: '۲۔ ہم آپ کا ڈیٹا کیسے استعمال کرتے ہیں',
      icon: Database,
      content: [
        'پلیٹ فارم کی کارروائی: آپ کا اکاؤنٹ بنانے اور منتظم کرنے، مزدوروں اور آجرووں کے درمیان کنکشن فراہم کرنے، ادائیگیاں اور ایسکرو لین دین کو پروسیس کرنے، اور کسٹمر سپورٹ فراہم کرنے کے لیے۔',
        'سروس کی بہتری: استعمال کے نمونوں کا تجزیہ کرنے، پلیٹ فارم کی خصوصیات کو بہتر بنانے، بگز فکس کرنے، کارکردگی کو بہتر بنانے، اور نئی خدمات تیار کرنے کے لیے۔',
        'مواصلت: لین دین کی نوٹیفکیشن، بکنگ کی تصدیق، حفاظتی انتباہات، پلیٹ فارم اپ ڈیٹس، اور تشہیری مواد (آپ کی آپٹ ان رضامندی کے ساتھ) بھیجنے کے لیے۔',
        'حفاظت اور سیکیورٹی: دھوکہ دہی کا پتہ لگانے اور روکنے، صارف کی شناخت کی تصدیق کرنے، ہمارے شرائط و ضوابط پر عمل درآمد یقینی بنانے، مشکوک سرگرمیوں کی تحقیقات کرنے کے لیے۔',
        'میچ میکنگ اور تجاویز: مزدوروں کے لیے ذاتی ملازمت کی تجاویز اور آجرووں کے لیے مزدور کی تجاویز مہارت، مقام، ترجیحات، اور ماضی کے تعاملات کی بنیاد پر فراہم کرنے کے لیے۔',
        'قانونی تعمیل: پاکستانی قوانین کی تعمیل کرنے، قانونی عمل کا جواب دینے، حکومتی درخواستوں کا جواب دینے، اور مزدورپنگ، ہمارے صارفین، یا عوام کے حقوق، ملکیت یا حفاظت کے تحفظ کے لیے۔',
        'تجزیات اور رپورٹنگ: جمع شدہ، گمنام تجزیاتی رپورٹس تیار کرنے کے لیے جو ہمیں پلیٹ فارم کے رجحانات کو سمجھنے اور ہماری خدمات کو بہتر بنانے میں مدد کرتی ہیں۔',
      ],
    },
    dataSharing: {
      title: '۳۔ ڈیٹا شیئرنگ اور افشاء',
      icon: Share2,
      content: [
        'صارفین کے درمیان: مزدوروں کے پیشہ ورانہ پروفائل، ریٹنگز، اور دستیابی آجرووں کے لیے نظر آتے ہیں۔ آجرووں کے کاروباری پروفائل اور ملازمتیں مزدوروں کے لیے نظر آتی ہیں۔ ذاتی رابطے کی تفصیلات صرف تب شیئر کی جاتی ہیں جب دونوں فریق بکنگ پر راضی ہوں۔',
        'ادائیگی پروسیسرز: ہم محفوظ ادائیگی پروسیس کرنے کے لیے اپنے ادائیگی گیٹ وے پارٹنرز (جاز کیش، ایزی پیسہ، بینک) کے ساتھ ضروری لین دین کا ڈیٹا شیئر کرتے ہیں۔',
        'سروس فراہم کنندگان: ہم اپنے پلیٹ فارم کو چلانے میں مدد کرنے والے قابل اعتماد تیسری فریق کے سروس فراہم کنندگان کے ساتھ ڈیٹا شیئر کر سکتے ہیں، بشمول کلاؤڈ ہوسٹنگ فراہم کنندگان، تجزیاتی خدمات، اور مواصلت کے آلات۔',
        'انفورسمنٹ: ہم پاکستانی انفورسمنٹ اتھارٹی، حکومتی ایجنسیاں، یا عدالتوں کو قانون، ضابطہ، قانونی عمل کے مطابق ضرورت ہونے پر آپ کی معلومات کا افشاء کر سکتے ہیں۔',
        'کاروباری منتقلی: ضم، حصول، یا اثاثوں کی فروخت کی صورت میں، آپ کا ڈیٹا حاصل کرنے والی ادارے کو منتقل کیا جا سکتا ہے۔',
        'ہم آپ کی ذاتی معلومات کو تیسری فریق کی مارکیٹنگ کے مقاصد کے لیے فروخت، کرایہ، یا ٹریڈ نہیں کرتے۔',
      ],
    },
    dataSecurity: {
      title: '۴۔ ڈیٹا سیکیورٹی',
      icon: Lock,
      content: [
        'ہم آپ کے ذاتی ڈیٹا کو محفوظ رکھنے کے لیے صنعتی معیار کی سیکیورٹی اقدامات لاگو کرتے ہیں، بشمول AES-256 انکرپشن، TLS 1.3 انکرپشن، پاکستان میں ہوسٹ شدہ محفوظ سرور انفراسٹرکچر، باقاعدہ سیکیورٹی آڈٹ، اور داخلے کا پتہ لگانے کے نظام۔',
        'ادائیگی کا ڈیٹا PCI-DSS مطابقت والے ادائیگی گیٹ وے کے ذریعے پروسیس کیا جاتا ہے۔ ہم اپنے سرورز پر آپ کی مکمل ادائیگی کارڈ تفصیلات یا موبائل والٹ PINs ذخیرہ نہیں کرتے۔',
        'آپ کے ذاتی ڈیٹا تک رسائی مجاز عملے تک محدود ہے۔ تمام ملازمین اور کنٹریکٹرز رازداری کے معاہدوں سے منسلک ہیں۔',
        'ہماری بہترین کوششوں کے باوجود، انٹرنیٹ پر کوئی بھی منتقلی کا طریقہ 100٪ محفوظ نہیں ہے۔ ہم آپ کے ڈیٹا کی مکمل سیکیورٹی کی ضمانت نہیں دے سکتے۔',
      ],
    },
    cookies: {
      title: '۵۔ کوکیز اور ٹریکنگ ٹیکنالوجی',
      icon: Cookie,
      content: [
        'ہم پلیٹ فارم پر آپ کے تجربے کو بہتر بنانے کے لیے کوکیز اور اسی طرح کی ٹریکنگ ٹیکنالوجیز استعمال کرتے ہیں۔ ان میں ضروری کوکیز، تصدیقی کوکیز، ترجیحی کوکیز، اور تجزیاتی کوکیز شامل ہیں۔',
        'آپ اپنے براؤزر کی ترجیحات کے ذریعے کوکیز کی ترتیبات کو کنٹرول کر سکتے ہیں۔ تاہم، ضروری کوکیز کو غیر فعال کرنے سے آپ کو پلیٹ فارم کی کچھ خصوصیات استعمال کرنے سے روک سکتا ہے۔',
        'ہم تیزی سے لوڈنگ کے لیے آپ کی ترجیحات، سیشن ڈیٹا، اور کیشڈ مواد کو محفوظ کرنے کے لیے مقامی اسٹوریج استعمال کرتے ہیں۔',
        'ہم تیسری فریق کی اشتہاری کوکیز استعمال نہیں کرتے اور کراس سائٹ ٹریکنگ میں حصہ نہیں لیتے۔',
      ],
    },
    userRights: {
      title: '۶۔ آپ کے حقوق',
      icon: UserCheck,
      content: [
        'رسائی کا حق: آپ کے پاس ہمارے پاس موجود ذاتی ڈیٹا کی کاپی کی درخواست کرنے کا حق ہے۔ آپ اکاؤنٹ سیٹنگز کے ذریعے اپنے زیادہ تر ڈیٹا کو دیکھ سکتے ہیں۔',
        'درستی کا حق: آپ اپنی ذاتی معلومات کو کسی بھی وقت اپنے اکاؤنٹ سیٹنگز کے ذریعے یا ہمارے سپورٹ ٹیم سے رابطہ کر کے اپ ڈیٹ یا درست کر سکتے ہیں۔',
        'حذف کرنے کا حق: آپ اپنی ذاتی ڈیٹا اور اکاؤنٹ کو حذف کرنے کی درخواست کر سکتے ہیں۔ ہم ایسی درخواستوں کو ۳۰ دنوں میں پروسیس کریں گے۔',
        'قابل حمل ہونے کا حق: آپ اپنے ڈیٹا کو منظم، عام استعمال کے فارمیٹ (JSON/CSV) میں درخواست کر سکتے ہیں جسے دوسری سروس میں منتقل کیا جا سکتا ہے۔',
        'رضامندی واپس لینے کا حق: جہاں ہم آپ کے ڈیٹا کی پروسیسنگ آپ کی رضامندی پر مبنی ہے، آپ کسی بھی وقت اپنی رضامندی واپس لے سکتے ہیں۔',
        'ان میں سے کسی بھی حق کو استعمال کرنے کے لیے براہ کرم privacy@mazdoorping.pk پر ہم سے رابطہ کریں۔ ہم آپ کی درخواست کے جواب میں ۳۰ دنوں کے اندر جواب دیں گے۔',
      ],
    },
    dataRetention: {
      title: '۷۔ ڈیٹا کی برقراری',
      icon: Clock,
      content: [
        'ہم آپ کا ذاتی ڈیٹا اتنا عرصہ برقرار رکھتے ہیں جب تک آپ کا اکاؤنٹ فعال ہو یا ہماری خدمات فراہم کرنے کے لیے ضرورت ہو۔ اگر آپ اپنا اکاؤنٹ حذف کرتے ہیں تو ہم آپ کا ذاتی ڈیٹا ۹۰ دنوں کے اندر ہٹا دیں گے۔',
        'لین دین کے ریکارڈ کم از کم ۷ سال تک برقرار رکھے جاتے ہیں جیسا کہ پاکستانی ٹیکس اور مالیاتی ضوابط کے مطابق ضروری ہے۔',
        'چیٹ پیغامات اور مواصلت کے ریکارڈ متعلقہ لین دین مکمل ہونے کے بعد ۱۲ مہینوں تک برقرار رکھے جاتے ہیں۔',
        'تصدیقی ڈیٹا (شناختی کارڈ کی تصاویر، سیلفی) آپ کے اکاؤنٹ کی مدت پلس حذف ہونے کے بعد ۹۰ دن تک برقرار رکھا جاتا ہے۔',
        'گمنام، جمع شدہ تجزیاتی ڈیٹا پلیٹ فارم کی بہتری کے مقاصد کے لیے غیر محدود وقت تک برقرار رکھا جا سکتا ہے۔',
      ],
    },
    childrenPrivacy: {
      title: '۸۔ بچوں کی رازداری',
      icon: Baby,
      content: [
        'مزدورپنگ ۱۸ سال سے کم عمر افراد کے استعمال کے لیے نہیں بنایا گیا ہے۔ ہم جان بوجھ کر بچوں سے ذاتی معلومات جمع نہیں کرتے۔',
        'اگر ہمیں معلوم ہوا کہ ہم نے غلطی سے ۱۸ سال سے کم عمر شخص سے ڈیٹا جمع کیا ہے تو ہم فوری طور پر وہ معلومات اپنے سرورز سے حذف کر دیں گے۔',
        'اگر آپ والدین یا سرپرست ہیں اور سمجھتے ہیں کہ آپ کے بچے نے ہمیں ذاتی معلومات فراہم کی ہیں تو براہ کرم فوری طور پر privacy@mazdoorping.pk پر ہم سے رابطہ کریں۔',
      ],
    },
    pakistanCompliance: {
      title: '۹۔ پاکستان ڈیٹا پروٹیکشن تعمیل',
      icon: Flag,
      content: [
        'مزدورپنگ اسلامی جمہوریہ پاکستان کے قوانین کی مکمل تعمیل کے ساتھ کام کرتا ہے۔ ہمارے ڈیٹا کے عمل الیکٹرانک جرائم کی روک تھام ایکٹ 2016 (PECA)، پاکستان ٹیلی کام (تنظیم نو) ایکٹ 1996، اور کوئی بھی لاگو صوبائی ڈیٹا پروٹیکشن ضوابط کی تعمیل کرتے ہیں۔',
        'پاکستانی شہریوں کا تمام ذاتی ڈیٹا پاکستان میں واقع سرورز پر محفوظ اور پروسیس کیا جاتا ہے۔',
        'ہم قانون کے مطابق پاکستان ٹیلی کام اتھارٹی (PTA)، فیڈرل انویسٹی گیشن ایجنسی (FIA)، اور دیگر متعلقہ حکومتی اداروں کے ساتھ تعاون کرتے ہیں۔',
        'پاکستانی صارفین کو متاثر کرنے والے کسی بھی ڈیٹا بریچ کی صورت میں، ہم لاگو قانون کے مطابق ۷۲ گھنٹوں کے اندر متعلقہ اتھارٹی اور متاثرہ صارفین کو مطلع کریں گے۔',
        'ہمارے ڈیٹا پروسیسنگ کے عمل پاکستان کے ثقافتی اور مذہبی اقدار اور ہمارے صارفین کے بنیادی حقوق کا احترام کرنے کے لیے ڈیزائن کیے گئے ہیں۔',
      ],
    },
    changesToPolicy: {
      title: '۱۰۔ اس پالیسی میں تبدیلیاں',
      icon: RefreshCw,
      content: [
        'ہم اپنے عمل، ٹیکنالوجی، قانونی ضروریات، یا دیگر عوامل میں تبدیلیوں کو بیان کرنے کے لیے وقتاً فوقتاً اس رازداری کی پالیسی کو اپ ڈیٹ کر سکتے ہیں۔',
        'اہم تبدیلیاں کم از کم ۳۰ دن پہلے ای میل نوٹیفکیشن اور/یا پلیٹ فارم پر نمایاں نوٹس کے ذریعے آپ تک پہنچائی جائیں گی۔',
        'تبدیلیوں کے پوسٹ ہونے کے بعد پلیٹ فارم کا آپ کا مسلسل استعمال اپ ڈیٹ شدہ رازداری کی پالیسی کی قبولیت ہے۔',
        'ہم اس پالیسی کی ورژن ہسٹری برقرار رکھتے ہیں اور پچھلے ورژنز درخواست پر فراہم کیے جا سکتے ہیں۔',
      ],
    },
    contact: {
      title: '۱۱۔ ہم سے رابطہ کریں',
      icon: Phone,
      content: [
        'اگر آپ کے پاس اس رازداری کی پالیسی یا ہمارے ڈیٹا کے عمل کے حوالے سے کوئی سوال، تشویش یا درخواست ہے تو براہ کرم ہم سے رابطہ کریں:',
        'مزدورپنگ پرائیویٹ لمیٹڈ — ڈیٹا پروٹیکشن آفیسر',
        'ای میل: privacy@mazdoorping.pk',
        'فون: +92-3XX-XXXXXXX',
        'پتہ: لاہور، پنجاب، پاکستان',
        'کاروباری اوقات: پیر - ہفتہ، صبح ۹:۰۰ بجے - شام ۶:۰۰ بجے (PKT)',
        'ہم رازداری سے متعلق تمام تحقیقات کے جواب میں ۳۰ کاروباری دنوں کے اندر جواب دینے کی کوشش کرتے ہیں۔',
      ],
    },
  },
};

function SectionBlock({
  section,
  language,
}: {
  section: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    content: string[];
  };
  language: 'en' | 'ur';
}) {
  const Icon = section.icon;
  const isUrdu = language === 'ur';

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className={`flex items-center gap-3 mb-5 ${isUrdu ? 'flex-row-reverse' : ''}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        <h2 className={`text-lg sm:text-xl font-bold text-white ${isUrdu ? 'text-right' : ''}`}>
          {section.title}
        </h2>
      </div>
      <div className={`space-y-3 ${isUrdu ? 'text-right' : ''}`}>
        {section.content.map((paragraph, index) => (
          <p key={index} className="text-sm sm:text-base leading-relaxed text-white/50">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const { language } = useLanguageStore();
  const lang = language === 'ur' ? 'ur' : 'en';
  const content = privacyContent[lang];
  const isUrdu = lang === 'ur';

  const sections = [
    content.infoCollection,
    content.howWeUse,
    content.dataSharing,
    content.dataSecurity,
    content.cookies,
    content.userRights,
    content.dataRetention,
    content.childrenPrivacy,
    content.pakistanCompliance,
    content.changesToPolicy,
    content.contact,
  ];

  return (
    <div className={`min-h-screen bg-mesh ${isUrdu ? 'urdu-font' : ''}`}>
      {/* Header */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isUrdu ? 'واپس جائیں' : 'Back to Home'}</span>
          </Link>
          <div className={`flex items-center gap-3 mb-2 ${isUrdu ? 'flex-row-reverse' : ''}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {content.pageTitle}
              </h1>
              <p className={`text-xs sm:text-sm text-white/40 ${isUrdu ? 'text-right' : ''}`}>
                {content.pageSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="glass-card p-6 sm:p-8 mb-6 sm:mb-8">
          <p className={`text-sm sm:text-base leading-relaxed text-white/60 ${isUrdu ? 'text-right' : ''}`}>
            {content.intro}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <SectionBlock section={section} language={lang} />
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-12 glass-card p-6 sm:p-8 text-center">
          <p className={`text-sm text-white/40 ${isUrdu ? 'text-right' : ''}`}>
            &copy; {new Date().getFullYear()} MazdoorPing Pvt. Limited.{' '}
            {isUrdu ? 'جملہ حقوق محفوظ ہیں۔' : 'All rights reserved.'}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
            >
              {isUrdu ? 'شرائط و ضوابط' : 'Terms & Conditions'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
