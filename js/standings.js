// CVC Fantasy Golf 2026 - Standings Page

document.addEventListener('DOMContentLoaded', async () => {
  await loadStandings();
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
  const player = getCurrentPlayer();
  document.getElementById('standingsBody').innerHTML = standings.map((s, i) => `
    <tr class="${player && s.player_id === player.id ? 'my-row' : ''}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${s.players?.name || 'Unknown'}</strong></td>
      <td class="currency">${formatCurrency(s.total_earnings)}</td>
      <td style="text-align:center">${s.weekly_wins || 0}</td>
      <td class="currency">${formatCurrency(s.best_week)}</td>
      <td class="currency">${formatCurrency(s.worst_week)}</td>
      <td class="currency">${formatCurrency(s.avg_weekly)}</td>
    </tr>
  `).join('');
}
