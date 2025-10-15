CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS matches (
     matchId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     team1Id UUID NOT NULL REFERENCES teams(teamId),
     team2Id UUID NOT NULL REFERENCES teams(teamId),
     result INT,
     nextMatch UUID REFERENCES matches(matchId) NOT NULL, 
     groupBracketId UUID REFERENCES group_brackets(bracketId),
     ladderBracketId UUID REFERENCES ladder_brackets(bracketId),
     CHECK (
        (groupBracketId IS NOT NULL AND ladderBracketId IS NULL)
        OR (groupBracketId IS NULL AND ladderBracketId IS NOT NULL)
    )
)