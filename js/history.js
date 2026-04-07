// CVC Fantasy Golf 2026 - History Page

document.addEventListener('DOMContentLoaded', async () => {
  await loadDropdowns();
  document.getElementById('weekSelect').addEventListener('change', loadWeekData);
  document.getElementById('playerFilter').addEventListener('change', loadWeekData);
});

async function loadDropdowns() {
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('*')
    .eq('is_complete', true)
    .order('sort_order', { ascending: false });

  const weekSelect = document.getElementById('weekSelect');
  if (tournaments && tournaments.length > 0) {
    tournaments.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `Week ${t.week_number}: ${t.short_name}`;
      weekSelect.appendChild(opt);
    });
    // Auto-select the most recent week and load its data
    weekSelect.value = tournaments[0].id;
    loadWeekData();
  }

  const { data: players } = await supabaseClient.from('players').select('id, name').order('name');
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

  const tid = parseInt(tournamentId);

  // Tournament info
  const { data: tournament } = await supabaseClient
    .from('tournaments')
    .select('*')
    .eq('id', tid)
    .single();

  document.getElementById('weekOverview').style.display = 'block';
  document.getElementById('weekTitle').textContent = `Week ${tournament.week_number}: ${tournament.name}`;
  document.getElementById('weekMeta').innerHTML = `
    <span>${tournament.course}</span>
    <span>${formatDateRange(tournament.start_date, tournament.end_date)}</span>
    <span>Purse: $${tournament.purse_millions}M</span>
    ${tournament.is_major ? '<span class="t-badge badge-major">Major</span>' : ''}
  `;

  // Get all players, lineups, and golfer_earnings for this tournament
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name');
  const { data: allLineups } = await supabaseClient
    .from('lineups')
    .select('player_id, golfer_id, slot, golfers(name, salary)')
    .eq('tournament_id', tid);
  const { data: golferEarnings } = await supabaseClient
    .from('golfer_earnings')
    .select('golfer_id, earnings, finish_position, score')
    .eq('tournament_id', tid);

  // Build earnings lookup for this tournament
  const earningsMap = {};
  if (golferEarnings) {
    golferEarnings.forEach(ge => {
      earningsMap[ge.golfer_id] = {
        earnings: parseFloat(ge.earnings || 0),
        position: ge.finish_position || '-',
        score: ge.score || '-'
      };
    });
  }

  // Calculate weekly standings from golfer_earnings + lineups
  const weekStandings = (players || []).map(p => {
    const playerLineup = (allLineups || []).filter(l => l.player_id === p.id);
    const totalEarnings = playerLineup.reduce((sum, l) => sum + (earningsMap[l.golfer_id]?.earnings || 0), 0);
    const totalSalary = playerLineup.reduce((sum, l) => sum + (l.golfers?.salary || 0), 0);
    return { player_id: p.id, name: p.name, total_earnings: totalEarnings, total_salary: totalSalary };
  }).sort((a, b) => b.total_earnings - a.total_earnings);

  const standingsCard = document.getElementById('weeklyStandingsCard');
  standingsCard.style.display = 'block';

  const me = getCurrentPlayer();
  document.getElementById('weekStandingsBody').innerHTML = weekStandings.map((s, i) => {
    const highlight = playerFilter && s.player_id === parseInt(playerFilter) ? 'highlight' : '';
    const isMe = me && s.player_id === me.id ? 'my-row' : '';
    return `
      <tr class="${highlight} ${isMe}">
        <td class="rank-cell">${i + 1}</td>
        <td><strong>${s.name}</strong></td>
        <td>$${s.total_salary}</td>
        <td>-</td>
        <td class="currency">${formatCurrency(s.total_earnings)}</td>
      </tr>`;
  }).join('') || '<tr><td colspan="5" class="loading">No scores</td></tr>';

  // Lineup detail for selected player
  const detailCard = document.getElementById('lineupDetailCard');
  if (playerFilter) {
    detailCard.style.display = 'block';
    const player = players?.find(p => p.id === parseInt(playerFilter));
    document.getElementById('lineupDetailTitle').textContent = `${player?.name || 'Player'} - Lineup Detail`;

    const lineup = (allLineups || [])
      .filter(l => l.player_id === parseInt(playerFilter))
      .sort((a, b) => a.slot - b.slot);

    if (lineup.length > 0) {
      document.getElementById('lineupDetailBody').innerHTML = lineup.map(l => {
        const g = l.golfers;
        const ge = earningsMap[l.golfer_id];
        return `
          <tr>
            <td class="rank-cell">${l.slot}</td>
            <td><strong>${g?.name || '-'}</strong></td>
            <td>$${g?.salary || '-'}</td>
            <td>${ge?.position || '-'}</td>
            <td>${ge?.score || '-'}</td>
            <td class="currency">${formatCurrency(ge?.earnings || 0)}</td>
          </tr>`;
      }).join('');
    } else {
      document.getElementById('lineupDetailBody').innerHTML = '<tr><td colspan="6" class="loading">No lineup found</td></tr>';
    }
  } else {
    detailCard.style.display = 'none';
  }
}
