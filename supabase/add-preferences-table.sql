-- Player preferences table for text reminders
CREATE TABLE IF NOT EXISTS player_preferences (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  phone_number TEXT,
  reminders_enabled BOOLEAN DEFAULT FALSE,
  reminder_day TEXT DEFAULT 'Wednesday',
  reminder_time TEXT DEFAULT '9am',
  timezone TEXT DEFAULT 'ET',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id)
);

ALTER TABLE player_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON player_preferences FOR SELECT USING (true);
CREATE POLICY "Public insert" ON player_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON player_preferences FOR UPDATE USING (true);
