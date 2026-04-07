// ═══════════════════════════════════════════════════════════════════════════
// Google Apps Script — Recap Storage Actions
// ADD these action handlers to your existing doGet() function in Apps Script.
// This handles reading/writing game recaps to a "recaps" sheet.
// ═══════════════════════════════════════════════════════════════════════════
//
// In your existing handleRequest(e) function, add these cases:
//
//   if (action === 'getRecap')  return handleGetRecap(e);
//   if (action === 'setRecap')  return handleSetRecap(e);
//
// Then paste the functions below into your Apps Script project.

// Sheet columns: period, team1, team2, recap, created_date

function handleGetRecap(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('recaps');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, recap: null }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var period = String(e.parameter.period || '');
  var team1 = e.parameter.team1 || '';
  var team2 = e.parameter.team2 || '';

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, recap: null }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (var i = 1; i < data.length; i++) {
    var rPeriod = String(data[i][0]);
    var rTeam1 = String(data[i][1]);
    var rTeam2 = String(data[i][2]);
    // Match in either direction
    if (rPeriod === period &&
        ((rTeam1 === team1 && rTeam2 === team2) || (rTeam1 === team2 && rTeam2 === team1))) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, recap: data[i][3] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, recap: null }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSetRecap(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('recaps');

  if (!sheet) {
    sheet = ss.insertSheet('recaps');
    sheet.appendRow(['period', 'team1', 'team2', 'recap', 'created_date']);
  }

  var period = String(e.parameter.period || '');
  var team1 = e.parameter.team1 || '';
  var team2 = e.parameter.team2 || '';
  var recap = e.parameter.recap || '';

  // Check for existing row (update if found)
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rPeriod = String(data[i][0]);
    var rTeam1 = String(data[i][1]);
    var rTeam2 = String(data[i][2]);
    if (rPeriod === period &&
        ((rTeam1 === team1 && rTeam2 === team2) || (rTeam1 === team2 && rTeam2 === team1))) {
      var row = i + 1;
      sheet.getRange(row, 4).setValue(recap);
      sheet.getRange(row, 5).setValue(new Date().toISOString());
      return ContentService.createTextOutput(JSON.stringify({ success: true, updated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Insert new row
  sheet.appendRow([period, team1, team2, recap, new Date().toISOString()]);

  return ContentService.createTextOutput(JSON.stringify({ success: true, written: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
