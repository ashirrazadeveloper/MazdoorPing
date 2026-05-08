-- =====================================================
-- MazdoorPing - Features Migration SQL
-- ============================================
-- Project:   MazdoorPing
-- Supabase:  https://kqyugbvutgmjpwjjskft.supabase.co
-- Version:   1.0.0
-- Date:      2025-01-01
--
-- Run this SQL in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/kqyugbvutgmjpwjjskft/sql
--
-- This migration is IDEMPOTENT and can be re-run safely.
-- It creates 5 new tables, seeds default data, configures
-- RLS policies, and adds a commission calculation trigger.
-- =====================================================

BEGIN;

-- =====================================================
-- SECTION 1: PLATFORM SETTINGS TABLE
-- =====================================================
-- Extends the existing `settings` table with a `category`
-- column for grouping settings by domain (worker/employer/general).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'platform_settings'
  ) THEN
    CREATE TABLE public.platform_settings (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      key text NOT NULL,
      value text NOT NULL,
      category text NOT NULL DEFAULT 'general'
        CHECK (category IN ('worker', 'employer', 'general')),
      updated_at timestamptz DEFAULT now()
    );

    -- Unique key per category
    CREATE UNIQUE INDEX idx_platform_settings_key_category
      ON public.platform_settings (key, category);

    RAISE NOTICE 'Created table: platform_settings';
  ELSE
    RAISE NOTICE 'Table already exists: platform_settings';
  END IF;
END $$;


-- =====================================================
-- SECTION 2: SUBSCRIPTION PLANS TABLE
-- =====================================================
-- Defines employer subscription tiers (Free, Basic, Premium).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'subscription_plans'
  ) THEN
    CREATE TABLE public.subscription_plans (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL UNIQUE,
      name_ur text NOT NULL,
      price numeric(10,2) DEFAULT 0,
      job_limit integer DEFAULT 3,
      features jsonb DEFAULT '[]'::jsonb,
      is_active boolean DEFAULT true,
      sort_order integer DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    RAISE NOTICE 'Created table: subscription_plans';
  ELSE
    RAISE NOTICE 'Table already exists: subscription_plans';
  END IF;
END $$;


-- =====================================================
-- SECTION 3: EMPLOYER SUBSCRIPTIONS TABLE
-- =====================================================
-- Tracks which subscription plan each employer is on.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'employer_subscriptions'
  ) THEN
    CREATE TABLE public.employer_subscriptions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
      plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'cancelled')),
      jobs_posted_this_month integer NOT NULL DEFAULT 0,
      started_at timestamptz DEFAULT now(),
      expires_at timestamptz,
      auto_renew boolean DEFAULT false
    );

    -- One active subscription per employer at a time
    CREATE UNIQUE INDEX idx_employer_subscriptions_active
      ON public.employer_subscriptions (employer_id)
      WHERE status = 'active';

    RAISE NOTICE 'Created table: employer_subscriptions';
  ELSE
    RAISE NOTICE 'Table already exists: employer_subscriptions';
  END IF;
END $$;


-- =====================================================
-- SECTION 4: WORKER PAYMENTS TABLE
-- =====================================================
-- Tracks registration fees, commissions, and other
-- financial transactions specific to workers.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'worker_payments'
  ) THEN
    CREATE TABLE public.worker_payments (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      worker_id uuid NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
      amount numeric(10,2) NOT NULL,
      payment_type text NOT NULL
        CHECK (payment_type IN ('registration_fee', 'commission')),
      status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed')),
      description text,
      transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
      created_at timestamptz DEFAULT now()
    );

    RAISE NOTICE 'Created table: worker_payments';
  ELSE
    RAISE NOTICE 'Table already exists: worker_payments';
  END IF;
END $$;


-- =====================================================
-- SECTION 5: EMPLOYER DOCUMENTS TABLE
-- =====================================================
-- Stores uploaded verification documents for employers
-- (CNIC, business registration, tax certificates, etc.).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'employer_documents'
  ) THEN
    CREATE TABLE public.employer_documents (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
      document_type text NOT NULL
        CHECK (document_type IN (
          'cnic',
          'business_registration',
          'tax_certificate',
          'utility_bill',
          'other'
        )),
      file_url text NOT NULL,
      file_name text,
      verified boolean DEFAULT false,
      uploaded_at timestamptz DEFAULT now()
    );

    RAISE NOTICE 'Created table: employer_documents';
  ELSE
    RAISE NOTICE 'Table already exists: employer_documents';
  END IF;
