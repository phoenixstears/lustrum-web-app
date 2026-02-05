CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS teams (
     teamId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     teamName TEXT NOT NULL
)