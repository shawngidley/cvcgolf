-- Clear weekly_scores table to rebuild fresh from golfer_earnings
-- Run this once, then use "Recalculate Everything" in admin to repopulate
DELETE FROM weekly_scores;
DELETE FROM standings;
