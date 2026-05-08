-- ============================================================================
-- MazdoorPing RLS Fix & Site Content Migration
-- Project: https://kqyugbvutgmjpwjjskft.supabase.co
-- Date: 2025
-- Description:
--   1. Fixes RLS policies on platform_settings and subscription_plans tables
--   2. Creates site_content table for admin-manageable page content
--   3. Seeds comprehensive content for all pages (English + Urdu)
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: FIX RLS ON platform_settings
-- ============================================================================

-- Drop any existing policies on platform_settings (ignore errors if they don't exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "platform_settings_select_policy" ON platform_settings;
    DROP POLICY IF EXISTS "platform_settings_insert_policy" ON platform_settings;
    DROP POLICY IF EXISTS "platform_settings_update_policy" ON platform_settings;
    DROP POLICY IF EXISTS "platform_settings_delete_policy" ON platform_settings;
    DROP POLICY IF EXISTS "Allow public read on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Allow authenticated insert on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Allow authenticated update on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Allow authenticated delete on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Enable read for anon users on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Enable insert for authenticated users on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Enable update for authenticated users on platform_settings" ON platform_settings;
    DROP POLICY IF EXISTS "Enable delete for authenticated users on platform_settings" ON platform_settings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure RLS is enabled
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "platform_settings_select_anon" ON platform_settings
    FOR SELECT USING (true);

CREATE POLICY "platform_settings_insert_auth" ON platform_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "platform_settings_update_auth" ON platform_settings
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "platform_settings_delete_auth" ON platform_settings
    FOR DELETE USING (auth.role() = 'authenticated');


-- ============================================================================
-- PART 2: FIX RLS ON subscription_plans
-- ============================================================================

-- Drop any existing policies on subscription_plans (ignore errors if they don't exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "subscription_plans_select_policy" ON subscription_plans;
    DROP POLICY IF EXISTS "subscription_plans_insert_policy" ON subscription_plans;
    DROP POLICY IF EXISTS "subscription_plans_update_policy" ON subscription_plans;
    DROP POLICY IF EXISTS "subscription_plans_delete_policy" ON subscription_plans;
    DROP POLICY IF EXISTS "Allow public read on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Allow authenticated insert on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Allow authenticated update on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Allow authenticated delete on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Enable read for anon users on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Enable insert for authenticated users on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Enable update for authenticated users on subscription_plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Enable delete for authenticated users on subscription_plans" ON subscription_plans;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure RLS is enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "subscription_plans_select_anon" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "subscription_plans_insert_auth" ON subscription_plans
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "subscription_plans_update_auth" ON subscription_plans
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "subscription_plans_delete_auth" ON subscription_plans
    FOR DELETE USING (auth.role() = 'authenticated');


-- ============================================================================
-- PART 3: CREATE site_content TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,        -- e.g., 'about', 'how-it-works', 'features', 'pricing', 'contact', 'terms', 'privacy'
  section_key TEXT NOT NULL,      -- e.g., 'hero_title', 'hero_subtitle', 'section_1_title', 'section_1_content'
  content_en TEXT DEFAULT '',     -- English content
  content_ur TEXT DEFAULT '',     -- Urdu content
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'richtext', 'html', 'json')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_slug, section_key)
);

-- Add index for faster lookups by page
CREATE INDEX IF NOT EXISTS idx_site_content_page_slug ON site_content(page_slug);
CREATE INDEX IF NOT EXISTS idx_site_content_active ON site_content(is_active);


-- ============================================================================
-- PART 4: SET RLS ON site_content
-- ============================================================================

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content_select_anon" ON site_content
    FOR SELECT USING (true);

CREATE POLICY "site_content_insert_auth" ON site_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "site_content_update_auth" ON site_content
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "site_content_delete_auth" ON site_content
    FOR DELETE USING (auth.role() = 'authenticated');


-- ============================================================================
-- PART 5: SEED DEFAULT CONTENT
-- ============================================================================

-- ============================================================================
-- ABOUT PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('about', 'hero_title',
'About MazdoorPing - Empowering Pakistans Skilled Workers',
'مزدور پنگ کے بارے میں - پاکستان کے ماہر مزدوروں کی بااختیار بنانا',
'text', 1),

('about', 'hero_subtitle',
'MazdoorPing is Pakistans leading digital platform bridging the gap between skilled workers and employers. We are transforming the way Pakistan finds and hires trusted professionals for every job, big or small.',
'مزدور پنگ پاکستان کی پہلی ڈیجیٹل پلیٹ فارم ہے جو ماہر مزدوروں اور آجروں کے درمیان پل بناتی ہے۔ ہم پاکستان میں ہر بڑے اور چھوٹے کام کے لیے قابل اعتماد پیشہ ورانہ افراد تلاش کرنے اور ملازمت دینے کے طریقے کو تبدیل کر رہے ہیں۔',
'text', 2),

('about', 'section_1_title',
'Our Story',
'ہماری کہانی',
'text', 3),

('about', 'section_1_content',
'MazdoorPing was born out of a simple yet powerful observation: millions of skilled workers in Pakistan struggle to find consistent work, while employers face immense difficulty in locating reliable, verified professionals. Traditional methods of finding workers through word-of-mouth or local contractors are inefficient, unreliable, and often exploitative.

Founded in 2024, MazdoorPing set out to digitize and democratize access to skilled labor across Pakistan. Our platform leverages technology to create a transparent, efficient, and fair marketplace where workers can showcase their skills, build their reputation, and connect directly with employers who need their services.

From electricians and plumbers in Karachi to carpenters and painters in Lahore, from AC technicians in Islamabad to masons and welders in Peshawar — MazdoorPing is building a nationwide network that empowers every skilled worker with digital tools, fair opportunities, and the respect they deserve.',
'مزدور پنگ ایک سادہ لیکن طاقتور مشاہدے سے پیدا ہوا: پاکستان میں لاکھوں ماہر مزدوروں کو مستقل کام تلاش کرنے میں مشکلات کا سامنا ہے، جبکہ آجروں کو قابل اعتماد اور تصدیق شدہ پیشہ ور افراد تلاش کرنے میں بہت مشکلات کا سامنا ہے۔ زبانی روایت یا مقامی ٹھیکیداروں کے ذریعے مزدور تلاش کرنے کی روایتی طریقے ناکارآمد، غیر معتبر اور اکثر استحصالی ہیں۔

2024 میں قائم کی گئی، مزدور پنگ نے پورے پاکستان میں ماہر محنت کی رسائی کو ڈیجیٹائز کرنے اور جمہوری بنانے کا ارادہ کیا۔ ہمارا پلیٹ فارم ٹیکنالوجی کا استعمال کرتے ہوئے ایک شفاف، موثر اور منصفانہ بازار بناتا ہے جہاں مزدور اپنی مہارتوں کو پیش کر سکتے ہیں، اپنی شہرت بناسکتے ہیں، اور براہ راست ان آجروں سے جڑ سکتے ہیں جو ان کی خدمات کی ضرورت رکھتے ہیں۔

کراچی میں بجلی والے اور پلمبر سے لے کر لاہور میں ترکھان اور پینٹر تک، اسلام آباد میں اے سی ٹیکنیشن سے لے کر پشاور میں رجبند اور ویلڈر تک — مزدور پنگ ایک قومی نیٹ ورک بنا رہا ہے جو ہر ماہر مزدور کو ڈیجیٹل ٹولز، منصفانہ مواقع اور وہ احترام دیتا ہے جو ان کا حق ہے۔',
'richtext', 4),

('about', 'section_2_title',
'Our Mission',
'ہمارا مشن',
'text', 5),

('about', 'section_2_content',
'Our mission is to revolutionize the skilled labor market in Pakistan by creating a trusted, technology-driven platform that connects skilled workers with employment opportunities while ensuring fair wages, dignity of labor, and professional growth for every worker on our platform.

We believe that every skilled worker deserves access to a steady stream of job opportunities, transparent pricing, timely payments, and a safe working environment. Through MazdoorPing, we are building an ecosystem that not only facilitates job matching but also provides workers with tools for professional development, financial management, and community support.

Our commitment extends to employers as well — we help them find the right workers quickly, verify credentials, manage payments securely, and build long-term relationships with reliable professionals. By bridging this gap, we aim to boost Pakistans informal economy and bring millions of workers into the digital mainstream.',
'ہمارا مشن پاکستان میں ماہر محنت کے بازار میں انقلاب لانا ہے ایک قابل اعتماد، ٹیکنالوجی پر مبنی پلیٹ فارم بنائیں جو ماہر مزدوروں کو روزگار کے مواقع سے جوڑتا ہو اور ہر مزدور کے لیے منصفانہ تنخواہ، محنت کی عزت اور پیشہ ورانہ ترقی یقینی بناتا ہو۔

ہمارا یقین ہے کہ ہر ماہر مزدور کو کام کے مستقل مواقع تک رسائی، شفاف قیمت کاری، وقت پر ادائیگی اور محفوظ کام کے ماحول کا حق ہے۔ مزدور پنگ کے ذریعے، ہم ایک ایکو سسٹم بنا رہے ہیں جو نہ صرف کام کی میچنگ کو آسان بناتا ہے بلکہ مزدوروں کو پیشہ ورانہ ترقی، مالیہ کیانتظام اور برادری کی مدد کے لیے ٹولز بھی فراہم کرتا ہے۔

ہمارا عزم آجروں تک بھی پھیلا ہوا ہے — ہم انہیں صحیح مزدور تیزی سے تلاش کرنے، اسناد کی تصدیق، ادائیگیوں کو محفوظ طریقے سے انتظام کرنے اور قابل اعتماد پیشہ ورانہ افراد کے ساتھ طویل مدتی تعلقات بنانے میں مدد کرتے ہیں۔ اس فرق کو پُر کر کے، ہم پاکستان کی غیر رسمی معیشت کو بڑھانے اور لاکھوں مزدوروں کو ڈیجیٹل	mainstream میں لانے کا ہدف رکھتے ہیں۔',
'richtext', 6),

('about', 'section_3_title',
'Our Values',
'ہماری اقدار',
'text', 7),

