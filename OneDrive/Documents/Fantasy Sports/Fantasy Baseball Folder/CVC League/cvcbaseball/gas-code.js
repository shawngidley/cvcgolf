// CVC Baseball 2026 - Apps Script v4
// Deploy as: Web App, Execute as: Me, Access: Anyone
//
// COMPLETE file — replace your entire Apps Script with this.
// Includes all existing lineup/pin/news functionality PLUS new
// waiver claims, transaction log, waiver priority, trades,
// draft pick overrides, and roster moves features.
//
// Required sheet tabs: lineups, pins, log, waiver_claims, waiver_priority
// (all other tabs will be auto-created on first use)

const SPREADSHEET_ID = '1RF9DqwS9U6rTNl2075aiaaatFLrl1wmDokOqV0jevE4';

function doGet(e) {
  try {
    return handleRequest(e);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'No parameters provided',
      status: 'ok',
      message: 'CVC Baseball GAS endpoint is running'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const params = e.parameter;
  const action = params.action;
  let result;

  try {
    // ── EXISTING: Lineups & Pins ──────────────────────────────────────────
    if (action === 'getLineup') {
      result = getLineup(params.team, params.period);
    } else if (action === 'setLineup') {
      result = setLineup(params.team, params.period, params.pin, params.lineup);
    } else if (action === 'verifyPin') {
      result = verifyPin(params.team, params.pin);
    } else if (action === 'getAllLineups') {
      result = getAllLineups(params.period);
    } else if (action === 'setPins') {
      result = setPins(params.team, params.newPin);

    // ── EXISTING: News ────────────────────────────────────────────────────
    } else if (action === 'fetchNews') {
      result = fetchNews();

    // ── NEW: Waiver Claims ────────────────────────────────────────────────
    } else if (action === 'addClaim') {
      result = addClaim(params);
    } else if (action === 'getClaims') {
      result = getClaims(params);
    } else if (action === 'updateClaimDrop') {
      result = updateClaimDrop(params);
    } else if (action === 'cancelClaim') {
      result = cancelClaim(params);

    // ── NEW: Waiver Priority ──────────────────────────────────────────────
    } else if (action === 'getPriority') {
      result = getPriority();
    } else if (action === 'setPriority') {
      result = setWaiverPriority(params);

    // ── NEW: Roster Moves ──────────────────────────────────────────────
    } else if (action === 'addRosterMove') {
      result = addRosterMove(params);
    } else if (action === 'getRosterMoves') {
      result = getRosterMoves(params);
    } else if (action === 'reverseRosterMove') {
      result = reverseRosterMove(params);

    // ── NEW: Draft Pick Overrides ────────────────────────────────────────
    } else if (action === 'getDraftOverrides') {
      result = getDraftOverrides();
    } else if (action === 'setDraftOverride') {
      result = setDraftOverride(params);

    // ── NEW: Trades ─────────────────────────────────────────────────────
    } else if (action === 'addTrade') {
      result = addTrade(params);
    } else if (action === 'getTrades') {
      result = getTrades(params);
    } else if (action === 'updateTrade') {
      result = updateTrade(params);
    } else if (action === 'executeTrade') {
      result = executeTrade(params);

    // ── NEW: Transaction Log ──────────────────────────────────────────────
    } else if (action === 'addLog') {
      result = addLog(params);
    } else if (action === 'getLog') {
      result = getLog(params);

    // ── NEW: Stat Preferences ─────────────────────────────────────────
    } else if (action === 'setStatPrefs') {
      result = setStatPrefs(params);
    } else if (action === 'getStatPrefs') {
      result = getStatPrefs(params);

    // ── NEW: Position Eligibility Overrides ────────────────────────────
    } else if (action === 'setPosElig') {
      result = setPosElig(params);
    } else if (action === 'getPosElig') {
      result = getPosElig(params);

    // ── NEW: Player Order ──────────────────────────────────────────────
    } else if (action === 'setPlayerOrder') {
      result = setPlayerOrder(params);
    } else if (action === 'getPlayerOrder') {
      result = getPlayerOrder(params);

    // ── NEW: Taxi Activation Logging ────────────────────────────────────
    } else if (action === 'logTaxiMove') {
      result = logTaxiMove(params);
    } else if (action === 'getTaxiMoves') {
      result = getTaxiMoves(params.team);
    } else if (action === 'getAllTaxiMoveCounts') {
      result = getAllTaxiMoveCounts();
    } else if (action === 'getAllTaxiMoves') {
      result = getAllTaxiMoves();
    } else if (action === 'adjustTaxiMoveCount') {
      result = adjustTaxiMoveCount(params.team, params.count);

    // ── NEW: Injury Overrides ─────────────────────────────────────────────
    } else if (action === 'getInjuryOverrides') {
      result = getInjuryOverrides();
    } else if (action === 'setInjuryOverride') {
      result = setInjuryOverride(params.player, params.status);

    // ── NEW: Retired List Management ──────────────────────────────────────
    } else if (action === 'getRetiredList') {
      result = getRetiredList();
    } else if (action === 'addRetired') {
      result = addRetired(params);
    } else if (action === 'removeRetired') {
      result = removeRetired(params);

    // ── Game Results ────────────────────────────────────────────────────────
    } else if (action === 'getResults') {
      result = handleGetResults(params);
    } else if (action === 'writeResults') {
      result = handleWriteResults(params);

    // ── Supplemental Draft ──────────────────────────────────────────────
    } else if (action === 'getSuppDraftPicks') {
      result = handleGetSuppDraftPicks(params);
    } else if (action === 'setSuppDraftPick') {
      result = handleSetSuppDraftPick(params);
    } else if (action === 'setSuppDraftActive') {
      result = handleSetSuppDraftActive(params);
    } else if (action === 'getSuppDraftActive') {
      result = handleGetSuppDraftActive(params);

    // ── Rookie Draft ────────────────────────────────────────────────────
    } else if (action === 'getRookieDraftPicks') {
      result = handleGetRookieDraftPicks(params);
    } else if (action === 'setRookieDraftPick') {
      result = handleSetRookieDraftPick(params);
    } else if (action === 'getRookieDraftActive') {
      result = handleGetRookieDraftActive(params);
    } else if (action === 'setRookieDraftActive') {
      result = handleSetRookieDraftActive(params);

    // ── SP Rest Rule ────────────────────────────────────────────────────
    } else if (action === 'getSpRest') {
      result = handleGetSpRest(params);
    } else if (action === 'setSpRest') {
      result = handleSetSpRest(params);

    // ── Game Recaps ─────────────────────────────────────────────────────
    } else if (action === 'getRecap') {
      result = handleGetRecap(params);
    } else if (action === 'setRecap') {
      result = handleSetRecap(params);

    // ── Power Rankings ──────────────────────────────────────────────────
    } else if (action === 'getPowerRankings') {
      result = handleGetPowerRankings(params);
    } else if (action === 'setPowerRankings') {
      result = handleSetPowerRankings(params);

    // ── Entry Fees / Owed ───────────────────────────────────────────────
    } else if (action === 'setOwed') {
      result = handleSetOwed(params);
    } else if (action === 'getOwed') {
      result = handleGetOwed();

    // ── Rotowire Player News ─────────────────────────────────────────────
    } else if (action === 'getPlayerNews') {
      result = getPlayerNews(params);
    } else if (action === 'getPlayerNewsHistory') {
      result = getPlayerNewsHistory(params);
    } else if (action === 'getPlayerNewsByMLBId') {
      result = getPlayerNewsByMLBId(params);
    } else if (action === 'getPlayerInjuryStatus') {
      result = getPlayerInjuryStatus(params);
    } else if (action === 'getInjuryReport') {
      result = getInjuryReport();
    } else if (action === 'getRecentNewsPlayers') {
      result = getRecentNewsPlayers();
    } else if (action === 'getPlayerProjections') {
      result = getPlayerProjections(params);
    } else if (action === 'getPlayerProjectionsBatch') {
      result = getPlayerProjectionsBatch(params);
    } else if (action === 'testProjections') {
      result = testProjections();

    // ── Drop Player ──────────────────────────────────────────────────────
    } else if (action === 'dropPlayerImmediate') {
      result = dropPlayerImmediate(params);
    } else if (action === 'dropPlayerPending') {
      result = dropPlayerPending(params);
    } else if (action === 'getPendingDrops') {
      result = getPendingDrops(params);

    } else if (action === 'getWaiverWireNews') {
      result = getWaiverWireNews();

    } else if (action === 'confirmTradeDrops') {
      result = confirmTradeDrops(params);
    } else if (action === 'getTradeDropStatus') {
      result = getTradeDropStatus(params);

    // ── Multi-Team Trades ────────────────────────────────────────────────
    } else if (action === 'proposeMultiTeamTrade') {
      result = proposeMultiTeamTrade(params);
    } else if (action === 'acceptMultiTeamTrade') {
      result = acceptMultiTeamTrade(params);
    } else if (action === 'rejectMultiTeamTrade') {
      result = rejectMultiTeamTrade(params);

    // ── Waiver Position Overrides ───────────────────────────────────────
    } else if (action === 'getWaiverPositions') {
      result = getWaiverPositions();
    } else if (action === 'seedWaiverPositions') {
      result = seedWaiverPositions(params);

    // ── The Rundown ──────────────────────────────────────────────────────
    } else if (action === 'getRundownData') {
      result = getRundownData(params);

    // ── Hot Stove Message Board ──────────────────────────────────────────
    } else if (action === 'getHotStoveMessages') {
      result = getHotStoveMessages();
    } else if (action === 'postHotStoveMessage') {
      result = postHotStoveMessage(params);
    } else if (action === 'deleteHotStoveMessage') {
      result = deleteHotStoveMessage(params);
    } else if (action === 'reactToHotStove') {
      result = reactToHotStove(params);

    // ── Draft Board ─────────────────────────────────────────────────────
    } else if (action === 'getDraftBoard') {
      result = getDraftBoard(params);
    } else if (action === 'saveDraftBoard') {
      result = saveDraftBoard(params);
    } else if (action === 'getDraftNotes') {
      result = getDraftNotes(params);
    } else if (action === 'saveDraftNotes') {
      result = saveDraftNotes(params);
    } else if (action === 'getWatchList') {
      result = getWatchList(params);
    } else if (action === 'saveWatchList') {
      result = saveWatchList(params);

    } else {
      result = { error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  const json = JSON.stringify(result);

  // JSONP support — return callback(json) if ?callback= is present
  const callback = params.callback;
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


// ═══════════════════════════════════════════════════════════════════════════
// EXISTING: PIN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function verifyPin(team, pin) {
  // Admin PIN always works
  if (String(pin) === '1925') return { success: true };
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('pins');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === team && String(data[i][1]) === String(pin)) {
      return { success: true };
    }
  }
  return { success: false, error: 'Invalid PIN' };
}

function setPins(team, newPin) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('pins');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === team) {
      sheet.getRange(i + 1, 2).setValue(String(newPin));
      return { success: true, team, message: 'PIN updated' };
    }
  }
  return { success: false, error: 'Team not found: ' + team };
}


// ═══════════════════════════════════════════════════════════════════════════
// EXISTING: LINEUP MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function getLineup(team, period) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('lineups');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === team && String(data[i][1]) === String(period)) {
      return {
        success: true,
        team: data[i][0],
        period: data[i][1],
        lineup: JSON.parse(data[i][2] || '[]'),
        updated: data[i][3]
      };
    }
  }
  // No saved lineup for this period — carry forward from the most recent prior period
  var carryLineup = [];
  var carryPeriod = null;
  var pNum = parseInt(period);
  for (var p = pNum - 1; p >= 1; p--) {
    for (var j = 1; j < data.length; j++) {
      if (data[j][0] === team && String(data[j][1]) === String(p)) {
        carryLineup = JSON.parse(data[j][2] || '[]');
        carryPeriod = p;
        break;
      }
    }
    if (carryLineup.length > 0) break;
  }
  return { success: true, team: team, period: period, lineup: carryLineup, updated: null, carriedFrom: carryPeriod };
}

function setLineup(team, period, pin, lineupJson) {
  const pinCheck = verifyPin(team, pin);
  if (!pinCheck.success) return pinCheck;

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('lineups');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === team && String(data[i][1]) === String(period)) {
      sheet.getRange(i + 1, 3).setValue(lineupJson);
      sheet.getRange(i + 1, 4).setValue(now);
      logChange(team, period, lineupJson, now);
      return { success: true, updated: now };
    }
  }

  sheet.appendRow([team, period, lineupJson, now]);
  logChange(team, period, lineupJson, now);
  return { success: true, updated: now };
}

function getAllLineups(period) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('lineups');
  const data = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(period)) {
      result[data[i][0]] = {
        lineup: JSON.parse(data[i][2] || '[]'),
        updated: data[i][3]
      };
    }
  }
  return { success: true, period, lineups: result };
}

function logChange(team, period, lineupJson, timestamp) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('log');
  if (!sheet) return;
  sheet.appendRow([timestamp, team, period, lineupJson]);
}


// ═══════════════════════════════════════════════════════════════════════════
// EXISTING: NEWS FETCHING
// ═══════════════════════════════════════════════════════════════════════════

function fetchNews() {
  // Fetch ALL RSS feeds server-side (no CORS issues) and merge results
  var feeds = [
    { url: 'https://www.rotoworld.com/rss/feeds/baseball.xml', source: 'RotoWorld' },
    { url: 'https://www.rotoballer.com/player-news/feed?sport=mlb', source: 'RotoBaller' },
    { url: 'https://www.cbssports.com/rss/headlines/fantasy-baseball/', source: 'CBS Sports' },
    { url: 'https://www.fantasysp.com/rss/mlb/allplayer/', source: 'FantasySP' }
  ];

  var allItems = [];
  var sources = [];

  for (var i = 0; i < feeds.length; i++) {
    try {
      var resp = UrlFetchApp.fetch(feeds[i].url, {
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        followRedirects: true
      });
      var code = resp.getResponseCode();
      if (code !== 200) continue;
      var xml = resp.getContentText();
      if (xml.indexOf('<rss') === -1 && xml.indexOf('<feed') === -1) continue;

      var items = parseRssFeed(xml);
      if (items.length > 0) {
        items.forEach(function(item) { item.source = feeds[i].source; });
        allItems = allItems.concat(items);
        sources.push(feeds[i].source + ':' + items.length);
      }
    } catch(e) {
      // skip failed feed
    }
  }

  // Also add MLB transactions
  try {
    var txResult = fetchMlbTransactions();
    if (txResult.success && txResult.items) {
      txResult.items.forEach(function(item) { item.source = 'MLB'; });
      allItems = allItems.concat(txResult.items);
      sources.push('MLB:' + txResult.items.length);
    }
  } catch(e) {}

  if (allItems.length > 0) {
    return { success: true, items: allItems, source: sources.join(', ') };
  }

  return { success: false, error: 'No feeds returned results' };
}

function parseRssFeed(xml) {
  try {
    var doc = XmlService.parse(xml);
    var root = doc.getRootElement();
    var ns = root.getNamespace();

    // RSS 2.0
    var channel = root.getChild('channel');
    if (channel) {
      return channel.getChildren('item').map(function(item) {
        return {
          title:   item.getChildText('title') || '',
          desc:    stripHtml(item.getChildText('description') || ''),
          link:    item.getChildText('link') || '',
          pubDate: item.getChildText('pubDate') || ''
        };
      }).filter(function(i) { return i.title.length > 0; });
    }

    // Atom feed
    var atomNs = XmlService.getNamespace('http://www.w3.org/2005/Atom');
    var entries = root.getChildren('entry', atomNs);
    return entries.map(function(e) {
      return {
        title:   e.getChildText('title', atomNs) || '',
        desc:    stripHtml(e.getChildText('summary', atomNs) || e.getChildText('content', atomNs) || ''),
        link:    '',
        pubDate: e.getChildText('updated', atomNs) || ''
      };
    }).filter(function(i) { return i.title.length > 0; });

  } catch(e) {
    return [];
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function fetchMlbTransactions() {
  try {
    var url = 'https://statsapi.mlb.com/api/v1/transactions?startDate='
      + formatDate(daysAgo(7)) + '&endDate=' + formatDate(new Date()) + '&sportId=1';
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var data = JSON.parse(resp.getContentText());
    var items = (data.transactions || []).map(function(t) {
      return {
        title: ((t.person && t.person.fullName) ? t.person.fullName : '') + ': ' + (t.typeDesc || ''),
        desc: t.description || '',
        link: '',
        pubDate: t.date ? new Date(t.date + 'T12:00:00Z').toUTCString() : '',
        mlbId: t.person ? t.person.id : null
      };
    }).filter(function(i) { return i.title.trim() !== ':'; });
    items.reverse();
    return { success: true, items: items, source: 'mlb-transactions' };
  } catch(err) {
    return { success: false, error: err.toString() };
  }
}

function formatDate(d) {
  return Utilities.formatDate(d, 'UTC', 'MM/dd/yyyy');
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW: WAIVER CLAIMS
// ═══════════════════════════════════════════════════════════════════════════
// waiver_claims columns: A=id, B=team, C=playerName, D=playerPos,
//   E=playerTeam, F=dropName, G=dropPos, H=dropTeam, I=claimTime,
//   J=expiresTime, K=status (active/processed/cancelled), L=conditional,
//   M=conditionOf

function addClaim(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) {
    ws = ss.insertSheet('waiver_claims');
    ws.appendRow(['id','team','playerName','playerPos','playerTeam','dropName','dropPos','dropTeam','claimTime','expiresTime','status','conditional','conditionOf']);
  }

  var id = Utilities.getUuid();
  var now = new Date().toISOString();
  var expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  var conditional = params.conditional || 'false';
  var conditionOf = params.conditionOf || '';

  ws.appendRow([
    id, params.team, params.playerName, params.playerPos,
    params.playerTeam, params.dropName || '', params.dropPos || '',
    params.dropTeam || '', now, expires, 'active', conditional, conditionOf
  ]);

  // Log the claim
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    logWs.appendRow([now, 'CLAIM', params.team,
      'Claimed ' + params.playerName + ' (' + params.playerPos + ')' +
      (params.dropName ? ', dropping ' + params.dropName : ''),
      params.period || '']);
  }

  return { success: true, id: id, expires: expires };
}

function getClaims(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return { success: true, claims: [] };

  var data = ws.getDataRange().getValues();
  var headers = data[0];
  var claims = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) row[headers[j]] = data[i][j];
    // Filter by team if specified
    if (params.team && row.team !== params.team) continue;
    // Only return active claims unless showAll
    if (!params.showAll && row.status !== 'active') continue;
    claims.push(row);
  }
  return { success: true, claims: claims };
}

