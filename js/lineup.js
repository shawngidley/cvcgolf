// CVC Fantasy Golf 2026 - Lineup Page

const SALARY_CAP = 100;
const MAX_PICKS = 5;
const MAX_USES = 5;
const MAX_LIV_USES = 2;
const MAX_MAJOR_USES = 2;
let selectedGolfers = [];
let allGolfers = [];
let currentTournament = null;
let isLocked = false;
let golferUsageMap = {};   // golfer_id -> { times_used, major_uses }
let wdStatusMap = {};      // golfer name -> true if withdrawn
let confirmedFieldMap = {}; // golfer name -> true if confirmed in field
let teeTimeMap = {};        // golfer name -> Round 1 tee time string
let fieldFilterActive = false;

document.addEventListener('DOMContentLoaded', async () => {
  const player = getCurrentPlayer();
  if (!player) return;

  await loadCurrentTournament();
  await Promise.all([loadGolfers(), loadGolferUsage()]);
  renderGolferPool();
  await loadExistingLineup();
  await loadWDStatus();
  updateUI();
  setupControls();
});

async function loadCurrentTournament() {
  // Find the next unlocked / current tournament
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('*')
    .order('sort_order');

  // Prefer is_current, else first non-complete
  currentTournament = tournaments?.find(t => t.is_current) ||
    tournaments?.find(t => !t.is_complete) || null;

  if (!currentTournament) {
    document.getElementById('tournamentInfo').textContent = 'Season complete - no more tournaments';
    return;
  }

  const info = document.getElementById('tournamentInfo');
  info.innerHTML = `<strong>Week ${currentTournament.week_number}: ${currentTournament.name}</strong> &mdash; ${currentTournament.course} &mdash; ${formatDateRange(currentTournament.start_date, currentTournament.end_date)}`;

  // Determine lock time: use first_tee_time if available, else midnight on start_date
  let lockDate;
  if (currentTournament.first_tee_time) {
    lockDate = new Date(currentTournament.first_tee_time);
  } else {
    lockDate = new Date(currentTournament.start_date + 'T00:00:00');
  }

  const now = new Date();
  const autoLocked = now >= lockDate;

  isLocked = currentTournament.picks_locked || currentTournament.is_complete || autoLocked;
  if (isLocked) {
    document.getElementById('lockedMessage').innerHTML = '\uD83D\uDD12 Lineup locked \u2014 tournament has started';
    document.getElementById('lockedMessage').style.display = 'block';
  } else {
    startCountdown(lockDate);
  }
}