('about', 'section_3_content',
'At MazdoorPing, our core values guide everything we do:

Trust and Transparency: We believe in building a platform where trust is earned through verified profiles, honest reviews, and complete transparency in pricing and payments.

Dignity of Labor: Every worker, regardless of their trade, deserves respect and recognition. We celebrate the skills and contributions of Pakistans workforce.

Fairness and Equality: We are committed to ensuring fair wages, equal opportunities, and non-discriminatory practices across our platform for all workers and employers.

Innovation and Accessibility: We leverage cutting-edge technology while keeping our platform simple and accessible, even for workers who may be using a smartphone for the first time.

Community First: We are building more than a marketplace — we are fostering a community of skilled professionals who support, learn from, and uplift one another.

Safety and Security: The safety of our workers and employers is paramount. We implement robust verification processes and secure payment systems to protect everyone on our platform.',
'مزدور پنگ میں، ہماری بنیادی اقدار ہر کام کی رہنمائی کرتی ہیں:

اعتبار اور شفافیت: ہم ایک پلیٹ فارم بنانے پر یقین رکھتے ہیں جہاں اعتبار تصدیق شدہ پروفائلز، پرائمین ریویوز اور قیمت اور ادائیگی میں مکمل شفافیت کے ذریعے حاصل کیا جاتا ہے۔

محنت کی عزت: ہر مزدور، چاہے اس کا پیشہ کچھ بھی ہو، احترام اور تسلیم کا حق دار ہے۔ ہم پاکستانی ورک فورس کی مہارتوں اور تعاونات کو مناتے ہیں۔

انصاف اور مساوات: ہم تمام مزدوروں اور آجروں کے لیے منصفانہ تنخواہ، برابر مواقع اور غیر تفریق روی کی پریکٹس کو یقینی بنانے کے لیے پرعزم ہیں۔

جدت اور رسائی: ہم جدید ترین ٹیکنالوجی کا فائدہ اٹھاتے ہیں اور ساتھ ہی اپنے پلیٹ فارم کو سادہ اور قابل رسائی رکھتے ہیں، حتیٰ کہ ان مزدوروں کے لیے بھی جو پہلی بار اسمارٹ فون استعمال کر رہے ہوں۔

برادری اول: ہم صرف ایک مارکیٹ پلیس نہیں بنا رہے — ہم ماہر پیشہ ورانہ افراد کی ایک برادری پروان چڑھا رہے ہیں جو ایک دوسرے کی مدد کرتی ہے، سیکھتی ہے اور بلند کرتی ہے۔

حفاظت اور سیکیورٹی: ہمارے مزدوروں اور آجروں کی حفاظت سب سے اہم ہے۔ ہم اپنے پلیٹ فارم پر ہر شخص کی حفاظت کے لیے مضبوط تصدیق کے عمل اور محفوظ ادائیگی کے نظام نافذ کرتے ہیں۔',
'richtext', 8),

('about', 'section_4_title',
'Our Team',
'ہماری ٹیم',
'text', 9),

('about', 'section_4_content',
'MazdoorPing is built by a passionate team of technologists, designers, and social impact enthusiasts who share a common vision: to transform the lives of Pakistans skilled workers through technology.

Our founding team brings together decades of combined experience in software development, product design, community building, and labor market research. Having witnessed firsthand the challenges faced by both workers and employers in the informal sector, we are driven by a deep sense of purpose to create meaningful change.

We are backed by advisors and mentors from Pakistans leading technology companies and social enterprises, who bring invaluable expertise in scaling digital platforms and creating sustainable social impact.

Our team operates from multiple cities across Pakistan, ensuring that we stay connected to the communities we serve and understand the unique challenges and opportunities in different regions.',
'مزدور پنگ ایک پرجوش ٹیم کے ذریعے بنایا گیا ہے جس میں ٹیکنالوجسٹس، ڈیزائنرز اور سماجی اثر کے شوقین افراد شامل ہیں جو ایک مشترکہ وژن رکھتے ہیں: ٹیکنالوجی کے ذریعے پاکستان کے ماہر مزدوروں کی زندگیوں کو تبدیل کرنا۔

ہماری بنیادی ٹیم سافٹ ویئر ڈویلپمنٹ، پروڈکٹ ڈیزائن، برادری کی تعمیر اور محنت کے بازار کی تحقیق میں دہائیوں کے مشترکہ تجربات کو یکجا کرتی ہے۔ غیر رسمی شعبے میں مزدوروں اور آجروں دونوں کے سامنے آنے والی چیلنجوں کو قریب سے دیکھ کر، ہم معنوی تبدیلی پیدا کرنے کی گہری محسوس شدہ ضرورت سے متاثر ہیں۔

ہمیں پاکستان کی معتبر ٹیکنالوجی کمپنیوں اور سماجی اداروں کے مشیران اور منتظمین کی تائید حاصل ہے جو ڈیجیٹل پلیٹ فارمز کو سکیل کرنے اور پائیدار سماجی اثر پیدا کرنے میں بے قیمت مہارت لاتے ہیں۔

ہماری ٹیم پاکستان کے متعدد شہروں سے کام کرتی ہے، یہ یقینی بناتے ہوئے کہ ہم ان برادریوں سے جڑے رہیں جن کی خدمت ہم کرتے ہیں اور مختلف خطوں میں منفرد چیلنجوں اور مواقع کو سمجھیں۔',
'richtext', 10),

('about', 'stats_items',
'[
  {"label": "Registered Workers", "value": "50,000+", "icon": "users"},
  {"label": "Employers Onboarded", "value": "10,000+", "icon": "building"},
  {"label": "Jobs Completed", "value": "100,000+", "icon": "check-circle"},
  {"label": "Cities Covered", "value": "50+", "icon": "map-pin"},
  {"label": "Worker Categories", "value": "30+", "icon": "briefcase"},
  {"label": "Average Rating", "value": "4.8/5", "icon": "star"}
]',
'[
  {"label": "رجسٹرڈ مزدور", "value": "50,000+", "icon": "users"},
  {"label": "آن بورڈ آجروں", "value": "10,000+", "icon": "building"},
  {"label": "مکمل کردہ کام", "value": "100,000+", "icon": "check-circle"},
  {"label": "شہر کور کیے", "value": "50+", "icon": "map-pin"},
  {"label": "مزدور زمرے", "value": "30+", "icon": "briefcase"},
  {"label": "اوسط ریٹنگ", "value": "4.8/5", "icon": "star"}
]',
'json', 11);


-- ============================================================================
-- HOW IT WORKS PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('how-it-works', 'hero_title',
'How MazdoorPing Works - Simple, Fast, Reliable',
'مزدور پنگ کیسے کام کرتا ہے - آسان، تیز، قابل اعتماد',
'text', 1),

('how-it-works', 'hero_subtitle',
'Finding the perfect skilled worker or landing your next job has never been easier. Follow these simple steps to get started with MazdoorPing and experience hassle-free service matching.',
'مکمل ماہر مزدور تلاش کرنا یا اپنا اگلا کام حاصل کرنا اس سے پہلے کبھی اتنا آسان نہیں تھا۔ مزدور پنگ کے ساتھ شروع ہونے کے لیے ان آسان مراحل پر عمل کریں اور بغیر پریشانی کے سروس میچنگ کا تجربہ کریں۔',
'text', 2),

('how-it-works', 'step_1_title',
'Register and Create Your Profile',
'رجسٹر کریں اور اپنا پروفائل بنائیں',
'text', 3),

('how-it-works', 'step_1_desc',
'Sign up in less than 2 minutes using your phone number or email. If you are a worker, create a detailed profile showcasing your skills, experience, certifications, and work photos. If you are an employer, set up your company profile with your requirements and preferences. Our simple registration process supports both English and Urdu for maximum accessibility.',
'اپنا فون نمبر یا ای میل کا استعمال کرتے ہوئے 2 منٹ سے کم میں سائن اپ کریں۔ اگر آپ مزدور ہیں تو اپنی مہارتوں، تجربے، سرٹیفکیٹس اور کام کی تصاویر کے ساتھ ایک تفصیلی پروفائل بنائیں۔ اگر آپ آجر ہیں تو اپنی ضروریات اور ترجیحات کے ساتھ اپنی کمپنی کا پروفائل سیٹ اپ کریں۔ ہمارا سادہ رجسٹریشن پروسیس زیادہ سے زیادہ رسائی کے لیے انگریزی اور اردو دونوں کو سپورٹ کرتا ہے۔',
'text', 4),

('how-it-works', 'step_1_icon',
'user-plus',
'user-plus',
'text', 5),

('how-it-works', 'step_2_title',
'Search, Match, and Connect',
'تلاش کریں، میچ کریں اور جڑیں',
'text', 6),

('how-it-works', 'step_2_desc',
'Employers can search for workers by category, location, rating, and availability. Our intelligent matching algorithm suggests the best-fit workers based on your specific requirements. Workers receive job notifications matching their skills and location, and can browse available jobs in their area. Use our built-in chat feature to discuss project details, negotiate terms, and confirm availability before making a commitment.',
'آجروں زمرے، مقام، ریٹنگ اور دستیابی کے لحاظ سے مزدوروں کی تلاش کر سکتے ہیں۔ ہمارا ذہین میچنگ الگورتھم آپ کی مخصوص ضروریات کی بنیاد پر بہترین مزدور تجویز کرتا ہے۔ مزدوروں کو ان کی مہارتوں اور مقام سے مطابقت پذیر کام کی اطلاعات موصول ہوتی ہیں اور وہ اپنے علاقے میں دستیاب کام براؤز کر سکتے ہیں۔ التزام کرنے سے پہلے پراجیکٹ کی تفصیلات پر تبادلہ خیال کرنے، شرائط پر مذاکرات کرنے اور دستیابی کی تصدیق کرنے کے لیے ہمارے بلٹ ان چیٹ فیچر کا استعمال کریں۔',
'text', 7),

('how-it-works', 'step_2_icon',
'search',
'search',
'text', 8),

('how-it-works', 'step_3_title',
'Book and Get the Job Done',
'بک کریں اور کام کروائیں',
'text', 9),

('how-it-works', 'step_3_desc',
'Once you have found the right match, book the service with a single tap. Set the job date, time, and location. Our platform provides real-time tracking so employers know when their worker is on the way. For workers, the job details, address, and employer contact information are all available in one place. Complete the job, and both parties can rate and review each other to build trust in the community.',
'جب آپ کو صحیح میچ مل جائے تو ایک ٹچ میں سروس بک کریں۔ کام کی تاریخ، وقت اور مقام سیٹ کریں۔ ہمارا پلیٹ فارم ریئل ٹائم ٹریکنگ فراہم کرتا ہے تاکہ آجروں کو پتہ چلے کہ ان کا مزدور کب راستے میں ہے۔ مزدوروں کے لیے، کام کی تفصیلات، پتہ اور آجر کی رابطہ کی معلومات ایک جگہ دستیاب ہیں۔ کام مکمل کریں اور دونوں فریق ایک دوسرے کو ریٹ اور ریویو کر سکتے ہیں تاکہ برادری میں اعتبار بنایا جا سکے۔',
'text', 10),

('how-it-works', 'step_3_icon',
'calendar-check',
'calendar-check',
'text', 11),

('how-it-works', 'step_4_title',
'Secure Payment and Review',
'mحفوظ ادائیگی اور ریویو',
'text', 12),

