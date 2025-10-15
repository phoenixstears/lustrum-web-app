CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS ladder_brackets (
     bracketId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     size INT NOT NULL,
     tournamentId UUID REFERENCES tournaments(tournamentId)
)
