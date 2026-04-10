// CVC Fantasy Golf 2026 - Money Page

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadEntryFees(), loadWeeklyBonuses()]);
});

async function loadEntryFees() {
  const { data: fees } = await supabaseClient.from('entry_fees').select('*, players(id, name)').order('players(name)');
  const isAdmin = getCurrentPlayer()?.is_commissioner || false;
  const tbody = document.getElementById('entryFeeBody');

  if (!fees || fees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No entry fee data yet</td></tr>';
    return;
  }

  const sorted = fees.sort((a, b) => (a.players?.name || '').localeCompare(b.players?.name || ''));
  let paidCount = 0;
  let paidTotal = 0;

  tbody.innerHTML = sorted.map(f => {
    if (f.paid) { paidCount++; paidTotal += f.amount; }
    const statusBadge = f.paid
      ? '<span class="money-paid">Paid</span>'
      : '<span class="money-unpaid">Unpaid</span>';
    const dateStr = f.paid_date || '-';
    const adminToggle = isAdmin
      ? `<button class="money-toggle-btn" onclick="togglePaid(${f.id}, ${!f.paid})">${f.paid ? 'Mark Unpaid' : 'Mark Paid'}</button>`
      : '';

    return `<tr>
      <td><strong>${f.players?.name || '-'}</strong></td>
      <td style="text-align:center">$${f.amount}</td>
      <td style="text-align:center">${statusBadge} ${adminToggle}</td>
      <td style="text-align:center">${dateStr}</td>
      <td>${f.notes || ''}</td>
    </tr>`;
  }).join('');

  const totalOwed = sorted.length * 200;
  document.getElementById('entryFeeTotals').innerHTML = `
    <td colspan="2">Total: ${paidCount} of ${sorted.length} paid</td>
    <td style="text-align:center; color:${paidTotal < totalOwed ? 'var(--red)' : 'var(--augusta)'};">$${paidTotal.toLocaleString()} / $${totalOwed.toLocaleString()}</td>
    <td colspan="2"></td>`;
}

async function togglePaid(feeId, newStatus) {
  const updates = { paid: newStatus };
  if (newStatus) {
    updates.paid_date = new Date().toISOString().split('T')[0];
  } else {
    updates.paid_date = null;
  }
  await supabaseClient.from('entry_fees').update(updates).eq('id', feeId);
  await loadEntryFees();
}

async function loadWeeklyBonuses() {
  const { data: players } = await supabaseClient.from('players').select('id, name').neq('is_guest', true).order('name');
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, short_name, name, is_major, is_signature, is_complete')
    .eq('is_complete', true)
    .order('sort_order');
  const { data: lineups } = await supabaseClient.from('lineups').select('player_id, tournament_id, golfer_id');
  const { data: golferEarnings } = await supabaseClient.from('golfer_earnings').select('golfer_id, tournament_id, earnings');

  if (!players || !tournaments || tournaments.length === 0) {
    document.getElementById('weeklyBonusBody').innerHTML = '<tr><td colspan="6" class="loading">No completed tournaments yet</td></tr>';
    document.getElementById('winningsBody').innerHTML = '<tr><td colspan="3" class="loading">No data yet</td></tr>';
    return;
  }

  // Build earnings lookup
  const earningsMap = {};
  if (golferEarnings) {
    golferEarnings.forEach(ge => {
      earningsMap[`${ge.golfer_id}-${ge.tournament_id}`] = parseFloat(ge.earnings || 0);
    });
  }

  // Calculate each player's earnings per tournament
  function getPlayerWeekTotal(playerId, tournamentId) {
    const playerLineup = (lineups || []).filter(l => l.player_id === playerId && l.tournament_id === tournamentId);
    return playerLineup.reduce((sum, l) => sum + (earningsMap[`${l.golfer_id}-${l.tournament_id}`] || 0), 0);
  }

  // Find weekly high earner for each tournament
  const weeklyBonusData = [];
  const playerBonuses = {}; // player_id -> total bonus earned
  players.forEach(p => { playerBonuses[p.id] = 0; });

  tournaments.forEach(t => {
    let maxEarnings = 0;
    let winnerId = null;
    let winnerName = '-';

    players.forEach(p => {
      const e = getPlayerWeekTotal(p.id, t.id);
      if (e > maxEarnings) {
        maxEarnings = e;
        winnerId = p.id;
        winnerName = p.name;
      }
    });

    let bonusType, bonusAmount;
    if (t.is_major) {
      bonusType = 'Major';
      bonusAmount = 50;
    } else if (t.is_signature) {
      bonusType = 'Signature';
      bonusAmount = 40;
    } else {
      bonusType = 'Full Field';
      bonusAmount = 20;
    }

    if (winnerId && maxEarnings > 0) {
      playerBonuses[winnerId] = (playerBonuses[winnerId] || 0) + bonusAmount;
    }

    weeklyBonusData.push({
      week: t.week_number,
      name: t.short_name,
      type: bonusType,
      bonus: bonusAmount,
      winner: maxEarnings > 0 ? winnerName : '-',
      earnings: maxEarnings
    });
  });

  // Render weekly bonus table
  document.getElementById('weeklyBonusBody').innerHTML = weeklyBonusData.map(w => {
    const typeClass = w.type === 'Major' ? 'money-major' : w.type === 'Signature' ? 'money-signature' : 'money-fullfield';
    return `<tr>
      <td>Week ${w.week}</td>
      <td>${w.name}</td>
      <td style="text-align:center"><span class="${typeClass}">${w.type}</span></td>
      <td style="text-align:center">$${w.bonus}</td>
      <td><strong>${w.winner}</strong></td>
      <td style="text-align:center">${w.earnings > 0 ? formatCurrency(w.earnings) : '-'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="loading">No completed tournaments yet</td></tr>';

  // Render current winnings tracker
  const winningsData = players.map(p => ({
    name: p.name,
    bonuses: playerBonuses[p.id] || 0
  })).sort((a, b) => b.bonuses - a.bonuses);

  document.getElementById('winningsBody').innerHTML = winningsData.map(w => {
    return `<tr>
      <td><strong>${w.name}</strong></td>
      <td style="text-align:center">${w.bonuses > 0 ? '$' + w.bonuses : '-'}</td>
      <td style="text-align:center; font-weight:600;">${w.bonuses > 0 ? '$' + w.bonuses : '-'}</td>
    </tr>`;
  }).join('');
}
