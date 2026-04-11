// CVC Fantasy Golf 2026 - Live Scoring Page

let liveData = null;
let refreshInterval = null;
let countdownInterval = null;
let nextRefreshAt = null;
const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

document.addEventListener('DOMContentLoaded', () => {
  fetchLiveScores();
  document.getElementById('refreshBtn').addEventListener('click', fetchLiveScores);
});

async function fetchLiveScores() {
  document.getElementById('refreshBtn').disabled = true;

  try {
    const res = await fetch('/.netlify/functions/get-live-scores');
    const data = await res.json();

    if (!data.success) {
      document.getElementById('liveContent').style.display = 'none';
      document.getElementById('noLiveData').style.display = 'block';
      document.getElementById('refreshBtn').disabled = false;
      return;
    }

    liveData = data;
    renderLiveScores();
    document.getElementById('liveContent').style.display = 'block';
    document.getElementById('noLiveData').style.display = 'none';
    scheduleRefresh();
  } catch (err) {
    // silently handle errors
  }

  document.getElementById('refreshBtn').disabled = false;
}

function renderLiveScores() {
  const d = liveData;

  // Header
  const badge = d.is_in_progress
    ? '<span class="live-badge live-badge-active"><span class="live-dot"></span> LIVE</span>'
    : d.is_complete
      ? '<span class="live-badge live-badge-final">FINAL</span>'
      : '<span class="live-badge live-badge-pre">UPCOMING</span>';

  document.getElementById('liveTournament').innerHTML = `${d.tournament.name} ${badge}`;
  document.getElementById('liveRound').textContent = d.round_display || '';
  document.getElementById('liveUpdated').textContent = `Updated ${new Date(d.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

  // Detect duplicate last names for first initial
  const lastNameCount = {};
  d.standings.forEach(o => {
    const last = o.name.split(' ').pop();
    lastNameCount[last] = (lastNameCount[last] || 0) + 1;
  });

  // Desktop table
  const currentPlayer = getCurrentPlayer();
  const tbody = document.getElementById('liveBody');
  tbody.innerHTML = d.standings.map((o, i) => {
    const isMe = currentPlayer && o.player_id === currentPlayer.id;
    const rankClass = i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
    const lastName = o.name.split(' ').pop();
    const displayName = lastNameCount[lastName] > 1 ? `${o.name.charAt(0)}. ${lastName}` : lastName;

    const golferCells = [1, 2, 3, 4, 5].map(slot => {
      const g = o.golfers.find(g => g.slot === slot);
      if (!g) return '<td class="live-golfer-cell">-</td>';
      const scoreClass = getScoreClass(g.scoreToPar);
      const cutClass = g.isCut || g.isWD ? ' live-cut' : '';
      const gLastName = g.name.split(' ').pop();
      // Thru / tee time display
      let thruDisplay = '';
      if (g.isCut || g.isWD) {
        thruDisplay = '';
      } else if (g.thru === '18' || g.thru === 'F' || g.thru === 'Finished') {
        thruDisplay = '<div class="live-golfer-thru">F</div>';
      } else {
        const thruNum = parseInt(g.thru);
        if (!isNaN(thruNum) && thruNum > 0 && thruNum < 18) {
          thruDisplay = `<div class="live-golfer-thru">Thru ${thruNum}</div>`;
        } else if (g.teeTime && g.teeTime !== '-' && g.teeTime !== 'undefined') {
          thruDisplay = `<div class="live-golfer-thru">${g.teeTime}</div>`;
        }
      }
      const earningsDisplay = g.earnings > 0 ? `<div class="live-golfer-earnings">${formatCurrency(g.earnings)}</div>` : '';
      const todayDisplay = g.today && g.today !== '-' ? `<span class="live-golfer-today">(${g.today})</span>` : '';
      return `<td class="live-golfer-cell${cutClass}">
        <div class="live-golfer-name">${gLastName}</div>
        <div class="live-golfer-score ${scoreClass}">${g.scoreToPar} ${todayDisplay}</div>
        <div class="live-golfer-pos">${g.position}</div>
        ${thruDisplay}
        ${earningsDisplay}
      </td>`;
    }).join('');

    return `<tr class="${isMe ? 'live-my-row' : ''} ${rankClass}">
      <td class="live-rank">${o.rank}</td>
      <td class="live-owner"><strong>${displayName}</strong></td>
      ${golferCells}
      <td class="live-total-cell">${formatCurrency(o.liveTotal)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" class="loading">No lineups submitted</td></tr>';

  // Mobile cards
  const mobileEl = document.getElementById('liveMobileCards');
  mobileEl.innerHTML = d.standings.map((o, i) => {
    const isMe = currentPlayer && o.player_id === currentPlayer.id;
    const rankClass = i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
    const lastName = o.name.split(' ').pop();
    const displayName = lastNameCount[lastName] > 1 ? `${o.name.charAt(0)}. ${lastName}` : lastName;

    const golferRows = o.golfers.map(g => {
      const scoreClass = getScoreClass(g.scoreToPar);
      const cutClass = g.isCut || g.isWD ? ' live-cut' : '';
      const gLastName = g.name.split(' ').pop();

      // Third column: tee time, thru holes, F, or CUT
      let thruDisplay = '-';
      if (g.isCut) {
        thruDisplay = '-';
      } else if (g.isWD) {
        thruDisplay = '<span style="color:var(--red);">WD</span>';
      } else if (g.thru === '18' || g.thru === 'F' || g.thru === 'Finished') {
        thruDisplay = 'F';
      } else {
        const thruNum = parseInt(g.thru);
        if (!isNaN(thruNum) && thruNum > 0 && thruNum < 18) {
          thruDisplay = `Thru ${thruNum}`;
        } else if (g.teeTime && g.teeTime !== '-' && g.teeTime !== 'undefined') {
          // Not started yet — show tee time from shortDetail
          thruDisplay = g.teeTime;
        } else if (g.thru && g.thru !== '-' && g.thru !== '0' && g.thru !== 'undefined') {
          thruDisplay = g.thru;
        }
      }

      return `<div class="live-mobile-golfer${cutClass}">
        <span class="live-mobile-gname">${gLastName}</span>
        <span class="live-mobile-gscore ${scoreClass}">${g.scoreToPar}${g.today && g.today !== '-' ? ` <span class="live-mobile-gtoday">(${g.today})</span>` : ''}</span>
        <span class="live-mobile-gpos">${g.position}</span>
        <span class="live-mobile-gthru">${thruDisplay}</span>
        <span class="live-mobile-gearnings">${formatCurrency(g.earnings)}</span>
      </div>`;
    }).join('');

    return `<div class="live-mobile-card ${isMe ? 'live-my-row' : ''} ${rankClass}" onclick="this.classList.toggle('expanded')">
      <div class="live-mobile-header">
        <span class="live-mobile-rank">${o.rank}</span>
        <span class="live-mobile-name"><strong>${displayName}</strong></span>
        <span class="live-mobile-total">${formatCurrency(o.liveTotal)}</span>
      </div>
      <div class="live-mobile-detail">${golferRows}</div>
    </div>`;
  }).join('');
}

function getScoreClass(score) {
  if (!score || score === '-') return '';
  if (score === 'E') return 'score-even';
  const num = parseInt(score);
  if (isNaN(num)) return '';
  if (num < 0) return 'score-under';
  if (num > 0) return 'score-over';
  return 'score-even';
}

function scheduleRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  if (countdownInterval) clearInterval(countdownInterval);

  // Check if within tournament hours (7am-8pm ET, Thu-Sun)
  const now = new Date();
  const etStr = now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false });
  const etHour = parseInt(etStr);
  const day = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })).getDay();
  const isTournamentHours = etHour >= 7 && etHour < 20 && day >= 4 && day <= 0 || day === 0;
  // Simpler: just auto-refresh if tournament is in progress
  const shouldRefresh = liveData?.is_in_progress || false;

  if (shouldRefresh) {
    nextRefreshAt = Date.now() + REFRESH_MS;
    refreshInterval = setInterval(fetchLiveScores, REFRESH_MS);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  } else if (liveData?.is_complete) {
    document.getElementById('liveCountdown').textContent = 'Tournament complete';
  } else {
    document.getElementById('liveCountdown').textContent = 'Auto-refresh when tournament is live';
  }
}

function updateCountdown() {
  if (!nextRefreshAt) return;
  const remaining = Math.max(0, nextRefreshAt - Date.now());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  document.getElementById('liveCountdown').textContent = `Refreshing in ${mins}:${secs.toString().padStart(2, '0')}`;
  if (remaining <= 0) {
    nextRefreshAt = Date.now() + REFRESH_MS;
  }
}
