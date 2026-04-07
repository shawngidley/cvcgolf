// CVC Fantasy Golf 2026 - Lineup Page

const SALARY_CAP = 100;
const MAX_PICKS = 5;
let selectedGolfers = [];
let allGolfers = [];
let currentTournament = null;
let isLocked = false;

document.addEventListener('DOMContentLoaded', async () => {
  const player = getCurrentPlayer();
  if (!player) return;

  await loadCurrentTournament();
  await loadGolfers();
  await loadExistingLineup();
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

  isLocked = currentTournament.picks_locked || currentTournament.is_complete;
  if (isLocked) {
    document.getElementById('lockedMessage').style.display = 'block';
  }
}

async function loadGolfers() {
  const { data } = await supabaseClient
    .from('golfers')
    .select('*')
    .eq('is_active', true)
    .order('salary', { ascending: false })
    .order('owgr');

  allGolfers = data || [];
  renderGolferPool();
}

async function loadExistingLineup() {
  if (!currentTournament) return;
  const player = getCurrentPlayer();

  const { data: lineup } = await supabaseClient
    .from('lineups')
    .select('*, golfers(id, name, salary, tier)')
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
          tier: l.golfers.tier,
          slot: l.slot
        });
      }
    });
    updateUI();
  }
}

function setupControls() {
  document.getElementById('golferSearch').addEventListener('input', renderGolferPool);
  document.getElementById('tierFilter').addEventListener('change', renderGolferPool);
  document.getElementById('submitLineup').addEventListener('click', submitLineup);
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
      slot.querySelector('.slot-name').textContent = golfer.name;
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

  // Enable submit if 5 picks and under cap
  const submitBtn = document.getElementById('submitLineup');
  submitBtn.disabled = selectedGolfers.length !== MAX_PICKS || salaryUsed > SALARY_CAP || isLocked;

  renderGolferPool();
}

function renderGolferPool() {
  const search = (document.getElementById('golferSearch')?.value || '').toLowerCase();
  const tierFilter = document.getElementById('tierFilter')?.value || '';
  const salaryRemaining = SALARY_CAP - getSalaryUsed();
  const selectedIds = new Set(selectedGolfers.map(g => g.id));

  let filtered = allGolfers;
  if (search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search));
  if (tierFilter) filtered = filtered.filter(g => g.salary === parseInt(tierFilter));

  const list = document.getElementById('golferList');
  if (filtered.length === 0) {
    list.innerHTML = '<p class="loading">No golfers match your search</p>';
    return;
  }

  list.innerHTML = filtered.map(g => {
    const isSelected = selectedIds.has(g.id);
    const tooExpensive = g.salary > salaryRemaining && !isSelected;
    const full = selectedGolfers.length >= MAX_PICKS && !isSelected;
    const disabled = tooExpensive || full || isLocked;

    return `<div class="golfer-row ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}"
      data-id="${g.id}" data-name="${g.name}" data-salary="${g.salary}" data-tier="${g.tier}">
      <span class="g-name">${g.name}</span>
      <span class="g-salary">$${g.salary}</span>
      <span class="g-tier">${g.tier}</span>
    </div>`;
  }).join('');

  // Add click handlers
  if (!isLocked) {
    list.querySelectorAll('.golfer-row:not(.selected):not(.disabled)').forEach(row => {
      row.addEventListener('click', () => {
        addGolfer({
          id: parseInt(row.dataset.id),
          name: row.dataset.name,
          salary: parseInt(row.dataset.salary),
          tier: row.dataset.tier
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
