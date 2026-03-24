// ═══════════════════════════════════════════════════════════════════════════════
// CENTRALIZED ERROR HANDLING AND ADMIN NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Error severity levels
 */
const ERROR_SEVERITY = {
  CRITICAL: 'CRITICAL',  // System failure, requires immediate attention
  HIGH: 'HIGH',          // Process failed, user impacted
  MEDIUM: 'MEDIUM',      // Process completed with issues
  LOW: 'LOW'             // Minor issue, logged for review
};

/**
 * Error categories for tracking and reporting
 */
const ERROR_CATEGORY = {
  ALLOCATION: 'Allocation Engine',
  FUTURE_VALUE: 'Future Value Calculation',
  DOCUMENT: 'Document Generation',
  EMAIL: 'Email Delivery',
  DATA_VALIDATION: 'Data Validation',
  PHASE_2: 'Phase 2 Processing',
  PHASE_3: 'Phase 3 Processing',
  REPROCESSING: 'Reprocessing'
};

/**
 * Central error handler with admin notification
 * @param {Object} errorInfo - Error information object
 * @param {string} errorInfo.category - Error category from ERROR_CATEGORY
 * @param {string} errorInfo.severity - Severity level from ERROR_SEVERITY
 * @param {number} errorInfo.rowNum - Row number where error occurred
 * @param {string} errorInfo.operation - Specific operation that failed
 * @param {Error} errorInfo.error - The actual error object
 * @param {Object} errorInfo.context - Additional context (user data, values, etc.)
 * @param {boolean} notifyAdmin - Whether to send email notification
 */
function handleError(errorInfo, notifyAdmin = true) {
  const { category, severity, rowNum, operation, error, context = {} } = errorInfo;
  
  // Always log the error
  Logger.log(`❌ [${severity}] ${category} Error in ${operation}`);
  Logger.log(`   Row: ${rowNum}`);
  Logger.log(`   Error: ${error.message}`);
  if (error.stack) {
    Logger.log(`   Stack: ${error.stack}`);
  }
  
  // Determine if admin notification is needed
  const shouldNotify = notifyAdmin && (
    severity === ERROR_SEVERITY.CRITICAL || 
    severity === ERROR_SEVERITY.HIGH ||
    (severity === ERROR_SEVERITY.MEDIUM && category !== ERROR_CATEGORY.FUTURE_VALUE) // FV errors already have their own notification
  );
  
  if (shouldNotify) {
    try {
      sendAdminErrorNotification(errorInfo);
    } catch (notifyError) {
      Logger.log(`Failed to send admin notification: ${notifyError.message}`);
    }
  }
  
  // Return standardized error response
  return {
    success: false,
    category,
    severity,
    message: error.message,
    rowNum,
    timestamp: new Date().toISOString()
  };
}

/**
 * Send formatted error notification to admin
 * @param {Object} errorInfo - Error information object
 */