END $$;


-- =====================================================
-- SECTION 6: DEFAULT SUBSCRIPTION PLANS
-- =====================================================
-- Seeds 3 plans: Free (0 PKR / 3 jobs), Basic (2999 PKR / 20 jobs),
-- Premium (7999 PKR / unlimited).

INSERT INTO public.subscription_plans (name, name_ur, price, job_limit, features, is_active, sort_order)
VALUES
  (
    'Free',
    'مفت',
    0,
    3,
    '[
      "Post up to 3 jobs per month",
      "Basic worker search",
      "In-app messaging",
      "Standard job listing"
    ]'::jsonb,
    true,
    0
  ),
  (
    'Basic',
    'بنیادی',
    2999,
    20,
    '[
      "Post up to 20 jobs per month",
      "Advanced worker search & filters",
      "In-app messaging",
      "Featured job listing",
      "Priority worker matching",
      "View worker contact details",
      "Download worker reports (PDF)"
    ]'::jsonb,
    true,
    1
  ),
  (
    'Premium',
    'پریمیئم',
    7999,
    -1,
    '[
      "Unlimited job postings",
      "Advanced worker search & filters",
      "In-app messaging with media",
      "Featured & pinned job listings",
      "Priority worker matching (top results)",
      "View worker contact details",
      "Download worker reports (PDF & Excel)",
      "Dedicated account manager",
      "Analytics dashboard",
      "AI-powered job descriptions",
      "Bulk job posting via CSV",
      "Custom branding on job listings"
    ]'::jsonb,
    true,
    2
  )
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- SECTION 7: DEFAULT PLATFORM SETTINGS
-- =====================================================
-- Seeds configuration values for workers, employers, and
-- general platform settings.

INSERT INTO public.platform_settings (key, value, category) VALUES
  -- Worker Settings
  (
    'worker_registration_fee',
    '500',
    'worker'
  ),
  (
    'worker_commission_rate',
    '10',
    'worker'
  ),
  (
    'worker_min_withdrawal',
    '500',
    'worker'
  ),

  -- Employer Settings
  (
    'employer_free_plan_job_limit',
    '3',
    'employer'
  ),
  (
    'employer_required_documents',
    'cnic,business_registration',
    'employer'
  ),

  -- General / Feature Toggles
  (
    'feature_sos_enabled',
    'true',
    'general'
  ),
  (
    'feature_chat_enabled',
    'true',
    'general'
  ),
  (
    'feature_ratings_enabled',
    'true',
    'general'
  ),
  (
    'feature_portfolio_enabled',
    'true',
    'general'
  ),
  (
    'feature_ai_assistant_enabled',
    'true',
    'general'
  ),
  (
    'feature_nearby_jobs_enabled',
    'true',
    'general'
  ),
  (
    'feature_badges_enabled',
    'true',
    'general'
  ),
  (
    'feature_emi_calculator_enabled',
    'true',
    'general'
  ),
  (
    'feature_push_notifications_enabled',
    'true',
    'general'
  ),
  (
    'feature_voice_search_enabled',
    'true',
    'general'
  ),
  (
    'platform_currency',
    'PKR',
    'general'
  ),
  (
    'platform_default_language',
    'en',
    'general'
  )
ON CONFLICT (key, category) DO UPDATE
  SET value      = EXCLUDED.value,
      updated_at = now();


-- =====================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all new tables and create policies.
-- Pattern: authenticated users can read; service_role
-- bypasses RLS automatically in Supabase.

-- ── 8a. Enable RLS ───────────────────────────────────

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_documents ENABLE ROW LEVEL SECURITY;


-- ── 8b. platform_settings policies ───────────────────

DROP POLICY IF EXISTS "PlatformSettings: service_role all"        ON public.platform_settings;
DROP POLICY IF EXISTS "PlatformSettings: authenticated read"      ON public.platform_settings;

CREATE POLICY "PlatformSettings: service_role all"
  ON public.platform_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "PlatformSettings: authenticated read"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (true);


-- ── 8c. subscription_plans policies ──────────────────

