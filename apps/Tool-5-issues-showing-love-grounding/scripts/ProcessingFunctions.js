// === ISL_CONFIG Setup ===
const ISL_CONFIG = {
  Suffering: {
    reflection: `What’s something you take on that isn’t fully yours to carry — financially or emotionally?
What do you think would happen if you didn’t take it on?
(Reply with NA if this does not apply to you at all)`,
    items: [
      {
        title: 'Describe how much you believe suffering is necessary to show love or be a good person.',
        choices: [
          '-3 = I believe suffering proves my love—if I’m not hurting, I’m not doing enough.',
          '-2 = I often think love requires some form of pain or sacrifice.',
          '-1 = I tend to equate caring with carrying too much, but I’m starting to notice it.',
          '1 = I’m exploring the idea that love doesn’t require me to hurt.',
          '2 = I believe love can exist without self-inflicted pain or depletion.',
          '3 = I feel deeply connected to others without tying it to suffering.'
        ]
      },
      {
        title: 'Describe how likely you are to take on the financial stress or burdens of people you care about.',
        choices: [
          '-3 = I take on others’ financial problems without hesitation, even if it puts me at risk.',
          '-2 = I frequently absorb other people’s money stress out of guilt or habit.',
          '-1 = I sometimes pay for or carry things that aren’t mine, even when I can’t afford it.',
          '1 = I’m starting to set limits on how much I take on for others.',
          '2 = I offer support with boundaries—I don’t carry what isn’t mine.',
          '3 = I let people hold their own responsibilities while staying emotionally available.'
        ]
      },
      {
        title: 'Describe how it feels when you take on financial or emotional burdens for others.',
        choices: [
          '-3 = I feel crushed and silently resentful, but I can’t stop.',
          '-2 = I often feel heavy, drained, and alone in carrying too much.',
          '-1 = I feel tired and overloaded, but I tell myself it’s part of caring.',
          '1 = I’ve started noticing when helping feels too heavy.',
          '2 = I usually feel calm and grounded because I know my limits.',
          '3 = I feel emotionally light and financially steady—I help from overflow, not obligation.'
        ]
      },
      {
        title: 'Describe the impact this has had on your financial life or long-term well-being.',
        choices: [
          '-3 = I’m in serious debt or instability because I keep rescuing others.',
          '-2 = I frequently struggle financially from taking on too much for others.',
          '-1 = I’ve made poor financial choices trying to help people I love.',
          '1 = I’m learning to pause before sacrificing my stability.',
          '2 = I can support others without harming my own financial future.',
          '3 = I protect my resources wisely and only give when it’s sustainable for me.'
        ]
      }
    ]
  },
  Sacrificing: {
    reflection: `Where are you giving more than you can afford to — time, money, energy, or attention?
What do you fear might happen if you stopped?
(Reply with NA if this does not apply to you at all)`,
    items: [
      {
        title: 'Describe how much you believe that sacrificing yourself is necessary to show love or be good.',
        choices: [
          '-3 = I believe love only counts if it costs me something—my time, health, or well-being.',
          '-2 = I often feel like being a good person means putting myself last.',
          '-1 = I tend to give more than I should and question whether that’s actually love.',
          '1 = I’m learning that love doesn’t require me to abandon myself.',
          '2 = I believe I can care deeply without sacrificing my energy or identity.',
          '3 = I show up with love and presence while honoring my limits and well-being.'
        ]
      },
      {
        title: 'Describe how much you tend to take responsibility for rescuing or fixing others, even at your own expense.',
        choices: [
          '-3 = I put the needs of others people before mine even when it is destroying me physically or emotionally.',
          '-2 = I often help others at a cost to my time, health, or finances.',
          '-1 = I give too much, but I’m trying to pull back when it hurts.',
          '1 = I’m becoming aware of the tradeoffs and learning to choose differently.',
          '2 = I support others in ways that don’t harm me or make me disappear.',
          '3 = I honor my limits, offer what’s sustainable, and trust people to rise on their own.'
        ]
      },
      {
        title: 'Describe how it feels when you sacrifice for others beyond your capacity.',
        choices: [
          '-3 = I feel empty, invisible, and angry—even if I hide it.',
          '-2 = I feel drained, resentful, and like I’ve lost myself.',
          '-1 = I feel tired and unappreciated, but unsure how to stop.',
          '1 = I’m starting to recognize when giving turns into depletion.',
          '2 = I feel stronger when I respect my energy and needs.',
          '3 = I feel alive and whole because I give from alignment, not obligation.'
        ]
      },
      {
        title: 'Describe how your tendency to sacrifice impacts your health, energy, or ability to care for yourself.',
        choices: [
          '-3 = I regularly burn out, get sick, or neglect myself from overgiving.',
          '-2 = My health and energy often suffer because I put others first.',
          '-1 = I know I’m wearing myself down but haven’t found a better way yet.',
          '1 = I’m starting to set limits that protect my well-being.',
          '2 = I maintain my health and energy while supporting others.',
          '3 = I prioritize my vitality as a foundation for sustainable love and service.'
        ]
      }
    ]
  },
  Obligation: {
    reflection: `Who do you feel responsible for right now, even if they didn’t ask you to be?
What do you think that responsibility says about you?
(Reply with NA if this does not apply to you at all)`,
    items: [
      {
        title: 'Describe how often you feel emotionally or financially indebted to people who help or care for you.',
        choices: [
          '-3 = I constantly feel I owe people and must repay through overgiving.',
          '-2 = I often feel guilty receiving without giving something back.',
          '-1 = I sometimes feel obligated, but I’m starting to question that pattern.',
          '1 = I’m learning to receive support without guilt.',
          '2 = I can receive freely and respond with choice, not obligation.',
          '3 = I receive with gratitude and no longer tie love to repayment.'
        ]
      },
      {
        title: 'Describe how likely you are to take on responsibilities because of guilt or pressure to "repay."',
        choices: [
          '-3 = I take on more than I can handle to avoid feeling like a bad person.',
          '-2 = I often say yes out of guilt, even when I don’t want to.',
          '-1 = I feel the pull of guilt, but I’m learning to pause before acting.',
          '1 = I occasionally choose based on values instead of pressure.',
          '2 = I regularly check my motives and choose aligned obligations.',
          '3 = I act from clarity and respect, not guilt or emotional debt.'
        ]
      },
      {
        title: 'Describe how it feels when you do things out of obligation rather than choice.',
        choices: [
          '-3 = I feel trapped, resentful, and disconnected.',
          '-2 = I feel drained and resistant, but I push through.',
          '-1 = I often feel uneasy or conflicted after saying yes.',
          '1 = I’m beginning to notice when obligation overrides authenticity.',
          '2 = I feel more peaceful when I make clear, chosen commitments.',
          '3 = I feel strong and aligned when my yes is honest and free.'
        ]
      },
      {
        title: 'Describe how acting from guilt or obligation affects your goals, energy, or time.',
        choices: [
          '-3 = I have no time or energy for myself because I’m always prioritizing others.',
          '-2 = My own goals get delayed or sacrificed for guilt-driven tasks.',
          '-1 = I’m aware that obligation eats up space in my life.',
          '1 = I’m learning to protect space for what matters to me.',
          '2 = I mostly give time and energy in ways that feel sustainable.',
          '3 = I honor my path while showing up for others in a way that works for both.'
        ]
      }
    ]
  },
  Overworking: {
    reflection: `Where are you working harder than you need to, hoping it will make others feel something about you?
What would it mean about you if you did less?
(Reply with NA if this does not apply to you at all)`,
    items: [
      {
        title: 'Describe how much you feel the need to give more than you have to prove your worth.',
        choices: [
          '-3 = I constantly overwork or overgive to feel valuable.',
          '-2 = I usually go above and beyond, even when it’s exhausting.',
          '-1 = I give too much but I’m starting to question why.',
          '1 = I’m learning to give from intention instead of insecurity.',
          '2 = I contribute meaningfully without overextending.',
          '3 = I know my worth and no longer prove it through overgiving.'
        ]
      },
      {
        title: 'Describe how likely you are to undervalue your work or give it away for free.',
        choices: [
          '-3 = I often work for free or undercharge just to be liked or appreciated.',
          '-2 = I regularly discount myself or overdeliver to feel needed.',
          '-1 = I underprice out of habit, but I know I need to change.',
          '1 = I’m starting to raise my value and voice.',
          '2 = I charge fairly and give generously within my limits.',
          '3 = I value my time and energy and price accordingly.'
        ]
      },
      {
        title: 'Describe how it feels when you give more than you have in order to be accepted.',
        choices: [
          '-3 = I feel resentful, unseen, and invisible.',
          '-2 = I feel drained and hope someone will notice or reciprocate.',
          '-1 = I feel conflicted and stretched thin.',
          '1 = I notice when I cross the line into depletion.',
          '2 = I feel more energized when I give within my limits.',
          '3 = I feel respected and connected when I show up fully but honestly.'
        ]
      },
      {
        title: 'Describe the financial or emotional consequences of overworking or overgiving.',
        choices: [
          '-3 = I end up burned out, underpaid, and behind on my goals.',
          '-2 = I delay income and don’t complete key work.',
          '-1 = I often stretch myself too thin and feel scattered.',
          '1 = I’m noticing when overgiving steals focus or income.',
          '2 = I finish more and feel steadier with better boundaries.',
          '3 = I sustain momentum by honoring my limits and worth.'
        ]
      }
    ]
  },

  NotReceiving: {
    reflection: `How do you usually respond when someone offers to help you or give to you?
What belief or feeling shows up in that moment?
(Reply with NA if this does not apply to you at all)`,
    items: [
      {
        title: 'Describe how comfortable you are receiving support, money, or love from others.',
        choices: [
          '-3 = I feel unsafe or ashamed when someone gives to me.',
          '-2 = I usually reject help even when I need it.',
          '-1 = I struggle to receive but I’m aware it’s a pattern.',
          '1 = I’m beginning to allow support in small ways.',
          '2 = I can receive without guilt or fear most of the time.',
          '3 = I receive with ease and trust—it deepens connection.'
        ]
      },
      {
        title: 'Describe how often you avoid setting boundaries to appear generous or selfless.',
        choices: [
          '-3 = I say yes to everything because I fear rejection or judgment.',
          '-2 = I often ignore my own needs to seem kind or giving.',
          '-1 = I hesitate to set boundaries, even when I should.',
          '1 = I’m practicing saying no with care.',
          '2 = I protect my energy and still show up generously.',
          '3 = I hold clear boundaries and know that’s part of real love.'
        ]
      },
      {
        title: 'Describe how it feels when someone tries to care for or give to you.',
        choices: [
          '-3 = I feel exposed, anxious, or like I don’t deserve it.',
          '-2 = I get uncomfortable and try to deflect or repay immediately.',
          '-1 = I feel tension and distrust around receiving.',
          '1 = I’m learning to pause and receive more openly.',
          '2 = I feel gratitude and presence when someone gives.',
          '3 = I receive deeply and let the giver feel valued too.'
        ]
      },
      {
        title: 'Describe the long-term impact of avoiding receiving in your relationships and finances.',
        choices: [
          '-3 = I push away love and abundance then wonder why I feel alone.',
          '-2 = I miss out on connection and support I actually need.',
          '-1 = I see how this has limited me but still struggle to stop.',
          '1 = I’m starting to welcome more in, even when it feels awkward.',
          '2 = I regularly receive with trust and appreciation.',
          '3 = I grow stronger and more connected by letting myself be supported.'
        ]
      }
    ]
  }
};