('how-it-works', 'step_4_desc',
'MazdoorPing ensures secure and transparent payments. Employers can pay through multiple methods including JazzCash, EasyPaisa, bank transfer, and in-app wallet. Payments are held in escrow until the job is confirmed complete, protecting both parties. After job completion, leave a detailed review and rating to help future users make informed decisions. Our dispute resolution team is available 24/7 to handle any issues that may arise.',
'مزدور پنگ محفوظ اور شفاف ادائیگی کو یقینی بناتا ہے۔ آجروں متعدد طریقوں سے ادائیگی کر سکتے ہیں بشمول JazzCash، EasyPaisa، بینک ٹرانسفر اور ایپ میں والٹ۔ ادائیگیاں اسکیرو میں رکھی جاتی ہیں جب تک کام مکمل ہونے کی تصدیق نہ ہو جائے، دونوں فریقوں کی حفاظت کرتے ہوئے۔ کام مکمل ہونے کے بعد ایک تفصیلی ریویو اور ریٹنگ چھوڑیں تاکہ مستقبل کے صارفین کو آگاہ فیصلے کرنے میں مدد ملے۔ ہمارا تنازع کے حل کرنے والا ٹیم 24/7 دستیاب ہے تاکہ کوئی بھی مسئلہ جو پیدا ہو سکتا ہے اس کا سامنا کر سکے۔',
'text', 13),

('how-it-works', 'step_4_icon',
'credit-card',
'credit-card',
'text', 14),

('how-it-works', 'cta_title',
'Ready to Get Started?',
'شروع کرنے کے لیے تیار ہیں؟',
'text', 15),

('how-it-works', 'cta_desc',
'Join thousands of skilled workers and employers who are already benefiting from MazdoorPing. Whether you need a job done or looking for your next opportunity, we have got you covered. Download the app or sign up on our website today!',
'ہزاروں ماہر مزدوروں اور آجروں میں شامل ہوں جو پہلے ہی مزدور پنگ سے فائدہ اٹھا رہے ہیں۔ چاہے آپ کو کوئی کام کروانا ہو یا اپنا اگلا موقع تلاش کرنا ہو، ہم آپ کا خیال رکھتے ہیں۔ آج ایپ ڈاؤن لوڈ کریں یا ہمارے ویب سائٹ پر سائن اپ کریں!',
'text', 16);


-- ============================================================================
-- FEATURES PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('features', 'hero_title',
'Features That Make MazdoorPing Stand Out',
'خصوصیات جو مزدور پنگ کو منفرد بناتی ہیں',
'text', 1),

('features', 'hero_subtitle',
'Discover the powerful features designed to make finding and hiring skilled workers in Pakistan effortless, transparent, and secure for everyone involved.',
'پاکستان میں ماہر مزدوروں کو تلاش کرنے اور ملازمت دینے کو کوشگار، شفاف اور محفوظ بنانے کے لیے ڈیزائن کردہ طاقتور خصوصیات کو دریافت کریں۔',
'text', 2),

('features', 'feature_1_title',
'Smart Worker Discovery with AI Matching',
'اے آئی میچنگ کے ساتھ اسمارٹ ورکر ڈسکوری',
'text', 3),

('features', 'feature_1_desc',
'Our intelligent AI-powered matching algorithm analyzes your requirements, location, budget, and preferences to recommend the best-suited workers for your job. The system learns from your past bookings and ratings to continuously improve suggestions. Filter by skill category, experience level, availability, language preference, and proximity to find the perfect match in seconds.',
'ہمارا ذہین AI پر مبنی میچنگ الگورتھم آپ کی ضروریات، مقام، بجٹ اور ترجیحات کا تجزیہ کرتا ہے اور آپ کے کام کے لیے بہترین موزوں مزدور تجویز کرتا ہے۔ یہ سسٹم آپ کے گذشتہ بکنگز اور ریٹنگز سے سیکھتا ہے اور تجویزات میں مسلسل بہتری لاتا ہے۔ مہارت زمرے، تجربے کی سطح، دستیابی، زبان کی ترجیح اور قربت کے لحاظ سے فلٹر کریں تاکہ سیکنڈوں میں کمال میچ ملے۔',
'text', 4),

('features', 'feature_2_title',
'Verified Profiles and Trust System',
'تصدیق شدہ پروفائلز اور ٹرسٹ سسٹم',
'text', 5),

('features', 'feature_2_desc',
'Every worker on MazdoorPing goes through a thorough verification process including CNIC verification, skill assessment, and reference checks. Employers can view verified badges, work history, portfolio photos, and genuine customer reviews before making a hiring decision. Our star rating system and detailed feedback mechanism ensure accountability and help maintain quality standards across the platform.',
'مزدور پنگ پر ہر مزدور ایک جامع تصدیق کے عمل سے گزرتا ہے جس میں شناختی کارڈ کی تصدیق، مہارت کا جائزہ اور حوالہ جاتی چیک شامل ہیں۔ آجروں ملازمت دینے کے فیصلے سے پہلے تصدیق شدہ بیجز، کام کی تاریخ، پورٹ فولیو تصاویر اور حقیقی صارف کے ریویوز دیکھ سکتے ہیں۔ ہمارا اسٹار ریٹنگ سسٹم اور تفصیلی فیڈ بیک mechanization ذمہ داری کو یقینی بناتا ہے اور پلیٹ فارم پر معیار کے معیارات کو برقرار رکھنے میں مدد کرتا ہے۔',
'text', 6),

('features', 'feature_3_title',
'Real-Time Chat and Job Tracking',
'ریئل ٹائم چیٹ اور جاب ٹریکنگ',
'text', 7),

('features', 'feature_3_desc',
'Communicate directly with workers or employers through our built-in instant messaging system. Share photos, send voice messages, and discuss project details without sharing personal phone numbers. Real-time GPS tracking lets employers see when their worker is en route. Get automatic notifications for job status updates, booking confirmations, and payment receipts — all within the app.',
'ہمارے بلٹ ان انسٹنٹ میسجنگ سسٹم کے ذریعے براہ راست مزدوروں یا آجروں سے بات چیت کریں۔ تصاویر شیئر کریں، آواز کے پیغام بھیجیں اور نجی فون نمبر شیئر کیے بغیر پراجیکٹ کی تفصیلات پر بات چیت کریں۔ ریئل ٹائم GPS ٹریکنگ آجروں کو دیکھنے دیتا ہے کہ ان کا مزدور کب راستے میں ہے۔ کام کی حیثیت کی اپ ڈیٹس، بکنگ کی تصدیق اور ادائیگی کی رسیدوں کے لیے خود بخود نوٹیفکیشن حاصل کریں — سب ایپ کے اندر۔',
'text', 8),

('features', 'feature_4_title',
'Secure Escrow Payments',
'mحفوظ اسکیرو ادائیگیاں',
'text', 9),

('features', 'feature_4_desc',
'Your money is safe with MazdoorPing. When you book a service, the payment is held securely in our escrow system until the job is completed and confirmed by both parties. We support JazzCash, EasyPaisa, bank transfers, and our in-app wallet. Workers get paid promptly upon job completion, and employers are protected from paying for incomplete or unsatisfactory work.',
'آپ کا پیسہ مزدور پنگ کے ساتھ محفوظ ہے۔ جب آپ سروس بک کرتے ہیں تو ادائیگی ہمارے اسکیرو سسٹم میں محفوظ طریقے سے رکھی جاتی ہے جب تک کام مکمل ہو جائے اور دونوں فریقوں کی طرف سے تصدیق ہو جائے۔ ہم JazzCash، EasyPaisa، بینک ٹرانسفرز اور ہمارے ایپ میں والٹ سپورٹ کرتے ہیں۔ مزدوروں کو کام مکمل ہونے پر فوری طور پر ادائیگی ملتی ہے اور آجروں کو نامکمل یا غیر مطمئن کام کے لیے ادائیگی سے محفوظ رکھا جاتا ہے۔',
'text', 10),

('features', 'feature_5_title',
'Bilingual Support - English and Urdu',
'دو زبانوں کی سپورٹ - انگریزی اور اردو',
'text', 11),

('features', 'feature_5_desc',
'MazdoorPing is designed for Pakistan, supporting both English and Urdu throughout the entire platform. Switch languages with a single tap. All job descriptions, reviews, chat messages, and notifications work seamlessly in both languages. This ensures that workers who are more comfortable in Urdu can use the platform just as effectively as English-speaking employers and professionals.',
'مزدور پنگ پاکستان کے لیے ڈیزائن کیا گیا ہے، پورے پلیٹ فارم میں انگریزی اور اردو دونوں کو سپورٹ کرتا ہے۔ ایک ٹچ میں زبان تبدیل کریں۔ تمام کام کی تفصیلات، ریویوز، چیٹ پیغامات اور نوٹیفکیشنز دونوں زبانوں میں بے عیب کام کرتے ہیں۔ یہ یقینی بناتا ہے کہ وہ مزدور جو اردو میں زیادہ آرام دہ محسوس کرتے ہیں وہ پلیٹ فارم کو اتنی ہی مؤثر طریقے سے استعمال کر سکیں جتنا انگریزی بولنے والے آجروں اور پیشہ ور افراد۔',
'text', 12),

('features', 'feature_6_title',
'SOS Emergency Alert System',
'ایس او ایس ایمرجنسی الرٹ سسٹم',
'text', 13),

('features', 'feature_6_desc',
'Safety is our top priority. The built-in SOS button allows workers to send an immediate emergency alert with their GPS location to pre-selected emergency contacts and our support team. In case of any unsafe situation at a worksite, help is just one tap away. Our 24/7 emergency response team coordinates with local authorities to ensure the safety and well-being of every worker on our platform.',
'حفاظت ہماری اولین ترجیح ہے۔ بلٹ ان ایس او ایس بٹن مزدوروں کو ان کے GPS مقام کے ساتھ فوری ایمرجنسی الرٹ بھیجنے کی اجازت دیتا ہے جو پہلے سے منتخب ایمرجنسی رابطوں اور ہماری سپورٹ ٹیم کو بھیجا جاتا ہے۔ کام کی جگہ پر کوئی بھی غیر محفوظ صورتحال کی صورت میں، مدد صرف ایک ٹچ دور ہے۔ ہماری 24/7 ایمرجنسی ری سپانس ٹیم مقامی اتھارٹیز کے ساتھ ہم آہنگی کرتی ہے تاکہ ہمارے پلیٹ فارم پر ہر مزدور کی حفاظت اور فلاح و بہبود یقینی بن سکے۔',
'text', 14);


-- ============================================================================
-- PRICING PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('pricing', 'hero_title',
'Transparent Pricing - Choose Your Plan',
'شفاف قیمتوں - اپنا پلان منتخب کریں',
'text', 1),

