CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS players (
     playerId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     discordName TEXT NOT NULL,
     inGameName TEXT NOT NULL,
     teamId UUID REFERENCES teams(teamId) ON DELETE CASCADE
)