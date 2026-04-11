-- CVC Fantasy Golf 2026 - Tournament Schedule Update
-- Run this in Supabase SQL Editor to update ONLY the tournaments table
-- without affecting players, golfers, weekly_scores, or standings.
-- Updated: 2026-04-07

-- First, reset all flags
UPDATE tournaments SET is_complete = FALSE, is_current = FALSE;

-- Week 1: WM Phoenix Open (Full Field) - COMPLETED
UPDATE tournaments SET
  name = 'WM Phoenix Open',
  short_name = 'Phoenix',
  course = 'TPC Scottsdale (Stadium)',
  location = 'Scottsdale, AZ',
  start_date = '2026-02-05',
  end_date = '2026-02-08',
  purse_millions = 9.20,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 1
WHERE week_number = 1;

-- Week 2: Pebble Beach Pro-Am (Signature No Cut) - COMPLETED
UPDATE tournaments SET
  name = 'Pebble Beach Pro-Am',
  short_name = 'Pebble Beach',
  course = 'Pebble Beach Golf Links',
  location = 'Pebble Beach, CA',
  start_date = '2026-02-12',
  end_date = '2026-02-15',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 2
WHERE week_number = 2;

-- Week 3: Genesis Invitational (Signature With Cut) - COMPLETED
UPDATE tournaments SET
  name = 'Genesis Invitational',
  short_name = 'Genesis',
  course = 'Riviera Country Club',
  location = 'Pacific Palisades, CA',
  start_date = '2026-02-19',
  end_date = '2026-02-22',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 3
WHERE week_number = 3;

-- Week 4: Arnold Palmer Invitational (Signature With Cut) - COMPLETED
UPDATE tournaments SET
  name = 'Arnold Palmer Invitational',
  short_name = 'API',
  course = 'Bay Hill Club & Lodge',
  location = 'Orlando, FL',
  start_date = '2026-03-05',
  end_date = '2026-03-08',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 4
WHERE week_number = 4;

-- Week 5: The Players Championship (Full Field) - COMPLETED
UPDATE tournaments SET
  name = 'The Players Championship',
  short_name = 'TPC',
  course = 'TPC Sawgrass (Stadium)',
  location = 'Ponte Vedra Beach, FL',
  start_date = '2026-03-12',
  end_date = '2026-03-15',
  purse_millions = 25.00,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 5
WHERE week_number = 5;

-- Week 6: Valspar Championship (Full Field) - COMPLETED
UPDATE tournaments SET
  name = 'Valspar Championship',
  short_name = 'Valspar',
  course = 'Innisbrook (Copperhead)',
  location = 'Palm Harbor, FL',
  start_date = '2026-03-19',
  end_date = '2026-03-22',
  purse_millions = 8.70,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 6
WHERE week_number = 6;

-- Week 7: Texas Children's Houston Open (Full Field) - COMPLETED
UPDATE tournaments SET
  name = 'Texas Children''s Houston Open',
  short_name = 'Houston',
  course = 'Memorial Park Golf Course',
  location = 'Houston, TX',
  start_date = '2026-03-26',
  end_date = '2026-03-29',
  purse_millions = 9.50,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 7
WHERE week_number = 7;

-- Week 8: Valero Texas Open (Full Field) - COMPLETED
UPDATE tournaments SET
  name = 'Valero Texas Open',
  short_name = 'Texas Open',
  course = 'TPC San Antonio (Oaks)',
  location = 'San Antonio, TX',
  start_date = '2026-04-02',
  end_date = '2026-04-05',
  purse_millions = 9.50,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = TRUE,
  is_current = FALSE,
  sort_order = 8
WHERE week_number = 8;

-- Week 9: THE MASTERS (Major) - CURRENT/ACTIVE
UPDATE tournaments SET
  name = 'THE MASTERS',
  short_name = 'Masters',
  course = 'Augusta National Golf Club',
  location = 'Augusta, GA',
  start_date = '2026-04-09',
  end_date = '2026-04-12',
  purse_millions = 21.00,
  is_major = TRUE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = TRUE,
  sort_order = 9
WHERE week_number = 9;

-- Week 10: RBC Heritage (Signature No Cut) - UPCOMING
UPDATE tournaments SET
  name = 'RBC Heritage',
  short_name = 'Heritage',
  course = 'Harbour Town Golf Links',
  location = 'Hilton Head, SC',
  start_date = '2026-04-16',
  end_date = '2026-04-19',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 10
WHERE week_number = 10;

-- Week 11: Cadillac Championship (Signature No Cut) - UPCOMING
UPDATE tournaments SET
  name = 'Cadillac Championship',
  short_name = 'Cadillac',
  course = 'TPC Doral (Blue Monster)',
  location = 'Miami, FL',
  start_date = '2026-04-30',
  end_date = '2026-05-03',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 11
WHERE week_number = 11;

-- Week 12: Truist Championship (Signature No Cut) - UPCOMING
UPDATE tournaments SET
  name = 'Truist Championship',
  short_name = 'Truist',
  course = 'TPC Potomac',
  location = 'Potomac, MD',
  start_date = '2026-05-07',
  end_date = '2026-05-10',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 12
WHERE week_number = 12;

-- Week 13: PGA CHAMPIONSHIP (Major) - UPCOMING
UPDATE tournaments SET
  name = 'PGA CHAMPIONSHIP',
  short_name = 'PGA Champ',
  course = 'Aronimink Golf Club',
  location = 'Newtown Square, PA',
  start_date = '2026-05-14',
  end_date = '2026-05-17',
  purse_millions = 19.00,
  is_major = TRUE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 13
WHERE week_number = 13;

