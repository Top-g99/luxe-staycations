-- Email Configurations V2 Migration
-- Creates the email_configurations_v2 table for the enhanced email system

-- Create email_configurations_v2 table
CREATE TABLE IF NOT EXISTS email_configurations_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL,
    smtp_user TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    enable_ssl BOOLEAN DEFAULT false,
    from_name TEXT NOT NULL,
    from_email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates_v2 table
CREATE TABLE IF NOT EXISTS email_templates_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_configurations_v2_active ON email_configurations_v2(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_v2_active ON email_templates_v2(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_v2_type ON email_templates_v2(type);

-- Create updated_at trigger for email_configurations_v2
CREATE TRIGGER update_email_configurations_v2_updated_at 
    BEFORE UPDATE ON email_configurations_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for email_templates_v2
CREATE TRIGGER update_email_templates_v2_updated_at 
    BEFORE UPDATE ON email_templates_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON email_configurations_v2 TO authenticated;
GRANT ALL ON email_templates_v2 TO authenticated;

-- Enable Row Level Security
ALTER TABLE email_configurations_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates_v2 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users" ON email_configurations_v2
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON email_templates_v2
    FOR ALL TO authenticated USING (true);

-- Insert default email configuration
INSERT INTO email_configurations_v2 (
    smtp_host, 
    smtp_port, 
    smtp_user, 
    smtp_password, 
    enable_ssl, 
    from_name, 
    from_email, 
    is_active
) VALUES (
    'smtp.hostinger.com',
    587,
    'info@luxestaycations.in',
    '',
    false,
    'Luxe Staycations',
    'info@luxestaycations.in',
    false
) ON CONFLICT DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates_v2 (name, type, subject, html_content, text_content, is_active, is_default) VALUES
('Booking Confirmation', 'booking_confirmation', 'Booking Confirmed - {{propertyName}}', 
'<h1>Booking Confirmed!</h1><p>Dear {{guestName}}, your booking for {{propertyName}} has been confirmed.</p>',
'Booking Confirmed! Dear {{guestName}}, your booking for {{propertyName}} has been confirmed.', true, true),

('Booking Cancellation', 'booking_cancellation', 'Booking Cancelled - {{propertyName}}',
'<h1>Booking Cancelled</h1><p>Dear {{guestName}}, your booking for {{propertyName}} has been cancelled.</p>',
'Booking Cancelled. Dear {{guestName}}, your booking for {{propertyName}} has been cancelled.', true, true),

('Partner Request Confirmation', 'partner_request', 'Partnership Application Received',
'<h1>Partnership Application Received</h1><p>Thank you {{contactName}} for your partnership application.</p>',
'Partnership Application Received. Thank you {{contactName}} for your partnership application.', true, true),

('Consultation Request', 'consultation_request', 'Consultation Request Received',
'<h1>Consultation Request Received</h1><p>Thank you {{name}} for your consultation request.</p>',
'Consultation Request Received. Thank you {{name}} for your consultation request.', true, true),

('Contact Form Thank You', 'contact_form', 'Thank You for Your Message',
'<h1>Thank You for Your Message</h1><p>Dear {{name}}, thank you for contacting us. We will get back to you soon.</p>',
'Thank You for Your Message. Dear {{name}}, thank you for contacting us. We will get back to you soon.', true, true),

('Loyalty Points Earned', 'loyalty_points', 'You Earned {{points}} Loyalty Points!',
'<h1>You Earned {{points}} Loyalty Points!</h1><p>Dear {{userName}}, you have earned {{points}} loyalty points.</p>',
'You Earned {{points}} Loyalty Points! Dear {{userName}}, you have earned {{points}} loyalty points.', true, true)
ON CONFLICT DO NOTHING;
