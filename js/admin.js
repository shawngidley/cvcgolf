// CVC Fantasy Golf 2026 - Admin Panel

document.addEventListener('DOMContentLoaded', async () => {
  const player = getCurrentPlayer();
  if (!player || !player.is_commissioner) {
    document.getElementById('adminDenied').style.display = 'block';
    return;
  }

  document.getElementById('adminPanel').style.display = 'block';
  await loadAdminDropdowns();
  setupAdminEvents();
});

async function loadAdminDropdowns() {
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('*')
    .order('sort_order');

  const selects = ['adminWeekSelect', 'resultsWeekSelect', 'viewLineupsWeek', 'earningsWeekSelect'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (el && tournaments) {
      tournaments.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `Wk ${t.week_number}: ${t.short_name}${t.is_complete ? ' ✓' : ''}${t.is_current ? ' (Live)' : ''}`;
        el.appendChild(opt);
      });
    }
  });

  // Auto-select current week for View Lineups and load it
  if (tournaments) {
    const currentWeek = tournaments.find(t => t.is_current) || tournaments.find(t => !t.is_complete);
    if (currentWeek) {
      document.getElementById('viewLineupsWeek').value = currentWeek.id;
      viewLineups();
    }
  }
}

function setupAdminEvents() {
  document.getElementById('lockPicksBtn').addEventListener('click', () => togglePicks(true));
  document.getElementById('unlockPicksBtn').addEventListener('click', () => togglePicks(false));
  document.getElementById('setCurrentBtn').addEventListener('click', setCurrentTournament);
  document.getElementById('markCompleteBtn').addEventListener('click', markComplete);
  document.getElementById('resultsWeekSelect').addEventListener('change', loadResultsEntry);
  document.getElementById('saveResultsBtn').addEventListener('click', saveResults);
  document.getElementById('recalcBtn').addEventListener('click', recalcEverything);
  document.getElementById('viewLineupsWeek').addEventListener('change', viewLineups);
  document.getElementById('sendTestSmsBtn').addEventListener('click', sendTestSms);
  document.getElementById('testSmsPhone').addEventListener('input', formatTestPhone);
  document.getElementById('pullEarningsBtn').addEventListener('click', pullEarnings);
  document.getElementById('saveEarningsBtn').addEventListener('click', saveEarnings);
  document.getElementById('showAllEarningsBtn').addEventListener('click', toggleAllEarnings);
}

async function togglePicks(locked) {
  const id = document.getElementById('adminWeekSelect').value;
  if (!id) return;
  await supabaseClient.from('tournaments').update({ picks_locked: locked }).eq('id', id);
  showMsg('tournamentMsg', `Picks ${locked ? 'locked' : 'unlocked'}.`, 'success');
}

async function setCurrentTournament() {
  const id = document.getElementById('adminWeekSelect').value;
  if (!id) return;
  await supabaseClient.from('tournaments').update({ is_current: false }).neq('id', 0);
  await supabaseClient.from('tournaments').update({ is_current: true }).eq('id', id);
  showMsg('tournamentMsg', 'Set as current tournament.', 'success');
}

async function markComplete() {
  const id = document.getElementById('adminWeekSelect').value;
  if (!id) return;
  await supabaseClient.from('tournaments').update({ is_complete: true, is_current: false, picks_locked: true }).eq('id', id);
  showMsg('tournamentMsg', 'Marked complete.', 'success');
}

