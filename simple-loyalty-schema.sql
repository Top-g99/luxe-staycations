-- Simple Luxe Jewels Loyalty Program Schema (100% Working)
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing tables if they exist
DROP TABLE IF EXISTS user_loyalty_summary CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;

-- Step 2: Create loyalty_transactions table (simplified)
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Using TEXT instead of UUID for simplicity
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  jewels_earned INTEGER DEFAULT 0 CHECK (jewels_earned >= 0),
  jewels_redeemed INTEGER DEFAULT 0 CHECK (jewels_redeemed >= 0),
  reason TEXT NOT NULL CHECK (reason IN (
    'booking_completion', 
    'review_submission', 
    'referral', 
    'redemption', 
    'manual_adjustment',
    'expiration'
  )),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create user_loyalty_summary table (simplified)
CREATE TABLE user_loyalty_summary (
  user_id TEXT PRIMARY KEY, -- Using TEXT instead of UUID
  total_jewels_balance INTEGER DEFAULT 0,
  total_jewels_earned INTEGER DEFAULT 0,
  total_jewels_redeemed INTEGER DEFAULT 0,
  active_jewels_balance INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_booking_id ON loyalty_transactions(booking_id);
CREATE INDEX idx_loyalty_transactions_reason ON loyalty_transactions(reason);
CREATE INDEX idx_loyalty_transactions_expires_at ON loyalty_transactions(expires_at);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- Step 5: Create function to calculate user loyalty balance
CREATE OR REPLACE FUNCTION calculate_user_loyalty_balance(user_uuid TEXT)
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

-- Step 6: Create function to update user loyalty summary
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

-- Step 7: Create function to redeem jewels
CREATE OR REPLACE FUNCTION redeem_jewels(user_uuid TEXT, jewels_to_redeem INTEGER)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  discount_amount DECIMAL,
  remaining_balance INTEGER
) AS $$
DECLARE
  current_balance INTEGER;
  discount_per_jewel DECIMAL := 100.00; -- ₹100 discount per jewel
  total_discount DECIMAL;
BEGIN
  -- Get current active balance
  SELECT active_jewels_balance INTO current_balance
  FROM user_loyalty_summary
  WHERE user_id = user_uuid;
  
  -- Check if user has enough jewels
  IF current_balance IS NULL OR current_balance < jewels_to_redeem THEN
    RETURN QUERY SELECT false, 'Insufficient jewels balance', 0.00, COALESCE(current_balance, 0);
    RETURN;
  END IF;
  
  -- Check minimum redemption requirement
  IF jewels_to_redeem < 100 THEN
    RETURN QUERY SELECT false, 'Minimum 100 jewels required for redemption', 0.00, current_balance;
    RETURN;
  END IF;
  
  -- Calculate discount
  total_discount := jewels_to_redeem * discount_per_jewel;
  
  -- Record the redemption
  INSERT INTO loyalty_transactions (user_id, jewels_redeemed, reason)
  VALUES (user_uuid, jewels_to_redeem, 'redemption');
  
  -- Return success
  RETURN QUERY SELECT true, 'Jewels redeemed successfully', total_discount, current_balance - jewels_to_redeem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to automatically update summary on transaction changes
CREATE TRIGGER trigger_update_loyalty_summary
  AFTER INSERT OR UPDATE OR DELETE ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_loyalty_summary();

-- Step 9: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_transactions TO anon;
GRANT SELECT, INSERT, UPDATE ON user_loyalty_summary TO anon;
GRANT EXECUTE ON FUNCTION calculate_user_loyalty_balance(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_user_loyalty_summary() TO anon;
GRANT EXECUTE ON FUNCTION redeem_jewels(TEXT, INTEGER) TO anon;

-- Step 10: Insert sample data for testing
INSERT INTO loyalty_transactions (user_id, jewels_earned, reason, expires_at) VALUES
('test-user-1', 150, 'manual_adjustment', NOW() + INTERVAL '1 year'),
('test-user-2', 200, 'manual_adjustment', NOW() + INTERVAL '1 year'),
('test-user-3', 75, 'manual_adjustment', NOW() + INTERVAL '1 year');

-- Step 11: Verify the setup
SELECT 'Loyalty Program Schema Created Successfully!' as status;






