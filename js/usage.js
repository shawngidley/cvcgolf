// CVC Fantasy Golf 2026 - Usage Tracker

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayerDropdown();
  document.getElementById('usagePlayerSelect').addEventListener('change', loadUsage);

  // Default to logged-in player
  const player = getCurrentPlayer();
  if (player) {
    document.getElementById('usagePlayerSelect').value = player.id;
    loadUsage();
  }
});

async function loadPlayerDropdown() {
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name');
  const select = document.getElementById('usagePlayerSelect');
  if (players) {
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
  }
}

async function loadUsage() {
  const playerId = document.getElementById('usagePlayerSelect').value;
  if (!playerId) return;

  // Get this player's lineups with golfer info
  const { data: lineups } = await supabaseClient
    .from('lineups')
    .select('golfer_id, tournament_id, golfers(name, salary, is_liv)')
    .eq('player_id', playerId);

  // Get all golfer_earnings
  const { data: golferEarnings } = await supabaseClient
    .from('golfer_earnings')
    .select('golfer_id, tournament_id, earnings');

  const summary = document.getElementById('usageSummary');
  const tbody = document.getElementById('usageBody');

  if (!lineups || lineups.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">No usage data yet</td></tr>';
    summary.style.display = 'none';
    return;
  }

  // Build earnings lookup
  const earningsMap = {};
  if (golferEarnings) {
    golferEarnings.forEach(ge => {
      earningsMap[`${ge.golfer_id}-${ge.tournament_id}`] = parseFloat(ge.earnings || 0);
    });
  }

  // Aggregate usage per golfer
  const usageByGolfer = {};
  lineups.forEach(l => {
    if (!usageByGolfer[l.golfer_id]) {
      usageByGolfer[l.golfer_id] = {
        golfer_id: l.golfer_id,
        name: l.golfers?.name || '-',
        salary: l.golfers?.salary || 0,
        is_liv: l.golfers?.is_liv || false,
        times_used: 0,
        total_earnings: 0
      };
    }
    usageByGolfer[l.golfer_id].times_used++;
    usageByGolfer[l.golfer_id].total_earnings += earningsMap[`${l.golfer_id}-${l.tournament_id}`] || 0;
  });

  const usage = Object.values(usageByGolfer).sort((a, b) => b.times_used - a.times_used);

  summary.style.display = 'flex';
  document.getElementById('uniqueGolfers').textContent = usage.length;

  const mostUsed = usage[0];
  document.getElementById('mostUsedName').textContent = `${mostUsed.name} (${mostUsed.times_used}x)`;

  // Best ROI = highest earnings per use
  const bestROI = [...usage].sort((a, b) => {
    const roiA = a.times_used > 0 ? a.total_earnings / a.times_used : 0;
    const roiB = b.times_used > 0 ? b.total_earnings / b.times_used : 0;
    return roiB - roiA;
  })[0];
  document.getElementById('bestROI').textContent = bestROI?.name || '-';

  const maxUsed = Math.max(...usage.map(u => u.times_used));

  tbody.innerHTML = usage.map(u => {
    const avg = u.times_used > 0 ? u.total_earnings / u.times_used : 0;
    const maxUses = u.is_liv ? 2 : 5;
    const barWidth = (u.times_used / maxUsed) * 100;
    return `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>$${u.salary}</td>
        <td>${u.times_used}/${maxUses}</td>
        <td class="currency">${formatCurrency(u.total_earnings)}</td>
        <td class="currency">${formatCurrency(avg)}</td>
        <td><div class="usage-bar" style="width: ${barWidth}%"></div></td>
      </tr>`;
  }).join('');
}