function cancelClaim(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return { success: false, error: 'No claims sheet' };

  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(params.id)) {
      ws.getRange(i + 1, 11).setValue('cancelled'); // status column K
      var logWs = ss.getSheetByName('log');
      if (logWs) {
        logWs.appendRow([new Date().toISOString(), 'CANCEL', data[i][1],
          'Cancelled claim for ' + data[i][2], '']);
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Claim not found' };
}

function updateClaimDrop(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return { success: false, error: 'No claims sheet' };

  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(params.id)) {
      ws.getRange(i + 1, 6).setValue(params.dropName || '');
      ws.getRange(i + 1, 7).setValue(params.dropPos || '');
      ws.getRange(i + 1, 8).setValue(params.dropTeam || '');
      return { success: true };
    }
  }
  return { success: false, error: 'Claim not found' };
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW: WAIVER PRIORITY
// ═══════════════════════════════════════════════════════════════════════════
// waiver_priority columns: A=team (pin key), B=priority (1=highest)

function getPriority() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_priority');
  if (!ws) return { success: true, priority: [] };

  var data = ws.getDataRange().getValues();
  var priority = [];
  for (var i = 1; i < data.length; i++) {
    priority.push({ team: data[i][0], priority: data[i][1] });
  }
  priority.sort(function(a, b) { return a.priority - b.priority; });
  return { success: true, priority: priority };
}

function setWaiverPriority(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_priority');
  if (!ws) {
    ws = ss.insertSheet('waiver_priority');
    ws.appendRow(['team', 'priority']);
  }
  // Clear existing data (keep header)
  if (ws.getLastRow() > 1) {
    ws.getRange(2, 1, ws.getLastRow() - 1, 2).clearContent();
  }
  var order = JSON.parse(params.order);
  order.forEach(function(item, i) {
    ws.appendRow([item.team, i + 1]);
  });
  return { success: true };
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW: TRANSACTION LOG (read/write)
// ═══════════════════════════════════════════════════════════════════════════
// log columns: A=timestamp, B=type, C=team, D=details, E=period

function addLog(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('log');
  if (!ws) {
    ws = ss.insertSheet('log');
    ws.appendRow(['timestamp', 'type', 'team', 'details', 'period']);
  }
  var now = new Date().toISOString();
  ws.appendRow([now, params.type, params.team, params.details, params.period || '']);
  return { success: true };
}

function getLog(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('log');
  if (!ws) return { success: true, entries: [] };

  var data = ws.getDataRange().getValues();
  var entries = [];
  for (var i = 1; i < data.length; i++) {
    entries.push({
      timestamp: data[i][0],
      type: data[i][1],
      team: data[i][2],
      details: data[i][3],
      period: data[i][4]
    });
  }
  // Filter by team if specified
  if (params.team) {
    entries = entries.filter(function(en) { return en.team === params.team; });
  }
  // Return most recent first
  entries.reverse();
  // Limit to 100 entries
  if (entries.length > 100) entries = entries.slice(0, 100);
  return { success: true, entries: entries };
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW: TRADES
// ═══════════════════════════════════════════════════════════════════════════
// trades columns: A=id, B=proposerTeam, C=partnerTeam, D=proposerPlayers,
//   E=proposerPicks, F=partnerPlayers, G=partnerPicks, H=status,
//   I=date, J=updatedDate

function getOrCreateTradesSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('trades');
  if (!ws) {
    ws = ss.insertSheet('trades');
    ws.appendRow(['id','proposerTeam','partnerTeam','proposerPlayers','proposerPicks','partnerPlayers','partnerPicks','status','date','updatedDate']);
  }
  return ws;
}

function addTrade(params) {
  // Verify PIN
  var pinCheck = verifyPin(params.proposerTeam, params.pin);
  if (!pinCheck.success) return pinCheck;

  var ws = getOrCreateTradesSheet();
  var id = Utilities.getUuid();
  var now = new Date().toISOString();

  ws.appendRow([
    id,
    params.proposerTeam,
    params.partnerTeam,
    params.proposerPlayers || '[]',
    params.proposerPicks || '[]',
    params.partnerPlayers || '[]',
    params.partnerPicks || '[]',
    'pending',
    now,
    now
  ]);

  // Log the trade proposal
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    logWs.appendRow([now, 'TRADE_PROPOSED', params.proposerTeam,
      params.proposerTeam + ' proposed trade to ' + params.partnerTeam, '']);
  }

  return { success: true, id: id };
}

function getTrades(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('trades');
  if (!ws) return { success: true, trades: [] };

  var data = ws.getDataRange().getValues();
  var headers = data[0];
  var trades = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) row[headers[j]] = data[i][j];
    trades.push(row);
  }
  // Also load multi-team trades
  var mtWs = ss.getSheetByName('multi_trades');
  if (mtWs) {
    var mtData = mtWs.getDataRange().getValues();
    var mtHeaders = mtData[0];
    for (var m = 1; m < mtData.length; m++) {
      var mtRow = {};
      for (var mj = 0; mj < mtHeaders.length; mj++) mtRow[mtHeaders[mj]] = mtData[m][mj];
      mtRow.tradeType = 'multi';
      mtRow.date = mtRow.proposedAt;
      trades.push(mtRow);
    }
  }

  // Most recent first
  trades.reverse();
  return { success: true, trades: trades };
}

function updateTrade(params) {
  // Verify PIN
  var pinCheck = verifyPin(params.team, params.pin);
  if (!pinCheck.success) return pinCheck;

  var ws = getOrCreateTradesSheet();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(params.tradeId)) {
      var currentStatus = data[i][7];
      var proposerTeam = data[i][1];
      var partnerTeam = data[i][2];
      var newStatus = params.newStatus;
      var isAdmin = String(params.pin) === '1925';

      // Validate status transitions
      if (newStatus === 'accepted' && currentStatus !== 'pending') {
        return { success: false, error: 'Trade is not pending.' };
      }
      if (newStatus === 'accepted' && params.team !== partnerTeam && !isAdmin) {
        return { success: false, error: 'Only the trade partner can accept.' };
      }
      if (newStatus === 'rejected' && params.team !== partnerTeam && !isAdmin) {
        return { success: false, error: 'Only the trade partner can reject.' };
      }
      if (newStatus === 'cancelled' && params.team !== proposerTeam && !isAdmin) {
        return { success: false, error: 'Only the proposer can cancel.' };
      }
      if (newStatus === 'voided' && !isAdmin) {
        return { success: false, error: 'Only the commissioner can void trades.' };
      }

      var now = new Date().toISOString();
      ws.getRange(i + 1, 8).setValue(newStatus);   // status column H
      ws.getRange(i + 1, 10).setValue(now);          // updatedDate column J

      // Log the status change
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var logWs = ss.getSheetByName('log');
      if (logWs) {
        logWs.appendRow([now, 'TRADE_' + newStatus.toUpperCase(), params.team,
          'Trade ' + params.tradeId + ' ' + newStatus, '']);
      }

      return { success: true };
    }
  }
  return { success: false, error: 'Trade not found.' };
}

function executeTrade(params) {
  var ws = getOrCreateTradesSheet();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(params.tradeId)) {
      if (data[i][7] !== 'accepted') {
        return { success: false, error: 'Trade must be accepted before executing.' };
      }

      var proposerTeamKey = String(data[i][1]);
      var partnerTeamKey = String(data[i][2]);
      var proposerPlayers = [];
      var partnerPlayers = [];
      try { proposerPlayers = JSON.parse(data[i][3] || '[]'); } catch(e) {}
      try { partnerPlayers = JSON.parse(data[i][5] || '[]'); } catch(e) {}

      // Calculate roster sizes after trade (passed from frontend)
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var proposerRosterSize = Number(params.proposerRosterCount) || 0;
      var partnerRosterSize = Number(params.partnerRosterCount) || 0;

      var proposerNewSize = proposerRosterSize - proposerPlayers.length + partnerPlayers.length;
      var partnerNewSize = partnerRosterSize - partnerPlayers.length + proposerPlayers.length;

      var proposerDropsNeeded = Math.max(0, proposerNewSize - 35);
      var partnerDropsNeeded = Math.max(0, partnerNewSize - 35);

      if (proposerDropsNeeded > 0 || partnerDropsNeeded > 0) {
        // Set status to pending_drops instead of completed
        var now = new Date().toISOString();
        ws.getRange(i + 1, 8).setValue('pending_drops');
        ws.getRange(i + 1, 10).setValue(now);

        // Store drop requirements in columns K and L (add if needed)
        var headers = data[0];
        if (headers.length < 12) {
          // Extend headers
          ws.getRange(1, 11).setValue('proposerDropsNeeded');
          ws.getRange(1, 12).setValue('partnerDropsNeeded');
          ws.getRange(1, 13).setValue('proposerDropsDone');
          ws.getRange(1, 14).setValue('partnerDropsDone');
          ws.getRange(1, 15).setValue('acceptedAt');
        }
        ws.getRange(i + 1, 11).setValue(proposerDropsNeeded);
        ws.getRange(i + 1, 12).setValue(partnerDropsNeeded);
        ws.getRange(i + 1, 13).setValue('');
        ws.getRange(i + 1, 14).setValue('');
        ws.getRange(i + 1, 15).setValue(now);

        SpreadsheetApp.flush();
        return {
          success: true,
          pendingDrops: true,
          proposerDropsNeeded: proposerDropsNeeded,
          partnerDropsNeeded: partnerDropsNeeded,
          tradeId: String(data[i][0])
        };
      }

      // No drops needed — complete immediately
      var now2 = new Date().toISOString();
      ws.getRange(i + 1, 8).setValue('completed');
      ws.getRange(i + 1, 10).setValue(now2);

      // Process draft pick overrides
      var proposerPicks = [];
      var partnerPicks = [];
      try { proposerPicks = JSON.parse(data[i][4] || '[]'); } catch(e) {}
      try { partnerPicks = JSON.parse(data[i][6] || '[]'); } catch(e) {}

      proposerPicks.forEach(function(label) { saveDraftPickOverride(label, partnerTeamKey); });
      partnerPicks.forEach(function(label) { saveDraftPickOverride(label, proposerTeamKey); });

      SpreadsheetApp.flush();
      return { success: true, pendingDrops: false };
    }
  }
  return { success: false, error: 'Trade not found.' };
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW: DRAFT PICK OVERRIDES
// ═══════════════════════════════════════════════════════════════════════════
// draft_overrides columns: A=pickLabel, B=newOwnerPinKey

function getOrCreateDraftOverridesSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('draft_overrides');
  if (!ws) {
    ws = ss.insertSheet('draft_overrides');
    ws.appendRow(['pickLabel', 'newOwnerPinKey']);
  }
  return ws;
}

function getDraftOverrides() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('draft_overrides');
  if (!ws) return { success: true, overrides: [] };

  var data = ws.getDataRange().getValues();
  var overrides = [];
  for (var i = 1; i < data.length; i++) {
    overrides.push({ pickLabel: data[i][0], newOwnerPinKey: data[i][1] });
  }
  return { success: true, overrides: overrides };
}

function setDraftOverride(params) {
  if (String(params.pin) !== '1925') {
    return { success: false, error: 'Only the commissioner can set draft overrides.' };
  }
  saveDraftPickOverride(params.pickLabel, params.newOwnerPinKey);
  return { success: true };
}

function saveDraftPickOverride(pickLabel, newOwnerPinKey) {
  var ws = getOrCreateDraftOverridesSheet();
  var data = ws.getDataRange().getValues();

  // Update existing override or append new one
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(pickLabel)) {
      ws.getRange(i + 1, 2).setValue(newOwnerPinKey);
      return;
    }
  }
  ws.appendRow([pickLabel, newOwnerPinKey]);
}


// ═══════════════════════════════════════════════════════════════════════════
// NEW: ROSTER MOVES
// ═══════════════════════════════════════════════════════════════════════════
// roster_moves columns: A=timestamp, B=team (ROSTERS key), C=addName,
//   D=addPos, E=addTeam, F=dropName, G=dropPos, H=dropTeam

function addRosterMove(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('roster_moves');
  if (!ws) {
    ws = ss.insertSheet('roster_moves');
    ws.appendRow(['timestamp','team','addName','addPos','addTeam','dropName','dropPos','dropTeam']);
  }
  var now = new Date().toISOString();
  ws.appendRow([
    now,
    params.team,
    params.addName || '',
    params.addPos || '',
    params.addTeam || '',
    params.dropName || '',
    params.dropPos || '',
    params.dropTeam || ''
  ]);
  return { success: true };
}

function getRosterMoves(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var ws = ss.getSheetByName('roster_moves');
    if (!ws) return { success: true, moves: [] };

    var data = ws.getDataRange().getValues();
    var moves = [];
    for (var i = 1; i < data.length; i++) {
      moves.push({
        timestamp: data[i][0],
        team: data[i][1],
        addName: data[i][2],
        addPos: data[i][3],
        addTeam: data[i][4],
        dropName: data[i][5],
        dropPos: data[i][6],
        dropTeam: data[i][7]
      });
    }
    return { success: true, moves: moves };
  } catch(e) {
    return { success: true, moves: [], error: e.toString() };
  }
}


function reverseRosterMove(params) {
  var ts = params.timestamp;
  if (!ts) return { success: false, error: 'Missing timestamp.' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. Delete the roster_moves row matching this timestamp
  var ws = ss.getSheetByName('roster_moves');
  if (ws) {
    var data = ws.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      var rowTs = data[i][0];
      if (String(rowTs) === String(ts) || (rowTs instanceof Date && rowTs.toISOString() === ts)) {
        ws.deleteRow(i + 1);
        break;
      }
    }
  }

  // 2. Delete matching transaction log entry
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    var logData = logWs.getDataRange().getValues();
    // Find closest log entry by timestamp (within 60 seconds of roster move)
    var moveTime = new Date(ts).getTime();
    for (var j = logData.length - 1; j >= 1; j--) {
      var logTime = logData[j][0] instanceof Date ? logData[j][0].getTime() : new Date(logData[j][0]).getTime();
      if (Math.abs(logTime - moveTime) < 60000 && String(logData[j][1]) === 'TRANSACTION') {
        var details = String(logData[j][3]);
        if (details.indexOf(params.addName) !== -1 || details.indexOf(params.dropName) !== -1) {
          logWs.deleteRow(j + 1);
          break;
        }
      }
    }
  }

  return { success: true };
}


// ═══════════════════════════════════════════════════════════════════════════
// POSITION ELIGIBILITY OVERRIDES
// ═══════════════════════════════════════════════════════════════════════════

function setPosElig(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('pos_elig');
  if (!ws) {
    ws = ss.insertSheet('pos_elig');
    ws.appendRow(['playerName', 'positions', 'overrideType', 'overridePos', 'timestamp']);
  }

  // Check if player already has a row
  var data = ws.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.playerName) { rowIndex = i + 1; break; }
  }

  if (rowIndex > 0) {
    ws.getRange(rowIndex, 2).setValue(params.positions || '');
    ws.getRange(rowIndex, 3).setValue(params.overrideType || '');
    ws.getRange(rowIndex, 4).setValue(params.overridePos || '');
    ws.getRange(rowIndex, 5).setValue(new Date().toISOString());
  } else {
    ws.appendRow([
      params.playerName,
      params.positions || '',
      params.overrideType || '',
      params.overridePos || '',
      new Date().toISOString()
    ]);
  }

  return { success: true };
}

function getPosElig(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('pos_elig');
  if (!ws) return { success: true, overrides: [] };

  var data = ws.getDataRange().getValues();
  var overrides = [];
  for (var i = 1; i < data.length; i++) {
    overrides.push({
      playerName: data[i][0],
      positions: data[i][1],
      overrideType: data[i][2],
      overridePos: data[i][3]
    });
  }
  return { success: true, overrides: overrides };
}


// ═══════════════════════════════════════════════════════════════════════════
// STAT PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════
// stat_prefs columns: A=team, B=prefs (JSON string), C=updated

function setStatPrefs(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('stat_prefs');
  if (!ws) {
    ws = ss.insertSheet('stat_prefs');
    ws.appendRow(['team', 'prefs', 'updated']);
  }
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.team) {
      ws.getRange(i + 1, 2).setValue(params.prefs || '');
      ws.getRange(i + 1, 3).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  ws.appendRow([params.team, params.prefs || '', new Date().toISOString()]);
  return { success: true };
}

function getStatPrefs(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('stat_prefs');
  if (!ws) return { success: true, prefs: null };
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.team) {
      var raw = data[i][1];
      if (!raw) return { success: true, prefs: null };
      try { return { success: true, prefs: JSON.parse(raw) }; }
      catch(e) { return { success: true, prefs: null }; }
    }
  }
  return { success: true, prefs: null };
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER ORDER
// ═══════════════════════════════════════════════════════════════════════════
// player_order columns: A=team, B=order (JSON string), C=updated

function setPlayerOrder(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('player_order');
  if (!ws) {
    ws = ss.insertSheet('player_order');
    ws.appendRow(['team', 'order', 'updated']);
  }
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.team) {
      ws.getRange(i + 1, 2).setValue(params.order || '');
      ws.getRange(i + 1, 3).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  ws.appendRow([params.team, params.order || '', new Date().toISOString()]);
  return { success: true };
}

function getPlayerOrder(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('player_order');
  if (!ws) return { success: true, order: null };
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.team) {
      var raw = data[i][1];
      if (!raw) return { success: true, order: null };
      try { return { success: true, order: JSON.parse(raw) }; }
      catch(e) { return { success: true, order: null }; }
    }
  }
  return { success: true, order: null };
}

// ═══════════════════════════════════════════════════════════════════════════
// TAXI ACTIVATION LOGGING
// ═══════════════════════════════════════════════════════════════════════════
// taxi_moves columns: A=move_num, B=team, C=date, D=activated_name,
//   E=placed_name, F=period, G=processed

function logTaxiMove(params) {
  // Taxi moves are unlimited before season start — don't log
  var seasonStart = new Date('2026-03-25T00:00:00');
  if (new Date() < seasonStart) {
    return { success: true, skipped: true, reason: 'preseason' };
  }

  var team = params.team || '';
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws) {
    ws = ss.insertSheet('taxi_moves');
    ws.appendRow(['move_num', 'team', 'date', 'activated_name', 'placed_name', 'period', 'processed']);
  }

  // Count existing moves for this team
  var MAX_TAXI_MOVES = 15;
  var lastRow = ws.getLastRow();
  var teamMoveCount = 0;
  if (lastRow > 1) {
    var teamCol = ws.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var i = 0; i < teamCol.length; i++) {
      if (String(teamCol[i][0]).trim() === team) teamMoveCount++;
    }
  }

  // Check if team has moves remaining
  if (teamMoveCount >= MAX_TAXI_MOVES) {
    return { success: false, error: 'Taxi moves exhausted (15/15 used)', movesUsed: teamMoveCount, movesMax: MAX_TAXI_MOVES };
  }

  var moveNum = teamMoveCount + 1;
  var today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  var period = params.period || '';

  ws.appendRow([
    moveNum,
    team,
    today,
    params.activatedName || '',
    params.placedName || '',
    period,
    'No'
  ]);

  // Also write to the log tab as a TRANSACTION
  var logWs = ss.getSheetByName('log');
  if (!logWs) {
    logWs = ss.insertSheet('log');
    logWs.appendRow(['timestamp', 'type', 'team', 'details', 'period']);
  }
  var desc = params.details || '';
  logWs.appendRow([new Date().toISOString(), 'TRANSACTION', team, desc, period]);

  return { success: true, moveNum: moveNum, movesUsed: moveNum, movesMax: MAX_TAXI_MOVES };
}

