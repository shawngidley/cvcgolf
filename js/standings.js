// CVC Fantasy Golf 2026 - Standings Page

document.addEventListener('DOMContentLoaded', async () => {
  await loadStandings();
});

async function loadStandings() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name').neq('is_guest', true);
  const { data: allTournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, is_complete, picks_locked, first_tee_time');
  const now = new Date();
  const tournaments = (allTournaments || []).filter(t =>
    t.is_complete || t.picks_locked || (t.first_tee_time && new Date(t.first_tee_time) <= now)
  );
  const tournamentIds = (tournaments || []).map(t => t.id);

  // Weekly wins and totals are derived live from weekly_scores — never from
  // the static standings.weekly_wins column, which can drift out of date.
  let scores = [];
  for (let from = 0; ; from += 1000) {
    const { data: batch } = await supabaseClient
      .from('weekly_scores')
      .select('player_id, tournament_id, total_earnings')
      .in('tournament_id', tournamentIds)
      .range(from, from + 999);
    if (!batch || batch.length === 0) break;
    scores = scores.concat(batch);
    if (batch.length < 1000) break;
  }

  if (!players || players.length === 0) {
    document.getElementById('standingsBody').innerHTML =
      '<tr><td colspan="8" class="loading">No standings data yet.</td></tr>';
    return;
  }

  const weeksPlayed = tournaments ? tournaments.length : 0;
  document.getElementById('weekInfo').textContent = `Through Week ${weeksPlayed} of 21`;

  const scoreMap = {};
  scores.forEach(s => { scoreMap[`${s.player_id}-${s.tournament_id}`] = parseFloat(s.total_earnings || 0); });

  const standings = players.map(p => {
    const weekTotals = tournamentIds.map(tid => scoreMap[`${p.id}-${tid}`] || 0);
    const total = weekTotals.reduce((a, b) => a + b, 0);
    const best = weekTotals.length > 0 ? Math.max(...weekTotals) : 0;
    const worst = weekTotals.length > 0 ? Math.min(...weekTotals) : 0;
    const avg = weekTotals.length > 0 ? total / weekTotals.length : 0;

    return { player_id: p.id, name: p.name, total, best, worst, avg, weekTotals, wins: 0, bonusTotal: 0 };
  });

  // For each completed/started tournament, the player with the highest
  // total_earnings in weekly_scores is the weekly high earner.
  tournamentIds.forEach((tid, idx) => {
    const maxEarnings = Math.max(0, ...standings.map(s => s.weekTotals[idx]));
    if (maxEarnings <= 0) return;
    const winner = standings.find(s => s.weekTotals[idx] === maxEarnings);
    if (!winner) return;
    winner.wins++;
    const tournament = tournaments.find(t => t.id === tid);
    const bonusInfo = getWeeklyBonusInfo(tournament?.week_number);
    if (bonusInfo) winner.bonusTotal += bonusInfo.amount;
  });

  standings.sort((a, b) => b.total - a.total);

  const player = getCurrentPlayer();
  const rows = standings.map((s, i) => `
    <tr class="${player && s.player_id === player.id ? 'my-row' : ''}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td class="currency">${formatCurrency(s.total)}</td>
      <td style="text-align:center">${s.wins || 0}</td>
      <td class="currency">${s.bonusTotal > 0 ? '$' + s.bonusTotal : '-'}</td>
      <td class="currency">${formatCurrency(s.best)}</td>
      <td class="currency">${formatCurrency(s.worst)}</td>
      <td class="currency">${formatCurrency(s.avg)}</td>
    </tr>
  `);

  const CUTLINE_RANK = 6;
  if (standings.length > CUTLINE_RANK) {
    rows.splice(CUTLINE_RANK, 0, `
    <tr class="cutline-row">
      <td colspan="8">── PLAYOFF CUTLINE ──</td>
    </tr>
  `);
  }

  document.getElementById('standingsBody').innerHTML = rows.join('');
}
