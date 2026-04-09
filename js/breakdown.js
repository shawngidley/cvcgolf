// CVC Fantasy Golf 2026 - Breakdown Page

const PLAYER_ABBREVS = [
  'Cas', 'Cromer', 'Ehrbar', 'Federer', 'Gidley', 'Janssen', 'Nelson',
  'D.Osicki', 'J.Osicki', 'Sotka', 'Sutton', 'Tomko', 'Walker', 'Yane'
];

let breakdownSortCol = 'count'; // 'name', 'count', 'earnings'
let breakdownSortDir = 'desc';
let breakdownGolferList = [];
let breakdownPlayerOrder = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadTournaments();
  document.getElementById('tournamentSelect').addEventListener('change', loadBreakdown);
});

async function loadTournaments() {
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('*')
    .order('sort_order', { ascending: false });

  const select = document.getElementById('tournamentSelect');

  // Only show locked, completed, or past-tee-time tournaments
  const now = new Date();
  const locked = (tournaments || []).filter(t => t.picks_locked || t.is_complete || (t.first_tee_time && new Date(t.first_tee_time) <= now));

  if (locked.length === 0) {
    select.innerHTML = '<option value="">No locked tournaments yet</option>';
    return;
  }

  locked.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `Week ${t.week_number}: ${t.short_name}`;
    select.appendChild(opt);
  });

  // Auto-select the most recent and load
  select.value = locked[0].id;
  loadBreakdown();
}

async function loadBreakdown() {
  const tournamentId = document.getElementById('tournamentSelect').value;
  const container = document.getElementById('breakdownContainer');
  const noData = document.getElementById('noData');

  if (!tournamentId) {
    container.style.display = 'none';
    noData.style.display = 'none';
    return;
  }

  // Fetch all data in parallel
  const [playersRes, lineupsRes, resultsRes] = await Promise.all([
    supabaseClient.from('players').select('id, name').order('name').neq('is_guest', true),
    supabaseClient.from('lineups').select('player_id, golfer_id, golfers(id, name)').eq('tournament_id', tournamentId),
    supabaseClient.from('results').select('golfer_id, earnings').eq('tournament_id', tournamentId)
  ]);

  const players = playersRes.data || [];
  const lineups = lineupsRes.data || [];
  const results = resultsRes.data || [];

  if (lineups.length === 0) {
    container.style.display = 'none';
    noData.style.display = 'block';
    return;
  }

  // Build earnings map: golfer_id -> earnings
  const earningsMap = {};
  results.forEach(r => { earningsMap[r.golfer_id] = parseFloat(r.earnings || 0); });

  // Sort players alphabetically to match PLAYER_ABBREVS order
  players.sort((a, b) => a.name.localeCompare(b.name));
  breakdownPlayerOrder = players.map(p => p.id);

  // Build picks map: golfer_id -> Set of player_ids
  const golferPicks = {};
  const golferNames = {};
  lineups.forEach(l => {
    const gid = l.golfer_id;
    const gname = l.golfers?.name || 'Unknown';
    if (!golferPicks[gid]) golferPicks[gid] = new Set();
    golferPicks[gid].add(l.player_id);
    golferNames[gid] = gname;
  });

  // Build golfer list
  breakdownGolferList = Object.keys(golferPicks).map(gid => ({
    id: gid,
    name: golferNames[gid],
    count: golferPicks[gid].size,
    picks: golferPicks[gid],
    earnings: earningsMap[gid] || 0
  }));

  // Reset to default sort
  breakdownSortCol = 'count';
  breakdownSortDir = 'desc';

  renderBreakdownTable();
  container.style.display = 'block';
  noData.style.display = 'none';
}

function renderBreakdownTable() {
  // Render header
  const thead = document.getElementById('breakdownHead');

  function headerTh(label, colKey, extraClass) {
    const arrow = colKey === breakdownSortCol ? (breakdownSortDir === 'asc' ? ' \u2191' : ' \u2193') : ' \u2195';
    const activeClass = colKey === breakdownSortCol ? ' sortable-active' : '';
    return `<th class="sortable-th ${extraClass}${activeClass}" data-sort-col="${colKey}">${label}${arrow}</th>`;
  }

  thead.innerHTML = headerTh('Golfer', 'name', 'breakdown-golfer-col') +
    breakdownPlayerOrder.map((_, i) => `<th class="breakdown-player-th"><div class="rotated-header">${PLAYER_ABBREVS[i]}</div></th>`).join('') +
    headerTh('Total', 'count', 'breakdown-total-th') +
    headerTh('Earnings', 'earnings', 'breakdown-earnings-th');

  thead.querySelectorAll('.sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sortCol;
      if (col === breakdownSortCol) {
        breakdownSortDir = breakdownSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        breakdownSortCol = col;
        breakdownSortDir = col === 'name' ? 'asc' : 'desc';
      }
      renderBreakdownTable();
    });
  });

  // Sort data
  const sorted = [...breakdownGolferList].sort((a, b) => {
    let va, vb;
    switch (breakdownSortCol) {
      case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
      case 'count': va = a.count; vb = b.count; break;
      case 'earnings': va = a.earnings; vb = b.earnings; break;
      default: va = a.count; vb = b.count;
    }
    if (typeof va === 'string') {
      const cmp = va.localeCompare(vb);
      return breakdownSortDir === 'asc' ? cmp : -cmp;
    }
    return breakdownSortDir === 'asc' ? va - vb : vb - va;
  });

  // Render rows
  const tbody = document.getElementById('breakdownBody');
  tbody.innerHTML = sorted.map((g, idx) => {
    const highlightClass = g.count >= 5 ? ' breakdown-hot' : '';
    const rowClass = idx % 2 === 0 ? 'breakdown-even' : 'breakdown-odd';
    const cells = breakdownPlayerOrder.map(pid => {
      const picked = g.picks.has(pid);
      return `<td class="breakdown-cell">${picked ? '<span class="breakdown-x">x</span>' : ''}</td>`;
    }).join('');
    return `<tr class="${rowClass}${highlightClass}">
      <td class="breakdown-golfer-col"><strong>${g.name}</strong></td>
      ${cells}
      <td class="breakdown-total-cell">${g.count}</td>
      <td class="breakdown-earnings-cell">${formatCurrency(g.earnings)}</td>
    </tr>`;
  }).join('');
}
