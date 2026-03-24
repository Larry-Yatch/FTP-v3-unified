/**
 * Test the actual extraction function with problematic cases
 */
function testExtraction(rowNumber = 4) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  console.log(`\n=== TESTING EXTRACTION FOR ROW ${rowNumber} ===\n`);
  
  // Test specific failing cases
  const testCases = [
    {domain: 'Spending', subKey: 'Type', col: 5},
    {domain: 'HidingMoney', subKey: 'Behavior', col: 12},
    {domain: 'UndervaluingWorth', subKey: 'Consequence', col: 20},
    {domain: 'MisplacedTrust', subKey: 'Behavior', col: 24}
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  testCases.forEach(test => {
    const response = rowData[test.col - 1];
    const subIndex = ['Type', 'Behavior', 'Feeling', 'Consequence'].indexOf(test.subKey);
    
    console.log(`\n📍 Testing ${test.domain}_${test.subKey}:`);
    console.log(`Input: "${response}"`);
    
    // Call the actual extraction function
    const result = extractValueAndLabel(response, test.domain, subIndex);
    
    if (result.value !== null) {
      console.log(`✅ SUCCESS - Extracted value: ${result.value}`);
      console.log(`   Label: "${result.label.substring(0, 50)}..."`);
      successCount++;
    } else {
      console.log(`❌ FAILED - Could not extract`);
      console.log(`   Returned: "${result.label}"`);
      failCount++;
    }
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`✅ Successful extractions: ${successCount}`);
  console.log(`❌ Failed extractions: ${failCount}`);
  
  console.log(`\n=== END TEST ===\n`);
}

/**
 * Deep diagnostic to find exact character differences
 */
function deepDiagnostic(rowNumber = 4) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  console.log(`\n=== DEEP DIAGNOSTIC FOR ROW ${rowNumber} ===\n`);
  
  // Test specific failing cases
  const testCases = [
    {domain: 'Spending', subKey: 'Type', col: 5},
    {domain: 'HidingMoney', subKey: 'Behavior', col: 12},
    {domain: 'UndervaluingWorth', subKey: 'Consequence', col: 20}
  ];
  
  testCases.forEach(test => {
    const response = rowData[test.col - 1];
    const domainConfig = CONTROL_FEAR_CONFIG[test.domain];
    const subIndex = ['Type', 'Behavior', 'Feeling', 'Consequence'].indexOf(test.subKey);
    const choices = domainConfig.items[subIndex].choices;
    
    console.log(`\n📍 Testing ${test.domain}_${test.subKey}:`);
    console.log(`Response: "${response}"`);
    
    // Clean the response
    let cleaned = String(response).trim();
    if (cleaned.startsWith("'")) {
      cleaned = cleaned.substring(1).trim();
    }
    
    // Find the choice that should match
    const scoreMatch = cleaned.match(/^([+-]?\d+)/);
    if (scoreMatch) {
      const expectedChoice = choices.find(c => c.startsWith(scoreMatch[1] + ' ='));
      if (expectedChoice) {
        console.log(`Expected: "${expectedChoice}"`);
        console.log(`\nCharacter comparison:`);
        
        const maxLen = Math.max(cleaned.length, expectedChoice.length);
        for (let i = 0; i < maxLen; i++) {
          const respChar = cleaned[i] || '[END]';
          const expChar = expectedChoice[i] || '[END]';
          const respCode = cleaned.charCodeAt(i) || 0;
          const expCode = expectedChoice.charCodeAt(i) || 0;
          
          if (respChar !== expChar) {
            console.log(`Position ${i}: MISMATCH`);
            console.log(`  Response: "${respChar}" (${respCode})`);
            console.log(`  Expected: "${expChar}" (${expCode})`);
            break;
          }
        }
        
        if (cleaned === expectedChoice) {
          console.log('STRINGS MATCH EXACTLY!');
        } else {
          console.log('Strings DO NOT match');
          console.log(`Response length: ${cleaned.length}`);
          console.log(`Expected length: ${expectedChoice.length}`);
        }
      }
    }
  });
  
  console.log(`\n=== END DIAGNOSTIC ===\n`);
}

/**
 * Debug function to analyze extraction failures
 * Run this manually to identify mismatches
 */
