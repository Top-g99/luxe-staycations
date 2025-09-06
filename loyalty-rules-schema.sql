-- Luxe Jewels Loyalty Program - Configurable Rules Schema
-- This table stores all loyalty program rules that admins can edit

-- Create loyalty_rules table
CREATE TABLE IF NOT EXISTS loyalty_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_description TEXT NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('earning', 'redemption', 'tier', 'bonus', 'expiry')),
    rule_value DECIMAL(10,4) NOT NULL,
    rule_unit VARCHAR(50) NOT NULL,
    applies_to VARCHAR(100) DEFAULT 'all',
    min_value DECIMAL(10,4) DEFAULT 0,
    max_value DECIMAL(10,4) DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create loyalty_rule_history for audit trail
CREATE TABLE IF NOT EXISTS loyalty_rule_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id UUID REFERENCES loyalty_rules(id) ON DELETE CASCADE,
    old_value DECIMAL(10,4),
    new_value DECIMAL(10,4),
    old_unit VARCHAR(50),
    new_unit VARCHAR(50),
    change_reason TEXT,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default loyalty rules
INSERT INTO loyalty_rules (
    rule_name, 
    rule_description, 
    rule_type, 
    rule_value, 
    rule_unit, 
    applies_to, 
    priority
) VALUES 
    -- Earning Rules
    ('spend_to_jewel_rate', 'Amount spent to earn 1 jewel', 'earning', 100.00, 'INR', 'all', 1),
    ('minimum_spend_for_jewels', 'Minimum spend required to earn jewels', 'earning', 1000.00, 'INR', 'all', 2),
    ('jewel_earning_cap', 'Maximum jewels that can be earned per booking', 'earning', 1000.00, 'jewels', 'all', 3),
    
    -- Redemption Rules
    ('jewel_to_rupee_rate', '1 jewel equals this many rupees', 'redemption', 1.00, 'INR', 'all', 4),
    ('minimum_redemption_jewels', 'Minimum jewels required for redemption', 'redemption', 100.00, 'jewels', 'all', 5),
    ('maximum_redemption_jewels', 'Maximum jewels that can be redeemed at once', 'redemption', 5000.00, 'jewels', 'all', 6),
    ('redemption_processing_fee', 'Processing fee for redemption (percentage)', 'redemption', 0.00, 'percentage', 'all', 7),
    
    -- Tier Rules
    ('bronze_threshold', 'Jewels needed for Bronze tier', 'tier', 0.00, 'jewels', 'bronze', 8),
    ('silver_threshold', 'Jewels needed for Silver tier', 'tier', 1000.00, 'jewels', 'silver', 9),
    ('gold_threshold', 'Jewels needed for Gold tier', 'tier', 5000.00, 'jewels', 'gold', 10),
    ('platinum_threshold', 'Jewels needed for Platinum tier', 'tier', 15000.00, 'jewels', 'platinum', 11),
    ('diamond_threshold', 'Jewels needed for Diamond tier', 'tier', 50000.00, 'jewels', 'diamond', 12),
    
    -- Bonus Rules
    ('first_booking_bonus', 'Bonus jewels for first booking', 'bonus', 50.00, 'jewels', 'first_booking', 13),
    ('referral_bonus', 'Bonus jewels for referring friends', 'bonus', 25.00, 'jewels', 'referral', 14),
    ('review_bonus', 'Bonus jewels for leaving a review', 'bonus', 10.00, 'jewels', 'review', 15),
    ('weekend_stay_bonus', 'Bonus jewels for weekend stays', 'bonus', 1.5, 'multiplier', 'weekend_stay', 16),
    
    -- Expiry Rules
    ('jewel_expiry_days', 'Days after which jewels expire', 'expiry', 365.00, 'days', 'all', 17),
    ('tier_downgrade_days', 'Days of inactivity before tier downgrade', 'expiry', 730.00, 'days', 'all', 18);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_type ON loyalty_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_active ON loyalty_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_priority ON loyalty_rules(priority);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_applies_to ON loyalty_rules(applies_to);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loyalty_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_loyalty_rules_updated_at
    BEFORE UPDATE ON loyalty_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_rules_updated_at();

