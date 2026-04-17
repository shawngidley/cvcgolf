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

// Eastern Time timestamp for sheet writes — auto-handles EDT/EST
function nowET_() {
  return Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss');
}

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
    } else if (action === 'reorderConditionalClaims') {
      result = reorderConditionalClaims(params);
    } else if (action === 'removeFromConditionalGroup') {
      result = removeFromConditionalGroup(params);
    } else if (action === 'cancelConditionalGroup') {
      result = cancelConditionalGroup(params);

    // ── NEW: Waiver Priority ──────────────────────────────────────────────
    } else if (action === 'getPriority') {
      result = getPriority();
    } else if (action === 'setPriority') {
      result = setWaiverPriority(params);
    } else if (action === 'getWaiverPriority') {
      result = getPriority();

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
    } else if (action === 'getPendingTradeCount') {
      result = getPendingTradeCount(params);
    } else if (action === 'updateTrade') {
      result = updateTrade(params);
    } else if (action === 'executeTrade') {
      result = executeTrade(params);

    // ── Results & Standings ────────────────────────────────────────────
    } else if (action === 'writeGameResults') {
      result = handleWriteGameResults(params);
    } else if (action === 'getStandings') {
      result = handleGetStandings();
    } else if (action === 'getMatchupContext') {
      result = handleGetMatchupContext(params);
    } else if (action === 'getHeadToHead') {
      result = handleGetHeadToHead(params);
    } else if (action === 'generateMatchupPreview') {
      result = handleGenerateMatchupPreview(params);

    // ── NEW: Transaction Log ──────────────────────────────────────────────
    } else if (action === 'addLog') {
      result = addLog(params);
    } else if (action === 'getLog') {
      result = getLog(params);
    } else if (action === 'seedTransactions') {
      result = handleSeedTransactions(params);

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
    } else if (action === 'cancelTaxiMove') {
      result = handleCancelTaxiMove(params);
    } else if (action === 'getPendingTaxiMoves') {
      result = handleGetPendingTaxiMoves(params);
    } else if (action === 'adjustTaxiMoveCount') {
      result = adjustTaxiMoveCount(params.team, params.count);
    } else if (action === 'updateTaxiMovePlaced') {
      result = handleUpdateTaxiMovePlaced(params);
    } else if (action === 'syncPendingTaxiMoves') {
      result = handleSyncPendingTaxiMoves(params);

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
    } else if (action === 'saveErSwap') {
      result = handleSaveErSwap(params);
    } else if (action === 'getErSwaps') {
      result = handleGetErSwaps(params);

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
    } else if (action === 'getPitcherRoles') {
      result = getPitcherRoles();

    // ── The Rundown ──────────────────────────────────────────────────────
    } else if (action === 'getRundownData') {
      result = getRundownData(params);
    } else if (action === 'generateRundownBlurbs') {
      result = handleGenerateRundownBlurbs(params);
    } else if (action === 'saveRundown') {
      result = saveRundownCache(params);
    } else if (action === 'getSavedRundown') {
      result = getSavedRundown(params);

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

    // ── Process Draft Pick (roster + history + transactions) ─────────
    } else if (action === 'processDraftPick') {
      result = handleProcessDraftPick(params);

    // ── Dynamic Rosters ──────────────────────────────────────────────
    } else if (action === 'getRosters') {
      result = handleGetRosters();
    } else if (action === 'seedRosters') {
      result = handleSeedRosters(params);
    } else if (action === 'seedRosterTeam') {
      result = handleSeedRosterTeam(params);

    // ── Waiver Players ──────────────────────────────────────────────
    } else if (action === 'getWaiverPlayers') {
      result = handleGetWaiverPlayers();
    } else if (action === 'addWaiverPlayer') {
      result = handleAddWaiverPlayer(params);
    } else if (action === 'removeWaiverPlayer') {
      result = handleRemoveWaiverPlayer(params);
    } else if (action === 'seedWaiverPlayers') {
      result = handleSeedWaiverPlayers(params);

    // ── Roster Order ──────────────────────────────────────────────
    } else if (action === 'getRosterOrder') {
      result = handleGetRosterOrder();
    } else if (action === 'saveRosterOrder') {
      result = handleSaveRosterOrder(params);

    // ── Peach Overrides ─────────────────────────────────────────────
    } else if (action === 'getPeachOverrides') {
      result = handleGetPeachOverrides();
    } else if (action === 'setPeachOverride') {
      result = handleSetPeachOverride(params);

    // ── Deferred Transactions ──────────────────────────────────────────
    } else if (action === 'getDeferred') {
      result = handleGetDeferred();

    // ── Rivalry Games ───────────────────────────────────────────────────
    } else if (action === 'declareRivalryGame') {
      result = declareRivalryGame(params);
    } else if (action === 'getRivalryGames') {
      result = getRivalryGames();
    } else if (action === 'completeRivalryGame') {
      result = completeRivalryGame(params);

    // ── MLB Live Cache ────────────────────────────────────────────────
    } else if (action === 'getMLBGameStatus') {
      result = handleGetMLBGameStatus();

    // ── Podcast Episodes ─────────────────────────────────────────────
    } else if (action === 'getPodcastEpisodes') {
      result = handleGetPodcastEpisodes();
    } else if (action === 'addPodcastEpisode') {
      result = handleAddPodcastEpisode(params);
    } else if (action === 'deletePodcastEpisode') {
      result = handleDeletePodcastEpisode(params);

    // ── Owner Preferences ─────────────────────────────────────────────
    } else if (action === 'getOwnerPrefs') {
      result = handleGetOwnerPrefs(params);
    } else if (action === 'setOwnerPrefs') {
      result = handleSetOwnerPrefs(params);

    // ── Lineup Warnings ─────────────────────────────────────────────
    } else if (action === 'issueLineupWarning') {
      result = handleIssueLineupWarning(params);
    } else if (action === 'getLineupWarnings') {
      result = handleGetLineupWarnings();

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
  var carryLineup = null;
  var carryPeriod = null;
  var pNum = parseInt(period);
  for (var p = pNum - 1; p >= 1; p--) {
    for (var j = 1; j < data.length; j++) {
      if (data[j][0] === team && String(data[j][1]) === String(p)) {
        var parsed = JSON.parse(data[j][2] || '[]');
        // Check for both array format and compact object format
        if (Array.isArray(parsed) && parsed.length > 0) {
          carryLineup = parsed;
          carryPeriod = p;
        } else if (parsed && typeof parsed === 'object' && parsed.d) {
          // Compact format {"f":"nm","d":"..."} — still valid
          carryLineup = parsed;
          carryPeriod = p;
        }
        break;
      }
    }
    if (carryLineup) break;
  }
  return { success: true, team: team, period: period, lineup: carryLineup || [], updated: null, carriedFrom: carryPeriod };
}

function setLineup(team, period, pin, lineupJson) {
  const pinCheck = verifyPin(team, pin);
  if (!pinCheck.success) return pinCheck;

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('lineups');
  const data = sheet.getDataRange().getValues();
  const now = nowET_();

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
  // Collect all teams and their lineups by period for carry-forward
  const byTeam = {};
  for (let i = 1; i < data.length; i++) {
    var team = data[i][0];
    var p = parseInt(data[i][1]);
    if (!byTeam[team]) byTeam[team] = {};
    byTeam[team][p] = { lineup: JSON.parse(data[i][2] || '[]'), updated: data[i][3] };
  }
  var pNum = parseInt(period);
  Object.keys(byTeam).forEach(function(team) {
    if (byTeam[team][pNum]) {
      result[team] = byTeam[team][pNum];
    } else {
      // Carry forward from most recent prior period
      for (var pp = pNum - 1; pp >= 1; pp--) {
        if (byTeam[team][pp]) {
          result[team] = { lineup: byTeam[team][pp].lineup, updated: null, carriedFrom: pp };
          break;
        }
      }
    }
  });
  return { success: true, period: period, lineups: result };
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
    { url: 'https://www.rotoballer.com/player-news/feed?sport=mlb', source: 'RotoBaller' }
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
//   J=expiresTime, K=status (active/processed/cancelled/cancelled-conditional), L=conditional,
//   M=conditionOf, N=conditionalOrder

function addClaim(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) {
    ws = ss.insertSheet('waiver_claims');
    ws.appendRow(['id','team','playerName','playerPos','playerTeam','dropName','dropPos','dropTeam','claimTime','expiresTime','status','conditional','conditionOf','conditionalOrder']);
  }

  // Duplicate check — skip if same team+player claim exists within last 30 seconds
  var now = new Date();
  var data = ws.getDataRange().getValues();
  for (var dc = data.length - 1; dc >= 1; dc--) {
    var dcTeam = String(data[dc][1] || '').trim();
    var dcPlayer = String(data[dc][2] || '').trim();
    var dcTime = new Date(data[dc][8] || 0);
    if (dcTeam === params.team && dcPlayer === params.playerName && (now - dcTime) < 30000) {
      return { success: true, id: String(data[dc][0]), expires: String(data[dc][9]), duplicate: true };
    }
  }

  var id = Utilities.getUuid();
  var nowStr = nowET_();
  // If the player's waiver drop time is provided, expire 72h from that time (not from now)
  var expires;
  if (params.playerDropDateTime) {
    expires = new Date(new Date(params.playerDropDateTime).getTime() + 72 * 60 * 60 * 1000).toISOString();
  } else {
    expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  }
  var conditional = params.conditional || 'false';
  var conditionOf = params.conditionOf || '';
  var conditionalOrder = params.conditionalOrder || '';

  ws.appendRow([
    id, params.team, params.playerName, params.playerPos,
    params.playerTeam, params.dropName || '', params.dropPos || '',
    params.dropTeam || '', nowStr, expires, 'active', conditional, conditionOf, conditionalOrder
  ]);

  // Log the claim
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    logWs.appendRow([nowStr, 'CLAIM', params.team,
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
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Google Sheets auto-converts date strings to Date objects —
      // serialize back to ISO strings so the frontend gets a consistent format
      if (val instanceof Date) val = val.toISOString();
      row[headers[j]] = val;
    }
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
        logWs.appendRow([nowET_(), 'CANCEL', data[i][1],
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

function reorderConditionalClaims(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return { success: false, error: 'No claims sheet' };

  var groupId = params.groupId;
  var orderedIds = JSON.parse(params.orderedIds || '[]');
  if (!groupId || !orderedIds.length) return { success: false, error: 'groupId and orderedIds required' };

  var data = ws.getDataRange().getValues();
  var headers = data[0];
  var colMap = {};
  headers.forEach(function(h, i) { colMap[String(h).trim()] = i; });
  var orderCol = (colMap['conditionalOrder'] !== undefined ? colMap['conditionalOrder'] : 13) + 1;

  for (var i = 1; i < data.length; i++) {
    var id = String(data[i][colMap['id']] || '');
    var cof = String(data[i][colMap['conditionOf']] || '').trim();
    if (cof !== groupId) continue;
    var newOrder = orderedIds.indexOf(id);
    if (newOrder !== -1) {
      ws.getRange(i + 1, orderCol).setValue(newOrder + 1);
    }
  }
  return { success: true };
}

function removeFromConditionalGroup(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return { success: false, error: 'No claims sheet' };

  var data = ws.getDataRange().getValues();
  var headers = data[0];
  var colMap = {};
  headers.forEach(function(h, i) { colMap[String(h).trim()] = i; });
  var condCol = (colMap['conditionOf'] !== undefined ? colMap['conditionOf'] : 12) + 1;
  var orderCol = (colMap['conditionalOrder'] !== undefined ? colMap['conditionalOrder'] : 13) + 1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colMap['id']]) === String(params.id)) {
      ws.getRange(i + 1, condCol).setValue('');
      ws.getRange(i + 1, orderCol).setValue('');
      return { success: true };
    }
  }
  return { success: false, error: 'Claim not found' };
}

function cancelConditionalGroup(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return { success: false, error: 'No claims sheet' };

  var groupId = params.groupId;
  if (!groupId) return { success: false, error: 'groupId required' };

  var data = ws.getDataRange().getValues();
  var headers = data[0];
  var colMap = {};
  headers.forEach(function(h, i) { colMap[String(h).trim()] = i; });
  var statusCol = (colMap['status'] !== undefined ? colMap['status'] : 10) + 1;
  var cancelled = 0;

  for (var i = 1; i < data.length; i++) {
    var cof = String(data[i][colMap['conditionOf']] || '').trim();
    var status = String(data[i][colMap['status']] || '').trim().toLowerCase();
    if (cof === groupId && status === 'active') {
      ws.getRange(i + 1, statusCol).setValue('cancelled');
      cancelled++;
    }
  }

  var logWs = ss.getSheetByName('log');
  if (logWs && cancelled > 0) {
    logWs.appendRow([nowET_(), 'CANCEL', '',
      'Cancelled conditional group (' + cancelled + ' claims)', '']);
  }
  return { success: true, cancelled: cancelled };
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

// ── Seed initial waiver priority ──
function seedWaiverPriority() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_priority');
  if (!ws) {
    ws = ss.insertSheet('waiver_priority');
    ws.appendRow(['team', 'priority']);
  }
  if (ws.getLastRow() > 1) ws.getRange(2, 1, ws.getLastRow() - 1, 2).clearContent();
  var order = [
    'boys_of_summer','legion_of_doom','sf_jones','snuffleupagus','xt_home_fan',
    'hitmen','heidens_hardtimes','american_dreams','four_horsemen','bomb_squad',
    'billygoats','vipers'
  ];
  order.forEach(function(team, i) { ws.appendRow([team, i + 1]); });
  Logger.log('Waiver priority seeded: ' + order.join(', '));
}

// ── Cycle priority: winner drops to rank 12, others shift up ──
function cycleWaiverPriority_(winnerTeam) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_priority');
  if (!ws) return;
  var data = ws.getDataRange().getValues();
  var teams = [];
  for (var i = 1; i < data.length; i++) {
    teams.push({ team: String(data[i][0]).trim(), priority: parseInt(data[i][1]) || 999 });
  }
  teams.sort(function(a, b) { return a.priority - b.priority; });
  // Remove winner and re-add at end
  var filtered = teams.filter(function(t) { return t.team !== winnerTeam; });
  filtered.push({ team: winnerTeam });
  // Rewrite
  if (ws.getLastRow() > 1) ws.getRange(2, 1, ws.getLastRow() - 1, 2).clearContent();
  filtered.forEach(function(t, idx) { ws.appendRow([t.team, idx + 1]); });
}

// ── Add player to roster sheet ──
function addPlayerToRoster_(teamPinKey, playerName, playerPos, playerTeam) {
  var teamKey = pinKeyToTeamKey_(teamPinKey);
  var teamDef = ROSTER_TEAMS.filter(function(t) { return t.key === teamKey; })[0];
  if (!teamDef) return;
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  // Skip if player is already on this roster
  if (isPlayerOnRoster_(ss, teamKey, playerName)) {
    Logger.log('addPlayerToRoster_: ' + playerName + ' already on ' + teamKey + ' — skipping');
    return;
  }
  var ws = ss.getSheetByName(teamDef.tabName);
  if (!ws) return;
  ws.appendRow([playerPos || '', playerName || '', playerTeam || '']);
  invalidateRostersCache_();
}

// ── Remove player from roster sheet ──
function removePlayerFromRoster_(teamPinKey, playerName) {
  var teamDef = ROSTER_TEAMS.filter(function(t) { return t.key === pinKeyToTeamKey_(teamPinKey); })[0];
  if (!teamDef) return;
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName(teamDef.tabName);
  if (!ws) return;
  var data = ws.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]).trim() === playerName) {
      ws.deleteRow(i + 1);
      break;
    }
  }
  invalidateRostersCache_();
}

// ── Check if a player is already on a team's roster ──
function isPlayerOnRoster_(ss, teamKey, playerName) {
  var teamDef = ROSTER_TEAMS.filter(function(t) { return t.key === teamKey; })[0];
  if (!teamDef) {
    // teamKey might be a pinKey — convert it
    var converted = pinKeyToTeamKey_(teamKey);
    teamDef = ROSTER_TEAMS.filter(function(t) { return t.key === converted; })[0];
  }
  if (!teamDef) return false;
  var ws = ss.getSheetByName(teamDef.tabName);
  if (!ws) return false;
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === playerName) return true;
  }
  return false;
}

// ── Convert pinKey to teamKey ──
function pinKeyToTeamKey_(pinKey) {
  var map = {
    'vipers':'shawn','hitmen':'davidz','boys_of_summer':'davidr','bomb_squad':'brian',
    'sf_jones':'greg','heidens_hardtimes':'jason','american_dreams':'keith',
    'billygoats':'bill','four_horsemen':'jamie','legion_of_doom':'dan',
    'snuffleupagus':'jonas','xt_home_fan':'sam'
  };
  return map[pinKey] || pinKey;
}

// ── Convert teamKey to pinKey ──
function pinKeyFromTeamKey_(teamKey) {
  var map = {
    'shawn':'vipers','davidz':'hitmen','davidr':'boys_of_summer','brian':'bomb_squad',
    'greg':'sf_jones','jason':'heidens_hardtimes','keith':'american_dreams',
    'bill':'billygoats','jamie':'four_horsemen','dan':'legion_of_doom',
    'jonas':'snuffleupagus','sam':'xt_home_fan'
  };
  return map[teamKey] || teamKey;
}

// ── Find player data on roster sheet (pos, team) ──
function findPlayerOnRoster_(teamPinKey, playerName) {
  var teamDef = ROSTER_TEAMS.filter(function(t) { return t.key === pinKeyToTeamKey_(teamPinKey); })[0];
  if (!teamDef) return null;
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName(teamDef.tabName);
  if (!ws) return null;
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === playerName) {
      return { pos: String(data[i][0]).trim(), team: String(data[i][2]).trim() };
    }
  }
  return null;
}

// ── Remove player from waiver_players sheet ──
function removeFromWaiverSheet_(playerName, playerTeam) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_players');
  if (!ws) return;
  var data = ws.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    var n = String(data[i][1]).trim();
    var t = String(data[i][2]).trim();
    if (n === playerName && (!playerTeam || t === playerTeam)) {
      ws.deleteRow(i + 1);
      invalidateWaiverPlayersCache_();
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATED WAIVER CLAIM RESOLUTION
// Runs every 1 minute via time-driven trigger
// ═══════════════════════════════════════════════════════════════════════════

function resolveExpiredWaiverClaims() {
  // Prevent overlapping trigger executions from double-processing claims
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) { Logger.log('resolveExpiredWaiverClaims: could not acquire lock, skipping'); return; }
  try {
    _resolveExpiredWaiverClaimsInner();
    // Also resolve any deferred entries whose effective game has been reached
    resolveDeferredEntries();
  } finally { lock.releaseLock(); }
}

function _resolveExpiredWaiverClaimsInner() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return;

  var data = ws.getDataRange().getValues();
  if (data.length < 2) return;

  var headers = data[0];
  var colMap = {};
  headers.forEach(function(h, i) { colMap[String(h).trim()] = i; });

  var now = new Date();
  var expired = []; // {row: i, ...claimData}

  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][colMap['status']] || '').trim().toLowerCase();
    if (status !== 'active') continue;
    var expiresRaw = data[i][colMap['expiresTime']];
    if (!expiresRaw) continue;
    // Handle both Date objects (Google Sheets auto-converts) and strings
    var expires;
    if (expiresRaw instanceof Date) {
      expires = expiresRaw;
    } else {
      expires = new Date(String(expiresRaw));
    }
    if (isNaN(expires.getTime())) { Logger.log('Row ' + (i+1) + ' invalid expiresTime: ' + expiresRaw); continue; }
    if (now < expires) continue; // not expired yet
    Logger.log('Row ' + (i+1) + ' EXPIRED: now=' + nowET_() + ' expires=' + expires.toISOString() + ' player=' + String(data[i][colMap['playerName']] || ''));

    expired.push({
      row: i,
      id: String(data[i][colMap['id']] || ''),
      team: String(data[i][colMap['team']] || '').trim(),
      playerName: String(data[i][colMap['playerName']] || '').trim(),
      playerPos: String(data[i][colMap['playerPos']] || '').trim(),
      playerTeam: String(data[i][colMap['playerTeam']] || '').trim(),
      dropName: String(data[i][colMap['dropName']] || '').trim(),
      dropPos: String(data[i][colMap['dropPos']] || '').trim(),
      dropTeam: String(data[i][colMap['dropTeam']] || '').trim(),
      conditional: String(data[i][colMap['conditional']] || '').trim().toLowerCase(),
      conditionOf: String(data[i][colMap['conditionOf'] || colMap['conditionalOf']] || '').trim(),
      conditionalOrder: parseInt(data[i][colMap['conditionalOrder']] || '0') || 0
    });
  }

  if (!expired.length) return;

  // Load waiver priority
  var prioWs = ss.getSheetByName('waiver_priority');
  var prioMap = {};
  if (prioWs) {
    var prioData = prioWs.getDataRange().getValues();
    for (var p = 1; p < prioData.length; p++) {
      prioMap[String(prioData[p][0]).trim()] = parseInt(prioData[p][1]) || 999;
    }
  }

  // ── PASS 1: Determine tentative winners per player ──
  var byPlayer = {};
  expired.forEach(function(c) {
    if (!byPlayer[c.playerName]) byPlayer[c.playerName] = [];
    byPlayer[c.playerName].push(c);
  });

  // tentativeStatus: claimId -> 'awarded' | 'lost'
  var tentativeStatus = {};
  Object.keys(byPlayer).forEach(function(pn) {
    var claims = byPlayer[pn];
    claims.sort(function(a, b) { return (prioMap[a.team] || 999) - (prioMap[b.team] || 999); });
    claims.forEach(function(c, idx) {
      tentativeStatus[c.id] = idx === 0 ? 'awarded' : 'lost';
    });
  });

  // ── PASS 2: Resolve conditional groups ──
  // Group expired claims by conditionOf
  var condGroups = {};
  expired.forEach(function(c) {
    if (c.conditionOf) {
      if (!condGroups[c.conditionOf]) condGroups[c.conditionOf] = [];
      condGroups[c.conditionOf].push(c);
    }
  });

  Object.keys(condGroups).forEach(function(groupId) {
    var group = condGroups[groupId];
    group.sort(function(a, b) { return a.conditionalOrder - b.conditionalOrder; });

    var foundWinner = false;
    group.forEach(function(c) {
      if (foundWinner) {
        // Owner already won a higher-priority claim in this group — cancel the rest
        if (tentativeStatus[c.id] === 'awarded') {
          // This was a tentative winner — re-adjudicate that player
          tentativeStatus[c.id] = 'cancelled-conditional';
          var otherClaims = byPlayer[c.playerName].filter(function(oc) {
            return oc.id !== c.id && tentativeStatus[oc.id] === 'lost';
          });
          if (otherClaims.length) {
            otherClaims.sort(function(a, b) { return (prioMap[a.team] || 999) - (prioMap[b.team] || 999); });
            tentativeStatus[otherClaims[0].id] = 'awarded';
            Logger.log('RE-ADJUDICATED: ' + c.playerName + ' re-awarded to ' + otherClaims[0].team);
          }
        } else {
          tentativeStatus[c.id] = 'cancelled-conditional';
        }
      } else if (tentativeStatus[c.id] === 'awarded') {
        foundWinner = true; // keep this one, cancel subsequent
      }
      // If 'lost', continue to next in group — maybe the next one won
    });
  });

  // ── PASS 3: Apply results ──
  var statusCol = colMap['status'] + 1; // 1-indexed for Sheets

  // Write all statuses to the sheet
  expired.forEach(function(c) {
    ws.getRange(c.row + 1, statusCol).setValue(tentativeStatus[c.id]);
  });

  // Apply roster changes and notifications for each awarded claim
  var awardedByPlayer = {};
  expired.forEach(function(c) {
    if (tentativeStatus[c.id] === 'awarded') awardedByPlayer[c.playerName] = c;
  });

  Object.keys(awardedByPlayer).forEach(function(playerName) {
    var winner = awardedByPlayer[playerName];
    var allClaimsForPlayer = byPlayer[playerName];

    // Safety check: skip if player is already on this team's roster (e.g. picked up directly before claim expired)
    if (isPlayerOnRoster_(ss, winner.team, winner.playerName)) {
      Logger.log('SKIP AWARD: ' + winner.playerName + ' already on ' + winner.team + ' roster');
      return; // skip — already picked up via direct free agent pickup
    }

    // Always modify roster immediately — roster/waiver/transactions are instant
    addPlayerToRoster_(winner.team, winner.playerName, winner.playerPos, winner.playerTeam);
    removeFromWaiverSheet_(winner.playerName, winner.playerTeam);
    if (winner.dropName) {
      removePlayerFromRoster_(winner.team, winner.dropName);
      var wpWs = ss.getSheetByName('waiver_players');
      if (wpWs) {
        var dropDate = new Date().toLocaleDateString('en-CA', {timeZone:'America/New_York'});
        var dropDT = nowET_();
        var dropMlbId = lookupMlbIdByName_(ss, winner.dropName);
        wpWs.appendRow([winner.dropPos || '', winner.dropName, winner.dropTeam || '', dropDate, dropDT, 'red', dropMlbId]);
        invalidateWaiverPlayersCache_();
      }
    }
    cycleWaiverPriority_(winner.team);

    // Check if this transaction should be deferred for lineup/live scoring purposes
    var _waiverAdds = [{name: winner.playerName, pos: winner.playerPos, mlbTeam: winner.playerTeam}];
    var _waiverDrops = winner.dropName ? [{name: winner.dropName, pos: winner.dropPos, mlbTeam: winner.dropTeam}] : [];
    var _deferResult = checkAndDeferTransaction_(winner.team, _waiverAdds, _waiverDrops, 'waiver', winner.id);

    var ownerName = getOwnerName_(winner.team);
    var desc = ownerName + '- picks up ' + winner.playerName + '.';
    if (winner.dropName) desc = ownerName + '- picks up ' + winner.playerName + '. Cuts ' + winner.dropName + '.';
    if (_deferResult.deferred) desc += ' (Effective Game ' + _deferResult.effectiveGame + ')';

    var logWs = ss.getSheetByName('log');
    if (logWs) {
      logWs.appendRow([nowET_(), 'TRANSACTION', winner.team, desc, '']);
    }

    // Email winner
    try {
      var winnerEmail = getOwnerEmail_(winner.team);
      if (winnerEmail) {
        MailApp.sendEmail(winnerEmail,
          'CVC Fantasy Baseball — Waiver Claim Awarded',
          'Hello ' + ownerName + ',\n\n' +
          'Your waiver claim has been awarded!\n\n' +
          'PLAYER: ' + winner.playerName + ' (' + winner.playerPos + ', ' + winner.playerTeam + ')\n' +
          (winner.dropName ? 'DROPPED: ' + winner.dropName + '\n' : '') +
          '\nhttps://www.cvcfantasybaseball.com\n\n' +
          '— CVC Fantasy Baseball'
        );
      }
    } catch(e) { Logger.log('Winner email error: ' + e); }
    // SMS — claim awarded
    try { notifyOwner_(winner.team, 'optIn_claimAwarded', 'CVC Baseball: Your waiver claim for ' + winner.playerName + ' was awarded. They are now on your roster.'); } catch(e) {}

    // Email losers
    for (var li = 0; li < allClaimsForPlayer.length; li++) {
      var loser = allClaimsForPlayer[li];
      if (loser.id === winner.id) continue;
      if (tentativeStatus[loser.id] === 'cancelled-conditional') continue; // don't email conditional cancels
      try {
        var loserEmail = getOwnerEmail_(loser.team);
        var loserName = getOwnerName_(loser.team);
        if (loserEmail) {
          MailApp.sendEmail(loserEmail,
            'CVC Fantasy Baseball — Waiver Claim Lost',
            'Hello ' + loserName + ',\n\n' +
            'Your waiver claim for ' + playerName + ' was not awarded. ' +
            'The player was claimed by another team with higher waiver priority.\n\n' +
            'https://www.cvcfantasybaseball.com\n\n' +
            '— CVC Fantasy Baseball'
          );
        }
      } catch(e) { Logger.log('Loser email error: ' + e); }
      // SMS — claim lost
      try { notifyOwner_(loser.team, 'optIn_claimLost', 'CVC Baseball: Your waiver claim for ' + loser.playerName + ' was not awarded. Another team had higher priority.'); } catch(e) {}
    }

    Logger.log('AWARDED: ' + winner.playerName + ' to ' + winner.team + ' (priority ' + (prioMap[winner.team]||'?') + ')');
  });
}