function runSTEP1theISLPreprocessingPipeline() {
  console.log("▶️ Starting ISL Preprocessing Pipeline...");

  processUnprocessedISLResponses();
  normalizeISLResponseScores();
  computeISLQuotients();

  console.log("✅ ISL Preprocessing Pipeline complete.");
}



function runSTEP2ImportDemographicsWithLabels() {
FinancialTruPathFunctionLibrary.importDemographicsWithLabels({
  // === SOURCE ===
  sourceSpreadsheetId: "18JP-qzGaQwv2dGmqGaTZZ6TNAJORxGrCK6tIkc0xlM0",
  sourceSheetName:      "Form Responses 1",
  matchColumnSource:    2,
  sourceColumns:        [9, 20, 25, 26],

  // === TARGET ===
  targetSheet:          "Working Sheet",
  matchColumnTarget:    4,
  destinationColumns:   [78, 81, 82, 84],
  labelColumnsMap: {
    9:  79,
    25: 83,
    26: 85
  },
  checkColumnTarget:    86,
  pauseFlagColumn:      87,
  highlightRangeWidth:  3
});
}



function runSTEP2ifNEEDEDNotifyMissingImport() {
  FinancialTruPathFunctionLibrary.notifyMissingImport({
    sheet: SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Working Sheet"),  //Update Sheet Here
    dataCheckColumn: 86,              // Column to check if Import worked
    nameColumn: 2,
    emailColumn: 3,
    pauseFlagColumn: 87,              // Pause Flag Column
    emailSentColumn: 87,              // New “emailed at” column
    // row: 5,                        // Uncomment to process only row 5
    mode: 'flag-and-email',

    studentSubject: 'Urgent: TruPath Worksheet Missing',
    studentBody: [
      'Hi {{Name}},',
      '',
      'We need your Orientation Demographics worksheet to complete your financial coaching reports.  It supports the worksheet you did in class.\n\n',
      '👉 https://forms.gle/pWV3cHxncB7wGZYR6',
      '',
      'Thanks,',
      'Larry Yatch'
    ].join('\n'),

    adminSubject: '{{Name}} was sent a request to complete their orientation worksheet',
    adminBody: 'Please follow up with {{Name}} so their latest report can be processed.  Once they have filled out the orientation form we need to process their latest worksheet.'
  });
}