('pricing', 'hero_subtitle',
'MazdoorPing offers flexible plans for workers, employers, and businesses of all sizes. No hidden fees, no surprises — just straightforward pricing that works for everyone.',
'مزدور پنگ مزدوروں، آجروں اور تمام سائز کی کاروباری اداروں کے لیے لچکدار پلانز پیش کرتا ہے۔ کوئی پوشیدہ فیس نہیں، کوئی حیرانی نہیں — صرف سادہ قیمت کاری جو ہر کسی کے لیے کام کرتی ہے۔',
'text', 2),

('pricing', 'faq_1_title',
'Is it free to join MazdoorPing?',
'کیا مزدور پنگ میں شامل ہونا مفت ہے؟',
'text', 3),

('pricing', 'faq_1_answer',
'Yes! It is completely free for workers and employers to register and create profiles on MazdoorPing. You can browse workers, search for jobs, and use the chat feature without any charges. We only charge a small service fee when a job is successfully completed through our platform. This ensures that you only pay when you get real value.',
'جی ہاں! مزدوروں اور آجروں کے لیے مزدور پنگ پر رجسٹر کرنے اور پروفائل بنانے کے لیے بالکل مفت ہے۔ آپ بغیر کسی چارج کے مزدوروں کو براؤز کر سکتے ہیں، کام تلاش کر سکتے ہیں اور چیٹ فیچر استعمال کر سکتے ہیں۔ ہم صرف ایک چھوٹی سروس فیس وصول کرتے ہیں جب کوئی کام ہمارے پلیٹ فارم کے ذریعے کامیابی سے مکمل ہو جائے۔ یہ یقینی بناتا ہے کہ آپ صرف تب ادائیگی کریں جب آپ کو حقیقی قدر ملی۔',
'richtext', 4),

('pricing', 'faq_2_title',
'How does the service fee work?',
'سروس فیس کیسے کام کرتی ہے؟',
'text', 5),

('pricing', 'faq_2_answer',
'For workers, a small commission of 5-10% is deducted from each completed job payment. This covers platform maintenance, payment processing, customer support, and continued development of new features. For employers, there is no additional commission — the price you agree upon with the worker is what you pay. Premium subscription plans are available for both workers and employers who want access to advanced features like priority listings, analytics dashboards, and AI-powered recommendations.',
'مزدوروں کے لیے، ہر مکمل کردہ کام کی ادائیگی سے 5-10% کی چھوٹی کمیشن کاٹی جاتی ہے۔ یہ پلیٹ فارم کی دیکھ بھال، ادائیگی کی پروسیسنگ، کسٹمر سپورٹ اور نئی خصوصیات کی مسلسل ترقی کو کور کرتا ہے۔ آجروں کے لیے کوئی اضافی کمیشن نہیں — قیمت جو آپ مزدور کے ساتھ طے کرتے ہیں وہی آپ ادا کرتے ہیں۔ پریمیم سبسکرپشن پلانز مزدوروں اور آجروں کے لیے دستیاب ہیں جو جدید خصوصیات تک رسائی چاہتے ہیں جیسے ترجیحی لسٹنگز، اینالٹکس ڈیش بورڈز اور AI پر مبنی سفارشات۔',
'richtext', 6),

('pricing', 'faq_3_title',
'What payment methods are accepted?',
'کون سی ادائیگی کے طریقے قبول کیے جاتے ہیں؟',
'text', 7),

('pricing', 'faq_3_answer',
'We accept a wide range of payment methods to ensure maximum convenience for all users across Pakistan. Supported methods include JazzCash, EasyPaisa, Ufone Pay, bank transfers (all major Pakistani banks), and our secure in-app wallet. For business accounts, we also support direct bank transfers and invoice-based payments. All transactions are encrypted and processed through PCI-DSS compliant payment gateways.',
'ہم پورے پاکستان میں تمام صارفین کے لیے زیادہ سے زیادہ سہولت یقینی بنانے کے لیے ایک وسیع رینج کے ادائیگی کے طریقے قبول کرتے ہیں۔ سپورٹ شدہ طریقوں میں JazzCash، EasyPaisa، Ufone Pay، بینک ٹرانسفرز (تمام بڑے پاکستانی بینک) اور ہمارا محفوظ ایپ میں والٹ شامل ہیں۔ بزنس اکاؤنٹس کے لیے، ہم براہ راست بینک ٹرانسفرز اور انوائس پر مبنی ادائیگیاں بھی سپورٹ کرتے ہیں۔ تمام لین دین محفوظ طریقے سے انکرپٹ اور PCI-DSS مطابقت والے ادائیگی گیٹ وے کے ذریعے پروسیس کیے جاتے ہیں۔',
'richtext', 8),

('pricing', 'faq_4_title',
'Can I cancel a booking? What is the refund policy?',
'کیا میں بکنگ منسوخ کر سکتا ہوں؟ ریفنڈ پالیسی کیا ہے؟',
'text', 9),

('pricing', 'faq_4_answer',
'Yes, both workers and employers can cancel bookings subject to our cancellation policy. If you cancel at least 4 hours before the scheduled job time, there is no cancellation fee. Cancellations made within 4 hours of the scheduled time may incur a small fee to compensate the other party for their time. If the work is not completed to the agreed standards, employers can raise a dispute within 48 hours for a full or partial refund. Our dedicated dispute resolution team reviews each case fairly and promptly.',
'جی ہاں، مزدور اور آجر دونوں ہماری منسوخی کی پالیسی کے تحت بکنگز منسوخ کر سکتے ہیں۔ اگر آپ طے شدہ وقت سے کم از کم 4 گھنٹے پہلے منسوخ کریں تو کوئی منسوخی فیس نہیں ہے۔ طے شدہ وقت سے 4 گھنٹے کے اندر کی گئی منسوخیوں پر دوسرے فریق کے وقت کے لیے معاوضہ دینے کے لیے چھوٹی فیس لگ سکتی ہے۔ اگر کام متفقہ معیار کے مطابق مکمل نہیں ہوا تو آجروں کو مکمل یا جزوی ریفنڈ کے لیے 48 گھنٹے کے اندر تنازع raise کر سکتے ہیں۔ ہماری مخصوص تنازع کے حل کرنے والی ٹیم ہر کیس کا منصفانہ اور جلد جائزہ لیتی ہے۔',
'richtext', 10),

('pricing', 'faq_5_title',
'Are there special plans for businesses and contractors?',
'کیا کاروبار اور ٹھیکیداروں کے لیے خاص پلانز ہیں؟',
'text', 11),

('pricing', 'faq_5_answer',
'Absolutely! We offer tailored Enterprise plans for construction companies, property managers, maintenance firms, and contractors who need to manage multiple workers and jobs. Enterprise plans include features like team management dashboards, bulk booking capabilities, dedicated account managers, priority customer support, custom reporting and analytics, API access for integration with existing systems, and volume-based discounts. Contact our sales team for a customized quote that fits your business needs.',
'بالکل! ہم تعمیراتی کمپنیوں، پراپرٹی مینیجرز، میںٹیننس فرمز اور ٹھیکیداروں کے لیے ٹیلر شدہ انٹرپرائز پلانز پیش کرتے ہیں جنہیں متعدد مزدوروں اور کاموں کے انتظام کی ضرورت ہوتی ہے۔ انٹرپرائز پلانز میں ٹیم مینیجمنٹ ڈیش بورڈز، بلک بکنگ کی صلاحیتیں، مخصوص اکاؤنٹ مینیجرز، ترجیحی کسٹمر سپورٹ، کسٹم ریپورٹنگ اور اینالٹکس، موجودہ سسٹمز کے ساتھ انٹیگریشن کے لیے API رسائی اور والیوم پر مبنی رعایت شامل ہیں۔ اپنے کاروباری ضروریات کے مطابق حسب ضرورت کوٹ کے لیے ہماری سیلز ٹیم سے رابطہ کریں۔',
'richtext', 12);


-- ============================================================================
-- CONTACT PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('contact', 'hero_title',
'Contact Us - We Are Here to Help',
'ہم سے رابطہ کریں - ہم مدد کے لیے یہاں ہیں',
'text', 1),

('contact', 'hero_subtitle',
'Have a question, feedback, or need assistance? Our dedicated support team is available to help you. Reach out to us through any of the channels below and we will get back to you as soon as possible.',
'کوئی سوال، فیڈ بیک یا مدد چاہیے؟ ہماری پرعزم سپورٹ ٹیم آپ کی مدد کے لیے دستیاب ہے۔ نیچے دی گئی کسی بھی چینل کے ذریعے ہم سے رابطہ کریں اور ہم جلد از جلد آپ کو جواب دیں گے۔',
'text', 2),

('contact', 'office_address',
'MazdoorPing Headquarters, 3rd Floor, Techno Hub Tower, Blue Area, Jinnah Avenue, Islamabad, Pakistan',
'مزدور پنگ ہیڈکوارٹرز، تیسر منزل، ٹیکنو ہب ٹاور، بلو ایریا، جناح ایونیو، اسلام آباد، پاکستان',
'text', 3),

('contact', 'phone',
'+92 51 123 4567',
'+92 51 123 4567',
'text', 4),

('contact', 'email',
'support@mazdoording.pk',
'support@mazdoording.pk',
'text', 5),

('contact', 'whatsapp',
'+92 300 1234567',
'+92 300 1234567',
'text', 6),

('contact', 'business_hours',
'Monday to Friday: 9:00 AM - 6:00 PM (PKT), Saturday: 10:00 AM - 4:00 PM (PKT), Sunday: Closed (Emergency support available 24/7)',
'پیر تا جمعہ: صبح 9:00 بجے - شام 6:00 بجے (PKT)، ہفتہ: صبح 10:00 بجے - شام 4:00 بجے (PKT)، اتوار: بند (ایمرجنسی سپورٹ 24/7 دستیاب)',
'text', 7),

('contact', 'social_facebook',
'https://facebook.com/mazdoording',
'https://facebook.com/mazdoording',
'text', 8),

('contact', 'social_instagram',
'https://instagram.com/mazdoording',
'https://instagram.com/mazdoording',
'text', 9),

('contact', 'social_twitter',
'https://twitter.com/mazdoording',
'https://twitter.com/mazdoording',
'text', 10),

('contact', 'social_linkedin',
'https://linkedin.com/company/mazdoording',
'https://linkedin.com/company/mazdoording',
'text', 11),

('contact', 'social_youtube',
'https://youtube.com/@mazdoording',
'https://youtube.com/@mazdoording',
'text', 12),

('contact', 'support_title',
'Customer Support',
'کسٹمر سپورٹ',
'text', 13),

