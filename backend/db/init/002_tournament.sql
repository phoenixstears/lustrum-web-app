CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS tournaments (
     tournamentId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     gameName TEXT NOT NULL,
     startTime TIMESTAMP,
     bracketType INT
)