function debugExtractionFailures(rowNumber = 4) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  console.log(`\n=== DEBUGGING ROW ${rowNumber} ===\n`);
  
  const domainKeys = Object.keys(CONTROL_FEAR_CONFIG);
  const subKeys = ['Type', 'Behavior', 'Feeling', 'Consequence'];
  
  domainKeys.forEach(domainKey => {
    subKeys.forEach((subKey, subIndex) => {
      const headerKey = `${domainKey}_${subKey}`;
      const colIndex = headers.indexOf(headerKey);
      
      if (colIndex === -1) {
        console.log(`❌ Header not found: ${headerKey}`);
        return;
      }
      
      const response = rowData[colIndex];
      const domain = CONTROL_FEAR_CONFIG[domainKey];
      const choices = domain.items[subIndex].choices;
      
      console.log(`\n📍 Field: ${headerKey} (Column ${colIndex + 1})`);
      console.log(`   Raw response: "${response}"`);
      console.log(`   Response length: ${response ? response.length : 0}`);
      console.log(`   Response type: ${typeof response}`);
      
      if (response && typeof response === 'string') {
        // Check for apostrophe
        if (response.startsWith("'")) {
          console.log(`   ⚠️ Has apostrophe prefix`);
        }
        
        // Show first and last characters with char codes
        console.log(`   First char: "${response[0]}" (code: ${response.charCodeAt(0)})`);
        console.log(`   Last char: "${response[response.length-1]}" (code: ${response.charCodeAt(response.length-1)})`);
        
        // Try to find exact match
        const exactMatch = choices.find(c => response === c);
        if (exactMatch) {
          console.log(`   ✅ Exact match found!`);
        } else {
          // Try with apostrophe removed
          const withoutApostrophe = response.startsWith("'") ? response.substring(1) : response;
          const matchWithoutApostrophe = choices.find(c => withoutApostrophe.trim() === c.trim());
          
          if (matchWithoutApostrophe) {
            console.log(`   ✅ Match found after removing apostrophe`);
          } else {
            console.log(`   ❌ No match found`);
            console.log(`   Expected one of:`);
            choices.forEach((c, i) => {
              console.log(`      ${i+1}. "${c.substring(0, 50)}..."`);
            });
          }
        }
      }
    });
  });
  
  console.log(`\n=== END DEBUG ===\n`);
}

