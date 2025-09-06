#!/bin/bash

# Loyalty Rules Database Setup Script
# This script helps you set up the loyalty rules system

echo "💎 Luxe Jewels Loyalty Rules Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "loyalty-rules-schema.sql" ]; then
    echo "❌ Error: loyalty-rules-schema.sql not found!"
    echo "Please run this script from the luxe directory:"
    echo "cd /Users/ishaankhan/Desktop/Luxe/luxe"
    exit 1
fi

echo "✅ Found loyalty-rules-schema.sql"
echo ""

# Get database connection details
echo "Please provide your database connection details:"
read -p "Database name: " DB_NAME
read -p "Database host (default: localhost): " DB_HOST
read -p "Database port (default: 5432): " DB_PORT
read -p "Database user (default: postgres): " DB_USER

# Set defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}

echo ""
echo "🔧 Setting up loyalty rules database..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo ""

# Test database connection
echo "Testing database connection..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo "Please check your database credentials and try again."
    exit 1
fi

echo ""
echo "📊 Creating loyalty rules tables and inserting default rules..."

# Run the schema file
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f loyalty-rules-schema.sql; then
    echo ""
    echo "🎉 Loyalty Rules System Setup Complete!"
    echo ""
    echo "✅ What was created:"
    echo "   - loyalty_rules table with 18 default rules"
    echo "   - loyalty_rule_history table for audit trail"
    echo "   - Helper functions for calculations"
    echo "   - Row Level Security policies"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Go to /admin/loyalty-rules in your admin panel"
    echo "   2. You'll see all the default rules configured"
    echo "   3. Start customizing them to match your business needs"
    echo ""
    echo "💡 Default rules include:"
    echo "   - ₹100 spent = 1 jewel"
    echo "   - 1 jewel = ₹1 redemption value"
    echo "   - Tier thresholds (Bronze, Silver, Gold, Platinum, Diamond)"
    echo "   - Bonus rules for first booking, referrals, reviews"
    echo "   - Expiry policies (365 days for jewels)"
    echo ""
    echo "🔧 You can now edit any rule through the admin interface!"
else
    echo ""
    echo "❌ Setup failed! Please check the error messages above."
    echo "Common issues:"
    echo "  - Database user doesn't have CREATE permissions"
    echo "  - Tables already exist (safe to ignore)"
    echo "  - Database connection issues"
    exit 1
fi

