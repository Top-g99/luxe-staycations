#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SENIOR DEV ENGINEER - Complete Project Backup & Upload System');
console.log('==============================================================');

class ProjectBackup {
    constructor() {
        this.projectRoot = process.cwd();
        this.backupDir = path.join(this.projectRoot, 'luxe-complete-backup');
        this.uploadDir = path.join(this.projectRoot, 'luxe-upload-ready');
    }

    // Create complete project backup
    createBackup() {
        console.log('📦 Creating complete project backup...');

        try {
            // Create backup directory
            if (fs.existsSync(this.backupDir)) {
                fs.rmSync(this.backupDir, { recursive: true, force: true });
            }
            fs.mkdirSync(this.backupDir, { recursive: true });

            // Create upload-ready directory
            if (fs.existsSync(this.uploadDir)) {
                fs.rmSync(this.uploadDir, { recursive: true, force: true });
            }
            fs.mkdirSync(this.uploadDir, { recursive: true });

            // Copy all project files
            this.copyDirectory(this.projectRoot, this.backupDir);
            this.copyDirectory(this.projectRoot, this.uploadDir);

            // Remove unnecessary files from upload
            this.cleanUploadDirectory();

            console.log('✅ Complete backup created successfully');
            return true;
        } catch (error) {
            console.error('❌ Backup failed:', error.message);
            return false;
        }
    }

