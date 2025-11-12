// === CONTROL FEAR GPT ANALYSIS FUNCTIONS ===

// === SPENDING DOMAIN ===
function runGPTAnalysisControlFearSpending() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const spendingCols = ColumnMapper.findDomainColumns(sheet, 'Spending');
  const processingCols = ColumnMapper.findProcessingColumns(sheet, 'Spending');
  
  if (!processingCols.analysis) {
    console.error('❌ Could not find Spending analysis columns');
    return;
  }
  
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName: 'Working Sheet',
    startRow: 4,
    inputColumns: [
      spendingCols.scores[0], spendingCols.labels[0],  // Type score & label
      spendingCols.scores[1], spendingCols.labels[1],  // Behavior score & label
      spendingCols.scores[2], spendingCols.labels[2],  // Feeling score & label
      spendingCols.scores[3], spendingCols.labels[3],  // Consequence score & label
      ...spendingCols.openResponses,
      processingCols.quotient
    ].filter(col => col !== null),
    inputLabels: [
      'Spending Guilt Score', 'Spending Guilt Pattern',
      'Impulse Control Score', 'Impulse Control Pattern', 
      'Post-Purchase Emotion Score', 'Post-Purchase Emotion Pattern',
      'Financial Impact Score', 'Financial Impact Pattern',
      'Fear Pattern Story (Open Response)', 'Life Impact Story (Open Response)',
      'Spending Fear Quotient'
    ],
    outputColumns: {
      Analysis: processingCols.analysis,
      Summary: processingCols.summary,
      ReflectionPrompt: processingCols.reflection
    },
    checkColumn: processingCols.analysis,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their relationship with Spending - exploring patterns around guilt, impulse control, and the emotional aftermath of purchases.

Definition:
"Spending Fear/Control" means using spending (either restriction or excess) as a way to manage anxiety, self-worth, or safety - often leading to guilt, deprivation, or financial instability.

