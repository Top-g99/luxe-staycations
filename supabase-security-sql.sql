-- 🔒 Supabase Security Setup for Luxe Staycations
-- Run these commands in your Supabase SQL Editor to fix security issues

-- ========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_requests ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE SECURITY POLICIES
-- ========================================

-- ========================================
-- PROPERTIES TABLE POLICIES
-- ========================================

-- Allow public read access to properties
CREATE POLICY "Allow public read access" ON properties
FOR SELECT USING (true);

-- Allow authenticated users to insert properties
CREATE POLICY "Allow authenticated insert" ON properties
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update properties
CREATE POLICY "Allow authenticated update" ON properties
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete properties
CREATE POLICY "Allow authenticated delete" ON properties
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- DESTINATIONS TABLE POLICIES
-- ========================================

-- Allow public read access to destinations
CREATE POLICY "Allow public read access" ON destinations
FOR SELECT USING (true);

-- Allow authenticated users to insert destinations
CREATE POLICY "Allow authenticated insert" ON destinations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update destinations
CREATE POLICY "Allow authenticated update" ON destinations
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete destinations
CREATE POLICY "Allow authenticated delete" ON destinations
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- BOOKINGS TABLE POLICIES
-- ========================================

-- Allow public read access to bookings
CREATE POLICY "Allow public read access" ON bookings
FOR SELECT USING (true);

-- Allow public insert for bookings (guests need to book)
CREATE POLICY "Allow public insert" ON bookings
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update bookings
CREATE POLICY "Allow authenticated update" ON bookings
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete bookings
CREATE POLICY "Allow authenticated delete" ON bookings
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- CALLBACK_REQUESTS TABLE POLICIES
-- ========================================

-- Allow public read access to callback_requests
CREATE POLICY "Allow public read access" ON callback_requests
FOR SELECT USING (true);

-- Allow public insert for callback_requests (customers need to submit)
CREATE POLICY "Allow public insert" ON callback_requests
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update callback_requests
CREATE POLICY "Allow authenticated update" ON callback_requests
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete callback_requests
CREATE POLICY "Allow authenticated delete" ON callback_requests
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- DEAL_BANNERS TABLE POLICIES
-- ========================================

-- Allow public read access to deal_banners
CREATE POLICY "Allow public read access" ON deal_banners
FOR SELECT USING (true);

-- Allow authenticated users to insert deal_banners
CREATE POLICY "Allow authenticated insert" ON deal_banners
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update deal_banners
CREATE POLICY "Allow authenticated update" ON deal_banners
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete deal_banners
CREATE POLICY "Allow authenticated delete" ON deal_banners
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- SETTINGS TABLE POLICIES
-- ========================================

-- Allow public read access to settings
CREATE POLICY "Allow public read access" ON settings
FOR SELECT USING (true);

-- Allow authenticated users to insert settings
CREATE POLICY "Allow authenticated insert" ON settings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update settings
CREATE POLICY "Allow authenticated update" ON settings
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete settings
CREATE POLICY "Allow authenticated delete" ON settings
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Allow users to read their own profile
CREATE POLICY "Allow users to read own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert (for registration)
CREATE POLICY "Allow authenticated insert" ON users
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- PROFILES TABLE POLICIES
-- ========================================

-- Allow users to read their own profile
CREATE POLICY "Allow users to read own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated insert" ON profiles
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- REVIEWS TABLE POLICIES
-- ========================================

-- Allow public read access to reviews
CREATE POLICY "Allow public read access" ON reviews
FOR SELECT USING (true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Allow authenticated insert" ON reviews
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update own reviews" ON reviews
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete own reviews" ON reviews
FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- HOST_PAYOUTS TABLE POLICIES
-- ========================================

-- Allow hosts to read their own payouts
CREATE POLICY "Allow hosts to read own payouts" ON host_payouts
FOR SELECT USING (auth.uid() = host_id);

-- Allow authenticated users to insert payouts
CREATE POLICY "Allow authenticated insert" ON host_payouts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow hosts to update their own payouts
CREATE POLICY "Allow hosts to update own payouts" ON host_payouts
FOR UPDATE USING (auth.uid() = host_id);

-- ========================================
-- LOYALTY_TRANSACTIONS TABLE POLICIES
-- ========================================

-- Allow users to read their own loyalty transactions
CREATE POLICY "Allow users to read own loyalty transactions" ON loyalty_transactions
FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert loyalty transactions
CREATE POLICY "Allow authenticated insert" ON loyalty_transactions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own loyalty transactions
CREATE POLICY "Allow users to update own loyalty transactions" ON loyalty_transactions
FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- COUPONS TABLE POLICIES
-- ========================================

-- Allow public read access to coupons
CREATE POLICY "Allow public read access" ON coupons
FOR SELECT USING (true);

-- Allow authenticated users to insert coupons
CREATE POLICY "Allow authenticated insert" ON coupons
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update coupons
CREATE POLICY "Allow authenticated update" ON coupons
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete coupons
CREATE POLICY "Allow authenticated delete" ON coupons
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- PAYMENTS TABLE POLICIES
-- ========================================

-- Allow users to read their own payments
CREATE POLICY "Allow users to read own payments" ON payments
FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert payments
CREATE POLICY "Allow authenticated insert" ON payments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own payments
CREATE POLICY "Allow users to update own payments" ON payments
FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- SPECIAL_REQUESTS TABLE POLICIES
-- ========================================

-- Allow public read access to special_requests
CREATE POLICY "Allow public read access" ON special_requests
FOR SELECT USING (true);

-- Allow public insert for special_requests (customers need to submit)
CREATE POLICY "Allow public insert" ON special_requests
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update special_requests
CREATE POLICY "Allow authenticated update" ON special_requests
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete special_requests
CREATE POLICY "Allow authenticated delete" ON special_requests
FOR DELETE USING (auth.role() = 'authenticated');

-- ========================================
-- ALTERNATIVE: SIMPLIFIED POLICIES FOR DEVELOPMENT
-- ========================================
-- If you want to allow all operations for development, use these instead:

/*
-- Allow all operations for development (less secure)
CREATE POLICY "Allow all operations" ON properties FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON destinations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON callback_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON deal_banners FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON host_payouts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON coupons FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON special_requests FOR ALL USING (true);
*/

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'properties', 'destinations', 'bookings', 'callback_requests', 
    'deal_banners', 'settings', 'users', 'profiles', 'reviews', 
    'host_payouts', 'loyalty_transactions', 'coupons', 'payments', 
    'special_requests'
);

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'properties', 'destinations', 'bookings', 'callback_requests', 
    'deal_banners', 'settings', 'users', 'profiles', 'reviews', 
    'host_payouts', 'loyalty_transactions', 'coupons', 'payments', 
    'special_requests'
);
