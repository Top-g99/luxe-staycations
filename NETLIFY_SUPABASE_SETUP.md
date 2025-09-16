# 🚀 Netlify + Supabase Setup Guide

## Overview
Your Luxe Staycations project is hosted on Netlify and needs to be connected to Supabase for database functionality. This guide will help you set up Supabase and configure it for your Netlify deployment.

## Step 1: Create a Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `luxe-staycations` (or your preferred name)
     - **Database Password**: Create a strong password
     - **Region**: Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Supabase will set up your project (takes 2-3 minutes)
   - You'll see a progress indicator

## Step 2: Get Your Supabase Credentials

1. **Go to Project Settings**
   - In your Supabase dashboard, click the gear icon (Settings)
   - Go to "API" section

2. **Copy Your Credentials**
   - **Project URL**: Copy the URL (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon Key**: Copy the `anon` `public` key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Service Role Key**: Copy the `service_role` key (for admin operations)

## Step 3: Set Up Database Schema

1. **Go to SQL Editor**
   - In your Supabase dashboard, click "SQL Editor"
   - Click "New Query"

2. **Run the Schema Script**
   - Copy and paste the following SQL script:

```sql
-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    max_guests INTEGER DEFAULT 2,
    amenities TEXT[] DEFAULT '{}',
    image TEXT,
    featured BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'Villa',
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    host_name TEXT,
    host_image TEXT,
    property_size TEXT,
    year_built TEXT,
    floor_level TEXT,
    total_floors INTEGER DEFAULT 1,
    parking_spaces INTEGER DEFAULT 0,
    pet_friendly BOOLEAN DEFAULT false,
    smoking_allowed BOOLEAN DEFAULT false,
    wheelchair_accessible BOOLEAN DEFAULT false,
    neighborhood TEXT,
    distance_from_airport TEXT,
    distance_from_city_center TEXT,
    distance_from_beach TEXT,
    public_transport TEXT,
    check_in_time TEXT DEFAULT '15:00',
    check_out_time TEXT DEFAULT '11:00',
    early_check_in BOOLEAN DEFAULT false,
    late_check_out BOOLEAN DEFAULT false,
    cancellation_policy TEXT DEFAULT 'Flexible',
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    weekly_discount DECIMAL(5,2) DEFAULT 0,
    monthly_discount DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    location TEXT,
    attractions TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create callback_requests table
CREATE TABLE IF NOT EXISTS callback_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal_banners table
CREATE TABLE IF NOT EXISTS deal_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    button_text TEXT NOT NULL,
    button_link TEXT NOT NULL,
    video_url TEXT,
    fallback_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create special_requests table
CREATE TABLE IF NOT EXISTS special_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    request_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for most tables)
CREATE POLICY "Allow public read access to properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public read access to destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to deal_banners" ON deal_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true);

-- Create policies for insert operations
CREATE POLICY "Allow public insert to callback_requests" ON callback_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to special_requests" ON special_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Create policies for admin operations (you can restrict these later)
CREATE POLICY "Allow all operations on properties" ON properties FOR ALL USING (true);
CREATE POLICY "Allow all operations on destinations" ON destinations FOR ALL USING (true);
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on callback_requests" ON callback_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on deal_banners" ON deal_banners FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on special_requests" ON special_requests FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
```

3. **Execute the Script**
   - Click "Run" to execute the SQL script
   - You should see "Success. No rows returned" message

## Step 4: Configure Netlify Environment Variables

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Find your Luxe Staycations project

2. **Go to Site Settings**
   - Click on your site
   - Go to "Site settings" → "Environment variables"

3. **Add Environment Variables**
   - Click "Add variable"
   - Add these variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
   NEXT_PUBLIC_USE_LOCAL_STORAGE = false
   NEXT_PUBLIC_ENABLE_DEBUG_MODE = false
   ```

4. **Save and Redeploy**
   - Click "Save"
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

## Step 5: Test Your Setup

1. **Wait for Deployment**
   - Netlify will rebuild your site with the new environment variables
   - This usually takes 2-5 minutes

2. **Test Property Saving**
   - Go to your Netlify site URL
   - Navigate to `/admin/properties`
   - Try adding a new property
   - Check if it saves successfully

3. **Verify in Supabase**
   - Go back to your Supabase dashboard
   - Go to "Table Editor"
   - Check the "properties" table
   - You should see your new property there

## Troubleshooting

### If Properties Don't Save:
1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab

2. **Check Netlify Logs**
   - Go to Netlify dashboard → "Functions" → "Logs"
   - Look for any error messages

3. **Verify Environment Variables**
   - Make sure all environment variables are set correctly in Netlify
   - Check that there are no extra spaces or quotes

### Common Issues:
- **CORS Errors**: Supabase handles CORS automatically
- **Authentication Errors**: Make sure you're using the correct anon key
- **Database Connection**: Verify your Supabase URL is correct

## Security Notes

1. **Row Level Security**: The database has RLS enabled for security
2. **Public Access**: Currently set to allow public read/write (you can restrict this later)
3. **Service Role Key**: Keep this secret and only use it server-side

## Next Steps

Once everything is working:
1. Add some sample properties to test
2. Configure your domain settings in Netlify
3. Set up custom domain if needed
4. Consider adding authentication for admin features

## Support

If you encounter any issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Check Netlify documentation: https://docs.netlify.com
3. Review the browser console for error messages

---

**Your Luxe Staycations project will now save properties directly to Supabase! 🎉**
