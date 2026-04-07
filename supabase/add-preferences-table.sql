-- Player preferences table for text reminders (2 reminders per player)
CREATE TABLE IF NOT EXISTS player_preferences (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL REFERENCES players(id),
  phone_number TEXT,
  phone_e164 TEXT,
  reminders_enabled BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'ET',
  reminder1_day TEXT DEFAULT 'Tuesday',
  reminder1_time TEXT DEFAULT '9pm',
  reminder2_day TEXT DEFAULT 'Wednesday',
  reminder2_time TEXT DEFAULT '9am',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id)
);

ALTER TABLE player_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON player_preferences FOR SELECT USING (true);
CREATE POLICY "Public insert" ON player_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON player_preferences FOR UPDATE USING (true);