// ── Setup 1-minute trigger for claim resolution ──
function setupWaiverResolutionTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'resolveExpiredWaiverClaims') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('resolveExpiredWaiverClaims')
    .timeBased()
    .everyMinutes(1)
    .create();
  Logger.log('Waiver resolution trigger created — runs every 1 minute');
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
  // Duplicate check — skip if identical entry exists within last 30 seconds
  var now = new Date();
  var data = ws.getDataRange().getValues();
  for (var dc = data.length - 1; dc >= 1; dc--) {
    var dcType = String(data[dc][1] || '').trim();
    var dcTeam = String(data[dc][2] || '').trim();
    var dcDetails = String(data[dc][3] || '').trim();
    var dcTime = new Date(data[dc][0] || 0);
    if (dcType === params.type && dcTeam === params.team && dcDetails === params.details && (now - dcTime) < 30000) {
      return { success: true, duplicate: true };
    }
  }
  ws.appendRow([nowET_(), params.type, params.team, params.details, params.period || '']);
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
  // Limit to 500 entries
  if (entries.length > 500) entries = entries.slice(0, 500);
  return { success: true, entries: entries };
}


// ═══════════════════════════════════════════════════════════════════════════
// RESULTS & STANDINGS
// results columns: period, team1, team2, team1_wins, team2_wins, ties, winner, date
// ═══════════════════════════════════════════════════════════════════════════

function handleWriteGameResults(params) {
  if (params.pin !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('results');
  if (!ws) {
    ws = ss.insertSheet('results');
    ws.appendRow(['period','team1','team2','team1_wins','team2_wins','ties','winner','date']);
  }

  var period = parseInt(params.period, 10);
  var matchups;
  try { matchups = JSON.parse(params.matchups); } catch(e) { return { success: false, error: 'Invalid matchups JSON' }; }

  // Remove existing results for this period to allow overwriting
  var data = ws.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (parseInt(data[i][0], 10) === period) ws.deleteRow(i + 1);
  }

  var today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  matchups.forEach(function(m) {
    var w1 = parseInt(m.team1_wins, 10) || 0;
    var w2 = parseInt(m.team2_wins, 10) || 0;
    var t = parseInt(m.ties, 10) || 0;
    var winner = w1 > w2 ? m.team1 : w2 > w1 ? m.team2 : 'TIE';
    ws.appendRow([period, m.team1, m.team2, w1, w2, t, winner, today]);
  });

  return { success: true, period: period, matchups: matchups.length };
}

function handleGetStandings() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('standings_calc');
  if (cached) {
    try { return { success: true, standings: JSON.parse(cached), cached: true }; } catch(e) {}
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('results');
  if (!ws) return { success: true, standings: [] };

  var data = ws.getDataRange().getValues();
  var teams = {};

  for (var i = 1; i < data.length; i++) {
    var t1 = String(data[i][1]).trim();
    var t2 = String(data[i][2]).trim();
    var w1 = parseInt(data[i][3], 10) || 0;
    var w2 = parseInt(data[i][4], 10) || 0;
    var ties = parseInt(data[i][5], 10) || 0;

    if (!teams[t1]) teams[t1] = { team: t1, wins: 0, losses: 0, ties: 0, catWins: 0, catLosses: 0, catTies: 0, gamesPlayed: 0 };
    if (!teams[t2]) teams[t2] = { team: t2, wins: 0, losses: 0, ties: 0, catWins: 0, catLosses: 0, catTies: 0, gamesPlayed: 0 };

    // Game result (who won the matchup)
    if (w1 > w2) { teams[t1].wins++; teams[t2].losses++; }
    else if (w2 > w1) { teams[t2].wins++; teams[t1].losses++; }
    else { teams[t1].ties++; teams[t2].ties++; }

    // Category totals
    teams[t1].catWins += w1; teams[t1].catLosses += w2; teams[t1].catTies += ties;
    teams[t2].catWins += w2; teams[t2].catLosses += w1; teams[t2].catTies += ties;
    teams[t1].gamesPlayed++;
    teams[t2].gamesPlayed++;
  }

  // Calculate pct and sort
  var standings = Object.values(teams).map(function(t) {
    var total = t.wins + t.losses + t.ties;
    t.pct = total > 0 ? ((t.wins + t.ties * 0.5) / total) : 0;
    t.catDiff = t.catWins - t.catLosses;
    return t;
  });
  standings.sort(function(a, b) { return b.pct - a.pct || b.catDiff - a.catDiff || b.catWins - a.catWins; });

  try { cache.put('standings_calc', JSON.stringify(standings), 60); } catch(e) {}
  return { success: true, standings: standings };
}

function handleGetHeadToHead(params) {
  var team1 = (params.team1 || '').trim();
  var team2 = (params.team2 || '').trim();
  if (!team1 || !team2) return { success: false, error: 'team1 and team2 required' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('results');
  if (!ws) return { success: true, h2h: { team1Wins: 0, team2Wins: 0, ties: 0 } };

  var data = ws.getDataRange().getValues();
  var h2h = { team1Wins: 0, team2Wins: 0, ties: 0, matches: [] };

  for (var i = 1; i < data.length; i++) {
    var t1 = String(data[i][1]).trim();
    var t2 = String(data[i][2]).trim();
    var w1 = parseInt(data[i][3], 10) || 0;
    var w2 = parseInt(data[i][4], 10) || 0;
    var winner = String(data[i][6]).trim();
    var period = parseInt(data[i][0], 10) || 0;

    if ((t1 === team1 && t2 === team2) || (t1 === team2 && t2 === team1)) {
      var myWins = t1 === team1 ? w1 : w2;
      var oppWins = t1 === team1 ? w2 : w1;
      if (winner === team1) h2h.team1Wins++;
      else if (winner === team2) h2h.team2Wins++;
      else h2h.ties++;
      h2h.matches.push({ period: period, score: myWins + '-' + oppWins, winner: winner });
    }
  }
  return { success: true, h2h: h2h };
}

function handleGetMatchupContext(params) {
  var team1 = (params.team1 || '').trim();
  var team2 = (params.team2 || '').trim();
  var gameNum = parseInt(params.gameNum, 10) || 0;

  // Standings
  var standingsData = handleGetStandings();
  var standings = standingsData.standings || [];

  // Head to head
  var h2hData = handleGetHeadToHead({ team1: team1, team2: team2 });
  var h2h = h2hData.h2h || {};

  // Rosters
  var rostersData = handleGetRosters();
  var allRosters = rostersData.rosters || {};

  // Find team keys from owner names
  var teamMap = {
    'Shawn':'shawn','David Z.':'davidz','David R.':'davidr','Brian':'brian',
    'Greg':'greg','Jason':'jason','Keith':'keith','Bill':'bill',
    'Jamie':'jamie','Dan':'dan','Jonas':'jonas','Sam':'sam'
  };
  var t1Key = teamMap[team1] || '';
  var t2Key = teamMap[team2] || '';
  var roster1 = allRosters[t1Key] || [];
  var roster2 = allRosters[t2Key] || [];

  // Recent transactions (last 14 days)
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var recentTrans = [];
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    var logData = logWs.getDataRange().getValues();
    var cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    for (var i = 1; i < logData.length; i++) {
      var ts = new Date(logData[i][0]);
      if (ts >= cutoff) {
        var details = String(logData[i][3] || '');
        var type = String(logData[i][1] || '');
        if (type === 'TRANSACTION' || type === 'TRADE' || type === 'DROP' || type === 'DRAFT') {
          recentTrans.push({ date: ts.toISOString().slice(0, 10), type: type, details: details });
        }
      }
    }
  }

  // Team standings for each team
  var t1Standing = standings.find(function(s) { return s.team === team1; }) || null;
  var t2Standing = standings.find(function(s) { return s.team === team2; }) || null;

  // Division info
  var TEAM_DIVISIONS = {
    'Shawn':'EAST','David Z.':'EAST','David R.':'EAST','Brian':'EAST',
    'Greg':'CENTRAL','Jason':'CENTRAL','Keith':'CENTRAL','Bill':'CENTRAL',
    'Jamie':'WEST','Dan':'WEST','Jonas':'WEST','Sam':'WEST'
  };

  return {
    success: true,
    gameNum: gameNum,
    team1: { name: team1, key: t1Key, roster: roster1, standing: t1Standing, division: TEAM_DIVISIONS[team1] || '' },
    team2: { name: team2, key: t2Key, roster: roster2, standing: t2Standing, division: TEAM_DIVISIONS[team2] || '' },
    h2h: h2h,
    recentTransactions: recentTrans,
    standings: standings,
    isDivisionGame: TEAM_DIVISIONS[team1] === TEAM_DIVISIONS[team2]
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MATCHUP PREVIEW — Anthropic API proxy (key stored in Script Properties)
// Set the key: Project Settings > Script Properties > ANTHROPIC_API_KEY
// ═══════════════════════════════════════════════════════════════════════════

function handleGenerateMatchupPreview(params) {
  if (!params || !params.team1 || !params.team2) {
    return { success: false, error: 'Missing required params: team1, team2' };
  }

  var team1Name = String(params.team1 || '').trim();
  var team2Name = String(params.team2 || '').trim();
  var gameNum = parseInt(params.gameNum || '0', 10) || 0;

  // ── Check sheet cache first ──
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var cacheWs = ss.getSheetByName('preview_cache');
  if (!cacheWs) {
    cacheWs = ss.insertSheet('preview_cache');
    cacheWs.appendRow(['gameNum', 'team1', 'team2', 'preview', 'generated']);
  }
  // Normalize key: sorted team names so A-vs-B and B-vs-A hit same cache
  var sortedTeams = [team1Name, team2Name].sort();
  var cacheData = cacheWs.getDataRange().getValues();
  for (var ci = 1; ci < cacheData.length; ci++) {
    var cGame = parseInt(cacheData[ci][0]) || 0;
    var cTeams = [String(cacheData[ci][1] || '').trim(), String(cacheData[ci][2] || '').trim()].sort();
    if (cGame === gameNum && cTeams[0] === sortedTeams[0] && cTeams[1] === sortedTeams[1]) {
      var cachedPreview = String(cacheData[ci][3] || '');
      if (cachedPreview) {
        Logger.log('Preview cache HIT: game ' + gameNum + ' ' + sortedTeams.join(' vs '));
        return { success: true, preview: cachedPreview, cached: true };
      }
    }
  }

  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { success: false, error: 'Anthropic API key not configured' };
  var champions = {
    '1997':{team:'Kalcutta Corncutters',owner:'George Hunt'},'1998':{team:'The Four Horsemen',owner:'Jamie Yane'},
    '1999':{team:'Vipers',owner:'Shawn Gidley'},'2000':{team:'The Four Horsemen',owner:'Jamie Yane'},
    '2001':{team:'Vipers',owner:'Shawn Gidley'},'2002':{team:'The Legends',owner:'David Sotka'},
    '2003':{team:'The Hitmen',owner:'David Zaccarine'},'2004':{team:'Legion of Doom',owner:'Dan Osicki'},
    '2005':{team:'The American Dreams',owner:'Keith Cromer'},'2006':{team:'Legion of Doom',owner:'Dan Osicki'},
    '2007':{team:'Legion of Doom',owner:'Dan Osicki'},'2008':{team:'San Francisco Jones123',owner:'Greg Akagi'},
    '2009':{team:'The Hitmen',owner:'David Zaccarine'},'2010':{team:'The Four Horsemen',owner:'Jamie Yane'},
    '2011':{team:'The Four Horsemen',owner:'Jamie Yane'},'2012':{team:'Pimp Mack Daddies',owner:'Bill Krause'},
    '2013':{team:'The American Dreams',owner:'Keith Cromer'},'2014':{team:'The American Dreams',owner:'Keith Cromer'},
    '2015':{team:'Vipers',owner:'Shawn Gidley'},'2016':{team:'The American Dreams',owner:'Keith Cromer'},
    '2017':{team:'The Super Snuffleupagus',owner:'Jonas Pattie'},'2018':{team:'Vipers',owner:'Shawn Gidley'},
    '2019':{team:'Vipers',owner:'Shawn Gidley'},'2020':{team:'Vipers',owner:'Shawn Gidley'},
    '2021':{team:'The American Dreams',owner:'Keith Cromer'},'2022':{team:'Legion of Doom',owner:'Dan Osicki'},
    '2023':{team:'The Four Horsemen',owner:'Jamie Yane'},'2024':{team:'The Four Horsemen',owner:'Jamie Yane'},
    '2025':{team:'Vipers',owner:'Shawn Gidley'}
  };

  // Team name lookup for preview
  var TEAMS_FOR_PREVIEW_ = [
    {owner:'Shawn',team:'Vipers'},{owner:'David Z.',team:'The Hitmen'},{owner:'David R.',team:'The Boys of Summer'},
    {owner:'Brian',team:'Bomb Squad'},{owner:'Greg',team:'San Francisco Jones123'},{owner:'Jason',team:"Heiden's Hardtimes"},
    {owner:'Keith',team:'The American Dreams'},{owner:'Bill',team:'Billy Goats Gruff'},{owner:'Jamie',team:'The Four Horsemen'},
    {owner:'Dan',team:'Legion of Doom'},{owner:'Jonas',team:'The Super Snuffleupagus'},{owner:'Sam',team:'X-Thome Fan'}
  ];
  function stgTeamNameGAS_(ownerName) {
    var t = TEAMS_FOR_PREVIEW_.find(function(tm) { return tm.owner === ownerName; });
    return t ? t.team : ownerName;
  }

  if (!team1Name || !team2Name) return { success: false, error: 'team1 and team2 required' };

  // Fetch all context data internally
  var ctx = handleGetMatchupContext({ team1: team1Name, team2: team2Name, gameNum: String(gameNum) });
  var team1 = ctx.team1 || {};
  var team2 = ctx.team2 || {};
  var h2h = ctx.h2h || {};
  var standings = ctx.standings || [];
  var recentTrans = ctx.recentTransactions || [];
  var isDivGame = ctx.isDivisionGame || false;

  // Build roster summaries
  function rosterSummary(roster) {
    if (!roster || !roster.length) return 'No roster data available.';
    var hitters = roster.filter(function(p) { return ['C','1B','2B','3B','SS','OF','UT'].indexOf(p.pos.split('-')[0]) !== -1; });
    var pitchers = roster.filter(function(p) { return ['SP','RP','P'].indexOf(p.pos.split('-')[0]) !== -1; });
    var h = hitters.map(function(p) { return p.name + ' (' + p.pos + ', ' + (p.team || '?') + ')'; }).join(', ');
    var pit = pitchers.map(function(p) { return p.name + ' (' + p.pos + ', ' + (p.team || '?') + ')'; }).join(', ');
    return 'Hitters: ' + h + '\nPitchers: ' + pit;
  }

  // Pre-calculate exact championship facts for both teams
  var champYears = Object.keys(champions).sort();
  var champSummary = champYears.map(function(y) { var c = champions[y]; return y + ': ' + (c.team || c) + (c.owner ? ' (' + c.owner + ')' : ''); }).join(', ');

  // Map owner names to team names used in matchups
  var ownerTeamMap = {};
  TEAMS_FOR_PREVIEW_.forEach(function(t) { ownerTeamMap[t.owner] = t.team; });

  // Map short owner names to full names used in champion data
  var ownerFullNames = {
    'Shawn':'Shawn Gidley','David Z.':'David Zaccarine','David R.':'David Ryks',
    'Brian':'Brian Pattie','Greg':'Greg Akagi','Jason':'Jason Heiden',
    'Keith':'Keith Cromer','Bill':'Bill Krause','Jamie':'Jamie Yane',
    'Dan':'Dan Osicki','Jonas':'Jonas Pattie','Sam':'Sam Klco'
  };

  function getChampFacts(ownerName) {
    var fullName = ownerFullNames[ownerName] || ownerName;
    var teamNames = [ownerName];
    var t = TEAMS_FOR_PREVIEW_.find(function(tm) { return tm.owner === ownerName; });
    if (t) teamNames.push(t.team);
    // Check historical team names
    champYears.forEach(function(y) {
      var c = champions[y];
      if (c.owner === fullName || teamNames.indexOf(c.team) !== -1) {
        if (teamNames.indexOf(c.team) === -1) teamNames.push(c.team);
      }
    });
    var wins = [];
    champYears.forEach(function(y) {
      var c = champions[y];
      if (c.owner === fullName || teamNames.indexOf(c.team) !== -1) {
        wins.push(y);
      }
    });
    var count = wins.length;
    var lastTitle = wins.length ? wins[wins.length - 1] : null;
    var yearsSince = lastTitle ? (2026 - parseInt(lastTitle, 10)) : null;
    return { count: count, years: wins, lastTitle: lastTitle, yearsSince: yearsSince };
  }

  var t1Facts = getChampFacts(team1Name);
  var t2Facts = getChampFacts(team2Name);

  var champFactsBlock = 'CHAMPIONSHIP FACTS (use these exact numbers, do not calculate or estimate):\n';
  var t1TeamName = stgTeamNameGAS_(team1Name);
  var t2TeamName = stgTeamNameGAS_(team2Name);
  champFactsBlock += 'Team 1: ' + t1TeamName + ', owned by ' + team1Name + '\n';
  champFactsBlock += t1TeamName + ': ' + t1Facts.count + ' championships' + (t1Facts.years.length ? ', won in: ' + t1Facts.years.join(', ') : ', never won') + (t1Facts.yearsSince !== null ? '. Last title: ' + t1Facts.lastTitle + ' (' + t1Facts.yearsSince + ' years ago)' : '') + '\n';
  champFactsBlock += 'Team 2: ' + t2TeamName + ', owned by ' + team2Name + '\n';
  champFactsBlock += t2TeamName + ': ' + t2Facts.count + ' championships' + (t2Facts.years.length ? ', won in: ' + t2Facts.years.join(', ') : ', never won') + (t2Facts.yearsSince !== null ? '. Last title: ' + t2Facts.lastTitle + ' (' + t2Facts.yearsSince + ' years ago)' : '') + '\n';

  var titleCounts = {};
  champYears.forEach(function(y) { var o = champions[y].owner || champions[y]; titleCounts[o] = (titleCounts[o] || 0) + 1; });
  var titleSummary = Object.keys(titleCounts).map(function(o) { return o + ': ' + titleCounts[o]; }).join(', ');

  function standingSummary(s) {
    if (!s) return 'No standings data.';
    var summary = s.team + ': ' + s.wins + '-' + s.losses + (s.ties ? '-' + s.ties : '') + ' (' + (s.pct || 0).toFixed(3) + '), Cat diff: ' + (s.catDiff > 0 ? '+' : '') + (s.catDiff || 0);
    // Calculate streak from results
    var ss2 = SpreadsheetApp.openById(SPREADSHEET_ID);
    var rSheet = ss2.getSheetByName('results');
    if (rSheet) {
      var rData = rSheet.getDataRange().getValues();
      var results = [];
      for (var ri = 1; ri < rData.length; ri++) {
        var t1 = String(rData[ri][1]).trim();
        var t2 = String(rData[ri][2]).trim();
        var winner = String(rData[ri][6]).trim();
        if (t1 === s.team || t2 === s.team) {
          results.push(winner === s.team ? 'W' : 'L');
        }
      }
      if (results.length > 0) {
        var lastResult = results[results.length - 1];
        var streakCount = 0;
        for (var si = results.length - 1; si >= 0; si--) {
          if (results[si] === lastResult) streakCount++;
          else break;
        }
        summary += ', Streak: ' + lastResult + streakCount;
      }
    }
    return summary;
  }

  var h2hSummary = 'No head-to-head data.';
  if (h2h.team1Wins || h2h.team2Wins || h2h.ties) {
    if (h2h.team1Wins > h2h.team2Wins) h2hSummary = team1Name + ' leads ' + h2h.team1Wins + '-' + h2h.team2Wins + ' all-time.';
    else if (h2h.team2Wins > h2h.team1Wins) h2hSummary = team2Name + ' leads ' + h2h.team2Wins + '-' + h2h.team1Wins + ' all-time.';
    else h2hSummary = 'All-time series tied ' + h2h.team1Wins + '-' + h2h.team2Wins + '.';
  }

  var t1Trans = recentTrans.filter(function(t) { return t.details.indexOf(team1Name) !== -1; });
  var t2Trans = recentTrans.filter(function(t) { return t.details.indexOf(team2Name) !== -1; });

  // System prompt
  var systemPrompt = 'You are a confident, well-informed fantasy baseball analyst covering the CVC Fantasy Baseball dynasty league (30th season, 2026). Write sharp, engaging prose. No bullet points. No headers. No markdown formatting. Just paragraphs of analysis.\n\nFOCUS ON THE PRESENT: Talk about current 2026 performances, hot/cold streaks, recent transactions, injuries, and how they impact this matchup. Reference specific players who are performing well or struggling RIGHT NOW. Mention 2025 playoff matchups or 2026 preseason favorites if relevant context. Only briefly reference championship history if directly relevant — do NOT lead with it or make it the focus.\n\nCVC scoring has 13 statistical categories. Each category = 1 point. Tied categories = 0 for both. Combined score can be 0 to 13. Valid scores: 8-5, 7-4, 6-3, 9-3.\n\nWhen referring to owners, use first names only. Distinguish David Z. and David R. Never use full last names.';

  // User message
  var userMsg = '';
  if (gameNum === 1) {
    userMsg = 'Write a Game 1 season opener preview for the 30th season of CVC Fantasy Baseball.\n\n';
    userMsg += 'MATCHUP: ' + team1Name + ' vs. ' + team2Name + '\n';
    userMsg += 'This is the season opener of the 30th season. Write 4 paragraphs:\n';
    userMsg += 'P1: Set the scene — Opening Day of the 30th season. Evoke the history. Mention both teams.\n';
    userMsg += 'P2: Franchise history — titles won, dynasty status.\n';
    userMsg += 'P3: This season — roster construction, players to watch.\n';
    userMsg += 'P4: Prediction with CVC scoring format score (e.g. "Vipers win, 8-5").\n\n';
  } else {
    userMsg = 'Write a Game ' + gameNum + ' matchup preview for CVC Fantasy Baseball (2026).\n\n';
    userMsg += 'MATCHUP: ' + team1Name + ' vs. ' + team2Name + '\n';
    if (isDivGame) userMsg += 'DIVISION GAME.\n';
    if (gameNum >= 28) userMsg += 'Late season — note playoff implications.\n';
    userMsg += '3-4 paragraphs. Focus on:\n';
    userMsg += '- Current form: which players are hot or cold right now\n';
    userMsg += '- Key injuries or recent transactions that affect this matchup\n';
    userMsg += '- Standings context: what does each team need from this game\n';
    userMsg += '- Specific roster advantages: pitching depth, power bats, stolen base threats\n';
    userMsg += 'Close with a confident pick and score prediction.\n\n';
  }

  userMsg += '--- DATA ---\n\n';
  userMsg += 'SCORING RULE: 13 categories total. Each won category = 1 point. Tied categories = 0 points for both teams. Combined score can be 13 or less. Neither score can exceed 13. Example valid scores: 8-5, 7-4, 6-3, 9-3.\n\n';
  userMsg += 'H2H THIS SEASON: ' + h2hSummary + '\n';
  userMsg += t1TeamName + ': ' + t1Facts.count + ' career titles. ' + t2TeamName + ': ' + t2Facts.count + ' career titles.\n\n';
  userMsg += team1Name + ': ' + standingSummary(team1.standing) + ' | ' + (team1.division || '?') + '\nROSTER:\n' + rosterSummary(team1.roster) + '\n\n';
  userMsg += team2Name + ': ' + standingSummary(team2.standing) + ' | ' + (team2.division || '?') + '\nROSTER:\n' + rosterSummary(team2.roster) + '\n\n';
  if (standings.length) userMsg += 'STANDINGS:\n' + standings.map(function(s, i) { return (i+1) + '. ' + s.team + ' ' + s.wins + '-' + s.losses; }).join('\n') + '\n\n';
  if (t1Trans.length) userMsg += team1Name + ' TRANSACTIONS:\n' + t1Trans.map(function(t) { return t.date + ': ' + t.details; }).join('\n') + '\n\n';
  if (t2Trans.length) userMsg += team2Name + ' TRANSACTIONS:\n' + t2Trans.map(function(t) { return t.date + ': ' + t.details; }).join('\n') + '\n\n';

  // Call Anthropic API with retry on 529 (overloaded)
  var maxRetries = 2;
  try {
    for (var attempt = 0; attempt < maxRetries; attempt++) {
      var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        payload: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }]
        }),
        muteHttpExceptions: true
      });
      var code = response.getResponseCode();
      var respBody = response.getContentText();
      if (code === 529 && attempt < maxRetries - 1) {
        Logger.log('Anthropic API overloaded (529), retrying in 5 seconds... attempt ' + (attempt + 1));
        Utilities.sleep(5000);
        continue;
      }
      if (code !== 200) {
        Logger.log('Anthropic API error: ' + code + ' ' + respBody);
        return { success: false, error: 'API error: ' + code };
      }
      var parsed = JSON.parse(respBody);
      var text = (parsed.content && parsed.content[0]) ? parsed.content[0].text : '';
      // Save to sheet cache so all users see the same preview
      try {
        cacheWs.appendRow([gameNum, sortedTeams[0], sortedTeams[1], text, nowET_()]);
        Logger.log('Preview cached: game ' + gameNum + ' ' + sortedTeams.join(' vs '));
      } catch(ce) { Logger.log('Preview cache write error: ' + ce); }
      return { success: true, preview: text };
    }
  } catch(e) {
    Logger.log('Anthropic API exception: ' + e.toString());
    return { success: false, error: 'API call failed: ' + e.toString() };
  }
}

