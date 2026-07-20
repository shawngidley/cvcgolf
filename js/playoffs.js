// CVC Fantasy Golf 2026 - Playoffs Page
// 14 players, top 6 regular-season earners (weeks 1-21) make the playoffs.
// Semifinal (weeks 22-24) earnings do NOT carry over from the regular season.
// Finals (weeks 25-27) earnings ARE cumulative across those 3 weeks; week 25's
// low earner of the 3 semifinal survivors is eliminated, the remaining 2 play
// on through weeks 26-27 and the higher cumulative Finals total wins it all.

const SEMIFINAL_WEEKS = [22, 23, 24];
const FINALS_WEEKS = [25, 26, 27];
const PLAYOFF_FIELD_SIZE = 6;
const REG_SEASON_BONUS_CAP = 400000;

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayoffs();
});

async function loadPlayoffs() {
  const now = new Date();
  const started = t => t.is_complete || t.picks_locked || (t.first_tee_time && new Date(t.first_tee_time) <= now);

  const { data: players } = await supabaseClient.from('players').select('id, name').neq('is_guest', true).order('name');
  const { data: tournaments } = await supabaseClient
    .from('tournaments')
    .select('id, week_number, name, short_name, is_complete, picks_locked, first_tee_time')
    .order('week_number');

  if (!players || !tournaments) return;

  const regSeasonT = tournaments.filter(t => t.week_number <= 21);
  const regStartedT = regSeasonT.filter(started);
  const semiT = tournaments.filter(t => SEMIFINAL_WEEKS.includes(t.week_number)).sort((a, b) => a.week_number - b.week_number);
  const finalsT = tournaments.filter(t => FINALS_WEEKS.includes(t.week_number)).sort((a, b) => a.week_number - b.week_number);

  const relevantIds = [...regStartedT, ...semiT, ...finalsT].map(t => t.id);

  // weekly_scores holds each player's fantasy $ earnings per tournament;
  // paginate since Supabase caps a single select at 1000 rows.
  let scores = [];
  for (let from = 0; ; from += 1000) {
    const { data: batch } = await supabaseClient
      .from('weekly_scores')
      .select('player_id, tournament_id, total_earnings')
      .in('tournament_id', relevantIds)
      .range(from, from + 999);
    if (!batch || batch.length === 0) break;
    scores = scores.concat(batch);
    if (batch.length < 1000) break;
  }
  const scoreMap = {};
  scores.forEach(s => { scoreMap[`${s.player_id}-${s.tournament_id}`] = parseFloat(s.total_earnings || 0); });

  // Optional: admin-recorded tiebreaker golfer earnings per player/round.
  // Table may not exist yet (created via supabase/add-playoff-tables.sql) -
  // an empty/missing result just means no tiebreakers are on record.
  const { data: playoffResults } = await supabaseClient
    .from('playoff_results')
    .select('player_id, round, tiebreaker_earnings');
  const tiebreakerMap = {};
  (playoffResults || []).forEach(r => {
    tiebreakerMap[`${r.player_id}-${r.round}`] = parseFloat(r.tiebreaker_earnings || 0);
  });
  const tiebreakerFor = (playerId, rounds) =>
    rounds.reduce((sum, round) => sum + (tiebreakerMap[`${playerId}-${round}`] || 0), 0);

  // ----- Regular season standings (all 14 players, weeks 1-21) -----
  const regStandings = players.map(p => {
    const total = regStartedT.reduce((sum, t) => sum + (scoreMap[`${p.id}-${t.id}`] || 0), 0);
    return { player_id: p.id, name: p.name, total };
  }).sort((a, b) => b.total - a.total);

  renderBonusTracker(regStandings);

  const weeksRemaining = regSeasonT.length - regStartedT.length;
  const semifinalStarted = semiT.some(started);
  renderProjectedField(regStandings, weeksRemaining, semifinalStarted);

  // ----- Determine stage -----
  const semiComplete = semiT.length === SEMIFINAL_WEEKS.length && semiT.every(t => t.is_complete);
  let stage = 'pre-playoffs';
  if (semifinalStarted) stage = 'semifinal';

  // ----- Semifinal field: top 6 of regular season, with the #1 seed's bonus -----
  const semifinalists = regStandings.slice(0, PLAYOFF_FIELD_SIZE);
  const bonus = regSeasonBonus(regStandings);

  let semiResults = null;
  if (semifinalStarted) {
    semiResults = semifinalists.map(sf => {
      const weekTotals = semiT.map(t => started(t) ? (scoreMap[`${sf.player_id}-${t.id}`] || 0) : null);
      let total = weekTotals.reduce((sum, v) => sum + (v || 0), 0);
      const isSeed1 = sf.player_id === regStandings[0]?.player_id && bonus > 0;
      if (isSeed1) total += bonus;
      return {
        player_id: sf.player_id, name: sf.name, weekTotals, total,
        seedBonus: isSeed1 ? bonus : 0,
        tiebreaker: tiebreakerFor(sf.player_id, ['semifinal'])
      };
    });
    semiResults.sort((a, b) => (b.total - a.total) || (b.tiebreaker - a.tiebreaker));
    semiResults.forEach((r, i) => {
      r.status = semiComplete ? (i < 3 ? 'ADVANCED' : 'ELIMINATED') : 'IN PROGRESS';
    });
  }
  renderRoundTable('semifinalBody', semiT, semiResults, 8, 'The Semifinal round has not started yet.');

  // ----- Finals field: top 3 of the completed semifinal -----
  const finalists = (semiComplete && semiResults) ? semiResults.slice(0, 3).map(r => ({ player_id: r.player_id, name: r.name })) : [];
  const finalsStarted = finalsT.some(started);
  if (finalsStarted) stage = 'finals';

  let finalsResults = null;
  if (finalists.length === 3 && finalsStarted) {
    const [week25, week26, week27] = finalsT;

    finalsResults = finalists.map(f => ({
      player_id: f.player_id,
      name: f.name,
      wk1: week25 && started(week25) ? (scoreMap[`${f.player_id}-${week25.id}`] || 0) : null,
      wk2: null,
      wk3: null,
      total: 0,
      eliminated: false
    }));

    if (week25 && week25.is_complete) {
      const byWeek1 = [...finalsResults].sort((a, b) =>
        (a.wk1 - b.wk1) || (tiebreakerFor(a.player_id, ['finals_w1']) - tiebreakerFor(b.player_id, ['finals_w1']))
      );
      const lowest = byWeek1[0];
      finalsResults.forEach(f => { f.eliminated = f.player_id === lowest.player_id; });
    }

    finalsResults.forEach(f => {
      if (f.eliminated) { f.total = f.wk1 || 0; return; }
      f.wk2 = week26 && started(week26) ? (scoreMap[`${f.player_id}-${week26.id}`] || 0) : null;
      f.wk3 = week27 && started(week27) ? (scoreMap[`${f.player_id}-${week27.id}`] || 0) : null;
      f.total = (f.wk1 || 0) + (f.wk2 || 0) + (f.wk3 || 0);
      f.tiebreaker = tiebreakerFor(f.player_id, ['finals_w1', 'finals_w2', 'finals_w3']);
    });

    const active = finalsResults.filter(f => !f.eliminated);
    active.sort((a, b) => (b.total - a.total) || ((b.tiebreaker || 0) - (a.tiebreaker || 0)));
    const week27Complete = week27 && week27.is_complete;

    finalsResults.sort((a, b) => {
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      return (b.total - a.total) || ((b.tiebreaker || 0) - (a.tiebreaker || 0));
    });
    finalsResults.forEach(f => {
      if (f.eliminated) { f.status = 'ELIMINATED'; return; }
      if (week27Complete) {
        f.status = active[0] && f.player_id === active[0].player_id ? 'WINNER' : 'RUNNER-UP';
      } else {
        f.status = 'IN PROGRESS';
      }
    });
  }
  renderRoundTable('finalsBody', finalsT, finalsResults, 8, 'The Finals round has not started yet.');

  renderBracket(stage, semifinalists, semiResults, finalists, finalsResults);

  const subtitleMap = {
    'pre-playoffs': `Regular season in progress — ${weeksRemaining} week${weeksRemaining === 1 ? '' : 's'} remaining before the playoff field is set`,
    semifinal: semiComplete ? 'Semifinal complete — top 3 advance to the Finals' : 'Semifinal round in progress (Weeks 22-24)',
    finals: 'Finals round in progress (Weeks 25-27)'
  };
  document.getElementById('playoffSubtitle').textContent = subtitleMap[stage];
}