-- Week 14: CJ Cup Byron Nelson (Full Field) - UPCOMING
UPDATE tournaments SET
  name = 'CJ Cup Byron Nelson',
  short_name = 'Byron Nelson',
  course = 'TPC Craig Ranch',
  location = 'McKinney, TX',
  start_date = '2026-05-21',
  end_date = '2026-05-24',
  purse_millions = 9.90,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 14
WHERE week_number = 14;

-- Week 15: Charles Schwab Challenge (Full Field) - UPCOMING
UPDATE tournaments SET
  name = 'Charles Schwab Challenge',
  short_name = 'Colonial',
  course = 'Colonial Country Club',
  location = 'Fort Worth, TX',
  start_date = '2026-05-28',
  end_date = '2026-05-31',
  purse_millions = 9.50,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 15
WHERE week_number = 15;

-- Week 16: The Memorial (Signature With Cut) - UPCOMING
UPDATE tournaments SET
  name = 'The Memorial',
  short_name = 'Memorial',
  course = 'Muirfield Village GC',
  location = 'Dublin, OH',
  start_date = '2026-06-04',
  end_date = '2026-06-07',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 16
WHERE week_number = 16;

-- Week 17: Canadian Open (Full Field) - UPCOMING
UPDATE tournaments SET
  name = 'Canadian Open',
  short_name = 'Canadian',
  course = 'Hamilton Golf & CC',
  location = 'Hamilton, ON',
  start_date = '2026-06-11',
  end_date = '2026-06-14',
  purse_millions = 9.80,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 17
WHERE week_number = 17;

-- Week 18: US OPEN (Major) - UPCOMING
UPDATE tournaments SET
  name = 'US OPEN',
  short_name = 'US Open',
  course = 'Shinnecock Hills Golf Club',
  location = 'Southampton, NY',
  start_date = '2026-06-18',
  end_date = '2026-06-21',
  purse_millions = 21.50,
  is_major = TRUE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 18
WHERE week_number = 18;

-- Week 19: Travelers Championship (Signature No Cut) - UPCOMING
UPDATE tournaments SET
  name = 'Travelers Championship',
  short_name = 'Travelers',
  course = 'TPC River Highlands',
  location = 'Cromwell, CT',
  start_date = '2026-06-25',
  end_date = '2026-06-28',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = TRUE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 19
WHERE week_number = 19;

-- Week 20: Scottish Open (Full Field) - UPCOMING
UPDATE tournaments SET
  name = 'Scottish Open',
  short_name = 'Scottish',
  course = 'The Renaissance Club',
  location = 'North Berwick, Scotland',
  start_date = '2026-07-09',
  end_date = '2026-07-12',
  purse_millions = 9.00,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 20
WHERE week_number = 20;

-- Week 21: THE OPEN CHAMPIONSHIP (Major) - UPCOMING
UPDATE tournaments SET
  name = 'THE OPEN CHAMPIONSHIP',
  short_name = 'The Open',
  course = 'Royal Portrush Golf Club',
  location = 'Portrush, N. Ireland',
  start_date = '2026-07-16',
  end_date = '2026-07-19',
  purse_millions = 17.00,
  is_major = TRUE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 21
WHERE week_number = 21;

-- Week 22: 3M Open (Semifinal) - UPCOMING
UPDATE tournaments SET
  name = '3M Open',
  short_name = '3M',
  course = 'TPC Twin Cities',
  location = 'Blaine, MN',
  start_date = '2026-07-23',
  end_date = '2026-07-26',
  purse_millions = 8.40,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 22
WHERE week_number = 22;

-- Week 23: Rocket Mortgage Classic (Semifinal) - UPCOMING
UPDATE tournaments SET
  name = 'Rocket Mortgage Classic',
  short_name = 'Rocket',
  course = 'Detroit Golf Club',
  location = 'Detroit, MI',
  start_date = '2026-07-30',
  end_date = '2026-08-02',
  purse_millions = 9.60,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 23
WHERE week_number = 23;

-- Week 24: Wyndham Championship (Semifinal) - UPCOMING
UPDATE tournaments SET
  name = 'Wyndham Championship',
  short_name = 'Wyndham',
  course = 'Sedgefield Country Club',
  location = 'Greensboro, NC',
  start_date = '2026-08-06',
  end_date = '2026-08-09',
  purse_millions = 8.20,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 24
WHERE week_number = 24;

-- Week 25: FedEx St. Jude Championship (Finals) - UPCOMING
UPDATE tournaments SET
  name = 'FedEx St. Jude Championship',
  short_name = 'St. Jude',
  course = 'TPC Southwind',
  location = 'Memphis, TN',
  start_date = '2026-08-13',
  end_date = '2026-08-16',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 25
WHERE week_number = 25;

-- Week 26: BMW Championship (Finals) - UPCOMING
UPDATE tournaments SET
  name = 'BMW Championship',
  short_name = 'BMW',
  course = 'Caves Valley Golf Club',
  location = 'Owings Mills, MD',
  start_date = '2026-08-20',
  end_date = '2026-08-23',
  purse_millions = 20.00,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 26
WHERE week_number = 26;

-- Week 27: Tour Championship (Finals) - UPCOMING
UPDATE tournaments SET
  name = 'Tour Championship',
  short_name = 'Tour Champ',
  course = 'East Lake Golf Club',
  location = 'Atlanta, GA',
  start_date = '2026-08-27',
  end_date = '2026-08-30',
  purse_millions = 25.00,
  is_major = FALSE,
  is_signature = FALSE,
  is_complete = FALSE,
  is_current = FALSE,
  sort_order = 27
WHERE week_number = 27;
