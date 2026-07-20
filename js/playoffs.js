// CVC Fantasy Golf 2026 - Playoffs Page
//
// Semifinal (weeks 22-24): all 6 qualifiers start at $0, EXCEPT the regular
// season #1 seed, who starts with a one-time bonus (lesser of $400,000 or
// their lead over 2nd place in the final regular-season standings). That
// bonus is applied once - folded into their Week 1 number - not re-applied
// each week. Top 3 combined (bonus + 3 weeks) earners advance to the Finals.
//
// Finals (weeks 25-27) run as TWO separate scoring periods:
//   1. Week 25 alone decides who's eliminated (lowest of the 3 finalists).
//   2. Weeks 26+27 combined decide the champion between the 2 survivors -
//      Week 25 earnings do NOT carry into the championship total.

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
  const [week25, week26, week27] = finalsT;

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

  const semifinalStarted = semiT.some(started);

  // ----- Semifinal field: top 6 of regular season -----
  const semifinalists = regStandings.slice(0, PLAYOFF_FIELD_SIZE);
  const seed1Id = regStandings[0]?.player_id;
  const seed1Bonus = regSeasonBonus(regStandings);

  const semiComplete = semiT.length === SEMIFINAL_WEEKS.length && semiT.every(t => t.is_complete);

  // Built unconditionally (even before Week 22 starts) so the #1 seed's
  // bonus shows as their pre-populated Week 1 / starting total right away.
  const semiResults = semifinalists.map(sf => {
    const weekTotals = semiT.map(t => started(t) ? (scoreMap[`${sf.player_id}-${t.id}`] || 0) : null);
    const isSeed1 = sf.player_id === seed1Id && seed1Bonus > 0;
    // The starting bonus is applied once, folded into Week 1 - it is never
    // re-added for Week 2 or Week 3.
    if (isSeed1) weekTotals[0] = (weekTotals[0] || 0) + seed1Bonus;
    const total = weekTotals.reduce((sum, v) => sum + (v || 0), 0);
    return {
      player_id: sf.player_id, name: sf.name, weekTotals, total,
      seedBonus: isSeed1 ? seed1Bonus : 0,
      tiebreaker: tiebreakerFor(sf.player_id, ['semifinal'])
    };
  });
  semiResults.sort((a, b) => (b.total - a.total) || (b.tiebreaker - a.tiebreaker));
  semiResults.forEach((r, i) => {
    r.status = semiComplete ? (i < 3 ? 'ADVANCED' : 'ELIMINATED') : (semifinalStarted ? 'IN PROGRESS' : 'PENDING');
  });
  renderSemifinalTable(semiResults);

  // ----- Finals field: top 3 of the completed semifinal -----
  const finalists = semiComplete ? semiResults.slice(0, 3).map(r => ({ player_id: r.player_id, name: r.name })) : [];

  // Phase 1: Week 25 alone decides who's eliminated.
  let elimResults = null;
  if (finalists.length === 3 && week25 && started(week25)) {
    elimResults = finalists.map(f => ({
      player_id: f.player_id,
      name: f.name,
      wk1: scoreMap[`${f.player_id}-${week25.id}`] || 0,
      tiebreaker: tiebreakerFor(f.player_id, ['finals_w1'])
    }));
    elimResults.sort((a, b) => (b.wk1 - a.wk1) || (b.tiebreaker - a.tiebreaker));
    if (week25.is_complete) {
      elimResults.forEach((r, i) => { r.status = i < 2 ? 'ADVANCED' : 'ELIMINATED'; });
    } else {
      elimResults.forEach(r => { r.status = 'IN PROGRESS'; });
    }
  }
  renderEliminationTable(elimResults);

  // Phase 2: Weeks 26+27 combined decide the champion between the 2 survivors.
  const week25Complete = week25 && week25.is_complete;
  const survivors = week25Complete && elimResults ? elimResults.filter(r => r.status !== 'ELIMINATED') : [];

  let champResults = null;
  if (survivors.length === 2 && ((week26 && started(week26)) || (week27 && started(week27)))) {
    champResults = survivors.map(s => {
      const wk2 = week26 && started(week26) ? (scoreMap[`${s.player_id}-${week26.id}`] || 0) : null;
      const wk3 = week27 && started(week27) ? (scoreMap[`${s.player_id}-${week27.id}`] || 0) : null;
      const total = (wk2 || 0) + (wk3 || 0);
      return {
        player_id: s.player_id, name: s.name, wk2, wk3, total,
        tiebreaker: tiebreakerFor(s.player_id, ['finals_w2', 'finals_w3'])
      };
    });
    champResults.sort((a, b) => (b.total - a.total) || (b.tiebreaker - a.tiebreaker));
    const week27Complete = week27 && week27.is_complete;
    champResults.forEach((r, i) => {
      r.status = week27Complete ? (i === 0 ? 'WINNER' : 'RUNNER-UP') : 'IN PROGRESS';
    });
  }
  renderChampionshipTable(champResults);

  renderBracket(semiResults, finalists, elimResults, champResults);

  let stage = 'pre-playoffs';
  if (semifinalStarted) stage = 'semifinal';
  if (elimResults) stage = 'finals-elimination';
  if (champResults) stage = 'finals-championship';

  const champion = champResults && champResults.find(r => r.status === 'WINNER');
  const subtitleMap = {
    'pre-playoffs': '',
    semifinal: semiComplete ? 'Semifinal complete — top 3 advance to the Finals' : 'Semifinal round in progress (Weeks 22-24)',
    'finals-elimination': 'Finals — Elimination Round in progress (Week 25)',
    'finals-championship': champion ? `${champion.name} wins the 2026 Championship!` : 'Finals — Championship round in progress (Weeks 26-27)'
  };
  document.getElementById('playoffSubtitle').textContent = subtitleMap[stage];
}