Inputs:
1. Spending Guilt Score (0–100; 0 = healthy relationship, 100 = intense guilt/avoidance)
2. Spending Guilt Pattern (description of their belief about deserving spending)
3. Impulse Control Score (0–100; 0 = excellent control, 100 = frequent impulse issues)
4. Impulse Control Pattern (description of their impulse spending habits)
5. Post-Purchase Emotion Score (0–100; 0 = confident/content, 100 = shame/regret)
6. Post-Purchase Emotion Pattern (description of feelings after purchases)
7. Financial Impact Score (0–100; 0 = positive impact, 100 = damages stability)
8. Financial Impact Pattern (description of spending's effect on their financial life)
9. Fear Pattern Story (Open Response): Client describes their strongest spending fear/control pattern and what it protects them from feeling
10. Life Impact Story (Open Response): Client describes how fear-driven spending habits have impacted their life
11. Spending Fear Quotient (Domain Impact) (0–100; 0 = no fear impact, 100 = significant fear impact)

**Use these exact input values—do not invent or swap any numbers or labels.**

Analyze how spending patterns reflect underlying fears around worthiness, security, and control. Look for patterns of deprivation vs. excess, and how both can stem from the same fears.

**CRITICAL**: The Fear Pattern Story and Life Impact Story provide the client's own insights into their patterns. Reference these stories directly in your analysis to ground your recommendations in their specific experiences and self-awareness.

When crafting your three "Suggestions":
1. **Pattern Analysis**: Examine how guilt, impulse control, and emotional aftermath create cycles
2. **Actionable Steps**: Offer concrete practices that address both the fear and the behavior
3. **Integration**: Show how spending patterns connect to overall financial well-being

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:
(2–3 sentences connecting spending patterns to underlying fears; insert a blank line between each sentence.)

Summary:
- Actionable suggestion one
- Actionable suggestion two  
- Actionable suggestion three

ReflectionPrompt:
(One thoughtful question to help explore the relationship between spending and safety/worth.)
`,
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    maxTokens: 900,
    useRAG: true,
    ragTopK: 3,
    gptDelay: 1500
  });
}

// === HIDING MONEY DOMAIN ===
function runGPTAnalysisControlFearHidingMoney() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const hidingCols = ColumnMapper.findDomainColumns(sheet, 'HidingMoney');
  const processingCols = ColumnMapper.findProcessingColumns(sheet, 'HidingMoney');
  const previousAnalysis = ColumnMapper.findProcessingColumns(sheet, 'Spending');
  
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName: 'Working Sheet',
    startRow: 4,
    inputColumns: [
      hidingCols.scores[0], hidingCols.labels[0],  // Type score & label
      hidingCols.scores[1], hidingCols.labels[1],  // Behavior score & label
      hidingCols.scores[2], hidingCols.labels[2],  // Feeling score & label
      hidingCols.scores[3], hidingCols.labels[3],  // Consequence score & label
      ...hidingCols.openResponses,
      processingCols.quotient,
      previousAnalysis.analysis,
      previousAnalysis.summary,
      previousAnalysis.reflection
    ].filter(col => col !== null),
    inputLabels: [
      'Money Hiding Score', 'Money Hiding Pattern',
      'Financial Truth Score', 'Financial Truth Pattern',
      'Transparency Score', 'Transparency Pattern', 
      'Review Emotion Score', 'Review Emotion Pattern',
      'Avoidance Areas Story (Open Response)', 'Life Impact Story (Open Response)',
      'Hiding Money Quotient',
      'Previous Analysis - Spending',
      'Previous Suggestions - Spending',
      'Previous Reflection - Spending'
    ],
    outputColumns: {
      Analysis: processingCols.analysis,
      Summary: processingCols.summary,
      ReflectionPrompt: processingCols.reflection
    },
    checkColumn: processingCols.analysis,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their relationship with Financial Transparency and Hiding Money - exploring patterns of avoidance, scattering resources, and emotional responses to financial truth.

Definition:
"Hiding Money From Ourselves" means deliberately avoiding financial clarity through scattered accounts, avoiding reviews, or keeping ourselves in the dark - often as protection from overwhelming emotions or perceived inadequacy.

Build upon the previous Spending analysis to understand how financial avoidance and spending patterns reinforce each other.

**CRITICAL**: The Avoidance Areas Story reveals what the client specifically avoids and their rationalization. The Life Impact Story shows how this avoidance has affected their life. Reference these stories directly to ground your analysis in their lived experience.

When crafting responses, reference the previous domain insights and build a cohesive narrative about their overall relationship with financial fear and control.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:
(2–3 sentences connecting hiding patterns to fear-based protection; insert a blank line between each sentence.)

Summary:  
- Actionable suggestion one
- Actionable suggestion two
- Actionable suggestion three

ReflectionPrompt:
(One thoughtful question about the relationship between financial truth and safety.)
`,
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    maxTokens: 900,
    useRAG: true,
    ragTopK: 3,
    gptDelay: 1500
  });
}

// === UNDERVALUING WORTH DOMAIN ===
function runGPTAnalysisControlFearUndervaluingWorth() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const worthCols = ColumnMapper.findDomainColumns(sheet, 'UndervaluingWorth');
  const processingCols = ColumnMapper.findProcessingColumns(sheet, 'UndervaluingWorth');
  const previousHiding = ColumnMapper.findProcessingColumns(sheet, 'HidingMoney');
  
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName: 'Working Sheet',
    startRow: 4,
    inputColumns: [
      worthCols.scores[0], worthCols.labels[0],  // Type score & label
      worthCols.scores[1], worthCols.labels[1],  // Behavior score & label
      worthCols.scores[2], worthCols.labels[2],  // Feeling score & label
      worthCols.scores[3], worthCols.labels[3],  // Consequence score & label
      ...worthCols.openResponses,
      processingCols.quotient,
      previousHiding.analysis,
      previousHiding.summary,
      previousHiding.reflection
    ].filter(col => col !== null),
    inputLabels: [
      'Fair Pricing Score', 'Fair Pricing Pattern',
      'Invoicing Reliability Score', 'Invoicing Reliability Pattern',
      'Collection Follow-up Score', 'Collection Follow-up Pattern',
      'Ask for Pay Comfort Score', 'Ask for Pay Comfort Pattern',
      'Unclaimed Money Story (Open Response)', 'Life Impact Story (Open Response)',
      'Undervaluing Worth Quotient', 
      'Previous Analysis - Hiding Money',
      'Previous Suggestions - Hiding Money',
      'Previous Reflection - Hiding Money'
    ],
    outputColumns: {
      Analysis: processingCols.analysis,
      Summary: processingCols.summary,
      ReflectionPrompt: processingCols.reflection
    },
    checkColumn: processingCols.analysis,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their relationship with Undervaluing Worth - exploring patterns around pricing, invoicing, collecting payments, and the internal experience of asking for fair compensation.