// Test function — run from Apps Script editor to test preview generation
// One-time fix: fix the log entries for Jonas/Bill trade
// Run from Apps Script editor, then delete this function
// One-time fix: execute the Jonas/Bill trade roster moves
// Run from Apps Script editor, then delete this function
function fixJonasBillTradeRosters() {
  // Chad Patrick: Jonas → Bill
  var cpData = findPlayerOnRoster_('snuffleupagus', 'Chad Patrick');
  if (cpData) {
    removePlayerFromRoster_('snuffleupagus', 'Chad Patrick');
    addPlayerToRoster_('billygoats', 'Chad Patrick', cpData.pos || 'SP', cpData.team || '');
    Logger.log('Moved Chad Patrick from Jonas to Bill');
  } else {
    Logger.log('Chad Patrick not found on Jonas roster — may already be moved');
  }
  // Luis Garcia Jr.: Bill → Jonas
  var lgData = findPlayerOnRoster_('billygoats', 'Luis Garcia Jr.');
  if (lgData) {
    removePlayerFromRoster_('billygoats', 'Luis Garcia Jr.');
    addPlayerToRoster_('snuffleupagus', 'Luis Garcia Jr.', lgData.pos || '2B', lgData.team || 'WSH');
    Logger.log('Moved Luis Garcia Jr. from Bill to Jonas');
  } else {
    Logger.log('Luis Garcia Jr. not found on Bill roster — may already be moved');
  }
  // Delete the multi_trades record so only the clean trades sheet entry shows
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var mtWs = ss.getSheetByName('multi_trades');
  if (mtWs) {
    var mtData = mtWs.getDataRange().getValues();
    for (var i = mtData.length - 1; i >= 1; i--) {
      var teams = String(mtData[i][1] || '');
      if (teams.indexOf('snuffleupagus') !== -1 && teams.indexOf('billygoats') !== -1) {
        mtWs.deleteRow(i + 1);
        Logger.log('Deleted multi_trades row ' + (i + 1));
      }
    }
  }
  invalidateRostersCache_();
  Logger.log('Fix complete');
}

function fixJonasBillTradeLog() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('log');
  if (!ws) return;
  var data = ws.getDataRange().getValues();
  // Delete the two MULTI_TRADE entries (bottom up)
  var rowsToDelete = [];
  for (var i = 1; i < data.length; i++) {
    var type = String(data[i][1] || '');
    var details = String(data[i][3] || '');
    if ((type === 'MULTI_TRADE_PROPOSED' || type === 'MULTI_TRADE_COMPLETED') && details.indexOf('snuffleupagus') !== -1 && details.indexOf('billygoats') !== -1) {
      rowsToDelete.push(i + 1);
    }
    if (type === 'MULTI_TRADE_COMPLETED' && details.indexOf('Chad Patrick') !== -1 && details.indexOf('Luis Garcia Jr.') !== -1) {
      rowsToDelete.push(i + 1);
    }
  }
  // Deduplicate
  var unique = [];
  rowsToDelete.forEach(function(r) { if (unique.indexOf(r) === -1) unique.push(r); });
  // Delete bottom up
  unique.sort(function(a,b){return b-a;});
  unique.forEach(function(r) { ws.deleteRow(r); });
  // Add correct entry
  ws.appendRow(['2026-03-25T16:24:25.486Z', 'TRADE', 'snuffleupagus', 'Jonas- trades Chad Patrick to Bill for Luis Garcia Jr.', '']);
  Logger.log('Fixed: deleted ' + unique.length + ' multi-trade log entries, added 1 TRADE entry');
}

// One-time fix: manually add the Jonas/Bill trade to the trades sheet
// Run from Apps Script editor, then delete this function
function fixJonasBillTrade() {
  var ws = getOrCreateTradesSheet();
  var id = Utilities.getUuid();
  var now = '2026-03-25T12:00:00.000Z';
  ws.appendRow([
    id,
    'snuffleupagus',              // proposerTeam (Jonas)
    'billygoats',                  // partnerTeam (Bill)
    '["Chad Patrick"]',            // proposerPlayers (Jonas sends)
    '[]',                          // proposerPicks
    '["Luis Garcia Jr."]',         // partnerPlayers (Bill sends)
    '[]',                          // partnerPicks
    'completed',                   // status
    now,                           // date
    now                            // updatedDate
  ]);
  Logger.log('Trade added: Jonas (Chad Patrick) <-> Bill (Luis Garcia Jr.)');
}

function testPreviewGeneration() {
  var result = handleGenerateMatchupPreview({
    team1: 'Shawn',
    team2: 'David Z.',
    gameNum: '1',
    champions: '{}'
  });
  Logger.log('Success: ' + result.success);
  if (result.error) Logger.log('Error: ' + result.error);
  if (result.preview) Logger.log('Preview: ' + result.preview.substring(0, 500));
}

function handleSeedTransactions(params) {
  if (params.pin !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var entries;
  try { entries = JSON.parse(params.entries || '[]'); } catch(e) { return { success: false, error: 'Invalid JSON' }; }
  if (!entries.length) return { success: false, error: 'No entries' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('log');
  if (!ws) {
    ws = ss.insertSheet('log');
    ws.appendRow(['timestamp', 'type', 'team', 'details', 'period']);
  }

  // Read existing entries to avoid duplicates
  var existing = {};
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][3] || '').trim();
    if (key) existing[key] = true;
  }

  var added = 0;
  entries.forEach(function(e) {
    var desc = (e.desc || '').trim();
    if (!desc || existing[desc]) return;
    var ts = e.date ? e.date + 'T12:00:00.000Z' : nowET_();
    ws.appendRow([ts, 'TRANSACTION', '', desc, '']);
    existing[desc] = true;
    added++;
  });

  return { success: true, added: added, total: entries.length };
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
  var now = nowET_();

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

  // Send email notifications
  try {
    var proposerPlayers = JSON.parse(params.proposerPlayers || '[]');
    var proposerPicks = JSON.parse(params.proposerPicks || '[]');
    var partnerPlayers = JSON.parse(params.partnerPlayers || '[]');
    var partnerPicks = JSON.parse(params.partnerPicks || '[]');
    var proposerName = getOwnerName_(params.proposerTeam);
    var partnerName = getOwnerName_(params.partnerTeam);
    var offering = proposerPlayers.concat(proposerPicks).join(', ') || '(none)';
    var requesting = partnerPlayers.concat(partnerPicks).join(', ') || '(none)';

    var body = 'Hello ' + partnerName + ',\n\n' +
      proposerName + ' has proposed a trade!\n\n' +
      'OFFERING: ' + offering + '\n' +
      'REQUESTING: ' + requesting + '\n\n' +
      'Log in to respond: https://www.cvcfantasybaseball.com\n' +
      'Go to the Trades tab to accept, reject, or counter.\n\n' +
      '— CVC Fantasy Baseball';

    var partnerEmail = getOwnerEmail_(params.partnerTeam);
    if (partnerEmail) {
      MailApp.sendEmail(partnerEmail, 'CVC Fantasy Baseball — New Trade Proposal', body);
    }

    // Confirmation to proposer
    var proposerEmail = getOwnerEmail_(params.proposerTeam);
    if (proposerEmail) {
      var confirmBody = 'Hello ' + proposerName + ',\n\n' +
        'Your trade proposal to ' + partnerName + ' has been submitted.\n\n' +
        'YOU OFFERED: ' + offering + '\n' +
        'YOU REQUESTED: ' + requesting + '\n\n' +
        'You will be notified when they respond.\n' +
        'https://www.cvcfantasybaseball.com\n\n' +
        '— CVC Fantasy Baseball';
      MailApp.sendEmail(proposerEmail, 'CVC Fantasy Baseball — Trade Proposal Sent', confirmBody);
    }
  } catch(emailErr) {
    Logger.log('Trade email error: ' + emailErr.toString());
  }
  // SMS — trade proposed
  try { notifyOwner_(params.partnerTeam, 'optIn_tradeProposed', 'CVC Baseball: ' + getOwnerName_(params.proposerTeam) + ' has proposed a trade. Log in to respond at cvcfantasybaseball.com'); } catch(e) {}

  return { success: true, id: id };
}

// Helper: look up owner email from owners sheet
function getOwnerEmail_(pinKey) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var ws = ss.getSheetByName('owners');
    if (!ws) return null;
    var data = ws.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var teamCol = headers.indexOf('team');
    var emailCol = headers.indexOf('email');
    if (teamCol === -1 || emailCol === -1) return null;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][teamCol]).trim() === pinKey) return String(data[i][emailCol]).trim() || null;
    }
  } catch(e) {}
  return null;
}

// Helper: look up owner display name from owners sheet
function getOwnerName_(pinKey) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var ws = ss.getSheetByName('owners');
    if (!ws) return pinKey;
    var data = ws.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var teamCol = headers.indexOf('team');
    var ownerCol = headers.indexOf('owner');
    if (teamCol === -1 || ownerCol === -1) return pinKey;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][teamCol]).trim() === pinKey) return String(data[i][ownerCol]).trim() || pinKey;
    }
  } catch(e) {}
  return pinKey;
}

// Get count of pending trades for a team
function getPendingTradeCount(params) {
  var team = params.team || '';
  if (!team) return { success: true, count: 0 };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('trades');
  if (!ws) return { success: true, count: 0 };
  var data = ws.getDataRange().getValues();
  var count = 0;
  // trades columns: id, proposerTeam, partnerTeam, ..., status (col 7)
  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][7] || '').trim().toLowerCase();
    var partner = String(data[i][2] || '').trim();
    if (status === 'pending' && partner === team) count++;
  }
  return { success: true, count: count };
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

      var now = nowET_();
      ws.getRange(i + 1, 8).setValue(newStatus);   // status column H
      ws.getRange(i + 1, 10).setValue(now);          // updatedDate column J

      // Log the status change
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var logWs = ss.getSheetByName('log');
      if (logWs) {
        logWs.appendRow([now, 'TRADE_' + newStatus.toUpperCase(), params.team,
          'Trade ' + params.tradeId + ' ' + newStatus, '']);
      }

      // SMS — trade accepted
      if (newStatus === 'accepted') {
        try { notifyOwner_(proposerTeam, 'optIn_tradeAccepted', 'CVC Baseball: Your trade has been accepted. Check cvcfantasybaseball.com for details.'); } catch(e) {}
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
        var now = nowET_();
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
      var now2 = nowET_();
      ws.getRange(i + 1, 8).setValue('completed');
      ws.getRange(i + 1, 10).setValue(now2);

      // Process draft pick overrides
      var proposerPicks = [];
      var partnerPicks = [];
      try { proposerPicks = JSON.parse(data[i][4] || '[]'); } catch(e) {}
      try { partnerPicks = JSON.parse(data[i][6] || '[]'); } catch(e) {}

      proposerPicks.forEach(function(label) { saveDraftPickOverride(label, partnerTeamKey); });
      partnerPicks.forEach(function(label) { saveDraftPickOverride(label, proposerTeamKey); });

      // Swap players on roster sheets — collect player data for deferral check first
      var _propPin = proposerTeamKey; // already pinKey format
      var _partPin = partnerTeamKey;
      var _propPlayerData = []; // players leaving proposer → arriving at partner
      var _partPlayerData = []; // players leaving partner → arriving at proposer
      // Proposer's players move to partner's roster
      proposerPlayers.forEach(function(name) {
        var _pData = findPlayerOnRoster_(_propPin, name);
        _propPlayerData.push({name: name, pos: _pData ? _pData.pos : '', mlbTeam: _pData ? _pData.team : ''});
        removePlayerFromRoster_(_propPin, name);
        addPlayerToRoster_(_partPin, name, _pData ? _pData.pos : '', _pData ? _pData.team : '');
      });
      // Partner's players move to proposer's roster
      partnerPlayers.forEach(function(name) {
        var _pData = findPlayerOnRoster_(_partPin, name);
        _partPlayerData.push({name: name, pos: _pData ? _pData.pos : '', mlbTeam: _pData ? _pData.team : ''});
        removePlayerFromRoster_(_partPin, name);
        addPlayerToRoster_(_propPin, name, _pData ? _pData.pos : '', _pData ? _pData.team : '');
      });

      // Check deferral for both teams — all players involved are checked together
      var _allTradeTeams = _propPlayerData.concat(_partPlayerData).map(function(p){return p.mlbTeam;}).filter(Boolean);
      var _anyPlayed = hasAnyTeamPlayedInPeriod_(_allTradeTeams);
      if (_anyPlayed) {
        var _tradeId = String(data[i][0]);
        // Proposer: incoming = partner's players, outgoing = proposer's players
        checkAndDeferTransaction_(proposerTeamKey, _partPlayerData, _propPlayerData, 'trade', _tradeId);
        // Partner: incoming = proposer's players, outgoing = partner's players
        checkAndDeferTransaction_(partnerTeamKey, _propPlayerData, _partPlayerData, 'trade', _tradeId);
      }

      invalidateRostersCache_();
      SpreadsheetApp.flush();
      return { success: true, pendingDrops: false, deferred: _anyPlayed };
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

  // Deduplication: skip if same add was processed in the last 30 seconds
  if (params.addName) {
    var rmWs = ss.getSheetByName('roster_moves');
    if (rmWs && rmWs.getLastRow() > 1) {
      var lastRows = rmWs.getRange(Math.max(2, rmWs.getLastRow() - 4), 1, Math.min(5, rmWs.getLastRow() - 1), 8).getValues();
      var now = new Date();
      for (var r = lastRows.length - 1; r >= 0; r--) {
        if (String(lastRows[r][1]).trim() === params.team &&
            String(lastRows[r][2]).trim() === params.addName) {
          var ts = new Date(lastRows[r][0]);
          if (!isNaN(ts.getTime()) && (now - ts) < 30000) {
            Logger.log('addRosterMove: duplicate detected for ' + params.addName + ' on ' + params.team + ' — skipping');
            return { success: true, duplicate: true };
          }
        }
      }
    }
  }

  var ws = ss.getSheetByName('roster_moves');
  if (!ws) {
    ws = ss.insertSheet('roster_moves');
    ws.appendRow(['timestamp','team','addName','addPos','addTeam','dropName','dropPos','dropTeam']);
  }
  var now = nowET_();
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

  var _pinKey = pinKeyFromTeamKey_(params.team);

  // Cancel any active waiver claims for this player so they don't re-trigger on expiry
  if (params.addName) {
    cancelActiveClaimsForPlayer_(ss, params.addName);
    removeFromWaiverSheet_(params.addName, params.addTeam || '');
  }

  // Always update the roster sheet immediately — roster/waiver/transactions are instant
  if (params.addName) {
    addPlayerToRoster_(_pinKey, params.addName, params.addPos, params.addTeam);
  }
  if (params.dropName) {
    removePlayerFromRoster_(_pinKey, params.dropName);
    // Add dropped player to waiver wire
    var wpWs = ss.getSheetByName('waiver_players');
    if (wpWs) {
      var dropDate = new Date().toLocaleDateString('en-CA', {timeZone:'America/New_York'});
      var dropDT = nowET_();
      var dropMlbId = lookupMlbIdByName_(ss, params.dropName);
      wpWs.appendRow([params.dropPos || '', params.dropName, params.dropTeam || '', dropDate, dropDT, 'red', dropMlbId]);
      invalidateWaiverPlayersCache_();
    }
  }

  // Check if this transaction should be deferred for lineup/live scoring purposes
  var _rmAdds = params.addName ? [{name: params.addName, pos: params.addPos || '', mlbTeam: params.addTeam || ''}] : [];
  var _rmDrops = params.dropName ? [{name: params.dropName, pos: params.dropPos || '', mlbTeam: params.dropTeam || ''}] : [];
  var _rmDefer = checkAndDeferTransaction_(_pinKey, _rmAdds, _rmDrops, 'freeagent', '');

  // Write transaction log server-side so it's guaranteed even if the frontend call fails
  if (params.addName) {
    var ownerName = getOwnerName_(pinKeyFromTeamKey_(params.team) || params.team);
    var txDesc = ownerName + '- picks up ' + params.addName + '.';
    if (params.dropName) txDesc += ' Cuts ' + params.dropName + '.';
    var logWs = ss.getSheetByName('log');
    if (logWs) {
      logWs.appendRow([nowET_(), 'TRANSACTION', params.team, txDesc, '']);
    }
  }

  invalidateRostersCache_();
  return { success: true, deferred: _rmDefer.deferred, effectiveGame: _rmDefer.effectiveGame || null };
}

// ── Cancel all active waiver claims for a player (e.g. after direct free agent pickup) ──
function cancelActiveClaimsForPlayer_(ss, playerName) {
  var ws = ss.getSheetByName('waiver_claims');
  if (!ws) return;
  var data = ws.getDataRange().getValues();
  var headers = data[0];
  var colMap = {};
  headers.forEach(function(h, i) { colMap[String(h).trim()] = i; });
  var statusCol = colMap['status'];
  var nameCol = colMap['playerName'];
  if (statusCol == null || nameCol == null) return;
  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][statusCol] || '').trim().toLowerCase();
    var name = String(data[i][nameCol] || '').trim();
    if (status === 'active' && name === playerName) {
      ws.getRange(i + 1, statusCol + 1).setValue('cancelled-picked-up');
      Logger.log('Auto-cancelled claim for ' + playerName + ' (row ' + (i+1) + ') — player already picked up');
    }
  }
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

  var newPositions = (params.positions || '').split(',').filter(function(p) { return p; });

  // Check if player already has a row
  var data = ws.getDataRange().getValues();
  var rowIndex = -1;
  var existingPositions = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === params.playerName) {
      rowIndex = i + 1;
      existingPositions = String(data[i][1] || '').split(',').filter(function(p) { return p; });
      break;
    }
  }

  // Merge — additive only, never remove existing positions
  var merged = existingPositions.slice();
  newPositions.forEach(function(p) {
    if (merged.indexOf(p) === -1) merged.push(p);
  });
  var mergedStr = merged.join(',');

  if (rowIndex > 0) {
    ws.getRange(rowIndex, 2).setValue(mergedStr);
    ws.getRange(rowIndex, 3).setValue(params.overrideType || '');
    ws.getRange(rowIndex, 4).setValue(params.overridePos || '');
    ws.getRange(rowIndex, 5).setValue(nowET_());
  } else {
    ws.appendRow([
      params.playerName,
      mergedStr,
      params.overrideType || '',
      params.overridePos || '',
      nowET_()
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
      ws.getRange(i + 1, 3).setValue(nowET_());
      return { success: true };
    }
  }
  ws.appendRow([params.team, params.prefs || '', nowET_()]);
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
      ws.getRange(i + 1, 3).setValue(nowET_());
      return { success: true };
    }
  }
  ws.appendRow([params.team, params.order || '', nowET_()]);
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
//   E=placed_name, F=period, G=status, H=activated_mlb_team

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
    ws.appendRow(['timestamp', 'team', 'activated_name', 'activated_pos', 'activated_mlb', 'placed_name', 'placed_pos', 'placed_mlb', 'period', 'status', 'activated_mlb_team']);
  }

  // Count existing official moves for this team (pending moves don't count toward limit)
  var MAX_TAXI_MOVES = 15;
  var lastRow = ws.getLastRow();
  var lastCol = ws.getLastColumn();
  var officialCount = 0;
  var totalCount = 0;
  if (lastRow > 1) {
    var data = ws.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var teamIdx = headers.indexOf('team');
    var statusIdx = headers.indexOf('status');
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][teamIdx] || '').trim() === team) {
        totalCount++;
        var st = String(data[i][statusIdx] || '').trim().toLowerCase();
        if (st === 'official') officialCount++;
      }
    }
  }

  // Check if team has moves remaining (only official moves count)
  if (officialCount >= MAX_TAXI_MOVES) {
    return { success: false, error: 'Taxi moves exhausted (15/15 used)', movesUsed: officialCount, movesMax: MAX_TAXI_MOVES };
  }

  var moveNum = totalCount + 1;
  var today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  var period = params.period || '';

  ws.appendRow([
    nowET_(),         // timestamp
    team,                              // team
    params.activatedName || '',        // activated_name
    params.activatedPos || '',         // activated_pos
    params.activatedMlbTeam || '',     // activated_mlb
    params.placedName || '',           // placed_name
    params.placedPos || '',            // placed_pos
    params.placedMlbTeam || '',        // placed_mlb
    period,                            // period
    'pending',                         // status
    params.activatedMlbTeam || ''      // activated_mlb_team
  ]);

  // Transaction log is written only when the move becomes official (via processPendingTaxiMoves)

  return { success: true, moveNum: moveNum, movesUsed: officialCount, pendingCount: totalCount - officialCount + 1, movesMax: MAX_TAXI_MOVES };
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
  var statusIdx = colMap['status'] !== undefined ? colMap['status'] : (colMap['processed'] !== undefined ? colMap['processed'] : 6);

  var data = ws.getRange(2, 1, ws.getLastRow() - 1, lastCol).getValues();
  var moves = [];
  var officialCount = 0;
  data.forEach(function(row) {
    if (String(row[teamIdx] || '').trim() === team) {
      var st = String(row[statusIdx] || '').trim().toLowerCase();
      if (st === 'official') officialCount++;
      moves.push({
        moveNum: row[numIdx],
        team: row[teamIdx],
        date: row[dateIdx],
        activatedName: String(row[upIdx] || ''),
        placedName: String(row[downIdx] || ''),
        period: row[perIdx],
        status: String(row[statusIdx] || 'pending').trim().toLowerCase()
      });
    }
  });
  return { success: true, moves: moves, movesUsed: officialCount, pendingCount: moves.length - officialCount, movesMax: 15 };
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
    var statusIdx = headers.indexOf('status');
    if (statusIdx === -1) statusIdx = headers.indexOf('processed');
    if (statusIdx === -1) statusIdx = 9;
    var data = ws.getRange(2, 1, ws.getLastRow() - 1, lastCol).getValues();
    data.forEach(function(row) {
      var t = String(row[teamIdx] || '').trim();
      var st = String(row[statusIdx] || '').trim().toLowerCase();
      // Only count official moves toward the 15-move limit
      if (t && st === 'official') counts[t] = (counts[t] || 0) + 1;
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

  // Read headers to map columns dynamically
  var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var COL = {};
  headers.forEach(function(h, i) { COL[h] = i; });
  var iTeam = COL['team'] !== undefined ? COL['team'] : 1;
  var iUp = COL['activated_name'] !== undefined ? COL['activated_name'] : 2;
  var iDown = COL['placed_name'] !== undefined ? COL['placed_name'] : 5;
  var iPeriod = COL['period'] !== undefined ? COL['period'] : 8;
  var iStatus = COL['status'] !== undefined ? COL['status'] : 9;
  var iTimestamp = COL['timestamp'] !== undefined ? COL['timestamp'] : 0;

  data.forEach(function(row) {
    var team = String(row[iTeam] || '').trim();
    if (!team) return;

    var dateFormatted = '';
    var ts = row[iTimestamp];
    if (ts instanceof Date) {
      dateFormatted = ts.getFullYear() + '-' + String(ts.getMonth()+1).padStart(2,'0') + '-' + String(ts.getDate()).padStart(2,'0');
    } else {
      dateFormatted = String(ts || '').substring(0, 10);
    }

    var activatedName = String(row[iUp] || '');
    var placedName = String(row[iDown] || '');
    var period = row[iPeriod] || '';
    var status = String(row[iStatus] || '').trim().toLowerCase();

    if (!moves[team]) moves[team] = [];
    moves[team].push({
      date: dateFormatted,
      activatedName: activatedName,
      placedName: placedName,
      period: period,
      status: status
    });
  });
  return { success: true, moves: moves };
}

function handleGetPendingTaxiMoves(params) {
  var team = params.team || '';
  if (!team) return { success: true, moves: [] };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws || ws.getLastRow() < 2) return { success: true, moves: [] };

  var lastCol = ws.getLastColumn();
  var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
  // Actual columns: timestamp(0), team(1), activated_name(2), activated_pos(3), activated_mlb(4), placed_name(5), placed_pos(6), placed_mlb(7), period(8), status(9), activated_mlb_team(10)
  var teamIdx = headers.indexOf('team');
  var dateIdx = headers.indexOf('timestamp');
  var upIdx = headers.indexOf('activated_name');
  var downIdx = headers.indexOf('placed_name');
  var statusIdx = headers.indexOf('status');

  if (teamIdx === -1) teamIdx = 1;
  if (dateIdx === -1) dateIdx = 0;
  if (upIdx === -1) upIdx = 2;
  if (downIdx === -1) downIdx = 5;
  if (statusIdx === -1) statusIdx = 9;

  var data = ws.getRange(2, 1, ws.getLastRow() - 1, lastCol).getValues();
  var moves = [];
  data.forEach(function(row, i) {
    var t = String(row[teamIdx] || '').trim();
    if (t !== team) return;
    var st = String(row[statusIdx] || '').trim().toLowerCase();
    if (st === 'official' || st === 'official-down' || st === 'cancelled') return;
    var rawDate = row[dateIdx];
    var dateStr = '';
    if (rawDate instanceof Date) {
      dateStr = rawDate.getFullYear() + '-' + String(rawDate.getMonth()+1).padStart(2,'0') + '-' + String(rawDate.getDate()).padStart(2,'0');
    } else {
      dateStr = String(rawDate || '').substring(0, 10);
    }
    moves.push({
      rowIndex: i + 2,
      activatedName: String(row[upIdx] || ''),
      placedName: String(row[downIdx] || ''),
      date: dateStr,
      status: st
    });
  });
  return { success: true, moves: moves };
}

