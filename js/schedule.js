// CVC Fantasy Golf 2026 - Schedule Page

let allTournaments = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadSchedule();
  setupFilters();
});

async function loadSchedule() {
  const { data, error } = await supabaseClient
    .from('tournaments')
    .select('*')
    .order('sort_order');

  allTournaments = data || [];
  renderSchedule(allTournaments);
}

function renderSchedule(tournaments) {
  const grid = document.getElementById('scheduleGrid');
  if (tournaments.length === 0) {
    grid.innerHTML = '<p class="loading">No tournaments found</p>';
    return;
  }

  grid.innerHTML = tournaments.map(t => {
    let classes = 'tournament-card';
    let badges = '';
    if (t.is_major) { classes += ' major'; badges += '<span class="t-badge badge-major">Major</span> '; }
    if (t.is_signature) { classes += ' signature'; badges += '<span class="t-badge badge-signature">Signature</span> '; }
    if (t.is_current) { classes += ' current'; badges += '<span class="t-badge badge-current">Live</span> '; }
    if (t.is_complete) { classes += ' complete'; badges += '<span class="t-badge badge-complete">Complete</span> '; }

    return `
      <div class="${classes}">
        <div class="t-week">Week ${t.week_number}</div>
        <div class="t-name">${t.name}</div>
        <div class="t-course">${t.course || ''} &mdash; ${t.location || ''}</div>
        <div class="t-details">
          <span>${formatDateRange(t.start_date, t.end_date)}</span>
          <span>$${t.purse_millions}M</span>
        </div>
        <div style="margin-top:0.4rem">${badges}</div>
      </div>`;
  }).join('');
}

function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      const map = {
        all: () => allTournaments,
        major: () => allTournaments.filter(t => t.is_major),
        signature: () => allTournaments.filter(t => t.is_signature),
        complete: () => allTournaments.filter(t => t.is_complete),
        upcoming: () => allTournaments.filter(t => !t.is_complete)
      };
      renderSchedule((map[f] || map.all)());
    });
  });
}