Definition:
"Undervaluing Worth" means systematically undercharging, avoiding collections, or feeling unworthy of fair compensation - often rooted in fears around rejection, conflict, or deep beliefs about personal value.

**CRITICAL**: The Unclaimed Money Story reveals where they specifically leave money unclaimed and what fears/beliefs drive this. The Life Impact Story shows how undervaluing has affected their life. Use these specific examples to make your analysis concrete and actionable.

Connect this analysis to their previous patterns with hiding money and spending to build a comprehensive picture of how fear impacts their financial self-advocacy.

When crafting responses, show how undervaluing worth connects to financial avoidance and spending patterns, creating a coherent narrative about their relationship with financial fear and control.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:
(2–3 sentences connecting worth patterns to fear-based protection; insert a blank line between each sentence.)

Summary:
- Actionable suggestion one
- Actionable suggestion two
- Actionable suggestion three

ReflectionPrompt:
(One thoughtful question about the relationship between self-worth and financial value.)
`,
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    maxTokens: 900,
    useRAG: true,
    ragTopK: 3,
    gptDelay: 1500
  });
}

// === MISPLACED TRUST DOMAIN ===
function runGPTAnalysisControlFearMisplacedTrust() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const trustCols = ColumnMapper.findDomainColumns(sheet, 'MisplacedTrust');
  const processingCols = ColumnMapper.findProcessingColumns(sheet, 'MisplacedTrust');
  const previousWorth = ColumnMapper.findProcessingColumns(sheet, 'UndervaluingWorth');
  
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName: 'Working Sheet',
    startRow: 4,
    inputColumns: [
      trustCols.scores[0], trustCols.labels[0],  // Type score & label
      trustCols.scores[1], trustCols.labels[1],  // Behavior score & label
      trustCols.scores[2], trustCols.labels[2],  // Feeling score & label
      trustCols.scores[3], trustCols.labels[3],  // Consequence score & label
      ...trustCols.openResponses,
      processingCols.quotient,
      previousWorth.analysis,
      previousWorth.summary,
      previousWorth.reflection
    ].filter(col => col !== null),
    inputLabels: [
      'Better Judgment Override Score', 'Better Judgment Override Pattern',
      'Research vs Impulse Score', 'Research vs Impulse Pattern',
      'Misplaced Trust Score', 'Misplaced Trust Pattern',
      'Repeat Mistakes Score', 'Repeat Mistakes Pattern',
      'I Knew Better Story (Open Response)', 'Financial Impact Story (Open Response)',
      'Misplaced Trust Quotient',
      'Previous Analysis - Undervaluing Worth',
      'Previous Suggestions - Undervaluing Worth',
      'Previous Reflection - Undervaluing Worth'
    ],
    outputColumns: {
      Analysis: processingCols.analysis,
      Summary: processingCols.summary,
      ReflectionPrompt: processingCols.reflection
    },
    checkColumn: processingCols.analysis,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their relationship with Trusting Their Own Judgment - exploring patterns around ignoring intuition, inadequate research, trusting the wrong people, and repeating financial mistakes.

Definition:
"Misplaced Trust / I Knew Better" means repeatedly overriding your own warning signals and inner wisdom in financial decisions, often leading to predictable losses and the painful recognition that "I knew better."

**CRITICAL**: The "I Knew Better" Story provides a specific example of when they ignored their intuition, including what signals they ignored and what drove them forward despite knowing better. The Financial Impact Story details the actual consequences they experienced. Reference these concrete examples to show how self-trust erosion creates financial vulnerability.

Connect this to their previous patterns with worth, financial transparency, and spending to understand how self-trust issues compound other financial fears.

When crafting responses, show how mistrust of self connects to undervaluing worth and financial avoidance, building toward a comprehensive understanding of their fear-based financial patterns.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:
(2–3 sentences connecting self-trust patterns to underlying fears; insert a blank line between each sentence.)

Summary:
- Actionable suggestion one
- Actionable suggestion two
- Actionable suggestion three

ReflectionPrompt:
(One thoughtful question about trusting inner wisdom in financial decisions.)
`,
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    maxTokens: 900,
    useRAG: true,
    ragTopK: 3,
    gptDelay: 1500
  });
}