function handleCancelTaxiMove(params) {
  var team = params.team || '';
  var rowIndex = parseInt(params.rowIndex, 10);
  if (!team || !rowIndex) return { success: false, error: 'team and rowIndex required' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws) return { success: false, error: 'No taxi_moves sheet' };

  var lastCol = ws.getLastColumn();
  var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var teamIdx = headers.indexOf('team'); if (teamIdx === -1) teamIdx = 1;
  var statusIdx = headers.indexOf('status'); if (statusIdx === -1) statusIdx = 9;
  var upIdx = headers.indexOf('activated_name'); if (upIdx === -1) upIdx = 2;
  var downIdx = headers.indexOf('placed_name'); if (downIdx === -1) downIdx = 5;

  var row = ws.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
  var rowTeam = String(row[teamIdx] || '').trim();
  var rowStatus = String(row[statusIdx] || '').trim().toLowerCase();

  if (rowTeam !== team) return { success: false, error: 'This move does not belong to your team' };
  if (rowStatus === 'official') return { success: false, error: 'Cannot cancel an official move' };

  var activatedName = String(row[upIdx] || '').trim();
  var placedName = String(row[downIdx] || '').trim();
  var dateIdx = headers.indexOf('date');
  var moveDate = dateIdx !== -1 ? String(row[dateIdx] || '') : '';

  // Delete the row from taxi_moves entirely
  ws.deleteRow(rowIndex);

  // Delete matching transaction log entry if one exists
  var logWs = ss.getSheetByName('log');
  if (logWs && activatedName) {
    var logData = logWs.getDataRange().getValues();
    for (var li = logData.length - 1; li >= 1; li--) {
      var logDetails = String(logData[li][3] || '');
      var logTeam = String(logData[li][2] || '').trim();
      if (logTeam === team && logDetails.indexOf(activatedName) !== -1 && logDetails.indexOf('moves') !== -1 && logDetails.indexOf('up') !== -1) {
        logWs.deleteRow(li + 1);
        break;
      }
    }
  }

  invalidateRostersCache_();
  return { success: true, cancelled: activatedName, placed: placedName };
}

function handleUpdateTaxiMovePlaced(params) {
  var team = params.team || '';
  var rowIndex = parseInt(params.rowIndex, 10);
  if (!team || !rowIndex) return { success: false, error: 'team and rowIndex required' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws) return { success: false, error: 'No taxi_moves sheet' };
  var lastCol = ws.getLastColumn();
  var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var teamIdx = headers.indexOf('team'); if (teamIdx === -1) teamIdx = 1;
  var downIdx = headers.indexOf('placed_name'); if (downIdx === -1) downIdx = 5;
  var downPosIdx = headers.indexOf('placed_pos'); if (downPosIdx === -1) downPosIdx = 6;
  var downMlbIdx = headers.indexOf('placed_mlb'); if (downMlbIdx === -1) downMlbIdx = 7;
  var row = ws.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
  if (String(row[teamIdx] || '').trim() !== team) return { success: false, error: 'Row does not belong to this team' };
  ws.getRange(rowIndex, downIdx + 1).setValue(params.placedName || '');
  ws.getRange(rowIndex, downPosIdx + 1).setValue(params.placedPos || '');
  ws.getRange(rowIndex, downMlbIdx + 1).setValue(params.placedMlbTeam || '');
  return { success: true };
}

// Sync pending taxi moves to match the net diff between original and current taxi state.
// Called on each lineup save — replaces incremental logging with a full reconciliation.
function handleSyncPendingTaxiMoves(params) {
  var team = params.team || '';
  if (!team) return { success: false, error: 'team required' };

  var seasonStart = new Date('2026-03-25T00:00:00');
  if (new Date() < seasonStart) return { success: true, skipped: true, reason: 'preseason' };

  var netUp;
  var netDown;
  try { netUp = JSON.parse(params.netUp || '[]'); } catch(e) { netUp = []; }
  try { netDown = JSON.parse(params.netDown || '[]'); } catch(e) { netDown = []; }
  var period = params.period || '';

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws) {
    ws = ss.insertSheet('taxi_moves');
    ws.appendRow(['timestamp', 'team', 'activated_name', 'activated_pos', 'activated_mlb', 'placed_name', 'placed_pos', 'placed_mlb', 'period', 'status', 'activated_mlb_team']);
  }

  var lastCol = ws.getLastColumn();
  var headers = ws.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var COL_TEAM = headers.indexOf('team'); if (COL_TEAM === -1) COL_TEAM = 1;
  var COL_ACTIVATED = headers.indexOf('activated_name'); if (COL_ACTIVATED === -1) COL_ACTIVATED = 2;
  var COL_ACTIVATED_POS = headers.indexOf('activated_pos'); if (COL_ACTIVATED_POS === -1) COL_ACTIVATED_POS = 3;
  var COL_ACTIVATED_MLB = headers.indexOf('activated_mlb'); if (COL_ACTIVATED_MLB === -1) COL_ACTIVATED_MLB = 4;
  var COL_PLACED = headers.indexOf('placed_name'); if (COL_PLACED === -1) COL_PLACED = 5;
  var COL_PLACED_POS = headers.indexOf('placed_pos'); if (COL_PLACED_POS === -1) COL_PLACED_POS = 6;
  var COL_PLACED_MLB = headers.indexOf('placed_mlb'); if (COL_PLACED_MLB === -1) COL_PLACED_MLB = 7;
  var COL_STATUS = headers.indexOf('status'); if (COL_STATUS === -1) COL_STATUS = 9;
  var COL_MLB_TEAM = headers.indexOf('activated_mlb_team'); if (COL_MLB_TEAM === -1) COL_MLB_TEAM = 10;

  // Read all rows and identify this team's pending moves
  var data = ws.getDataRange().getValues();
  var pendingRows = []; // {rowIndex (1-based), activatedName, placedName}
  var officialCount = 0;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COL_TEAM] || '').trim() !== team) continue;
    var st = String(data[i][COL_STATUS] || '').trim().toLowerCase();
    if (st === 'official') { officialCount++; continue; }
    if (st === 'cancelled') continue;
    pendingRows.push({ rowIndex: i + 1, activatedName: String(data[i][COL_ACTIVATED] || '').trim(), placedName: String(data[i][COL_PLACED] || '').trim() });
  }

  // Build sets of desired UP and DOWN names
  var desiredUp = {};
  netUp.forEach(function(p) { desiredUp[p.name] = p; });
  var desiredDown = {};
  netDown.forEach(function(p) { desiredDown[p.name] = p; });

  // Determine which pending rows to keep and which to delete
  var rowsToDelete = [];
  var alreadyPending = {};
  pendingRows.forEach(function(pr) {
    if (pr.activatedName && desiredUp[pr.activatedName]) {
      alreadyPending[pr.activatedName] = pr;
    } else if (!pr.activatedName && pr.placedName && desiredDown[pr.placedName]) {
      // Standalone down move — keep it
      alreadyPending['_down_' + pr.placedName] = pr;
    } else {
      rowsToDelete.push(pr.rowIndex);
    }
  });

  // Delete stale pending rows (reverse order to preserve indices)
  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var d = 0; d < rowsToDelete.length; d++) {
    ws.deleteRow(rowsToDelete[d]);
  }

  // Check move limit before creating new moves
  var MAX_TAXI_MOVES = 15;
  if (officialCount >= MAX_TAXI_MOVES) {
    return { success: false, error: 'Taxi moves exhausted (' + officialCount + '/' + MAX_TAXI_MOVES + ')' };
  }

  // Create new pending rows for UP moves not already pending
  var now = nowET_();
  var newMoves = [];
  netUp.forEach(function(p) {
    if (alreadyPending[p.name]) return; // already exists
    newMoves.push(p.name);
    ws.appendRow([
      now, team,
      p.name, p.pos || '', p.mlbTeam || '',
      '', '', '',
      period, 'pending', p.mlbTeam || ''
    ]);
  });

  // Now pair DOWN moves with pending UP moves
  // Re-read the sheet since rows may have been added/deleted
  var freshData = ws.getDataRange().getValues();
  var downQueue = netDown.slice(); // copy
  for (var j = 1; j < freshData.length; j++) {
    if (String(freshData[j][COL_TEAM] || '').trim() !== team) continue;
    var s = String(freshData[j][COL_STATUS] || '').trim().toLowerCase();
    if (s !== 'pending' && s !== '') continue;
    var upName = String(freshData[j][COL_ACTIVATED] || '').trim();
    if (!desiredUp[upName]) continue;
    // Clear any old placed data first, then assign from queue
    if (downQueue.length > 0) {
      var dp = downQueue.shift();
      ws.getRange(j + 1, COL_PLACED + 1).setValue(dp.name);
      ws.getRange(j + 1, COL_PLACED_POS + 1).setValue(dp.pos || '');
      ws.getRange(j + 1, COL_PLACED_MLB + 1).setValue(dp.mlbTeam || '');
    } else {
      ws.getRange(j + 1, COL_PLACED + 1).setValue('');
      ws.getRange(j + 1, COL_PLACED_POS + 1).setValue('');
      ws.getRange(j + 1, COL_PLACED_MLB + 1).setValue('');
    }
  }

  // Create standalone pending rows for DOWN moves not paired with any UP move
  if (downQueue.length > 0) {
    downQueue.forEach(function(dp) {
      if (alreadyPending['_down_' + dp.name]) return; // already exists
      ws.appendRow([
        now, team,
        '', '', '',
        dp.name, dp.pos || '', dp.mlbTeam || '',
        period, 'pending-down', dp.mlbTeam || ''
      ]);
    });
  }

  return { success: true, created: newMoves.length, deleted: rowsToDelete.length, officialCount: officialCount };
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
      ws.appendRow([a, team, today, '(Commissioner adjustment)', '', '', 'official', '']);
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
// PROCESS PENDING TAXI MOVES — scheduled function
// Checks if activated player's MLB team has played in the next CVC period.
// If yes → move becomes "official" and counts toward the 15-move limit.
// Run on a daily trigger: setupTaxiMoveTrigger()
// ═══════════════════════════════════════════════════════════════════════════

// MLB team abbreviation → statsapi team ID
var MLB_TEAM_IDS = {
  'MIA':146,'NYY':147,'CLE':114,'TAM':139,'BOS':111,'PIT':134,'NYM':121,
  'SDO':135,'KAN':118,'ATL':144,'HOU':117,'CHA':145,'CHN':112,'LAA':108,
  'LAD':119,'ARZ':109,'SFO':137,'COL':115,'STL':138,'SEA':136,'DET':116,
  'TOR':141,'MIN':142,'PHI':143,'WSH':120,'BAL':110,'MIL':158,'CIN':113,
  'TEX':140,'ATH':133,'OAK':133,'CHA':145
};

function getMlbTeamId(abbr) {
  return MLB_TEAM_IDS[String(abbr).toUpperCase().trim()] || null;
}

// Get start date for a CVC period from the schedule sheet
function getCvcPeriodStartDate(ss, period) {
  var schedSheet = ss.getSheetByName('schedule');
  if (!schedSheet) return null;
  var data = schedSheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var periodCol = headers.indexOf('period');
  var startCol = headers.indexOf('start_date');
  if (periodCol === -1 || startCol === -1) return null;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][periodCol]) === String(period)) {
      return new Date(data[i][startCol]);
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFERRED EFFECTIVE GAME LOGIC
// When a transaction is processed mid-period and any involved MLB team has
// already played, the display is frozen until the next CVC game period.
// Roster data changes immediately; a deferred_transactions overlay tells the
// frontend which players to hide (deferred-add) or keep showing (deferred-drop).
// ═══════════════════════════════════════════════════════════════════════════

// 2026 CVC schedule: game number → period start date (YYYY-MM-DD)
var CVC_SCHEDULE_2026 = {
  1:'2026-03-25', 2:'2026-03-30', 3:'2026-04-03', 4:'2026-04-06',
  5:'2026-04-10', 6:'2026-04-13', 7:'2026-04-17', 8:'2026-04-20',
  9:'2026-04-24',10:'2026-04-27',11:'2026-05-01',12:'2026-05-04',
 13:'2026-05-08',14:'2026-05-11',15:'2026-05-15',16:'2026-05-18',
 17:'2026-05-22',18:'2026-05-25',19:'2026-05-29',20:'2026-06-01',
 21:'2026-06-05',22:'2026-06-08',23:'2026-06-12',24:'2026-06-15',
 25:'2026-06-19',26:'2026-06-22',27:'2026-06-26',28:'2026-06-29',
 29:'2026-07-03',30:'2026-07-06',31:'2026-07-10',32:'2026-07-16',
 33:'2026-07-20',34:'2026-07-24',35:'2026-07-27',36:'2026-07-31'
};

// Return the current CVC game period number based on today's date (ET)
function getCurrentCvcPeriod_() {
  var now = new Date();
  var todayStr = Utilities.formatDate(now, 'America/New_York', 'yyyy-MM-dd');
  var periods = Object.keys(CVC_SCHEDULE_2026).map(Number).sort(function(a,b){return a-b;});
  var current = 1;
  for (var i = 0; i < periods.length; i++) {
    if (todayStr >= CVC_SCHEDULE_2026[periods[i]]) {
      current = periods[i];
    } else {
      break;
    }
  }
  return current;
}

// Return the next CVC game period number (current + 1), or null if at last period
function getNextCvcPeriod_() {
  var current = getCurrentCvcPeriod_();
  var periods = Object.keys(CVC_SCHEDULE_2026).map(Number).sort(function(a,b){return a-b;});
  var idx = periods.indexOf(current);
  return (idx >= 0 && idx < periods.length - 1) ? periods[idx + 1] : null;
}

// Check if ANY of the given MLB teams has played at least one Live or Final
// game since the current CVC period start date.
function hasAnyTeamPlayedInPeriod_(mlbTeams) {
  if (!mlbTeams || mlbTeams.length === 0) return false;
  var currentPeriod = getCurrentCvcPeriod_();
  var startDate = CVC_SCHEDULE_2026[currentPeriod];
  if (!startDate) return false;
  var now = new Date();
  var endDate = Utilities.formatDate(now, 'America/New_York', 'yyyy-MM-dd');
  if (endDate < startDate) return false;

  // Deduplicate teams
  var seen = {};
  var unique = [];
  mlbTeams.forEach(function(t) {
    var u = String(t).toUpperCase().trim();
    if (u && !seen[u]) { seen[u] = true; unique.push(u); }
  });

  for (var i = 0; i < unique.length; i++) {
    var teamId = getMlbTeamId(unique[i]);
    if (!teamId) continue;
    var url = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=' + startDate +
              '&endDate=' + endDate + '&teamId=' + teamId;
    try {
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      var json = JSON.parse(resp.getContentText());
      if (json.dates) {
        for (var d = 0; d < json.dates.length; d++) {
          var games = json.dates[d].games;
          for (var g = 0; g < games.length; g++) {
            var state = games[g].status.abstractGameState;
            if (state === 'Live' || state === 'Final') return true;
          }
        }
      }
    } catch(e) { Logger.log('hasAnyTeamPlayedInPeriod_ error for ' + unique[i] + ': ' + e); }
  }
  return false;
}

// Write a single deferred transaction entry to the deferred_transactions sheet
function writeDeferredEntry_(teamKey, type, playerName, playerPos, playerTeam, effectiveGame, source, sourceId) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('deferred_transactions');
  if (!ws) {
    ws = ss.insertSheet('deferred_transactions');
    ws.appendRow(['id','timestamp','teamKey','type','playerName','playerPos',
                   'playerTeam','effectiveGame','resolvedAt','source','sourceId']);
  }
  var id = 'def_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
  ws.appendRow([id, nowET_(), teamKey, type, playerName, playerPos || '',
                playerTeam || '', effectiveGame, '', source || '', sourceId || '']);
  return id;
}

// Central orchestrator: check if a transaction should be deferred, and if so,
// write deferred entries for all adds and drops.
// adds/drops: [{name, pos, mlbTeam}]
// Returns { deferred: true/false, effectiveGame: N }
function checkAndDeferTransaction_(teamKey, adds, drops, source, sourceId) {
  var allMlbTeams = [];
  (adds || []).concat(drops || []).forEach(function(p) {
    if (p.mlbTeam) allMlbTeams.push(p.mlbTeam);
  });

  if (!hasAnyTeamPlayedInPeriod_(allMlbTeams)) {
    return { deferred: false };
  }

  var nextPeriod = getNextCvcPeriod_();
  // If we're at the last period, use current + 1 as fallback
  var effectiveGame = nextPeriod || (getCurrentCvcPeriod_() + 1);

  (adds || []).forEach(function(p) {
    writeDeferredEntry_(teamKey, 'add', p.name, p.pos, p.mlbTeam, effectiveGame, source, sourceId);
  });
  (drops || []).forEach(function(p) {
    writeDeferredEntry_(teamKey, 'drop', p.name, p.pos, p.mlbTeam, effectiveGame, source, sourceId);
  });

  Logger.log('DEFERRED: ' + source + ' for ' + teamKey + ' → effective Game ' + effectiveGame +
             ' (adds: ' + (adds||[]).map(function(p){return p.name;}).join(',') +
             ', drops: ' + (drops||[]).map(function(p){return p.name;}).join(',') + ')');

  return { deferred: true, effectiveGame: effectiveGame };
}

// Return all unresolved deferred entries grouped by teamKey
function handleGetDeferred() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('deferred_transactions');
  if (!ws || ws.getLastRow() <= 1) return { success: true, deferred: {} };

  var data = ws.getDataRange().getValues();
  var result = {};
  // Columns: 0=id, 1=timestamp, 2=teamKey, 3=type, 4=playerName, 5=playerPos,
  //          6=playerTeam, 7=effectiveGame, 8=resolvedAt, 9=source, 10=sourceId
  for (var i = 1; i < data.length; i++) {
    // Include all entries (even resolved) so client can filter by period for historical views
    var teamKey = String(data[i][2]);
    if (!result[teamKey]) result[teamKey] = [];
    result[teamKey].push({
      id: String(data[i][0]),
      type: String(data[i][3]),
      playerName: String(data[i][4]),
      playerPos: String(data[i][5]),
      playerTeam: String(data[i][6]),
      effectiveGame: Number(data[i][7]),
      resolvedAt: String(data[i][8] || ''),
      source: String(data[i][9])
    });
  }
  return { success: true, deferred: result };
}

// Resolve deferred entries whose effectiveGame has been reached.
// Call from a daily trigger or piggyback on the waiver resolution trigger.
function resolveDeferredEntries() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('deferred_transactions');
  if (!ws || ws.getLastRow() <= 1) return;

  var currentPeriod = getCurrentCvcPeriod_();
  var data = ws.getDataRange().getValues();
  var resolved = 0;

  for (var i = 1; i < data.length; i++) {
    if (data[i][8]) continue; // already resolved (resolvedAt not empty)
    var effectiveGame = Number(data[i][7]);
    if (currentPeriod >= effectiveGame) {
      // Roster changes already happened at transaction time — just mark resolved
      // so lineup/live scoring pages stop filtering this player
      ws.getRange(i + 1, 9).setValue(nowET_()); // resolvedAt column
      resolved++;
    }
  }
  if (resolved > 0) {
    Logger.log('resolveDeferredEntries: resolved ' + resolved + ' entries (currentPeriod=' + currentPeriod + ')');
  }
}

function processPendingTaxiMoves() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('taxi_moves');
  if (!ws || ws.getLastRow() < 2) {
    Logger.log('processPendingTaxiMoves: no taxi_moves data');
    return;
  }

  var data = ws.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });

  var COL_TEAM = headers.indexOf('team');
  var COL_ACTIVATED = headers.indexOf('activated_name');
  var COL_PERIOD = headers.indexOf('period');
  var COL_STATUS = headers.indexOf('status');
  var COL_MLB = headers.indexOf('activated_mlb_team');
  var COL_DATE = headers.indexOf('date');

  // If status column doesn't exist, add it
  if (COL_STATUS === -1) {
    ws.getRange(1, headers.length + 1).setValue('status');
    COL_STATUS = headers.length;
    Logger.log('Added status column');
  }
  // If mlb team column doesn't exist, add it
  if (COL_MLB === -1) {
    var mlbCol = Math.max(headers.length, COL_STATUS + 1) + 1;
    ws.getRange(1, mlbCol).setValue('activated_mlb_team');
    COL_MLB = mlbCol - 1;
    Logger.log('Added activated_mlb_team column');
  }

  var today = new Date();
  var officialCount = 0;

  var COL_PLACED = headers.indexOf('placed_name'); if (COL_PLACED === -1) COL_PLACED = 5;
  var COL_PLACED_MLB = headers.indexOf('placed_mlb'); if (COL_PLACED_MLB === -1) COL_PLACED_MLB = 7;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var currentStatus = String(row[COL_STATUS] || '').trim().toLowerCase();
    if (currentStatus === 'official' || currentStatus === 'official-down') continue;

    var isDownOnly = currentStatus === 'pending-down';
    // Skip rows with no activated_name unless they're standalone down moves
    if (!row[COL_ACTIVATED] && !isDownOnly) continue;

    // For down-only moves, use the placed player's MLB team
    var mlbTeam = isDownOnly ? String(row[COL_PLACED_MLB] || row[COL_MLB] || '').trim() : String(row[COL_MLB] || '').trim();
    var period = row[COL_PERIOD];
    var team = String(row[COL_TEAM] || '').trim();

    if (!mlbTeam || !period) {
      Logger.log('Row ' + (i + 1) + ' missing mlbTeam or period — skipping');
      continue;
    }

    // The move becomes official when the player's MLB team plays in the
    // NEXT CVC period after the one the move was made for
    var nextPeriod = parseInt(period, 10);
    var periodStart = getCvcPeriodStartDate(ss, nextPeriod);

    // Fallback: use the move date if no schedule found
    if (!periodStart) {
      periodStart = new Date(row[COL_DATE]);
      Logger.log('Row ' + (i + 1) + ' — no period start found, using move date');
    }

    // Period hasn't started yet — stay pending
    if (today < periodStart) {
      Logger.log('Row ' + (i + 1) + ' — period ' + nextPeriod + ' not started, staying pending');
      continue;
    }

    // Check if the MLB team has played since the period start
    var mlbTeamId = getMlbTeamId(mlbTeam);
    if (!mlbTeamId) {
      Logger.log('Row ' + (i + 1) + ' — unknown MLB team: ' + mlbTeam);
      continue;
    }

    var startDate = Utilities.formatDate(periodStart, 'America/New_York', 'yyyy-MM-dd');
    var endDate = Utilities.formatDate(today, 'America/New_York', 'yyyy-MM-dd');
    var url = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=' + startDate + '&endDate=' + endDate + '&teamId=' + mlbTeamId;

    try {
      var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      var json = JSON.parse(response.getContentText());

      var teamHasPlayed = false;
      if (json.dates && json.dates.length > 0) {
        for (var d = 0; d < json.dates.length; d++) {
          var games = json.dates[d].games;
          for (var g = 0; g < games.length; g++) {
            var state = games[g].status.abstractGameState;
            if (state === 'Live' || state === 'Final') {
              teamHasPlayed = true;
              break;
            }
          }
          if (teamHasPlayed) break;
        }
      }

      if (teamHasPlayed) {
        var ownerName = getOwnerName_(team);
        var logWs = ss.getSheetByName('log');
        if (isDownOnly) {
          ws.getRange(i + 1, COL_STATUS + 1).setValue('official-down');
          var _downName = String(row[COL_PLACED] || '').trim();
          var txDesc = ownerName + '- puts ' + _downName + ' down.';
          if (logWs) logWs.appendRow([nowET_(), 'TRANSACTION', team, txDesc, String(row[COL_PERIOD] || '')]);
          Logger.log('OFFICIAL-DOWN — Row ' + (i + 1) + ' — ' + _downName + ' (' + team + ')');
        } else {
          ws.getRange(i + 1, COL_STATUS + 1).setValue('official');
          officialCount++;
          var _placedName = String(row[COL_PLACED] || '').trim();
          var txDesc = ownerName + '- moves ' + row[COL_ACTIVATED] + ' up.';
          if (_placedName) txDesc += ' Puts ' + _placedName + ' down.';
          if (logWs) logWs.appendRow([nowET_(), 'TRANSACTION', team, txDesc, String(row[COL_PERIOD] || '')]);
          Logger.log('OFFICIAL — Row ' + (i + 1) + ' — ' + row[COL_ACTIVATED] + ' (' + team + ')');
        }
      } else {
        Logger.log('PENDING — Row ' + (i + 1) + ' — ' + (isDownOnly ? row[COL_PLACED] : row[COL_ACTIVATED]) + ' team has not played yet');
      }
    } catch (e) {
      Logger.log('ERROR — Row ' + (i + 1) + ' — ' + e.toString());
    }
  }

  Logger.log('processPendingTaxiMoves complete: ' + officialCount + ' moves made official');
}

