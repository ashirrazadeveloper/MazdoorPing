-- =====================================================
-- MazdoorPing - Complete Supabase Database Migration
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CORE TABLES (may already exist - use IF NOT EXISTS)
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('worker', 'employer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ur TEXT DEFAULT '',
  icon TEXT DEFAULT 'star',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cnic_number TEXT DEFAULT '',
  cnic_front_url TEXT DEFAULT '',
  cnic_back_url TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  province TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  hourly_rate INTEGER DEFAULT 0,
  availability BOOLEAN DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bank_name TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  account_title TEXT DEFAULT '',
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employers table
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT DEFAULT '',
  company_type TEXT DEFAULT '',
  business_address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  province TEXT DEFAULT '',
  phone_office TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  total_posted_jobs INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  city TEXT DEFAULT '',
  province TEXT DEFAULT '',
  address TEXT DEFAULT '',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  duration_days INTEGER DEFAULT 1,
  workers_needed INTEGER DEFAULT 1,
  requirements TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  bids_count INTEGER DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Skills table
CREATE TABLE IF NOT EXISTS worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  skill_name TEXT DEFAULT '',
  experience_years INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  message TEXT DEFAULT '',
  estimated_days INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet / Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'credit' CHECK (type IN ('credit', 'debit')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('job', 'bid', 'payment', 'verification', 'sos', 'system')),
  title TEXT NOT NULL DEFAULT '',
  message TEXT DEFAULT '',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table (Multi-category rating)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  punctuality_rating NUMERIC(3,2) DEFAULT 0 CHECK (punctuality_rating >= 0 AND punctuality_rating <= 5),
  quality_rating NUMERIC(3,2) DEFAULT 0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
  behavior_rating NUMERIC(3,2) DEFAULT 0 CHECK (behavior_rating >= 0 AND behavior_rating <= 5),
  communication_rating NUMERIC(3,2) DEFAULT 0 CHECK (communication_rating >= 0 AND communication_rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Workers (Favorites)
CREATE TABLE IF NOT EXISTS saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employer_id, worker_id)
);

-- SOS Alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  bank_name TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  account_title TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Platform Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Logs
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'suspend')),
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. NEW FEATURE TABLES
-- =====================================================

-- Chat Conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id, job_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'job')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges (Gamification)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ur TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_ur TEXT DEFAULT '',
  icon TEXT DEFAULT 'star',
  color TEXT DEFAULT '#10b981',
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('jobs_completed', 'rating', 'earnings', 'reviews', 'streak', 'special')),
  requirement_value INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true
);

-- Worker Badges (earned)
CREATE TABLE IF NOT EXISTS worker_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, badge_id)
);

-- Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  commission NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  due_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Availability Calendar Slots
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_auth TEXT NOT NULL DEFAULT '',
  keys_p256dh TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deposit Requests
CREATE TABLE IF NOT EXISTS deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  method TEXT DEFAULT '' CHECK (method IN ('jazzcash', 'easypaisa', 'bank_transfer', 'sadapay')),
  account_or_phone TEXT DEFAULT '',
  transaction_id TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- =====================================================
-- 3. DEFAULT DATA
-- =====================================================

-- Default Categories
INSERT INTO categories (name, name_ur, icon, description) VALUES
  ('Electrician', 'بلدی کار', 'zap', 'Electrical wiring, repairs, installations'),
  ('Plumber', 'پلمبر', 'droplets', 'Plumbing, pipe fitting, water systems'),
  ('Carpenter', 'ترکھان', 'hammer', 'Woodwork, furniture, repairs'),
  ('Painter', 'پینٹر', 'paintbrush', 'Wall painting, decoration'),
  ('Mason', 'میسن', 'brick-wall', 'Construction, brickwork, plastering'),
  ('AC Technician', 'اے سی ٹیکنیشن', 'wind', 'AC installation, repair, maintenance'),
  ('Welder', 'ولڈر', 'flame', 'Welding, metalwork, fabrication'),
  ('Mechanic', 'مکینک', 'wrench', 'Vehicle repair and maintenance'),
  ('Tailor', 'درزی', 'scissors', 'Clothing stitching and alterations'),
  ('Cook', 'کھانا پکانے والا', 'chef-hat', 'Cooking and catering services'),
  ('Driver', 'ڈرائیور', 'car', 'Driving services, transportation'),
  ('Cleaner', 'صفائی کار', 'sparkles', 'Cleaning and sanitation services'),
  ('Gardener', 'باغبان', 'flower', 'Gardening and landscaping'),
  ('Security Guard', 'سیکیورٹی گارڈ', 'shield', 'Security services'),
  ('Laborer', 'مزدور', 'hard-hat', 'General labor and construction help')