function runSTEP3theISLDemographicNarrativePipeline() {
  console.log("▶️ Starting ISL Demographic + Coaching Narrative Pipeline...");

  runScaleConversionRange();
  generateISLQuotientCoachingNarrative();

  console.log("✅ ISL Demographic + Coaching Narrative Pipeline complete.");
}

//GPT CALLS

function runSTEP4StartGPTAnalysisISLSuffering() {
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName:    'Working Sheet',
    startRow:     4,
    inputColumns: [
      30, 31, 32, 33, 34, 35, 36, 37,  // 1–8: Suffering domain scores & labels
      70,                              // 9: Suffering Quotient
      78, 79,                         // 10–11: Current FinSit score + label
      81,                             // 12: Biggest Financial Obstacle (text)
      82, 83,                         // 13–14: Income Level score + label
      84, 85                          // 15–16: Debt Impact score + label
    ],
    inputLabels: [
      'Belief Score', 'Belief Label',
      'Behavior Score', 'Behavior Label',
      'Emotional State Score', 'Emotional State Label',
      'Consequence Score', 'Consequence Label',
      'Suffering Quotient',
      'Current Financial Situation Score', 'Current Financial Situation Label',
      'Biggest Financial Obstacle',
      'Income Level Score', 'Income Level Label',
      'Debt Impact Score', 'Debt Impact Label'
    ],
    outputColumns: {
      Analysis:         88,
      Summary:          89,
      ReflectionPrompt: 90
    },
    checkColumn:  88,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their beliefs, behaviors, emotional experience, and consequences around the theme of Suffering. You are also given information about their current financial situation and concerns, including their debt and background demographics.

Definition:
“Suffering” means believing hardship or self-inflicted pain proves love or worth, and taking on burdens to demonstrate care.

Inputs:
1. Belief Score (0–100; 0 = positive, 100 = negative)  
2. Belief Label  
3. Behavior Score (0–100; 0 = positive, 100 = negative)   
4. Behavior Label  
5. Emotional State Score (0–100; 0 = positive, 100 = negative)    
6. Emotional State Label  
7. Consequence Score ((0–100; 0 = positive, 100 = negative)    
8. Consequence Label  
9. Suffering Quotient (Domain Impact) (0–100; 0 = no impact, 100 = significant impact)  
10. Current Financial Situation Score (0–100; 0 = excellent, 100 = bad)  
11. Current Financial Situation Label  
12. Biggest Financial Obstacle (text)  
13. Income Level Score (0–100; 0 = excellent, 100 = bad)    
14. Income Level Label  
15. Debt Impact Score (0–100; 0 = excellent, 100 = bad)    
16. Debt Impact Label  

**Use these exact Inputs values—do not invent or swap any numbers or labels.**

Use the lines 1-8 to determine the biggest impact on their need to suffer and how it contributes to it.  The score number (low = good, high = bad ) indicates the level of impact and the label shares how. 

When crafting your three “Suggestions”:

1. **Relevance Check**  
   Look at line 9 (Suffering Quotient) and line 12 (Biggest Obstacle).  
   • If they connect, begin your first bullet by echoing the exact score and obstacle text.  
   • If not, omit any mention of the obstacle entirely.

2. **Tie-in**  
   Look at lines 1 through Line 8 and determine if and how these impact the overall behaviors.

3. **Action**  
   Offer concrete, practical steps that address both the domain pattern and (if relevant) the obstacle.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:  
(2–3 sentences; insert a blank line between each.)

Summary:  
- Actionable suggestion one  
- Actionable suggestion two  
- Actionable suggestion three  

ReflectionPrompt:  
(One thoughtful, open-ended question to help the student explore this pattern more deeply.)

`,
    model:       'gpt-4.1-nano',
    temperature: 0.2,
    maxTokens:   900,
    useRAG:      true,
    ragTopK:     3,
    gptDelay:    1500
  });
}

function runGPTAnalysisISLSacrificing() {
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName:    'Working Sheet',
    startRow:     4,
    inputColumns: [
      // 1–8: Sacrificing domain scores & labels
      38, 39, 40, 41, 42, 43, 44, 45,
      // 9: Sacrificing Quotient
      71,
      // 10–11: Current FinSit score + label
      78, 79,
      // 12: Biggest Financial Obstacle (text)
      81,
      // 13–14: Income Level score + label
      82, 83,
      // 15–16: Debt Impact score + label
      84, 85,
      // 17-19: previous answers
      88, 89, 90 
    ],
    inputLabels: [
      'Belief Score', 'Belief Label',
      'Behavior Score', 'Behavior Label',
      'Emotional State Score', 'Emotional State Label',
      'Consequence Score', 'Consequence Label',
      'Sacrificing Quotient',
      'Current Financial Situation Score', 'Current Financial Situation Label',
      'Biggest Financial Obstacle',
      'Income Level Score', 'Income Level Label',
      'Debt Impact Score', 'Debt Impact Label',
      'Previous Analysis',    'Previous Suggestions',   'Previous Reflection'
    ],
    outputColumns: {
      Analysis:         91,
      Summary:          92,
      ReflectionPrompt: 93
    },
    checkColumn:  91,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their beliefs, behaviors, emotional experience, and consequences around the theme of Sacrificing. You have their current financial situation, biggest obstacle, and debt context.   You also have the 3 previous answers you provided to them from the last domain you processed.

Definition:
“Sacrificing” means giving more time, money, energy, or attention than you can sustain—often to prove care or worth—at the expense of your own well-being.

Inputs:
1. Belief Score (0–100; 0 = positive, 100 = negative)  
2. Belief Label  
3. Behavior Score (0–100; 0 = positive, 100 = negative)  
4. Behavior Label  
5. Emotional State Score (0–100; 0 = positive, 100 = negative)  
6. Emotional State Label  
7. Consequence Score (0–100; 0 = positive, 100 = negative)  
8. Consequence Label  
9. Sacrificing Quotient (Domain Impact) (0–100; 0 = no impact, 100 = significant impact)  
10. Current Financial Situation Score (0–100; 0 = excellent, 100 = bad)  
11. Current Financial Situation Label  
12. Biggest Financial Obstacle (text)  
13. Income Level Score (0–100; 0 = excellent, 100 = bad)  
14. Income Level Label  
15. Debt Impact Score (0–100; 0 = excellent, 100 = bad)  
16. Debt Impact Label 
17. Previous Analysis
18. Previous Suggestions
19. Previous Reflection 

**Use these exact Inputs values—do not invent or swap any numbers or labels.**

Use lines 1–8 to identify which aspect of Sacrificing has the greatest impact on your tendency to overextend. The numeric score indicates the level of impact; the label describes how it manifests.

When crafting your responses look at line 17 (Previous Analysis), line 18 (Previous Suggestions), and line 19 (Previous Reflection) and build on those prior answers.

When crafting your three “Suggestions”:

1. **Relevance Check**  
   Compare line 9 (Sacrificing Quotient) with line 12 (Biggest Obstacle).  
   • If they connect, begin your first suggestion by echoing the exact score and obstacle text.  
   • If not, omit mention of the obstacle entirely.

2. **Tie-in**  
   Examine lines 1 through 8 and determine how those scores and labels relate to the overall pattern of Sacrificing.

3. **Action**  
   Offer concrete, practical steps that address both the Sacrificing pattern and, if relevant, the obstacle.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:  
(2–3 sentences; insert a blank line between each.)

Summary:  
- Actionable suggestion one  
- Actionable suggestion two  
- Actionable suggestion three  

ReflectionPrompt:  
(One thoughtful, open-ended question to help the student explore this pattern more deeply.)
`,
    model:       'gpt-4.1-nano',
    temperature: 0.2,
    maxTokens:   900,
    useRAG:      true,
    ragTopK:     3,
    gptDelay:    1500
  });
}