// Set up a daily trigger to process pending taxi moves
// Run once from the Apps Script editor: setupTaxiMoveTrigger()
function setupTaxiMoveTrigger() {
  // Remove existing triggers for this function
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processPendingTaxiMoves') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  // Create trigger every 1 hour
  ScriptApp.newTrigger('processPendingTaxiMoves')
    .timeBased()
    .everyHours(1)
    .inTimezone('America/New_York')
    .create();
  Logger.log('Taxi move trigger created — runs every 1 hour');
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
  var ts = nowET_().slice(0, 10);
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
      sheet.appendRow(['period','start_date','end_date','team1','team2','team1_CW','team1_CL','team1_CT','team2_CW','team2_CL',
  'team2_CT','winner','team1_stats','team2_stats','team1_players','team2_players','finalized_date']);
    }
    var period = Number(params.period) || 0;
    var resultsJson = params.results || '[]';
    var results;
    try { results = JSON.parse(resultsJson); } catch(err) { return { success: false, error: 'Invalid JSON' }; }
    var overwrite = (params.overwrite === 'true' || params.overwrite === '1');
    var existing = sheet.getDataRange().getValues();
    for (var i = existing.length - 1; i >= 1; i--) {
      if (Number(existing[i][0]) === period) {
        if (!overwrite) return { success: true, message: 'Already finalized' };
        sheet.deleteRow(i + 1);
      }
    }
    results.forEach(function(r) {
      sheet.appendRow([r.period,r.start_date,r.end_date,r.team1,r.team2,r.team1_CW,r.team1_CL,r.team1_CT,r.team2_CW,r.team2_CL,
  r.team2_CT,r.winner,r.team1_stats,r.team2_stats,r.team1_players||'',r.team2_players||'',r.finalized_date]);
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
// EMERGENCY REPLACEMENT SWAPS
// ═══════════════════════════════════════════════════════════════════════════

function handleSaveErSwap(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('er_swaps');
  if (!ws) {
    ws = ss.insertSheet('er_swaps');
    ws.appendRow(['period', 'teamKey', 'injuredPlayer', 'replacementPlayer', 'slot', 'timestamp', 'swapDate']);
    ws.setFrozenRows(1);
  }
  ws.appendRow([
    params.period || '',
    params.teamKey || '',
    params.injuredPlayer || '',
    params.replacementPlayer || '',
    params.slot || '',
    params.timestamp || nowET_(),
    params.swapDate || ''
  ]);
  return { success: true };
}

function handleGetErSwaps(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('er_swaps');
  if (!ws || ws.getLastRow() < 2) return { success: true, swaps: [] };
  var data = ws.getDataRange().getValues();
  var period = String(params.period || '');
  var swaps = [];
  for (var i = 1; i < data.length; i++) {
    if (period && String(data[i][0]) !== period) continue;
    var rawDate = data[i][6];
    var swapDateStr = '';
    if (rawDate instanceof Date) {
      swapDateStr = Utilities.formatDate(rawDate, 'America/New_York', 'yyyy-MM-dd');
    } else {
      swapDateStr = String(rawDate || '').trim().slice(0, 10);
    }
    swaps.push({
      period: String(data[i][0]),
      teamKey: String(data[i][1]),
      injuredPlayer: String(data[i][2]),
      replacementPlayer: String(data[i][3]),
      slot: String(data[i][4]),
      timestamp: String(data[i][5]),
      swapDate: swapDateStr
    });
  }
  return { success: true, swaps: swaps };
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
      sheet.getRange(i + 1, 5).setValue(nowET_());
      return { success: true, updated: true };
    }
  }
  sheet.appendRow([period, team1, team2, recap, nowET_()]);
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
  var now = nowET_();
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
  var now = nowET_();
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
  var dateAdded = nowET_();
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
  var lastUpdated = nowET_();
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

  // IL Placement notifications
  try {
    var alertSheet = ss.getSheetByName('injury_alerts_sent');
    if (!alertSheet) {
      alertSheet = ss.insertSheet('injury_alerts_sent');
      alertSheet.appendRow(['playerName','team','alertSentAt']);
      alertSheet.setFrozenRows(1);
    }
    var rostersData = handleGetRosters();
    if (rostersData.success && rostersData.rosters) {
      var sentAlerts = alertSheet.getDataRange().getValues();
      var sentSet = {};
      for (var sa = 1; sa < sentAlerts.length; sa++) {
        sentSet[String(sentAlerts[sa][0]).trim() + '|' + String(sentAlerts[sa][1]).trim()] = true;
      }
      function classifyUnavail_(status, type) {
        var s = (status + ' ' + type).toLowerCase();
        if (/bereavement/i.test(s)) return 'bereavement';
        if (/paternity/i.test(s)) return 'paternity';
        if (/suspend/i.test(s)) return 'suspension';
        if (/injured list|^il|10-day|15-day|60-day|\bil10\b|\bil60\b/i.test(s)) return 'il';
        return null;
      }
      function buildUnavailMsg_(pName, cls, detail) {
        if (cls === 'bereavement') return 'CVC Baseball: ' + pName + ' has been placed on the Bereavement List. Check your lineup at cvcfantasybaseball.com';
        if (cls === 'paternity') return 'CVC Baseball: ' + pName + ' has been placed on the Paternity List. Check your lineup at cvcfantasybaseball.com';
        if (cls === 'suspension') return 'CVC Baseball: ' + pName + ' has been suspended' + (detail ? ' (' + detail + ')' : '') + '. Check your lineup at cvcfantasybaseball.com';
        return 'CVC Baseball: ' + pName + ' has been placed on the IL' + (detail ? ' (' + detail + ')' : '') + '. Check your lineup at cvcfantasybaseball.com';
      }
      Object.keys(rostersData.rosters).forEach(function(teamKey) {
        rostersData.rosters[teamKey].forEach(function(p) {
          var pName = String(p.name || '').trim();
          if (!pName) return;
          for (var ri = 0; ri < rows.length; ri++) {
            if (String(rows[ri][0]).trim() !== pName) continue;
            var injStatus = String(rows[ri][4]).trim();
            var injType = String(rows[ri][3]).trim();
            var cls = classifyUnavail_(injStatus, injType);
            if (!cls) continue;
            var alertKey = pName + '|' + teamKey;
            if (!sentSet[alertKey]) {
              notifyOwner_(teamKey, 'optIn_il', buildUnavailMsg_(pName, cls, injType || injStatus));
              alertSheet.appendRow([pName, teamKey, nowET_()]);
              sentSet[alertKey] = true;
            }
          }
        });
      });
      // Prune alerts older than 30 days
      var cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      var alertData = alertSheet.getDataRange().getValues();
      for (var ad = alertData.length - 1; ad >= 1; ad--) {
        var alertDate = new Date(alertData[ad][2]);
        if (alertDate < cutoff) alertSheet.deleteRow(ad + 1);
      }
    }
  } catch(e) { Logger.log('IL notification error: ' + e.toString()); }

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
        var dateAdded = nowET_();
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
  var players = [];
  var seen = {};

  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var name = String(data[i][0] || '').trim();
      if (name) seen[name.toLowerCase()] = true;
      players.push({
        playerName: name,
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
  }

  // Scan rotowire_news for paternity/bereavement entries not already in injuries
  // Use the MOST RECENT entry per player to avoid stale "goes on" overriding newer "returns from"
  var newsSheet = ss.getSheetByName('rotowire_news');
  if (newsSheet && newsSheet.getLastRow() > 1) {
    var newsData = newsSheet.getDataRange().getValues();
    var cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // last 14 days

    // Collect most recent PL/BV news entry per player
    var plBvCandidates = {}; // playerName -> {row index, lastUpdated}
    for (var j = 1; j < newsData.length; j++) {
      var pName = String(newsData[j][0] || '').trim();
      if (!pName || seen[pName.toLowerCase()]) continue;
      var tag = String(newsData[j][6] || '').toLowerCase();
      var headline = String(newsData[j][3] || '').toLowerCase();
      var update = String(newsData[j][4] || '').toLowerCase();
      var combined = tag + ' ' + headline + ' ' + update;
      if (combined.indexOf('paternity') === -1 && combined.indexOf('bereavement') === -1) continue;
      var lastUpdated = newsData[j][7];
      if (lastUpdated instanceof Date && lastUpdated < cutoff) continue;
      var ts = lastUpdated instanceof Date ? lastUpdated.getTime() : new Date(lastUpdated || 0).getTime();
      var key = pName.toLowerCase();
      if (!plBvCandidates[key] || ts > plBvCandidates[key].ts) {
        plBvCandidates[key] = { row: j, ts: ts };
      }
    }

    // Process only the most recent entry per player
    var candKeys = Object.keys(plBvCandidates);
    for (var ck = 0; ck < candKeys.length; ck++) {
      var cand = plBvCandidates[candKeys[ck]];
      var row = newsData[cand.row];
      var cName = String(row[0] || '').trim();
      var cTag = String(row[6] || '').toLowerCase();
      var cHeadline = String(row[3] || '').toLowerCase();
      var cUpdate = String(row[4] || '').toLowerCase();
      var cCombined = cTag + ' ' + cHeadline + ' ' + cUpdate;
      var cStatus = '';
      if (cCombined.indexOf('paternity') !== -1) cStatus = 'PATERNITY';
      else if (cCombined.indexOf('bereavement') !== -1) cStatus = 'BEREAVEMENT';
      if (!cStatus) continue;
      // Skip if the most recent news is about RETURNING
      if (cCombined.indexOf('return') !== -1 || cCombined.indexOf('reinstate') !== -1 || cCombined.indexOf('activated') !== -1) continue;
      // Verify player is actually still on the list via MLB API roster status
      var plMlbId = String(row[9] || '').trim();
      if (plMlbId) {
        try {
          var plResp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/people/' + plMlbId + '?hydrate=rosterEntries', { muteHttpExceptions: true });
          var plData = JSON.parse(plResp.getContentText());
          if (plData.people && plData.people[0] && plData.people[0].rosterEntries) {
            var entries = plData.people[0].rosterEntries;
            var latest = entries[entries.length - 1];
            if (latest && latest.statusCode === 'A') continue; // back on active roster, skip
          }
        } catch(e) { /* if API fails, include the player to be safe */ }
      }
      seen[cName.toLowerCase()] = true;
      players.push({
        playerName: cName,
        team: String(row[1] || ''),
        position: String(row[2] || ''),
        injuryType: 'Personal',
        injuryStatus: cStatus,
        returnDate: '',
        injuryNotes: String(row[3] || ''),
        rotowireId: String(row[8] || ''),
        mlbId: plMlbId
      });
    }
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
  var now = nowET_();

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

  // Remove player from the actual roster sheet
  var _dropPinKey = pinKeyFromTeamKey_(team);
  removePlayerFromRoster_(_dropPinKey, playerName);

  // Add dropped player to waiver wire
  var wpWs = ss.getSheetByName('waiver_players');
  if (wpWs) {
    var dropDate = new Date().toLocaleDateString('en-CA', {timeZone:'America/New_York'});
    var dropDT = nowET_();
    var dropMlbId = lookupMlbIdByName_(ss, playerName);
    wpWs.appendRow([position || '', playerName, playerTeam || '', dropDate, dropDT, 'red', dropMlbId]);
    invalidateWaiverPlayersCache_();
  }

  invalidateRostersCache_();

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
  var now = nowET_();

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
      logWs.appendRow([nowET_(), 'DROP', team, ownerName + '- drops ' + playerName + '.', '']);
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
    var now = nowET_();
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

      // Swap players on roster sheets — collect data for deferral check
      var proposerPlayers = [];
      var partnerPlayers = [];
      try { proposerPlayers = JSON.parse(data[i][3] || '[]'); } catch(e2) {}
      try { partnerPlayers = JSON.parse(data[i][5] || '[]'); } catch(e2) {}
      var _ctPropData = [];
      var _ctPartData = [];
      proposerPlayers.forEach(function(name) {
        var pd = findPlayerOnRoster_(proposerTeamKey, name);
        _ctPropData.push({name: name, pos: pd ? pd.pos : '', mlbTeam: pd ? pd.team : ''});
        removePlayerFromRoster_(proposerTeamKey, name);
        addPlayerToRoster_(partnerTeamKey, name, pd ? pd.pos : '', pd ? pd.team : '');
      });
      partnerPlayers.forEach(function(name) {
        var pd = findPlayerOnRoster_(partnerTeamKey, name);
        _ctPartData.push({name: name, pos: pd ? pd.pos : '', mlbTeam: pd ? pd.team : ''});
        removePlayerFromRoster_(partnerTeamKey, name);
        addPlayerToRoster_(proposerTeamKey, name, pd ? pd.pos : '', pd ? pd.team : '');
      });
      // Process drops — also collect for deferral and add to waiver wire
      var _ctPropDropData = [];
      var _ctPartDropData = [];
      var _ctWpWs = ss.getSheetByName('waiver_players');
      var _ctDropDate = new Date().toLocaleDateString('en-CA', {timeZone:'America/New_York'});
      var _ctDropDT = nowET_();
      if (proposerDone) {
        try { JSON.parse(proposerDone).forEach(function(n) {
          var dd = findPlayerOnRoster_(proposerTeamKey, n);
          _ctPropDropData.push({name: n, pos: dd ? dd.pos : '', mlbTeam: dd ? dd.team : ''});
          removePlayerFromRoster_(proposerTeamKey, n);
          if (_ctWpWs) {
            var _mlbId = lookupMlbIdByName_(ss, n);
            _ctWpWs.appendRow([dd ? dd.pos : '', n, dd ? dd.team : '', _ctDropDate, _ctDropDT, 'red', _mlbId]);
          }
        }); } catch(e3) {}
      }
      if (partnerDone) {
        try { JSON.parse(partnerDone).forEach(function(n) {
          var dd = findPlayerOnRoster_(partnerTeamKey, n);
          _ctPartDropData.push({name: n, pos: dd ? dd.pos : '', mlbTeam: dd ? dd.team : ''});
          removePlayerFromRoster_(partnerTeamKey, n);
          if (_ctWpWs) {
            var _mlbId = lookupMlbIdByName_(ss, n);
            _ctWpWs.appendRow([dd ? dd.pos : '', n, dd ? dd.team : '', _ctDropDate, _ctDropDT, 'red', _mlbId]);
          }
        }); } catch(e3) {}
      }
      if (_ctWpWs && (_ctPropDropData.length > 0 || _ctPartDropData.length > 0)) {
        invalidateWaiverPlayersCache_();
      }

      // Deferral check for both teams
      var _ctAllTeams = _ctPropData.concat(_ctPartData, _ctPropDropData, _ctPartDropData)
        .map(function(p){return p.mlbTeam;}).filter(Boolean);
      var _ctDeferred = hasAnyTeamPlayedInPeriod_(_ctAllTeams);
      if (_ctDeferred) {
        var _ctTradeId = String(data[i][0]);
        checkAndDeferTransaction_(proposerTeamKey, _ctPartData, _ctPropData.concat(_ctPropDropData), 'trade', _ctTradeId);
        checkAndDeferTransaction_(partnerTeamKey, _ctPropData, _ctPartData.concat(_ctPartDropData), 'trade', _ctTradeId);
      }

      invalidateRostersCache_();
      SpreadsheetApp.flush();
      return { success: true, tradeFinalized: true, deferred: _ctDeferred };
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
      ws.getRange(i + 1, 10).setValue(nowET_());
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
  var now = nowET_();
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
      var now = nowET_();
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
  var now = nowET_();
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

  var scheduleUrl = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=' + date;

  try {
    var resp = UrlFetchApp.fetch(scheduleUrl, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      return { success: false, error: 'MLB API returned ' + resp.getResponseCode() };
    }
    var scheduleData = JSON.parse(resp.getContentText());

    var hitting = [];
    var pitching = [];
    var highlights = {};

    // Collect gamePks from schedule
    var gamePks = [];
    var dates = scheduleData.dates || [];
    for (var d = 0; d < dates.length; d++) {
      var games = dates[d].games || [];
      for (var g = 0; g < games.length; g++) {
        var game = games[g];
        var state = game.status && game.status.abstractGameState;
        if (state === 'Final' || state === 'Live') {
          gamePks.push(game.gamePk);
        }
      }
    }

    // Fetch each game's live feed for boxscore data
    for (var gi = 0; gi < gamePks.length; gi++) {
      try {
        var feedResp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1.1/game/' + gamePks[gi] + '/feed/live', { muteHttpExceptions: true });
        if (feedResp.getResponseCode() !== 200) continue;
        var feedData = JSON.parse(feedResp.getContentText());
        var boxscore = feedData.liveData && feedData.liveData.boxscore;
        if (!boxscore) continue;

        // Extract highlights from game content
        var content = feedData.liveData && feedData.liveData.plays;
        var mediaContent = feedData.gameData && feedData.gameData.game;
        // Try highlights from content endpoint
        try {
          var hlResp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/game/' + gamePks[gi] + '/content', { muteHttpExceptions: true });
          if (hlResp.getResponseCode() === 200) {
            var hlData = JSON.parse(hlResp.getContentText());
            if (hlData.highlights && hlData.highlights.highlights && hlData.highlights.highlights.items) {
              hlData.highlights.highlights.items.forEach(function(h) {
                if (!h.playbacks || !h.playbacks.length) return;
                var url = '';
                var thumb = h.image && h.image.cuts ? (h.image.cuts[6] || h.image.cuts[0] || {}).src : '';
                h.playbacks.forEach(function(pb) {
                  if (pb.name === 'mp4Avc' || pb.name === 'highBit' || pb.url) url = url || pb.url;
                });
                if (h.keywordsAll) {
                  h.keywordsAll.forEach(function(kw) {
                    if (kw.type === 'player_id') {
                      highlights[kw.value] = { url: url, thumb: thumb, desc: h.description || '' };
                    }
                  });
                }
              });
            }
          }
        } catch(hlErr) { /* highlights optional */ }

        // Detect MLB debuts from gameData.players — include their actual game stats
        var gamePlayers = feedData.gameData && feedData.gameData.players;
        if (gamePlayers) {
          Object.keys(gamePlayers).forEach(function(pk) {
            var gp = gamePlayers[pk];
            if (gp.mlbDebutDate !== date) return;
            var playerId = gp.id;
            var teamAbbr = gp.currentTeam ? gp.currentTeam.abbreviation : '';
            var isPitcher = gp.primaryPosition && (gp.primaryPosition.abbreviation === 'P' || gp.primaryPosition.abbreviation === 'TWP');

            // Find this player's stats in the boxscore
            var debutLine = '';
            var hl = highlights[String(playerId)] || {};
            ['away','home'].forEach(function(side) {
              var td = boxscore.teams && boxscore.teams[side];
              if (!td || !td.players) return;
              var bp = td.players['ID' + playerId];
              if (!bp) return;
              if (!teamAbbr) teamAbbr = td.team ? td.team.abbreviation : '';
              var bs = bp.stats && bp.stats.batting;
              var ps = bp.stats && bp.stats.pitching;
              if (ps && ps.inningsPitched) {
                debutLine = ps.inningsPitched + ' IP, ' + (ps.strikeOuts||0) + ' K, ' + (ps.earnedRuns||0) + ' ER';
                if (ps.hits) debutLine += ', ' + ps.hits + ' H';
                if (ps.baseOnBalls) debutLine += ', ' + ps.baseOnBalls + ' BB';
                if (ps.wins) debutLine += ', W';
                if (ps.saves) debutLine += ', SV';
              } else if (bs && bs.atBats != null) {
                debutLine = (bs.hits||0) + '-for-' + (bs.atBats||0);
                if (bs.homeRuns) debutLine += ', ' + bs.homeRuns + ' HR';
                if (bs.rbi) debutLine += ', ' + bs.rbi + ' RBI';
                if (bs.runs) debutLine += ', ' + bs.runs + ' R';
                if (bs.stolenBases) debutLine += ', ' + bs.stolenBases + ' SB';
                if (bs.baseOnBalls) debutLine += ', ' + bs.baseOnBalls + ' BB';
                if (bs.strikeOuts) debutLine += ', ' + bs.strikeOuts + ' SO';
              }
            });

            hitting.push({
              playerName: gp.fullName || '',
              mlbId: playerId,
              mlbTeam: teamAbbr,
              statLine: debutLine || 'MLB Debut',
              qualifyingReasons: ['MLB DEBUT'],
              thumbnailUrl: hl.thumb || '',
              highlightUrl: hl.url || '',
              isDebut: true
            });
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
      } catch(gameErr) { /* skip failed game */ }
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

    var result = {
      success: true,
      date: date,
      hitting: hitting,
      pitching: pitching,
      injuries: injuries,
      debuts: debuts,
      milestones: milestones
    };

    // If withBlurbs requested, filter to CVC rosters and generate AI blurbs server-side
    if (params.withBlurbs === 'true') {
      try {
        // Build roster map from sheets
        var rosterMap = {};
        var ss2 = SpreadsheetApp.openById(SPREADSHEET_ID);
        ROSTER_TEAMS.forEach(function(rt) {
          var info = RD_TEAM_INFO[rt.key];
          if (!info) return;
          var sheet = ss2.getSheetByName(rt.tabName);
          if (!sheet) return;
          var rdata = sheet.getDataRange().getValues();
          var headers = rdata[0].map(function(h) { return String(h).trim().toLowerCase(); });
          var nameCol = headers.indexOf('name');
          if (nameCol === -1) nameCol = headers.indexOf('playername');
          if (nameCol === -1) return;
          for (var ri = 1; ri < rdata.length; ri++) {
            var pName = String(rdata[ri][nameCol] || '').trim();
            if (pName) rosterMap[rdNormName_(pName)] = { teamName: info.team, owner: info.owner, teamKey: rt.key };
          }
        });

        // Filter to CVC rostered players
        result.hitting = result.hitting.filter(function(e) { return !e.isDebut && rosterMap[rdNormName_(e.playerName)]; });
        result.pitching = result.pitching.filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });

        // Extract debuts, merge, filter
        var apiDebuts2 = hitting.filter(function(e) { return e.isDebut && rosterMap[rdNormName_(e.playerName)]; });
        var debutNames2 = {};
        result.debuts.forEach(function(e) { debutNames2[rdNormName_(e.playerName)] = true; });
        apiDebuts2.forEach(function(e) { if (!debutNames2[rdNormName_(e.playerName)]) { result.debuts.push(e); debutNames2[rdNormName_(e.playerName)] = true; } });
        result.injuries = result.injuries.filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });
        result.debuts = result.debuts.filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });
        result.milestones = result.milestones.filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });

        // Attach CVC info
        function attachCvc2(e) {
          var r = rosterMap[rdNormName_(e.playerName)];
          if (r) { e.cvcTeamName = r.teamName; e.ownerName = r.owner; e.cvcTeamKey = r.teamKey; }
        }
        result.hitting.forEach(attachCvc2);
        result.pitching.forEach(attachCvc2);
        result.injuries.forEach(attachCvc2);
        result.debuts.forEach(attachCvc2);
        result.milestones.forEach(attachCvc2);

        // Generate blurbs via Claude API
        result.blurbs = rdGenerateBlurbs_(result);
      } catch(blurbErr) {
        Logger.log('withBlurbs error: ' + blurbErr.toString());
        result.blurbs = {};
      }
    }

    return result;

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


// ── Auto-Generate Rundown (daily trigger) ──

// Team key → { team name, owner name }
var RD_TEAM_INFO = {
  shawn:  { team:'Vipers',               owner:'Shawn' },
  davidz: { team:'The Hitmen',           owner:'David Z.' },
  davidr: { team:'The Boys of Summer',   owner:'David R.' },
  brian:  { team:'Bomb Squad',           owner:'Brian' },
  greg:   { team:'San Francisco Jones123', owner:'Greg' },
  jason:  { team:"Heiden's Hardtimes",   owner:'Jason' },
  keith:  { team:'The American Dreams',  owner:'Keith' },
  bill:   { team:'Billy Goats Gruff',    owner:'Bill' },
  jamie:  { team:'The Four Horsemen',    owner:'Jamie' },
  dan:    { team:'Legion of Doom',       owner:'Dan' },
  jonas:  { team:'The Super Snuffleupagus', owner:'Jonas' },
  sam:    { team:'X-Thome Fan',          owner:'Sam' }
};

function handleGenerateRundownBlurbs(params) {
  try {
    // Accept entries as JSON array or pipe-delimited text
    var entries = [];
    if (params.entries) {
      try { entries = JSON.parse(params.entries); } catch(e) { entries = []; }
    }
    if (!entries.length && params.entriesText) {
      entries = params.entriesText.split('|||');
    }
    if (!entries.length) return { success: true, blurbs: {} };
    var data = { hitting: [], pitching: [], debuts: [] };
    entries.forEach(function(entry) {
      var name = entry.split('(')[0].trim();
      var team = entry.match(/\(([^,]+),\s*([^)]+)\)/);
      var teamName = team ? team[1] : '';
      var owner = team ? team[2].trim() : '';
      var statLine = entry.split(':').slice(1).join(':').trim().split('[')[0].trim();
      var tagsMatch = entry.match(/\[([^\]]*)\]/);
      var tags = tagsMatch ? tagsMatch[1].split(',').map(function(t){return t.trim();}) : [];
      var e = { playerName: name, cvcTeamName: teamName, ownerName: owner, statLine: statLine, qualifyingReasons: tags };
      if (tags.indexOf('MLB DEBUT') !== -1) data.debuts.push(e);
      else if (statLine.indexOf(' IP') !== -1) data.pitching.push(e);
      else data.hitting.push(e);
    });
    var blurbs = rdGenerateBlurbs_(data);
    return { success: true, blurbs: blurbs };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function autoGenerateRundown() {
  // Determine target date: yesterday ET (trigger runs at 1 AM ET)
  var now = new Date();
  var et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  et.setDate(et.getDate() - 1);
  var date = Utilities.formatDate(et, 'America/New_York', 'yyyy-MM-dd');

  // Check if already generated for this date
  try {
    var existing = getSavedRundown({ date: date });
    if (existing && existing.found) {
      Logger.log('Rundown already exists for ' + date + ', skipping.');
      return;
    }
  } catch(e) {}

  // 1. Fetch raw MLB data
  var rawData = getRundownData({ date: date });
  if (!rawData.success) {
    Logger.log('Rundown data fetch failed: ' + (rawData.error || 'unknown'));
    return;
  }

  // 2. Build roster map from sheets
  var rosterMap = {}; // normalized name → { teamName, owner, teamKey }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ROSTER_TEAMS.forEach(function(rt) {
    var info = RD_TEAM_INFO[rt.key];
    if (!info) return;
    var sheet = ss.getSheetByName(rt.tabName);
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var nameCol = headers.indexOf('name');
    if (nameCol === -1) nameCol = headers.indexOf('playername');
    if (nameCol === -1) return;
    for (var i = 1; i < data.length; i++) {
      var pName = String(data[i][nameCol] || '').trim();
      if (pName) {
        rosterMap[rdNormName_(pName)] = { teamName: info.team, owner: info.owner, teamKey: rt.key };
      }
    }
  });

  // 3. Filter to CVC rostered players
  rawData.hitting = (rawData.hitting || []).filter(function(e) { return !e.isDebut && rosterMap[rdNormName_(e.playerName)]; });
  rawData.pitching = (rawData.pitching || []).filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });

  // Extract debuts and filter to CVC
  var apiDebuts = (rawData.hitting || []).filter(function(e) { return e.isDebut; });
  rawData.hitting = rawData.hitting.filter(function(e) { return !e.isDebut; });
  var debutNames = {};
  (rawData.debuts || []).forEach(function(e) { debutNames[rdNormName_(e.playerName)] = true; });
  apiDebuts.forEach(function(e) {
    if (!debutNames[rdNormName_(e.playerName)] && rosterMap[rdNormName_(e.playerName)]) {
      rawData.debuts.push(e);
      debutNames[rdNormName_(e.playerName)] = true;
    }
  });
  rawData.injuries = (rawData.injuries || []).filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });
  rawData.debuts = (rawData.debuts || []).filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });
  rawData.milestones = (rawData.milestones || []).filter(function(e) { return rosterMap[rdNormName_(e.playerName)]; });

  // Attach CVC info
  function attachCvc(e) {
    var r = rosterMap[rdNormName_(e.playerName)];
    if (r) { e.cvcTeamName = r.teamName; e.ownerName = r.owner; e.cvcTeamKey = r.teamKey; }
    else { e.cvcTeamName = ''; e.ownerName = ''; e.cvcTeamKey = ''; }
  }
  rawData.hitting.forEach(attachCvc);
  rawData.pitching.forEach(attachCvc);
  rawData.injuries.forEach(attachCvc);
  rawData.debuts.forEach(attachCvc);
  rawData.milestones.forEach(attachCvc);

  // 4. Generate blurbs
  var blurbs = rdGenerateBlurbs_(rawData);

  // 5. Build cache object matching frontend format
  var cache = {
    date: date,
    data: rawData,
    blurbs: blurbs,
    generatedAt: Utilities.formatDate(new Date(), 'America/New_York', 'h:mm:ss a') + ' (auto)'
  };

  // 6. Save
  saveRundownCache({ date: date, json: JSON.stringify(cache), generatedAt: cache.generatedAt });
  Logger.log('Rundown auto-generated for ' + date + ': ' + rawData.hitting.length + ' hitting, ' + rawData.pitching.length + ' pitching, ' + rawData.debuts.length + ' debuts.');
}

