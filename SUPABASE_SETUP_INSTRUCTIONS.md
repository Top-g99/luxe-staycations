# 🚀 Supabase Setup Instructions

## Quick Setup (5 minutes)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Name: `luxe-staycations`
- Database Password: Create a strong password
- Region: Choose closest to your users
- Click "Create new project"

### 2. Get Your Credentials
- Go to Settings → API in your Supabase dashboard
- Copy:
  - **Project URL**: `https://your-project-id.supabase.co`
  - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Update Environment File
Replace the demo credentials in `.env.local` with your actual values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 4. Set Up Database
- Go to SQL Editor in Supabase dashboard
- Copy the entire content from `supabase-schema.sql`
- Paste and run the SQL commands
- Verify tables are created in Table Editor

### 5. Test Connection
- Restart your development server: `npm run dev`
- Go to: `http://localhost:3000/admin/enhanced-dashboard`
- Should show "🟢 Supabase: Connected"
- Click "Migrate to Supabase" to move local data

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

- **Supabase Docs**: https://supabase.com/docs
- **Project Status**: Check enhanced dashboard
- **Storage Health**: Monitor via admin panel