function runGPTAnalysisISLObligation() {
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName:    'Working Sheet',
    startRow:     4,
    inputColumns: [
      // 1–8: Obligation domain scores & labels
      46, 47, 48, 49, 50, 51, 52, 53,
      // 9: Obligation Quotient
      72,
      // 10–11: Current Financial Situation score + label
      78, 79,
      // 12: Biggest Financial Obstacle (text)
      81,
      // 13–14: Income Level score + label
      82, 83,
      // 15–16: Debt Impact score + label
      84, 85,
      // 17-19: previous answers
      91,92,93
    ],
    inputLabels: [
      'Belief Score', 'Belief Label',
      'Behavior Score', 'Behavior Label',
      'Emotional State Score', 'Emotional State Label',
      'Consequence Score', 'Consequence Label',
      'Obligation Quotient',
      'Current Financial Situation Score', 'Current Financial Situation Label',
      'Biggest Financial Obstacle',
      'Income Level Score', 'Income Level Label',
      'Debt Impact Score', 'Debt Impact Label',
      'Previous Analysis',    'Previous Suggestions',   'Previous Reflection'
    ],
    outputColumns: {
      Analysis:         94,
      Summary:          95,
      ReflectionPrompt: 96
    },
    checkColumn:  94,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They have shared their beliefs, behaviors, emotional experience, and consequences around the theme of Obligation.  You have their current financial situation, biggest obstacle, and debt context.   You also have the 3 previous answers you provided to them from the last domain you processed.

Definition:
“Obligation” means feeling emotionally or financially indebted—taking on responsibilities out of guilt or pressure to “repay,” even at personal cost.

Inputs:
1. Belief Score (0–100; 0 = positive, 100 = negative)  
2. Belief Label  
3. Behavior Score (0–100; 0 = positive, 100 = negative)  
4. Behavior Label  
5. Emotional State Score (0–100; 0 = positive, 100 = negative)  
6. Emotional State Label  
7. Consequence Score (0–100; 0 = positive, 100 = negative)  
8. Consequence Label  
9. Obligation Quotient (Domain Impact) (0–100; 0 = no impact, 100 = significant impact)  
10. Current Financial Situation Score (0–100; 0 = excellent, 100 = bad)  
11. Current Financial Situation Label  
12. Biggest Financial Obstacle (text)  
13. Income Level Score (0–100; 0 = excellent, 100 = bad)  
14. Income Level Label  
15. Debt Impact Score (0–100; 0 = excellent, 100 = bad)  
16. Debt Impact Label  
17. Previous Analysis
18. Previous Suggestions
19. Previous Reflection


**Use these exact Inputs values—do not invent or swap any numbers or labels.**

Use the first eight lines to identify which part of Obligation has the greatest impact. The numeric score shows the level of impact; the label describes how it appears.

When crafting your responses look at line 17 (Previous Analysis), line 18 (Previous Suggestions), and line 19 (Previous Reflection) and build on those prior answers.

When crafting your three “Suggestions”:

1. **Relevance Check**  
   Compare line 9 (Obligation Quotient) with line 12 (Biggest Obstacle).  
   • If they connect, start your first bullet by echoing the exact score and obstacle text.  
   • If not, do not mention the obstacle.

2. **Tie-in**  
   Examine lines 1–8 and explain how those underline the pattern of Obligation.

3. **Action**  
   Offer concrete, practical steps addressing the Obligation pattern and, if relevant, the obstacle.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:  
(2–3 sentences; blank line between each.)

Summary:  
- Actionable suggestion one  
- Actionable suggestion two  
- Actionable suggestion three  

ReflectionPrompt:  
(One thoughtful, open-ended question to help the student explore this pattern more deeply.)
`,
    model:       'gpt-4.1-nano',
    temperature: 0.2,
    maxTokens:   900,
    useRAG:      true,
    ragTopK:     3,
    gptDelay:    1500
  });
}

function runGPTAnalysisISLOverworking() {
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName:    'Working Sheet',
    startRow:     4,
    inputColumns: [
      // 1–8: Overworking domain scores & labels
      54, 55, 56, 57, 58, 59, 60, 61,
      // 9: Overworking Quotient
      73,
      // 10–11: Current Financial Situation score + label
      78, 79,
      // 12: Biggest Financial Obstacle (text)
      81,
      // 13–14: Income Level score + label
      82, 83,
      // 15–16: Debt Impact score + label
      84, 85,
            // 17-19: previous answers
      94,95,96

    ],
    inputLabels: [
      'Belief Score',          'Belief Label',
      'Behavior Score',        'Behavior Label',
      'Emotional State Score', 'Emotional State Label',
      'Consequence Score',     'Consequence Label',
      'Overworking Quotient',
      'Current Financial Situation Score', 'Current Financial Situation Label',
      'Biggest Financial Obstacle',
      'Income Level Score', 'Income Level Label',
      'Debt Impact Score',  'Debt Impact Label',
      'Previous Analysis',    'Previous Suggestions',   'Previous Reflection'
    ],

    outputColumns: {
      Analysis:         97,
      Summary:          98,
      ReflectionPrompt: 99
    },
    checkColumn:  97,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They’ve shared beliefs, behaviors, feelings, and consequences around the theme of Overworking / Performative Generosity.  You have their current financial situation, biggest obstacle, and debt context.   You also have the 3 previous answers you provided to them from the last domain you processed.

Definition:
“Overworking/Performative Generosity” means working harder than necessary or overgiving to prove your worth or earn approval, often leading to burnout and imbalance.

Inputs:
1. Belief Score (0–100; 0 = positive, 100 = negative)  
2. Belief Label  
3. Behavior Score (0–100; 0 = positive, 100 = negative)  
4. Behavior Label  
5. Emotional State Score (0–100; 0 = positive, 100 = negative)  
6. Emotional State Label  
7. Consequence Score (0–100; 0 = positive, 100 = negative)  
8. Consequence Label  
9. Overworking Quotient (Domain Impact) (0–100; 0 = no impact, 100 = significant impact)  
10. Current Financial Situation Score (0–100; 0 = excellent, 100 = bad)  
11. Current Financial Situation Label  
12. Biggest Financial Obstacle (text)  
13. Income Level Score (0–100; 0 = excellent, 100 = bad)  
14. Income Level Label  
15. Debt Impact Score (0–100; 0 = excellent, 100 = bad)  
16. Debt Impact Label 
17. Previous Analysis
18. Previous Suggestions
19. Previous Reflection 

**Use these exact Inputs values—do not invent or swap any numbers or labels.**

Use lines 1–8 to determine which aspect of Overworking has the greatest impact. The numeric score shows the level of impact; the label describes how it manifests.

When crafting your responses look at line 17 (Previous Analysis), line 18 (Previous Suggestions), and line 19 (Previous Reflection) and build on those prior answers.

When crafting your three “Suggestions”:

1. **Relevance Check**  
   Compare line 9 (Overworking Quotient) with line 12 (Biggest Obstacle).  
   • If they connect, start your first bullet by echoing the exact score and obstacle text.  
   • If not, omit any mention of the obstacle.

2. **Tie-in**  
   Examine lines 1–8 to explain how those scores and labels reveal overworking patterns.

3. **Action**  
   Offer concrete steps that address both the overworking pattern and, if relevant, the obstacle.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:  
(2–3 sentences; insert a blank line between each.)

Summary:  
- Actionable suggestion one  
- Actionable suggestion two  
- Actionable suggestion three  

ReflectionPrompt:  
(One thoughtful, open-ended question to help the student explore this pattern more deeply.)
`,
    model:       'gpt-4.1-nano',
    temperature: 0.2,
    maxTokens:   900,
    useRAG:      true,
    ragTopK:     3,
    gptDelay:    1500
  });
}

