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
 * 2️⃣ sumColumnsForDomain()
 * Sums either a contiguous [start,end] range or an explicit list of cols.
 */
function sumColumnsForDomain(sheet, row, cols) {
  let total = 0;
  if (cols.length === 2) {
    // contiguous range
    const [start, end] = cols;
    for (let c = start; c <= end; c++) {
      total += Number(sheet.getRange(row, c).getValue()) || 0;
    }
  } else {
    // explicit list
    cols.forEach(c => {
      total += Number(sheet.getRange(row, c).getValue()) || 0;
    });
  }
  return total;
}


/**
 * 3️⃣ computeDomainMetrics(record)
 * Given a record with `_rowNumber`, computes:
 * • domain sums
 * • cohort means
 * • gaps & stress-weighted gaps
 * • priority buckets
 * • focusDomain (highest-priority)
 */
function computeDomainMetrics(record) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Form Responses 1');
  const row   = record._rowNumber;

  // Define your domains: either [start,end] or explicit lists
  const domainCols = {
    Income:        [6,  7,  8,  9,  55],  // explicit columns
    Spending:      [12, 15],             // contiguous range
    Debt:          [21, 22, 23, 24, 56],
    EmergencyFund: [28, 31],
    Savings:       [33, 36],
    Investments:   [38, 41],
    Retirement:    [43, 44, 45, 46, 57],
    Insurance:     [48, 51, 52, 53]
  };

  // The emotional stress weight for each domain
  const feltStress = {
    Income: 2, Spending: 5, Debt: 4, EmergencyFund: 3,
    Savings: 2, Investments: 1, Retirement: 1, Insurance: 1
  };

  // 1) Sum each domain
  const scores = {};
  Object.entries(domainCols).forEach(([domain, cols]) => {
    scores[domain] = sumColumnsForDomain(sheet, row, cols);
  });

  // 2) Compute cohort means
  const cohortMeans = {};
  Object.entries(domainCols).forEach(([domain, cols]) => {
    const sums = [];
    for (let r = 2; r <= sheet.getLastRow(); r++) {
      sums.push(sumColumnsForDomain(sheet, r, cols));
    }
    cohortMeans[domain] = sums.reduce((a, b) => a + b, 0) / sums.length;
  });

  // 3) Gaps & weighted gaps
  const gaps    = {};
  const weighted= {};
  Object.keys(scores).forEach(d => {
    gaps[d]     = scores[d] - cohortMeans[d];
    weighted[d] = gaps[d] * feltStress[d];
  });

  // 4) Priority buckets
  const domains = Object.keys(scores).sort((a, b) => weighted[a] - weighted[b]);
  const high   = domains.slice(0, 2);
  const medium = domains.slice(2, 5);
  const low    = domains.slice(5);

  // 5) Focus domain
  const focusDomain = high[0];

  return {
    scores,
    cohortMeans,
    gaps,
    weighted,
    priority: { high, medium, low },
    focusDomain
  };
}


/**
 * 4️⃣ testCompute()
 * Glue function to fetch one new record, compute metrics, and log them.
 */
function testCompute() {
  const newRecs = fetchNewResponses();
  if (!newRecs.length) {
    Logger.log('No new records to test.');
    return;
  }
  const rec     = newRecs[0];
  const metrics = computeDomainMetrics(rec);
  Logger.log(metrics);
}
