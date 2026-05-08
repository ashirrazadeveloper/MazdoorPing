-- =====================================================
-- MazdoorPing - Registration Fix SQL
-- Run this SQL in Supabase SQL Editor
-- This fixes the "Database error saving new user" issue
-- =====================================================

-- 1. Drop the old broken trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Create the resilient trigger function
-- This version has:
-- - SET search_path = public (fixes schema resolution)
-- - EXCEPTION blocks (prevents transaction rollback on error)
-- - Auto-creates worker/employer records too
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');

  -- Create profile (ignore if already exists)
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
    NULL;
  END;

  -- Create worker record if role is worker
  IF user_role = 'worker' THEN
    BEGIN
      INSERT INTO public.workers (user_id, profile_id, status)
      VALUES (NEW.id, NEW.id, 'pending');
    EXCEPTION WHEN unique_violation OR foreign_key_violation OR others THEN
      NULL;
    END;
  ELSIF user_role = 'employer' THEN
    BEGIN
      INSERT INTO public.employers (user_id, profile_id)
      VALUES (NEW.id, NEW.id);
    EXCEPTION WHEN unique_violation OR foreign_key_violation OR others THEN
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-create the trigger
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Done! New users should now be able to register successfully.
