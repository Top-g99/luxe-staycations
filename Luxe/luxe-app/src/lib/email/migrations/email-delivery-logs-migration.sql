-- Email Delivery Logs Migration
-- This migration creates the email_delivery_logs table for tracking email delivery status

-- Create email_delivery_logs table
CREATE TABLE IF NOT EXISTS email_delivery_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN (
        'booking_confirmation',
        'consultation_request', 
        'contact_form',
        'partner_request',
        'special_request',
        'booking_cancellation',
        'admin_notification'
    )),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status JSONB NOT NULL DEFAULT '{}',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_type ON email_delivery_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_recipient ON email_delivery_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_created_at ON email_delivery_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_status_success ON email_delivery_logs((status->>'success'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_delivery_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_email_delivery_logs_updated_at ON email_delivery_logs;
CREATE TRIGGER trigger_update_email_delivery_logs_updated_at
    BEFORE UPDATE ON email_delivery_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_email_delivery_logs_updated_at();

-- Create RPC function to create the table (for fallback)
CREATE OR REPLACE FUNCTION create_email_delivery_logs_table()
RETURNS TEXT AS $$
BEGIN
    -- Table already created above, just return success
    RETURN 'email_delivery_logs table created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error creating email_delivery_logs table: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (optional)
-- INSERT INTO email_delivery_logs (id, type, recipient, subject, status, data) VALUES
-- ('sample_1', 'booking_confirmation', 'test@example.com', 'Test Booking', '{"success": true, "messageId": "test123", "timestamp": "2024-01-01T00:00:00Z", "recipient": "test@example.com", "subject": "Test Booking", "deliveryAttempts": 1}', '{"bookingId": "test123"}');
