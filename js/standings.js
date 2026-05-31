// CVC Fantasy Golf 2026 - Standings Page

document.addEventListener('DOMContentLoaded', async () => {
  await loadStandings();
});

async function loadStandings() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name').neq('is_guest', true);
  const now = new Date().toISOString();
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number')
    .or(`is_complete.eq.true,picks_locked.eq.true,first_tee_time.lte.${now}`);
  const tournamentIds = (tournaments || []).map(t => t.id);
  const { data: lineups } = await supabaseClient.from('lineups').select('player_id, tournament_id, golfer_id').in('tournament_id', tournamentIds);
  const { data: results } = await supabaseClient.from('results').select('golfer_id, tournament_id, earnings').in('tournament_id', tournamentIds);

  if (!players || players.length === 0) {
    document.getElementById('standingsBody').innerHTML =
      '<tr><td colspan="7" class="loading">No standings data yet.</td></tr>';
    return;
  }

  const weeksPlayed = tournaments ? tournaments.length : 0;
  document.getElementById('weekInfo').textContent = `Through Week ${weeksPlayed} of 21`;

  // Build earnings lookup: (golfer_id, tournament_id) -> earnings
  const earningsMap = {};
  if (results) {
    results.forEach(r => {
      earningsMap[`${r.golfer_id}-${r.tournament_id}`] = parseFloat(r.earnings || 0);
    });
  }

  // Calculate each player's standings from results + lineups
  const standings = players.map(p => {
    const weekTotals = tournamentIds.map(tid => {
      const playerLineup = (lineups || []).filter(l => l.player_id === p.id && l.tournament_id === tid);
      return playerLineup.reduce((sum, l) => sum + (earningsMap[`${l.golfer_id}-${l.tournament_id}`] || 0), 0);
    });

    const weeksWithData = weekTotals.filter(w => w > 0);
    const total = weekTotals.reduce((a, b) => a + b, 0);
    const best = weekTotals.length > 0 ? Math.max(...weekTotals) : 0;
    const worst = weekTotals.length > 0 ? Math.min(...weekTotals) : 0;
    const avg = weekTotals.length > 0 ? total / weekTotals.length : 0;

    return { player_id: p.id, name: p.name, total, best, worst, avg, weekTotals };
  });

  // Count weekly wins
  tournamentIds.forEach((tid, idx) => {
    const maxEarnings = Math.max(...standings.map(s => s.weekTotals[idx]));
    if (maxEarnings > 0) {
      standings.forEach(s => {
        if (!s.wins) s.wins = 0;
        if (s.weekTotals[idx] === maxEarnings) s.wins++;
      });
    }
  });

  standings.sort((a, b) => b.total - a.total);

  const player = getCurrentPlayer();
  document.getElementById('standingsBody').innerHTML = standings.map((s, i) => `
    <tr class="${player && s.player_id === player.id ? 'my-row' : ''}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td class="currency">${formatCurrency(s.total)}</td>
      <td style="text-align:center">${s.wins || 0}</td>
      <td class="currency">${formatCurrency(s.best)}</td>
      <td class="currency">${formatCurrency(s.worst)}</td>
      <td class="currency">${formatCurrency(s.avg)}</td>
    </tr>
  `).join('');
}
