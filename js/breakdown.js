// CVC Fantasy Golf 2026 - Breakdown Page

const PLAYER_ABBREVS = [
  'Cas', 'Cromer', 'Ehrbar', 'Federer', 'Gidley', 'Janssen', 'Nelson',
  'D.Osicki', 'J.Osicki', 'Sotka', 'Sutton', 'Tomko', 'Walker', 'Yane'
];

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

  // Only show locked or completed tournaments
  const locked = (tournaments || []).filter(t => t.picks_locked || t.is_complete);

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
    supabaseClient.from('players').select('id, name').order('name'),
    supabaseClient.from('lineups').select('player_id, golfer_id, golfers(id, name)').eq('tournament_id', tournamentId),
    supabaseClient.from('results').select('golfer_id, earnings, golfers(name)').eq('tournament_id', tournamentId)
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

  // Build player map: id -> { name, abbrev }
  // Sort players alphabetically to match PLAYER_ABBREVS order
  players.sort((a, b) => a.name.localeCompare(b.name));
  const playerOrder = players.map(p => p.id);

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

  // Build sorted golfer list: by times picked desc, then alphabetically
  const golferList = Object.keys(golferPicks).map(gid => ({
    id: gid,
    name: golferNames[gid],
    count: golferPicks[gid].size,
    picks: golferPicks[gid],
    earnings: earningsMap[gid] || 0
  }));
  golferList.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // Render header
  const thead = document.getElementById('breakdownHead');
  thead.innerHTML = '<th class="breakdown-golfer-col">Golfer</th>' +
    playerOrder.map((_, i) => `<th class="breakdown-player-th"><div class="rotated-header">${PLAYER_ABBREVS[i]}</div></th>`).join('') +
    '<th class="breakdown-total-th">Total</th>' +
    '<th class="breakdown-earnings-th">Earnings</th>';

  // Render rows
  const tbody = document.getElementById('breakdownBody');
  tbody.innerHTML = golferList.map((g, idx) => {
    const highlightClass = g.count >= 5 ? ' breakdown-hot' : '';
    const rowClass = idx % 2 === 0 ? 'breakdown-even' : 'breakdown-odd';
    const cells = playerOrder.map(pid => {
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

  container.style.display = 'block';
  noData.style.display = 'none';
}