DROP POLICY IF EXISTS "SubscriptionPlans: service_role all"       ON public.subscription_plans;
DROP POLICY IF EXISTS "SubscriptionPlans: authenticated read"     ON public.subscription_plans;

CREATE POLICY "SubscriptionPlans: service_role all"
  ON public.subscription_plans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "SubscriptionPlans: authenticated read"
  ON public.subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);


-- ── 8d. employer_subscriptions policies ─────────────

DROP POLICY IF EXISTS "EmployerSubs: service_role all"           ON public.employer_subscriptions;
DROP POLICY IF EXISTS "EmployerSubs: employer read own"          ON public.employer_subscriptions;
DROP POLICY IF EXISTS "EmployerSubs: employer insert own"        ON public.employer_subscriptions;
DROP POLICY IF EXISTS "EmployerSubs: employer update own"        ON public.employer_subscriptions;

CREATE POLICY "EmployerSubs: service_role all"
  ON public.employer_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "EmployerSubs: employer read own"
  ON public.employer_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "EmployerSubs: employer insert own"
  ON public.employer_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "EmployerSubs: employer update own"
  ON public.employer_subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );


-- ── 8e. worker_payments policies ─────────────────────

DROP POLICY IF EXISTS "WorkerPayments: service_role all"         ON public.worker_payments;
DROP POLICY IF EXISTS "WorkerPayments: worker read own"          ON public.worker_payments;
DROP POLICY IF EXISTS "WorkerPayments: worker insert own"        ON public.worker_payments;

CREATE POLICY "WorkerPayments: service_role all"
  ON public.worker_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "WorkerPayments: worker read own"
  ON public.worker_payments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.workers WHERE id = worker_id
    )
  );

CREATE POLICY "WorkerPayments: worker insert own"
  ON public.worker_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.workers WHERE id = worker_id
    )
  );


-- ── 8f. employer_documents policies ─────────────────

DROP POLICY IF EXISTS "EmployerDocs: service_role all"           ON public.employer_documents;
DROP POLICY IF EXISTS "EmployerDocs: employer read own"          ON public.employer_documents;
DROP POLICY IF EXISTS "EmployerDocs: employer insert own"        ON public.employer_documents;
DROP POLICY IF EXISTS "EmployerDocs: employer update own"        ON public.employer_documents;
DROP POLICY IF EXISTS "EmployerDocs: employer delete own"        ON public.employer_documents;

CREATE POLICY "EmployerDocs: service_role all"
  ON public.employer_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "EmployerDocs: employer read own"
  ON public.employer_documents
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "EmployerDocs: employer insert own"
  ON public.employer_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "EmployerDocs: employer update own"
  ON public.employer_documents
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "EmployerDocs: employer delete own"
  ON public.employer_documents
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );


-- =====================================================
-- SECTION 9: COMMISSION CALCULATION TRIGGER
-- =====================================================
-- Automatically creates a 10% commission record in
-- `worker_payments` whenever a job-related transaction
-- is marked as 'completed'.
--
-- The commission rate is read dynamically from the
-- `platform_settings` table (key: 'worker_commission_rate').

CREATE OR REPLACE FUNCTION public.calculate_job_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission_rate   numeric(10,2);
  v_commission_amount numeric(10,2);
  v_worker_id         uuid;
  v_job_id            uuid;
