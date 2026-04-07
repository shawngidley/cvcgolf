-- CVC Fantasy Golf 2026 - Seed Data
-- 14 Players, 27 Tournaments, 100+ Golfers, Weeks 1-8 Historical

-- ============================================
-- PLAYERS (14 members with passwords)
-- ============================================
INSERT INTO players (name, password, is_commissioner) VALUES
  ('Scott Nelson', 'nelson1', FALSE),
  ('Scott Tomko', 'tomko2', FALSE),
  ('Steve Walker', 'walker3', FALSE),
  ('Matt Federer', 'federer4', FALSE),
  ('Shawn Gidley', 'cvcgolf2026', TRUE),
  ('Joe Cas', 'cas6', FALSE),
  ('David Sotka', 'sotka7', FALSE),
  ('Jamie Yane', 'yane8', FALSE),
  ('Keith Cromer', 'cromer9', FALSE),
  ('Jack Ehrbar', 'ehrbar10', FALSE),
  ('Dave Sutton', 'sutton11', FALSE),
  ('Dan Osicki', 'dosicki12', FALSE),
  ('Josh Osicki', 'josicki13', FALSE),
  ('Matt Janssen', 'janssen14', FALSE)
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
  (9, 'Arnold Palmer Invitational', 'API', 'Bay Hill Club & Lodge', 'Orlando, FL', '2026-02-26', '2026-03-01', 20.00, FALSE, TRUE, TRUE, 9),
  (10, 'Puerto Rico Open', 'Puerto Rico', 'Grand Reserve GC', 'Rio Grande, PR', '2026-03-05', '2026-03-08', 4.00, FALSE, FALSE, TRUE, 10),
  (11, 'THE PLAYERS Championship', 'TPC', 'TPC Sawgrass (Stadium)', 'Ponte Vedra Beach, FL', '2026-03-12', '2026-03-15', 25.00, FALSE, TRUE, TRUE, 11),
  (12, 'Valspar Championship', 'Valspar', 'Innisbrook (Copperhead)', 'Palm Harbor, FL', '2026-03-19', '2026-03-22', 8.40, FALSE, FALSE, TRUE, 12),
  (13, 'Houston Open', 'Houston', 'Memorial Park Golf Course', 'Houston, TX', '2026-03-25', '2026-03-28', 9.40, FALSE, FALSE, TRUE, 13),
  (14, 'Valero Texas Open', 'Texas Open', 'TPC San Antonio (Oaks)', 'San Antonio, TX', '2026-04-02', '2026-04-05', 8.80, FALSE, FALSE, TRUE, 14),
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
  ('Ludvig Aberg', 25, 5, 'Superstar'),
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
-- WEEKLY SCORES - Real earnings data (Weeks 1-8)
-- Tournament ID mapping:
--   Week 1 (WM Phoenix Open) = tournament 6
--   Week 2 (Pebble Beach Pro-Am) = tournament 5
--   Week 3 (Genesis Invitational) = tournament 7
--   Week 4 (Arnold Palmer Invitational) = tournament 9
--   Week 5 (The Players Championship) = tournament 11
--   Week 6 (Valspar Championship) = tournament 12
--   Week 7 (Houston Open) = tournament 13
--   Week 8 (Valero Texas Open) = tournament 14
-- Player IDs: 1=Scott Nelson, 2=Scott Tomko, 3=Steve Walker,
--   4=Matt Federer, 5=Shawn Gidley, 6=Joe Cas, 7=David Sotka,
--   8=Jamie Yane, 9=Keith Cromer, 10=Jack Ehrbar, 11=Dave Sutton,
--   12=Dan Osicki, 13=Josh Osicki, 14=Matt Janssen
-- ============================================

