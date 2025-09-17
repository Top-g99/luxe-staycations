# Supabase Integration Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose your organization and project name
4. Set a database password (save it securely)
5. Choose your region (preferably close to your users)

### 2. Get Your Project Credentials
1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

### 3. Set Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Set Up Database Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL commands
5. This will create all necessary tables and sample data

### 5. Configure Row Level Security (RLS)
The schema includes RLS policies. You may need to adjust them based on your requirements:

```sql
-- Example: Allow public read access to properties
CREATE POLICY "Allow public read access to properties" ON properties
FOR SELECT USING (true);

-- Example: Allow authenticated users to create bookings
CREATE POLICY "Allow authenticated users to create bookings" ON bookings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 📊 Database Tables Created

### Properties
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `location` (VARCHAR)
- `type` (VARCHAR)
- `amenities` (TEXT[])
- `images` (TEXT[])
- `featured` (BOOLEAN)
- `available` (BOOLEAN)
- `max_guests` (INTEGER)
- `bedrooms` (INTEGER)
- `bathrooms` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Destinations
- `id` (VARCHAR, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `image` (TEXT)
- `featured` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Bookings
- `id` (UUID, Primary Key)
- `booking_id` (VARCHAR, Unique)
- `property_id` (UUID, Foreign Key)
- `guest_name` (VARCHAR)
- `guest_email` (VARCHAR)
- `guest_phone` (VARCHAR)
- `check_in` (DATE)
- `check_out` (DATE)
- `guests` (INTEGER)
- `total_amount` (DECIMAL)
- `status` (VARCHAR)
- `payment_status` (VARCHAR)
- `special_requests` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### And more tables for:
- Payments
- Callback Requests
- Deal Banners
- Settings
- Special Requests

## 🔧 Features

### Hybrid Storage System
- **Online**: Uses Supabase as primary storage
- **Offline**: Falls back to IndexedDB
- **Sync**: Automatically syncs offline changes when back online

### Real-time Updates
- Live data synchronization across devices
- Real-time booking updates
- Instant property availability changes

### Advanced Features
- Full-text search capabilities
- Complex filtering and sorting
- Image storage and CDN
- Email notifications
- Payment processing integration

## 🛠️ Usage Examples

### Using the Hybrid Storage Manager

```typescript
import { hybridStorageManager } from '@/lib/hybridStorageManager';

// Get all properties (works online/offline)
const properties = await hybridStorageManager.getAllProperties();

// Create a new property
const newProperty = await hybridStorageManager.createProperty({
  name: 'Luxury Villa',
  description: 'Beautiful villa with ocean view',
  price: 15000,
  location: 'Goa',
  type: 'villa',
  amenities: ['pool', 'wifi', 'kitchen'],
  images: ['image1.jpg', 'image2.jpg'],
  featured: true,
  available: true,
  max_guests: 6,
  bedrooms: 3,
  bathrooms: 2
});

// Check online status
const isOnline = await hybridStorageManager.isOnline();

// Get sync queue length
const pendingSyncs = await hybridStorageManager.getSyncQueueLength();
```

### Direct Supabase Usage

```typescript
import { supabasePropertyService } from '@/lib/supabaseService';

// Get featured properties
const featured = await supabasePropertyService.getFeaturedProperties();

// Search properties
const searchResults = await supabasePropertyService.searchProperties({
  location: 'Goa',
  minPrice: 10000,
  maxPrice: 20000,
  guests: 4
});
```

## 🔒 Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled by default
- Policies control who can read/write data
- Public read access for properties and destinations
- Authenticated access for bookings and personal data

### Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly

### Data Validation
- Input validation on both client and server
- TypeScript interfaces ensure type safety
- Database constraints prevent invalid data

## 🚀 Deployment

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Deploy your Next.js app
3. Supabase automatically scales with your app

### Other Platforms
- Add environment variables to your hosting platform
- Ensure HTTPS is enabled
- Configure CORS if needed

## 📈 Monitoring

### Supabase Dashboard
- Monitor database performance
- View real-time logs
- Track API usage
- Manage backups

### Application Monitoring
- Check sync queue status
- Monitor offline/online transitions
- Track error rates
- Performance metrics

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Ensure `.env.local` is in project root
   - Restart development server
   - Check variable names match exactly

2. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure database is not paused

3. **RLS Policy Issues**
   - Check policy definitions
   - Verify user authentication
   - Test with different user roles

4. **Sync Issues**
   - Check browser console for errors
   - Verify IndexedDB is available
   - Clear browser storage if needed

### Debug Mode
Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG=true
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Supabase logs
3. Check browser console for errors
4. Verify environment variables
5. Test with a fresh browser session