('contact', 'support_desc',
'Our customer support team is dedicated to ensuring you have the best experience on MazdoorPing. Whether you need help setting up your profile, understanding our features, resolving a dispute, or have a general inquiry, we are here for you. For urgent matters, use our in-app SOS feature or call our emergency hotline. For general inquiries, you can reach us via email, WhatsApp, or through the contact form. We aim to respond to all inquiries within 24 hours during business days.',
'ہماری کسٹمر سپورٹ ٹیم یقینی بناتی ہے کہ آپ کو مزدور پنگ پر بہترین تجربہ ملی۔ چاہے آپ کو اپنا پروفائل سیٹ اپ کرنے، ہماری خصوصیات کو سمجھنے، تنازع حل کرنے یا عام سوال کی مدد چاہیے، ہم آپ کے لیے یہاں ہیں۔ فوری معاملات کے لیے، ہمارے ایپ میں ایس او ایس فیچر استعمال کریں یا ہماری ایمرجنسی ہاٹ لائن پر کال کریں۔ عام سوالات کے لیے، آپ ای میل، واٹس ایپ یا رابطہ فارم کے ذریعے ہم تک پہنچ سکتے ہیں۔ ہمارا ہدف کاروباری دنوں کے دوران تمام سوالات کے جواب 24 گھنٹے کے اندر دینا ہے۔',
'richtext', 14);


-- ============================================================================
-- TERMS PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('terms', 'page_title',
'Terms and Conditions',
'شرائط و ضوابط',
'text', 1),

('terms', 'effective_date',
'January 1, 2025',
'1 جنوری 2025',
'text', 2),

('terms', 'section_1_title',
'1. Acceptance of Terms',
'1. شرائط کی قبولیت',
'text', 3),

('terms', 'section_1_content',
'By accessing or using the MazdoorPing platform (website and mobile application), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms constitute a legally binding agreement between you and MazdoorPing (referred to as "the Platform," "we," "us," or "our").

MazdoorPing reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on the platform. Your continued use of the platform after any changes constitutes your acceptance of the revised terms. We encourage you to review these terms periodically to stay informed of any updates.

These terms apply to all users of the platform, including workers, employers, and visitors. By creating an account or using any of our services, you confirm that you are at least 18 years of age and have the legal capacity to enter into this agreement.',
'مزدور پنگ پلیٹ فارم (ویب سائٹ اور موبائل ایپلیکیشن) تک رسائی حاصل کرنے یا استعمال کرنے کے ذریعے، آپ ان شرائط و ضوابط سے منسلک ہونے پر متفق ہیں۔ اگر آپ ان شرائط سے متفق نہیں ہیں تو براہ کرم ہماری خدمات استعمال نہ کریں۔ یہ شرائط آپ اور مزدور پنگ (جسے "پلیٹ فارم"، "ہم"، "ہماری" یا "ہمارا" کہا جاتا ہے) کے درمیان ایک قانونی طور پر پابند معاہدہ تشکیل دیتے ہیں۔

مزدور پنگ کو کسی بھی وقت ان شرائط میں ترمیم کرنے کا حق محفوظ ہے۔ تبدیلیاں پلیٹ فارم پر پوسٹنگ کے فوراً بعد موثر ہوں گی۔ کسی بھی تبدیلی کے بعد پلیٹ فارم کا آپ کا مستقل استعمال تبدیل شدہ شرائط کی آپ کی قبولیت کی نشاندہی کرتا ہے۔ ہم آپ کو کسی بھی اپ ڈیٹ سے آگاہ رہنے کے لیے ان شرائط کا وقتاً فوقتاً جائزہ لینے کی ترغیب دیتے ہیں۔

یہ شرائط پلیٹ فارم کے تمام صارفین پر لاگو ہوتے ہیں، بشمول مزدوروں، آجروں اور زائرین۔ اکاؤنٹ بنانے یا ہماری کسی بھی سروس کا استعمال کرنے کے ذریعے، آپ تصدیق کرتے ہیں کہ آپ کم از کم 18 سال کے ہیں اور اس معاہدے میں داخل ہونے کی قانونی صلاحیت رکھتے ہیں۔',
'richtext', 4),

('terms', 'section_2_title',
'2. User Accounts',
'2. صارف اکاؤنٹس',
'text', 5),

('terms', 'section_2_content',
'To use most features of MazdoorPing, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.

Each person may maintain only one active account. Creating multiple accounts is strictly prohibited and may result in suspension or termination of all associated accounts. You must not use another person''s account without their explicit permission.

MazdoorPing reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activities, or pose a threat to the safety of other users. Account verification may be required for certain features, and providing false information during verification will result in immediate account termination.',
'مزدور پنگ کی زیادہ تر خصوصیات استعمال کرنے کے لیے، آپ کو ایک اکاؤنٹ بنانا ہوگا۔ آپ اپنے اکاؤنٹ کی اسناد کی رازداری کی ذمہ داری اور اپنے اکاؤنٹ کے تحت ہونے والی تمام سرگرمیوں کے لیے ذمہ دار ہیں۔ آپ رجسٹریشن کے دوران درست، موجودہ اور مکمل معلومات فراہم کرنے پر متفق ہیں اور ضرورت کے مطابق ایسی معلومات کو اپ ڈیٹ کرنے پر متفق ہیں۔

ہر شخص صرف ایک فعال اکاؤنٹ رکھ سکتا ہے۔ متعدد اکاؤنٹس بنانا سخت طور پر منع ہے اور اس کے نتیجے میں تمام متعلقہ اکاؤنٹس کی معطلی یا خاتمہ ہو سکتا ہے۔ آپ کسی دوسرے شخص کے اکاؤنٹ کو اس کی واضح اجازت کے بغیر استعمال نہیں کر سکتے۔

مزدور پنگ کو ان شرائط کی خلاف ورزی کرنے، دھوکہ دہی کی سرگرمیوں میں ملوث ہونے یا دوسرے صارفین کی حفاظت کو خطرہ لگانے والے اکاؤنٹس کو معطل کرنے یا ختم کرنے کا حق محفوظ ہے۔ مخصوص خصوصیات کے لیے اکاؤنٹ کی تصدیق درکار ہو سکتی ہے اور تصدیق کے دوران غلط معلومات فراہم کرنے کے نتیجے میں فوری اکاؤنٹ کا خاتمہ ہوگا۔',
'richtext', 6),

('terms', 'section_3_title',
'3. Services',
'3. خدمات',
'text', 7),

('terms', 'section_3_content',
'MazdoorPing provides an online marketplace platform that connects skilled workers with employers seeking their services. We act as an intermediary and do not directly employ workers or guarantee the outcome of any job or service arrangement made through the platform.

The platform facilitates communication, job postings, worker discovery, booking management, and payment processing. However, MazdoorPing does not guarantee the quality, legality, or suitability of any services offered by workers on the platform. Users are encouraged to review profiles, ratings, and reviews before engaging any worker or accepting any job.

We strive to maintain a reliable platform but do not warrant that the service will be uninterrupted, error-free, or free of harmful components. Scheduled maintenance and unexpected outages may occur, and we will make reasonable efforts to provide advance notice of any planned disruptions.',
'مزدور پنگ ایک آن لائن مارکیٹ پلیس پلیٹ فارم فراہم کرتا ہے جو ماہر مزدوروں کو ان کی خدمات تلاش کرنے والے آجروں سے جوڑتا ہے۔ ہم ایک درمیانی کردار ادا کرتے ہیں اور براہ راست مزدوروں کو ملازمت نہیں دیتے یا پلیٹ فارم کے ذریعے کی گئی کسی بھی کام یا سروس کے انتظام کے نتیجے کی ضمانت نہیں دیتے۔

پلیٹ فارم بات چیت، کام پوسٹنگز، مزدور ڈسکوری، بکنگ مینیجمنٹ اور ادائیگی پروسیسنگ کو آسان بناتا ہے۔ تاہم، مزدور پنگ پلیٹ فارم پر مزدوروں کی پیش کردہ کسی بھی سروس کے معیار، قانونیت یا موزونیت کی ضمانت نہیں دیتا۔ صارفین کو کسی بھی مزدور کو ملازمت دینے یا کوئی کام قبول کرنے سے پہلے پروفائلز، ریٹنگز اور ریویوز کا جائزہ لینے کی ترغیب دی جاتی ہے۔

ہم ایک قابل اعتماد پلیٹ فارم برقرار رکھنے کی کوشش کرتے ہیں لیکن یہ وارنٹی نہیں دیتے کہ سروس بے وقفہ، غلطی سے پاک یا نقصان دہ اجزاء سے پاک ہوگی۔ طے شدہ میںٹیننس اور غیر متوقع آؤٹیجز واقع ہو سکتے ہیں اور ہم کسی بھی منصوبہ بندی کی گئی رکاوٹوں کے بارے میں پہلے سے اطلاع دینے کے لیے منطقی کوششیں کریں گے۔',
'richtext', 8),

('terms', 'section_4_title',
'4. Payments',
'4. ادائیگیاں',
'text', 9),

('terms', 'section_4_content',
'All payments for services arranged through MazdoorPing are processed through our secure payment system. When an employer books a service, the payment amount is held in escrow until the job is completed and confirmed. Payments may be made through JazzCash, EasyPaisa, bank transfer, or the in-app wallet.

MazdoorPing charges a service fee for facilitating transactions. The current fee structure is available on our pricing page and may be updated from time to time. Workers will receive their earnings after the deduction of applicable service fees. Payments are typically processed within 24-48 hours of job completion confirmation.

Employers are obligated to pay the agreed-upon amount for completed work. Failure to pay, fraudulent chargebacks, or unjustified disputes may result in account suspension and legal action. Refunds are subject to our refund policy and will be assessed on a case-by-case basis by our dispute resolution team.',
'مزدور پنگ کے ذریعے ترتیب دی گئی تمام خدمات کے لیے ادائیگیاں ہمارے محفوظ ادائیگی سسٹم کے ذریعے پروسیس کی جاتی ہیں۔ جب آجر سروس بک کرتا ہے تو ادائیگی کی رقم اسکیرو میں رکھی جاتی ہے جب تک کام مکمل اور تصدیق نہ ہو جائے۔ ادائیگیاں JazzCash، EasyPaisa، بینک ٹرانسفر یا ایپ میں والٹ کے ذریعے کی جا سکتی ہیں۔

مزدور پنگ لین دین کو آسان بنانے کے لیے سروس فیس وصول کرتا ہے۔ موجودہ فیس کا ڈھانچہ ہماری قیمتوں کے صفحے پر دستیاب ہے اور وقتاً فوقتاً اپ ڈیٹ کیا جا سکتا ہے۔ مزدوروں کو لاگو سروس فیس کی کٹوتی کے بعد اپنی کمائی موصول ہوگی۔ ادائیگیاں عام طور پر کام مکمل ہونے کی تصدیق کے 24-48 گھنٹے کے اندر پروسیس کی جاتی ہیں۔

آجروں مکمل کیے گئے کام کے لیے متفقہ رقم ادا کرنے کا فرض ہے۔ ادائیگی نہ کرنا، دھوکہ دہی چارج بیک یا غیر منصفانہ تنازعات کے نتیجے میں اکاؤنٹ کی معطلی اور قانونی کارروائی ہو سکتی ہے۔ ریفنڈز ہماری ریفنڈ پالیسی کے تابع ہیں اور ہمارے تنازع کے حل کرنے والی ٹیم کے ذریعے کیس بہ کیس کی بنیاد پر جائزہ لیا جائے گا۔',
'richtext', 10),

