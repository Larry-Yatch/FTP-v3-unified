/**
 * 1️⃣ fetchNewResponses()
 * Reads the “Form Responses 1” sheet and returns all rows
 * where the “Processed” column is blank, with each record
 * carrying its 1-based row number in `_rowNumber`.
 */
function fetchNewResponses() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const sheet  = ss.getSheetByName('Form Responses 1');
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const procIdx = headers.indexOf('Processed');
  if (procIdx < 0) throw new Error('Add a “Processed” column to the sheet.');

  const newRecords = [];
  values.forEach((row, i) => {
    if (!row[procIdx]) {
      const rec = mapRowToObject(headers, row);
      rec._rowNumber = i + 2; // account for header row
      newRecords.push(rec);
    }
  });
  Logger.log(`Found ${newRecords.length} new record(s).`);
  return newRecords;
}

/**
 * Helper: turn a header array + row-array into an object.
 */
function mapRowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => obj[h] = row[i]);
  return obj;
}

/**
 * 2️⃣ computeDomainMetrics(record)
 * Fast in-memory version: reads the entire sheet once,
 * then sums slices of the row & computes all metrics.
 */
function computeDomainMetrics(record) {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const sheet   = ss.getSheetByName('Form Responses 1');
  const allData = sheet.getDataRange().getValues();   // [ [hdr...], [r2...], ... ]
  const dataRows= allData.slice(1);                   // skip header
  const rowData = dataRows[record._rowNumber - 2];    // zero-based index

  // Map each domain to either [start,end] or explicit list of cols
  const domainCols = {
    Income:        [6,  7,  8,  9,  55],
    Spending:      [12, 15],
    Debt:          [21, 22, 23, 24, 56],
    EmergencyFund: [28, 31],
    Savings:       [33, 36],
    Investments:   [38, 41],
    Retirement:    [43, 44, 45, 46, 57],
    Insurance:     [48, 51, 52, 53]
  };
  const feltStress = {
    Income:2, Spending:5, Debt:4, EmergencyFund:3,
    Savings:2, Investments:1, Retirement:1, Insurance:1
  };

  // Helper: sum either a range [start,end] or explicit list
  function sumColsInArray(arr, cols) {
    let total = 0;
    if (cols.length === 2) {
      for (let c = cols[0]-1; c <= cols[1]-1; c++) {
        total += Number(arr[c]) || 0;
      }
    } else {
      cols.forEach(c => {
        total += Number(arr[c-1]) || 0;
      });
    }
    return total;
  }

  // 1) Participant’s domain scores
  const scores = {};
  Object.entries(domainCols).forEach(([domain, cols]) => {
    scores[domain] = sumColsInArray(rowData, cols);
  });

  // 2) Compute cohort means on the fly
  const cohortMeans = {};
  Object.entries(domainCols).forEach(([domain, cols]) => {
    let sumAll = 0;
    dataRows.forEach(rArr => sumAll += sumColsInArray(rArr, cols));
    cohortMeans[domain] = sumAll / dataRows.length;
  });

  // 3) Gaps & weighted gaps
  const gaps     = {};
  const weighted = {};
  Object.keys(scores).forEach(d => {
    gaps[d]     = scores[d] - cohortMeans[d];
    weighted[d] = gaps[d] * feltStress[d];
  });

  // 4) Priority buckets
  const sortedDoms = Object.keys(scores)
    .sort((a,b) => weighted[a] - weighted[b]);
  const high   = sortedDoms.slice(0, 2);
  const medium = sortedDoms.slice(2, 5);
  const low    = sortedDoms.slice(5);

  // 5) Focus domain
  const focusDomain = high[0];

  return { scores, cohortMeans, gaps, weighted, priority: { high, medium, low }, focusDomain };
}

/**
 * 3️⃣ updateRowMetrics(record, metrics)
 * Writes computed metrics back to the sheet in columns BK (63) through CU (99).
 */
function updateRowMetrics(record, metrics) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Form Responses 1');
  const row   = record._rowNumber;

  // Ordered fields matching headers BK–CU
  const fields = [
    'Score_Income','Mean_Income','Gap_Income','Weighted_Income',
    'Score_Spending','Mean_Spending','Gap_Spending','Weighted_Spending',
    'Score_Debt','Mean_Debt','Gap_Debt','Weighted_Debt',
    'Score_EmergencyFund','Mean_EmergencyFund','Gap_EmergencyFund','Weighted_EmergencyFund',
    'Score_Savings','Mean_Savings','Gap_Savings','Weighted_Savings',
    'Score_Investments','Mean_Investments','Gap_Investments','Weighted_Investments',
    'Score_Retirement','Mean_Retirement','Gap_Retirement','Weighted_Retirement',
    'Score_Insurance','Mean_Insurance','Gap_Insurance','Weighted_Insurance',
    'Priority_High','Priority_Medium','Priority_Low','FocusDomain','MetricsUpdated'
  ];

  // BK is column 63
  const baseCol = 63;

  fields.forEach((field, idx) => {
    const col = baseCol + idx;
    let value = '';
    if (field.startsWith('Score_')) {
      const domain = field.split('_')[1];
      value = metrics.scores[domain];
    } else if (field.startsWith('Mean_')) {
      const domain = field.split('_')[1];
      value = metrics.cohortMeans[domain];
    } else if (field.startsWith('Gap_')) {
      const domain = field.split('_')[1];
      value = metrics.gaps[domain];
    } else if (field.startsWith('Weighted_')) {
      const domain = field.split('_')[1];
      value = metrics.weighted[domain];
    } else if (field === 'Priority_High') {
      value = metrics.priority.high.join(', ');
    } else if (field === 'Priority_Medium') {
      value = metrics.priority.medium.join(', ');
    } else if (field === 'Priority_Low') {
      value = metrics.priority.low.join(', ');
    } else if (field === 'FocusDomain') {
      value = metrics.focusDomain;
    } else if (field === 'MetricsUpdated') {
      value = new Date();
    }
    sheet.getRange(row, col).setValue(value);
  });
}

/**
 * 4️⃣ testUpdateMetrics()
 * Fetch a new record, compute metrics, update the row, and log completion.
 */
function testUpdateMetrics() {
  const rec = fetchNewResponses()[0];
  if (!rec) {
    Logger.log('No new records to update.');
    return;
  }
  const metrics = computeDomainMetrics(rec);
  updateRowMetrics(rec, metrics);
  Logger.log('Metrics updated for row ' + rec._rowNumber);
}
