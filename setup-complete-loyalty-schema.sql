-- Complete Luxe Jewels Loyalty Program Schema Setup
-- Run this in your Supabase SQL Editor to ensure all components are created

-- Step 1: Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS user_loyalty_summary CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;

-- Step 2: Create loyalty_transactions table with all required columns
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Step 3: Create user_loyalty_summary table
CREATE TABLE user_loyalty_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Step 7: Create function to award jewels for completed stays
CREATE OR REPLACE FUNCTION award_jewels_for_booking_completion()
RETURNS TRIGGER AS $$
DECLARE
  jewels_to_award INTEGER;
  user_uuid UUID;
BEGIN
  -- Only trigger when booking status changes to 'completed' and payment is successful
  IF NEW.status = 'completed' AND NEW.payment_status = 'paid' AND 
     (OLD.status != 'completed' OR OLD.payment_status != 'paid') THEN
    
    -- Get user ID from the booking
    user_uuid := NEW.guest_email; -- Assuming guest_email is the user identifier
    
    -- Check if jewels were already awarded for this booking
    IF EXISTS (SELECT 1 FROM loyalty_transactions WHERE booking_id = NEW.id AND reason = 'booking_completion') THEN
      RETURN NEW; -- Already awarded
    END IF;
    
    -- Calculate jewels to award (1 jewel per ₹1000 spent)
    jewels_to_award := FLOOR(NEW.total_amount / 1000);
    
    -- Award jewels if amount is sufficient
    IF jewels_to_award > 0 THEN
      INSERT INTO loyalty_transactions (user_id, booking_id, jewels_earned, reason, expires_at)
      VALUES (user_uuid, NEW.id, jewels_to_award, 'booking_completion', 
              NOW() + INTERVAL '1 year'); -- Jewels expire in 1 year
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to redeem jewels
CREATE OR REPLACE FUNCTION redeem_jewels(user_uuid UUID, jewels_to_redeem INTEGER)
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

-- Step 9: Create trigger to automatically update summary on transaction changes
CREATE TRIGGER trigger_update_loyalty_summary
  AFTER INSERT OR UPDATE OR DELETE ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_loyalty_summary();

-- Step 10: Create trigger to award jewels for completed bookings
CREATE TRIGGER trigger_award_jewels_for_booking
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION award_jewels_for_booking_completion();

-- Step 11: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_loyalty_summary TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_loyalty_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_loyalty_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION award_jewels_for_booking_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_jewels(UUID, INTEGER) TO authenticated;

-- Step 12: Enable RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loyalty_summary ENABLE ROW LEVEL SECURITY;

-- Step 13: Create RLS policies
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own loyalty summary" ON user_loyalty_summary
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Step 14: Insert sample data for testing
INSERT INTO loyalty_transactions (user_id, jewels_earned, reason, expires_at) VALUES
('00000000-0000-0000-0000-000000000001', 150, 'manual_adjustment', NOW() + INTERVAL '1 year'),
('00000000-0000-0000-0000-000000000002', 200, 'manual_adjustment', NOW() + INTERVAL '1 year'),
('00000000-0000-0000-0000-000000000003', 75, 'manual_adjustment', NOW() + INTERVAL '1 year');

-- Step 15: Verify the setup
SELECT 'Loyalty Program Schema Created Successfully!' as status;






