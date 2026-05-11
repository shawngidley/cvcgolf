-- Merge "Samual Stevens" into "Sam Stevens"
-- These are the same person; consolidates any duplicate golfer record.

DO $$
DECLARE
  correct_id INT;
  duplicate_id INT;
BEGIN
  SELECT id INTO correct_id   FROM golfers WHERE name = 'Sam Stevens';
  SELECT id INTO duplicate_id FROM golfers WHERE name = 'Samual Stevens';

  IF duplicate_id IS NULL THEN
    RAISE NOTICE 'No record found for "Samual Stevens" — nothing to merge.';
    RETURN;
  END IF;

  IF correct_id IS NULL THEN
    -- Only the misspelled record exists; just rename it.
    UPDATE golfers SET name = 'Sam Stevens' WHERE id = duplicate_id;
    RAISE NOTICE 'Renamed "Samual Stevens" to "Sam Stevens" (id %).', duplicate_id;
    RETURN;
  END IF;

  -- Both records exist: re-point child rows to the correct id, then delete the duplicate.

  -- lineups
  UPDATE lineups SET golfer_id = correct_id
  WHERE golfer_id = duplicate_id
    AND NOT EXISTS (
      SELECT 1 FROM lineups l2
      WHERE l2.golfer_id = correct_id
        AND l2.player_id = lineups.player_id
        AND l2.tournament_id = lineups.tournament_id
        AND l2.slot = lineups.slot
    );

  -- results
  UPDATE results SET golfer_id = correct_id
  WHERE golfer_id = duplicate_id
    AND NOT EXISTS (
      SELECT 1 FROM results r2
      WHERE r2.golfer_id = correct_id
        AND r2.tournament_id = results.tournament_id
    );

  -- golfer_usage
  UPDATE golfer_usage SET golfer_id = correct_id
  WHERE golfer_id = duplicate_id
    AND NOT EXISTS (
      SELECT 1 FROM golfer_usage gu2
      WHERE gu2.golfer_id = correct_id
        AND gu2.player_id = golfer_usage.player_id
    );

  DELETE FROM golfers WHERE id = duplicate_id;

  RAISE NOTICE 'Merged "Samual Stevens" (id %) into "Sam Stevens" (id %).', duplicate_id, correct_id;
END;
$$;
