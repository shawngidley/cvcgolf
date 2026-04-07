-- CVC Fantasy Golf 2026 - Seed Data
-- 14 Players, 27 Tournaments, 100+ Golfers, Weeks 1-8 Historical

-- ============================================
-- PLAYERS (14 members with passwords)
-- ============================================
INSERT INTO players (name, password, is_commissioner) VALUES
  ('Shawn Gidley', 'shawn2026', TRUE),
  ('Mike Bavuso', 'mike2026', FALSE),
  ('Chris Viola', 'chris2026', FALSE),
  ('Dan Dougherty', 'dan2026', FALSE),
  ('Matt Curran', 'matt2026', FALSE),
  ('Brian Curran', 'brian2026', FALSE),
  ('Tom Petrillo', 'tom2026', FALSE),
  ('Pat Shields', 'pat2026', FALSE),
  ('Jim Furey', 'jim2026', FALSE),
  ('Kevin Kearney', 'kevin2026', FALSE),
  ('Mike Keeley', 'keeley2026', FALSE),
  ('Dave Christman', 'dave2026', FALSE),
  ('Rob Hangen', 'rob2026', FALSE),
  ('Joe Maguire', 'joe2026', FALSE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TOURNAMENTS (27 weeks, 2026 PGA Tour season)
-- ============================================
INSERT INTO tournaments (week_number, name, short_name, course, location, start_date, end_date, purse_millions, is_major, is_signature, is_complete, sort_order) VALUES
  (1, 'The Sentry', 'Sentry', 'Kapalua Plantation Course', 'Maui, HI', '2026-01-01', '2026-01-04', 20.00, FALSE, TRUE, TRUE, 1),
  (2, 'Sony Open in Hawaii', 'Sony Open', 'Waialae Country Club', 'Honolulu, HI', '2026-01-08', '2026-01-11', 8.40, FALSE, FALSE, TRUE, 2),
  (3, 'The American Express', 'AmEx', 'PGA West (Stadium)', 'La Quinta, CA', '2026-01-15', '2026-01-18', 8.40, FALSE, FALSE, TRUE, 3),
  (4, 'Farmers Insurance Open', 'Farmers', 'Torrey Pines (South)', 'San Diego, CA', '2026-01-22', '2026-01-25', 9.60, FALSE, FALSE, TRUE, 4),
  (5, 'AT&T Pebble Beach Pro-Am', 'Pebble Beach', 'Pebble Beach Golf Links', 'Pebble Beach, CA', '2026-01-29', '2026-02-01', 20.00, FALSE, TRUE, TRUE, 5),
  (6, 'WM Phoenix Open', 'Phoenix', 'TPC Scottsdale (Stadium)', 'Scottsdale, AZ', '2026-02-05', '2026-02-08', 20.00, FALSE, TRUE, TRUE, 6),
  (7, 'Genesis Invitational', 'Genesis', 'Riviera Country Club', 'Pacific Palisades, CA', '2026-02-12', '2026-02-15', 20.00, FALSE, TRUE, TRUE, 7),
  (8, 'The Honda Classic', 'Honda', 'PGA National (Champion)', 'Palm Beach Gardens, FL', '2026-02-19', '2026-02-22', 8.40, FALSE, FALSE, TRUE, 8),
  (9, 'Arnold Palmer Invitational', 'API', 'Bay Hill Club & Lodge', 'Orlando, FL', '2026-02-26', '2026-03-01', 20.00, FALSE, TRUE, FALSE, 9),
  (10, 'Puerto Rico Open', 'Puerto Rico', 'Grand Reserve GC', 'Rio Grande, PR', '2026-03-05', '2026-03-08', 4.00, FALSE, FALSE, FALSE, 10),
  (11, 'THE PLAYERS Championship', 'TPC', 'TPC Sawgrass (Stadium)', 'Ponte Vedra Beach, FL', '2026-03-12', '2026-03-15', 25.00, FALSE, TRUE, FALSE, 11),
  (12, 'Valspar Championship', 'Valspar', 'Innisbrook (Copperhead)', 'Palm Harbor, FL', '2026-03-19', '2026-03-22', 8.40, FALSE, FALSE, FALSE, 12),
  (13, 'WGC-Dell Match Play', 'Match Play', 'Austin Country Club', 'Austin, TX', '2026-03-25', '2026-03-29', 20.00, FALSE, TRUE, FALSE, 13),
  (14, 'Valero Texas Open', 'Texas Open', 'TPC San Antonio (Oaks)', 'San Antonio, TX', '2026-04-02', '2026-04-05', 8.80, FALSE, FALSE, FALSE, 14),
  (15, 'The Masters', 'Masters', 'Augusta National Golf Club', 'Augusta, GA', '2026-04-09', '2026-04-12', 20.00, TRUE, FALSE, FALSE, 15),
  (16, 'RBC Heritage', 'Heritage', 'Harbour Town Golf Links', 'Hilton Head, SC', '2026-04-16', '2026-04-19', 20.00, FALSE, TRUE, FALSE, 16),
  (17, 'Zurich Classic', 'Zurich', 'TPC Louisiana', 'Avondale, LA', '2026-04-23', '2026-04-26', 8.60, FALSE, FALSE, FALSE, 17),
  (18, 'Wells Fargo Championship', 'Wells Fargo', 'Quail Hollow Club', 'Charlotte, NC', '2026-04-30', '2026-05-03', 20.00, FALSE, TRUE, FALSE, 18),
  (19, 'PGA Championship', 'PGA Champ', 'Bethpage Black Course', 'Farmingdale, NY', '2026-05-14', '2026-05-17', 18.50, TRUE, FALSE, FALSE, 19),
  (20, 'Charles Schwab Challenge', 'Colonial', 'Colonial Country Club', 'Fort Worth, TX', '2026-05-21', '2026-05-24', 9.20, FALSE, FALSE, FALSE, 20),
  (21, 'the Memorial Tournament', 'Memorial', 'Muirfield Village GC', 'Dublin, OH', '2026-05-28', '2026-05-31', 20.00, FALSE, TRUE, FALSE, 21),
  (22, 'U.S. Open', 'US Open', 'Shinnecock Hills Golf Club', 'Southampton, NY', '2026-06-18', '2026-06-21', 21.50, TRUE, FALSE, FALSE, 22),
  (23, 'Travelers Championship', 'Travelers', 'TPC River Highlands', 'Cromwell, CT', '2026-06-25', '2026-06-28', 20.00, FALSE, TRUE, FALSE, 23),
  (24, 'Rocket Mortgage Classic', 'Rocket', 'Detroit Golf Club', 'Detroit, MI', '2026-07-02', '2026-07-05', 8.40, FALSE, FALSE, FALSE, 24),
  (25, 'Genesis Scottish Open', 'Scottish', 'The Renaissance Club', 'North Berwick, Scotland', '2026-07-09', '2026-07-12', 9.00, FALSE, FALSE, FALSE, 25),
  (26, 'The Open Championship', 'The Open', 'Royal Portrush Golf Club', 'Portrush, N. Ireland', '2026-07-16', '2026-07-19', 17.00, TRUE, FALSE, FALSE, 26),
  (27, 'FedEx St. Jude Championship', 'St. Jude', 'TPC Southwind', 'Memphis, TN', '2026-08-06', '2026-08-09', 20.00, FALSE, TRUE, FALSE, 27)
ON CONFLICT (week_number) DO NOTHING;

-- ============================================
-- GOLFERS (100+ with salary $13-$27)
-- ============================================
INSERT INTO golfers (name, salary, owgr, tier) VALUES
  -- $27 - Elite (Top 3)
  ('Scottie Scheffler', 27, 1, 'Elite'),
  ('Xander Schauffele', 27, 2, 'Elite'),
  ('Rory McIlroy', 27, 3, 'Elite'),
  -- $25 - Superstar
  ('Collin Morikawa', 25, 4, 'Superstar'),
  ('Ludvig Åberg', 25, 5, 'Superstar'),
  ('Wyndham Clark', 25, 6, 'Superstar'),
  -- $23 - Star
  ('Viktor Hovland', 23, 7, 'Star'),
  ('Patrick Cantlay', 23, 8, 'Star'),
  ('Hideki Matsuyama', 23, 9, 'Star'),
  ('Tommy Fleetwood', 23, 10, 'Star'),
  -- $21 - Premium
  ('Shane Lowry', 21, 11, 'Premium'),
  ('Sahith Theegala', 21, 12, 'Premium'),
  ('Sungjae Im', 21, 13, 'Premium'),
  ('Russell Henley', 21, 14, 'Premium'),
  ('Tony Finau', 21, 15, 'Premium'),
  ('Sam Burns', 21, 16, 'Premium'),
  -- $19 - Mid-Upper
  ('Keegan Bradley', 19, 17, 'Mid-Upper'),
  ('Justin Thomas', 19, 18, 'Mid-Upper'),
  ('Brian Harman', 19, 19, 'Mid-Upper'),
  ('Matt Fitzpatrick', 19, 20, 'Mid-Upper'),
  ('Cameron Young', 19, 21, 'Mid-Upper'),
  ('Tom Kim', 19, 22, 'Mid-Upper'),
  ('Corey Conners', 19, 23, 'Mid-Upper'),
  ('Jason Day', 19, 24, 'Mid-Upper'),
  -- $17 - Mid
  ('Max Homa', 17, 25, 'Mid'),
  ('Robert MacIntyre', 17, 26, 'Mid'),
  ('Byeong Hun An', 17, 27, 'Mid'),
  ('Akshay Bhatia', 17, 28, 'Mid'),
  ('Chris Kirk', 17, 29, 'Mid'),
  ('Sepp Straka', 17, 30, 'Mid'),
  ('Denny McCarthy', 17, 31, 'Mid'),
  ('Billy Horschel', 17, 32, 'Mid'),
  ('Davis Riley', 17, 33, 'Mid'),
  ('Aaron Rai', 17, 34, 'Mid'),
  ('Taylor Pendrith', 17, 35, 'Mid'),
  ('Maverick McNealy', 17, 36, 'Mid'),
  -- $15 - Value
  ('Will Zalatoris', 15, 37, 'Value'),
  ('Jordan Spieth', 15, 38, 'Value'),
  ('Min Woo Lee', 15, 39, 'Value'),
  ('Adam Scott', 15, 40, 'Value'),
  ('Tyrrell Hatton', 15, 41, 'Value'),
  ('Si Woo Kim', 15, 42, 'Value'),
  ('J.T. Poston', 15, 43, 'Value'),
  ('Eric Cole', 15, 44, 'Value'),
  ('Stephan Jaeger', 15, 45, 'Value'),
  ('Nick Dunlap', 15, 46, 'Value'),
  ('Austin Eckroat', 15, 47, 'Value'),
  ('Matthieu Pavon', 15, 48, 'Value'),
  ('Lucas Glover', 15, 49, 'Value'),
  ('Christiaan Bezuidenhout', 15, 50, 'Value'),
  -- $14 - Budget
  ('Taylor Moore', 14, 51, 'Budget'),
  ('Beau Hossler', 14, 52, 'Budget'),
  ('Jake Knapp', 14, 53, 'Budget'),
  ('Harris English', 14, 54, 'Budget'),
  ('Mackenzie Hughes', 14, 55, 'Budget'),
  ('Doug Ghim', 14, 56, 'Budget'),
  ('Andrew Novak', 14, 57, 'Budget'),
  ('Ben Griffin', 14, 58, 'Budget'),
  ('Nick Taylor', 14, 59, 'Budget'),
  ('Keith Mitchell', 14, 60, 'Budget'),
  ('Lee Hodges', 14, 61, 'Budget'),
  ('Mark Hubbard', 14, 62, 'Budget'),
  ('Cam Davis', 14, 63, 'Budget'),
  ('Patrick Rodgers', 14, 64, 'Budget'),
  ('Thomas Detry', 14, 65, 'Budget'),
  ('Emiliano Grillo', 14, 66, 'Budget'),
  ('Kurt Kitayama', 14, 67, 'Budget'),
  ('Alex Noren', 14, 68, 'Budget'),
  ('Rickie Fowler', 14, 69, 'Budget'),
  ('Gary Woodland', 14, 70, 'Budget'),
  -- $13 - Bargain
  ('Justin Lower', 13, 71, 'Bargain'),
  ('Peter Malnati', 13, 72, 'Bargain'),
  ('Kevin Yu', 13, 73, 'Bargain'),
  ('Sam Stevens', 13, 74, 'Bargain'),
  ('Matt NeSmith', 13, 75, 'Bargain'),
  ('Adam Svensson', 13, 76, 'Bargain'),
  ('Chandler Phillips', 13, 77, 'Bargain'),
  ('Michael Thorbjornsen', 13, 78, 'Bargain'),
  ('Jackson Suber', 13, 79, 'Bargain'),
  ('Joe Highsmith', 13, 80, 'Bargain'),
  ('Pierceson Coody', 13, 81, 'Bargain'),
  ('Luke Clanton', 13, 82, 'Bargain'),
  ('Carson Young', 13, 83, 'Bargain'),
  ('Kevin Streelman', 13, 84, 'Bargain'),
  ('Ryan Fox', 13, 85, 'Bargain'),
  ('Brendon Todd', 13, 86, 'Bargain'),
  ('C.T. Pan', 13, 87, 'Bargain'),
  ('Nico Echavarria', 13, 88, 'Bargain'),
  ('Jhonattan Vegas', 13, 89, 'Bargain'),
  ('S.H. Kim', 13, 90, 'Bargain'),
  ('Charley Hoffman', 13, 91, 'Bargain'),
  ('Zach Johnson', 13, 92, 'Bargain'),
  ('Joel Dahmen', 13, 93, 'Bargain'),
  ('Dylan Wu', 13, 94, 'Bargain'),
  ('Kevin Tway', 13, 95, 'Bargain'),
  ('Parker Coody', 13, 96, 'Bargain'),
  ('Patrick Fishburn', 13, 97, 'Bargain'),
  ('Paul Peterson', 13, 98, 'Bargain'),
  ('Davis Thompson', 13, 99, 'Bargain'),
  ('Chris Gotterup', 13, 100, 'Bargain'),
  ('Rico Hoey', 13, 101, 'Bargain'),
  ('Mac Meissner', 13, 102, 'Bargain'),
  ('Nate Lashley', 13, 103, 'Bargain'),
  ('Henrik Norlander', 13, 104, 'Bargain'),
  ('Greyson Sigg', 13, 105, 'Bargain'),
  ('Matt Wallace', 13, 106, 'Bargain'),
  ('Danny Willett', 13, 107, 'Bargain'),
  ('Victor Perez', 13, 108, 'Bargain'),
  ('Nicolai Hojgaard', 13, 109, 'Bargain')
ON CONFLICT (name) DO UPDATE SET salary = EXCLUDED.salary, owgr = EXCLUDED.owgr, tier = EXCLUDED.tier;

-- ============================================
-- Initialize standings for all players
-- ============================================
INSERT INTO standings (player_id, total_earnings, weeks_played)
SELECT id, 0, 0 FROM players
ON CONFLICT (player_id) DO NOTHING;

-- ============================================
-- WEEKS 1-8 HISTORICAL DATA
-- Sample lineups and results for completed weeks
-- ============================================

-- Helper: We reference players by ID (1-14) and golfers by ID (1-110)
-- Week 1: The Sentry - Sample lineups
-- Player 1 (Shawn): Scheffler(27) + Theegala(21) + Conners(19) + Zalatoris(15) + Poston(15) = $97
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  (1, 1, 1, 1), (1, 1, 12, 2), (1, 1, 23, 3), (1, 1, 37, 4), (1, 1, 43, 5),
  -- Player 2 (Mike B): Schauffele(27) + Hovland(23) + Burns(21) + Spieth(15) + Cole(15) = $101 -> adjust: swap Burns for Bhatia(17) = $97
  (2, 1, 2, 1), (2, 1, 7, 2), (2, 1, 28, 3), (2, 1, 38, 4), (2, 1, 44, 5),
  -- Player 3 (Chris): McIlroy(27) + Cantlay(23) + T.Finau(21) + Min Woo(15) + Jaeger(15) = $101 -> swap Finau for MacIntyre(17) = $97
  (3, 1, 3, 1), (3, 1, 8, 2), (3, 1, 26, 3), (3, 1, 39, 4), (3, 1, 45, 5),
  -- Player 4 (Dan): Morikawa(25) + Matsuyama(23) + JT(19) + Kirk(17) + Dunlap(15) = $99
  (4, 1, 4, 1), (4, 1, 9, 2), (4, 1, 18, 3), (4, 1, 29, 4), (4, 1, 46, 5),
  -- Player 5 (Matt C): Aberg(25) + Fleetwood(23) + Harman(19) + Straka(17) + Eckroat(15) = $99
  (5, 1, 5, 1), (5, 1, 10, 2), (5, 1, 19, 3), (5, 1, 30, 4), (5, 1, 47, 5),
  -- Player 6 (Brian): Scheffler(27) + Lowry(21) + Tom Kim(19) + Homa(17) + Pavon(15) = $99
  (6, 1, 1, 1), (6, 1, 11, 2), (6, 1, 22, 3), (6, 1, 25, 4), (6, 1, 48, 5),
  -- Player 7 (Tom): Schauffele(27) + Im(21) + Bradley(19) + An(17) + Glover(15) = $99
  (7, 1, 2, 1), (7, 1, 13, 2), (7, 1, 17, 3), (7, 1, 27, 4), (7, 1, 49, 5),
  -- Player 8 (Pat): McIlroy(27) + Henley(21) + Fitzpatrick(19) + McCarthy(17) + Bezuidenhout(15) = $99
  (8, 1, 3, 1), (8, 1, 14, 2), (8, 1, 20, 3), (8, 1, 31, 4), (8, 1, 50, 5),
  -- Player 9 (Jim): Morikawa(25) + Sam Burns(21) + Cam Young(19) + Horschel(17) + Si Woo(15) = $97 -> swap for correct: = wait let me calc: 25+21+19+17+15 = $97 ✓ but need salary ≤100 ✓
  (9, 1, 4, 1), (9, 1, 16, 2), (9, 1, 21, 3), (9, 1, 32, 4), (9, 1, 42, 5),
  -- Player 10 (Kevin): Aberg(25) + Theegala(21) + Jason Day(19) + D.Riley(17) + A.Scott(15) = $97
  (10, 1, 5, 1), (10, 1, 12, 2), (10, 1, 24, 3), (10, 1, 33, 4), (10, 1, 40, 5),
  -- Player 11 (Keeley): Clark(25) + Hovland(23) + Conners(19) + Aaron Rai(17) + Hatton(15) = $99
  (11, 1, 6, 1), (11, 1, 7, 2), (11, 1, 23, 3), (11, 1, 34, 4), (11, 1, 41, 5),
  -- Player 12 (Dave): Scheffler(27) + Cantlay(23) + Bradley(19) + Pendrith(17) + Eric Cole(15) = $101 -> swap Pendrith for Dunlap(15) = $99 but dup -> swap for Moore(14) = $98
  (12, 1, 1, 1), (12, 1, 8, 2), (12, 1, 17, 3), (12, 1, 51, 4), (12, 1, 44, 5),
  -- Player 13 (Rob): Schauffele(27) + Fleetwood(23) + Tom Kim(19) + McNealy(17) + Spieth(15) = $101 -> swap McNealy(17) for Pavon(15) = $99
  (13, 1, 2, 1), (13, 1, 10, 2), (13, 1, 22, 3), (13, 1, 48, 4), (13, 1, 38, 5),
  -- Player 14 (Joe): McIlroy(27) + Matsuyama(23) + JT(19) + Bhatia(17) + Glover(15) = $101 -> swap Bhatia for Jaeger(15) = $99
  (14, 1, 3, 1), (14, 1, 9, 2), (14, 1, 18, 3), (14, 1, 45, 4), (14, 1, 49, 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- Week 1 Results (The Sentry) - Top finishers
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (1, 1, '1', -25, 3600000, TRUE),   -- Scheffler wins
  (1, 2, 'T3', -21, 1700000, TRUE),  -- Schauffele
  (1, 3, 'T5', -19, 1050000, TRUE),  -- McIlroy
  (1, 4, 'T10', -16, 600000, TRUE),  -- Morikawa
  (1, 5, '2', -23, 2180000, TRUE),   -- Aberg
  (1, 7, 'T15', -14, 380000, TRUE),  -- Hovland
  (1, 8, 'T20', -12, 260000, TRUE),  -- Cantlay
  (1, 9, 'T8', -17, 730000, TRUE),   -- Matsuyama
  (1, 10, 'T12', -15, 470000, TRUE), -- Fleetwood
  (1, 11, 'T25', -10, 180000, TRUE), -- Lowry
  (1, 12, 'T5', -19, 1050000, TRUE), -- Theegala
  (1, 13, 'T30', -8, 130000, TRUE),  -- Im
  (1, 14, 'T18', -13, 310000, TRUE), -- Henley
  (1, 16, 'T22', -11, 220000, TRUE), -- Burns
  (1, 17, 'T35', -6, 95000, TRUE),   -- Bradley
  (1, 18, 'T3', -21, 1700000, TRUE), -- JT
  (1, 19, 'T28', -9, 145000, TRUE),  -- Harman
  (1, 20, 'T40', -4, 60000, TRUE),   -- Fitzpatrick
  (1, 21, 'T15', -14, 380000, TRUE), -- Cam Young
  (1, 22, 'T33', -7, 110000, TRUE),  -- Tom Kim
  (1, 23, 'T10', -16, 600000, TRUE), -- Conners
  (1, 24, 'T45', -2, 40000, TRUE),   -- Day
  (1, 25, 'T38', -5, 72000, TRUE),   -- Homa
  (1, 26, 'T8', -17, 730000, TRUE),  -- MacIntyre
  (1, 27, 'T30', -8, 130000, TRUE),  -- An
  (1, 28, 'T22', -11, 220000, TRUE), -- Bhatia
  (1, 29, 'T42', -3, 50000, TRUE),   -- Kirk
  (1, 30, 'T18', -13, 310000, TRUE), -- Straka
  (1, 31, 'T48', 0, 28000, TRUE),    -- McCarthy
  (1, 32, 'T35', -6, 95000, TRUE),   -- Horschel
  (1, 33, 'T25', -10, 180000, TRUE), -- D.Riley
  (1, 34, 'T40', -4, 60000, TRUE),   -- Rai
  (1, 37, 'T15', -14, 380000, TRUE), -- Zalatoris
  (1, 38, 'T28', -9, 145000, TRUE),  -- Spieth
  (1, 39, 'T33', -7, 110000, TRUE),  -- Min Woo
  (1, 40, 'T45', -2, 40000, TRUE),   -- A.Scott
  (1, 41, 'T22', -11, 220000, TRUE), -- Hatton
  (1, 42, 'T38', -5, 72000, TRUE),   -- Si Woo Kim
  (1, 43, 'T42', -3, 50000, TRUE),   -- Poston
  (1, 44, 'T30', -8, 130000, TRUE),  -- Eric Cole
  (1, 45, 'T48', 0, 28000, TRUE),    -- Jaeger
  (1, 46, 'T25', -10, 180000, TRUE), -- Dunlap
  (1, 47, 'T35', -6, 95000, TRUE),   -- Eckroat
  (1, 48, 'T40', -4, 60000, TRUE),   -- Pavon
  (1, 49, 'T45', -2, 40000, TRUE),   -- Glover
  (1, 50, 'T42', -3, 50000, TRUE),   -- Bezuidenhout
  (1, 51, 'T48', 0, 28000, TRUE),    -- Taylor Moore
  (1, 6, 'T10', -16, 600000, TRUE)   -- Clark
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Weeks 2-8 simplified lineups (all 14 players, varied picks)
-- Week 2: Sony Open
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  (1, 2, 2, 1), (1, 2, 13, 2), (1, 2, 22, 3), (1, 2, 30, 4), (1, 2, 44, 5),
  (2, 2, 1, 1), (2, 2, 12, 2), (2, 2, 18, 3), (2, 2, 29, 4), (2, 2, 43, 5),
  (3, 2, 5, 1), (3, 2, 9, 2), (3, 2, 21, 3), (3, 2, 28, 4), (3, 2, 42, 5),
  (4, 2, 3, 1), (4, 2, 10, 2), (4, 2, 17, 3), (4, 2, 31, 4), (4, 2, 40, 5),
  (5, 2, 4, 1), (5, 2, 11, 2), (5, 2, 24, 3), (5, 2, 25, 4), (5, 2, 38, 5),
  (6, 2, 2, 1), (6, 2, 14, 2), (6, 2, 19, 3), (6, 2, 34, 4), (6, 2, 46, 5),
  (7, 2, 3, 1), (7, 2, 15, 2), (7, 2, 23, 3), (7, 2, 27, 4), (7, 2, 45, 5),
  (8, 2, 1, 1), (8, 2, 16, 2), (8, 2, 20, 3), (8, 2, 33, 4), (8, 2, 47, 5),
  (9, 2, 5, 1), (9, 2, 8, 2), (9, 2, 26, 3), (9, 2, 32, 4), (9, 2, 41, 5),
  (10, 2, 6, 1), (10, 2, 7, 2), (10, 2, 22, 3), (10, 2, 35, 4), (10, 2, 39, 5),
  (11, 2, 4, 1), (11, 2, 9, 2), (11, 2, 19, 3), (11, 2, 36, 4), (11, 2, 50, 5),
  (12, 2, 2, 1), (12, 2, 11, 2), (12, 2, 21, 3), (12, 2, 25, 4), (12, 2, 48, 5),
  (13, 2, 3, 1), (13, 2, 10, 2), (13, 2, 24, 3), (13, 2, 37, 4), (13, 2, 49, 5),
  (14, 2, 1, 1), (14, 2, 13, 2), (14, 2, 17, 3), (14, 2, 30, 4), (14, 2, 51, 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- Week 2 Results
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (2, 9, '1', -20, 1512000, TRUE),
  (2, 1, 'T2', -18, 890000, TRUE),
  (2, 2, 'T5', -16, 520000, TRUE),
  (2, 3, 'T8', -14, 340000, TRUE),
  (2, 4, 'T3', -17, 680000, TRUE),
  (2, 5, 'T10', -13, 280000, TRUE),
  (2, 6, 'T15', -11, 180000, TRUE),
  (2, 7, 'T12', -12, 230000, TRUE),
  (2, 8, 'T20', -9, 130000, TRUE),
  (2, 10, 'T8', -14, 340000, TRUE),
  (2, 11, 'T18', -10, 150000, TRUE),
  (2, 12, 'T5', -16, 520000, TRUE),
  (2, 13, 'T25', -7, 95000, TRUE),
  (2, 14, 'T15', -11, 180000, TRUE),
  (2, 15, 'T30', -5, 65000, TRUE),
  (2, 17, 'T22', -8, 110000, TRUE),
  (2, 18, 'T2', -18, 890000, TRUE),
  (2, 19, 'T35', -3, 45000, TRUE),
  (2, 20, 'T28', -6, 78000, TRUE),
  (2, 21, 'T10', -13, 280000, TRUE),
  (2, 22, 'T18', -10, 150000, TRUE),
  (2, 23, 'T12', -12, 230000, TRUE),
  (2, 24, 'T33', -4, 52000, TRUE),
  (2, 25, 'T22', -8, 110000, TRUE),
  (2, 26, 'T15', -11, 180000, TRUE),
  (2, 27, 'T25', -7, 95000, TRUE),
  (2, 28, 'T20', -9, 130000, TRUE),
  (2, 29, 'T35', -3, 45000, TRUE),
  (2, 30, 'T30', -5, 65000, TRUE),
  (2, 31, 'T40', -1, 30000, TRUE),
  (2, 32, 'T28', -6, 78000, TRUE),
  (2, 33, 'T33', -4, 52000, TRUE),
  (2, 34, 'T38', -2, 38000, TRUE),
  (2, 35, 'T22', -8, 110000, TRUE),
  (2, 36, 'T40', -1, 30000, TRUE),
  (2, 37, 'T3', -17, 680000, TRUE),
  (2, 38, 'T30', -5, 65000, TRUE),
  (2, 39, 'T25', -7, 95000, TRUE),
  (2, 40, 'T35', -3, 45000, TRUE),
  (2, 41, 'T18', -10, 150000, TRUE),
  (2, 42, 'T33', -4, 52000, TRUE),
  (2, 43, 'T38', -2, 38000, TRUE),
  (2, 44, 'T12', -12, 230000, TRUE),
  (2, 45, 'T40', -1, 30000, TRUE),
  (2, 46, 'T28', -6, 78000, TRUE),
  (2, 47, 'T35', -3, 45000, TRUE),
  (2, 48, 'T30', -5, 65000, TRUE),
  (2, 49, 'T38', -2, 38000, TRUE),
  (2, 50, 'T33', -4, 52000, TRUE),
  (2, 51, 'T40', -1, 30000, TRUE),
  (2, 16, 'T25', -7, 95000, TRUE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Week 3: American Express
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  (1, 3, 4, 1), (1, 3, 11, 2), (1, 3, 18, 3), (1, 3, 28, 4), (1, 3, 39, 5),
  (2, 3, 3, 1), (2, 3, 7, 2), (2, 3, 22, 3), (2, 3, 31, 4), (2, 3, 46, 5),
  (3, 3, 1, 1), (3, 3, 14, 2), (3, 3, 24, 3), (3, 3, 33, 4), (3, 3, 41, 5),
  (4, 3, 2, 1), (4, 3, 12, 2), (4, 3, 19, 3), (4, 3, 27, 4), (4, 3, 44, 5),
  (5, 3, 5, 1), (5, 3, 8, 2), (5, 3, 17, 3), (5, 3, 29, 4), (5, 3, 48, 5),
  (6, 3, 6, 1), (6, 3, 13, 2), (6, 3, 23, 3), (6, 3, 35, 4), (6, 3, 40, 5),
  (7, 3, 4, 1), (7, 3, 10, 2), (7, 3, 26, 3), (7, 3, 30, 4), (7, 3, 42, 5),
  (8, 3, 3, 1), (8, 3, 15, 2), (8, 3, 21, 3), (8, 3, 34, 4), (8, 3, 49, 5),
  (9, 3, 2, 1), (9, 3, 16, 2), (9, 3, 20, 3), (9, 3, 25, 4), (9, 3, 43, 5),
  (10, 3, 1, 1), (10, 3, 9, 2), (10, 3, 18, 3), (10, 3, 32, 4), (10, 3, 47, 5),
  (11, 3, 5, 1), (11, 3, 11, 2), (11, 3, 22, 3), (11, 3, 36, 4), (11, 3, 38, 5),
  (12, 3, 6, 1), (12, 3, 10, 2), (12, 3, 19, 3), (12, 3, 37, 4), (12, 3, 45, 5),
  (13, 3, 4, 1), (13, 3, 7, 2), (13, 3, 17, 3), (13, 3, 27, 4), (13, 3, 50, 5),
  (14, 3, 3, 1), (14, 3, 8, 2), (14, 3, 24, 3), (14, 3, 28, 4), (14, 3, 51, 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- Week 3 Results
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (3, 12, '1', -24, 1512000, TRUE),
  (3, 1, 'T3', -21, 680000, TRUE),
  (3, 2, 'T5', -19, 430000, TRUE),
  (3, 3, 'T2', -22, 890000, TRUE),
  (3, 4, 'T8', -17, 310000, TRUE),
  (3, 5, 'T3', -21, 680000, TRUE),
  (3, 6, 'T12', -15, 210000, TRUE),
  (3, 7, 'T10', -16, 260000, TRUE),
  (3, 8, 'T15', -13, 160000, TRUE),
  (3, 9, 'T18', -12, 130000, TRUE),
  (3, 10, 'T5', -19, 430000, TRUE),
  (3, 11, 'T20', -11, 110000, TRUE),
  (3, 13, 'T22', -10, 95000, TRUE),
  (3, 14, 'T8', -17, 310000, TRUE),
  (3, 15, 'T25', -8, 72000, TRUE),
  (3, 16, 'T28', -7, 58000, TRUE),
  (3, 17, 'T15', -13, 160000, TRUE),
  (3, 18, 'T10', -16, 260000, TRUE),
  (3, 19, 'T30', -6, 48000, TRUE),
  (3, 20, 'T22', -10, 95000, TRUE),
  (3, 21, 'T12', -15, 210000, TRUE),
  (3, 22, 'T18', -12, 130000, TRUE),
  (3, 23, 'T25', -8, 72000, TRUE),
  (3, 24, 'T28', -7, 58000, TRUE),
  (3, 25, 'T15', -13, 160000, TRUE),
  (3, 26, 'T20', -11, 110000, TRUE),
  (3, 27, 'T30', -6, 48000, TRUE),
  (3, 28, 'T5', -19, 430000, TRUE),
  (3, 29, 'T35', -4, 35000, TRUE),
  (3, 30, 'T22', -10, 95000, TRUE),
  (3, 31, 'T33', -5, 42000, TRUE),
  (3, 32, 'T25', -8, 72000, TRUE),
  (3, 33, 'T28', -7, 58000, TRUE),
  (3, 34, 'T30', -6, 48000, TRUE),
  (3, 35, 'T33', -5, 42000, TRUE),
  (3, 36, 'T35', -4, 35000, TRUE),
  (3, 37, 'T18', -12, 130000, TRUE),
  (3, 38, 'T20', -11, 110000, TRUE),
  (3, 39, 'T22', -10, 95000, TRUE),
  (3, 40, 'T30', -6, 48000, TRUE),
  (3, 41, 'T12', -15, 210000, TRUE),
  (3, 42, 'T28', -7, 58000, TRUE),
  (3, 43, 'T33', -5, 42000, TRUE),
  (3, 44, 'T25', -8, 72000, TRUE),
  (3, 45, 'T35', -4, 35000, TRUE),
  (3, 46, 'T18', -12, 130000, TRUE),
  (3, 47, 'T30', -6, 48000, TRUE),
  (3, 48, 'T33', -5, 42000, TRUE),
  (3, 49, 'T35', -4, 35000, TRUE),
  (3, 50, 'T28', -7, 58000, TRUE),
  (3, 51, 'T33', -5, 42000, TRUE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Weeks 4-8: Lineups
INSERT INTO lineups (player_id, tournament_id, golfer_id, slot) VALUES
  -- Week 4: Farmers
  (1, 4, 1, 1), (1, 4, 15, 2), (1, 4, 21, 3), (1, 4, 25, 4), (1, 4, 42, 5),
  (2, 4, 5, 1), (2, 4, 10, 2), (2, 4, 23, 3), (2, 4, 32, 4), (2, 4, 38, 5),
  (3, 4, 2, 1), (3, 4, 11, 2), (3, 4, 18, 3), (3, 4, 26, 4), (3, 4, 50, 5),
  (4, 4, 4, 1), (4, 4, 7, 2), (4, 4, 20, 3), (4, 4, 33, 4), (4, 4, 46, 5),
  (5, 4, 3, 1), (5, 4, 12, 2), (5, 4, 19, 3), (5, 4, 36, 4), (5, 4, 41, 5),
  (6, 4, 6, 1), (6, 4, 8, 2), (6, 4, 24, 3), (6, 4, 29, 4), (6, 4, 45, 5),
  (7, 4, 1, 1), (7, 4, 14, 2), (7, 4, 22, 3), (7, 4, 28, 4), (7, 4, 47, 5),
  (8, 4, 5, 1), (8, 4, 9, 2), (8, 4, 17, 3), (8, 4, 35, 4), (8, 4, 43, 5),
  (9, 4, 2, 1), (9, 4, 13, 2), (9, 4, 26, 3), (9, 4, 30, 4), (9, 4, 44, 5),
  (10, 4, 3, 1), (10, 4, 16, 2), (10, 4, 22, 3), (10, 4, 31, 4), (10, 4, 48, 5),
  (11, 4, 4, 1), (11, 4, 10, 2), (11, 4, 23, 3), (11, 4, 27, 4), (11, 4, 39, 5),
  (12, 4, 1, 1), (12, 4, 15, 2), (12, 4, 19, 3), (12, 4, 34, 4), (12, 4, 40, 5),
  (13, 4, 6, 1), (13, 4, 12, 2), (13, 4, 21, 3), (13, 4, 37, 4), (13, 4, 49, 5),
  (14, 4, 5, 1), (14, 4, 7, 2), (14, 4, 17, 3), (14, 4, 25, 4), (14, 4, 51, 5),
  -- Week 5: Pebble Beach
  (1, 5, 3, 1), (1, 5, 9, 2), (1, 5, 17, 3), (1, 5, 34, 4), (1, 5, 46, 5),
  (2, 5, 1, 1), (2, 5, 11, 2), (2, 5, 22, 3), (2, 5, 28, 4), (2, 5, 40, 5),
  (3, 5, 4, 1), (3, 5, 13, 2), (3, 5, 19, 3), (3, 5, 25, 4), (3, 5, 43, 5),
  (4, 5, 2, 1), (4, 5, 8, 2), (4, 5, 21, 3), (4, 5, 36, 4), (4, 5, 42, 5),
  (5, 5, 6, 1), (5, 5, 14, 2), (5, 5, 18, 3), (5, 5, 30, 4), (5, 5, 44, 5),
  (6, 5, 5, 1), (6, 5, 10, 2), (6, 5, 23, 3), (6, 5, 27, 4), (6, 5, 38, 5),
  (7, 5, 3, 1), (7, 5, 16, 2), (7, 5, 24, 3), (7, 5, 29, 4), (7, 5, 48, 5),
  (8, 5, 2, 1), (8, 5, 12, 2), (8, 5, 20, 3), (8, 5, 31, 4), (8, 5, 47, 5),
  (9, 5, 1, 1), (9, 5, 7, 2), (9, 5, 26, 3), (9, 5, 33, 4), (9, 5, 50, 5),
  (10, 5, 4, 1), (10, 5, 15, 2), (10, 5, 19, 3), (10, 5, 35, 4), (10, 5, 41, 5),
  (11, 5, 6, 1), (11, 5, 9, 2), (11, 5, 17, 3), (11, 5, 32, 4), (11, 5, 45, 5),
  (12, 5, 3, 1), (12, 5, 8, 2), (12, 5, 22, 3), (12, 5, 37, 4), (12, 5, 49, 5),
  (13, 5, 5, 1), (13, 5, 14, 2), (13, 5, 18, 3), (13, 5, 34, 4), (13, 5, 39, 5),
  (14, 5, 2, 1), (14, 5, 11, 2), (14, 5, 23, 3), (14, 5, 25, 4), (14, 5, 46, 5),
  -- Week 6: Phoenix
  (1, 6, 2, 1), (1, 6, 12, 2), (1, 6, 19, 3), (1, 6, 27, 4), (1, 6, 43, 5),
  (2, 6, 4, 1), (2, 6, 8, 2), (2, 6, 24, 3), (2, 6, 33, 4), (2, 6, 41, 5),
  (3, 6, 1, 1), (3, 6, 16, 2), (3, 6, 17, 3), (3, 6, 30, 4), (3, 6, 48, 5),
  (4, 6, 3, 1), (4, 6, 9, 2), (4, 6, 22, 3), (4, 6, 35, 4), (4, 6, 44, 5),
  (5, 6, 5, 1), (5, 6, 7, 2), (5, 6, 21, 3), (5, 6, 28, 4), (5, 6, 39, 5),
  (6, 6, 6, 1), (6, 6, 15, 2), (6, 6, 20, 3), (6, 6, 26, 4), (6, 6, 47, 5),
  (7, 6, 2, 1), (7, 6, 11, 2), (7, 6, 18, 3), (7, 6, 31, 4), (7, 6, 42, 5),
  (8, 6, 4, 1), (8, 6, 10, 2), (8, 6, 23, 3), (8, 6, 36, 4), (8, 6, 50, 5),
  (9, 6, 3, 1), (9, 6, 14, 2), (9, 6, 25, 3), (9, 6, 29, 4), (9, 6, 46, 5),
  (10, 6, 1, 1), (10, 6, 13, 2), (10, 6, 24, 3), (10, 6, 34, 4), (10, 6, 45, 5),
  (11, 6, 5, 1), (11, 6, 8, 2), (11, 6, 19, 3), (11, 6, 32, 4), (11, 6, 40, 5),
  (12, 6, 6, 1), (12, 6, 7, 2), (12, 6, 17, 3), (12, 6, 37, 4), (12, 6, 38, 5),
  (13, 6, 2, 1), (13, 6, 9, 2), (13, 6, 22, 3), (13, 6, 27, 4), (13, 6, 49, 5),
  (14, 6, 4, 1), (14, 6, 12, 2), (14, 6, 21, 3), (14, 6, 33, 4), (14, 6, 51, 5),
  -- Week 7: Genesis
  (1, 7, 5, 1), (1, 7, 10, 2), (1, 7, 23, 3), (1, 7, 31, 4), (1, 7, 40, 5),
  (2, 7, 2, 1), (2, 7, 14, 2), (2, 7, 17, 3), (2, 7, 27, 4), (2, 7, 47, 5),
  (3, 7, 3, 1), (3, 7, 8, 2), (3, 7, 22, 3), (3, 7, 34, 4), (3, 7, 43, 5),
  (4, 7, 1, 1), (4, 7, 15, 2), (4, 7, 19, 3), (4, 7, 29, 4), (4, 7, 48, 5),
  (5, 7, 4, 1), (5, 7, 9, 2), (5, 7, 26, 3), (5, 7, 36, 4), (5, 7, 45, 5),
  (6, 7, 6, 1), (6, 7, 12, 2), (6, 7, 21, 3), (6, 7, 25, 4), (6, 7, 42, 5),
  (7, 7, 5, 1), (7, 7, 7, 2), (7, 7, 20, 3), (7, 7, 33, 4), (7, 7, 39, 5),
  (8, 7, 3, 1), (8, 7, 13, 2), (8, 7, 24, 3), (8, 7, 28, 4), (8, 7, 44, 5),
  (9, 7, 1, 1), (9, 7, 11, 2), (9, 7, 18, 3), (9, 7, 35, 4), (9, 7, 50, 5),
  (10, 7, 2, 1), (10, 7, 16, 2), (10, 7, 22, 3), (10, 7, 30, 4), (10, 7, 41, 5),
  (11, 7, 4, 1), (11, 7, 10, 2), (11, 7, 17, 3), (11, 7, 32, 4), (11, 7, 46, 5),
  (12, 7, 6, 1), (12, 7, 9, 2), (12, 7, 23, 3), (12, 7, 37, 4), (12, 7, 49, 5),
  (13, 7, 1, 1), (13, 7, 11, 2), (13, 7, 19, 3), (13, 7, 34, 4), (13, 7, 38, 5),
  (14, 7, 3, 1), (14, 7, 14, 2), (14, 7, 26, 3), (14, 7, 27, 4), (14, 7, 51, 5),
  -- Week 8: Honda
  (1, 8, 4, 1), (1, 8, 7, 2), (1, 8, 20, 3), (1, 8, 33, 4), (1, 8, 45, 5),
  (2, 8, 6, 1), (2, 8, 13, 2), (2, 8, 19, 3), (2, 8, 28, 4), (2, 8, 42, 5),
  (3, 8, 5, 1), (3, 8, 10, 2), (3, 8, 21, 3), (3, 8, 31, 4), (3, 8, 46, 5),
  (4, 8, 1, 1), (4, 8, 12, 2), (4, 8, 24, 3), (4, 8, 36, 4), (4, 8, 43, 5),
  (5, 8, 2, 1), (5, 8, 11, 2), (5, 8, 18, 3), (5, 8, 27, 4), (5, 8, 50, 5),
  (6, 8, 3, 1), (6, 8, 14, 2), (6, 8, 22, 3), (6, 8, 25, 4), (6, 8, 39, 5),
  (7, 8, 4, 1), (7, 8, 8, 2), (7, 8, 23, 3), (7, 8, 34, 4), (7, 8, 48, 5),
  (8, 8, 6, 1), (8, 8, 16, 2), (8, 8, 17, 3), (8, 8, 26, 4), (8, 8, 41, 5),
  (9, 8, 5, 1), (9, 8, 15, 2), (9, 8, 22, 3), (9, 8, 30, 4), (9, 8, 44, 5),
  (10, 8, 3, 1), (10, 8, 9, 2), (10, 8, 20, 3), (10, 8, 32, 4), (10, 8, 47, 5),
  (11, 8, 2, 1), (11, 8, 7, 2), (11, 8, 26, 3), (11, 8, 35, 4), (11, 8, 38, 5),
  (12, 8, 1, 1), (12, 8, 10, 2), (12, 8, 18, 3), (12, 8, 29, 4), (12, 8, 49, 5),
  (13, 8, 4, 1), (13, 8, 15, 2), (13, 8, 24, 3), (13, 8, 37, 4), (13, 8, 40, 5),
  (14, 8, 6, 1), (14, 8, 11, 2), (14, 8, 19, 3), (14, 8, 31, 4), (14, 8, 50, 5)
ON CONFLICT (player_id, tournament_id, slot) DO NOTHING;

-- Week 4 Results (Farmers)
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (4, 3, '1', -15, 1728000, TRUE),
  (4, 1, 'T2', -13, 950000, TRUE),
  (4, 2, 'T4', -11, 520000, TRUE),
  (4, 4, 'T6', -10, 380000, TRUE),
  (4, 5, 'T2', -13, 950000, TRUE),
  (4, 6, 'T10', -8, 250000, TRUE),
  (4, 7, 'T8', -9, 310000, TRUE),
  (4, 8, 'T15', -6, 170000, TRUE),
  (4, 9, 'T12', -7, 210000, TRUE),
  (4, 10, 'T4', -11, 520000, TRUE),
  (4, 11, 'T18', -5, 140000, TRUE),
  (4, 12, 'T6', -10, 380000, TRUE),
  (4, 13, 'T20', -4, 120000, TRUE),
  (4, 15, 'T22', -3, 100000, TRUE),
  (4, 16, 'T25', -2, 82000, TRUE),
  (4, 17, 'T15', -6, 170000, TRUE),
  (4, 18, 'T8', -9, 310000, TRUE),
  (4, 19, 'T12', -7, 210000, TRUE),
  (4, 20, 'T28', -1, 65000, TRUE),
  (4, 21, 'T10', -8, 250000, TRUE),
  (4, 22, 'T18', -5, 140000, TRUE),
  (4, 23, 'T20', -4, 120000, TRUE),
  (4, 24, 'T30', 0, 48000, TRUE),
  (4, 25, 'T22', -3, 100000, TRUE),
  (4, 26, 'T15', -6, 170000, TRUE),
  (4, 27, 'T25', -2, 82000, TRUE),
  (4, 28, 'T10', -8, 250000, TRUE),
  (4, 29, 'T30', 0, 48000, TRUE),
  (4, 30, 'T22', -3, 100000, TRUE),
  (4, 31, 'T28', -1, 65000, TRUE),
  (4, 32, 'T25', -2, 82000, TRUE),
  (4, 33, 'T30', 0, 48000, TRUE),
  (4, 34, 'T28', -1, 65000, TRUE),
  (4, 35, 'T22', -3, 100000, TRUE),
  (4, 36, 'T30', 0, 48000, TRUE),
  (4, 37, 'T12', -7, 210000, TRUE),
  (4, 38, 'T18', -5, 140000, TRUE),
  (4, 39, 'T25', -2, 82000, TRUE),
  (4, 40, 'T28', -1, 65000, TRUE),
  (4, 41, 'T15', -6, 170000, TRUE),
  (4, 42, 'T30', 0, 48000, TRUE),
  (4, 43, 'CUT', 5, 0, FALSE),
  (4, 44, 'T22', -3, 100000, TRUE),
  (4, 45, 'CUT', 4, 0, FALSE),
  (4, 46, 'T20', -4, 120000, TRUE),
  (4, 47, 'T28', -1, 65000, TRUE),
  (4, 48, 'CUT', 3, 0, FALSE),
  (4, 49, 'T30', 0, 48000, TRUE),
  (4, 50, 'T25', -2, 82000, TRUE),
  (4, 51, 'CUT', 6, 0, FALSE),
  (4, 14, 'T20', -4, 120000, TRUE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Week 5 Results (Pebble Beach)
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (5, 2, '1', -19, 3600000, TRUE),
  (5, 1, 'T3', -16, 1700000, TRUE),
  (5, 3, 'T5', -14, 1050000, TRUE),
  (5, 4, 'T2', -17, 2180000, TRUE),
  (5, 5, 'T8', -12, 730000, TRUE),
  (5, 6, 'T3', -16, 1700000, TRUE),
  (5, 7, 'T10', -11, 600000, TRUE),
  (5, 8, 'T5', -14, 1050000, TRUE),
  (5, 9, 'T12', -10, 470000, TRUE),
  (5, 10, 'T15', -8, 380000, TRUE),
  (5, 11, 'T8', -12, 730000, TRUE),
  (5, 12, 'T18', -7, 310000, TRUE),
  (5, 13, 'T20', -6, 260000, TRUE),
  (5, 14, 'T10', -11, 600000, TRUE),
  (5, 15, 'T22', -5, 220000, TRUE),
  (5, 16, 'T15', -8, 380000, TRUE),
  (5, 17, 'T25', -4, 180000, TRUE),
  (5, 18, 'T12', -10, 470000, TRUE),
  (5, 19, 'T18', -7, 310000, TRUE),
  (5, 20, 'T28', -3, 145000, TRUE),
  (5, 21, 'T20', -6, 260000, TRUE),
  (5, 22, 'T22', -5, 220000, TRUE),
  (5, 23, 'T15', -8, 380000, TRUE),
  (5, 24, 'T25', -4, 180000, TRUE),
  (5, 25, 'T28', -3, 145000, TRUE),
  (5, 26, 'T10', -11, 600000, TRUE),
  (5, 27, 'T30', -2, 110000, TRUE),
  (5, 28, 'T22', -5, 220000, TRUE),
  (5, 29, 'T33', -1, 82000, TRUE),
  (5, 30, 'T25', -4, 180000, TRUE),
  (5, 31, 'T35', 0, 60000, TRUE),
  (5, 33, 'T28', -3, 145000, TRUE),
  (5, 34, 'T30', -2, 110000, TRUE),
  (5, 35, 'T33', -1, 82000, TRUE),
  (5, 36, 'T35', 0, 60000, TRUE),
  (5, 37, 'T18', -7, 310000, TRUE),
  (5, 38, 'T25', -4, 180000, TRUE),
  (5, 39, 'T28', -3, 145000, TRUE),
  (5, 40, 'T30', -2, 110000, TRUE),
  (5, 41, 'T20', -6, 260000, TRUE),
  (5, 42, 'T33', -1, 82000, TRUE),
  (5, 43, 'T35', 0, 60000, TRUE),
  (5, 44, 'T22', -5, 220000, TRUE),
  (5, 45, 'CUT', 5, 0, FALSE),
  (5, 46, 'T30', -2, 110000, TRUE),
  (5, 47, 'T33', -1, 82000, TRUE),
  (5, 48, 'T35', 0, 60000, TRUE),
  (5, 49, 'T28', -3, 145000, TRUE),
  (5, 50, 'T30', -2, 110000, TRUE),
  (5, 51, 'CUT', 4, 0, FALSE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Week 6 Results (Phoenix)
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (6, 5, '1', -22, 3600000, TRUE),
  (6, 1, 'T4', -18, 1400000, TRUE),
  (6, 2, 'T2', -20, 2100000, TRUE),
  (6, 3, 'T6', -16, 900000, TRUE),
  (6, 4, 'T2', -20, 2100000, TRUE),
  (6, 6, 'T8', -15, 720000, TRUE),
  (6, 7, 'T4', -18, 1400000, TRUE),
  (6, 8, 'T10', -14, 580000, TRUE),
  (6, 9, 'T6', -16, 900000, TRUE),
  (6, 10, 'T12', -13, 450000, TRUE),
  (6, 11, 'T14', -12, 360000, TRUE),
  (6, 12, 'T8', -15, 720000, TRUE),
  (6, 13, 'T16', -11, 290000, TRUE),
  (6, 14, 'T10', -14, 580000, TRUE),
  (6, 15, 'T18', -10, 240000, TRUE),
  (6, 16, 'T20', -9, 195000, TRUE),
  (6, 17, 'T14', -12, 360000, TRUE),
  (6, 18, 'T12', -13, 450000, TRUE),
  (6, 19, 'T16', -11, 290000, TRUE),
  (6, 20, 'T22', -8, 155000, TRUE),
  (6, 21, 'T18', -10, 240000, TRUE),
  (6, 22, 'T20', -9, 195000, TRUE),
  (6, 23, 'T24', -7, 125000, TRUE),
  (6, 24, 'T22', -8, 155000, TRUE),
  (6, 25, 'T16', -11, 290000, TRUE),
  (6, 26, 'T24', -7, 125000, TRUE),
  (6, 27, 'T26', -6, 100000, TRUE),
  (6, 28, 'T14', -12, 360000, TRUE),
  (6, 29, 'T28', -5, 78000, TRUE),
  (6, 30, 'T20', -9, 195000, TRUE),
  (6, 31, 'T30', -4, 60000, TRUE),
  (6, 32, 'T26', -6, 100000, TRUE),
  (6, 33, 'T28', -5, 78000, TRUE),
  (6, 34, 'T30', -4, 60000, TRUE),
  (6, 35, 'T26', -6, 100000, TRUE),
  (6, 36, 'T30', -4, 60000, TRUE),
  (6, 37, 'T22', -8, 155000, TRUE),
  (6, 38, 'T24', -7, 125000, TRUE),
  (6, 39, 'T28', -5, 78000, TRUE),
  (6, 40, 'T30', -4, 60000, TRUE),
  (6, 41, 'T18', -10, 240000, TRUE),
  (6, 42, 'T26', -6, 100000, TRUE),
  (6, 43, 'CUT', 3, 0, FALSE),
  (6, 44, 'T28', -5, 78000, TRUE),
  (6, 45, 'T30', -4, 60000, TRUE),
  (6, 46, 'T24', -7, 125000, TRUE),
  (6, 47, 'T28', -5, 78000, TRUE),
  (6, 48, 'CUT', 2, 0, FALSE),
  (6, 49, 'T30', -4, 60000, TRUE),
  (6, 50, 'T26', -6, 100000, TRUE),
  (6, 51, 'T30', -4, 60000, TRUE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Week 7 Results (Genesis)
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (7, 1, '1', -17, 3600000, TRUE),
  (7, 2, 'T3', -14, 1700000, TRUE),
  (7, 3, 'T2', -15, 2180000, TRUE),
  (7, 4, 'T5', -12, 1050000, TRUE),
  (7, 5, 'T3', -14, 1700000, TRUE),
  (7, 6, 'T8', -10, 730000, TRUE),
  (7, 7, 'T10', -9, 600000, TRUE),
  (7, 8, 'T5', -12, 1050000, TRUE),
  (7, 9, 'T12', -8, 470000, TRUE),
  (7, 10, 'T8', -10, 730000, TRUE),
  (7, 11, 'T15', -7, 380000, TRUE),
  (7, 12, 'T10', -9, 600000, TRUE),
  (7, 13, 'T18', -6, 310000, TRUE),
  (7, 14, 'T12', -8, 470000, TRUE),
  (7, 15, 'T20', -5, 260000, TRUE),
  (7, 16, 'T22', -4, 220000, TRUE),
  (7, 17, 'T15', -7, 380000, TRUE),
  (7, 18, 'T18', -6, 310000, TRUE),
  (7, 19, 'T10', -9, 600000, TRUE),
  (7, 20, 'T22', -4, 220000, TRUE),
  (7, 21, 'T20', -5, 260000, TRUE),
  (7, 22, 'T15', -7, 380000, TRUE),
  (7, 23, 'T25', -3, 180000, TRUE),
  (7, 24, 'T22', -4, 220000, TRUE),
  (7, 25, 'T18', -6, 310000, TRUE),
  (7, 26, 'T12', -8, 470000, TRUE),
  (7, 27, 'T28', -2, 130000, TRUE),
  (7, 28, 'T20', -5, 260000, TRUE),
  (7, 29, 'T30', -1, 95000, TRUE),
  (7, 30, 'T25', -3, 180000, TRUE),
  (7, 31, 'T28', -2, 130000, TRUE),
  (7, 32, 'T30', -1, 95000, TRUE),
  (7, 33, 'T25', -3, 180000, TRUE),
  (7, 34, 'T28', -2, 130000, TRUE),
  (7, 35, 'T30', -1, 95000, TRUE),
  (7, 36, 'T28', -2, 130000, TRUE),
  (7, 37, 'T22', -4, 220000, TRUE),
  (7, 38, 'T25', -3, 180000, TRUE),
  (7, 39, 'T30', -1, 95000, TRUE),
  (7, 40, 'T28', -2, 130000, TRUE),
  (7, 41, 'T20', -5, 260000, TRUE),
  (7, 42, 'T25', -3, 180000, TRUE),
  (7, 43, 'T30', -1, 95000, TRUE),
  (7, 44, 'T22', -4, 220000, TRUE),
  (7, 45, 'CUT', 4, 0, FALSE),
  (7, 46, 'T28', -2, 130000, TRUE),
  (7, 47, 'T30', -1, 95000, TRUE),
  (7, 48, 'CUT', 3, 0, FALSE),
  (7, 49, 'T30', -1, 95000, TRUE),
  (7, 50, 'T25', -3, 180000, TRUE),
  (7, 51, 'T30', -1, 95000, TRUE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- Week 8 Results (Honda)
INSERT INTO results (tournament_id, golfer_id, finish_position, score_to_par, earnings, made_cut) VALUES
  (8, 7, '1', -12, 1512000, TRUE),
  (8, 1, 'T3', -10, 680000, TRUE),
  (8, 2, 'T5', -8, 430000, TRUE),
  (8, 3, 'T2', -11, 890000, TRUE),
  (8, 4, 'T3', -10, 680000, TRUE),
  (8, 5, 'T8', -7, 310000, TRUE),
  (8, 6, 'T5', -8, 430000, TRUE),
  (8, 8, 'T10', -6, 260000, TRUE),
  (8, 9, 'T8', -7, 310000, TRUE),
  (8, 10, 'T12', -5, 210000, TRUE),
  (8, 11, 'T10', -6, 260000, TRUE),
  (8, 12, 'T14', -4, 170000, TRUE),
  (8, 13, 'T12', -5, 210000, TRUE),
  (8, 14, 'T16', -3, 140000, TRUE),
  (8, 15, 'T14', -4, 170000, TRUE),
  (8, 16, 'T18', -2, 115000, TRUE),
  (8, 17, 'T16', -3, 140000, TRUE),
  (8, 18, 'T14', -4, 170000, TRUE),
  (8, 19, 'T20', -1, 90000, TRUE),
  (8, 20, 'T18', -2, 115000, TRUE),
  (8, 21, 'T16', -3, 140000, TRUE),
  (8, 22, 'T20', -1, 90000, TRUE),
  (8, 23, 'T22', 0, 72000, TRUE),
  (8, 24, 'T20', -1, 90000, TRUE),
  (8, 25, 'T18', -2, 115000, TRUE),
  (8, 26, 'T14', -4, 170000, TRUE),
  (8, 27, 'T22', 0, 72000, TRUE),
  (8, 28, 'T16', -3, 140000, TRUE),
  (8, 29, 'T24', 1, 55000, TRUE),
  (8, 30, 'T22', 0, 72000, TRUE),
  (8, 31, 'T24', 1, 55000, TRUE),
  (8, 32, 'T22', 0, 72000, TRUE),
  (8, 33, 'T24', 1, 55000, TRUE),
  (8, 34, 'T24', 1, 55000, TRUE),
  (8, 35, 'T22', 0, 72000, TRUE),
  (8, 36, 'CUT', 5, 0, FALSE),
  (8, 37, 'T18', -2, 115000, TRUE),
  (8, 38, 'T20', -1, 90000, TRUE),
  (8, 39, 'T22', 0, 72000, TRUE),
  (8, 40, 'T24', 1, 55000, TRUE),
  (8, 41, 'T16', -3, 140000, TRUE),
  (8, 42, 'T22', 0, 72000, TRUE),
  (8, 43, 'CUT', 6, 0, FALSE),
  (8, 44, 'T20', -1, 90000, TRUE),
  (8, 45, 'T24', 1, 55000, TRUE),
  (8, 46, 'T18', -2, 115000, TRUE),
  (8, 47, 'T22', 0, 72000, TRUE),
  (8, 48, 'T24', 1, 55000, TRUE),
  (8, 49, 'CUT', 4, 0, FALSE),
  (8, 50, 'T22', 0, 72000, TRUE),
  (8, 51, 'T24', 1, 55000, TRUE)
ON CONFLICT (tournament_id, golfer_id) DO NOTHING;

-- ============================================
-- CALCULATE WEEKLY SCORES for Weeks 1-8
-- (sum of earnings from each player's 5 picks)
-- ============================================

-- This calculates and inserts weekly_scores from lineups + results
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings, total_salary, best_golfer, best_golfer_earnings)
SELECT
  l.player_id,
  l.tournament_id,
  COALESCE(SUM(r.earnings), 0) as total_earnings,
  SUM(g.salary) as total_salary,
  (SELECT g2.name FROM lineups l2
   JOIN golfers g2 ON g2.id = l2.golfer_id
   LEFT JOIN results r2 ON r2.tournament_id = l2.tournament_id AND r2.golfer_id = l2.golfer_id
   WHERE l2.player_id = l.player_id AND l2.tournament_id = l.tournament_id
   ORDER BY COALESCE(r2.earnings, 0) DESC LIMIT 1) as best_golfer,
  (SELECT COALESCE(MAX(r2.earnings), 0) FROM lineups l2
   LEFT JOIN results r2 ON r2.tournament_id = l2.tournament_id AND r2.golfer_id = l2.golfer_id
   WHERE l2.player_id = l.player_id AND l2.tournament_id = l.tournament_id) as best_golfer_earnings
FROM lineups l
JOIN golfers g ON g.id = l.golfer_id
LEFT JOIN results r ON r.tournament_id = l.tournament_id AND r.golfer_id = l.golfer_id
WHERE l.tournament_id <= 8
GROUP BY l.player_id, l.tournament_id
ON CONFLICT (player_id, tournament_id) DO UPDATE SET
  total_earnings = EXCLUDED.total_earnings,
  total_salary = EXCLUDED.total_salary,
  best_golfer = EXCLUDED.best_golfer,
  best_golfer_earnings = EXCLUDED.best_golfer_earnings;

-- ============================================
-- UPDATE SEASON STANDINGS
-- ============================================
UPDATE standings SET
  total_earnings = sub.total,
  weeks_played = sub.weeks,
  best_week = sub.best,
  worst_week = sub.worst,
  avg_weekly = sub.avg_w,
  weekly_wins = sub.wins,
  updated_at = NOW()
FROM (
  SELECT
    ws.player_id,
    SUM(ws.total_earnings) as total,
    COUNT(*) as weeks,
    MAX(ws.total_earnings) as best,
    MIN(ws.total_earnings) as worst,
    AVG(ws.total_earnings) as avg_w,
    (SELECT COUNT(*) FROM (
      SELECT tournament_id, player_id,
        RANK() OVER (PARTITION BY tournament_id ORDER BY total_earnings DESC) as rnk
      FROM weekly_scores
    ) ranked WHERE ranked.player_id = ws.player_id AND ranked.rnk = 1) as wins
  FROM weekly_scores ws
  GROUP BY ws.player_id
) sub
WHERE standings.player_id = sub.player_id;

-- ============================================
-- UPDATE GOLFER USAGE
-- ============================================
INSERT INTO golfer_usage (player_id, golfer_id, times_used, total_earnings)
SELECT
  l.player_id,
  l.golfer_id,
  COUNT(*) as times_used,
  COALESCE(SUM(r.earnings), 0) as total_earnings
FROM lineups l
LEFT JOIN results r ON r.tournament_id = l.tournament_id AND r.golfer_id = l.golfer_id
GROUP BY l.player_id, l.golfer_id
ON CONFLICT (player_id, golfer_id) DO UPDATE SET
  times_used = EXCLUDED.times_used,
  total_earnings = EXCLUDED.total_earnings;