async function loadResultsEntry() {
  const tournamentId = document.getElementById('resultsWeekSelect').value;
  if (!tournamentId) return;

  // Get all golfers that were picked for this tournament
  const { data: lineups } = await supabaseClient
    .from('lineups')
    .select('golfer_id, golfers(id, name, salary)')
    .eq('tournament_id', tournamentId);

  const uniqueGolfers = {};
  if (lineups) {
    lineups.forEach(l => {
      if (l.golfers) uniqueGolfers[l.golfers.id] = l.golfers;
    });
  }

  const golferList = Object.values(uniqueGolfers).sort((a, b) => b.salary - a.salary);

  // Load existing results
  const { data: existing } = await supabaseClient
    .from('results')
    .select('*')
    .eq('tournament_id', tournamentId);

  const resultMap = {};
  if (existing) existing.forEach(r => { resultMap[r.golfer_id] = r; });

  const area = document.getElementById('resultsEntryArea');
  if (golferList.length === 0) {
    area.innerHTML = '<p class="loading">No lineups submitted for this week yet.</p>';
    document.getElementById('saveResultsBtn').style.display = 'none';
    return;
  }

  area.innerHTML = `
    <div class="results-entry-grid">
      <div class="entry-header">Golfer</div>
      <div class="entry-header">Position</div>
      <div class="entry-header">Score</div>
      <div class="entry-header">Earnings ($)</div>
      ${golferList.map(g => {
        const r = resultMap[g.id] || {};
        return `
          <div><strong>${g.name}</strong> ($${g.salary})</div>
          <div><input type="text" data-golfer="${g.id}" data-field="position" value="${r.finish_position || ''}" placeholder="T5"></div>
          <div><input type="number" data-golfer="${g.id}" data-field="score" value="${r.score_to_par || 0}"></div>
          <div><input type="number" data-golfer="${g.id}" data-field="earnings" value="${r.earnings || 0}" placeholder="0"></div>`;
      }).join('')}
    </div>`;

  document.getElementById('saveResultsBtn').style.display = 'block';
}

async function saveResults() {
  const tournamentId = document.getElementById('resultsWeekSelect').value;
  if (!tournamentId) return;

  const inputs = document.querySelectorAll('#resultsEntryArea input');
  const golferData = {};

  inputs.forEach(input => {
    const gId = input.dataset.golfer;
    const field = input.dataset.field;
    if (!golferData[gId]) golferData[gId] = {};
    golferData[gId][field] = input.value;
  });

  for (const [golferId, data] of Object.entries(golferData)) {
    const earnings = parseFloat(data.earnings) || 0;
    await supabaseClient.from('results').upsert({
      tournament_id: parseInt(tournamentId),
      golfer_id: parseInt(golferId),
      finish_position: data.position || null,
      score_to_par: parseInt(data.score) || 0,
      earnings: earnings,
      made_cut: earnings > 0 || (data.position && !data.position.includes('CUT'))
    }, { onConflict: 'tournament_id,golfer_id' });
  }

  // Recalculate weekly scores for this tournament
  await recalcWeek(parseInt(tournamentId));

  showMsg('resultsMsg', 'Results saved and scores recalculated!', 'success');
}

async function recalcWeek(tournamentId) {
  const { data: players } = await supabaseClient.from('players').select('id');

  for (const player of players) {
    const { data: lineup } = await supabaseClient
      .from('lineups')
      .select('golfer_id, golfers(name, salary)')
      .eq('player_id', player.id)
      .eq('tournament_id', tournamentId);

    if (!lineup || lineup.length === 0) continue;

    let totalEarnings = 0;
    let totalSalary = 0;
    let bestGolfer = '';
    let bestEarnings = 0;

    for (const l of lineup) {
      totalSalary += l.golfers?.salary || 0;
      const { data: ge } = await supabaseClient
        .from('golfer_earnings')
        .select('earnings')
        .eq('tournament_id', tournamentId)
        .eq('golfer_id', l.golfer_id)
        .single();

      const e = parseFloat(ge?.earnings || 0);
      totalEarnings += e;
      if (e > bestEarnings) { bestEarnings = e; bestGolfer = l.golfers?.name || ''; }
    }

    await supabaseClient.from('weekly_scores').upsert({
      player_id: player.id,
      tournament_id: tournamentId,
      total_earnings: totalEarnings,
      total_salary: totalSalary,
      best_golfer: bestGolfer,
      best_golfer_earnings: bestEarnings
    }, { onConflict: 'player_id,tournament_id' });
  }

  // Update season standings
  await recalcStandings();
}