function getTaxiMoves(team) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws || ws.getLastRow() < 2) return { success: true, moves: [], movesUsed: 0, movesMax: 15 };

  var lastCol = ws.getLastColumn();
  var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colMap = {};
  headers.forEach(function(h, i) { colMap[h] = i; });
  var teamIdx = colMap['team'] !== undefined ? colMap['team'] : 1;
  var dateIdx = colMap['date'] !== undefined ? colMap['date'] : 2;
  var upIdx   = colMap['activated_name'] !== undefined ? colMap['activated_name'] : 3;
  var downIdx = colMap['placed_name'] !== undefined ? colMap['placed_name'] : 4;
  var numIdx  = colMap['move_num'] !== undefined ? colMap['move_num'] : 0;
  var perIdx  = colMap['period'] !== undefined ? colMap['period'] : 5;
  var procIdx = colMap['processed'] !== undefined ? colMap['processed'] : 6;

  var data = ws.getRange(2, 1, ws.getLastRow() - 1, lastCol).getValues();
  var moves = [];
  data.forEach(function(row) {
    if (String(row[teamIdx] || '').trim() === team) {
      moves.push({
        moveNum: row[numIdx],
        team: row[teamIdx],
        date: row[dateIdx],
        activatedName: String(row[upIdx] || ''),
        placedName: String(row[downIdx] || ''),
        period: row[perIdx],
        processed: row[procIdx]
      });
    }
  });
  return { success: true, moves: moves, movesUsed: moves.length, movesMax: 15 };
}

function getAllTaxiMoveCounts() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  var counts = {};
  if (ws && ws.getLastRow() > 1) {
    var lastCol = ws.getLastColumn();
    var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var teamIdx = headers.indexOf('team');
    if (teamIdx === -1) teamIdx = 1;
    var data = ws.getRange(2, 1, ws.getLastRow() - 1, lastCol).getValues();
    data.forEach(function(row) {
      var t = String(row[teamIdx] || '').trim();
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
  }
  return { success: true, counts: counts, movesMax: 15 };
}

function getAllTaxiMoves() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws || ws.getLastRow() < 2) return { success: true, moves: {} };

  var lastCol = ws.getLastColumn();
  var data = ws.getRange(2, 1, ws.getLastRow() - 1, lastCol).getValues();
  var moves = {};

  data.forEach(function(row) {
    // Detect format: column A (row[0]) could be a number (move_num) or a Date/timestamp
    var colA = row[0];
    var colB = row[1]; // always team
    var dateFormatted = '';
    var activatedName = '';
    var placedName = '';
    var period = '';

    if (colA instanceof Date || (typeof colA === 'string' && String(colA).match(/^\d{4}-\d{2}-\d{2}/))) {
      // Misaligned format: [timestamp, team, playerName, playerName, empty, period, ...]
      var d = colA instanceof Date ? colA : new Date(colA);
      if (colA instanceof Date) {
        dateFormatted = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
      } else {
        dateFormatted = String(colA).substring(0, 10);
      }
      activatedName = String(row[2] || '');
      placedName = String(row[3] || '');
      // placedName might be same as activatedName (duplicate) — check if it looks like a player name duplicate
      if (placedName === activatedName) placedName = '';
      period = row[4] || row[5] || '';
    } else {
      // Correct format: [move_num, team, date, activated_name, placed_name, period, processed]
      var dateVal = row[2];
      if (dateVal instanceof Date) {
        dateFormatted = dateVal.getFullYear() + '-' + String(dateVal.getMonth()+1).padStart(2,'0') + '-' + String(dateVal.getDate()).padStart(2,'0');
      } else {
        dateFormatted = String(dateVal || '');
      }
      activatedName = String(row[3] || '');
      placedName = String(row[4] || '');
      period = row[5] || '';
    }

    var team = String(colB || '').trim();
    if (!team) return;
    if (!moves[team]) moves[team] = [];
    moves[team].push({
      date: dateFormatted,
      activatedName: activatedName,
      placedName: placedName,
      period: period
    });
  });
  return { success: true, moves: moves };
}

function adjustTaxiMoveCount(team, targetCount) {
  // Commissioner-only: add or remove dummy rows to adjust a team's count
  if (!team) return { error: 'Team required' };
  var count = parseInt(targetCount, 10);
  if (isNaN(count) || count < 0 || count > 15) return { error: 'Count must be 0-15' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws) {
    ws = ss.insertSheet('taxi_moves');
    ws.appendRow(['move_num', 'team', 'date', 'activated_name', 'placed_name', 'period', 'processed']);
  }

  // Count current moves
  var lastRow = ws.getLastRow();
  var currentCount = 0;
  var teamRows = [];
  if (lastRow > 1) {
    var data = ws.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === team) {
        currentCount++;
        teamRows.push(i + 2); // 1-indexed sheet row
      }
    }
  }

  if (count > currentCount) {
    // Add adjustment rows
    var today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    for (var a = currentCount + 1; a <= count; a++) {
      ws.appendRow([a, team, today, '(Commissioner adjustment)', '', '', 'Yes']);
    }
  } else if (count < currentCount) {
    // Remove rows from bottom up
    var toRemove = currentCount - count;
    for (var r = teamRows.length - 1; r >= 0 && toRemove > 0; r--) {
      ws.deleteRow(teamRows[r]);
      toRemove--;
    }
  }

  return { success: true, movesUsed: count, movesMax: 15 };
}

// ═══════════════════════════════════════════════════════════════════════════
// Clear all preseason taxi moves (logged before 2026-03-25)
// Run this once manually from Apps Script editor: clearPreseasonTaxiMoves()
// ═══════════════════════════════════════════════════════════════════════════
function clearPreseasonTaxiMoves() {
  var seasonStart = new Date('2026-03-25T00:00:00');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Clean taxi_moves sheet
  var ws = ss.getSheetByName('taxi_moves');
  if (ws && ws.getLastRow() > 1) {
    var data = ws.getDataRange().getValues();
    var rowsToDelete = [];
    for (var i = 1; i < data.length; i++) {  // skip header
      var ts = new Date(data[i][0]);
      if (ts < seasonStart) rowsToDelete.push(i + 1);  // 1-indexed
    }
    // Delete from bottom to top to preserve row indices
    for (var j = rowsToDelete.length - 1; j >= 0; j--) {
      ws.deleteRow(rowsToDelete[j]);
    }
    Logger.log('Deleted ' + rowsToDelete.length + ' preseason rows from taxi_moves');
  }

  // Clean log sheet — remove TRANSACTION rows with "taxi" before season start
  var logWs = ss.getSheetByName('log');
  if (logWs && logWs.getLastRow() > 1) {
    var logData = logWs.getDataRange().getValues();
    var logRowsToDelete = [];
    for (var k = 1; k < logData.length; k++) {
      var logTs = new Date(logData[k][0]);
      var logType = String(logData[k][1]);
      var logDetails = String(logData[k][3]).toLowerCase();
      if (logTs < seasonStart && logType === 'TRANSACTION' && logDetails.indexOf('taxi') !== -1) {
        logRowsToDelete.push(k + 1);
      }
    }
    for (var m = logRowsToDelete.length - 1; m >= 0; m--) {
      logWs.deleteRow(logRowsToDelete[m]);
    }
    Logger.log('Deleted ' + logRowsToDelete.length + ' preseason taxi rows from log');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Injury Overrides — commissioner can manually set/clear player statuses
// Sheet tab: injury_overrides (columns: player, status)
// ═══════════════════════════════════════════════════════════════════════════
function getInjuryOverrides() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('injury_overrides');
  if (!ws || ws.getLastRow() < 2) return { overrides: {} };
  var data = ws.getRange(2, 1, ws.getLastRow() - 1, 2).getValues();
  var overrides = {};
  for (var i = 0; i < data.length; i++) {
    var player = String(data[i][0]).trim();
    var status = String(data[i][1]).trim().toUpperCase();
    if (player && status) overrides[player] = status;
  }
  return { overrides: overrides };
}

function setInjuryOverride(player, status) {
  if (!player) return { error: 'Player name required' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('injury_overrides');
  if (!ws) {
    ws = ss.insertSheet('injury_overrides');
    ws.appendRow(['player', 'status']);
  }
  // Find existing row for this player
  var lastRow = ws.getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    if (String(ws.getRange(i, 1).getValue()).trim() === player) {
      if (!status || status === 'CLEAR') {
        ws.deleteRow(i);
        return { success: true, action: 'cleared' };
      }
      ws.getRange(i, 2).setValue(status.toUpperCase());
      return { success: true, action: 'updated' };
    }
  }
  // Not found — add new row (unless clearing)
  if (!status || status === 'CLEAR') return { success: true, action: 'no_change' };
  ws.appendRow([player, status.toUpperCase()]);
  return { success: true, action: 'added' };
}


// ═══════════════════════════════════════════════════════════════════════════
// RETIRED LIST MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function getOrCreateRetiredSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('retired_list');
  if (!sheet) {
    sheet = ss.insertSheet('retired_list');
    sheet.appendRow(['name', 'pos', 'date_added']);
  }
  return sheet;
}

function getRetiredList() {
  var sheet = getOrCreateRetiredSheet();
  var data = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      list.push({ name: String(data[i][0]), pos: String(data[i][1] || ''), date: String(data[i][2] || '') });
    }
  }
  return { success: true, retired: list };
}

function addRetired(params) {
  if (String(params.pin) !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var name = params.player || '';
  var pos = params.pos || '';
  if (!name) return { success: false, error: 'Player name required' };
  var sheet = getOrCreateRetiredSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === name.toLowerCase()) {
      return { success: false, error: 'Player already on retired list' };
    }
  }
  var ts = new Date().toISOString().slice(0, 10);
  sheet.appendRow([name, pos, ts]);
  return { success: true, message: name + ' added to retired list' };
}

function removeRetired(params) {
  if (String(params.pin) !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var name = params.player || '';
  if (!name) return { success: false, error: 'Player name required' };
  var sheet = getOrCreateRetiredSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === name.toLowerCase()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: name + ' removed from retired list' };
    }
  }
  return { success: false, error: 'Player not found on retired list' };
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME RESULTS
// ═══════════════════════════════════════════════════════════════════════════

function handleGetResults(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('results');
  if (!sheet) return { success: true, results: [] };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, results: [] };
  var headers = data[0];
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (['period','team1_CW','team1_CL','team1_CT','team2_CW','team2_CL','team2_CT'].indexOf(headers[j]) !== -1) {
        val = Number(val) || 0;
      }
      row[headers[j]] = val;
    }
    results.push(row);
  }
  return { success: true, results: results };
}

function handleWriteResults(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('results');
  if (!sheet) {
    sheet = ss.insertSheet('results');
    sheet.appendRow(['period','start_date','end_date','team1','team2','team1_CW','team1_CL','team1_CT','team2_CW','team2_CL','team2_CT','winner','team1_stats','team2_stats','finalized_date']);
  }
  var period = Number(params.period) || 0;
  var resultsJson = params.results || '[]';
  var results;
  try { results = JSON.parse(resultsJson); } catch(err) { return { success: false, error: 'Invalid JSON' }; }
  var existing = sheet.getDataRange().getValues();
  for (var i = 1; i < existing.length; i++) {
    if (Number(existing[i][0]) === period) return { success: true, message: 'Already finalized' };
  }
  results.forEach(function(r) {
    sheet.appendRow([r.period,r.start_date,r.end_date,r.team1,r.team2,r.team1_CW,r.team1_CL,r.team1_CT,r.team2_CW,r.team2_CL,r.team2_CT,r.winner,r.team1_stats,r.team2_stats,r.finalized_date]);
  });
  return { success: true, written: results.length };
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPPLEMENTAL DRAFT
// ═══════════════════════════════════════════════════════════════════════════

function handleGetSuppDraftPicks(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('suppdraft');
  if (!sheet) return { success: true, picks: [] };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, picks: [] };
  var headers = data[0];
  var picks = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (headers[j] === 'slot') val = Number(val) || 0;
      row[headers[j]] = val;
    }
    picks.push(row);
  }
  return { success: true, picks: picks };
}

function handleSetSuppDraftPick(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('suppdraft');
  if (!sheet) {
    sheet = ss.insertSheet('suppdraft');
    sheet.appendRow(['draft','slot','status','pick','mlbTeam','drop','pickedBy','pickedAt']);
  }
  var draft = params.draft || '';
  var slot = Number(params.slot) || 0;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === draft && Number(data[i][1]) === slot) {
      var row = i + 1;
      sheet.getRange(row, 3).setValue(params.status || '');
      if (params.pick) sheet.getRange(row, 4).setValue(params.pick);
      if (params.mlbTeam) sheet.getRange(row, 5).setValue(params.mlbTeam);
      if (params.drop) sheet.getRange(row, 6).setValue(params.drop);
      if (params.pickedBy) sheet.getRange(row, 7).setValue(params.pickedBy);
      if (params.pickedAt) sheet.getRange(row, 8).setValue(params.pickedAt);
      return { success: true, updated: true };
    }
  }
  sheet.appendRow([draft, slot, params.status||'', params.pick||'', params.mlbTeam||'', params.drop||'', params.pickedBy||'', params.pickedAt||'']);
  return { success: true, written: true };
}

function handleSetSuppDraftActive(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('suppdraft_active');
  if (!sheet) {
    sheet = ss.insertSheet('suppdraft_active');
    sheet.appendRow(['draft', 'activeSlot', 'startTime']);
  }
  var draft = params.draft || '';
  var slot = Number(params.slot) || 0;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === draft) {
      sheet.getRange(i + 1, 2).setValue(slot);
      sheet.getRange(i + 1, 3).setValue(params.startTime || '');
      return { success: true };
    }
  }
  sheet.appendRow([draft, slot, params.startTime || '']);
  return { success: true };
}

function handleGetSuppDraftActive(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('suppdraft_active');
  if (!sheet) return { success: true, active: [] };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, active: [] };
  var headers = data[0];
  var active = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (headers[j] === 'activeSlot') val = Number(val) || 0;
      row[headers[j]] = val;
    }
    active.push(row);
  }
  return { success: true, active: active };
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOKIE DRAFT
// ═══════════════════════════════════════════════════════════════════════════

function handleGetRookieDraftPicks(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var year = params.year || '2026';
  var sheet = ss.getSheetByName('rookiedraft_' + year);
  if (!sheet) return { success: true, picks: [] };
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, picks: [] };
  var headers = data[0];
  var picks = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      if (headers[j] === 'pick') val = Number(val) || 0;
      row[headers[j]] = val;
    }
    picks.push(row);
  }
  return { success: true, picks: picks };
}

function handleSetRookieDraftPick(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var year = params.year || '2026';
  var sheetName = 'rookiedraft_' + year;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['pick','status','player','pos','mlbTeam','drop','pickedBy','pickedAt']);
  }
  var pick = Number(params.pick) || 0;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === pick) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(params.status || '');
      if (params.player) sheet.getRange(row, 3).setValue(params.player);
      if (params.pos) sheet.getRange(row, 4).setValue(params.pos);
      if (params.mlbTeam) sheet.getRange(row, 5).setValue(params.mlbTeam);
      if (params.drop) sheet.getRange(row, 6).setValue(params.drop);
      if (params.pickedBy) sheet.getRange(row, 7).setValue(params.pickedBy);
      if (params.pickedAt) sheet.getRange(row, 8).setValue(params.pickedAt);
      if (params.status === 'reopened') {
        sheet.getRange(row, 3, 1, 6).clearContent();
      }
      return { success: true, updated: true };
    }
  }
  sheet.appendRow([pick, params.status||'', params.player||'', params.pos||'', params.mlbTeam||'', params.drop||'', params.pickedBy||'', params.pickedAt||'']);
  return { success: true, written: true };
}

function handleGetRookieDraftActive(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var year = params.year || '2026';
  var sheet = ss.getSheetByName('rookiedraft_active');
  if (!sheet) return { success: true, activePick: null };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === year) {
      return { success: true, activePick: Number(data[i][1]) || null };
    }
  }
  return { success: true, activePick: null };
}

function handleSetRookieDraftActive(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var year = params.year || '2026';
  var sheet = ss.getSheetByName('rookiedraft_active');
  if (!sheet) {
    sheet = ss.insertSheet('rookiedraft_active');
    sheet.appendRow(['year', 'activePick']);
  }
  var pick = Number(params.pick) || 0;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === year) {
      sheet.getRange(i + 1, 2).setValue(pick);
      return { success: true };
    }
  }
  sheet.appendRow([year, pick]);
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// SP REST RULE
// ═══════════════════════════════════════════════════════════════════════════

function handleGetSpRest(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('sp_rest');
  if (!sheet) return { success: true, rest: [] };
  var period = params.period || '';
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, rest: [] };
  var headers = data[0];
  var rest = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) row[headers[j]] = data[i][j];
    if (period && String(row.period) !== String(period)) continue;
    rest.push(row);
  }
  return { success: true, rest: rest };
}

function handleSetSpRest(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('sp_rest');
  if (!sheet) {
    sheet = ss.insertSheet('sp_rest');
    sheet.appendRow(['period', 'teamKey', 'playerName', 'ip']);
  }
  var entries = params.entries || '[]';
  try { entries = JSON.parse(entries); } catch(ex) { return { success: false, error: 'Invalid JSON' }; }
  var period = params.period || '';
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(period)) sheet.deleteRow(i + 1);
  }
  for (var j = 0; j < entries.length; j++) {
    var ent = entries[j];
    sheet.appendRow([period, ent.teamKey||'', ent.playerName||'', ent.ip||0]);
  }
  return { success: true, written: entries.length };
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME RECAPS
// ═══════════════════════════════════════════════════════════════════════════

function handleGetRecap(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('recaps');
  if (!sheet) return { success: true, recap: null };
  var period = String(params.period || '');
  var team1 = params.team1 || '';
  var team2 = params.team2 || '';
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rPeriod = String(data[i][0]);
    var rTeam1 = String(data[i][1]);
    var rTeam2 = String(data[i][2]);
    if (rPeriod === period &&
        ((rTeam1 === team1 && rTeam2 === team2) || (rTeam1 === team2 && rTeam2 === team1))) {
      return { success: true, recap: data[i][3] };
    }
  }
  return { success: true, recap: null };
}

