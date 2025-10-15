CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS group_brackets (
     bracketId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     groupCount INT NOT NULL,
     teamsPerGroup INT NOT NULL,
     tournamentId UUID REFERENCES tournaments(tournamentId)
);


CREATE TABLE IF NOT EXISTS groups (
    bracketId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    groupBracketID UUID REFERENCES group_brackets(bracketId) ON DELETE CASCADE
)