-- Add is_guest column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Add guest player
INSERT INTO players (name, password, is_commissioner, is_guest)
VALUES ('Guest', '0000', false, true)
ON CONFLICT (name) DO NOTHING;
