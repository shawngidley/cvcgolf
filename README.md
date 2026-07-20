# CVC Fantasy Golf 2026

A full-stack fantasy golf web application for the CVC (Chagrin Valley Conference) Fantasy Golf League. Built from scratch in a single day using Supabase, Netlify, and vanilla HTML/CSS/JavaScript.

**Live Site:** [golf.cvcfantasysports.com](https://golf.cvcfantasysports.com)  
**GitHub:** [github.com/shawngidley/cvcgolf](https://github.com/shawngidley/cvcgolf)  
**Season:** 2026 PGA Tour (21 tournaments, Feb–Jul)

---

## Tech Stack

| Layer | Service |
|-------|---------|
| Frontend | Vanilla HTML/CSS/JavaScript |
| Database | Supabase (PostgreSQL) |
| Hosting | Netlify |
| Domain | Namecheap → cvcfantasysports.com |
| SMS | Twilio (A2P 10DLC registered) |
| Earnings Data | ESPN API (scraper) |
| Fonts | Playfair Display + Inter (Google Fonts) |

---

## League Details

- **14 players** — private invitation only
- **$200 entry fee** per player ($2,800 total pot)
- **21 tournaments** — WM Phoenix Open through The Open Championship
- **$100 salary cap** per week, pick 5 golfers
- **Scoring** — dollar-for-dollar PGA Tour earnings
- **126 golfers** on salary sheet ($13–$27 tiers)
- **LIV golfers** — max 2 uses total (13 designated LIV players)
- **Golfer usage limit** — max 5 uses per golfer per season
- **Major usage limit** — max 2 uses per golfer across the 4 majors

### 2026 Players & Passwords

| Player | Password |
|--------|----------|
| Scott Nelson | (redacted) |
| Scott Tomko | (redacted) |
| Steve Walker | (redacted) |
| Matt Federer | (redacted) |
| Shawn Gidley | (redacted) |
| Joe Cas | (redacted) |
| David Sotka | (redacted) |
| Jamie Yane | (redacted) |
| Keith Cromer | (redacted) |
| Jack Ehrbar | (redacted) |
| Dave Sutton | (redacted) |
| Dan Osicki | (redacted) |
| Josh Osicki | (redacted) |
| Matt Janssen | (redacted) |
| Guest | 0000 (read-only) |

### Commissioners
- **Shawn Gidley** (primary)
- **Dan Osicki** (co-admin)

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Login | index.html | Player dropdown + password, Amen Corner background |
| Standings | standings.html | Season leaderboard, playoff cutline after 6th |
| Playoffs | playoffs.html | Bracket, semifinal/finals standings, bonus tracker |
| Live | live.html | Real-time tournament scoring by owner |
| Lineup | lineup.html | Weekly golfer picker, salary cap, countdown timer |
| Breakdown | breakdown.html | Post-lock weekly matrix showing all owner picks |
| Weekly Results | weekly-results.html | Weekly standings with best pick, lineup salary |
| History | history.html | Week-by-week lineup history with finish/score |
| Usage | usage.html | Per-golfer usage tracker with earnings |
| Schedule | schedule.html | 27-tournament schedule with type badges |
| Salaries | salaries.html | 126 golfers, salary tiers, LIV designation |
| Money | money.html | Entry fees, payout structure, weekly bonuses |
| Rules | rules.html | Full 2026 league rules |
| Account | account.html | Password change, SMS reminder preferences |
| Admin | admin.html | Commissioner panel — earnings, lineups, recalculate |

---

## Database Schema (Supabase)

### Tables

```
players           — 14 players + guest, passwords, commissioner flags
tournaments       — 27 tournaments with tee times, lock logic, type
golfers           — 126 golfers with salary, tier, is_liv flag
lineups           — Weekly lineup picks (player × tournament × golfer × slot)
golfer_earnings   — Per-golfer earnings per tournament (finish, score, amount)
golfer_usage      — Usage count per player per golfer
weekly_scores     — Total earnings per player per tournament
standings         — Season totals, weekly wins, bonus $
player_preferences — SMS reminder settings (day, time, timezone, phone)
entry_fees        — $200 entry fee tracking per player
weekly_bonuses    — Weekly high earner bonuses
playoff_lineups   — Playoff lineups including tiebreaker golfer
playoff_results   — Playoff round results and advancement status
```

### SQL Migration Files (supabase/)

| File | Purpose |
|------|---------|
| schema.sql | Full table definitions with RLS |
| seed.sql | Players, tournaments, golfers, weeks 1-8 earnings |
| lineups-historical.sql | All 14 players' lineups weeks 1-8 |
| add-golfer-earnings-table.sql | golfer_earnings table |
| add-earnings-columns.sql | finish_position and score columns |
| add-preferences-table.sql | player_preferences table |
| add-guest-account.sql | Guest login |
| add-tee-time.sql | first_tee_time column on tournaments |
| add-money-tables.sql | entry_fees and weekly_bonuses tables |
| add-playoff-tables.sql | playoff_lineups and playoff_results tables |

### Security
- Row Level Security (RLS) enabled on all tables
- Public read policies on non-sensitive tables
- Full access policies for app operations
- Supabase API grants for anon, authenticated, service_role

---

## Netlify Functions

| Function | Purpose |
|----------|---------|
| scrape-pga-earnings.js | ESPN API scraper for tournament earnings |
| get-live-scores.js | Real-time leaderboard for live scoring page |
| submit-lineup.js | Lineup submission with validation |
| update-results.js | Save earnings + recalculate standings |
| get-standings.js | Standings data endpoint |
| send-reminders.js | Scheduled daily SMS reminders (Twilio) |
| send-test-sms.js | Commissioner SMS test tool |

---

## Key Features

### Lineup Submission
- Salary cap validator (real-time, $100 max)
- Countdown timer to first tee time lock
- "This Week's Field" filter (ESPN API) + "All Golfers" toggle
- LIV badge with 2-use limit enforcement
- Usage badges (X/5 or X/2) on every golfer
- Auto-locks at first tee time (hardcoded per tournament)
- Playoff weeks: tiebreaker golfer selector below main picks

### Earnings Scraper (Admin)
- Pulls live/final earnings from ESPN API
- Fuzzy name matching with confidence scores
- Known name corrections map (Matt McCarty, Nico Echavarria, etc.)
- Manual override before saving
- Saves finish position and score alongside earnings
- Auto-recalculates all player totals and standings on save

### Live Scoring
- Real-time leaderboard from ESPN API
- Per-owner accordion view (tap to expand)
- Shows score, position, holes completed or tee time, projected earnings
- 2026 Masters purse ($25K minimum for made cut)
- Auto-refreshes every 5 minutes during tournament hours

### SMS Reminders (Twilio)
- Players opt in via Account page
- Choose day, time (including 11:30 PM), timezone
- Twilio A2P 10DLC campaign registered (pending approval)
- Golf number: +1 (216) 710-4831
- Baseball number: +1 (216) 600-0866 (same account)
- Commissioner can send test SMS from admin panel

### PWA (Progressive Web App)
- Installable on iPhone (Safari) and Android (Chrome)
- Service worker caches all static assets
- Cache-first for assets, network-first for API calls
- Bump CACHE_NAME (e.g. cvc-golf-v2) on major deploys to force refresh
- CVC Golf Logo as home screen icon

---

## Playoff Structure (2026)

**6 players advance** (14 participants = 6 spots)

### Semifinal (Weeks 22–24)
- 3M Open, Rocket Mortgage, Wyndham Championship
- All 6 start at $0 — earnings do NOT carry over from regular season
- Regular season #1 seed gets one-time bonus: lesser of $400K or lead over #2
- Top 3 earners after Week 24 advance to Finals
- Tiebreaker golfer required (must have ≤4 uses, doesn't count against cap or usage)

### Finals Week 1 (Week 25 — FedEx St. Jude)
- 3 players, 5 golfers, $100 cap
- Week 25 earnings stand alone
- Lowest earner eliminated

### Finals Weeks 2 & 3 (Weeks 26–27)
- 2 players remain
- Week 26 (BMW) + Week 27 (Tour Championship) earnings cumulative
- Week 27: 4 golfers only, $80 salary cap
- Highest combined total wins the championship

### Payouts
| Prize | Amount |
|-------|--------|
| Champion | $500 |
| Finalist + advance (2×) | $225 each |
| Finalist eliminated Wk25 | $130 |
| 6 Playoff Spots (5×$130) | $650 |
| Regular Season Winner | $350 (or split $480 if tied) |
| Weekly Full Field (8×$20) | $160 |
| Weekly Signature/Players (9×$40) | $360 |
| Weekly Major (4×$50) | $200 |
| **TOTAL** | **$2,800** |

---

## Weekly Bonus Amounts

| Tournament Type | Weeks | Bonus |
|----------------|-------|-------|
| Full Field | 1,6,7,8,14,15,17,20 | $20 |
| Signature + Players | 2,3,4,5,10,11,12,16,19 | $40 |
| Majors | 9,13,18,21 | $50 |

---

## 2026 Tournament Schedule

| Wk | Tournament | Type | Dates |
|----|-----------|------|-------|
| 1 | WM Phoenix Open | Full Field | Feb 5–8 |
| 2 | Pebble Beach Pro-Am | Signature No Cut | Feb 12–15 |
| 3 | Genesis Invitational | Signature With Cut | Feb 19–22 |
| 4 | Arnold Palmer Invitational | Signature With Cut | Mar 5–8 |
| 5 | The Players Championship | Full Field | Mar 12–15 |
| 6 | Valspar Championship | Full Field | Mar 19–22 |
| 7 | Texas Children's Houston Open | Full Field | Mar 26–29 |
| 8 | Valero Texas Open | Full Field | Apr 2–5 |
| 9 | **THE MASTERS** | Major | Apr 9–12 |
| 10 | RBC Heritage | Signature No Cut | Apr 16–19 |
| 11 | Cadillac Championship | Signature No Cut | Apr 30–May 3 |
| 12 | Truist Championship | Signature No Cut | May 7–10 |
| 13 | **PGA CHAMPIONSHIP** | Major | May 14–17 |
| 14 | CJ Cup Byron Nelson | Full Field | May 21–24 |
| 15 | Charles Schwab Challenge | Full Field | May 28–31 |
| 16 | The Memorial | Signature With Cut | Jun 4–7 |
| 17 | Canadian Open | Full Field | Jun 11–14 |
| 18 | **US OPEN** | Major | Jun 18–21 |
| 19 | Travelers Championship | Signature No Cut | Jun 25–28 |
| 20 | Scottish Open | Full Field | Jul 9–12 |
| 21 | **THE OPEN CHAMPIONSHIP** | Major | Jul 16–19 |

---

## 2026 Season Results

### 2026 Regular Season Final Standings

| Rank | Player | Total Earnings | Weekly Wins | Bonus $ | Best Week |
|------|--------|---------------|-------------|---------|-----------|
| 1 | Steve Walker | $40,774,758 | 5 | $150 | $4,255,765 |
| 2 | David Sotka | $38,719,679 | 0 | — | $5,468,977 |
| 3 | Dave Sutton | $38,312,226 | 2 | $90 | $6,020,600 |
| 4 | Scott Nelson | $35,122,389 | 2 | $65 | $7,208,000 |
| 5 | Joe Cas | $34,660,677 | 1 | $20 | $4,683,810 |
| 6 | Shawn Gidley | $34,353,924 | 2 | $65 | $5,928,814 |
| 7 | Matt Federer | — | — | — | — |
| 8 | Scott Tomko | — | — | — | — |
| 9 | Jack Ehrbar | — | — | — | — |
| 10 | Keith Cromer | — | — | — | — |
| 11 | Jamie Yane | — | — | — | — |
| 12 | Matt Janssen | — | — | — | — |
| 13 | Dan Osicki | — | — | — | — |
| 14 | Josh Osicki | — | — | — | — |

### 2026 Playoff Status

**Current Round:** Semifinal (Weeks 22–24)

**6 Playoff Qualifiers:**
1. Steve Walker — starts with $400,000 bonus (led 2nd place by $2,055,079, capped at $400K)
2. David Sotka — starts at $0
3. Dave Sutton — starts at $0
4. Scott Nelson — starts at $0
5. Joe Cas — starts at $0
6. Shawn Gidley — starts at $0

**Top 3 after Week 24 advance to Finals.**

---

## Environment Variables (Netlify)

```
SUPABASE_URL=https://iqahjyoytzhhkvwmujha.supabase.co
SUPABASE_ANON_KEY=(redacted - see js/supabase-client.js)
TWILIO_ACCOUNT_SID=(redacted)
TWILIO_AUTH_TOKEN=(redacted)
TWILIO_PHONE_NUMBER=+12167104831
```

---

## Deployment

Auto-deploys on every push to `master` via GitHub → Netlify integration.

```bash
cd "C:\Users\shawn\OneDrive\Documents\Fantasy Sports\Fantasy Golf Folder\2026 Golf\cvcgolf"
git add .
git commit -m "your message"
git push origin master
```

### After Major Deploys
1. Bump `CACHE_NAME` in `/service-worker.js` (e.g. `cvc-golf-v2`) to force PWA cache refresh
2. Run any new SQL migration files in Supabase SQL Editor
3. Include GRANT statements in all new migration files

---

## Weekly Commissioner Workflow

1. Tournament ends Sunday
2. Go to Admin panel → Pull Tournament Earnings (ESPN)
3. Review earnings preview — fix any low-confidence matches
4. Click Save Earnings & Recalculate
5. Verify standings updated correctly
6. Open next week's lineup submissions (auto-locks at first tee time)

---

## Known Issues & Notes

- **Matt McCarty** — ESPN sometimes matches to Denny McCarthy. Hardcoded correction in scraper.
- **Nico Echavarria** — ESPN uses "Nico", database uses "Nico Echavarria". Fixed.
- **Scottish Open / Open Championship** — lineup deadline is midnight Wednesday ET per league rules. Tee times set accordingly.
- **Service Worker** — cache-first strategy. Bump CACHE_NAME after CSS/JS changes.
- **Twilio** — A2P 10DLC campaign pending approval. SMS will activate automatically once approved.
- **Sportradar API** — inquiry sent, awaiting response for automated earnings pipeline.

---

## Infrastructure Costs

| Service | Cost |
|---------|------|
| Netlify | Free |
| Supabase | Free |
| Namecheap domain | ~$12/year |
| Twilio golf number | ~$1/month |
| Twilio SMS | ~$0.0079/text |
| **Total** | **~$24/year + pennies/week** |

---

## Built By

Website designed and developed by **Shawn Gidley**  
Commissioner, CVC Fantasy Golf League  
© 2003–2026 CVC Fantasy Golf League. All rights reserved.