function handleSetRecap(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('recaps');
  if (!sheet) {
    sheet = ss.insertSheet('recaps');
    sheet.appendRow(['period', 'team1', 'team2', 'recap', 'created_date']);
  }
  var period = String(params.period || '');
  var team1 = params.team1 || '';
  var team2 = params.team2 || '';
  var recap = params.recap || '';
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rPeriod = String(data[i][0]);
    var rTeam1 = String(data[i][1]);
    var rTeam2 = String(data[i][2]);
    if (rPeriod === period &&
        ((rTeam1 === team1 && rTeam2 === team2) || (rTeam1 === team2 && rTeam2 === team1))) {
      sheet.getRange(i + 1, 4).setValue(recap);
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
      return { success: true, updated: true };
    }
  }
  sheet.appendRow([period, team1, team2, recap, new Date().toISOString()]);
  return { success: true, written: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// POWER RANKINGS
// ═══════════════════════════════════════════════════════════════════════════

function handleGetPowerRankings(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('powerrankings');
  if (!sheet) return { success: true, rankings: null };
  var period = String(params.period || '0');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, rankings: null };
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === period) {
      return { success: true, rankings: data[i][1], generated_at: data[i][2] };
    }
  }
  return { success: true, rankings: null };
}

function handleSetPowerRankings(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('powerrankings');
  if (!sheet) {
    sheet = ss.insertSheet('powerrankings');
    sheet.appendRow(['period', 'rankings_json', 'generated_at']);
  }
  var period = String(params.period || '0');
  var rankingsJson = params.rankings_json || '';
  var now = new Date().toISOString();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(period)) {
      sheet.getRange(i + 1, 2).setValue(rankingsJson);
      sheet.getRange(i + 1, 3).setValue(now);
      return { success: true, updated: true };
    }
  }
  sheet.appendRow([period, rankingsJson, now]);
  return { success: true, written: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY FEES / OWED
// ═══════════════════════════════════════════════════════════════════════════

function handleSetOwed(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('entry_fees');
  if (!sheet) {
    sheet = ss.insertSheet('entry_fees');
    sheet.appendRow(['team', 'amount', 'updated_at']);
  }
  var team = params.team || '';
  var amount = params.amount || '0';
  var now = new Date().toISOString();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === team) {
      sheet.getRange(i + 1, 2).setValue(amount);
      sheet.getRange(i + 1, 3).setValue(now);
      return { success: true, updated: true };
    }
  }
  sheet.appendRow([team, amount, now]);
  return { success: true, written: true };
}

function handleGetOwed() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('entry_fees');
  if (!sheet) return { success: true, fees: {} };
  var data = sheet.getDataRange().getValues();
  var fees = {};
  for (var i = 1; i < data.length; i++) {
    fees[String(data[i][0])] = Number(data[i][1]) || 0;
  }
  return { success: true, fees: fees };
}


// ═══════════════════════════════════════════════════════════════════════════
// ROTOWIRE PLAYER NEWS — Fetch, Archive, Serve
// ═══════════════════════════════════════════════════════════════════════════

var RW_TEAM_MAP = {
  '501': 'Bomb Squad',
  '502': 'Billy Goats Gruff',
  '503': "Heiden's Hardtimes",
  '504': 'Legion of Doom',
  '505': 'San Francisco Jones123',
  '506': 'The American Dreams',
  '507': 'The Boys of Summer',
  '508': 'The Four Horsemen',
  '509': 'The Hitmen',
  '510': 'The Super Snuffleupagus',
  '511': 'Vipers',
  '512': 'X-Thome Fan'
};

var ROTOWIRE_API_KEY = 'q9s65ss3n1hfq5018c2j';
var ROTOWIRE_NEWS_URL = 'https://api.rotowire.com/Baseball/MLB/News.php?key=' + ROTOWIRE_API_KEY + '&format=json';
var ROTOWIRE_INJURIES_URL = 'https://api.rotowire.com/Baseball/MLB/Injuries.php?key=' + ROTOWIRE_API_KEY + '&format=json';

// ── Rotowire News Sheet (new API columns) ──
function ensureRotowireSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_news');
  if (!sheet) {
    sheet = ss.insertSheet('rotowire_news');
    sheet.appendRow(['PlayerName','Team','Position','NewsHeadline','NewsUpdate','Analysis','InjuryTag','LastUpdated','RotowirePlayerID','MLBId','DateAdded']);
    sheet.setFrozenRows(1);
  } else {
    // Detect old 5-column format and migrate to new 11-column format
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length < 11 || String(headers[3]).toLowerCase().indexOf('headline') === -1) {
      // Archive old data to rotowire_news_old, then recreate
      var oldSheet = ss.getSheetByName('rotowire_news_old');
      if (!oldSheet && sheet.getLastRow() > 1) {
        sheet.setName('rotowire_news_old');
        sheet = ss.insertSheet('rotowire_news');
        sheet.appendRow(['PlayerName','Team','Position','NewsHeadline','NewsUpdate','Analysis','InjuryTag','LastUpdated','RotowirePlayerID','MLBId','DateAdded']);
        sheet.setFrozenRows(1);
        Logger.log('ensureRotowireSheet_: migrated old sheet to rotowire_news_old, created new rotowire_news');
      } else if (sheet.getLastRow() <= 1) {
        // Empty old sheet — just rewrite header
        sheet.clear();
        sheet.appendRow(['PlayerName','Team','Position','NewsHeadline','NewsUpdate','Analysis','InjuryTag','LastUpdated','RotowirePlayerID','MLBId','DateAdded']);
        sheet.setFrozenRows(1);
        Logger.log('ensureRotowireSheet_: rewrote headers on empty sheet');
      }
    }
  }
  return sheet;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROTOWIRE API — Player News Feed
// ═══════════════════════════════════════════════════════════════════════════

function fetchRotowireNews() {
  var sheet = ensureRotowireSheet_();
  var existingData = sheet.getDataRange().getValues();

  // Build composite key set: RotowirePlayerID|LastUpdated
  var existingKeys = {};
  var existingRowMap = {}; // key -> row index (1-based) for updates
  for (var i = 1; i < existingData.length; i++) {
    var ek = String(existingData[i][8]) + '|' + String(existingData[i][7]);
    existingKeys[ek] = true;
    existingRowMap[ek] = i + 1;
  }

  var url = ROTOWIRE_NEWS_URL + '&hours=48';
  var resp;
  try {
    resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch(e) {
    Logger.log('fetchRotowireNews: fetch failed: ' + e.toString());
    return { success: false, error: e.toString() };
  }
  if (resp.getResponseCode() !== 200) {
    Logger.log('fetchRotowireNews: HTTP ' + resp.getResponseCode());
    return { success: false, error: 'HTTP ' + resp.getResponseCode() };
  }

  var json;
  try { json = JSON.parse(resp.getContentText()); } catch(e) {
    Logger.log('fetchRotowireNews: JSON parse error: ' + e.toString());
    return { success: false, error: 'Invalid JSON' };
  }

  // API returns { Date: "...", Updates: [ ... ] }
  var items = json.Updates || json.updates || (Array.isArray(json) ? json : []);
  var dateAdded = new Date().toISOString();
  var newRows = [];
  var updatedCount = 0;

  for (var j = 0; j < items.length; j++) {
    var it = items[j];
    var player = it.Player || {};
    var teamObj = it.Team || {};
    var injury = player.Injury || {};

    var playerId = String(player.Id || it.Id || '');
    var lastUpdated = String(it.DateTime || it.Date || '');
    var compositeKey = playerId + '|' + lastUpdated;

    if (existingKeys[compositeKey]) continue;

    var playerName = ((player.FirstName || '') + ' ' + (player.LastName || '')).trim();
    var team = String(teamObj.Nickname || teamObj.Name || '');
    var position = String(player.Position || '');
    var headline = String(it.Headline || '');
    var newsUpdate = String(it.Notes || '');
    var analysis = String(it.Analysis || '');
    // Build injury tag from injury data if present
    var injuryTag = '';
    if (injury.Type) injuryTag = String(injury.Type).toUpperCase();
    if (injury.Status && !injuryTag) injuryTag = String(injury.Status).toUpperCase();
    var mlbId = String(player.MLBId || '');

    newRows.push([playerName, team, position, headline, newsUpdate, analysis, injuryTag, lastUpdated, playerId, mlbId, dateAdded]);
    existingKeys[compositeKey] = true;
  }

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 11).setValues(newRows);
    SpreadsheetApp.flush();
  }

  // Build player ID mapping after news fetch
  buildPlayerIdMapping();

  Logger.log('Rotowire News: ' + newRows.length + ' new items added, ' + updatedCount + ' updated');
  return { success: true, newItems: newRows.length, updated: updatedCount };
}

function setupRotowireNewsTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var handler = triggers[i].getHandlerFunction();
    if (handler === 'fetchRotowireNews' || handler === 'fetchPublicRotowireNews' || handler === 'fetchPublicRotowireNews_DISABLED') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('fetchRotowireNews')
    .timeBased()
    .everyMinutes(10)
    .create();
  Logger.log('setupRotowireNewsTrigger: 10-minute trigger created');
}

// ═══════════════════════════════════════════════════════════════════════════
// ROTOWIRE API — Injury Feed
// ═══════════════════════════════════════════════════════════════════════════

function fetchRotowireInjuries() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_injuries');
  if (!sheet) {
    sheet = ss.insertSheet('rotowire_injuries');
    sheet.appendRow(['PlayerName','Team','Position','InjuryType','InjuryStatus','ReturnDate','InjuryNotes','RotowirePlayerID','MLBId','LastUpdated']);
    sheet.setFrozenRows(1);
  }

  var resp;
  try {
    resp = UrlFetchApp.fetch(ROTOWIRE_INJURIES_URL, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch(e) {
    Logger.log('fetchRotowireInjuries: fetch failed: ' + e.toString());
    return { success: false, error: e.toString() };
  }
  if (resp.getResponseCode() !== 200) {
    Logger.log('fetchRotowireInjuries: HTTP ' + resp.getResponseCode());
    return { success: false, error: 'HTTP ' + resp.getResponseCode() };
  }

  var json;
  try { json = JSON.parse(resp.getContentText()); } catch(e) {
    Logger.log('fetchRotowireInjuries: JSON parse error: ' + e.toString());
    return { success: false, error: 'Invalid JSON' };
  }

  // API returns { Players: [ ... ] }
  var items = json.Players || json.players || (Array.isArray(json) ? json : []);
  var lastUpdated = new Date().toISOString();
  var rows = [];

  for (var j = 0; j < items.length; j++) {
    var it = items[j];
    var teamObj = it.Team || {};
    var injury = it.Injury || {};

    var playerName = ((it.FirstName || '') + ' ' + (it.LastName || '')).trim();
    var teamCode = String(teamObj.Code || '');

    rows.push([
      playerName,
      teamCode,
      String(it.Position || ''),
      String(it.InjuryType || injury.Type || ''),
      String(it.InjuryStatus || injury.Status || ''),
      String(it.ReturnDate || injury.ReturnDate || ''),
      String((it.InjuryDetail || injury.Detail || '') + (it.InjurySide ? ' (' + it.InjurySide + ')' : '')).trim(),
      String(it.Id || ''),
      String(it.MLBId || ''),
      lastUpdated
    ]);
  }

  // Clear and rewrite fresh
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).clearContent();
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 10).setValues(rows);
  }
  SpreadsheetApp.flush();

  Logger.log('Rotowire Injuries: ' + rows.length + ' players on injury report');
  return { success: true, count: rows.length };
}

function setupRotowireInjuriesTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'fetchRotowireInjuries') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('fetchRotowireInjuries')
    .timeBased()
    .everyMinutes(10)
    .create();
  Logger.log('setupRotowireInjuriesTrigger: 10-minute trigger created');
}

// ═══════════════════════════════════════════════════════════════════════════
// ROTOWIRE — Historical Backfill (90 days)
// ═══════════════════════════════════════════════════════════════════════════

function backfillRotowireNews() {
  var startTime = new Date();
  var MAX_MS = 5 * 60 * 1000; // 5 minutes
  var BACKFILL_DAYS = 90;
  var props = PropertiesService.getScriptProperties();

  var sheet = ensureRotowireSheet_();
  var existingData = sheet.getDataRange().getValues();

  // Build composite key set: RotowirePlayerID|LastUpdated
  var existingKeys = {};
  for (var i = 1; i < existingData.length; i++) {
    var ek = String(existingData[i][8]) + '|' + String(existingData[i][7]);
    existingKeys[ek] = true;
  }

  // Determine start date — resume from last run or start from today
  var today = new Date();
  var startDate;
  var resumeStr = props.getProperty('backfillLastDate');
  if (resumeStr) {
    // Parse stored MMDDYYYY
    var m = parseInt(resumeStr.substring(0, 2), 10) - 1;
    var d = parseInt(resumeStr.substring(2, 4), 10);
    var y = parseInt(resumeStr.substring(4, 8), 10);
    startDate = new Date(y, m, d);
    // Move one day earlier since this date was already processed
    startDate.setDate(startDate.getDate() - 1);
    Logger.log('backfillRotowireNews: resuming from ' + resumeStr);
  } else {
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 1); // start from yesterday (today handled by regular fetch)
  }

  // Calculate end date (90 days before today)
  var endDate = new Date(today);
  endDate.setDate(endDate.getDate() - BACKFILL_DAYS);

  var totalAdded = 0;
  var dateCount = 0;
  var currentDate = new Date(startDate);

  while (currentDate >= endDate) {
    // Check execution time
    if (new Date().getTime() - startTime.getTime() > MAX_MS) {
      var stopStr = fmtBackfillDate(currentDate);
      // Store where we stopped (the date we haven't processed yet + 1 day = next to process)
      var nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      props.setProperty('backfillLastDate', fmtBackfillDate(nextDate));
      SpreadsheetApp.flush();
      Logger.log('Execution time limit approaching — stopped at ' + stopStr + '. Re-run backfillRotowireNews() to continue from where it left off.');
      Logger.log('Total new items added this run: ' + totalAdded);
      return { success: true, stopped: true, lastDate: stopStr, added: totalAdded };
    }

    var dateStr = fmtBackfillDate(currentDate);
    var url = ROTOWIRE_NEWS_URL + '&date=' + dateStr;

    try {
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (resp.getResponseCode() === 200) {
        var json = JSON.parse(resp.getContentText());
        var items = json.Updates || json.updates || (Array.isArray(json) ? json : []);
        var dateAdded = new Date().toISOString();
        var newRows = [];

        for (var j = 0; j < items.length; j++) {
          var it = items[j];
          var player = it.Player || {};
          var teamObj = it.Team || {};
          var injury = player.Injury || {};

          var playerId = String(player.Id || it.Id || '');
          var lastUpdated = String(it.DateTime || it.Date || '');
          var compositeKey = playerId + '|' + lastUpdated;

          if (existingKeys[compositeKey]) continue;

          var playerName = ((player.FirstName || '') + ' ' + (player.LastName || '')).trim();
          var team = String(teamObj.Nickname || teamObj.Name || '');
          var position = String(player.Position || '');
          var headline = String(it.Headline || '');
          var newsUpdate = String(it.Notes || '');
          var analysis = String(it.Analysis || '');
          var injuryTag = '';
          if (injury.Type) injuryTag = String(injury.Type).toUpperCase();
          if (injury.Status && !injuryTag) injuryTag = String(injury.Status).toUpperCase();
          var mlbId = String(player.MLBId || '');

          newRows.push([playerName, team, position, headline, newsUpdate, analysis, injuryTag, lastUpdated, playerId, mlbId, dateAdded]);
          existingKeys[compositeKey] = true;
        }

        if (newRows.length > 0) {
          sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 11).setValues(newRows);
          totalAdded += newRows.length;
        }

        Logger.log('Backfill ' + dateStr + ': ' + newRows.length + ' new items added');
      } else {
        Logger.log('Backfill ' + dateStr + ': HTTP ' + resp.getResponseCode());
      }
    } catch(e) {
      Logger.log('Backfill ' + dateStr + ': error — ' + e.toString());
    }

    dateCount++;

    // Flush every 5 dates to avoid data loss
    if (dateCount % 5 === 0) {
      SpreadsheetApp.flush();
    }

    // Rate limit pause
    Utilities.sleep(1000);

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // All done — clean up resume property
  props.deleteProperty('backfillLastDate');
  SpreadsheetApp.flush();

  // Rebuild player ID mappings with all new data
  buildPlayerIdMapping();

  Logger.log('Backfill complete. Total new items added: ' + totalAdded + '. Player ID mappings updated.');
  return { success: true, stopped: false, added: totalAdded };
}

function fmtBackfillDate(d) {
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  var yyyy = String(d.getFullYear());
  return mm + dd + yyyy;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROTOWIRE — Player ID Mapping
// ═══════════════════════════════════════════════════════════════════════════

function buildPlayerIdMapping() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var newsSheet = ss.getSheetByName('rotowire_news');
  if (!newsSheet) return;

  var mapSheet = ss.getSheetByName('player_id_map');
  if (!mapSheet) {
    mapSheet = ss.insertSheet('player_id_map');
    mapSheet.appendRow(['MLBId','PlayerName','Team','RotowirePlayerID','LastSeen']);
    mapSheet.setFrozenRows(1);
  }

  // Read existing mappings
  var existingData = mapSheet.getDataRange().getValues();
  var existingMLBIds = {};
  for (var i = 1; i < existingData.length; i++) {
    existingMLBIds[String(existingData[i][0])] = true;
  }

  // Read news sheet for unique MLBId entries
  var newsData = newsSheet.getDataRange().getValues();
  var newMappings = {};
  for (var j = 1; j < newsData.length; j++) {
    var mlbId = String(newsData[j][9] || '');
    if (!mlbId || mlbId === '' || mlbId === 'undefined' || existingMLBIds[mlbId]) continue;
    if (newMappings[mlbId]) continue;
    newMappings[mlbId] = {
      playerName: String(newsData[j][0] || ''),
      team: String(newsData[j][1] || ''),
      rwId: String(newsData[j][8] || ''),
      lastSeen: String(newsData[j][7] || '')
    };
  }

  var newRows = [];
  var ids = Object.keys(newMappings);
  for (var k = 0; k < ids.length; k++) {
    var m = newMappings[ids[k]];
    newRows.push([ids[k], m.playerName, m.team, m.rwId, m.lastSeen]);
  }

  if (newRows.length > 0) {
    mapSheet.getRange(mapSheet.getLastRow() + 1, 1, newRows.length, 5).setValues(newRows);
    SpreadsheetApp.flush();
  }
  Logger.log('buildPlayerIdMapping: added ' + newRows.length + ' new mappings');
}

// ═══════════════════════════════════════════════════════════════════════════
// ROTOWIRE — GAS Actions (query by player)
// ═══════════════════════════════════════════════════════════════════════════

