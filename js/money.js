// CVC Fantasy Golf 2026 - Money Page

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadEntryFees(), loadWeeklyBonuses()]);
});

async function loadEntryFees() {
  const { data: fees } = await supabaseClient.from('entry_fees').select('*, players(id, name)').order('players(name)');
  const isAdmin = getCurrentPlayer()?.is_commissioner || false;
  const tbody = document.getElementById('entryFeeBody');

  if (!fees || fees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">No entry fee data yet</td></tr>';
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
    </tr>`;
  }).join('');

  const totalOwed = sorted.length * 200;
  document.getElementById('entryFeeTotals').innerHTML = `
    <td colspan="2">Total: ${paidCount} of ${sorted.length} paid</td>
    <td style="text-align:center; color:${paidTotal < totalOwed ? 'var(--red)' : 'var(--augusta)'};">$${paidTotal.toLocaleString()} / $${totalOwed.toLocaleString()}</td>
    <td></td>`;
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
    .select('id, week_number, short_name, name, is_complete')
    .eq('is_complete', true)
    .order('sort_order');
  const { data: bonusRows } = await supabaseClient
    .from('weekly_bonuses')
    .select('tournament_id, player_id, bonus_amount, bonus_type, players(name)');
  const { data: scores } = await supabaseClient
    .from('weekly_scores')
    .select('player_id, tournament_id, total_earnings');

  if (!players || !tournaments || tournaments.length === 0) {
    document.getElementById('weeklyBonusBody').innerHTML = '<tr><td colspan="6" class="loading">No completed tournaments yet</td></tr>';
    document.getElementById('winningsBody').innerHTML = '<tr><td colspan="3" class="loading">No data yet</td></tr>';
    return;
  }

  // Weekly bonus winners are pulled from the weekly_bonuses table, which the
  // admin panel populates when a week's earnings are saved (ties get one row
  // per tied player with the bonus split evenly). As a fallback for
  // completed weeks the admin hasn't (re)saved yet, compute the high
  // earner(s) live from weekly_scores so the page isn't blank.
  const bonusByTournament = {};
  (bonusRows || []).forEach(b => { (bonusByTournament[b.tournament_id] = bonusByTournament[b.tournament_id] || []).push(b); });

  const scoreMap = {};
  (scores || []).forEach(s => { scoreMap[`${s.player_id}-${s.tournament_id}`] = parseFloat(s.total_earnings || 0); });

  const playerBonuses = {}; // player_id -> total bonus earned
  players.forEach(p => { playerBonuses[p.id] = 0; });

  const weeklyBonusData = tournaments.map(t => {
    const scheduleInfo = getWeeklyBonusInfo(t.week_number);
    const saved = bonusByTournament[t.id];

    let winners = []; // [{ id, name, share }]
    let earnings = 0;
    let bonusType = scheduleInfo?.type || '-';
    let totalBonus = scheduleInfo?.amount || 0;

    if (saved && saved.length > 0) {
      winners = saved.map(b => ({
        id: b.player_id,
        name: b.players?.name || players.find(p => p.id === b.player_id)?.name || '-',
        share: parseFloat(b.bonus_amount || 0)
      }));
      bonusType = saved[0].bonus_type || bonusType;
      totalBonus = winners.reduce((sum, w) => sum + w.share, 0);
      earnings = scoreMap[`${winners[0].id}-${t.id}`] || 0;
    } else {
      const maxEarnings = Math.max(0, ...players.map(p => scoreMap[`${p.id}-${t.id}`] || 0));
      if (maxEarnings > 0) {
        const tied = players.filter(p => (scoreMap[`${p.id}-${t.id}`] || 0) === maxEarnings);
        const share = Math.round((totalBonus / tied.length) * 100) / 100;
        winners = tied.map(p => ({ id: p.id, name: p.name, share }));
        earnings = maxEarnings;
      }
    }

    winners.forEach(w => {
      playerBonuses[w.id] = (playerBonuses[w.id] || 0) + w.share;
    });

    return {
      week: t.week_number,
      name: t.short_name,
      type: bonusType,
      bonus: totalBonus,
      winner: winners.length > 0 ? winners.map(w => w.name).join(' & ') : '-',
      earnings
    };
  });

  // Render weekly bonus table
  document.getElementById('weeklyBonusBody').innerHTML = weeklyBonusData.map(w => {
    const typeClass = w.type === 'Major' ? 'money-major' : w.bonus === 40 ? 'money-signature' : 'money-fullfield';
    return `<tr>
      <td>Week ${w.week}</td>
      <td>${w.name}</td>
      <td style="text-align:center"><span class="${typeClass}">${w.type}</span></td>
      <td style="text-align:center">$${w.bonus}</td>
      <td><strong>${w.winner}</strong></td>
      <td style="text-align:center">${w.earnings > 0 ? formatCurrency(w.earnings) : '-'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="loading">No completed tournaments yet</td></tr>';

  // Running total of bonus money distributed vs. remaining in the season pot
  const distributed = Object.values(playerBonuses).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, WEEKLY_BONUS_TOTAL_POT - distributed);
  const potSummary = document.getElementById('bonusPotSummary');
  if (potSummary) {
    potSummary.textContent = `$${distributed.toLocaleString()} distributed of $${WEEKLY_BONUS_TOTAL_POT.toLocaleString()} weekly pot ($${remaining.toLocaleString()} remaining)`;
  }

  // Render current winnings tracker
  const winningsData = players.map(p => ({
    name: p.name,
    bonuses: playerBonuses[p.id] || 0
  })).sort((a, b) => b.bonuses - a.bonuses);

  document.getElementById('winningsBody').innerHTML = winningsData.map(w => {
    const display = w.bonuses > 0 ? '$' + w.bonuses.toFixed(2).replace(/\.00$/, '') : '-';
    return `<tr>
      <td><strong>${w.name}</strong></td>
      <td style="text-align:center">${display}</td>
      <td style="text-align:center; font-weight:600;">${display}</td>
    </tr>`;
  }).join('');
}
