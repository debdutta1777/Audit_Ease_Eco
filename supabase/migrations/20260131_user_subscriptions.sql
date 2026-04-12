-- =============================================================
-- USER SUBSCRIPTIONS MIGRATION
-- Add subscription tracking for free tier audit limits
-- =============================================================

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'professional', 'enterprise')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'annual')),
  free_audits_used INTEGER NOT NULL DEFAULT 0,
  free_audits_limit INTEGER NOT NULL DEFAULT 10,
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
  ON public.user_subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT plan_tier FROM public.user_subscriptions 
     WHERE user_id = user_uuid AND subscription_status = 'active'),
    'free'
  );
$$;

-- Create function to check if user can create audit
CREATE OR REPLACE FUNCTION public.can_user_create_audit(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN (SELECT plan_tier FROM public.user_subscriptions 
          WHERE user_id = user_uuid AND subscription_status = 'active') IN ('professional', 'enterprise')
    THEN TRUE
    ELSE (
      SELECT COALESCE(free_audits_used, 0) < COALESCE(free_audits_limit, 10)
      FROM public.user_subscriptions
      WHERE user_id = user_uuid
    )
  END;
$$;

-- Create function to increment audit count for free tier users
CREATE OR REPLACE FUNCTION public.increment_free_audit_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only increment for free tier users
  UPDATE public.user_subscriptions
  SET free_audits_used = free_audits_used + 1
  WHERE user_id = NEW.user_id
    AND plan_tier = 'free'
    AND subscription_status = 'active';
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-increment audit count when audit is created
CREATE TRIGGER increment_audit_count_trigger
  AFTER INSERT ON public.audits
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_free_audit_count();

-- Function to initialize subscription for new users
CREATE OR REPLACE FUNCTION public.init_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create subscription when user signs up
CREATE TRIGGER init_subscription_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.init_user_subscription();

-- Insert subscription records for existing users (migration)
INSERT INTO public.user_subscriptions (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
