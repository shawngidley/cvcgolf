// CVC Fantasy Golf 2026 - Usage Tracker

let usageSortCol = 2; // Times Used column
let usageSortDir = 'desc';
let usageRowData = [];

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
  const { data: players } = await supabaseClient.from('players').select('id, name').order('name').neq('is_guest', true);
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

  usageRowData = Object.values(usageByGolfer);

  // Compute avg for each
  usageRowData.forEach(u => {
    u.avg = u.times_used > 0 ? u.total_earnings / u.times_used : 0;
    u.maxUses = u.is_liv ? 2 : 5;
  });

  summary.style.display = 'flex';
  document.getElementById('uniqueGolfers').textContent = usageRowData.length;

  const mostUsed = [...usageRowData].sort((a, b) => b.times_used - a.times_used)[0];
  document.getElementById('mostUsedName').textContent = `${mostUsed.name} (${mostUsed.times_used}x)`;

  const bestROI = [...usageRowData].sort((a, b) => b.avg - a.avg)[0];
  document.getElementById('bestROI').textContent = bestROI?.name || '-';

  // Reset to default sort
  usageSortCol = 2;
  usageSortDir = 'desc';

  renderUsageHeaders();
  renderUsageTable();
}

function renderUsageHeaders() {
  const headers = ['Golfer', 'Salary', 'Times Used', 'Total Earned', 'Avg/Use', 'Usage Bar'];
  const table = document.querySelector('#usageTable thead tr');
  table.innerHTML = headers.map((h, i) => {
    if (i === 5) return `<th>${h}</th>`; // Usage Bar not sortable
    const arrow = i === usageSortCol ? (usageSortDir === 'asc' ? ' \u2191' : ' \u2193') : ' \u2195';
    const activeClass = i === usageSortCol ? ' sortable-active' : '';
    const currClass = (i === 3 || i === 4) ? ' currency' : '';
    return `<th class="sortable-th${activeClass}${currClass}" data-col="${i}">${h}${arrow}</th>`;
  }).join('');

  table.querySelectorAll('.sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = parseInt(th.dataset.col);
      if (col === usageSortCol) {
        usageSortDir = usageSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        usageSortCol = col;
        usageSortDir = col === 0 ? 'asc' : 'desc';
      }
      renderUsageHeaders();
      renderUsageTable();
    });
  });
}

function renderUsageTable() {
  const sorted = [...usageRowData].sort((a, b) => {
    let va, vb;
    switch (usageSortCol) {
      case 0: va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
      case 1: va = a.salary; vb = b.salary; break;
      case 2: va = a.times_used; vb = b.times_used; break;
      case 3: va = a.total_earnings; vb = b.total_earnings; break;
      case 4: va = a.avg; vb = b.avg; break;
      default: va = a.times_used; vb = b.times_used;
    }
    if (typeof va === 'string') {
      const cmp = va.localeCompare(vb);
      return usageSortDir === 'asc' ? cmp : -cmp;
    }
    return usageSortDir === 'asc' ? va - vb : vb - va;
  });

  const maxUsed = Math.max(...sorted.map(u => u.times_used));
  const tbody = document.getElementById('usageBody');
  tbody.innerHTML = sorted.map(u => {
    const barWidth = (u.times_used / maxUsed) * 100;
    return `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>$${u.salary}</td>
        <td>${u.times_used}/${u.maxUses}</td>
        <td class="currency">${formatCurrency(u.total_earnings)}</td>
        <td class="currency">${formatCurrency(u.avg)}</td>
        <td><div class="usage-bar" style="width: ${barWidth}%"></div></td>
      </tr>`;
  }).join('');
}