BEGIN
  -- Only fire on status change to 'completed'
  IF NOT (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed') THEN
    RETURN NEW;
  END IF;

  -- Only process credit transactions (employer paying worker)
  IF NEW.type != 'credit' THEN
    RETURN NEW;
  END IF;

  -- Skip if no job is associated
  IF NEW.job_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Read the commission rate from platform_settings
  SELECT value::numeric INTO v_commission_rate
  FROM public.platform_settings
  WHERE key = 'worker_commission_rate'
    AND category = 'worker'
  LIMIT 1;

  -- Fallback to 10% if setting not found
  IF v_commission_rate IS NULL THEN
    v_commission_rate := 10;
  END IF;

  -- Calculate commission amount
  v_commission_amount := (NEW.amount * v_commission_rate) / 100;

  -- Skip if commission amount is zero or negative
  IF v_commission_amount <= 0 THEN
    RETURN NEW;
  END IF;

  -- Find the worker associated with this job via accepted bid
  v_job_id := NEW.job_id;

  SELECT w.id INTO v_worker_id
  FROM public.workers w
  INNER JOIN public.bids b ON b.worker_id = w.id
  WHERE b.job_id = v_job_id
    AND b.status = 'accepted'
  LIMIT 1;

  -- If no accepted bid found, skip commission
  IF v_worker_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert the commission record (with idempotency check)
  BEGIN
    INSERT INTO public.worker_payments (
      worker_id,
      amount,
      payment_type,
      status,
      description,
      transaction_id
    ) VALUES (
      v_worker_id,
      v_commission_amount,
      'commission',
      'completed',
      'Platform commission (' || v_commission_rate || '%) on job payment TX #' || NEW.id::text,
      NEW.id
    );
  EXCEPTION WHEN unique_violation THEN
    -- Commission already recorded for this transaction — skip silently
    NULL;
  WHEN OTHERS THEN
    -- Log error but don't fail the original transaction
    RAISE LOG 'calculate_job_commission error for transaction %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Attach the trigger to the transactions table
DROP TRIGGER IF EXISTS trg_calculate_job_commission ON public.transactions;
CREATE TRIGGER trg_calculate_job_commission
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_job_commission();


-- =====================================================
-- BONUS: UPDATED_AT TRIGGERS FOR NEW TABLES
-- =====================================================
-- Reuses the existing update_updated_at() function.

DO $$
BEGIN
  -- subscription_plans
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'subscription_plans_updated_at'
  ) THEN
    CREATE TRIGGER subscription_plans_updated_at
      BEFORE UPDATE ON public.subscription_plans
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    RAISE NOTICE 'Created trigger: subscription_plans_updated_at';
  END IF;

  -- employer_subscriptions (has updated_at via subscription_plans FK, but
  -- employer_subscriptions itself doesn't have updated_at column, so skip)
END $$;


-- =====================================================
-- BONUS: PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_platform_settings_category
  ON public.platform_settings (category);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key
  ON public.platform_settings (key);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active
  ON public.subscription_plans (is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_employer_subs_employer
  ON public.employer_subscriptions (employer_id);

CREATE INDEX IF NOT EXISTS idx_employer_subs_status
  ON public.employer_subscriptions (status);

CREATE INDEX IF NOT EXISTS idx_employer_subs_expires
  ON public.employer_subscriptions (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_worker_payments_worker
  ON public.worker_payments (worker_id);

CREATE INDEX IF NOT EXISTS idx_worker_payments_type
  ON public.worker_payments (payment_type);

CREATE INDEX IF NOT EXISTS idx_worker_payments_status
  ON public.worker_payments (status);

CREATE INDEX IF NOT EXISTS idx_worker_payments_transaction
  ON public.worker_payments (transaction_id)
  WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employer_docs_employer
  ON public.employer_documents (employer_id);

CREATE INDEX IF NOT EXISTS idx_employer_docs_type
  ON public.employer_documents (document_type);

CREATE INDEX IF NOT EXISTS idx_employer_docs_verified
  ON public.employer_documents (verified);


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these SELECT queries after the migration to verify.

SELECT '=== MIGRATION COMPLETE ===' AS status;

SELECT 'platform_settings' AS table_name, count(*) AS row_count
FROM public.platform_settings;

SELECT 'subscription_plans' AS table_name, count(*) AS row_count
FROM public.subscription_plans;

SELECT 'employer_subscriptions' AS table_name, count(*) AS row_count
FROM public.employer_subscriptions;

SELECT 'worker_payments' AS table_name, count(*) AS row_count
FROM public.worker_payments;

SELECT 'employer_documents' AS table_name, count(*) AS row_count
FROM public.employer_documents;

-- Verify RLS is enabled
SELECT
  schemaname || '.' || tablename AS table_name,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'platform_settings',
    'subscription_plans',
    'employer_subscriptions',
    'worker_payments',
    'employer_documents'
  )
ORDER BY tablename;

-- Verify subscription plans
SELECT id, name, name_ur, price, job_limit, is_active, sort_order
FROM public.subscription_plans
ORDER BY sort_order;

-- Verify platform settings
SELECT key, value, category, updated_at
FROM public.platform_settings
ORDER BY category, key;

COMMIT;
