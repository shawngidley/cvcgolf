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

  // Update tier cards with counts
  const tierConfig = [
    { salary: 27, cls: 'elite', label: 'Elite' },
    { salary: 25, cls: 'superstar', label: 'Superstar' },
    { salary: 23, cls: 'star', label: 'Star' },
    { salary: 21, cls: 'premium', label: 'Premium' },
    { salary: 19, cls: 'midupper', label: 'Mid-Upper' },
    { salary: 17, cls: 'mid', label: 'Mid' },
    { salary: 15, cls: 'value', label: 'Value' },
    { salary: 14, cls: 'budget', label: 'Budget' },
    { salary: 13, cls: 'bargain', label: 'Bargain' }
  ];

  const container = document.getElementById('salaryOverview');
  container.innerHTML = tierConfig.map(t => {
    const count = allGolfersData.filter(g => g.salary === t.salary).length;
    return `<div class="salary-tier-card ${t.cls}">
      <span class="tier-salary">$${t.salary}</span>
      <span class="tier-label">${t.label}</span>
      <span class="tier-count">${count} golfers</span>
    </div>`;
  }).join('');

  renderSalaries(allGolfersData);
}

function renderSalaries(golfers) {
  const tbody = document.getElementById('salaryBody');
  if (golfers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">No golfers found</td></tr>';
    return;
  }

  tbody.innerHTML = golfers.map(g => `
    <tr class="${g.is_liv ? 'liv-row' : ''}">
      <td class="rank-cell">${g.is_liv ? 'LIV' : (g.owgr || '-')}</td>
      <td><strong>${g.name}</strong></td>
      <td><strong>$${g.salary}</strong></td>
      <td>${g.tier}</td>
      <td class="currency">${formatCurrency(g.totalEarnings)}</td>
      <td>${g.timesPicked}</td>
    </tr>
  `).join('');
}

function setupFilters() {
  document.getElementById('salarySearch')?.addEventListener('input', applyFilters);
  document.getElementById('salaryTierFilter')?.addEventListener('change', applyFilters);
}

function applyFilters() {
  const search = (document.getElementById('salarySearch')?.value || '').toLowerCase();
  const tier = document.getElementById('salaryTierFilter')?.value || '';

  let filtered = allGolfersData;
  if (search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search));
  if (tier) filtered = filtered.filter(g => g.salary === parseInt(tier));
  renderSalaries(filtered);
}