// === CONTROL_FEAR_CONFIG Setup ===
const CONTROL_FEAR_CONFIG = {
  Spending: {
    openResponses: [
      `When you think about your spending, where do you see the strongest pattern of fear or control (depriving yourself, overspending, or second-guessing)? What do you think that behavior is protecting you from feeling?`,
      `What has been the impact on your life by allowing fear or control to impact your spending habits of either overspending or self-depriving?`
    ],
    items: [
      {
        title: 'How much do you believe spending on yourself is "wrong" or undeserved?',
        choices: [
          '-3 = I believe spending on myself is selfish or dangerous; I avoid it even when I need something important.',
          '-2 = I usually feel guilty spending on myself and only allow it in rare situations.',
          '-1 = I sometimes see spending on myself as "wasteful," though I\'m starting to notice that belief.',
          '+1 = I\'m learning that I can spend on myself in small, intentional ways.',
          '+2 = I usually see spending on myself as healthy and deserved, though I check in with my values before I buy.',
          '+3 = I feel fully comfortable spending in ways that support my well-being, without guilt or avoidance.'
        ]
      },
      {
        title: 'How do you handle impulse spending for yourself?',
        choices: [
          '-3 = I frequently overspend on myself impulsively, often chasing short-term comfort at long-term cost.',
          '-2 = I often buy on impulse, and it sometimes disrupts my financial stability.',
          '-1 = I occasionally make unplanned purchases and regret them later.',
          '+1 = I notice my impulses and sometimes pause before buying.',
          '+2 = I usually plan my purchases, with only rare slips into overspending.',
          '+3 = I consistently align my spending with my budget and values; I rarely overspend and feel steady.'
        ]
      },
      {
        title: 'How do you typically feel after making purchases?',
        choices: [
          '-3 = I almost always feel remorse, shame, or fear after spending, regardless of what I bought.',
          '-2 = I often feel uneasy or regretful, even with responsible purchases.',
          '-1 = I sometimes feel conflicted after spending, questioning if it was "too much."',
          '+1 = I occasionally feel peaceful about spending, but still second-guess myself.',
          '+2 = I usually feel satisfied and calm after spending, knowing it fits my plan.',
          '+3 = I feel confident and content, with no lingering shame, because my spending reflects balance and intention.'
        ]
      },
      {
        title: 'What impact does your spending pattern have on your financial life?',
        choices: [
          '-3 = My spending choices regularly damage my stability — I fall into debt, miss bills, or feel trapped.',
          '-2 = My spending often leaves me stressed, short on funds, or scrambling to recover.',
          '-1 = My spending occasionally sets me back or keeps me from saving as I\'d like.',
          '+1 = My spending is starting to stabilize, but I still see patterns that cost me progress.',
          '+2 = My spending mostly supports my goals, with only minor setbacks.',
          '+3 = My spending fully aligns with my financial vision; it builds security, joy, and momentum.'
        ]
      }
    ]
  },
  HidingMoney: {
    openResponses: [
      `What part of your finances do you most avoid looking at, and what story do you tell yourself about why you avoid it?`,
      `What has been the impact on your life by avoiding clarity in your financial world?`
    ],
    items: [
      {
        title: 'How often do you hide or scatter money in ways that make it hard to truly see or use?',
        choices: [
          '-3 = I deliberately hide or squirrel away money (in odd accounts, cash stashes, or untracked places) so I can avoid facing it or feel "safe in scarcity."',
          '-2 = I often tuck money away where I won\'t look at it, and it leaves me confused about what I really have.',
          '-1 = I sometimes scatter or lose track of money, noticing a pattern of keeping myself in the dark.',
          '+1 = I\'m beginning to notice where I hide or misplace money, and I\'m trying to bring it back into view.',
          '+2 = I usually keep my money in clear, visible accounts, with only occasional lapses.',
          '+3 = I consistently keep my money organized and accessible; nothing is hidden from myself, and I can see the full truth of my resources.'
        ]
      },
      {
        title: 'How honest and organized are you about seeing the full truth of your money — where it is, where it goes, and what you really have?',
        choices: [
          '-3 = I avoid looking and often hide or scatter money in ways that keep me in the dark; I feel safer not knowing or living in scarcity.',
          '-2 = I rarely check my accounts or spending; I often feel anxious, surprised, or ashamed when I do.',
          '-1 = I sometimes track or look, but I delay, miss details, or only review when I fear something\'s wrong.',
          '+1 = I\'m starting to check in more, noticing some patterns, but it still feels uncomfortable or irregular.',
          '+2 = I usually know where my money is and where it goes, even if I don\'t track every detail.',
          '+3 = I consistently see the full picture — accounts, balances, and flow — with clarity and calm; nothing is hidden or lost.'
        ]
      },
      {
        title: 'How open are you with yourself (and, if applicable, your partner) about financial facts?',
        choices: [
          '-3 = I actively hide or conceal major information about money from myself or others.',
          '-2 = I often downplay, delay, or keep parts of the truth hidden.',
          '-1 = I sometimes soften details or avoid full transparency.',
          '+1 = I\'m beginning to share and face more of the facts, though it still feels vulnerable.',
          '+2 = I\'m usually open and willing to address the numbers honestly.',
          '+3 = I am fully transparent and accountable with myself and others; honesty feels freeing.'
        ]
      },
      {
        title: 'How do you respond emotionally when it\'s time to review financial details (bills, statements, balances)?',
        choices: [
          '-3 = I feel intense dread, shame, or panic and avoid it entirely.',
          '-2 = I often feel heavy, anxious, or frozen when reviewing money.',
          '-1 = I sometimes feel unsettled but push myself through.',
          '+1 = I feel some discomfort but I\'m beginning to face it more calmly.',
          '+2 = I usually feel steady and capable, even if it\'s not enjoyable.',
          '+3 = I feel confident and empowered reviewing financial details; it grounds me.'
        ]
      }
    ]
  },
  UndervaluingWorth: {
    openResponses: [
      `Where in your life or work do you leave the most money unclaimed — and what fear or belief keeps you from collecting it?`,
      `What has been the impact on your life by not knowing your worth?`
    ],
    items: [
      {
        title: 'How confident are you in charging fairly for the value of your work or time?',
        choices: [
          '-3 = I rarely ask to be paid fairly; I feel unworthy and often give away my work.',
          '-2 = I usually undercharge or discount heavily to be liked or avoid rejection.',
          '-1 = I sometimes undervalue myself but I\'m starting to question it.',
          '+1 = I\'m learning to raise my prices or set clearer boundaries, even if it feels uncomfortable.',
          '+2 = I usually charge fairly and speak about my value with growing confidence.',
          '+3 = I consistently charge appropriately and feel secure in the worth of what I offer.'
        ]
      },
      {
        title: 'How reliable are you with invoicing and collecting what you\'re owed?',
        choices: [
          '-3 = I often avoid invoicing or following up; money regularly goes uncollected.',
          '-2 = I frequently delay invoicing or reminders, letting payments linger.',
          '-1 = I sometimes hesitate to invoice promptly or follow through.',
          '+1 = I\'m getting better at sending invoices on time and reminding when needed.',
          '+2 = I usually invoice promptly and follow up with confidence.',
          '+3 = I consistently invoice and collect with clear systems; money flows smoothly to me.'
        ]
      },
      {
        title: 'How much do you allow others — whether personally (friends, family, informal loans) or professionally (clients, customers, employers) — to owe you money without resolving it?',
        choices: [
          '-3 = I often let people owe me large sums without follow-up; it piles up and I carry resentment or stress.',
          '-2 = I frequently leave balances outstanding, hoping they\'ll pay eventually.',
          '-1 = I sometimes let people delay repayment, even when it feels uncomfortable.',
          '+1 = I\'m beginning to follow up more quickly and shorten how long I wait.',
          '+2 = I usually don\'t let debts linger; I resolve them in a timely way.',
          '+3 = I rarely live with outstanding receivables; I follow up consistently and feel clear.'
        ]
      },
      {
        title: 'How do you feel internally when asking for fair pay?',
        choices: [
          '-3 = I feel deep shame, fear, or unworthiness when I ask for compensation.',
          '-2 = I often feel anxious or apologetic, like I\'m asking for too much.',
          '-1 = I sometimes feel uneasy, though I\'m beginning to practice.',
          '+1 = I feel some nerves but I\'m starting to see my value.',
          '+2 = I usually feel solid and speak about money with calm assurance.',
          '+3 = I feel grounded, clear, and unapologetic asking for what I\'m worth.'
        ]
      }
    ]
  },
  MisplacedTrust: {
    openResponses: [
      `Tell me about a time you thought "I knew better" but went ahead anyway. What signals did you ignore, and what pulled you forward?`,
      `What has been the financial impact of trusting when you should not have?`
    ],
    items: [
      {
        title: 'How often do you act against your own better judgment in money decisions?',
        choices: [
          '-3 = I regularly ignore my own warning signs and make choices I later regret.',
          '-2 = I often go against my gut, hoping it will work out.',
          '-1 = I sometimes override my judgment, though I notice it more now.',
          '+1 = I\'m beginning to pause before acting on shaky decisions.',
          '+2 = I usually trust my instincts and make thoughtful choices.',
          '+3 = I consistently honor my judgment, blending intuition and research.'
        ]
      },
      {
        title: 'How do you balance advice, research, and gut instinct before taking action?',
        choices: [
          '-3 = I habitually chase hype, long shots, or others\' opinions without research.',
          '-2 = I often skip research and jump quickly into risky choices.',
          '-1 = I sometimes act on impulse, though I notice when I do.',
          '+1 = I\'m learning to slow down and gather more information before deciding.',
          '+2 = I usually blend advice, facts, and my gut into solid decisions.',
          '+3 = I thoroughly research, reflect, and trust my gut; I feel aligned with my choices.'
        ]
      },
      {
        title: 'How often do you place financial trust in people you sense you shouldn\'t?',
        choices: [
          '-3 = I repeatedly trust people who are unreliable or self-interested, even when red flags are obvious, and I get hurt financially.',
          '-2 = I often ignore my doubts and give trust too quickly, hoping things will work out.',
          '-1 = I sometimes put trust in the wrong people, though I notice the pattern more now.',
          '+1 = I\'m beginning to pause and question before extending trust, even if it feels awkward.',
          '+2 = I usually trust people carefully, checking alignment before committing.',
          '+3 = I consistently choose trustworthy partners and protect myself from misplaced trust; my gut and research guide me well.'
        ]
      },
      {
        title: 'How often do you repeat financial mistakes after telling yourself you wouldn\'t?',
        choices: [
          '-3 = I am stuck in a loop, making the same damaging mistakes again and again.',
          '-2 = I frequently repeat patterns and rationalize them.',
          '-1 = I sometimes repeat mistakes but notice it sooner than before.',
          '+1 = I occasionally slip, but I\'m beginning to learn and correct faster.',
          '+2 = I rarely repeat mistakes; I capture lessons and apply them.',
          '+3 = I consistently learn from experience and build systems to prevent repeats.'
        ]
      }
    ]
  },
  ContractsProtections: {
    openResponses: [
      `Share an experience where you skipped protections (like a contract, clear terms, or vetting). What belief or fear influenced that choice?`,
      `What was the impact of not protecting yourself in these deals?`
    ],
    items: [
      {
        title: 'How often do you use written agreements or contracts in financial or business exchanges?',
        choices: [
          '-3 = I never use contracts; I rely only on trust or assumptions.',
          '-2 = I rarely use contracts and avoid "formalizing" deals.',
          '-1 = I sometimes skip contracts or settle for vague agreements.',
          '+1 = I\'m starting to use contracts more regularly, though it still feels awkward.',
          '+2 = I usually put things in writing and feel safer doing so.',
          '+3 = I always use clear contracts appropriate to the deal; it protects everyone involved.'
        ]
      },
      {
        title: 'How much attention do you give to terms, fine print, and protections in deals?',
        choices: [
          '-3 = I routinely sign without reading or understanding terms.',
          '-2 = I often skim or ignore the details, assuming it will be fine.',
          '-1 = I sometimes overlook parts of the fine print.',
          '+1 = I\'m starting to ask questions and read more carefully.',
          '+2 = I usually review and negotiate to ensure fairness.',
          '+3 = I consistently read, understand, and negotiate terms; I feel confident in my protections.'
        ]
      },
      {
        title: 'How carefully do you choose the people you work with or trust in financial matters?',
        choices: [
          '-3 = I am drawn to unreliable or exploitative people and often get hurt.',
          '-2 = I frequently partner with people who don\'t care for my interests.',
          '-1 = I sometimes skip vetting and later regret it.',
          '+1 = I\'m beginning to pause and assess fit before saying yes.',
          '+2 = I usually vet partners and avoid misaligned relationships.',
          '+3 = I consistently choose trustworthy, aligned people who protect mutual interests.'
        ]
      },
      {
        title: 'How well do you protect your own needs in a deal (boundaries, payment, recourse)?',
        choices: [
          '-3 = I regularly sacrifice my needs, avoiding protections to keep peace.',
          '-2 = I often accept vague or risky terms, hoping for the best.',
          '-1 = I sometimes overlook details that would protect me.',
          '+1 = I\'m learning to include clearer protections, even if it feels uncomfortable.',
          '+2 = I usually secure fair terms that respect both sides.',
          '+3 = I consistently set boundaries, secure protections, and ensure deals work for me.'
        ]
      }
    ]
  }
};

