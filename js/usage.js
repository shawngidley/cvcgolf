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
  const { data: players } = await supabase.from('players').select('id, name').order('name');
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

  const { data: usage } = await supabase
    .from('golfer_usage')
    .select('*, golfers(name, salary, tier)')
    .eq('player_id', playerId)
    .order('times_used', { ascending: false });

  const summary = document.getElementById('usageSummary');
  const tbody = document.getElementById('usageBody');

  if (!usage || usage.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">No usage data yet</td></tr>';
    summary.style.display = 'none';
    return;
  }

  summary.style.display = 'flex';
  document.getElementById('uniqueGolfers').textContent = usage.length;

  const mostUsed = usage[0];
  document.getElementById('mostUsedName').textContent = `${mostUsed.golfers?.name || '-'} (${mostUsed.times_used}x)`;

  // Best ROI = highest earnings per use
  const bestROI = [...usage].sort((a, b) => {
    const roiA = a.times_used > 0 ? a.total_earnings / a.times_used : 0;
    const roiB = b.times_used > 0 ? b.total_earnings / b.times_used : 0;
    return roiB - roiA;
  })[0];
  document.getElementById('bestROI').textContent = bestROI?.golfers?.name || '-';

  const maxUsed = Math.max(...usage.map(u => u.times_used));

  tbody.innerHTML = usage.map(u => {
    const avg = u.times_used > 0 ? u.total_earnings / u.times_used : 0;
    const barWidth = (u.times_used / maxUsed) * 100;
    return `
      <tr>
        <td><strong>${u.golfers?.name || '-'}</strong></td>
        <td>$${u.golfers?.salary || '-'}</td>
        <td>${u.times_used}</td>
        <td class="currency">${formatCurrency(u.total_earnings)}</td>
        <td class="currency">${formatCurrency(avg)}</td>
        <td><div class="usage-bar" style="width: ${barWidth}%"></div></td>
      </tr>`;
  }).join('');
}
