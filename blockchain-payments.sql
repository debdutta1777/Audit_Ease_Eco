-- =============================================================
-- BLOCKCHAIN PAYMENTS MIGRATION
-- Run this in Supabase SQL Editor to add blockchain payment support
-- =============================================================

-- Add payment method tracking to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS payment_method text
  CHECK (payment_method IN ('card', 'crypto'))
  DEFAULT 'card';

ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS crypto_tx_hash text;

-- Create crypto_payments table to log all blockchain transactions
CREATE TABLE IF NOT EXISTS public.crypto_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash text NOT NULL UNIQUE,
  wallet_address text NOT NULL,
  amount_eth decimal(18, 8) NOT NULL,
  amount_usd decimal(12, 2) NOT NULL,
  network text NOT NULL DEFAULT 'sepolia',
  plan_tier text CHECK (plan_tier IN ('professional', 'enterprise')),
  payment_type text CHECK (payment_type IN ('subscription', 'one_time')) DEFAULT 'subscription',
  status text CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

-- Policies for crypto_payments
CREATE POLICY "Users can view their own crypto payments"
  ON public.crypto_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crypto payments"
  ON public.crypto_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================
-- MIGRATION COMPLETE!
-- =============================================================