function regSeasonBonus(regStandings) {
  if (regStandings.length < 2) return 0;
  const diff = regStandings[0].total - regStandings[1].total;
  return Math.max(0, Math.min(REG_SEASON_BONUS_CAP, diff));
}

function renderBonusTracker(regStandings) {
  const grid = document.getElementById('bonusTrackerGrid');
  if (regStandings.length < 2) {
    grid.innerHTML = '<div class="bonus-stat"><div class="bonus-stat-label">No standings data yet</div></div>';
    return;
  }
  const leader = regStandings[0];
  const second = regStandings[1];
  const diff = leader.total - second.total;
  const bonus = regSeasonBonus(regStandings);

  grid.innerHTML = `
    <div class="bonus-stat">
      <div class="bonus-stat-label">#1 &mdash; ${leader.name}</div>
      <div class="bonus-stat-value">${formatCurrency(leader.total)}</div>
    </div>
    <div class="bonus-stat">
      <div class="bonus-stat-label">#2 &mdash; ${second.name}</div>
      <div class="bonus-stat-value">${formatCurrency(second.total)}</div>
    </div>
    <div class="bonus-stat">
      <div class="bonus-stat-label">Current Lead</div>
      <div class="bonus-stat-value">${formatCurrency(diff)}</div>
    </div>
    <div class="bonus-stat">
      <div class="bonus-stat-label">Current Bonus (capped at $400,000)</div>
      <div class="bonus-stat-value gold">${formatCurrency(bonus)}</div>
    </div>
  `;
}

