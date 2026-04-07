// ═══════════════════════════════════════════════════════════════════════════
// Google Apps Script — Results Tab Actions
// ADD these action handlers to your existing doGet() function in Apps Script.
// This handles reading/writing finalized game results to a "results" sheet.
// ═══════════════════════════════════════════════════════════════════════════
//
// In your existing doGet(e) function, add these two cases:
//
//   if (action === 'getResults')  return handleGetResults(e);
//   if (action === 'writeResults') return handleWriteResults(e);
//
// Then paste the two functions below into your Apps Script project.

function handleGetResults(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('results');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, results: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, results: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headers = data[0];
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Convert period and CW/CL/CT to numbers
      if (['period','team1_CW','team1_CL','team1_CT','team2_CW','team2_CL','team2_CT'].indexOf(headers[j]) !== -1) {
        val = Number(val) || 0;
      }
      row[headers[j]] = val;
    }
    results.push(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, results: results }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleWriteResults(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('results');

  // Create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('results');
    sheet.appendRow([
      'period', 'start_date', 'end_date', 'team1', 'team2',
      'team1_CW', 'team1_CL', 'team1_CT', 'team2_CW', 'team2_CL', 'team2_CT',
      'winner', 'team1_stats', 'team2_stats', 'finalized_date'
    ]);
  }

  var period = Number(e.parameter.period) || 0;
  var resultsJson = e.parameter.results || '[]';
  var results;
  try {
    results = JSON.parse(resultsJson);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Check if period already exists (prevent double-write)
  var existing = sheet.getDataRange().getValues();
  for (var i = 1; i < existing.length; i++) {
    if (Number(existing[i][0]) === period) {
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Already finalized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Write each matchup result as a row
  results.forEach(function(r) {
    sheet.appendRow([
      r.period, r.start_date, r.end_date, r.team1, r.team2,
      r.team1_CW, r.team1_CL, r.team1_CT, r.team2_CW, r.team2_CL, r.team2_CT,
      r.winner, r.team1_stats, r.team2_stats, r.finalized_date
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ success: true, written: results.length }))
    .setMimeType(ContentService.MimeType.JSON);
}
