// CVC Fantasy Golf 2026 - Salaries Page

let allGolfersData = [];
let salarySortCol = 2; // Salary column
let salarySortDir = 'desc';

document.addEventListener('DOMContentLoaded', async () => {
  await loadSalaries();
  setupFilters();
});

async function loadSalaries() {
  const { data: golfers } = await supabaseClient
    .from('golfers')
    .select('*')
    .eq('is_active', true)
    .order('salary', { ascending: false })
    .order('owgr');

  // Get pick counts from lineups
  const { data: lineups } = await supabaseClient.from('lineups').select('golfer_id');
  const pickCounts = {};
  if (lineups) lineups.forEach(l => { pickCounts[l.golfer_id] = (pickCounts[l.golfer_id] || 0) + 1; });

  // Get total earnings from results
  const { data: results } = await supabaseClient.from('results').select('golfer_id, earnings');
  const earnings = {};
  if (results) results.forEach(r => { earnings[r.golfer_id] = (earnings[r.golfer_id] || 0) + parseFloat(r.earnings || 0); });

  allGolfersData = (golfers || []).map(g => ({
    ...g,
    timesPicked: pickCounts[g.id] || 0,
    totalEarnings: earnings[g.id] || 0
  }));

  // Build salary filter dropdown from actual database salaries
  const salaryGroups = {};
  allGolfersData.forEach(g => {
    if (!salaryGroups[g.salary]) salaryGroups[g.salary] = 0;
    salaryGroups[g.salary]++;
  });

  const sortedSalaries = Object.keys(salaryGroups).map(Number).sort((a, b) => b - a);

  const filterEl = document.getElementById('salaryFilter');
  filterEl.innerHTML = '<option value="">All Salaries</option>' +
    sortedSalaries.map(s => `<option value="${s}">$${s}</option>`).join('');

  renderSalaryHeaders();
  renderSalaries(allGolfersData);
}

function renderSalaryHeaders() {
  const headers = ['OWGR', 'Golfer', 'Salary', 'Season Earnings', 'Times Picked (League)'];
  const table = document.querySelector('#salaryTable thead tr');
  table.innerHTML = headers.map((h, i) => {
    const arrow = i === salarySortCol ? (salarySortDir === 'asc' ? ' \u2191' : ' \u2193') : ' \u2195';
    const activeClass = i === salarySortCol ? ' sortable-active' : '';
    const currClass = i === 3 ? ' currency' : '';
    return `<th class="sortable-th${activeClass}${currClass}" data-col="${i}">${h}${arrow}</th>`;
  }).join('');

  table.querySelectorAll('.sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const col = parseInt(th.dataset.col);
      if (col === salarySortCol) {
        salarySortDir = salarySortDir === 'asc' ? 'desc' : 'asc';
      } else {
        salarySortCol = col;
        salarySortDir = (col === 1) ? 'asc' : 'desc';
      }
      renderSalaryHeaders();
      applyFilters();
    });
  });
}

function renderSalaries(golfers) {
  const tbody = document.getElementById('salaryBody');
  if (golfers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No golfers found</td></tr>';
    return;
  }

  // Sort the data
  const sorted = [...golfers].sort((a, b) => {
    let va, vb;
    switch (salarySortCol) {
      case 0: va = a.owgr || 9999; vb = b.owgr || 9999; break;
      case 1: va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
      case 2: va = a.salary; vb = b.salary; break;
      case 3: va = a.totalEarnings; vb = b.totalEarnings; break;
      case 4: va = a.timesPicked; vb = b.timesPicked; break;
      default: va = a.salary; vb = b.salary;
    }
    if (typeof va === 'string') {
      const cmp = va.localeCompare(vb);
      return salarySortDir === 'asc' ? cmp : -cmp;
    }
    return salarySortDir === 'asc' ? va - vb : vb - va;
  });

  tbody.innerHTML = sorted.map(g => `
    <tr class="${g.is_liv ? 'liv-row' : ''}">
      <td class="rank-cell">${g.is_liv ? 'LIV' : (g.owgr || '-')}</td>
      <td><strong><a href="https://www.spotrac.com/pga/rankings/earnings/_/year/2026" target="_blank" class="golfer-link">${g.name}</a></strong></td>
      <td><strong>$${g.salary}</strong></td>
      <td class="currency">${formatCurrency(g.totalEarnings)}</td>
      <td>${g.timesPicked}</td>
    </tr>
  `).join('');
}

function setupFilters() {
  document.getElementById('salarySearch')?.addEventListener('input', applyFilters);
  document.getElementById('salaryFilter')?.addEventListener('change', applyFilters);
}

function applyFilters() {
  const search = (document.getElementById('salarySearch')?.value || '').toLowerCase();
  const salary = document.getElementById('salaryFilter')?.value || '';

  let filtered = allGolfersData;
  if (search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search));
  if (salary) filtered = filtered.filter(g => g.salary === parseInt(salary));
  renderSalaries(filtered);
}