// === CONTRACTS & PROTECTIONS DOMAIN ===
function runGPTAnalysisControlFearContractsProtections() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  const contractsCols = ColumnMapper.findDomainColumns(sheet, 'ContractsProtections');
  const processingCols = ColumnMapper.findProcessingColumns(sheet, 'ContractsProtections');
  const previousTrust = ColumnMapper.findProcessingColumns(sheet, 'MisplacedTrust');
  
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName: 'Working Sheet',
    startRow: 4,
    inputColumns: [
      contractsCols.scores[0], contractsCols.labels[0],  // Type score & label
      contractsCols.scores[1], contractsCols.labels[1],  // Behavior score & label
      contractsCols.scores[2], contractsCols.labels[2],  // Feeling score & label
      contractsCols.scores[3], contractsCols.labels[3],  // Consequence score & label
      ...contractsCols.openResponses,
      processingCols.quotient,
      previousTrust.analysis,
      previousTrust.summary,
      previousTrust.reflection
    ].filter(col => col !== null),
    inputLabels: [
      'Contract Usage Score', 'Contract Usage Pattern',
      'Terms Attention Score', 'Terms Attention Pattern',
      'Partner Vetting Score', 'Partner Vetting Pattern',
      'Self Protection Score', 'Self Protection Pattern',
      'Skipped Protection Story (Open Response)', 'Impact Consequences Story (Open Response)',
      'Contracts Protections Quotient',
      'Previous Analysis - Misplaced Trust',
      'Previous Suggestions - Misplaced Trust',
      'Previous Reflection - Misplaced Trust'
    ],
    outputColumns: {
      Analysis: processingCols.analysis,
      Summary: processingCols.summary,
      ReflectionPrompt: processingCols.reflection
    },
    checkColumn: processingCols.analysis,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their relationship with Contracts & Protections - exploring patterns around formal agreements, reading terms carefully, vetting partners, and protecting their own interests in deals.

Definition:
"Contracts & Protections Avoidance" means skipping formal protections, ignoring terms, or failing to vet partners - often due to fears around conflict, appearing untrusting, or believing you don't deserve protection.

**CRITICAL**: The Skipped Protection Story provides a specific experience where they avoided contracts, terms, or vetting, including what beliefs or fears influenced that choice. The Impact Consequences Story details what actually happened to them as a result. Use these concrete examples to show how protection avoidance creates real vulnerability.

This is the final domain analysis. Connect this to all previous patterns (spending, hiding money, undervaluing worth, misplaced trust) to show how protection avoidance completes the cycle of financial vulnerability.

When crafting responses, synthesize insights from all previous domains to show how avoiding protections represents the culmination of fear-based financial patterns.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:
(2–3 sentences connecting protection patterns to the broader fear-control cycle; insert a blank line between each sentence.)

