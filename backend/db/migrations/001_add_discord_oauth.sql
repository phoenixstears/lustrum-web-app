-- Migration: Add Discord OAuth2 support to players table
-- This migration adds Discord ID field and creates unique constraint to prevent duplicate signups
-- Run this only if you have an existing database with the players table

-- Add discordId column if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS discordId BIGINT;

-- Add createdAt column with default if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create unique constraint to prevent users from signing up twice for the same tournament
-- Note: This will fail if you have existing duplicate entries
-- If this fails, run the cleanup script below first

-- Drop the old constraint if it exists
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS players_uniquediscordidtournamentid;

-- Create the new constraint
ALTER TABLE players 
ADD CONSTRAINT players_uniquediscordidtournamentid UNIQUE(discordId, tournamentId);

-- If you need to cleanup existing data with NULL discordId:
-- First, you can see which players don't have a discord ID
-- SELECT * FROM players WHERE discordId IS NULL;

-- If you have existing NULL discordId values and want to populate them from discordName:
-- Note: This is optional and depends on your use case
-- UPDATE players 
-- SET discordId = (hash of discordName or assign unique IDs)
-- WHERE discordId IS NULL;
