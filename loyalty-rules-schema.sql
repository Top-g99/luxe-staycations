-- Loyalty Rules Management Schema
-- Run this in your Supabase SQL Editor

-- Create loyalty_rules table for admin-configurable rules
CREATE TABLE IF NOT EXISTS loyalty_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL UNIQUE,
  rule_description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('spending_to_jewels', 'bonus_multiplier', 'expiration_days', 'minimum_redemption')),
  rule_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'new_users', 'existing_users', 'premium_users')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create loyalty_rule_history for audit trail
CREATE TABLE IF NOT EXISTS loyalty_rule_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES loyalty_rules(id) ON DELETE CASCADE,
  old_value DECIMAL(10,2),
  new_value DECIMAL(10,2),
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rules
INSERT INTO loyalty_rules (rule_name, rule_description, rule_type, rule_value, applies_to) VALUES
('spending_to_jewels', 'Jewels earned per ₹100 spent', 'spending_to_jewels', 1.00, 'all'),
('bonus_multiplier', 'Bonus multiplier for premium users', 'bonus_multiplier', 1.50, 'premium_users'),
('expiration_days', 'Days before jewels expire', 'expiration_days', 365.00, 'all'),
('minimum_redemption', 'Minimum jewels required for redemption', 'minimum_redemption', 100.00, 'all'),
('first_booking_bonus', 'Bonus jewels for first booking', 'bonus_multiplier', 2.00, 'new_users'),
('weekend_booking_bonus', 'Extra jewels for weekend bookings', 'bonus_multiplier', 1.25, 'all'),
('long_stay_bonus', 'Bonus for stays longer than 7 days', 'bonus_multiplier', 1.20, 'all');

-- Create function to calculate jewels based on spending
CREATE OR REPLACE FUNCTION calculate_jewels_from_spending(
  spending_amount DECIMAL,
  user_type TEXT DEFAULT 'all'
)
RETURNS INTEGER AS $$
DECLARE
  base_rate DECIMAL;
  bonus_multiplier DECIMAL;
  total_jewels INTEGER;
BEGIN
  -- Get base spending rate
  SELECT rule_value INTO base_rate
  FROM loyalty_rules
  WHERE rule_name = 'spending_to_jewels' 
    AND is_active = true 
    AND (applies_to = 'all' OR applies_to = user_type)
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY applies_to = 'all' DESC, created_at DESC
  LIMIT 1;
  
  -- Get bonus multiplier for user type
  SELECT rule_value INTO bonus_multiplier
  FROM loyalty_rules
  WHERE rule_name = 'bonus_multiplier' 
    AND is_active = true 
    AND applies_to = user_type
    AND (end_date IS NULL OR end_date > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Default values if no rules found
  base_rate := COALESCE(base_rate, 1.00);
  bonus_multiplier := COALESCE(bonus_multiplier, 1.00);
  
  -- Calculate jewels: (spending / 100) * base_rate * bonus_multiplier
  total_jewels := FLOOR((spending_amount / 100.00) * base_rate * bonus_multiplier);
  
  RETURN GREATEST(total_jewels, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all active rules
CREATE OR REPLACE FUNCTION get_active_loyalty_rules()
RETURNS TABLE(
  rule_name TEXT,
  rule_description TEXT,
  rule_type TEXT,
  rule_value DECIMAL,
  applies_to TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.rule_name,
    lr.rule_description,
    lr.rule_type,
    lr.rule_value,
    lr.applies_to,
    lr.is_active
  FROM loyalty_rules lr
  WHERE lr.is_active = true
    AND (lr.end_date IS NULL OR lr.end_date > NOW())
  ORDER BY lr.rule_type, lr.applies_to, lr.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_rule_history TO anon;
GRANT EXECUTE ON FUNCTION calculate_jewels_from_spending(DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_active_loyalty_rules() TO anon;

-- Enable RLS
ALTER TABLE loyalty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rule_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on loyalty_rules" ON loyalty_rules
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on loyalty_rule_history" ON loyalty_rule_history
  FOR ALL USING (true);

-- Verify setup
SELECT 'Loyalty Rules Schema Created Successfully!' as status;


