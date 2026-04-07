// CVC Fantasy Golf 2026 - Standings Page

document.addEventListener('DOMContentLoaded', async () => {
  await loadStandings();
  await loadWeeklyGrid();
  await loadEarningsChart();
});

async function loadStandings() {
  const { data: standings, error } = await supabaseClient
    .from('standings')
    .select('*, players(name)')
    .order('total_earnings', { ascending: false });

  if (error || !standings || standings.length === 0) {
    document.getElementById('standingsBody').innerHTML =
      '<tr><td colspan="7" class="loading">No standings data yet. Run seed.sql first.</td></tr>';
    return;
  }

  // Week info
  const { data: completedWeeks } = await supabaseClient
    .from('tournaments')
    .select('week_number')
    .eq('is_complete', true);
  const weeksPlayed = completedWeeks ? completedWeeks.length : 0;
  document.getElementById('weekInfo').textContent = `Through Week ${weeksPlayed} of 21`;

  // Table
  document.getElementById('standingsBody').innerHTML = standings.map((s, i) => `
    <tr class="${i === 0 ? 'winner-row' : ''}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${s.players?.name || 'Unknown'}</strong></td>
      <td class="currency">${formatCurrency(s.total_earnings)}</td>
      <td>${s.weekly_wins || 0}</td>
      <td class="currency">${formatCurrency(s.best_week)}</td>
      <td class="currency">${formatCurrency(s.worst_week)}</td>
      <td class="currency">${formatCurrency(s.avg_weekly)}</td>
    </tr>
  `).join('');
}

async function loadWeeklyGrid() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name');
  const { data: scores } = await supabaseClient.from('weekly_scores').select('player_id, tournament_id, total_earnings');
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, short_name')
    .eq('is_complete', true)
    .order('sort_order');

  if (!players || !scores || !tournaments || tournaments.length === 0) return;

  // Build header
  const thead = document.querySelector('#weeklyTable thead tr');
  thead.innerHTML = '<th>Player</th>' + tournaments.map(t =>
    `<th class="currency" title="${t.short_name}">W${t.week_number}</th>`
  ).join('');

  // Build scoreMap
  const scoreMap = {};
  scores.forEach(s => {
    const key = `${s.player_id}-${s.tournament_id}`;
    scoreMap[key] = s.total_earnings;
  });

  // Find weekly winners
  const weekWinners = {};
  tournaments.forEach(t => {
    let maxEarnings = 0;
    let winnerId = null;
    players.forEach(p => {
      const e = parseFloat(scoreMap[`${p.id}-${t.id}`] || 0);
      if (e > maxEarnings) { maxEarnings = e; winnerId = p.id; }
    });
    weekWinners[t.id] = winnerId;
  });

  // Sort players by total earnings
  const playerTotals = players.map(p => ({
    ...p,
    total: tournaments.reduce((sum, t) => sum + parseFloat(scoreMap[`${p.id}-${t.id}`] || 0), 0)
  })).sort((a, b) => b.total - a.total);

  document.getElementById('weeklyBody').innerHTML = playerTotals.map(p => {
    const cells = tournaments.map(t => {
      const e = parseFloat(scoreMap[`${p.id}-${t.id}`] || 0);
      const isWinner = weekWinners[t.id] === p.id;
      return `<td class="currency${isWinner ? ' winner-row' : ''}">${e > 0 ? formatCurrency(e) : '-'}</td>`;
    }).join('');
    return `<tr><td><strong>${p.name.split(' ').pop()}</strong></td>${cells}</tr>`;
  }).join('');
}

async function loadEarningsChart() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name');
  const { data: scores } = await supabaseClient.from('weekly_scores').select('player_id, tournament_id, total_earnings');
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, short_name')
    .eq('is_complete', true)
    .order('sort_order');

  if (!players || !scores || !tournaments || tournaments.length === 0) {
    document.querySelector('.chart-container').innerHTML = '<p class="loading">No data for chart yet</p>';
    return;
  }

  const colors = [
    '#1a5c2e', '#2c5f8a', '#c5a55a', '#c0392b', '#8e44ad',
    '#e67e22', '#16a085', '#d35400', '#2980b9', '#27ae60',
    '#f39c12', '#e74c3c', '#3498db', '#9b59b6'
  ];

  const scoreMap = {};
  scores.forEach(s => { scoreMap[`${s.player_id}-${s.tournament_id}`] = parseFloat(s.total_earnings || 0); });

  const datasets = players.map((p, idx) => {
    let cum = 0;
    const data = tournaments.map(t => {
      cum += scoreMap[`${p.id}-${t.id}`] || 0;
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
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10, family: '-apple-system, sans-serif' } } }
      },
      scales: {
        y: { ticks: { callback: v => formatCurrency(v), font: { size: 10 } } },
        x: { ticks: { font: { size: 10 } } }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}
