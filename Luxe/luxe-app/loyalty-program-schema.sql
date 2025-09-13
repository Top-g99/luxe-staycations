-- Luxe Jewels Loyalty Program Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
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

-- 2. Create user_loyalty_summary table (updated via triggers for performance)
CREATE TABLE IF NOT EXISTS user_loyalty_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_jewels_balance INTEGER DEFAULT 0,
  total_jewels_earned INTEGER DEFAULT 0,
  total_jewels_redeemed INTEGER DEFAULT 0,
  active_jewels_balance INTEGER DEFAULT 0, -- Non-expired jewels only
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_booking_id ON loyalty_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_reason ON loyalty_transactions(reason);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_expires_at ON loyalty_transactions(expires_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- 4. Create function to calculate user loyalty balance
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

-- 5. Create function to update user loyalty summary
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

-- 6. Create trigger to automatically update summary on transaction changes
CREATE TRIGGER trigger_update_loyalty_summary
  AFTER INSERT OR UPDATE OR DELETE ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_loyalty_summary();

-- 7. Create function to award jewels for completed stays
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
      INSERT INTO loyalty_transactions (
        user_id, 
        booking_id, 
        jewels_earned, 
        reason, 
        expires_at
      ) VALUES (
        user_uuid,
        NEW.id,
        jewels_to_award,
        'booking_completion',
        NOW() + INTERVAL '1 year' -- Jewels expire in 1 year
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for automatic jewel awards on booking completion
CREATE TRIGGER trigger_award_booking_jewels
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION award_jewels_for_booking_completion();

-- 9. Create function to award jewels for review submission
CREATE OR REPLACE FUNCTION award_jewels_for_review(user_uuid UUID, booking_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if jewels were already awarded for this review
  IF EXISTS (SELECT 1 FROM loyalty_transactions WHERE booking_id = booking_uuid AND reason = 'review_submission') THEN
    RETURN FALSE; -- Already awarded
  END IF;
  
  -- Check if the booking is completed and paid
  IF NOT EXISTS (
    SELECT 1 FROM bookings 
    WHERE id = booking_uuid 
    AND status = 'completed' 
    AND payment_status = 'paid'
  ) THEN
    RETURN FALSE; -- Booking not eligible
  END IF;
  
  -- Award 10 jewels for review
  INSERT INTO loyalty_transactions (
    user_id, 
    booking_id, 
    jewels_earned, 
    reason, 
    expires_at
  ) VALUES (
    user_uuid,
    booking_uuid,
    10,
    'review_submission',
    NOW() + INTERVAL '1 year'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to award jewels for referrals
CREATE OR REPLACE FUNCTION award_jewels_for_referral(referrer_uuid UUID, referee_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Award 250 jewels to referrer
  INSERT INTO loyalty_transactions (
    user_id, 
    jewels_earned, 
    reason, 
    expires_at
  ) VALUES (
    referrer_uuid,
    250,
    'referral',
    NOW() + INTERVAL '1 year'
  );
  
  -- Award 250 jewels to referee
  INSERT INTO loyalty_transactions (
    user_id, 
    jewels_earned, 
    reason, 
    expires_at
  ) VALUES (
    referee_uuid,
    250,
    'referral',
    NOW() + INTERVAL '1 year'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to redeem jewels
CREATE OR REPLACE FUNCTION redeem_jewels(user_uuid UUID, jewels_to_redeem INTEGER)
RETURNS TABLE(
  success BOOLEAN,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  current_balance INTEGER;
  discount DECIMAL;
BEGIN
  -- Get current active balance
  SELECT active_jewels_balance INTO current_balance
  FROM user_loyalty_summary
  WHERE user_id = user_uuid;
  
  -- Check if user has enough jewels
  IF current_balance IS NULL OR current_balance < jewels_to_redeem THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Insufficient jewels balance'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum redemption (e.g., 100 jewels minimum)
  IF jewels_to_redeem < 100 THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Minimum redemption is 100 jewels'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount (1 jewel = ₹1)
  discount := jewels_to_redeem::DECIMAL;
  
  -- Create redemption transaction
  INSERT INTO loyalty_transactions (
    user_id, 
    jewels_redeemed, 
    reason
  ) VALUES (
    user_uuid,
    jewels_to_redeem,
    'redemption'
  );
  
  RETURN QUERY SELECT TRUE, discount, 'Jewels redeemed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to expire old jewels (run daily via cron)
CREATE OR REPLACE FUNCTION expire_old_jewels()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Mark expired jewels as expired
  UPDATE loyalty_transactions 
  SET reason = 'expiration'
  WHERE expires_at < NOW() 
    AND reason IN ('booking_completion', 'review_submission', 'referral')
    AND jewels_earned > 0;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create RLS policies for security
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loyalty_summary ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own summary
CREATE POLICY "Users can view own loyalty summary" ON user_loyalty_summary
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert transactions (via functions)
CREATE POLICY "Authenticated users can insert loyalty transactions" ON loyalty_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 14. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON loyalty_transactions TO authenticated;
GRANT SELECT ON user_loyalty_summary TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_loyalty_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_jewels(UUID, INTEGER) TO authenticated;

-- 15. Insert sample data for testing (optional)
-- INSERT INTO loyalty_transactions (user_id, jewels_earned, reason, expires_at) 
-- VALUES ('sample-user-uuid', 100, 'manual_adjustment', NOW() + INTERVAL '1 year');

-- 16. Verify the setup
SELECT 'Loyalty Program Schema Created Successfully!' as status;