function formatLockDeadline(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Convert UTC to ET (display purposes)
  const etOptions = { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true };
  const timeStr = date.toLocaleTimeString('en-US', etOptions);

  const etDateOptions = { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric' };
  const dateStr = date.toLocaleDateString('en-US', etDateOptions);

  return `${dateStr} at ${timeStr} ET`;
}

function startCountdown(lockDate) {
  const container = document.getElementById('countdownContainer');
  const timerEl = document.getElementById('countdownTimer');
  const deadlineEl = document.getElementById('lockDeadline');
  container.style.display = '';

  // Show the deadline date
  deadlineEl.textContent = `Deadline: ${formatLockDeadline(lockDate)}`;

  function update() {
    const now = new Date();
    const diff = lockDate - now;

    if (diff <= 0) {
      timerEl.innerHTML = '\uD83D\uDD12 Lineup locked \u2014 tournament has started';
      timerEl.className = 'countdown-timer countdown-expired';
      isLocked = true;
      document.getElementById('lockedMessage').innerHTML = '\uD83D\uDD12 Lineup locked \u2014 tournament has started';
      document.getElementById('lockedMessage').style.display = 'block';
      updateUI();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    let parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    timerEl.innerHTML = `\u23F1 Lineup locks in ${parts.join(' ')}`;

    // Color coding: green > 24h, yellow < 24h, red < 2h
    if (diff < 7200000) {
      timerEl.className = 'countdown-timer countdown-red';
    } else if (diff < 86400000) {
      timerEl.className = 'countdown-timer countdown-yellow';
    } else {
      timerEl.className = 'countdown-timer countdown-green';
    }

    setTimeout(update, 1000);
  }

  update();
}

async function loadGolfers() {
  const { data } = await supabaseClient
    .from('golfers')
    .select('*')
    .eq('is_active', true)
    .order('salary', { ascending: false })
    .order('owgr');

  allGolfers = data || [];

  // Build salary filter dynamically
  const salaryFilter = document.getElementById('salaryFilter');
  const salarySet = [...new Set(allGolfers.map(g => g.salary))].sort((a, b) => b - a);
  salaryFilter.innerHTML = '<option value="">All Salaries</option>' +
    salarySet.map(s => `<option value="${s}">$${s}</option>`).join('');

}

async function loadGolferUsage() {
  const player = getCurrentPlayer();
  if (!player) return;
  golferUsageMap = {};

  const { data: allLineups } = await supabaseClient
    .from('lineups')
    .select('golfer_id, tournament_id')
    .eq('player_id', player.id);

  const { data: golferEarnings, error: earningsError } = await supabaseClient
    .from('golfer_earnings')
    .select('golfer_id, tournament_id');

  const { data: completedTournaments } = await supabaseClient
    .from('tournaments')
    .select('id')
    .eq('is_complete', true);

  const completedIds = new Set((completedTournaments || []).map(t => t.id));
  const earningsOk = !earningsError && Array.isArray(golferEarnings) && golferEarnings.length > 0;
  const earningsSet = new Set((golferEarnings || []).map(ge => `${ge.golfer_id}-${ge.tournament_id}`));

  if (allLineups) {
    allLineups.forEach(l => {
      if (!golferUsageMap[l.golfer_id]) {
        golferUsageMap[l.golfer_id] = { times_used: 0, major_uses: 0 };
      }
      const isComplete = earningsOk && completedIds.has(l.tournament_id);
      const started = earningsSet.has(`${l.golfer_id}-${l.tournament_id}`);
      if (!isComplete || started) {
        golferUsageMap[l.golfer_id].times_used++;
      }
    });
  }

  const { data: majorLineups } = await supabaseClient
    .from('lineups')
    .select('golfer_id, tournament_id, tournaments!inner(is_major)')
    .eq('player_id', player.id)
    .eq('tournaments.is_major', true);

  if (majorLineups) {
    majorLineups.forEach(l => {
      if (!golferUsageMap[l.golfer_id]) {
        golferUsageMap[l.golfer_id] = { times_used: 0, major_uses: 0 };
      }
      const isComplete = earningsOk && completedIds.has(l.tournament_id);
      const started = earningsSet.has(`${l.golfer_id}-${l.tournament_id}`);
      if (!isComplete || started) {
        golferUsageMap[l.golfer_id].major_uses++;
      }
    });
  }
}

async function loadExistingLineup() {
  if (!currentTournament) return;
  const player = getCurrentPlayer();

  const { data: lineup } = await supabaseClient
    .from('lineups')
    .select('*, golfers(id, name, salary)')
    .eq('player_id', player.id)
    .eq('tournament_id', currentTournament.id)
    .order('slot');

  if (lineup && lineup.length > 0) {
    selectedGolfers = [];
    lineup.forEach(l => {
      if (l.golfers) {
        selectedGolfers.push({
          id: l.golfers.id,
          name: l.golfers.name,
          salary: l.golfers.salary,
          slot: l.slot
        });
      }
    });
    updateUI();
  }
}

async function loadWDStatus() {
  try {
    const res = await fetch('/.netlify/functions/get-wd-status');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;
    const normalize = (s) => s.replace(/[øØ]/g, 'o').replace(/[æÆ]/g, 'ae').replace(/[åÅ]/g, 'a').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

    (data.wdGolfers || []).forEach(espnName => {
      const match = allGolfers.find(g => normalize(g.name) === normalize(espnName));
      if (match) wdStatusMap[match.name] = true;
    });

    (data.fieldGolfers || []).forEach(espnName => {
      const match = allGolfers.find(g => normalize(g.name) === normalize(espnName));
      if (match) confirmedFieldMap[match.name] = true;
    });

    const rawTeeTimeMap = data.teeTimeMap || {};
    Object.entries(rawTeeTimeMap).forEach(([espnName, teeTime]) => {
      const match = allGolfers.find(g => normalize(g.name) === normalize(espnName));
      if (match) teeTimeMap[match.name] = teeTime;
    });

    // Show Field button only if we have field data
    const fieldBtn = document.getElementById('fieldFilterBtn');
    if (fieldBtn && Object.keys(confirmedFieldMap).length > 0) {
      fieldBtn.style.display = '';
    }
  } catch (e) { /* silently skip */ }
}

function setupControls() {
  document.getElementById('golferSearch').addEventListener('input', renderGolferPool);
  document.getElementById('salaryFilter').addEventListener('change', renderGolferPool);
  document.getElementById('submitLineup').addEventListener('click', submitLineup);
  document.getElementById('fieldFilterBtn').addEventListener('click', () => {
    fieldFilterActive = !fieldFilterActive;
    const btn = document.getElementById('fieldFilterBtn');
    btn.classList.toggle('active', fieldFilterActive);
    renderGolferPool();
  });
}

function getSalaryUsed() {
  return selectedGolfers.reduce((sum, g) => sum + g.salary, 0);
}

function updateUI() {
  const salaryUsed = getSalaryUsed();
  const salaryEl = document.getElementById('salaryUsed');
  salaryEl.textContent = `$${salaryUsed}`;
  salaryEl.classList.toggle('over-cap', salaryUsed > SALARY_CAP);
  document.getElementById('picksCount').textContent = selectedGolfers.length;

  // Update slots
  const slotsContainer = document.getElementById('lineupSlots');
  for (let i = 1; i <= MAX_PICKS; i++) {
    const slot = slotsContainer.querySelector(`[data-slot="${i}"]`);
    const golfer = selectedGolfers.find(g => g.slot === i);
    if (golfer) {
      slot.classList.remove('empty');
      slot.classList.add('filled');
      const nameEl = slot.querySelector('.slot-name');
      if (wdStatusMap[golfer.name]) {
        nameEl.innerHTML = `${golfer.name} <span class="wd-badge">WD</span>`;
      } else {
        nameEl.textContent = golfer.name;
      }
      slot.querySelector('.slot-salary').textContent = `$${golfer.salary}`;
      if (!isLocked) {
        slot.onclick = () => removeGolfer(i);
      }
    } else {
      slot.classList.add('empty');
      slot.classList.remove('filled');
      slot.querySelector('.slot-name').textContent = 'Empty';
      slot.querySelector('.slot-salary').textContent = '';
      slot.onclick = null;
    }
  }

  // Enable submit if 5 picks and under cap (disabled for guests)
  const submitBtn = document.getElementById('submitLineup');
  if (isGuest()) {
    submitBtn.disabled = true;
    const msg = document.getElementById('lineupMsg');
    msg.textContent = 'Guest accounts cannot submit lineups';
    msg.className = 'lineup-msg error';
  } else {
    submitBtn.disabled = selectedGolfers.length !== MAX_PICKS || salaryUsed > SALARY_CAP || isLocked;
  }

  renderGolferPool();
}

function getUsageInfo(golferId) {
  const usage = golferUsageMap[golferId] || { times_used: 0, major_uses: 0 };
  return usage;
}

function getUsageClass(timesUsed) {
  if (timesUsed >= MAX_USES) return 'usage-red';
  if (timesUsed >= 3) return 'usage-yellow';
  return 'usage-green';
}

function renderGolferPool() {
  const search = (document.getElementById('golferSearch')?.value || '').toLowerCase();
  const salaryFilterVal = document.getElementById('salaryFilter')?.value || '';
  const salaryRemaining = SALARY_CAP - getSalaryUsed();
  const selectedIds = new Set(selectedGolfers.map(g => g.id));
  const isMajorWeek = currentTournament?.is_major || false;

  let filtered = allGolfers;
  if (search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search));
  if (salaryFilterVal) filtered = filtered.filter(g => g.salary === parseInt(salaryFilterVal));
  if (fieldFilterActive) filtered = filtered.filter(g => confirmedFieldMap[g.name]);

  // Sort: available first, maxed out at bottom
  filtered = [...filtered].sort((a, b) => {
    const aUsage = getUsageInfo(a.id);
    const bUsage = getUsageInfo(b.id);
    const aMax = a.is_liv ? MAX_LIV_USES : MAX_USES;
    const bMax = b.is_liv ? MAX_LIV_USES : MAX_USES;
    const aMaxed = aUsage.times_used >= aMax || (isMajorWeek && aUsage.major_uses >= MAX_MAJOR_USES);
    const bMaxed = bUsage.times_used >= bMax || (isMajorWeek && bUsage.major_uses >= MAX_MAJOR_USES);
    if (aMaxed !== bMaxed) return aMaxed ? 1 : -1;
    return b.salary - a.salary || a.owgr - b.owgr;
  });

  const list = document.getElementById('golferList');
  if (filtered.length === 0) {
    list.innerHTML = '<p class="loading">No golfers match your search</p>';
    return;
  }

  list.innerHTML = filtered.map(g => {
    const isSelected = selectedIds.has(g.id);
    const usage = getUsageInfo(g.id);
    const isLiv = g.is_liv || false;
    const maxUses = isLiv ? MAX_LIV_USES : MAX_USES;
    const maxedOut = usage.times_used >= maxUses;
    const majorMaxed = isMajorWeek && usage.major_uses >= MAX_MAJOR_USES;
    const tooExpensive = g.salary > salaryRemaining && !isSelected;
    const full = selectedGolfers.length >= MAX_PICKS && !isSelected;
    const disabled = tooExpensive || full || isLocked || maxedOut || majorMaxed;

    const usageClass = getUsageClass(usage.times_used);
    const usageBadge = `<span class="g-usage ${usageClass}">${usage.times_used}/${MAX_USES}</span>`;
    const livBadge = isLiv
      ? (usage.times_used >= MAX_LIV_USES
        ? '<span class="g-usage usage-liv-maxed">LIV 2/2</span>'
        : `<span class="g-usage usage-liv">LIV ${usage.times_used}/2</span>`)
      : '';
    let majorBadge = '';
    if (isMajorWeek || usage.major_uses > 0) {
      majorBadge = usage.major_uses >= MAX_MAJOR_USES
        ? '<span class="g-usage usage-major-maxed">Major 2/2</span>'
        : `<span class="g-usage usage-major">Major ${usage.major_uses}/2</span>`;
    }

    const wdBadge = wdStatusMap[g.name] ? ' <span class="wd-badge">WD</span>' : '';
    const teeTime = teeTimeMap[g.name] ? `<span class="g-tee-time">${teeTimeMap[g.name]}</span>` : '';
    return `<div class="golfer-row ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${maxedOut ? 'maxed-out' : ''} ${majorMaxed && !maxedOut ? 'major-maxed' : ''}"
      data-id="${g.id}" data-name="${g.name}" data-salary="${g.salary}">
      <span class="g-name">${g.name}${wdBadge}</span>
      ${teeTime}
      ${livBadge}
      ${majorBadge}
      ${usageBadge}
      <span class="g-salary">$${g.salary}</span>
    </div>`;
  }).join('');

  // Add click handlers
  if (!isLocked) {
    list.querySelectorAll('.golfer-row:not(.selected):not(.disabled)').forEach(row => {
      row.addEventListener('click', () => {
        addGolfer({
          id: parseInt(row.dataset.id),
          name: row.dataset.name,
          salary: parseInt(row.dataset.salary)
        });
      });
    });
  }
}

function addGolfer(golfer) {
  if (selectedGolfers.length >= MAX_PICKS) return;
  if (getSalaryUsed() + golfer.salary > SALARY_CAP) return;

  // Find next empty slot
  for (let i = 1; i <= MAX_PICKS; i++) {
    if (!selectedGolfers.find(g => g.slot === i)) {
      selectedGolfers.push({ ...golfer, slot: i });
      break;
    }
  }
  updateUI();
}

function removeGolfer(slot) {
  if (isLocked) return;
  selectedGolfers = selectedGolfers.filter(g => g.slot !== slot);
  updateUI();
}

async function submitLineup() {
  if (isGuest()) { showGuestToast(); return; }
  if (isLocked || !currentTournament) return;
  const player = getCurrentPlayer();
  const msg = document.getElementById('lineupMsg');

  if (selectedGolfers.length !== MAX_PICKS) {
    msg.textContent = 'Select exactly 5 golfers.';
    msg.className = 'lineup-msg error';
    return;
  }

  if (getSalaryUsed() > SALARY_CAP) {
    msg.textContent = 'Over the $100 salary cap!';
    msg.className = 'lineup-msg error';
    return;
  }

  // Delete existing lineup
  await supabaseClient
    .from('lineups')
    .delete()
    .eq('player_id', player.id)
    .eq('tournament_id', currentTournament.id);

  // Insert new
  const rows = selectedGolfers.map(g => ({
    player_id: player.id,
    tournament_id: currentTournament.id,
    golfer_id: g.id,
    slot: g.slot
  }));

  const { error } = await supabaseClient.from('lineups').insert(rows);

  if (error) {
    msg.textContent = 'Error saving lineup: ' + error.message;
    msg.className = 'lineup-msg error';
  } else {
    msg.textContent = 'Lineup saved successfully!';
    msg.className = 'lineup-msg success';
  }
}