async function recalcStandings() {
  const { data: players } = await supabaseClient.from('players').select('id');

  for (const player of players) {
    const { data: scores } = await supabaseClient
      .from('weekly_scores')
      .select('total_earnings')
      .eq('player_id', player.id);

    if (!scores || scores.length === 0) continue;

    const earningsArr = scores.map(s => parseFloat(s.total_earnings || 0));
    const total = earningsArr.reduce((a, b) => a + b, 0);
    const best = Math.max(...earningsArr);
    const worst = Math.min(...earningsArr);
    const avg = total / earningsArr.length;

    // Count weekly wins
    const { data: allScores } = await supabaseClient.from('weekly_scores').select('player_id, tournament_id, total_earnings');
    const tournamentIds = [...new Set(scores.map((_, i) => i))]; // simplified
    let wins = 0;

    // Get unique tournament IDs this player participated in
    const { data: playerScores } = await supabaseClient
      .from('weekly_scores')
      .select('tournament_id, total_earnings')
      .eq('player_id', player.id);

    if (playerScores) {
      for (const ps of playerScores) {
        const { data: weekScores } = await supabaseClient
          .from('weekly_scores')
          .select('total_earnings')
          .eq('tournament_id', ps.tournament_id)
          .order('total_earnings', { ascending: false })
          .limit(1);

        if (weekScores && weekScores[0] && parseFloat(weekScores[0].total_earnings) === parseFloat(ps.total_earnings)) {
          wins++;
        }
      }
    }

    await supabaseClient.from('standings').upsert({
      player_id: player.id,
      total_earnings: total,
      weeks_played: earningsArr.length,
      weekly_wins: wins,
      best_week: best,
      worst_week: worst,
      avg_weekly: avg,
      updated_at: new Date().toISOString()
    }, { onConflict: 'player_id' });
  }
}

async function recalcEverything() {
  showMsg('recalcMsg', 'Recalculating...', 'success');

  // Clear weekly_scores and standings to rebuild fresh from golfer_earnings
  await supabaseClient.from('weekly_scores').delete().neq('id', 0);
  await supabaseClient.from('standings').delete().neq('id', 0);

  const { data: completedTournaments } = await supabaseClient
    .from('tournaments')
    .select('id')
    .eq('is_complete', true);

  if (completedTournaments) {
    for (const t of completedTournaments) {
      await recalcWeek(t.id);
    }
  }

  // Rebuild golfer usage from golfer_earnings
  const { data: players } = await supabaseClient.from('players').select('id');
  for (const player of players) {
    await supabaseClient.from('golfer_usage').delete().eq('player_id', player.id);

    const { data: lineups } = await supabaseClient
      .from('lineups')
      .select('golfer_id, tournament_id')
      .eq('player_id', player.id);

    if (!lineups) continue;

    const usage = {};
    lineups.forEach(l => {
      if (!usage[l.golfer_id]) usage[l.golfer_id] = { count: 0, tournamentIds: [] };
      usage[l.golfer_id].count++;
      usage[l.golfer_id].tournamentIds.push(l.tournament_id);
    });

    for (const [golferId, info] of Object.entries(usage)) {
      const { data: ge } = await supabaseClient
        .from('golfer_earnings')
        .select('earnings, tournament_id')
        .eq('golfer_id', parseInt(golferId));

      const pickedTIds = new Set(info.tournamentIds);
      const totalE = (ge || [])
        .filter(r => pickedTIds.has(r.tournament_id))
        .reduce((sum, r) => sum + parseFloat(r.earnings || 0), 0);

      await supabaseClient.from('golfer_usage').upsert({
        player_id: player.id,
        golfer_id: parseInt(golferId),
        times_used: info.count,
        total_earnings: totalE
      }, { onConflict: 'player_id,golfer_id' });
    }
  }

  showMsg('recalcMsg', 'Full recalculation complete!', 'success');
}

