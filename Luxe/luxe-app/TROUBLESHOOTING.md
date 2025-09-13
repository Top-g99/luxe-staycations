# Troubleshooting Guide - Terminal Process Failure

## Quick Fix Steps

### Step 1: Clear Everything and Start Fresh
```bash
cd luxe
rm -rf node_modules .next package-lock.json
npm install
```

### Step 2: Try Different Port
```bash
npm run dev -- -p 3001
```

### Step 3: Use the Custom Start Script
```bash
node start-server.js
```

### Step 4: Check Node.js Version
```bash
node --version
# Should be 16.x or higher
```

## Common Issues and Solutions

### Issue 1: Port 3000 Already in Use
**Solution:**
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

### Issue 2: Missing Dependencies
**Solution:**
```bash
npm install
# If that fails, try:
npm install --force
```

### Issue 3: TypeScript Errors
**Solution:**
```bash
npx tsc --noEmit
# Fix any errors shown, then try again
```

### Issue 4: Memory Issues
**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## Alternative Startup Methods

### Method 1: Direct Node.js
```bash
npx next dev
```

### Method 2: Yarn (if available)
```bash
yarn dev
```

### Method 3: Custom Script
```bash
node start-server.js
```

## Test the Setup

1. **Visit Test Page**: Go to `http://localhost:3000/test-page`
2. **Check API**: Go to `http://localhost:3000/api/test`
3. **Admin Panel**: Go to `http://localhost:3000/admin`

## What's Fixed

✅ **Admin Destinations**: Now uses API instead of local storage  
✅ **Admin Properties**: Now uses API instead of local storage  
✅ **Homepage**: Fetches data from APIs  
✅ **Data Flow**: Admin → API → Homepage (working)  

## Test Data Available

**Destinations:**
- Lonavala
- Khandala  
- Mahabaleshwar

**Properties:**
- Luxury Villa in Lonavala
- Mountain View Resort

## If Nothing Works

1. **Restart your computer**
2. **Update Node.js** to latest LTS version
3. **Try a different terminal** (Terminal, iTerm, VS Code terminal)
4. **Check firewall/antivirus** settings
5. **Try running as administrator** (Windows) or with sudo (Mac/Linux)

## Contact Support

If you're still having issues, please provide:
- Node.js version: `node --version`
- npm version: `npm --version`
- Operating system
- Error message details

