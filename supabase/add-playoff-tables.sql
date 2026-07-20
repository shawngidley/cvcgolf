-- Add playoff_lineups and playoff_results tables for the 2026 playoffs
-- (Semifinal: weeks 22-24, Finals: weeks 25-27). Tiebreaker golfer earnings
-- are tracked separately from the normal lineup/results tables since the
-- tiebreaker never counts against the $100 cap or golfer usage limits.

CREATE TABLE IF NOT EXISTS playoff_lineups (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  tournament_id INTEGER REFERENCES tournaments(id),
  tiebreaker_golfer_id INTEGER REFERENCES golfers(id),
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, tournament_id)
);

CREATE TABLE IF NOT EXISTS playoff_results (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  round TEXT, -- 'semifinal', 'finals_w1', 'finals_w2', 'finals_w3'
  total_earnings BIGINT DEFAULT 0,
  tiebreaker_earnings BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'advanced', 'eliminated', 'winner'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, round)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON playoff_lineups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON playoff_lineups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON playoff_lineups TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON playoff_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON playoff_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON playoff_results TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
