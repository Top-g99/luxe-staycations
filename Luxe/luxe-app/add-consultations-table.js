#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Adding Consultations Table to Supabase Database');
console.log('==================================================');

class ConsultationsTableSetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.schemaFile = path.join(this.projectRoot, 'supabase-schema.sql');
    }

    // Display setup instructions
    displayInstructions() {
        console.log('\n📋 SETUP INSTRUCTIONS FOR CONSULTATIONS TABLE');
        console.log('=============================================');

        console.log('\n🎯 STEP 1: ACCESS YOUR SUPABASE DASHBOARD');
        console.log('==========================================');
        console.log('1. Go to: https://supabase.com');
        console.log('2. Login to your account');
        console.log('3. Select your luxe-staycations project');

        console.log('\n🎯 STEP 2: ADD CONSULTATIONS TABLE');
        console.log('====================================');
        console.log('1. Click on "SQL Editor" in the left sidebar');
        console.log('2. Click "New query"');
        console.log('3. Copy and paste this SQL code:');
        console.log('');

        // Read and display the consultations table SQL
        if (fs.existsSync(this.schemaFile)) {
            const schemaContent = fs.readFileSync(this.schemaFile, 'utf8');
            const consultationsMatch = schemaContent.match(/-- Consultations Table[\s\S]*?CREATE TABLE IF NOT EXISTS consultations[\s\S]*?\);[\s\S]*?-- Settings Table/);

            if (consultationsMatch) {
                const consultationsSQL = consultationsMatch[0].replace('-- Settings Table', '').trim();
                console.log(consultationsSQL);
            } else {
                console.log('-- Consultations Table');
                console.log('CREATE TABLE IF NOT EXISTS consultations (');
                console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
                console.log('  name VARCHAR(255) NOT NULL,');
                console.log('  email VARCHAR(255) NOT NULL,');
                console.log('  phone VARCHAR(50) NOT NULL,');
                console.log('  property_type VARCHAR(100) NOT NULL,');
                console.log('  location VARCHAR(255) NOT NULL,');
                console.log('  bedrooms INTEGER DEFAULT 1,');
                console.log('  bathrooms INTEGER DEFAULT 1,');
                console.log('  max_guests INTEGER DEFAULT 1,');
                console.log('  property_description TEXT,');
                console.log('  consultation_type VARCHAR(50) NOT NULL CHECK (consultation_type IN (\'phone\', \'video\', \'in-person\')),');
                console.log('  preferred_date DATE NOT NULL,');
                console.log('  preferred_time VARCHAR(50) NOT NULL,');
                console.log('  additional_notes TEXT,');
                console.log('  status VARCHAR(50) DEFAULT \'pending\' CHECK (status IN (\'pending\', \'scheduled\', \'completed\', \'cancelled\')),');
                console.log('  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
                console.log('  scheduled_date TIMESTAMP WITH TIME ZONE,');
                console.log('  notes TEXT,');
                console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
                console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
                console.log(');');
            }
        }

        console.log('\n4. Click "Run" to execute the SQL');
        console.log('5. Verify the table is created in "Table Editor"');

        console.log('\n🎯 STEP 3: TEST THE INTEGRATION');
        console.log('================================');
        console.log('1. Run: npm run dev');
        console.log('2. Go to: http://localhost:3000/partner-with-us');
        console.log('3. Submit a consultation request');
        console.log('4. Check admin panel: http://localhost:3000/admin/consultation-requests');
        console.log('5. Verify the request appears in the database');

        console.log('\n🎯 STEP 4: VERIFY DATA PERSISTENCE');
        console.log('==================================');
        console.log('1. Submit multiple consultation requests');
        console.log('2. Refresh the admin page');
        console.log('3. Check that all requests are displayed');
        console.log('4. Use the "Clear All Data" button to test clearing');
        console.log('5. Verify data is cleared from the database');

        console.log('\n✅ SETUP COMPLETE!');
        console.log('==================');
        console.log('Your consultation system is now fully integrated with Supabase!');
        console.log('All consultation requests will be stored in the database and');
        console.log('will persist across server restarts.');
    }

    // Check if schema file exists
    checkSchemaFile() {
        if (fs.existsSync(this.schemaFile)) {
            console.log('✅ Database schema file found:', this.schemaFile);
            return true;
        } else {
            console.log('⚠️  Database schema file not found:', this.schemaFile);
            return false;
        }
    }

    // Run the setup
    run() {
        console.log('\n🔍 CHECKING PROJECT SETUP');
        console.log('=========================');

        this.checkSchemaFile();

        this.displayInstructions();

        console.log('\n🚀 Ready to integrate consultations with Supabase!');
        console.log('Follow the steps above to complete the setup.');
    }
}

// Run the setup
const setup = new ConsultationsTableSetup();