// === DYNAMIC COLUMN DETECTION UTILITIES ===
const ColumnMapper = {
  
  findDomainColumns: function(sheet, domainName) {
    const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    const domainColumns = {
      scores: [],
      labels: [],
      openResponses: []
    };
    
    headers.forEach((header, index) => {
      if (header && header.includes && header.includes(domainName)) {
        const colIndex = index + 1;
        // For GPT analysis, we need the EXTRACTED columns (35+), not raw form columns
        // Score columns have _Score suffix
        if (header.includes('_Score')) {
          domainColumns.scores.push(colIndex);
        } 
        // Label columns have _Label suffix
        else if (header.includes('_Label')) {
          domainColumns.labels.push(colIndex);
        } 
        // Open responses are in columns 5-34
        else if (header.includes('_OpenResponse')) {
          domainColumns.openResponses.push(colIndex);
        }
      }
    });
    
    return domainColumns;
  },
  
  findProcessingColumns: function(sheet, domainName) {
    const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
    let quotientCol = null;
    let analysisCol = null;
    let summaryCol = null;
    let reflectionCol = null;
    
    headers.forEach((header, index) => {
      if (header && header.includes && header.includes(domainName)) {
        const colIndex = index + 1;
        if (header.includes('Quotient')) quotientCol = colIndex;
        if (header.includes('Analysis')) analysisCol = colIndex;
        if (header.includes('Summary')) summaryCol = colIndex;
        if (header.includes('ReflectionPrompt')) reflectionCol = colIndex;
      }
    });
    
    return {
      quotient: quotientCol,
      analysis: analysisCol,
      summary: summaryCol,
      reflection: reflectionCol
    };
  }
};