function getPlayerInjuryStatus(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_injuries');
  if (!sheet) return { success: true, injuryStatus: null };

  var playerName = params.playerName ? String(params.playerName) : '';
  var mlbId = params.mlbId ? String(params.mlbId) : '';
  var data = sheet.getDataRange().getValues();

  // Normalize for comparison
  var needle = playerName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (var i = 1; i < data.length; i++) {
    var rowName = String(data[i][0]).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var rowMlbId = String(data[i][8]);

    // When mlbId is provided, match ONLY by mlbId (avoids wrong player with same name)
    var isMatch = mlbId ? (rowMlbId === mlbId) : (needle && rowName === needle);
    if (isMatch) {
      return {
        success: true,
        playerName: String(data[i][0]),
        team: String(data[i][1]),
        injuryType: String(data[i][3]),
        injuryStatus: String(data[i][4]),
        returnDate: String(data[i][5]),
        injuryNotes: String(data[i][6]),
        mlbId: rowMlbId
      };
    }
  }
  return { success: true, injuryStatus: null };
}

function getInjuryReport() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_injuries');
  if (!sheet) return { success: true, players: [] };

  var data = sheet.getDataRange().getValues();
  var players = [];
  for (var i = 1; i < data.length; i++) {
    players.push({
      playerName: String(data[i][0] || ''),
      team: String(data[i][1] || ''),
      position: String(data[i][2] || ''),
      injuryType: String(data[i][3] || ''),
      injuryStatus: String(data[i][4] || ''),
      returnDate: String(data[i][5] || ''),
      injuryNotes: String(data[i][6] || ''),
      rotowireId: String(data[i][7] || ''),
      mlbId: String(data[i][8] || '')
    });
  }
  return { success: true, players: players };
}

function getRecentNewsPlayers() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_news');
  if (!sheet) return { success: true, players: [] };

  var data = sheet.getDataRange().getValues();
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);

  // Collect most recent entry per player (by MLBId or name)
  var byPlayer = {};
  for (var i = 1; i < data.length; i++) {
    var lastUpdated = data[i][7] ? new Date(data[i][7]) : null;
    if (!lastUpdated || lastUpdated < cutoff) continue;

    var mlbId = String(data[i][9] || '');
    var playerName = String(data[i][0] || '');
    var key = mlbId || playerName.toLowerCase();
    if (!key) continue;

    if (!byPlayer[key] || lastUpdated > byPlayer[key].date) {
      byPlayer[key] = {
        mlbId: mlbId,
        playerName: playerName,
        lastUpdated: lastUpdated.toISOString(),
        headline: String(data[i][3] || ''),
        date: lastUpdated
      };
    }
  }

  var players = [];
  var keys = Object.keys(byPlayer);
  for (var k = 0; k < keys.length; k++) {
    var p = byPlayer[keys[k]];
    players.push({ mlbId: p.mlbId, playerName: p.playerName, lastUpdated: p.lastUpdated, headline: p.headline });
  }

  return { success: true, players: players };
}

// ═══════════════════════════════════════════════════════════════════════════
// STEAMER PROJECTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Direct sheet lookup — no CacheService (dataset too large for cache limits).

function getPlayerProjections(params) {
  var mlbId = params.mlbId ? String(Math.round(Number(params.mlbId))) : '';
  var playerName = params.playerName ? String(params.playerName).trim() : '';
  Logger.log('getPlayerProjections: mlbId=' + mlbId + ' playerName=' + playerName);
  if (!mlbId && !playerName) return { success: false, error: 'mlbId or playerName required' };

  // Check cache first
  if (mlbId) {
    try {
      var cached = CacheService.getScriptCache().get('stm_' + mlbId);
      if (cached) {
        Logger.log('Cache hit for mlbId: ' + mlbId);
        return { success: true, projection: JSON.parse(cached) };
      }
    } catch(e) {}
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Try hitters first
  var hitResult = _searchSteamerSheet(ss, 'steamer_hitters', 'hitting', mlbId, playerName);
  if (hitResult) return { success: true, projection: hitResult };

  // Fall back to pitchers
  var pitResult = _searchSteamerSheet(ss, 'steamer_pitchers', 'pitching', mlbId, playerName);
  if (pitResult) return { success: true, projection: pitResult };

  Logger.log('Not found in hitters or pitchers: mlbId=' + mlbId);
  return { success: true, projection: null };
}

function _searchSteamerSheet(ss, sheetName, type, mlbId, playerName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var col = function(name) { return headers.indexOf(name); };

  var cMid = col('MLBAMID');
  var cName = col('Name');
  if (cMid === -1) return null;

  for (var i = 1; i < data.length; i++) {
    var rowMid = String(Math.round(Number(data[i][cMid])));
    var rowName = cName !== -1 ? String(data[i][cName] || '').toLowerCase() : '';
    var match = (mlbId && rowMid === mlbId) || (playerName && rowName === playerName.toLowerCase());
    if (!match) continue;

    Logger.log('Found in ' + sheetName + ': ' + rowName + ' at row ' + (i + 1));

    if (type === 'pitching') {
      return {
        source: 'Steamer 2026', type: 'pitching',
        fgId: col('PlayerId') !== -1 ? String(data[i][col('PlayerId')] || '') : '',
        name: cName !== -1 ? String(data[i][cName] || '') : '',
        team: col('Team') !== -1 ? String(data[i][col('Team')] || '') : '',
        g: Math.round(Number(data[i][col('G')]) || 0),
        gs: Math.round(Number(data[i][col('GS')]) || 0),
        ip: parseFloat((Number(data[i][col('IP')]) || 0).toFixed(1)),
        w: parseFloat((Number(data[i][col('W')]) || 0).toFixed(1)),
        l: parseFloat((Number(data[i][col('L')]) || 0).toFixed(1)),
        sv: Math.round(Number(data[i][col('SV')]) || 0),
        hld: Math.round(Number(data[i][col('HLD')]) || 0),
        qs: Math.round(Number(data[i][col('QS')]) || 0),
        so: Math.round(Number(data[i][col('SO')]) || 0),
        bb: Math.round(Number(data[i][col('BB')]) || 0),
        era: parseFloat((Number(data[i][col('ERA')]) || 0).toFixed(2)),
        whip: parseFloat((Number(data[i][col('WHIP')]) || 0).toFixed(2)),
        fip: parseFloat((Number(data[i][col('FIP')]) || 0).toFixed(2)),
        k9: parseFloat((Number(data[i][col('K9')]) || 0).toFixed(1)),
        bb9: parseFloat((Number(data[i][col('BB9')]) || 0).toFixed(1)),
        war: parseFloat((Number(data[i][col('WAR')]) || 0).toFixed(1)),
        babip: parseFloat((Number(data[i][col('BABIP')]) || 0).toFixed(3)),
        hr: Math.round(Number(data[i][col('HR')]) || 0),
        h: Math.round(Number(data[i][col('H')]) || 0),
        er: Math.round(Number(data[i][col('ER')]) || 0)
      };
    } else {
      return {
        source: 'Steamer 2026', type: 'hitting',
        fgId: col('PlayerId') !== -1 ? String(data[i][col('PlayerId')] || '') : '',
        name: cName !== -1 ? String(data[i][cName] || '') : '',
        team: col('Team') !== -1 ? String(data[i][col('Team')] || '') : '',
        g: Math.round(Number(data[i][col('G')]) || 0),
        pa: Math.round(Number(data[i][col('PA')]) || 0),
        ab: Math.round(Number(data[i][col('AB')]) || 0),
        h: Math.round(Number(data[i][col('H')]) || 0),
        '2b': Math.round(Number(data[i][col('2B')]) || 0),
        '3b': Math.round(Number(data[i][col('3B')]) || 0),
        hr: Math.round(Number(data[i][col('HR')]) || 0),
        r: Math.round(Number(data[i][col('R')]) || 0),
        rbi: Math.round(Number(data[i][col('RBI')]) || 0),
        sb: Math.round(Number(data[i][col('SB')]) || 0),
        bb: Math.round(Number(data[i][col('BB')]) || 0),
        so: Math.round(Number(data[i][col('SO')]) || 0),
        avg: parseFloat((Number(data[i][col('AVG')]) || 0).toFixed(3)),
        obp: parseFloat((Number(data[i][col('OBP')]) || 0).toFixed(3)),
        slg: parseFloat((Number(data[i][col('SLG')]) || 0).toFixed(3)),
        woba: parseFloat((Number(data[i][col('wOBA')]) || 0).toFixed(3)),
        wrcplus: Math.round(Number(data[i][col('wRC+')]) || 0),
        war: parseFloat((Number(data[i][col('WAR')]) || 0).toFixed(1)),
        iso: parseFloat((Number(data[i][col('ISO')]) || 0).toFixed(3)),
        babip: parseFloat((Number(data[i][col('BABIP')]) || 0).toFixed(3))
      };
    }
  }
  return null;
}

function testProjections() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('steamer_hitters');
  if (!sheet) return { success: false, error: 'steamer_hitters sheet not found' };

  var totalRows = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h) { return String(h).trim(); });
  var cMid = headers.indexOf('MLBAMID');

  var sampleRows = [];
  var rowCount = Math.min(3, totalRows - 1);
  if (rowCount > 0) {
    var data = sheet.getRange(2, 1, rowCount, sheet.getLastColumn()).getValues();
    for (var i = 0; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      sampleRows.push(row);
    }
  }

  // Test a direct lookup using first row's MLBAMID
  var testLookup = null;
  if (sampleRows.length > 0 && sampleRows[0].MLBAMID != null) {
    var testId = String(Math.round(Number(sampleRows[0].MLBAMID)));
    Logger.log('testProjections: looking up ID: ' + testId + ' (raw: ' + sampleRows[0].MLBAMID + ')');
    testLookup = getPlayerProjections({ mlbId: testId });
  }

  return {
    success: true,
    sheetFound: true,
    totalRows: totalRows,
    mlbamidCol: cMid,
    headerCount: headers.length,
    headersFirst5: headers.slice(0, 5),
    headersLast5: headers.slice(-5),
    sampleRows: sampleRows,
    testLookup: testLookup
  };
}

function getPlayerProjectionsBatch(params) {
  var ids = params.mlbIds ? String(params.mlbIds).split(',') : [];
  if (!ids.length) return { success: false, error: 'mlbIds required' };

  ids = ids.map(function(id) { return String(Math.round(Number(id))); }).filter(function(id) { return id && id !== 'NaN'; });

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var result = {};
  var idSet = {};
  ids.forEach(function(id) { idSet[id] = true; });

  // Search hitters first
  _batchSearchSheet(ss, 'steamer_hitters', 'hitting', idSet, result);

  // Search pitchers for any remaining IDs
  if (Object.keys(idSet).length > 0) {
    _batchSearchSheet(ss, 'steamer_pitchers', 'pitching', idSet, result);
  }

  Logger.log('getPlayerProjectionsBatch: requested ' + ids.length + ', found ' + Object.keys(result).length);
  return { success: true, projections: result };
}

function _batchSearchSheet(ss, sheetName, type, idSet, result) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var cMid = headers.indexOf('MLBAMID');
  if (cMid === -1) return;

  for (var i = 1; i < data.length; i++) {
    var mid = String(Math.round(Number(data[i][cMid])));
    if (mid && idSet[mid]) {
      result[mid] = _buildProjectionFromRow(data[i], headers, type);
      delete idSet[mid];
      if (Object.keys(idSet).length === 0) break;
    }
  }
}

function _buildProjectionFromRow(row, headers, type) {
  var col = function(name) { return headers.indexOf(name); };
  var cName = col('Name');

  if (type === 'pitching') {
    return {
      source: 'Steamer 2026', type: 'pitching',
      fgId: col('PlayerId') !== -1 ? String(row[col('PlayerId')] || '') : '',
      name: cName !== -1 ? String(row[cName] || '') : '',
      team: col('Team') !== -1 ? String(row[col('Team')] || '') : '',
      g: Math.round(Number(row[col('G')]) || 0),
      gs: Math.round(Number(row[col('GS')]) || 0),
      ip: parseFloat((Number(row[col('IP')]) || 0).toFixed(1)),
      w: parseFloat((Number(row[col('W')]) || 0).toFixed(1)),
      l: parseFloat((Number(row[col('L')]) || 0).toFixed(1)),
      sv: Math.round(Number(row[col('SV')]) || 0),
      hld: Math.round(Number(row[col('HLD')]) || 0),
      qs: Math.round(Number(row[col('QS')]) || 0),
      so: Math.round(Number(row[col('SO')]) || 0),
      bb: Math.round(Number(row[col('BB')]) || 0),
      era: parseFloat((Number(row[col('ERA')]) || 0).toFixed(2)),
      whip: parseFloat((Number(row[col('WHIP')]) || 0).toFixed(2)),
      fip: parseFloat((Number(row[col('FIP')]) || 0).toFixed(2)),
      k9: parseFloat((Number(row[col('K9')]) || 0).toFixed(1)),
      bb9: parseFloat((Number(row[col('BB9')]) || 0).toFixed(1)),
      war: parseFloat((Number(row[col('WAR')]) || 0).toFixed(1)),
      babip: parseFloat((Number(row[col('BABIP')]) || 0).toFixed(3)),
      hr: Math.round(Number(row[col('HR')]) || 0),
      h: Math.round(Number(row[col('H')]) || 0),
      er: Math.round(Number(row[col('ER')]) || 0)
    };
  } else {
    return {
      source: 'Steamer 2026', type: 'hitting',
      fgId: col('PlayerId') !== -1 ? String(row[col('PlayerId')] || '') : '',
      name: cName !== -1 ? String(row[cName] || '') : '',
      team: col('Team') !== -1 ? String(row[col('Team')] || '') : '',
      g: Math.round(Number(row[col('G')]) || 0),
      pa: Math.round(Number(row[col('PA')]) || 0),
      ab: Math.round(Number(row[col('AB')]) || 0),
      h: Math.round(Number(row[col('H')]) || 0),
      '2b': Math.round(Number(row[col('2B')]) || 0),
      '3b': Math.round(Number(row[col('3B')]) || 0),
      hr: Math.round(Number(row[col('HR')]) || 0),
      r: Math.round(Number(row[col('R')]) || 0),
      rbi: Math.round(Number(row[col('RBI')]) || 0),
      sb: Math.round(Number(row[col('SB')]) || 0),
      bb: Math.round(Number(row[col('BB')]) || 0),
      so: Math.round(Number(row[col('SO')]) || 0),
      avg: parseFloat((Number(row[col('AVG')]) || 0).toFixed(3)),
      obp: parseFloat((Number(row[col('OBP')]) || 0).toFixed(3)),
      slg: parseFloat((Number(row[col('SLG')]) || 0).toFixed(3)),
      woba: parseFloat((Number(row[col('wOBA')]) || 0).toFixed(3)),
      wrcplus: Math.round(Number(row[col('wRC+')]) || 0),
      war: parseFloat((Number(row[col('WAR')]) || 0).toFixed(1)),
      iso: parseFloat((Number(row[col('ISO')]) || 0).toFixed(3)),
      babip: parseFloat((Number(row[col('BABIP')]) || 0).toFixed(3))
    };
  }
}

function warmSteamerCache() {
  var cache = CacheService.getScriptCache();
  var ss = SpreadsheetApp.openById('1RF9DqwS9U6rTNl2075aiaaatFLrl1wmDokOqV0jevE4');
  var hitterCount = 0;
  var pitcherCount = 0;

  // Warm hitters
  var hSheet = ss.getSheetByName('steamer_hitters');
  if (hSheet) {
    var hData = hSheet.getDataRange().getValues();
    var hHeaders = hData[0].map(function(h) { return String(h).trim(); });
    var cMid = hHeaders.indexOf('MLBAMID');
    var batch = {};
    var batchSize = 0;
    for (var i = 1; i < hData.length; i++) {
      var mid = String(Math.round(Number(hData[i][cMid])));
      if (!mid || mid === '0') continue;
      var proj = {
        source: 'Steamer 2026', type: 'hitting',
        fgId: String(hData[i][hHeaders.indexOf('PlayerId')] || ''),
        name: String(hData[i][hHeaders.indexOf('Name')] || ''),
        team: String(hData[i][hHeaders.indexOf('Team')] || ''),
        g: Math.round(Number(hData[i][hHeaders.indexOf('G')]) || 0),
        pa: Math.round(Number(hData[i][hHeaders.indexOf('PA')]) || 0),
        ab: Math.round(Number(hData[i][hHeaders.indexOf('AB')]) || 0),
        h: Math.round(Number(hData[i][hHeaders.indexOf('H')]) || 0),
        '2b': Math.round(Number(hData[i][hHeaders.indexOf('2B')]) || 0),
        '3b': Math.round(Number(hData[i][hHeaders.indexOf('3B')]) || 0),
        hr: Math.round(Number(hData[i][hHeaders.indexOf('HR')]) || 0),
        r: Math.round(Number(hData[i][hHeaders.indexOf('R')]) || 0),
        rbi: Math.round(Number(hData[i][hHeaders.indexOf('RBI')]) || 0),
        sb: Math.round(Number(hData[i][hHeaders.indexOf('SB')]) || 0),
        bb: Math.round(Number(hData[i][hHeaders.indexOf('BB')]) || 0),
        so: Math.round(Number(hData[i][hHeaders.indexOf('SO')]) || 0),
        avg: parseFloat((Number(hData[i][hHeaders.indexOf('AVG')]) || 0).toFixed(3)),
        obp: parseFloat((Number(hData[i][hHeaders.indexOf('OBP')]) || 0).toFixed(3)),
        slg: parseFloat((Number(hData[i][hHeaders.indexOf('SLG')]) || 0).toFixed(3)),
        woba: parseFloat((Number(hData[i][hHeaders.indexOf('wOBA')]) || 0).toFixed(3)),
        wrcplus: Math.round(Number(hData[i][hHeaders.indexOf('wRC+')]) || 0),
        war: parseFloat((Number(hData[i][hHeaders.indexOf('WAR')]) || 0).toFixed(1))
      };
      batch['stm_' + mid] = JSON.stringify(proj);
      batchSize++;
      if (batchSize >= 25) {
        try { cache.putAll(batch, 21600); } catch(e) {}
        batch = {};
        batchSize = 0;
      }
      hitterCount++;
    }
    if (batchSize > 0) { try { cache.putAll(batch, 21600); } catch(e) {} }
  }

  // Warm pitchers
  var pSheet = ss.getSheetByName('steamer_pitchers');
  if (pSheet) {
    var pData = pSheet.getDataRange().getValues();
    var pHeaders = pData[0].map(function(h) { return String(h).trim(); });
    var pMid = pHeaders.indexOf('MLBAMID');
    var pBatch = {};
    var pBatchSize = 0;
    for (var j = 1; j < pData.length; j++) {
      var pmid = String(Math.round(Number(pData[j][pMid])));
      if (!pmid || pmid === '0') continue;
      var pproj = {
        source: 'Steamer 2026', type: 'pitching',
        fgId: String(pData[j][pHeaders.indexOf('PlayerId')] || ''),
        name: String(pData[j][pHeaders.indexOf('Name')] || ''),
        team: String(pData[j][pHeaders.indexOf('Team')] || ''),
        g: Math.round(Number(pData[j][pHeaders.indexOf('G')]) || 0),
        gs: Math.round(Number(pData[j][pHeaders.indexOf('GS')]) || 0),
        ip: parseFloat((Number(pData[j][pHeaders.indexOf('IP')]) || 0).toFixed(1)),
        w: parseFloat((Number(pData[j][pHeaders.indexOf('W')]) || 0).toFixed(1)),
        l: parseFloat((Number(pData[j][pHeaders.indexOf('L')]) || 0).toFixed(1)),
        sv: Math.round(Number(pData[j][pHeaders.indexOf('SV')]) || 0),
        hld: Math.round(Number(pData[j][pHeaders.indexOf('HLD')]) || 0),
        qs: Math.round(Number(pData[j][pHeaders.indexOf('QS')]) || 0),
        so: Math.round(Number(pData[j][pHeaders.indexOf('SO')]) || 0),
        bb: Math.round(Number(pData[j][pHeaders.indexOf('BB')]) || 0),
        era: parseFloat((Number(pData[j][pHeaders.indexOf('ERA')]) || 0).toFixed(2)),
        whip: parseFloat((Number(pData[j][pHeaders.indexOf('WHIP')]) || 0).toFixed(2)),
        fip: parseFloat((Number(pData[j][pHeaders.indexOf('FIP')]) || 0).toFixed(2)),
        k9: parseFloat((Number(pData[j][pHeaders.indexOf('K9')]) || 0).toFixed(1)),
        bb9: parseFloat((Number(pData[j][pHeaders.indexOf('BB9')]) || 0).toFixed(1)),
        war: parseFloat((Number(pData[j][pHeaders.indexOf('WAR')]) || 0).toFixed(1)),
        hr: Math.round(Number(pData[j][pHeaders.indexOf('HR')]) || 0),
        h: Math.round(Number(pData[j][pHeaders.indexOf('H')]) || 0),
        er: Math.round(Number(pData[j][pHeaders.indexOf('ER')]) || 0)
      };
      pBatch['stm_' + pmid] = JSON.stringify(pproj);
      pBatchSize++;
      if (pBatchSize >= 25) {
        try { cache.putAll(pBatch, 21600); } catch(e) {}
        pBatch = {};
        pBatchSize = 0;
      }
      pitcherCount++;
    }
    if (pBatchSize > 0) { try { cache.putAll(pBatch, 21600); } catch(e) {} }
  }

  Logger.log('Steamer cache warmed — ' + hitterCount + ' hitters, ' + pitcherCount + ' pitchers');
  return { success: true, hitters: hitterCount, pitchers: pitcherCount };
}

