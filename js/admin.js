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

  const selects = ['adminWeekSelect', 'resultsWeekSelect', 'viewLineupsWeek'];
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
      const { data: result } = await supabaseClient
        .from('results')
        .select('earnings')
        .eq('tournament_id', tournamentId)
        .eq('golfer_id', l.golfer_id)
        .single();

      const e = parseFloat(result?.earnings || 0);
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

  const { data: completedTournaments } = await supabaseClient
    .from('tournaments')
    .select('id')
    .eq('is_complete', true);

  if (completedTournaments) {
    for (const t of completedTournaments) {
      await recalcWeek(t.id);
    }
  }

  // Rebuild golfer usage
  const { data: players } = await supabaseClient.from('players').select('id');
  for (const player of players) {
    // Delete existing usage
    await supabaseClient.from('golfer_usage').delete().eq('player_id', player.id);

    const { data: lineups } = await supabaseClient
      .from('lineups')
      .select('golfer_id')
      .eq('player_id', player.id);

    if (!lineups) continue;

    const usage = {};
    lineups.forEach(l => { usage[l.golfer_id] = (usage[l.golfer_id] || 0) + 1; });

    for (const [golferId, count] of Object.entries(usage)) {
      const { data: results } = await supabaseClient
        .from('results')
        .select('earnings, tournament_id')
        .eq('golfer_id', parseInt(golferId));

      // Only count earnings from tournaments this player actually picked this golfer
      const { data: pickedTournaments } = await supabaseClient
        .from('lineups')
        .select('tournament_id')
        .eq('player_id', player.id)
        .eq('golfer_id', parseInt(golferId));

      const pickedTIds = new Set(pickedTournaments?.map(pt => pt.tournament_id) || []);
      const totalE = (results || [])
        .filter(r => pickedTIds.has(r.tournament_id))
        .reduce((sum, r) => sum + parseFloat(r.earnings || 0), 0);

      await supabaseClient.from('golfer_usage').upsert({
        player_id: player.id,
        golfer_id: parseInt(golferId),
        times_used: count,
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

  let rows = '';
  for (const player of players) {
    const { data: lineup } = await supabaseClient
      .from('lineups')
      .select('slot, golfers(name, salary)')
      .eq('player_id', player.id)
      .eq('tournament_id', tournamentId)
      .order('slot');

    if (!lineup || lineup.length === 0) {
      rows += `<tr><td>${player.name}</td><td colspan="5">-</td><td>-</td><td class="lineup-msg error">No lineup</td></tr>`;
    } else {
      const salary = lineup.reduce((s, l) => s + (l.golfers?.salary || 0), 0);
      const cells = [1, 2, 3, 4, 5].map(slot => {
        const pick = lineup.find(l => l.slot === slot);
        return `<td>${pick?.golfers?.name || '-'}</td>`;
      }).join('');
      const status = salary > 100 ? '<span style="color:var(--red)">OVER CAP</span>' : '<span style="color:var(--augusta)">OK</span>';
      rows += `<tr><td><strong>${player.name}</strong></td>${cells}<td>$${salary}</td><td>${status}</td></tr>`;
    }
  }

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

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
    el.className = `admin-msg ${type}`;
  }
}
