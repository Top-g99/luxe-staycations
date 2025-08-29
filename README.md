# 🏠 Luxe Staycations - Owner Booking System

A comprehensive villa booking platform with advanced owner self-booking capabilities, real-time availability management, and complete admin control panel.

## 🚀 Quick Start with GitHub Codespaces

### **Option 1: One-Click Setup**
1. Click the green "Code" button above
2. Select "Codespaces" tab
3. Click "Create codespace on main"
4. Wait for environment to load (1-2 minutes)
5. Open the forwarded port when prompted

### **Option 2: Manual Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 Features

### **🏠 Owner Self-Booking System**
- Property owners can book their own properties
- Real-time availability checking
- Purpose-based booking categories
- Special requests support

### **👨‍💼 Admin Management**
- Complete booking request management
- Approve/reject owner bookings
- Real-time notifications
- Analytics and reporting

### **🔄 Real-Time Availability**
- Automatic date blocking
- Conflict prevention
- Cross-system synchronization
- No double bookings

### **🎨 Brand Consistent UI**
- Beautiful brown/black gradient theme
- Responsive design
- Material-UI components
- Consistent styling

## 📱 Access Points

Once running, access these URLs:

### **Main Site**
- **Homepage:** `http://localhost:3000`
- **Partner Application:** `http://localhost:3000/partner-with-us`

### **Partner System**
- **Partner Login:** `http://localhost:3000/partner/login`
- **Partner Dashboard:** `http://localhost:3000/partner/dashboard`

### **Admin Panel**
- **Admin Dashboard:** `http://localhost:3000/admin`
- **Owner Bookings:** `http://localhost:3000/admin/owner-bookings`
- **Partner Applications:** `http://localhost:3000/admin/partner-applications`

## 🧪 Testing the Owner Booking System

### **Complete Test Flow:**
1. **Create Partner Account:** Go to `/partner-with-us`
2. **Approve Partner:** Go to `/admin/partner-applications`
3. **Login as Partner:** Go to `/partner/login`
4. **Test Owner Booking:** Click "Book My Property" in dashboard
5. **Manage Bookings:** Go to `/admin/owner-bookings`

## 🛠 Tech Stack

- **Framework:** Next.js 15.5.0
- **UI Library:** Material-UI (MUI)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Data Storage:** localStorage (for demo)
- **Language:** TypeScript

## 📁 Project Structure

```
luxe/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable React components
│   ├── contexts/           # React context providers
│   ├── lib/                # Data managers and utilities
│   └── styles/             # Global styles
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Environment Variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=development
```

## 🎉 What's Included

### **✅ Complete Owner Booking System**
- Owner booking form with validation
- Real-time availability checking
- Admin approval workflow
- Property date blocking

### **✅ Partner Portal**
- Partner authentication
- Property management
- Booking dashboard
- Revenue tracking

### **✅ Admin Panel**
- Complete booking management
- Partner application processing
- Analytics and reporting
- Real-time notifications

### **✅ Modern UI/UX**
- Responsive design
- Brand-consistent styling
- Interactive components
- Smooth animations

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push
3. Get production URL instantly

### **Netlify**
1. Build command: `npm run build`
2. Publish directory: `out`
3. Deploy from Git

## 📞 Support

For issues or questions:
1. Check the troubleshooting guide
2. Review the documentation
3. Create an issue in this repository

---

**Built with ❤️ for Luxe Staycations**