// === MAIN PROCESSING FUNCTIONS ===

function runSTEP1ControlFearPreprocessingPipeline() {
  console.log("▶️ Starting Control Fear Preprocessing Pipeline...");
  
  processUnprocessedControlFearResponses();
  normalizeControlFearResponseScores();
  computeControlFearQuotients();
  
  console.log("✅ Control Fear Preprocessing Pipeline complete.");
}

function processUnprocessedControlFearResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();
  
  console.log("✅ Headers from row 2:", headers.join(" | "));
  
  // Find the first processing column (we'll look for the first '_Score' column)
  let firstProcessingCol = null;
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] && headers[i].includes('_Score')) {
      firstProcessingCol = i + 1;
      break;
    }
  }
  
  if (!firstProcessingCol) {
    console.error("❌ Could not find processing columns. Make sure headers contain '_Score' columns starting at column 35");
    return;
  }
  
  for (let rowIndex = 4; rowIndex <= lastRow; rowIndex++) {
    const alreadyProcessed = sheet.getRange(rowIndex, firstProcessingCol).getValue();
    if (alreadyProcessed !== '') continue;
    
    const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    const writeData = [];
    let failedExtractions = [];
    
    const domainKeys = Object.keys(CONTROL_FEAR_CONFIG);
    const subKeys = ['Type', 'Behavior', 'Feeling', 'Consequence'];
    
    domainKeys.forEach(domainKey => {
      // Process ONLY the 4 scale questions - extract score and label
      subKeys.forEach((subKey, subIndex) => {
        const headerKey = `${domainKey}_${subKey}`;
        const colIndex = headers.indexOf(headerKey);
        
        if (colIndex === -1) {
          console.warn(`⚠️ Header not found: ${headerKey}`);
          writeData.push(null, null);
          return;
        }
        
        const response = rowData[colIndex] || '';
        const parsed = extractValueAndLabel(response, domainKey, subIndex);
        
        // Track failed extractions
        if (parsed.value === null && response) {
          failedExtractions.push({
            field: headerKey,
            column: colIndex + 1,
            response: String(response).substring(0, 100)
          });
        }
        
        writeData.push(parsed.value, parsed.label);
      });
      
      // Open responses stay in columns 5-34, NOT copied to extracted section
    });
    
    // Report any failed extractions for this row
    if (failedExtractions.length > 0) {
      console.log(`⚠️ Row ${rowIndex}: Failed to extract ${failedExtractions.length} fields:`);
      failedExtractions.forEach(f => {
        console.log(`   - ${f.field} (col ${f.column}): "${f.response}..."`);
      });
    }
    
    console.log(`Row ${rowIndex}: Writing ${writeData.length} values starting at column ${firstProcessingCol}`);
    
    // Write to the first available processing column
    if (writeData.length > 0) {
      sheet.getRange(rowIndex, firstProcessingCol, 1, writeData.length).setValues([writeData]);
      console.log(`✅ Processed row ${rowIndex}`);
    }
  }
}

