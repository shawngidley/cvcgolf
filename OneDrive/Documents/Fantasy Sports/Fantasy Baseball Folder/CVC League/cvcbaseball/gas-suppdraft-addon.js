// ═══════════════════════════════════════════════════════════════════════════
// Google Apps Script — Supplemental Draft Actions
// ADD these action handlers to your existing doGet() function in Apps Script.
// This handles reading/writing supplemental draft picks to a "suppdraft" sheet.
// ═══════════════════════════════════════════════════════════════════════════
//
// In your existing doGet(e) function, add these cases:
//
//   if (action === 'getSuppDraftPicks')  return handleGetSuppDraftPicks(e);
//   if (action === 'setSuppDraftPick')   return handleSetSuppDraftPick(e);
//   if (action === 'setSuppDraftActive') return handleSetSuppDraftActive(e);
//   if (action === 'getSuppDraftActive') return handleGetSuppDraftActive(e);
//
// Then paste the functions below into your Apps Script project.

function handleGetSuppDraftPicks(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('suppdraft');
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
      if (headers[j] === 'slot') val = Number(val) || 0;
      row[headers[j]] = val;
    }
    picks.push(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, picks: picks }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSetSuppDraftPick(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('suppdraft');

  // Create sheet with headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('suppdraft');
    sheet.appendRow([
      'draft', 'slot', 'status', 'pick', 'pos', 'mlbTeam', 'drop',
      'pickedBy', 'pickedAt'
    ]);
  }

  // Auto-add 'pos' header if sheet exists but lacks it
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var posColIdx = headers.indexOf('pos');
  if (posColIdx === -1) {
    // Insert pos column after 'pick' (column 4) — becomes column 5
    var pickIdx = headers.indexOf('pick');
    var insertAfter = pickIdx >= 0 ? pickIdx + 2 : 5; // 1-based
    sheet.insertColumnAfter(insertAfter - 1);
    sheet.getRange(1, insertAfter).setValue('pos');
    // Re-read headers after insert
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    posColIdx = headers.indexOf('pos');
  }

  var draft = e.parameter.draft || '';
  var slot = Number(e.parameter.slot) || 0;
  var status = e.parameter.status || '';
  var pick = e.parameter.pick || '';
  var pos = e.parameter.pos || '';
  var mlbTeam = e.parameter.mlbTeam || '';
  var drop = e.parameter.drop || '';
  var pickedBy = e.parameter.pickedBy || '';
  var pickedAt = e.parameter.pickedAt || '';

  // Build column index map
  var colMap = {};
  for (var c = 0; c < headers.length; c++) colMap[headers[c]] = c + 1;

  // Check if row already exists for this draft+slot
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === draft && Number(data[i][colMap['slot'] - 1]) === slot) {
      // Update existing row
      var row = i + 1;
      if (colMap['status']) sheet.getRange(row, colMap['status']).setValue(status);
      if (pick && colMap['pick']) sheet.getRange(row, colMap['pick']).setValue(pick);
      if (pos && colMap['pos']) sheet.getRange(row, colMap['pos']).setValue(pos);
      if (mlbTeam && colMap['mlbTeam']) sheet.getRange(row, colMap['mlbTeam']).setValue(mlbTeam);
      if (drop && colMap['drop']) sheet.getRange(row, colMap['drop']).setValue(drop);
      if (pickedBy && colMap['pickedBy']) sheet.getRange(row, colMap['pickedBy']).setValue(pickedBy);
      if (pickedAt && colMap['pickedAt']) sheet.getRange(row, colMap['pickedAt']).setValue(pickedAt);
      return ContentService.createTextOutput(JSON.stringify({ success: true, updated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Insert new row — build array matching header order
  var newRow = [];
  for (var h = 0; h < headers.length; h++) {
    var key = headers[h];
    if (key === 'draft') newRow.push(draft);
    else if (key === 'slot') newRow.push(slot);
    else if (key === 'status') newRow.push(status);
    else if (key === 'pick') newRow.push(pick);
    else if (key === 'pos') newRow.push(pos);
    else if (key === 'mlbTeam') newRow.push(mlbTeam);
    else if (key === 'drop') newRow.push(drop);
    else if (key === 'pickedBy') newRow.push(pickedBy);
    else if (key === 'pickedAt') newRow.push(pickedAt);
    else newRow.push('');
  }
  sheet.appendRow(newRow);

  return ContentService.createTextOutput(JSON.stringify({ success: true, written: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSetSuppDraftActive(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('suppdraft_active');

  if (!sheet) {
    sheet = ss.insertSheet('suppdraft_active');
    sheet.appendRow(['draft', 'activeSlot', 'startTime']);
  }

  var draft = e.parameter.draft || '';
  var slot = Number(e.parameter.slot) || 0;
  var startTime = e.parameter.startTime || '';

  // Update or insert
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === draft) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(slot);
      sheet.getRange(row, 3).setValue(startTime);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  sheet.appendRow([draft, slot, startTime]);
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleGetSuppDraftActive(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('suppdraft_active');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, active: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, active: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

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

  return ContentService.createTextOutput(JSON.stringify({ success: true, active: active }))
    .setMimeType(ContentService.MimeType.JSON);
}
