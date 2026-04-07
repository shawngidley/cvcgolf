var XLSX = require('xlsx');
var fs = require('fs');
var path = require('path');

var xlsxPath = path.join(__dirname, 'mlb-top-prospects.xlsx');
var jsonPath = path.join(__dirname, 'mlb-top-prospects.json');

if (!fs.existsSync(xlsxPath)) {
  console.log('No mlb-top-prospects.xlsx found, skipping conversion.');
  process.exit(0);
}

var wb = XLSX.readFile(xlsxPath);
var ws = wb.Sheets[wb.SheetNames[0]];
var data = XLSX.utils.sheet_to_json(ws);

// Name overrides: MLB Pipeline name -> CVC roster name
var NAME_FIXES = {
  'Leo De Vries': 'Leodalis De Vries'
};
data.forEach(function(r) {
  if (r.Prospect && NAME_FIXES[r.Prospect]) r.Prospect = NAME_FIXES[r.Prospect];
});

fs.writeFileSync(jsonPath, JSON.stringify(data));
console.log('Converted ' + data.length + ' prospects to mlb-top-prospects.json');