function regSeasonBonus(regStandings) {
  if (regStandings.length < 2) return 0;
  const diff = regStandings[0].total - regStandings[1].total;
  return Math.max(0, Math.min(REG_SEASON_BONUS_CAP, diff));
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

function rowClassFor(status) {
  if (status === 'ADVANCED' || status === 'WINNER' || status === 'RUNNER-UP') return 'row-advanced';
  if (status === 'ELIMINATED') return 'row-eliminated';
  return '';
}

function renderSemifinalTable(results) {
  const tbody = document.getElementById('semifinalBody');
  if (!results) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Semifinal round has not started yet.</td></tr>';
    return;
  }

  tbody.innerHTML = results.map((r, i) => {
    const weekCells = [0, 1, 2].map(idx => {
      const v = r.weekTotals[idx];
      return `<td class="currency">${v === null || v === undefined ? '-' : formatCurrency(v)}</td>`;
    }).join('');
    const bonusNote = r.seedBonus ? ` <span class="bracket-slot-earnings">(Wk1 incl. ${formatCurrency(r.seedBonus)} seed bonus)</span>` : '';
    return `
      <tr class="${rowClassFor(r.status)}">
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

function renderEliminationTable(results) {
  const tbody = document.getElementById('finalsEliminationBody');
  if (!results) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Finals Week 1 has not started yet.</td></tr>';
    return;
  }
  tbody.innerHTML = results.map((r, i) => `
    <tr class="${rowClassFor(r.status)}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${r.name}</strong></td>
      <td class="currency"><strong>${formatCurrency(r.wk1)}</strong></td>
      <td class="currency">${r.tiebreaker ? formatCurrency(r.tiebreaker) : '-'}</td>
      <td style="text-align:center">${statusPill(r.status)}</td>
    </tr>
  `).join('');
}

function renderChampionshipTable(results) {
  const tbody = document.getElementById('finalsChampionshipBody');
  if (!results) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Championship round has not started yet.</td></tr>';
    return;
  }
  tbody.innerHTML = results.map((r, i) => `
    <tr class="${rowClassFor(r.status)}">
      <td class="rank-cell">${i + 1}</td>
      <td><strong>${r.name}</strong></td>
      <td class="currency">${r.wk2 === null ? '-' : formatCurrency(r.wk2)}</td>
      <td class="currency">${r.wk3 === null ? '-' : formatCurrency(r.wk3)}</td>
      <td class="currency"><strong>${formatCurrency(r.total)}</strong></td>
      <td class="currency">${r.tiebreaker ? formatCurrency(r.tiebreaker) : '-'}</td>
      <td style="text-align:center">${statusPill(r.status)}</td>
    </tr>
  `).join('');
}

function renderBracket(semiResults, finalists, elimResults, champResults) {
  const bracket = document.getElementById('playoffBracket');

  // Each participant's card shows just their name - except the #1 seed,
  // who shows their one-time starting bonus in gold. No other earnings
  // are shown here; the Semifinal Standings table below has the detail.
  const semiSlots = semiResults.map(s => {
    const cls = s.status === 'ADVANCED' ? 'advanced' : s.status === 'ELIMINATED' ? 'eliminated' : s.status === 'PENDING' ? 'projected' : '';
    const bonusLine = s.seedBonus ? `<div class="bracket-slot-bonus">Bonus: ${formatCurrency(s.seedBonus)}</div>` : '';
    return `
      <div class="bracket-slot ${cls}">
        <div class="bracket-slot-name">${s.name}</div>
        ${bonusLine}
      </div>`;
  }).join('');

  const elimSlots = finalists.length === 3
    ? (elimResults || finalists.map(f => ({ ...f }))).map(f => {
        const cls = f.status === 'ELIMINATED' ? 'eliminated' : (f.status ? 'advanced' : '');
        const earnings = f.wk1 !== undefined ? formatCurrency(f.wk1) : 'TBD';
        return `<div class="bracket-slot ${cls}"><div class="bracket-slot-name">${f.name}</div><div class="bracket-slot-earnings">${earnings}</div></div>`;
      }).join('')
    : '<div class="bracket-slot tbd">TBD</div>';

  let championSlot = '<div class="bracket-slot tbd">TBD</div>';
  if (champResults) {
    const champion = champResults.find(r => r.status === 'WINNER');
    const runnerUp = champResults.find(r => r.status === 'RUNNER-UP');
    if (champion) {
      championSlot = `<div class="bracket-slot champion"><div class="bracket-slot-name">🏆 ${champion.name}</div><div class="bracket-slot-earnings">${formatCurrency(champion.total)}</div></div>`;
      if (runnerUp) {
        championSlot += `<div class="bracket-slot eliminated"><div class="bracket-slot-name">${runnerUp.name}</div><div class="bracket-slot-earnings">${formatCurrency(runnerUp.total)}</div></div>`;
      }
    } else {
      championSlot = champResults.map(r => `<div class="bracket-slot advanced"><div class="bracket-slot-name">${r.name}</div><div class="bracket-slot-earnings">${formatCurrency(r.total)}</div></div>`).join('');
    }
  }

  bracket.innerHTML = `
    <div class="bracket-round">
      <div class="bracket-round-title">Semifinal (6)</div>
      <div class="bracket-slots">${semiSlots}</div>
    </div>
    <div class="bracket-round">
      <div class="bracket-round-title">Elimination Rd &mdash; Wk25 (3)</div>
      <div class="bracket-slots">${elimSlots}</div>
    </div>
    <div class="bracket-round">
      <div class="bracket-round-title">Champion &mdash; Wk26+27 (2 &rarr; 1)</div>
      <div class="bracket-slots">${championSlot}</div>
    </div>
  `;
}
