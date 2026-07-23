// CVC Fantasy Golf 2026 - Supabase Client
console.log('[supabase-client] script loaded, initializing...');

// Hardcoded (not env vars) since this is a static site with no build step -
// the anon key is safe to expose client-side, RLS policies do the real work.
const SUPABASE_URL = 'https://iqahjyoytzhhkvwmujha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYWhqeW95dHpoaGt2d211amhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjkwNTgsImV4cCI6MjA5MTE0NTA1OH0.kki64pr4YG3aQufc3n4nn2KDpmzURYDLx7_zYneoyKY';

let supabaseClient = null;

// Weeks 22-27 are the playoffs; only these 6 qualifiers play, so league-wide
// usage counts (salaries, breakdown) must exclude everyone else during those weeks.
const PLAYOFF_WEEK_START = 22;
const PLAYOFF_QUALIFIER_NAMES = ['Steve Walker', 'David Sotka', 'Dave Sutton', 'Scott Nelson', 'Joe Cas', 'Shawn Gidley'];

// Determines who is still contesting the playoffs for a given tournament
// week: all 6 qualifiers during the semifinal (22-24), the top 3 semifinal
// finishers during the Week 25 elimination round, and the 2 elimination-round
// survivors during the championship (26-27). Mirrors the bracket math in
// playoffs.js - kept separate (rather than shared) since that page has its
// own rendering needs. Returns a Set of player_ids, or null outside the
// playoffs. Local consts are function-scoped so they don't clash with
// playoffs.js's own top-level SEMIFINAL_WEEKS/REG_SEASON_BONUS_CAP when both
// scripts share a page.
async function computePlayoffField(weekNumber) {
  if (weekNumber < PLAYOFF_WEEK_START) return null;

  const { data: players } = await supabaseClient.from('players').select('id, name').neq('is_guest', true);
  const qualifiers = (players || []).filter(p => PLAYOFF_QUALIFIER_NAMES.includes(p.name));
  const qualifierIds = new Set(qualifiers.map(p => p.id));

  if (weekNumber <= 24) return qualifierIds;

  const SEMIFINAL_WEEKS = [22, 23, 24];
  const REG_SEASON_BONUS_CAP = 400000;

  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, is_complete, picks_locked, first_tee_time')
    .order('week_number');
  const now = new Date();
  const started = t => t.is_complete || t.picks_locked || (t.first_tee_time && new Date(t.first_tee_time) <= now);

  const regSeasonT = (tournaments || []).filter(t => t.week_number <= 21);
  const regStartedT = regSeasonT.filter(started);
  const semiT = (tournaments || []).filter(t => SEMIFINAL_WEEKS.includes(t.week_number));
  const week25T = (tournaments || []).find(t => t.week_number === 25);

  const relevantIds = [...regStartedT, ...semiT, ...(week25T ? [week25T] : [])].map(t => t.id);

  let scores = [];
  for (let from = 0; ; from += 1000) {
    const { data: batch } = await supabaseClient
      .from('weekly_scores')
      .select('player_id, tournament_id, total_earnings')
      .in('tournament_id', relevantIds)
      .range(from, from + 999);
    if (!batch || batch.length === 0) break;
    scores = scores.concat(batch);
    if (batch.length < 1000) break;
  }
  const scoreMap = {};
  scores.forEach(s => { scoreMap[`${s.player_id}-${s.tournament_id}`] = parseFloat(s.total_earnings || 0); });

  const { data: playoffResults } = await supabaseClient.from('playoff_results').select('player_id, round, tiebreaker_earnings');
  const tiebreakerMap = {};
  (playoffResults || []).forEach(r => { tiebreakerMap[`${r.player_id}-${r.round}`] = parseFloat(r.tiebreaker_earnings || 0); });
  const tiebreakerFor = (playerId, rounds) => rounds.reduce((sum, round) => sum + (tiebreakerMap[`${playerId}-${round}`] || 0), 0);

  const regStandings = (players || []).map(p => {
    const total = regStartedT.reduce((sum, t) => sum + (scoreMap[`${p.id}-${t.id}`] || 0), 0);
    return { player_id: p.id, total };
  }).sort((a, b) => b.total - a.total);

  const seed1Id = regStandings[0]?.player_id;
  const seed1Bonus = Math.max(0, Math.min(REG_SEASON_BONUS_CAP, (regStandings[0]?.total || 0) - (regStandings[1]?.total || 0)));

  const semiComplete = semiT.length === SEMIFINAL_WEEKS.length && semiT.every(t => t.is_complete);

  const semiResults = qualifiers.map(sf => {
    const weekTotals = semiT.map(t => started(t) ? (scoreMap[`${sf.id}-${t.id}`] || 0) : null);
    const isSeed1 = sf.id === seed1Id && seed1Bonus > 0;
    if (isSeed1) weekTotals[0] = (weekTotals[0] || 0) + seed1Bonus;
    const total = weekTotals.reduce((sum, v) => sum + (v || 0), 0);
    return { player_id: sf.id, total, tiebreaker: tiebreakerFor(sf.id, ['semifinal']) };
  });
  semiResults.sort((a, b) => (b.total - a.total) || (b.tiebreaker - a.tiebreaker));

  // Semifinal not finished yet - can't know the top 3, fall back to all 6.
  if (!semiComplete) return qualifierIds;

  const finalistIds = new Set(semiResults.slice(0, 3).map(r => r.player_id));

  if (weekNumber === 25) return finalistIds;

  // Week 25 not finished yet - can't know the 2 survivors, fall back to the 3 finalists.
  if (!week25T || !week25T.is_complete) return finalistIds;

  const elimResults = [...finalistIds].map(pid => ({
    player_id: pid,
    wk1: scoreMap[`${pid}-${week25T.id}`] || 0,
    tiebreaker: tiebreakerFor(pid, ['finals_w1'])
  }));
  elimResults.sort((a, b) => (b.wk1 - a.wk1) || (b.tiebreaker - a.tiebreaker));

  return new Set(elimResults.slice(0, 2).map(r => r.player_id));
}

