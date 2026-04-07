-- CVC Fantasy Golf 2026 - Historical Lineup Data (Weeks 1-8)
-- 14 players x 5 golfers x 8 weeks = 560 lineup entries
-- Run AFTER seed.sql (requires players, tournaments, golfers tables populated)

-- ============================================
-- ADD MISSING GOLFERS (referenced in lineups but not in base seed)
-- ============================================
INSERT INTO golfers (name, salary, owgr, tier) VALUES
  ('Brooks Koepka', 21, 16, 'Premium'),
  ('Daniel Berger', 14, 70, 'Budget'),
  ('Justin Rose', 14, 65, 'Budget'),
  ('Harry Hall', 13, 80, 'Bargain'),
  ('Tom Hoge', 14, 55, 'Budget'),
  ('Jacob Bridgeman', 13, 95, 'Bargain'),
  ('Ryo Hisatsune', 13, 85, 'Bargain'),
  ('Austin Smotherman', 13, 90, 'Bargain'),
  ('Adam Hadwin', 14, 60, 'Budget'),
  ('JJ Spaun', 13, 88, 'Bargain'),
  ('Marco Penge', 13, 100, 'Bargain'),
  ('Jordan Smith', 13, 85, 'Bargain'),
  ('Rasmus Hojgaard', 14, 55, 'Budget'),
  ('Ryan Gerard', 13, 100, 'Bargain'),
  ('Johnny Keefer', 13, 105, 'Bargain'),
  ('Sudarshan Yellamaraju', 13, 110, 'Bargain')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- WEEK 1: WM Phoenix Open (tournament week_number = 1)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Nick Taylor'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Rickie Fowler'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Rickie Fowler'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Brian Harman'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Eric Cole'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Pierceson Coody'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Nick Taylor'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Brian Harman'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Daniel Berger'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Keith Mitchell'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Harry Hall'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 1), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 2: Pebble Beach Pro-Am (tournament week_number = 2)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Jason Day'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Akshay Bhatia'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Daniel Berger'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Jason Day'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Aaron Rai'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Michael Thorbjornsen'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Keegan Bradley'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Denny McCarthy'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Taylor Pendrith'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Akshay Bhatia'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Pierceson Coody'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Justin Rose'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 2), (SELECT id FROM golfers WHERE name = 'Aaron Rai'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 3: Genesis Invitational (tournament week_number = 3)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Harris English'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Rickie Fowler'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Rickie Fowler'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Harris English'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jason Day'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Nick Taylor'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Andrew Novak'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tom Hoge'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Jason Day'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 3), (SELECT id FROM golfers WHERE name = 'Max Homa'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 4: Arnold Palmer Invitational (tournament week_number = 4)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Ryan Gerard'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Sungjae Im'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Taylor Pendrith'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Tom Hoge'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Kurt Kitayama'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Adam Scott'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Nico Echavarria'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Rory McIlroy'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Adam Scott'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Pierceson Coody'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Ryan Fox'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 4), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 5: The Players Championship (tournament week_number = 5)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Aaron Rai'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Daniel Berger'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sungjae Im'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Chris Kirk'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Cameron Young'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Adam Scott'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Akshay Bhatia'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Daniel Berger'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Daniel Berger'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Taylor Pendrith'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Akshay Bhatia'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Akshay Bhatia'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Scottie Scheffler'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Akshay Bhatia'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Collin Morikawa'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Si Woo Kim'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 5), (SELECT id FROM golfers WHERE name = 'Tom Hoge'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 6: Valspar Championship (tournament week_number = 6)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Denny McCarthy'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Keith Mitchell'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Ryo Hisatsune'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Austin Smotherman'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Chris Kirk'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Denny McCarthy'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Adam Hadwin'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Austin Smotherman'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'JJ Spaun'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Ryo Hisatsune'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Corey Conners'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Ryo Hisatsune'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Nick Taylor'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Xander Schauffele'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Viktor Hovland'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Patrick Cantlay'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Matt Fitzpatrick'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Justin Thomas'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Nick Taylor'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Jacob Bridgeman'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Austin Smotherman'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 6), (SELECT id FROM golfers WHERE name = 'Taylor Moore'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 7: Texas Children's Houston Open (tournament week_number = 7)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Marco Penge'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Stephan Jaeger'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Ben Griffin'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Kurt Kitayama'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Pierceson Coody'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Michael Thorbjornsen'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sam Burns'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sungjae Im'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Wyndham Clark'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Tom Kim'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Davis Thompson'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sungjae Im'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Stephan Jaeger'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Jordan Smith'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Marco Penge'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Nick Dunlap'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Taylor Pendrith'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sahith Theegala'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sungjae Im'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Stephan Jaeger'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Marco Penge'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Shane Lowry'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Rasmus Hojgaard'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Marco Penge'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Rickie Fowler'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Jordan Smith'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Stephan Jaeger'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Adam Scott'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Rasmus Hojgaard'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Sungjae Im'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Nicolai Hojgaard'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Jake Knapp'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Ryan Gerard'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 7), (SELECT id FROM golfers WHERE name = 'Stephan Jaeger'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- ============================================
-- WEEK 8: Valero Texas Open (tournament week_number = 8)
-- ============================================
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Joe Cas
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 1),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Michael Thorbjornsen'), 2),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 3),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 4),
  ((SELECT id FROM players WHERE name = 'Joe Cas'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 5),
  -- Keith Cromer
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 1),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 3),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 4),
  ((SELECT id FROM players WHERE name = 'Keith Cromer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Sudarshan Yellamaraju'), 5),
  -- Jack Ehrbar
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 1),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 3),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 4),
  ((SELECT id FROM players WHERE name = 'Jack Ehrbar'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tony Finau'), 5),
  -- Matt Federer
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Denny McCarthy'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Johnny Keefer'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Federer'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Andrew Novak'), 5),
  -- Shawn Gidley
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 1),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 2),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Brian Harman'), 3),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 4),
  ((SELECT id FROM players WHERE name = 'Shawn Gidley'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Keith Mitchell'), 5),
  -- Matt Janssen
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 1),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 2),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 3),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 4),
  ((SELECT id FROM players WHERE name = 'Matt Janssen'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Nick Dunlap'), 5),
  -- Scott Nelson
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Keith Mitchell'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Michael Thorbjornsen'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Nelson'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Sudarshan Yellamaraju'), 5),
  -- Dan Osicki
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 1),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 2),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 3),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 4),
  ((SELECT id FROM players WHERE name = 'Dan Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ryo Hisatsune'), 5),
  -- Josh Osicki
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 1),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 2),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 3),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Nick Dunlap'), 4),
  ((SELECT id FROM players WHERE name = 'Josh Osicki'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tom Hoge'), 5),
  -- David Sotka
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 1),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 2),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 3),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 4),
  ((SELECT id FROM players WHERE name = 'David Sotka'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Keith Mitchell'), 5),
  -- Dave Sutton
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Russell Henley'), 1),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 2),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jhonattan Vegas'), 3),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 4),
  ((SELECT id FROM players WHERE name = 'Dave Sutton'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Rickie Fowler'), 5),
  -- Scott Tomko
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Brooks Koepka'), 1),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Min Woo Lee'), 2),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Chris Gotterup'), 3),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Smith'), 4),
  ((SELECT id FROM players WHERE name = 'Scott Tomko'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Stephan Jaeger'), 5),
  -- Steve Walker
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 1),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Ludvig Aberg'), 2),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 3),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 4),
  ((SELECT id FROM players WHERE name = 'Steve Walker'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Hideki Matsuyama'), 5),
  -- Jamie Yane
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Tommy Fleetwood'), 1),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Sepp Straka'), 2),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Jordan Spieth'), 3),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Maverick McNealy'), 4),
  ((SELECT id FROM players WHERE name = 'Jamie Yane'), (SELECT id FROM tournaments WHERE week_number = 8), (SELECT id FROM golfers WHERE name = 'Robert MacIntyre'), 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;
