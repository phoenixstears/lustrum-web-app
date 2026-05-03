-- Add max players per team configuration to tournaments
ALTER TABLE tournaments ADD COLUMN maxPlayersPerTeam INT DEFAULT 5;

-- Add constraint to ensure one team per player per tournament
ALTER TABLE players ADD CONSTRAINT unique_player_team_per_tournament UNIQUE(discordId, tournamentId);