function rdNormName_(name) {
  return (name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

var RD_SYSTEM_PROMPT = 'You are an award-winning sports journalist who has covered the CVC Fantasy Baseball League for 30 years. You write for a premium sports publication. Your writing is sharp, specific, confident, and never generic.\n\n' +
  'You will receive a list of notable player performances from today\'s MLB games. Each entry includes the player name, their CVC fantasy team and owner, their stat line, and what made the performance notable.\n\n' +
  'Write a short blurb (2-3 sentences) for EACH player. Return your response as a JSON object where each key is the player\'s exact name and each value is the blurb text. Example: {"Juan Soto": "blurb here", "Corbin Burnes": "blurb here"}\n\n' +
  'CRITICAL RULES:\n' +
  '- Every blurb MUST sound completely different from every other blurb. Never reuse the same opening structure, transitional phrase, adjective, or sign-off across multiple blurbs.\n' +
  '- Vary the tone: some analytical, some conversational, some dramatic, some wry, some celebratory. Never the same tone twice in a row.\n' +
  '- Every sentence must reference specific stats from the data. No filler. No vague praise. If a sentence could apply to any player, cut it.\n' +
  '- Always mention the CVC fantasy team name and owner naturally — e.g. "a monster night for Greg\'s San Francisco Jones123" or "Brian\'s Bomb Squad got exactly what they needed."\n' +
  '- Vary sentence length and rhythm. Mix punchy fragments with longer analytical sentences.\n' +
  '- For MLB DEBUT entries: write about the significance of the debut AND reference their actual game stats if provided. Make it feel like a milestone moment.\n' +
  '- Do NOT start consecutive blurbs the same way. Do NOT reuse catchphrases.\n' +
  '- The collection should read like a single cohesive piece of elite sports journalism, not a series of Mad Libs.\n' +
  '- Return ONLY valid JSON. No markdown, no code fences, no explanation.';

function rdGenerateBlurbs_(data) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');

  // Build the entries list
  var entries = [];
  (data.hitting || []).forEach(function(e) {
    entries.push(e.playerName + ' (' + e.cvcTeamName + ', ' + e.ownerName + '): ' + e.statLine + ' [' + (e.qualifyingReasons || []).join(', ') + ']');
  });
  (data.pitching || []).forEach(function(e) {
    entries.push(e.playerName + ' (' + e.cvcTeamName + ', ' + e.ownerName + '): ' + e.statLine + ' [' + (e.qualifyingReasons || []).join(', ') + ']');
  });
  (data.debuts || []).forEach(function(e) {
    var line = e.statLine && e.statLine !== 'MLB Debut' ? e.statLine : 'no stats available';
    entries.push(e.playerName + ' (' + e.cvcTeamName + ', ' + e.ownerName + '): MLB Debut — ' + line + ' [MLB DEBUT]');
  });

  if (entries.length === 0) return {};

  // If no API key, fall back to simple templates
  if (!apiKey) {
    Logger.log('No ANTHROPIC_API_KEY — using template fallback for rundown blurbs');
    return rdFallbackBlurbs_(data);
  }

  try {
    var maxRetries = 2;
    for (var attempt = 0; attempt < maxRetries; attempt++) {
      var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        payload: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: RD_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: 'Write blurbs for these performances:\n\n' + entries.join('\n') }]
        }),
        muteHttpExceptions: true
      });
      var code = response.getResponseCode();
      var body = response.getContentText();
      if (code === 529 && attempt < maxRetries - 1) {
        Logger.log('Rundown blurbs: API overloaded (529), retrying...');
        Utilities.sleep(5000);
        continue;
      }
      if (code !== 200) {
        Logger.log('Rundown blurbs: API error ' + code + ' ' + body);
        return rdFallbackBlurbs_(data);
      }
      var parsed = JSON.parse(body);
      var text = (parsed.content && parsed.content[0]) ? parsed.content[0].text : '';
      // Strip markdown code fences if present
      text = text.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim();
      try {
        var blurbs = JSON.parse(text);
        Logger.log('Rundown blurbs: AI generated ' + Object.keys(blurbs).length + ' blurbs');
        return blurbs;
      } catch(pe) {
        Logger.log('Rundown blurbs: JSON parse failed, using fallback. Raw: ' + text.substring(0, 200));
        return rdFallbackBlurbs_(data);
      }
    }
  } catch(e) {
    Logger.log('Rundown blurbs: API exception ' + e.toString());
  }
  return rdFallbackBlurbs_(data);
}

// Simple template fallback if API is unavailable
function rdFallbackBlurbs_(data) {
  var blurbs = {};
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  var openers = ['$ delivered.','Big night for $.','$ came through.','$ made an impact.','$ showed out.'];
  var cvcLines = ['A boost for %o\'s %t.','%o\'s %t needed that.','Good news for %o.'];
  var closers = ['Final line: %s.','%s.','The numbers: %s.'];
  function sub(a,v){return pick(a).replace(/\$/g,v);}
  (data.hitting||[]).forEach(function(e){
    blurbs[e.playerName] = sub(openers,e.playerName)+' '+pick(cvcLines).replace(/%o/g,e.ownerName).replace(/%t/g,e.cvcTeamName)+' '+pick(closers).replace(/%s/g,e.statLine);
  });
  (data.pitching||[]).forEach(function(e){
    blurbs[e.playerName] = sub(openers,e.playerName)+' '+pick(cvcLines).replace(/%o/g,e.ownerName).replace(/%t/g,e.cvcTeamName)+' '+pick(closers).replace(/%s/g,e.statLine);
  });
  (data.debuts||[]).forEach(function(e){
    blurbs[e.playerName] = e.playerName+' made his MLB debut for '+e.ownerName+'\'s '+e.cvcTeamName+'. '+(e.statLine&&e.statLine!=='MLB Debut'?'Line: '+e.statLine+'.':'');
  });
  return blurbs;
}

// To set up the daily trigger, run this function ONCE manually from the Apps Script editor:
function setupRundownTrigger() {
  // Remove any existing rundown triggers
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'autoGenerateRundown') ScriptApp.deleteTrigger(t);
  });
  // Create daily trigger at 1 AM ET (Apps Script uses account timezone)
  ScriptApp.newTrigger('autoGenerateRundown')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .nearMinute(0)
    .create();
  Logger.log('Rundown trigger created: daily at ~1:00 AM');
}

// ── Save / Load Rundown Cache (server-side persistence) ──

function rdFormatCellDate_(cellVal) {
  // Google Sheets may store date strings as Date objects — normalize to yyyy-MM-dd
  if (cellVal instanceof Date) {
    return Utilities.formatDate(cellVal, 'America/New_York', 'yyyy-MM-dd');
  }
  return String(cellVal || '');
}

function saveRundownCache(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('rundown_cache');
    if (!sheet) {
      sheet = ss.insertSheet('rundown_cache');
      sheet.appendRow(['date', 'json', 'generatedAt']);
      // Format date column as plain text to prevent auto-conversion
      sheet.getRange('A:A').setNumberFormat('@');
    }
    var date = String(params.date || '');
    var json = params.json || '{}';
    var generatedAt = params.generatedAt || '';
    // Check if row for this date already exists
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (rdFormatCellDate_(data[i][0]) === date) {
        sheet.getRange(i + 1, 2).setValue(json);
        sheet.getRange(i + 1, 3).setValue(generatedAt);
        return { success: true };
      }
    }
    // Set as plain text to avoid date auto-formatting
    var newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1).setNumberFormat('@').setValue(date);
    sheet.getRange(newRow, 2).setValue(json);
    sheet.getRange(newRow, 3).setValue(generatedAt);
    // Keep only last 7 days
    if (sheet.getLastRow() > 8) {
      sheet.deleteRow(2);
    }
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

function getSavedRundown(params) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('rundown_cache');
    if (!sheet) return { success: true, found: false };
    var date = String(params.date || '');
    var data = sheet.getDataRange().getValues();

    // If requesting 'latest', return the most recent entry
    if (date === 'latest') {
      var latestRow = null;
      var latestDate = '';
      for (var j = 1; j < data.length; j++) {
        var d = rdFormatCellDate_(data[j][0]);
        if (d > latestDate) { latestDate = d; latestRow = j; }
      }
      if (latestRow !== null) {
        return { success: true, found: true, json: String(data[latestRow][1]), generatedAt: String(data[latestRow][2]) };
      }
      return { success: true, found: false };
    }

    for (var i = 1; i < data.length; i++) {
      if (rdFormatCellDate_(data[i][0]) === date) {
        return { success: true, found: true, json: String(data[i][1]), generatedAt: String(data[i][2]) };
      }
    }
    return { success: true, found: false };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
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

  var ws = ensureWaiverPositionsSheet_();
  var existing = ws.getDataRange().getValues();
  var playerMap = {};
  for (var i = 1; i < existing.length; i++) {
    var mlbId = String(existing[i][1]);
    if (mlbId) playerMap[mlbId] = { row: i + 1, name: String(existing[i][0]), pos: String(existing[i][2]) };
  }

  // Build set of currently rostered player names — skip these entirely
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

  // Build set of waiver player names for cleanup check
  var _waiverNameSet = {};
  var _wpCleanWs = ss.getSheetByName('waiver_players');
  if (_wpCleanWs) {
    var _wpCleanData = _wpCleanWs.getDataRange().getValues();
    for (var _wci = 1; _wci < _wpCleanData.length; _wci++) {
      var _wcn = String(_wpCleanData[_wci][1] || '').trim().toLowerCase();
      if (_wcn) _waiverNameSet[_wcn] = true;
    }
  }

  // Clean up waiver_positions sheet: remove rostered players, UT pitchers, and players not on waiver wire
  var _cleanRows = [];
  for (var ci = existing.length - 1; ci >= 1; ci--) {
    var _cName = String(existing[ci][0] || '').trim();
    var _cPos = String(existing[ci][2] || '').trim();
    var _isRostered = rosteredNames[_cName.toLowerCase()];
    var _notOnWaivers = !_waiverNameSet[_cName.toLowerCase()];
    // Check if UT player is actually a pitcher (check via MLB API primaryPosition)
    var _isUtPitcher = false;
    if (_cPos === 'UT' && existing[ci][1]) {
      try {
        var _pResp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/people/' + existing[ci][1], { muteHttpExceptions: true });
        if (_pResp.getResponseCode() === 200) {
          var _pData = JSON.parse(_pResp.getContentText());
          if (_pData.people && _pData.people[0] && _pData.people[0].primaryPosition) {
            var _pAbbr = _pData.people[0].primaryPosition.abbreviation;
            if (_pAbbr === 'P' || _pAbbr === 'TWP') _isUtPitcher = true;
          }
        }
      } catch(e) {}
    }
    if (_isRostered || _isUtPitcher || _notOnWaivers) {
      _cleanRows.push(ci + 1);
      delete playerMap[String(existing[ci][1])];
    }
  }
  if (_cleanRows.length > 0) {
    // Delete from bottom up to preserve row indices
    _cleanRows.forEach(function(row) { ws.deleteRow(row); });
    Logger.log('updateWaiverPositions: cleaned ' + _cleanRows.length + ' rows (rostered players + UT pitchers)');
    SpreadsheetApp.flush();
    // Re-read after cleanup
    existing = ws.getDataRange().getValues();
    playerMap = {};
    for (var ri = 1; ri < existing.length; ri++) {
      var _rmid = String(existing[ri][1]);
      if (_rmid) playerMap[_rmid] = { row: ri + 1, name: String(existing[ri][0]), pos: String(existing[ri][2]) };
    }
  }

  // Build map of all waiver player positions and identify formerly rostered players
  var formerlyRostered = {}; // playerName.lower -> base position (dropped after March 15)
  var allWaiverPos = {}; // playerName.lower -> position from waiver_players sheet
  var wpWs = ss.getSheetByName('waiver_players');
  if (wpWs) {
    var wpData = wpWs.getDataRange().getValues();
    for (var wi = 1; wi < wpData.length; wi++) {
      var wpName = String(wpData[wi][1] || '').trim().toLowerCase();
      var wpPos = String(wpData[wi][0] || '').trim();
      var wpDate = String(wpData[wi][3] || '').trim();
      if (wpName && wpPos) allWaiverPos[wpName] = wpPos;
      // Players added to waivers on or after March 15 were dropped from a CVC roster
      // Handle both YYYY-MM-DD strings and Date objects from Google Sheets
      var _wpDateParsed = wpData[wi][3];
      var _wpDateStr = '';
      if (_wpDateParsed instanceof Date) {
        _wpDateStr = _wpDateParsed.getFullYear() + '-' + String(_wpDateParsed.getMonth()+1).padStart(2,'0') + '-' + String(_wpDateParsed.getDate()).padStart(2,'0');
      } else {
        _wpDateStr = String(_wpDateParsed || '').trim();
        // If it starts with a day name (e.g. "Thu May..."), parse it
        if (_wpDateStr && !_wpDateStr.match(/^\d{4}/)) {
          try { var _pd = new Date(_wpDateStr); if (!isNaN(_pd.getTime())) _wpDateStr = _pd.getFullYear() + '-' + String(_pd.getMonth()+1).padStart(2,'0') + '-' + String(_pd.getDate()).padStart(2,'0'); } catch(e) {}
        }
      }
      if (wpName && wpPos && _wpDateStr >= '2026-03-15') {
        formerlyRostered[wpName] = wpPos;
      }
    }
  }

  // Auto-add waiver_players not yet in waiver_positions sheet
  var playerMapNames = {};
  Object.keys(playerMap).forEach(function(mid) { playerMapNames[playerMap[mid].name.toLowerCase()] = true; });
  if (wpWs) {
    var _wpAll = wpWs.getDataRange().getValues();
    var _added = 0;
    for (var _wi = 1; _wi < _wpAll.length; _wi++) {
      var _wpN = String(_wpAll[_wi][1] || '').trim();
      if (!_wpN || playerMapNames[_wpN.toLowerCase()] || rosteredNames[_wpN.toLowerCase()]) continue;
      // Resolve MLB ID
      var _wpMid = null;
      try {
        var _sr = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/people/search?names=' + encodeURIComponent(_wpN) + '&sportId=1', { muteHttpExceptions: true });
        if (_sr.getResponseCode() === 200) {
          var _sd = JSON.parse(_sr.getContentText());
          if (_sd.people && _sd.people[0]) _wpMid = String(_sd.people[0].id);
        }
      } catch(e) {}
      if (!_wpMid) continue;
      var _wpPos = String(_wpAll[_wi][0] || 'UT').trim();
      ws.appendRow([_wpN, _wpMid, _wpPos, '', '']);
      var _newRow = ws.getLastRow();
      playerMap[_wpMid] = { row: _newRow, name: _wpN, pos: _wpPos };
      playerMapNames[_wpN.toLowerCase()] = true;
      _added++;
      if (_added % 10 === 0) Utilities.sleep(1000); // rate limit
      if (_added >= 50) break; // cap per run to avoid timeout
    }
    if (_added > 0) {
      Logger.log('updateWaiverPositions: added ' + _added + ' new players to waiver_positions');
      SpreadsheetApp.flush();
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

    // Skip pitchers — they don't need position updates
    var currentPos = entry.pos.split('-')[0].toUpperCase();
    var origPos = (allWaiverPos[entry.name.toLowerCase()] || '').split('-')[0].toUpperCase();
    if (['SP','RP','P'].indexOf(currentPos) !== -1 || ['SP','RP','P'].indexOf(origPos) !== -1) return;

    var isFormerRoster = formerlyRostered.hasOwnProperty(entry.name.toLowerCase());
    var basePos = isFormerRoster ? formerlyRostered[entry.name.toLowerCase()] : '';

    try {
      var result = null;

      // Fallback chain: 2026 → 2025 → 2024 → 2023 → MiLB → UT
      var isCurrent = false; // true if data is from 2026
      result = wpFetchFielding_(id, 2026, 1);
      if (result) {
        isCurrent = true;
      } else {
        result = wpFetchFielding_(id, 2025, 1);
        if (!result) result = wpFetchFielding_(id, 2024, 1);
        if (!result) result = wpFetchFielding_(id, 2023, 1);
        // MiLB fallback
        if (!result) {
          var milbLevels = [11, 12, 13, 14];
          var milbYears = [2025, 2024];
          for (var yi = 0; yi < milbYears.length && !result; yi++) {
            for (var li = 0; li < milbLevels.length && !result; li++) {
              result = wpFetchFielding_(id, milbYears[yi], milbLevels[li]);
            }
          }
        }
      }
      // If formerly rostered with no stats anywhere, keep base position
      if (!result && isFormerRoster) {
        if (entry.pos !== basePos) {
          ws.getRange(entry.row, 3).setValue(basePos);
          ws.getRange(entry.row, 4).setValue(nowET_());
          ws.getRange(entry.row, 5).setValue('roster-base');
          updated++;
        }
        return;
      }

      if (!result || !result.pos) {
        // No data at all — assign UT if not formerly rostered
        if (!isFormerRoster && entry.pos !== 'UT') {
          ws.getRange(entry.row, 3).setValue('UT');
          ws.getRange(entry.row, 4).setValue(nowET_());
          ws.getRange(entry.row, 5).setValue('no-data');
          updated++;
        }
        return;
      }

      // Build position string using season-appropriate rules
      var posPA = result.posPA || {};
      var realPositions = ['C','1B','2B','3B','SS','OF'];

      // Find primary = real field position with most games
      var primary = null;
      var primaryGames = 0;
      realPositions.forEach(function(rp) {
        if ((posPA[rp] || 0) > primaryGames) { primary = rp; primaryGames = posPA[rp]; }
      });

      if (!primary || primaryGames === 0) {
        // No games at any real field position
        if (isCurrent) {
          // 2026: only DH/UT appearances → UT
          var newPos = 'UT';
        } else {
          // Prior seasons: fewer than 5 field games → UT
          var newPos = 'UT';
        }
      } else {
        var parts = [primary];
        // Add additional positions meeting threshold
        // 2026: 10+ games for multi-position
        // Prior seasons: 30+ games for multi-position
        var multiThreshold = isCurrent ? 10 : 30;
        realPositions.forEach(function(rp) {
          if (rp !== primary && (posPA[rp] || 0) >= multiThreshold) {
            parts.push(rp);
          }
        });
        var newPos = parts.join('-');

        // Prior seasons only: if fewer than 5 total field games → UT
        if (!isCurrent) {
          var totalFieldGames = 0;
          realPositions.forEach(function(rp) { totalFieldGames += (posPA[rp] || 0); });
          if (totalFieldGames < 5) newPos = 'UT';
        }
      }
      var source = result.source || '';

      // For formerly rostered players: MERGE — keep base positions, only add new ones
      if (isFormerRoster && basePos) {
        var baseParts = basePos.split('-');
        var newParts = newPos.split('-');
        // Start with base positions, add any new ones from stats
        var merged = baseParts.slice();
        newParts.forEach(function(p) {
          if (merged.indexOf(p) === -1) merged.push(p);
        });
        newPos = merged.join('-');
        source = (source ? source + ' ' : '') + '(merged with roster base)';
      }

      if (newPos && newPos !== entry.pos) {
        ws.getRange(entry.row, 3).setValue(newPos);
        ws.getRange(entry.row, 4).setValue(nowET_());
        ws.getRange(entry.row, 5).setValue(source);
        updated++;
      }
    } catch(e) {
      Logger.log('updateWaiverPositions error for ' + entry.name + ': ' + e.toString());
    }
  });

  if (updated > 0) SpreadsheetApp.flush();
  Logger.log('updateWaiverPositions: updated ' + updated + ' of ' + mlbIds.length + ' waiver players');

  // ── Update rostered hitter positions (add-only, never remove) ──────────
  if (isPreseason) return; // only during regular season

  var rosterUpdated = 0;
  var realPositions = ['C','1B','2B','3B','SS','OF'];

  ROSTER_TEAMS.forEach(function(rt) {
    var sheet = ss.getSheetByName(rt.tabName);
    if (!sheet) return;
    var rData = sheet.getDataRange().getValues();

    for (var ri = 1; ri < rData.length; ri++) {
      var rPos = String(rData[ri][0] || '').trim();
      var rName = String(rData[ri][1] || '').trim();
      if (!rName) continue;

      // Skip pitchers — handled by pitcher_roles
      var rPosFirst = rPos.split('-')[0];
      if (rPosFirst === 'SP' || rPosFirst === 'RP' || rPosFirst === 'P') continue;

      // Resolve MLB ID
      var rMlbId = _prResolveId(rName);
      if (!rMlbId) continue;

      // Only check 2026 MLB stats for additional position eligibility
      // Use direct API call — no primaryPosition fallback (must have actual MLB games)
      var posPA = {};
      try {
        var _rUrl = 'https://statsapi.mlb.com/api/v1/people/' + rMlbId + '/stats?stats=season&season=2026&group=fielding&gameType=R&sportId=1';
        var _rResp = UrlFetchApp.fetch(_rUrl, { muteHttpExceptions: true });
        if (_rResp.getResponseCode() === 200) {
          var _rData = JSON.parse(_rResp.getContentText());
          if (_rData.stats && _rData.stats[0] && _rData.stats[0].splits) {
            _rData.stats[0].splits.forEach(function(sp) {
              var _rp = sp.position ? sp.position.abbreviation : '';
              if (_rp === 'LF' || _rp === 'CF' || _rp === 'RF') _rp = 'OF';
              if (_rp === 'DH') _rp = 'UT';
              var _rg = parseInt(sp.stat.gamesPlayed || sp.stat.games || 0);
              if (_rp && _rg > 0) posPA[_rp] = (posPA[_rp] || 0) + _rg;
            });
          }
        }
      } catch(e) { continue; }
      if (Object.keys(posPA).length === 0) continue;
      var currentParts = rPos.split('-');
      var newParts = currentParts.slice(); // start with current positions (locked)

      // Add any field position with 10+ games in 2026
      realPositions.forEach(function(rp) {
        if (newParts.indexOf(rp) === -1 && (posPA[rp] || 0) >= 10) {
          newParts.push(rp);
        }
      });

      if (newParts.length > currentParts.length) {
        var newPos = newParts.join('-');
        sheet.getRange(ri + 1, 1).setValue(newPos);
        rosterUpdated++;
        Logger.log('Roster update: ' + rName + ' (' + rt.tabName + ') ' + rPos + ' → ' + newPos);
      }
    }
  });

  if (rosterUpdated > 0) {
    invalidateRostersCache_();
    SpreadsheetApp.flush();
  }
  Logger.log('updateWaiverPositions: updated ' + rosterUpdated + ' rostered hitter positions');
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
          // Only count positions with actual games played
          var games = parseInt(s.gamesPlayed || s.games || 0);
          if (games === 0) return;
          // Use games played directly for position eligibility
          posPA[posName] = (posPA[posName] || 0) + games;
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
                // Use primaryPosition with DH games count
                var dhGames = posPA['UT'] || 0;
                posPA[mappedPos] = (posPA[mappedPos] || 0) + (dhGames > 0 ? dhGames : 100);
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

    // Remove entries with 0 games
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
  var now = nowET_();
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
  var now = nowET_();

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
// PITCHER ROLE CONVERSION — SP/RP automatic role changes
// ═══════════════════════════════════════════════════════════════════════════
// Rules:
// - RP with 2 consecutive starts → SP
// - SP with 3 consecutive relief appearances → RP
// - Applies to all pitchers: rostered, waiver wire, free agents
// Sheet: pitcher_roles — columns: playerName, mlbId, currentRole, lastChecked, evidence

function ensurePitcherRolesSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('pitcher_roles');
  if (!ws) {
    ws = ss.insertSheet('pitcher_roles');
    ws.appendRow(['playerName', 'mlbId', 'currentRole', 'lastChecked', 'evidence']);
    ws.setFrozenRows(1);
  }
  return ws;
}

function getPitcherRoles() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('pitcher_roles');
  if (!ws) return { success: true, roles: {} };
  var data = ws.getDataRange().getValues();
  var roles = {};
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0] || '').trim();
    if (name) {
      roles[name] = {
        mlbId: String(data[i][1] || ''),
        role: String(data[i][2] || ''),
        lastChecked: String(data[i][3] || ''),
        evidence: String(data[i][4] || '')
      };
    }
  }
  return { success: true, roles: roles };
}