function extractValueAndLabel(responseText, domainKey, subIndex) {
  const domain = CONTROL_FEAR_CONFIG[domainKey];
  const choices = domain.items[subIndex].choices;
  
  // Handle null/undefined/empty responses
  if (!responseText) {
    return {
      value: null,
      label: '(blank)'
    };
  }
  
  // Convert to string and trim
  let cleanedResponse = String(responseText).trim();
  
  // Strip leading apostrophe if present (added by cleanFormData to prevent formula errors)
  // This handles BOTH positive and negative numbers that got apostrophe prefix
  if (cleanedResponse.startsWith("'")) {
    cleanedResponse = cleanedResponse.substring(1).trim();
  }
  
  // IMPORTANT: The issue is that form responses have smart quotes but config has regular quotes
  // Normalize both the response and choices to use standard characters
  const normalizeText = (text) => {
    // Use String.fromCharCode to ensure we're matching the exact characters
    const rightSingleQuote = String.fromCharCode(8217); // '
    const leftSingleQuote = String.fromCharCode(8216);  // '
    const rightDoubleQuote = String.fromCharCode(8221); // "
    const leftDoubleQuote = String.fromCharCode(8220);  // "
    
    return text
      .replace(new RegExp(rightSingleQuote, 'g'), "'")
      .replace(new RegExp(leftSingleQuote, 'g'), "'")
      .replace(new RegExp(rightDoubleQuote, 'g'), '"')
      .replace(new RegExp(leftDoubleQuote, 'g'), '"')
      .trim();
  };
  
  cleanedResponse = normalizeText(cleanedResponse);
  
  // Try exact match with all choices (normalize them too)
  const found = choices.find(c => normalizeText(c) === cleanedResponse);
  
  if (!found) {
    // Log the failure for debugging with more detail
    console.log(`Failed extraction for ${domainKey}_${subIndex === 0 ? 'Type' : subIndex === 1 ? 'Behavior' : subIndex === 2 ? 'Feeling' : 'Consequence'}`);
    console.log(`  Response: "${cleanedResponse.substring(0, 80)}..."`);
    console.log(`  Response length: ${cleanedResponse.length}`);
    
    // Try to find closest match for debugging
    const scoreMatch = cleanedResponse.match(/^([+-]?\d+)/);
    if (scoreMatch) {
      const possibleMatches = choices.filter(c => normalizeText(c).startsWith(scoreMatch[1] + ' ='));
      if (possibleMatches.length > 0) {
        const expected = normalizeText(possibleMatches[0]);
        console.log(`  Expected: "${expected.substring(0, 80)}..."`);
        console.log(`  Expected length: ${expected.length}`);
        
        // Character-by-character comparison for first difference
        for (let i = 0; i < Math.min(cleanedResponse.length, expected.length); i++) {
          if (cleanedResponse[i] !== expected[i]) {
            console.log(`  First difference at position ${i}:`);
            console.log(`    Response char: "${cleanedResponse[i]}" (code: ${cleanedResponse.charCodeAt(i)})`);
            console.log(`    Expected char: "${expected[i]}" (code: ${expected.charCodeAt(i)})`);
            break;
          }
        }
      }
    }
    
    return {
      value: null,
      label: cleanedResponse || '(unmatched)'
    };
  }
  
  // Split on " = " to get value and label
  const splitIndex = found.indexOf(' = ');
  if (splitIndex === -1) {
    return {
      value: null,
      label: found
    };
  }
  
  const valueStr = found.substring(0, splitIndex);
  const label = found.substring(splitIndex + 3);
  
  return {
    value: parseInt(valueStr.trim(), 10),
    label: label.trim()
  };
}

