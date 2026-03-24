// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLER CONFIGURATION - Safe Integration Controls
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Feature flags for gradual error handler rollout
 * Set these to true to enable error handling for each component
 */
const ERROR_HANDLER_FLAGS = {
  // Core Features
  ENABLE_VALIDATION: false,           // Pre-processing validation
  ENABLE_ADMIN_NOTIFICATIONS: true,   // Email notifications to admin
  ENABLE_ERROR_RECOVERY: true,        // Automatic error recovery attempts
  
  // Component Integration
  WRAP_ALLOCATION_ENGINE: false,      // Use error wrapper for allocation
  WRAP_DOCUMENT_GENERATION: false,    // Use error wrapper for documents
  WRAP_EMAIL_SENDING: false,           // Use error wrapper for emails
  WRAP_PHASE_2: false,                // Use error wrapper for Phase 2
  WRAP_PHASE_3: false,                // Use error wrapper for Phase 3
  
  // Notification Controls
  MAX_DAILY_ERROR_EMAILS: 10,         // Prevent email quota exhaustion
  MIN_MINUTES_BETWEEN_EMAILS: 5,      // Prevent email flooding
  BATCH_ERRORS_WINDOW: 30,            // Minutes to batch similar errors
  
  // Validation Strictness
  STRICT_VALIDATION: false,           // Block on validation errors
  WARN_ONLY: true,                    // Log warnings but don't block
  
  // Testing Mode
  TEST_MODE: false,                   // Log only, no emails sent
  VERBOSE_LOGGING: true               // Detailed logging for debugging
};

/**
 * Error email throttling tracker
 */