ON CONFLICT DO NOTHING;

-- Default Badges
INSERT INTO badges (name, name_ur, description, description_ur, icon, color, requirement_type, requirement_value, category) VALUES
  ('First Job', 'پہلی نوکری', 'Complete your first job', 'اپنی پہلی نوکری مکمل کریں', 'trophy', '#10b981', 'jobs_completed', 1, 'milestone'),
  ('5 Jobs Done', '5 نوکریاں', 'Complete 5 jobs successfully', '5 نوکریاں کامیابی سے مکمل کریں', 'award', '#3b82f6', 'jobs_completed', 5, 'milestone'),
  ('10 Jobs Star', '10 نوکریاں', 'Complete 10 jobs', '10 نوکریاں مکمل کریں', 'star', '#8b5cf6', 'jobs_completed', 10, 'milestone'),
  ('50 Jobs Legend', '50 نوکریاں', 'Complete 50 jobs', '50 نوکریاں مکمل کریں', 'crown', '#f59e0b', 'jobs_completed', 50, 'milestone'),
  ('5 Star Rating', '5 ستارہ درجہ بندی', 'Maintain a 5.0 average rating with 5+ reviews', '5+ جائزوں کے ساتھ 5.0 درجہ بندی برقرار رکھیں', 'star', '#ef4444', 'rating', 5, 'quality'),
  ('Top Earner', 'بہترین کمائی', 'Earn over PKR 100,000 total', 'کل PKR 100,000 سے زیادہ کماو', 'trending-up', '#10b981', 'earnings', 100000, 'financial'),
  ('Quick Responder', 'فوری جواب', 'Respond to bids within 1 hour', '1 گھنٹے کے اندر بڈز پر جواب دیں', 'zap', '#3b82f6', 'special', 1, 'engagement'),
  ('7 Day Streak', '7 دن مسلسل', 'Log in 7 consecutive days', 'مسلسل 7 دن لاگ ان کریں', 'flame', '#f97316', 'streak', 7, 'engagement'),
  ('30 Day Streak', '30 دن مسلسل', 'Log in 30 consecutive days', 'مسلسل 30 دن لاگ ان کریں', 'sun', '#ef4444', 'streak', 30, 'engagement'),
  ('Verified Pro', 'تصدیق شدہ پرو', 'Get CNIC verified and complete 20+ jobs', 'CNIC تصدیق حاصل کریں اور 20+ نوکریاں مکمل کریں', 'shield-check', '#10b981', 'special', 20, 'trust'),
  ('Review Master', 'جائزہ ماسٹر', 'Receive 20+ positive reviews', '20+ مثبت جائزے حاصل کریں', 'message-circle', '#8b5cf6', 'reviews', 20, 'quality'),
  ('Punctual Pro', 'وقت کا پابند', 'Maintain 4.5+ punctuality rating', '4.5+ وقت کی پابندی درجہ بندی برقرار رکھیں', 'clock', '#06b6d4', 'rating', 5, 'quality')
ON CONFLICT DO NOTHING;

-- Default Settings
INSERT INTO settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'We are performing scheduled maintenance.'),
  ('default_commission', '10'),
  ('min_withdrawal', '500'),
  ('default_hourly_rate', '500'),
  ('platform_name', 'MazdoorPing'),
  ('platform_description', 'Pakistan''s premier platform connecting skilled workers with employers.')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles select" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: everyone can read
CREATE POLICY "Categories select" ON categories FOR SELECT USING (true);

