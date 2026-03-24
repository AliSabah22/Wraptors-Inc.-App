-- Add referral tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_count   INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_credits NUMERIC(10,2) NOT NULL DEFAULT 0;