function sendAdminErrorNotification(errorInfo) {
  const { category, severity, rowNum, operation, error, context = {} } = errorInfo;
  
  try {
    // Get user information if available
    let userInfo = 'Not available';
    if (rowNum) {
      const { sheet: ws, hdr } = initWS();
      const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
      const fullName = getValue(hdr, rowArr, HEADERS.FULL_NAME) || 'Unknown';
      const email = getValue(hdr, rowArr, HEADERS.EMAIL) || 'No email';
      const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID) || 'Unknown';
      userInfo = `${fullName} (${email}) - Profile: ${profileId}`;
    }
    
    // Format severity with emoji
    const severityEmoji = {
      CRITICAL: '🚨',
      HIGH: '⚠️',
      MEDIUM: '📍',
      LOW: 'ℹ️'
    }[severity] || '❓';
    
    // Build context details
    let contextDetails = '';
    if (Object.keys(context).length > 0) {
      contextDetails = '\n\nAdditional Context:';
      Object.entries(context).forEach(([key, value]) => {
        contextDetails += `\n- ${key}: ${JSON.stringify(value)}`;
      });
    }
    
    // Create email body
    const emailBody = `
${severityEmoji} ${severity} Error Alert

Category: ${category}
Operation: ${operation}
Row: ${rowNum || 'N/A'}
User: ${userInfo}
Timestamp: ${new Date().toLocaleString()}

Error Details:
${error.message}

${error.stack ? `Stack Trace:\n${error.stack}\n` : ''}
${contextDetails}

Quick Actions:
${rowNum ? `- View Row: https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit#gid=0&range=${rowNum}:${rowNum}` : ''}
- Check Logs: View > Stackdriver Logging in Apps Script Editor
- Recent Changes: Check recent commits in git

Recommended Actions by Category:
${getRecommendedActions(category)}
    `.trim();
    
    // Send email
    GmailApp.sendEmail(
      CONFIG.ADMIN_EMAIL,
      `${severityEmoji} [${severity}] ${category} Error - Row ${rowNum || 'N/A'}`,
      emailBody,
      {
        name: 'TruPath Error Monitor',
        replyTo: 'no-reply@trupathmastery.com'
      }
    );
    
    Logger.log(`📧 Admin notified of ${severity} error in ${category}`);
  } catch (e) {
    Logger.log(`Failed to send admin notification: ${e.message}`);
  }
}

/**
 * Get recommended actions based on error category
 * @param {string} category - Error category
 * @returns {string} Recommended actions
 */
function getRecommendedActions(category) {
  const actions = {
    [ERROR_CATEGORY.ALLOCATION]: `
- Check if all required Phase 2 data is present
- Verify income and percentage values are numeric
- Check for profile-specific requirements (ROBS amounts, etc.)
- Verify vehicle caps and limits are correct`,
    
    [ERROR_CATEGORY.FUTURE_VALUE]: `
- Verify timeline values (years) are positive numbers < 99
- Check investment scoring values (should be 1-7)
- Verify monthly contribution amounts are numeric
- Check for division by zero in rate calculations`,
    
    [ERROR_CATEGORY.DOCUMENT]: `
- Check if document template has required merge fields
- Verify all narrative functions are defined
- Check for missing data in required fields
- Verify Google Docs API quotas`,
    
    [ERROR_CATEGORY.EMAIL]: `
- Verify email address format
- Check Gmail API quotas (daily limit: 250 for free accounts)
- Verify attachment sizes (< 25MB total)
- Check if email content has prohibited content`,
    
    [ERROR_CATEGORY.DATA_VALIDATION]: `
- Check form responses for text in numeric fields
- Verify date formats
- Check for special characters in names/emails
- Verify all required fields are populated`,
    
    [ERROR_CATEGORY.PHASE_2]: `
- Verify Phase 2 form submission completed
- Check if Phase 2 link was sent
- Verify profile-specific questions were answered
- Check for timeout or partial submissions`,
    
    [ERROR_CATEGORY.PHASE_3]: `
- Verify Phase 2 data is complete
- Check if allocation engine ran successfully
- Verify FV calculations completed
- Check document generation status`,
    
    [ERROR_CATEGORY.REPROCESSING]: `
- Verify row has Phase 1 and Phase 2 data
- Check if profile ID is valid
- Verify no locks on spreadsheet cells
- Check for circular dependencies`
  };
  
  return actions[category] || '- Review error details and logs for specific issues';
}

/**
 * Validate critical data before processing
 * @param {number} rowNum - Row number to validate
 * @returns {Object} Validation result
 */
function validateRowData(rowNum) {
  const errors = [];
  const warnings = [];
  
  try {
    const { sheet: ws, hdr } = initWS();
    const rowArr = ws.getRange(rowNum, 1, 1, ws.getLastColumn()).getValues()[0];
    
    // Critical fields that must exist
    const requiredFields = [
      { field: HEADERS.FULL_NAME, name: 'Full Name' },
      { field: HEADERS.EMAIL, name: 'Email' },
      { field: HEADERS.PROFILE_ID, name: 'Profile ID' }
    ];
    
    requiredFields.forEach(({ field, name }) => {
      const value = getValue(hdr, rowArr, field);
      if (!value || value === '') {
        errors.push(`Missing required field: ${name}`);
      }
    });
    
    // Validate email format
    const email = getValue(hdr, rowArr, HEADERS.EMAIL);
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push(`Invalid email format: ${email}`);
    }
    
    // Validate numeric fields
    const numericFields = [
      { field: HEADERS.NET_MONTHLY_INCOME, name: 'Net Monthly Income', min: 0 },
      { field: HEADERS.GROSS_ANNUAL_INCOME, name: 'Gross Annual Income', min: 0 },
      { field: HEADERS.CURRENT_AGE, name: 'Current Age', min: 18, max: 100 },
      { field: HEADERS.ALLOCATION_PERCENTAGE, name: 'Allocation Percentage', min: 0, max: 100 }
    ];
    
    numericFields.forEach(({ field, name, min, max }) => {
      const value = getValue(hdr, rowArr, field);
      if (value !== '' && value !== null) {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${name} is not a valid number: ${value}`);
        } else if (min !== undefined && num < min) {
          warnings.push(`${name} is below minimum (${min}): ${num}`);
        } else if (max !== undefined && num > max) {
          warnings.push(`${name} is above maximum (${max}): ${num}`);
        }
      }
    });
    
    // Check for Phase 2 completion if needed
    const hasPhase2Link = getValue(hdr, rowArr, HEADERS.PHASE_2_LINK_SENT);
    const hasPhase2Data = getValue(hdr, rowArr, HEADERS.P2_TIMESTAMP);
    
    if (hasPhase2Link && !hasPhase2Data) {
      warnings.push('Phase 2 link sent but no response received');
    }
    
    // Profile-specific validation
    const profileId = getValue(hdr, rowArr, HEADERS.PROFILE_ID);
    if (profileId && profileId.includes('ROBS')) {
      const robsAmount = getValue(hdr, rowArr, HEADERS.P2_EX_Q6);
      if (!robsAmount || Number(robsAmount) <= 0) {
        warnings.push('ROBS profile but no ROBS amount specified');
      }
    }
    
  } catch (e) {
    errors.push(`Validation error: ${e.message}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    timestamp: new Date().toISOString()
  };
}

/**
 * Wrapper for allocation engine with error handling
 * @param {number} rowNum - Row number to process
 * @returns {Object} Processing result
 */
function runUniversalEngineWithErrorHandling(rowNum) {
  try {
    // Validate data first
    const validation = validateRowData(rowNum);
    if (!validation.valid) {
      const errorInfo = {
        category: ERROR_CATEGORY.DATA_VALIDATION,
        severity: ERROR_SEVERITY.HIGH,
        rowNum,
        operation: 'Pre-allocation validation',
        error: new Error(`Validation failed: ${validation.errors.join(', ')}`),
        context: { validation }
      };
      return handleError(errorInfo);
    }
    
    // Run the allocation engine
    const result = runUniversalEngine(rowNum);
    
    // Post-processing validation
    if (validation.warnings.length > 0) {
      Logger.log(`⚠️ Allocation completed with warnings: ${validation.warnings.join(', ')}`);
    }
    
    return {
      success: true,
      warnings: validation.warnings,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const errorInfo = {
      category: ERROR_CATEGORY.ALLOCATION,
      severity: ERROR_SEVERITY.HIGH,
      rowNum,
      operation: 'runUniversalEngine',
      error,
      context: { 
        function: 'runUniversalEngineWithErrorHandling',
        phase: 'allocation'
      }
    };
    return handleError(errorInfo);
  }
}

/**
 * Wrapper for document generation with error handling
 * @param {number} rowNum - Row number to process
 * @returns {Object} Processing result
 */
function generateDocumentWithErrorHandling(rowNum) {
  try {
    // Attempt document generation
    const docUrl = generateRetirementBlueprintSafe(rowNum);
    
    if (!docUrl) {
      throw new Error('Document generation returned no URL');
    }
    
    return {
      success: true,
      docUrl,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const errorInfo = {
      category: ERROR_CATEGORY.DOCUMENT,
      severity: ERROR_SEVERITY.HIGH,
      rowNum,
      operation: 'generateRetirementBlueprintSafe',
      error,
      context: {
        function: 'generateDocumentWithErrorHandling',
        phase: 'document_generation'
      }
    };
    return handleError(errorInfo);
  }
}

/**
 * Test error handling system
 */
function testErrorHandling() {
  Logger.log('Testing error handling system...');
  
  // Test different severity levels
  const testErrors = [
    {
      category: ERROR_CATEGORY.ALLOCATION,
      severity: ERROR_SEVERITY.CRITICAL,
      rowNum: 999,
      operation: 'Test Critical Error',
      error: new Error('This is a test critical error'),
      context: { test: true }
    },
    {
      category: ERROR_CATEGORY.DATA_VALIDATION,
      severity: ERROR_SEVERITY.MEDIUM,
      rowNum: 999,
      operation: 'Test Medium Error',
      error: new Error('This is a test medium error'),
      context: { test: true }
    }
  ];
  
  testErrors.forEach(errorInfo => {
    handleError(errorInfo, false); // Don't actually send emails in test
    Logger.log(`✅ Tested ${errorInfo.severity} error handling`);
  });
  
  // Test validation
  const validation = validateRowData(3);
  Logger.log(`Validation test result: ${JSON.stringify(validation)}`);
  
  Logger.log('✅ Error handling tests complete');
}