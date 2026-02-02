-- Create user_subscriptions table
create table public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan_tier text check (plan_tier in ('free', 'professional', 'enterprise')) default 'free',
  billing_period text check (billing_period in ('monthly', 'annual')),
  free_audits_used integer default 0,
  free_audits_limit integer default 10,
  subscription_status text check (subscription_status in ('active', 'cancelled', 'expired')) default 'active',
  current_period_start timestamp with time zone default now(),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on public.user_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

-- Function to handle new user signup (trigger)
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.user_subscriptions (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create subscription record for new users
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_user_subscription();

-- Function to increment audits used
create or replace function increment_audits_used(row_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_subscriptions
  set free_audits_used = free_audits_used + 1,
      updated_at = now()
  where user_id = row_user_id;
end;
$$;