function runGPTAnalysisISLNotReceiving() {
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName:    'Working Sheet',
    startRow:     4,
    inputColumns: [
      // 1–8: Not Receiving domain scores & labels
      62, 63, 64, 65, 66, 67, 68, 69,
      // 9: NotReceiving Quotient
      74,
      // 10–11: Current Financial Situation score + label
      78, 79,
      // 12: Biggest Financial Obstacle (text)
      81,
      // 13–14: Income Level score + label
      82, 83,
      // 15–16: Debt Impact score + label
      84, 85,
      // 17-19: previous answers
      97, 98, 99
    ],
    inputLabels: [
      'Belief Score',          'Belief Label',
      'Behavior Score',        'Behavior Label',
      'Emotional State Score', 'Emotional State Label',
      'Consequence Score',     'Consequence Label',
      'NotReceiving Quotient',
      'Current Financial Situation Score', 'Current Financial Situation Label',
      'Biggest Financial Obstacle',
      'Income Level Score',    'Income Level Label',
      'Debt Impact Score',     'Debt Impact Label',
      'Previous Analysis',    'Previous Suggestions',   'Previous Reflection'
    ],
    outputColumns: {
      Analysis:         100,
      Summary:          101,
      ReflectionPrompt: 102
    },
    checkColumn:  100,
    systemPrompt: `
You are a financial trauma recovery expert speaking directly to a student. They’ve shared their beliefs, behaviors, emotional experience, and consequences around the theme of Not Receiving. You have their current financial situation, biggest obstacle, and debt context.   You also have the 3 previous answers you provided to them from the last domain you processed.

Definition:
“Not Receiving” means feeling uncomfortable or resistant when someone offers help or gifts—struggling to accept support due to shame, distrust, or fear of indebtedness.

Inputs:
1. Belief Score (0–100; 0 = positive, 100 = negative)  
2. Belief Label  
3. Behavior Score (0–100; 0 = positive, 100 = negative)  
4. Behavior Label  
5. Emotional State Score (0–100; 0 = positive, 100 = negative)  
6. Emotional State Label  
7. Consequence Score (0–100; 0 = positive, 100 = negative)  
8. Consequence Label  
9. NotReceiving Quotient (Domain Impact) (0–100; 0 = no impact, 100 = significant impact)  
10. Current Financial Situation Score (0–100; 0 = excellent, 100 = bad)  
11. Current Financial Situation Label  
12. Biggest Financial Obstacle (text)  
13. Income Level Score (0–100; 0 = excellent, 100 = bad)  
14. Income Level Label  
15. Debt Impact Score (0–100; 0 = excellent, 100 = bad)  
16. Debt Impact Label  
17. Previous Analysis
18. Previous Suggestions
19. Previous Reflection

**Use these exact Inputs values—do not invent or swap any numbers or labels.**

Lines 1–8 reveal which aspect of Not Receiving impacts you most. The numeric score shows the level of resistance; the label describes how it appears.

When crafting your responses look at line 17 (Previous Analysis), line 18 (Previous Suggestions), and line 19 (Previous Reflection) and build on those prior answers.

When crafting your three “Suggestions”:

1. **Relevance Check**  
   Compare line 9 (NotReceiving Quotient) with line 12 (Biggest Obstacle).  
   • If they connect, start your first suggestion by echoing the exact score and obstacle text.  
   • If not, omit any mention of the obstacle.

2. **Tie-in**  
   Examine lines 1–8 and explain how those scores and labels reveal your pattern of resisting support.

3. **Action**  
   Offer concrete steps that address both the Not Receiving pattern and, if relevant, the obstacle.

Return **plain-text only** in exactly these three sections—no JSON, no markdown—and stop:

Analysis:  
(2–3 sentences; insert a blank line between each.)

Summary:  
- Actionable suggestion one  
- Actionable suggestion two  
- Actionable suggestion three  

ReflectionPrompt:  
(One thoughtful, open-ended question to help the student explore this pattern more deeply.)
`,
    model:       'gpt-4.1-nano',
    temperature: 0.2,
    maxTokens:   900,
    useRAG:      true,
    ragTopK:     3,
    gptDelay:    1500
  });
}