-- Create function to get active loyalty rules
CREATE OR REPLACE FUNCTION get_active_loyalty_rules()
RETURNS TABLE (
    rule_name VARCHAR(100),
    rule_description TEXT,
    rule_type VARCHAR(50),
    rule_value DECIMAL(10,4),
    rule_unit VARCHAR(50),
    applies_to VARCHAR(100),
    min_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lr.rule_name,
        lr.rule_description,
        lr.rule_type,
        lr.rule_value,
        lr.rule_unit,
        lr.applies_to,
        lr.min_value,
        lr.max_value,
        lr.priority
    FROM loyalty_rules lr
    WHERE lr.is_active = true
    AND (lr.effective_until IS NULL OR lr.effective_until > NOW())
    ORDER BY lr.priority ASC, lr.rule_name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate jewels earned
CREATE OR REPLACE FUNCTION calculate_jewels_earned(spend_amount DECIMAL(10,2))
RETURNS INTEGER AS $$
DECLARE
    spend_rate DECIMAL(10,4);
    min_spend DECIMAL(10,2);
    max_jewels INTEGER;
    jewels_earned INTEGER;
BEGIN
    -- Get the spend to jewel rate
    SELECT rule_value INTO spend_rate 
    FROM loyalty_rules 
    WHERE rule_name = 'spend_to_jewel_rate' AND is_active = true;
    
    -- Get minimum spend requirement
    SELECT rule_value INTO min_spend 
    FROM loyalty_rules 
    WHERE rule_name = 'minimum_spend_for_jewels' AND is_active = true;
    
    -- Get maximum jewels cap
    SELECT rule_value INTO max_jewels 
    FROM loyalty_rules 
    WHERE rule_name = 'jewel_earning_cap' AND is_active = true;
    
    -- Calculate jewels earned
    IF spend_amount >= min_spend THEN
        jewels_earned := FLOOR(spend_amount / spend_rate);
        -- Apply cap if exists
        IF max_jewels > 0 AND jewels_earned > max_jewels THEN
            jewels_earned := max_jewels;
        END IF;
    ELSE
        jewels_earned := 0;
    END IF;
    
    RETURN jewels_earned;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate redemption value
CREATE OR REPLACE FUNCTION calculate_redemption_value(jewels_to_redeem INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    jewel_rate DECIMAL(10,4);
    processing_fee DECIMAL(10,4);
    redemption_value DECIMAL(10,2);
BEGIN
    -- Get the jewel to rupee rate
    SELECT rule_value INTO jewel_rate 
    FROM loyalty_rules 
    WHERE rule_name = 'jewel_to_rupee_rate' AND is_active = true;
    
    -- Get processing fee
    SELECT rule_value INTO processing_fee 
    FROM loyalty_rules 
    WHERE rule_name = 'redemption_processing_fee' AND is_active = true;
    
    -- Calculate redemption value
    redemption_value := jewels_to_redeem * jewel_rate;
    
    -- Apply processing fee if exists
    IF processing_fee > 0 THEN
        redemption_value := redemption_value * (1 - processing_fee / 100);
    END IF;
    
    RETURN redemption_value;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_rules TO authenticated;
GRANT SELECT, INSERT ON loyalty_rule_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_loyalty_rules() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_jewels_earned(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_redemption_value(INTEGER) TO authenticated;

-- Enable Row Level Security
ALTER TABLE loyalty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rule_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on loyalty_rules" ON loyalty_rules
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on loyalty_rule_history" ON loyalty_rule_history
    FOR ALL USING (true);

-- Display success message
SELECT 'Loyalty Rules Schema Created Successfully!' as status;




