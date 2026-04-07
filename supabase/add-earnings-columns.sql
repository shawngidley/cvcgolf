-- Add finish_position and score columns to golfer_earnings table
ALTER TABLE golfer_earnings ADD COLUMN IF NOT EXISTS finish_position TEXT;
ALTER TABLE golfer_earnings ADD COLUMN IF NOT EXISTS score TEXT;