function runGPTAnalysisISLOverall() {
  FinancialTruPathFunctionLibrary.AdvancedGPTAnalysis({
    sheetName:    'Working Sheet',
    startRow:     4,
    inputColumns: [
      // 1–3: Suffering domain outputs
      88, 89, 90,
      // 4–6: Sacrificing domain outputs
      91, 92, 93,
      // 7–9: Obligation domain outputs
      94, 95, 96,
      // 10–12: Overworking domain outputs
      97, 98, 99,
      // 13–15: Not Receiving domain outputs
      100, 101, 102
    ],
    inputLabels: [
      'Suffering Analysis', 'Suffering Suggestions', 'Suffering Reflection',
      'Sacrificing Analysis','Sacrificing Suggestions','Sacrificing Reflection',
      'Obligation Analysis','Obligation Suggestions','Obligation Reflection',
      'Overworking Analysis','Overworking Suggestions','Overworking Reflection',
      'Not Receiving Analysis','Not Receiving Suggestions','Not Receiving Reflection'
    ],
    outputColumns: {
      OverallAnalysis:         103,
      OverallSuggestions:      104,
      OverallReflectionPrompt: 105
    },
    checkColumn:   103,
    systemPrompt: `
You are a financial trauma recovery expert writing a comprehensive overview for a student. You have five domain‐level insights—each with Analysis, Suggestions, and a Reflection Prompt—that reveal patterns around:

• Suffering  
• Sacrificing  
• Obligation/Guilt  
• Overworking/Performative Generosity  
• Not Receiving  

Definitions:
- Suffering: Believing hardship or self-inflicted pain proves love or worth and taking on burdens to demonstrate care.  
- Sacrificing: Giving more than you can sustain—time, money, energy—to prove care or worth at the expense of your well-being.  
- Obligation/Guilt: Feeling indebted—taking on responsibilities out of guilt or pressure to repay, even at personal cost.  
- Overworking/Performative Generosity: Working harder than necessary or overgiving to earn approval, leading to imbalance or burnout.  
- Not Receiving: Feeling uncomfortable or unworthy when offered help or gifts—struggling to accept support.

Inputs:
The next block labeled “Inputs:” will include exactly fifteen lines, in this order:
1. Suffering Analysis  
2. Suffering Suggestions  
3. Suffering Reflection Prompt  
4. Sacrificing Analysis  
5. Sacrificing Suggestions  
6. Sacrificing Reflection Prompt  
7. Obligation Analysis  
8. Obligation Suggestions  
9. Obligation Reflection Prompt  
10. Overworking Analysis  
11. Overworking Suggestions  
12. Overworking Reflection Prompt  
13. Not Receiving Analysis  
14. Not Receiving Suggestions  
15. Not Receiving Reflection Prompt  

Use these exact inputs—do **not** invent, truncate, or alter any text.

Your tasks:
1. Overall Analysis  
   Craft a single cohesive paragraph that weaves together the core themes from all five domain Analyses.

2. Consolidated Suggestions  
   Provide 3 bullet points synthesizing the individual domain Suggestions into a unified action plan.

3. Consolidated Reflection Questions  
   Offer 2 open-ended reflection questions that build on the domain Reflection Prompts.

Return **plain-text only** in exactly these three labeled sections—no JSON, no markdown—and stop:

OverallAnalysis:
<A single, integrated paragraph>

OverallSuggestions: 
- Bullet one  
- Bullet two  
… up to three bullets

OverallReflectionPrompt:  
1. Question one  
2. Question two  
`,
    model:       'gpt-4.1-nano',
    temperature: 0.2,
    maxTokens:   900,
    useRAG:      false,
    ragTopK:     0,
    gptDelay:    1500
  });
}