function updatePitcherRoles() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ensurePitcherRolesSheet_();
  var now = new Date();
  var isPreseason = now < new Date('2026-03-25T00:00:00');

  // Load existing pitcher_roles data
  var existingData = ws.getDataRange().getValues();
  var existingMap = {}; // mlbId -> { row, name, role }
  for (var i = 1; i < existingData.length; i++) {
    var mid = String(existingData[i][1] || '').trim();
    if (mid) existingMap[mid] = { row: i + 1, name: String(existingData[i][0]), role: String(existingData[i][2]) };
  }

  // Collect ALL pitchers from rosters + waiver wire
  var allPitchers = {}; // mlbId -> { name, pos, source: 'roster'|'waiver' }

  // From CVC rosters
  ROSTER_TEAMS.forEach(function(rt) {
    var sheet = ss.getSheetByName(rt.tabName);
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      var pos = String(data[r][0] || '').trim();
      var name = String(data[r][1] || '').trim();
      if (!name) continue;
      var posFirst = pos.split('-')[0];
      if (posFirst !== 'SP' && posFirst !== 'RP' && posFirst !== 'P') continue;
      // Resolve mlbId
      var mlbId = _prResolveId(name);
      if (mlbId) allPitchers[mlbId] = { name: name, pos: pos, source: 'roster', teamTab: rt.tabName };
    }
  });

  // From waiver wire — include SP, RP, P, and UT (UT may be corrupted pitchers)
  var wpWs = ss.getSheetByName('waiver_players');
  if (wpWs) {
    var wpData = wpWs.getDataRange().getValues();
    for (var w = 1; w < wpData.length; w++) {
      var wPos = String(wpData[w][0] || '').trim();
      var wName = String(wpData[w][1] || '').trim();
      if (!wName) continue;
      var wPosFirst = wPos.split('-')[0];
      // Include UT players — they may be pitchers corrupted by old logic
      if (wPosFirst !== 'SP' && wPosFirst !== 'RP' && wPosFirst !== 'P' && wPosFirst !== 'UT') continue;
      var wMlbId = _prResolveId(wName);
      if (wMlbId && !allPitchers[wMlbId]) allPitchers[wMlbId] = { name: wName, pos: wPos, source: 'waiver' };
    }
  }

  // Also include pitchers already tracked in pitcher_roles sheet
  Object.keys(existingMap).forEach(function(mid) {
    if (!allPitchers[mid]) {
      allPitchers[mid] = { name: existingMap[mid].name, pos: existingMap[mid].role || 'SP', source: 'tracked' };
    }
  });

  var pitcherIds = Object.keys(allPitchers);
  Logger.log('updatePitcherRoles: processing ' + pitcherIds.length + ' pitchers');

  var updated = 0;
  var batchSize = 25;

  for (var bi = 0; bi < pitcherIds.length; bi += batchSize) {
    var batch = pitcherIds.slice(bi, bi + batchSize);
    var idStr = batch.join(',');

    try {
      var role2026 = _prFetchGameLogs(idStr, 2026);

      batch.forEach(function(mid) {
        var pitcher = allPitchers[mid];
        var currentPos = pitcher.pos.split('-')[0];

        // For UT players: check if they're actually a pitcher via game log or fallback
        // If no pitching data found, skip — they're a hitter stuck at UT
        if (currentPos === 'UT') {
          var hasPitchingData = !!role2026[mid];
          if (!hasPitchingData) {
            var fb = _prFallbackRole(mid);
            if (!fb) return; // not a pitcher — skip
          }
          currentPos = 'SP'; // they are a pitcher, default to SP
        }

        if (currentPos === 'P') currentPos = 'SP'; // default P to SP
        var newRole = currentPos;
        var evidence = '';

        if (role2026[mid]) {
          var apps = role2026[mid]; // [{date, started: true/false}, ...] chronological
          if (apps.length >= 2) {
            // Check RP → SP: last 2 are starts
            var last2 = apps.slice(-2);
            if (last2[0].started && last2[1].started) {
              newRole = 'SP';
              evidence = '2 consecutive starts: ' + last2.map(function(a){return a.date;}).join(', ');
            }
          }
          if (apps.length >= 3) {
            // Check SP → RP: last 3 are relief
            var last3 = apps.slice(-3);
            if (!last3[0].started && !last3[1].started && !last3[2].started) {
              newRole = 'RP';
              evidence = '3 consecutive relief: ' + last3.map(function(a){return a.date;}).join(', ');
            }
          }
          // If no conversion triggered, determine from majority of appearances
          if (!evidence && apps.length > 0) {
            var starts = apps.filter(function(a){return a.started;}).length;
            newRole = starts > (apps.length - starts) ? 'SP' : 'RP';
            evidence = starts + ' starts / ' + (apps.length - starts) + ' relief in 2026';
          }
        } else if (isPreseason || !role2026[mid]) {
          // No 2026 data — use fallback chain
          var fallbackRole = _prFallbackRole(mid);
          if (fallbackRole) {
            newRole = fallbackRole.role;
            evidence = fallbackRole.evidence;
          }
        }

        // Update pitcher_roles sheet
        var existing = existingMap[mid];
        if (existing) {
          if (existing.role !== newRole || !existingData[existing.row - 1][3]) {
            ws.getRange(existing.row, 3).setValue(newRole);
            ws.getRange(existing.row, 4).setValue(nowET_());
            ws.getRange(existing.row, 5).setValue(evidence);
            updated++;
          }
        } else {
          ws.appendRow([pitcher.name, mid, newRole, nowET_(), evidence]);
          updated++;
        }

        // Update source sheet if role changed (compare against original sheet position, not currentPos)
        var originalPos = pitcher.pos.split('-')[0];
        if (newRole !== originalPos) {
          if (pitcher.source === 'roster' && pitcher.teamTab) {
            _prUpdateRosterPos(ss, pitcher.teamTab, pitcher.name, newRole);
          } else if (pitcher.source === 'waiver') {
            _prUpdateWaiverPos(ss, pitcher.name, newRole);
          }
        }
      });
    } catch(e) {
      Logger.log('updatePitcherRoles batch error: ' + e.toString());
    }

    // Rate limit between batches
    if (bi + batchSize < pitcherIds.length) Utilities.sleep(1000);
  }

  if (updated > 0) {
    invalidateRostersCache_();
    SpreadsheetApp.flush();
  }
  Logger.log('updatePitcherRoles: ' + updated + ' updates across ' + pitcherIds.length + ' pitchers');
}

// Fetch 2026 game logs for a batch of pitcher IDs
function _prFetchGameLogs(idStr, season) {
  var result = {}; // mlbId -> [{date, started}, ...]
  try {
    var url = 'https://statsapi.mlb.com/api/v1/people?personIds=' + idStr +
      '&hydrate=stats(group=%5Bpitching%5D,type=%5BgameLog%5D,season=' + season + ',gameType=R,sportId=1)';
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return result;
    var data = JSON.parse(resp.getContentText());
    (data.people || []).forEach(function(person) {
      var gl = (person.stats || []).find(function(s) { return s.type && s.type.displayName === 'gameLog'; });
      if (!gl || !gl.splits) return;
      var apps = [];
      gl.splits.forEach(function(sp) {
        apps.push({
          date: sp.date || '',
          started: (parseInt(sp.stat.gamesStarted) || 0) >= 1
        });
      });
      if (apps.length > 0) result[person.id] = apps;
    });
  } catch(e) { Logger.log('_prFetchGameLogs error: ' + e); }
  return result;
}

// Fallback: determine SP/RP from season stats (2025 → 2024 → 2023)
function _prFallbackRole(mlbId) {
  var seasons = [2025, 2024, 2023];
  for (var s = 0; s < seasons.length; s++) {
    try {
      var url = 'https://statsapi.mlb.com/api/v1/people/' + mlbId + '/stats?stats=season&group=pitching&season=' + seasons[s] + '&gameType=R&sportId=1';
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (resp.getResponseCode() !== 200) continue;
      var data = JSON.parse(resp.getContentText());
      if (data.stats && data.stats[0] && data.stats[0].splits && data.stats[0].splits[0]) {
        var stat = data.stats[0].splits[0].stat;
        var gp = parseInt(stat.gamesPlayed) || 0;
        var gs = parseInt(stat.gamesStarted) || 0;
        if (gp === 0) continue;
        return {
          role: gs > (gp - gs) ? 'SP' : 'RP',
          evidence: seasons[s] + ': ' + gs + ' GS / ' + gp + ' GP'
        };
      }
    } catch(e) {}
  }
  return null;
}

// Resolve a player name to MLB ID
function _prResolveId(name) {
  // Check pitcher_roles sheet first
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var prWs = ss.getSheetByName('pitcher_roles');
  if (prWs) {
    var prData = prWs.getDataRange().getValues();
    for (var i = 1; i < prData.length; i++) {
      if (String(prData[i][0]).trim() === name && prData[i][1]) return String(prData[i][1]);
    }
  }
  // Check waiver_positions sheet
  var wpWs = ss.getSheetByName('waiver_positions');
  if (wpWs) {
    var wpData = wpWs.getDataRange().getValues();
    for (var i = 1; i < wpData.length; i++) {
      if (String(wpData[i][0]).trim() === name && wpData[i][1]) return String(wpData[i][1]);
    }
  }
  // MLB API search
  try {
    var resp = UrlFetchApp.fetch('https://statsapi.mlb.com/api/v1/people/search?names=' + encodeURIComponent(name) + '&sportId=1', { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      var data = JSON.parse(resp.getContentText());
      if (data.people && data.people[0]) return String(data.people[0].id);
    }
  } catch(e) {}
  return null;
}

// Update position on a roster sheet
function _prUpdateRosterPos(ss, tabName, playerName, newRole) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === playerName) {
      sheet.getRange(i + 1, 1).setValue(newRole);
      return;
    }
  }
}

// Update position on the waiver_players sheet
function _prUpdateWaiverPos(ss, playerName, newRole) {
  var sheet = ss.getSheetByName('waiver_players');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === playerName) {
      sheet.getRange(i + 1, 1).setValue(newRole);
      invalidateWaiverPlayersCache_();
      return;
    }
  }
}

function setupPitcherRolesTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'updatePitcherRoles') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('updatePitcherRoles')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .inTimezone('America/New_York')
    .create();
  Logger.log('setupPitcherRolesTrigger: daily 6am ET trigger created');
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
      sheet.getRange(i + 1, 3).setValue(nowET_());
      return { success: true };
    }
  }
  sheet.appendRow([team, board, nowET_()]);
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
      sheet.getRange(i + 1, 3).setValue(nowET_());
      return { success: true };
    }
  }
  sheet.appendRow([team, notes, nowET_()]);
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
      sheet.getRange(i + 1, 3).setValue(nowET_());
      return { success: true };
    }
  }
  sheet.appendRow([team, list, nowET_()]);
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS DRAFT PICK — unified server-side handler
// Adds player to rosters sheet, lineup sheet, draft_history, transactions,
// and marks free agents as drafted. Rolls back on failure.
// ═══════════════════════════════════════════════════════════════════════════

function handleProcessDraftPick(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var now = new Date();
  var today = Utilities.formatDate(now, 'America/New_York', 'yyyy-MM-dd');
  var timestamp = nowET_();

  // Required params
  var playerName = params.playerName || '';
  var mlbId = params.mlbId || '';
  var position = params.position || '';
  var mlbTeam = params.mlbTeam || '';
  var ownerKey = params.ownerKey || '';
  var teamName = params.teamName || '';
  var round = params.round || '';
  var pickNumber = params.pickNumber || '';
  var draftType = params.draftType || 'rookie';  // 'rookie' or 'supplemental'
  var dropPlayer = params.dropPlayer || '';       // name of player to cut (if any)
  var season = params.season || '2026';

  if (!playerName || !ownerKey) {
    return { success: false, error: 'Missing required parameters: playerName, ownerKey' };
  }

  // Track what was written for rollback
  var rollback = [];

  try {
    // ── Step 1: Add player to roster sheet (roster_<teamKey>) ─────────
    var _draftPinKey = pinKeyFromTeamKey_(ownerKey);
    addPlayerToRoster_(_draftPinKey, playerName, position, mlbTeam);

    // ── Step 2: Remove cut player from roster sheet (if any) ─────────
    if (dropPlayer) {
      removePlayerFromRoster_(_draftPinKey, dropPlayer);
    }

    // ── Step 3: Update DRAFT HISTORY sheet ───────────────────────────
    var dhSheet = ss.getSheetByName('draft_history');
    if (!dhSheet) {
      dhSheet = ss.insertSheet('draft_history');
      dhSheet.appendRow(['season', 'round', 'pickNumber', 'ownerKey', 'teamName', 'playerName', 'mlbId', 'position', 'mlbTeam', 'draftType', 'timestamp']);
      rollback.push({ type: 'deleteSheet', sheetName: 'draft_history' });
    }
    dhSheet.appendRow([season, round, pickNumber, ownerKey, teamName, playerName, mlbId, position, mlbTeam, draftType, timestamp]);
    var dhRowNum = dhSheet.getLastRow();
    rollback.push({ type: 'deleteRow', sheetName: 'draft_history', row: dhRowNum });

    // ── Step 4: Add to TRANSACTIONS log ──────────────────────────────
    var logSheet = ss.getSheetByName('log');
    if (!logSheet) {
      logSheet = ss.insertSheet('log');
      logSheet.appendRow(['timestamp', 'type', 'team', 'details', 'period']);
    }
    var draftLabel = draftType === 'supplemental' ? 'Supplemental' : 'Rookie';
    var description = teamName + ' drafts ' + playerName + ' (' + position + ') in Round ' + round + ', Pick ' + pickNumber + ' of the ' + draftLabel + ' Draft';
    logSheet.appendRow([timestamp, 'DRAFT', ownerKey, description, '']);
    var logRowNum = logSheet.getLastRow();
    rollback.push({ type: 'deleteRow', sheetName: 'log', row: logRowNum });

    // ── Step 5: Remove from FREE AGENTS ──────────────────────────────
    var faSheetNames = ['free_agents', 'milb_free_agents'];
    for (var fi = 0; fi < faSheetNames.length; fi++) {
      var faSheet = ss.getSheetByName(faSheetNames[fi]);
      if (!faSheet) continue;
      var faData = faSheet.getDataRange().getValues();
      if (faData.length <= 1) continue;
      var faHeaders = faData[0];
      var nameCol = -1, statusCol = -1, draftedByCol = -1;
      for (var h = 0; h < faHeaders.length; h++) {
        var hdr = String(faHeaders[h]).toLowerCase().trim();
        if (hdr === 'playername' || hdr === 'player' || hdr === 'name') nameCol = h;
        if (hdr === 'status') statusCol = h;
        if (hdr === 'draftedby' || hdr === 'drafted_by') draftedByCol = h;
      }
      if (nameCol === -1) continue;
      for (var fj = 1; fj < faData.length; fj++) {
        if (String(faData[fj][nameCol]).trim().toLowerCase() === playerName.trim().toLowerCase()) {
          if (statusCol !== -1) {
            var oldStatus = faSheet.getRange(fj + 1, statusCol + 1).getValue();
            faSheet.getRange(fj + 1, statusCol + 1).setValue('drafted');
            rollback.push({ type: 'setCell', sheetName: faSheetNames[fi], row: fj + 1, col: statusCol + 1, oldValue: oldStatus });
          }
          if (draftedByCol !== -1) {
            var oldDraftedBy = faSheet.getRange(fj + 1, draftedByCol + 1).getValue();
            faSheet.getRange(fj + 1, draftedByCol + 1).setValue(ownerKey);
            rollback.push({ type: 'setCell', sheetName: faSheetNames[fi], row: fj + 1, col: draftedByCol + 1, oldValue: oldDraftedBy });
          }
          break;
        }
      }
    }

    // ── Step 6: Handle dropped player (if any) ──────────────────────
    if (dropPlayer) {
      // Remove from roster sheet
      var rosterData = rosterSheet.getDataRange().getValues();
      for (var ri = 1; ri < rosterData.length; ri++) {
        if (String(rosterData[ri][0]).trim().toLowerCase() === dropPlayer.trim().toLowerCase()) {
          rosterSheet.deleteRow(ri + 1);
          rollback.push({ type: 'insertRow', sheetName: rosterSheetName, row: ri + 1, data: rosterData[ri] });
          break;
        }
      }
      // Remove from lineup sheet
      var lineupData = lineupSheet.getDataRange().getValues();
      for (var li = 1; li < lineupData.length; li++) {
        if (String(lineupData[li][0]).trim().toLowerCase() === dropPlayer.trim().toLowerCase()) {
          lineupSheet.deleteRow(li + 1);
          rollback.push({ type: 'insertRow', sheetName: lineupSheetName, row: li + 1, data: lineupData[li] });
          break;
        }
      }
      // Log the cut transaction
      var cutDesc = teamName + ' cuts ' + dropPlayer;
      logSheet.appendRow([timestamp, 'TRANSACTION', ownerKey, cutDesc, '']);
      var cutLogRow = logSheet.getLastRow();
      rollback.push({ type: 'deleteRow', sheetName: 'log', row: cutLogRow });
    }

    invalidateRostersCache_();

    // Check if this draft pick should be deferred
    var _draftAdds = [{name: playerName, pos: position, mlbTeam: mlbTeam}];
    var _draftDrops = dropPlayer ? [{name: dropPlayer, pos: '', mlbTeam: ''}] : [];
    var _draftDefer = checkAndDeferTransaction_(_draftPinKey, _draftAdds, _draftDrops, draftType === 'supplemental' ? 'suppdraft' : 'rookiedraft', '');

    return {
      success: true,
      message: playerName + ' drafted by ' + teamName + ' — Round ' + round + ' Pick ' + pickNumber,
      rosterUpdated: true,
      transactionLogged: true,
      draftHistoryUpdated: true,
      deferred: _draftDefer.deferred,
      effectiveGame: _draftDefer.effectiveGame || null
    };

  } catch (err) {
    // ── Step 6 (error): Roll back all changes ────────────────────────
    for (var rb = rollback.length - 1; rb >= 0; rb--) {
      try {
        var op = rollback[rb];
        var rbSheet = ss.getSheetByName(op.sheetName);
        if (!rbSheet) continue;
        if (op.type === 'deleteRow') {
          rbSheet.deleteRow(op.row);
        } else if (op.type === 'deleteSheet') {
          ss.deleteSheet(rbSheet);
        } else if (op.type === 'setCell') {
          rbSheet.getRange(op.row, op.col).setValue(op.oldValue);
        } else if (op.type === 'insertRow') {
          rbSheet.insertRowAfter(op.row - 1);
          rbSheet.getRange(op.row, 1, 1, op.data.length).setValues([op.data]);
        }
      } catch (rbErr) {
        // Best-effort rollback — log but continue
      }
    }
    return {
      success: false,
      error: 'Draft pick failed: ' + err.toString(),
      rolledBack: true
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC ROSTERS — read/write roster data from Google Sheets
// Each team has a tab named "roster_{ownerKey}" with columns:
//   pos, name, team
// Format matches the hardcoded ROSTERS constant in index.html exactly.
// ═══════════════════════════════════════════════════════════════════════════

var ROSTER_TEAMS = [
  { key: 'shawn',  tabName: 'roster_shawn' },
  { key: 'davidz', tabName: 'roster_davidz' },
  { key: 'davidr', tabName: 'roster_davidr' },
  { key: 'brian',  tabName: 'roster_brian' },
  { key: 'jason',  tabName: 'roster_jason' },
  { key: 'greg',   tabName: 'roster_greg' },
  { key: 'keith',  tabName: 'roster_keith' },
  { key: 'bill',   tabName: 'roster_bill' },
  { key: 'jamie',  tabName: 'roster_jamie' },
  { key: 'dan',    tabName: 'roster_dan' },
  { key: 'jonas',  tabName: 'roster_jonas' },
  { key: 'sam',    tabName: 'roster_sam' }
];

function handleGetRosters() {
  // Check cache first (5-minute TTL)
  var cache = CacheService.getScriptCache();
  var cached = cache.get('rosters_all');
  if (cached) {
    try {
      return { success: true, rosters: JSON.parse(cached), cached: true };
    } catch (e) { /* fall through */ }
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rosters = {};

  ROSTER_TEAMS.forEach(function(team) {
    var sheet = ss.getSheetByName(team.tabName);
    if (!sheet) {
      rosters[team.key] = [];
      return;
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      rosters[team.key] = [];
      return;
    }

    // Headers in row 1: pos, name, team
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var posCol = headers.indexOf('pos');
    var nameCol = headers.indexOf('name');
    var teamCol = headers.indexOf('team');

    // Fallback column detection
    if (posCol === -1) posCol = headers.indexOf('position');
    if (nameCol === -1) nameCol = headers.indexOf('playername');
    if (teamCol === -1) teamCol = headers.indexOf('mlbteam');

    var players = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var pName = nameCol !== -1 ? String(row[nameCol] || '').trim() : '';
      if (!pName) continue;
      players.push({
        pos: posCol !== -1 ? String(row[posCol] || '').trim() : '?',
        name: pName,
        team: teamCol !== -1 ? String(row[teamCol] || '').trim() : ''
      });
    }
    rosters[team.key] = players;
  });

  // Cache for 60 seconds
  try {
    cache.put('rosters_all', JSON.stringify(rosters), 60);
  } catch (e) { /* cache write failed, non-fatal */ }

  return { success: true, rosters: rosters };
}

/**
 * seedRosters — one-time commissioner action to populate Google Sheets
 * roster tabs from the hardcoded ROSTERS data in index.html.
 * Call with: action=seedRosters&pin=1925&rosters=<JSON>
 * where rosters JSON is: { "shawn": [{pos,name,team},...], ... }
 */
function handleSeedRosters(params) {
  // Commissioner-only
  if (params.pin !== '1925') {
    return { success: false, error: 'Commissioner PIN required' };
  }

  var rostersJson = params.rosters || '{}';
  var rosters;
  try {
    rosters = JSON.parse(rostersJson);
  } catch (e) {
    return { success: false, error: 'Invalid JSON: ' + e.toString() };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var seeded = [];

  ROSTER_TEAMS.forEach(function(team) {
    var players = rosters[team.key];
    if (!players || !Array.isArray(players)) return;

    var sheet = ss.getSheetByName(team.tabName);
    if (!sheet) {
      sheet = ss.insertSheet(team.tabName);
    } else {
      // Clear existing data
      sheet.clear();
    }

    // Write header
    sheet.getRange(1, 1, 1, 3).setValues([['pos', 'name', 'team']]);

    // Write player rows
    if (players.length > 0) {
      var rows = players.map(function(p) {
        return [p.pos || '', p.name || '', p.team || ''];
      });
      sheet.getRange(2, 1, rows.length, 3).setValues(rows);
    }

    seeded.push(team.key + ': ' + players.length + ' players');
  });

  // Clear cache so next getRosters fetches fresh
  try {
    CacheService.getScriptCache().remove('rosters_all');
  } catch (e) {}

  return { success: true, seeded: seeded };
}

/**
 * seedRosterTeam — seed a single team's roster tab.
 * Call with: action=seedRosterTeam&pin=1925&teamKey=shawn&players=<JSON array>
 */
function handleSeedRosterTeam(params) {
  if (params.pin !== '1925') {
    return { success: false, error: 'Commissioner PIN required' };
  }

  var teamKey = params.teamKey || '';
  var teamDef = ROSTER_TEAMS.filter(function(t) { return t.key === teamKey; })[0];
  if (!teamDef) {
    return { success: false, error: 'Unknown team key: ' + teamKey };
  }

  var players;
  try {
    players = JSON.parse(params.players || '[]');
  } catch (e) {
    return { success: false, error: 'Invalid JSON: ' + e.toString() };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(teamDef.tabName);
  if (!sheet) {
    sheet = ss.insertSheet(teamDef.tabName);
  } else {
    sheet.clear();
  }

  sheet.getRange(1, 1, 1, 3).setValues([['pos', 'name', 'team']]);
  if (players.length > 0) {
    var rows = players.map(function(p) {
      return [p.pos || '', p.name || '', p.team || ''];
    });
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  }

  invalidateRostersCache_();
  return { success: true, team: teamKey, count: players.length };
}

/**
 * Invalidate the rosters cache. Called internally after
 * any roster-modifying action (draft pick, trade, etc).
 */
function invalidateRostersCache_() {
  try {
    CacheService.getScriptCache().remove('rosters_all');
  } catch (e) {}
}

// ══════════════════════════════════════════════════════════════════════════
// WAIVER PLAYERS — GAS-backed waiver wire
// Sheet: waiver_players — columns: A=pos, B=name, C=team, D=date, E=dateTime, F=color
// ══════════════════════════════════════════════════════════════════════════

function invalidateWaiverPlayersCache_() {
  try { CacheService.getScriptCache().remove('waiver_players_all'); } catch(e) {}
}

// Look up a player's MLB ID from player_id_map or rotowire_news sheets
function lookupMlbIdByName_(ss, playerName) {
  if (!playerName) return '';
  var name = String(playerName).trim();

  // Use the MLB Stats API as the authoritative source
  try {
    var url = 'https://statsapi.mlb.com/api/v1/people/search?names=' + encodeURIComponent(name) + '&sportIds=1,11,12,13,14';
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var data = JSON.parse(resp.getContentText());
    if (data.people && data.people.length > 0) {
      return String(data.people[0].id);
    }
  } catch(e) {
    Logger.log('lookupMlbIdByName_ API error for ' + name + ': ' + e);
  }

  return '';
}

// ══════════════════════════════════════════════════════════════════════════
// PEACH OVERRIDES — stored in GAS so all owners see the same state
// Sheet: peach_overrides — columns: A=playerName, B=overridden (true/false)
// ══════════════════════════════════════════════════════════════════════════

function handleGetPeachOverrides() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('peach_overrides');
  if (!ws) return { success: true, overrides: {} };
  var data = ws.getDataRange().getValues();
  var overrides = {};
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][0] || '').trim();
    if (name) overrides[name] = true;
  }
  return { success: true, overrides: overrides };
}

function handleSetPeachOverride(params) {
  var name = (params.name || '').trim();
  var grant = params.grant === 'true' || params.grant === true;
  if (!name) return { success: false, error: 'Player name required' };

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('peach_overrides');
  if (!ws) {
    ws = ss.insertSheet('peach_overrides');
    ws.appendRow(['playerName']);
  }

  var data = ws.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === name) { foundRow = i + 1; break; }
  }

  if (grant) {
    if (foundRow === -1) ws.appendRow([name]);
    return { success: true, action: 'granted', player: name };
  } else {
    if (foundRow !== -1) ws.deleteRow(foundRow);
    return { success: true, action: 'revoked', player: name };
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ROSTER ORDER — shared across all owners
// Sheet: roster_order — single row per team, columns: A=team, B=orderJSON
// orderJSON is a JSON string: { "OF": ["Name1","Name2",...], "SP": [...], ... }
// ══════════════════════════════════════════════════════════════════════════

function handleGetRosterOrder() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('roster_order_all');
  if (cached) {
    try { return { success: true, orders: JSON.parse(cached) }; } catch(e) {}
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('roster_order');
  if (!ws) return { success: true, orders: {} };
  var data = ws.getDataRange().getValues();
  var orders = {};
  for (var i = 1; i < data.length; i++) {
    var team = String(data[i][0] || '').trim();
    if (team) {
      try { orders[team] = JSON.parse(data[i][1]); } catch(e) { orders[team] = {}; }
    }
  }
  try { cache.put('roster_order_all', JSON.stringify(orders), 120); } catch(e) {}
  return { success: true, orders: orders };
}

function handleSaveRosterOrder(params) {
  var team = (params.team || '').trim();
  var pos = (params.pos || '').trim();
  if (!team || !pos) return { success: false, error: 'team and pos required' };
  var names;
  try { names = JSON.parse(params.names || '[]'); } catch(e) { return { success: false, error: 'Invalid JSON' }; }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('roster_order');
  if (!ws) {
    ws = ss.insertSheet('roster_order');
    ws.appendRow(['team', 'orderJSON']);
  }
  var data = ws.getDataRange().getValues();
  var foundRow = -1;
  var existing = {};
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) {
      foundRow = i + 1;
      try { existing = JSON.parse(data[i][1]); } catch(e) {}
      break;
    }
  }
  existing[pos] = names;
  var json = JSON.stringify(existing);
  if (foundRow !== -1) {
    ws.getRange(foundRow, 2).setValue(json);
  } else {
    ws.appendRow([team, json]);
  }
  try { CacheService.getScriptCache().remove('roster_order_all'); } catch(e) {}
  return { success: true, team: team, pos: pos };
}

