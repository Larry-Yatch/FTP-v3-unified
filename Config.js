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

  // Tool Definitions
  TOOLS: {
    TOOL1: {
      ID: 'tool1',
      NAME: 'Core Trauma Strategy Assessment',
      PAGES: 5,
      QUESTIONS: 26
    },
    TOOL2: {
      ID: 'tool2',
      NAME: 'Financial Clarity & Values Assessment',
      PAGES: 5,
      QUESTIONS: 30
    },
    TOOL3: {
      ID: 'tool3',
      NAME: 'Tool 3',
      PAGES: 1,
      QUESTIONS: 0
    },
    TOOL4: {
      ID: 'tool4',
      NAME: 'Tool 4',
      PAGES: 1,
      QUESTIONS: 0
    },
    TOOL5: {
      ID: 'tool5',
      NAME: 'Tool 5',
      PAGES: 1,
      QUESTIONS: 0
    },
    TOOL6: {
      ID: 'tool6',
      NAME: 'Tool 6',
      PAGES: 1,
      QUESTIONS: 0
    },
    TOOL7: {
      ID: 'tool7',
      NAME: 'Tool 7',
      PAGES: 1,
      QUESTIONS: 0
    },
    TOOL8: {
      ID: 'tool8',
      NAME: 'Tool 8',
      PAGES: 1,
      QUESTIONS: 0
    }
  },

  // Column Indexes for Sheets
  COLUMN_INDEXES: {
    STUDENTS: {
      CLIENT_ID: 0,
      NAME: 1,
      EMAIL: 2,
      STATUS: 3
    },
    RESPONSES: {
      TIMESTAMP: 0,
      CLIENT_ID: 1,
      TOOL_ID: 2,
      DATA: 3,
      STATUS: 4,
      IS_LATEST: 5
    }
  },

  // Column Names (for header lookups)
  COLUMN_NAMES: {
    CLIENT_ID: 'Client_ID',
    TOOL_ID: 'Tool_ID',
    DATA: 'Data',
    STATUS: 'Status',
    IS_LATEST: 'Is_Latest',
    TIMESTAMP: 'Timestamp',
    VERSION: 'Version'
  },

  // Timing Configuration
  TIMING: {
    GPT_RETRY_DELAY_MS: 2000,
    SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
    AUTOSAVE_INTERVAL_MS: 2 * 60 * 1000,     // 2 minutes
    MAX_REQUEST_TIMEOUT_MS: 120000            // 2 minutes
  },

  // UI Theme
  UI: {
    PRIMARY_COLOR: '#ad9168',
    PRIMARY_COLOR_RGB: 'rgba(173, 145, 104, 0.1)',
    DARK_BG: '#1e192b',
    BORDER_RADIUS: '10px',
    BUTTON_BORDER_RADIUS: '6px'
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