function runSTEP5GenerateAndSendFinancialTruthReports() {
  Logger.log("Starting runGenerateAndSendFinancialTruthReports");

  const configDocs = {
    sheetName:       'Working Sheet',
    headerRow:       2,
    startRow:        4,
    nameColumn:      2,
    docUrlColumn:    112,
    docCreatedAtCol: 113,
    templateDocId:   '1kW0e7tKPGFgIPi6aRf-xgOjkH4VmbzaoaSy_jPBz8-s',
    outputFolderId:  '10yOnIUyiv78lp6pYvrcE6qMqBH_GhQKu'
  };

  const configPdfs = {
    sheetName:      'Working Sheet',
    headerRow:      2,
    startRow:       4,
    nameColumn:     2,
    docUrlColumn:   112,
    docCreatedAtCol: 113,
    pdfUrlColumn:   114,
    pdfSentAtCol:   115,
    emailColumn:    3,
    outputFolderId: '10yOnIUyiv78lp6pYvrcE6qMqBH_GhQKu',
    emailTemplate: {
      subject: 'Your Personalized Issues Showing Love Grounding Report',
      body:
        `Hi {{Name_Full}},\n\n` +
        `Your personalized Issue Showing Love Grounding report is attached.\n\n` +
        `This report outlines a behavioral and financial strategy designed specifically for your current goals, income structure, and mindset. ` +
        `We encourage you to read both the summary and the detailed insights to better understand how to apply this into your financial life.\n\n` +
        `If you have questions or want help implementing it, don’t hesitate to reach out.\n\n` +
        `You can always contact Sarah at Sarah@TruPathMastery.com\n\n` +
        `Here's to your financial freedom!\nThe TruPath Team\n\n\n`
    }
  };

  Logger.log("Calling generateThenSendAll...");
  generateThenSendAll(configDocs, configPdfs);  // use local version
  Logger.log("generateThenSendAll finished.");
}



/**
 * Runner #1: Continuous range of columns
 *
 * Processes “Working Sheet”:
 *  • skip the first 3 header rows
 *  • process rows 14–14 and columns 1–28
 */
function runScaleConversionRange() {
  FinancialTruPathFunctionLibrary.convertScaleValuesRange(
    'Working Sheet', // sheetName
    3,               // headerRows
    4,              // startRow
    1000,              // endRow
    78,               // startCol (A=1)
    84               // endCol   (AB=28)
  );
}


function processUnprocessedISLResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Working Sheet');
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0]; // Row 2 = headers
  const lastRow = sheet.getLastRow();

  console.log("✅ Headers from row 2:", headers.join(" | "));

  for (let rowIndex = 4; rowIndex <= lastRow; rowIndex++) {
    const alreadyProcessed = sheet.getRange(rowIndex, 30).getValue(); // Column AD
    if (alreadyProcessed !== '') continue;

    const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    const writeData = [];

    const domainKeys = Object.keys(ISL_CONFIG);
    const subKeys = ['Type', 'Behavior', 'Feeling', 'Consequence'];

    domainKeys.forEach(domainKey => {
      const domain = ISL_CONFIG[domainKey];
      const cleanDomainKey = domainKey === 'NotReceiving' ? 'Receiving' : domainKey;

      subKeys.forEach((subKey, subIndex) => {
        const headerKey = `${cleanDomainKey}_${subKey}`;
        const colIndex = headers.indexOf(headerKey);

        if (colIndex === -1) {
          console.warn(`⚠️ Header not found: ${headerKey}`);
          writeData.push(null, null);
          return;
        }

        const response = rowData[colIndex] || '';
        const parsed = extractValueAndLabel(response, domainKey, subIndex);
        writeData.push(parsed.value, parsed.label);
      });
    });

    sheet.getRange(rowIndex, 30, 1, writeData.length).setValues([writeData]);
    console.log(`✅ Processed row ${rowIndex}`);
  }
}


/**
 * Extracts { value, label } from the response string using ISL_CONFIG
 */
function extractValueAndLabel(responseText, domainKey, subIndex) {
  const domain = ISL_CONFIG[domainKey];
  const choices = domain.items[subIndex].choices;

  const found = choices.find(c => responseText.trim() === c.trim());
  if (!found) {
    return {
      value: null,
      label: responseText.trim() || '(blank or unmatched)'
    };
  }

  const [valueStr, label] = found.split(' = ');
  return {
    value: parseInt(valueStr.trim(), 10),
    label: label.trim()
  };
}

function normalizeISLResponseScores() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Working Sheet");
  FinancialTruPathFunctionLibrary.convertScaleValuesRange(
    "Working Sheet",
    3,                  // Number of header rows
    4,                  // First row of real data
    sheet.getLastRow(), // Last row of real data
    30,                 // Start column (AD)
    69                  // End column (BM)
  );
  console.log("✅ ISL response scores normalized to 0–100.");
}





function computeISLQuotients() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Working Sheet");
  const lastRow = sheet.getLastRow();

  const domainKeys = [
    'Suffering',
    'Sacrificing',
    'Obligation',
    'Overworking',
    'NotReceiving'
  ];

  const domainColumnMap = {
    Suffering:     [30, 32, 34, 36],  // Normalized score columns for Suffering
    Sacrificing:   [38, 40, 42, 44],
    Obligation:    [46, 48, 50, 52],
    Overworking:   [54, 56, 58, 60],
    NotReceiving:  [62, 64, 66, 68]
  };

  for (let row = 4; row <= lastRow; row++) {
    // 🔍 Skip if any value exists in output columns 70–77
    const existingOutputs = sheet.getRange(row, 70, 1, 8).getValues()[0];
    const hasOutput = existingOutputs.some(v => v !== "" && v !== null);
    if (hasOutput) {
      console.log(`⏭️ Row ${row} – Skipped (already has output)`);
      continue;
    }

    // Skip rows where the first domain score is empty
    const firstScore = sheet.getRange(row, domainColumnMap.Suffering[0]).getValue();
    if (firstScore === "" || isNaN(firstScore)) continue;

    let domainQuotients = {};
    let lowestDomain = null;
    let highestImpactScore = -Infinity;
    let totalImpact = 0;

    domainKeys.forEach(domain => {
      const cols = domainColumnMap[domain];
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
        if (avg > highestImpactScore) {
          highestImpactScore = avg;
          lowestDomain = domain;
        }
      }
    });

    const overallImpact = totalImpact / domainKeys.length;

    const output = [
      domainQuotients.Suffering,
      domainQuotients.Sacrificing,
      domainQuotients.Obligation,
      domainQuotients.Overworking,
      domainQuotients.NotReceiving,
      overallImpact,
      lowestDomain,
      highestImpactScore
    ];

    sheet.getRange(row, 70, 1, output.length).setValues([output]);
    console.log(`✅ Row ${row} – Quotients updated (higher = more impact)`);
  }
}