('terms', 'section_5_title',
'5. Worker Obligations',
'5. مزدور کے فرائض',
'text', 11),

('terms', 'section_5_content',
'Workers using the MazdoorPing platform agree to the following obligations:

Provide accurate and truthful information in their profiles, including skills, experience, certifications, and availability.

Perform all contracted work with professional skill, care, and diligence, meeting industry standards and any specific requirements agreed upon with the employer.

Arrive on time for scheduled jobs and provide advance notice (at least 4 hours) if unable to attend due to unforeseen circumstances.

Maintain professional conduct at all times when interacting with employers and other users on the platform.

Not engage in any illegal, fraudulent, or harmful activities while using the platform.

Not solicit or accept direct payments outside of the MazdoorPing payment system for jobs arranged through the platform.

Comply with all applicable laws, regulations, and safety standards while performing work arranged through the platform.',
'مزدور پنگ پلیٹ فارم استعمال کرنے والے مزدور مندرجہ ذیل فرائض سے اتفاق کرتے ہیں:

اپنے پروفائلز میں درست اور سچی معلومات فراہم کریں، بشمول مہارت، تجربہ، سرٹیفکیٹس اور دستیابی۔

تمام معاہدہ شدہ کام کو پیشہ ورانہ مہارت، دیکھ بھال اور محنت سے انجام دیں، صنعتی معیارات اور آجر کے ساتھ متفقہ کسی بھی مخصوص ضروریات کو پورا کریں۔

طے شدہ کام کے لیے وقت پر پہنچیں اور غیر متوقع حالات کی وجہ سے شرکت نہ کر سکنے کی صورت میں کم از کم 4 گھنٹے پہلے اطلاع دیں۔

پلیٹ فارم پر آجروں اور دوسرے صارفین کے ساتھ تعامل میں ہمیشہ پیشہ ورانہ رویہ برقرار رکھیں۔

پلیٹ فارم استعمال کرتے وقت کوئی بھی غیر قانونی، دھوکہ دہی یا نقصان دہ سرگرمیوں میں ملوث نہ ہوں۔

پلیٹ فارم کے ذریعے ترتیب دیے گئے کاموں کے لیے مزدور پنگ ادائیگی سسٹم سے باہر براہ راست ادائیگی کی درخواست یا قبول نہ کریں۔

پلیٹ فارم کے ذریعے ترتیب دیے گئے کام انجام دیتے وقت تمام لاگو قوانین، ضوابط اور حفاظتی معیارات کی تعمیل کریں۔',
'richtext', 12),

('terms', 'section_6_title',
'6. Employer Obligations',
'6. آجر کے فرائض',
'text', 13),

('terms', 'section_6_content',
'Employers using the MazdoorPing platform agree to the following obligations:

Provide accurate job descriptions, including the scope of work, expected timelines, and any specific requirements.

Treat all workers with respect, dignity, and professionalism, providing a safe and appropriate working environment.

Pay the agreed-upon amount in full and on time through the MazdoorPing platform for all completed work.

Not engage in harassment, discrimination, or any form of misconduct towards workers or other platform users.

Provide honest and fair ratings and reviews based on actual experience with the worker.

Not circumvent the platform to arrange work directly with workers met through MazdoorPing without paying applicable service fees.

Comply with all applicable labor laws, safety regulations, and legal requirements when engaging workers through the platform.',
'مزدور پنگ پلیٹ فارم استعمال کرنے والے آجروں مندرجہ ذیل فرائض سے اتفاق کرتے ہیں:

درست کام کی تفصیلات فراہم کریں، بشمول کام کی حد، متوقع ٹائم لائنز اور کسی بھی مخصوص ضروریات۔

تمام مزدوروں کے ساتھ احترام، عزت اور پیشہ ورانہ رویے سے پیش آئیں، محفوظ اور مناسب کام کا ماحول فراہم کریں۔

تمام مکمل کیے گئے کام کے لیے متفقہ رقم کو مکمل اور وقت پر مزدور پنگ پلیٹ فارم کے ذریعے ادا کریں۔

مزدوروں یا دوسرے پلیٹ فارم صارفین کے ساتھ ہراسانی، تفریق یا بدتمیزی کے کسی بھی قسم سے پرہیز کریں۔

مزدور کے ساتھ اصل تجربے کی بنیاد پر سچے اور منصفانہ ریٹنگز اور ریویوز فراہم کریں۔

مزدور پنگ کے ذریعے ملنے والے مزدوروں کے ساتھ لاگو سروس فیس ادا کیے بغیر براہ راست کام کا انتظام کرنے کے لیے پلیٹ فارم کو بائی پاس نہ کریں۔

پلیٹ فارم کے ذریعے مزدوروں کو ملازمت دیتے وقت تمام لاگو محنت کے قوانین، حفاظتی ضوابط اور قانونی ضروریات کی تعمیل کریں۔',
'richtext', 14),

('terms', 'section_7_title',
'7. Limitation of Liability',
'7. ذمہ داری کی حد',
'text', 15),

('terms', 'section_7_content',
'To the maximum extent permitted by applicable law, MazdoorPing and its directors, employees, partners, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of or inability to use the platform.

MazdoorPing does not guarantee the accuracy of user-provided information, the quality of services provided by workers, or the reliability of employers using the platform. Users acknowledge that they use the platform at their own risk and should exercise due diligence before entering into any work arrangement.

Our total liability for any claim arising from or related to these terms or your use of the platform shall not exceed the amount of fees you have paid to MazdoorPing in the twelve (12) months preceding the claim. This limitation applies regardless of the legal theory on which the claim is based.',
'قابل اطلاق قانون کی زیادہ سے زیادہ حد تک، مزدور پنگ اور اس کے ڈائریکٹرز، ملازمین، پارٹنرز، ایجنٹس اور افیلی ایٹس کسی بھی بالواسطہ، ضمنی، خاص، نتیجہ خیز یا سزا کے نقصان کے لیے ذمہ دار نہیں ہوں گے، بشمول منافع، ڈیٹا، استعمال، عمدگی یا دوسرے نامادی نقصان کے نقصان کے لیے، جو آپ کے پلیٹ فارم کے استعمال یا استعمال نہ کر پانے کے نتیجے میں پیدا ہوتے ہیں۔

مزدور پنگ صارف فراہم کردہ معلومات کی درستی، مزدوروں کی فراہم کردہ خدمات کے معیار یا پلیٹ فارم استعمال کرنے والے آجروں کی قابل اعتمادی کی ضمانت نہیں دیتا۔ صارفین تسلیم کرتے ہیں کہ وہ پلیٹ فارم کو اپنے خطرے پر استعمال کر رہے ہیں اور کام کے کسی بھی انتظام میں داخل ہونے سے پہلے مناسب احتیاط برتنا چاہیے۔

ان شرائط یا آپ کے پلیٹ فارم کے استعمال سے پیدا ہونے والے کسی بھی دعوے کے لیے ہماری کل ذمہ داری دعوے سے پہلے کے بارہ (12) مہینوں میں آپ کے ذریعے مزدور پنگ کو ادا کی گئی فیس کی رقم سے تجاوز نہیں کرے گی۔ یہ حد کے بغیر لاگو ہوتی ہے کہ دعوا کس قانونی نظریے پر مبنی ہے۔',
'richtext', 16),

('terms', 'section_8_title',
'8. Governing Law',
'8. حاکم قانون',
'text', 17),

('terms', 'section_8_content',
'These Terms and Conditions shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts of Islamabad Capital Territory, Pakistan.

Before initiating any legal proceedings, you agree to attempt to resolve any dispute through our internal dispute resolution process. This includes contacting our support team, providing all relevant documentation, and allowing a reasonable period for resolution.

If any provision of these terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The failure of MazdoorPing to enforce any right or provision of these terms shall not constitute a waiver of such right or provision.',
'یہ شرائط و ضوابط اسلامی جمہوریہ پاکستان کے قوانین کے مطابق ہوں گی اور ان کی تشریح کی جائے گی۔ ان شرائط سے پیدا ہونے والے یا ان سے متعلق کسی بھی تنازع کا دعوہ پاکستان کے اسلام آباد دارالحکومت کے عدالتوں کی خصوصی اختیار کا تابع ہوگا۔

کسی بھی قانونی کارروائی شروع کرنے سے پہلے، آپ ہماری اندرونی تنازع کے حل کے عمل کے ذریعے کسی بھی تنازع کو حل کرنے کی کوشش کرنے پر متفق ہیں۔ اس میں ہماری سپورٹ ٹیم سے رابطہ کرنا، تمام متعلقہ دستاویزات فراہم کرنا اور حل کے لیے ایک منطقی مدت کی اجازت دینا شامل ہے۔

اگر ان شرائط کی کوئی ترمیم کسی عدالت کے ذریعے نافذ نہیں کی جا سکتی یا غیر معتبر پائی جاتی ہے تو باقی ترمیم مکمل طاقت اور اثر کے ساتھ جاری رہے گی۔ مزدور پنگ کا ان شرائط کے کسی بھی حق یا ترمیم کا نفاذ نہ کرنا اس حق یا ترمیم کی چھوٹ نہیں ہوگا۔',
'richtext', 18);


-- ============================================================================
-- PRIVACY PAGE
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('privacy', 'page_title',
'Privacy Policy',
'رازداری کی پالیسی',
'text', 1),

('privacy', 'effective_date',
'January 1, 2025',
'1 جنوری 2025',
'text', 2),

('privacy', 'section_1_title',
'1. Information We Collect',
'1. معلومات جو ہم جمع کرتے ہیں',
'text', 3),

