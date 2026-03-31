-- Add join code to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS joinCode VARCHAR(6) UNIQUE;

-- Populate joinCode for existing rows
UPDATE teams SET joinCode = generate_join_code() WHERE joinCode IS NULL;

-- Set joinCode as NOT NULL
ALTER TABLE teams ALTER COLUMN joinCode SET NOT NULL;

-- Function to generate random 6-digit code
CREATE OR REPLACE FUNCTION generate_join_code() RETURNS VARCHAR(6) AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
