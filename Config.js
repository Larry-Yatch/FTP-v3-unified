/**
 * Configuration for Financial TruPath v3
 *
 * IMPORTANT: Update MASTER_SHEET_ID after creating your v3 Google Sheet
 */

const CONFIG = {
  // Master Spreadsheet ID - v3 Mastersheet
  MASTER_SHEET_ID: '1dEcTk-ODdp4mmYqPl4Du8jgmoUjhpnEjOgFfOOdEznc',

  // Platform Version
  VERSION: '3.0.0',
  DEPLOYMENT: '@v3-001',

  // Sheet Names (do not change - used by core framework)
  SHEETS: {
    SESSIONS: 'SESSIONS',
    RESPONSES: 'RESPONSES',
    TOOL_STATUS: 'TOOL_STATUS',
    TOOL_ACCESS: 'TOOL_ACCESS',
    CROSS_TOOL_INSIGHTS: 'CrossToolInsights',
    INSIGHT_MAPPINGS: 'InsightMappings',
    ACTIVITY_LOG: 'ACTIVITY_LOG',
    ADMINS: 'ADMINS',
    CONFIG: 'CONFIG',
    STUDENTS: 'Students'
  },

  // Tool Access Mode
  ACCESS_MODE: 'linear',  // 'linear' or 'flexible'

  // Session Configuration
  SESSION: {
    DURATION_HOURS: 24,
    AUTO_EXTEND: true,
    MAX_IDLE_MINUTES: 60
  },

  // Auto-save Configuration
  AUTOSAVE: {
    ENABLED: true,
    INTERVAL_SECONDS: 120,  // 2 minutes
    MAX_DRAFTS: 3
  },

  // Insight Configuration
  INSIGHTS: {
    AUTO_ARCHIVE_DAYS: 90,  // Archive insights older than 90 days
    PRIORITY_LEVELS: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  },

  // Admin Configuration
  ADMIN: {
    REQUIRE_APPROVAL: false,  // Require admin approval for new students
    ALLOW_TOOL_UNLOCK: true,  // Allow admins to manually unlock tools
    ALLOW_TOOL_LOCK: true     // Allow admins to lock tools
  },

  // Development/Debug
  DEBUG: {
    ENABLED: false,  // Set to true for verbose logging
    LOG_TO_SHEET: true,
    BYPASS_AUTH: false  // DANGER: Only for testing
  }
};

/**
 * Get configuration value safely
 */
function getConfig(path) {
  const keys = path.split('.');
  let value = CONFIG;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }

  return value;
}

/**
 * Validate configuration
 */
function validateConfig() {
  const errors = [];

  if (CONFIG.MASTER_SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    errors.push('MASTER_SHEET_ID not set in Config.js');
  }

  if (CONFIG.ACCESS_MODE !== 'linear' && CONFIG.ACCESS_MODE !== 'flexible') {
    errors.push('ACCESS_MODE must be "linear" or "flexible"');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