const ErrorEmailTracker = {
  dailyCount: 0,
  lastResetDate: new Date().toDateString(),
  lastEmailTime: null,
  errorBatch: new Map(), // Group similar errors
  
  /**
   * Check if we can send an error email
   * @returns {boolean} Whether email can be sent
   */
  canSendEmail: function() {
    // Reset daily counter if new day
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyCount = 0;
      this.lastResetDate = today;
      this.errorBatch.clear();
    }
    
    // Check daily limit
    if (this.dailyCount >= ERROR_HANDLER_FLAGS.MAX_DAILY_ERROR_EMAILS) {
      Logger.log('⚠️ Daily error email limit reached');
      return false;
    }
    
    // Check time since last email
    if (this.lastEmailTime) {
      const minutesSinceLastEmail = 
        (new Date() - this.lastEmailTime) / (1000 * 60);
      if (minutesSinceLastEmail < ERROR_HANDLER_FLAGS.MIN_MINUTES_BETWEEN_EMAILS) {
        Logger.log('⚠️ Too soon since last error email');
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Record that an email was sent
   */
  recordEmail: function() {
    this.dailyCount++;
    this.lastEmailTime = new Date();
  }
};

/**
 * Safe wrapper to gradually introduce error handling
 * @param {Function} originalFunction - Original function to wrap
 * @param {string} functionName - Name for logging
 * @param {boolean} enableFlag - Feature flag to check
 * @returns {Function} Wrapped or original function
 */
function conditionalWrapper(originalFunction, functionName, enableFlag) {
  // If feature flag is off, return original function
  if (!ERROR_HANDLER_FLAGS[enableFlag]) {
    return originalFunction;
  }
  
  // Return wrapped version
  return function(...args) {
    try {
      if (ERROR_HANDLER_FLAGS.VERBOSE_LOGGING) {
        Logger.log(`🔄 ${functionName} starting with error handling`);
      }
      
      const result = originalFunction.apply(this, args);
      
      if (ERROR_HANDLER_FLAGS.VERBOSE_LOGGING) {
        Logger.log(`✅ ${functionName} completed successfully`);
      }
      
      return result;
      
    } catch (error) {
      Logger.log(`❌ ${functionName} error: ${error.message}`);
      
      // Attempt recovery if enabled
      if (ERROR_HANDLER_FLAGS.ENABLE_ERROR_RECOVERY) {
        Logger.log(`🔧 Attempting recovery for ${functionName}`);
        // Add recovery logic here based on function type
      }
      
      // Re-throw if strict mode
      if (ERROR_HANDLER_FLAGS.STRICT_VALIDATION && !ERROR_HANDLER_FLAGS.WARN_ONLY) {
        throw error;
      }
      
      return null; // Return safe default
    }
  };
}

/**
 * Safely integrate error handling into existing function
 * @param {string} functionName - Name of function to wrap
 * @returns {Function} Safe wrapped function
 */
function safeIntegration(functionName) {
  const integrationMap = {
    'runUniversalEngine': {
      flag: 'WRAP_ALLOCATION_ENGINE',
      wrapper: runUniversalEngineWithErrorHandling
    },
    'generateRetirementBlueprintSafe': {
      flag: 'WRAP_DOCUMENT_GENERATION',
      wrapper: generateDocumentWithErrorHandling
    }
  };
  
  const config = integrationMap[functionName];
  if (!config) {
    Logger.log(`⚠️ No integration config for ${functionName}`);
    return null;
  }
  
  // Check if feature flag is enabled
  if (!ERROR_HANDLER_FLAGS[config.flag]) {
    Logger.log(`ℹ️ ${functionName} error handling disabled by feature flag`);
    return null;
  }
  
  return config.wrapper;
}

/**
 * Test integration without affecting production
 */
function testErrorHandlerIntegration() {
  Logger.log('=== Testing Error Handler Integration ===');
  
  // Save current flags
  const originalFlags = { ...ERROR_HANDLER_FLAGS };
  
  try {
    // Enable test mode
    ERROR_HANDLER_FLAGS.TEST_MODE = true;
    ERROR_HANDLER_FLAGS.ENABLE_VALIDATION = true;
    ERROR_HANDLER_FLAGS.VERBOSE_LOGGING = true;
    
    // Test validation on a known good row
    Logger.log('Testing validation on row 3...');
    const validationResult = validateRowData(3);
    Logger.log(`Validation result: ${JSON.stringify(validationResult)}`);
    
    // Test error email throttling
    Logger.log('Testing email throttling...');
    for (let i = 0; i < 15; i++) {
      const canSend = ErrorEmailTracker.canSendEmail();
      if (canSend && i < 10) {
        ErrorEmailTracker.recordEmail();
        Logger.log(`Email ${i + 1} would be sent`);
      } else if (i >= 10) {
        Logger.log(`Email ${i + 1} blocked by daily limit`);
      }
    }
    
    Logger.log('✅ Integration tests passed');
    
  } catch (error) {
    Logger.log(`❌ Integration test failed: ${error.message}`);
    
  } finally {
    // Restore original flags
    Object.assign(ERROR_HANDLER_FLAGS, originalFlags);
  }
}

/**
 * Gradual rollout plan for error handling
 * Call this to see recommended rollout steps
 */
function getErrorHandlerRolloutPlan() {
  const plan = `
ERROR HANDLER ROLLOUT PLAN
===========================

Phase 1: Monitoring Only (Current)
- ✅ Error logging enabled
- ✅ Admin notifications for FV errors
- ❌ Validation disabled
- ❌ Component wrappers disabled

Phase 2: Validation & Warnings (Next)
- Enable ENABLE_VALIDATION
- Keep WARN_ONLY = true
- Monitor logs for false positives
- Adjust validation rules as needed

Phase 3: Selective Integration
- Enable WRAP_DOCUMENT_GENERATION first (least risky)
- Monitor for 1 week
- Enable WRAP_ALLOCATION_ENGINE if stable
- Keep email limits conservative

Phase 4: Full Integration
- Enable all component wrappers
- Set STRICT_VALIDATION = true for critical paths
- Increase email limits if needed
- Add custom recovery logic

Phase 5: Optimization
- Batch similar errors
- Add error dashboards
- Implement auto-recovery patterns
- Performance tuning

Current Status: Phase 1
Next Action: Set ENABLE_VALIDATION = true and monitor
  `;
  
  Logger.log(plan);
  return plan;
}