-- Workers: everyone can read active, workers can update own
CREATE POLICY "Workers select" ON workers FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Workers insert" ON workers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Workers update" ON workers FOR UPDATE USING (auth.uid() = user_id);

-- Employers: everyone can read, employers can update own
CREATE POLICY "Employers select" ON employers FOR SELECT USING (true);
CREATE POLICY "Employers insert" ON employers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Employers update" ON employers FOR UPDATE USING (auth.uid() = user_id);

-- Jobs: everyone can read open, employers manage their own
CREATE POLICY "Jobs select" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs insert" ON jobs FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM employers WHERE id = employer_id));
CREATE POLICY "Jobs update" ON jobs FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM employers WHERE id = employer_id));

-- Worker Skills
CREATE POLICY "WorkerSkills select" ON worker_skills FOR SELECT USING (true);
CREATE POLICY "WorkerSkills insert" ON worker_skills FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "WorkerSkills update" ON worker_skills FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "WorkerSkills delete" ON worker_skills FOR DELETE USING (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));

-- Bids: workers create bids, employers manage their job bids
CREATE POLICY "Bids select" ON bids FOR SELECT USING (true);
CREATE POLICY "Bids insert" ON bids FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "Bids update" ON bids FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id) OR
  auth.uid() IN (SELECT user_id FROM employers WHERE id IN (SELECT employer_id FROM jobs WHERE id = job_id))
);

-- Transactions
CREATE POLICY "Transactions select" ON transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Transactions insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Notifications: users see their own
CREATE POLICY "Notifications select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: everyone can read
CREATE POLICY "Reviews select" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Reviews update" ON reviews FOR UPDATE USING (auth.uid() = from_user_id);

-- Saved Workers
CREATE POLICY "SavedWorkers select" ON saved_workers FOR SELECT USING (true);
CREATE POLICY "SavedWorkers insert" ON saved_workers FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM employers WHERE id = employer_id));
CREATE POLICY "SavedWorkers delete" ON saved_workers FOR DELETE USING (auth.uid() IN (SELECT user_id FROM employers WHERE id = employer_id));

-- SOS Alerts
CREATE POLICY "SOSAlerts select" ON sos_alerts FOR SELECT USING (true);
CREATE POLICY "SOSAlerts insert" ON sos_alerts FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "SOSAlerts update" ON sos_alerts FOR UPDATE USING (true);

-- Withdrawals
CREATE POLICY "Withdrawals select" ON withdrawals FOR SELECT USING (true);
CREATE POLICY "Withdrawals insert" ON withdrawals FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "Withdrawals update" ON withdrawals FOR UPDATE USING (true);

-- Settings: everyone can read, only admins update
CREATE POLICY "Settings select" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings update" ON settings FOR UPDATE USING (true);

-- Verification Logs
CREATE POLICY "VerificationLogs select" ON verification_logs FOR SELECT USING (true);
CREATE POLICY "VerificationLogs insert" ON verification_logs FOR INSERT WITH CHECK (true);

-- Chat Conversations
CREATE POLICY "ChatConversations select" ON chat_conversations FOR SELECT USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);
CREATE POLICY "ChatConversations insert" ON chat_conversations FOR INSERT WITH CHECK (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);
CREATE POLICY "ChatConversations update" ON chat_conversations FOR UPDATE USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- Chat Messages
CREATE POLICY "ChatMessages select" ON chat_messages FOR SELECT USING (
  auth.uid() IN (SELECT participant1_id FROM chat_conversations WHERE id = conversation_id) OR
  auth.uid() IN (SELECT participant2_id FROM chat_conversations WHERE id = conversation_id)
);
CREATE POLICY "ChatMessages insert" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT participant1_id FROM chat_conversations WHERE id = conversation_id) OR
  auth.uid() IN (SELECT participant2_id FROM chat_conversations WHERE id = conversation_id)
);
CREATE POLICY "ChatMessages update" ON chat_messages FOR UPDATE USING (
  auth.uid() = sender_id OR
  auth.uid() IN (SELECT participant1_id FROM chat_conversations WHERE id = conversation_id) OR
  auth.uid() IN (SELECT participant2_id FROM chat_conversations WHERE id = conversation_id)
);