function renderProjectedField(regStandings, weeksRemaining, isLocked) {
  document.getElementById('fieldCardTitle').textContent = isLocked ? 'Playoff Field' : 'Projected Playoff Field';
  const seventh = regStandings[PLAYOFF_FIELD_SIZE];
  const subtitle = isLocked
    ? 'Field is locked in for the Semifinal round.'
    : seventh
      ? `Currently ${formatCurrency(regStandings[PLAYOFF_FIELD_SIZE - 1].total - seventh.total)} separates 6th from 7th place. ${weeksRemaining} week${weeksRemaining === 1 ? '' : 's'} remain in the regular season.`
      : '';
  document.getElementById('fieldCardSubtitle').textContent = subtitle;

  const tbody = document.getElementById('fieldBody');
  if (regStandings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="loading">No standings data yet.</td></tr>';
    return;
  }

  const rows = regStandings.map((s, i) => `
    <tr>
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td class="currency">${formatCurrency(s.total)}</td>
    </tr>
  `);
  if (regStandings.length > PLAYOFF_FIELD_SIZE) {
    rows.splice(PLAYOFF_FIELD_SIZE, 0, `
      <tr class="cutline-row"><td colspan="3">── PLAYOFF CUTLINE ──</td></tr>
    `);
  }
  tbody.innerHTML = rows.join('');
}

function statusPill(status) {
  const map = {
    'ADVANCED': 'status-advanced',
    'WINNER': 'status-winner',
    'ELIMINATED': 'status-eliminated',
    'RUNNER-UP': 'status-advanced',
    'IN PROGRESS': 'status-progress'
  };
  return `<span class="playoff-status-pill ${map[status] || 'status-progress'}">${status}</span>`;
}

