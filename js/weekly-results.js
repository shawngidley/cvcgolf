// CVC Fantasy Golf 2026 - Weekly Results Page

let weeklySortCol = 'total';
let weeklySortDir = 'desc';
let weeklyData = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadWeeklyGrid();
  await loadEarningsChart();
});

async function loadWeeklyGrid() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name').neq('is_guest', true);
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, short_name')
    .eq('is_complete', true)
    .order('sort_order');
  const { data: lineups } = await supabaseClient.from('lineups').select('player_id, tournament_id, golfer_id');
  const { data: golferEarnings } = await supabaseClient.from('golfer_earnings').select('golfer_id, tournament_id, earnings');

  if (!players || !tournaments || tournaments.length === 0) return;

  // Build earnings lookup
  const earningsMap = {};
  if (golferEarnings) {
    golferEarnings.forEach(ge => {
      earningsMap[`${ge.golfer_id}-${ge.tournament_id}`] = parseFloat(ge.earnings || 0);
    });
  }

  // Helper: get player's total for a tournament from golfer_earnings + lineups
  function getPlayerWeekTotal(playerId, tournamentId) {
    const playerLineup = (lineups || []).filter(l => l.player_id === playerId && l.tournament_id === tournamentId);
    return playerLineup.reduce((sum, l) => sum + (earningsMap[`${l.golfer_id}-${l.tournament_id}`] || 0), 0);
  }

  // Build scoreMap
  const scoreMap = {};
  players.forEach(p => {
    tournaments.forEach(t => {
      scoreMap[`${p.id}-${t.id}`] = getPlayerWeekTotal(p.id, t.id);
    });
  });

  // Find weekly winners
  const weekWinners = {};
  tournaments.forEach(t => {
    let maxEarnings = 0;
    let winnerId = null;
    players.forEach(p => {
      const e = scoreMap[`${p.id}-${t.id}`] || 0;
      if (e > maxEarnings) { maxEarnings = e; winnerId = p.id; }
    });
    if (maxEarnings > 0) weekWinners[t.id] = winnerId;
  });

  // Build player totals
  const playerTotals = players.map(p => ({
    ...p,
    total: tournaments.reduce((sum, t) => sum + (scoreMap[`${p.id}-${t.id}`] || 0), 0)
  }));

  weeklyData = { tournaments, scoreMap, weekWinners, playerTotals };
  weeklySortCol = 'total';
  weeklySortDir = 'desc';
  renderWeeklyGrid();
}

function renderWeeklyGrid() {
  const { tournaments, scoreMap, weekWinners, playerTotals } = weeklyData;

  function headerTh(label, colKey, extraClass, title) {
    const arrow = colKey === weeklySortCol ? (weeklySortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';
    const activeClass = colKey === weeklySortCol ? ' sortable-active' : '';
    const titleAttr = title ? ` title="${title}"` : '';
    return `<th class="sortable-th ${extraClass}${activeClass}" data-sort-col="${colKey}"${titleAttr}>${label}${arrow}</th>`;
  }

  // Build header
  const thead = document.querySelector('#weeklyTable thead tr');
  thead.innerHTML = headerTh('Player', 'name', 'weekly-name-col') + tournaments.map(t =>
    headerTh(`W${t.week_number}`, `week-${t.id}`, 'currency', t.short_name)
  ).join('');

  thead.querySelectorAll('.sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sortCol;
      if (col === weeklySortCol) {
        weeklySortDir = weeklySortDir === 'asc' ? 'desc' : 'asc';
      } else {
        weeklySortCol = col;
        weeklySortDir = col === 'name' ? 'asc' : 'desc';
      }
      renderWeeklyGrid();
    });
  });

  // Sort players
  const sorted = [...playerTotals].sort((a, b) => {
    let va, vb;
    if (weeklySortCol === 'name') {
      va = a.name.toLowerCase(); vb = b.name.toLowerCase();
    } else if (weeklySortCol === 'total') {
      va = a.total; vb = b.total;
    } else {
      const tid = parseInt(weeklySortCol.replace('week-', ''));
      va = scoreMap[`${a.id}-${tid}`] || 0;
      vb = scoreMap[`${b.id}-${tid}`] || 0;
    }
    if (typeof va === 'string') {
      const cmp = va.localeCompare(vb);
      return weeklySortDir === 'asc' ? cmp : -cmp;
    }
    return weeklySortDir === 'asc' ? va - vb : vb - va;
  });

  const currentPlayer = getCurrentPlayer();
  document.getElementById('weeklyBody').innerHTML = sorted.map(p => {
    const cells = tournaments.map(t => {
      const e = scoreMap[`${p.id}-${t.id}`] || 0;
      const isWinner = weekWinners[t.id] === p.id;
      return `<td class="currency${isWinner ? ' winner-row' : ''}">${e > 0 ? formatCurrency(e) : '-'}</td>`;
    }).join('');
    const meClass = currentPlayer && p.id === currentPlayer.id ? 'my-row' : '';
    return `<tr class="${meClass}"><td class="weekly-name-col"><strong>${p.name.split(' ').pop()}</strong></td>${cells}</tr>`;
  }).join('');
}

async function loadEarningsChart() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name').neq('is_guest', true);
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, short_name')
    .eq('is_complete', true)
    .order('sort_order');
  const { data: lineups } = await supabaseClient.from('lineups').select('player_id, tournament_id, golfer_id');
  const { data: golferEarnings } = await supabaseClient.from('golfer_earnings').select('golfer_id, tournament_id, earnings');

  if (!players || !tournaments || tournaments.length === 0) {
    document.querySelector('.chart-container').innerHTML = '<p class="loading">No data for chart yet</p>';
    return;
  }

  // Build earnings lookup
  const earningsMap = {};
  if (golferEarnings) {
    golferEarnings.forEach(ge => {
      earningsMap[`${ge.golfer_id}-${ge.tournament_id}`] = parseFloat(ge.earnings || 0);
    });
  }

  function getPlayerWeekTotal(playerId, tournamentId) {
    const playerLineup = (lineups || []).filter(l => l.player_id === playerId && l.tournament_id === tournamentId);
    return playerLineup.reduce((sum, l) => sum + (earningsMap[`${l.golfer_id}-${l.tournament_id}`] || 0), 0);
  }

  const colors = [
    '#1a5c2e', '#2c5f8a', '#c5a55a', '#c0392b', '#8e44ad',
    '#e67e22', '#16a085', '#d35400', '#2980b9', '#27ae60',
    '#f39c12', '#e74c3c', '#3498db', '#9b59b6'
  ];

  const datasets = players.map((p, idx) => {
    let cum = 0;
    const data = tournaments.map(t => {
      cum += getPlayerWeekTotal(p.id, t.id);
      return cum;
    });
    return {
      label: p.name.split(' ').pop(),
      data,
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length] + '15',
      tension: 0.3,
      pointRadius: 3,
      borderWidth: 2
    };
  });

  new Chart(document.getElementById('earningsChart'), {
    type: 'line',
    data: { labels: tournaments.map(t => `W${t.week_number}`), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10, family: 'Inter, sans-serif' } } }
      },
      scales: {
        y: { ticks: { callback: v => formatCurrency(v), font: { size: 10 } } },
        x: { ticks: { font: { size: 10 } } }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}
