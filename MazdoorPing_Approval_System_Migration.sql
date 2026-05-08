-- ============================================
-- MazdoorPing: Admin Approval System Migration
-- ============================================
-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/kqyugbvutgmjpwjjskft/sql)
-- This adds is_approved and rejection_reason fields to the profiles table

-- Step 1: Add is_approved column (default false for new users)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Step 2: Add rejection_reason column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Step 3: Set existing non-admin users as approved (so current users aren't locked out)
UPDATE public.profiles SET is_approved = true WHERE role != 'admin' AND is_approved IS NULL;

-- Step 4: Set all admin users as approved
UPDATE public.profiles SET is_approved = true WHERE role = 'admin' AND is_approved IS NULL;

-- Step 5: Make sure the trigger creates new profiles with is_approved = false
-- (The existing handle_new_user trigger sets role from metadata,
--  we just need to ensure is_approved defaults to false which we did in Step 1)

-- Step 6: Update the handle_new_user trigger to include is_approved = false
-- This ensures every new registration starts with is_approved = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from auth metadata
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'worker'
  );

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, phone, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    user_role,
    false  -- New users require admin approval
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

  -- Create worker record if role is worker
  IF user_role = 'worker' THEN
    INSERT INTO public.workers (user_id, profile_id, status)
    VALUES (NEW.id, NEW.id, 'pending')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create employer record if role is employer
  IF user_role = 'employer' THEN
    INSERT INTO public.employers (user_id, profile_id)
    VALUES (NEW.id, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 7: Verify the migration
SELECT 'Migration complete!' as status;
SELECT id, email, full_name, role, is_approved, rejection_reason
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
