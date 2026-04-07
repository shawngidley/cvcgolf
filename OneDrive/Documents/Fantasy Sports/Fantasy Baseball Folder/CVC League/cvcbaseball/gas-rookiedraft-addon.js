// ═══════════════════════════════════════════════════════════════════════════
// Google Apps Script — 2026 Rookie Draft Actions
// ADD these action handlers to your existing doGet() function in Apps Script.
// This handles reading/writing rookie draft picks to a "rookiedraft" sheet.
// ═══════════════════════════════════════════════════════════════════════════
//
// In your existing handleRequest(e) function, add these cases:
//
//   if (action === 'getRookieDraftPicks')  return handleGetRookieDraftPicks(e);
//   if (action === 'setRookieDraftPick')   return handleSetRookieDraftPick(e);
//   if (action === 'setRookieDraftActive') return handleSetRookieDraftActive(e);
//   if (action === 'getRookieDraftActive') return handleGetRookieDraftActive(e);
//
// Then paste the functions below into your Apps Script project.

function handleGetRookieDraftPicks(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var year = e.parameter.year || '2026';
  var sheetName = 'rookiedraft_' + year;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, picks: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, picks: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

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

  return ContentService.createTextOutput(JSON.stringify({ success: true, picks: picks }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSetRookieDraftPick(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var year = e.parameter.year || '2026';
  var sheetName = 'rookiedraft_' + year;
  var sheet = ss.getSheetByName(sheetName);

  // Create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      'pick', 'status', 'player', 'pos', 'mlbTeam', 'drop',
      'pickedBy', 'pickedAt'
    ]);
  }

  var pick = Number(e.parameter.pick) || 0;
  var status = e.parameter.status || '';
  var player = e.parameter.player || '';
  var pos = e.parameter.pos || '';
  var mlbTeam = e.parameter.mlbTeam || '';
  var drop = e.parameter.drop || '';
  var pickedBy = e.parameter.pickedBy || '';
  var pickedAt = e.parameter.pickedAt || '';

  // Check if row already exists for this pick number
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === pick) {
      // Update existing row
      var row = i + 1;
      sheet.getRange(row, 2).setValue(status);
      if (player) sheet.getRange(row, 3).setValue(player);
      if (pos) sheet.getRange(row, 4).setValue(pos);
      if (mlbTeam) sheet.getRange(row, 5).setValue(mlbTeam);
      if (drop) sheet.getRange(row, 6).setValue(drop);
      if (pickedBy) sheet.getRange(row, 7).setValue(pickedBy);
      if (pickedAt) sheet.getRange(row, 8).setValue(pickedAt);
      // If reopened, clear the pick data
      if (status === 'reopened') {
        sheet.getRange(row, 3).setValue('');
        sheet.getRange(row, 4).setValue('');
        sheet.getRange(row, 5).setValue('');
        sheet.getRange(row, 6).setValue('');
        sheet.getRange(row, 7).setValue('');
        sheet.getRange(row, 8).setValue('');
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, updated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Insert new row
  sheet.appendRow([pick, status, player, pos, mlbTeam, drop, pickedBy, pickedAt]);

  return ContentService.createTextOutput(JSON.stringify({ success: true, written: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSetRookieDraftActive(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var year = e.parameter.year || '2026';
  var sheetName = 'rookiedraft_active';
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['year', 'activePick']);
  }

  var pick = Number(e.parameter.pick) || 0;

  // Update or insert
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === year) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(pick);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  sheet.appendRow([year, pick]);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetRookieDraftActive(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var year = e.parameter.year || '2026';
  var sheetName = 'rookiedraft_active';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, activePick: null }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, activePick: null }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headers = data[0];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === year) {
      var activePick = Number(data[i][1]) || null;
      return ContentService.createTextOutput(JSON.stringify({ success: true, activePick: activePick }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, activePick: null }))
    .setMimeType(ContentService.MimeType.JSON);
}