async function viewLineups() {
  const tournamentId = document.getElementById('viewLineupsWeek').value;
  if (!tournamentId) return;

  const { data: players } = await supabaseClient.from('players').select('id, name').order('name');
  const tbody = document.getElementById('adminLineupsBody');

  // Fetch all lineups for this tournament in one query
  const { data: allLineups } = await supabaseClient
    .from('lineups')
    .select('player_id, slot, golfers(name, salary)')
    .eq('tournament_id', tournamentId)
    .order('slot');

  const lineupsByPlayer = {};
  if (allLineups) {
    allLineups.forEach(l => {
      if (!lineupsByPlayer[l.player_id]) lineupsByPlayer[l.player_id] = [];
      lineupsByPlayer[l.player_id].push(l);
    });
  }

  let rows = '';

  for (const player of players) {
    const lineup = lineupsByPlayer[player.id];
    if (lineup && lineup.length > 0) {
      const salary = lineup.reduce((s, l) => s + (l.golfers?.salary || 0), 0);
      const cells = [1, 2, 3, 4, 5].map(slot => {
        const pick = lineup.find(l => l.slot === slot);
        return `<td>${pick?.golfers?.name || '-'}</td>`;
      }).join('');
      const capStatus = salary > 100 ? ' <span style="color:var(--red); font-size:0.7rem;">OVER CAP</span>' : '';
      rows += `<tr>
        <td><strong>${player.name}</strong></td>
        ${cells}
        <td>$${salary}${capStatus}</td>
        <td><span style="background:var(--augusta); color:#fff; padding:0.15rem 0.5rem; border-radius:var(--radius); font-size:0.75rem;">Submitted</span></td>
      </tr>`;
    } else {
      rows += `<tr style="background:var(--gold-light);">
        <td><strong>${player.name}</strong></td>
        <td colspan="5" style="color:var(--red); text-align:center;">No lineup submitted</td>
        <td>-</td>
        <td><span style="background:var(--red); color:#fff; padding:0.15rem 0.5rem; border-radius:var(--radius); font-size:0.75rem;">Not Submitted</span></td>
      </tr>`;
    }
  }

  const submittedCount = players.filter(p => lineupsByPlayer[p.id]?.length > 0).length;
  const missingCount = players.length - submittedCount;
  rows += `<tr style="border-top:2px solid var(--gray-400); font-weight:600;">
    <td colspan="6">${submittedCount} of ${players.length} lineups submitted</td>
    <td colspan="2" style="color:${missingCount > 0 ? 'var(--red)' : 'var(--augusta)'};">${missingCount > 0 ? missingCount + ' missing' : 'All in!'}</td>
  </tr>`;

  tbody.innerHTML = rows;
}

async function sendTestSms() {
  const raw = document.getElementById('testSmsPhone').value.replace(/\D/g, '');
  if (raw.length !== 10) {
    showMsg('smsMsg', 'Enter a valid 10-digit phone number.', 'error');
    return;
  }

  showMsg('smsMsg', 'Sending...', 'success');

  try {
    const res = await fetch('/.netlify/functions/send-test-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: '+1' + raw })
    });
    const data = await res.json();
    if (data.success) {
      showMsg('smsMsg', data.message, 'success');
    } else {
      showMsg('smsMsg', data.error || 'Failed to send SMS.', 'error');
    }
  } catch (err) {
    showMsg('smsMsg', 'Error: ' + err.message, 'error');
  }
}

