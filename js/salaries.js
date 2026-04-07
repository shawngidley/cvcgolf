// CVC Fantasy Golf 2026 - Salaries Page

let allGolfersData = [];

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

  renderSalaries(allGolfersData);
}

function renderSalaries(golfers) {
  const tbody = document.getElementById('salaryBody');
  if (golfers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No golfers found</td></tr>';
    return;
  }

  tbody.innerHTML = golfers.map(g => `
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