function renderRoundTable(bodyId, roundTournaments, results, colspan, emptyMessage) {
  const tbody = document.getElementById(bodyId);
  if (!results) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="loading">${emptyMessage}</td></tr>`;
    return;
  }

  tbody.innerHTML = results.map((r, i) => {
    const weeks = r.weekTotals || [r.wk1, r.wk2, r.wk3];
    const weekCells = [0, 1, 2].map(idx => {
      const v = weeks[idx];
      return `<td class="currency">${v === null || v === undefined ? '-' : formatCurrency(v)}</td>`;
    }).join('');
    const rowClass = r.status === 'ADVANCED' || r.status === 'WINNER' || r.status === 'RUNNER-UP' ? 'row-advanced'
      : r.status === 'ELIMINATED' ? 'row-eliminated' : '';
    const bonusNote = r.seedBonus ? ` <span class="bracket-slot-earnings">(incl. ${formatCurrency(r.seedBonus)} seed bonus)</span>` : '';
    return `
      <tr class="${rowClass}">
        <td class="rank-cell">${i + 1}</td>
        <td><strong>${r.name}</strong>${bonusNote}</td>
        ${weekCells}
        <td class="currency"><strong>${formatCurrency(r.total)}</strong></td>
        <td class="currency">${r.tiebreaker ? formatCurrency(r.tiebreaker) : '-'}</td>
        <td style="text-align:center">${statusPill(r.status)}</td>
      </tr>
    `;
  }).join('');
}

function renderBracket(stage, semifinalists, semiResults, finalists, finalsResults) {
  const bracket = document.getElementById('playoffBracket');

  const semiSlots = (semiResults || semifinalists.map(s => ({ ...s, status: null }))).map(s => {
    const cls = s.status === 'ADVANCED' ? 'advanced' : s.status === 'ELIMINATED' ? 'eliminated' : semiResults ? '' : 'projected';
    return `
      <div class="bracket-slot ${cls}">
        <div class="bracket-slot-name">${s.name}</div>
        <div class="bracket-slot-earnings">${formatCurrency(s.total)}${semiResults ? '' : ' (projected)'}</div>
      </div>`;
  }).join('');

  const finalsW1Slots = finalists.length === 3
    ? (finalsResults || finalists.map(f => ({ ...f }))).map(f => {
        const cls = f.status === 'ELIMINATED' ? 'eliminated' : (f.status ? 'advanced' : '');
        const earnings = f.total !== undefined ? formatCurrency(f.total) : 'TBD';
        return `<div class="bracket-slot ${cls}"><div class="bracket-slot-name">${f.name}</div><div class="bracket-slot-earnings">${earnings}</div></div>`;
      }).join('')
    : '<div class="bracket-slot tbd">TBD</div>';

  let championSlot = '<div class="bracket-slot tbd">TBD</div>';
  if (finalsResults) {
    const champion = finalsResults.find(f => f.status === 'WINNER');
    const runnerUp = finalsResults.find(f => f.status === 'RUNNER-UP');
    if (champion) {
      championSlot = `<div class="bracket-slot champion"><div class="bracket-slot-name">🏆 ${champion.name}</div><div class="bracket-slot-earnings">${formatCurrency(champion.total)}</div></div>`;
    } else {
      const active = finalsResults.filter(f => !f.eliminated);
      championSlot = active.map(f => `<div class="bracket-slot advanced"><div class="bracket-slot-name">${f.name}</div><div class="bracket-slot-earnings">${formatCurrency(f.total)}</div></div>`).join('');
    }
    if (!champion && runnerUp) {
      championSlot += `<div class="bracket-slot eliminated"><div class="bracket-slot-name">${runnerUp.name}</div><div class="bracket-slot-earnings">${formatCurrency(runnerUp.total)}</div></div>`;
    }
  }

  bracket.innerHTML = `
    <div class="bracket-round">
      <div class="bracket-round-title">Semifinal (6)</div>
      <div class="bracket-slots">${semiSlots}</div>
    </div>
    <div class="bracket-round">
      <div class="bracket-round-title">Finals Wk1 (3)</div>
      <div class="bracket-slots">${finalsW1Slots}</div>
    </div>
    <div class="bracket-round">
      <div class="bracket-round-title">Champion (2 &rarr; 1)</div>
      <div class="bracket-slots">${championSlot}</div>
    </div>
  `;
}
