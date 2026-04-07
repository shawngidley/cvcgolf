-- Add golfer_earnings table for per-tournament golfer earnings
-- This supplements the existing results table with dedicated earnings tracking

CREATE TABLE IF NOT EXISTS golfer_earnings (
  id SERIAL PRIMARY KEY,
  golfer_id INTEGER REFERENCES golfers(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  earnings BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(golfer_id, tournament_id)
);

-- Enable RLS
ALTER TABLE golfer_earnings ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access" ON golfer_earnings FOR SELECT USING (true);

-- Allow insert/update for service role (Netlify functions)
CREATE POLICY "Allow insert" ON golfer_earnings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON golfer_earnings FOR UPDATE USING (true);

-- Seed historical golfer earnings from existing results table (weeks 1-8)
INSERT INTO golfer_earnings (golfer_id, tournament_id, earnings, created_at, updated_at)
SELECT
  r.golfer_id,
  r.tournament_id,
  r.earnings,
  NOW(),
  NOW()
FROM results r
JOIN tournaments t ON r.tournament_id = t.id
WHERE t.is_complete = true
  AND r.earnings > 0
ON CONFLICT (golfer_id, tournament_id) DO UPDATE
  SET earnings = EXCLUDED.earnings,
      updated_at = NOW();
