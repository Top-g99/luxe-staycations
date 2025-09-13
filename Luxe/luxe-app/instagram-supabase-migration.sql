-- Instagram Integration Migration for Luxe Staycations
-- This script creates the necessary tables for Instagram integration

-- Create Instagram configurations table
CREATE TABLE IF NOT EXISTS instagram_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    access_token TEXT NOT NULL,
    business_account_id VARCHAR(255) NOT NULL,
    instagram_account_id VARCHAR(255) NOT NULL,
    webhook_verify_token VARCHAR(255) NOT NULL,
    api_version VARCHAR(10) DEFAULT 'v18.0',
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Instagram posts table
CREATE TABLE IF NOT EXISTS instagram_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instagram_post_id VARCHAR(255) UNIQUE NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    media_url TEXT NOT NULL,
    permalink TEXT NOT NULL,
    caption TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    like_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    hashtags TEXT[] DEFAULT '{}',
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Instagram stories table
CREATE TABLE IF NOT EXISTS instagram_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    instagram_story_id VARCHAR(255) UNIQUE NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    media_url TEXT NOT NULL,
    permalink TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    thumbnail_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Instagram analytics table
CREATE TABLE IF NOT EXISTS instagram_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period VARCHAR(20) UNIQUE NOT NULL,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    email_contacts INTEGER DEFAULT 0,
    phone_calls INTEGER DEFAULT 0,
    text_messages INTEGER DEFAULT 0,
    get_directions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_instagram_configurations_updated_at 
    BEFORE UPDATE ON instagram_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at 
    BEFORE UPDATE ON instagram_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_stories_updated_at 
    BEFORE UPDATE ON instagram_stories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_analytics_updated_at 
    BEFORE UPDATE ON instagram_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instagram_configurations_enabled ON instagram_configurations(enabled);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_timestamp ON instagram_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_media_type ON instagram_posts(media_type);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_engagement ON instagram_posts(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_stories_timestamp ON instagram_stories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_period ON instagram_analytics(period);

-- Insert default Instagram configuration (disabled by default)
INSERT INTO instagram_configurations (
    access_token,
    business_account_id,
    instagram_account_id,
    webhook_verify_token,
    api_version,
    enabled
) VALUES (
    'your_access_token',
    'your_business_account_id',
    'your_instagram_account_id',
    'your_webhook_verify_token',
    'v18.0',
    false
) ON CONFLICT DO NOTHING;

-- Insert sample analytics data (optional)
INSERT INTO instagram_analytics (period, impressions, reach, profile_views, website_clicks) VALUES
('day', 1250, 890, 45, 12),
('week', 8750, 6200, 315, 84),
('month', 35000, 24800, 1260, 336)
ON CONFLICT (period) DO NOTHING;

COMMENT ON TABLE instagram_configurations IS 'Stores Instagram Business API configuration settings';
COMMENT ON TABLE instagram_posts IS 'Stores Instagram posts data and engagement metrics';
COMMENT ON TABLE instagram_stories IS 'Stores Instagram stories data and view metrics';
COMMENT ON TABLE instagram_analytics IS 'Stores Instagram analytics and performance metrics';
