'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/store/language-store';
import { ArrowLeft, Shield, Scale, Users, Briefcase, CreditCard, Ban, Lock, FileWarning, RefreshCw, Phone } from 'lucide-react';

const termsContent = {
  en: {
    pageTitle: 'Terms & Conditions',
    pageSubtitle: 'Last updated: January 2025',
    effectiveDate: 'These terms and conditions ("Terms") govern your use of the MazdoorPing platform ("Platform"), operated by MazdoorPing Pvt. Limited, a company registered in Pakistan.',
    acceptance: {
      title: '1. Acceptance of Terms',
      icon: Shield,
      content: [
        'By accessing or using the MazdoorPing platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our platform.',
        'These Terms constitute a legally binding agreement between you ("User") and MazdoorPing Pvt. Limited ("Company", "we", "us", or "our"). By creating an account, posting jobs, offering services, or engaging in any transaction through our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.',
        'We reserve the right to modify these Terms at any time. Continued use of the Platform after any changes constitutes your acceptance of the modified Terms.',
      ],
    },
    accounts: {
      title: '2. User Accounts',
      icon: Users,
      content: [
        'To use our Platform, you must create an account by providing accurate, complete, and current information. You must be at least 18 years of age and a resident of Pakistan to create an account.',
        'You are responsible for maintaining the confidentiality of your account credentials, including your password. You must not share your account details with any third party. You agree to notify us immediately of any unauthorized access to your account.',
        'You may register as either a Worker (skilled professional offering services) or an Employer (individual or business seeking to hire workers). Each account type has specific terms that apply in addition to these general Terms.',
        'MazdoorPing reserves the right to suspend or terminate any account that violates these Terms, engages in fraudulent activity, or misrepresents their identity or qualifications.',
      ],
    },
    workerTerms: {
      title: '3. Worker Terms',
      icon: Briefcase,
      content: [
        'Workers must provide accurate information regarding their skills, qualifications, experience, and availability. All professional certifications and CNIC verification information must be genuine and current.',
        'Workers are independent contractors and are not employees, agents, or partners of MazdoorPing. The Company does not guarantee any minimum number of jobs, projects, or earnings.',
        'Workers must perform services in a professional manner, adhering to agreed timelines and quality standards. Failure to deliver services as agreed may result in negative reviews, reduced visibility on the Platform, or account suspension.',
        'Workers must comply with all applicable Pakistani laws, regulations, and industry standards while performing services through the Platform.',
      ],
    },
    employerTerms: {
      title: '4. Employer Terms',
      icon: Briefcase,
      content: [
        'Employers must provide accurate information about job requirements, project scope, timeline, and compensation. Posting misleading or fraudulent job listings is strictly prohibited.',
        'Employers agree to make timely payments for completed work as per the agreed terms. Delayed or non-payment may result in account suspension and legal action.',
        'Employers are responsible for verifying the credentials and suitability of workers before engaging their services. While MazdoorPing provides verification features, the final hiring decision and due diligence rests with the Employer.',
        'Employers must treat all workers with respect and dignity, in compliance with Pakistani labor laws and human rights standards.',
      ],
    },
    payments: {
      title: '5. Payments & Commission',
      icon: CreditCard,
      content: [
        'MazdoorPing charges a service commission of 10% (ten percent) on all transactions completed through the Platform. This commission is deducted from the total payment amount before disbursement to the Worker.',
        'All payments are processed through our secure payment gateway in Pakistani Rupees (PKR). Payment processing times may vary depending on the chosen payment method (JazzCash, EasyPaisa, bank transfer, etc.).',
        'Employers are required to fund the full project amount (including the 10% commission) before work commences. Funds are held in escrow until the Employer confirms satisfactory completion of the work.',
        'Refund requests must be submitted within 48 hours of payment and are subject to review. Refunds will be processed within 7-14 business days, minus any applicable processing fees.',
        'Workers may withdraw their earnings to their linked JazzCash, EasyPaisa, or bank account. Withdrawal requests are processed within 1-3 business days.',
      ],
    },
    subscriptions: {
      title: '6. Subscription Plans',
      icon: RefreshCw,
      content: [
        'MazdoorPing offers optional subscription plans for both Workers and Employers, providing enhanced features such as priority listing, advanced analytics, and increased visibility.',
        'Subscription fees are billed monthly or annually as selected during the subscription process. All subscription payments are non-refundable except as required by applicable law.',
        'MazdoorPing reserves the right to modify subscription pricing with 30 days prior notice. Existing subscribers will be notified via email and in-app notification.',
        'Subscription benefits are non-transferable and apply only to the subscribed account. Upon cancellation, the account reverts to the free tier at the end of the current billing period.',
      ],
    },
    prohibited: {
      title: '7. Prohibited Activities',
      icon: Ban,
      content: [
        'You must not use the Platform for any illegal, fraudulent, or harmful activities, including but not limited to: posting fake job listings, misrepresenting skills or qualifications, attempting to circumvent our payment system, or conducting transactions outside the Platform to avoid commission.',
        'Users must not engage in harassment, discrimination, hate speech, or any form of abusive behavior toward other users. Violations will result in immediate account termination.',
        'You must not attempt to gain unauthorized access to our systems, databases, or user data. Any security breach attempts will be reported to relevant Pakistani law enforcement authorities.',
        'Users must not use automated scripts, bots, or scraping tools to access or collect data from the Platform without prior written consent.',
        'Posting content that is defamatory, obscene, violates intellectual property rights, or is otherwise objectionable is strictly prohibited.',
      ],
    },
    privacy: {
      title: '8. Privacy',
      icon: Lock,
      content: [
        'Your privacy is important to us. Our collection, use, and disclosure of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.',
        'By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy. We encourage you to read the [[LINK:Privacy Policy]] to understand our data practices.',
      ],
    },
    intellectualProperty: {
      title: '9. Intellectual Property',
      icon: Shield,
      content: [
        'All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, software, and their compilation, are the exclusive property of MazdoorPing Pvt. Limited and are protected by Pakistani and international copyright, trademark, and intellectual property laws.',
        'Users retain ownership of the content they post on the Platform (reviews, job descriptions, portfolio items). By posting content, users grant MazdoorPing a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose of operating and promoting the Platform.',
        'The MazdoorPing name, logo, and all related trademarks are the property of MazdoorPing Pvt. Limited and may not be used without prior written permission.',
      ],
    },
    limitation: {
      title: '10. Limitation of Liability',
      icon: FileWarning,
      content: [
        'To the fullest extent permitted by Pakistani law, MazdoorPing shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of or inability to use the Platform.',
        'MazdoorPing acts as an intermediary platform and is not a party to any agreement between Workers and Employers. We do not guarantee the quality, legality, or suitability of any services offered or jobs posted on the Platform.',
        'Our total liability arising out of or related to these Terms shall not exceed the amount of fees you have paid to MazdoorPing in the twelve (12) months preceding the claim.',
        'We do not guarantee uninterrupted or error-free operation of the Platform. Scheduled maintenance, updates, and unforeseen technical issues may temporarily affect availability.',
      ],
    },
    disputeResolution: {
      title: '11. Dispute Resolution',
      icon: Scale,
      content: [
        'These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising from or related to these Terms or your use of the Platform shall be resolved exclusively in the competent courts of Lahore, Punjab, Pakistan.',
        'Before initiating legal proceedings, you agree to attempt to resolve any dispute through our internal grievance redressal mechanism by contacting our support team at support@mazdoorping.pk.',
        'MazdoorPing may facilitate mediation between Workers and Employers in case of disputes, but is not obligated to do so and shall not be bound by any mediation outcome.',
        'Both parties waive any right to participate in class action lawsuits or class-wide arbitration against MazdoorPing.',
      ],
    },
    modifications: {
      title: '12. Modifications to Terms',
      icon: RefreshCw,
      content: [
        'MazdoorPing reserves the right to update or modify these Terms at any time. Material changes will be communicated to Users via email notification and/or a prominent notice on the Platform at least 30 days before they take effect.',
        'Your continued use of the Platform following the posting of changes constitutes acceptance of such changes. If you disagree with any modifications, you must discontinue use of the Platform and may request account deletion.',
        'We maintain a version history of these Terms, and previous versions can be made available upon request.',
      ],
    },
    contact: {
      title: '13. Contact Information',
      icon: Phone,
      content: [
        'If you have any questions, concerns, or feedback regarding these Terms & Conditions, please contact us:',
        'MazdoorPing Pvt. Limited',
        'Email: legal@mazdoorping.pk',
        'Phone: +92-3XX-XXXXXXX',
        'Address: Lahore, Punjab, Pakistan',
        'Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM (PKT)',
      ],
    },
  },
  ur: {
    pageTitle: 'شرائط و ضوابط',
    pageSubtitle: 'آخری اپڈیٹ: جنوری 2025',
    effectiveDate: 'یہ شرائط و ضوابط ("شرائط") مزدورپنگ پلیٹ فارم ("پلیٹ فارم") کے استعمال پر حاوی ہیں، جو پاکستان میں رجسٹرڈ کمپنی مزدورپنگ پرائیویٹ لمیٹڈ کے ذریعے چلایا جاتا ہے۔',
    acceptance: {
      title: '۱۔ شرائط کی قبولیت',
      icon: Shield,
      content: [
        'مزدورپنگ پلیٹ فارم تک رسائی حاصل کرنے یا اسے استعمال کرنے سے، آپ ان شرائط و ضوابط سے منسلک ہونے پر راضی ہیں۔ اگر آپ ان شرائط کے کسی حصے سے اتفاق نہیں کرتے تو آپ کو ہمارا پلیٹ فارم استعمال نہیں کرنا چاہیے۔',
        'یہ شرائط آپ ("صارف") اور مزدورپنگ پرائیویٹ لمیٹڈ ("کمپنی"، "ہم"، "ہمارا" یا "ہماری") کے درمیان ایک قانونی طور پر معاہدہ ہیں۔ اکاؤنٹ بنانے، ملازمتیں پوسٹ کرنے، خدمات پیش کرنے، یا پلیٹ فارم کے ذریعے کسی بھی لین دین میں مشغول ہونے سے، آپ تسلیم کرتے ہیں کہ آپ نے ان شرائط کو پڑھ لیا ہے، سمجھ لیا ہے، اور ان سے منسلک ہونے پر راضی ہیں۔',
        'ہمیں کسی بھی وقت ان شرائط میں ترمیم کرنے کا حق محفوظ ہے۔ کسی بھی تبدیلی کے بعد پلیٹ فارم کا مسلسل استعمال آپ کی تبدیل شدہ شرائط کی قبولیت ہے۔',
      ],
    },
    accounts: {
      title: '۲۔ صارف اکاؤنٹس',
      icon: Users,
      content: [
        'ہمارے پلیٹ فارم کو استعمال کرنے کے لیے، آپ کو درست، مکمل اور موجودہ معلومات فراہم کر کے اکاؤنٹ بنانا ہوگا۔ آپ کم از کم ۱۸ سال کی عمر کے اور پاکستان کے رہائشی ہونے چاہئیں۔',
        'آپ اپنے اکاؤنٹ کی تفصیلات، بشمول پاسورڈ کی رازداری کی ذمہ داری اپنے سر پر ہے۔ آپ کو اپنی اکاؤنٹ تفصیلات کسی بھی تیسری فریق کے ساتھ شیئر نہیں کرنی چاہئیں۔ آپ اپنے اکاؤنٹ تک کسی بھی غیر مجاز رسائی کی صورت میں ہمیں فوری طور پر مطلع کرنے پر راضی ہیں۔',
        'آپ مزدور (خدمات پیش کرنے والا ماہر پیشہ ور) یا آجرو (مزدوروں کو ملازم رکھنے والا فرد یا کاروبار) کے طور پر رجسٹر ہو سکتے ہیں۔ ہر اکاؤنٹ کی قسم کے لیے ان عمومی شرائط کے علاوہ مخصوص شرائط لاگو ہوتی ہیں۔',
        'مزدورپنگ کو کوئی بھی اکاؤنٹ معطل یا ختم کرنے کا حق حاصل ہے جو ان شرائط کی خلاف ورزی کرتا ہے، دھوکہ دہی کی سرگرمی میں ملوث ہوتا ہے، یا اپنی شناخت یا اہلیت کو غلط پیش کرتا ہے۔',
      ],
    },
    workerTerms: {
      title: '۳۔ مزدور کے شرائط',
      icon: Briefcase,
      content: [
        'مزدوروں کو اپنی مہارت، اہلیت، تجربے اور دستیابی کے حوالے سے درست معلومات فراہم کرنی ہوں گی۔ تمام پیشہ ورانہ سرٹیفکیٹ اور شناختی کارڈ کی تصدیق کی معلومات حقیقی اور موجودہ ہونی چاہئیں۔',
        'مزدور خود مختار کنٹریکٹر ہیں اور مزدورپنگ کے ملازم، ایجنٹ یا پارٹنر نہیں ہیں۔ کمپنی کوئی کم از کم ملازمتیں، منصوبے یا آمدنی کی ضمانت نہیں دیتی۔',
        'مزدوروں کو پیشہ ورانہ انداز میں، متفقہ وقت کی حدود اور معیار کے معیار کے مطابق خدمات انجام دینی ہوں گی۔ متفقہ طور پر خدمات فراہم نہ کرنے کی صورت میں منفی جائزے، پلیٹ فارم پر کم نمائندگی، یا اکاؤنٹ معطلی کا سامنا کرنا پڑ سکتا ہے۔',
        'مزدوروں کو پلیٹ فارم کے ذریعے خدمات انجام دیتے وقت پاکستانی قوانین، ضوابط اور صنعت کے معیارات کی تعمیل کرنی ہوں گی۔',
      ],
    },
    employerTerms: {
      title: '۴۔ آجرو کے شرائط',
      icon: Briefcase,
      content: [
        'آجرووں کو ملازمت کی ضروریات، منصوبے کے دائرہ کار، وقت کی حدود اور تعاوض کے حوالے سے درست معلومات فراہم کرنی ہوں گی۔ گمراہ کن یا دھوکہ دہی والی ملازمتیں پوسٹ کرنا سخت ممنوع ہے۔',
        'آجرو متفقہ شرائط کے مطابق مکمل ہونے والے کام کے لیے وقت پر ادائیگی کرنے پر راضی ہیں۔ دیر سے یا غیر معیاری ادائیگی کی صورت میں اکاؤنٹ معطلی اور قانونی کارروائی کا سامنا کرنا پڑ سکتا ہے۔',
        'آجرو ان کی خدمات حاصل کرنے سے پہلے مزدوروں کی اسناد اور موزونیت کی تصدیق کے لیے ذمہ دار ہیں۔ جبکہ مزدورپنگ تصدیقی خصوصیات فراہم کرتا ہے، حتمی بھرتی کا فیصلہ اور احتیاط آجرو کی ذمہ داری ہے۔',
        'آجرو کو پاکستانی محنت کے قوانین اور انسانی حقوق کے معیارات کے مطابق تمام مزدوروں کے ساتھ احترام اور عزت کے ساتھ پیش آنا چاہیے۔',
      ],
    },
    payments: {
      title: '۵۔ ادائیگیاں اور کمیشن',
      icon: CreditCard,
      content: [
        'مزدورپنگ پلیٹ فارم پر مکمل ہونے والے تمام لین دین پر ۱۰٪ (دس فیصد) سروس کمیشن وصول کرتا ہے۔ یہ کمیشن مزدور کو ادا کرنے سے پہلے کل ادائیگی کی رقم سے کاٹا جاتا ہے۔',
        'تمام ادائیگیاں ہمارے محفوظ ادائیگی گیٹ وے کے ذریعے پاکستانی روپیوں (PKR) میں پروسیس کی جاتی ہیں۔ ادائیگی کے اوقات منتخب ادائیگی کے طریقے (جاز کیش، ایزی پیسہ، بینک ٹرانسفر وغیرہ) کے لحاظ سے مختلف ہو سکتے ہیں۔',
        'آجرووں کو کام شروع ہونے سے پہلے مکمل منصوبے کی رقم (۱۰٪ کمیشن سمیت) فراہم کرنی ہوں گی۔ آجرو کے مطمئن ہونے تک رقم ایسکرو میں رکھی جاتی ہے۔',
        'رقم واپسی کی درخواستیں ادائیگی کے ۴۸ گھنٹوں کے اندر جمع کرانی چاہئیں اور ان کا جائزہ لیا جائے گا۔ رقم واپسی ۷-۱۴ کاروباری دنوں میں پروسیس کی جائے گی، لاگو پروسیسنگ فیس کم کرنے کے بعد۔',
        'مزدور اپنی آمدنی اپنے منسلک جاز کیش، ایزی پیسہ یا بینک اکاؤنٹ میں نکال سکتے ہیں۔ واپسی کی درخواستیں ۱-۳ کاروباری دنوں میں پروسیس کی جاتی ہیں۔',
      ],
    },
    subscriptions: {
      title: '۶۔ سبسکرپشن پلانز',
      icon: RefreshCw,
      content: [
        'مزدورپنگ مزدوروں اور آجرووں دونوں کے لیے اختیاری سبسکرپشن پلانز پیش کرتا ہے، جیسے ترجیحی فہرست، اعلیٰ تجزیات، اور زیادہ نمائندگی۔',
        'سبسکرپشن فیس ماہانہ یا سالانہ بٹنگ کے مطابق بل کی جاتی ہیں۔ تمام سبسکرپشن ادائیگیاں لاگو قانون کے مطابق نہیں ہوتی ہیں۔',
        'مزدورپنگ کو ۳۰ دن کی پچھلی نوٹس کے ساتھ سبسکرپشن کی قیمتوں میں ترمیم کرنے کا حق محفوظ ہے۔ موجودہ سبسکرائبرز کو ای میل اور ایپ نوٹیفکیشن کے ذریعے مطلع کیا جائے گا۔',
        'سبسکرپشن کے فوائد غیر قابل منتقلی ہیں اور صرف سبسکرائب شدہ اکاؤنٹ پر لاگو ہوتے ہیں۔ منسوخی کی صورت میں، اکاؤنٹ موجودہ بلنگ مدت کے آخر مفت ٹائر پر واپس آ جاتا ہے۔',
      ],
    },
    prohibited: {
      title: '۷۔ ممنوعہ سرگرمیاں',
      icon: Ban,
      content: [
        'آپ کو پلیٹ فارم کو کسی بھی غیر قانونی، دھوکہ دہی یا نقصان دہ سرگرمیوں کے لیے استعمال نہیں کرنا چاہیے، بشمول: جعلی ملازمتیں پوسٹ کرنا، مہارت یا اہلیت کو غلط پیش کرنا، ادائیگی کے نظام سے بچنے کی کوشش کرنا، یا کمیشن سے بچنے کے لیے پلیٹ فارم سے باہر لین دین کرنا۔',
        'صارفین کو دوسرے صارفین کے ساتھ ہراسانی، امتیازی سلوک، نفرت انگیز تقریر، یا کسی بھی قسم کے بدسلوکی سے گزرنا چاہیے۔ خلاف ورزی کی صورت میں فوری اکاؤنٹ ختم کیا جائے گا۔',
        'آپ کو ہمارے نظام، ڈیٹا بیس یا صارف ڈیٹا تک غیر مجاز رسائی حاصل کرنے کی کوشش نہیں کرنی چاہیے۔ کوئی بھی سیکیورٹی خلاف ورزی کی کوشش متعلقہ پاکستانی انفورسمنٹ اتھارٹی کو رپورٹ کی جائے گی۔',
        'صارفین کو پہلے سے تحریری اجازت کے بغیر خودکار اسکرپٹس، بوٹس، یا اسکرپنگ ٹولز کا استعمال کر کے پلیٹ فارم سے ڈیٹا تک رسائی حاصل کرنے یا جمع کرنے کی اجازت نہیں ہے۔',
        'توہین آمیز، فحش، دانشورانہ ملکیت حقوق کی خلاف ورزی، یا ورنہ قابل اعتراض مواد پوسٹ کرنا سخت ممنوع ہے۔',
      ],
    },
    privacy: {
      title: '۸۔ رازداری',
      icon: Lock,
      content: [
        'آپ کی رازداری ہمارے لیے اہم ہے۔ ذاتی معلومات کا ہمارا جمع کرنا، استعمال اور افشاء ہمارے رازداری کی پالیسی کے ذریعے حکومت ہے، جسے ان شرائط میں حوالے کے ذریعے شامل کیا گیا ہے۔',
        'پلیٹ فارم کو استعمال کر کے، آپ ہماری رازداری کی پالیسی میں بیان کردہ مطابق اپنی معلومات کے جمع کرنے اور استعمال پر راضی ہیں۔ [[LINK:رازداری کی پالیسی]] ہمارے ڈیٹا کے عمل کو سمجھنے کے لیے پڑھیں۔',
      ],
    },
    intellectualProperty: {
      title: '۹۔ دانشورانہ ملکیت',
      icon: Shield,
      content: [
        'پلیٹ فارم کا تمام مواد، خصوصیات اور کامکاری، بشمول لیکن محدود نہیں، متن، گرافکس، لوگو، آئیکنز، امیجز، آڈیو کلپس، سافٹ ویئر، اور ان کی ترتیب، مزدورپنگ پرائیویٹ لمیٹڈ کی خصوصی ملکیت ہے اور پاکستانی اور بین الاقوامی کاپی رائٹ، ٹریڈ مارک، اور دانشورانہ ملکیت کے قوانین کے ذریعے محفوظ ہے۔',
        'صارفین پلیٹ فارم پر پوسٹ کیے گئے مواد کے مالک رہتے ہیں (جائزے، ملازمت کی تفصیلات، پورٹ فولیو آئٹمز)۔ مواد پوسٹ کر کے، صارفین مزدورپنگ کو غیر خصوصی، عالمی، رائلٹی فری لائسنس دیتے ہیں۔',
        'مزدورپنگ کا نام، لوگو، اور تمام متعلقہ ٹریڈ مارکس مزدورپنگ پرائیویٹ لمیٹڈ کی ملکیت ہیں اور پہلے سے تحریری اجازت کے بغیر استعمال نہیں کیے جا سکتے۔',
      ],
    },
    limitation: {
      title: '۱۰۔ ذمہ داری کی حد',
      icon: FileWarning,
      content: [
        'پاکستانی قانون کے مطابق مکمل حد تک، مزدورپنگ کسی بھی براہ راست، غیر متوقع، خاص، نتیجہ خیز یا سزائی نقصان کے لیے ذمہ دار نہیں ہوگا، بشمول لیکن محدود نہیں، منافع، ڈیٹا، یا کاروباری مواقع کا نقصان۔',
        'مزدورپنگ ایک درمیانی پلیٹ فارم کے طور پر کام کرتا ہے اور مزدوروں اور آجرووں کے درمیان کسی بھی معاہدے کی طرف دار نہیں ہے۔ ہم پلیٹ فارم پر پیش کی گئی خدمات یا ملازمتوں کے معیار، قانونیت یا موزونیت کی ضمانت نہیں دیتے۔',
        'ان شرائط سے پیدا ہونے والی ہماری کل ذمہ داری دعوی سے پہلے بارہ (۱۲) مہینوں میں آپ کے ذریعے ادا کی گئی فیس کی رقم سے زیادہ نہیں ہوگی۔',
        'ہم پلیٹ فارم کی بے قاطع یا غلطی سے چلنے کی ضمانت نہیں دیتے۔ شیڈولڈ میٹینٹینس، اپڈیٹس، اور غیر متوقع تکنیکی مسائل عارضی طور پر دستیابی کو متاثر کر سکتے ہیں۔',
      ],
    },
    disputeResolution: {
      title: '۱۱۔ تنازع کا حل',
      icon: Scale,
      content: [
        'یہ شرائط اسلامی جمہوریہ پاکستان کے قوانین کے مطابق حکومت ہوں گی اور ان کی تشریح کی جائے گی۔ ان شرائط سے پیدا ہونے والے کسی بھی تنازع کو لاہور، پنجاب، پاکستان کی مختص عدالتوں میں حل کیا جائے گا۔',
        'قانونی کارروائی شروع کرنے سے پہلے، آپ support@mazdoorping.pk پر ہمارے سپورٹ ٹیم سے رابطہ کر کے ہمارے اندرونی شکایات کے حل کے نظام کے ذریعے کسی بھی تنازع کو حل کرنے کی کوشش کرنے پر راضی ہیں۔',
        'مزدورپنگ تنازع کی صورت میں مزدوروں اور آجرووں کے درمیان ثالثی میں مدد کر سکتا ہے، لیکن ایسا کرنا ضروری نہیں ہے اور کسی بھی ثالثی کے نتیجے سے منسلک نہیں ہوگا۔',
        'دونوں فریقین مزدورپنگ کے خلاف کلاس ایکشن مقدمے یا کلاس وائڈ آرائبریشن میں حصہ لینے کے کسی بھی حق سے دستبردار ہوتے ہیں۔',
      ],
    },
    modifications: {
      title: '۱۲۔ شرائط میں ترمیم',
      icon: RefreshCw,
      content: [
        'مزدورپنگ کو کسی بھی وقت ان شرائط میں اپڈیٹ یا ترمیم کرنے کا حق محفوظ ہے۔ اہم تبدیلیاں صارفین کو ای میل نوٹیفکیشن اور/یا پلیٹ فارم پر نمایاں نوٹس کے ذریعے کم از کم ۳۰ دن پہلے سے متعلقہ رہے گی۔',
        'تبدیلیوں کے پوسٹ ہونے کے بعد پلیٹ فارم کا آپ کا مسلسل استعمال ایسی تبدیلیوں کی قبولیت ہے۔ اگر آپ کسی بھی ترمیم سے اختلاف کرتے ہیں تو آپ کو پلیٹ فارم کا استعمال بند کرنا چاہیے۔',
        'ہم ان شرائط کی ورژن ہسٹری برقرار رکھتے ہیں، اور پچھلے ورژنز درخواست پر دستیاب کیے جا سکتے ہیں۔',
      ],
    },
    contact: {
      title: '۱۳۔ رابطے کی معلومات',
      icon: Phone,
      content: [
        'اگر آپ کے پاس ان شرائط و ضوابط کے حوالے سے کوئی سوال، تشویش یا رائے ہے تو براہ کرم ہم سے رابطہ کریں:',
        'مزدورپنگ پرائیویٹ لمیٹڈ',
        'ای میل: legal@mazdoorping.pk',
        'فون: +92-3XX-XXXXXXX',
        'پتہ: لاہور، پنجاب، پاکستان',
        'کاروباری اوقات: پیر - ہفتہ، صبح ۹:۰۰ بجے - شام ۶:۰۰ بجے (PKT)',
      ],
    },
  },
};

