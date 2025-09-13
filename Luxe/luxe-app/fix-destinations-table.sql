-- Fix the destinations table to auto-generate IDs
-- Run this in your Supabase SQL Editor

-- First, let's see what's in the current destinations table
SELECT * FROM destinations LIMIT 5;

-- Add a default value for the id column if it doesn't exist
-- Note: This might require dropping and recreating the table if the column type is VARCHAR

-- Option 1: Try to alter the column (if it's already UUID)
-- ALTER TABLE destinations ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Option 2: If the above doesn't work, recreate the table
-- This will preserve existing data by copying it first

-- Step 1: Create a backup of existing data
CREATE TEMP TABLE destinations_backup AS SELECT * FROM destinations;

-- Step 2: Drop the existing table
DROP TABLE destinations CASCADE;

-- Step 3: Recreate the table with proper ID generation
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Restore the data with new UUIDs
INSERT INTO destinations (name, description, image, featured, created_at, updated_at)
SELECT name, description, image, featured, created_at, updated_at
FROM destinations_backup;

-- Step 5: Verify the data
SELECT * FROM destinations;

-- Step 6: Clean up
DROP TABLE destinations_backup;






