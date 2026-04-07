// ═══════════════════════════════════════════════════════════════════════════
// Google Apps Script — SP Rest Rule Actions
// ADD these action handlers to your existing doGet() function in Apps Script.
// This handles reading/writing SP rest data to an "sp_rest" sheet.
// ═══════════════════════════════════════════════════════════════════════════
//
// In your existing handleRequest(e) function, add these cases:
//
//   if (action === 'getSpRest')  return handleGetSpRest(e);
//   if (action === 'setSpRest')  return handleSetSpRest(e);
//
// Then paste the functions below into your Apps Script project.

// Sheet columns: period, teamKey, playerName, ip
// Each row records an SP who pitched (IP > 0) in an SP or P slot during a period.
// The NEXT period, that SP's pitching stats are skipped in scoring.

function handleGetSpRest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('sp_rest');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, rest: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var period = e.parameter.period || '';
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, rest: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headers = data[0];
  var rest = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    // If period filter specified, only return rows for that period
    if (period && String(row.period) !== String(period)) continue;
    rest.push(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, rest: rest }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSetSpRest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('sp_rest');

  // Create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('sp_rest');
    sheet.appendRow(['period', 'teamKey', 'playerName', 'ip']);
  }

  // Accept JSON array of rest entries
  var entries = e.parameter.entries || '[]';
  try {
    entries = JSON.parse(entries);
  } catch(ex) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var period = e.parameter.period || '';

  // Remove existing rows for this period (to allow re-finalization)
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(period)) {
      sheet.deleteRow(i + 1);
    }
  }

  // Write new rows
  for (var j = 0; j < entries.length; j++) {
    var ent = entries[j];
    sheet.appendRow([
      period,
      ent.teamKey || '',
      ent.playerName || '',
      ent.ip || 0
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, written: entries.length }))
    .setMimeType(ContentService.MimeType.JSON);
}
