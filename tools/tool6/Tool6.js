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
      const toolStatus = this.checkToolCompletion(clientId);
      console.log('checkToolCompletion returned. hasTool4: ' + toolStatus.hasTool4);

      // Check if pre-survey completed (questionnaire answers)
      const preSurveyData = this.getPreSurvey(clientId);

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
      return preSurveyData ? JSON.parse(preSurveyData) : null;
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
      PropertiesService.getUserProperties().setProperty(preSurveyKey, JSON.stringify(preSurveyData));
      Logger.log(`Pre-survey saved for client: ${clientId}`);

      // Recalculate with new data
      const toolStatus = this.checkToolCompletion(clientId);
      const savedPreSurvey = this.getPreSurvey(clientId);

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
  getEligibleVehicles(profile, inputs) {
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
    if (profileId === 4) {
      eligible['Solo 401(k) Employee'] = {
        monthlyLimit: getMonthlyLimit('Solo 401(k) Employee'),
        domain: 'Retirement'
      };
      eligible['Solo 401(k) Employer'] = {
        monthlyLimit: getMonthlyLimit('Solo 401(k) Employer'),
        domain: 'Retirement'
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
    if (rothEligibility.useBackdoor) {
      eligible['Backdoor Roth IRA'] = {
        monthlyLimit: getMonthlyLimit('Backdoor Roth IRA'),
        domain: 'Retirement',
        sharesLimitWith: 'IRA Traditional',
        note: 'Recommended due to income above Roth IRA limits'
      };
    }

    // --- HSA (Requires HDHP enrollment) ---
    if (hsaEligible) {
      eligible['HSA'] = {
        monthlyLimit: getMonthlyLimit('HSA'),
        domain: 'Health'
      };
    }

    // --- Education Vehicles (If has children) ---
    if (hasChildren) {
      eligible['529 Plan'] = {
        monthlyLimit: Infinity,  // State-dependent, no federal limit
        domain: 'Education'
      };
      eligible['Coverdell ESA'] = {
        monthlyLimit: IRS_LIMITS_2025.COVERDELL_ESA / 12,
        domain: 'Education'
      };
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
    const educationVehicles = ['529 Plan', 'Coverdell ESA'].filter(v => eligibleVehicles[v]);
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

      for (const vehicle of domainVehicles) {
        if (remaining <= 0) break;

        const effectiveLimit = getEffectiveLimit(vehicle);
        if (effectiveLimit <= 0) continue;

        const allocation = Math.min(remaining, effectiveLimit);
        if (allocation > 0) {
          allocations[vehicle] = (allocations[vehicle] || 0) + allocation;
          cumulativeAllocations[vehicle] = (cumulativeAllocations[vehicle] || 0) + allocation;
          remaining -= allocation;
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
    if (leftoverRetirement > 0) {
      allocations['Family Bank'] = leftoverRetirement;
    }

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
      // Ensure we have key fields
      age: preSurveyData.age || toolStatus.age || 35,
      grossIncome: preSurveyData.a1_grossIncome || preSurveyData.grossIncome || toolStatus.grossIncome || 0,
      filingStatus: toolStatus.filingStatus || 'Single'
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

    // Step 1: Get eligible vehicles
    const eligibleVehicles = this.getEligibleVehicles(profile, inputs);

    // Step 2: Get tax preference for priority ordering
    const taxPreference = preSurveyData.a2b_taxPreference || preSurveyData.taxPreference || 'Both';

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

    .section-card {
      background: var(--color-surface);
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

    .vehicle-slider-row {
      display: grid;
      grid-template-columns: 200px 1fr 100px;
      gap: 16px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .vehicle-name {
      font-weight: 500;
    }

    .vehicle-amount {
      font-family: monospace;
      font-size: 1.1rem;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
    }

    .btn-primary:disabled {
      background: rgba(79, 70, 229, 0.3);
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
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

    /* Phase transition button styling */
    .btn-secondary {
      background: transparent;
      border: 2px solid var(--color-primary);
      color: var(--color-primary);
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: var(--color-primary);
      color: white;
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
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 2rem; color: var(--color-text-primary); margin-bottom: 8px;">
        Retirement Blueprint Calculator
      </h1>
      <p style="color: var(--color-text-secondary); font-size: 1.1rem;">
        Optimize your retirement vehicle allocations for maximum tax efficiency
      </p>
    </div>

    ${!dataStatus.overall.canProceed ? `
    <!-- Blocker Message - Tool 4 Required -->
    <div class="section-card" style="margin-bottom: 16px;">
      <div class="blocker-message">
        <strong>Action Required:</strong> ${dataStatus.overall.blockerMessage}
      </div>
    </div>
    ` : ''}

    <!-- Section 1: Your Profile (Questionnaire) -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('profile')">
        <div class="section-title">1. Your Financial Profile</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${hasPreSurvey ? '<span class="profile-badge">Profile: ' + (profile?.name || 'Calculating...') + '</span>' : ''}
          <span class="section-toggle ${hasPreSurvey ? 'collapsed' : ''}" id="profileToggle">&#9660;</span>
        </div>
      </div>

      ${hasPreSurvey ? `
      <div class="section-summary show" id="profileSummary">
        <strong>Monthly Budget:</strong> $${(preSurveyData.monthlyBudget || 0).toLocaleString()} |
        <strong>Age:</strong> ${preSurveyData.age || prefillData.age || 'Not set'} |
        <strong>Filing Status:</strong> ${preSurveyData.filingStatus || 'Single'}
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
        ${this.buildQuestionnaireHtml(preSurveyData, prefillData, profile)}
      </div>
    </div>

    <!-- Section 2: Vehicle Allocation Calculator -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('calculator')">
        <div class="section-title">2. Vehicle Allocation</div>
        <span class="section-toggle" id="calculatorToggle">&#9660;</span>
      </div>

      <div class="section-body" id="calculatorBody">
        ${hasAllocation ? `
        <div class="placeholder-message">
          <h3>Coming Soon: Sprint 4-5</h3>
          <p>Vehicle allocation sliders with IRS limit enforcement.</p>
          <p>Real-time recalculation as you adjust allocations.</p>
        </div>
        ` : `
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
        <div class="section-title">3. Future Value Projections</div>
        <span class="section-toggle collapsed" id="projectionsToggle">&#9660;</span>
      </div>

      <div class="section-body collapsed" id="projectionsBody">
        <div class="placeholder-message">
          <h3>Coming Soon: Sprint 6</h3>
          <p>Future value calculations with inflation adjustment.</p>
          <p>Actual vs Ideal scenario comparison.</p>
        </div>
      </div>
    </div>

    <!-- Section 4: Saved Scenarios -->
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('scenarios')">
        <div class="section-title">4. Saved Scenarios</div>
        <span class="section-toggle collapsed" id="scenariosToggle">&#9660;</span>
      </div>

      <div class="section-body collapsed" id="scenariosBody">
        <div class="placeholder-message">
          <h3>Coming Soon: Sprint 7</h3>
          <p>Save, load, and compare multiple allocation scenarios.</p>
        </div>
      </div>
    </div>

  </div>

  <script>
    var clientId = '${clientId}';
    var formData = ${JSON.stringify(preSurveyData || {})};
    var classifiedProfile = ${profile ? JSON.stringify(profile) : 'null'};
    var upstreamAge = ${toolStatus.age || 'null'};
    var upstreamYearsToRetirement = ${toolStatus.yearsToRetirement || 'null'};

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
    }

    // Continue to Phase C (ambition quotient)
    function continueToPhaseC() {
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
    // INITIALIZATION
    // ========================================================================

    document.addEventListener('DOMContentLoaded', function() {
      // If profile already determined, show Phase B
      if (classifiedProfile) {
        updateAllocationVisibility();
      }
    });

    // Run immediately in case DOMContentLoaded already fired
    if (classifiedProfile) {
      updateAllocationVisibility();
    }
  </script>
</body>
</html>
    `;
  },

  /**
   * Build questionnaire form HTML - TWO-PHASE APPROACH
   *
   * Phase A: Classification - Progressive questions, short-circuit on profile match
   * Phase B: Allocation - Profile-specific inputs after classification
   *
   * If profile is already determined (from preSurveyData), skip to Phase B
   */
  buildQuestionnaireHtml(preSurveyData, prefillData, profile = null) {
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
   */
  saveScenario(clientId, scenario) {
    // TODO: Implement in Sprint 7
    return { success: false, error: 'Not yet implemented' };
  },

  /**
   * Get all scenarios for a client
   */
  getScenarios(clientId) {
    // TODO: Implement in Sprint 7
    return [];
  },

  /**
   * Generate PDF report
   */
  generatePDF(clientId, scenario) {
    // TODO: Implement in Sprint 10
    return { success: false, error: 'Not yet implemented' };
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
