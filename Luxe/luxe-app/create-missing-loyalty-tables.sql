-- Create missing loyalty program tables and functions
-- Run this in your Supabase SQL Editor

-- 1. Create user_loyalty_summary table
CREATE TABLE IF NOT EXISTS user_loyalty_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_jewels_balance INTEGER DEFAULT 0,
  total_jewels_earned INTEGER DEFAULT 0,
  total_jewels_redeemed INTEGER DEFAULT 0,
  active_jewels_balance INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create function to calculate user loyalty balance
CREATE OR REPLACE FUNCTION calculate_user_loyalty_balance(user_uuid UUID)
RETURNS TABLE(
  total_balance INTEGER,
  active_balance INTEGER,
  total_earned INTEGER,
  total_redeemed INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(jewels_earned), 0) - COALESCE(SUM(jewels_redeemed), 0) as total_balance,
    COALESCE(SUM(
      CASE 
        WHEN expires_at IS NULL OR expires_at > NOW() THEN jewels_earned 
        ELSE 0 
      END
    ), 0) - COALESCE(SUM(jewels_redeemed), 0) as active_balance,
    COALESCE(SUM(jewels_earned), 0) as total_earned,
    COALESCE(SUM(jewels_redeemed), 0) as total_redeemed
  FROM loyalty_transactions 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to update user loyalty summary
CREATE OR REPLACE FUNCTION update_user_loyalty_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the summary for the affected user
  INSERT INTO user_loyalty_summary (user_id, total_jewels_balance, total_jewels_earned, total_jewels_redeemed, active_jewels_balance, last_calculated_at, updated_at)
  SELECT 
    NEW.user_id,
    COALESCE(SUM(jewels_earned), 0) - COALESCE(SUM(jewels_redeemed), 0),
    COALESCE(SUM(jewels_earned), 0),
    COALESCE(SUM(jewels_redeemed), 0),
    COALESCE(SUM(
      CASE 
        WHEN expires_at IS NULL OR expires_at > NOW() THEN jewels_earned 
        ELSE 0 
      END
    ), 0) - COALESCE(SUM(jewels_redeemed), 0),
    NOW(),
    NOW()
  FROM loyalty_transactions 
  WHERE user_id = NEW.user_id
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_jewels_balance = EXCLUDED.total_jewels_balance,
    total_jewels_earned = EXCLUDED.total_jewels_earned,
    total_jewels_redeemed = EXCLUDED.total_jewels_redeemed,
    active_jewels_balance = EXCLUDED.active_jewels_balance,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to automatically update summary on transaction changes
DROP TRIGGER IF EXISTS trigger_update_loyalty_summary ON loyalty_transactions;
CREATE TRIGGER trigger_update_loyalty_summary
  AFTER INSERT OR UPDATE OR DELETE ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_loyalty_summary();

-- 5. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_loyalty_summary TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_loyalty_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_loyalty_summary() TO authenticated;

-- 6. Enable RLS
ALTER TABLE user_loyalty_summary ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can view own loyalty summary" ON user_loyalty_summary
  FOR SELECT USING (auth.uid() = user_id);

-- 8. Verify the setup
SELECT 'Missing loyalty tables created successfully!' as status;






