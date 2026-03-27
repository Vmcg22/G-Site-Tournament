-- G-SITE Tournament Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL DEFAULT 'Call of Duty',
    format VARCHAR(100) NOT NULL DEFAULT 'Trios Custom',
    num_matches INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gamertag VARCHAR(255)
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    match_number INTEGER NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tournament_id, match_number)
);

CREATE TABLE match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    placement INTEGER,
    kills INTEGER DEFAULT 0,
    placement_points INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    warnings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);

-- Indexes for leaderboard performance
CREATE INDEX idx_match_results_match ON match_results(match_id);
CREATE INDEX idx_match_results_team ON match_results(team_id);
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
