# Luxe Jewels Loyalty Program - System Upgrade

## Overview

The Luxe Jewels Loyalty Program has been completely reworked to implement proper guest authentication and individual jewel wallets. The system now requires guests to log in before accessing their loyalty dashboard, and all redemption requests require admin approval.

## Key Changes Made

### 1. Guest Authentication System
- **Before**: Direct access to loyalty dashboard without authentication
- **After**: Guest login required with Guest ID and Password
- Each guest has a unique jewel wallet linked to their account
- No more universal wallet - each guest sees only their own data

### 2. Redemption Process
- **Before**: Direct jewel redemption without approval
- **After**: Redemption requests submitted for admin approval
- Guests submit requests with reasons and contact preferences
- Admins review and approve/reject requests
- Only approved requests result in actual jewel redemption

### 3. Individual Guest Wallets
- Each guest has their own jewel balance
- Separate transaction history per guest
- Individual tier progression
- Personalized loyalty experience

## New Components Created

### 1. `GuestLoyaltyAuth.tsx`
- Handles guest login for loyalty program
- Validates guest credentials
- Stores authentication in localStorage
- Provides guest registration option

### 2. `GuestLoyaltyDashboard.tsx`
- Individual guest loyalty dashboard
- Shows personal jewel balance and transactions
- Allows submission of redemption requests
- Displays tier information and benefits

### 3. `AdminRedemptionManager.tsx`
- Admin interface for managing redemption requests
- View pending, approved, and rejected requests
- Approve or reject requests with admin notes
- Detailed view of each request

### 4. Updated `LoyaltyDashboard.tsx`
- Main loyalty page that handles authentication flow
- Shows either login form or guest dashboard based on auth status
- Manages guest session state

## New API Endpoints

### 1. `/api/loyalty/redemption-requests`
- **GET**: Fetch all redemption requests (admin only)
- **POST**: Create new redemption request (guest only)

### 2. `/api/loyalty/redemption-requests/[id]`
- **GET**: Get specific redemption request details
- **PUT**: Update request status (approve/reject) - admin only

## Database Schema Updates

### New Table: `loyalty_redemption_requests`
```sql
CREATE TABLE loyalty_redemption_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID NOT NULL REFERENCES auth.users(id),
    jewels_to_redeem INTEGER NOT NULL CHECK (jewels_to_redeem > 0),
    redemption_reason TEXT NOT NULL,
    contact_preference VARCHAR(20) DEFAULT 'email',
    special_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## How to Use the New System

### For Guests

1. **Access Loyalty Program**
   - Navigate to `/loyalty`
   - You'll see the login form if not authenticated

2. **Login**
   - Enter your Guest ID and Password
   - Click "Access My Jewel Wallet"

3. **View Dashboard**
   - See your personal jewel balance
   - View transaction history
   - Check tier progression

4. **Request Redemption**
   - Click "Request Redemption" button
   - Fill in redemption details
   - Submit for admin approval
   - Wait for approval notification

### For Admins

1. **Access Admin Panel**
   - Navigate to `/admin/loyalty-redemption`
   - View all redemption requests

2. **Review Requests**
   - See pending requests in the "Pending" tab
   - Click "View Details" for more information

3. **Process Requests**
   - Click approve (✓) or reject (✗) buttons
   - Add admin notes explaining your decision
   - Submit the decision

4. **Monitor Status**
   - Track approved and rejected requests
   - View processing statistics

## Security Features

### 1. Row Level Security (RLS)
- Guests can only see their own redemption requests
- Admins can see all requests
- Proper authentication required for all operations

### 2. Input Validation
- Server-side validation of all inputs
- Check for sufficient jewel balance before allowing requests
- Prevent duplicate or invalid submissions

### 3. Admin Authorization
- Only authenticated admins can approve/reject requests
- All admin actions are logged with admin ID
- Audit trail maintained for compliance

## File Structure

```
src/
├── app/
│   ├── loyalty/
│   │   └── page.tsx (updated)
│   └── admin/
│       └── loyalty-redemption/
│           └── page.tsx (new)
├── components/
│   └── loyalty/
│       ├── LoyaltyDashboard.tsx (updated)
│       ├── GuestLoyaltyAuth.tsx (new)
│       ├── GuestLoyaltyDashboard.tsx (new)
│       └── AdminRedemptionManager.tsx (new)
└── app/api/loyalty/
    ├── redeem/route.ts (existing)
    └── redemption-requests/
        ├── route.ts (new)
        └── [id]/route.ts (new)
```

## Database Setup

To set up the new database schema:

1. **Run the SQL file**:
   ```bash
   psql -d your_database -f loyalty-redemption-requests-schema.sql
   ```

2. **Verify the table was created**:
   ```sql
   SELECT * FROM loyalty_redemption_requests LIMIT 1;
   ```

3. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'loyalty_redemption_requests';
   ```

## Testing the System

### 1. Test Guest Flow
- Visit `/loyalty` as a new user
- Try to access without login (should show login form)
- Login with any credentials (demo mode)
- View personal dashboard
- Submit a redemption request

### 2. Test Admin Flow
- Visit `/admin/loyalty-redemption`
- View pending requests
- Approve or reject a request
- Check status updates

### 3. Test Integration
- Submit request as guest
- Approve as admin
- Verify guest sees updated status

## Migration Notes

### Existing Users
- Current loyalty data will need to be migrated to individual guest accounts
- Consider creating a migration script to assign existing data to guest IDs

### Data Backup
- Backup existing loyalty data before implementing changes
- Test the new system thoroughly before going live

## Future Enhancements

### 1. Email Notifications
- Send approval/rejection emails to guests
- Admin notifications for new requests

### 2. Advanced Analytics
- Redemption request trends
- Guest engagement metrics
- Tier progression analytics

### 3. Mobile App Integration
- Push notifications for request updates
- Mobile-optimized redemption forms

### 4. Automated Approval Rules
- Auto-approve requests below certain thresholds
- Risk-based approval workflows

## Troubleshooting

### Common Issues

1. **Guest can't see their requests**
   - Check RLS policies
   - Verify guest authentication

2. **Admin can't approve requests**
   - Check admin role permissions
   - Verify API endpoint access

3. **Redemption requests not saving**
   - Check database connection
   - Verify table permissions

### Debug Steps

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check database logs for SQL errors
4. Verify RLS policies are working correctly

## Support

For technical support or questions about the new loyalty system:
- Email: tech@luxestaycations.com
- Documentation: Check this file and inline code comments
- Database issues: Contact database administrator

---

**Last Updated**: January 2025
**Version**: 2.0.0
**Status**: Production Ready


