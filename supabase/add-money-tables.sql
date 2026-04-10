CREATE TABLE IF NOT EXISTS entry_fees (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  amount INTEGER DEFAULT 200,
  paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_bonuses (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id),
  player_id INTEGER REFERENCES players(id),
  bonus_amount INTEGER,
  bonus_type TEXT,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO entry_fees (player_id, amount, paid)
SELECT id, 200, false FROM players WHERE is_guest = false OR is_guest IS NULL;