    // Copy directory recursively
    copyDirectory(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            // Skip certain directories and files
            if (this.shouldSkip(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    // Check if file/directory should be skipped
    shouldSkip(name) {
        const skipList = [
            'node_modules',
            '.next',
            '.git',
            'luxe-complete-backup',
            'luxe-upload-ready',
            '.DS_Store',
            '*.log',
            'npm-debug.log*',
            'yarn-debug.log*',
            'yarn-error.log*'
        ];

        return skipList.some(skip => {
            if (skip.includes('*')) {
                return name.includes(skip.replace('*', ''));
            }
            return name === skip;
        });
    }

    // Clean upload directory
    cleanUploadDirectory() {
        console.log('🧹 Cleaning upload directory...');

        const removeList = [
            'node_modules',
            '.next',
            '.git',
            '*.log',
            'npm-debug.log*',
            'yarn-debug.log*',
            'yarn-error.log*'
        ];

        removeList.forEach(item => {
            const itemPath = path.join(this.uploadDir, item);
            if (fs.existsSync(itemPath)) {
                try {
                    if (fs.lstatSync(itemPath).isDirectory()) {
                        fs.rmSync(itemPath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(itemPath);
                    }
                } catch (error) {
                    // Ignore errors for non-existent files
                }
            }
        });
    }

    // Generate upload instructions
    generateUploadInstructions() {
        const instructions = `
# 🚀 LUXE STAYCATIONS - COMPLETE PROJECT UPLOAD

## 📦 What's Included in This Backup

### ✅ Complete Owner Booking System
- Owner booking management (ownerBookingManager.ts)
- Interactive booking form (OwnerBookingForm.tsx)
- Admin management interface (owner-bookings/page.tsx)

### ✅ Partner Portal
- Authentication system (partnerAuthManager.ts)
- Dashboard management (partnerDashboardManager.ts)
- Partner login and dashboard pages

### ✅ Admin Panel
- Complete admin interface for owner bookings
- Partner application management
- Real-time notifications

### ✅ Brand Styling
- Consistent design system (BrandStyles.tsx)
- Brown/black gradient theme
- Professional UI components

### ✅ Real-Time Features
- Availability management
- Conflict prevention
- Live updates across all systems

## 🚀 How to Upload to GitHub

### Option 1: Web Interface (Recommended)
1. Go to your GitHub repository
2. Click "Add file" → "Upload files"
3. Drag the entire contents of 'luxe-upload-ready' folder
4. Add commit message: "Upload complete Luxe Staycations with owner booking system"
5. Click "Commit changes"

### Option 2: GitHub Desktop
1. Download GitHub Desktop from https://desktop.github.com/
2. Clone your repository
3. Replace all contents with 'luxe-upload-ready' folder contents
4. Commit and push changes

## 📁 Project Structure
\`\`\`
luxe/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── owner-bookings/
│   │   ├── partner/
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   └── partner-with-us/
│   ├── components/
│   │   ├── OwnerBookingForm.tsx
│   │   ├── HeroSlider.tsx
│   │   └── BrandStyles.tsx
│   ├── contexts/
│   │   └── BookingContext.tsx
│   └── lib/
│       ├── ownerBookingManager.ts
│       ├── partnerAuthManager.ts
│       └── partnerDashboardManager.ts
├── package.json
└── README.md
\`\`\`

## 🎯 After Upload
1. Open your repository in GitHub Codespaces
2. Run: npm install
3. Run: npm run dev
4. Access your complete application

## 📱 Access Points
- Homepage: http://localhost:3000
- Partner Application: /partner-with-us
- Partner Login: /partner/login
- Admin Panel: /admin
- Owner Bookings: /admin/owner-bookings

---
Generated by Senior Dev Engineer Backup System
`;

        const instructionsPath = path.join(this.uploadDir, 'UPLOAD_INSTRUCTIONS.md');
        fs.writeFileSync(instructionsPath, instructions);
        console.log('✅ Upload instructions generated');
    }

    // Generate package.json summary
    generatePackageSummary() {
        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

                const summary = `
# 📦 Package Summary

**Project:** ${packageJson.name}
**Version:** ${packageJson.version}
**Description:** ${packageJson.description || 'Villa booking platform with owner self-booking system'}

## 🛠 Dependencies
- Next.js: ${packageJson.dependencies?.next || 'Not specified'}
- React: ${packageJson.dependencies?.react || 'Not specified'}
- Material-UI: ${packageJson.dependencies?.['@mui/material'] || 'Not specified'}

## 🚀 Scripts
- dev: ${packageJson.scripts?.dev || 'Not specified'}
- build: ${packageJson.scripts?.build || 'Not specified'}
- start: ${packageJson.scripts?.start || 'Not specified'}

---
Generated by Backup System
`;

                const summaryPath = path.join(this.uploadDir, 'PACKAGE_SUMMARY.md');
                fs.writeFileSync(summaryPath, summary);
                console.log('✅ Package summary generated');
            }
        } catch (error) {
            console.log('⚠️ Could not generate package summary');
        }
    }

    // Create backup report
    createBackupReport() {
        const report = `
# 🚀 LUXE STAYCATIONS - BACKUP REPORT

## 📅 Backup Date
${new Date().toISOString()}

## 📊 Backup Statistics
- Total files backed up: ${this.countFiles(this.backupDir)}
- Upload-ready files: ${this.countFiles(this.uploadDir)}
- Backup size: ${this.getDirectorySize(this.backupDir)} MB
- Upload size: ${this.getDirectorySize(this.uploadDir)} MB

## ✅ Features Included
- [x] Complete Owner Booking System
- [x] Partner Portal with Authentication
- [x] Admin Panel for Management
- [x] Real-time Availability Management
- [x] Brand-consistent UI Design
- [x] Professional Development Setup

## 📁 Backup Locations
- Complete Backup: ${this.backupDir}
- Upload Ready: ${this.uploadDir}

## 🎯 Next Steps
1. Upload 'luxe-upload-ready' contents to GitHub
2. Open in GitHub Codespaces
3. Run: npm install && npm run dev
4. Access your complete application

---
Generated by Senior Dev Engineer Backup System
`;

        const reportPath = path.join(this.backupDir, 'BACKUP_REPORT.md');
        fs.writeFileSync(reportPath, report);
        console.log('✅ Backup report generated');
    }

    // Count files in directory
    countFiles(dir) {
        let count = 0;
        const countRecursive = (currentDir) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile()) {
                    count++;
                } else if (entry.isDirectory()) {
                    countRecursive(path.join(currentDir, entry.name));
                }
            }
        };
        countRecursive(dir);
        return count;
    }

    // Get directory size in MB
    getDirectorySize(dir) {
        let size = 0;
        const sizeRecursive = (currentDir) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isFile()) {
                    size += fs.statSync(fullPath).size;
                } else if (entry.isDirectory()) {
                    sizeRecursive(fullPath);
                }
            }
        };
        sizeRecursive(dir);
        return (size / (1024 * 1024)).toFixed(2);
    }

    // Main backup process
    async execute() {
        console.log('🚀 Starting complete project backup...\n');

        try {
            // Step 1: Create backup
            if (!this.createBackup()) {
                throw new Error('Backup creation failed');
            }

            // Step 2: Generate instructions
            this.generateUploadInstructions();

            // Step 3: Generate package summary
            this.generatePackageSummary();

            // Step 4: Create backup report
            this.createBackupReport();

            console.log('\n🎉 BACKUP COMPLETED SUCCESSFULLY!');
            console.log('====================================');
            console.log(`📦 Complete Backup: ${this.backupDir}`);
            console.log(`📤 Upload Ready: ${this.uploadDir}`);
            console.log('\n📋 Next Steps:');
            console.log('1. Go to your GitHub repository');
            console.log('2. Click "Add file" → "Upload files"');
            console.log('3. Drag contents of "luxe-upload-ready" folder');
            console.log('4. Commit with message: "Upload complete Luxe Staycations"');
            console.log('5. Open in GitHub Codespaces');
            console.log('6. Run: npm install && npm run dev');

        } catch (error) {
            console.error('\n❌ Backup process failed:', error.message);
            process.exit(1);
        }
    }
}

// Execute backup
const backup = new ProjectBackup();
backup.execute();