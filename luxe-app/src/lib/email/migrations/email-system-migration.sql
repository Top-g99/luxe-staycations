-- Email System Migration
-- Creates all necessary tables for the enhanced email system

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id),
    variables JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
    message_id TEXT,
    error_message TEXT,
    attempt_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_triggers table
CREATE TABLE IF NOT EXISTS email_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    template_id UUID NOT NULL REFERENCES email_templates(id),
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    delay INTEGER DEFAULT 0, -- Delay in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_analytics table
CREATE TABLE IF NOT EXISTS email_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month', 'year')),
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    delivery_rate DECIMAL(5,2) DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    failure_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, period)
);

-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT,
    text_content TEXT,
    template_id UUID REFERENCES email_templates(id),
    variables JSONB DEFAULT '{}',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);

CREATE INDEX IF NOT EXISTS idx_email_triggers_event ON email_triggers(event);
CREATE INDEX IF NOT EXISTS idx_email_triggers_active ON email_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_email_triggers_priority ON email_triggers(priority);

CREATE INDEX IF NOT EXISTS idx_email_analytics_date ON email_analytics(date);
CREATE INDEX IF NOT EXISTS idx_email_analytics_period ON email_analytics(period);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON email_queue(scheduled_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_email_logs_updated_at 
    BEFORE UPDATE ON email_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_triggers_updated_at 
    BEFORE UPDATE ON email_triggers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_analytics_updated_at 
    BEFORE UPDATE ON email_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at 
    BEFORE UPDATE ON email_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email triggers (will be populated after templates are created)
-- These will be created programmatically by the EmailTriggerManager

-- Create a view for email statistics
CREATE OR REPLACE VIEW email_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_emails,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_emails,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_emails,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_emails,
    COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked_emails,
    COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced_emails,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_emails,
    ROUND(
        (COUNT(CASE WHEN status = 'delivered' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)) * 100, 2
    ) as delivery_rate,
    ROUND(
        (COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0)) * 100, 2
    ) as open_rate,
    ROUND(
        (COUNT(CASE WHEN status = 'clicked' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(CASE WHEN status = 'opened' THEN 1 END), 0)) * 100, 2
    ) as click_rate
FROM email_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create a function to clean up old email logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_logs 
    WHERE created_at < NOW() - INTERVAL '90 days' 
    AND status IN ('sent', 'delivered', 'opened', 'clicked');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get email performance metrics
CREATE OR REPLACE FUNCTION get_email_metrics(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_emails BIGINT,
    sent_emails BIGINT,
    delivered_emails BIGINT,
    opened_emails BIGINT,
    clicked_emails BIGINT,
    bounced_emails BIGINT,
    failed_emails BIGINT,
    delivery_rate DECIMAL,
    open_rate DECIMAL,
    click_rate DECIMAL,
    bounce_rate DECIMAL,
    failure_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_emails,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_emails,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_emails,
        COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_emails,
        COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked_emails,
        COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced_emails,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_emails,
        ROUND(
            (COUNT(CASE WHEN status = 'delivered' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)) * 100, 2
        ) as delivery_rate,
        ROUND(
            (COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0)) * 100, 2
        ) as open_rate,
        ROUND(
            (COUNT(CASE WHEN status = 'clicked' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN status = 'opened' THEN 1 END), 0)) * 100, 2
        ) as click_rate,
        ROUND(
            (COUNT(CASE WHEN status = 'bounced' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)) * 100, 2
        ) as bounce_rate,
        ROUND(
            (COUNT(CASE WHEN status = 'failed' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ) as failure_rate
    FROM email_logs
    WHERE DATE(created_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON email_logs TO authenticated;
GRANT ALL ON email_triggers TO authenticated;
GRANT ALL ON email_analytics TO authenticated;
GRANT ALL ON email_queue TO authenticated;
GRANT SELECT ON email_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_email_logs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_metrics(DATE, DATE) TO authenticated;

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your security requirements)
CREATE POLICY "Allow all operations for authenticated users" ON email_logs
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON email_triggers
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON email_analytics
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON email_queue
    FOR ALL TO authenticated USING (true);