function getPlayerNewsByMLBId(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_news');
  if (!sheet) return { success: true, latest: null, newsHistory: [] };

  var mlbId = params.mlbId ? String(params.mlbId) : '';
  var playerName = params.playerName ? String(params.playerName).toLowerCase() : '';
  if (!mlbId && !playerName) return { success: false, error: 'mlbId or playerName required' };

  var data = sheet.getDataRange().getValues();
  var matches = [];

  for (var i = 1; i < data.length; i++) {
    var rowMlbId = String(data[i][9] || '');
    var rowName = String(data[i][0] || '').toLowerCase();
    // When mlbId is provided, match ONLY by mlbId (avoids wrong player with same name)
    var isMatch = mlbId ? (rowMlbId === mlbId) : (playerName && rowName === playerName);
    if (isMatch) {
      matches.push({
        playerName: String(data[i][0]),
        team: String(data[i][1]),
        position: String(data[i][2]),
        newsHeadline: String(data[i][3]),
        newsUpdate: String(data[i][4]),
        analysis: String(data[i][5]),
        injuryTag: String(data[i][6]),
        lastUpdated: String(data[i][7]),
        rotowirePlayerID: String(data[i][8]),
        mlbId: String(data[i][9])
      });
    }
  }

  // Sort by lastUpdated descending
  matches.sort(function(a, b) {
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  var latest = matches.length > 0 ? matches[0] : null;
  var newsHistory = matches.slice(0, 5);

  // Build Rotowire player page URL from name + rotowirePlayerID
  var rotowireUrl = '';
  if (latest) {
    var rwName = latest.playerName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    rotowireUrl = 'https://www.rotowire.com/baseball/player/' + rwName + (latest.rotowirePlayerID ? '-' + latest.rotowirePlayerID : '');
  }

  return { success: true, latest: latest, newsHistory: newsHistory, rotowireUrl: rotowireUrl };
}

// ── Legacy getPlayerNews (updated for new columns, backward compatible) ──
function getPlayerNews(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_news');
  if (!sheet) return { success: true, items: [] };

  var data = sheet.getDataRange().getValues();
  var headers = data[0] || [];
  var isNewFormat = headers.length >= 11 && String(headers[3]).toLowerCase().indexOf('headline') !== -1;
  var playerNameFilter = params.playerName ? String(params.playerName).toLowerCase() : '';

  var playerBlurbs = {};
  for (var i = 1; i < data.length; i++) {
    var rowPlayer = String(data[i][0]);
    if (playerNameFilter && rowPlayer.toLowerCase() !== playerNameFilter) continue;

    var key = rowPlayer.toLowerCase();
    var blurbText, blurbDate;
    if (isNewFormat) {
      var headline = String(data[i][3] || '');
      var newsUpdate = String(data[i][4] || '');
      var analysis = String(data[i][5] || '');
      blurbText = headline;
      if (newsUpdate) blurbText += (blurbText ? ' — ' : '') + newsUpdate;
      if (analysis) blurbText += ' | ANALYSIS: ' + analysis;
      blurbDate = data[i][7] ? new Date(data[i][7]) : new Date(0);
    } else {
      blurbText = String(data[i][2] || '');
      blurbDate = data[i][3] ? new Date(data[i][3]) : new Date(0);
    }

    if (!playerBlurbs[key] || blurbDate.getTime() > playerBlurbs[key].blurbDate.getTime()) {
      playerBlurbs[key] = { playerName: rowPlayer, blurbText: blurbText, blurbDate: blurbDate };
    }
  }

  var items = [];
  var keys = Object.keys(playerBlurbs);
  for (var k = 0; k < keys.length; k++) {
    var entry = playerBlurbs[keys[k]];
    items.push({ playerName: entry.playerName, blurbText: entry.blurbText, blurbDate: entry.blurbDate.toISOString() });
  }
  items.sort(function(a, b) { return new Date(b.blurbDate).getTime() - new Date(a.blurbDate).getTime(); });
  return { success: true, items: items };
}

// ── Legacy getPlayerNewsHistory (updated for new columns) ──
function getPlayerNewsHistory(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_news');
  if (!sheet) return { success: true, items: [] };

  var playerName = params.playerName ? String(params.playerName).toLowerCase() : '';
  if (!playerName) return { success: false, error: 'playerName required' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0] || [];
  var isNewFormat = headers.length >= 11 && String(headers[3]).toLowerCase().indexOf('headline') !== -1;
  var items = [];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() !== playerName) continue;
    var blurbText, blurbDate;
    if (isNewFormat) {
      var headline = String(data[i][3] || '');
      var newsUpdate = String(data[i][4] || '');
      var analysis = String(data[i][5] || '');
      blurbText = headline;
      if (newsUpdate) blurbText += (blurbText ? ' — ' : '') + newsUpdate;
      if (analysis) blurbText += ' | ANALYSIS: ' + analysis;
      blurbDate = data[i][7] ? new Date(data[i][7]).toISOString() : '';
    } else {
      blurbText = String(data[i][2] || '');
      blurbDate = data[i][3] ? new Date(data[i][3]).toISOString() : '';
    }
    items.push({ playerName: String(data[i][0]), blurbText: blurbText, blurbDate: blurbDate });
  }
  items.sort(function(a, b) { return new Date(b.blurbDate).getTime() - new Date(a.blurbDate).getTime(); });
  return { success: true, items: items };
}

function getWaiverWireNews() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var newsSheet = ss.getSheetByName('rotowire_news');
  if (!newsSheet) return { success: true, items: [] };

  var newsData = newsSheet.getDataRange().getValues();
  var headers = newsData[0] || [];
  var isNewFormat = headers.length >= 11 && String(headers[3]).toLowerCase().indexOf('headline') !== -1;
  var latestByPlayer = {};

  for (var i = 1; i < newsData.length; i++) {
    var pName = String(newsData[i][0]);
    var pKey = pName.toLowerCase();
    var blurbDate, blurbText;
    if (isNewFormat) {
      blurbDate = newsData[i][7] ? new Date(newsData[i][7]) : new Date(0);
      var headline = String(newsData[i][3] || '');
      var newsUpdate = String(newsData[i][4] || '');
      blurbText = headline;
      if (newsUpdate) blurbText += (blurbText ? ' — ' : '') + newsUpdate;
    } else {
      blurbDate = newsData[i][3] ? new Date(newsData[i][3]) : new Date(0);
      blurbText = String(newsData[i][2] || '');
    }
    if (!latestByPlayer[pKey] || blurbDate.getTime() > latestByPlayer[pKey].date) {
      latestByPlayer[pKey] = { playerName: pName, blurbText: blurbText, blurbDate: blurbDate.toISOString(), date: blurbDate.getTime() };
    }
  }

  var items = [];
  var keys = Object.keys(latestByPlayer);
  for (var k = 0; k < keys.length; k++) {
    var entry = latestByPlayer[keys[k]];
    items.push({ playerName: entry.playerName, blurbText: entry.blurbText, blurbDate: entry.blurbDate });
  }
  items.sort(function(a, b) { return new Date(b.blurbDate).getTime() - new Date(a.blurbDate).getTime(); });
  return { success: true, items: items };
}

// ── DISABLED: Old RSS-based fetchers (replaced by Rotowire API) ──
function fetchPublicRotowireNews_DISABLED() {
  Logger.log('fetchPublicRotowireNews_DISABLED: This function has been replaced by fetchRotowireNews() using the Rotowire API.');
  return { success: false, error: 'Disabled — use fetchRotowireNews() instead' };
}

function setupPublicRotowireNewsTrigger_DISABLED() {
  Logger.log('Disabled — use setupRotowireNewsTrigger() instead');
}

// One-time cleanup: remove duplicate rows from rotowire_news sheet
function cleanRotowireNewsDuplicates() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('rotowire_news');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var seen = {};
  var rowsToDelete = [];

  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][8] || data[i][0]) + '|' + String(data[i][7] || data[i][3]);
    if (seen[key]) {
      rowsToDelete.push(i + 1);
    } else {
      seen[key] = true;
    }
  }

  for (var r = rowsToDelete.length - 1; r >= 0; r--) {
    sheet.deleteRow(rowsToDelete[r]);
  }

  SpreadsheetApp.flush();
  Logger.log('cleanRotowireNewsDuplicates: removed ' + rowsToDelete.length + ' duplicate rows');
}


// ═══════════════════════════════════════════════════════════════════════════
// DROP PLAYER — Immediate & Pending
// ═══════════════════════════════════════════════════════════════════════════

function ensurePendingDropsSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('pending_drops');
  if (!sheet) {
    sheet = ss.insertSheet('pending_drops');
    sheet.appendRow(['teamID', 'playerName', 'position', 'dropConfirmedAt', 'gamePeriodEnd', 'waiverClockStart', 'status']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function dropPlayerImmediate(params) {
  var team = params.team || params.teamID;
  var playerName = params.playerName;
  var position = params.position || '';
  var playerTeam = params.playerTeam || '';
  if (!team || !playerName) return { success: false, error: 'team and playerName required' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var now = new Date().toISOString();

  // Find owner name for log
  var ownerName = team;
  var teamNames = {
    'shawn': 'Shawn', 'davidz': 'David Z.', 'davidr': 'David R.', 'brian': 'Brian',
    'greg': 'Greg', 'jason': 'Jason', 'keith': 'Keith', 'bill': 'Bill',
    'jamie': 'Jamie', 'dan': 'Dan', 'jonas': 'Jonas', 'sam': 'Sam'
  };
  if (teamNames[team]) ownerName = teamNames[team];

  // Log the drop
  var logWs = ss.getSheetByName('log');
  if (!logWs) {
    logWs = ss.insertSheet('log');
    logWs.appendRow(['timestamp', 'type', 'team', 'details', 'period']);
  }
  logWs.appendRow([now, 'DROP', team, ownerName + '- drops ' + playerName + '.', params.period || '']);

  // Write roster move so the drop persists on page reload
  var moveWs = ss.getSheetByName('roster_moves');
  if (!moveWs) {
    moveWs = ss.insertSheet('roster_moves');
    moveWs.appendRow(['timestamp','team','addName','addPos','addTeam','dropName','dropPos','dropTeam']);
  }
  moveWs.appendRow([now, team, '', '', '', playerName, position, playerTeam]);

  SpreadsheetApp.flush();
  return { success: true, dropped: playerName, team: team, droppedAt: now };
}

function dropPlayerPending(params) {
  var team = params.team || params.teamID;
  var playerName = params.playerName;
  var position = params.position || '';
  var gamePeriodEnd = params.gamePeriodEnd || '';
  if (!team || !playerName) return { success: false, error: 'team and playerName required' };

  var sheet = ensurePendingDropsSheet_();
  var now = new Date().toISOString();

  // Check if already pending
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === team && String(data[i][1]) === playerName && String(data[i][6]) === 'pending') {
      return { success: false, error: 'Drop already pending for this player' };
    }
  }

  sheet.appendRow([team, playerName, position, now, gamePeriodEnd, gamePeriodEnd, 'pending']);
  SpreadsheetApp.flush();
  return { success: true, pending: true, playerName: playerName, gamePeriodEnd: gamePeriodEnd };
}

function getPendingDrops(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('pending_drops');
  if (!sheet) return { success: true, drops: [] };

  var data = sheet.getDataRange().getValues();
  var drops = [];
  for (var i = 1; i < data.length; i++) {
    var row = {
      teamID: String(data[i][0]),
      playerName: String(data[i][1]),
      position: String(data[i][2]),
      dropConfirmedAt: String(data[i][3]),
      gamePeriodEnd: String(data[i][4]),
      waiverClockStart: String(data[i][5]),
      status: String(data[i][6])
    };
    if (params.team && row.teamID !== params.team) continue;
    if (!params.showAll && row.status !== 'pending') continue;
    drops.push(row);
  }
  return { success: true, drops: drops };
}

function processPendingDrops() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('pending_drops');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var now = new Date();
  var processed = 0;

  var teamNames = {
    'shawn': 'Shawn', 'davidz': 'David Z.', 'davidr': 'David R.', 'brian': 'Brian',
    'greg': 'Greg', 'jason': 'Jason', 'keith': 'Keith', 'bill': 'Bill',
    'jamie': 'Jamie', 'dan': 'Dan', 'jonas': 'Jonas', 'sam': 'Sam'
  };

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][6]) !== 'pending') continue;
    var endDate = new Date(data[i][4]);
    if (isNaN(endDate.getTime()) || now < endDate) continue;

    var team = String(data[i][0]);
    var playerName = String(data[i][1]);
    var ownerName = teamNames[team] || team;

    // Log the drop
    var logWs = ss.getSheetByName('log');
    if (logWs) {
      logWs.appendRow([now.toISOString(), 'DROP', team, ownerName + '- drops ' + playerName + '.', '']);
    }

    // Mark as released
    sheet.getRange(i + 1, 7).setValue('released');
    processed++;
  }

  if (processed > 0) SpreadsheetApp.flush();
}

function setupPendingDropsTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processPendingDrops') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('processPendingDrops')
    .timeBased()
    .everyMinutes(30)
    .create();
}


// ═══════════════════════════════════════════════════════════════════════════
// TRADE DROP MANAGEMENT — Roster Limit Enforcement
// ═══════════════════════════════════════════════════════════════════════════

function countTeamRoster_(ss, pinKey) {
  // Count roster from all sources — the rosters are defined in index.html as static data
  // but we can count from lineups sheet or just return a param-based count
  // For now, this is called with the count passed from the frontend
  // Returning 0 as fallback — frontend will pass actual count
  return 0;
}

function confirmTradeDrops(params) {
  var tradeId = params.tradeId;
  var team = params.team; // pinKey of the team confirming drops
  var droppedPlayers = params.droppedPlayers ? JSON.parse(params.droppedPlayers) : [];

  var ws = getOrCreateTradesSheet();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== String(tradeId)) continue;
    if (data[i][7] !== 'pending_drops') {
      return { success: false, error: 'Trade is not awaiting drops.' };
    }

    var proposerTeamKey = String(data[i][1]);
    var partnerTeamKey = String(data[i][2]);
    var isProposer = team === proposerTeamKey;
    var isPartner = team === partnerTeamKey;
    if (!isProposer && !isPartner) return { success: false, error: 'Not a participant in this trade.' };

    var proposerDropsNeeded = Number(data[i][10]) || 0;
    var partnerDropsNeeded = Number(data[i][11]) || 0;
    var neededCount = isProposer ? proposerDropsNeeded : partnerDropsNeeded;

    if (droppedPlayers.length !== neededCount) {
      return { success: false, error: 'Must drop exactly ' + neededCount + ' player(s).' };
    }

    // Store the drops
    var dropJson = JSON.stringify(droppedPlayers);
    if (isProposer) {
      ws.getRange(i + 1, 13).setValue(dropJson); // proposerDropsDone
    } else {
      ws.getRange(i + 1, 14).setValue(dropJson); // partnerDropsDone
    }

    // Log each drop
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var teamNames = {
      'vipers': 'Shawn', 'hitmen': 'David Z.', 'boys_of_summer': 'David R.', 'bomb_squad': 'Brian',
      'sf_jones': 'Greg', 'heidens_hardtimes': 'Jason', 'american_dreams': 'Keith', 'billygoats': 'Bill',
      'four_horsemen': 'Jamie', 'legion_of_doom': 'Dan', 'snuffleupagus': 'Jonas', 'xt_home_fan': 'Sam'
    };
    var ownerName = teamNames[team] || team;
    var now = new Date().toISOString();
    var logWs = ss.getSheetByName('log');
    if (logWs) {
      droppedPlayers.forEach(function(pName) {
        logWs.appendRow([now, 'DROP', team, ownerName + '- drops ' + pName + '.', '']);
      });
    }

    // Check if BOTH sides have completed their drops
    var proposerDone = String(data[i][12] || '');
    var partnerDone = String(data[i][13] || '');
    if (isProposer) proposerDone = dropJson;
    if (isPartner) partnerDone = dropJson;

    var proposerComplete = proposerDropsNeeded === 0 || (proposerDone && proposerDone !== '');
    var partnerComplete = partnerDropsNeeded === 0 || (partnerDone && partnerDone !== '');

    if (proposerComplete && partnerComplete) {
      // Finalize the trade
      ws.getRange(i + 1, 8).setValue('completed');
      ws.getRange(i + 1, 10).setValue(now);

      // Process draft pick overrides
      var proposerPicks = [];
      var partnerPicks = [];
      try { proposerPicks = JSON.parse(data[i][4] || '[]'); } catch(e) {}
      try { partnerPicks = JSON.parse(data[i][6] || '[]'); } catch(e) {}
      proposerPicks.forEach(function(label) { saveDraftPickOverride(label, partnerTeamKey); });
      partnerPicks.forEach(function(label) { saveDraftPickOverride(label, proposerTeamKey); });

      SpreadsheetApp.flush();
      return { success: true, tradeFinalized: true };
    }

    SpreadsheetApp.flush();
    return { success: true, tradeFinalized: false, waitingOn: isProposer ? 'partner' : 'proposer' };
  }
  return { success: false, error: 'Trade not found.' };
}