function runGenerateFinancialTruthDocs() {
  const configDocs = {
    sheetName:       'Working Sheet',
    headerRow:       2,
    startRow:        4,
    nameColumn:      2,  // Column for {{Name}}
    docUrlColumn:    112,
    docCreatedAtCol: 113,
    templateDocId:   '1kW0e7tKPGFgIPi6aRf-xgOjkH4VmbzaoaSy_jPBz8-s', // Your Financial Truth template
    outputFolderId:  '10yOnIUyiv78lp6pYvrcE6qMqBH_GhQKu'
  };

  generateClientDocs(configDocs);  // use local version
}

function runEmailFinancialTruthPdfs() {
  const configPdfs = {
    sheetName:      'Working Sheet',
    headerRow:      2,
    startRow:       4,
    nameColumn:     2,
    docUrlColumn:   112,
    docCreatedAtCol: 113,
    pdfUrlColumn:   114,
    pdfSentAtCol:   115,
    emailColumn:    3,
    outputFolderId: '10yOnIUyiv78lp6pYvrcE6qMqBH_GhQKu',
    emailTemplate: {
      subject: 'Your Personalized Issues Showing Love Grounding Report',
      body:
        `Hi {{Name_Full}},\n\n` +
        `Your personalized Issue Showing Love Grounding report is attached.\n\n` +
        `This report outlines a behavioral and financial strategy designed specifically for your current goals, income structure, and mindset. ` +
        `We encourage you to read both the summary and the detailed insights to better understand how to apply this into your financial life.\n\n` +
        `If you have questions or want help implementing it, don’t hesitate to reach out.\n\n` +
        `You can always contact Sarah at Sarah@TruPathMastery.com\n\n` +
        `Here's to your financial freedom!\nThe TruPath Team\n\n\n`
    }
  };

  exportAndEmailClientPdfs(configPdfs);  // use local version
}




function generateISLQuotientCoachingNarrative() {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Working Sheet");

  // — Determine range —
  const startRow = 4;
  const allBy    = sheet.getRange("BY:BY").getValues();
  const lastRow  = allBy.filter(r => r[0] !== "").length;
  const numRows  = Math.max(0, lastRow - startRow + 1);
  if (numRows <= 0) return;

  // — Configs & mappings —
  const DIFF_CLOSE  = 7;
  const DIFF_MEDIUM = 14;
  const DOMAIN_NAMES = {
    Suffering:   "Suffering",
    Sacrificing: "Sacrificing",
    Obligation:  "Obligation / Guilt",
    Overworking: "Overworking",
    NotReceiving:"Not Receiving"
  };

  // — Read inputs & existing outputs —
  const inputData    = sheet.getRange(startRow, 75,  numRows, 3).getValues();
  const existingData = sheet.getRange(startRow, 109, numRows, 3).getValues();

  // — Compute cohort thresholds —
  const scores = inputData.map(r => r[0]).filter(v => typeof v === "number").sort((a,b)=>a-b);
  const p5      = scores[Math.floor(0.05*(scores.length-1))];
  const p95     = scores[Math.ceil (0.95*(scores.length-1))];
  const range   = p95 - p5;
  const lowTh   = p5 + range*0.33;
  const highTh  = p5 + range*0.66;

  // — Loop & write per row —
  for (let i = 0; i < inputData.length; i++) {
    const rowNum = startRow + i;
    const [overall, domainKey, domainScore] = inputData[i];
    const [insight, label, narrative]      = existingData[i];

    // skip if already processed
    if ([insight,label,narrative].some(c=>c)) continue;

    // determine raw outputs
    const level = overall <= lowTh
      ? "Low"
      : overall <= highTh
        ? "Medium"
        : "High";
    const diff = domainScore - overall;
    const rawLabel = diff <= DIFF_CLOSE
      ? "Close Match"
      : diff <= DIFF_MEDIUM
        ? "Moderate Gap"
        : "Isolated Spike";

    // write raw columns 106–108
    sheet.getRange(rowNum, 106, 1, 3)
         .setValues([[level, diff, rawLabel]]);

    // build narrative
    const displayName = DOMAIN_NAMES[domainKey] || domainKey;

    const insights = {
      Low:    "The Issues with Showing Love patterns appear at a low level and likely play a minor role in your current financial and relational experience.",
      Medium: "The Issues with Showing Love patterns are moderately active and are influencing multiple areas of your financial life and emotional behavior.",
      High:   "The Issues with Showing Love patterns are strongly present and are likely driving significant emotional and financial behaviors in your life."
    };
    const quotientInsight = insights[level];

    const narrativeLabel = diff <= DIFF_CLOSE
      ? "Pattern is consistent across domains"
      : diff <= DIFF_MEDIUM
        ? `The domain of ${displayName} is slightly stronger than the rest`
        : `The domain of ${displayName} may be driving the entire pattern`;

    let coaching;
    if (level === "Low") {
      coaching = diff <= DIFF_CLOSE
        ? "Your results show that the patterns of Issues Showing Love aren’t playing a strong role in your financial life right now. Everything looks fairly balanced across the board."
        : `While your overall patterns of Issues Showing Love are pretty mild, it looks like the domain of ${displayName} is standing out a bit more. That may be a small but important area to explore to gain greater control of your financial world.`;
    } else if (level === "Medium") {
      coaching = diff <= DIFF_CLOSE
        ? "These patterns are showing up meaningfully in your life and seem to be influencing your financial and emotional decisions across several areas. This is a theme worth keeping an eye on as you move forward."
        : `The patterns of Issues Showing Love are active in your financial life, and the domain of ${displayName} stands out as especially important right now. Paying attention to how this area shows up may unlock helpful changes.`;
    } else {
      coaching = diff <= DIFF_CLOSE
        ? "These patterns appear to be deeply affecting your financial decisions and emotional responses across the board. It's likely they’re shaping how you give, receive, and relate to money and connection."
        : `The patterns of Issues Showing Love are playing a strong role in your life. One area—${displayName}—is showing up as especially intense and may be driving much of the financial stress or disconnection you're experiencing. This is a powerful place to begin your focus.`;
    }

    // write narrative columns 109–111
    sheet.getRange(rowNum, 109, 1, 3)
         .setValues([[quotientInsight, narrativeLabel, coaching]]);
  }
}