-- Week 1: WM Phoenix Open (tournament_id = 6)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 6, 2039200.00),
  (2, 6, 724709.00),
  (3, 6, 2201760.00),
  (4, 6, 1674080.00),
  (5, 6, 1391200.00),
  (6, 6, 1065029.00),
  (7, 6, 1771109.00),
  (8, 6, 407749.00),
  (9, 6, 1520160.00),
  (10, 6, 685120.00),
  (11, 6, 1224160.00),
  (12, 6, 470698.00),
  (13, 6, 881280.00),
  (14, 6, 122720.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 2: Pebble Beach Pro-Am (tournament_id = 5)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 5, 1395375.00),
  (2, 5, 1297125.00),
  (3, 5, 1296325.00),
  (4, 5, 2395875.00),
  (5, 5, 656000.00),
  (6, 5, 1289875.00),
  (7, 5, 643250.00),
  (8, 5, 1389250.00),
  (9, 5, 1214625.00),
  (10, 5, 1490875.00),
  (11, 5, 1246500.00),
  (12, 5, 835875.00),
  (13, 5, 1241358.00),
  (14, 5, 1469125.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 3: Genesis Invitational (tournament_id = 7)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 7, 1577750.00),
  (2, 7, 5591950.00),
  (3, 7, 1274450.00),
  (4, 7, 2826950.00),
  (5, 7, 1780650.00),
  (6, 7, 822000.00),
  (7, 7, 2144650.00),
  (8, 7, 2106750.00),
  (9, 7, 1826900.00),
  (10, 7, 1246950.00),
  (11, 7, 2631950.00),
  (12, 7, 1291200.00),
  (13, 7, 778750.00),
  (14, 7, 2180900.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 4: Arnold Palmer Invitational (tournament_id = 9)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 9, 1120000.00),
  (2, 9, 1362000.00),
  (3, 9, 885000.00),
  (4, 9, 1075000.00),
  (5, 9, 1960000.00),
  (6, 9, 1277000.00),
  (7, 9, 2258000.00),
  (8, 9, 2648200.00),
  (9, 9, 291000.00),
  (10, 9, 1347200.00),
  (11, 9, 1369200.00),
  (12, 9, 1153000.00),
  (13, 9, 1041000.00),
  (14, 9, 620200.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 5: The Players Championship (tournament_id = 11)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 11, 7208000.00),
  (2, 11, 1835000.00),
  (3, 11, 2397610.00),
  (4, 11, 1970750.00),
  (5, 11, 1770083.00),
  (6, 11, 1382500.00),
  (7, 11, 2193527.00),
  (8, 11, 920583.00),
  (9, 11, 332333.00),
  (10, 11, 2708000.00),
  (11, 11, 2065277.00),
  (12, 11, 1254110.00),
  (13, 11, 396125.00),
  (14, 11, 910000.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 6: Valspar Championship (tournament_id = 12)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 12, 482482.00),
  (2, 12, 2020958.00),
  (3, 12, 2297370.00),
  (4, 12, 102284.00),
  (5, 12, 1979614.00),
  (6, 12, 2127079.00),
  (7, 12, 445991.00),
  (8, 12, 212667.00),
  (9, 12, 2452298.00),
  (10, 12, 603785.00),
  (11, 12, 445991.00),
  (12, 12, 731169.00),
  (13, 12, 2011100.00),
  (14, 12, 281827.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 7: Houston Open (tournament_id = 13)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 13, 477751.00),
  (2, 13, 998887.00),
  (3, 13, 1386224.00),
  (4, 13, 1346400.00),
  (5, 13, 743589.00),
  (6, 13, 2082712.00),
  (7, 13, 665604.00),
  (8, 13, 1483591.00),
  (9, 13, 1063237.00),
  (10, 13, 1201689.00),
  (11, 13, 119250.00),
  (12, 13, 948172.00),
  (13, 13, 1166962.00),
  (14, 13, 647955.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 8: Valero Texas Open (tournament_id = 14)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 14, 180614.00),
  (2, 14, 616175.00),
  (3, 14, 1548808.00),
  (4, 14, 900783.00),
  (5, 14, 894256.00),
  (6, 14, 858447.00),
  (7, 14, 450114.00),
  (8, 14, 1096097.00),
  (9, 14, 1516958.00),
  (10, 14, 757765.00),
  (11, 14, 616175.00),
  (12, 14, 1512058.00),
  (13, 14, 237650.00),
  (14, 14, 733089.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

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
