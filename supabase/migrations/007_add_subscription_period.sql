-- Add subscription period fields for cancellation display
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;