function normalizeControlFearResponseScores() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Working Sheet");
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Find the range of processing columns dynamically
  let startCol = null;
  let endCol = null;
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (header && header.includes('_Type') && startCol === null) {
      startCol = i + 1;
    }
    if (header && header.includes('_Consequence') && startCol !== null) {
      endCol = i + 2; // Include the label column after Consequence
    }
  }
  
  if (startCol && endCol) {
    FinancialTruPathFunctionLibrary.convertScaleValuesRange(
      "Working Sheet",
      3,                  // Number of header rows
      4,                  // First row of real data
      sheet.getLastRow(), // Last row of real data
      startCol,           // Dynamic start column
      endCol              // Dynamic end column
    );
    console.log(`✅ Control Fear response scores normalized to 0-100 scale (columns ${startCol} to ${endCol}).`);
  } else {
    console.error("❌ Could not find processing column range for normalization");
  }
}

function computeControlFearQuotients() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Working Sheet");
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const domainKeys = [
    'Spending',
    'HidingMoney', 
    'UndervaluingWorth',
    'MisplacedTrust',
    'ContractsProtections'
  ];
  
  // Build domain column map dynamically - look for the EXTRACTED score columns
  const domainColumnMap = {};
  domainKeys.forEach(domain => {
    const scoreColumns = [];
    // Look for the extracted score columns with pattern: {Domain}_{Type}_Score
    const patterns = ['_Type_Score', '_Behavior_Score', '_Feeling_Score', '_Consequence_Score'];
    
    patterns.forEach(pattern => {
      const columnName = domain + pattern;
      const colIndex = headers.findIndex(h => h === columnName);
      if (colIndex >= 0) {
        scoreColumns.push(colIndex + 1); // Convert to 1-based index
      }
    });
    
    if (scoreColumns.length === 4) {
      domainColumnMap[domain] = scoreColumns;
      console.log(`Found score columns for ${domain}:`, scoreColumns);
    } else {
      console.warn(`⚠️ Expected 4 score columns for ${domain}, found ${scoreColumns.length}`);
    }
  });
  
  for (let row = 4; row <= lastRow; row++) {
    // Find quotient output columns dynamically
    let quotientStartCol = null;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] && headers[i].includes('Quotient') && headers[i].includes('Spending')) {
        quotientStartCol = i + 1;
        break;
      }
    }
    
    if (!quotientStartCol) continue;
    
    // Skip if any value exists in output columns
    const existingOutputs = sheet.getRange(row, quotientStartCol, 1, 8).getValues()[0];
    const hasOutput = existingOutputs.some(v => v !== "" && v !== null);
    if (hasOutput) {
      console.log(`⏭️ Row ${row} – Skipped (already has output)`);
      continue;
    }
    
    // Skip rows where the first domain score is empty
    const firstDomainCols = domainColumnMap[domainKeys[0]];
    if (!firstDomainCols || firstDomainCols.length === 0) continue;
    
    const firstScore = sheet.getRange(row, firstDomainCols[0]).getValue();
    if (firstScore === "" || isNaN(firstScore)) continue;
    
    let domainQuotients = {};
    let lowestDomain = null;
    let highestImpactScore = -Infinity;
    let totalImpact = 0;
    let validDomainCount = 0;
    
    domainKeys.forEach(domain => {
      const cols = domainColumnMap[domain];
      if (!cols || cols.length === 0) return;
      
      const scores = cols.map(col => {
        const v = sheet.getRange(row, col).getValue();
        const num = Number(v);
        return isNaN(num) ? null : num;
      }).filter(n => n !== null);
      
      const avg = scores.length
        ? scores.reduce((sum, x) => sum + x, 0) / scores.length
        : null;
      
      domainQuotients[domain] = avg;
      if (avg !== null) {
        totalImpact += avg;
        validDomainCount++;
        if (avg > highestImpactScore) {
          highestImpactScore = avg;
          lowestDomain = domain;
        }
      }
    });
    
    const overallImpact = validDomainCount > 0 ? totalImpact / validDomainCount : null;
    
    const output = [
      domainQuotients.Spending,
      domainQuotients.HidingMoney,
      domainQuotients.UndervaluingWorth,
      domainQuotients.MisplacedTrust,
      domainQuotients.ContractsProtections,
      overallImpact,
      lowestDomain,
      highestImpactScore
    ];
    
    sheet.getRange(row, quotientStartCol, 1, output.length).setValues([output]);
    console.log(`✅ Row ${row} – Quotients updated (higher = more fear/control impact)`);
  }
}