function getTradeDropStatus(params) {
  var ws = getOrCreateTradesSheet();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== String(params.tradeId)) continue;
    return {
      success: true,
      status: String(data[i][7]),
      proposerDropsNeeded: Number(data[i][10]) || 0,
      partnerDropsNeeded: Number(data[i][11]) || 0,
      proposerDropsDone: String(data[i][12] || ''),
      partnerDropsDone: String(data[i][13] || ''),
      acceptedAt: String(data[i][14] || data[i][9] || '')
    };
  }
  return { success: false, error: 'Trade not found.' };
}

function checkExpiredTradeDrops() {
  var ws = getOrCreateTradesSheet();
  if (!ws) return;
  var data = ws.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][7]) !== 'pending_drops') continue;
    var acceptedAt = data[i][14] || data[i][9]; // acceptedAt column or updatedDate
    if (!acceptedAt) continue;
    var acceptedDate = new Date(acceptedAt);
    if (isNaN(acceptedDate.getTime())) continue;
    var hoursSince = (now.getTime() - acceptedDate.getTime()) / (1000 * 60 * 60);
    if (hoursSince >= 24) {
      ws.getRange(i + 1, 8).setValue('voided');
      ws.getRange(i + 1, 10).setValue(now.toISOString());
    }
  }

  // Also check expired multi-team trades (24h since proposal without full acceptance)
  var mtWs = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('multi_trades');
  if (mtWs) {
    var mtData = mtWs.getDataRange().getValues();
    for (var j = 1; j < mtData.length; j++) {
      var status = String(mtData[j][5]);
      if (status !== 'pending' && status !== 'pending_drops') continue;
      var proposedAt = mtData[j][4];
      if (!proposedAt) continue;
      var pDate = new Date(proposedAt);
      if (isNaN(pDate.getTime())) continue;
      var hrs = (now.getTime() - pDate.getTime()) / (1000 * 60 * 60);
      if (hrs >= 24) {
        mtWs.getRange(j + 1, 6).setValue('voided');
      }
    }
  }

  SpreadsheetApp.flush();
}

function setupExpiredTradeDropsTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkExpiredTradeDrops') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('checkExpiredTradeDrops')
    .timeBased()
    .everyMinutes(30)
    .create();
}


// ═══════════════════════════════════════════════════════════════════════════
// MULTI-TEAM TRADES
// ═══════════════════════════════════════════════════════════════════════════
// Sheet: multi_trades
// Columns: A=id, B=proposerTeam, C=teams(JSON), D=movements(JSON),
//          E=proposedAt, F=status, G=acceptedBy(JSON), H=dropsNeeded(JSON), I=dropsDone(JSON)

function ensureMultiTradesSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('multi_trades');
  if (!ws) {
    ws = ss.insertSheet('multi_trades');
    ws.appendRow(['id', 'proposerTeam', 'teams', 'movements', 'proposedAt', 'status', 'acceptedBy', 'dropsNeeded', 'dropsDone']);
    ws.setFrozenRows(1);
  }
  return ws;
}

function proposeMultiTeamTrade(params) {
  var pinCheck = verifyPin(params.proposerTeam, params.pin);
  if (!pinCheck.success) return pinCheck;

  var ws = ensureMultiTradesSheet_();
  var id = Utilities.getUuid();
  var now = new Date().toISOString();
  var teams = params.teams || '[]';
  var movements = params.movements || '[]';

  // Proposer is auto-accepted
  var acceptedBy = JSON.stringify([params.proposerTeam]);

  ws.appendRow([id, params.proposerTeam, teams, movements, now, 'pending', acceptedBy, '', '']);

  // Log proposal
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    logWs.appendRow([now, 'MULTI_TRADE_PROPOSED', params.proposerTeam,
      'Multi-team trade proposed involving ' + teams, '']);
  }

  return { success: true, id: id };
}

function acceptMultiTeamTrade(params) {
  var ws = ensureMultiTradesSheet_();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== String(params.tradeId)) continue;
    if (String(data[i][5]) !== 'pending') return { success: false, error: 'Trade is not pending.' };

    var teams = [];
    try { teams = JSON.parse(data[i][2] || '[]'); } catch(e) {}
    if (teams.indexOf(params.team) === -1) return { success: false, error: 'You are not part of this trade.' };

    var acceptedBy = [];
    try { acceptedBy = JSON.parse(data[i][6] || '[]'); } catch(e) {}
    if (acceptedBy.indexOf(params.team) !== -1) return { success: false, error: 'Already accepted.' };

    acceptedBy.push(params.team);
    ws.getRange(i + 1, 7).setValue(JSON.stringify(acceptedBy));

    // Check if all teams have accepted
    var allAccepted = teams.every(function(t) { return acceptedBy.indexOf(t) !== -1; });

    if (allAccepted) {
      // Check roster limits for all teams
      var movements = [];
      try { movements = JSON.parse(data[i][3] || '[]'); } catch(e) {}

      // Count incoming/outgoing players per team
      var teamPlayerDelta = {};
      teams.forEach(function(t) { teamPlayerDelta[t] = 0; });
      movements.forEach(function(m) {
        if (m.assetType === 'player') {
          teamPlayerDelta[m.fromTeam] = (teamPlayerDelta[m.fromTeam] || 0) - 1;
          teamPlayerDelta[m.toTeam] = (teamPlayerDelta[m.toTeam] || 0) + 1;
        }
      });

      // Check which teams need drops (using counts passed from frontend or estimating)
      // For now, set completed — the frontend will handle drop checks like 2-team trades
      var now = new Date().toISOString();
      ws.getRange(i + 1, 6).setValue('completed');

      // Process draft pick overrides
      movements.forEach(function(m) {
        if (m.assetType === 'pick') {
          saveDraftPickOverride(m.asset, m.toTeam);
        }
      });

      // Write transaction log
      var teamNames = {
        'vipers': 'Shawn', 'hitmen': 'David Z.', 'boys_of_summer': 'David R.', 'bomb_squad': 'Brian',
        'sf_jones': 'Greg', 'heidens_hardtimes': 'Jason', 'american_dreams': 'Keith', 'billygoats': 'Bill',
        'four_horsemen': 'Jamie', 'legion_of_doom': 'Dan', 'snuffleupagus': 'Jonas', 'xt_home_fan': 'Sam'
      };
      var desc = 'Multi-team trade: ' + movements.map(function(m) {
        var fromName = teamNames[m.fromTeam] || m.fromTeam;
        var toName = teamNames[m.toTeam] || m.toTeam;
        return m.asset + ' ' + fromName + ' to ' + toName;
      }).join(' | ');

      var ss2 = SpreadsheetApp.openById(SPREADSHEET_ID);
      var logWs = ss2.getSheetByName('log');
      if (logWs) {
        logWs.appendRow([now, 'MULTI_TRADE_COMPLETED', data[i][1], desc, '']);
      }

      SpreadsheetApp.flush();
      return { success: true, allAccepted: true };
    }

    SpreadsheetApp.flush();
    return { success: true, allAccepted: false };
  }
  return { success: false, error: 'Trade not found.' };
}

function rejectMultiTeamTrade(params) {
  var ws = ensureMultiTradesSheet_();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== String(params.tradeId)) continue;
    if (String(data[i][5]) !== 'pending') return { success: false, error: 'Trade is not pending.' };

    ws.getRange(i + 1, 6).setValue('voided');
    SpreadsheetApp.flush();
    return { success: true };
  }
  return { success: false, error: 'Trade not found.' };
}


// ═══════════════════════════════════════════════════════════════════════════
// THE HOT STOVE — Message Board
// ═══════════════════════════════════════════════════════════════════════════
// Sheet: hot_stove
// Columns: A=messageID, B=teamID, C=ownerName, D=teamName, E=messageText,
//          F=postedAt, G=parentMessageID, H=reactions, I=reactedBy

function ensureHotStoveSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('hot_stove');
  if (!ws) {
    ws = ss.insertSheet('hot_stove');
    ws.appendRow(['messageID', 'teamID', 'ownerName', 'teamName', 'messageText', 'postedAt', 'parentMessageID', 'reactions', 'reactedBy']);
    ws.setFrozenRows(1);
  }
  return ws;
}

function getHotStoveMessages() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('hot_stove');
  if (!ws) return { success: true, messages: [] };

  var data = ws.getDataRange().getValues();
  var messages = [];
  for (var i = 1; i < data.length; i++) {
    var reactions = {};
    var reactedBy = {};
    try { reactions = JSON.parse(data[i][7] || '{}'); } catch(e) {}
    try { reactedBy = JSON.parse(data[i][8] || '{}'); } catch(e) {}
    messages.push({
      messageID: String(data[i][0]),
      teamID: String(data[i][1]),
      ownerName: String(data[i][2]),
      teamName: String(data[i][3]),
      messageText: String(data[i][4]),
      postedAt: String(data[i][5]),
      parentMessageID: String(data[i][6] || ''),
      reactions: reactions,
      reactedBy: reactedBy
    });
  }
  messages.sort(function(a, b) {
    return (b.postedAt || '').localeCompare(a.postedAt || '');
  });
  return { success: true, messages: messages };
}

function postHotStoveMessage(params) {
  if (!params.teamID || !params.messageText) {
    return { success: false, error: 'teamID and messageText required' };
  }

  var ws = ensureHotStoveSheet_();
  var now = new Date().toISOString();
  var messageID = now.replace(/[^0-9]/g, '') + '_' + params.teamID;

  ws.appendRow([
    messageID,
    params.teamID,
    params.ownerName || '',
    params.teamName || '',
    params.messageText,
    now,
    params.parentMessageID || '',
    '{}',
    '{}'
  ]);
  SpreadsheetApp.flush();

  return { success: true, messageID: messageID, postedAt: now };
}

function deleteHotStoveMessage(params) {
  if (!params.messageID || !params.teamID) {
    return { success: false, error: 'messageID and teamID required' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('hot_stove');
  if (!ws) return { success: false, error: 'Sheet not found' };

  var data = ws.getDataRange().getValues();
  var rowsToDelete = [];

  for (var i = 1; i < data.length; i++) {
    var id = String(data[i][0]);
    var owner = String(data[i][1]);
    var parentId = String(data[i][6] || '');

    // Delete the message itself (only if owned by requester)
    if (id === params.messageID && owner === params.teamID) {
      rowsToDelete.push(i + 1);
    }
    // Delete replies to this message
    if (parentId === params.messageID) {
      rowsToDelete.push(i + 1);
    }
  }

  if (rowsToDelete.length === 0) {
    return { success: false, error: 'Message not found or not owned by you' };
  }

  // Delete from bottom to top
  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var r = 0; r < rowsToDelete.length; r++) {
    ws.deleteRow(rowsToDelete[r]);
  }
  SpreadsheetApp.flush();
  return { success: true };
}

function reactToHotStove(params) {
  if (!params.messageID || !params.teamID || !params.emoji) {
    return { success: false, error: 'messageID, teamID, and emoji required' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('hot_stove');
  if (!ws) return { success: false, error: 'Sheet not found' };

  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) !== params.messageID) continue;

    var reactions = {};
    var reactedBy = {};
    try { reactions = JSON.parse(data[i][7] || '{}'); } catch(e) {}
    try { reactedBy = JSON.parse(data[i][8] || '{}'); } catch(e) {}

    // Toggle reaction
    var emoji = params.emoji;
    if (!reactedBy[emoji]) reactedBy[emoji] = [];
    var idx = reactedBy[emoji].indexOf(params.teamID);
    if (idx === -1) {
      reactedBy[emoji].push(params.teamID);
      reactions[emoji] = (reactions[emoji] || 0) + 1;
    } else {
      reactedBy[emoji].splice(idx, 1);
      reactions[emoji] = Math.max(0, (reactions[emoji] || 0) - 1);
      if (reactions[emoji] === 0) delete reactions[emoji];
      if (reactedBy[emoji].length === 0) delete reactedBy[emoji];
    }

    ws.getRange(i + 1, 8).setValue(JSON.stringify(reactions));
    ws.getRange(i + 1, 9).setValue(JSON.stringify(reactedBy));
    SpreadsheetApp.flush();

    return { success: true, reactions: reactions, reactedBy: reactedBy };
  }
  return { success: false, error: 'Message not found' };
}


// ═══════════════════════════════════════════════════════════════════════════
// THE RUNDOWN — Daily MLB Recap Data
// ═══════════════════════════════════════════════════════════════════════════