function showConnectionBanner(message) {
  let banner = document.getElementById('supabaseErrorBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'supabaseErrorBanner';
    banner.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:99999; background:#c0392b; color:#fff; padding:0.6rem 1rem; text-align:center; font-family:-apple-system,BlinkMacSystemFont,sans-serif; font-size:0.85rem; font-weight:600; box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    const attach = () => document.body && document.body.prepend(banner);
    if (document.body) attach(); else document.addEventListener('DOMContentLoaded', attach);
  }
  banner.textContent = message;
}

function hideConnectionBanner() {
  const banner = document.getElementById('supabaseErrorBanner');
  if (banner) banner.remove();
}

// Dynamically (re)loads the Supabase JS SDK from the CDN. Used for retries
// when the original <script> tag failed to fetch - e.g. a flaky connection
// right after opening the PWA from the iOS home screen.
function loadSupabaseScript(onDone) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => onDone(true);
  script.onerror = () => onDone(false);
  document.head.appendChild(script);
}

function initSupabaseClient(attempt) {
  attempt = attempt || 1;
  const MAX_ATTEMPTS = 5;

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log(`[supabase-client] Supabase client initialized successfully (attempt ${attempt})`);
      hideConnectionBanner();
      window.dispatchEvent(new Event('supabase-ready'));
      return;
    } catch (e) {
      console.error('[supabase-client] createClient() threw:', e);
    }
  }

  if (attempt >= MAX_ATTEMPTS) {
    console.error(`[supabase-client] Giving up after ${MAX_ATTEMPTS} attempts - Supabase SDK never became available`);
    showConnectionBanner('Unable to connect. Pull down to refresh, or close and reopen the app.');
    return;
  }

  console.warn(`[supabase-client] Supabase SDK not ready (attempt ${attempt}/${MAX_ATTEMPTS}) - retrying...`);
  showConnectionBanner('Connecting...');
  setTimeout(() => {
    loadSupabaseScript(() => initSupabaseClient(attempt + 1));
  }, 400 * attempt);
}

initSupabaseClient();

// Safety net for the rare case a page script runs and tries to use
// supabaseClient before the retry above finishes - surfaces a clear message
// instead of a silent, permanent "Loading..." spinner, and recovers on its
// own by reloading once the client comes online.
window.addEventListener('error', () => {
  if (!supabaseClient) {
    showConnectionBanner('Reconnecting...');
    window.addEventListener('supabase-ready', () => window.location.reload(), { once: true });
  }
});

function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }
});
