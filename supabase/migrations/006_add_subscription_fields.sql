-- Add subscription fields for Polar billing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT
  CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'trialing'));