function renderParagraphWithLinks(text: string) {
  const parts = text.split(/(\[\[LINK:[^\]]+\]\])/);
  return parts.map((part, i) => {
    const match = part.match(/\[\[LINK:(.+?)\]\]/);
    if (match) {
      return (
        <Link
          key={i}
          href="/privacy"
          className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
        >
          {match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

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
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
        <h2 className={`text-lg sm:text-xl font-bold text-white ${isUrdu ? 'text-right' : ''}`}>
          {section.title}
        </h2>
      </div>
      <div className={`space-y-3 ${isUrdu ? 'text-right' : ''}`}>
        {section.content.map((paragraph, index) => (
          <p key={index} className="text-sm sm:text-base leading-relaxed text-white/50">
            {renderParagraphWithLinks(paragraph)}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function TermsPage() {
  const { language } = useLanguageStore();
  const lang = language === 'ur' ? 'ur' : 'en';
  const content = termsContent[lang];
  const isUrdu = lang === 'ur';

  const sections = [
    content.acceptance,
    content.accounts,
    content.workerTerms,
    content.employerTerms,
    content.payments,
    content.subscriptions,
    content.prohibited,
    content.privacy,
    content.intellectualProperty,
    content.limitation,
    content.disputeResolution,
    content.modifications,
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
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20">
              <Scale className="h-6 w-6 text-emerald-400" />
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
            {content.effectiveDate}
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
              href="/privacy"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
            >
              {isUrdu ? 'رازداری کی پالیسی' : 'Privacy Policy'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
