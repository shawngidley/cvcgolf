-- CVC Fantasy Golf 2026 - Database Schema
-- Run this in Supabase SQL Editor

-- Players table (14 league members with login)
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  password TEXT NOT NULL,
  is_commissioner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments / Weeks
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  week_number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  course TEXT,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purse_millions NUMERIC(5,2),
  is_major BOOLEAN DEFAULT FALSE,
  is_signature BOOLEAN DEFAULT FALSE,
  is_complete BOOLEAN DEFAULT FALSE,
  is_current BOOLEAN DEFAULT FALSE,
  picks_locked BOOLEAN DEFAULT FALSE,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Golfers with salary tiers
CREATE TABLE IF NOT EXISTS golfers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  salary INT NOT NULL DEFAULT 15,
  owgr INT,
  tier TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player lineups (5 golfers per week, $100 cap)
CREATE TABLE IF NOT EXISTS lineups (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  tournament_id INT NOT NULL REFERENCES tournaments(id),
  golfer_id INT NOT NULL REFERENCES golfers(id),
  slot INT NOT NULL CHECK (slot BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, tournament_id, slot)
);

-- Tournament results for each golfer
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL REFERENCES tournaments(id),
  golfer_id INT NOT NULL REFERENCES golfers(id),
  finish_position TEXT,
  score_to_par INT DEFAULT 0,
  earnings NUMERIC(12,2) DEFAULT 0,
  made_cut BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, golfer_id)
);

-- Player weekly scores (calculated from lineup + results)
CREATE TABLE IF NOT EXISTS weekly_scores (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  tournament_id INT NOT NULL REFERENCES tournaments(id),
  total_earnings NUMERIC(14,2) DEFAULT 0,
  total_salary INT DEFAULT 0,
  best_golfer TEXT,
  best_golfer_earnings NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, tournament_id)
);

-- Season standings (aggregated)
CREATE TABLE IF NOT EXISTS standings (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  total_earnings NUMERIC(16,2) DEFAULT 0,
  weeks_played INT DEFAULT 0,
  weekly_wins INT DEFAULT 0,
  best_week NUMERIC(14,2) DEFAULT 0,
  worst_week NUMERIC(14,2) DEFAULT 0,
  avg_weekly NUMERIC(14,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id)
);

-- Golfer usage tracking
CREATE TABLE IF NOT EXISTS golfer_usage (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  golfer_id INT NOT NULL REFERENCES golfers(id),
  times_used INT DEFAULT 0,
  total_earnings NUMERIC(14,2) DEFAULT 0,
  UNIQUE(player_id, golfer_id)
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE golfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE golfer_usage ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read" ON players FOR SELECT USING (true);
CREATE POLICY "Public read" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read" ON golfers FOR SELECT USING (true);
CREATE POLICY "Public read" ON lineups FOR SELECT USING (true);
CREATE POLICY "Public read" ON results FOR SELECT USING (true);
CREATE POLICY "Public read" ON weekly_scores FOR SELECT USING (true);
CREATE POLICY "Public read" ON standings FOR SELECT USING (true);
CREATE POLICY "Public read" ON golfer_usage FOR SELECT USING (true);

-- Public write access (managed via app logic)
CREATE POLICY "Public insert" ON lineups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON lineups FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON lineups FOR DELETE USING (true);
CREATE POLICY "Public insert" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON results FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON weekly_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON weekly_scores FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON standings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON standings FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON golfer_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON golfer_usage FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON golfer_usage FOR DELETE USING (true);
