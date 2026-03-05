CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS players (
     playerId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     discordId BIGINT NOT NULL,
     discordName TEXT NOT NULL,
     inGameName TEXT NOT NULL,
     tournamentId TEXT NOT NULL,
     teamId UUID REFERENCES teams(teamId) ON DELETE CASCADE,
     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(discordId, tournamentId)
)