function formatTestPhone(e) {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 10) val = val.slice(0, 10);
  if (val.length >= 7) val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}`;
  else if (val.length >= 4) val = `(${val.slice(0,3)}) ${val.slice(3)}`;
  else if (val.length >= 1) val = `(${val}`;
  e.target.value = val;
}

// ===== EARNINGS SCRAPER =====

let earningsData = null;
let showAllGolfers = false;
let allGolfersCache = null;
let ignoredEarningsRows = new Set();

async function pullEarnings() {
  const tournamentId = document.getElementById('earningsWeekSelect').value;
  if (!tournamentId) {
    showMsg('earningsMsg', 'Select a tournament first.', 'error');
    return;
  }

  showMsg('earningsMsg', 'Fetching earnings from ESPN... This may take 30-60 seconds.', 'success');
  document.getElementById('earningsPreview').style.display = 'none';
  document.getElementById('pullEarningsBtn').disabled = true;

  try {
    const res = await fetch('/.netlify/functions/scrape-pga-earnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament_id: parseInt(tournamentId) })
    });
    const data = await res.json();

    if (!data.success) {
      showMsg('earningsMsg', data.error || 'Failed to fetch earnings.', 'error');
      document.getElementById('pullEarningsBtn').disabled = false;
      return;
    }

    earningsData = data;
    showAllGolfers = false;
    ignoredEarningsRows = new Set();

    // Fetch all golfers for the DB Match dropdown
    if (!allGolfersCache) {
      const { data: golfers } = await supabaseClient.from('golfers').select('id, name').eq('is_active', true).order('name');
      allGolfersCache = golfers || [];
    }

    document.getElementById('earningsEventName').textContent = `(ESPN: ${data.espn_event}${data.is_complete ? ' - Final' : ' - In Progress'})`;

    renderEarningsTable();

    const picked = data.results.filter(r => r.is_picked).length;
    const lowConf = data.results.filter(r => r.is_picked && r.confidence_score < 0.8).length;
    let msg = `Found ${data.total_golfers} golfers, ${picked} picked by league members.`;
    if (lowConf > 0) msg += ` WARNING: ${lowConf} golfer(s) with low match confidence.`;
    showMsg('earningsMsg', msg, lowConf > 0 ? 'error' : 'success');

    document.getElementById('earningsPreview').style.display = 'block';
  } catch (err) {
    showMsg('earningsMsg', 'Error: ' + err.message, 'error');
  }

  document.getElementById('pullEarningsBtn').disabled = false;
}

function renderEarningsTable() {
  if (!earningsData) return;

  const filtered = showAllGolfers
    ? earningsData.results
    : earningsData.results.filter(r => r.earnings > 0 || r.espn_id);

  const golferOptions = (allGolfersCache || []).map(g => `<option value="${g.id}">${g.name}</option>`).join('');

  const tbody = document.getElementById('earningsBody');
  tbody.innerHTML = filtered.map((r, idx) => {
    const isIgnored = ignoredEarningsRows.has(r.espn_id);
    const confClass = r.confidence_score >= 0.9 ? 'success' : r.confidence_score >= 0.8 ? '' : 'error';
    const confIcon = r.confidence_score >= 0.9 ? '✓' : r.confidence_score >= 0.8 ? '~' : '⚠';
    const rowStyle = isIgnored ? ' style="opacity:0.4; text-decoration:line-through;"' : r.confidence_score < 0.8 ? ' style="background:var(--gold-light)"' : '';
    return `<tr${rowStyle} data-espn-id="${r.espn_id}">
      <td><strong>${r.espn_name}</strong></td>
      <td>${r.position || '-'}</td>
      <td>${r.score || '-'}</td>
      <td><input type="number" class="earnings-input" data-golfer-id="${r.matched_db_id || ''}" data-espn-id="${r.espn_id}" value="${r.earnings || 0}" style="width:110px; padding:0.25rem 0.4rem; border:1px solid var(--gray-300); border-radius:var(--radius); font-size:0.85rem;"${isIgnored ? ' disabled' : ''}></td>
      <td>
        <select class="db-match-select" data-espn-id="${r.espn_id}" style="width:160px; padding:0.25rem 0.4rem; border:1px solid var(--gray-300); border-radius:var(--radius); font-size:0.85rem;"${isIgnored ? ' disabled' : ''}>
          <option value="">-- No match --</option>
          ${golferOptions}
        </select>
      </td>
      <td class="${confClass}">${confIcon} ${(r.confidence_score * 100).toFixed(0)}%</td>
      <td><button class="btn btn-sm" onclick="toggleIgnoreRow('${r.espn_id}')" style="padding:0.15rem 0.5rem; font-size:0.75rem; background:${isIgnored ? 'var(--green)' : 'var(--red)'}; color:#fff; border:none; border-radius:var(--radius); cursor:pointer;">${isIgnored ? 'Restore' : 'Ignore'}</button></td>
    </tr>`;
  }).join('');

  // Set selected values for DB Match dropdowns
  filtered.forEach(r => {
    if (r.matched_db_id) {
      const select = tbody.querySelector(`select[data-espn-id="${r.espn_id}"]`);
      if (select) select.value = r.matched_db_id;
    }
  });

  // Listen for dropdown changes to update the golfer ID on the earnings input
  tbody.querySelectorAll('.db-match-select').forEach(select => {
    select.addEventListener('change', function() {
      const espnId = this.dataset.espnId;
      const input = tbody.querySelector(`.earnings-input[data-espn-id="${espnId}"]`);
      if (input) input.dataset.golferId = this.value;
    });
  });

  document.getElementById('showAllEarningsBtn').textContent = showAllGolfers ? 'Show Picked Only' : 'Show All Golfers';
}

function toggleAllEarnings() {
  showAllGolfers = !showAllGolfers;
  renderEarningsTable();
}

function toggleIgnoreRow(espnId) {
  if (ignoredEarningsRows.has(espnId)) {
    ignoredEarningsRows.delete(espnId);
  } else {
    ignoredEarningsRows.add(espnId);
  }
  renderEarningsTable();
}

async function saveEarnings() {
  const tournamentId = document.getElementById('earningsWeekSelect').value;
  if (!tournamentId) return;

  const rows = document.querySelectorAll('#earningsBody tr');
  const updates = [];

  rows.forEach(row => {
    const espnId = row.dataset.espnId;
    if (ignoredEarningsRows.has(espnId)) return;
    const input = row.querySelector('.earnings-input');
    const select = row.querySelector('.db-match-select');
    const golferId = select ? select.value : input?.dataset.golferId;
    const earnings = parseInt(input?.value) || 0;
    if (golferId && earnings >= 0) {
      const espnResult = earningsData?.results?.find(r => r.espn_id === espnId);
      updates.push({ golfer_id: parseInt(golferId), earnings, espnResult });
    }
  });

  if (updates.length === 0) {
    showMsg('saveEarningsMsg', 'No earnings to save.', 'error');
    return;
  }

  showMsg('saveEarningsMsg', 'Saving earnings...', 'success');
  document.getElementById('saveEarningsBtn').disabled = true;

  try {
    // Save to golfer_earnings table
    for (const u of updates) {
      await supabaseClient.from('golfer_earnings').upsert({
        golfer_id: u.golfer_id,
        tournament_id: parseInt(tournamentId),
        earnings: u.earnings,
        finish_position: u.espnResult?.position || null,
        score: u.espnResult?.score || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'golfer_id,tournament_id' });
    }

    // Also update the results table (existing system)
    for (const u of updates) {
      await supabaseClient.from('results').upsert({
        tournament_id: parseInt(tournamentId),
        golfer_id: u.golfer_id,
        finish_position: u.espnResult?.position || null,
        score_to_par: u.espnResult?.score ? parseScoreToPar(u.espnResult.score) : 0,
        earnings: u.earnings,
        made_cut: u.earnings > 0 || (u.espnResult?.position && u.espnResult.position !== 'CUT')
      }, { onConflict: 'tournament_id,golfer_id' });
    }

    // Recalculate weekly scores and standings
    await recalcWeek(parseInt(tournamentId));

    showMsg('saveEarningsMsg', `Saved ${updates.length} golfer earnings and recalculated standings!`, 'success');
  } catch (err) {
    showMsg('saveEarningsMsg', 'Error saving: ' + err.message, 'error');
  }

  document.getElementById('saveEarningsBtn').disabled = false;
}

function parseScoreToPar(scoreStr) {
  if (!scoreStr || scoreStr === 'E') return 0;
  const n = parseInt(scoreStr);
  return isNaN(n) ? 0 : n;
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
    el.className = `admin-msg ${type}`;
  }
}
