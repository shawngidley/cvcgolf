// CVC Fantasy Golf 2026 - History Page

document.addEventListener('DOMContentLoaded', async () => {
  await loadDropdowns();
  document.getElementById('weekSelect').addEventListener('change', loadWeekData);
  document.getElementById('playerFilter').addEventListener('change', loadWeekData);
});

async function loadDropdowns() {
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_complete', true)
    .order('sort_order', { ascending: false });

  const weekSelect = document.getElementById('weekSelect');
  if (tournaments) {
    tournaments.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `Week ${t.week_number}: ${t.short_name}`;
      weekSelect.appendChild(opt);
    });
  }

  const { data: players } = await supabase.from('players').select('id, name').order('name');
  const playerFilter = document.getElementById('playerFilter');
  if (players) {
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      playerFilter.appendChild(opt);
    });
  }
}

async function loadWeekData() {
  const tournamentId = document.getElementById('weekSelect').value;
  const playerFilter = document.getElementById('playerFilter').value;
  if (!tournamentId) return;

  // Tournament info
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  document.getElementById('weekOverview').style.display = 'block';
  document.getElementById('weekTitle').textContent = `Week ${tournament.week_number}: ${tournament.name}`;
  document.getElementById('weekMeta').innerHTML = `
    <span>${tournament.course}</span>
    <span>${formatDateRange(tournament.start_date, tournament.end_date)}</span>
    <span>Purse: $${tournament.purse_millions}M</span>
    ${tournament.is_major ? '<span class="t-badge badge-major">Major</span>' : ''}
  `;

  // Weekly standings
  const { data: scores } = await supabase
    .from('weekly_scores')
    .select('*, players(name)')
    .eq('tournament_id', tournamentId)
    .order('total_earnings', { ascending: false });

  const standingsCard = document.getElementById('weeklyStandingsCard');
  standingsCard.style.display = 'block';

  document.getElementById('weekStandingsBody').innerHTML = (scores || []).map((s, i) => {
    const highlight = playerFilter && s.player_id === parseInt(playerFilter) ? 'highlight' : '';
    return `
      <tr class="${i === 0 ? 'winner-row' : ''} ${highlight}">
        <td class="rank-cell">${i + 1}</td>
        <td><strong>${s.players?.name || 'Unknown'}</strong></td>
        <td>$${s.total_salary || 0}</td>
        <td>${s.best_golfer || '-'}</td>
        <td class="currency">${formatCurrency(s.total_earnings)}</td>
      </tr>`;
  }).join('') || '<tr><td colspan="5" class="loading">No scores</td></tr>';

  // Lineup detail for selected player
  const detailCard = document.getElementById('lineupDetailCard');
  if (playerFilter) {
    detailCard.style.display = 'block';
    const { data: player } = await supabase.from('players').select('name').eq('id', playerFilter).single();
    document.getElementById('lineupDetailTitle').textContent = `${player?.name || 'Player'} - Lineup Detail`;

    const { data: lineup } = await supabase
      .from('lineups')
      .select('slot, golfers(name, salary, tier)')
      .eq('player_id', playerFilter)
      .eq('tournament_id', tournamentId)
      .order('slot');

    if (lineup && lineup.length > 0) {
      // Get results for these golfers
      const golferNames = lineup.map(l => l.golfers?.name).filter(Boolean);
      const { data: results } = await supabase
        .from('results')
        .select('*, golfers(name)')
        .eq('tournament_id', tournamentId);

      const resultMap = {};
      if (results) results.forEach(r => { resultMap[r.golfers?.name] = r; });

      document.getElementById('lineupDetailBody').innerHTML = lineup.map(l => {
        const g = l.golfers;
        const r = resultMap[g?.name];
        const score = r ? (r.score_to_par === 0 ? 'E' : r.score_to_par > 0 ? `+${r.score_to_par}` : `${r.score_to_par}`) : '-';
        return `
          <tr>
            <td class="rank-cell">${l.slot}</td>
            <td><strong>${g?.name || '-'}</strong></td>
            <td>$${g?.salary || '-'}</td>
            <td>${r?.finish_position || '-'}</td>
            <td>${score}</td>
            <td class="currency">${formatCurrency(r?.earnings || 0)}</td>
          </tr>`;
      }).join('');
    } else {
      document.getElementById('lineupDetailBody').innerHTML = '<tr><td colspan="6" class="loading">No lineup found</td></tr>';
    }
  } else {
    detailCard.style.display = 'none';
  }
}