function handleGetWaiverPlayers() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('waiver_players_all');
  if (cached) {
    try { return { success: true, players: JSON.parse(cached), cached: true }; } catch(e) {}
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_players');
  if (!ws) return { success: true, players: [] };

  var data = ws.getDataRange().getValues();
  var players = [];
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][1] || '').trim();
    if (!name) continue;
    players.push({
      pos: String(data[i][0] || '').trim(),
      name: name,
      team: String(data[i][2] || '').trim(),
      date: String(data[i][3] || '').trim(),
      dateTime: String(data[i][4] || '').trim(),
      color: String(data[i][5] || 'red').trim(),
      mlbId: String(data[i][6] || '').trim()
    });
  }

  try { cache.put('waiver_players_all', JSON.stringify(players), 60); } catch(e) {}
  return { success: true, players: players };
}

function handleAddWaiverPlayer(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_players');
  if (!ws) {
    ws = ss.insertSheet('waiver_players');
    ws.getRange(1, 1, 1, 7).setValues([['pos', 'name', 'team', 'date', 'dateTime', 'color', 'mlbId']]);
  }

  // Check for duplicate by name + team
  var data = ws.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === params.name && String(data[i][2]).trim() === (params.team || '')) {
      return { success: true, added: params.name, note: 'already exists' };
    }
  }

  ws.appendRow([
    params.pos || '',
    params.name || '',
    params.team || '',
    params.date || '',
    params.dateTime || '',
    params.color || 'red',
    params.mlbId || ''
  ]);
  invalidateWaiverPlayersCache_();
  return { success: true, added: params.name };
}

function handleRemoveWaiverPlayer(params) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_players');
  if (!ws) return { success: false, error: 'No waiver_players sheet' };

  var data = ws.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    var rowName = String(data[i][1]).trim();
    var rowTeam = String(data[i][2]).trim();
    if (rowName === params.name && (!params.team || rowTeam === params.team)) {
      ws.deleteRow(i + 1);
      invalidateWaiverPlayersCache_();
      return { success: true, removed: params.name };
    }
  }
  return { success: false, error: 'Player not found: ' + params.name };
}

function handleSeedWaiverPlayers(params) {
  if (params.pin !== '1925') {
    return { success: false, error: 'Commissioner PIN required' };
  }

  var players;
  try { players = JSON.parse(params.players || '[]'); } catch(e) {
    return { success: false, error: 'Invalid JSON: ' + e.toString() };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_players');
  if (!ws) {
    ws = ss.insertSheet('waiver_players');
  } else {
    ws.clear();
  }

  ws.getRange(1, 1, 1, 7).setValues([['pos', 'name', 'team', 'date', 'dateTime', 'color', 'mlbId']]);
  if (players.length > 0) {
    var rows = players.map(function(p) {
      return [p.pos || '', p.name || '', p.team || '', p.date || '', p.dateTime || '', p.color || 'red', p.mlbId || ''];
    });
    ws.getRange(2, 1, rows.length, 7).setValues(rows);
  }

  invalidateWaiverPlayersCache_();
  return { success: true, count: players.length };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-GENERATE POWER RANKINGS — Monday 8am ET trigger
// ═══════════════════════════════════════════════════════════════════════════

function autoGeneratePowerRankings() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Determine current period
  var currentPeriod = getCurrentCvcPeriod_();
  if (currentPeriod < 1) { Logger.log('autoGeneratePowerRankings: season not started'); return; }

  // Check if rankings already exist for this period
  var prSheet = ss.getSheetByName('powerrankings');
  if (prSheet) {
    var prData = prSheet.getDataRange().getValues();
    for (var i = 1; i < prData.length; i++) {
      if (String(prData[i][0]) === String(currentPeriod)) {
        Logger.log('autoGeneratePowerRankings: rankings already exist for period ' + currentPeriod);
        return;
      }
    }
  }

  // Build standings
  var standingsResult = handleGetStandings();
  var standings = (standingsResult.standings || []).map(function(s) {
    var t = ROSTER_TEAMS.find(function(rt) { return pinKeyFromTeamKey_(rt.key) === s.team || rt.key === s.team; });
    var team = null;
    // Map team name from owner
    var ownerMap = {
      'Shawn':'Vipers','David Z.':'The Hitmen','David R.':'The Boys of Summer','Brian':'Bomb Squad',
      'Greg':'San Francisco Jones123','Jason':"Heiden's Hardtimes",'Keith':'The American Dreams',
      'Bill':'Billy Goats Gruff','Jamie':'The Four Horsemen','Dan':'Legion of Doom',
      'Jonas':'The Super Snuffleupagus','Sam':'X-Thome Fan'
    };
    return {
      teamName: ownerMap[s.team] || s.team,
      owner: s.team,
      w: s.wins, l: s.losses, t: s.ties || 0,
      pct: s.pct ? s.pct.toFixed(3) : '0.000',
      gb: '—',
      cw: s.catWins || 0, cl: s.catLosses || 0,
      strk: '—', l10: '—',
      div: ''
    };
  });

  // Build recent results
  var resultsSheet = ss.getSheetByName('results');
  var recentResults = [];
  if (resultsSheet) {
    var rData = resultsSheet.getDataRange().getValues();
    var headers = rData[0];
    for (var ri = rData.length - 1; ri >= 1 && recentResults.length < 18; ri--) {
      var period = Number(rData[ri][0]);
      if (period >= currentPeriod) continue;
      var t1 = String(rData[ri][3] || '');
      var t2 = String(rData[ri][4] || '');
      recentResults.push({
        period: period,
        team1Name: t1, team2Name: t2,
        t1CW: Number(rData[ri][5]) || 0, t1CL: Number(rData[ri][6]) || 0, t1CT: Number(rData[ri][7]) || 0,
        t2CW: Number(rData[ri][8]) || 0, t2CL: Number(rData[ri][9]) || 0, t2CT: Number(rData[ri][10]) || 0,
        winnerName: String(rData[ri][11] || '')
      });
    }
  }

  // Build team keys
  var teamKeys = ['shawn','davidz','davidr','brian','greg','jason','keith','bill','jamie','dan','jonas','sam'];

  // Build injuries
  var injuries = {};
  var injSheet = ss.getSheetByName('rotowire_injuries');
  if (injSheet) {
    var injData = injSheet.getDataRange().getValues();
    var rostersResult = handleGetRosters();
    var allRosters = rostersResult.rosters || {};
    teamKeys.forEach(function(tk) {
      var roster = allRosters[tk] || [];
      var teamInj = [];
      roster.forEach(function(p) {
        for (var ii = 1; ii < injData.length; ii++) {
          if (String(injData[ii][0]).trim() === p.name) {
            teamInj.push(p.name + ' (' + (injData[ii][4] || injData[ii][3] || 'injured') + ')');
            break;
          }
        }
      });
      if (teamInj.length) injuries[tk] = teamInj.join(', ');
    });
  }

  var ctx = {
    period: currentPeriod,
    standings: standings,
    recentResults: recentResults,
    previousRankings: [],
    injuries: injuries,
    teamKeys: teamKeys
  };

  // Call Netlify background function
  try {
    var netlifyUrl = 'https://cvcfantasybaseball.netlify.app/.netlify/functions/generate-power-rankings-background';
    UrlFetchApp.fetch(netlifyUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(ctx),
      muteHttpExceptions: true
    });
    Logger.log('autoGeneratePowerRankings: triggered for period ' + currentPeriod);
  } catch(e) {
    Logger.log('autoGeneratePowerRankings error: ' + e.toString());
  }
}

function setupPowerRankingsTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'autoGeneratePowerRankings') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('autoGeneratePowerRankings')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .inTimezone('America/New_York')
    .create();
  Logger.log('setupPowerRankingsTrigger: Monday 8am ET trigger created');
}

// ═══════════════════════════════════════════════════════════════════════════
// RIVALRY GAMES — $25 rivalry game declarations
// ═══════════════════════════════════════════════════════════════════════════
// rivalry_games columns: declaringTeam, opponentTeam, gameNum, declaredAt, status, winner

function ensureRivalrySheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('rivalry_games');
  if (!ws) {
    ws = ss.insertSheet('rivalry_games');
    ws.appendRow(['declaringTeam', 'opponentTeam', 'gameNum', 'declaredAt', 'status', 'winner']);
    ws.setFrozenRows(1);
  }
  return ws;
}

function declareRivalryGame(params) {
  var pinCheck = verifyPin(params.declaringTeam, params.pin);
  if (!pinCheck.success) return pinCheck;

  var declaringTeam = params.declaringTeam || '';
  var opponentTeam = params.opponentTeam || '';
  var gameNum = parseInt(params.gameNum) || 0;

  if (!declaringTeam || !opponentTeam || !gameNum) return { success: false, error: 'Missing required fields' };
  if (gameNum < 1 || gameNum > 36) return { success: false, error: 'Rivalry games can only be declared for regular season games (1-36)' };

  var ws = ensureRivalrySheet_();
  var data = ws.getDataRange().getValues();

  // Check if this team has already declared a rivalry game this season
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === declaringTeam) {
      return { success: false, error: 'You have already declared a rivalry game this season' };
    }
  }

  var now = nowET_();
  ws.appendRow([declaringTeam, opponentTeam, gameNum, now, 'declared', '']);

  // Log it
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    var declarerName = getOwnerName_(declaringTeam);
    var opponentName = getOwnerName_(opponentTeam);
    logWs.appendRow([now, 'RIVALRY', declaringTeam, declarerName + ' declares Game ' + gameNum + ' a rivalry game vs ' + opponentName, '']);
  }

  // Send email to opponent
  try {
    var opponentEmail = getOwnerEmail_(opponentTeam);
    var declarerName = getOwnerName_(declaringTeam);
    var opponentName = getOwnerName_(opponentTeam);
    if (opponentEmail) {
      MailApp.sendEmail(opponentEmail,
        'CVC Fantasy Baseball — You\'ve Been Called Out',
        'Hello ' + opponentName + ',\n\n' +
        declarerName + ' has declared Game ' + gameNum + ' a rivalry game. They\'re coming for you.\n\n' +
        'Better bring it.\n\n' +
        '— CVC Fantasy Baseball'
      );
    }
  } catch(e) { Logger.log('Rivalry email error: ' + e); }
  // SMS — rivalry declared
  try { notifyOwner_(opponentTeam, 'optIn_rivalry', 'CVC Baseball: ' + getOwnerName_(declaringTeam) + ' has declared Game ' + gameNum + ' a rivalry game against you. Better bring it.'); } catch(e) {}

  return { success: true };
}

function getRivalryGames() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('rivalry_games');
  if (!ws) return { success: true, games: [] };
  var data = ws.getDataRange().getValues();
  var games = [];
  for (var i = 1; i < data.length; i++) {
    games.push({
      declaringTeam: String(data[i][0] || ''),
      opponentTeam: String(data[i][1] || ''),
      gameNum: Number(data[i][2]) || 0,
      declaredAt: String(data[i][3] || ''),
      status: String(data[i][4] || ''),
      winner: String(data[i][5] || '')
    });
  }
  return { success: true, games: games };
}

function completeRivalryGame(params) {
  if (String(params.pin) !== '1925') return { success: false, error: 'Commissioner PIN required' };

  var declaringTeam = params.declaringTeam || '';
  var gameNum = parseInt(params.gameNum) || 0;
  var winner = params.winner || '';

  if (!declaringTeam || !gameNum || !winner) return { success: false, error: 'Missing required fields' };

  var ws = ensureRivalrySheet_();
  var data = ws.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === declaringTeam && Number(data[i][2]) === gameNum) {
      ws.getRange(i + 1, 5).setValue('complete');
      ws.getRange(i + 1, 6).setValue(winner);

      // Add $25 to winner's entry fees
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var feeWs = ss.getSheetByName('entry_fees');
      if (feeWs) {
        var feeData = feeWs.getDataRange().getValues();
        var found = false;
        for (var f = 1; f < feeData.length; f++) {
          if (String(feeData[f][0]).trim() === winner) {
            var current = Number(feeData[f][1]) || 0;
            feeWs.getRange(f + 1, 2).setValue(current + 25);
            found = true;
            break;
          }
        }
        if (!found) feeWs.appendRow([winner, 25, nowET_()]);
      }

      return { success: true };
    }
  }
  return { success: false, error: 'Rivalry game not found' };
}

// ═══════════════════════════════════════════════════════════════════════════
// OWNER PREFERENCES & NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

function handleGetOwnerPrefs(params) {
  var pinCheck = verifyPin(params.team, params.pin);
  if (!pinCheck.success) return pinCheck;
  var prefs = getOwnerPrefsForTeam_(params.team);
  if (!prefs) {
    return { success: true, phone: '', optIn_il: 'false', optIn_claimAwarded: 'false', optIn_claimLost: 'false',
             optIn_tradeProposed: 'false', optIn_tradeAccepted: 'false', optIn_rivalry: 'false', theme: 'darkgreen', customTheme: '' };
  }
  prefs.success = true;
  return prefs;
}

function handleSetOwnerPrefs(params) {
  var pinCheck = verifyPin(params.team, params.pin);
  if (!pinCheck.success) return pinCheck;
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('owner_prefs');
  if (!sheet) {
    sheet = ss.insertSheet('owner_prefs');
    sheet.appendRow(['team','phone','optIn_il','optIn_claimAwarded','optIn_claimLost','optIn_tradeProposed','optIn_tradeAccepted','optIn_rivalry','theme','updatedAt','customTheme']);
    sheet.setFrozenRows(1);
  }
  var data = sheet.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(params.team).trim()) { rowIdx = i; break; }
  }
  var row = [
    params.team || '',
    params.phone || (rowIdx > 0 ? String(data[rowIdx][1] || '') : ''),
    params.optIn_il || (rowIdx > 0 ? String(data[rowIdx][2] || 'false') : 'false'),
    params.optIn_claimAwarded || (rowIdx > 0 ? String(data[rowIdx][3] || 'false') : 'false'),
    params.optIn_claimLost || (rowIdx > 0 ? String(data[rowIdx][4] || 'false') : 'false'),
    params.optIn_tradeProposed || (rowIdx > 0 ? String(data[rowIdx][5] || 'false') : 'false'),
    params.optIn_tradeAccepted || (rowIdx > 0 ? String(data[rowIdx][6] || 'false') : 'false'),
    params.optIn_rivalry || (rowIdx > 0 ? String(data[rowIdx][7] || 'false') : 'false'),
    params.theme || (rowIdx > 0 ? String(data[rowIdx][8] || 'darkgreen') : 'darkgreen'),
    nowET_(),
    params.customTheme || (rowIdx > 0 ? String(data[rowIdx][10] || '') : '')
  ];
  if (rowIdx > 0) {
    sheet.getRange(rowIdx + 1, 1, 1, 11).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return { success: true };
}

function getOwnerPrefsForTeam_(teamPinKey) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('owner_prefs');
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(teamPinKey).trim()) {
      return {
        team: String(data[i][0] || ''),
        phone: String(data[i][1] || ''),
        optIn_il: String(data[i][2] || 'false'),
        optIn_claimAwarded: String(data[i][3] || 'false'),
        optIn_claimLost: String(data[i][4] || 'false'),
        optIn_tradeProposed: String(data[i][5] || 'false'),
        optIn_tradeAccepted: String(data[i][6] || 'false'),
        optIn_rivalry: String(data[i][7] || 'false'),
        theme: String(data[i][8] || 'darkgreen'),
        customTheme: String(data[i][10] || '')
      };
    }
  }
  return null;
}

function sendOwnerText_(toPhone, message) {
  var props = PropertiesService.getScriptProperties();
  var sid = props.getProperty('TWILIO_ACCOUNT_SID');
  var authToken = props.getProperty('TWILIO_AUTH_TOKEN');
  var fromNumber = props.getProperty('TWILIO_FROM_NUMBER');
  if (!sid || !authToken || !fromNumber) {
    Logger.log('sendOwnerText_: Twilio not configured');
    return { success: false, error: 'Twilio not configured' };
  }
  try {
    var url = 'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json';
    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      headers: { 'Authorization': 'Basic ' + Utilities.base64Encode(sid + ':' + authToken) },
      payload: { To: toPhone, From: fromNumber, Body: message },
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code >= 200 && code < 300) {
      return { success: true };
    } else {
      Logger.log('sendOwnerText_ error: HTTP ' + code + ' ' + resp.getContentText().substring(0, 200));
      return { success: false, error: 'HTTP ' + code };
    }
  } catch(e) {
    Logger.log('sendOwnerText_ exception: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function notifyOwner_(teamPinKey, optInField, message) {
  try {
    var prefs = getOwnerPrefsForTeam_(teamPinKey);
    if (!prefs) return;
    if (prefs[optInField] !== 'true') return;
    if (!prefs.phone) return;
    sendOwnerText_(prefs.phone, message);
  } catch(e) {
    Logger.log('notifyOwner_ error for ' + teamPinKey + ': ' + e.toString());
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LINEUP WARNINGS
// ═══════════════════════════════════════════════════════════════════════════

function ensureLineupWarningsSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('lineup_warnings');
  if (!sheet) { sheet = ss.insertSheet('lineup_warnings'); sheet.appendRow(['team','gameNum','issuedAt']); sheet.setFrozenRows(1); }
  return sheet;
}

function handleIssueLineupWarning(params) {
  if (String(params.pin) !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var team = String(params.team || '').trim();
  var gameNum = parseInt(params.gameNum) || 0;
  if (!team) return { success: false, error: 'Missing team' };
  if (gameNum < 1 || gameNum > 31) return { success: false, error: 'Warnings cannot be issued for Game 32 or later' };
  var sheet = ensureLineupWarningsSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === team) return { success: false, error: 'Warning already issued for this team' };
  }
  var now = nowET_();
  sheet.appendRow([team, gameNum, now]);
  var ownerName = getOwnerName_(team);
  var logWs = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('log');
  if (logWs) logWs.appendRow([now, 'LINEUP_WARNING', team, ownerName + ' — lineup warning issued for Game ' + gameNum, '']);
  try { notifyOwner_(team, 'optIn_il', 'CVC Baseball: You have received a lineup warning for Game ' + gameNum + '. The commissioner will update your starting pitchers. All hitters carry over from your previous game. This is your one warning for the season. cvcfantasybaseball.com'); } catch(e) {}
  return { success: true };
}

function handleGetLineupWarnings() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('lineup_warnings');
  var warnings = [];
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      warnings.push({ team: String(data[i][0]||''), gameNum: parseInt(data[i][1])||0, issuedAt: String(data[i][2]||'') });
    }
  }
  return { success: true, warnings: warnings };
}

// ═══════════════════════════════════════════════════════════════════════════
// PODCAST EPISODES
// ═══════════════════════════════════════════════════════════════════════════

function ensurePodcastSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('podcast_episodes');
  if (!sheet) {
    sheet = ss.insertSheet('podcast_episodes');
    sheet.appendRow(['episodeNum','title','date','description','url','addedAt']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function handleGetPodcastEpisodes() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('podcast_episodes');
  if (!sheet) return { success: true, episodes: [] };
  var data = sheet.getDataRange().getValues();
  var episodes = [];
  for (var i = 1; i < data.length; i++) {
    episodes.push({
      episodeNum: parseInt(data[i][0]) || 0,
      title: String(data[i][1] || ''),
      date: String(data[i][2] || ''),
      description: String(data[i][3] || ''),
      url: String(data[i][4] || '')
    });
  }
  episodes.sort(function(a, b) { return b.episodeNum - a.episodeNum; });
  return { success: true, episodes: episodes };
}

function handleAddPodcastEpisode(params) {
  if (String(params.pin) !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var sheet = ensurePodcastSheet_();
  sheet.appendRow([
    parseInt(params.episodeNum) || 0,
    params.title || '',
    params.date || '',
    params.description || '',
    params.url || '',
    nowET_()
  ]);
  return { success: true };
}

function handleDeletePodcastEpisode(params) {
  if (String(params.pin) !== '1925') return { success: false, error: 'Commissioner PIN required' };
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('podcast_episodes');
  if (!sheet) return { success: false, error: 'No episodes sheet' };
  var data = sheet.getDataRange().getValues();
  var epNum = parseInt(params.episodeNum) || 0;
  for (var i = data.length - 1; i >= 1; i--) {
    if (parseInt(data[i][0]) === epNum) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Episode not found' };
}

function seedPodcastEpisodes() {
  var sheet = ensurePodcastSheet_();
  var now = nowET_();
  sheet.appendRow([1, 'Welcome to the CVC Fantasy Baseball Podcast!', '3/5/2026', "Let's Go!", '', now]);
  sheet.appendRow([2, "It's Still Early...", '4/7/2026', '', '', now]);
  Logger.log('Seeded 2 podcast episodes. Update URLs in the podcast_episodes sheet.');
}

// One-time fix: add missing Sean Burke transaction from 4/7
function fixMissingSeanBurkeTransaction() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var logWs = ss.getSheetByName('log');
  if (logWs) {
    logWs.appendRow(['2026-04-07T12:00:00.000Z', 'TRANSACTION', 'billygoats', 'Bill- picks up Sean Burke. Cuts Jeff Hoffman.', '']);
    Logger.log('Added missing Sean Burke transaction.');
  }
}

// One-time fix: add Jeff Hoffman to waiver_players sheet
function fixMissingJeffHoffman() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var wpWs = ss.getSheetByName('waiver_players');
  if (wpWs) {
    wpWs.appendRow(['RP', 'Jeff Hoffman', 'TOR', '2026-04-07', nowET_(), 'red']);
    invalidateWaiverPlayersCache_();
    Logger.log('Added Jeff Hoffman to waiver_players.');
  }
}

// One-time backfill: populate mlbId (column G) for existing waiver_players rows
// Backfill and verify ALL waiver player MLB IDs, teams, and dates using the MLB Stats API.
// Re-verifies every row — does not trust existing data.
function backfillWaiverPlayerMlbIds() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName('waiver_players');
  if (!ws) { Logger.log('backfill: waiver_players sheet not found'); return; }

  // Ensure header has mlbId column
  var headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];
  if (headers.length < 7 || String(headers[6]).trim().toLowerCase() !== 'mlbid') {
    ws.getRange(1, 7).setValue('mlbId');
  }

  var data = ws.getDataRange().getValues();
  var idUpdated = 0;
  var teamUpdated = 0;
  var dateFixed = 0;
  var notFound = [];

  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][1] || '').trim();
    if (!name) continue;

    // Look up from MLB API
    try {
      var url = 'https://statsapi.mlb.com/api/v1/people/search?names=' + encodeURIComponent(name) + '&sportIds=1,11,12,13,14';
      var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      var json = JSON.parse(resp.getContentText());

      if (json.people && json.people.length > 0) {
        var player = json.people[0];
        var mlbId = String(player.id);
        var currentTeamAbbr = '';
        if (player.currentTeam && player.currentTeam.abbreviation) {
          currentTeamAbbr = player.currentTeam.abbreviation;
        }

        // Update mlbId (column G)
        var existingId = String(data[i][6] || '').trim();
        if (existingId !== mlbId) {
          ws.getRange(i + 1, 7).setValue(mlbId);
          idUpdated++;
        }

        // Update team (column C) if API has a current team
        if (currentTeamAbbr) {
          var existingTeam = String(data[i][2] || '').trim();
          if (existingTeam !== currentTeamAbbr) {
            ws.getRange(i + 1, 3).setValue(currentTeamAbbr);
            teamUpdated++;
          }
        }
      } else {
        notFound.push(name);
      }
    } catch(e) {
      Logger.log('backfill error for ' + name + ': ' + e);
      notFound.push(name);
    }

    // Fix date format (column D) if it contains a full Date string
    var dateVal = String(data[i][3] || '').trim();
    if (dateVal.length > 10 && dateVal.indexOf('GMT') !== -1) {
      try {
        var d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          var fixed = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          ws.getRange(i + 1, 4).setValue(fixed);
          dateFixed++;
        }
      } catch(e2) {}
    }
  }

  invalidateWaiverPlayersCache_();
  Logger.log('backfillWaiverPlayerMlbIds: ' + (data.length - 1) + ' players processed — IDs updated: ' + idUpdated + ', teams updated: ' + teamUpdated + ', dates fixed: ' + dateFixed + ', not found: ' + notFound.length);
  if (notFound.length > 0) Logger.log('Not found: ' + notFound.join(', '));
}

// ═══════════════════════════════════════════════════════════════════════════
// MLB GAME STATUS CACHE
// ═══════════════════════════════════════════════════════════════════════════

function handleGetMLBGameStatus() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('mlb_game_status');
  if (cached) {
    try { return { success: true, games: JSON.parse(cached), source: 'cache' }; } catch(e) {}
  }
  return fetchAndCacheMLBGameStatus_();
}

function fetchAndCacheMLBGameStatus_() {
  var today = Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd');
  var url = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=' + today + '&hydrate=linescore';
  try {
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (resp.getResponseCode() !== 200) return { success: true, games: [], source: 'error' };
    var data = JSON.parse(resp.getContentText());
    var rawGames = (data.dates && data.dates[0] && data.dates[0].games) || [];
    var games = [];
    rawGames.forEach(function(g) {
      var away = g.teams && g.teams.away && g.teams.away.team;
      var home = g.teams && g.teams.home && g.teams.home.team;
      var ls = g.linescore || {};
      var state = (g.status && g.status.abstractGameState) || '';
      var detailed = (g.status && g.status.detailedState) || '';
      games.push({
        gamePk: g.gamePk,
        state: state,
        detailedState: detailed,
        awayId: away ? away.id : 0,
        awayName: away ? away.name : '',
        homeId: home ? home.id : 0,
        homeName: home ? home.name : '',
        awayScore: g.teams && g.teams.away ? (g.teams.away.score || 0) : 0,
        homeScore: g.teams && g.teams.home ? (g.teams.home.score || 0) : 0,
        currentInning: ls.currentInning || 0,
        isTopInning: !!ls.isTopInning,
        gameDate: g.gameDate || ''
      });
    });
    var cache = CacheService.getScriptCache();
    try { cache.put('mlb_game_status', JSON.stringify(games), 60); } catch(e) {}
    return { success: true, games: games, source: 'fresh' };
  } catch(e) {
    Logger.log('fetchAndCacheMLBGameStatus_ error: ' + e.toString());
    return { success: true, games: [], source: 'error' };
  }
}

function cacheMLBGameStatus() {
  var hour = parseInt(Utilities.formatDate(new Date(), 'America/New_York', 'H'));
  if (hour < 11 || hour > 23) return; // only cache during game hours
  fetchAndCacheMLBGameStatus_();
}

function setupMLBCacheTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'cacheMLBGameStatus') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('cacheMLBGameStatus').timeBased().everyMinutes(1).create();
  Logger.log('MLB game status cache trigger created — runs every 1 minute');
}
