# Loyalty Redemption Database Setup Guide

## Quick Fix for "Failed to fetch redemption requests" Error

The error you're seeing is because the database table `loyalty_redemption_requests` doesn't exist yet. Here's how to fix it:

## Option 1: Run the SQL Schema File (Recommended)

1. **Navigate to your project directory**:
   ```bash
   cd /Users/ishaankhan/Desktop/Luxe/luxe
   ```

2. **Run the SQL schema file**:
   ```bash
   psql -d your_database_name -f loyalty-redemption-requests-schema.sql
   ```

   Replace `your_database_name` with your actual database name.

## Option 2: Manual Database Setup

If you prefer to set up manually, run these SQL commands in your database:

```sql
-- Create the redemption requests table
CREATE TABLE IF NOT EXISTS loyalty_redemption_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID NOT NULL,
    jewels_to_redeem INTEGER NOT NULL CHECK (jewels_to_redeem > 0),
    redemption_reason TEXT NOT NULL,
    contact_preference VARCHAR(20) DEFAULT 'email' CHECK (contact_preference IN ('email', 'phone', 'both')),
    special_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_redemption_requests_guest_id ON loyalty_redemption_requests(guest_id);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_status ON loyalty_redemption_requests(status);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_created_at ON loyalty_redemption_requests(created_at);
```

## Option 3: Test with Sample Data

After creating the table, you can add some test data:

```sql
-- Insert sample redemption requests (optional)
INSERT INTO loyalty_redemption_requests (
    guest_id, 
    jewels_to_redeem, 
    redemption_reason, 
    contact_preference
) VALUES 
    ('00000000-0000-0000-0000-000000000001', 200, 'Discount on next villa booking', 'email'),
    ('00000000-0000-0000-0000-000000000002', 150, 'Special offer redemption', 'both');
```

## Verify Setup

After running the setup, you should see:

1. **No more console errors** in the admin panel
2. **Empty table with setup message** in the loyalty redemption admin page
3. **Ability to create new redemption requests** from the guest side

## What Happens After Setup

Once the database table is created:

1. **Uncomment the database code** in `/src/app/api/loyalty/redemption-requests/route.ts`
2. **Remove the temporary setup messages** from the API
3. **The system will be fully functional** for processing redemption requests

## Troubleshooting

### If you still get errors:

1. **Check database connection** - Make sure your Supabase credentials are correct
2. **Verify table exists** - Run `\dt loyalty_redemption_requests` in psql
3. **Check permissions** - Ensure your database user has CREATE and INSERT permissions
4. **Restart your Next.js server** after making database changes

### Common Issues:

- **"relation does not exist"** - Table wasn't created, run the SQL setup
- **"permission denied"** - Database user lacks permissions
- **"connection failed"** - Check your Supabase connection string

## Next Steps

After successful setup:

1. Test the admin panel - should show empty table with no errors
2. Test guest redemption requests - should submit successfully
3. Test admin approval process - should work end-to-end
4. Remove setup messages and enable full functionality

---

**Need Help?** Check the console for specific error messages and ensure your database connection is working properly.

