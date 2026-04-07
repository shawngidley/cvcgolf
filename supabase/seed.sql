-- CVC Fantasy Golf 2026 - Seed Data
-- 14 Players, 27 Tournaments (Feb-Aug), 100+ Golfers, Weeks 1-8 Historical

-- ============================================
-- PLAYERS (14 members with passwords)
-- ============================================
INSERT INTO players (name, password, is_commissioner) VALUES
  ('Scott Nelson', 'nelson2026', FALSE),
  ('Scott Tomko', 'tomko2026', FALSE),
  ('Steve Walker', 'walker2026', FALSE),
  ('Matt Federer', 'federer2026', FALSE),
  ('Shawn Gidley', 'gidley2026', TRUE),
  ('Joe Cas', 'cas2026', FALSE),
  ('David Sotka', 'sotka2026', FALSE),
  ('Jamie Yane', 'yane2026', FALSE),
  ('Keith Cromer', 'cromer2026', FALSE),
  ('Jack Ehrbar', 'ehrbar2026', FALSE),
  ('Dave Sutton', 'sutton2026', FALSE),
  ('Dan Osicki', 'dosicki2026', FALSE),
  ('Josh Osicki', 'josicki2026', FALSE),
  ('Matt Janssen', 'janssen2026', FALSE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TOURNAMENTS (27 weeks, 2026 CVC Fantasy Golf season)
-- ============================================
INSERT INTO tournaments (week_number, name, short_name, course, location, start_date, end_date, purse_millions, is_major, is_signature, is_complete, is_current, sort_order) VALUES
  (1, 'WM Phoenix Open', 'Phoenix', 'TPC Scottsdale (Stadium)', 'Scottsdale, AZ', '2026-02-05', '2026-02-08', 20.00, FALSE, FALSE, TRUE, FALSE, 1),
  (2, 'Pebble Beach Pro-Am', 'Pebble Beach', 'Pebble Beach Golf Links', 'Pebble Beach, CA', '2026-02-12', '2026-02-15', 20.00, FALSE, TRUE, TRUE, FALSE, 2),
  (3, 'Genesis Invitational', 'Genesis', 'Riviera Country Club', 'Pacific Palisades, CA', '2026-02-19', '2026-02-22', 20.00, FALSE, TRUE, TRUE, FALSE, 3),
  (4, 'Arnold Palmer Invitational', 'API', 'Bay Hill Club & Lodge', 'Orlando, FL', '2026-03-05', '2026-03-08', 20.00, FALSE, TRUE, TRUE, FALSE, 4),
  (5, 'The Players Championship', 'TPC', 'TPC Sawgrass (Stadium)', 'Ponte Vedra Beach, FL', '2026-03-12', '2026-03-15', 25.00, FALSE, FALSE, TRUE, FALSE, 5),
  (6, 'Valspar Championship', 'Valspar', 'Innisbrook (Copperhead)', 'Palm Harbor, FL', '2026-03-19', '2026-03-22', 8.40, FALSE, FALSE, TRUE, FALSE, 6),
  (7, 'Texas Children''s Houston Open', 'Houston', 'Memorial Park Golf Course', 'Houston, TX', '2026-03-26', '2026-03-29', 9.40, FALSE, FALSE, TRUE, FALSE, 7),
  (8, 'Valero Texas Open', 'Texas Open', 'TPC San Antonio (Oaks)', 'San Antonio, TX', '2026-04-02', '2026-04-05', 8.80, FALSE, FALSE, TRUE, FALSE, 8),
  (9, 'THE MASTERS', 'Masters', 'Augusta National Golf Club', 'Augusta, GA', '2026-04-09', '2026-04-12', 20.00, TRUE, FALSE, FALSE, TRUE, 9),
  (10, 'RBC Heritage', 'Heritage', 'Harbour Town Golf Links', 'Hilton Head, SC', '2026-04-16', '2026-04-19', 20.00, FALSE, TRUE, FALSE, FALSE, 10),
  (11, 'Cadillac Championship', 'Cadillac', 'TPC Doral (Blue Monster)', 'Miami, FL', '2026-04-30', '2026-05-03', 20.00, FALSE, TRUE, FALSE, FALSE, 11),
  (12, 'Truist Championship', 'Truist', 'TPC Potomac', 'Potomac, MD', '2026-05-07', '2026-05-10', 20.00, FALSE, TRUE, FALSE, FALSE, 12),
  (13, 'PGA CHAMPIONSHIP', 'PGA Champ', 'Aronimink Golf Club', 'Newtown Square, PA', '2026-05-14', '2026-05-17', 18.50, TRUE, FALSE, FALSE, FALSE, 13),
  (14, 'CJ Cup Byron Nelson', 'Byron Nelson', 'TPC Craig Ranch', 'McKinney, TX', '2026-05-21', '2026-05-24', 9.50, FALSE, FALSE, FALSE, FALSE, 14),
  (15, 'Charles Schwab Challenge', 'Colonial', 'Colonial Country Club', 'Fort Worth, TX', '2026-05-28', '2026-05-31', 9.20, FALSE, FALSE, FALSE, FALSE, 15),
  (16, 'The Memorial', 'Memorial', 'Muirfield Village GC', 'Dublin, OH', '2026-06-04', '2026-06-07', 20.00, FALSE, TRUE, FALSE, FALSE, 16),
  (17, 'Canadian Open', 'Canadian', 'Hamilton Golf & CC', 'Hamilton, ON', '2026-06-11', '2026-06-14', 9.40, FALSE, FALSE, FALSE, FALSE, 17),
  (18, 'US OPEN', 'US Open', 'Shinnecock Hills Golf Club', 'Southampton, NY', '2026-06-18', '2026-06-21', 21.50, TRUE, FALSE, FALSE, FALSE, 18),
  (19, 'Travelers Championship', 'Travelers', 'TPC River Highlands', 'Cromwell, CT', '2026-06-25', '2026-06-28', 20.00, FALSE, TRUE, FALSE, FALSE, 19),
  (20, 'Scottish Open', 'Scottish', 'The Renaissance Club', 'North Berwick, Scotland', '2026-07-09', '2026-07-12', 9.00, FALSE, FALSE, FALSE, FALSE, 20),
  (21, 'THE OPEN CHAMPIONSHIP', 'The Open', 'Royal Portrush Golf Club', 'Portrush, N. Ireland', '2026-07-16', '2026-07-19', 17.00, TRUE, FALSE, FALSE, FALSE, 21),
  (22, '3M Open', '3M', 'TPC Twin Cities', 'Blaine, MN', '2026-07-23', '2026-07-26', 8.40, FALSE, FALSE, FALSE, FALSE, 22),
  (23, 'Rocket Mortgage Classic', 'Rocket', 'Detroit Golf Club', 'Detroit, MI', '2026-07-30', '2026-08-02', 8.40, FALSE, FALSE, FALSE, FALSE, 23),
  (24, 'Wyndham Championship', 'Wyndham', 'Sedgefield Country Club', 'Greensboro, NC', '2026-08-06', '2026-08-09', 8.40, FALSE, FALSE, FALSE, FALSE, 24),
  (25, 'FedEx St. Jude Championship', 'St. Jude', 'TPC Southwind', 'Memphis, TN', '2026-08-13', '2026-08-16', 20.00, FALSE, FALSE, FALSE, FALSE, 25),
  (26, 'BMW Championship', 'BMW', 'Caves Valley Golf Club', 'Owings Mills, MD', '2026-08-20', '2026-08-23', 20.00, FALSE, FALSE, FALSE, FALSE, 26),
  (27, 'Tour Championship', 'Tour Champ', 'East Lake Golf Club', 'Atlanta, GA', '2026-08-27', '2026-08-30', 25.00, FALSE, FALSE, FALSE, FALSE, 27)
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
-- Tournament IDs match week numbers (week 1 = id 1, etc.)
-- Player IDs: 1=Scott Nelson, 2=Scott Tomko, 3=Steve Walker,
--   4=Matt Federer, 5=Shawn Gidley, 6=Joe Cas, 7=David Sotka,
--   8=Jamie Yane, 9=Keith Cromer, 10=Jack Ehrbar, 11=Dave Sutton,
--   12=Dan Osicki, 13=Josh Osicki, 14=Matt Janssen
-- ============================================

-- Week 1: WM Phoenix Open (tournament_id = 1)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 1, 2039200.00),
  (2, 1, 724709.00),
  (3, 1, 2201760.00),
  (4, 1, 1674080.00),
  (5, 1, 1391200.00),
  (6, 1, 1065029.00),
  (7, 1, 1771109.00),
  (8, 1, 407749.00),
  (9, 1, 1520160.00),
  (10, 1, 685120.00),
  (11, 1, 1224160.00),
  (12, 1, 470698.00),
  (13, 1, 881280.00),
  (14, 1, 122720.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 2: Pebble Beach Pro-Am (tournament_id = 2)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 2, 1395375.00),
  (2, 2, 1297125.00),
  (3, 2, 1296325.00),
  (4, 2, 2395875.00),
  (5, 2, 656000.00),
  (6, 2, 1289875.00),
  (7, 2, 643250.00),
  (8, 2, 1389250.00),
  (9, 2, 1214625.00),
  (10, 2, 1490875.00),
  (11, 2, 1246500.00),
  (12, 2, 835875.00),
  (13, 2, 1241358.00),
  (14, 2, 1469125.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 3: Genesis Invitational (tournament_id = 3)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 3, 1577750.00),
  (2, 3, 5591950.00),
  (3, 3, 1274450.00),
  (4, 3, 2826950.00),
  (5, 3, 1780650.00),
  (6, 3, 822000.00),
  (7, 3, 2144650.00),
  (8, 3, 2106750.00),
  (9, 3, 1826900.00),
  (10, 3, 1246950.00),
  (11, 3, 2631950.00),
  (12, 3, 1291200.00),
  (13, 3, 778750.00),
  (14, 3, 2180900.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 4: Arnold Palmer Invitational (tournament_id = 4)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 4, 1120000.00),
  (2, 4, 1362000.00),
  (3, 4, 885000.00),
  (4, 4, 1075000.00),
  (5, 4, 1960000.00),
  (6, 4, 1277000.00),
  (7, 4, 2258000.00),
  (8, 4, 2648200.00),
  (9, 4, 291000.00),
  (10, 4, 1347200.00),
  (11, 4, 1369200.00),
  (12, 4, 1153000.00),
  (13, 4, 1041000.00),
  (14, 4, 620200.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 5: The Players Championship (tournament_id = 5)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 5, 7208000.00),
  (2, 5, 1835000.00),
  (3, 5, 2397610.00),
  (4, 5, 1970750.00),
  (5, 5, 1770083.00),
  (6, 5, 1382500.00),
  (7, 5, 2193527.00),
  (8, 5, 920583.00),
  (9, 5, 332333.00),
  (10, 5, 2708000.00),
  (11, 5, 2065277.00),
  (12, 5, 1254110.00),
  (13, 5, 396125.00),
  (14, 5, 910000.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 6: Valspar Championship (tournament_id = 6)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 6, 482482.00),
  (2, 6, 2020958.00),
  (3, 6, 2297370.00),
  (4, 6, 102284.00),
  (5, 6, 1979614.00),
  (6, 6, 2127079.00),
  (7, 6, 445991.00),
  (8, 6, 212667.00),
  (9, 6, 2452298.00),
  (10, 6, 603785.00),
  (11, 6, 445991.00),
  (12, 6, 731169.00),
  (13, 6, 2011100.00),
  (14, 6, 281827.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 7: Texas Children's Houston Open (tournament_id = 7)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 7, 477751.00),
  (2, 7, 998887.00),
  (3, 7, 1386224.00),
  (4, 7, 1346400.00),
  (5, 7, 743589.00),
  (6, 7, 2082712.00),
  (7, 7, 665604.00),
  (8, 7, 1483591.00),
  (9, 7, 1063237.00),
  (10, 7, 1201689.00),
  (11, 7, 119250.00),
  (12, 7, 948172.00),
  (13, 7, 1166962.00),
  (14, 7, 647955.00)
ON CONFLICT (player_id, tournament_id) DO UPDATE SET total_earnings = EXCLUDED.total_earnings;

-- Week 8: Valero Texas Open (tournament_id = 8)
INSERT INTO weekly_scores (player_id, tournament_id, total_earnings) VALUES
  (1, 8, 180614.00),
  (2, 8, 616175.00),
  (3, 8, 1548808.00),
  (4, 8, 900783.00),
  (5, 8, 894256.00),
  (6, 8, 858447.00),
  (7, 8, 450114.00),
  (8, 8, 1096097.00),
  (9, 8, 1516958.00),
  (10, 8, 757765.00),
  (11, 8, 616175.00),
  (12, 8, 1512058.00),
  (13, 8, 237650.00),
  (14, 8, 733089.00)
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