('privacy', 'section_1_content',
'MazdoorPing collects the following types of information to provide and improve our services:

Personal Information: When you create an account, we collect your name, email address, phone number, profile photo, CNIC number (for verification purposes), date of birth, gender, and location information.

Professional Information: For workers, we collect trade category, skills, certifications, work experience, portfolio photos, availability schedule, and hourly or project-based rates. For employers, we collect company name, business type, industry, and hiring preferences.

Usage Information: We automatically collect information about how you interact with our platform, including pages visited, features used, search queries, booking history, device information, IP address, browser type, and operating system.

Location Data: With your consent, we collect and use your GPS location to provide location-based services such as finding nearby workers or jobs, and for safety features like SOS alerts and job tracking.',
'مزدور پنگ اپنی خدمات فراہم کرنے اور بہتر بنانے کے لیے درج ذیل اقسام کی معلومات جمع کرتا ہے:

ذاتی معلومات: جب آپ اکاؤنٹ بناتے ہیں، ہم آپ کا نام، ای میل پتہ، فون نمبر، پروفائل تصویر، شناختی کارڈ نمبر (تصدیقی مقاصد کے لیے)، تاریخ پیدائش، جنس اور مقام کی معلومات جمع کرتے ہیں۔

پیشہ ورانہ معلومات: مزدوروں کے لیے، ہم ٹریڈ زمرے، مہارت، سرٹیفکیٹس، کام کا تجربہ، پورٹ فولیو تصاویر، دستیابی کا شیڈول اور گھنٹہ وار یا پراجیکٹ پر مبنی شرحوں کو جمع کرتے ہیں۔ آجروں کے لیے، ہم کمپنی کا نام، کاروبار کی قسم، انڈسٹری اور ملازمت کی ترجیحات جمع کرتے ہیں۔

استعمال کی معلومات: ہم خود بخود آپ کے پلیٹ فارم کے ساتھ تعامل کے بارے میں معلومات جمع کرتے ہیں، بشمول دیکھے گئے صفحات، استعمال شدہ خصوصیات، تلاش کے سوالات، بکنگ کی تاریخ، ڈیوائس کی معلومات، IP پتہ، براؤزر کی قسم اور آپریٹنگ سسٹم۔

مقام کا ڈیٹا: آپ کی رضامندی کے ساتھ، ہم آپ کا GPS مقام مقام پر مبنی خدمات فراہم کرنے کے لیے جمع اور استعمال کرتے ہیں جیسے قریبی مزدور یا کام تلاش کرنا اور حفاظتی خصوصیات جیسے SOS الرٹس اور جاب ٹریکنگ۔',
'richtext', 4),

('privacy', 'section_2_title',
'2. How We Use Your Information',
'2. ہم آپ کی معلومات کیسے استعمال کرتے ہیں',
'text', 5),

('privacy', 'section_2_content',
'We use the information we collect for the following purposes:

Service Delivery: To provide, maintain, and improve our platform, process transactions, facilitate communication between workers and employers, and deliver customer support.

Matching and Recommendations: To match workers with relevant jobs and employers with suitable workers using our AI-powered recommendation engine.

Safety and Security: To verify user identities, prevent fraud and unauthorized access, operate our SOS safety features, and protect the security of our platform and users.

Communication: To send you important notifications about your account, bookings, payments, and platform updates. With your consent, we may also send promotional communications about new features and offers.

Analytics and Improvement: To analyze platform usage patterns, identify trends, and make data-driven decisions to improve our services and user experience.

Legal Compliance: To comply with applicable laws, regulations, and legal processes, and to enforce our terms and policies.',
'ہم اپنے ذریعے جمع کی گئی معلومات مندرجہ ذیل مقاصد کے لیے استعمال کرتے ہیں:

سروس ڈیلیوری: ہمارے پلیٹ فارم کو فراہم کرنے، برقرار رکھنے اور بہتر بنانے، لین دین پروسیس کرنے، مزدوروں اور آجروں کے درمیان بات چیت کو آسان بنانے اور کسٹمر سپورٹ فراہم کرنے کے لیے۔

میچنگ اور سفارشات: ہمارے AI پر مبنی سفارش انجن کا استعمال کرتے ہوئے مزدوروں کو متعلقہ کاموں اور آجروں کو موزوں مزدوروں کے ساتھ میچ کرنے کے لیے۔

حفاظت اور سیکیورٹی: صارف کی شناخت کی تصدیق کرنے، دھوکہ دہی اور غیر مجاز رسائی سے بچانے، ہمارے SOS حفاظتی خصوصیات کو چلانے اور ہمارے پلیٹ فارم اور صارفین کی سیکیورٹی کی حفاظت کرنے کے لیے۔

مواصلت: آپ کو آپ کے اکاؤنٹ، بکنگز، ادائیگی اور پلیٹ فارم اپ ڈیٹس کے بارے میں اہم نوٹیفکیشنز بھیجنے کے لیے۔ آپ کی رضامندی کے ساتھ، ہم نئی خصوصیات اور پیشکشوں کے بارے میں پروموشنل مواصلات بھی بھیج سکتے ہیں۔

اینالٹکس اور بہتری: پلیٹ فارم استعمال کے نمونوں کا تجزیہ کرنے، رجحانات کی شناخت کرنے اور ہماری خدمات اور صارف کے تجربے کو بہتر بنانے کے لیے ڈیٹا پر مبنی فیصلے کرنے کے لیے۔

قانونی تعمیل: لاگو قوانین، ضوابط اور قانونی عمل کی تعمیل کرنے اور ہماری شرائط اور پالیسیوں کو نافذ کرنے کے لیے۔',
'richtext', 6),

('privacy', 'section_3_title',
'3. Data Sharing',
'3. ڈیٹا شیئرنگ',
'text', 7),

('privacy', 'section_3_content',
'We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:

With Other Users: When you use our platform, your profile information (name, trade category, ratings, reviews, and location) is visible to other users to facilitate job matching and communication. Phone numbers and email addresses are shared only when both parties agree to a booking.

Service Providers: We may share information with trusted third-party service providers who help us operate our platform, including payment processors, cloud hosting providers, SMS and email service providers, and analytics tools. These providers are contractually obligated to protect your data.

Legal Requirements: We may disclose your information if required to do so by law, in response to a valid legal request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.

Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction. We will notify you of any such change and your choices regarding your information.',
'ہم آپ کی ذاتی معلومات تھرڈ پارٹیوں کو فروخت، تجارت یا کرایہ نہیں دیتے۔ ہم آپ کی معلومات درج ذیل محدود حالات میں شیئر کر سکتے ہیں:

دوسرے صارفین کے ساتھ: جب آپ ہمارے پلیٹ فارم استعمال کرتے ہیں تو آپ کی پروفائل معلومات (نام، ٹریڈ زمرے، ریٹنگ، ریویوز اور مقام) دوسرے صارفین کے لیے کام کی میچنگ اور مواصلت کو آسان بنانے کے لیے نظر آتی ہیں۔ فون نمبر اور ای میل پتہ صرف تب شیئر کیے جاتے ہیں جب دونوں فریق بکنگ پر متفق ہوں۔

سروس پرووڈرز: ہم ان قابل اعتماد تھرڈ پارٹی سروس پرووڈرز کے ساتھ معلومات شیئر کر سکتے ہیں جو ہمارے پلیٹ فارم کو چلانے میں مدد کرتے ہیں، بشمول ادائیگی پروسیسرز، کلاؤڈ ہوسٹنگ پرووڈرز، SMS اور ای میل سروس پرووڈرز اور اینالٹکس ٹولز۔ یہ پرووڈرز کنٹریکچوالی طور پر آپ کے ڈیٹا کی حفاظت کے پابند ہیں۔

قانونی ضروریات: ہم آپ کی معلومات کا انکشاف کر سکتے ہیں اگر قانونی طور پر ایسا کرنے کی ضرورت ہو، کسی قابل قانونی درخواست کے جواب میں، یا جب ہم یقین رکھتے ہیں کہ انکشاف ہمارے حقوق، آپ کی حفاظت یا دوسروں کی حفاظت کے لیے ضروری ہے۔

کاروباری منتقلی: ادغام، حصول یا اثاثوں کی فروخت کے واقعے میں، آپ کی معلومات لین دین کے حصے کے طور پر منتقل کی جا سکتی ہیں۔ ہم آپ کو ایسی کسی بھی تبدیلی اور آپ کی معلومات کے بارے میں آپ کے انتخابوں سے آگاہ کریں گے۔',
'richtext', 8),

('privacy', 'section_4_title',
'4. Data Security',
'4. ڈیٹا سیکیورٹی',
'text', 9),

('privacy', 'section_4_content',
'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:

Encryption: All data transmitted between your device and our servers is encrypted using TLS/SSL protocols. Sensitive data such as passwords and payment information is encrypted at rest using AES-256 encryption.

Access Controls: We implement strict access controls and authentication mechanisms to ensure that only authorized personnel can access user data. All access is logged and regularly audited.

Infrastructure Security: Our servers are hosted on secure cloud infrastructure with firewalls, intrusion detection systems, and regular security assessments. We maintain a comprehensive incident response plan for potential security breaches.

While we employ robust security measures, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, and you acknowledge that you provide your information at your own risk.',
'ہم غیر مجاز رسائی، تبدیلی، انکشاف یا تباہی سے آپ کی ذاتی معلومات کی حفاظت کے لیے انڈسٹری معیار کی سیکیورٹی اقدامات نافذ کرتے ہیں۔ یہ اقدامات شامل ہیں:

انکرپشن: آپ کے ڈیوائس اور ہمارے سرورز کے درمیان منتقل کیا گیا تمام ڈیٹا TLS/SSL پروٹوکولز کا استعمال کرتے ہوئے انکرپٹ کیا جاتا ہے۔ حساس ڈیٹا جیسے پاس ورڈز اور ادائیگی کی معلومات کو AES-256 انکرپشن کا استعمال کرتے ہوئے انکرپٹ کیا جاتا ہے۔

رسائی کے کنٹرولز: ہم یقینی بناتے ہیں کہ صرف مجاز عملہ صارف ڈیٹا تک رسائی حاصل کر سکے کے لیے سخت رسائی کنٹرولز اور تصدیق کے mechanism نافذ کرتے ہیں۔ تمام رسائی لاگ کی جاتی ہے اور باقاعدگی سے آڈٹ ہوتی ہے۔

انفراسٹرکچر سیکیورٹی: ہمارے سرورز فائر والز، انٹروژن ڈیٹیکشن سسٹمز اور باقاعدہ سیکیورٹی جائزوں کے ساتھ محفوظ کلاؤڈ انفراسٹرکچر پر ہوسٹ ہیں۔ ہم ممکنہ سیکیورٹی بریچ کے لیے ایک جامع واقعہ کے جواب کا منصوبہ برقرار رکھتے ہیں۔

جبکہ ہم مضبوط سیکیورٹی اقدامات استعمال کرتے ہیں، انٹرنیٹ پر منتقلی یا الیکٹرانک ذخیرہ کا کوئی بھی طریقہ 100% محفوظ نہیں ہے۔ ہم مکمل سیکیورٹی کی ضمانت نہیں دے سکتے اور آپ تسلیم کرتے ہیں کہ آپ اپنی معلومات اپنے خطرے پر فراہم کرتے ہیں۔',
'richtext', 10),

('privacy', 'section_5_title',
'5. Cookies and Tracking',
'5. کوکیز اور ٹریکنگ',
'text', 11),

