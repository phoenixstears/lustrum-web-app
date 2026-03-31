-- Make teamId NOT NULL to enforce team membership
ALTER TABLE players ALTER COLUMN teamId SET NOT NULL;

-- Remove any existing solo players (if any)
DELETE FROM players WHERE teamId IS NULL;


-- Create team
INSERT INTO teams (teamName, joinCode) 
VALUES ('My Team', '654321')
RETURNING teamId, teamName, joinCode;

-- Result: teamId, teamName, joinCode

-- Create player in team
INSERT INTO players (discordId, discordName, inGameName, tournamentId, teamId)
VALUES (
  987654326,
  'JohnDoe#56786',
  'JD_Gaming6',
  '994538dc-7f14-41e2-9c3c-8d74588070bd',  -- tournament ID
  '85cba861-b003-402f-ac38-1de8ed51b2d3'   -- team ID from creation
)
RETURNING playerId, discordName, inGameName, teamId;