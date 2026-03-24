-- Update handle_new_user trigger to capture full_name from both email signups
-- (raw_user_meta_data->>'full_name') and social providers like Google/Apple
-- (raw_user_meta_data->>'name').

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',  -- email signup (signUpWithEmail passes full_name)
      NEW.raw_user_meta_data->>'name'        -- Google/Apple social providers pass 'name'
    )
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email     = EXCLUDED.email,
      full_name = COALESCE(
        EXCLUDED.full_name,
        profiles.full_name  -- keep existing name if new signup has none
      ),
      updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Ensure trigger is attached (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
