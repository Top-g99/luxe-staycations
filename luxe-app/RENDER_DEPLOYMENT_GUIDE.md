# 🚀 Render Deployment Guide for Luxe Staycations

## Quick Deploy to Render

Your Luxe Staycations platform is ready to deploy to Render! Here's how to get it live:

### Step 1: Connect to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** and select "Web Service"
4. **Connect your GitHub repository** (Luxe project)

### Step 2: Configure the Service

1. **Name**: `luxe-staycations`
2. **Environment**: `Node`
3. **Build Command**: `npm install && npm run build:prod`
4. **Start Command**: `npm run start:prod`
5. **Plan**: `Starter` (Free tier)

### Step 3: Environment Variables

Add these environment variables in Render dashboard:

```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com

# Supabase Configuration (Add your real credentials)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,video/*,application/pdf

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=luxe-media
NEXT_PUBLIC_PROPERTIES_BUCKET=luxe-properties
NEXT_PUBLIC_DESTINATIONS_BUCKET=luxe-destinations
NEXT_PUBLIC_BANNERS_BUCKET=luxe-banners

# Development Override
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# Optional: Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for build** (5-10 minutes)
3. **Your app will be live** at `https://your-app-name.onrender.com`

## 🎯 What's Included

✅ **Complete Luxury Villa Booking Platform**
- Property management system
- Booking and reservation system
- Admin dashboard
- Guest portal
- Partner portal
- Loyalty program
- Payment integration (Razorpay)
- File upload system
- Responsive design

✅ **Production Ready Features**
- Optimized build process
- Environment configuration
- Health checks
- Auto-deployment
- Error handling
- Performance optimization

## 🔧 Post-Deployment Setup

### 1. Set Up Supabase (Required)

1. **Create Supabase Project**: https://supabase.com
2. **Run Database Schema**: Use `supabase-schema.sql`
3. **Create Storage Buckets**: 
   - `luxe-media`
   - `luxe-properties`
   - `luxe-destinations`
   - `luxe-banners`
4. **Update Environment Variables** with your Supabase credentials

### 2. Configure Domain (Optional)

1. **Go to your Render service**
2. **Click "Settings"**
3. **Add custom domain** (e.g., `luxe-staycations.com`)

### 3. Set Up Monitoring

1. **Enable logs** in Render dashboard
2. **Set up alerts** for downtime
3. **Monitor performance** metrics

## 🚀 Available Commands

```bash
# Development
npm run dev

# Production Build
npm run build:prod

# Production Start
npm run start:prod

# Deploy Check
npm run deploy:check
```

## 📊 Performance Optimization

Your app includes:
- **Next.js 15** with App Router
- **Static generation** for better performance
- **Image optimization** with Next.js Image
- **Code splitting** for faster loading
- **Material-UI** for consistent design
- **Responsive design** for all devices

## 🔒 Security Features

- **Environment variables** for sensitive data
- **Input validation** on all forms
- **File upload restrictions**
- **CORS configuration**
- **Rate limiting** (can be added)

## 📱 Mobile Responsive

Your platform works perfectly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🎨 Design System

- **Luxury brown/white theme**
- **Consistent typography**
- **Professional UI components**
- **Smooth animations**
- **Accessible design**

## 🆘 Support

If you encounter any issues:

1. **Check Render logs** in dashboard
2. **Verify environment variables**
3. **Test locally** with `npm run dev`
4. **Check Supabase connection**

## 🎉 Success!

Once deployed, your Luxe Staycations platform will be:
- ✅ Live and accessible worldwide
- ✅ Production-ready with Supabase
- ✅ Optimized for performance
- ✅ Mobile-responsive
- ✅ Professional and luxurious

**Your luxury villa booking platform is ready to serve guests!** 🏖️✨
