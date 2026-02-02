-- =====================================================
-- BILLING SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add subscription columns to shops table
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_charge_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Create billing_charges table
CREATE TABLE IF NOT EXISTS billing_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  charge_id TEXT UNIQUE NOT NULL,
  charge_type TEXT NOT NULL, -- 'subscription' or 'one_time'
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'active', 'cancelled', 'expired'
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  confirmation_url TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL, -- 'monthly', 'yearly'
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_charges_shop ON billing_charges(shop_id);
CREATE INDEX IF NOT EXISTS idx_billing_charges_status ON billing_charges(status);

-- Step 5: Enable Row Level Security
ALTER TABLE billing_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
DROP POLICY IF EXISTS "Service role can manage billing_charges" ON billing_charges;
CREATE POLICY "Service role can manage billing_charges" ON billing_charges
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Step 7: Insert default subscription plans
INSERT INTO subscription_plans (name, price, interval, features) VALUES
  ('Basic', 9.99, 'monthly', '["Access to 50+ premium sections", "Priority support", "Monthly new sections"]'::jsonb),
  ('Pro', 19.99, 'monthly', '["Access to ALL premium sections", "Priority support", "Early access to new sections", "Custom section requests"]'::jsonb),
  ('Annual Basic', 99.99, 'yearly', '["Access to 50+ premium sections", "Priority support", "Monthly new sections", "Save 17%"]'::jsonb),
  ('Annual Pro', 199.99, 'yearly', '["Access to ALL premium sections", "Priority support", "Early access to new sections", "Custom section requests", "Save 17%"]'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Verify by running:
-- SELECT * FROM subscription_plans;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'shops';