-- Badges
CREATE POLICY "Badges select" ON badges FOR SELECT USING (true);

-- Worker Badges
CREATE POLICY "WorkerBadges select" ON worker_badges FOR SELECT USING (true);
CREATE POLICY "WorkerBadges insert" ON worker_badges FOR INSERT WITH CHECK (true);
CREATE POLICY "WorkerBadges update" ON worker_badges FOR UPDATE USING (true);

-- Portfolio Items
CREATE POLICY "Portfolio select" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Portfolio insert" ON portfolio_items FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "Portfolio update" ON portfolio_items FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "Portfolio delete" ON portfolio_items FOR DELETE USING (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));

-- Invoices
CREATE POLICY "Invoices select" ON invoices FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Invoices insert" ON invoices FOR INSERT WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Invoices update" ON invoices FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Availability Slots
CREATE POLICY "Availability select" ON availability_slots FOR SELECT USING (true);
CREATE POLICY "Availability insert" ON availability_slots FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "Availability update" ON availability_slots FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));
CREATE POLICY "Availability delete" ON availability_slots FOR DELETE USING (auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id));

-- Push Subscriptions
CREATE POLICY "PushSubs select" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "PushSubs insert" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "PushSubs delete" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Deposit Requests
CREATE POLICY "Deposits select" ON deposit_requests FOR SELECT USING (true);
CREATE POLICY "Deposits insert" ON deposit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Deposits update" ON deposit_requests FOR UPDATE USING (true);

-- =====================================================
-- 5. INDEXES for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_city ON workers(city);
CREATE INDEX IF NOT EXISTS idx_workers_skills ON worker_skills(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_bids_job ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_worker ON bids(worker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_participants ON chat_conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_worker ON portfolio_items(worker_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(from_user_id);
CREATE INDEX IF NOT EXISTS idx_availability_worker ON availability_slots(worker_id);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_alerts(status);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employers_updated_at BEFORE UPDATE ON employers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup (resilient version with exception handling)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');

  -- Create profile (ignore if already exists due to race condition)
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      user_role
    );
  EXCEPTION WHEN unique_violation OR not_null_violation OR others THEN
    NULL; -- Profile might already exist or constraint issue - don't fail signup
  END;

  -- Create worker record if role is worker
  IF user_role = 'worker' THEN
    BEGIN
      INSERT INTO public.workers (user_id, profile_id, status)
      VALUES (NEW.id, NEW.id, 'pending');
    EXCEPTION WHEN unique_violation OR foreign_key_violation OR others THEN
      NULL; -- Don't fail signup if worker insert fails
    END;
  ELSIF user_role = 'employer' THEN
    BEGIN
      INSERT INTO public.employers (user_id, profile_id)
      VALUES (NEW.id, NEW.id);
    EXCEPTION WHEN unique_violation OR foreign_key_violation OR others THEN
      NULL; -- Don't fail signup if employer insert fails
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update chat conversation last_message_at
CREATE OR REPLACE FUNCTION update_chat_conversation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET last_message = NEW.message,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_chat_message ON chat_messages;
CREATE TRIGGER on_new_chat_message AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_conversation();

-- Update worker completed_jobs and rating on review insert
CREATE OR REPLACE FUNCTION update_worker_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  review_count INTEGER;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE to_user_id = NEW.to_user_id;

  UPDATE workers
  SET rating = avg_rating,
      total_reviews = review_count
  WHERE user_id = NEW.to_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_review ON reviews;
CREATE TRIGGER on_new_review AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_worker_stats();

-- =====================================================
-- 7. STORAGE BUCKETS (run separately in Supabase Dashboard > Storage)
-- =====================================================
-- Create these buckets via Supabase Dashboard > Storage:
-- 1. 'avatars' - public, for profile pictures
-- 2. 'cnic' - private, for CNIC documents
-- 3. 'portfolio' - public, for work portfolio images
-- 4. 'chat' - private, for chat image/file uploads
