/**
 * Tool6.js
 * Retirement Blueprint Calculator
 *
 * Architecture: Single-page calculator + Report model (like Tool 4)
 * Purpose: Help clients discover optimal retirement vehicle allocation based on:
 *   - Profile classification (1 of 9 investor profiles)
 *   - Ambition Quotient (domain weighting from importance + urgency)
 *   - Current financial state (balances, contributions, employer match)
 *   - Tax strategy preference (Traditional vs Roth focus)
 *   - Investment risk tolerance (from Tool 4)
 *
 * Key Features:
 *   - Auto-profile classification from decision tree
 *   - Waterfall allocation with IRS limit enforcement
 *   - Slider coupling with real-time recalculation
 *   - Multiple scenario save/compare
 *   - Future value projections with safeguards
 *   - PDF report generation
 */

const Tool6 = {
  manifest: null, // Injected by ToolRegistry

  /**
   * Main render function
   * Entry point for Tool 6
   */
  render(params) {
    const clientId = params.clientId;
    console.log('=== Tool6.render START for client: ' + clientId + ' ===');

    try {
      // Check Tools 1-5 completion status
      console.log('Calling checkToolCompletion...');
      let toolStatus = this.checkToolCompletion(clientId);
      console.log('checkToolCompletion returned. hasTool4: ' + toolStatus.hasTool4);

      // Check if pre-survey completed (questionnaire answers)
      const preSurveyData = this.getPreSurvey(clientId);

      // Sprint 10.1: Merge backup data if user answered backup questions
      if (preSurveyData) {
        toolStatus = this.mergeBackupData(toolStatus, preSurveyData);
        console.log('After mergeBackupData. hasCriticalData: ' + toolStatus.hasCriticalData);
      }

      // Calculate allocation if pre-survey exists
      let allocation = null;
      let profile = null;

      if (preSurveyData) {
        try {
          // Classify into investor profile
          profile = this.classifyProfile(clientId, preSurveyData, toolStatus);

          // Calculate vehicle allocation
          allocation = this.calculateAllocation(clientId, preSurveyData, profile, toolStatus);
        } catch (calcError) {
          Logger.log(`Error calculating allocation: ${calcError}`);
          Logger.log(`Stack: ${calcError.stack}`);
          // Continue without allocation - will show questionnaire
        }
      }

      // Build unified page (questionnaire + calculator)
      const htmlContent = this.buildUnifiedPage(clientId, toolStatus, preSurveyData, profile, allocation);

      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('TruPath - Retirement Blueprint Calculator')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`Error rendering Tool 6: ${error}`);
      Logger.log(`Error stack: ${error.stack}`);
      return this.renderError(error);
    }
  },

  /**
   * Check Tools 1-5 completion status
   * Pulls data from previous tools for pre-population
   * Maps fields per spec Data Sources table (Tool6-Consolidated-Specification.md)
   */
  checkToolCompletion(clientId) {
    console.log('=== checkToolCompletion START ===');
    try {
      console.log('Getting tool1Data...');
      const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      console.log('tool1Data: ' + (tool1Data ? 'found' : 'null'));
      const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
      const tool3Data = DataService.getLatestResponse(clientId, 'tool3');
      const tool4Data = DataService.getLatestResponse(clientId, 'tool4');
      const tool5Data = DataService.getLatestResponse(clientId, 'tool5');

      // Map fields from upstream tools per spec
      const mappedFields = this.mapUpstreamFields(tool1Data, tool2Data, tool3Data, tool4Data, tool5Data);

      return {
        // Completion flags
        hasTool1: !!tool1Data,
        hasTool2: !!tool2Data,
        hasTool3: !!tool3Data,
        hasTool4: !!tool4Data,
        hasTool5: !!tool5Data,

        // Raw data (for debugging/advanced use)
        tool1Data,
        tool2Data,
        tool3Data,
        tool4Data,
        tool5Data,

        // Mapped fields for Tool 6 use
        ...mappedFields,

        // Summary stats
        missingCount: [tool1Data, tool2Data, tool3Data, tool4Data, tool5Data].filter(d => !d).length,
        hasCriticalData: !!tool4Data && (tool4Data.data?.multiply > 0 || tool4Data.data?.multiplyAmount > 0)
      };
    } catch (error) {
      Logger.log(`Error checking tool completion: ${error}`);
      return {
        hasTool1: false,
        hasTool2: false,
        hasTool3: false,
        hasTool4: false,
        hasTool5: false,
        missingCount: 5,
        hasCriticalData: false
      };
    }
  },

  /**
   * Map upstream tool fields to Tool 6 field names
   * Per spec Data Sources table (lines 96-111)
   *
   * DATA STRUCTURE NOTES:
   * - getLatestResponse() returns { data: {...}, status, timestamp, ... }
   * - Tools 1/2/3/5 save: { data: formData, results: {...}, ... } -> so form data is at .data.data
   * - Tool 4 saves flat: { scenarioName, multiply, monthlyIncome, ... } -> so data is at .data directly
   */
  mapUpstreamFields(tool1Data, tool2Data, tool3Data, tool4Data, tool5Data) {
    // Extract actual form/result data from each response
    // Each tool has a different save structure:
    //
    // Tool 1 saves: { formData: {...}, scores: {...}, winner: '...' }
    //   -> form data at .data.formData, winner at .data.winner
    //
    // Tools 2/3/5 save: { data: formData, results: {...}, gptInsights: {...} }
    //   -> form data at .data.data, results at .data.results
    //
    // Tool 4 saves flat: { scenarioName, multiply, monthlyIncome, ... }
    //   -> data directly at .data
    //
    const t1Raw = tool1Data?.data || {};
    const t1Winner = t1Raw.winner || t1Raw.winningPattern || null;  // Tool 1's winner
    const t1Scores = t1Raw.scores || {};  // Tool 1's scores

    const t2 = tool2Data?.data?.data || {};
    const t3 = tool3Data?.data?.data || {};
    const t3Scoring = tool3Data?.data?.scoring || {};  // Tool 3 scoring has subdomainQuotients
    const t4 = tool4Data?.data || {};  // Tool 4 saves flat structure
    const t5 = tool5Data?.data?.data || {};
    const t5Scoring = tool5Data?.data?.scoring || {};  // Tool 5 scoring has subdomainQuotients

    // Infer filing status from marital status
    const inferFilingStatus = (maritalStatus) => {
      if (!maritalStatus) return null;
      const lower = String(maritalStatus).toLowerCase();
      if (lower.includes('married') || lower === 'mfj') return 'MFJ';
      if (lower === 'mfs' || lower.includes('separately')) return 'MFS';
      return 'Single';
    };

    // Infer HSA coverage type from filing status (spec section 7)
    const inferHSACoverageType = (filingStatus) => {
      return filingStatus === 'MFJ' ? 'Family' : 'Individual';
    };

    // Tool 2 uses 'marital' field (not maritalStatus)
    const filingStatus = inferFilingStatus(t2.marital || t2.maritalStatus || t2.filingStatus);

    // Tool 4 saves: { multiply, essentials, freedom, enjoyment, monthlyIncome, priority, scenarioName }
    // Note: 'multiply' is lowercase and is a percentage (0-100)
    const monthlyIncome = t4.monthlyIncome || 0;
    const multiplyPercent = t4.multiply || t4.Multiply || (t4.allocations && t4.allocations.Multiply) || 0;
    const monthlyBudget = monthlyIncome > 0 && multiplyPercent > 0
      ? Math.round(monthlyIncome * multiplyPercent / 100)
      : 0;

    return {
      // From Tool 1: Trauma patterns (winner and scores are at top level of saved data)
      traumaPattern: t1Winner,
      traumaScores: t1Scores,

      // From Tool 2: Demographics and employment (field names: age, marital, employment)
      age: t2.age || t2.currentAge || null,
      grossIncome: t2.annualIncome || t2.grossIncome || t2.income || null,
      employmentType: t2.employment || t2.employmentType || t2.workSituation || null,
      businessOwner: t2.businessOwner || t2.isBusinessOwner || false,
      filingStatus: filingStatus,
      hsaCoverageType: inferHSACoverageType(filingStatus),

      // From Tool 3: Identity subdomain scores (in scoring.subdomainQuotients per middleware-mapping.md)
      identitySubdomainScores: t3Scoring.subdomainQuotients || t3.subdomainScores || null,

      // From Tool 4: Financial data (CRITICAL - required for Tool 6)
      // Tool 4 saves: monthlyIncome, goalTimeline, allocations.Multiply (percentage)
      monthlyTakeHome: monthlyIncome,
      yearsToRetirement: t4.goalTimeline || t4.yearsToRetirement || null,
      monthlyBudget: monthlyBudget, // M bucket dollar amount
      multiplyPercent: multiplyPercent, // Keep percentage too
      investmentScore: t4.investmentScore || 4, // Default to Moderate (4)
      tool4Allocation: t4.allocations || t4.allocation || null,

      // From Tool 5: Connection subdomain scores (in scoring.subdomainQuotients per middleware-mapping.md)
      connectionSubdomainScores: t5Scoring.subdomainQuotients || t5.subdomainScores || null
    };
  },

  /**
   * Sprint 10.1: Derive Tool 4 data from backup questions
   * Called when Tool 4 data is missing but user provided backup answers
   *
   * @param {Object} preSurveyData - Form data containing backup_ prefixed fields
   * @returns {Object} Derived Tool 4 equivalent values
   */
  deriveTool4FromBackup(preSurveyData) {
    const monthlyIncome = parseFloat(preSurveyData.backup_monthlyIncome) || 0;
    const monthlyBudget = parseFloat(preSurveyData.backup_monthlyBudget) || 0;
    const yearsToRetirement = parseInt(preSurveyData.backup_yearsToRetirement) || 25;
    const investmentScore = parseInt(preSurveyData.backup_investmentScore) || 4;

    // Only return if we have meaningful data
    if (monthlyBudget <= 0) {
      return null;
    }

    Logger.log('Derived Tool 4 from backup: budget=' + monthlyBudget + ', years=' + yearsToRetirement + ', score=' + investmentScore);

    return {
      monthlyTakeHome: monthlyIncome,
      monthlyBudget: monthlyBudget,
      yearsToRetirement: yearsToRetirement,
      investmentScore: investmentScore,
      multiplyPercent: monthlyIncome > 0 ? Math.round((monthlyBudget / monthlyIncome) * 100) : 0
    };
  },

  /**
   * Sprint 10.1: Derive Tool 2 data from backup questions
   * Called when Tool 2 data is missing but user provided backup answers
   *
   * @param {Object} preSurveyData - Form data containing backup_ prefixed fields
   * @returns {Object} Derived Tool 2 equivalent values
   */
  deriveTool2FromBackup(preSurveyData) {
    const age = parseInt(preSurveyData.backup_age) || null;
    const grossIncome = parseFloat(preSurveyData.backup_grossIncome) || null;
    const employmentType = preSurveyData.backup_employmentType || null;
    const filingStatus = preSurveyData.backup_filingStatus || null;

    // Only return if we have at least age (most critical)
    if (!age) {
      return null;
    }

    // Infer HSA coverage type from filing status
    const hsaCoverageType = filingStatus === 'MFJ' ? 'Family' : 'Individual';

    // Infer business owner from employment type
    const businessOwner = employmentType === 'Business Owner';

    Logger.log('Derived Tool 2 from backup: age=' + age + ', income=' + grossIncome + ', filing=' + filingStatus);

    return {
      age: age,
      grossIncome: grossIncome,
      employmentType: employmentType,
      filingStatus: filingStatus,
      hsaCoverageType: hsaCoverageType,
      businessOwner: businessOwner
    };
  },

  /**
   * Sprint 10.1: Derive trauma pattern from backup questions
   * Uses majority voting across 3 questions (same as Tool 4)
   *
   * @param {Object} preSurveyData - Form data containing backup_ prefixed fields
   * @returns {string|null} Trauma pattern (FSV, ExVal, Showing, Receiving, Control, Fear) or null
   */
  deriveTraumaPatternFromBackup(preSurveyData) {
    const stressResponse = preSurveyData.backup_stressResponse;
    const coreBelief = preSurveyData.backup_coreBelief;
    const consequence = preSurveyData.backup_consequence;

    // If no backup questions answered, return null
    if (!stressResponse && !coreBelief && !consequence) {
      return null;
    }

    // Count votes for each pattern
    const votes = { FSV: 0, ExVal: 0, Showing: 0, Receiving: 0, Control: 0, Fear: 0 };
    const patterns = Object.keys(votes);

    if (stressResponse && patterns.includes(stressResponse)) {
      votes[stressResponse]++;
    }
    if (coreBelief && patterns.includes(coreBelief)) {
      votes[coreBelief]++;
    }
    if (consequence && patterns.includes(consequence)) {
      votes[consequence]++;
    }

    // Find pattern with most votes
    let maxVotes = 0;
    let winner = null;

    for (const pattern of patterns) {
      if (votes[pattern] > maxVotes) {
        maxVotes = votes[pattern];
        winner = pattern;
      }
    }

    Logger.log('Derived trauma pattern from backup: ' + winner + ' (votes: ' + JSON.stringify(votes) + ')');
    return winner;
  },

  /**
   * Sprint 10.1: Merge backup-derived data into toolStatus
   * Called after checkToolCompletion to supplement missing data
   *
   * @param {Object} toolStatus - Original tool status from checkToolCompletion
   * @param {Object} preSurveyData - Form data that may contain backup answers
   * @returns {Object} Updated toolStatus with backup data merged in
   */
  mergeBackupData(toolStatus, preSurveyData) {
    if (!preSurveyData) return toolStatus;

    const merged = { ...toolStatus };

    // Derive and merge Tool 4 data if missing
    if (!toolStatus.hasTool4 || !toolStatus.monthlyBudget) {
      const derived4 = this.deriveTool4FromBackup(preSurveyData);
      if (derived4) {
        merged.monthlyTakeHome = derived4.monthlyTakeHome || merged.monthlyTakeHome;
        merged.monthlyBudget = derived4.monthlyBudget || merged.monthlyBudget;
        merged.yearsToRetirement = derived4.yearsToRetirement || merged.yearsToRetirement;
        merged.investmentScore = derived4.investmentScore || merged.investmentScore;
        merged.multiplyPercent = derived4.multiplyPercent || merged.multiplyPercent;
        merged.hasCriticalData = derived4.monthlyBudget > 0;
        merged.hasBackupTool4 = true;
        Logger.log('Merged backup Tool 4 data into toolStatus');
      }
    }

    // Derive and merge Tool 2 data if missing
    if (!toolStatus.hasTool2 || !toolStatus.age) {
      const derived2 = this.deriveTool2FromBackup(preSurveyData);
      if (derived2) {
        merged.age = derived2.age || merged.age;
        merged.grossIncome = derived2.grossIncome || merged.grossIncome;
        merged.employmentType = derived2.employmentType || merged.employmentType;
        merged.filingStatus = derived2.filingStatus || merged.filingStatus;
        merged.hsaCoverageType = derived2.hsaCoverageType || merged.hsaCoverageType;
        merged.businessOwner = derived2.businessOwner || merged.businessOwner;
        merged.hasBackupTool2 = true;
        Logger.log('Merged backup Tool 2 data into toolStatus');
      }
    }

    // Derive and merge trauma pattern if missing
    if (!toolStatus.hasTool1 || !toolStatus.traumaPattern) {
      const derivedPattern = this.deriveTraumaPatternFromBackup(preSurveyData);
      if (derivedPattern) {
        merged.traumaPattern = derivedPattern;
        merged.hasBackupTool1 = true;
        Logger.log('Merged backup trauma pattern into toolStatus: ' + derivedPattern);
      }
    }

    return merged;
  },

  /**
   * Get data availability status for UI display
   * Returns status badges (green/yellow/red) for each data category
   */
  getDataStatus(toolStatus) {
    // Define field requirements by category
    const categories = {
      demographics: {
        label: 'Demographics',
        fields: ['age', 'grossIncome', 'employmentType', 'filingStatus'],
        source: 'Tool 2',
        critical: false
      },
      financial: {
        label: 'Financial Data',
        fields: ['monthlyBudget', 'monthlyTakeHome', 'yearsToRetirement'],
        source: 'Tool 4',
        critical: true  // Tool 4 is REQUIRED
      },
      investment: {
        label: 'Investment Profile',
        fields: ['investmentScore'],
        source: 'Tool 4',
        critical: false
      },
      trauma: {
        label: 'Trauma Insights',
        fields: ['traumaPattern'],
        source: 'Tool 1',
        critical: false
      },
      identity: {
        label: 'Identity Insights',
        fields: ['identitySubdomainScores'],
        source: 'Tool 3',
        critical: false
      },
      connection: {
        label: 'Connection Insights',
        fields: ['connectionSubdomainScores'],
        source: 'Tool 5',
        critical: false
      }
    };

    const status = {};

    for (const [key, category] of Object.entries(categories)) {
      const presentFields = category.fields.filter(field => {
        const value = toolStatus[field];
        return value !== null && value !== undefined && value !== '' && value !== 0;
      });

      const totalFields = category.fields.length;
      const presentCount = presentFields.length;

      // Determine status: green (all), yellow (partial), red (none)
      let badgeStatus;
      if (presentCount === totalFields) {
        badgeStatus = 'complete';  // Green
      } else if (presentCount > 0) {
        badgeStatus = 'partial';   // Yellow
      } else {
        badgeStatus = 'missing';   // Red
      }

      status[key] = {
        label: category.label,
        source: category.source,
        status: badgeStatus,
        critical: category.critical,
        presentCount,
        totalFields,
        missingFields: category.fields.filter(f => !presentFields.includes(f))
      };
    }

    // Overall readiness check
    const financialReady = status.financial.status !== 'missing' && toolStatus.monthlyBudget > 0;
    const demographicsReady = status.demographics.status !== 'missing';

    status.overall = {
      canProceed: financialReady,
      readyForCalculation: financialReady && demographicsReady,
      blockerMessage: !financialReady
        ? 'Tool 4 must be completed first. Monthly retirement budget is required.'
        : null
    };

    return status;
  },

  /**
   * Get saved pre-survey data
   */
  getPreSurvey(clientId) {
    try {
      const preSurveyKey = `tool6_presurvey_${clientId}`;
      const preSurveyData = PropertiesService.getUserProperties().getProperty(preSurveyKey);
      const parsed = preSurveyData ? JSON.parse(preSurveyData) : null;
      Logger.log(`Retrieved pre-survey for ${clientId}: ${JSON.stringify(parsed)}`);
      return parsed;
    } catch (error) {
      Logger.log(`Error getting pre-survey: ${error}`);
      return null;
    }
  },

  /**
   * Save pre-survey data and return updated page HTML
   */
  savePreSurvey(clientId, preSurveyData) {
    try {
      const preSurveyKey = `tool6_presurvey_${clientId}`;
      Logger.log(`Saving pre-survey data: ${JSON.stringify(preSurveyData)}`);
      PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));
      Logger.log(`Pre-survey saved for client: ${clientId}`);

      // Recalculate with new data
      let toolStatus = this.checkToolCompletion(clientId);
      const savedPreSurvey = this.getPreSurvey(clientId);

      // Sprint 10.1: Merge backup data if user answered backup questions
      if (savedPreSurvey) {
        toolStatus = this.mergeBackupData(toolStatus, savedPreSurvey);
      }

      let allocation = null;
      let profile = null;

      if (savedPreSurvey) {
        try {
          profile = this.classifyProfile(clientId, savedPreSurvey, toolStatus);
          allocation = this.calculateAllocation(clientId, savedPreSurvey, profile, toolStatus);
        } catch (calcError) {
          Logger.log(`Error calculating allocation: ${calcError}`);
        }
      }

      const htmlContent = this.buildUnifiedPage(clientId, toolStatus, savedPreSurvey, profile, allocation);
      return { success: true, nextPageHtml: htmlContent };
    } catch (error) {
      Logger.log(`Error saving pre-survey: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check ROBS eligibility based on qualifier questions
   * All three must be 'Yes' to qualify
   * Legacy: code.js lines 3131-3136
   *
   * Supports both old (q8_, q9_, q10_) and new (c2_, c3_, c4_) field names
   */
  checkROBSEligibility(preSurveyData) {
    // Support both old and new field names
    const newBiz = preSurveyData.c2_robsQualifier1 || preSurveyData.q8_robsNewBusiness;
    const balance = preSurveyData.c3_robsQualifier2 || preSurveyData.q9_robsBalance;
    const setup = preSurveyData.c4_robsQualifier3 || preSurveyData.q10_robsSetupCost;

    const qualifies = newBiz === 'Yes' && balance === 'Yes' && setup === 'Yes';

    const reasons = [];
    if (newBiz !== 'Yes') {
      reasons.push('Business structure not eligible for ROBS');
    }
    if (balance !== 'Yes') {
      reasons.push('Insufficient rollover balance (need $50k+)');
    }
    if (setup !== 'Yes') {
      reasons.push('Cannot fund setup costs ($5-10k)');
    }

    return { qualifies, reasons };
  },

  /**
   * Classify client into one of 9 investor profiles
   *
   * TWO-PHASE APPROACH:
   * 1. Check DERIVED values from upstream tools (can short-circuit without questions)
   * 2. Use questionnaire answers for remaining classification
   *
   * LEGACY ALIGNMENT: Decision tree matches code.js lines 3127-3152.
   * First match wins - order matters!
   *
   * Profile Order:
   * 1. ROBS-In-Use Strategist
   * 2. ROBS-Curious Candidate (qualifies)
   * 3. Business Owner with Employees
   * 4. Solo 401(k) Optimizer
   * 5. Bracket Strategist (has Trad IRA)
   * 9. Late-Stage Growth (age >= 55 OR near retirement) - DERIVED
   * 6. Catch-Up Contributor (age >= 50 AND catch-up feeling) - DERIVED
   * 8. Roth Maximizer (tax focus = Now/Both)
   * 7. Foundation Builder (default)
   */
  classifyProfile(clientId, preSurveyData, toolStatus) {
    const profiles = PROFILE_DEFINITIONS;

    // ========================================================================
    // EXTRACT UPSTREAM DATA (for derived checks)
    // ========================================================================
    const age = parseInt(preSurveyData.age) ||
                parseInt(preSurveyData.a2_yearsToRetirement ? 65 - preSurveyData.a2_yearsToRetirement : 0) ||
                toolStatus.age || 35;
    const yearsToRetirement = parseInt(preSurveyData.a2_yearsToRetirement) ||
                              toolStatus.yearsToRetirement || 30;

    // ========================================================================
    // EXTRACT QUESTIONNAIRE ANSWERS (support both old and new field names)
    // ========================================================================

    // ROBS Status (new: c1_robsStatus, old: q6_robsInUse + q7_robsInterest)
    let robsInUse = false;
    let robsInterested = false;

    if (preSurveyData.c1_robsStatus) {
      // New two-phase format
      robsInUse = preSurveyData.c1_robsStatus === 'using';
      robsInterested = preSurveyData.c1_robsStatus === 'interested';
    } else {
      // Legacy format
      robsInUse = preSurveyData.q6_robsInUse === 'Yes';
      robsInterested = preSurveyData.q7_robsInterest === 'Yes';
    }

    // Work Situation (new: c5_workSituation, old: q3_workSituation + q4_ownsBusiness + q5_hasW2Employees)
    let workSituation = 'W-2';
    let hasEmployees = false;

    if (preSurveyData.c5_workSituation) {
      // New two-phase format - combined question
      workSituation = preSurveyData.c5_workSituation;
      hasEmployees = workSituation === 'BizWithEmployees';
      // Normalize for downstream logic
      if (workSituation === 'BizWithEmployees') {
        workSituation = 'Self-employed';
      }
    } else {
      // Legacy format
      workSituation = preSurveyData.q3_workSituation || 'W-2';
      hasEmployees = preSurveyData.q5_hasW2Employees === 'Yes';
    }

    // Traditional IRA (new: c6_hasTradIRA, old: q14_hasTradIRA)
    const hasTradIRA = preSurveyData.c6_hasTradIRA === 'Yes' ||
                       preSurveyData.q14_hasTradIRA === 'Yes';

    // Tax Focus (new: c7_taxFocus, old: q16_taxFocus)
    const taxFocus = preSurveyData.c7_taxFocus || preSurveyData.q16_taxFocus || 'Later';

    // Catch-up feeling (old format only - new format uses derived check)
    const catchUpFeeling = preSurveyData.q17_catchUpFeeling === 'Yes';

    // Near retirement (can be derived from yearsToRetirement)
    const nearRetire = preSurveyData.q18_nearRetirement === 'Yes' || yearsToRetirement <= 5;

    // ========================================================================
    // DECISION TREE - First Match Wins (Legacy code.js lines 3127-3152)
    // ========================================================================

    // Profile 1: ROBS-In-Use Strategist
    if (robsInUse) {
      return {
        ...profiles[1],
        matchReason: 'You are currently using a ROBS structure'
      };
    }

    // Profile 2: ROBS-Curious Candidate
    if (robsInterested) {
      const robsEligibility = this.checkROBSEligibility(preSurveyData);
      if (robsEligibility.qualifies) {
        return {
          ...profiles[2],
          matchReason: 'You are interested in ROBS and meet all eligibility requirements'
        };
      }
      // If interested but does not qualify, fall through
    }

    // Profile 3: Business Owner with Employees
    if (hasEmployees || preSurveyData.c5_workSituation === 'BizWithEmployees') {
      return {
        ...profiles[3],
        matchReason: 'Business owner with employees - SEP-IRA, SIMPLE, or 401(k) options available'
      };
    }

    // Profile 4: Solo 401(k) Optimizer
    if ((workSituation === 'Self-employed' || workSituation === 'Both') && !hasEmployees) {
      return {
        ...profiles[4],
        matchReason: 'Self-employed without employees - Solo 401(k) offers high contribution limits'
      };
    }

    // Profile 5: Bracket Strategist (has Traditional IRA)
    if (hasTradIRA) {
      return {
        ...profiles[5],
        matchReason: 'You have a Traditional IRA - backdoor Roth and conversion strategies available'
      };
    }

    // Profile 9: Late-Stage Growth (DERIVED CHECK)
    // age >= 55 OR yearsToRetirement <= 5
    if (age >= 55 || nearRetire) {
      return {
        ...profiles[9],
        matchReason: 'Near retirement - focus on catch-up contributions and preservation'
      };
    }

    // Profile 6: Catch-Up Contributor (DERIVED CHECK)
    // age >= 50 AND (catchUpFeeling OR retirementConfidence < 0)
    if (age >= 50 && catchUpFeeling) {
      return {
        ...profiles[6],
        matchReason: 'Age 50+ and ready to accelerate - maximize catch-up contributions'
      };
    }

    // Profile 8: Roth Maximizer (Traditional tax focus)
    if (taxFocus === 'Now' || taxFocus === 'Both') {
      return {
        ...profiles[8],
        matchReason: 'Prioritizing current tax reduction with Traditional/pre-tax contributions'
      };
    }

    // Profile 7: Foundation Builder (DEFAULT)
    return {
      ...profiles[7],
      matchReason: 'Building your retirement foundation with a balanced approach'
    };
  },

  /**
   * Compute domain weights using Ambition Quotient algorithm
   * Legacy alignment: code.js lines 3512-3551 (computeDomainsAndWeights)
   *
   * ADAPTIVE LOGIC:
   * - Only calculates weights for ACTIVE domains
   * - Retirement: Always active
   * - Education: Active if hasChildren === 'Yes'
   * - Health: Active if hsaEligible === 'Yes'
   *
   * FORMULA:
   * 1. importance = (score - 1) / 6   (normalize 1-7 to 0-1)
   * 2. urgency = 1 / (1 + r)^months   (discount factor)
   * 3. raw_weight = (importance + urgency) / 2
   * 4. final_weight = raw_weight / sum(all_weights)
   *
   * @param {Object} preSurveyData - All questionnaire answers including ambition scores
   * @returns {Object} { Retirement: w1, Education: w2, Health: w3, activeDomains: [...] }
   */
  computeDomainsAndWeights(preSurveyData) {
    const r = AMBITION_QUOTIENT_CONFIG.MONTHLY_DISCOUNT_RATE || 0.005;

    // Determine active domains based on Phase B answers
    const activeDomains = ['Retirement']; // Always active
    if (preSurveyData.a8_hasChildren === 'Yes') activeDomains.push('Education');
    if (preSurveyData.a7_hsaEligible === 'Yes') activeDomains.push('Health');

    // If only retirement is active, return 100% retirement
    if (activeDomains.length === 1) {
      return {
        Retirement: 1.0,
        Education: 0,
        Health: 0,
        activeDomains: activeDomains
      };
    }

    // Extract time horizons (in months)
    const yearsToRetirement = parseInt(preSurveyData.a2_yearsToRetirement) || 30;
    const yearsToEducation = parseInt(preSurveyData.a10_yearsToEducation) || 18;
    const yearsToHealth = yearsToRetirement; // Use same timeline as retirement for health

    const timelines = {
      Retirement: yearsToRetirement * 12,
      Education: yearsToEducation * 12,
      Health: yearsToHealth * 12
    };

    // Calculate importance scores (normalize 1-7 to 0-1)
    const getImportance = (domain) => {
      const fieldId = `aq_${domain.toLowerCase()}_importance`;
      const score = parseInt(preSurveyData[fieldId]) || 4;
      return (score - 1) / 6;
    };

    // Calculate weights for each active domain
    const domains = {};
    let maxUrgency = 0;

    // First pass: calculate raw urgency values
    for (const domain of activeDomains) {
      const t = timelines[domain];
      const urgencyRaw = 1 / Math.pow(1 + r, t);
      domains[domain] = {
        importance: getImportance(domain),
        urgencyRaw: urgencyRaw,
        t: t
      };
      maxUrgency = Math.max(maxUrgency, urgencyRaw);
    }

    // Second pass: normalize urgency and calculate weights
    let sumWeights = 0;
    for (const domain of activeDomains) {
      const d = domains[domain];
      d.urgencyNorm = d.urgencyRaw / maxUrgency;
      d.weight = (d.importance + d.urgencyNorm) / 2;
      sumWeights += d.weight;
    }

    // Third pass: normalize weights to sum to 1
    const result = {
      Retirement: 0,
      Education: 0,
      Health: 0,
      activeDomains: activeDomains
    };

    for (const domain of activeDomains) {
      result[domain] = domains[domain].weight / sumWeights;
    }

    // Apply tie-breaker boost if all 3 domains active and tie-breaker selected
    if (activeDomains.length === 3 && preSurveyData.aq_tiebreaker) {
      const tieBreakerDomain = preSurveyData.aq_tiebreaker;
      // Give 10% boost to tie-breaker domain, reduce others proportionally
      const boost = 0.10;
      const currentWeight = result[tieBreakerDomain];
      const newWeight = Math.min(currentWeight + boost, 0.80); // Cap at 80%
      const actualBoost = newWeight - currentWeight;

      // Reduce other domains proportionally
      const otherDomains = activeDomains.filter(d => d !== tieBreakerDomain);
      const otherTotal = otherDomains.reduce((sum, d) => sum + result[d], 0);

      result[tieBreakerDomain] = newWeight;
      for (const d of otherDomains) {
        result[d] = result[d] - (actualBoost * (result[d] / otherTotal));
      }
    }

    return result;
  },

  // ==========================================================================
  // VEHICLE ALLOCATION ENGINE (Phase 4)
  // ==========================================================================

  /**
   * Sprint 4.1: Get eligible vehicles for user based on profile and inputs
   *
   * Eligibility depends on:
   * - Profile (ROBS, self-employed, W-2, etc.)
   * - HSA eligibility (HDHP enrollment)
   * - Employer plan availability (401k, match, Roth option)
   * - Income (Roth IRA phase-out)
   * - Age (catch-up eligibility)
   *
   * @param {Object} profile - User's profile from classifyProfile()
   * @param {Object} inputs - Combined data from preSurvey and toolStatus
   * @returns {Object} Map of eligible vehicles with their monthly limits
   */
  getEligibleVehicles(profile, inputs, taxPreference = 'Both') {
    const profileId = profile.id;
    const age = parseInt(inputs.age) || 35;
    const grossIncome = parseFloat(inputs.grossIncome) || 0;
    const filingStatus = inputs.filingStatus || 'Single';

    // Extract questionnaire answers
    const hsaEligible = inputs.hsaEligible === 'Yes' || inputs.a7_hsaEligible === 'Yes';
    const has401k = inputs.has401k === 'Yes' || inputs.a3_has401k === 'Yes';
    const hasMatch = inputs.hasMatch === 'Yes' || inputs.a4_hasMatch === 'Yes';
    const hasRoth401k = inputs.hasRoth401k === 'Yes' || inputs.a6_hasRoth401k === 'Yes';
    const hasChildren = inputs.hasChildren === 'Yes' || inputs.a8_hasChildren === 'Yes';

    // Sprint 12.1: Backdoor Roth pro-rata inputs
    const tradIRABalance = inputs.tradIRABalance || inputs.a13b_tradIRABalance || 'none';
    const has401kAcceptsRollovers = inputs.a13c_401kAcceptsRollovers === 'yes';

    // Sprint 12.2: Self-employment income for Solo 401(k) calculation
    const selfEmploymentIncome = parseFloat(inputs.selfEmploymentIncome || inputs.a13d_selfEmploymentIncome) || 0;

    const eligible = {};

    // Helper: Get monthly limit with catch-up
    const getMonthlyLimit = (vehicleName) => {
      const def = VEHICLE_DEFINITIONS[vehicleName];
      if (!def) return 0;

      // Vehicles without limits (employer match, ROBS, taxable)
      if (def.hasLimit === false || def.isNonDiscretionary) {
        return Infinity;
      }

      let annualLimit = 0;

      // HSA has coverage-based limits
      if (vehicleName === 'HSA') {
        const coverageType = filingStatus === 'MFJ' ? 'Family' : 'Individual';
        annualLimit = coverageType === 'Family'
          ? IRS_LIMITS_2025.HSA_FAMILY
          : IRS_LIMITS_2025.HSA_INDIVIDUAL;
        // HSA catch-up at 55+ (not 50)
        if (age >= 55) {
          annualLimit += IRS_LIMITS_2025.HSA_CATCHUP;
        }
        return annualLimit / 12;
      }

      // Standard vehicle with annual limit
      annualLimit = def.annualLimit || 0;

      // Add catch-up for age 50+
      if (def.catchUpAge && age >= def.catchUpAge) {
        // SECURE 2.0 super catch-up for ages 60-63
        if (def.superCatchUpAge && age >= def.superCatchUpAge && age <= 63) {
          annualLimit += def.superCatchUpAmount || 0;
        } else {
          annualLimit += def.catchUpAmount || 0;
        }
      }

      return annualLimit / 12;
    };

    // Helper: Check Roth IRA eligibility (income phase-out)
    const getRothIRAEligibility = () => {
      const limits = IRS_LIMITS_2025.ROTH_PHASE_OUT[filingStatus] ||
                     IRS_LIMITS_2025.ROTH_PHASE_OUT.SINGLE;

      if (grossIncome >= limits.end) {
        // Completely phased out - use Backdoor Roth instead
        return { eligible: false, useBackdoor: true, limit: 0 };
      } else if (grossIncome > limits.start) {
        // Partial phase-out
        const phaseOutRatio = (limits.end - grossIncome) / (limits.end - limits.start);
        const baseLimit = IRS_LIMITS_2025.ROTH_IRA + (age >= 50 ? IRS_LIMITS_2025.CATCHUP_IRA : 0);
        return { eligible: true, useBackdoor: false, limit: (baseLimit * phaseOutRatio) / 12 };
      } else {
        // Full eligibility
        return { eligible: true, useBackdoor: false, limit: getMonthlyLimit('IRA Roth') };
      }
    };

    // =======================================================================
    // ELIGIBILITY RULES BY VEHICLE
    // =======================================================================

    // --- ROBS Vehicles (Profile 1 only) ---
    if (profileId === 1) {
      eligible['ROBS Distribution'] = { monthlyLimit: Infinity, domain: 'Retirement' };
    }

    // --- Solo 401(k) Vehicles (Profile 4 - Self-employed, no employees) ---
    // Employee contributions can be Roth or Traditional based on tax preference
    if (profileId === 4) {
      const soloEmployeeLimit = getMonthlyLimit('Solo 401(k) Employee');

      // Add Roth and/or Traditional based on tax preference
      if (taxPreference === 'Now') {
        // Roth-heavy: only show Roth option
        eligible['Solo 401(k) Employee (Roth)'] = {
          monthlyLimit: soloEmployeeLimit,
          domain: 'Retirement'
        };
      } else if (taxPreference === 'Later') {
        // Traditional-heavy: only show Traditional option
        eligible['Solo 401(k) Employee (Traditional)'] = {
          monthlyLimit: soloEmployeeLimit,
          domain: 'Retirement'
        };
      } else {
        // Both: show both options with shared limit
        // They share the same IRS limit ($23,500 total), so we mark them as sharing
        eligible['Solo 401(k) Employee (Roth)'] = {
          monthlyLimit: soloEmployeeLimit,
          domain: 'Retirement',
          sharesLimitWith: 'Solo 401(k) Employee (Traditional)'
        };
        eligible['Solo 401(k) Employee (Traditional)'] = {
          monthlyLimit: soloEmployeeLimit,
          domain: 'Retirement',
          sharesLimitWith: 'Solo 401(k) Employee (Roth)'
        };
      }

      // Employer contributions are always pre-tax
      // Sprint 12.2: Calculate dynamic limit based on self-employment income
      // Formula: MIN(25% of SE income, remaining room after employee deferrals)
      const seIncome = selfEmploymentIncome > 0 ? selfEmploymentIncome : grossIncome;
      const percentLimit = seIncome * SOLO_401K_EMPLOYER_NOTES.SOLE_PROP_LLC.percentOfCompensation;

      // Calculate total 401(k) limit based on age (with catch-up)
      let total401kLimit = IRS_LIMITS_2025.TOTAL_401K;
      if (age >= 60 && age <= 63) {
        total401kLimit = IRS_LIMITS_2025.TOTAL_401K_60;
      } else if (age >= 50) {
        total401kLimit = IRS_LIMITS_2025.TOTAL_401K_50;
      }

      // Remaining room after employee deferrals
      const employeeDeferralLimit = getMonthlyLimit('Solo 401(k) Employee') * 12;
      const remainingRoom = total401kLimit - employeeDeferralLimit;

      // Employer limit is the lesser of percent-based or remaining room
      const employerAnnualLimit = Math.min(percentLimit, remainingRoom, IRS_LIMITS_2025.TOTAL_401K - IRS_LIMITS_2025.EMPLOYEE_401K);
      const employerMonthlyLimit = Math.max(0, employerAnnualLimit) / 12;

      // Build note based on whether limit is income-constrained
      let employerNote = SOLO_401K_EMPLOYER_NOTES.SOLE_PROP_LLC.note;
      if (percentLimit < remainingRoom && selfEmploymentIncome > 0) {
        const formattedLimit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(employerAnnualLimit);
        employerNote = 'Your limit: ' + formattedLimit + '/year (20% of $' + seIncome.toLocaleString() + ' SE income)';
      }

      eligible['Solo 401(k) Employer'] = {
        monthlyLimit: employerMonthlyLimit,
        domain: 'Retirement',
        note: employerNote,
        calculatedAnnualLimit: employerAnnualLimit
      };
    }

    // --- SEP-IRA (Profile 3 only - Business Owner with Employees) ---
    // Note: Profile 4 (Solo 401k Optimizer) uses Solo 401(k) instead of SEP-IRA
    // Solo 401(k) has higher limits and more flexibility
    if (profileId === 3) {
      // SEP limit is 25% of compensation, max $70k
      const sepLimit = Math.min(grossIncome * 0.25, IRS_LIMITS_2025.SEP_IRA_MAX);
      eligible['SEP-IRA'] = {
        monthlyLimit: sepLimit / 12,
        domain: 'Retirement'
      };
    }

    // --- SIMPLE IRA (Profile 3 - Business with employees) ---
    if (profileId === 3) {
      eligible['SIMPLE IRA'] = {
        monthlyLimit: getMonthlyLimit('SIMPLE IRA'),
        domain: 'Retirement'
      };
    }

    // --- Employer 401(k) Plans (W-2 profiles: 5, 6, 7, 8, 9) ---
    // Also Profile 2 (ROBS-Curious) may still have W-2 job
    const w2Profiles = [2, 5, 6, 7, 8, 9];
    if (w2Profiles.includes(profileId) && has401k) {
      // Employer Match (non-discretionary - handled separately in seeds)
      if (hasMatch) {
        eligible['401(k) Employer Match'] = {
          monthlyLimit: Infinity,
          domain: 'Retirement',
          isNonDiscretionary: true
        };
      }

      // Traditional 401(k) - always available if employer offers 401k
      eligible['401(k) Traditional'] = {
        monthlyLimit: getMonthlyLimit('401(k) Traditional'),
        domain: 'Retirement'
      };

      // Roth 401(k) - only if employer plan offers it
      if (hasRoth401k) {
        eligible['401(k) Roth'] = {
          monthlyLimit: getMonthlyLimit('401(k) Roth'),
          domain: 'Retirement',
          sharesLimitWith: '401(k) Traditional'  // Combined $23,500 limit
        };
      }
    }

    // --- IRA Vehicles (Available to most profiles) ---
    // Traditional IRA - available to everyone
    eligible['IRA Traditional'] = {
      monthlyLimit: getMonthlyLimit('IRA Traditional'),
      domain: 'Retirement'
    };

    // Roth IRA - subject to income phase-out
    const rothEligibility = getRothIRAEligibility();
    if (rothEligibility.eligible) {
      eligible['IRA Roth'] = {
        monthlyLimit: rothEligibility.limit,
        domain: 'Retirement',
        sharesLimitWith: 'IRA Traditional'  // Combined $7,000 limit
      };
    }

    // Backdoor Roth IRA - for high earners above phase-out
    // Sprint 12.1: Add pro-rata warning based on Traditional IRA balance
    if (rothEligibility.useBackdoor) {
      // Determine which warning/note to use based on tradIRABalance
      let backdoorWarning = BACKDOOR_ROTH_WARNINGS.CLEAN;
      let proRataWarning = null;

      if (tradIRABalance === 'under10k' || tradIRABalance === 'over10k') {
        // User has Traditional IRA balance - check if they can roll to 401(k)
        if (has401k && has401kAcceptsRollovers) {
          backdoorWarning = BACKDOOR_ROTH_WARNINGS.ROLLOVER_AVAILABLE;
        } else {
          backdoorWarning = BACKDOOR_ROTH_WARNINGS.PRO_RATA;
        }
        proRataWarning = backdoorWarning.warning;
      } else if (tradIRABalance === 'unsure') {
        backdoorWarning = BACKDOOR_ROTH_WARNINGS.UNSURE;
        proRataWarning = backdoorWarning.warning;
      }
      // else: tradIRABalance === 'none' or empty - use CLEAN (no warning)

      eligible['Backdoor Roth IRA'] = {
        monthlyLimit: getMonthlyLimit('Backdoor Roth IRA'),
        domain: 'Retirement',
        sharesLimitWith: 'IRA Traditional',
        note: backdoorWarning.note,
        executionSteps: backdoorWarning.executionSteps,
        warning: proRataWarning
      };

      // If rollover is available and recommended, add the action item
      if (backdoorWarning === BACKDOOR_ROTH_WARNINGS.ROLLOVER_AVAILABLE) {
        eligible['IRA Rollover to 401k'] = {
          monthlyLimit: 0,  // Action item, not a contribution vehicle
          domain: 'Retirement',
          isActionItem: true,
          note: backdoorWarning.actionItem
        };
      }
    }

    // --- HSA (Requires HDHP enrollment) ---
    if (hsaEligible) {
      eligible['HSA'] = {
        monthlyLimit: getMonthlyLimit('HSA'),
        domain: 'Health'
      };
    }

    // --- Education Vehicles (If has children) ---
    // Respect user's vehicle preference (a11_educationVehicle)
    if (hasChildren) {
      const educationVehicleChoice = inputs.educationVehicle || '529';  // Default to 529
      const numChildren = inputs.numChildren || 1;

      // Coverdell limit is $2,000 per child per year
      const coverdellMonthlyLimit = (IRS_LIMITS_2025.COVERDELL_ESA * numChildren) / 12;

      if (educationVehicleChoice === '529') {
        // Only 529 Plan
        eligible['529 Plan'] = {
          monthlyLimit: Infinity,  // State-dependent, no federal limit
          domain: 'Education'
        };
      } else if (educationVehicleChoice === 'coverdell') {
        // Only Coverdell ESA
        eligible['Coverdell ESA'] = {
          monthlyLimit: coverdellMonthlyLimit,
          domain: 'Education'
        };
      } else if (educationVehicleChoice === 'both') {
        // Both - Coverdell fills first (lower limit), overflow to 529
        eligible['Coverdell ESA'] = {
          monthlyLimit: coverdellMonthlyLimit,
          domain: 'Education'
        };
        eligible['529 Plan'] = {
          monthlyLimit: Infinity,
          domain: 'Education'
        };
      }
    }

    // --- Family Bank (Always available - final overflow for all domains) ---
    eligible['Family Bank'] = {
      monthlyLimit: Infinity,
      domain: 'Overflow'
    };

    return eligible;
  },

  /**
   * Sprint 4.2: Get vehicle priority order for profile, filtered to eligible vehicles
   *
   * @param {number} profileId - User's profile ID (1-9)
   * @param {Object} eligibleVehicles - Map from getEligibleVehicles()
   * @param {string} taxPreference - 'Now' (Roth), 'Later' (Traditional), or 'Both'
   * @returns {Array} Ordered list of vehicle names
   */
  getVehiclePriorityOrder(profileId, eligibleVehicles, taxPreference) {
    // Get base priority order for this profile
    const basePriority = VEHICLE_PRIORITY_BY_PROFILE[profileId] || VEHICLE_PRIORITY_BY_PROFILE[7];

    // Filter to only eligible vehicles
    let filteredOrder = basePriority.filter(vehicle => eligibleVehicles[vehicle]);

    // Add education vehicles if eligible (not in VEHICLE_PRIORITY_BY_PROFILE)
    // Insert after HSA but before retirement vehicles
    // Order: Coverdell first (fills to limit), then 529 (overflow)
    const educationVehicles = ['Coverdell ESA', '529 Plan'].filter(v => eligibleVehicles[v]);
    if (educationVehicles.length > 0) {
      const hsaIndex = filteredOrder.indexOf('HSA');
      const insertIndex = hsaIndex >= 0 ? hsaIndex + 1 : 0;
      filteredOrder.splice(insertIndex, 0, ...educationVehicles);
    }

    // Add Backdoor Roth IRA if eligible (replaces IRA Roth for high earners)
    // IMPORTANT: Backdoor Roth shares limit with IRA Traditional, so it should be
    // placed BEFORE IRA Traditional to get priority (since it's the Roth option)
    if (eligibleVehicles['Backdoor Roth IRA'] && !filteredOrder.includes('Backdoor Roth IRA')) {
      const iraRothIndex = filteredOrder.indexOf('IRA Roth');
      const iraTradIndex = filteredOrder.indexOf('IRA Traditional');
      if (iraRothIndex >= 0) {
        // Insert at IRA Roth position (same priority as regular Roth IRA would have)
        filteredOrder.splice(iraRothIndex, 0, 'Backdoor Roth IRA');
      } else if (iraTradIndex >= 0) {
        // Insert BEFORE IRA Traditional (Backdoor Roth should get priority over Traditional)
        filteredOrder.splice(iraTradIndex, 0, 'Backdoor Roth IRA');
      } else {
        // Add before Family Bank
        const familyBankIndex = filteredOrder.indexOf('Family Bank');
        if (familyBankIndex >= 0) {
          filteredOrder.splice(familyBankIndex, 0, 'Backdoor Roth IRA');
        } else {
          filteredOrder.push('Backdoor Roth IRA');
        }
      }
    }

    // Apply tax strategy reordering
    if (taxPreference === 'Now') {
      // User wants tax-free retirement → prioritize Roth
      filteredOrder = this.prioritizeRothAccounts(filteredOrder);
    } else if (taxPreference === 'Later') {
      // User wants tax savings now → prioritize Traditional
      filteredOrder = this.prioritizeTraditionalAccounts(filteredOrder);
    }
    // 'Both' or undefined keeps the profile's default order

    return filteredOrder;
  },

  /**
   * Reorder vehicles to prioritize Roth accounts (for tax preference = 'Now')
   * HSA stays high priority regardless (triple tax advantage)
   */
  prioritizeRothAccounts(vehicleOrder) {
    const hsaVehicle = vehicleOrder.filter(v => v === 'HSA');
    const matchVehicle = vehicleOrder.filter(v => v.includes('Employer Match'));
    const rothVehicles = vehicleOrder.filter(v =>
      v.includes('Roth') && !v.includes('Employer Match')
    );
    const traditionalVehicles = vehicleOrder.filter(v =>
      v.includes('Traditional') && !v.includes('Employer Match')
    );
    const otherVehicles = vehicleOrder.filter(v =>
      !v.includes('Roth') && !v.includes('Traditional') &&
      v !== 'HSA' && !v.includes('Employer Match')
    );

    // Order: Match → HSA → Roth → Traditional → Other
    return [...matchVehicle, ...hsaVehicle, ...rothVehicles, ...traditionalVehicles, ...otherVehicles];
  },

  /**
   * Reorder vehicles to prioritize Traditional accounts (for tax preference = 'Later')
   * HSA stays high priority regardless (triple tax advantage)
   */
  prioritizeTraditionalAccounts(vehicleOrder) {
    const hsaVehicle = vehicleOrder.filter(v => v === 'HSA');
    const matchVehicle = vehicleOrder.filter(v => v.includes('Employer Match'));
    const traditionalVehicles = vehicleOrder.filter(v =>
      v.includes('Traditional') && !v.includes('Employer Match')
    );
    const rothVehicles = vehicleOrder.filter(v =>
      v.includes('Roth') && !v.includes('Employer Match')
    );
    const otherVehicles = vehicleOrder.filter(v =>
      !v.includes('Roth') && !v.includes('Traditional') &&
      v !== 'HSA' && !v.includes('Employer Match')
    );

    // Order: Match → HSA → Traditional → Roth → Other
    return [...matchVehicle, ...hsaVehicle, ...traditionalVehicles, ...rothVehicles, ...otherVehicles];
  },

  /**
   * Sprint 4.3: Calculate monthly employer match based on formula
   *
   * @param {number} grossAnnualIncome - User's gross annual income
   * @param {string} matchFormula - e.g., "100_6" for "100% up to 6%"
   * @returns {number} Monthly match amount in dollars
   */
  calculateEmployerMatch(grossAnnualIncome, matchFormula) {
    if (!matchFormula || matchFormula === 'other' || !grossAnnualIncome) {
      return 0;
    }

    // Parse formula: "100_6" means 100% up to 6%
    const match = matchFormula.match(/(\d+)_(\d+)/);
    if (!match) return 0;

    const matchRate = parseInt(match[1]) / 100;  // 1.00 for 100%
    const matchLimit = parseInt(match[2]) / 100; // 0.06 for 6%

    // Annual match = income * limit * rate
    const annualMatch = grossAnnualIncome * matchLimit * matchRate;

    // Monthly match
    return annualMatch / 12;
  },

  /**
   * Sprint 4.3: Get non-discretionary seeds (pre-filled before waterfall)
   *
   * Non-discretionary contributions are:
   * - Employer match (free money - not from user's budget)
   * - ROBS distributions (Profile 1)
   * - Defined Benefit minimums (Profile 3)
   *
   * @param {number} profileId - User's profile ID
   * @param {Object} userData - Combined preSurvey and toolStatus data
   * @returns {Object} Seeds by domain { Retirement: {}, Education: {}, Health: {} }
   */
  getNonDiscretionarySeeds(profileId, userData) {
    const seeds = {
      Retirement: {},
      Education: {},
      Health: {}
    };

    // Employer match (for W-2 employees with employer 401k)
    const hasMatch = userData.hasMatch === 'Yes' || userData.a4_hasMatch === 'Yes';
    const matchFormula = userData.matchFormula || userData.a5_matchFormula;
    const grossIncome = parseFloat(userData.grossIncome || userData.a1_grossIncome) || 0;

    if (hasMatch && matchFormula && grossIncome > 0) {
      const monthlyMatch = this.calculateEmployerMatch(grossIncome, matchFormula);
      if (monthlyMatch > 0) {
        seeds.Retirement['401(k) Employer Match'] = monthlyMatch;
      }
    }

    // ROBS distributions (Profile 1 only)
    if (profileId === 1 && userData.robsProfitDistribution) {
      seeds.Retirement['ROBS Distribution'] = parseFloat(userData.robsProfitDistribution) / 12;
    }

    // Defined Benefit Plan minimums (Profile 3 - Business Owner with Employees)
    if (profileId === 3 && userData.dbPlanAnnual) {
      seeds.Retirement['Defined Benefit Plan'] = parseFloat(userData.dbPlanAnnual) / 12;
    }

    return seeds;
  },

  /**
   * Sprint 4.3: Core waterfall allocation algorithm
   *
   * Implements the full allocation engine with:
   * - Domain budget allocation based on Ambition Quotient weights
   * - Leftover cascade: Education → Health → Retirement
   * - Cross-domain vehicle tracking (e.g., HSA in both Health and Retirement)
   * - Shared limit enforcement (401k Trad + Roth, IRA Trad + Roth)
   *
   * @param {Object} params - Allocation parameters
   * @param {Object} params.domainWeights - Weights from computeDomainsAndWeights()
   * @param {number} params.monthlyBudget - User's monthly discretionary budget
   * @param {Object} params.seeds - Non-discretionary seeds from getNonDiscretionarySeeds()
   * @param {Array} params.vehicleOrder - Priority order from getVehiclePriorityOrder()
   * @param {Object} params.eligibleVehicles - Map from getEligibleVehicles()
   * @returns {Object} Final allocations by vehicle name
   */
  coreAllocate({ domainWeights, monthlyBudget, seeds, vehicleOrder, eligibleVehicles }) {
    const allocations = {};
    const cumulativeAllocations = {};  // Track cross-domain usage

    // Initialize with seeds (non-discretionary)
    for (const domain of Object.keys(seeds)) {
      for (const [vehicle, amount] of Object.entries(seeds[domain])) {
        allocations[vehicle] = amount;
        cumulativeAllocations[vehicle] = amount;
      }
    }

    // Calculate domain budgets based on weights
    const domainBudgets = {
      Education: monthlyBudget * (domainWeights.Education || 0),
      Health: monthlyBudget * (domainWeights.Health || 0),
      Retirement: monthlyBudget * (domainWeights.Retirement || 0)
    };

    // Helper: Get effective limit accounting for shared limits and cumulative usage
    const getEffectiveLimit = (vehicle) => {
      const vehicleInfo = eligibleVehicles[vehicle];
      if (!vehicleInfo) return 0;

      let limit = vehicleInfo.monthlyLimit;
      if (limit === Infinity) return Infinity;

      // Account for cumulative usage of this vehicle
      const alreadyAllocated = cumulativeAllocations[vehicle] || 0;
      limit = Math.max(0, limit - alreadyAllocated);

      // Check shared limits (e.g., 401k Trad + Roth share $23,500)
      // Look for vehicles that share a limit with this one (bidirectional check)
      const sharedVehicles = [];

      // Check if this vehicle declares a shared limit
      if (vehicleInfo.sharesLimitWith) {
        sharedVehicles.push(vehicleInfo.sharesLimitWith);
      }

      // Check if other vehicles declare this one as shared
      for (const [otherVehicle, otherInfo] of Object.entries(eligibleVehicles)) {
        if (otherInfo.sharesLimitWith === vehicle) {
          sharedVehicles.push(otherVehicle);
        }
      }

      // Calculate combined usage across all shared vehicles
      if (sharedVehicles.length > 0) {
        let totalSharedAllocated = alreadyAllocated;
        for (const sharedVehicle of sharedVehicles) {
          totalSharedAllocated += cumulativeAllocations[sharedVehicle] || 0;
        }
        // Effective limit is base limit minus total used across shared group
        limit = Math.min(limit, Math.max(0, vehicleInfo.monthlyLimit - totalSharedAllocated));
      }

      return limit;
    };

    // Helper: Allocate within a domain using waterfall
    const allocateInDomain = (domainName, budget) => {
      let remaining = budget;

      // Get vehicles for this domain in priority order
      const domainVehicles = vehicleOrder.filter(v => {
        const info = eligibleVehicles[v];
        return info && info.domain === domainName && !info.isNonDiscretionary;
      });

      // Group vehicles that share limits (for balanced allocation)
      const processedVehicles = new Set();

      for (const vehicle of domainVehicles) {
        if (remaining <= 0) break;
        if (processedVehicles.has(vehicle)) continue;

        const vehicleInfo = eligibleVehicles[vehicle];
        const sharedWith = vehicleInfo?.sharesLimitWith;

        // Check if this vehicle shares a limit with another eligible vehicle
        if (sharedWith && eligibleVehicles[sharedWith] && domainVehicles.includes(sharedWith)) {
          // Split allocation 50/50 between the two vehicles
          processedVehicles.add(vehicle);
          processedVehicles.add(sharedWith);

          const sharedLimit = vehicleInfo.monthlyLimit;
          const alreadyUsed = (cumulativeAllocations[vehicle] || 0) + (cumulativeAllocations[sharedWith] || 0);
          const effectiveSharedLimit = Math.max(0, sharedLimit - alreadyUsed);

          if (effectiveSharedLimit <= 0) continue;

          // Split: allocate half to each, up to the shared limit
          const totalToAllocate = Math.min(remaining, effectiveSharedLimit);
          const halfAllocation = totalToAllocate / 2;

          if (halfAllocation > 0) {
            allocations[vehicle] = (allocations[vehicle] || 0) + halfAllocation;
            cumulativeAllocations[vehicle] = (cumulativeAllocations[vehicle] || 0) + halfAllocation;

            allocations[sharedWith] = (allocations[sharedWith] || 0) + halfAllocation;
            cumulativeAllocations[sharedWith] = (cumulativeAllocations[sharedWith] || 0) + halfAllocation;

            remaining -= totalToAllocate;
          }
        } else {
          // Normal waterfall for non-shared vehicles
          const effectiveLimit = getEffectiveLimit(vehicle);
          if (effectiveLimit <= 0) continue;

          const allocation = Math.min(remaining, effectiveLimit);
          if (allocation > 0) {
            allocations[vehicle] = (allocations[vehicle] || 0) + allocation;
            cumulativeAllocations[vehicle] = (cumulativeAllocations[vehicle] || 0) + allocation;
            remaining -= allocation;
          }
        }
      }

      return remaining;  // Return unused budget for cascade
    };

    // =======================================================================
    // LEFTOVER CASCADE: Education → Health → Retirement
    // =======================================================================

    // 1. Education domain gets its weighted share
    const leftoverEducation = allocateInDomain('Education', domainBudgets.Education);

    // 2. Health domain gets its share PLUS leftover from Education
    const healthBudget = domainBudgets.Health + leftoverEducation;
    const leftoverHealth = allocateInDomain('Health', healthBudget);

    // 3. Retirement domain gets its share PLUS leftover from Health
    const retirementBudget = domainBudgets.Retirement + leftoverHealth;
    const leftoverRetirement = allocateInDomain('Retirement', retirementBudget);

    // 4. Any remaining goes to Family Bank (final overflow)
    // Always include Family Bank (even if $0) so it shows in the UI
    allocations['Family Bank'] = leftoverRetirement > 0 ? leftoverRetirement : 0;

    return allocations;
  },

  /**
   * Sprint 4.3: Calculate vehicle allocation using waterfall algorithm
   * Core logic from spec section "Vehicle Allocation Engine"
   *
   * @param {string} clientId - Client ID
   * @param {Object} preSurveyData - User's questionnaire answers
   * @param {Object} profile - User's profile from classifyProfile()
   * @param {Object} toolStatus - Status from checkToolCompletion()
   * @returns {Object} Allocation result with vehicles, weights, and totals
   */
  calculateAllocation(clientId, preSurveyData, profile, toolStatus) {
    // Combine preSurvey and toolStatus for input data
    const inputs = {
      ...toolStatus,
      ...preSurveyData,
      // Ensure we have key fields (preSurveyData overrides toolStatus for user-adjustable settings)
      age: preSurveyData.age || toolStatus.age || 35,
      grossIncome: preSurveyData.a1_grossIncome || preSurveyData.grossIncome || toolStatus.grossIncome || 0,
      filingStatus: preSurveyData.filingStatus || toolStatus.filingStatus || 'Single',
      // Education fields
      numChildren: parseInt(preSurveyData.a9_numChildren) || 1,
      educationVehicle: preSurveyData.a11_educationVehicle || '529'
    };

    // Get monthly budget from Tool 4
    const monthlyBudget = parseFloat(preSurveyData.monthlyBudget) ||
                          parseFloat(toolStatus.monthlyBudget) || 0;

    if (monthlyBudget <= 0) {
      return {
        vehicles: {},
        domainWeights: AMBITION_QUOTIENT_CONFIG.DEFAULT_WEIGHTS,
        totalBudget: 0,
        employerMatch: 0,
        profile: profile,
        error: 'No monthly budget available. Please complete Tool 4 first.'
      };
    }

    // Step 1: Get tax preference (needed for vehicle eligibility and priority ordering)
    const taxPreference = preSurveyData.a2b_taxPreference || preSurveyData.taxPreference || 'Both';

    // Step 2: Get eligible vehicles (tax preference affects Roth vs Traditional options)
    const eligibleVehicles = this.getEligibleVehicles(profile, inputs, taxPreference);

    // Step 3: Get vehicle priority order
    const vehicleOrder = this.getVehiclePriorityOrder(profile.id, eligibleVehicles, taxPreference);

    // Step 4: Compute domain weights from Ambition Quotient
    const domainWeights = this.computeDomainsAndWeights(preSurveyData);

    // Step 5: Get non-discretionary seeds (employer match, etc.)
    const seeds = this.getNonDiscretionarySeeds(profile.id, inputs);
    const employerMatch = seeds.Retirement['401(k) Employer Match'] || 0;

    // Step 6: Run core allocation
    const allocations = this.coreAllocate({
      domainWeights,
      monthlyBudget,
      seeds,
      vehicleOrder,
      eligibleVehicles
    });

    // Calculate totals by domain
    const domainTotals = { Retirement: 0, Education: 0, Health: 0, Overflow: 0 };
    for (const [vehicle, amount] of Object.entries(allocations)) {
      const info = eligibleVehicles[vehicle] || VEHICLE_DEFINITIONS[vehicle];
      const domain = info?.domain || 'Overflow';
      domainTotals[domain] = (domainTotals[domain] || 0) + amount;
    }

    // Calculate total allocated (excluding employer match which is non-discretionary)
    const totalAllocated = Object.values(allocations).reduce((sum, amt) => sum + amt, 0) - employerMatch;

    return {
      vehicles: allocations,
      eligibleVehicles: eligibleVehicles,
      vehicleOrder: vehicleOrder,
      domainWeights: domainWeights,
      domainTotals: domainTotals,
      totalBudget: monthlyBudget,
      totalAllocated: totalAllocated,
      employerMatch: employerMatch,
      taxPreference: taxPreference,
      profile: profile,
      overflow: allocations['Family Bank'] || 0
    };
  },

  /**
   * Sprint 4.5: Validate allocations against IRS limits
   *
   * Checks:
   * - Individual vehicle limits (with catch-ups)
   * - Shared limits (401k Trad + Roth, IRA Trad + Roth)
   * - Total contribution limits
   *
   * @param {Object} allocations - Vehicle allocations (monthly)
   * @param {number} age - User's age
   * @param {string} filingStatus - 'Single', 'MFJ', or 'MFS'
   * @returns {Object} Validation result with warnings and isValid flag
   */
  validateAllocations(allocations, age, filingStatus) {
    const warnings = [];
    const annualAllocations = {};

    // Convert monthly to annual for validation
    for (const [vehicle, monthly] of Object.entries(allocations)) {
      annualAllocations[vehicle] = monthly * 12;
    }

    // Helper: Get annual limit with catch-up
    const getAnnualLimit = (vehicleName) => {
      const def = VEHICLE_DEFINITIONS[vehicleName];
      if (!def || def.hasLimit === false) return Infinity;

      let limit = def.annualLimit || 0;

      // HSA special handling
      if (vehicleName === 'HSA') {
        const coverageType = filingStatus === 'MFJ' ? 'Family' : 'Individual';
        limit = coverageType === 'Family'
          ? IRS_LIMITS_2025.HSA_FAMILY
          : IRS_LIMITS_2025.HSA_INDIVIDUAL;
        if (age >= 55) {
          limit += IRS_LIMITS_2025.HSA_CATCHUP;
        }
        return limit;
      }

      // Add catch-up
      if (def.catchUpAge && age >= def.catchUpAge) {
        if (def.superCatchUpAge && age >= def.superCatchUpAge && age <= 63) {
          limit += def.superCatchUpAmount || 0;
        } else {
          limit += def.catchUpAmount || 0;
        }
      }

      return limit;
    };

    // Check individual vehicle limits
    for (const [vehicle, annual] of Object.entries(annualAllocations)) {
      const limit = getAnnualLimit(vehicle);
      if (annual > limit && limit !== Infinity) {
        warnings.push({
          vehicle: vehicle,
          type: 'individual_limit',
          allocated: annual,
          limit: limit,
          message: `${vehicle} allocation ($${annual.toLocaleString()}/yr) exceeds IRS limit ($${limit.toLocaleString()}/yr)`
        });
      }
    }

    // Check shared limits: 401(k) Traditional + Roth
    const trad401k = annualAllocations['401(k) Traditional'] || 0;
    const roth401k = annualAllocations['401(k) Roth'] || 0;
    const combined401k = trad401k + roth401k;
    const limit401k = getAnnualLimit('401(k) Traditional');

    if (combined401k > limit401k) {
      warnings.push({
        vehicles: ['401(k) Traditional', '401(k) Roth'],
        type: 'shared_limit',
        allocated: combined401k,
        limit: limit401k,
        message: `Combined 401(k) contributions ($${combined401k.toLocaleString()}/yr) exceed shared limit ($${limit401k.toLocaleString()}/yr)`
      });
    }

    // Check shared limits: IRA Traditional + Roth
    const tradIRA = annualAllocations['IRA Traditional'] || 0;
    const rothIRA = annualAllocations['IRA Roth'] || 0;
    const backdoorRoth = annualAllocations['Backdoor Roth IRA'] || 0;
    const combinedIRA = tradIRA + rothIRA + backdoorRoth;
    const limitIRA = getAnnualLimit('IRA Traditional');

    if (combinedIRA > limitIRA) {
      warnings.push({
        vehicles: ['IRA Traditional', 'IRA Roth', 'Backdoor Roth IRA'],
        type: 'shared_limit',
        allocated: combinedIRA,
        limit: limitIRA,
        message: `Combined IRA contributions ($${combinedIRA.toLocaleString()}/yr) exceed shared limit ($${limitIRA.toLocaleString()}/yr)`
      });
    }

    return {
      isValid: warnings.length === 0,
      warnings: warnings,
      annualAllocations: annualAllocations
    };
  },

  // ============================================================================
  // PHASE 6: PROJECTIONS ENGINE
  // ============================================================================

  /**
   * Sprint 6.1: Calculate personalized return rate from investment score
   * Maps score 1-7 to 8%-20% annual return
   *
   * @param {number} investmentScore - Risk tolerance score (1-7)
   * @returns {number} Annual return rate (decimal)
   */
  calculatePersonalizedRate(investmentScore) {
    const score = Math.max(1, Math.min(7, investmentScore || 4));
    return PROJECTION_CONFIG.BASE_RATE +
           ((score - 1) / 6) * PROJECTION_CONFIG.MAX_ADDITIONAL_RATE;
    // Score 1 → 8%, Score 4 → 14%, Score 7 → 20%
  },

  /**
   * Sprint 6.1: Future value calculation with safeguards
   * Calculates FV of monthly contributions using monthly compounding
   *
   * @param {number} monthlyContribution - Monthly payment amount
   * @param {number} annualRate - Annual return rate (decimal, e.g., 0.10 for 10%)
   * @param {number} years - Investment timeline
   * @returns {number} Future value (capped at MAX_FV)
   */
  futureValue(monthlyContribution, annualRate, years) {
    // Input validation
    if (!monthlyContribution || monthlyContribution <= 0 || years <= 0) {
      return 0;
    }

    // Handle "no children" indicator (yearsToEducation = 99)
    if (years >= 99) {
      return 0;
    }

    // Apply safeguards
    years = Math.min(years, PROJECTION_CONFIG.MAX_YEARS);
    annualRate = Math.min(annualRate, PROJECTION_CONFIG.MAX_RATE);

    // Monthly compounding formula
    const monthlyRate = annualRate / 12;
    const months = years * 12;

    // Check for overflow before calculation
    const growthFactor = Math.pow(1 + monthlyRate, months);
    if (!isFinite(growthFactor) || growthFactor > 1000000) {
      return PROJECTION_CONFIG.MAX_FV;
    }

    // FV = PMT × ((1 + r)^n - 1) / r
    let fv;
    if (monthlyRate === 0) {
      fv = monthlyContribution * months;
    } else {
      fv = monthlyContribution * ((growthFactor - 1) / monthlyRate);
    }

    // Apply maximum cap
    return Math.min(Math.round(fv), PROJECTION_CONFIG.MAX_FV);
  },

  /**
   * Sprint 6.1: Calculate retirement projections
   * Computes future balance, real (inflation-adjusted) balance, baseline comparison
   *
   * @param {Object} inputs - Projection inputs
   * @param {number} inputs.currentBalance - Total current retirement balance
   * @param {number} inputs.monthlyContribution - Recommended monthly contribution
   * @param {number} inputs.yearsToRetirement - Years until retirement
   * @param {number} inputs.annualReturn - Expected annual return rate
   * @param {number} [inputs.inflationRate=0.025] - Inflation rate for real value calculation
   * @returns {Object} Projection results
   */
  calculateProjections(inputs) {
    const {
      currentBalance = 0,
      monthlyContribution = 0,
      yearsToRetirement = 0,
      annualReturn = 0.10,
      inflationRate = PROJECTION_CONFIG.DEFAULT_INFLATION
    } = inputs;

    // Edge case: 0 years = current balance
    if (yearsToRetirement <= 0) {
      return {
        projectedBalance: currentBalance,
        realBalance: currentBalance,
        baseline: currentBalance,
        improvement: 0,
        monthlyRetirementIncome: currentBalance / (25 * 12),
        yearsUsed: 0,
        rateUsed: annualReturn
      };
    }

    // Apply safeguards
    const cappedYears = Math.min(yearsToRetirement, PROJECTION_CONFIG.MAX_YEARS);
    const cappedRate = Math.min(annualReturn, PROJECTION_CONFIG.MAX_RATE);

    // Future value of monthly contributions (using safeguarded futureValue)
    const fvContributions = this.futureValue(monthlyContribution, cappedRate, cappedYears);

    // Future value of current balance (lump sum growth)
    const fvBalance = currentBalance * Math.pow(1 + cappedRate, cappedYears);

    // Total projected balance (capped at $100M)
    const projectedBalance = Math.min(
      Math.round(fvBalance + fvContributions),
      PROJECTION_CONFIG.MAX_FV
    );

    // Real (inflation-adjusted) balance
    const realBalance = Math.round(projectedBalance / Math.pow(1 + inflationRate, cappedYears));

    // Baseline (if they did nothing - just current balance growing)
    const baseline = Math.round(currentBalance * Math.pow(1 + cappedRate, cappedYears));

    // Improvement from following the plan
    const improvement = projectedBalance - baseline;

    // Monthly retirement income using 4% rule (divide by 300 months = 25 years)
    const monthlyRetirementIncome = Math.round(realBalance / (25 * 12));

    return {
      projectedBalance,
      realBalance,
      baseline,
      improvement,
      monthlyRetirementIncome,
      yearsUsed: cappedYears,
      rateUsed: cappedRate
    };
  },

  /**
   * Sprint 6.1: Calculate education domain projections
   * Separate from retirement - uses education-specific inputs and more conservative rate
   *
   * @param {Object} inputs - Education projection inputs
   * @param {number} inputs.currentEducationBalance - Combined 529/CESA/UTMA balance
   * @param {number} inputs.monthlyEducationContribution - Monthly education savings
   * @param {number} inputs.yearsToEducation - Years until first child needs funds
   * @param {number} inputs.numChildren - Number of children (for per-child estimate)
   * @param {number} [inputs.annualReturn=0.07] - Conservative education growth rate
   * @returns {Object} Education projection results
   */
  calculateEducationProjections(inputs) {
    const {
      currentEducationBalance = 0,
      monthlyEducationContribution = 0,
      yearsToEducation = 99,
      numChildren = 0,
      annualReturn = 0.07 // More conservative than retirement
    } = inputs;

    // Skip if no children or education disabled
    if (yearsToEducation >= 99 || numChildren === 0) {
      return {
        projectedBalance: 0,
        improvement: 0,
        baseline: 0,
        yearsUsed: 0,
        numChildren: 0,
        perChildEstimate: 0
      };
    }

    // Apply safeguards
    const cappedYears = Math.min(yearsToEducation, PROJECTION_CONFIG.MAX_YEARS);

    // Future value of monthly contributions
    const fvContributions = this.futureValue(monthlyEducationContribution, annualReturn, cappedYears);

    // Future value of current balance
    const fvBalance = currentEducationBalance * Math.pow(1 + annualReturn, cappedYears);

    // Total projected
    const projectedBalance = Math.min(
      Math.round(fvBalance + fvContributions),
      PROJECTION_CONFIG.MAX_FV
    );

    // Baseline (if they did nothing)
    const baseline = Math.round(currentEducationBalance * Math.pow(1 + annualReturn, cappedYears));

    return {
      projectedBalance,
      baseline,
      improvement: projectedBalance - baseline,
      yearsUsed: cappedYears,
      numChildren,
      perChildEstimate: numChildren > 0 ? Math.round(projectedBalance / numChildren) : 0
    };
  },

  /**
   * Sprint 6.3: Calculate tax-free vs taxable breakdown
   * Determines what percentage of projected balance will be tax-free at withdrawal
   *
   * @param {Object} allocations - Vehicle allocations (monthly amounts)
   * @param {Object} projections - Retirement projection results
   * @returns {Object} Tax breakdown with amounts and percentages
   */
  calculateTaxBreakdown(allocations, projections) {
    // Sum Roth allocations (tax-free at withdrawal)
    // Includes: 401(k) Roth, IRA Roth, Backdoor Roth, Mega Backdoor Roth, Solo 401(k) Roth, HSA
    const rothAllocation =
      (allocations['401(k) Roth'] || 0) +
      (allocations['IRA Roth'] || 0) +
      (allocations['Backdoor Roth IRA'] || 0) +
      (allocations['Mega Backdoor Roth'] || 0) +
      (allocations['Solo 401(k) Employee (Roth)'] || 0) +
      (allocations['HSA'] || 0); // HSA is tax-free if used for medical

    // Sum Traditional/Pre-tax allocations (taxable at withdrawal as ordinary income)
    // Includes: 401(k) Traditional, IRA Traditional, Solo 401(k) Traditional/Employer,
    //           SEP-IRA, SIMPLE IRA, Employer Match, ROBS, Defined Benefit
    const traditionalAllocation =
      (allocations['401(k) Traditional'] || 0) +
      (allocations['401(k) Employer Match'] || 0) +
      (allocations['IRA Traditional'] || 0) +
      (allocations['Solo 401(k) Employee (Traditional)'] || 0) +
      (allocations['Solo 401(k) Employer'] || 0) +
      (allocations['SEP-IRA'] || 0) +
      (allocations['SIMPLE IRA'] || 0) +
      (allocations['ROBS Distribution'] || 0) +
      (allocations['Defined Benefit Plan'] || 0);

    // Family Bank is taxable (capital gains)
    const taxableAllocation = allocations['Family Bank'] || 0;

    const totalAllocation = rothAllocation + traditionalAllocation + taxableAllocation;

    // Calculate percentages
    const rothPercentage = totalAllocation > 0 ? (rothAllocation / totalAllocation) * 100 : 0;
    const traditionalPercentage = totalAllocation > 0 ? (traditionalAllocation / totalAllocation) * 100 : 0;
    const taxablePercentage = totalAllocation > 0 ? (taxableAllocation / totalAllocation) * 100 : 0;

    // Apply percentages to projected balance
    const projectedBalance = projections.projectedBalance || 0;

    return {
      // Tax-free at withdrawal (Roth + HSA for medical)
      taxFreeAmount: Math.round(projectedBalance * (rothPercentage / 100)),
      taxFreePercentage: Math.round(rothPercentage),

      // Taxable as ordinary income (Traditional)
      taxDeferredAmount: Math.round(projectedBalance * (traditionalPercentage / 100)),
      taxDeferredPercentage: Math.round(traditionalPercentage),

      // Taxable as capital gains (Family Bank)
      capitalGainsAmount: Math.round(projectedBalance * (taxablePercentage / 100)),
      capitalGainsPercentage: Math.round(taxablePercentage),

      // Summary
      totalAllocation: Math.round(totalAllocation)
    };
  },

  /**
   * Sprint 6.1-6.3: Complete projection calculation for display
   * Combines retirement, education, and tax breakdown into single result
   *
   * @param {Object} preSurveyData - User's questionnaire answers
   * @param {Object} allocation - Vehicle allocation from calculateAllocation()
   * @param {Object} toolStatus - Upstream tool data
   * @returns {Object} Complete projection results for both domains
   */
  calculateCompleteProjections(preSurveyData, allocation, toolStatus) {
    if (!allocation || !allocation.vehicles) {
      return null;
    }

    // Get inputs
    const investmentScore = parseInt(preSurveyData.investmentScore || toolStatus.investmentScore) || 4;
    const annualReturn = this.calculatePersonalizedRate(investmentScore);
    const yearsToRetirement = parseInt(preSurveyData.a2_yearsToRetirement || toolStatus.yearsToRetirement) || 25;

    // Current balances
    const current401kBalance = parseFloat(preSurveyData.a12_current401kBalance) || 0;
    const currentIRABalance = parseFloat(preSurveyData.a13_currentIRABalance) || 0;
    const currentHSABalance = parseFloat(preSurveyData.a14_currentHSABalance) || 0;
    const currentRetirementBalance = current401kBalance + currentIRABalance + currentHSABalance;

    // Education inputs
    const hasChildren = preSurveyData.a8_hasChildren === 'Yes';
    const currentEducationBalance = parseFloat(preSurveyData.a15_currentEducationBalance) || 0;
    const numChildren = parseInt(preSurveyData.a9_numChildren) || 0;
    const yearsToEducation = parseInt(preSurveyData.a10_yearsToEducation) || 99;

    // Get monthly contribution totals from allocation
    const vehicles = allocation.vehicles || {};
    const totalMonthlyContribution = Object.values(vehicles).reduce((sum, amt) => sum + amt, 0);

    // Calculate retirement contribution (exclude education vehicles)
    const educationVehicles = ['529 Plan', 'Coverdell ESA'];
    const monthlyRetirementContribution = Object.entries(vehicles)
      .filter(([name]) => !educationVehicles.includes(name))
      .reduce((sum, [, amt]) => sum + amt, 0);

    // Calculate education contribution
    const monthlyEducationContribution = Object.entries(vehicles)
      .filter(([name]) => educationVehicles.includes(name))
      .reduce((sum, [, amt]) => sum + amt, 0);

    // Calculate retirement projections
    const retirementProjections = this.calculateProjections({
      currentBalance: currentRetirementBalance,
      monthlyContribution: monthlyRetirementContribution,
      yearsToRetirement: yearsToRetirement,
      annualReturn: annualReturn
    });

    // Calculate education projections (if applicable)
    const educationProjections = hasChildren
      ? this.calculateEducationProjections({
          currentEducationBalance: currentEducationBalance,
          monthlyEducationContribution: monthlyEducationContribution,
          yearsToEducation: yearsToEducation,
          numChildren: numChildren
        })
      : null;

    // Calculate tax breakdown
    const taxBreakdown = this.calculateTaxBreakdown(vehicles, retirementProjections);

    return {
      retirement: retirementProjections,
      education: educationProjections,
      taxBreakdown: taxBreakdown,
      inputs: {
        investmentScore,
        annualReturn,
        yearsToRetirement,
        totalMonthlyContribution,
        monthlyRetirementContribution,
        monthlyEducationContribution
      }
    };
  },

  /**
   * Sprint 5.1-5.4: Build calculator section HTML
   * Shows current state inputs, investment score, tax strategy, employer match, and vehicle sliders
   *
   * @param {Object} preSurveyData - User's questionnaire answers
   * @param {Object} profile - Classified investor profile
   * @param {Object} allocation - Vehicle allocation from calculateAllocation()
   * @param {Object} toolStatus - Upstream tool data
   * @returns {string} HTML for calculator section
   */
  buildCalculatorSection(preSurveyData, profile, allocation, toolStatus) {
    if (!allocation || !allocation.vehicles) {
      return `
        <div class="calculator-placeholder">
          <p class="muted">Complete the questionnaire above to see your personalized vehicle allocation.</p>
        </div>
      `;
    }

    const vehicles = allocation.vehicles;
    const eligibleVehicles = allocation.eligibleVehicles || {};
    const monthlyBudget = allocation.totalBudget || 0;
    const employerMatch = allocation.employerMatch || 0;
    const investmentScore = toolStatus.investmentScore || 4;
    const age = preSurveyData.age || toolStatus.age || 35;
    const yearsToRetirement = parseInt(preSurveyData.a2_yearsToRetirement || toolStatus.yearsToRetirement) || 25;
    const grossIncome = parseFloat(preSurveyData.a1_grossIncome || toolStatus.grossIncome) || 0;

    // Get current balances and contributions from preSurveyData
    const current401kBalance = parseFloat(preSurveyData.a12_current401kBalance) || 0;
    const currentIRABalance = parseFloat(preSurveyData.a13_currentIRABalance) || 0;
    const currentHSABalance = parseFloat(preSurveyData.a14_currentHSABalance) || 0;
    const currentEducationBalance = parseFloat(preSurveyData.a15_currentEducationBalance) || 0;

    const monthly401kContribution = parseFloat(preSurveyData.a16_monthly401kContribution) || 0;
    const monthlyIRAContribution = parseFloat(preSurveyData.a17_monthlyIRAContribution) || 0;
    const monthlyHSAContribution = parseFloat(preSurveyData.a18_monthlyHSAContribution) || 0;
    const monthlyEducationContribution = parseFloat(preSurveyData.a19_monthlyEducationContribution) || 0;

    const totalCurrentBalance = current401kBalance + currentIRABalance + currentHSABalance + currentEducationBalance;
    const totalCurrentContributions = monthly401kContribution + monthlyIRAContribution + monthlyHSAContribution + monthlyEducationContribution;

    // Tax preference
    const taxPreference = preSurveyData.a2b_taxPreference || allocation.taxPreference || 'Both';

    // Filing status (user selection overrides Tool 2/backup data)
    const filingStatus = preSurveyData.filingStatus || toolStatus.filingStatus || 'Single';

    // Has children/education domain
    const hasChildren = preSurveyData.a8_hasChildren === 'Yes';
    const hasHSA = preSurveyData.a7_hsaEligible === 'Yes';
    const has401k = preSurveyData.a3_has401k === 'Yes';

    // Investment score labels
    const scoreLabels = {
      1: 'Ultra-Conservative (4%)',
      2: 'Conservative (6%)',
      3: 'Moderately Conservative (8%)',
      4: 'Moderate (10%)',
      5: 'Moderately Aggressive (12%)',
      6: 'Aggressive (14%)',
      7: 'Ultra-Aggressive (16%)'
    };

    // Build investment score buttons
    let scoreButtonsHtml = '';
    for (let i = 1; i <= 7; i++) {
      const selected = i === investmentScore ? 'selected' : '';
      scoreButtonsHtml += `<button type="button" class="score-btn ${selected}" data-score="${i}" onclick="updateInvestmentScore(${i})" title="${scoreLabels[i]}">${i}</button>`;
    }

    let html = `
      <!-- Calculator Controls -->
      <div class="calculator-controls">

        <!-- Sprint 5.1: Current State Summary -->
        <div class="calc-subsection">
          <h4 class="calc-subsection-title">&#128176; Your Current State</h4>
          <div class="current-state-grid">
            <div class="state-card">
              <div class="state-label">Total Balance</div>
              <div class="state-value">$${totalCurrentBalance.toLocaleString()}</div>
              <div class="state-breakdown">
                ${has401k ? `<span>401(k): $${current401kBalance.toLocaleString()}</span>` : ''}
                <span>IRA: $${currentIRABalance.toLocaleString()}</span>
                ${hasHSA ? `<span>HSA: $${currentHSABalance.toLocaleString()}</span>` : ''}
                ${hasChildren ? `<span>Education: $${currentEducationBalance.toLocaleString()}</span>` : ''}
              </div>
            </div>
            <div class="state-card">
              <div class="state-label">Current Monthly Contributions</div>
              <div class="state-value">$${totalCurrentContributions.toLocaleString()}/mo</div>
              <div class="state-breakdown">
                ${has401k ? `<span>401(k): $${monthly401kContribution.toLocaleString()}</span>` : ''}
                <span>IRA: $${monthlyIRAContribution.toLocaleString()}</span>
                ${hasHSA ? `<span>HSA: $${monthlyHSAContribution.toLocaleString()}</span>` : ''}
                ${hasChildren ? `<span>Education: $${monthlyEducationContribution.toLocaleString()}</span>` : ''}
              </div>
            </div>
            <div class="state-card highlight">
              <div class="state-label">Your Monthly Budget</div>
              <div class="state-value">$${monthlyBudget.toLocaleString()}/mo</div>
              <div class="state-breakdown">
                <span>From Tool 4 allocation</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sprint 11.2: Your Settings Panel - All adjustable inputs in one place -->
        <div class="calc-subsection settings-panel">
          <h4 class="calc-subsection-title">&#9881; Your Settings</h4>
          <p class="settings-description">Adjust these values to see how different scenarios affect your allocation.</p>

          <div class="settings-grid">
            <!-- Row 1: Budget and Years -->
            <div class="settings-row">
              <div class="settings-field">
                <label class="settings-label">Monthly Budget</label>
                <div class="settings-input-group">
                  <span class="input-prefix">$</span>
                  <input type="number" id="budgetInput" class="settings-input" value="${monthlyBudget}" min="100" step="50" onchange="updateBudget(this.value)">
                  <span class="input-suffix">/mo</span>
                </div>
              </div>
              <div class="settings-field">
                <label class="settings-label">Years to Retirement</label>
                <div class="settings-input-group">
                  <input type="number" id="yearsToRetirementInput" class="settings-input" value="${yearsToRetirement}" min="1" max="50" onchange="updateYearsToRetirement(this.value)">
                  <span class="input-suffix">years</span>
                </div>
              </div>
            </div>

            <!-- Row 2: Risk Profile -->
            <div class="settings-row">
              <div class="settings-field full-width">
                <label class="settings-label">Risk Tolerance</label>
                <div class="score-buttons-row">
                  <div class="score-buttons" id="investmentScoreButtons">
                    ${scoreButtonsHtml}
                  </div>
                  <div class="score-description" id="scoreDescription">
                    ${scoreLabels[investmentScore] || 'Moderate (10%)'}
                  </div>
                </div>
                <input type="hidden" id="investmentScore" name="investmentScore" value="${investmentScore}">

                <!-- Sprint 11.3: Investment Score Educational Content -->
                <div class="edu-help">
                  <button type="button" class="edu-help-toggle" onclick="toggleEduHelp('investmentScore')">
                    <span class="edu-icon">&#9432;</span>
                    <span>What do these scores mean?</span>
                  </button>
                  <div class="edu-help-content" id="eduHelp-investmentScore">
                    <h5>Investment Risk Score (1-7)</h5>
                    <p>Your risk score determines the <strong>expected return rate</strong> used in projections. Higher risk = higher potential returns, but also more volatility.</p>

                    <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.85rem;">
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="text-align: left; padding: 8px; color: var(--color-text-muted);">Score</th>
                        <th style="text-align: left; padding: 8px; color: var(--color-text-muted);">Risk Level</th>
                        <th style="text-align: left; padding: 8px; color: var(--color-text-muted);">Expected Return</th>
                        <th style="text-align: left; padding: 8px; color: var(--color-text-muted);">Best For</th>
                      </tr>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px;">1</td>
                        <td style="padding: 8px;">Ultra Conservative</td>
                        <td style="padding: 8px; color: #22c55e;">8%</td>
                        <td style="padding: 8px;">Near retirement, low risk tolerance</td>
                      </tr>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px;">2-3</td>
                        <td style="padding: 8px;">Conservative</td>
                        <td style="padding: 8px; color: #22c55e;">9-10%</td>
                        <td style="padding: 8px;">10-15 years to retirement</td>
                      </tr>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px;">4</td>
                        <td style="padding: 8px;">Moderate</td>
                        <td style="padding: 8px; color: #eab308;">12%</td>
                        <td style="padding: 8px;">15-25 years, balanced approach</td>
                      </tr>
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px;">5-6</td>
                        <td style="padding: 8px;">Aggressive</td>
                        <td style="padding: 8px; color: #f97316;">14-16%</td>
                        <td style="padding: 8px;">25+ years, comfortable with swings</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px;">7</td>
                        <td style="padding: 8px;">Very Aggressive</td>
                        <td style="padding: 8px; color: #ef4444;">20%</td>
                        <td style="padding: 8px;">30+ years, max growth focus</td>
                      </tr>
                    </table>

                    <p><strong>What determines your score?</strong> Tool 4 calculates this based on your age, years to retirement, income stability, and risk tolerance answers.</p>

                    <div class="edu-tip">
                      <strong>Pro Tip:</strong> These returns are <em>averages</em>. Aggressive portfolios can lose 30-40% in a bad year but historically recover. Make sure your score matches your actual comfort with volatility!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 3: Tax Strategy -->
            <div class="settings-row">
              <div class="settings-field full-width">
                <label class="settings-label">Tax Strategy</label>
                <div class="tax-options-compact">
                  <label class="tax-option-compact ${taxPreference === 'Later' ? 'selected' : ''}">
                    <input type="radio" name="taxStrategy" value="Later" ${taxPreference === 'Later' ? 'checked' : ''} onchange="updateTaxStrategy('Later')">
                    <span class="tax-option-label">Traditional-Heavy</span>
                    <span class="tax-option-hint">Lower taxes now</span>
                  </label>
                  <label class="tax-option-compact ${taxPreference === 'Both' ? 'selected' : ''}">
                    <input type="radio" name="taxStrategy" value="Both" ${taxPreference === 'Both' ? 'checked' : ''} onchange="updateTaxStrategy('Both')">
                    <span class="tax-option-label">Balanced</span>
                    <span class="tax-option-hint">Mix of both</span>
                  </label>
                  <label class="tax-option-compact ${taxPreference === 'Now' ? 'selected' : ''}">
                    <input type="radio" name="taxStrategy" value="Now" ${taxPreference === 'Now' ? 'checked' : ''} onchange="updateTaxStrategy('Now')">
                    <span class="tax-option-label">Roth-Heavy</span>
                    <span class="tax-option-hint">Tax-free later</span>
                  </label>
                </div>
                <div class="tax-recommendation" id="taxRecommendation">
                  ${this.getTaxRecommendation(grossIncome, age)}
                </div>

                <!-- Sprint 11.3: Tax Strategy Educational Content -->
                <div class="edu-help">
                  <button type="button" class="edu-help-toggle" onclick="toggleEduHelp('taxStrategy')">
                    <span class="edu-icon">&#9432;</span>
                    <span>Learn about Roth vs Traditional</span>
                  </button>
                  <div class="edu-help-content" id="eduHelp-taxStrategy">
                    <h5>The Most Important Retirement Decision</h5>
                    <p>Roth vs Traditional is about <strong>when you pay taxes</strong> on your retirement savings:</p>

                    <div class="edu-comparison-grid">
                      <div class="edu-comparison-card">
                        <h6>Traditional (Pay Taxes Later)</h6>
                        <ul>
                          <li>Contributions reduce your taxable income <strong>now</strong></li>
                          <li>Money grows tax-deferred</li>
                          <li>Pay income tax when you withdraw in retirement</li>
                          <li>Best if you expect <strong>lower taxes in retirement</strong></li>
                        </ul>
                      </div>
                      <div class="edu-comparison-card">
                        <h6>Roth (Pay Taxes Now)</h6>
                        <ul>
                          <li>Contributions are made with after-tax dollars</li>
                          <li>Money grows <strong>completely tax-free</strong></li>
                          <li>Withdrawals in retirement are tax-free</li>
                          <li>Best if you expect <strong>higher taxes later</strong></li>
                        </ul>
                      </div>
                    </div>

                    <p><strong>Key Factors to Consider:</strong></p>
                    <ul>
                      <li><strong>Current vs. Future Tax Rate:</strong> If you are in a high bracket now, Traditional saves more today. If you are in a low bracket, Roth locks in that low rate forever.</li>
                      <li><strong>Years to Retirement:</strong> Longer time horizons favor Roth (more years of tax-free growth).</li>
                      <li><strong>Tax Diversification:</strong> Having both gives flexibility to manage taxes in retirement.</li>
                    </ul>

                    <div class="edu-tip">
                      <strong>Pro Tip:</strong> The "Balanced" strategy is often best because it hedges against future tax uncertainty. You cannot predict what tax rates will be in 20-30 years!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 4: Filing Status -->
            <div class="settings-row">
              <div class="settings-field">
                <label class="settings-label">Filing Status</label>
                <select id="filingStatusSelect" class="settings-select" onchange="updateFilingStatus(this.value)">
                  <option value="Single" ${filingStatus === 'Single' ? 'selected' : ''}>Single</option>
                  <option value="MFJ" ${filingStatus === 'MFJ' ? 'selected' : ''}>Married Filing Jointly</option>
                  <option value="MFS" ${filingStatus === 'MFS' ? 'selected' : ''}>Married Filing Separately</option>
                  <option value="HoH" ${filingStatus === 'HoH' ? 'selected' : ''}>Head of Household</option>
                </select>
              </div>
              <div class="settings-field">
                <span class="settings-hint-inline">Affects HSA limits and Roth phase-out thresholds</span>
              </div>
            </div>
          </div>

          <!-- Settings Action Buttons -->
          <div class="settings-actions">
            <button type="button" class="btn-secondary" onclick="restartClassification()">
              &#128260; Change Profile
            </button>
            <button type="button" class="btn-secondary" onclick="recalculateAllocation()">
              &#128257; Recalculate Allocation
            </button>
          </div>
          <div class="settings-hints">
            <span class="settings-hint">Change Profile: Go through profile questions again</span>
            <span class="settings-hint">Recalculate: Re-optimize allocation with current settings</span>
          </div>
        </div>

        <!-- Sprint 5.4: Employer Match Display -->
        ${employerMatch > 0 ? `
        <div class="calc-subsection employer-match-section">
          <h4 class="calc-subsection-title">Employer Match</h4>
          <div class="employer-match-display">
            <div class="match-icon">&#127873;</div>
            <div class="match-info">
              <div class="match-amount">+$${employerMatch.toLocaleString()}/month</div>
              <div class="match-label">Free money from your employer (not deducted from your budget)</div>
            </div>
            <div class="match-annual">$${(employerMatch * 12).toLocaleString()}/year</div>
          </div>
        </div>
        ` : ''}

      </div>

      <!-- Sprint 5.5: Vehicle Allocation Sliders -->
      <div class="vehicle-allocation-section">
        <h4 class="calc-subsection-title">Your Recommended Allocation</h4>

        <!-- Sprint 11.3: Slider Behavior Educational Content -->
        <div class="edu-help" style="margin-bottom: 16px;">
          <button type="button" class="edu-help-toggle" onclick="toggleEduHelp('sliders')">
            <span class="edu-icon">&#9432;</span>
            <span>How to use the sliders</span>
          </button>
          <div class="edu-help-content" id="eduHelp-sliders">
            <h5>Adjusting Your Allocation</h5>
            <p>Drag the sliders to customize how your retirement budget is distributed across different accounts.</p>

            <p><strong>Key behaviors:</strong></p>
            <ul>
              <li><strong>IRS Limits:</strong> Each vehicle has annual contribution limits set by the IRS. You cannot exceed these limits.</li>
              <li><strong>Coupled Limits:</strong> Some accounts share a combined limit. For example, Traditional 401(k) and Roth 401(k) share the same $23,500/year limit - if you put $15,000 in Traditional, you can only put $8,500 in Roth.</li>
              <li><strong>Lock Buttons (&#128274;):</strong> Click the lock icon to freeze a slider. Locked vehicles will not change when you adjust other sliders or when the algorithm reallocates.</li>
              <li><strong>Reset Button:</strong> Click "Reset" to restore the algorithm's recommended allocation based on your profile and settings.</li>
            </ul>

            <p><strong>Common coupled limits:</strong></p>
            <ul>
              <li>Traditional 401(k) + Roth 401(k) = $23,500/year combined</li>
              <li>Traditional IRA + Roth IRA = $7,000/year combined</li>
              <li>HSA Family vs Individual depends on your filing status</li>
            </ul>

            <div class="edu-tip">
              <strong>Pro Tip:</strong> The algorithm maximizes tax-advantaged space first. "Family Bank" (taxable brokerage) only appears when you have maxed out all other vehicles - this is a good problem to have!
            </div>
          </div>
        </div>

        <div class="allocation-summary">
          <span class="allocated-label">Total Allocated:</span>
          <span class="allocated-amount" id="totalAllocated">$${(allocation.totalAllocated || 0).toLocaleString()}</span>
          <span class="budget-reference">of $${monthlyBudget.toLocaleString()}/mo</span>
          <button type="button" class="btn-reset" onclick="resetToRecommended()" title="Reset to algorithm recommendation">
            &#8635; Reset
          </button>
        </div>

        <div class="vehicle-sliders" id="vehicleSliders">
    `;

    // Render vehicle sliders for each allocated vehicle
    // Ensure Family Bank is always in the list (it's the final overflow)
    if (!vehicles['Family Bank'] && eligibleVehicles['Family Bank']) {
      vehicles['Family Bank'] = 0;
    }

    // Ensure all eligible vehicles appear (even if $0) when they share limits
    // This is important for "Balanced" tax preference where user may want to split Roth/Traditional
    for (const vehicleName of Object.keys(eligibleVehicles)) {
      if (vehicles[vehicleName] === undefined) {
        const info = eligibleVehicles[vehicleName];
        // Add vehicles that share limits with an allocated vehicle
        if (info.sharesLimitWith && vehicles[info.sharesLimitWith] !== undefined) {
          vehicles[vehicleName] = 0;
        }
      }
    }

    const vehicleOrder = Object.keys(vehicles).sort((a, b) => {
      // Sort by allocation amount descending, but:
      // 1. Keep Family Bank at the end
      // 2. Keep vehicles that share limits together
      if (a === 'Family Bank') return 1;
      if (b === 'Family Bank') return -1;

      // Check if these vehicles share a limit - if so, keep them together
      const infoA = eligibleVehicles[a] || {};
      const infoB = eligibleVehicles[b] || {};

      // If A shares limit with B, keep them adjacent
      if (infoA.sharesLimitWith === b) return -1;
      if (infoB.sharesLimitWith === a) return 1;

      // If both share with the same vehicle or each other, sort by name for consistency
      if (infoA.sharesLimitWith && infoA.sharesLimitWith === infoB.sharesLimitWith) {
        return a.localeCompare(b);
      }

      // Default: sort by allocation amount descending
      return (vehicles[b] || 0) - (vehicles[a] || 0);
    });

    for (const vehicleName of vehicleOrder) {
      const amount = vehicles[vehicleName] || 0;
      const vehicleInfo = eligibleVehicles[vehicleName] || {};

      // Skip zero allocations UNLESS it's Family Bank or shares a limit with another vehicle
      const sharesLimit = vehicleInfo.sharesLimitWith;
      if (amount <= 0 && vehicleName !== 'Family Bank' && !sharesLimit) continue;

      const monthlyLimit = vehicleInfo.monthlyLimit || Infinity;
      const annualLimit = monthlyLimit === Infinity ? 'Unlimited' : '$' + (monthlyLimit * 12).toLocaleString() + '/yr';

      // FIX: Calculate effective max for slider (handle Infinity)
      const effectiveMax = monthlyLimit === Infinity ? monthlyBudget : Math.min(monthlyLimit, monthlyBudget);
      // FIX: Calculate percentage based on effective max, not budget
      const percentage = effectiveMax > 0 ? Math.round((amount / effectiveMax) * 100) : 0;

      const domain = vehicleInfo.domain || 'Retirement';

      // Domain icons
      const domainIcons = {
        'Retirement': '🏦',
        'Health': '🏥',
        'Education': '🎓'
      };
      const domainIcon = domainIcons[domain] || '💰';

      // Vehicle descriptions for each vehicle type (defaults)
      const vehicleDescriptions = {
        'Employer Match': 'Free money from your employer - always maximize this first',
        '401(k) Traditional': 'Pre-tax contributions reduce taxable income now, taxed in retirement',
        '401(k) Roth': 'After-tax contributions grow tax-free, tax-free withdrawals in retirement',
        'Solo 401(k) Employee Traditional': 'Pre-tax employee contributions for self-employed',
        'Solo 401(k) Employee Roth': 'After-tax employee contributions for self-employed',
        'Solo 401(k) Employer': 'Employer profit-sharing contributions (up to 25% of compensation)',
        'HSA': 'Triple tax advantage - deductible, grows tax-free, tax-free for medical',
        'Roth IRA': 'Tax-free growth and withdrawals, income limits apply',
        'Traditional IRA': 'Tax-deductible contributions, taxed in retirement',
        'Backdoor Roth IRA': 'Roth IRA access for high earners via conversion strategy',
        '529 Plan': 'Tax-free growth for qualified education expenses',
        'Family Bank': 'Taxable brokerage account for flexible long-term investing',
        'SEP IRA': 'Simplified pension for self-employed, employer contributions only',
        'SIMPLE IRA': 'Retirement plan for small businesses with employer match'
      };
      // Sprint 12.1: Use custom note from eligibility check if available (e.g., pro-rata warnings)
      const vehicleDescription = vehicleInfo.note || vehicleDescriptions[vehicleName] || 'Tax-advantaged retirement savings';

      // Sprint 12.1: Check for warnings (e.g., Backdoor Roth pro-rata)
      const vehicleWarning = vehicleInfo.warning || null;

      // Determine if this is a Roth or Traditional vehicle for styling
      const isRoth = vehicleName.includes('Roth');
      const isTrad = vehicleName.includes('Traditional');
      const vehicleClass = isRoth ? 'roth-vehicle' : (isTrad ? 'trad-vehicle' : '');

      // FIX: Create safe ID and escaped name for JavaScript
      const safeId = vehicleName.replace(/[^a-zA-Z0-9]/g, '_');
      const escapedName = vehicleName.replace(/'/g, "\\'");

      // Store IRS limit for budget recalculation (use large number for Infinity)
      const irsLimitForData = monthlyLimit === Infinity ? 999999 : monthlyLimit;

      html += `
        <div class="vehicle-slider-row ${vehicleClass}" data-vehicle-id="${safeId}" data-vehicle-name="${vehicleName}" data-domain="${domain}" data-irs-limit="${irsLimitForData}">
          <div class="vehicle-slider-header">
            <div class="vehicle-slider-title">
              <span class="vehicle-slider-name">${domainIcon} ${vehicleName}</span>
              <span class="vehicle-slider-value">
                <span id="amount_${safeId}">$${amount.toLocaleString()}</span>
                <span class="dollar-amount" id="percent_${safeId}">(${percentage}%)</span>
              </span>
            </div>
            <button type="button"
                    class="lock-btn"
                    id="lock_${safeId}"
                    onclick="toggleVehicleLock('${safeId}')"
                    title="Lock this vehicle">🔓 Unlocked</button>
          </div>
          <div class="slider-track">
            <div class="slider-fill" id="fill_${safeId}" style="width: ${percentage}%"></div>
          </div>
          <input type="range"
                 class="vehicle-slider"
                 id="slider_${safeId}"
                 min="0"
                 max="${effectiveMax}"
                 value="${amount}"
                 step="10"
                 data-vehicle-id="${safeId}"
                 data-irs-limit="${irsLimitForData}"
                 onchange="updateVehicleAllocation('${escapedName}', this.value)"
                 oninput="updateVehicleDisplay('${escapedName}', this.value)">
          <div class="vehicle-description">${vehicleDescription}</div>
          ${vehicleWarning ? '<div class="vehicle-warning"><span class="warning-icon">&#9888;</span> ' + vehicleWarning + '</div>' : ''}
          ${this.buildVehicleEducationHelp(vehicleName)}
          <div class="vehicle-limit-info">${annualLimit}</div>
        </div>
      `;
    }

    // Calculate values for plain English summary
    const annualSavings = (allocation.totalAllocated || 0) * 12;
    const totalWithMatch = (allocation.totalAllocated || 0) + (employerMatch || 0);
    const annualReturn = this.calculatePersonalizedRate(investmentScore);
    const returnPercent = (annualReturn * 100).toFixed(0);

    // Rough 10-year projection (simplified compound interest)
    const tenYearProjection = Math.round(totalWithMatch * 12 * (Math.pow(1 + annualReturn, 10) - 1) / annualReturn);

    // Tax strategy in plain English
    let taxStrategyPlain = '';
    if (taxPreference === 'Now') {
      taxStrategyPlain = 'paying taxes now (Roth) for tax-free retirement income';
    } else if (taxPreference === 'Later') {
      taxStrategyPlain = 'deferring taxes (Traditional) to reduce your current tax bill';
    } else {
      taxStrategyPlain = 'balancing both tax strategies for maximum flexibility';
    }

    html += `
        </div>

        <!-- Sprint 11.4: Plain English Results Summary -->
        <div class="results-summary" id="resultsSummary">
          <h4 class="results-summary-title">&#128161; What This Means</h4>
          <div class="results-summary-content">
            <div class="summary-stat main">
              <span class="stat-label">You are saving</span>
              <span class="stat-value" id="summaryMonthly">$${(allocation.totalAllocated || 0).toLocaleString()}/month</span>
              <span class="stat-detail">($${annualSavings.toLocaleString()}/year${employerMatch > 0 ? ' + $' + (employerMatch * 12).toLocaleString() + ' employer match' : ''})</span>
            </div>
            <div class="summary-insights">
              <div class="insight-item">
                <span class="insight-icon">&#128176;</span>
                <span class="insight-text">Your tax strategy is <strong>${taxStrategyPlain}</strong>.</span>
              </div>
              <div class="insight-item">
                <span class="insight-icon">&#128200;</span>
                <span class="insight-text">At ${returnPercent}% annual return, this could grow to <strong>~$${tenYearProjection.toLocaleString()}</strong> in 10 years.</span>
              </div>
              <div class="insight-item">
                <span class="insight-icon">&#127919;</span>
                <span class="insight-text">After ${yearsToRetirement} years, see your full projections in <strong>Section 3</strong> below.</span>
              </div>
              <div class="insight-item explore-prompt">
                <span class="insight-icon">&#128269;</span>
                <span class="insight-text">Want to compare strategies? Save this scenario in <strong>Section 4</strong>, then try different settings.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Allocation warnings -->
        <div class="allocation-warnings" id="allocationWarnings"></div>

        <!-- Sprint 8.1: Trauma Insight Display (Your Money Pattern) -->
        ${this.buildTraumaInsightSection(toolStatus)}
      </div>
    `;

    return html;
  },

  /**
   * Get tax strategy recommendation based on income and age
   */
  getTaxRecommendation(grossIncome, age) {
    let recommendation = '';
    let reason = '';

    if (grossIncome < 50000) {
      recommendation = 'Roth-Heavy';
      reason = 'Your income suggests a lower tax bracket now - pay taxes while they are low';
    } else if (grossIncome > 150000) {
      recommendation = 'Traditional-Heavy';
      reason = 'Your income suggests a higher tax bracket - defer taxes to potentially lower retirement bracket';
    } else if (age >= 50) {
      recommendation = 'Balanced';
      reason = 'Diversify tax treatment for flexibility in retirement';
    } else {
      recommendation = 'Balanced';
      reason = 'A mix provides tax diversification and flexibility';
    }

    return `<span class="recommendation-label">Recommendation:</span> <strong>${recommendation}</strong> - ${reason}`;
  },

  /**
   * Convert filing status code to display name
   * @param {string} filingStatus - 'Single', 'MFJ', 'MFS', 'HoH'
   * @returns {string} Display name
   */
  getFilingStatusDisplay(filingStatus) {
    const displayNames = {
      'Single': 'Single',
      'MFJ': 'Married (Joint)',
      'MFS': 'Married (Sep)',
      'HoH': 'Head of House'
    };
    return displayNames[filingStatus] || 'Single';
  },

  /**
   * Sprint 6.2: Build projections display section
   * Shows retirement projections, education projections (if applicable), and tax breakdown
   *
   * @param {Object} projections - Result from calculateCompleteProjections()
   * @param {Object} preSurveyData - User's questionnaire answers
   * @returns {string} HTML for projections section
   */
  buildProjectionsSection(projections, preSurveyData) {
    if (!projections) {
      return `
        <div class="placeholder-message">
          <h3>Complete Your Allocation First</h3>
          <p>Projections will appear after you complete the questionnaire and get your allocation.</p>
        </div>
      `;
    }

    const retirement = projections.retirement;
    const education = projections.education;
    const taxBreakdown = projections.taxBreakdown;
    const inputs = projections.inputs;

    const hasChildren = preSurveyData?.a8_hasChildren === 'Yes';
    const returnRatePercent = (inputs.annualReturn * 100).toFixed(1);

    let html = `
      <div class="projections-container">

        <!-- Projection Assumptions -->
        <div class="projection-assumptions">
          <div class="assumptions-header">
            <span class="assumptions-icon">⚙️</span>
            <span class="assumptions-title">Projection Assumptions</span>
          </div>
          <div class="assumptions-grid">
            <div class="assumption-item">
              <span class="assumption-label">Investment Score</span>
              <span class="assumption-value">${inputs.investmentScore}/7</span>
            </div>
            <div class="assumption-item">
              <span class="assumption-label">Expected Return</span>
              <span class="assumption-value">${returnRatePercent}% annually</span>
            </div>
            <div class="assumption-item">
              <span class="assumption-label">Years to Retirement</span>
              <span class="assumption-value">${inputs.yearsToRetirement} years</span>
            </div>
            <div class="assumption-item">
              <span class="assumption-label">Monthly Contributions</span>
              <span class="assumption-value">$${inputs.monthlyRetirementContribution.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Retirement Projections -->
        <div class="projection-card retirement-projection">
          <div class="projection-header">
            <span class="projection-icon">🎯</span>
            <h4 class="projection-title">Retirement Projection</h4>
          </div>

          <div class="projection-metrics">
            <div class="metric-card primary">
              <div class="metric-label">Projected Balance at Retirement</div>
              <div class="metric-value">$${retirement.projectedBalance.toLocaleString()}</div>
              <div class="metric-note">In ${retirement.yearsUsed} years</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Inflation-Adjusted Value</div>
              <div class="metric-value">$${retirement.realBalance.toLocaleString()}</div>
              <div class="metric-note">In today's dollars (2.5% inflation)</div>
            </div>

            <div class="metric-card highlight">
              <div class="metric-label">Est. Monthly Retirement Income</div>
              <div class="metric-value">$${retirement.monthlyRetirementIncome.toLocaleString()}</div>
              <div class="metric-note">Based on 4% withdrawal rule</div>
            </div>
          </div>

          <!-- Improvement from Plan -->
          <div class="improvement-section">
            <div class="improvement-comparison">
              <div class="comparison-item baseline">
                <div class="comparison-label">If you did nothing</div>
                <div class="comparison-value">$${retirement.baseline.toLocaleString()}</div>
                <div class="comparison-note">Just letting current balance grow</div>
              </div>
              <div class="comparison-arrow">→</div>
              <div class="comparison-item projected">
                <div class="comparison-label">With this plan</div>
                <div class="comparison-value">$${retirement.projectedBalance.toLocaleString()}</div>
                <div class="comparison-note">Following recommended allocation</div>
              </div>
            </div>
            <div class="improvement-result ${retirement.improvement > 0 ? 'positive' : ''}">
              <span class="improvement-icon">${retirement.improvement > 0 ? '📈' : '➡️'}</span>
              <span class="improvement-text">
                ${retirement.improvement > 0
                  ? `+$${retirement.improvement.toLocaleString()} improvement`
                  : 'Start building your retirement today'
                }
              </span>
            </div>
          </div>
        </div>

        <!-- Tax Breakdown -->
        <div class="projection-card tax-breakdown">
          <div class="projection-header">
            <span class="projection-icon">🏛️</span>
            <h4 class="projection-title">Tax Treatment at Withdrawal</h4>
          </div>

          <div class="tax-bar-container">
            <div class="tax-bar">
              <div class="tax-segment tax-free" style="width: ${taxBreakdown.taxFreePercentage}%;" title="Tax-Free (Roth + HSA)"></div>
              <div class="tax-segment tax-deferred" style="width: ${taxBreakdown.taxDeferredPercentage}%;" title="Tax-Deferred (Traditional)"></div>
              <div class="tax-segment capital-gains" style="width: ${taxBreakdown.capitalGainsPercentage}%;" title="Capital Gains (Taxable)"></div>
            </div>
          </div>

          <div class="tax-legend">
            <div class="legend-item tax-free">
              <span class="legend-color"></span>
              <span class="legend-label">Tax-Free (Roth + HSA)</span>
              <span class="legend-value">${taxBreakdown.taxFreePercentage}% · $${taxBreakdown.taxFreeAmount.toLocaleString()}</span>
            </div>
            <div class="legend-item tax-deferred">
              <span class="legend-color"></span>
              <span class="legend-label">Tax-Deferred (Traditional)</span>
              <span class="legend-value">${taxBreakdown.taxDeferredPercentage}% · $${taxBreakdown.taxDeferredAmount.toLocaleString()}</span>
            </div>
            <div class="legend-item capital-gains">
              <span class="legend-color"></span>
              <span class="legend-label">Capital Gains (Taxable)</span>
              <span class="legend-value">${taxBreakdown.capitalGainsPercentage}% · $${taxBreakdown.capitalGainsAmount.toLocaleString()}</span>
            </div>
          </div>

          <div class="tax-insight">
            ${taxBreakdown.taxFreePercentage >= 50
              ? '<span class="insight-icon">✅</span> Great tax diversification! Majority of funds will be tax-free at withdrawal.'
              : taxBreakdown.taxFreePercentage >= 25
                ? '<span class="insight-icon">👍</span> Good mix of tax treatments for flexibility in retirement.'
                : '<span class="insight-icon">💡</span> Consider increasing Roth contributions for more tax-free income in retirement.'
            }
          </div>
        </div>
    `;

    // Education Projections (if applicable)
    if (hasChildren && education && education.projectedBalance > 0) {
      html += `
        <!-- Education Projections -->
        <div class="projection-card education-projection">
          <div class="projection-header">
            <span class="projection-icon">🎓</span>
            <h4 class="projection-title">Education Savings Projection</h4>
          </div>

          <div class="projection-metrics">
            <div class="metric-card primary">
              <div class="metric-label">Projected Education Fund</div>
              <div class="metric-value">$${education.projectedBalance.toLocaleString()}</div>
              <div class="metric-note">In ${education.yearsUsed} years (7% growth)</div>
            </div>

            ${education.numChildren > 1 ? `
            <div class="metric-card">
              <div class="metric-label">Per Child Estimate</div>
              <div class="metric-value">$${education.perChildEstimate.toLocaleString()}</div>
              <div class="metric-note">Across ${education.numChildren} children</div>
            </div>
            ` : ''}

            <div class="metric-card ${education.improvement > 0 ? 'highlight' : ''}">
              <div class="metric-label">Growth from Contributions</div>
              <div class="metric-value">+$${education.improvement.toLocaleString()}</div>
              <div class="metric-note">Beyond current balance growth</div>
            </div>
          </div>

          <div class="education-context">
            <span class="context-icon">💡</span>
            <span class="context-text">Average 4-year public university cost: ~$100,000. Private: ~$200,000+</span>
          </div>
        </div>
      `;
    }

    html += `
      </div> <!-- /.projections-container -->
    `;

    return html;
  },

  /**
   * Sprint 12: Build collapsible educational help for Backdoor Roth
   * Displays expandable explainer about Backdoor Roth strategy and pro-rata rules
   *
   * @param {string} vehicleName - Name of the vehicle
   * @returns {string} HTML for collapsible help section (empty string if not applicable)
   */
  buildVehicleEducationHelp(vehicleName) {
    // Only show education help for Backdoor Roth IRA
    if (vehicleName !== 'Backdoor Roth IRA') {
      return '';
    }

    // Check if BACKDOOR_ROTH_EDUCATION is available
    if (typeof BACKDOOR_ROTH_EDUCATION === 'undefined') {
      return '';
    }

    const edu = BACKDOOR_ROTH_EDUCATION;
    let sectionsHtml = '';

    for (const section of edu.sections) {
      sectionsHtml += '<h5>' + section.heading + '</h5>';
      sectionsHtml += '<p>' + section.content + '</p>';

      if (section.formula) {
        sectionsHtml += '<div class="formula-box">' + section.formula + '</div>';
      }

      if (section.example) {
        sectionsHtml += '<p><em>' + section.example + '</em></p>';
      }

      if (section.tip) {
        sectionsHtml += '<div class="tip-box">' + section.tip + '</div>';
      }
    }

    return `
      <div class="vehicle-help">
        <details>
          <summary>
            <span class="help-icon">&#9656;</span>
            ${edu.title}
          </summary>
          <div class="vehicle-help-content">
            ${sectionsHtml}
          </div>
        </details>
      </div>
    `;
  },

  /**
   * Sprint 8.1: Build trauma insight section for calculator
   * Displays Tool 1 trauma pattern with retirement-specific implications
   *
   * @param {Object} toolStatus - Tool status with traumaPattern and traumaScores
   * @returns {string} HTML for trauma insight section
   */
  buildTraumaInsightSection(toolStatus) {
    const traumaPattern = toolStatus.traumaPattern;
    const traumaScores = toolStatus.traumaScores || {};

    // If no Tool 1 data, show prompt to complete it
    if (!traumaPattern) {
      return `
        <div class="calc-subsection trauma-insight-section">
          <div class="trauma-no-data">
            <p>Complete <strong>Tool 1: Money Pattern Discovery</strong> to see how your psychological patterns affect retirement planning.</p>
          </div>
        </div>
      `;
    }

    // Trauma pattern definitions with retirement-specific insights
    // Mirrors Tool6GPTAnalysis.js traumaRetirementContext
    const traumaInsights = {
      'FSV': {
        name: 'False Self-View',
        icon: '🎭',
        type: 'Disconnection from Self (Active)',
        pattern: 'You may under-save for yourself while over-providing for others. There can be a tendency to feel undeserving of a comfortable retirement, or to avoid looking at retirement numbers altogether.',
        watchFor: 'Under-allocation to personal retirement accounts, over-prioritizing education funding for children, difficulty increasing contribution rates even when affordable.',
        healing: 'Recognize that building retirement security is self-care, not selfishness. Your future self deserves the same care you give others. Each contribution is an act of self-worth.'
      },
      'ExVal': {
        name: 'External Validation',
        icon: '👥',
        type: 'Disconnection from Self (Passive)',
        pattern: 'You may make retirement decisions based on what others think rather than your personal needs. Comparing retirement savings to peers or seeking validation for every financial decision is common.',
        watchFor: 'Changing allocations based on external opinions, difficulty committing to a strategy, comparing projected balances to others instead of focusing on your own goals.',
        healing: 'Build internal confidence in your retirement plan. Your financial path is unique - what matters is alignment with YOUR values and goals, not anyone else\'s approval.'
      },
      'Showing': {
        name: 'Issues Showing Love',
        icon: '💝',
        type: 'Disconnection from Others (Active)',
        pattern: 'You may deprioritize your own retirement to fund education or help family members. Feeling guilty about Roth contributions (no immediate tax benefit for others) or difficulty accepting employer match as deserved.',
        watchFor: 'Minimal allocation to retirement domains, over-funding education/529s at the expense of your own future, guilt about tax-advantaged contributions that benefit you.',
        healing: 'Securing your retirement IS showing love - it means your family will not need to support you later. Self-care enables sustainable generosity over a lifetime.'
      },
      'Receiving': {
        name: 'Issues Receiving Love',
        icon: '🛡️',
        type: 'Disconnection from Others (Passive)',
        pattern: 'You may hoard retirement savings for security without a clear purpose. Difficulty accepting employer match or HSA employer contributions, and isolation in retirement planning decisions.',
        watchFor: 'Over-emphasis on security without growth orientation, avoiding family financial discussions, resistance to advisor input or collaborative planning.',
        healing: 'Learn to receive support in retirement planning. Accepting employer match is not dependency - it is wise stewardship. Allow others to contribute to your wellbeing.'
      },
      'Control': {
        name: 'Control Leading to Isolation',
        icon: '🎯',
        type: 'Disconnection from Greater Purpose (Active)',
        pattern: 'You may obsessively monitor retirement accounts or be rigid about allocation percentages. Difficulty adapting strategy as circumstances change and analysis paralysis with vehicle selection.',
        watchFor: 'Excessive checking of balances, difficulty adjusting allocations when life changes, paralysis when market volatility occurs, perfectionism preventing action.',
        healing: 'Develop trust in your systematic approach. Having a solid retirement plan means you do not need to control every variable. Set it, review periodically, and trust the process.'
      },
      'Fear': {
        name: 'Fear Leading to Isolation',
        icon: '😰',
        type: 'Disconnection from Greater Purpose (Passive)',
        pattern: 'You may under-invest due to market fears, catastrophize retirement scenarios, avoid checking retirement accounts, or over-allocate to conservative vehicles despite a long time horizon.',
        watchFor: 'Under-allocation to growth vehicles, excessive focus on worst-case projections, avoidance of retirement conversations, keeping too much in cash or bonds.',
        healing: 'Build courage to invest for long-term growth. Your time horizon is your greatest asset - fear-based under-investing is its own risk. Small, consistent steps build confidence.'
      }
    };

    const insight = traumaInsights[traumaPattern];
    if (!insight) {
      return `
        <div class="calc-subsection trauma-insight-section">
          <div class="trauma-no-data">
            <p>Your money pattern could not be identified. Consider retaking Tool 1.</p>
          </div>
        </div>
      `;
    }

    // Check for secondary pattern (second highest score)
    let secondaryHtml = '';
    if (traumaScores && Object.keys(traumaScores).length > 1) {
      const sortedScores = Object.entries(traumaScores)
        .filter(([key]) => key !== traumaPattern)
        .sort((a, b) => b[1] - a[1]);

      if (sortedScores.length > 0 && sortedScores[0][1] > 0) {
        const secondaryPattern = sortedScores[0][0];
        const secondaryInsight = traumaInsights[secondaryPattern];
        if (secondaryInsight) {
          secondaryHtml = `
            <div class="trauma-insight-card" style="opacity: 0.8;">
              <div class="trauma-insight-card-title">Secondary Pattern: ${secondaryInsight.name}</div>
              <div class="trauma-insight-card-content">
                This pattern may also influence your retirement decisions. Be aware of ${secondaryInsight.watchFor.split(',')[0].toLowerCase()}.
              </div>
            </div>
          `;
        }
      }
    }

    return `
      <div class="calc-subsection trauma-insight-section">
        <div class="trauma-insight-header" onclick="toggleTraumaInsight()" id="traumaHeader">
          <div class="trauma-insight-title">
            <span class="trauma-insight-icon">${insight.icon}</span>
            <div>
              <div class="trauma-insight-name">Your Money Pattern: ${insight.name}</div>
              <div class="trauma-insight-type">${insight.type}</div>
            </div>
          </div>
          <span class="trauma-insight-toggle" id="traumaToggle">▼</span>
        </div>

        <div class="trauma-insight-body" id="traumaBody">
          <div class="trauma-insight-card">
            <div class="trauma-insight-card-title">How This Shows Up in Retirement Planning</div>
            <div class="trauma-insight-card-content">${insight.pattern}</div>
          </div>

          <div class="trauma-insight-card">
            <div class="trauma-insight-card-title">Watch For These Tendencies</div>
            <div class="trauma-insight-card-content">${insight.watchFor}</div>
          </div>

          ${secondaryHtml}

          <div class="trauma-insight-card trauma-insight-healing">
            <div class="trauma-insight-card-title">Your Healing Direction</div>
            <div class="trauma-insight-card-content">${insight.healing}</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Build unified page with questionnaire + calculator
   */
  buildUnifiedPage(clientId, toolStatus, preSurveyData, profile, allocation) {
    const styles = HtmlService.createHtmlOutputFromFile('shared/styles').getContent();
    const hasPreSurvey = !!preSurveyData;
    const hasAllocation = !!allocation && allocation.totalBudget > 0;

    // Get data availability status for badges
    const dataStatus = this.getDataStatus(toolStatus);

    // Pre-fill form values from Tool 2/4 data if available
    const prefillData = this.getPrefillData(toolStatus);

    // Calculate projections if allocation exists (Sprint 6.1)
    const projections = hasAllocation
      ? this.calculateCompleteProjections(preSurveyData, allocation, toolStatus)
      : null;
    const hasProjections = !!projections;

    // Build Section 0: Backup Questions (if needed)
    const needsBackup = !toolStatus.hasTool1 || !toolStatus.hasTool2 || !toolStatus.hasTool4;
    let backupSectionHtml = '';
    if (needsBackup) {
      // Check for backup answers from ANY tier
      const hasBackupAnswers = preSurveyData && (
        // Tool 4 backup fields
        preSurveyData.backup_monthlyBudget ||
        preSurveyData.backup_monthlyIncome ||
        // Tool 2 backup fields
        preSurveyData.backup_age ||
        preSurveyData.backup_grossIncome ||
        preSurveyData.backup_employmentType ||
        // Tool 1 backup fields (trauma pattern)
        preSurveyData.backup_stressResponse ||
        preSurveyData.backup_coreBelief ||
        preSurveyData.backup_consequence
      );
      const backupStatus = hasBackupAnswers ? 'complete' : 'incomplete';
      const backupIcon = hasBackupAnswers ? '&#9989;' : '&#9888;&#65039;';
      const backupExpanded = !hasBackupAnswers;
      const backupQuestionsHtml = this.buildBackupQuestionsHtml(preSurveyData || {}, toolStatus.hasTool1, toolStatus.hasTool2, toolStatus.hasTool4);

      backupSectionHtml = `
    <!-- Section 0: Additional Info Needed (Backup Questions) -->
    <div class="section-card section-${backupStatus}">
      <div class="section-header section-header-${backupStatus}" onclick="toggleSection('backup')">
        <div class="section-title">${backupIcon} Additional Info Needed</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="status-badge status-${backupStatus}">${hasBackupAnswers ? 'Complete' : 'Action Required'}</span>
          <span class="section-toggle ${backupExpanded ? '' : 'collapsed'}" id="backupToggle">&#9660;</span>
        </div>
      </div>

      <div class="section-body ${backupExpanded ? '' : 'collapsed'}" id="backupBody">
        ${backupQuestionsHtml}

        <div class="backup-actions" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <button type="button" class="btn-primary" onclick="saveBackupQuestions()" style="width: 100%;">
            &#10004; Save Info & Continue
          </button>
        </div>
      </div>
    </div>
      `;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Retirement Blueprint Calculator</title>
  ${styles}
  <style>
    /* Tool 6 specific styles */
    .tool6-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Navigation header - matches Tool 4 pattern */
    .tool-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-nav {
      background: var(--gold, #ad9168);
      color: #140f23;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-nav:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(173, 145, 104, 0.3);
    }

    .tool-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .section-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .section-header {
      padding: 20px 24px;
      background: rgba(79, 70, 229, 0.1);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header:hover {
      background: rgba(79, 70, 229, 0.15);
    }

    /* Section status variants */
    .section-header-incomplete {
      background: rgba(234, 179, 8, 0.15);
      border-left: 4px solid #eab308;
    }

    .section-header-incomplete:hover {
      background: rgba(234, 179, 8, 0.2);
    }

    .section-header-complete {
      background: rgba(34, 197, 94, 0.1);
      border-left: 4px solid #22c55e;
    }

    .section-header-complete:hover {
      background: rgba(34, 197, 94, 0.15);
    }

    /* Status badges */
    .status-badge {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-incomplete {
      background: rgba(234, 179, 8, 0.2);
      color: #eab308;
    }

    .status-complete {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .section-toggle {
      font-size: 1.25rem;
      transition: transform 0.3s ease;
    }

    .section-toggle.collapsed {
      transform: rotate(-90deg);
    }

    .section-body {
      padding: 24px;
      transition: all 0.3s ease;
    }

    .section-body.collapsed {
      max-height: 0;
      padding: 0 24px;
      overflow: hidden;
      opacity: 0;
    }

    .section-summary {
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.02);
      display: none;
      font-size: 0.95rem;
      color: var(--color-text-secondary);
    }

    .section-summary.show {
      display: block;
    }

    .profile-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(79, 70, 229, 0.2);
      border-radius: 20px;
      font-weight: 500;
    }

    /* Blocker message (when Tool 4 not complete) */
    .blocker-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 16px 20px;
      margin: 16px 0;
      color: #fca5a5;
    }

    .blocker-message strong {
      color: #ef4444;
    }

    .data-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .data-summary-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 12px 16px;
    }

    .data-summary-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .data-summary-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .data-summary-value.missing {
      color: var(--color-text-muted);
      font-style: italic;
      font-weight: normal;
    }

    /* Old vehicle-slider-row grid removed - now using card style in Phase 5 section */

    .vehicle-amount {
      font-family: monospace;
      font-size: 1.1rem;
    }

    .btn-primary {
      background: var(--gold);
      color: #140f23;
      border: none;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(255, 193, 7, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: var(--gold);
      color: #140f23;
      border: none;
      padding: 10px 20px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(255, 193, 7, 0.3);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: var(--color-text-primary);
      font-size: 1rem;
    }

    .form-input[type="number"] {
      max-width: 300px;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .placeholder-message {
      padding: 40px;
      text-align: center;
      color: var(--color-text-muted);
    }

    .placeholder-message h3 {
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    /* Questionnaire Styles */
    .questionnaire-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .questionnaire-section:last-child {
      border-bottom: none;
    }

    .section-subtitle {
      color: var(--color-primary);
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .section-description {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      margin-bottom: 20px;
    }

    .questions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group.hidden {
      display: none;
    }

    .required-star {
      color: #ef4444;
      margin-left: 2px;
    }

    .form-help {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 6px;
    }

    .currency-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 12px;
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .currency-input {
      padding-left: 28px !important;
    }

    .yesno-buttons {
      display: flex;
      gap: 8px;
    }

    .yesno-btn {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .yesno-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .yesno-btn.selected {
      background: rgba(79, 70, 229, 0.3);
      border-color: var(--color-primary);
      color: var(--color-text-primary);
    }

    .ranking-inputs {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .ranking-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .ranking-label {
      flex: 1;
      color: var(--color-text-secondary);
    }

    .ranking-select {
      width: 80px;
    }

    .form-actions {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .form-input:invalid {
      border-color: #ef4444;
    }

    /* Intro Section - matches Tool 4 style */
    .intro-section {
      background: rgba(79, 70, 229, 0.1);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .intro-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 10px;
    }

    .intro-text {
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* Welcome Message - Top level, always visible */
    .welcome-message {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.05));
      border: 1px solid rgba(79, 70, 229, 0.2);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 24px;
      text-align: center;
    }

    .welcome-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }

    .welcome-text {
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* Submit Button - matches Tool 4 style */
    .submit-btn {
      background: var(--gold, #ffc107);
      color: #140f23;
      border: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      max-width: 400px;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 20px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(255, 193, 7, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Error Message - matches Tool 4 style */
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 12px 20px;
      border-radius: 8px;
      margin-top: 16px;
      display: none;
      max-width: 400px;
      text-align: center;
    }

    .error-message.show {
      display: block;
    }

    /* Loading overlay - matches Tool 4 style */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-overlay.show {
      display: flex;
    }

    .loading-content {
      text-align: center;
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top: 4px solid #4f46e5;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .loading-subtext {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin-top: 8px;
    }

    /* ================================================================
       TWO-PHASE QUESTIONNAIRE STYLES
       ================================================================ */

    .questionnaire-phase {
      margin-bottom: 24px;
    }

    .questionnaire-phase.hidden {
      display: none;
    }

    .phase-header {
      margin-bottom: 20px;
    }

    /* Classification container - progressive questions */
    .classification-container {
      min-height: 150px;
    }

    .classification-question {
      padding: 20px;
      background: rgba(79, 70, 229, 0.05);
      border-radius: 12px;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;
    }

    .classification-question.hidden {
      display: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Profile result card */
    .profile-result {
      text-align: center;
      padding: 24px;
      animation: fadeIn 0.4s ease;
    }

    .profile-result.hidden {
      display: none;
    }

    .profile-card {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(79, 70, 229, 0.05));
      border: 1px solid rgba(79, 70, 229, 0.3);
      border-radius: 16px;
      padding: 24px 32px;
      margin-bottom: 20px;
    }

    .profile-icon {
      font-size: 3rem;
    }

    .profile-info {
      text-align: left;
    }

    .profile-info h3 {
      color: var(--color-text-primary);
      font-size: 1.3rem;
      margin: 0 0 4px 0;
    }

    .profile-info p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 0.95rem;
    }

    /* Compact profile badge for Phase B */
    .profile-result-compact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .btn-link {
      background: none;
      border: none;
      color: var(--color-primary);
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: underline;
    }

    .btn-link:hover {
      color: var(--color-primary-dark);
    }

    /* Conditional field wrapper */
    .conditional-field.hidden {
      display: none;
    }

    /* Hidden utility class */
    .hidden {
      display: none !important;
    }

    /* ================================================================
       PHASE C: AMBITION QUOTIENT STYLES
       ================================================================ */

    .ambition-domain {
      background: rgba(79, 70, 229, 0.03);
      border: 1px solid rgba(79, 70, 229, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .domain-title {
      color: var(--color-primary);
      font-size: 1.1rem;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(79, 70, 229, 0.2);
    }

    .conditional-domain.hidden {
      display: none;
    }

    /* Scale input styling */
    .scale-input-wrapper {
      margin-top: 8px;
    }

    .scale-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .scale-label-left {
      text-align: left;
      max-width: 45%;
    }

    .scale-label-right {
      text-align: right;
      max-width: 45%;
    }

    .scale-buttons {
      display: flex;
      gap: 8px;
      justify-content: space-between;
    }

    .scale-btn {
      flex: 1;
      padding: 12px 8px;
      border: 2px solid rgba(79, 70, 229, 0.3);
      background: rgba(79, 70, 229, 0.05);
      border-radius: 8px;
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .scale-btn:hover {
      border-color: var(--color-primary);
      background: rgba(79, 70, 229, 0.1);
    }

    .scale-btn.selected {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }

    .ambition-tiebreaker {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
    }

    .ambition-tiebreaker .form-label {
      color: #f59e0b;
    }

    /* ================================================================
       PHASE 5: CALCULATOR UI STYLES
       ================================================================ */

    .calculator-controls {
      margin-bottom: 32px;
    }

    .calc-subsection {
      margin-bottom: 28px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .calc-subsection:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .calc-subsection-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Sprint 11.2: Settings Panel */
    .settings-panel {
      background: rgba(79, 70, 229, 0.08);
      border: 1px solid rgba(79, 70, 229, 0.2);
      border-radius: 12px;
      padding: 20px;
    }

    .settings-description {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: -8px 0 20px 0;
    }

    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .settings-row {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .settings-field {
      flex: 1;
      min-width: 200px;
    }

    .settings-field.full-width {
      flex: 100%;
      min-width: 100%;
    }

    .settings-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .settings-input-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .settings-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      font-size: 1rem;
      max-width: 120px;
    }

    .settings-input:focus {
      outline: none;
      border-color: var(--color-primary);
      background: rgba(255, 255, 255, 0.08);
    }

    .input-prefix, .input-suffix {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    .settings-select {
      padding: 10px 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-primary);
      font-size: 1rem;
      min-width: 200px;
      cursor: pointer;
    }

    .settings-select:focus {
      outline: none;
      border-color: var(--color-primary);
      background: rgba(255, 255, 255, 0.08);
    }

    .settings-hint-inline {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      font-style: italic;
      display: flex;
      align-items: center;
    }

    .score-buttons-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .score-buttons-row .score-buttons {
      flex: 1;
    }

    .score-buttons-row .score-description {
      min-width: 180px;
    }

    /* Compact Tax Options for Settings Panel */
    .tax-options-compact {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tax-option-compact {
      flex: 1;
      min-width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 16px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .tax-option-compact:hover {
      border-color: rgba(79, 70, 229, 0.4);
      background: rgba(79, 70, 229, 0.1);
    }

    .tax-option-compact.selected {
      border-color: var(--color-primary);
      background: rgba(79, 70, 229, 0.15);
    }

    .tax-option-compact input[type="radio"] {
      display: none;
    }

    .tax-option-label {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 0.95rem;
    }

    .tax-option-hint {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 4px;
    }

    .settings-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .settings-hints {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }

    .settings-hint {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    @media (max-width: 600px) {
      .settings-row {
        flex-direction: column;
      }
      .settings-field {
        min-width: 100%;
      }
      .score-buttons-row {
        flex-direction: column;
        align-items: stretch;
      }
      .score-buttons-row .score-description {
        text-align: center;
      }
      .tax-options-compact {
        flex-direction: column;
      }
      .settings-actions {
        flex-direction: column;
        align-items: stretch;
      }
      .settings-actions .btn-secondary {
        width: 100%;
        justify-content: center;
      }
      .settings-hints {
        flex-direction: column;
        gap: 4px;
      }
    }

    /* Sprint 11.3: Educational Help Sections */
    .edu-help {
      margin-top: 12px;
    }

    .edu-help-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--color-primary);
      cursor: pointer;
      padding: 4px 0;
      border: none;
      background: none;
      transition: color 0.2s;
    }

    .edu-help-toggle:hover {
      color: var(--color-primary-light, #818cf8);
    }

    .edu-help-toggle .edu-icon {
      font-size: 1rem;
    }

    .edu-help-content {
      display: none;
      margin-top: 12px;
      padding: 16px;
      background: rgba(79, 70, 229, 0.08);
      border: 1px solid rgba(79, 70, 229, 0.2);
      border-radius: 8px;
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--color-text-secondary);
    }

    .edu-help-content.show {
      display: block;
    }

    .edu-help-content h5 {
      color: var(--color-text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .edu-help-content p {
      margin: 0 0 12px 0;
    }

    .edu-help-content p:last-child {
      margin-bottom: 0;
    }

    .edu-help-content ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .edu-help-content li {
      margin-bottom: 6px;
    }

    .edu-comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 12px 0;
    }

    .edu-comparison-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 12px;
    }

    .edu-comparison-card h6 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--color-text-primary);
    }

    .edu-comparison-card ul {
      margin: 0;
      padding-left: 16px;
      font-size: 0.85rem;
    }

    .edu-tip {
      background: rgba(234, 179, 8, 0.1);
      border-left: 3px solid #eab308;
      padding: 10px 12px;
      margin-top: 12px;
      border-radius: 0 6px 6px 0;
      font-size: 0.85rem;
    }

    .edu-tip strong {
      color: #eab308;
    }

    @media (max-width: 600px) {
      .edu-comparison-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Sprint 11.2: Persistent Profile Banner */
    .profile-banner {
      display: none;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(79, 70, 229, 0.3);
      border-radius: 12px;
      padding: 16px 24px;
      margin-bottom: 24px;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .profile-banner.show {
      display: flex;
    }

    .profile-banner-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profile-banner-icon {
      font-size: 2.5rem;
    }

    .profile-banner-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .profile-banner-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .profile-banner-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .profile-banner-stats {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .profile-banner-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .profile-banner-stat-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--gold, #ad9168);
    }

    .profile-banner-stat-label {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
    }

    .profile-banner-change {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--color-text-secondary);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .profile-banner-change:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: rgba(79, 70, 229, 0.1);
    }

    @media (max-width: 768px) {
      .profile-banner {
        flex-direction: column;
        text-align: center;
      }
      .profile-banner-info {
        flex-direction: column;
      }
      .profile-banner-stats {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    /* Sprint 11.2: Section Summaries */
    .section-summary {
      display: none;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .section-summary.show {
      display: block;
    }

    .section-summary-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 32px;
    }

    .section-summary-item {
      display: flex;
      gap: 6px;
    }

    .section-summary-item strong {
      color: var(--color-text-muted);
      font-weight: 500;
    }

    .section-summary-item span {
      color: var(--gold, #ad9168);
      font-weight: 600;
    }

    /* Sprint 5.1: Current State Grid */
    .current-state-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .state-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
    }

    .state-card.highlight {
      background: rgba(79, 70, 229, 0.1);
      border-color: rgba(79, 70, 229, 0.3);
    }

    .state-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .state-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }

    .state-breakdown {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .state-breakdown span {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Sprint 5.2: Investment Score Display */
    .investment-score-display {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 20px;
    }

    .score-selector {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .score-label {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
    }

    .score-buttons {
      display: flex;
      gap: 8px;
    }

    .score-btn {
      flex: 1;
      padding: 12px 8px;
      border: 2px solid rgba(79, 70, 229, 0.3);
      background: rgba(79, 70, 229, 0.05);
      border-radius: 8px;
      color: var(--color-text-primary);
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .score-btn:hover {
      border-color: var(--color-primary);
      background: rgba(79, 70, 229, 0.15);
    }

    .score-btn.selected {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }

    .score-description {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      padding: 8px 12px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 6px;
      text-align: center;
    }

    /* Sprint 5.3: Tax Strategy Toggle */
    .tax-strategy-toggle {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tax-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    @media (max-width: 768px) {
      .tax-options {
        grid-template-columns: 1fr;
      }
    }

    .tax-option {
      display: block;
      padding: 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tax-option:hover {
      border-color: rgba(79, 70, 229, 0.5);
      background: rgba(79, 70, 229, 0.05);
    }

    .tax-option.selected {
      border-color: var(--color-primary);
      background: rgba(79, 70, 229, 0.15);
    }

    .tax-option input[type="radio"] {
      display: none;
    }

    .tax-option-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tax-option-title {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .tax-option-desc {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .tax-recommendation {
      font-size: 0.9rem;
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      color: var(--color-text-secondary);
    }

    .recommendation-label {
      color: #22c55e;
      font-weight: 500;
    }

    /* Sprint 5.4: Employer Match Display */
    .employer-match-section {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-top: 8px;
    }

    .employer-match-display {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .match-icon {
      font-size: 2rem;
    }

    .match-info {
      flex: 1;
    }

    .match-amount {
      font-size: 1.3rem;
      font-weight: 700;
      color: #22c55e;
    }

    .match-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .match-annual {
      font-size: 1rem;
      color: var(--color-text-secondary);
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    /* Sprint 8.1: Trauma Insight Section */
    .trauma-insight-section {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }

    .trauma-insight-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      margin-bottom: 0;
    }

    .trauma-insight-header.expanded {
      margin-bottom: 16px;
    }

    .trauma-insight-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .trauma-insight-icon {
      font-size: 1.5rem;
    }

    .trauma-insight-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .trauma-insight-type {
      font-size: 0.85rem;
      color: rgba(139, 92, 246, 0.9);
      font-weight: 500;
    }

    .trauma-insight-toggle {
      font-size: 1rem;
      color: var(--color-text-muted);
      transition: transform 0.3s ease;
    }

    .trauma-insight-toggle.collapsed {
      transform: rotate(-90deg);
    }

    .trauma-insight-body {
      display: block;
    }

    .trauma-insight-body.collapsed {
      display: none;
    }

    .trauma-insight-card {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .trauma-insight-card:last-child {
      margin-bottom: 0;
    }

    .trauma-insight-card-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(139, 92, 246, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .trauma-insight-card-content {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .trauma-insight-healing {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .trauma-insight-healing .trauma-insight-card-title {
      color: #22c55e;
    }

    .trauma-no-data {
      text-align: center;
      padding: 16px;
      color: var(--color-text-muted);
      font-style: italic;
    }

    .trauma-no-data a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .trauma-no-data a:hover {
      text-decoration: underline;
    }

    /* Sprint 10.1: Backup Questions Section */
    .backup-questions-section {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
      border: 2px solid rgba(251, 191, 36, 0.3);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .backup-intro {
      margin-bottom: 24px;
    }

    .backup-intro-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 16px;
    }

    .backup-explanation {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }

    .backup-explanation-text {
      color: var(--color-text-primary);
      font-size: 1rem;
      margin-bottom: 12px;
    }

    .backup-recommendation {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      margin-bottom: 16px;
    }

    .backup-tool-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .backup-tool-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 12px 20px;
      background: linear-gradient(135deg, var(--color-primary), #6366f1);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .backup-tool-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .backup-tool-btn-name {
      font-weight: 700;
      font-size: 1rem;
      color: white;
    }

    .backup-tool-btn-desc {
      font-size: 0.8rem;
      opacity: 0.85;
      color: white;
    }

    .backup-continue-text {
      font-size: 1rem;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .backup-tier {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 10px;
      padding: 20px;
      margin-top: 20px;
    }

    .backup-tier-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .backup-tier-icon {
      font-size: 1.5rem;
    }

    .backup-tier-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .backup-tier-description {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin-bottom: 20px;
    }

    /* Add spacing between backup questions */
    .backup-tier .form-group {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .backup-tier .form-group:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .backup-slider {
      margin-top: 8px;
    }

    .backup-score-buttons {
      display: flex;
      gap: 8px;
      margin: 12px 0 8px 0;
    }

    .backup-score-buttons .score-btn {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-secondary);
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .backup-score-buttons .score-btn:hover {
      border-color: var(--color-primary);
      background: rgba(79, 70, 229, 0.1);
    }

    .backup-score-buttons .score-btn.selected {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }

    .score-label-display {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      text-align: center;
      margin-top: 4px;
    }

    .backup-statement-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }

    .backup-statement-group .statement-card {
      display: flex;
      align-items: center;
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      color: var(--color-text-secondary);
    }

    .backup-statement-group .statement-card:hover {
      border-color: rgba(251, 191, 36, 0.4);
      background: rgba(251, 191, 36, 0.05);
    }

    .backup-statement-group .statement-card.selected {
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.15);
      color: var(--color-text-primary);
    }

    .backup-statement-group .statement-card input[type="radio"] {
      display: none;
    }

    /* Sprint 5.5: Vehicle Sliders */
    .vehicle-allocation-section {
      margin-top: 24px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .allocation-summary {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .budget-label, .allocated-label {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    .budget-amount, .allocated-amount {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .budget-reference {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    /* Budget Editor */
    .budget-editor {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .budget-currency {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .budget-input {
      width: 100px;
      padding: 6px 10px;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      text-align: right;
    }

    .budget-input:focus {
      outline: none;
      border-color: var(--color-primary);
      background: rgba(255, 255, 255, 0.15);
    }

    .budget-input::-webkit-inner-spin-button,
    .budget-input::-webkit-outer-spin-button {
      opacity: 1;
    }

    .budget-display {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    /* Reset Button */
    .btn-reset {
      padding: 6px 12px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: auto;
    }

    .btn-reset:hover {
      background: rgba(255, 255, 255, 0.2);
      color: var(--color-text-primary);
    }

    /* Lock Button - Tool 4 style */
    .lock-btn {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;
    }

    .lock-btn:hover {
      border-color: rgba(255, 255, 255, 0.4);
      color: rgba(255, 255, 255, 0.8);
    }

    .lock-btn.locked {
      background: rgba(255, 193, 7, 0.2);
      border-color: #ffc107;
      color: #ffc107;
    }

    .vehicle-sliders {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    /* Vehicle slider container - Tool 4 card style */
    .vehicle-slider-row {
      margin-bottom: 10px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .vehicle-slider-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .vehicle-slider-row.roth-vehicle {
      border-left: 3px solid #22c55e;
    }

    .vehicle-slider-row.trad-vehicle {
      border-left: 3px solid #3b82f6;
    }

    .vehicle-slider-row.locked {
      background: rgba(255, 255, 255, 0.01);
      border-color: rgba(255, 193, 7, 0.3);
    }

    .vehicle-slider-row.locked .vehicle-slider {
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Vehicle slider header - Tool 4 style */
    .vehicle-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .vehicle-slider-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .vehicle-slider-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .vehicle-slider-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .vehicle-slider-value .dollar-amount {
      color: #ffc107;
      margin-left: 8px;
      font-size: 1em;
    }

    .vehicle-slider-row.locked .vehicle-slider-value {
      color: #ffc107;
    }

    .vehicle-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .vehicle-icon {
      font-size: 1.2rem;
    }

    .vehicle-name {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 1.1rem;
    }

    .vehicle-limit {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Slider track - visual fill bar */
    .slider-track {
      position: relative;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      margin-bottom: 10px;
      pointer-events: none; /* Let mouse events pass through to the range input */
    }

    .slider-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      border-radius: 5px;
      transition: width 0.15s ease-out;
      pointer-events: none; /* Let mouse events pass through to the range input */
    }

    .slider-fill.locked {
      background: linear-gradient(90deg, #f59e0b, #ffc107);
    }

    /* Range input - positioned to overlay the track */
    .vehicle-slider {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 10px;
      background: transparent;
      outline: none;
      position: relative;
      z-index: 2;
      cursor: pointer;
      margin-top: -20px; /* Overlay the slider-track above */
    }

    .vehicle-slider:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Slider thumb - WebKit - Tool 4 style (no margin-top) */
    .vehicle-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      background: var(--color-primary);
      border: 3px solid rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .vehicle-slider.locked::-webkit-slider-thumb {
      background: #ffc107;
    }

    /* Slider thumb - Firefox - Tool 4 style */
    .vehicle-slider::-moz-range-thumb {
      width: 24px;
      height: 24px;
      background: var(--color-primary);
      border: 3px solid rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .vehicle-slider.locked::-moz-range-thumb {
      background: #ffc107;
    }

    /* Vehicle description - Tool 4 style */
    .vehicle-description {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin-top: 5px;
      font-style: italic;
    }

    .vehicle-limit-info {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 8px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      display: inline-block;
    }

    /* Sprint 12.1: Vehicle-specific warning (e.g., Backdoor Roth pro-rata) */
    .vehicle-warning {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      margin-top: 8px;
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 6px;
      color: #fbbf24;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .vehicle-warning .warning-icon {
      flex-shrink: 0;
      font-size: 1rem;
    }

    /* Sprint 12: Collapsible educational help section */
    .vehicle-help {
      margin-top: 8px;
    }

    .vehicle-help details {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 6px;
      overflow: hidden;
    }

    .vehicle-help summary {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--color-primary, #6366f1);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
    }

    .vehicle-help summary:hover {
      background: rgba(99, 102, 241, 0.12);
    }

    .vehicle-help summary::marker {
      content: '';
    }

    .vehicle-help summary .help-icon {
      transition: transform 0.2s ease;
    }

    .vehicle-help details[open] summary .help-icon {
      transform: rotate(90deg);
    }

    .vehicle-help-content {
      padding: 12px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      border-top: 1px solid rgba(99, 102, 241, 0.15);
    }

    .vehicle-help-content h5 {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .vehicle-help-content p {
      margin: 0 0 10px 0;
    }

    .vehicle-help-content p:last-child {
      margin-bottom: 0;
    }

    .vehicle-help-content ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .vehicle-help-content li {
      margin-bottom: 4px;
    }

    .vehicle-help-content .formula-box {
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.8rem;
      margin: 10px 0;
      color: var(--color-text-primary);
    }

    .vehicle-help-content .tip-box {
      background: rgba(34, 197, 94, 0.1);
      border-left: 3px solid rgba(34, 197, 94, 0.5);
      padding: 8px 12px;
      margin: 10px 0;
      border-radius: 0 4px 4px 0;
    }

    .vehicle-amount-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .amount-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .amount-percent {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    /* Allocation Warnings */
    .allocation-warnings {
      margin-top: 16px;
    }

    .allocation-warning {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      margin-bottom: 8px;
      color: #fca5a5;
      font-size: 0.9rem;
    }

    .allocation-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      margin-bottom: 8px;
      color: #86efac;
      font-size: 0.9rem;
    }

    .warning-icon {
      font-size: 1.2rem;
    }

    /* Sprint 11.4: Plain English Results Summary */
    .results-summary {
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(79, 70, 229, 0.08));
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 12px;
    }

    .results-summary-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 16px 0;
    }

    .results-summary-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .summary-stat.main {
      text-align: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .summary-stat .stat-label {
      display: block;
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .summary-stat .stat-value {
      display: block;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-success, #22c55e);
    }

    .summary-stat .stat-detail {
      display: block;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }

    .summary-insights {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .insight-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .insight-icon {
      flex-shrink: 0;
      font-size: 1rem;
    }

    .insight-text strong {
      color: var(--color-text-primary);
    }

    /* Sprint 11.6: Exploration prompt styling */
    .insight-item.explore-prompt {
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .done-exploring-prompt {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    .done-icon {
      font-size: 1.1rem;
    }

    .btn-nav-inline {
      display: inline;
      padding: 4px 12px;
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-nav-inline:hover {
      background: var(--color-primary);
      color: white;
    }

    /* ============================================
       Sprint 6.2: Projections Section Styles
       ============================================ */

    .projections-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .projection-assumptions {
      background: rgba(79, 70, 229, 0.08);
      border-radius: 12px;
      padding: 16px 20px;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    .assumptions-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .assumptions-icon {
      font-size: 1.1rem;
    }

    .assumptions-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .assumptions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .assumption-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .assumption-label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .assumption-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .projection-card {
      background: var(--color-surface);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .projection-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .projection-icon {
      font-size: 1.5rem;
    }

    .projection-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .projection-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.2s ease;
    }

    .metric-card.primary {
      background: rgba(79, 70, 229, 0.15);
      border-color: rgba(79, 70, 229, 0.3);
    }

    .metric-card.highlight {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .metric-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .metric-card.primary .metric-value {
      color: var(--color-primary-light, #818cf8);
    }

    .metric-card.highlight .metric-value {
      color: #10b981;
    }

    .metric-note {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    /* Improvement Comparison */
    .improvement-section {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 20px;
      border: 1px dashed rgba(255, 255, 255, 0.15);
    }

    .improvement-comparison {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .comparison-item {
      text-align: center;
      padding: 16px 24px;
      border-radius: 12px;
      min-width: 180px;
    }

    .comparison-item.baseline {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .comparison-item.projected {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .comparison-label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }

    .comparison-value {
      font-size: 1.3rem;
      font-weight: 700;
    }

    .comparison-item.baseline .comparison-value {
      color: #f87171;
    }

    .comparison-item.projected .comparison-value {
      color: #34d399;
    }

    .comparison-note {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 4px;
    }

    .comparison-arrow {
      font-size: 2rem;
      color: var(--color-text-muted);
    }

    .improvement-result {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .improvement-result.positive {
      background: rgba(16, 185, 129, 0.15);
    }

    .improvement-icon {
      font-size: 1.2rem;
    }

    .improvement-text {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .improvement-result.positive .improvement-text {
      color: #34d399;
    }

    /* Tax Breakdown */
    .tax-bar-container {
      margin-bottom: 20px;
    }

    .tax-bar {
      height: 32px;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      background: rgba(255, 255, 255, 0.1);
    }

    .tax-segment {
      height: 100%;
      transition: width 0.3s ease;
      min-width: 2px;
    }

    .tax-segment.tax-free {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }

    .tax-segment.tax-deferred {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }

    .tax-segment.capital-gains {
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
    }

    .tax-legend {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    .legend-item.tax-free .legend-color {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }

    .legend-item.tax-deferred .legend-color {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }

    .legend-item.capital-gains .legend-color {
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
    }

    .legend-label {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      flex: 1;
    }

    .legend-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .tax-insight {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 8px;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .insight-icon {
      font-size: 1.1rem;
    }

    /* Education Projection */
    .education-projection {
      border-left: 4px solid #8b5cf6;
    }

    .education-context {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .context-icon {
      font-size: 1rem;
    }

    /* ============================================================================
       Sprint 7.1: Scenario Management Styles
       ============================================================================ */

    .scenario-actions {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .scenario-save-section,
    .scenario-list-section {
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .scenario-section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 8px 0;
    }

    .scenario-description {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0 0 16px 0;
    }

    .scenario-save-form {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .scenario-save-form .form-input {
      flex: 1;
      min-width: 200px;
      padding: 12px 16px;
      font-size: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--color-text-primary);
    }

    .scenario-save-form .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    .scenario-save-form .form-input::placeholder {
      color: var(--color-text-muted);
    }

    .scenario-save-form .btn-primary {
      padding: 12px 24px;
      font-size: 1rem;
      font-weight: 600;
      background: var(--gold, #ffc107);
      color: #1a1a2e;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .scenario-save-form .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    }

    .scenario-save-form .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .scenario-feedback {
      margin-top: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .scenario-feedback.success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .scenario-feedback.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .saved-scenarios-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .scenario-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.2s ease;
    }

    .scenario-card:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(79, 70, 229, 0.3);
    }

    .scenario-card.is-latest {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.05);
    }

    .scenario-info {
      flex: 1;
    }

    .scenario-name {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .scenario-meta {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .scenario-meta span {
      margin-right: 12px;
    }

    .scenario-actions-btns {
      display: flex;
      gap: 8px;
    }

    .scenario-btn {
      padding: 8px 12px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .scenario-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .scenario-btn.load-btn:hover {
      background: rgba(79, 70, 229, 0.2);
      border-color: rgba(79, 70, 229, 0.4);
      color: #a5b4fc;
    }

    .scenario-btn.delete-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      color: #f87171;
    }

    .scenario-btn.pdf-btn:hover {
      background: rgba(196, 160, 82, 0.2);
      border-color: rgba(196, 160, 82, 0.4);
      color: #c4a052;
    }

    .empty-scenarios {
      text-align: center;
      padding: 32px 16px;
      color: var(--color-text-muted);
    }

    .empty-scenarios-icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    /* Sprint 7.3: Scenario Comparison Styles */
    .scenario-comparison-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .comparison-dropdowns {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 16px 0;
      flex-wrap: wrap;
    }

    .comparison-select-group {
      flex: 1;
      min-width: 200px;
    }

    .comparison-select-group label {
      display: block;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 6px;
    }

    .comparison-select-group select {
      width: 100%;
    }

    .comparison-vs {
      font-weight: 700;
      color: var(--color-text-muted);
      padding: 0 8px;
    }

    .comparison-results {
      margin-top: 20px;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .comparison-table th {
      background: rgba(79, 70, 229, 0.15);
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .comparison-table td {
      color: var(--color-text-secondary);
    }

    .comparison-table td.metric-label {
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .comparison-table td.value-a,
    .comparison-table td.value-b {
      text-align: center;
    }

    .comparison-table td.diff-cell {
      text-align: center;
      font-weight: 600;
    }

    .comparison-table td.diff-cell.better-a {
      color: #34d399;
      background: rgba(16, 185, 129, 0.1);
    }

    .comparison-table td.diff-cell.better-b {
      color: #60a5fa;
      background: rgba(96, 165, 250, 0.1);
    }

    .comparison-table td.diff-cell.neutral {
      color: var(--color-text-muted);
    }

    .comparison-winner {
      margin-top: 20px;
      padding: 16px;
      background: rgba(79, 70, 229, 0.1);
      border: 1px solid rgba(79, 70, 229, 0.3);
      border-radius: 8px;
    }

    .comparison-winner h5 {
      margin: 0 0 8px 0;
      color: var(--color-text-primary);
    }

    .comparison-winner p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    .comparison-section-header td {
      background: rgba(79, 70, 229, 0.1) !important;
      color: var(--color-text-primary) !important;
      font-weight: 600 !important;
      font-size: 0.95rem;
      padding: 10px 12px !important;
      border-top: 2px solid rgba(79, 70, 229, 0.3);
    }

    .comparison-section {
      margin-bottom: 24px;
    }

    .comparison-section-title {
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .comparison-narratives {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .scenario-narrative {
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .scenario-narrative.scenario-a {
      border-left: 3px solid #34d399;
    }

    .scenario-narrative.scenario-b {
      border-left: 3px solid #60a5fa;
    }

    .narrative-label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .narrative-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 12px;
    }

    .narrative-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .narrative-item {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .narrative-item::before {
      content: '•';
      margin-right: 8px;
      color: var(--color-text-muted);
    }

    .section-insight {
      margin-top: 16px;
      padding: 16px;
      background: rgba(79, 70, 229, 0.08);
      border-radius: 8px;
      border-left: 3px solid rgba(79, 70, 229, 0.5);
    }

    .section-insight p {
      margin: 0 0 12px 0;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .section-insight p:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 600px) {
      .comparison-narratives {
        grid-template-columns: 1fr;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .vehicle-slider-row {
        padding: 15px;
      }

      .vehicle-slider-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .lock-btn {
        align-self: flex-end;
      }

      .allocation-summary {
        flex-direction: column;
        align-items: flex-start;
      }

      .employer-match-display {
        flex-wrap: wrap;
      }

      .match-annual {
        width: 100%;
        text-align: center;
        margin-top: 8px;
      }
    }
  </style>
</head>
<body>
  <!-- Loading Overlay - matches Tool 4 structure -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <div class="loading-text" id="loadingText">Calculating Your Allocation...</div>
      <div class="loading-subtext" id="loadingSubtext">Analyzing your retirement profile</div>
    </div>
  </div>

  <div class="tool6-container">
    <!-- Navigation Header -->
    <div class="tool-navigation">
      <button type="button" class="btn-nav" onclick="returnToDashboard()">
        &#8592; Return to Dashboard
      </button>
      <span class="tool-title">Retirement Blueprint Calculator</span>
      <div style="width: 180px;"></div> <!-- Spacer for centering -->
    </div>

    <!-- Welcome Message - Always visible at top -->
    <div class="welcome-message">
      ${hasPreSurvey ? `
      <div class="welcome-title">&#128075; Welcome Back!</div>
      <div class="welcome-text">
        Your previous settings are loaded. You are classified as a <strong>${profile?.name || 'Custom'}</strong> investor.
        Adjust your settings below, compare scenarios, or click <strong>Change Profile</strong> to start fresh.
      </div>
      ` : `
      <div class="welcome-title">Welcome to Your Retirement Blueprint Calculator</div>
      <div class="welcome-text">
        This tool optimizes your retirement savings across different account types (401k, IRA, HSA, etc.) for maximum tax efficiency.
        Answer a few questions below to get your personalized allocation. <strong>Time needed:</strong> 3-5 minutes.
        ${toolStatus.hasTool4 ? '<br><strong>Data imported:</strong> Your budget and investment score from Tool 4.' : ''}
      </div>
      `}
    </div>

    <!-- Sprint 11.2: Persistent Profile Banner -->
    <div class="profile-banner ${hasPreSurvey ? 'show' : ''}" id="profileBanner">
      <div class="profile-banner-info">
        <div class="profile-banner-icon" id="profileBannerIcon">${profile?.icon || '👤'}</div>
        <div class="profile-banner-details">
          <span class="profile-banner-label">Your Profile</span>
          <span class="profile-banner-name" id="profileBannerName">${profile?.name || 'Not Set'}</span>
        </div>
      </div>
      <div class="profile-banner-stats">
        <div class="profile-banner-stat">
          <span class="profile-banner-stat-value" id="profileBannerBudget">$${(preSurveyData?.monthlyBudget || toolStatus.monthlyBudget || 0).toLocaleString()}</span>
          <span class="profile-banner-stat-label">Monthly Budget</span>
        </div>
        <div class="profile-banner-stat">
          <span class="profile-banner-stat-value" id="profileBannerYears">${preSurveyData?.a2_yearsToRetirement || toolStatus.yearsToRetirement || '--'}</span>
          <span class="profile-banner-stat-label">Years to Retire</span>
        </div>
        <div class="profile-banner-stat">
          <span class="profile-banner-stat-value" id="profileBannerScore">${preSurveyData?.investmentScore || toolStatus.investmentScore || 4}/7</span>
          <span class="profile-banner-stat-label">Risk Score</span>
        </div>
        <div class="profile-banner-stat">
          <span class="profile-banner-stat-value" id="profileBannerFiling">${this.getFilingStatusDisplay(toolStatus.filingStatus)}</span>
          <span class="profile-banner-stat-label">Filing Status</span>
        </div>
      </div>
      <button type="button" class="profile-banner-change" onclick="restartClassification()">
        Change Profile
      </button>
    </div>

    ${!dataStatus.overall.canProceed ? `
    <!-- Blocker Message - Tool 4 Required -->
    <div class="section-card" style="margin-bottom: 16px;">
      <div class="blocker-message">
        <strong>Action Required:</strong> ${dataStatus.overall.blockerMessage}
      </div>
    </div>
    ` : ''}

    ${backupSectionHtml}

    <!-- Section 1: Your Financial Profile (Questionnaire) -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('profile')">
        <div class="section-title">&#128202; 1. Your Financial Profile ${hasPreSurvey ? '' : '<span class="status-badge status-incomplete">Incomplete</span>'}</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${hasPreSurvey ? '<span class="profile-badge">Profile: ' + (profile?.name || 'Calculating...') + '</span>' : ''}
          <span class="section-toggle ${hasPreSurvey ? 'collapsed' : ''}" id="profileToggle">&#9660;</span>
        </div>
      </div>

      ${hasPreSurvey ? `
      <div class="section-summary show" id="profileSummary">
        <div>
          <strong>Profile:</strong> ${profile?.name || 'Calculating...'} |
          <strong>Budget:</strong> $${(preSurveyData.monthlyBudget || 0).toLocaleString()}/mo |
          <strong>Age:</strong> ${preSurveyData.age || prefillData.age || 'Not set'}
        </div>
      </div>
      ` : ''}

      <div class="section-body ${hasPreSurvey ? 'collapsed' : ''}" id="profileBody">
        <!-- Data Summary from Tools 1-5 -->
        <div style="margin-bottom: 24px;">
          <h4 style="color: var(--color-text-secondary); margin-bottom: 12px;">Your Tool 4 Allocation</h4>
          <div class="data-summary">
            <div class="data-summary-item">
              <div class="data-summary-label">Monthly Retirement Budget</div>
              <div class="data-summary-value ${!toolStatus.monthlyBudget ? 'missing' : ''}">
                ${toolStatus.monthlyBudget ? '$' + Number(toolStatus.monthlyBudget).toLocaleString() + '/mo' : 'Not available'}
              </div>
            </div>
            <div class="data-summary-item">
              <div class="data-summary-label">Investment Score</div>
              <div class="data-summary-value">${toolStatus.investmentScore}/7 (${INVESTMENT_SCORE_LABELS[toolStatus.investmentScore] || 'Moderate'})</div>
            </div>
            ${toolStatus.age ? `
            <div class="data-summary-item">
              <div class="data-summary-label">Age</div>
              <div class="data-summary-value">${toolStatus.age}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Questionnaire Form -->
        ${this.buildQuestionnaireHtml(preSurveyData, prefillData, profile, toolStatus)}
      </div>
    </div>

    <!-- Section 2: Vehicle Allocation Calculator -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('calculator')">
        <div class="section-title">&#128176; 2. Vehicle Allocation</div>
        <span class="section-toggle ${hasAllocation ? '' : 'collapsed'}" id="calculatorToggle">&#9660;</span>
      </div>

      ${hasAllocation ? `
      <div class="section-summary" id="calculatorSummary">
        <div class="section-summary-grid">
          <div class="section-summary-item"><strong>Total Allocated:</strong> <span id="summaryTotalAllocated">$${(allocation.totalAllocated || 0).toLocaleString()}/mo</span></div>
          <div class="section-summary-item"><strong>Tax Strategy:</strong> <span>${preSurveyData?.a2b_taxPreference === 'Now' ? 'Roth-Heavy' : preSurveyData?.a2b_taxPreference === 'Later' ? 'Traditional-Heavy' : 'Balanced'}</span></div>
          <div class="section-summary-item"><strong>Vehicles:</strong> <span>${Object.keys(allocation.vehicles || {}).filter(v => allocation.vehicles[v] > 0).length} active</span></div>
        </div>
      </div>
      ` : ''}

      <div class="section-body ${hasAllocation ? '' : 'collapsed'}" id="calculatorBody">
        ${hasAllocation
          ? this.buildCalculatorSection(preSurveyData, profile, allocation, toolStatus)
          : `
        <div class="placeholder-message">
          <h3>${dataStatus.overall.canProceed ? 'Complete Your Profile First' : 'Tool 4 Required'}</h3>
          <p>${dataStatus.overall.canProceed
            ? 'Answer the questions above to get your personalized vehicle allocation.'
            : 'Please complete Tool 4 (Financial Freedom Framework) to set your retirement savings budget.'
          }</p>
        </div>
        `}
      </div>
    </div>

    <!-- Section 3: Projections -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('projections')">
        <div class="section-title">&#128200; 3. Future Value Projections</div>
        <span class="section-toggle ${hasProjections ? '' : 'collapsed'}" id="projectionsToggle">&#9660;</span>
      </div>

      ${hasProjections ? `
      <div class="section-summary" id="projectionsSummary">
        <div class="section-summary-grid">
          <div class="section-summary-item"><strong>Projected Balance:</strong> <span id="summaryProjectedBalance">$${(projections?.retirement?.projectedBalance || 0).toLocaleString()}</span></div>
          <div class="section-summary-item"><strong>Monthly Income:</strong> <span id="summaryMonthlyIncome">$${(projections?.retirement?.monthlyIncome || 0).toLocaleString()}/mo</span></div>
          <div class="section-summary-item"><strong>Return Rate:</strong> <span>${projections?.retirement?.annualReturn || 12}%</span></div>
        </div>
      </div>
      ` : ''}

      <div class="section-body ${hasProjections ? '' : 'collapsed'}" id="projectionsBody">
        ${this.buildProjectionsSection(projections, preSurveyData)}
      </div>
    </div>

    <!-- Section 4: Saved Scenarios -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('scenarios')">
        <div class="section-title">&#128190; 4. Scenario Management</div>
        <span class="section-toggle ${hasAllocation ? '' : 'collapsed'}" id="scenariosToggle">&#9660;</span>
      </div>

      <div class="section-summary" id="scenariosSummary">
        <div class="section-summary-grid">
          <div class="section-summary-item"><strong>Saved Scenarios:</strong> <span id="summarySavedCount">Loading...</span></div>
        </div>
      </div>

      <div class="section-body ${hasAllocation ? '' : 'collapsed'}" id="scenariosBody">
        ${hasAllocation ? `
        <!-- Sprint 11.3: Scenario Management Instructions -->
        <div class="edu-help" style="margin-bottom: 20px;">
          <button type="button" class="edu-help-toggle" onclick="toggleEduHelp('scenarios')">
            <span class="edu-icon">&#9432;</span>
            <span>How to use Scenario Management</span>
          </button>
          <div class="edu-help-content" id="eduHelp-scenarios">
            <h5>Explore Different Retirement Strategies</h5>
            <p>Scenarios let you save and compare different allocation strategies to find your optimal approach.</p>

            <p><strong>How to use scenarios:</strong></p>
            <ul>
              <li><strong>Adjust your settings</strong> above (budget, tax strategy, sliders) to create different allocation mixes</li>
              <li><strong>Save each version</strong> with a descriptive name like "Aggressive Roth" or "Max 401k Match"</li>
              <li><strong>Compare scenarios</strong> side-by-side to see differences in projected balances and tax treatment</li>
              <li><strong>Load a scenario</strong> to restore all its settings and continue adjusting</li>
            </ul>

            <p><strong>Good scenarios to try:</strong></p>
            <ul>
              <li>One with maximum Roth contributions (tax-free growth)</li>
              <li>One with maximum Traditional contributions (tax deduction now)</li>
              <li>One with balanced approach (tax diversification)</li>
              <li>One with higher/lower risk tolerance to see impact on projections</li>
            </ul>

            <div class="edu-tip">
              <strong>Pro Tip:</strong> Your final scenario can be saved as your "master" allocation and will be reflected in your Financial TruPath summary.
            </div>
          </div>
        </div>

        <!-- Save Scenario Section -->
        <div class="scenario-actions">
          <div class="scenario-save-section">
            <h4 class="scenario-section-title">Save Current Allocation</h4>
            <p class="scenario-description">Save your current vehicle allocation to compare with other scenarios later.</p>
            <div class="scenario-save-form">
              <input type="text" id="scenarioName" class="form-input" placeholder="Enter scenario name (e.g., 'Aggressive Roth')" maxlength="50">
              <button type="button" class="btn-primary" onclick="saveScenario()">
                💾 Save Scenario
              </button>
            </div>
            <div id="saveScenarioFeedback" class="scenario-feedback" style="display: none;"></div>
          </div>

          <!-- Saved Scenarios List -->
          <div class="scenario-list-section">
            <h4 class="scenario-section-title">Your Saved Scenarios</h4>
            <div id="savedScenariosList" class="saved-scenarios-list">
              <p class="muted">Loading saved scenarios...</p>
            </div>
          </div>

          <!-- Compare Scenarios Section (Sprint 7.3) -->
          <div id="comparisonSection" class="scenario-comparison-section" style="display: none;">
            <h4 class="scenario-section-title">📊 Compare Scenarios</h4>
            <p class="scenario-description">Select two scenarios to see a side-by-side comparison of key metrics.</p>
            <div class="comparison-dropdowns">
              <div class="comparison-select-group">
                <label>Scenario A:</label>
                <select id="compareSelect1" class="form-input" onchange="updateScenarioComparison()">
                  <option value="">Select scenario...</option>
                </select>
              </div>
              <div class="comparison-vs">vs</div>
              <div class="comparison-select-group">
                <label>Scenario B:</label>
                <select id="compareSelect2" class="form-input" onchange="updateScenarioComparison()">
                  <option value="">Select scenario...</option>
                </select>
              </div>
            </div>
            <div id="comparisonResults" class="comparison-results">
              <p class="muted">Select two different scenarios to compare.</p>
            </div>
            <div id="comparisonPDFSection" style="display: none; margin-top: 15px; text-align: center;">
              <button type="button" class="btn-primary" onclick="downloadComparisonPDF()" id="comparisonPDFBtn">
                📄 Download Comparison Report
              </button>
            </div>
          </div>
        </div>
        ` : `
        <div class="placeholder-message">
          <h3>Complete Your Allocation First</h3>
          <p>Fill out the questionnaire and see your recommended allocation before saving scenarios.</p>
        </div>
        `}
      </div>
    </div>

    <!-- Sprint 11.6: Done Exploring Prompt -->
    <div class="done-exploring-prompt">
      <span class="done-icon">&#9989;</span>
      <span class="done-text">Done exploring? </span>
      <button type="button" class="btn-nav-inline" onclick="returnToDashboard()">Return to Dashboard</button>
      <span class="done-text"> to continue your TruPath journey.</span>
    </div>

  </div>

  <script>
    var clientId = '${clientId}';
    var formData = ${JSON.stringify(preSurveyData || {})};
    var classifiedProfile = ${profile ? JSON.stringify(profile) : 'null'};
    var upstreamAge = ${toolStatus.age || 'null'};
    var upstreamYearsToRetirement = ${toolStatus.yearsToRetirement || 'null'};

    // ========================================================================
    // PROJECTION CONFIG (Sprint 6.1)
    // ========================================================================

    var PROJECTION_CONFIG = {
      BASE_RATE: 0.08,
      MAX_ADDITIONAL_RATE: 0.12,
      MAX_YEARS: 70,
      MAX_RATE: 0.25,
      MAX_FV: 100000000,
      DEFAULT_INFLATION: 0.025,
      FAMILY_BANK_RATE: 0.05,
      EDUCATION_RATE: 0.07
    };

    // Initial projections data from server
    var initialProjections = ${projections ? JSON.stringify(projections) : 'null'};

    // Investment score (for return rate calculation)
    var currentInvestmentScore = ${preSurveyData?.investmentScore || toolStatus.investmentScore || 4};

    // Current balances from form data
    var currentBalances = {
      retirement: ${(parseFloat(preSurveyData?.a12_current401kBalance) || 0) + (parseFloat(preSurveyData?.a13_currentIRABalance) || 0) + (parseFloat(preSurveyData?.a14_currentHSABalance) || 0)},
      education: ${parseFloat(preSurveyData?.a15_currentEducationBalance) || 0}
    };

    // Years to retirement/education
    var yearsToRetirement = ${parseInt(preSurveyData?.a2_yearsToRetirement || toolStatus.yearsToRetirement) || 25};
    var yearsToEducation = ${parseInt(preSurveyData?.a10_yearsToEducation) || 99};
    var numChildren = ${parseInt(preSurveyData?.a9_numChildren) || 0};
    var hasChildren = ${preSurveyData?.a8_hasChildren === 'Yes'};

    // Education vehicle names for filtering
    var educationVehicles = ['529_Plan', 'Coverdell_ESA'];

    // ========================================================================
    // CLASSIFICATION FLOW CONFIGURATION
    // ========================================================================

    // Classification question order and termination rules
    var classificationOrder = ['c1_robsStatus', 'c2_robsQualifier1', 'c3_robsQualifier2', 'c4_robsQualifier3', 'c5_workSituation', 'c6_hasTradIRA', 'c7_taxFocus'];

    // Profile definitions for display
    var profileDefinitions = ${JSON.stringify(PROFILE_DEFINITIONS)};

    // Termination rules: { questionId: { answerValue: profileId } }
    var terminatesAt = {
      c1_robsStatus: { 'using': 1 },
      c4_robsQualifier3: { 'Yes': 2 },
      c5_workSituation: { 'Self-employed': 4, 'Both': 4, 'BizWithEmployees': 3 },
      c6_hasTradIRA: { 'Yes': 5 },
      c7_taxFocus: { 'Now': 8, 'Both': 8, 'Later': 7 }
    };

    // Next question rules: { questionId: { answerValue: nextQuestionId } }
    var nextQuestionRules = {
      c1_robsStatus: { 'using': null, 'interested': 'c2_robsQualifier1', 'no': 'c5_workSituation' },
      c2_robsQualifier1: { 'Yes': 'c3_robsQualifier2', 'No': 'c5_workSituation' },
      c3_robsQualifier2: { 'Yes': 'c4_robsQualifier3', 'No': 'c5_workSituation' },
      c4_robsQualifier3: { 'Yes': null, 'No': 'c5_workSituation' },
      c5_workSituation: { 'W-2': 'c6_hasTradIRA', 'Self-employed': null, 'Both': null, 'BizWithEmployees': null },
      c6_hasTradIRA: { 'Yes': null, 'No': 'c7_taxFocus' },
      c7_taxFocus: { 'Now': null, 'Both': null, 'Later': null }
    };

    // ========================================================================
    // PHASE B VISIBILITY RULES (Allocation questions)
    // ========================================================================

    var allocationVisibilityRules = {
      a4_hasMatch: function() { return formData.a3_has401k === 'Yes'; },
      a5_matchFormula: function() { return formData.a3_has401k === 'Yes' && formData.a4_hasMatch === 'Yes'; },
      a6_hasRoth401k: function() { return formData.a3_has401k === 'Yes'; },
      a9_numChildren: function() { return formData.a8_hasChildren === 'Yes'; },
      a10_yearsToEducation: function() { return formData.a8_hasChildren === 'Yes'; },
      a11_educationVehicle: function() { return formData.a8_hasChildren === 'Yes'; },
      a12_current401kBalance: function() { return formData.a3_has401k === 'Yes'; },
      a14_currentHSABalance: function() { return formData.a7_hsaEligible === 'Yes'; },
      a15_currentEducationBalance: function() { return formData.a8_hasChildren === 'Yes'; },
      a16_monthly401kContribution: function() { return formData.a3_has401k === 'Yes'; },
      a18_monthlyHSAContribution: function() { return formData.a7_hsaEligible === 'Yes'; },
      a19_monthlyEducationContribution: function() { return formData.a8_hasChildren === 'Yes'; }
    };

    // ========================================================================
    // SECTION TOGGLE
    // ========================================================================

    function toggleSection(sectionId) {
      var body = document.getElementById(sectionId + 'Body');
      var toggle = document.getElementById(sectionId + 'Toggle');
      var summary = document.getElementById(sectionId + 'Summary');

      body.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed');
      if (summary) summary.classList.toggle('show');
    }

    /**
     * Toggle educational help sections (Sprint 11.3)
     */
    function toggleEduHelp(helpId) {
      var content = document.getElementById('eduHelp-' + helpId);
      if (content) {
        content.classList.toggle('show');
      }
    }

    // ========================================================================
    // NAVIGATION - Return to Dashboard (Sprint 11.1)
    // ========================================================================

    function returnToDashboard() {
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Returning to Dashboard...';
        if (loadingSubtext) loadingSubtext.textContent = 'Loading your overview';
        loadingOverlay.classList.add('show');
      }

      google.script.run
        .withSuccessHandler(function(dashboardHtml) {
          if (dashboardHtml) {
            document.open();
            document.write(dashboardHtml);
            document.close();
            window.scrollTo(0, 0);
          } else {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            alert('Error loading dashboard');
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          console.error('Navigation error:', error);
          alert('Error returning to dashboard: ' + error.message);
        })
        .getDashboardPage('${clientId}');
    }

    // ========================================================================
    // BACKUP QUESTIONS - Save & Continue (Section 0)
    // ========================================================================

    function saveBackupQuestions() {
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      // Show loading
      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Saving Your Information...';
        if (loadingSubtext) loadingSubtext.textContent = 'Updating your profile';
        loadingOverlay.classList.add('show');
      }

      // Collect ALL backup question values from all tiers
      var backupData = {};

      // Helper to collect input value if it exists
      function collectInput(fieldId, parser) {
        var input = document.getElementById(fieldId);
        if (input && input.value !== '') {
          return parser ? parser(input.value) : input.value;
        }
        return null;
      }

      // Helper to collect radio/select value
      function collectRadio(fieldName) {
        var selected = document.querySelector('input[name="' + fieldName + '"]:checked');
        return selected ? selected.value : null;
      }

      // Tier 1: Tool 4 backup (income/budget)
      var val = collectInput('backup_monthlyIncome', parseFloat);
      if (val !== null) backupData.backup_monthlyIncome = val;

      val = collectInput('backup_monthlyBudget', parseFloat);
      if (val !== null) backupData.backup_monthlyBudget = val;

      // Tier 2: Tool 2 backup (age, gross income, employment, filing status)
      val = collectInput('backup_age', parseInt);
      if (val !== null) backupData.backup_age = val;

      val = collectInput('backup_grossIncome', parseFloat);
      if (val !== null) backupData.backup_grossIncome = val;

      val = collectRadio('backup_employmentType');
      if (val !== null) backupData.backup_employmentType = val;

      val = collectRadio('backup_filingStatus');
      if (val !== null) backupData.backup_filingStatus = val;

      val = collectRadio('backup_hasHSA');
      if (val !== null) backupData.backup_hasHSA = val;

      // Tier 3: Tool 1 backup (trauma pattern questions)
      val = collectRadio('backup_stressResponse');
      if (val !== null) backupData.backup_stressResponse = val;

      val = collectRadio('backup_coreBelief');
      if (val !== null) backupData.backup_coreBelief = val;

      val = collectRadio('backup_consequence');
      if (val !== null) backupData.backup_consequence = val;

      console.log('Backup data collected:', backupData);

      // Merge with existing preSurvey data if any
      var existingData = ${JSON.stringify(preSurveyData || {})};
      console.log('Existing data:', existingData);
      var mergedData = Object.assign({}, existingData, backupData);
      console.log('Merged data to save:', mergedData);

      google.script.run
        .withSuccessHandler(function(result) {
          if (result && result.success === false) {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            alert('Error saving: ' + (result.error || 'Unknown error'));
            return;
          }

          // Refresh page with updated data
          if (result && result.nextPageHtml) {
            document.open();
            document.write(result.nextPageHtml);
            document.close();
            window.scrollTo(0, 0);
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          console.error('Save error:', error);
          alert('Error saving: ' + error.message);
        })
        .savePreSurveyTool6('${clientId}', mergedData);
    }

    // Sprint 8.1: Toggle trauma insight section
    function toggleTraumaInsight() {
      var body = document.getElementById('traumaBody');
      var toggle = document.getElementById('traumaToggle');
      var header = document.getElementById('traumaHeader');

      if (body && toggle) {
        body.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
        if (header) header.classList.toggle('expanded');
      }
    }

    // ========================================================================
    // BACKUP QUESTIONS HANDLERS (Sprint 10.1)
    // ========================================================================

    // Update backup slider display
    function updateBackupSlider(fieldName, value) {
      var display = document.getElementById('backup_' + fieldName + 'Display');
      var track = document.getElementById('backup_' + fieldName + 'Track');
      var input = document.getElementById('backup_' + fieldName);

      if (display) {
        if (fieldName === 'yearsToRetirement') {
          display.textContent = value + ' years';
        } else {
          display.textContent = value;
        }
      }

      // Update track fill
      if (track && input) {
        var min = parseFloat(input.min) || 0;
        var max = parseFloat(input.max) || 100;
        var pct = ((value - min) / (max - min)) * 100;
        track.style.width = pct + '%';
      }

      // Store in formData
      formData['backup_' + fieldName] = value;
    }

    // Select backup score button (1-7 scale)
    function selectBackupScore(fieldName, value) {
      var buttons = document.querySelectorAll('#backup_' + fieldName + 'Buttons .score-btn');
      var hidden = document.getElementById('backup_' + fieldName);
      var label = document.getElementById('backup_' + fieldName + 'Label');

      buttons.forEach(function(btn) {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.value) === value) {
          btn.classList.add('selected');
        }
      });

      if (hidden) hidden.value = value;

      // Update label
      if (label) {
        var labels = {
          1: 'Very Conservative (6% return)',
          2: 'Conservative (8% return)',
          3: 'Moderately Conservative (10% return)',
          4: 'Moderate (12% return)',
          5: 'Moderately Aggressive (14% return)',
          6: 'Aggressive (17% return)',
          7: 'Very Aggressive (20% return)'
        };
        label.textContent = labels[value] || 'Moderate (12% return)';
      }

      formData['backup_' + fieldName] = value;
    }

    // Select backup statement card (radio buttons)
    function selectBackupStatement(card, fieldName) {
      var group = card.closest('.statement-group');
      if (!group) return;

      // Deselect all in group
      group.querySelectorAll('.statement-card').forEach(function(c) {
        c.classList.remove('selected');
        var radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });

      // Select this one
      card.classList.add('selected');
      var radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        formData[fieldName] = radio.value;
      }
    }

    // Navigate to another tool (Sprint 10.1: from backup questions)
    function navigateToTool(toolName) {
      // Show a loading state
      var loadingMsg = document.createElement('div');
      loadingMsg.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
      loadingMsg.innerHTML = '<div style="text-align:center;color:white;"><div style="font-size:1.5rem;margin-bottom:8px;">Loading ' + toolName.replace('tool', 'Tool ') + '...</div><div style="opacity:0.7;">Please wait</div></div>';
      document.body.appendChild(loadingMsg);

      google.script.run
        .withSuccessHandler(function(html) {
          if (html) {
            document.open();
            document.write(html);
            document.close();
            window.scrollTo(0, 0);
          } else {
            document.body.removeChild(loadingMsg);
            alert('Error loading tool');
          }
        })
        .withFailureHandler(function(error) {
          document.body.removeChild(loadingMsg);
          console.error('Navigation error:', error);
          alert('Error loading tool: ' + error.message);
        })
        .getToolPageHtml(toolName, clientId, 1);
    }

    // Initialize backup sliders on page load
    function initBackupSliders() {
      var sliders = ['yearsToRetirement'];
      sliders.forEach(function(name) {
        var input = document.getElementById('backup_' + name);
        if (input) {
          updateBackupSlider(name, input.value);
        }
      });
    }

    // ========================================================================
    // CLASSIFICATION FLOW HANDLERS
    // ========================================================================

    // Handle classification question answer
    function handleClassificationAnswer(fieldId, value) {
      formData[fieldId] = value;

      // Check if this answer terminates classification (assigns a profile)
      if (terminatesAt[fieldId] && terminatesAt[fieldId][value]) {
        var profileId = terminatesAt[fieldId][value];

        // Check for derived overrides (age-based profiles 6 and 9)
        profileId = checkDerivedOverrides(profileId);

        showProfileResult(profileId);
        return;
      }

      // Get next question
      var nextQ = nextQuestionRules[fieldId] ? nextQuestionRules[fieldId][value] : null;

      if (nextQ) {
        // Before showing next question, check derived values for profiles 6 and 9
        // These are checked after c6_hasTradIRA = No but before c7_taxFocus
        if (nextQ === 'c7_taxFocus') {
          var derivedProfile = checkDerivedProfiles();
          if (derivedProfile) {
            showProfileResult(derivedProfile);
            return;
          }
        }

        showClassificationQuestion(nextQ);
      } else {
        // No next question and no termination - should not happen, default to Profile 7
        showProfileResult(7);
      }
    }

    // Check if derived values should override to Profile 6 or 9
    function checkDerivedOverrides(profileId) {
      // Profiles 6 and 9 are only for W-2 employees who would otherwise be 7 or 8
      if (profileId === 7 || profileId === 8) {
        var derivedProfile = checkDerivedProfiles();
        if (derivedProfile) return derivedProfile;
      }
      return profileId;
    }

    // Check derived profiles based on age/years to retirement
    function checkDerivedProfiles() {
      var age = upstreamAge || 35;
      var yearsToRetirement = upstreamYearsToRetirement || 30;

      // Profile 9: Late-Stage Growth (age >= 55 OR yearsToRetirement <= 5)
      if (age >= 55 || yearsToRetirement <= 5) {
        return 9;
      }

      // Profile 6: Catch-Up Contributor (age >= 50 AND needs to catch up)
      // Note: In two-phase flow, we do not have catchUpFeeling yet
      // So Profile 6 only triggers if we have age >= 50 from upstream
      // User will need to indicate catch-up feeling if not derived
      if (age >= 50) {
        // For now, do not auto-assign Profile 6 without explicit input
        // The catch-up feeling question was removed in two-phase design
        // Profile 6 is handled via taxFocus questions
      }

      return null;
    }

    // Show a specific classification question
    function showClassificationQuestion(fieldId) {
      // Hide all classification questions
      classificationOrder.forEach(function(qId) {
        var el = document.getElementById('cq_' + qId);
        if (el) el.classList.add('hidden');
      });

      // Show the target question
      var targetEl = document.getElementById('cq_' + fieldId);
      if (targetEl) {
        targetEl.classList.remove('hidden');
        // Scroll into view
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Show the profile result card
    function showProfileResult(profileId) {
      classifiedProfile = profileDefinitions[profileId];
      formData.classifiedProfile = profileId;

      // Update hidden field
      var profileInput = document.getElementById('classifiedProfile');
      if (profileInput) profileInput.value = profileId;

      // Hide classification container
      var container = document.getElementById('classificationContainer');
      if (container) container.classList.add('hidden');

      // Show profile result
      var result = document.getElementById('profileResult');
      if (result) {
        document.getElementById('profileIcon').textContent = classifiedProfile.icon || '';
        document.getElementById('profileName').textContent = classifiedProfile.name;
        document.getElementById('profileReason').textContent = classifiedProfile.matchReason || classifiedProfile.description;
        result.classList.remove('hidden');
      }

      // Sprint 11.2: Update persistent profile banner
      updateProfileBanner(classifiedProfile);
    }

    // Sprint 11.2: Update the persistent profile banner
    function updateProfileBanner(profile) {
      var banner = document.getElementById('profileBanner');
      if (!banner) return;

      // Update banner content
      var iconEl = document.getElementById('profileBannerIcon');
      var nameEl = document.getElementById('profileBannerName');
      if (iconEl) iconEl.textContent = profile.icon || '';
      if (nameEl) nameEl.textContent = profile.name || 'Not Set';

      // Show the banner
      banner.classList.add('show');
    }

    // Sprint 11.2: Update banner stats (called when settings change)
    function updateBannerStats() {
      var budgetEl = document.getElementById('profileBannerBudget');
      var yearsEl = document.getElementById('profileBannerYears');
      var scoreEl = document.getElementById('profileBannerScore');
      var filingEl = document.getElementById('profileBannerFiling');

      if (budgetEl && allocationState.budget) {
        budgetEl.textContent = '$' + allocationState.budget.toLocaleString();
      }
      var yearsInput = document.getElementById('yearsToRetirementInput');
      if (yearsEl && yearsInput) {
        yearsEl.textContent = yearsInput.value || '--';
      }
      var scoreInput = document.getElementById('investmentScore');
      if (scoreEl && scoreInput) {
        scoreEl.textContent = scoreInput.value + '/7';
      }
      // Update filing status display
      if (filingEl) {
        var filingSelect = document.getElementById('filingStatusSelect');
        var filingStatus = filingSelect ? filingSelect.value : (allocationState.filingStatus || 'Single');
        var displayNames = {
          'Single': 'Single',
          'MFJ': 'Married (Joint)',
          'MFS': 'Married (Sep)',
          'HoH': 'Head of House'
        };
        filingEl.textContent = displayNames[filingStatus] || 'Single';
      }
    }

    // Continue to Phase B (allocation inputs)
    function continueToPhaseB() {
      // Hide Phase A
      var phaseA = document.getElementById('phaseA');
      if (phaseA) phaseA.classList.add('hidden');

      // Show Phase B
      var phaseB = document.getElementById('phaseB');
      if (phaseB) {
        phaseB.classList.remove('hidden');
        phaseB.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Initialize Phase B visibility
      updateAllocationVisibility();
    }

    // Restart classification (change profile)
    function restartClassification() {
      // Clear classification answers
      classificationOrder.forEach(function(qId) {
        formData[qId] = null;
        var input = document.getElementById(qId);
        if (input) input.value = '';
        // Clear selected buttons
        var buttons = document.querySelectorAll('#group_' + qId + ' .yesno-btn');
        buttons.forEach(function(btn) { btn.classList.remove('selected'); });
      });

      classifiedProfile = null;

      // Show Phase A
      var phaseA = document.getElementById('phaseA');
      if (phaseA) phaseA.classList.remove('hidden');

      // Hide profile result, show classification container
      var result = document.getElementById('profileResult');
      if (result) result.classList.add('hidden');

      var container = document.getElementById('classificationContainer');
      if (container) container.classList.remove('hidden');

      // Show first question
      showClassificationQuestion(classificationOrder[0]);

      // Hide Phase B
      var phaseB = document.getElementById('phaseB');
      if (phaseB) phaseB.classList.add('hidden');

      // Hide Phase C
      var phaseC = document.getElementById('phaseC');
      if (phaseC) phaseC.classList.add('hidden');

      // Sprint 11.2: Hide profile banner
      var banner = document.getElementById('profileBanner');
      if (banner) banner.classList.remove('show');

      // Expand Section 1 if collapsed
      var profileBody = document.getElementById('profileBody');
      var profileToggle = document.getElementById('profileToggle');
      if (profileBody && profileBody.classList.contains('collapsed')) {
        profileBody.classList.remove('collapsed');
        if (profileToggle) profileToggle.classList.remove('collapsed');
      }
    }

    // Continue to Phase C (ambition quotient)
    // Sprint 11.2: Skip Phase C when only Retirement domain applies
    function continueToPhaseC() {
      var hasChildren = formData.a8_hasChildren === 'Yes';
      var hasHSA = formData.a7_hsaEligible === 'Yes';

      // If only Retirement domain applies (no children, no HSA), skip Phase C entirely
      // The Ambition Quotient is meaningless with only one domain - 100% goes to Retirement
      if (!hasChildren && !hasHSA) {
        console.log('Skipping Phase C - only Retirement domain applies');

        // Set default Retirement ambition values (they do not affect allocation when single domain)
        // Note: Field names must match AMBITION_QUESTIONS in Tool6Constants.js
        formData.aq_retirement_importance = formData.aq_retirement_importance || 5;
        formData.aq_retirement_anxiety = formData.aq_retirement_anxiety || 4;
        formData.aq_retirement_motivation = formData.aq_retirement_motivation || 5;

        // Also set the hidden input values so they get submitted
        var impInput = document.getElementById('aq_retirement_importance');
        var anxInput = document.getElementById('aq_retirement_anxiety');
        var motInput = document.getElementById('aq_retirement_motivation');
        if (impInput) impInput.value = formData.aq_retirement_importance;
        if (anxInput) anxInput.value = formData.aq_retirement_anxiety;
        if (motInput) motInput.value = formData.aq_retirement_motivation;

        // Go directly to submit
        submitQuestionnaire();
        return;
      }

      // Hide Phase B
      var phaseB = document.getElementById('phaseB');
      if (phaseB) phaseB.classList.add('hidden');

      // Show Phase C
      var phaseC = document.getElementById('phaseC');
      if (phaseC) {
        phaseC.classList.remove('hidden');
        phaseC.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Update Phase C domain visibility based on Phase B answers
      updateAmbitionVisibility();
    }

    // Update which ambition domains are visible
    function updateAmbitionVisibility() {
      var hasChildren = formData.a8_hasChildren === 'Yes';
      var hasHSA = formData.a7_hsaEligible === 'Yes';

      // Education domain
      var eduDomain = document.getElementById('domain_Education');
      if (eduDomain) {
        if (hasChildren) {
          eduDomain.classList.remove('hidden');
        } else {
          eduDomain.classList.add('hidden');
        }
      }

      // Health domain
      var healthDomain = document.getElementById('domain_Health');
      if (healthDomain) {
        if (hasHSA) {
          healthDomain.classList.remove('hidden');
        } else {
          healthDomain.classList.add('hidden');
        }
      }

      // Tie-breaker (only if all 3 domains active)
      var tiebreaker = document.getElementById('tiebreakerSection');
      if (tiebreaker) {
        if (hasChildren && hasHSA) {
          tiebreaker.classList.remove('hidden');
        } else {
          tiebreaker.classList.add('hidden');
        }
      }
    }

    // ========================================================================
    // FIELD CHANGE HANDLERS
    // ========================================================================

    function handleFieldChange(fieldId, value) {
      formData[fieldId] = value;

      // Check if this is a classification question
      if (classificationOrder.indexOf(fieldId) >= 0) {
        handleClassificationAnswer(fieldId, value);
      } else {
        // Allocation question - update visibility
        updateAllocationVisibility();
      }
    }

    function selectYesNo(fieldId, value) {
      var buttons = document.querySelectorAll('#group_' + fieldId + ' .yesno-btn');
      buttons.forEach(function(btn) {
        btn.classList.remove('selected');
        if (btn.textContent === value) {
          btn.classList.add('selected');
        }
      });
      document.getElementById(fieldId).value = value;
      handleFieldChange(fieldId, value);
    }

    function selectScale(fieldId, value) {
      var buttons = document.querySelectorAll('#scale_' + fieldId + ' .scale-btn');
      buttons.forEach(function(btn) {
        btn.classList.remove('selected');
        if (parseInt(btn.getAttribute('data-value')) === value) {
          btn.classList.add('selected');
        }
      });
      document.getElementById(fieldId).value = value;
      formData[fieldId] = value;
    }

    function updateRanking(fieldId) {
      var ranks = {
        retirement: parseInt(document.getElementById(fieldId + '_retirement').value),
        education: parseInt(document.getElementById(fieldId + '_education').value),
        health: parseInt(document.getElementById(fieldId + '_health').value)
      };
      document.getElementById(fieldId).value = JSON.stringify(ranks);
      formData[fieldId] = ranks;
    }

    // ========================================================================
    // VISIBILITY MANAGEMENT
    // ========================================================================

    function updateAllocationVisibility() {
      for (var fieldId in allocationVisibilityRules) {
        var group = document.getElementById('group_' + fieldId);
        if (group) {
          var shouldShow = allocationVisibilityRules[fieldId]();
          var wrapper = group.closest('.conditional-field');
          var target = wrapper || group;

          if (shouldShow) {
            target.classList.remove('hidden');
          } else {
            target.classList.add('hidden');
            var input = document.getElementById(fieldId);
            if (input) input.value = '';
            formData[fieldId] = null;
          }
        }
      }
    }

    // ========================================================================
    // FORM VALIDATION
    // ========================================================================

    function validateForm() {
      var errors = [];

      // Phase B required fields (allocation questions)
      var requiredFields = [
        { id: 'a1_grossIncome', label: 'Gross annual income' },
        { id: 'a2_yearsToRetirement', label: 'Years to retirement' },
        { id: 'a7_hsaEligible', label: 'HSA eligibility' },
        { id: 'a8_hasChildren', label: 'Education savings question' },
        { id: 'a13_currentIRABalance', label: 'Current IRA balance' },
        { id: 'a17_monthlyIRAContribution', label: 'Monthly IRA contribution' }
      ];

      // Phase C required fields (ambition quotient - retirement always required)
      requiredFields.push({ id: 'aq_retirement_importance', label: 'Retirement importance' });
      requiredFields.push({ id: 'aq_retirement_anxiety', label: 'Retirement anxiety' });
      requiredFields.push({ id: 'aq_retirement_motivation', label: 'Retirement motivation' });

      // Education ambition questions (if hasChildren)
      if (formData.a8_hasChildren === 'Yes') {
        requiredFields.push({ id: 'aq_education_importance', label: 'Education importance' });
        requiredFields.push({ id: 'aq_education_anxiety', label: 'Education anxiety' });
        requiredFields.push({ id: 'aq_education_motivation', label: 'Education motivation' });
      }

      // Health ambition questions (if HSA eligible)
      if (formData.a7_hsaEligible === 'Yes') {
        requiredFields.push({ id: 'aq_health_importance', label: 'Healthcare importance' });
        requiredFields.push({ id: 'aq_health_anxiety', label: 'Healthcare anxiety' });
        requiredFields.push({ id: 'aq_health_motivation', label: 'Healthcare motivation' });
      }

      // Tie-breaker (if all 3 domains active)
      if (formData.a8_hasChildren === 'Yes' && formData.a7_hsaEligible === 'Yes') {
        requiredFields.push({ id: 'aq_tiebreaker', label: 'Priority tie-breaker' });
      }

      // Add employer questions if not skipped for profile
      var skipProfiles = [1, 2, 3, 4];
      var profileId = parseInt(document.getElementById('classifiedProfile').value) || 7;
      if (skipProfiles.indexOf(profileId) === -1) {
        requiredFields.push({ id: 'a3_has401k', label: '401(k) access' });
      }

      requiredFields.forEach(function(field) {
        var input = document.getElementById(field.id);
        var group = document.getElementById('group_' + field.id);
        var wrapper = group ? group.closest('.conditional-field') : null;

        // Skip if field or its wrapper is hidden
        if (group && group.classList.contains('hidden')) return;
        if (wrapper && wrapper.classList.contains('hidden')) return;

        if (!input || !input.value || input.value === '') {
          errors.push(field.label + ' is required');
        }
      });

      // Validate grossIncome is positive
      var grossIncomeEl = document.getElementById('a1_grossIncome');
      if (grossIncomeEl) {
        var grossIncome = parseFloat(grossIncomeEl.value);
        if (grossIncome <= 0) {
          errors.push('Gross income must be greater than 0');
        }
      }

      // Validate yearsToRetirement is reasonable
      var yearsEl = document.getElementById('a2_yearsToRetirement');
      if (yearsEl) {
        var years = parseInt(yearsEl.value);
        if (years < 1 || years > 50) {
          errors.push('Years to retirement must be between 1 and 50');
        }
      }

      return errors;
    }

    // ========================================================================
    // FORM SUBMISSION
    // ========================================================================

    function submitQuestionnaire() {
      var errors = validateForm();
      var errorDiv = document.getElementById('errorMessage');

      if (errors.length > 0) {
        errorDiv.innerHTML = errors.join('<br>');
        errorDiv.classList.add('show');
        return;
      }

      errorDiv.classList.remove('show');

      // Collect all form data
      var form = document.getElementById('questionnaireForm');
      var inputs = form.querySelectorAll('input, select');
      var submitData = {};

      inputs.forEach(function(input) {
        if (input.name && input.value) {
          if (input.type === 'number' || input.type === 'hidden' && input.name.startsWith('aq_') && input.name !== 'aq_tiebreaker') {
            // Parse numbers and ambition scale values
            submitData[input.name] = parseFloat(input.value) || 0;
          } else {
            submitData[input.name] = input.value;
          }
        }
      });

      // Add monthlyBudget from Tool 4
      submitData.monthlyBudget = ${toolStatus.monthlyBudget || 0};

      // Show loading overlay
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Calculating Your Allocation...';
        if (loadingSubtext) loadingSubtext.textContent = 'Analyzing your retirement profile';
        loadingOverlay.classList.add('show');
      }

      var submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result && result.success === false) {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.style.opacity = '1';
            }
            errorDiv.innerHTML = result.error || 'An error occurred. Please try again.';
            errorDiv.classList.add('show');
            return;
          }

          if (result && result.nextPageHtml) {
            document.open();
            document.write(result.nextPageHtml);
            document.close();
            window.scrollTo(0, 0);
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
          }
          errorDiv.innerHTML = 'Server error: ' + error.message;
          errorDiv.classList.add('show');
        })
        .savePreSurveyTool6(clientId, submitData);
    }

    // ========================================================================
    // PHASE 5: CALCULATOR UI HANDLERS
    // ========================================================================

    // Investment score labels for display
    var scoreLabels = {
      1: 'Ultra-Conservative (4%)',
      2: 'Conservative (6%)',
      3: 'Moderately Conservative (8%)',
      4: 'Moderate (10%)',
      5: 'Moderately Aggressive (12%)',
      6: 'Aggressive (14%)',
      7: 'Ultra-Aggressive (16%)'
    };

    // Sprint 5.2: Update investment score
    function updateInvestmentScore(score) {
      // Update hidden input
      var input = document.getElementById('investmentScore');
      if (input) input.value = score;

      // Update button states
      var buttons = document.querySelectorAll('#investmentScoreButtons .score-btn');
      buttons.forEach(function(btn) {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.score) === score) {
          btn.classList.add('selected');
        }
      });

      // Update description
      var desc = document.getElementById('scoreDescription');
      if (desc) {
        desc.textContent = scoreLabels[score] || 'Moderate (10%)';
      }

      // Store in formData for submission
      formData.investmentScore = score;

      // Sprint 6.2: Update global variable for projection calculations
      currentInvestmentScore = score;

      // Update projection assumptions display
      var returnRatePercent = (calculatePersonalizedRate(score) * 100).toFixed(1);
      updateElementText('.assumption-item:nth-child(1) .assumption-value', score + '/7');
      updateElementText('.assumption-item:nth-child(2) .assumption-value', returnRatePercent + '% annually');

      // Update projections with new rate
      updateProjectionDisplay();

      // Sprint 11.4: Update plain English summary (return rate changed)
      var currentTotal = 0;
      for (var id in allocationState.vehicles) {
        currentTotal += allocationState.vehicles[id] || 0;
      }
      updateResultsSummary(currentTotal);

      // Trigger recalculation if calculator is active
      markCalculatorDirty();

      // Sprint 11.2: Update banner stats
      updateBannerStats();
    }

    // Sprint 5.3: Update tax strategy
    function updateTaxStrategy(strategy) {
      // Update radio button visual states
      var options = document.querySelectorAll('.tax-option');
      options.forEach(function(opt) {
        var input = opt.querySelector('input[type="radio"]');
        if (input && input.value === strategy) {
          opt.classList.add('selected');
          input.checked = true;
        } else {
          opt.classList.remove('selected');
        }
      });

      // Store in formData
      formData.a2b_taxPreference = strategy;

      // Auto-recalculate when tax strategy changes
      // This is important because it can change which vehicles are available
      // (e.g., Solo 401k Employee Roth vs Traditional for Profile 4)
      recalculateAllocation();
    }

    // ========================================================================
    // VEHICLE ALLOCATION STATE (similar to Tool 4 bucket state)
    // ========================================================================

    // Initialize allocation state from rendered sliders
    var allocationState = {
      vehicles: {},           // Current allocation amounts by vehicle
      originalAllocation: {}, // Original algorithm output (for proportions)
      limits: {},             // Effective max limits per vehicle (min of IRS limit and budget)
      irsLimits: {},          // True IRS limits per vehicle (does not change with budget)
      locked: {},             // Which vehicles are locked
      budget: 0,              // Total monthly budget
      originalBudget: 0,      // Original budget from Tool 4
      filingStatus: 'Single', // Tax filing status (Single, MFJ, MFS, HoH)
      hsaCoverageType: 'Individual' // HSA coverage type (Individual or Family)
    };

    // Initialize state from DOM on page load
    function initAllocationState() {
      // Get budget from input field
      var budgetInput = document.getElementById('budgetInput');
      if (budgetInput) {
        allocationState.budget = parseFloat(budgetInput.value) || 0;
        allocationState.originalBudget = allocationState.budget;
      }

      // Get filing status from select
      var filingSelect = document.getElementById('filingStatusSelect');
      if (filingSelect) {
        allocationState.filingStatus = filingSelect.value || 'Single';
        allocationState.hsaCoverageType = (allocationState.filingStatus === 'MFJ') ? 'Family' : 'Individual';
      }

      // Initialize each vehicle from slider values
      var sliders = document.querySelectorAll('.vehicle-slider');
      sliders.forEach(function(slider) {
        var vehicleId = slider.dataset.vehicleId;
        if (vehicleId) {
          var value = parseFloat(slider.value) || 0;
          allocationState.vehicles[vehicleId] = value;
          allocationState.originalAllocation[vehicleId] = value; // Store original

          // Get IRS limit from data attribute (true limit, not capped by budget)
          var irsLimit = parseFloat(slider.dataset.irsLimit) || 999999;
          allocationState.irsLimits[vehicleId] = irsLimit;

          // Effective limit is min of IRS limit and budget
          allocationState.limits[vehicleId] = Math.min(irsLimit, allocationState.budget);
          allocationState.locked[vehicleId] = false;
        }
      });

      console.log('initAllocationState called:', allocationState);
    }

    // Get original proportions for unlocked vehicles (renormalized)
    function getOriginalProportions(excludeVehicleId) {
      var proportions = {};
      var totalOriginal = 0;

      // Sum original allocations for unlocked vehicles (excluding the one being adjusted)
      for (var id in allocationState.originalAllocation) {
        if (id !== excludeVehicleId && !allocationState.locked[id]) {
          totalOriginal += allocationState.originalAllocation[id] || 0;
        }
      }

      // Calculate renormalized proportions
      if (totalOriginal > 0) {
        for (var id in allocationState.originalAllocation) {
          if (id !== excludeVehicleId && !allocationState.locked[id]) {
            proportions[id] = (allocationState.originalAllocation[id] || 0) / totalOriginal;
          }
        }
      }

      return proportions;
    }

    // Reset to original algorithm recommendation
    function resetToRecommended() {
      // Restore original values
      for (var id in allocationState.originalAllocation) {
        allocationState.vehicles[id] = allocationState.originalAllocation[id];
        allocationState.locked[id] = false;
      }
      allocationState.budget = allocationState.originalBudget;

      // Update budget input if it exists
      var budgetInput = document.getElementById('budgetInput');
      if (budgetInput) {
        budgetInput.value = allocationState.originalBudget;
      }

      // Update UI
      updateAllVehicleDisplays();
      updateAllLockButtons();

      // Clear dirty state
      var recalcBtn = document.querySelector('.btn-recalc-primary');
      if (recalcBtn) {
        recalcBtn.style.animation = '';
      }
    }

    // Toggle lock state for a vehicle
    function toggleVehicleLock(vehicleId) {
      allocationState.locked[vehicleId] = !allocationState.locked[vehicleId];
      updateLockButton(vehicleId);
      updateSliderState(vehicleId);
    }

    // Update lock button display - Tool 4 style with text
    function updateLockButton(vehicleId) {
      var btn = document.getElementById('lock_' + vehicleId);
      var slider = document.getElementById('slider_' + vehicleId);
      var fill = document.getElementById('fill_' + vehicleId);

      if (btn) {
        if (allocationState.locked[vehicleId]) {
          btn.textContent = '🔒 Locked';
          btn.title = 'Unlock this vehicle';
          btn.classList.add('locked');
        } else {
          btn.textContent = '🔓 Unlocked';
          btn.title = 'Lock this vehicle';
          btn.classList.remove('locked');
        }
      }

      // Update slider and fill locked class for styling
      if (slider) {
        if (allocationState.locked[vehicleId]) {
          slider.classList.add('locked');
        } else {
          slider.classList.remove('locked');
        }
      }

      if (fill) {
        if (allocationState.locked[vehicleId]) {
          fill.classList.add('locked');
        } else {
          fill.classList.remove('locked');
        }
      }
    }

    // Update all lock buttons
    function updateAllLockButtons() {
      for (var id in allocationState.locked) {
        updateLockButton(id);
        updateSliderState(id);
      }
    }

    // Update slider enabled/disabled state based on lock
    function updateSliderState(vehicleId) {
      var slider = document.getElementById('slider_' + vehicleId);
      var row = document.querySelector('[data-vehicle-id="' + vehicleId + '"]');
      if (slider) {
        slider.disabled = allocationState.locked[vehicleId];
      }
      if (row) {
        if (allocationState.locked[vehicleId]) {
          row.classList.add('locked');
        } else {
          row.classList.remove('locked');
        }
      }
    }

    // Handle budget change
    function updateBudget(newBudget) {
      newBudget = parseFloat(newBudget) || 0;
      if (newBudget <= 0) return;

      var oldBudget = allocationState.budget;
      var ratio = newBudget / oldBudget;

      allocationState.budget = newBudget;

      // Recalculate effective limits based on new budget
      for (var id in allocationState.irsLimits) {
        var irsLimit = allocationState.irsLimits[id];
        allocationState.limits[id] = Math.min(irsLimit, newBudget);

        // Update slider max attribute
        var slider = document.getElementById('slider_' + id);
        if (slider) {
          slider.max = allocationState.limits[id];
        }
      }

      // Scale all unlocked vehicles proportionally
      for (var id in allocationState.vehicles) {
        if (!allocationState.locked[id]) {
          var newVal = allocationState.vehicles[id] * ratio;
          var limit = allocationState.limits[id] || newBudget;
          allocationState.vehicles[id] = Math.min(newVal, limit);
        }
      }

      // Normalize and update
      normalizeAllocations(null);
      updateAllVehicleDisplays();
      updateSliderFills();
      updateBudgetDisplay();
      markCalculatorDirty();

      // Sprint 11.2: Update banner stats
      updateBannerStats();
    }

    // Update all slider fills after budget/limit change
    function updateSliderFills() {
      document.querySelectorAll('.vehicle-slider').forEach(function(slider) {
        var container = slider.closest('.slider-container');
        var fill = container ? container.querySelector('.slider-fill') : null;
        if (fill) {
          var maxVal = parseFloat(slider.max);
          if (!maxVal || !isFinite(maxVal) || maxVal <= 0) {
            maxVal = allocationState.budget || 1;
          }
          var value = parseFloat(slider.value);
          // Calculate fill width accounting for thumb width
          var rawPercent = (value / maxVal) * 100;
          var thumbHalfWidth = 9;
          var sliderWidth = slider.offsetWidth || 200;
          var trackWidth = sliderWidth - (thumbHalfWidth * 2);
          var thumbPosition = thumbHalfWidth + (rawPercent / 100) * trackWidth;
          var fillPercent = (thumbPosition / sliderWidth) * 100;
          fill.style.width = Math.min(fillPercent, 100) + '%';
        }
      });
    }

    // Update budget display
    function updateBudgetDisplay() {
      var budgetInput = document.getElementById('budgetInput');
      if (budgetInput) {
        budgetInput.value = allocationState.budget;
      }
    }

    // Sprint 11.2: Update years to retirement
    function updateYearsToRetirement(newYears) {
      newYears = parseInt(newYears) || 25;
      if (newYears < 1) newYears = 1;
      if (newYears > 50) newYears = 50;

      // Update global variable
      yearsToRetirement = newYears;

      // Update input display
      var input = document.getElementById('yearsToRetirementInput');
      if (input && input.value !== String(newYears)) {
        input.value = newYears;
      }

      // Recalculate projections if function exists
      if (typeof recalculateProjections === 'function') {
        recalculateProjections();
      }

      // Mark as dirty to prompt save
      markCalculatorDirty();

      // Sprint 11.2: Update banner stats
      updateBannerStats();

      console.log('Years to retirement updated to:', newYears);
    }

    // Update filing status and recalculate affected values
    function updateFilingStatus(newStatus) {
      if (!['Single', 'MFJ', 'MFS', 'HoH'].includes(newStatus)) {
        newStatus = 'Single';
      }

      // Update allocationState
      allocationState.filingStatus = newStatus;

      // Update HSA coverage type based on filing status
      var hsaCoverageType = (newStatus === 'MFJ') ? 'Family' : 'Individual';
      allocationState.hsaCoverageType = hsaCoverageType;

      // Update HSA limits if HSA slider exists
      var hsaSlider = document.getElementById('slider_hsa');
      if (hsaSlider) {
        var hsaLimits = {
          'Individual': 4300,  // 2025 limits
          'Family': 8550
        };
        var catchUpAge = 55;
        var age = parseInt(document.getElementById('yearsToRetirementInput')?.dataset?.age) || 35;

        var baseLimit = hsaLimits[hsaCoverageType] || 4300;
        var monthlyLimit = Math.round(baseLimit / 12);

        // Update the slider max
        hsaSlider.max = monthlyLimit;
        allocationState.limits['hsa'] = monthlyLimit;
        allocationState.irsLimits['hsa'] = monthlyLimit;

        // If current value exceeds new limit, cap it
        var currentValue = parseFloat(hsaSlider.value) || 0;
        if (currentValue > monthlyLimit) {
          hsaSlider.value = monthlyLimit;
          allocationState.vehicles['hsa'] = monthlyLimit;
          updateSingleVehicleDisplay('hsa', monthlyLimit);
        }

        // Update limit display
        var limitEl = document.getElementById('limit_hsa');
        if (limitEl) {
          limitEl.textContent = '$' + monthlyLimit.toLocaleString() + '/mo';
        }
      }

      // Update banner stats
      updateBannerStats();

      // Update formData so it gets saved with new filing status
      if (typeof formData !== 'undefined') {
        formData.filingStatus = newStatus;
        formData.hsaCoverageType = hsaCoverageType;
      }

      console.log('Filing status updated to:', newStatus, '- HSA coverage:', hsaCoverageType);

      // Trigger full reallocation since filing status affects limits and phase-outs
      recalculateAllocation();
    }

    // Sprint 5.5: Update single vehicle display
    function updateSingleVehicleDisplay(vehicleId, value) {
      var amountEl = document.getElementById('amount_' + vehicleId);
      var percentEl = document.getElementById('percent_' + vehicleId);
      var fillEl = document.getElementById('fill_' + vehicleId);
      var sliderRow = document.querySelector('.vehicle-slider-row[data-vehicle-id="' + vehicleId + '"]');
      var slider = document.getElementById('slider_' + vehicleId);

      if (amountEl) {
        amountEl.textContent = '$' + Math.round(value).toLocaleString();
      }

      if (slider) {
        slider.value = value;
      }

      // Calculate percentage
      var maxVal = slider ? parseFloat(slider.max) : allocationState.budget;
      if (!maxVal || !isFinite(maxVal) || maxVal <= 0) {
        maxVal = allocationState.budget || 1;
      }
      var percent = Math.round((value / maxVal) * 100);

      // Update percent display (new Tool 4 style)
      if (percentEl) {
        percentEl.textContent = '(' + percent + '%)';
      }

      // Update fill bar (new Tool 4 style - simpler percentage-based fill)
      if (fillEl) {
        fillEl.style.width = Math.min(percent, 100) + '%';
      }

      // Fallback: Try old class-based selectors
      if (sliderRow) {
        if (!fillEl) {
          var fill = sliderRow.querySelector('.slider-fill');
          if (fill) {
            fill.style.width = Math.min(percent, 100) + '%';
          }
        }
        if (!percentEl) {
          var oldPercentEl = sliderRow.querySelector('.amount-percent');
          if (oldPercentEl) {
            oldPercentEl.textContent = percent + '%';
          }
        }
      }
    }

    // Sprint 5.5: Coupled slider adjustment using ORIGINAL proportions
    function adjustVehicleAllocation(vehicleName, newValue) {
      var vehicleId = vehicleName.replace(/[^a-zA-Z0-9]/g, '_');
      newValue = parseFloat(newValue);

      // Ensure state is initialized (safety check)
      if (Object.keys(allocationState.vehicles).length === 0) {
        console.log('State not initialized, calling initAllocationState');
        initAllocationState();
      }

      // If still no state for this vehicle, something is wrong
      if (allocationState.vehicles[vehicleId] === undefined) {
        console.error('Vehicle not in state:', vehicleId, allocationState);
        // Initialize just this vehicle from the slider
        var slider = document.getElementById('slider_' + vehicleId);
        if (slider) {
          allocationState.vehicles[vehicleId] = parseFloat(slider.value) || 0;
          allocationState.originalAllocation[vehicleId] = allocationState.vehicles[vehicleId];
          // Get IRS limit from data attribute
          var irsLimit = parseFloat(slider.dataset.irsLimit) || 999999;
          allocationState.irsLimits[vehicleId] = irsLimit;
          allocationState.limits[vehicleId] = Math.min(irsLimit, allocationState.budget);
          allocationState.locked[vehicleId] = false;
        }
      }

      // Clamp to vehicle limit
      var maxLimit = allocationState.limits[vehicleId] || allocationState.budget;
      newValue = Math.min(newValue, maxLimit);
      newValue = Math.max(0, newValue);

      var oldValue = allocationState.vehicles[vehicleId] || 0;
      var delta = newValue - oldValue;

      console.log('adjustVehicleAllocation:', vehicleId, 'old:', oldValue, 'new:', newValue, 'delta:', delta);

      // Update the adjusted vehicle
      allocationState.vehicles[vehicleId] = newValue;

      // Redistribute delta - Family Bank is the OVERFLOW bucket (lowest priority)
      // When INCREASING a vehicle: pull from Family Bank FIRST (it's overflow)
      // When DECREASING a vehicle: redistribute to other vehicles FIRST, overflow to Family Bank
      if (delta !== 0) {
        var familyBankId = 'Family_Bank';
        var familyBankValue = allocationState.vehicles[familyBankId] || 0;
        var familyBankLocked = allocationState.locked[familyBankId];

        if (delta > 0) {
          // INCREASING a vehicle - pull from Family Bank first (lowest priority)
          var remainingDelta = delta;

          if (!familyBankLocked && vehicleId !== familyBankId) {
            var pullFromFamilyBank = Math.min(delta, familyBankValue);
            allocationState.vehicles[familyBankId] = familyBankValue - pullFromFamilyBank;
            remainingDelta = delta - pullFromFamilyBank;
          }

          // If Family Bank didn't have enough, pull from other vehicles proportionally
          if (remainingDelta > 0) {
            var originalProportions = getOriginalProportions(vehicleId);
            delete originalProportions[familyBankId]; // Exclude Family Bank

            // Renormalize
            var totalProp = 0;
            for (var id in originalProportions) totalProp += originalProportions[id];
            if (totalProp > 0) {
              for (var id in originalProportions) originalProportions[id] /= totalProp;
            }

            for (var id in originalProportions) {
              var proportion = originalProportions[id];
              var reduction = remainingDelta * proportion;
              var newVal = Math.max(0, allocationState.vehicles[id] - reduction);
              allocationState.vehicles[id] = newVal;
            }
          }
        } else {
          // DECREASING a vehicle - redistribute to other vehicles first, overflow to Family Bank
          var freedAmount = -delta; // Make positive
          var originalProportions = getOriginalProportions(vehicleId);
          delete originalProportions[familyBankId]; // Exclude Family Bank from initial distribution

          // Renormalize
          var totalProp = 0;
          for (var id in originalProportions) totalProp += originalProportions[id];
          if (totalProp > 0) {
            for (var id in originalProportions) originalProportions[id] /= totalProp;
          }

          // Distribute to other vehicles (up to their limits)
          var distributed = 0;
          for (var id in originalProportions) {
            var proportion = originalProportions[id];
            var share = freedAmount * proportion;
            var currentVal = allocationState.vehicles[id] || 0;
            var limit = allocationState.limits[id] || allocationState.budget;
            var room = limit - currentVal;
            var actualAdd = Math.min(share, room);
            allocationState.vehicles[id] = currentVal + actualAdd;
            distributed += actualAdd;
          }

          // Any remaining goes to Family Bank (overflow)
          var overflow = freedAmount - distributed;
          if (overflow > 0 && !familyBankLocked) {
            allocationState.vehicles[familyBankId] = (allocationState.vehicles[familyBankId] || 0) + overflow;
          }
        }
      }

      // Normalize to ensure we do not exceed budget
      normalizeAllocations(vehicleId);

      // Update all vehicle displays
      updateAllVehicleDisplays();

      // Store in formData
      if (!formData.vehicleAllocations) {
        formData.vehicleAllocations = {};
      }
      for (var id in allocationState.vehicles) {
        formData.vehicleAllocations[id] = allocationState.vehicles[id];
      }
    }

    // Get total of locked vehicles
    function getLockedTotal(excludeId) {
      var total = 0;
      for (var id in allocationState.locked) {
        if (allocationState.locked[id] && id !== excludeId) {
          total += allocationState.vehicles[id] || 0;
        }
      }
      return total;
    }

    // Normalize allocations to match budget exactly
    function normalizeAllocations(priorityId) {
      var total = 0;
      for (var id in allocationState.vehicles) {
        total += allocationState.vehicles[id];
      }

      var budget = allocationState.budget;

      // If over budget, reduce unlocked vehicles proportionally
      if (total > budget) {
        var excess = total - budget;
        var unlockedVehicles = [];
        var unlockedTotal = 0;

        for (var id in allocationState.vehicles) {
          if (id !== priorityId && !allocationState.locked[id]) {
            unlockedVehicles.push(id);
            unlockedTotal += allocationState.vehicles[id];
          }
        }

        if (unlockedTotal > 0) {
          unlockedVehicles.forEach(function(id) {
            var proportion = allocationState.vehicles[id] / unlockedTotal;
            var reduction = excess * proportion;
            allocationState.vehicles[id] = Math.max(0, allocationState.vehicles[id] - reduction);
          });
        }
      }

      // If under budget, add remainder to Family Bank (or another unlocked unlimited vehicle)
      total = 0;
      for (var id in allocationState.vehicles) {
        total += allocationState.vehicles[id];
      }

      if (total < budget) {
        var remainder = budget - total;
        // Try Family Bank first
        if (allocationState.vehicles.hasOwnProperty('Family_Bank') && !allocationState.locked['Family_Bank']) {
          allocationState.vehicles['Family_Bank'] = (allocationState.vehicles['Family_Bank'] || 0) + remainder;
        } else {
          // Find any unlocked vehicle with room (check against IRS limit)
          for (var id in allocationState.vehicles) {
            if (!allocationState.locked[id]) {
              var currentVal = allocationState.vehicles[id] || 0;
              var limit = allocationState.limits[id] || budget;
              var room = limit - currentVal;
              if (room > 0) {
                var add = Math.min(remainder, room);
                allocationState.vehicles[id] = currentVal + add;
                remainder -= add;
                if (remainder <= 0) break;
              }
            }
          }
        }
      }

      // Round to nearest dollar
      for (var id in allocationState.vehicles) {
        allocationState.vehicles[id] = Math.round(allocationState.vehicles[id]);
      }
    }

    // Update all vehicle displays
    function updateAllVehicleDisplays() {
      for (var vehicleId in allocationState.vehicles) {
        updateSingleVehicleDisplay(vehicleId, allocationState.vehicles[vehicleId]);
      }
      updateTotalAllocated();

      // Sprint 6.2: Update projections when allocations change
      updateProjectionDisplay();
    }

    // Legacy function - now calls the coupled adjustment
    function updateVehicleDisplay(vehicleName, value) {
      // During drag, just update visual without coupling (for responsiveness)
      var vehicleId = vehicleName.replace(/[^a-zA-Z0-9]/g, '_');
      updateSingleVehicleDisplay(vehicleId, parseFloat(value));
    }

    // Sprint 5.5: Update vehicle allocation (on slider change complete)
    function updateVehicleAllocation(vehicleName, value) {
      // Use coupled adjustment
      adjustVehicleAllocation(vehicleName, parseFloat(value));

      // Mark calculator as needing recalculation
      markCalculatorDirty();
    }

    // Calculate and update total allocated display
    function updateTotalAllocated() {
      var total = 0;
      for (var id in allocationState.vehicles) {
        total += allocationState.vehicles[id] || 0;
      }

      var totalEl = document.getElementById('totalAllocated');
      if (totalEl) {
        totalEl.textContent = '$' + Math.round(total).toLocaleString();
      }

      // Check if over budget and show warning
      var budget = allocationState.budget;
      var warningsEl = document.getElementById('allocationWarnings');
      if (warningsEl) {
        if (total > budget + 1) {  // +1 for rounding tolerance
          warningsEl.innerHTML = '<div class="allocation-warning"><span class="warning-icon">&#9888;</span> Total allocation ($' + Math.round(total).toLocaleString() + ') exceeds your budget ($' + budget.toLocaleString() + ')</div>';
        } else if (total < budget - 10) {
          var remaining = budget - total;
          warningsEl.innerHTML = '<div class="allocation-info"><span class="info-icon">&#128161;</span> $' + Math.round(remaining).toLocaleString() + ' remaining in your budget</div>';
        } else {
          warningsEl.innerHTML = '';
        }
      }

      // Sprint 11.4: Update plain English results summary
      updateResultsSummary(total);
    }

    // Sprint 11.4: Update the plain English results summary
    function updateResultsSummary(totalMonthly) {
      var summaryMonthly = document.getElementById('summaryMonthly');
      if (!summaryMonthly) return;

      var annualSavings = totalMonthly * 12;
      var employerMatch = allocationState.employerMatch || 0;
      var totalWithMatch = totalMonthly + employerMatch;
      var annualReturn = calculatePersonalizedRate(currentInvestmentScore);
      var returnPercent = (annualReturn * 100).toFixed(0);

      // Rough 10-year projection
      var tenYearProjection = Math.round(totalWithMatch * 12 * (Math.pow(1 + annualReturn, 10) - 1) / annualReturn);

      // Update the monthly/annual display
      var detailText = '($' + annualSavings.toLocaleString() + '/year';
      if (employerMatch > 0) {
        detailText += ' + $' + (employerMatch * 12).toLocaleString() + ' employer match';
      }
      detailText += ')';

      summaryMonthly.textContent = '$' + Math.round(totalMonthly).toLocaleString() + '/month';

      var statDetail = summaryMonthly.parentElement.querySelector('.stat-detail');
      if (statDetail) {
        statDetail.textContent = detailText;
      }

      // Update the 10-year projection insight
      var insightItems = document.querySelectorAll('.insight-item');
      if (insightItems.length >= 2) {
        var projectionText = insightItems[1].querySelector('.insight-text');
        if (projectionText) {
          projectionText.innerHTML = 'At ' + returnPercent + '% annual return, this could grow to <strong>~$' + tenYearProjection.toLocaleString() + '</strong> in 10 years.';
        }
      }
    }

    // Mark calculator as dirty (needs recalculation)
    var calculatorDirty = false;
    function markCalculatorDirty() {
      calculatorDirty = true;
      var recalcBtn = document.querySelector('.btn-recalc-primary');
      if (recalcBtn) {
        recalcBtn.style.animation = 'pulse 1s infinite';
      }
    }

    // Sprint 5.6: Recalculate allocation
    function recalculateAllocation() {
      // Show loading
      var overlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (overlay) {
        loadingText.textContent = 'Recalculating...';
        loadingSubtext.textContent = 'Optimizing your vehicle allocation';
        overlay.classList.add('show');
      }

      // Gather current form data
      var currentData = Object.assign({}, formData);

      // Get current slider values as overrides
      var sliderValues = {};
      document.querySelectorAll('.vehicle-slider').forEach(function(slider) {
        // FIX: Use data-vehicle-id attribute
        sliderValues[slider.dataset.vehicleId] = parseFloat(slider.value);
      });
      currentData.vehicleOverrides = sliderValues;

      // Call server to recalculate
      google.script.run
        .withSuccessHandler(function(result) {
          if (overlay) overlay.classList.remove('show');

          if (result && result.success) {
            // FIX: Use GAS-compliant navigation pattern per CLAUDE.md
            // NEVER use location.reload() - use document.write() pattern instead
            if (result.nextPageHtml) {
              document.open();
              document.write(result.nextPageHtml);
              document.close();
              window.scrollTo(0, 0);
            } else {
              // Fallback: request fresh page from server
              google.script.run
                .withSuccessHandler(function(pageResult) {
                  if (pageResult && pageResult.html) {
                    document.open();
                    document.write(pageResult.html);
                    document.close();
                    window.scrollTo(0, 0);
                  }
                })
                .withFailureHandler(function(err) {
                  alert('Error refreshing page: ' + err.message);
                })
                .getTool6Page(clientId);
            }
          } else {
            alert('Error recalculating: ' + (result ? result.error : 'Unknown error'));
          }
        })
        .withFailureHandler(function(error) {
          if (overlay) overlay.classList.remove('show');
          alert('Server error: ' + error.message);
        })
        .savePreSurveyTool6(clientId, currentData);

      calculatorDirty = false;
      var recalcBtn = document.querySelector('.btn-recalc-primary');
      if (recalcBtn) {
        recalcBtn.style.animation = '';
      }
    }

    // Add pulse animation for recalc button
    var style = document.createElement('style');
    style.textContent = '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }';
    document.head.appendChild(style);

    // ========================================================================
    // SPRINT 6.2: CLIENT-SIDE PROJECTION UPDATES
    // ========================================================================

    // Calculate personalized return rate from investment score
    function calculatePersonalizedRate(score) {
      score = Math.max(1, Math.min(7, score || 4));
      return PROJECTION_CONFIG.BASE_RATE +
             ((score - 1) / 6) * PROJECTION_CONFIG.MAX_ADDITIONAL_RATE;
    }

    // Future value calculation with safeguards
    function futureValue(monthlyContribution, annualRate, years) {
      if (!monthlyContribution || monthlyContribution <= 0 || years <= 0 || years >= 99) {
        return 0;
      }

      years = Math.min(years, PROJECTION_CONFIG.MAX_YEARS);
      annualRate = Math.min(annualRate, PROJECTION_CONFIG.MAX_RATE);

      var monthlyRate = annualRate / 12;
      var months = years * 12;

      var growthFactor = Math.pow(1 + monthlyRate, months);
      if (!isFinite(growthFactor) || growthFactor > 1000000) {
        return PROJECTION_CONFIG.MAX_FV;
      }

      var fv;
      if (monthlyRate === 0) {
        fv = monthlyContribution * months;
      } else {
        fv = monthlyContribution * ((growthFactor - 1) / monthlyRate);
      }

      return Math.min(Math.round(fv), PROJECTION_CONFIG.MAX_FV);
    }

    // Calculate projections from current allocation state
    function calculateClientProjections() {
      if (!allocationState || !allocationState.vehicles) {
        return null;
      }

      var annualReturn = calculatePersonalizedRate(currentInvestmentScore);
      var cappedYears = Math.min(yearsToRetirement, PROJECTION_CONFIG.MAX_YEARS);
      var cappedRate = Math.min(annualReturn, PROJECTION_CONFIG.MAX_RATE);

      // Calculate retirement contribution (exclude education vehicles)
      var monthlyRetirementContribution = 0;
      var monthlyEducationContribution = 0;
      var rothAllocation = 0;
      var traditionalAllocation = 0;
      var taxableAllocation = 0;

      for (var vehicleId in allocationState.vehicles) {
        var amount = allocationState.vehicles[vehicleId] || 0;

        if (educationVehicles.indexOf(vehicleId) >= 0) {
          monthlyEducationContribution += amount;
        } else {
          monthlyRetirementContribution += amount;

          // Categorize by tax treatment
          if (vehicleId.indexOf('Roth') >= 0 || vehicleId === 'HSA') {
            rothAllocation += amount;
          } else if (vehicleId === 'Family_Bank') {
            taxableAllocation += amount;
          } else {
            traditionalAllocation += amount;
          }
        }
      }

      // Retirement projections
      var fvContributions = futureValue(monthlyRetirementContribution, cappedRate, cappedYears);
      var fvBalance = currentBalances.retirement * Math.pow(1 + cappedRate, cappedYears);
      var projectedBalance = Math.min(Math.round(fvBalance + fvContributions), PROJECTION_CONFIG.MAX_FV);
      var realBalance = Math.round(projectedBalance / Math.pow(1 + PROJECTION_CONFIG.DEFAULT_INFLATION, cappedYears));
      var baseline = Math.round(currentBalances.retirement * Math.pow(1 + cappedRate, cappedYears));
      var improvement = projectedBalance - baseline;
      var monthlyRetirementIncome = Math.round(realBalance / (25 * 12));

      // Tax breakdown
      var totalAlloc = rothAllocation + traditionalAllocation + taxableAllocation;
      var taxFreePercentage = totalAlloc > 0 ? Math.round((rothAllocation / totalAlloc) * 100) : 0;
      var taxDeferredPercentage = totalAlloc > 0 ? Math.round((traditionalAllocation / totalAlloc) * 100) : 0;
      var capitalGainsPercentage = totalAlloc > 0 ? Math.round((taxableAllocation / totalAlloc) * 100) : 0;

      // Education projections
      var eduProjection = null;
      if (hasChildren && yearsToEducation < 99 && numChildren > 0) {
        var eduYears = Math.min(yearsToEducation, PROJECTION_CONFIG.MAX_YEARS);
        var eduFvContrib = futureValue(monthlyEducationContribution, PROJECTION_CONFIG.EDUCATION_RATE, eduYears);
        var eduFvBalance = currentBalances.education * Math.pow(1 + PROJECTION_CONFIG.EDUCATION_RATE, eduYears);
        var eduProjectedBalance = Math.min(Math.round(eduFvBalance + eduFvContrib), PROJECTION_CONFIG.MAX_FV);
        var eduBaseline = Math.round(currentBalances.education * Math.pow(1 + PROJECTION_CONFIG.EDUCATION_RATE, eduYears));

        eduProjection = {
          projectedBalance: eduProjectedBalance,
          baseline: eduBaseline,
          improvement: eduProjectedBalance - eduBaseline,
          yearsUsed: eduYears,
          numChildren: numChildren,
          perChildEstimate: Math.round(eduProjectedBalance / numChildren)
        };
      }

      return {
        retirement: {
          projectedBalance: projectedBalance,
          realBalance: realBalance,
          baseline: baseline,
          improvement: improvement,
          monthlyRetirementIncome: monthlyRetirementIncome,
          yearsUsed: cappedYears,
          rateUsed: cappedRate
        },
        taxBreakdown: {
          taxFreeAmount: Math.round(projectedBalance * (taxFreePercentage / 100)),
          taxFreePercentage: taxFreePercentage,
          taxDeferredAmount: Math.round(projectedBalance * (taxDeferredPercentage / 100)),
          taxDeferredPercentage: taxDeferredPercentage,
          capitalGainsAmount: Math.round(projectedBalance * (capitalGainsPercentage / 100)),
          capitalGainsPercentage: capitalGainsPercentage
        },
        education: eduProjection,
        inputs: {
          investmentScore: currentInvestmentScore,
          annualReturn: annualReturn,
          yearsToRetirement: yearsToRetirement,
          monthlyRetirementContribution: monthlyRetirementContribution,
          monthlyEducationContribution: monthlyEducationContribution
        }
      };
    }

    // Update projection display elements
    function updateProjectionDisplay() {
      var projections = calculateClientProjections();
      if (!projections) return;

      var r = projections.retirement;
      var t = projections.taxBreakdown;

      // Helper to format currency
      function formatCurrency(num) {
        return '$' + num.toLocaleString();
      }

      // Update retirement metrics
      updateElementText('.projection-card.retirement-projection .metric-card.primary .metric-value', formatCurrency(r.projectedBalance));
      updateElementText('.projection-card.retirement-projection .metric-card:not(.primary):not(.highlight) .metric-value', formatCurrency(r.realBalance));
      updateElementText('.projection-card.retirement-projection .metric-card.highlight .metric-value', formatCurrency(r.monthlyRetirementIncome));

      // Update comparison values
      updateElementText('.comparison-item.baseline .comparison-value', formatCurrency(r.baseline));
      updateElementText('.comparison-item.projected .comparison-value', formatCurrency(r.projectedBalance));

      // Update improvement
      var improvementEl = document.querySelector('.improvement-result');
      if (improvementEl) {
        improvementEl.className = 'improvement-result' + (r.improvement > 0 ? ' positive' : '');
        var improvementText = improvementEl.querySelector('.improvement-text');
        if (improvementText) {
          improvementText.textContent = r.improvement > 0
            ? '+' + formatCurrency(r.improvement) + ' improvement'
            : 'Start building your retirement today';
        }
      }

      // Update tax bar segments
      updateElementStyle('.tax-segment.tax-free', 'width', t.taxFreePercentage + '%');
      updateElementStyle('.tax-segment.tax-deferred', 'width', t.taxDeferredPercentage + '%');
      updateElementStyle('.tax-segment.capital-gains', 'width', t.capitalGainsPercentage + '%');

      // Update tax legend values
      updateElementText('.legend-item.tax-free .legend-value', t.taxFreePercentage + '% - ' + formatCurrency(t.taxFreeAmount));
      updateElementText('.legend-item.tax-deferred .legend-value', t.taxDeferredPercentage + '% - ' + formatCurrency(t.taxDeferredAmount));
      updateElementText('.legend-item.capital-gains .legend-value', t.capitalGainsPercentage + '% - ' + formatCurrency(t.capitalGainsAmount));

      // Update assumptions
      updateElementText('.assumption-item:nth-child(4) .assumption-value', formatCurrency(projections.inputs.monthlyRetirementContribution));

      // Update education if applicable
      if (projections.education && hasChildren) {
        var e = projections.education;
        updateElementText('.education-projection .metric-card.primary .metric-value', formatCurrency(e.projectedBalance));
        if (e.numChildren > 1) {
          updateElementText('.education-projection .metric-card:not(.primary):not(.highlight) .metric-value', formatCurrency(e.perChildEstimate));
        }
        var eduImprovementEl = document.querySelector('.education-projection .metric-card.highlight .metric-value');
        if (eduImprovementEl) {
          eduImprovementEl.textContent = '+' + formatCurrency(e.improvement);
        }
      }
    }

    // Helper to update element text content
    function updateElementText(selector, text) {
      var el = document.querySelector(selector);
      if (el) el.textContent = text;
    }

    // Helper to update element style
    function updateElementStyle(selector, property, value) {
      var el = document.querySelector(selector);
      if (el) el.style[property] = value;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    document.addEventListener('DOMContentLoaded', function() {
      // Sprint 10.1: Initialize backup sliders
      initBackupSliders();

      // If profile already determined, show Phase B
      if (classifiedProfile) {
        updateAllocationVisibility();
      }

      // Initialize allocation state for coupled sliders
      initAllocationState();

      // Initialize slider fills on page load
      document.querySelectorAll('.vehicle-slider').forEach(function(slider) {
        var container = slider.closest('.slider-container');
        var fill = container ? container.querySelector('.slider-fill') : null;
        if (fill) {
          var maxVal = parseFloat(slider.max);
          // Protect against 0, NaN, or Infinity
          if (!maxVal || !isFinite(maxVal) || maxVal <= 0) {
            maxVal = allocationState.budget || parseFloat(slider.value) || 1;
          }
          var value = parseFloat(slider.value);
          // Calculate fill width accounting for thumb width
          var rawPercent = (value / maxVal) * 100;
          var thumbHalfWidth = 9;
          var sliderWidth = slider.offsetWidth || 200;
          var trackWidth = sliderWidth - (thumbHalfWidth * 2);
          var thumbPosition = thumbHalfWidth + (rawPercent / 100) * trackWidth;
          var fillPercent = (thumbPosition / sliderWidth) * 100;
          fill.style.width = Math.min(fillPercent, 100) + '%';
        }
      });
    });

    // Run immediately in case DOMContentLoaded already fired
    if (classifiedProfile) {
      updateAllocationVisibility();
    }

    // Also init allocation state immediately if sliders exist
    if (document.querySelectorAll('.vehicle-slider').length > 0) {
      initAllocationState();
    }

    // ========================================================================
    // SPRINT 7.1: SCENARIO MANAGEMENT FUNCTIONS
    // ========================================================================

    var MAX_SCENARIOS = 10;

    /**
     * Save current allocation as a named scenario
     * Matches Tool 4 pattern for consistency
     */
    function saveScenario() {
      var nameInput = document.getElementById('scenarioName');
      var scenarioName = nameInput ? nameInput.value.trim() : '';

      if (!scenarioName) {
        showScenarioFeedback('Please enter a scenario name', 'error');
        if (nameInput) nameInput.focus();
        return;
      }

      // Validate we have allocation data
      if (!allocationState || !allocationState.vehicles || Object.keys(allocationState.vehicles).length === 0) {
        showScenarioFeedback('No allocation data to save. Please complete the questionnaire first.', 'error');
        return;
      }

      // Check if at limit and warn user (like Tool 4)
      if (window.savedScenarios && window.savedScenarios.length >= MAX_SCENARIOS) {
        var oldestScenario = window.savedScenarios[window.savedScenarios.length - 1];
        var oldestName = oldestScenario ? oldestScenario.name : 'oldest scenario';

        var confirmSave = confirm(
          'You have reached the maximum of ' + MAX_SCENARIOS + ' saved scenarios.\\n\\n' +
          'Saving a new scenario will delete your oldest one:\\n"' + oldestName + '"\\n\\n' +
          'Do you want to continue?'
        );

        if (!confirmSave) {
          return;
        }
      }

      // Sprint 13: Get grossIncome from form element or formData
      var grossIncomeEl = document.getElementById('a1_grossIncome');
      var scenarioGrossIncome = grossIncomeEl ? parseFloat(grossIncomeEl.value) || 0 : (parseFloat(formData.a1_grossIncome) || 0);

      // Get filing status from form
      var filingStatusEl = document.getElementById('a6_filingStatus');
      var scenarioFilingStatus = filingStatusEl ? filingStatusEl.value : (formData.a6_filingStatus || 'Single');

      // Get work situation
      var workSituationEl = document.getElementById('c5_workSituation');
      var scenarioWorkSituation = workSituationEl ? workSituationEl.value : (formData.c5_workSituation || 'W-2 Employee');

      // Calculate current total balance
      var currentTotalBalance = (parseFloat(formData.a12_current401kBalance) || 0) +
                                 (parseFloat(formData.a13_currentIRABalance) || 0) +
                                 (parseFloat(formData.a14_currentHSABalance) || 0) +
                                 (parseFloat(formData.a15_currentEducationBalance) || 0);

      // Calculate tax percentages from allocations
      var taxPercentages = calculateTaxPercentages(allocationState.vehicles || {});

      // Build scenario object matching the schema
      var scenario = {
        name: scenarioName,
        profileId: classifiedProfile ? classifiedProfile.id : 7,
        monthlyBudget: allocationState.budget || 0,
        domainWeights: allocationState.domainWeights || { Retirement: 1, Education: 0, Health: 0 },
        allocations: allocationState.vehicles || {},
        investmentScore: currentInvestmentScore || 4,
        taxStrategy: getCurrentTaxStrategy(),
        projectedBalance: getProjectedRetirementBalance(),
        // Sprint 13: Added fields for enhanced PDF report
        grossIncome: scenarioGrossIncome,
        age: upstreamAge || 40,
        yearsToRetirement: yearsToRetirement || 25,
        filingStatus: scenarioFilingStatus,
        workSituation: scenarioWorkSituation,
        hasChildren: (numChildren > 0) || (formData.a8_hasChildren === 'Yes'),
        numChildren: numChildren || 0,
        currentBalance: currentTotalBalance,
        taxFreePercent: taxPercentages.taxFree,
        traditionalPercent: taxPercentages.traditional,
        taxablePercent: taxPercentages.taxable,
        currentBalances: {
          '401k': parseFloat(formData.a12_current401kBalance) || 0,
          ira: parseFloat(formData.a13_currentIRABalance) || 0,
          hsa: parseFloat(formData.a14_currentHSABalance) || 0,
          education: parseFloat(formData.a15_currentEducationBalance) || 0
        },
        currentContributions: {
          '401k': parseFloat(formData.a16_monthly401kContribution) || 0,
          ira: parseFloat(formData.a17_monthlyIRAContribution) || 0,
          hsa: parseFloat(formData.a18_monthlyHSAContribution) || 0,
          education: parseFloat(formData.a19_monthlyEducationContribution) || 0
        },
        educationInputs: {
          numChildren: numChildren || 0,
          yearsToEducation: yearsToEducation || 99
        },
        educationProjection: getProjectedEducationBalance()
      };

      // Show loading overlay (like Tool 4)
      var loadingOverlay = document.getElementById('loadingOverlay');
      var loadingText = document.getElementById('loadingText');
      var loadingSubtext = document.getElementById('loadingSubtext');

      if (loadingOverlay) {
        if (loadingText) loadingText.textContent = 'Saving Scenario...';
        if (loadingSubtext) loadingSubtext.textContent = 'Storing your vehicle allocation';
        loadingOverlay.classList.add('show');
      }

      // Also disable button
      var saveBtn = document.querySelector('.scenario-save-form .btn-primary');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      // Call server to save
      google.script.run
        .withSuccessHandler(function(result) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Save Scenario';
          }

          if (result.success) {
            var message = 'Scenario "' + scenarioName + '" saved successfully!';
            if (result.deletedScenario) {
              message += ' (Oldest scenario "' + result.deletedScenario + '" was removed to stay within limit)';
            }
            if (result.isFirstScenario) {
              message += ' Tool 6 marked as complete.';
            }
            showScenarioFeedback(message, 'success');

            // Clear input
            if (nameInput) nameInput.value = '';

            // Refresh scenarios list
            loadSavedScenarios();
          } else {
            showScenarioFeedback('Error: ' + (result.error || 'Failed to save scenario'), 'error');
          }
        })
        .withFailureHandler(function(error) {
          if (loadingOverlay) loadingOverlay.classList.remove('show');
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Save Scenario';
          }
          console.error('Save scenario error:', error);
          showScenarioFeedback('Error: ' + error.message, 'error');
        })
        .saveTool6Scenario(clientId, scenario);
    }

    /**
     * Get current tax strategy from radio buttons
     */
    function getCurrentTaxStrategy() {
      var selected = document.querySelector('input[name="taxStrategy"]:checked');
      return selected ? selected.value : 'Both';
    }

    /**
     * Get projected retirement balance from display or calculate
     */
    function getProjectedRetirementBalance() {
      var el = document.querySelector('.projection-card.retirement-projection .metric-card.primary .metric-value');
      if (el) {
        var text = el.textContent.replace(/[^0-9.-]/g, '');
        return parseFloat(text) || 0;
      }
      return 0;
    }

    /**
     * Get projected education balance from display
     */
    function getProjectedEducationBalance() {
      var el = document.querySelector('.projection-card.education-projection .metric-card.primary .metric-value');
      if (el) {
        var text = el.textContent.replace(/[^0-9.-]/g, '');
        return parseFloat(text) || 0;
      }
      return 0;
    }

    /**
     * Sprint 13: Calculate tax percentages from vehicle allocations
     * Categorizes vehicles into Tax-Free (Roth/HSA), Tax-Deferred (Traditional), and Taxable
     */
    function calculateTaxPercentages(allocations) {
      if (!allocations || Object.keys(allocations).length === 0) {
        return { taxFree: 0, traditional: 0, taxable: 0 };
      }

      var taxFree = 0;      // Roth, HSA, 529 (tax-free growth)
      var traditional = 0;  // Traditional 401(k), Traditional IRA, SEP, SIMPLE
      var taxable = 0;      // Taxable brokerage, etc.
      var total = 0;

      Object.keys(allocations).forEach(function(vehicle) {
        var amount = allocations[vehicle] || 0;
        if (amount <= 0) return;

        total += amount;
        var vLower = vehicle.toLowerCase();

        // Tax-Free: Roth, HSA, 529, Coverdell, Backdoor Roth
        if (vLower.includes('roth') || vLower.includes('hsa') ||
            vLower.includes('529') || vLower.includes('coverdell') ||
            vLower.includes('backdoor')) {
          taxFree += amount;
        }
        // Tax-Deferred: Traditional 401(k), Traditional IRA, SEP, SIMPLE, Solo 401(k) Employer
        else if (vLower.includes('traditional') || vLower.includes('trad') ||
                 vLower.includes('sep') || vLower.includes('simple') ||
                 (vLower.includes('solo') && vLower.includes('employer')) ||
                 (vLower.includes('401') && !vLower.includes('roth'))) {
          traditional += amount;
        }
        // Taxable: Everything else (Family Bank, brokerage, etc.)
        else {
          taxable += amount;
        }
      });

      if (total === 0) {
        return { taxFree: 0, traditional: 0, taxable: 0 };
      }

      return {
        taxFree: Math.round((taxFree / total) * 100),
        traditional: Math.round((traditional / total) * 100),
        taxable: Math.round((taxable / total) * 100)
      };
    }

    /**
     * Show feedback message for scenario operations
     */
    function showScenarioFeedback(message, type) {
      var feedback = document.getElementById('saveScenarioFeedback');
      if (feedback) {
        feedback.textContent = message;
        feedback.className = 'scenario-feedback ' + type;
        feedback.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
          setTimeout(function() {
            feedback.style.display = 'none';
          }, 5000);
        }
      }
    }

    /**
     * Load and display saved scenarios for this client
     */
    function loadSavedScenarios() {
      var listContainer = document.getElementById('savedScenariosList');
      if (!listContainer) return;

      listContainer.innerHTML = '<p class="muted">Loading saved scenarios...</p>';

      google.script.run
        .withSuccessHandler(function(scenarios) {
          renderScenariosList(scenarios);
        })
        .withFailureHandler(function(error) {
          listContainer.innerHTML = '<p class="muted">Error loading scenarios: ' + error.message + '</p>';
        })
        .getTool6Scenarios(clientId);
    }

    /**
     * Render the list of saved scenarios
     */
    function renderScenariosList(scenarios) {
      var listContainer = document.getElementById('savedScenariosList');
      if (!listContainer) return;

      // Sprint 11.2: Update scenario count in summary
      var summaryCount = document.getElementById('summarySavedCount');
      if (summaryCount) {
        var count = scenarios ? scenarios.length : 0;
        summaryCount.textContent = count + (count === 1 ? ' scenario' : ' scenarios');
      }

      if (!scenarios || scenarios.length === 0) {
        listContainer.innerHTML = '<div class="empty-scenarios">' +
          '<div class="empty-scenarios-icon">📁</div>' +
          '<p>No saved scenarios yet.</p>' +
          '<p class="muted">Save your first scenario above!</p>' +
          '</div>';
        return;
      }

      var html = '';
      scenarios.forEach(function(s, index) {
        var dateStr = s.timestamp ? new Date(s.timestamp).toLocaleDateString() : 'Unknown';
        var isLatest = s.isLatest ? ' is-latest' : '';
        var latestBadge = s.isLatest ? '<span style="color: #34d399; margin-left: 8px;">✓ Latest</span>' : '';

        html += '<div class="scenario-card' + isLatest + '">' +
          '<div class="scenario-info">' +
          '<div class="scenario-name">' + escapeHtml(s.name) + latestBadge + '</div>' +
          '<div class="scenario-meta">' +
          '<span>📅 ' + dateStr + '</span>' +
          '<span>💰 $' + (s.monthlyBudget || 0).toLocaleString() + '/mo</span>' +
          '<span>📊 Profile ' + (s.profileId || '?') + '</span>' +
          '</div>' +
          '</div>' +
          '<div class="scenario-actions-btns">' +
          '<button class="scenario-btn load-btn" onclick="loadScenario(' + index + ')">Load</button>' +
          '<button class="scenario-btn pdf-btn" onclick="downloadScenarioPDF(' + index + ')" title="Download PDF Report">📄 PDF</button>' +
          '<button class="scenario-btn delete-btn" onclick="deleteScenario(' + index + ', \\'' + escapeHtml(s.name).replace(/'/g, "\\'") + '\\')">Delete</button>' +
          '</div>' +
          '</div>';
      });

      listContainer.innerHTML = html;

      // Store scenarios for loading
      window.savedScenarios = scenarios;

      // Sprint 7.3: Update comparison dropdowns
      updateComparisonDropdowns(scenarios);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Load a scenario - restores allocations, budget, and settings
     * Sprint 7.2 Implementation
     */
    function loadScenario(index) {
      if (!window.savedScenarios || !window.savedScenarios[index]) {
        alert('Scenario not found');
        return;
      }

      var scenario = window.savedScenarios[index];

      // Confirm before loading (will overwrite current allocations)
      if (!confirm('Load scenario "' + scenario.name + '"?\\n\\nThis will replace your current allocations.')) {
        return;
      }

      console.log('Loading scenario:', scenario);

      // 1. Update budget if stored
      if (scenario.monthlyBudget && scenario.monthlyBudget > 0) {
        allocationState.budget = scenario.monthlyBudget;
        var budgetInput = document.getElementById('budgetInput');
        if (budgetInput) {
          budgetInput.value = scenario.monthlyBudget;
        }
      }

      // 2. Update allocations
      if (scenario.allocations) {
        // First, reset all vehicle allocations to 0
        for (var id in allocationState.vehicles) {
          allocationState.vehicles[id] = 0;
        }

        // Then apply saved allocations
        for (var vehicleId in scenario.allocations) {
          if (allocationState.vehicles.hasOwnProperty(vehicleId)) {
            allocationState.vehicles[vehicleId] = scenario.allocations[vehicleId] || 0;
          }
        }

        // Also update originalAllocation for proper slider behavior
        for (var id in allocationState.vehicles) {
          allocationState.originalAllocation[id] = allocationState.vehicles[id];
        }
      }

      // 3. Update tax strategy radio buttons
      if (scenario.taxStrategy) {
        var taxRadio = document.querySelector('input[name="taxStrategy"][value="' + scenario.taxStrategy + '"]');
        if (taxRadio) {
          taxRadio.checked = true;
          // Call updateTaxStrategy if it exists
          if (typeof updateTaxStrategy === 'function') {
            updateTaxStrategy(scenario.taxStrategy);
          }
        }
      }

      // 4. Clear all locks (start fresh)
      for (var id in allocationState.locked) {
        allocationState.locked[id] = false;
      }
      updateAllLockButtons();

      // 5. Update all vehicle displays
      updateAllVehicleDisplays();

      // 6. Clear calculator dirty state
      calculatorDirty = false;
      var recalcBtn = document.querySelector('.btn-recalc-primary');
      if (recalcBtn) {
        recalcBtn.style.animation = '';
      }

      // 7. Show success feedback
      showScenarioFeedback('Scenario "' + scenario.name + '" loaded successfully!', 'success');

      // 8. Scroll to allocation section so user can see the changes
      var allocationSection = document.querySelector('.section-card:has(.allocation-controls)');
      if (allocationSection) {
        allocationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    /**
     * Delete a scenario
     */
    function deleteScenario(index, name) {
      if (!confirm('Delete scenario "' + name + '"?\\n\\nThis cannot be undone.')) {
        return;
      }

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            showScenarioFeedback('Scenario "' + name + '" deleted.', 'success');
            loadSavedScenarios();
          } else {
            showScenarioFeedback('Error: ' + (result.error || 'Failed to delete'), 'error');
          }
        })
        .withFailureHandler(function(error) {
          showScenarioFeedback('Error: ' + error.message, 'error');
        })
        .deleteTool6Scenario(clientId, name);
    }

    // ========================================================================
    // SPRINT 7.4: PDF DOWNLOAD FUNCTIONS
    // ========================================================================

    /**
     * Download PDF report for a saved scenario
     */
    function downloadScenarioPDF(index) {
      if (!window.savedScenarios || !window.savedScenarios[index]) {
        alert('Scenario not found');
        return;
      }

      var scenario = window.savedScenarios[index];
      showScenarioFeedback('Generating PDF report for "' + scenario.name + '"...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            // Trigger download
            downloadBase64PDF(result.pdf, result.fileName);
            showScenarioFeedback('PDF downloaded successfully!', 'success');
          } else {
            showScenarioFeedback('Error generating PDF: ' + (result.error || 'Unknown error'), 'error');
          }
        })
        .withFailureHandler(function(error) {
          showScenarioFeedback('Error: ' + error.message, 'error');
        })
        .generateTool6PDF(clientId, scenario);
    }

    /**
     * Download comparison PDF for selected scenarios
     */
    function downloadComparisonPDF() {
      var select1 = document.getElementById('compareSelect1');
      var select2 = document.getElementById('compareSelect2');

      if (!select1 || !select2) {
        alert('Please select two scenarios to compare');
        return;
      }

      var index1 = select1.value;
      var index2 = select2.value;

      if (index1 === '' || index2 === '' || index1 === index2) {
        alert('Please select two different scenarios to compare');
        return;
      }

      var scenario1 = window.savedScenarios[parseInt(index1)];
      var scenario2 = window.savedScenarios[parseInt(index2)];

      if (!scenario1 || !scenario2) {
        alert('Error loading scenarios');
        return;
      }

      showScenarioFeedback('Generating comparison PDF...', 'info');

      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            downloadBase64PDF(result.pdf, result.fileName);
            showScenarioFeedback('Comparison PDF downloaded successfully!', 'success');
          } else {
            showScenarioFeedback('Error generating PDF: ' + (result.error || 'Unknown error'), 'error');
          }
        })
        .withFailureHandler(function(error) {
          showScenarioFeedback('Error: ' + error.message, 'error');
        })
        .generateTool6ComparisonPDF(clientId, scenario1, scenario2);
    }

    /**
     * Helper to download base64-encoded PDF
     */
    function downloadBase64PDF(base64Data, fileName) {
      var link = document.createElement('a');
      link.href = 'data:application/pdf;base64,' + base64Data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // ========================================================================
    // SPRINT 7.3: SCENARIO COMPARISON FUNCTIONS
    // ========================================================================

    /**
     * Update comparison dropdowns when scenarios are loaded
     */
    function updateComparisonDropdowns(scenarios) {
      var select1 = document.getElementById('compareSelect1');
      var select2 = document.getElementById('compareSelect2');
      var comparisonSection = document.getElementById('comparisonSection');

      if (!select1 || !select2) return;

      // Show/hide comparison section based on scenario count
      if (comparisonSection) {
        comparisonSection.style.display = (scenarios && scenarios.length >= 2) ? 'block' : 'none';
      }

      if (!scenarios || scenarios.length < 2) return;

      var options = '<option value="">Select scenario...</option>';
      scenarios.forEach(function(scenario, index) {
        var budgetStr = scenario.monthlyBudget ? '$' + scenario.monthlyBudget.toLocaleString() : '?';
        options += '<option value="' + index + '">' + escapeHtml(scenario.name) + ' (' + budgetStr + '/mo)</option>';
      });

      select1.innerHTML = options;
      select2.innerHTML = options;
    }

    /**
     * Update comparison when selections change
     */
    function updateScenarioComparison() {
      var select1 = document.getElementById('compareSelect1');
      var select2 = document.getElementById('compareSelect2');
      var resultsContainer = document.getElementById('comparisonResults');

      if (!select1 || !select2 || !resultsContainer) return;

      var index1 = select1.value;
      var index2 = select2.value;

      // Show/hide comparison PDF button
      var pdfSection = document.getElementById('comparisonPDFSection');

      if (index1 === '' || index2 === '' || index1 === index2) {
        resultsContainer.innerHTML = '<p class="muted">Select two different scenarios to compare.</p>';
        if (pdfSection) pdfSection.style.display = 'none';
        return;
      }

      // Show PDF button when both scenarios are selected
      if (pdfSection) pdfSection.style.display = 'block';

      var scenario1 = window.savedScenarios[parseInt(index1)];
      var scenario2 = window.savedScenarios[parseInt(index2)];

      if (!scenario1 || !scenario2) {
        resultsContainer.innerHTML = '<p class="muted">Error loading scenarios.</p>';
        return;
      }

      renderComparisonTable(scenario1, scenario2);
    }

    /**
     * Render comparison table - comprehensive view with projections and allocations
     */
    function renderComparisonTable(s1, s2) {
      var resultsContainer = document.getElementById('comparisonResults');

      // Calculate tax-free percentage (Roth + HSA + 529 + Coverdell / total)
      function calcTaxFreePercent(allocations) {
        if (!allocations) return 0;
        var taxFreeTotal = 0;
        var total = 0;
        for (var key in allocations) {
          total += allocations[key] || 0;
          // Tax-free vehicles: anything with "Roth" in the name, HSA, 529, Coverdell
          if (key.includes('Roth') || key === 'HSA' || key.includes('529') || key.includes('Coverdell')) {
            taxFreeTotal += allocations[key] || 0;
          }
        }
        return total > 0 ? Math.round((taxFreeTotal / total) * 100) : 0;
      }

      // Calculate monthly income at retirement (4% rule)
      function calcMonthlyIncome(projectedBalance) {
        return Math.round((projectedBalance * 0.04) / 12);
      }

      // Calculate real (inflation-adjusted) balance
      function calcRealBalance(projectedBalance, years) {
        var inflationRate = 0.025; // 2.5% default
        return Math.round(projectedBalance / Math.pow(1 + inflationRate, years || 25));
      }

      // Highlight helper - returns class and text for difference
      function getDiffInfo(val1, val2, higherIsBetter, isPercent) {
        if (val1 === val2) {
          return { cssClass: 'neutral', text: '-' };
        }

        var diff = val2 - val1;
        var pctDiff = val1 !== 0 ? Math.abs(diff / val1) * 100 : 100;
        var isSignificant = pctDiff > 5;

        if (!isSignificant) {
          return { cssClass: 'neutral', text: isPercent ? (diff > 0 ? '+' : '') + diff + '%' : (diff > 0 ? '+$' : '-$') + Math.abs(diff).toLocaleString() };
        }

        var winner = higherIsBetter ? (diff > 0 ? 'B' : 'A') : (diff < 0 ? 'B' : 'A');
        var diffText = isPercent ? (diff > 0 ? '+' : '') + diff + '%' : (diff > 0 ? '+$' : '-$') + Math.abs(diff).toLocaleString();

        return {
          cssClass: winner === 'A' ? 'better-a' : 'better-b',
          text: diffText + ' (' + winner + ' wins)'
        };
      }

      // Build section header helper
      function buildSectionHeader(title, icon) {
        return '<tr class="comparison-section-header"><td colspan="4">' + icon + ' ' + title + '</td></tr>';
      }

      // Build metric row helper
      function buildMetricRow(label, val1, val2, diffInfo, format) {
        var val1Str, val2Str;
        switch (format) {
          case 'currency':
            val1Str = '$' + val1.toLocaleString();
            val2Str = '$' + val2.toLocaleString();
            break;
          case 'percent':
            val1Str = val1 + '%';
            val2Str = val2 + '%';
            break;
          default:
            val1Str = val1;
            val2Str = val2;
        }
        return '<tr>' +
          '<td class="metric-label">' + label + '</td>' +
          '<td class="value-a">' + val1Str + '</td>' +
          '<td class="value-b">' + val2Str + '</td>' +
          '<td class="diff-cell ' + diffInfo.cssClass + '">' + diffInfo.text + '</td>' +
          '</tr>';
      }

      // Get all unique vehicle keys from both scenarios
      function getAllVehicleKeys(alloc1, alloc2) {
        var keys = {};
        if (alloc1) for (var k in alloc1) keys[k] = true;
        if (alloc2) for (var k in alloc2) keys[k] = true;
        return Object.keys(keys).sort();
      }

      // Format vehicle name for display
      function formatVehicleName(key) {
        return key.replace(/_/g, ' ').replace(/401k/g, '401(k)');
      }

      // Build allocation insights narrative
      function buildAllocationInsights(s1, s2, taxFree1, taxFree2) {
        var insights = [];

        // Tax strategy insight
        if (taxFree1 !== taxFree2) {
          var rothHeavy = taxFree1 > taxFree2 ? 'A' : 'B';
          var tradHeavy = taxFree1 > taxFree2 ? 'B' : 'A';
          insights.push('Scenario ' + rothHeavy + ' allocates more to tax-free vehicles (Roth/HSA) at ' + Math.max(taxFree1, taxFree2) + '%, while Scenario ' + tradHeavy + ' leans toward tax-deferred accounts at ' + (100 - Math.min(taxFree1, taxFree2)) + '%. Tax-free growth means no taxes in retirement, but you pay taxes now. Tax-deferred means lower taxes today but taxable withdrawals later.');
        }

        // Compare specific vehicles
        var alloc1 = s1.allocations || {};
        var alloc2 = s2.allocations || {};

        // HSA comparison
        var hsa1 = alloc1.HSA || 0;
        var hsa2 = alloc2.HSA || 0;
        if (hsa1 > 0 || hsa2 > 0) {
          if (Math.abs(hsa1 - hsa2) > 50) {
            var hsaHigher = hsa1 > hsa2 ? 'A' : 'B';
            insights.push('Scenario ' + hsaHigher + ' maximizes HSA contributions ($' + Math.max(hsa1, hsa2).toLocaleString() + '/mo). The HSA offers triple tax benefits: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses.');
          }
        }

        // 401k comparison
        var trad401k1 = (alloc1.Traditional_401k || 0) + (alloc1.Roth_401k || 0);
        var trad401k2 = (alloc2.Traditional_401k || 0) + (alloc2.Roth_401k || 0);
        if (Math.abs(trad401k1 - trad401k2) > 100) {
          var k401Higher = trad401k1 > trad401k2 ? 'A' : 'B';
          insights.push('Scenario ' + k401Higher + ' prioritizes 401(k) contributions ($' + Math.max(trad401k1, trad401k2).toLocaleString() + '/mo total). This captures any employer match and provides high contribution limits.');
        }

        // Family Bank comparison
        var fb1 = alloc1.Family_Bank || 0;
        var fb2 = alloc2.Family_Bank || 0;
        if ((fb1 > 0 || fb2 > 0) && Math.abs(fb1 - fb2) > 100) {
          var fbHigher = fb1 > fb2 ? 'A' : 'B';
          var fbLower = fb1 > fb2 ? 'B' : 'A';
          insights.push('Scenario ' + fbHigher + ' keeps more in the Family Bank ($' + Math.max(fb1, fb2).toLocaleString() + '/mo), providing liquidity and flexibility. Scenario ' + fbLower + ' prioritizes tax-advantaged accounts over accessible savings.');
        }

        if (insights.length === 0) {
          insights.push('Both scenarios have similar allocation strategies across vehicles.');
        }

        return insights.map(function(i) { return '<p>' + i + '</p>'; }).join('');
      }

      // Build projection insights narrative
      function buildProjectionInsights(s1, s2, proj1, proj2, real1, real2, monthly1, monthly2, taxFree1, taxFree2) {
        var insights = [];
        var projDiff = proj2 - proj1;
        var realDiff = real2 - real1;
        var monthlyDiff = monthly2 - monthly1;

        // Main balance insight
        if (Math.abs(projDiff) > 10000) {
          var balanceWinner = projDiff > 0 ? 'B' : 'A';
          var balanceLoser = projDiff > 0 ? 'A' : 'B';
          insights.push('Scenario ' + balanceWinner + ' projects a retirement balance of $' + Math.max(proj1, proj2).toLocaleString() + ', which is $' + Math.abs(projDiff).toLocaleString() + ' more than Scenario ' + balanceLoser + '. This difference compounds significantly over time due to investment growth.');
        } else {
          insights.push('Both scenarios project similar retirement balances (within $' + Math.abs(projDiff).toLocaleString() + ' of each other). The choice between them comes down to tax strategy preference and risk tolerance.');
        }

        // Real balance insight
        if (Math.abs(realDiff) > 5000) {
          var realWinner = realDiff > 0 ? 'B' : 'A';
          insights.push('After adjusting for inflation (2.5% annually), Scenario ' + realWinner + ' provides $' + Math.abs(realDiff).toLocaleString() + ' more in today\\'s purchasing power. This is the more accurate measure of your future lifestyle.');
        }

        // Monthly income insight
        if (Math.abs(monthlyDiff) > 100) {
          var incomeWinner = monthlyDiff > 0 ? 'B' : 'A';
          insights.push('Using the 4% safe withdrawal rule, Scenario ' + incomeWinner + ' could provide $' + Math.abs(monthlyDiff).toLocaleString() + ' more per month in retirement income. Over a 25-year retirement, that is an additional $' + (Math.abs(monthlyDiff) * 12 * 25).toLocaleString() + ' in total withdrawals.');
        }

        // Tax flexibility insight
        if (taxFree1 !== taxFree2 && Math.abs(taxFree1 - taxFree2) >= 10) {
          var taxFlexWinner = taxFree1 > taxFree2 ? 'A' : 'B';
          insights.push('Scenario ' + taxFlexWinner + ' has ' + Math.abs(taxFree1 - taxFree2) + '% more in tax-free accounts. This provides greater flexibility in retirement to manage tax brackets and avoid Required Minimum Distributions (RMDs) on that portion.');
        }

        return insights.map(function(i) { return '<p>' + i + '</p>'; }).join('');
      }

      // Helper to generate scenario narrative
      function buildScenarioNarrative(scenario, label) {
        var taxDesc = {
          'Later': 'traditional-heavy (tax-deferred)',
          'Now': 'Roth-heavy (tax-free growth)',
          'Both': 'balanced (mixed tax treatment)'
        };
        var riskDesc = ['very conservative', 'conservative', 'moderately conservative', 'moderate', 'moderately aggressive', 'aggressive', 'very aggressive'];
        var score = (scenario.investmentScore || 4) - 1;
        var riskLevel = riskDesc[Math.min(Math.max(score, 0), 6)];

        var narrative = '<div class="narrative-label">Scenario ' + label + '</div>';
        narrative += '<div class="narrative-name">"' + escapeHtml(scenario.name) + '"</div>';
        narrative += '<div class="narrative-details">';
        narrative += '<span class="narrative-item">Profile ' + (scenario.profileId || '?') + '</span>';
        narrative += '<span class="narrative-item">' + (taxDesc[scenario.taxStrategy] || 'balanced') + ' tax strategy</span>';
        narrative += '<span class="narrative-item">' + riskLevel + ' risk (score ' + (scenario.investmentScore || 4) + '/7)</span>';
        narrative += '<span class="narrative-item">$' + (scenario.monthlyBudget || 0).toLocaleString() + '/month</span>';
        narrative += '</div>';

        return narrative;
      }

      // Calculate values upfront
      var proj1 = s1.projectedBalance || 0;
      var proj2 = s2.projectedBalance || 0;
      var real1 = calcRealBalance(proj1, yearsToRetirement);
      var real2 = calcRealBalance(proj2, yearsToRetirement);
      var monthly1 = calcMonthlyIncome(proj1);
      var monthly2 = calcMonthlyIncome(proj2);
      var taxFree1 = calcTaxFreePercent(s1.allocations);
      var taxFree2 = calcTaxFreePercent(s2.allocations);

      // Start building HTML
      var html = '';

      // ============ SECTION 1: Setup & Configuration (Narrative) ============
      html += '<div class="comparison-section">';
      html += '<h4 class="comparison-section-title">📋 Setup & Configuration</h4>';
      html += '<div class="comparison-narratives">';
      html += '<div class="scenario-narrative scenario-a">' + buildScenarioNarrative(s1, 'A') + '</div>';
      html += '<div class="scenario-narrative scenario-b">' + buildScenarioNarrative(s2, 'B') + '</div>';
      html += '</div>';
      html += '</div>';

      // ============ SECTION 2: Vehicle Allocation Breakdown ============
      html += '<div class="comparison-section">';
      html += '<h4 class="comparison-section-title">💰 Vehicle Allocation Breakdown</h4>';

      html += '<table class="comparison-table">';
      html += '<thead><tr>';
      html += '<th>Vehicle</th>';
      html += '<th style="text-align: center;">Scenario A</th>';
      html += '<th style="text-align: center;">Scenario B</th>';
      html += '<th style="text-align: center;">Difference</th>';
      html += '</tr></thead><tbody>';

      var allVehicles = getAllVehicleKeys(s1.allocations, s2.allocations);
      allVehicles.forEach(function(vehicleKey) {
        var val1 = (s1.allocations && s1.allocations[vehicleKey]) || 0;
        var val2 = (s2.allocations && s2.allocations[vehicleKey]) || 0;

        // Only show vehicles that have allocation in at least one scenario
        if (val1 > 0 || val2 > 0) {
          html += buildMetricRow(formatVehicleName(vehicleKey), val1, val2, getDiffInfo(val1, val2, true, false), 'currency');
        }
      });

      html += '</tbody></table>';

      // Allocation Insights Narrative
      html += '<div class="section-insight">';
      html += buildAllocationInsights(s1, s2, taxFree1, taxFree2);
      html += '</div>';

      html += '</div>';

      // ============ SECTION 3: Future Projections ============
      html += '<div class="comparison-section">';
      html += '<h4 class="comparison-section-title">📈 Future Projections</h4>';

      html += '<table class="comparison-table">';
      html += '<thead><tr>';
      html += '<th>Metric</th>';
      html += '<th style="text-align: center;">Scenario A</th>';
      html += '<th style="text-align: center;">Scenario B</th>';
      html += '<th style="text-align: center;">Difference</th>';
      html += '</tr></thead><tbody>';

      // Retirement Projections
      html += buildSectionHeader('Retirement', '🏦');
      html += buildMetricRow('Projected Balance', proj1, proj2, getDiffInfo(proj1, proj2, true, false), 'currency');
      html += buildMetricRow('Real Balance (Inflation-Adj)', real1, real2, getDiffInfo(real1, real2, true, false), 'currency');
      html += buildMetricRow('Est. Monthly Income (4% Rule)', monthly1, monthly2, getDiffInfo(monthly1, monthly2, true, false), 'currency');
      html += buildMetricRow('Tax-Free Percentage', taxFree1, taxFree2, getDiffInfo(taxFree1, taxFree2, true, true), 'percent');

      // Education Projections (if applicable)
      var hasEducation1 = s1.educationProjection && s1.educationProjection > 0;
      var hasEducation2 = s2.educationProjection && s2.educationProjection > 0;

      if (hasEducation1 || hasEducation2) {
        var edu1 = s1.educationProjection || 0;
        var edu2 = s2.educationProjection || 0;
        var eduInputs1 = s1.educationInputs || {};
        var eduInputs2 = s2.educationInputs || {};

        html += buildSectionHeader('Education', '🎓');
        html += buildMetricRow('Projected Education Fund', edu1, edu2, getDiffInfo(edu1, edu2, true, false), 'currency');
        html += buildMetricRow('Number of Children', eduInputs1.numChildren || 0, eduInputs2.numChildren || 0,
          { cssClass: 'neutral', text: '-' }, 'text');
        html += buildMetricRow('Years to Education', eduInputs1.yearsToEducation || '?', eduInputs2.yearsToEducation || '?',
          { cssClass: 'neutral', text: '-' }, 'text');
      }

      html += '</tbody></table>';

      // Projections Insights Narrative
      html += '<div class="section-insight">';
      html += buildProjectionInsights(s1, s2, proj1, proj2, real1, real2, monthly1, monthly2, taxFree1, taxFree2);
      html += '</div>';

      html += '</div>';

      // ============ Winner Summary ============
      var projDiff = proj2 - proj1;
      if (Math.abs(projDiff) > 1000) {
        var winner = projDiff > 0 ? s2 : s1;
        var winnerLabel = projDiff > 0 ? 'B' : 'A';
        html += '<div class="comparison-winner">';
        html += '<h5>💡 Quick Take</h5>';
        html += '<p>Scenario ' + winnerLabel + ' ("' + escapeHtml(winner.name) + '") projects a higher retirement balance. ';
        html += 'The difference of <strong>$' + Math.abs(projDiff).toLocaleString() + '</strong> could mean ';
        html += '<strong>$' + Math.round(Math.abs(projDiff) * 0.04 / 12).toLocaleString() + '/month</strong> more in retirement income.</p>';

        // Add tax strategy insight if different
        if (taxFree1 !== taxFree2) {
          var taxWinner = taxFree1 > taxFree2 ? 'A' : 'B';
          html += '<p style="margin-top: 8px;">Scenario ' + taxWinner + ' has more in tax-free accounts (' + Math.max(taxFree1, taxFree2) + '% vs ' + Math.min(taxFree1, taxFree2) + '%), which provides more flexibility in retirement.</p>';
        }
        html += '</div>';
      } else {
        html += '<div class="comparison-winner">';
        html += '<h5>💡 Quick Take</h5>';
        html += '<p>These scenarios are quite similar in projected outcomes. Choose based on your comfort with the tax strategy and risk level.</p>';
        html += '</div>';
      }

      // Action buttons
      var idx1 = document.getElementById('compareSelect1').value;
      var idx2 = document.getElementById('compareSelect2').value;
      html += '<div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">';
      html += '<button type="button" class="scenario-btn load-btn" onclick="loadScenario(' + idx1 + ')">Load "' + escapeHtml(s1.name) + '"</button>';
      html += '<button type="button" class="scenario-btn load-btn" onclick="loadScenario(' + idx2 + ')">Load "' + escapeHtml(s2.name) + '"</button>';
      html += '</div>';

      resultsContainer.innerHTML = html;
    }

    // Load saved scenarios on page load (if allocation exists)
    if (classifiedProfile) {
      setTimeout(loadSavedScenarios, 500);
    }

  </script>

  <!-- FeedbackWidget - Get Help Button (Sprint 11.1) -->
  ${FeedbackWidget.render(clientId, 'tool6', 'calculator')}

</body>
</html>
    `;
  },

  /**
   * Sprint 10.1: Build Backup Questions HTML
   * Shows when Tool 1, 2, or 4 data is missing
   * Allows users to proceed without completing prerequisite tools
   *
   * @param {Object} savedAnswers - Previously saved form data
   * @param {boolean} hasTool1 - Whether Tool 1 is complete
   * @param {boolean} hasTool2 - Whether Tool 2 is complete
   * @param {boolean} hasTool4 - Whether Tool 4 is complete
   * @returns {string} HTML for backup questions section
   */
  buildBackupQuestionsHtml(savedAnswers, hasTool1, hasTool2, hasTool4) {
    // Helper to get saved value
    const getValue = (fieldId) => savedAnswers[fieldId] || '';

    // Build list of missing tools for display
    const missingTools = [];
    if (!hasTool4) missingTools.push('Tool 4 (Financial Freedom Framework)');
    if (!hasTool2) missingTools.push('Tool 2 (Financial Clarity)');
    if (!hasTool1) missingTools.push('Tool 1 (Money Pattern Discovery)');

    const missingToolsText = missingTools.length === 1
      ? missingTools[0]
      : missingTools.length === 2
        ? missingTools.join(' and ')
        : missingTools.slice(0, -1).join(', ') + ', and ' + missingTools[missingTools.length - 1];

    let html = `
      <div class="backup-questions-section" id="backupQuestionsSection">
        <div class="backup-intro">
          <div class="backup-intro-title">📋 Additional Information Needed</div>

          <div class="backup-explanation">
            <div class="backup-explanation-text">
              Because you have not completed ${missingToolsText}, we need to gather some additional information from you.
            </div>
            <div class="backup-recommendation">
              For deeper insights and more personalized recommendations, we recommend completing those tools first.
            </div>
            <div class="backup-tool-buttons">
              ${!hasTool4 ? `
              <button type="button" class="btn-primary backup-tool-btn" onclick="navigateToTool('tool4')">
                <span class="backup-tool-btn-name">Go to Tool 4</span>
                <span class="backup-tool-btn-desc">Financial Freedom Framework</span>
              </button>
              ` : ''}
              ${!hasTool2 ? `
              <button type="button" class="btn-primary backup-tool-btn" onclick="navigateToTool('tool2')">
                <span class="backup-tool-btn-name">Go to Tool 2</span>
                <span class="backup-tool-btn-desc">Financial Clarity</span>
              </button>
              ` : ''}
              ${!hasTool1 ? `
              <button type="button" class="btn-primary backup-tool-btn" onclick="navigateToTool('tool1')">
                <span class="backup-tool-btn-name">Go to Tool 1</span>
                <span class="backup-tool-btn-desc">Money Pattern Discovery</span>
              </button>
              ` : ''}
            </div>
          </div>

          <div class="backup-continue-text">
            Or, answer the questions below and we will use your responses to personalize your recommendations.
          </div>
        </div>
    `;

    // ========================================================================
    // TIER 1: Tool 4 Backup Questions (CRITICAL - needed for allocation)
    // ========================================================================
    if (!hasTool4) {
      html += `
        <div class="backup-tier" id="backupTier1">
          <div class="backup-tier-header">
            <span class="backup-tier-icon">💰</span>
            <span class="backup-tier-title">Financial Foundation</span>
          </div>
          <div class="backup-tier-description">These questions help us understand your savings capacity and timeline.</div>

          <!-- Monthly Take-Home Income -->
          <div class="form-group">
            <label class="form-label" for="backup_monthlyIncome">
              What is your monthly take-home income (after taxes)?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">Your net monthly income after all taxes and deductions.</div>
            <div class="currency-input-wrapper">
              <span class="currency-symbol">$</span>
              <input type="number"
                     id="backup_monthlyIncome"
                     name="backup_monthlyIncome"
                     class="form-input currency-input"
                     value="${getValue('backup_monthlyIncome')}"
                     placeholder="5000"
                     min="0"
                     step="100"
                     required>
            </div>
          </div>

          <!-- Monthly Budget for Future Building -->
          <div class="form-group">
            <label class="form-label" for="backup_monthlyBudget">
              How much can you allocate monthly toward future building (retirement, education, health savings)?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">This is your "Multiply" bucket from Tool 4 - money dedicated to growing your future wealth.</div>
            <div class="currency-input-wrapper">
              <span class="currency-symbol">$</span>
              <input type="number"
                     id="backup_monthlyBudget"
                     name="backup_monthlyBudget"
                     class="form-input currency-input"
                     value="${getValue('backup_monthlyBudget')}"
                     placeholder="1000"
                     min="0"
                     step="50"
                     required>
            </div>
          </div>

          <!-- Years to Retirement -->
          <div class="form-group">
            <label class="form-label" for="backup_yearsToRetirement">
              How many years until you plan to retire?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">Your target retirement timeline affects vehicle recommendations and projections.</div>
            <div class="slider-container backup-slider">
              <div class="slider-value-display" id="backup_yearsToRetirementDisplay">${getValue('backup_yearsToRetirement') || 25} years</div>
              <div class="slider-track-container">
                <div class="slider-track" id="backup_yearsToRetirementTrack"></div>
                <input type="range"
                       id="backup_yearsToRetirement"
                       name="backup_yearsToRetirement"
                       class="slider-input"
                       min="1"
                       max="45"
                       value="${getValue('backup_yearsToRetirement') || 25}"
                       oninput="updateBackupSlider('yearsToRetirement', this.value)">
              </div>
              <div class="slider-scale">
                <span>1</span><span>15</span><span>30</span><span>45</span>
              </div>
            </div>
          </div>

          <!-- Investment Risk Score -->
          <div class="form-group">
            <label class="form-label" for="backup_investmentScore">
              What is your investment risk tolerance?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">1 = Very Conservative (prefer safety), 7 = Very Aggressive (maximize growth)</div>
            <div class="score-buttons backup-score-buttons" id="backup_investmentScoreButtons">
              ${[1, 2, 3, 4, 5, 6, 7].map(i => {
                const currentVal = parseInt(getValue('backup_investmentScore')) || 4;
                const selected = i === currentVal ? 'selected' : '';
                return '<button type="button" class="score-btn ' + selected + '" data-value="' + i + '" onclick="selectBackupScore(\'investmentScore\', ' + i + ')">' + i + '</button>';
              }).join('')}
            </div>
            <div class="score-label-display" id="backup_investmentScoreLabel">
              ${this.getInvestmentScoreLabel(parseInt(getValue('backup_investmentScore')) || 4)}
            </div>
            <input type="hidden" id="backup_investmentScore" name="backup_investmentScore" value="${getValue('backup_investmentScore') || 4}">
          </div>
        </div>
      `;
    }

    // ========================================================================
    // TIER 2: Tool 2 Backup Questions (CRITICAL - needed for limits/eligibility)
    // ========================================================================
    if (!hasTool2) {
      html += `
        <div class="backup-tier" id="backupTier2">
          <div class="backup-tier-header">
            <span class="backup-tier-icon">👤</span>
            <span class="backup-tier-title">Personal & Financial Details</span>
          </div>
          <div class="backup-tier-description">These questions help us determine your eligibility and contribution limits.</div>

          <!-- Age -->
          <div class="form-group">
            <label class="form-label" for="backup_age">
              What is your current age?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">Your age affects catch-up contribution eligibility and retirement timeline.</div>
            <input type="number"
                   id="backup_age"
                   name="backup_age"
                   class="form-input"
                   value="${getValue('backup_age')}"
                   placeholder="40"
                   min="18"
                   max="100"
                   required>
          </div>

          <!-- Gross Annual Income -->
          <div class="form-group">
            <label class="form-label" for="backup_grossIncome">
              What is your gross annual income (before taxes)?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">Used to determine Roth IRA eligibility and tax bracket estimates.</div>
            <div class="currency-input-wrapper">
              <span class="currency-symbol">$</span>
              <input type="number"
                     id="backup_grossIncome"
                     name="backup_grossIncome"
                     class="form-input currency-input"
                     value="${getValue('backup_grossIncome')}"
                     placeholder="75000"
                     min="0"
                     step="1000"
                     required>
            </div>
          </div>

          <!-- Employment Type -->
          <div class="form-group">
            <label class="form-label" for="backup_employmentType">
              What best describes your employment situation?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">Determines which retirement vehicles are available to you.</div>
            <div class="statement-group backup-statement-group">
              <label class="statement-card ${getValue('backup_employmentType') === 'W-2 Employee' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_employmentType')">
                <input type="radio" name="backup_employmentType" value="W-2 Employee" ${getValue('backup_employmentType') === 'W-2 Employee' ? 'checked' : ''}>
                W-2 Employee - I work for an employer
              </label>
              <label class="statement-card ${getValue('backup_employmentType') === 'Self-Employed' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_employmentType')">
                <input type="radio" name="backup_employmentType" value="Self-Employed" ${getValue('backup_employmentType') === 'Self-Employed' ? 'checked' : ''}>
                Self-Employed - I work for myself (1099, freelance, contractor)
              </label>
              <label class="statement-card ${getValue('backup_employmentType') === 'Business Owner' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_employmentType')">
                <input type="radio" name="backup_employmentType" value="Business Owner" ${getValue('backup_employmentType') === 'Business Owner' ? 'checked' : ''}>
                Business Owner - I own a business with or without employees
              </label>
              <label class="statement-card ${getValue('backup_employmentType') === 'Retired' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_employmentType')">
                <input type="radio" name="backup_employmentType" value="Retired" ${getValue('backup_employmentType') === 'Retired' ? 'checked' : ''}>
                Retired - I am no longer working
              </label>
            </div>
          </div>

          <!-- Filing Status -->
          <div class="form-group">
            <label class="form-label" for="backup_filingStatus">
              What is your tax filing status?
              <span class="required-star">*</span>
            </label>
            <div class="form-help">Affects contribution limits and Roth IRA phase-out thresholds.</div>
            <div class="statement-group backup-statement-group">
              <label class="statement-card ${getValue('backup_filingStatus') === 'Single' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_filingStatus')">
                <input type="radio" name="backup_filingStatus" value="Single" ${getValue('backup_filingStatus') === 'Single' ? 'checked' : ''}>
                Single
              </label>
              <label class="statement-card ${getValue('backup_filingStatus') === 'MFJ' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_filingStatus')">
                <input type="radio" name="backup_filingStatus" value="MFJ" ${getValue('backup_filingStatus') === 'MFJ' ? 'checked' : ''}>
                Married Filing Jointly
              </label>
              <label class="statement-card ${getValue('backup_filingStatus') === 'MFS' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_filingStatus')">
                <input type="radio" name="backup_filingStatus" value="MFS" ${getValue('backup_filingStatus') === 'MFS' ? 'checked' : ''}>
                Married Filing Separately
              </label>
              <label class="statement-card ${getValue('backup_filingStatus') === 'HoH' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_filingStatus')">
                <input type="radio" name="backup_filingStatus" value="HoH" ${getValue('backup_filingStatus') === 'HoH' ? 'checked' : ''}>
                Head of Household
              </label>
            </div>
          </div>
        </div>
      `;
    }

    // ========================================================================
    // TIER 3: Tool 1 Backup Questions (IMPORTANT - for trauma insights)
    // ========================================================================
    if (!hasTool1) {
      html += `
        <div class="backup-tier" id="backupTier3">
          <div class="backup-tier-header">
            <span class="backup-tier-icon">🧠</span>
            <span class="backup-tier-title">Money Mindset</span>
          </div>
          <div class="backup-tier-description">These questions help us understand your psychological relationship with money.</div>

          <!-- Backup Q1: Stress Response -->
          <div class="form-group">
            <label class="form-label">When money stress hits, what is your typical first response?</label>
            <div class="form-help">Think about your automatic reaction when finances feel tight or uncertain.</div>
            <div class="statement-group backup-statement-group">
              <label class="statement-card ${getValue('backup_stressResponse') === 'FSV' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_stressResponse')">
                <input type="radio" name="backup_stressResponse" value="FSV" ${getValue('backup_stressResponse') === 'FSV' ? 'checked' : ''}>
                I create confusion or ignore the numbers to avoid seeing how bad things are
              </label>
              <label class="statement-card ${getValue('backup_stressResponse') === 'ExVal' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_stressResponse')">
                <input type="radio" name="backup_stressResponse" value="ExVal" ${getValue('backup_stressResponse') === 'ExVal' ? 'checked' : ''}>
                I worry about what others will think or hide my situation from people
              </label>
              <label class="statement-card ${getValue('backup_stressResponse') === 'Showing' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_stressResponse')">
                <input type="radio" name="backup_stressResponse" value="Showing" ${getValue('backup_stressResponse') === 'Showing' ? 'checked' : ''}>
                I find ways to help others anyway, even if it hurts my own finances
              </label>
              <label class="statement-card ${getValue('backup_stressResponse') === 'Receiving' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_stressResponse')">
                <input type="radio" name="backup_stressResponse" value="Receiving" ${getValue('backup_stressResponse') === 'Receiving' ? 'checked' : ''}>
                I look to others to fix it or take over my financial decisions
              </label>
              <label class="statement-card ${getValue('backup_stressResponse') === 'Control' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_stressResponse')">
                <input type="radio" name="backup_stressResponse" value="Control" ${getValue('backup_stressResponse') === 'Control' ? 'checked' : ''}>
                I tighten control on everything, even going without things I need
              </label>
              <label class="statement-card ${getValue('backup_stressResponse') === 'Fear' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_stressResponse')">
                <input type="radio" name="backup_stressResponse" value="Fear" ${getValue('backup_stressResponse') === 'Fear' ? 'checked' : ''}>
                I freeze up or make decisions that seem to make things worse
              </label>
            </div>
          </div>

          <!-- Backup Q2: Core Belief -->
          <div class="form-group">
            <label class="form-label">Which statement feels most true about money for you?</label>
            <div class="form-help">Choose the one that resonates most deeply, even if uncomfortable.</div>
            <div class="statement-group backup-statement-group">
              <label class="statement-card ${getValue('backup_coreBelief') === 'FSV' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_coreBelief')">
                <input type="radio" name="backup_coreBelief" value="FSV" ${getValue('backup_coreBelief') === 'FSV' ? 'checked' : ''}>
                If I had more money, I would finally feel safe
              </label>
              <label class="statement-card ${getValue('backup_coreBelief') === 'ExVal' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_coreBelief')">
                <input type="radio" name="backup_coreBelief" value="ExVal" ${getValue('backup_coreBelief') === 'ExVal' ? 'checked' : ''}>
                How much money I have affects how others see me
              </label>
              <label class="statement-card ${getValue('backup_coreBelief') === 'Showing' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_coreBelief')">
                <input type="radio" name="backup_coreBelief" value="Showing" ${getValue('backup_coreBelief') === 'Showing' ? 'checked' : ''}>
                Giving to others, even when it hurts me, is how I show love
              </label>
              <label class="statement-card ${getValue('backup_coreBelief') === 'Receiving' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_coreBelief')">
                <input type="radio" name="backup_coreBelief" value="Receiving" ${getValue('backup_coreBelief') === 'Receiving' ? 'checked' : ''}>
                I need others to help with my finances because I cannot handle it alone
              </label>
              <label class="statement-card ${getValue('backup_coreBelief') === 'Control' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_coreBelief')">
                <input type="radio" name="backup_coreBelief" value="Control" ${getValue('backup_coreBelief') === 'Control' ? 'checked' : ''}>
                I must control every dollar or things will fall apart
              </label>
              <label class="statement-card ${getValue('backup_coreBelief') === 'Fear' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_coreBelief')">
                <input type="radio" name="backup_coreBelief" value="Fear" ${getValue('backup_coreBelief') === 'Fear' ? 'checked' : ''}>
                No matter what I do, something bad will probably happen with money
              </label>
            </div>
          </div>

          <!-- Backup Q3: Consequence Pattern -->
          <div class="form-group">
            <label class="form-label">What financial pattern do you notice repeating in your life?</label>
            <div class="form-help">Look at the outcomes that keep showing up, not what you intend to happen.</div>
            <div class="statement-group backup-statement-group">
              <label class="statement-card ${getValue('backup_consequence') === 'FSV' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_consequence')">
                <input type="radio" name="backup_consequence" value="FSV" ${getValue('backup_consequence') === 'FSV' ? 'checked' : ''}>
                I never seem to have money when I need it, even when I earn enough
              </label>
              <label class="statement-card ${getValue('backup_consequence') === 'ExVal' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_consequence')">
                <input type="radio" name="backup_consequence" value="ExVal" ${getValue('backup_consequence') === 'ExVal' ? 'checked' : ''}>
                I spend money on image or hide my situation to manage how others see me
              </label>
              <label class="statement-card ${getValue('backup_consequence') === 'Showing' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_consequence')">
                <input type="radio" name="backup_consequence" value="Showing" ${getValue('backup_consequence') === 'Showing' ? 'checked' : ''}>
                I take on other people's financial burdens or refuse repayment when offered
              </label>
              <label class="statement-card ${getValue('backup_consequence') === 'Receiving' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_consequence')">
                <input type="radio" name="backup_consequence" value="Receiving" ${getValue('backup_consequence') === 'Receiving' ? 'checked' : ''}>
                I become dependent on others or rack up debt that creates obligation
              </label>
              <label class="statement-card ${getValue('backup_consequence') === 'Control' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_consequence')">
                <input type="radio" name="backup_consequence" value="Control" ${getValue('backup_consequence') === 'Control' ? 'checked' : ''}>
                I have money but do not charge my worth, collect what I am owed, or spend on myself
              </label>
              <label class="statement-card ${getValue('backup_consequence') === 'Fear' ? 'selected' : ''}" onclick="selectBackupStatement(this, 'backup_consequence')">
                <input type="radio" name="backup_consequence" value="Fear" ${getValue('backup_consequence') === 'Fear' ? 'checked' : ''}>
                I trust the wrong people or skip protections, and then bad things happen
              </label>
            </div>
          </div>
        </div>
      `;
    }

    // Close backup questions section
    html += `
      </div>
    `;

    return html;
  },

  /**
   * Helper: Get investment score label
   */
  getInvestmentScoreLabel(score) {
    const labels = {
      1: 'Very Conservative (6% return)',
      2: 'Conservative (8% return)',
      3: 'Moderately Conservative (10% return)',
      4: 'Moderate (12% return)',
      5: 'Moderately Aggressive (14% return)',
      6: 'Aggressive (17% return)',
      7: 'Very Aggressive (20% return)'
    };
    return labels[score] || 'Moderate (12% return)';
  },

  /**
   * Build questionnaire form HTML - TWO-PHASE APPROACH
   *
   * Phase A: Classification - Progressive questions, short-circuit on profile match
   * Phase B: Allocation - Profile-specific inputs after classification
   *
   * If profile is already determined (from preSurveyData), skip to Phase B
   *
   * Sprint 10.1: Backup Questions
   * Shows backup questions when Tool 1, 2, or 4 data is missing
   */
  // eslint-disable-next-line no-unused-vars
  buildQuestionnaireHtml(preSurveyData, prefillData, profile = null, toolStatus = {}) {
    // Note: toolStatus parameter kept for API compatibility but backup questions moved to Section 0
    const savedAnswers = preSurveyData || {};
    const hasProfile = !!profile;

    // Helper to get value (saved > prefill > empty)
    const getValue = (fieldId, prefillKey) => {
      if (savedAnswers[fieldId] !== undefined && savedAnswers[fieldId] !== null) {
        return savedAnswers[fieldId];
      }
      if (prefillKey && prefillData[prefillKey] !== undefined && prefillData[prefillKey] !== null) {
        return prefillData[prefillKey];
      }
      return '';
    };

    // Helper to render a single field
    const renderField = (fieldId, field, value) => {
      const isRequired = field.required ? 'required' : '';
      let fieldHtml = `
        <div class="form-group" id="group_${fieldId}">
          <label class="form-label" for="${fieldId}">
            ${field.label}
            ${field.required ? '<span class="required-star">*</span>' : ''}
          </label>
      `;

      switch (field.type) {
        case 'currency':
          fieldHtml += `
            <div class="currency-input-wrapper">
              <span class="currency-symbol">$</span>
              <input type="number"
                     id="${fieldId}"
                     name="${fieldId}"
                     class="form-input currency-input"
                     value="${value}"
                     placeholder="${field.placeholder || ''}"
                     min="0"
                     step="1"
                     ${isRequired}
                     onchange="handleFieldChange('${fieldId}', this.value)">
            </div>
          `;
          break;

        case 'number':
          fieldHtml += `
            <input type="number"
                   id="${fieldId}"
                   name="${fieldId}"
                   class="form-input"
                   value="${value}"
                   placeholder="${field.placeholder || ''}"
                   min="${field.min || 0}"
                   max="${field.max || 999}"
                   ${isRequired}
                   onchange="handleFieldChange('${fieldId}', this.value)">
          `;
          break;

        case 'yesno':
          fieldHtml += `
            <div class="yesno-buttons">
              <button type="button"
                      class="yesno-btn ${value === 'Yes' ? 'selected' : ''}"
                      onclick="selectYesNo('${fieldId}', 'Yes')">Yes</button>
              <button type="button"
                      class="yesno-btn ${value === 'No' ? 'selected' : ''}"
                      onclick="selectYesNo('${fieldId}', 'No')">No</button>
              <input type="hidden" id="${fieldId}" name="${fieldId}" value="${value}">
            </div>
          `;
          break;

        case 'select':
          fieldHtml += `<select id="${fieldId}" name="${fieldId}" class="form-input" ${isRequired} onchange="handleFieldChange('${fieldId}', this.value)">`;
          for (const opt of field.options) {
            const selected = value === opt.value ? 'selected' : '';
            fieldHtml += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
          }
          fieldHtml += '</select>';
          break;

        case 'ranking':
          const ranks = value ? (typeof value === 'string' ? JSON.parse(value) : value) : { retirement: 1, education: 2, health: 3 };
          fieldHtml += `
            <div class="ranking-inputs">
              <div class="ranking-row">
                <span class="ranking-label">Retirement security</span>
                <select id="${fieldId}_retirement" class="form-input ranking-select" onchange="updateRanking('${fieldId}')">
                  <option value="1" ${ranks.retirement === 1 ? 'selected' : ''}>1st</option>
                  <option value="2" ${ranks.retirement === 2 ? 'selected' : ''}>2nd</option>
                  <option value="3" ${ranks.retirement === 3 ? 'selected' : ''}>3rd</option>
                </select>
              </div>
              <div class="ranking-row">
                <span class="ranking-label">Education savings</span>
                <select id="${fieldId}_education" class="form-input ranking-select" onchange="updateRanking('${fieldId}')">
                  <option value="1" ${ranks.education === 1 ? 'selected' : ''}>1st</option>
                  <option value="2" ${ranks.education === 2 ? 'selected' : ''}>2nd</option>
                  <option value="3" ${ranks.education === 3 ? 'selected' : ''}>3rd</option>
                </select>
              </div>
              <div class="ranking-row">
                <span class="ranking-label">Health/medical</span>
                <select id="${fieldId}_health" class="form-input ranking-select" onchange="updateRanking('${fieldId}')">
                  <option value="1" ${ranks.health === 1 ? 'selected' : ''}>1st</option>
                  <option value="2" ${ranks.health === 2 ? 'selected' : ''}>2nd</option>
                  <option value="3" ${ranks.health === 3 ? 'selected' : ''}>3rd</option>
                </select>
              </div>
              <input type="hidden" id="${fieldId}" name="${fieldId}" value='${JSON.stringify(ranks)}'>
            </div>
          `;
          break;

        case 'scale':
          const scaleMin = field.min || 1;
          const scaleMax = field.max || 7;
          const currentVal = parseInt(value) || Math.ceil((scaleMax + scaleMin) / 2);
          fieldHtml += `
            <div class="scale-input-wrapper">
              <div class="scale-labels">
                <span class="scale-label-left">${field.leftLabel || ''}</span>
                <span class="scale-label-right">${field.rightLabel || ''}</span>
              </div>
              <div class="scale-buttons" id="scale_${fieldId}">
          `;
          for (let i = scaleMin; i <= scaleMax; i++) {
            const selected = i === currentVal ? 'selected' : '';
            fieldHtml += `<button type="button" class="scale-btn ${selected}" data-value="${i}" onclick="selectScale('${fieldId}', ${i})">${i}</button>`;
          }
          fieldHtml += `
              </div>
              <input type="hidden" id="${fieldId}" name="${fieldId}" value="${currentVal}">
            </div>
          `;
          break;

        default:
          fieldHtml += `
            <input type="text"
                   id="${fieldId}"
                   name="${fieldId}"
                   class="form-input"
                   value="${value}"
                   placeholder="${field.placeholder || ''}"
                   ${isRequired}
                   onchange="handleFieldChange('${fieldId}', this.value)">
          `;
      }

      if (field.helpText) {
        fieldHtml += `<div class="form-help">${field.helpText}</div>`;
      }

      fieldHtml += '</div>';
      return fieldHtml;
    };

    let html = '<form id="questionnaireForm" onsubmit="return false;">';

    // NOTE: Backup questions are now rendered in Section 0 (separate card)
    // See buildUnifiedPage() lines 2729-2765 for the new backup section implementation

    // ========================================================================
    // PHASE A: CLASSIFICATION (Progressive short-circuit flow)
    // ========================================================================
    // Always render Phase A (hidden if profile exists) so "Change" button works
    const phaseAHidden = hasProfile ? 'hidden' : '';

    html += `
      <div class="questionnaire-phase ${phaseAHidden}" id="phaseA">
        <div class="phase-header">
          <h4 class="section-subtitle">Step 1: Determine Your Investor Profile</h4>
          <p class="section-description">Answer a few questions to find the best retirement strategy for your situation</p>
        </div>
        <div class="classification-container" id="classificationContainer">
    `;

    // Render classification questions (will be shown/hidden by JS)
    for (const fieldId of CLASSIFICATION_ORDER) {
      const field = CLASSIFICATION_QUESTIONS[fieldId];
      if (!field) continue;

      const value = getValue(fieldId, null);
      // Initially hide all but first question
      const isFirst = fieldId === CLASSIFICATION_ORDER[0];
      const hiddenClass = isFirst ? '' : 'hidden';

      html += `<div class="classification-question ${hiddenClass}" id="cq_${fieldId}">`;
      html += renderField(fieldId, field, value);
      html += '</div>';
    }

    html += `
        </div>
        <div class="profile-result hidden" id="profileResult">
          <div class="profile-card">
            <div class="profile-icon" id="profileIcon"></div>
            <div class="profile-info">
              <h3 id="profileName">Profile Name</h3>
              <p id="profileReason">Match reason</p>
            </div>
          </div>
          <button type="button" class="btn-secondary" onclick="continueToPhaseB()">
            Continue to Allocation Details
          </button>
        </div>
      </div>
    `;

    // ========================================================================
    // PHASE B: ALLOCATION INPUTS (Profile-specific)
    // ========================================================================
    const phaseBHidden = hasProfile ? '' : 'hidden';
    const profileId = profile?.id || 7;

    html += `
      <div class="questionnaire-phase ${phaseBHidden}" id="phaseB">
        <input type="hidden" id="classifiedProfile" name="classifiedProfile" value="${profileId}">
    `;

    // Show profile badge if we have one
    if (hasProfile) {
      html += `
        <div class="profile-result-compact">
          <span class="profile-badge">${profile.icon || ''} ${profile.name}</span>
          <button type="button" class="btn-link" onclick="restartClassification()">Change</button>
        </div>
      `;
    }

    // Render allocation sections
    for (const section of ALLOCATION_SECTIONS) {
      // Skip sections that don't apply to this profile
      if (section.skipForProfiles && section.skipForProfiles.includes(profileId)) {
        continue;
      }

      html += `
        <div class="questionnaire-section" id="section_${section.id}">
          <h4 class="section-subtitle">${section.title}</h4>
          <p class="section-description">${section.description}</p>
          <div class="questions-grid">
      `;

      for (const fieldId of section.fields) {
        const field = ALLOCATION_QUESTIONS[fieldId];
        if (!field) continue;

        // Skip fields that don't apply to this profile
        if (field.skipForProfiles && field.skipForProfiles.includes(profileId)) {
          continue;
        }

        // Determine prefill key mapping
        let prefillKey = null;
        if (fieldId === 'a1_grossIncome') prefillKey = 'income';
        if (fieldId === 'a2_yearsToRetirement') prefillKey = 'yearsToRetirement';

        const value = getValue(fieldId, prefillKey);
        const hasShowIf = field.showIf ? 'data-show-if="true"' : '';

        html += `<div class="${field.showIf ? 'conditional-field' : ''}" ${hasShowIf}>`;
        html += renderField(fieldId, field, value);
        html += '</div>';
      }

      html += '</div></div>';
    }

    // Phase B ends with continue button (not submit)
    html += `
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="continueToPhaseC()" id="phaseBContinue">
            Continue to Priorities
          </button>
        </div>
      </div>
    `;

    // ========================================================================
    // PHASE C: AMBITION QUOTIENT (Adaptive psychological assessment)
    // ========================================================================
    html += `
      <div class="questionnaire-phase hidden" id="phaseC">
        <div class="phase-header">
          <h4 class="section-subtitle">Your Savings Priorities</h4>
          <p class="section-description">Help us understand what matters most to you right now</p>
        </div>

        <!-- Retirement Domain (Always shown) -->
        <div class="ambition-domain" id="domain_Retirement">
          <h5 class="domain-title">Retirement Security</h5>
    `;

    // Render Retirement questions
    for (const fieldId of AMBITION_QUESTION_ORDER.Retirement) {
      const field = AMBITION_QUESTIONS[fieldId];
      if (!field) continue;
      const value = getValue(fieldId, null);
      html += renderField(fieldId, field, value);
    }

    html += `
        </div>

        <!-- Education Domain (Conditional) -->
        <div class="ambition-domain conditional-domain" id="domain_Education">
          <h5 class="domain-title">Education Savings</h5>
    `;

    // Render Education questions
    for (const fieldId of AMBITION_QUESTION_ORDER.Education) {
      const field = AMBITION_QUESTIONS[fieldId];
      if (!field) continue;
      const value = getValue(fieldId, null);
      html += renderField(fieldId, field, value);
    }

    html += `
        </div>

        <!-- Health Domain (Conditional) -->
        <div class="ambition-domain conditional-domain" id="domain_Health">
          <h5 class="domain-title">Healthcare Planning</h5>
    `;

    // Render Health questions
    for (const fieldId of AMBITION_QUESTION_ORDER.Health) {
      const field = AMBITION_QUESTIONS[fieldId];
      if (!field) continue;
      const value = getValue(fieldId, null);
      html += renderField(fieldId, field, value);
    }

    html += `
        </div>

        <!-- Tie-breaker (Only if all 3 domains active) -->
        <div class="ambition-tiebreaker conditional-domain hidden" id="tiebreakerSection">
    `;

    // Render tie-breaker
    const tiebreakerField = AMBITION_QUESTIONS.aq_tiebreaker;
    if (tiebreakerField) {
      const value = getValue('aq_tiebreaker', null);
      html += renderField('aq_tiebreaker', tiebreakerField, value);
    }

    html += `
        </div>

        <div class="form-actions">
          <button type="button" class="submit-btn" onclick="submitQuestionnaire()" id="submitBtn">
            Calculate My Allocation
          </button>
          <div id="errorMessage" class="error-message"></div>
        </div>
      </div>
    </form>`;

    return html;
  },

  /**
   * Get prefill data from Tool 2/4 responses
   * Now uses mapped fields from checkToolCompletion()
   */
  getPrefillData(toolStatus) {
    // toolStatus now includes mapped fields from mapUpstreamFields()
    // Return a subset for form prefilling
    return {
      age: toolStatus.age || null,
      income: toolStatus.grossIncome || null,
      employmentType: toolStatus.employmentType || null,
      filingStatus: toolStatus.filingStatus || null,
      businessOwner: toolStatus.businessOwner || false,
      monthlyBudget: toolStatus.monthlyBudget || null,
      monthlyTakeHome: toolStatus.monthlyTakeHome || null,
      yearsToRetirement: toolStatus.yearsToRetirement || null,
      investmentScore: toolStatus.investmentScore || 4,
      hsaCoverageType: toolStatus.hsaCoverageType || 'Individual',
      traumaPattern: toolStatus.traumaPattern || null
    };
  },

  /**
   * Render error page
   */
  renderError(error) {
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Tool 6</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; background: #1a1a2e; color: #eee; }
          .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 24px; border-radius: 8px; }
          h1 { color: #ef4444; }
          pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>Tool 6 Error</h1>
          <p>${error.message || error.toString()}</p>
          <pre>${error.stack || 'No stack trace available'}</pre>
        </div>
      </body>
      </html>
    `);
  },

  /**
   * Save scenario to sheet
   * Sprint 7.1: Persists current calculator state to TOOL6_SCENARIOS sheet
   *
   * Schema (15 columns A-O per spec):
   * A: Timestamp, B: Client_ID, C: Scenario_Name, D: Profile_ID, E: Monthly_Budget
   * F: Domain_Weights (JSON), G: Allocations (JSON), H: Investment_Score, I: Tax_Strategy
   * J: Projected_Balance, K: Current_Balances (JSON), L: Current_Contributions (JSON)
   * M: Education_Inputs (JSON), N: Education_Projection, O: Is_Latest
   */
  saveScenario(clientId, scenario) {
    try {
      Logger.log(`Tool6.saveScenario called for client ${clientId}`);
      Logger.log(`Scenario data: ${JSON.stringify(scenario)}`);

      // Validate scenario data
      if (!scenario || !scenario.name) {
        throw new Error('Scenario name is required');
      }
      if (!scenario.allocations || Object.keys(scenario.allocations).length === 0) {
        throw new Error('Vehicle allocations are required');
      }

      // Get or create TOOL6_SCENARIOS sheet
      let scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);

      if (!scenariosSheet) {
        Logger.log('TOOL6_SCENARIOS sheet does not exist, creating...');
        const ss = SpreadsheetCache.getSpreadsheet();
        scenariosSheet = ss.insertSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);

        // Add headers per spec (15 columns A-O)
        const headers = [
          'Timestamp',           // A
          'Client_ID',           // B
          'Scenario_Name',       // C
          'Profile_ID',          // D
          'Monthly_Budget',      // E
          'Domain_Weights',      // F (JSON)
          'Allocations',         // G (JSON)
          'Investment_Score',    // H
          'Tax_Strategy',        // I
          'Projected_Balance',   // J
          'Current_Balances',    // K (JSON)
          'Current_Contributions', // L (JSON)
          'Education_Inputs',    // M (JSON)
          'Education_Projection', // N
          'Is_Latest'            // O
        ];
        scenariosSheet.appendRow(headers);
        scenariosSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        SpreadsheetApp.flush();
        Logger.log('TOOL6_SCENARIOS sheet created with 15-column header');
      }

      // Mark all previous scenarios for this client as not latest
      const dataRange = scenariosSheet.getDataRange();
      const allData = dataRange.getValues();
      const clientIdCol = 1; // Column B (0-indexed)
      const isLatestCol = 14; // Column O (0-indexed)

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][clientIdCol] === clientId && allData[i][isLatestCol] === true) {
          scenariosSheet.getRange(i + 1, isLatestCol + 1).setValue(false);
        }
      }

      // Prepare JSON fields
      const domainWeightsJson = JSON.stringify(scenario.domainWeights || {
        Retirement: 1,
        Education: 0,
        Health: 0
      });

      const allocationsJson = JSON.stringify(scenario.allocations || {});

      const currentBalancesJson = JSON.stringify(scenario.currentBalances || {
        '401k': 0,
        ira: 0,
        hsa: 0,
        education: 0
      });

      const currentContributionsJson = JSON.stringify(scenario.currentContributions || {
        '401k': 0,
        ira: 0,
        hsa: 0,
        education: 0
      });

      const educationInputsJson = JSON.stringify(scenario.educationInputs || {
        numChildren: 0,
        yearsToEducation: 99
      });

      // Build row data (15 columns)
      const row = [
        new Date(),                                      // A: Timestamp
        clientId,                                        // B: Client_ID
        scenario.name,                                   // C: Scenario_Name
        scenario.profileId || 7,                         // D: Profile_ID (default to Foundation Builder)
        scenario.monthlyBudget || 0,                     // E: Monthly_Budget
        domainWeightsJson,                               // F: Domain_Weights (JSON)
        allocationsJson,                                 // G: Allocations (JSON)
        scenario.investmentScore || 4,                   // H: Investment_Score
        scenario.taxStrategy || 'Both',                  // I: Tax_Strategy
        scenario.projectedBalance || 0,                  // J: Projected_Balance
        currentBalancesJson,                             // K: Current_Balances (JSON)
        currentContributionsJson,                        // L: Current_Contributions (JSON)
        educationInputsJson,                             // M: Education_Inputs (JSON)
        scenario.educationProjection || 0,               // N: Education_Projection
        true                                             // O: Is_Latest
      ];

      // Detailed logging like Tool 4
      Logger.log(`Row data to append (${row.length} columns):`);
      Logger.log(`  [0] Timestamp: ${row[0]}`);
      Logger.log(`  [1] Client_ID: ${row[1]}`);
      Logger.log(`  [2] Scenario_Name: ${row[2]}`);
      Logger.log(`  [3] Profile_ID: ${row[3]}`);
      Logger.log(`  [4] Monthly_Budget: ${row[4]}`);
      Logger.log(`  [7] Investment_Score: ${row[7]}`);
      Logger.log(`  [8] Tax_Strategy: ${row[8]}`);
      Logger.log(`  [9] Projected_Balance: ${row[9]}`);

      // Verify sheet before append
      Logger.log(`Sheet name: ${scenariosSheet.getName()}, Sheet ID: ${scenariosSheet.getSheetId()}`);
      Logger.log(`Current row count before append: ${scenariosSheet.getLastRow()}`);

      scenariosSheet.appendRow(row);
      SpreadsheetApp.flush();

      // Verify the append worked
      const newRowCount = scenariosSheet.getLastRow();
      Logger.log(`Row count after append: ${newRowCount}`);

      // Read back the last row to verify (like Tool 4)
      if (newRowCount > 1) {
        const lastRow = scenariosSheet.getRange(newRowCount, 1, 1, 5).getValues()[0];
        Logger.log(`Verification - Last row data: ${JSON.stringify(lastRow)}`);
      }

      // Count scenarios for this client and enforce limit (10 max like Tool 4)
      const MAX_SCENARIOS_PER_CLIENT = 10;
      const clientScenarioRows = [];

      const refreshedData = scenariosSheet.getDataRange().getValues();
      for (let i = 1; i < refreshedData.length; i++) {
        if (refreshedData[i][clientIdCol] === clientId) {
          clientScenarioRows.push({
            rowIndex: i + 1,
            timestamp: refreshedData[i][0],
            name: refreshedData[i][2]
          });
        }
      }

      Logger.log(`Client ${clientId} now has ${clientScenarioRows.length} scenario(s)`);

      // If over limit, delete oldest (FIFO)
      let deletedScenario = null;
      if (clientScenarioRows.length > MAX_SCENARIOS_PER_CLIENT) {
        clientScenarioRows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const oldest = clientScenarioRows[0];
        Logger.log(`Deleting oldest scenario "${oldest.name}" to enforce ${MAX_SCENARIOS_PER_CLIENT} limit`);
        scenariosSheet.deleteRow(oldest.rowIndex);
        SpreadsheetApp.flush();
        deletedScenario = oldest.name;
      }

      const isFirstScenario = clientScenarioRows.length === 1;

      // If first scenario, mark Tool 6 as completed in Responses tab
      if (isFirstScenario) {
        try {
          const dataPackage = {
            scenarioName: scenario.name,
            profileId: scenario.profileId,
            monthlyBudget: scenario.monthlyBudget,
            allocations: scenario.allocations,
            projectedBalance: scenario.projectedBalance,
            investmentScore: scenario.investmentScore,
            taxStrategy: scenario.taxStrategy
          };
          DataService.saveToolResponse(clientId, 'tool6', dataPackage, 'COMPLETED');
          Logger.log(`Tool6 marked as completed for client ${clientId}`);
        } catch (responseError) {
          Logger.log(`Warning: Could not update Responses tab: ${responseError}`);
        }
      }

      Logger.log(`Scenario saved successfully: ${scenario.name}`);
      return {
        success: true,
        message: 'Scenario saved successfully',
        totalScenarios: clientScenarioRows.length - (deletedScenario ? 1 : 0),
        isFirstScenario: isFirstScenario,
        deletedScenario: deletedScenario
      };

    } catch (error) {
      Logger.log(`Error saving Tool 6 scenario: ${error}`);
      Logger.log(`Stack: ${error.stack}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all scenarios for a client
   * Sprint 7.1: Returns array of scenario objects for display in UI
   */
  getScenarios(clientId) {
    try {
      Logger.log(`Tool6.getScenarios called for client ${clientId}`);

      const scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);
      if (!scenariosSheet) {
        Logger.log('TOOL6_SCENARIOS sheet does not exist');
        return [];
      }

      const dataRange = scenariosSheet.getDataRange();
      const allData = dataRange.getValues();

      if (allData.length <= 1) {
        // Only header row
        return [];
      }

      // Column indices (0-indexed)
      const COL = {
        TIMESTAMP: 0,      // A
        CLIENT_ID: 1,      // B
        SCENARIO_NAME: 2,  // C
        PROFILE_ID: 3,     // D
        MONTHLY_BUDGET: 4, // E
        DOMAIN_WEIGHTS: 5, // F (JSON)
        ALLOCATIONS: 6,    // G (JSON)
        INVESTMENT_SCORE: 7, // H
        TAX_STRATEGY: 8,   // I
        PROJECTED_BALANCE: 9, // J
        CURRENT_BALANCES: 10, // K (JSON)
        CURRENT_CONTRIBUTIONS: 11, // L (JSON)
        EDUCATION_INPUTS: 12, // M (JSON)
        EDUCATION_PROJECTION: 13, // N
        IS_LATEST: 14      // O
      };

      const scenarios = [];

      for (let i = 1; i < allData.length; i++) {
        const row = allData[i];
        if (row[COL.CLIENT_ID] === clientId) {
          // Convert Date to ISO string for serialization to client (like Tool 4)
          let timestampVal = row[COL.TIMESTAMP];
          let timestampStr = '';
          if (timestampVal instanceof Date) {
            timestampStr = timestampVal.toISOString();
          } else if (timestampVal) {
            timestampStr = String(timestampVal);
          }

          scenarios.push({
            timestamp: timestampStr,
            name: String(row[COL.SCENARIO_NAME] || ''),
            profileId: row[COL.PROFILE_ID],
            monthlyBudget: row[COL.MONTHLY_BUDGET],
            domainWeights: this.safeJsonParse(row[COL.DOMAIN_WEIGHTS], {}),
            allocations: this.safeJsonParse(row[COL.ALLOCATIONS], {}),
            investmentScore: row[COL.INVESTMENT_SCORE],
            taxStrategy: String(row[COL.TAX_STRATEGY] || 'Both'),
            projectedBalance: row[COL.PROJECTED_BALANCE],
            currentBalances: this.safeJsonParse(row[COL.CURRENT_BALANCES], {}),
            currentContributions: this.safeJsonParse(row[COL.CURRENT_CONTRIBUTIONS], {}),
            educationInputs: this.safeJsonParse(row[COL.EDUCATION_INPUTS], {}),
            educationProjection: row[COL.EDUCATION_PROJECTION],
            isLatest: row[COL.IS_LATEST] === true
          });
        }
      }

      // Sort by timestamp descending (newest first)
      scenarios.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      Logger.log(`Found ${scenarios.length} scenarios for client ${clientId}`);
      return scenarios;

    } catch (error) {
      Logger.log(`Error getting Tool 6 scenarios: ${error}`);
      Logger.log(`Stack: ${error.stack}`);
      return [];
    }
  },

  /**
   * Safely parse JSON string, return default on error
   */
  safeJsonParse(str, defaultVal) {
    if (!str || typeof str !== 'string') return defaultVal;
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultVal;
    }
  },

  /**
   * Delete a scenario by name
   * Sprint 7.1: Removes scenario from TOOL6_SCENARIOS sheet
   */
  deleteScenario(clientId, scenarioName) {
    try {
      Logger.log(`Tool6.deleteScenario called for client ${clientId}, scenario "${scenarioName}"`);

      const scenariosSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.TOOL6_SCENARIOS);
      if (!scenariosSheet) {
        return { success: false, error: 'Scenarios sheet not found' };
      }

      const dataRange = scenariosSheet.getDataRange();
      const allData = dataRange.getValues();

      // Column indices
      const CLIENT_ID_COL = 1;  // B
      const NAME_COL = 2;       // C

      // Find the row to delete (search from bottom to handle index shifting)
      let rowToDelete = -1;
      for (let i = allData.length - 1; i >= 1; i--) {
        if (allData[i][CLIENT_ID_COL] === clientId && allData[i][NAME_COL] === scenarioName) {
          rowToDelete = i + 1; // Convert to 1-indexed for sheet operations
          break;
        }
      }

      if (rowToDelete === -1) {
        return { success: false, error: 'Scenario not found' };
      }

      scenariosSheet.deleteRow(rowToDelete);
      SpreadsheetApp.flush();

      Logger.log(`Deleted scenario "${scenarioName}" at row ${rowToDelete}`);
      return { success: true, message: 'Scenario deleted' };

    } catch (error) {
      Logger.log(`Error deleting Tool 6 scenario: ${error}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate PDF report for a single scenario
   * Sprint 7.4: PDF Generation with GPT insights
   *
   * @param {string} clientId - Client ID
   * @param {Object} scenarioData - Scenario data (from saved scenario or current state)
   * @returns {Object} { success, pdf, fileName, mimeType } or { success: false, error }
   */
  generatePDF(clientId, scenarioData) {
    try {
      Logger.log(`[Tool6.generatePDF] Generating PDF for client ${clientId}`);

      // Get client name
      const clientName = this.getClientName(clientId);

      // Get Tool 1 and Tool 3 data for trauma-informed context
      const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

      // Get profile definition
      const profileId = scenarioData.profileId || 7;
      const profile = PROFILE_DEFINITIONS[profileId] || PROFILE_DEFINITIONS[7];

      // Sprint 13: Get income from grossIncome field (added to scenario save)
      // Fallback to toolStatus if not in scenario (for old scenarios)
      let grossIncome = scenarioData.grossIncome || scenarioData.income || 0;
      if (!grossIncome) {
        const toolStatus = this.checkToolCompletion(clientId);
        grossIncome = toolStatus.grossIncome || toolStatus.income || 0;
        Logger.log(`[Tool6.generatePDF] Using toolStatus grossIncome fallback: ${grossIncome}`);
      }

      // Build inputs object
      const inputs = {
        age: scenarioData.age || 40,
        yearsToRetirement: scenarioData.yearsToRetirement || 25,
        income: grossIncome,
        grossIncome: grossIncome,
        monthlyBudget: scenarioData.monthlyBudget || 0,
        investmentScore: scenarioData.investmentScore || 4,
        taxPreference: scenarioData.taxStrategy || 'Balanced',
        hasChildren: scenarioData.hasChildren || false,
        numChildren: scenarioData.numChildren || scenarioData.educationInputs?.numChildren || 0,
        yearsToEducation: scenarioData.yearsToEducation || scenarioData.educationInputs?.yearsToEducation || 18,
        educationVehicle: scenarioData.educationVehicle || '529 Plan',
        domainWeights: scenarioData.domainWeights || null,
        hasEmployerMatch: scenarioData.hasEmployerMatch || false,
        employerMatchAmount: scenarioData.employerMatchAmount || 0,
        workSituation: scenarioData.workSituation || 'W-2 Employee',
        filingStatus: scenarioData.filingStatus || 'Single'
      };

      // Sprint 13: Calculate current balance from saved balances
      let currentBalance = scenarioData.currentBalance || 0;
      if (!currentBalance && scenarioData.currentBalances) {
        currentBalance = (scenarioData.currentBalances['401k'] || 0) +
                         (scenarioData.currentBalances.ira || 0) +
                         (scenarioData.currentBalances.hsa || 0) +
                         (scenarioData.currentBalances.education || 0);
      }

      // Sprint 13: Calculate derived projections if not saved
      const projectedBalance = scenarioData.projectedBalance || 0;
      const yearsToRetirement = inputs.yearsToRetirement;
      const inflationRate = 0.025; // 2.5% annual inflation
      const inflationAdjusted = scenarioData.inflationAdjusted ||
                                 Math.round(projectedBalance / Math.pow(1 + inflationRate, yearsToRetirement));
      const monthlyRetirementIncome = scenarioData.monthlyRetirementIncome ||
                                       Math.round((inflationAdjusted * 0.04) / 12); // 4% rule

      // Sprint 13: Calculate tax percentages from allocations if not saved (for old scenarios)
      let taxFreePercent = scenarioData.taxFreePercent || 0;
      let traditionalPercent = scenarioData.traditionalPercent || 0;
      let taxablePercent = scenarioData.taxablePercent || 0;

      // If all tax percentages are 0 but we have allocations, calculate from allocations
      const allocations = scenarioData.allocations || {};
      if (taxFreePercent === 0 && traditionalPercent === 0 && taxablePercent === 0 && Object.keys(allocations).length > 0) {
        Logger.log('[Tool6.generatePDF] Calculating tax percentages from allocations...');
        let taxFree = 0, traditional = 0, taxable = 0, total = 0;

        for (const [vehicle, amount] of Object.entries(allocations)) {
          if (amount <= 0) continue;
          total += amount;
          const vLower = vehicle.toLowerCase();

          // Tax-Free: Roth, HSA, 529, Coverdell, Backdoor Roth
          if (vLower.includes('roth') || vLower.includes('hsa') ||
              vLower.includes('529') || vLower.includes('coverdell') ||
              vLower.includes('backdoor')) {
            taxFree += amount;
          }
          // Tax-Deferred: Traditional 401(k), Traditional IRA, SEP, SIMPLE, Solo 401(k) Employer
          else if (vLower.includes('traditional') || vLower.includes('trad') ||
                   vLower.includes('sep') || vLower.includes('simple') ||
                   (vLower.includes('solo') && vLower.includes('employer')) ||
                   (vLower.includes('401') && !vLower.includes('roth'))) {
            traditional += amount;
          }
          // Taxable: Everything else (Family Bank, taxable brokerage, etc.)
          else {
            taxable += amount;
          }
        }

        if (total > 0) {
          taxFreePercent = Math.round((taxFree / total) * 100);
          traditionalPercent = Math.round((traditional / total) * 100);
          taxablePercent = Math.round((taxable / total) * 100);
          Logger.log(`[Tool6.generatePDF] Tax breakdown: Free=${taxFreePercent}%, Deferred=${traditionalPercent}%, Taxable=${taxablePercent}%`);
        }
      }

      // Build projections object
      const projections = {
        projectedBalance: projectedBalance,
        inflationAdjusted: inflationAdjusted,
        monthlyRetirementIncome: monthlyRetirementIncome,
        currentBalance: currentBalance,
        taxFreePercent: taxFreePercent,
        traditionalPercent: traditionalPercent,
        taxablePercent: taxablePercent,
        educationProjection: scenarioData.educationProjection || null
      };

      // Get GPT insights (3-tier fallback)
      Logger.log('[Tool6.generatePDF] Generating GPT insights...');
      const gptInsights = Tool6GPTAnalysis.generateSingleReportInsights({
        clientId,
        profile,
        allocation: scenarioData.allocations || {},
        projections,
        inputs,
        tool1Data,
        tool3Data
      });

      Logger.log(`[Tool6.generatePDF] GPT source: ${gptInsights.source}`);

      // Sprint 13: Get enhanced implementation blueprint insights
      // Use the calculated fallback values (projectedBalance, inflationAdjusted, etc.) not scenarioData
      Logger.log('[Tool6.generatePDF] Generating enhanced report insights...');
      const savingsRate = grossIncome > 0 ? Math.round((inputs.monthlyBudget * 12 / grossIncome) * 100) : 0;
      const enhancedInsights = Tool6GPTAnalysis.generateEnhancedReportInsights({
        clientId,
        profile,
        allocations: scenarioData.allocations || {},
        userInputs: inputs,
        projections: {
          projectedBalance: projectedBalance,
          balance: projectedBalance,  // Alias for GPT prompt compatibility
          inflationAdjusted: inflationAdjusted,
          monthlyRetirementIncome: monthlyRetirementIncome,
          monthlyIncome: monthlyRetirementIncome,  // Alias for GPT prompt compatibility
          currentBalance: currentBalance,
          savingsRate: savingsRate
        },
        tool1Data,
        tool3Data
      });

      Logger.log(`[Tool6.generatePDF] Enhanced insights source: ${enhancedInsights.source}`);

      // Generate HTML report
      const htmlContent = Tool6Report.generateSingleReportHTML({
        clientName,
        profile,
        allocation: scenarioData.allocations || {},
        projections,
        inputs,
        gptInsights,
        enhancedInsights  // Sprint 13: Implementation blueprint content
      });

      // Convert to PDF
      const fileName = Tool6Report.generateFileName(clientName, 'single');
      const pdfResult = PDFGenerator.htmlToPDF(htmlContent, fileName);

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'PDF generation failed');
      }

      Logger.log(`[Tool6.generatePDF] PDF generated successfully: ${fileName}`);

      return {
        success: true,
        pdf: pdfResult.pdf,
        fileName: pdfResult.fileName,
        mimeType: pdfResult.mimeType
      };

    } catch (error) {
      Logger.log(`[Tool6.generatePDF] Error: ${error.message}`);
      Logger.log(`[Tool6.generatePDF] Stack: ${error.stack}`);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Generate PDF comparison report for two scenarios
   * Sprint 7.4: Comparison Report PDF
   *
   * @param {string} clientId - Client ID
   * @param {Object} scenario1 - First scenario data
   * @param {Object} scenario2 - Second scenario data
   * @returns {Object} { success, pdf, fileName, mimeType } or { success: false, error }
   */
  generateComparisonPDF(clientId, scenario1, scenario2) {
    try {
      Logger.log(`[Tool6.generateComparisonPDF] Generating comparison PDF for client ${clientId}`);

      // Get client name
      const clientName = this.getClientName(clientId);

      // Get Tool 1 and Tool 3 data for trauma-informed context
      const tool1Data = DataService.getLatestResponse(clientId, 'tool1');
      const tool3Data = DataService.getLatestResponse(clientId, 'tool3');

      // Build inputs object (use scenario1 as primary)
      const inputs = {
        age: scenario1.age || scenario2.age || 40,
        yearsToRetirement: scenario1.yearsToRetirement || scenario2.yearsToRetirement || 25
      };

      // Get GPT comparison insights (3-tier fallback)
      Logger.log('[Tool6.generateComparisonPDF] Generating GPT comparison insights...');
      const gptInsights = Tool6GPTAnalysis.generateComparisonInsights({
        clientId,
        scenario1: {
          name: scenario1.name || 'Scenario A',
          profileName: PROFILE_DEFINITIONS[scenario1.profileId]?.name || 'Unknown',
          monthlyBudget: scenario1.monthlyBudget || 0,
          taxPreference: scenario1.taxStrategy || 'Balanced',
          projectedBalance: scenario1.projectedBalance || 0,
          taxFreePercent: scenario1.taxFreePercent || 0,
          monthlyRetirementIncome: scenario1.monthlyRetirementIncome || 0,
          allocation: scenario1.allocations || {}
        },
        scenario2: {
          name: scenario2.name || 'Scenario B',
          profileName: PROFILE_DEFINITIONS[scenario2.profileId]?.name || 'Unknown',
          monthlyBudget: scenario2.monthlyBudget || 0,
          taxPreference: scenario2.taxStrategy || 'Balanced',
          projectedBalance: scenario2.projectedBalance || 0,
          taxFreePercent: scenario2.taxFreePercent || 0,
          monthlyRetirementIncome: scenario2.monthlyRetirementIncome || 0,
          allocation: scenario2.allocations || {}
        },
        inputs,
        tool1Data,
        tool3Data
      });

      Logger.log(`[Tool6.generateComparisonPDF] GPT source: ${gptInsights.source}`);

      // Generate HTML comparison report
      const htmlContent = Tool6Report.generateComparisonReportHTML({
        clientName,
        scenario1: {
          name: scenario1.name || 'Scenario A',
          profileName: PROFILE_DEFINITIONS[scenario1.profileId]?.name || 'Unknown',
          monthlyBudget: scenario1.monthlyBudget || 0,
          taxPreference: scenario1.taxStrategy || 'Balanced',
          projectedBalance: scenario1.projectedBalance || 0,
          inflationAdjusted: scenario1.inflationAdjusted || 0,
          monthlyRetirementIncome: scenario1.monthlyRetirementIncome || 0,
          taxFreePercent: scenario1.taxFreePercent || 0,
          allocation: scenario1.allocations || {}
        },
        scenario2: {
          name: scenario2.name || 'Scenario B',
          profileName: PROFILE_DEFINITIONS[scenario2.profileId]?.name || 'Unknown',
          monthlyBudget: scenario2.monthlyBudget || 0,
          taxPreference: scenario2.taxStrategy || 'Balanced',
          projectedBalance: scenario2.projectedBalance || 0,
          inflationAdjusted: scenario2.inflationAdjusted || 0,
          monthlyRetirementIncome: scenario2.monthlyRetirementIncome || 0,
          taxFreePercent: scenario2.taxFreePercent || 0,
          allocation: scenario2.allocations || {}
        },
        gptInsights
      });

      // Convert to PDF
      const fileName = Tool6Report.generateFileName(clientName, 'comparison');
      const pdfResult = PDFGenerator.htmlToPDF(htmlContent, fileName);

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'PDF generation failed');
      }

      Logger.log(`[Tool6.generateComparisonPDF] PDF generated successfully: ${fileName}`);

      return {
        success: true,
        pdf: pdfResult.pdf,
        fileName: pdfResult.fileName,
        mimeType: pdfResult.mimeType
      };

    } catch (error) {
      Logger.log(`[Tool6.generateComparisonPDF] Error: ${error.message}`);
      Logger.log(`[Tool6.generateComparisonPDF] Stack: ${error.stack}`);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get client name from DataService or return default
   */
  getClientName(clientId) {
    try {
      const tool2Data = DataService.getLatestResponse(clientId, 'tool2');
      const formData = tool2Data?.data?.data || {};
      return formData.name || formData.firstName || 'Client';
    } catch (e) {
      return 'Client';
    }
  }
};

// ============================================================================
// GLOBAL FUNCTION WRAPPERS (for google.script.run calls)
// ============================================================================

/**
 * Global wrapper for saving Tool 6 pre-survey data
 * Called from client-side JavaScript via google.script.run
 */
function savePreSurveyTool6(clientId, preSurveyData) {
  return Tool6.savePreSurvey(clientId, preSurveyData);
}

/**
 * Global wrapper for getting Tool 6 page HTML
 * Used for GAS-compliant page refresh (document.write pattern)
 * Called from client-side JavaScript via google.script.run
 */
function getTool6Page(clientId) {
  try {
    const result = Tool6.render({ clientId: clientId });
    // getContent() returns the raw HTML string
    return {
      success: true,
      html: result.getContent()
    };
  } catch (error) {
    Logger.log('Error getting Tool6 page: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Global wrapper for saving Tool 6 scenario
 * Sprint 7.1: Called from client-side JavaScript via google.script.run
 */
function saveTool6Scenario(clientId, scenario) {
  return Tool6.saveScenario(clientId, scenario);
}

/**
 * Global wrapper for getting Tool 6 scenarios
 * Sprint 7.1: Called from client-side JavaScript via google.script.run
 */
function getTool6Scenarios(clientId) {
  return Tool6.getScenarios(clientId);
}

/**
 * Global wrapper for deleting Tool 6 scenario
 * Sprint 7.1: Called from client-side JavaScript via google.script.run
 */
function deleteTool6Scenario(clientId, scenarioName) {
  return Tool6.deleteScenario(clientId, scenarioName);
}

/**
 * Global wrapper for generating Tool 6 PDF report
 * Sprint 7.4: Called from client-side JavaScript via google.script.run
 */
function generateTool6PDF(clientId, scenarioData) {
  return Tool6.generatePDF(clientId, scenarioData);
}

/**
 * Global wrapper for generating Tool 6 comparison PDF
 * Sprint 7.4: Called from client-side JavaScript via google.script.run
 */
function generateTool6ComparisonPDF(clientId, scenario1, scenario2) {
  return Tool6.generateComparisonPDF(clientId, scenario1, scenario2);
}

/**
 * Test function for profile classification
 * Run from Apps Script editor to verify decision tree logic
 *
 * LEGACY ALIGNED: Test cases match legacy code.js classification logic
 */
function testTool6Classification() {
  const testCases = [
    // ========== ROBS Profiles ==========
    {
      name: 'Profile 1: ROBS In Use',
      input: { q6_robsInUse: 'Yes' },
      expected: 1
    },
    {
      name: 'Profile 2: ROBS Interested + All Qualifiers Pass',
      input: {
        q6_robsInUse: 'No',
        q7_robsInterest: 'Yes',
        q8_robsNewBusiness: 'Yes',
        q9_robsBalance: 'Yes',
        q10_robsSetupCost: 'Yes'
      },
      expected: 2
    },
    {
      name: 'ROBS Interested but missing qualifier (falls through)',
      input: {
        q6_robsInUse: 'No',
        q7_robsInterest: 'Yes',
        q8_robsNewBusiness: 'Yes',
        q9_robsBalance: 'No',
        q10_robsSetupCost: 'Yes',
        q16_taxFocus: 'Later'  // Will hit Profile 7 default
      },
      expected: 7
    },

    // ========== Business Owner Profiles ==========
    {
      name: 'Profile 3: Business Owner with Employees',
      input: {
        q6_robsInUse: 'No',
        q4_ownsBusiness: 'Yes',
        q5_hasW2Employees: 'Yes'
      },
      expected: 3
    },
    {
      name: 'Profile 4: Self-employed Solo 401k',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'Self-employed',
        q4_ownsBusiness: 'No',
        q5_hasW2Employees: 'No'
      },
      expected: 4
    },
    {
      name: 'Profile 4: Both W-2 and Self-employed (Solo eligible)',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'Both',
        q5_hasW2Employees: 'No'
      },
      expected: 4
    },

    // ========== IRA/Tax Strategy Profiles ==========
    {
      name: 'Profile 5: Has Traditional IRA (Roth Reclaimer)',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'Yes'
      },
      expected: 5
    },

    // ========== Age-Based Profiles ==========
    {
      name: 'Profile 9: Age 55+ (Late Stage)',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'No',
        age: '55'
      },
      expected: 9
    },
    {
      name: 'Profile 9: Near Retirement Flag',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'No',
        age: '52',
        q18_nearRetirement: 'Yes'
      },
      expected: 9
    },
    {
      name: 'Profile 6: Age 50+ and Catch-Up Feeling',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'No',
        age: '50',
        q17_catchUpFeeling: 'Yes'
      },
      expected: 6
    },

    // ========== Tax Focus Profiles ==========
    {
      name: 'Profile 8: Tax Focus = Now (Traditional priority)',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'No',
        age: '40',
        q16_taxFocus: 'Now'
      },
      expected: 8
    },
    {
      name: 'Profile 8: Tax Focus = Both (Balanced)',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'No',
        age: '40',
        q16_taxFocus: 'Both'
      },
      expected: 8
    },

    // ========== Default Profile ==========
    {
      name: 'Profile 7: Foundation Builder (Default - Tax Focus Later)',
      input: {
        q6_robsInUse: 'No',
        q3_workSituation: 'W-2',
        q14_hasTradIRA: 'No',
        age: '35',
        q16_taxFocus: 'Later'
      },
      expected: 7
    },

    // ========== NEW TWO-PHASE FORMAT TESTS ==========
    {
      name: 'NEW FORMAT - Profile 1: ROBS In Use',
      input: { c1_robsStatus: 'using' },
      expected: 1
    },
    {
      name: 'NEW FORMAT - Profile 2: ROBS Interested + Qualifies',
      input: {
        c1_robsStatus: 'interested',
        c2_robsQualifier1: 'Yes',
        c3_robsQualifier2: 'Yes',
        c4_robsQualifier3: 'Yes'
      },
      expected: 2
    },
    {
      name: 'NEW FORMAT - Profile 3: Biz with Employees',
      input: {
        c1_robsStatus: 'no',
        c5_workSituation: 'BizWithEmployees'
      },
      expected: 3
    },
    {
      name: 'NEW FORMAT - Profile 4: Self-employed',
      input: {
        c1_robsStatus: 'no',
        c5_workSituation: 'Self-employed'
      },
      expected: 4
    },
    {
      name: 'NEW FORMAT - Profile 5: Has Trad IRA',
      input: {
        c1_robsStatus: 'no',
        c5_workSituation: 'W-2',
        c6_hasTradIRA: 'Yes'
      },
      expected: 5
    },
    {
      name: 'NEW FORMAT - Profile 8: Tax Focus Now',
      input: {
        c1_robsStatus: 'no',
        c5_workSituation: 'W-2',
        c6_hasTradIRA: 'No',
        c7_taxFocus: 'Now',
        age: '40'
      },
      expected: 8
    },
    {
      name: 'NEW FORMAT - Profile 7: Tax Focus Later (Default)',
      input: {
        c1_robsStatus: 'no',
        c5_workSituation: 'W-2',
        c6_hasTradIRA: 'No',
        c7_taxFocus: 'Later',
        age: '35'
      },
      expected: 7
    }
  ];

  const results = [];
  const mockToolStatus = { hasTool1: false, hasTool2: false, hasTool3: false, hasTool4: false, hasTool5: false };

  testCases.forEach(tc => {
    const profile = Tool6.classifyProfile('TEST', tc.input, mockToolStatus);
    const passed = profile.id === tc.expected;
    results.push({
      name: tc.name,
      expected: tc.expected,
      actual: profile.id,
      passed: passed,
      reason: profile.matchReason
    });
    Logger.log((passed ? '✓' : '✗') + ' ' + tc.name + ': Expected ' + tc.expected + ', Got ' + profile.id);
  });

  const passCount = results.filter(r => r.passed).length;
  Logger.log('---');
  Logger.log('Results: ' + passCount + '/' + results.length + ' passed');

  return results;
}