('privacy', 'section_5_content',
'MazdoorPing uses cookies, web beacons, and similar tracking technologies to enhance your experience on our platform:

Essential Cookies: These are required for the platform to function properly, including session management, authentication, and security features. These cannot be disabled.

Performance Cookies: These help us understand how users interact with our platform, collect information about pages visited, and identify performance issues. This data is aggregated and anonymized.

Functionality Cookies: These remember your preferences and settings, such as language preference, location settings, and display preferences, to provide a more personalized experience.

Marketing Cookies: With your consent, these cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. You can opt out of marketing cookies at any time through your browser settings.

You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform.',
'مزدور پنگ آپ کے تجربے کو بہتر بنانے کے لیے کوکیز، ویب بیکنز اور مماثل ٹریکنگ ٹیکنالوجیز استعمال کرتا ہے:

بنیادی کوکیز: یہ پلیٹ فارم کے درست طریقے سے کام کرنے کے لیے ضروری ہیں، بشمول سیشن مینیجمنٹ، تصدیق اور سیکیورٹی خصوصیات۔ انہیں غیر فعال نہیں کیا جا سکتا۔

پرفارمنس کوکیز: یہ ہمیں سمجھنے میں مدد کرتی ہیں کہ صارفین ہمارے پلیٹ فارم کے ساتھ کیسے تعامل کرتے ہیں، دیکھے گئے صفحات کے بارے میں معلومات جمع کرتے ہیں اور پرفارمنس کے مسائل کی شناخت کرتے ہیں۔ یہ ڈیٹا مجموعی اور گمنام ہوتا ہے۔

فنکشنیلٹی کوکیز: یہ آپ کی ترجیحات اور سیٹنگز کو یاد رکھتی ہیں، جیسے زبان کی ترجیح، مقام کی سیٹنگز اور ڈسپلے ترجیحات، زیادہ ذاتی تجربہ فراہم کرنے کے لیے۔

مارکیٹنگ کوکیز: آپ کی رضامندی کے ساتھ، یہ کوکیز متعلقہ اشتہارات دینے اور ہمارے مارکیٹنگ مہموں کی اثربخیت کو ٹریک کرنے کے لیے استعمال کی جاتی ہیں۔ آپ کسی بھی وقت اپنے براؤزر سیٹنگز کے ذریعے مارکیٹنگ کوکیز سے باہر نکال سکتے ہیں۔

آپ اپنے براؤزر سیٹنگز کے ذریعے اپنی کوکی ترجیحات کا نظم کر سکتے ہیں۔ براہ کرم نوٹ کریں کہ مخصوص کوکیز کو غیر فعال کرنے سے ہمارے پلیٹ فارم کی کارکردگی متاثر ہو سکتی ہے۔',
'richtext', 12),

('privacy', 'section_6_title',
'6. Your Rights',
'6. آپ کے حقوق',
'text', 13),

('privacy', 'section_6_content',
'You have the following rights regarding your personal information:

Right to Access: You can request a copy of all personal information we hold about you by contacting our support team or through your account settings.

Right to Correction: You can update or correct your personal information at any time through your account settings or by contacting our support team.

Right to Deletion: You can request the deletion of your personal information and account. Please note that certain information may be retained for legal and regulatory compliance purposes even after deletion.

Right to Data Portability: You can request your data in a structured, commonly used, and machine-readable format.

Right to Withdraw Consent: You can withdraw your consent for data processing at any time, though this may affect your ability to use certain features of our platform.

Right to Lodge a Complaint: If you believe we have not handled your personal information in accordance with this policy, you have the right to lodge a complaint with the relevant data protection authority in Pakistan.',
'آپ کی ذاتی معلومات کے حوالے سے آپ کے پاس درج ذیل حقوق ہیں:

رسائی کا حق: آپ ہماری سپورٹ ٹیم سے رابطہ کر کے یا اپنے اکاؤنٹ سیٹنگز کے ذریعے ہمارے پاس موجود تمام ذاتی معلومات کی کاپی کی درخواست کر سکتے ہیں۔

درستگی کا حق: آپ کسی بھی وقت اپنے اکاؤنٹ سیٹنگز کے ذریعے یا ہماری سپورٹ ٹیم سے رابطہ کر کے اپنی ذاتی معلومات کو اپ ڈیٹ یا درست کر سکتے ہیں۔

حذف کرنے کا حق: آپ اپنی ذاتی معلومات اور اکاؤنٹ کے حذف کرنے کی درخواست کر سکتے ہیں۔ براہ کرم نوٹ کریں کہ حذف کرنے کے بعد بھی کچھ معلومات قانونی اور regulatory تعمیل کے مقاصد کے لیے برقرار رکھی جا سکتی ہیں۔

ڈیٹا پورٹیبلٹی کا حق: آپ اپنے ڈیٹا کو ایک منظم، عام استعمال اور مشین پڑھنے کے قابل فارمیٹ میں درخواست کر سکتے ہیں۔

رضامندی واپس لینے کا حق: آپ کسی بھی وقت ڈیٹا پروسیسنگ کی رضامندی واپس لے سکتے ہیں، اگرچہ اس سے ہمارے پلیٹ فارم کی مخصوص خصوصیات استعمال کرنے کی آپ کی صلاحیت متاثر ہو سکتی ہے۔

شکایت درج کرنے کا حق: اگر آپ کا خیال ہے کہ ہم نے آپ کی ذاتی معلومات کو اس پالیسی کے مطابق نہیں سنبھالا ہے تو آپ کا پاکستان میں متعلقہ ڈیٹا پروٹیکشن اتھارٹی میں شکایت درج کرنے کا حق ہے۔',
'richtext', 14),

('privacy', 'section_7_title',
'7. Childrens Privacy',
'7. بچوں کی رازداری',
'text', 15),

('privacy', 'section_7_content',
'MazdoorPing is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at support@mazdoording.pk, and we will take steps to delete such information from our servers.

If we discover that a child under 18 has provided us with personal information, we will delete that information as quickly as commercially feasible. We encourage parents and guardians to monitor their children''s internet usage and to help us protect the privacy of children online.',
'مزدور پنگ 18 سال سے کم عمر افراد کے استعمال کے لیے نہیں ہے۔ ہم جان بوجھ کر بچوں سے ذاتی معلومات جمع نہیں کرتے۔ اگر آپ والد یا سرپرست ہیں اور آپ کا خیال ہے کہ آپ کے بچے نے ہمیں ذاتی معلومات فراہم کی ہیں تو براہ کرم فوراً support@mazdoording.pk پر ہم سے رابطہ کریں اور ہم ایسی معلومات کو ہمارے سرورز سے حذف کرنے کے اقدامات کریں گے۔

اگر ہمیں معلوم ہوا کہ 18 سال سے کم عمر بچے نے ہمیں ذاتی معلومات فراہم کی ہیں تو ہم وہ معلومات جتنی جلد تجارتی طور پر ممکن ہو حذف کر دیں گے۔ ہم والدین اور سرپرستوں کو اپنے بچوں کے انٹرنیٹ استعمال کی نگرانی کرنے اور آن لائن بچوں کی رازداری کی حفاظت میں ہماری مدد کرنے کی ترغیب دیتے ہیں۔',
'richtext', 16),

('privacy', 'section_8_title',
'8. Contact Us',
'8. ہم سے رابطہ کریں',
'text', 17),

('privacy', 'section_8_content',
'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through any of the following channels:

Email: privacy@mazdoording.pk
Phone: +92 51 123 4567
Address: MazdoorPing Headquarters, 3rd Floor, Techno Hub Tower, Blue Area, Jinnah Avenue, Islamabad, Pakistan

You can also submit a privacy-related request through the in-app settings or by using the contact form on our website. We will acknowledge receipt of your request within 48 hours and aim to provide a substantive response within 30 days, as required by applicable law.',
'اگر آپ کے پاس اس رازداری کی پالیسی یا ہمارے ڈیٹا کی پریکٹس کے بارے میں کوئی سوال، تشویش یا درخواست ہے تو براہ کرم درج ذیل چینلز کے ذریعے ہم سے رابطہ کریں:

ای میل: privacy@mazdoording.pk
فون: +92 51 123 4567
پتہ: مزدور پنگ ہیڈکوارٹرز، تیسر منزل، ٹیکنو ہب ٹاور، بلو ایریا، جناح ایونیو، اسلام آباد، پاکستان

آپ ایپ میں سیٹنگز کے ذریعے یا ہمارے ویب سائٹ پر رابطہ فارم استعمال کر کے رازداری سے متعلق درخواست بھی جمع کر سکتے ہیں۔ ہم لاگو قانون کی ضرورت کے مطابق 48 گھنٹوں کے اندر آپ کی درخواست کی وصولی کی تصدیق کریں گے اور 30 دنوں کے اندر ایک مادی جواب دینے کی کوشش کریں گے۔',
'richtext', 18);


-- ============================================================================
-- GENERAL PAGE (Landing page content, social links, company info)
-- ============================================================================
INSERT INTO site_content (page_slug, section_key, content_en, content_ur, content_type, sort_order) VALUES
('general', 'social_facebook',
'https://facebook.com/mazdoording',
'https://facebook.com/mazdoording',
'text', 1),

('general', 'social_instagram',
'https://instagram.com/mazdoording',
'https://instagram.com/mazdoording',
'text', 2),

('general', 'social_twitter',
'https://twitter.com/mazdoording',
'https://twitter.com/mazdoording',
'text', 3),

('general', 'social_linkedin',
'https://linkedin.com/company/mazdoording',
'https://linkedin.com/company/mazdoording',
'text', 4),

('general', 'social_youtube',
'https://youtube.com/@mazdoording',
'https://youtube.com/@mazdoording',
'text', 5),

('general', 'social_whatsapp',
'https://wa.me/923001234567',
'https://wa.me/923001234567',
'text', 6),

('general', 'contact_email',
'support@mazdoording.pk',
'support@mazdoording.pk',
'text', 7),

('general', 'contact_phone',
'+92 51 123 4567',
'+92 51 123 4567',
'text', 8),

('general', 'contact_address',
'MazdoorPing, Techno Hub Tower, Blue Area, Jinnah Avenue, Islamabad, Pakistan',
'مزدور پنگ، ٹیکنو ہب ٹاور، بلو ایریا، جناح ایونیو، اسلام آباد، پاکستان',
'text', 9),

('general', 'company_name',
'MazdoorPing',
'مزدور پنگ',
'text', 10),

('general', 'company_tagline',
'Pakistan\'s Trusted Platform for Skilled Workers',
'پاکستان کے ماہر مزدوروں کے لیے قابل اعتماد پلیٹ فارم',
'text', 11);


-- ============================================================================
-- Add updated_at trigger for site_content
-- ============================================================================
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_site_content_updated_at ON site_content;
CREATE TRIGGER trigger_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_site_content_updated_at();


COMMIT;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