function getRundownData(params) {
  var date = params.date;
  if (!date) {
    // Default to yesterday ET
    var now = new Date();
    var et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    et.setDate(et.getDate() - 1);
    date = Utilities.formatDate(et, 'America/New_York', 'yyyy-MM-dd');
  }

  // Build CVC roster lookup from ROSTERS-like data
  // Since rosters are in index.html, the frontend will pass them
  // We'll read rostered player names from the params or return raw game data for the frontend to filter

  var scheduleUrl = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=' + date + '&hydrate=boxscore,decisions,highlights';

  try {
    var resp = UrlFetchApp.fetch(scheduleUrl, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      return { success: false, error: 'MLB API returned ' + resp.getResponseCode() };
    }
    var scheduleData = JSON.parse(resp.getContentText());

    var hitting = [];
    var pitching = [];
    var highlights = {};

    var dates = scheduleData.dates || [];
    for (var d = 0; d < dates.length; d++) {
      var games = dates[d].games || [];
      for (var g = 0; g < games.length; g++) {
        var game = games[g];
        var boxscore = game.boxscore;
        if (!boxscore) continue;

        // Extract highlights for this game
        var gameHighlights = {};
        if (game.highlights && game.highlights.highlights && game.highlights.highlights.items) {
          game.highlights.highlights.items.forEach(function(h) {
            if (!h.playbacks || !h.playbacks.length) return;
            var url = '';
            var thumb = h.image && h.image.cuts ? (h.image.cuts[6] || h.image.cuts[0] || {}).src : '';
            h.playbacks.forEach(function(pb) {
              if (pb.name === 'mp4Avc' || pb.name === 'highBit' || pb.url) url = url || pb.url;
            });
            if (h.description) {
              gameHighlights[h.description] = { url: url, thumb: thumb };
            }
            // Also index by player IDs mentioned
            if (h.keywordsAll) {
              h.keywordsAll.forEach(function(kw) {
                if (kw.type === 'player_id') {
                  highlights[kw.value] = { url: url, thumb: thumb, desc: h.description || '' };
                }
              });
            }
          });
        }

        // Process hitters
        ['away', 'home'].forEach(function(side) {
          var teamData = boxscore.teams && boxscore.teams[side];
          if (!teamData || !teamData.players) return;
          var teamName = teamData.team ? teamData.team.abbreviation : '';

          Object.keys(teamData.players).forEach(function(pKey) {
            var player = teamData.players[pKey];
            var person = player.person || {};
            var battingStats = player.stats && player.stats.batting;
            if (!battingStats || !battingStats.atBats) return;

            var s = battingStats;
            var qualReasons = [];

            if ((s.hits || 0) >= 3) qualReasons.push('3+ Hits');
            if ((s.homeRuns || 0) >= 2) qualReasons.push('2+ HR');
            if ((s.rbi || 0) >= 5) qualReasons.push('5+ RBI');
            if ((s.stolenBases || 0) >= 2) qualReasons.push('2+ SB');
            if ((s.runs || 0) >= 3) qualReasons.push('3+ Runs');
            if ((s.totalBases || 0) >= 10) qualReasons.push('10+ TB');
            // Cycle detection: need single, double, triple, HR
            if ((s.doubles || 0) >= 1 && (s.triples || 0) >= 1 && (s.homeRuns || 0) >= 1 && (s.hits || 0) >= 4) {
              qualReasons.push('CYCLE');
            }

            if (qualReasons.length === 0) return;

            var statLine = (s.hits||0) + '-for-' + (s.atBats||0);
            if (s.homeRuns) statLine += ', ' + s.homeRuns + ' HR';
            if (s.rbi) statLine += ', ' + s.rbi + ' RBI';
            if (s.runs) statLine += ', ' + s.runs + ' R';
            if (s.stolenBases) statLine += ', ' + s.stolenBases + ' SB';
            if (s.totalBases) statLine += ', ' + s.totalBases + ' TB';

            var hl = highlights[String(person.id)] || {};

            hitting.push({
              playerName: person.fullName || '',
              mlbId: person.id || null,
              mlbTeam: teamName,
              statLine: statLine,
              qualifyingReasons: qualReasons,
              thumbnailUrl: hl.thumb || '',
              highlightUrl: hl.url || ''
            });
          });
        });

        // Process pitchers
        ['away', 'home'].forEach(function(side) {
          var teamData = boxscore.teams && boxscore.teams[side];
          if (!teamData || !teamData.players) return;
          var teamName = teamData.team ? teamData.team.abbreviation : '';

          Object.keys(teamData.players).forEach(function(pKey) {
            var player = teamData.players[pKey];
            var person = player.person || {};
            var pitchingStats = player.stats && player.stats.pitching;
            if (!pitchingStats || !pitchingStats.inningsPitched) return;

            var s = pitchingStats;
            var ip = parseFloat(s.inningsPitched) || 0;
            var qualReasons = [];

            if (ip >= 7) qualReasons.push('7+ IP');
            if ((s.strikeOuts || 0) >= 10) qualReasons.push('10+ K');
            if (ip >= 9 && (s.runs || 0) === 0) qualReasons.push('CGSO');
            if (ip >= 6 && (s.earnedRuns || 0) <= 3) qualReasons.push('QS');
            if (ip >= 5 && (s.earnedRuns || 0) === 0) qualReasons.push('0 ER Gem');
            if ((s.wins || 0) >= 1 && (s.strikeOuts || 0) >= 8) qualReasons.push('W + 8K');
            if ((s.saves || 0) >= 1 && (s.strikeOuts || 0) >= 2) qualReasons.push('SV + 2K');

            if (qualReasons.length === 0) return;

            var statLine = s.inningsPitched + ' IP, ' + (s.strikeOuts||0) + ' K, ' + (s.earnedRuns||0) + ' ER';
            if (s.hits) statLine += ', ' + s.hits + ' H';
            if (s.baseOnBalls) statLine += ', ' + s.baseOnBalls + ' BB';
            if (s.wins) statLine += ', W';
            if (s.saves) statLine += ', SV';

            var hl = highlights[String(person.id)] || {};

            pitching.push({
              playerName: person.fullName || '',
              mlbId: person.id || null,
              mlbTeam: teamName,
              statLine: statLine,
              qualifyingReasons: qualReasons,
              thumbnailUrl: hl.thumb || '',
              highlightUrl: hl.url || ''
            });
          });
        });
      }
    }

    // Get injury/debut news from rotowire_news sheet
    var injuries = [];
    var debuts = [];
    var milestones = [];
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var newsSheet = ss.getSheetByName('rotowire_news');
    if (newsSheet) {
      var newsData = newsSheet.getDataRange().getValues();
      for (var n = 1; n < newsData.length; n++) {
        var blurbDate = String(newsData[n][3] || '');
        var blurbText = String(newsData[n][2] || '').toLowerCase();
        // Check if blurb is from today/yesterday
        if (blurbDate.indexOf(date) === -1 && !isRecentBlurb_(blurbDate, date)) continue;

        var entry = {
          playerName: String(newsData[n][0]),
          blurbText: String(newsData[n][2]),
          blurbDate: blurbDate
        };

        if (/injur|il |placed on|disabled|fracture|strain|sprain|surgery|torn|hurt|discomfort/.test(blurbText)) {
          injuries.push(entry);
        }
        if (/debut|first.*appearance|first.*start|called up|promoted/.test(blurbText)) {
          debuts.push(entry);
        }
        if (/walk.off|no.hit|perfect game|milestone|career|record|1000th|500th|300th|3000/.test(blurbText)) {
          milestones.push(entry);
        }
      }
    }

    return {
      success: true,
      date: date,
      hitting: hitting,
      pitching: pitching,
      injuries: injuries,
      debuts: debuts,
      milestones: milestones
    };

  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function isRecentBlurb_(blurbDate, targetDate) {
  try {
    var bd = new Date(blurbDate);
    var td = new Date(targetDate);
    if (isNaN(bd.getTime()) || isNaN(td.getTime())) return false;
    var diff = Math.abs(bd.getTime() - td.getTime());
    return diff < 48 * 3600000; // within 48 hours
  } catch(e) { return false; }
}


// ═══════════════════════════════════════════════════════════════════════════
// WAIVER / FREE AGENT POSITION UPDATES
// ═══════════════════════════════════════════════════════════════════════════
// Sheet: waiver_positions — columns: A=playerName, B=mlbId, C=pos, D=updatedAt, E=season

var WP_POS_MAP = {
  'Catcher':'C','First Base':'1B','Second Base':'2B','Third Base':'3B',
  'Shortstop':'SS','Left Field':'OF','Center Field':'OF','Right Field':'OF',
  'Outfield':'OF','Designated Hitter':'UT'
};

function ensureWaiverPositionsSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_positions');
  if (!ws) {
    ws = ss.insertSheet('waiver_positions');
    ws.appendRow(['playerName', 'mlbId', 'pos', 'updatedAt', 'season']);
    ws.setFrozenRows(1);
  }
  return ws;
}

function updateWaiverPositions() {
  var now = new Date();
  var cutoff = new Date('2026-08-03T23:59:59');
  if (now > cutoff) { Logger.log('updateWaiverPositions: past Aug 3 cutoff'); return; }

  var openingDay = new Date('2026-03-25T00:00:00');
  var isPreseason = now < openingDay;
  var threshold = isPreseason ? 125 : 40;

  var ws = ensureWaiverPositionsSheet_();
  var existing = ws.getDataRange().getValues();
  var playerMap = {};
  for (var i = 1; i < existing.length; i++) {
    var mlbId = String(existing[i][1]);
    if (mlbId) playerMap[mlbId] = { row: i + 1, name: String(existing[i][0]), pos: String(existing[i][2]) };
  }

  if (Object.keys(playerMap).length === 0) {
    Logger.log('updateWaiverPositions: no players in waiver_positions sheet. Sheet has ' + existing.length + ' rows (including header). Run seedWaiverPositions from the site or seedWaiverPositionsFromSheet() manually.');
    return;
  }

  // Log first 3 players for verification
  var debugIds = Object.keys(playerMap).slice(0, 3);
  debugIds.forEach(function(id) {
    var e = playerMap[id];
    Logger.log('  Player: ' + e.name + ' | mlbId: ' + id + ' | pos: ' + e.pos + ' | row: ' + e.row);
  });

  // Build set of rostered player names — skip these (position locked at claim time)
  var rosteredNames = {};
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rmWs = ss.getSheetByName('roster_moves');
  if (rmWs) {
    var rmData = rmWs.getDataRange().getValues();
    for (var r = 1; r < rmData.length; r++) {
      if (rmData[r][2]) rosteredNames[String(rmData[r][2]).toLowerCase()] = true;
      if (rmData[r][5]) delete rosteredNames[String(rmData[r][5]).toLowerCase()];
    }
  }

  var updated = 0;
  var mlbIds = Object.keys(playerMap).filter(function(id) {
    return !rosteredNames[playerMap[id].name.toLowerCase()];
  });

  // Process each player individually to support fallback chain
  mlbIds.forEach(function(id) {
    var entry = playerMap[id];
    if (!entry) return;

    try {
      var result = null;

      if (!isPreseason) {
        // REGULAR SEASON: 2026 MLB only
        result = wpFetchFielding_(id, 2026, 1);
        if (!result) return; // No 2026 data — keep preseason position
      } else {
        // PRESEASON: fallback chain
        // Step 1-3: MLB 2025, 2024, 2023
        result = wpFetchFielding_(id, 2025, 1);
        if (!result) result = wpFetchFielding_(id, 2024, 1);
        if (!result) result = wpFetchFielding_(id, 2023, 1);
        // Step 4: MiLB — AAA(11), AA(12), High-A(13), A(14) for 2025 then 2024
        if (!result) {
          var milbLevels = [11, 12, 13, 14];
          var milbYears = [2025, 2024];
          for (var yi = 0; yi < milbYears.length && !result; yi++) {
            for (var li = 0; li < milbLevels.length && !result; li++) {
              result = wpFetchFielding_(id, milbYears[yi], milbLevels[li]);
            }
          }
        }
        // Step 5: No data — assign UT for hitters
        if (!result) {
          result = { pos: 'UT', source: 'none' };
        }
      }

      if (!result || !result.pos) return;

      // Build position string with threshold
      var newPos = wpBuildPosString_(result.posPA || {}, result.primary, threshold);
      if (!newPos) newPos = result.pos;
      var source = result.source || '';

      if (newPos && newPos !== entry.pos) {
        ws.getRange(entry.row, 3).setValue(newPos);
        ws.getRange(entry.row, 4).setValue(now.toISOString());
        ws.getRange(entry.row, 5).setValue(source);
        updated++;
      }
    } catch(e) {
      Logger.log('updateWaiverPositions error for ' + entry.name + ': ' + e.toString());
    }
  });

  if (updated > 0) SpreadsheetApp.flush();
  Logger.log('updateWaiverPositions: updated ' + updated + ' of ' + mlbIds.length + ' players');
}

function wpFetchFielding_(playerId, season, sportId) {
  var levelNames = {1:'MLB',11:'AAA',12:'AA',13:'High-A',14:'A'};
  var POS_MAP = {'Catcher':'C','First Base':'1B','Second Base':'2B','Third Base':'3B',
    'Shortstop':'SS','Left Field':'OF','Center Field':'OF','Right Field':'OF',
    'Outfielder':'OF','Designated Hitter':'UT'};
  try {
    // Fetch both fielding stats AND player info in parallel-ish
    var url = 'https://statsapi.mlb.com/api/v1/people/' + playerId +
      '/stats?stats=season&season=' + season + '&group=fielding&gameType=R&sportId=' + sportId;
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    var data = JSON.parse(resp.getContentText());

    var posPA = {};
    if (data.stats) {
      data.stats.forEach(function(sg) {
        if (!sg.splits) return;
        sg.splits.forEach(function(split) {
          var s = split.stat || {};
          var posName = split.position ? split.position.abbreviation : '';
          if (!posName || posName === 'P') return;
          if (posName === 'DH') posName = 'UT';
          if (posName === 'LF' || posName === 'CF' || posName === 'RF') posName = 'OF';
          // Only count positions with actual innings (fielding) or games
          var games = parseInt(s.gamesPlayed || s.games || 0);
          var innings = parseFloat(s.innings || 0);
          if (games === 0 && innings === 0) return;
          // Use innings as better proxy when available, else games*4
          var estPA = innings > 0 ? Math.round(innings * 4) : games * 4;
          posPA[posName] = (posPA[posName] || 0) + estPA;
        });
      });
    }

    // If fielding data only shows DH/UT or is empty, fall back to player's primaryPosition
    var onlyUT = Object.keys(posPA).length === 0 ||
      (Object.keys(posPA).length === 1 && posPA['UT']);
    if (onlyUT && sportId === 1) {
      try {
        var infoResp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/people/' + playerId, { muteHttpExceptions: true });
        if (infoResp.getResponseCode() === 200) {
          var infoData = JSON.parse(infoResp.getContentText());
          if (infoData.people && infoData.people[0]) {
            var person = infoData.people[0];
            var pp = person.primaryPosition;
            if (pp) {
              var mappedPos = pp.abbreviation;
              if (mappedPos === 'LF' || mappedPos === 'CF' || mappedPos === 'RF') mappedPos = 'OF';
              if (mappedPos === 'DH') mappedPos = 'UT';
              if (mappedPos && mappedPos !== 'P' && mappedPos !== 'SP' && mappedPos !== 'RP' && mappedPos !== 'TWP') {
                // Use primaryPosition with DH games as PA estimate
                var dhGames = posPA['UT'] || 0;
                posPA[mappedPos] = (posPA[mappedPos] || 0) + (dhGames > 0 ? dhGames : 600);
                // Keep UT if it existed but don't let it dominate
                if (posPA['UT'] && posPA[mappedPos] > posPA['UT']) {
                  // primary is now the real position
                }
              }
            }
          }
        }
      } catch(e) { /* ignore */ }
    }

    // Remove entries with 0 PA
    Object.keys(posPA).forEach(function(k) { if (posPA[k] <= 0) delete posPA[k]; });
    if (Object.keys(posPA).length === 0) return null;

    var positions = Object.keys(posPA);
    positions.sort(function(a, b) { return posPA[b] - posPA[a]; });
    var primary = positions[0];

    // Skip if primary is pitcher-like
    if (primary === 'SP' || primary === 'RP' || primary === 'P') return null;

    var level = levelNames[sportId] || ('sportId' + sportId);
    var source = season + ' ' + level;

    return { pos: primary, posPA: posPA, primary: primary, source: source };
  } catch(e) {
    return null;
  }
}

function wpBuildPosString_(posPA, primary, threshold) {
  if (!primary) return '';
  var parts = [primary];
  var positions = Object.keys(posPA);
  positions.sort(function(a, b) { return posPA[b] - posPA[a]; });
  for (var i = 0; i < positions.length; i++) {
    if (positions[i] !== primary && posPA[positions[i]] >= threshold) {
      if (parts.indexOf(positions[i]) === -1) parts.push(positions[i]);
    }
  }
  return parts.join('-');
}

function getWaiverPositions() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_positions');
  if (!ws) return { success: true, positions: {} };

  var data = ws.getDataRange().getValues();
  var positions = {};
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0]);
    if (name) {
      positions[name] = {
        pos: String(data[i][2]),
        season: String(data[i][4] || ''),
        mlbId: String(data[i][1])
      };
    }
  }
  return { success: true, positions: positions };
}

function seedWaiverPositions(params) {
  // Called from frontend to seed the waiver_positions sheet with player names and mlbIds
  var players = [];
  try { players = JSON.parse(params.players || '[]'); } catch(e) { return { success: false, error: 'Invalid JSON' }; }
  if (!players.length) return { success: false, error: 'No players provided' };

  var ws = ensureWaiverPositionsSheet_();
  var existing = ws.getDataRange().getValues();
  var existingNames = {};
  for (var i = 1; i < existing.length; i++) {
    existingNames[String(existing[i][0]).toLowerCase()] = true;
  }

  var added = 0;
  var now = new Date().toISOString();
  players.forEach(function(p) {
    if (!p.name || existingNames[p.name.toLowerCase()]) return;
    ws.appendRow([p.name, p.mlbId || '', p.pos || '', now, '']);
    existingNames[p.name.toLowerCase()] = true;
    added++;
  });

  if (added > 0) SpreadsheetApp.flush();
  return { success: true, added: added };
}

// Manual seed: run this once from the GAS editor to populate waiver_positions from the site's data
// After running, updateWaiverPositions() will find players to process
function seedWaiverPositionsManual() {
  // This reads ALL_PLAYERS equivalent from the rotowire_news sheet (player names with mlbIds)
  // and any players we can find. Since we don't have WAIVER_PLAYERS here, we'll seed from
  // the MLB API's active rosters — all MLB players who are NOT on a CVC roster.
  Logger.log('seedWaiverPositionsManual: starting...');

  // Get CVC rostered player names from roster_moves
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rosteredNames = {};
  var rmWs = ss.getSheetByName('roster_moves');
  if (rmWs) {
    var rmData = rmWs.getDataRange().getValues();
    for (var r = 1; r < rmData.length; r++) {
      if (rmData[r][2]) rosteredNames[String(rmData[r][2]).toLowerCase()] = true;
      if (rmData[r][5]) delete rosteredNames[String(rmData[r][5]).toLowerCase()];
    }
  }

  // Read player names from rotowire_news sheet (these are known players)
  var newsWs = ss.getSheetByName('rotowire_news');
  var ws = ensureWaiverPositionsSheet_();
  var existingData = ws.getDataRange().getValues();
  var existingNames = {};
  for (var i = 1; i < existingData.length; i++) {
    existingNames[String(existingData[i][0]).toLowerCase()] = true;
  }

  var added = 0;
  var now = new Date().toISOString();

  if (newsWs) {
    var newsData = newsWs.getDataRange().getValues();
    var seenNames = {};
    for (var n = 1; n < newsData.length; n++) {
      var name = String(newsData[n][0]).trim();
      if (!name || seenNames[name.toLowerCase()] || existingNames[name.toLowerCase()]) continue;
      seenNames[name.toLowerCase()] = true;

      // Try to find MLB ID via search
      try {
        var searchResp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/people/search?names=' + encodeURIComponent(name) + '&sportIds=1,11,12,13,14', { muteHttpExceptions: true });
        if (searchResp.getResponseCode() === 200) {
          var searchData = JSON.parse(searchResp.getContentText());
          if (searchData.people && searchData.people.length > 0) {
            var person = searchData.people[0];
            var pos = person.primaryPosition ? person.primaryPosition.abbreviation : '';
            ws.appendRow([name, String(person.id), pos, now, '']);
            existingNames[name.toLowerCase()] = true;
            added++;
          }
        }
      } catch(e) { /* skip */ }

      // Rate limit — don't hammer the API
      if (added % 10 === 0) Utilities.sleep(1000);
    }
  }

  SpreadsheetApp.flush();
  Logger.log('seedWaiverPositionsManual: added ' + added + ' players to waiver_positions sheet');
}

// Debug: test position lookup for a single player
function debugWaiverPosition() {
  // Bobby Witt Jr (660271) — should be SS
  var id = '660271';
  var url = 'https://statsapi.mlb.com/api/v1/people/' + id + '/stats?stats=season&season=2025&group=fielding&gameType=R&sportId=1';
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var data = JSON.parse(resp.getContentText());
  Logger.log('Raw stats for Witt: ' + JSON.stringify(data.stats ? data.stats.length : 0) + ' stat groups');
  if (data.stats) {
    data.stats.forEach(function(sg, idx) {
      Logger.log('  Group ' + idx + ': ' + (sg.splits ? sg.splits.length : 0) + ' splits');
      (sg.splits || []).forEach(function(split) {
        var pos = split.position ? split.position.abbreviation : '?';
        var s = split.stat || {};
        Logger.log('    pos=' + pos + ' games=' + (s.gamesPlayed || s.games || 0) + ' innings=' + (s.innings || '') + ' chances=' + (s.chances || ''));
      });
    });
  }
}

function setupWaiverPositionTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'updateWaiverPositions') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('updateWaiverPositions')
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .inTimezone('America/New_York')
    .create();
  Logger.log('setupWaiverPositionTrigger: daily 7am ET trigger created');
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAFT BOARD — Personal scouting sheet persistence
// ═══════════════════════════════════════════════════════════════════════════

function getDraftBoard(params) {
  var team = (params.team || '').trim();
  if (!team) return { success: false, error: 'Missing team' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('draft_board');
  if (!sheet) return { success: true, board: '[]' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      return { success: true, board: String(data[i][1] || '[]') };
    }
  }
  return { success: true, board: '[]' };
}

function saveDraftBoard(params) {
  var team = (params.team || '').trim();
  if (!team) return { success: false, error: 'Missing team' };

  var board = params.board || '[]';
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('draft_board');
  if (!sheet) {
    sheet = ss.insertSheet('draft_board');
    sheet.appendRow(['team', 'board', 'updated']);
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      sheet.getRange(i + 1, 2).setValue(board);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  sheet.appendRow([team, board, new Date().toISOString()]);
  return { success: true };
}

// ── Draft Notes ──

function getDraftNotes(params) {
  var team = (params.team || '').trim();
  if (!team) return { success: false, error: 'Missing team' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('draft_notes');
  if (!sheet) return { success: true, notes: '' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      return { success: true, notes: String(data[i][1] || '') };
    }
  }
  return { success: true, notes: '' };
}

function saveDraftNotes(params) {
  var team = (params.team || '').trim();
  if (!team) return { success: false, error: 'Missing team' };

  var notes = params.notes || '';
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('draft_notes');
  if (!sheet) {
    sheet = ss.insertSheet('draft_notes');
    sheet.appendRow(['ownerKey', 'notes', 'updatedAt']);
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      sheet.getRange(i + 1, 2).setValue(notes);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  sheet.appendRow([team, notes, new Date().toISOString()]);
  return { success: true };
}

// ── Watch List ──

function getWatchList(params) {
  var team = (params.team || '').trim();
  if (!team) return { success: false, error: 'Missing team' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('watch_list');
  if (!sheet) return { success: true, list: '[]' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      return { success: true, list: String(data[i][1] || '[]') };
    }
  }
  return { success: true, list: '[]' };
}

function saveWatchList(params) {
  var team = (params.team || '').trim();
  if (!team) return { success: false, error: 'Missing team' };

  var list = params.list || '[]';
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('watch_list');
  if (!sheet) {
    sheet = ss.insertSheet('watch_list');
    sheet.appendRow(['ownerKey', 'list', 'updatedAt']);
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      sheet.getRange(i + 1, 2).setValue(list);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return { success: true };
    }
  }
  sheet.appendRow([team, list, new Date().toISOString()]);
  return { success: true };
}

