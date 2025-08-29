# 🚀 Supabase Setup Guide for Luxe Staycations

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Click "New Project"**
4. **Fill in details:**
   - **Name**: `luxe-staycations`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. **Click "Create new project"**
6. **Wait for setup** (2-3 minutes)

## Step 2: Get Your Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Environment File

1. **Open `.env.local`** in your project
2. **Replace the placeholders:**

```bash
# Replace these lines:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# With your actual values:
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Schema

1. **Go to SQL Editor** in Supabase dashboard
2. **Copy the entire content** from `supabase-schema.sql`
3. **Paste and run** the SQL commands
4. **Verify tables are created** in Table Editor

## Step 5: Test Connection

1. **Restart your development server**
2. **Go to**: `http://localhost:3001/admin/enhanced-dashboard`
3. **Check**: Should show "🟢 Supabase: Connected"
4. **Click**: "Migrate to Supabase" to move local data

## Step 6: Verify Everything Works

1. **Add a test property** via admin panel
2. **Check**: Data appears in Supabase dashboard
3. **Test**: Offline/online functionality
4. **Verify**: Backup and sync features

## 🛡️ Backup Features Now Active

- ✅ **Cloud Storage**: All data in Supabase
- ✅ **Local Cache**: IndexedDB for offline access
- ✅ **Auto Sync**: Changes sync automatically
- ✅ **Health Monitoring**: Connection status tracking
- ✅ **Data Migration**: One-click local to cloud transfer

## 🆘 Troubleshooting

**If connection fails:**
1. Check credentials in `.env.local`
2. Verify Supabase project is active
3. Ensure schema is properly installed
4. Restart development server

**If data doesn't sync:**
1. Check network connection
2. Verify Supabase is online
3. Use "Force Sync" button in dashboard
4. Check browser console for errors

## 📞 Need Help?

- **Supabase Docs**: https://asupabase.com/docs
- **Project Status**: Check enhanced dashboard
- **Storage Health**: Monitor via admin panel