// =============================================================================
// REPORT GENERATION CONFIGURATION
// =============================================================================

/**
 * Generate Control Fear Assessment reports (Google Docs)
 */
function generateControlFearReports() {
  const configDocs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: 4, // Start from row 4 (after headers in rows 1-3)
    nameColumn: 2, // Column B: Name_Full
    docUrlColumn: 101, // Column CW: Doc_URL
    docCreatedAtCol: 102, // Column CX: Doc_Created_At
    templateDocId: '11dv4K8Ot9W7VjPjxw9vjSPnwn84_uMdv2zA57Wxd7kk',
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN'
  };
  
  console.log('🔄 Generating Control Fear Assessment reports...');
  generateControlFearDocs(configDocs);
  console.log('✅ Control Fear Assessment reports generated');
}

/**
 * Generate and email Control Fear Assessment PDFs
 */
function generateAndEmailControlFearPDFs() {
  const configPdfs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: 4,
    nameColumn: 2, // Column B: Name_Full
    emailColumn: 3, // Column C: Email
    docUrlColumn: 101, // Column CW: Doc_URL
    pdfUrlColumn: 103, // Column CY: PDF_URL
    pdfSentAtCol: 104, // Column CZ: PDF_Sent_At
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN',
    emailTemplate: {
      subject: 'Your Control Fear Grounding Assessment Report',
      body: `Hi {{FirstName}},\n\n` +
        `Thank you for completing the Control Fear Grounding Assessment.\n\n` +
        `Your personalized report is attached as a PDF. This report explores your patterns around financial fear and control across five key domains:\n\n` +
        `• Spending - How guilt and impulse affect your purchases\n` +
        `• Hiding Money - Your relationship with financial transparency\n` +
        `• Undervaluing Worth - Patterns around pricing and collecting payment\n` +
        `• Misplaced Trust - How you honor or override your intuition\n` +
        `• Contracts & Protections - Your approach to financial safeguards\n\n` +
        `Take time to review your insights and reflection questions. Remember, awareness is the first step toward transformation.\n\n` +
        `If you have any questions, please reach out to Sarah@TruPathMastery.com\n\n` +
        `Here's to your financial freedom!\n` +
        `The TruPath Team`
    }
  };
  
  console.log('🔄 Generating and emailing Control Fear Assessment PDFs...');
  exportAndEmailControlFearPdfs(configPdfs);
  console.log('✅ Control Fear Assessment PDFs generated and emailed');
}

/**
 * Complete report generation workflow: Docs → PDFs → Email
 */
function generateCompleteControlFearReports() {
  const configDocs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: 4,
    nameColumn: 2, // Column B: Name_Full
    docUrlColumn: 101, // Column CW: Doc_URL
    docCreatedAtCol: 102, // Column CX: Doc_Created_At
    templateDocId: '11dv4K8Ot9W7VjPjxw9vjSPnwn84_uMdv2zA57Wxd7kk',
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN'
  };
  
  const configPdfs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: 4,
    nameColumn: 2, // Column B: Name_Full
    emailColumn: 3, // Column C: Email
    docUrlColumn: 101, // Column CW: Doc_URL
    pdfUrlColumn: 103, // Column CY: PDF_URL
    pdfSentAtCol: 104, // Column CZ: PDF_Sent_At
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN',
    emailTemplate: {
      subject: 'Your Control Fear Grounding Assessment Report',
      body: `Hi {{FirstName}},\n\n` +
        `Thank you for completing the Control Fear Grounding Assessment.\n\n` +
        `Your personalized report is attached as a PDF. This report explores your patterns around financial fear and control across five key domains:\n\n` +
        `• Spending - How guilt and impulse affect your purchases\n` +
        `• Hiding Money - Your relationship with financial transparency\n` +
        `• Undervaluing Worth - Patterns around pricing and collecting payment\n` +
        `• Misplaced Trust - How you honor or override your intuition\n` +
        `• Contracts & Protections - Your approach to financial safeguards\n\n` +
        `Take time to review your insights and reflection questions. Remember, awareness is the first step toward transformation.\n\n` +
        `If you have any questions, please reach out to Sarah@TruPathMastery.com\n\n` +
        `Here's to your financial freedom!\n` +
        `The TruPath Team`
    }
  };
  
  console.log('🔄 Running complete Control Fear Assessment report workflow...');
  generateThenSendControlFearReports(configDocs, configPdfs);
  console.log('✅ Complete Control Fear Assessment workflow finished');
}

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTROL_FEAR_CONFIG, ColumnMapper };
}