Summary:
- Actionable suggestion one
- Actionable suggestion two
- Actionable suggestion three

ReflectionPrompt:
(One thoughtful question about deserving and creating financial safety.)
`,
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    maxTokens: 900,
    useRAG: true,
    ragTopK: 3,
    gptDelay: 1500
  });
}

// === OVERALL INTEGRATION ===
function runGPTAnalysisControlFearOverall() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
  
  // Find all domain analysis columns
  const domains = ['Spending', 'HidingMoney', 'UndervaluingWorth', 'MisplacedTrust', 'ContractsProtections'];
  const allDomainCols = [];
  const inputLabels = [];
  
  domains.forEach(domain => {
    const cols = ColumnMapper.findProcessingColumns(sheet, domain);
    if (cols.analysis && cols.summary && cols.reflection) {
      allDomainCols.push(cols.analysis, cols.summary, cols.reflection);
      inputLabels.push(
        `${domain} Analysis`,
        `${domain} Suggestions`, 
        `${domain} Reflection`
      );
    }
  });
  
  // Find overall output columns
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  let overallAnalysisCol = null;
  let overallSuggestionsCol = null;
  let overallReflectionCol = null;
  
  headers.forEach((header, index) => {
    if (header && header.includes('Overall')) {
      const colIndex = index + 1;
      if (header.includes('Analysis') && !overallAnalysisCol) overallAnalysisCol = colIndex;
      if (header.includes('Suggestions') && !overallSuggestionsCol) overallSuggestionsCol = colIndex;
      if (header.includes('Reflection') && !overallReflectionCol) overallReflectionCol = colIndex;
    }
  });
  
  if (!overallAnalysisCol) {
    console.error('❌ Could not find Overall analysis columns');
    return;
  }
  
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName: 'Working Sheet',
    startRow: 4,
    inputColumns: allDomainCols,
    inputLabels: inputLabels,
    outputColumns: {
      Analysis: overallAnalysisCol,        // Changed from OverallAnalysis
      Summary: overallSuggestionsCol,      // Changed from OverallSuggestions  
      ReflectionPrompt: overallReflectionCol  // Changed from OverallReflectionPrompt
    },
    checkColumn: overallAnalysisCol,
    systemPrompt: `
You are a financial trauma recovery expert writing a comprehensive overview for a student. You have five domain-level insights that reveal patterns around Financial Fear and Control:

• Spending: Fear-based restriction or impulse patterns around purchases
• Hiding Money From Ourselves: Avoidance of financial truth and clarity  
• Undervaluing Worth: Systematic undercharging and difficulty claiming value
• Misplaced Trust: Overriding intuition and repeating financial mistakes
• Contracts & Protections: Avoiding safeguards in financial agreements

These domains work together to create cycles where fear of financial reality leads to behaviors that create more financial vulnerability.

Use the exact domain analyses provided - do **not** invent, truncate, or alter any text.

Your tasks:
1. Overall Analysis: Craft a single cohesive paragraph weaving together the core themes from all five domain analyses
2. Consolidated Suggestions: Provide 3 bullet points synthesizing the domain suggestions into a unified action plan  
3. Consolidated Reflection Questions: Offer 2 open-ended questions that build on the domain reflection prompts

Return **plain-text only** in exactly these three labeled sections—no JSON, no markdown—and stop:

Analysis:
<A single, integrated paragraph showing how these five patterns create a reinforcing cycle of financial fear and vulnerability>

Summary:
- Bullet one (addresses the core fear driving multiple domains)
- Bullet two (focuses on building financial self-trust and clarity)
- Bullet three (emphasizes protection and boundaries)

ReflectionPrompt:
1. Question about the relationship between control and safety in finances
2. Question about what financial freedom would look like without fear
`,
    model: 'gpt-4o',  // Using better model for overall synthesis
    temperature: 0.2,
    maxTokens: 900,
    useRAG: false,
    ragTopK: 0,
    gptDelay: 1500
  });
}