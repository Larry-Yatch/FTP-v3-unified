'use strict';

/**
 * Config.js — Lead Gen Tool 1 Configuration
 *
 * All environment-specific values in one place.
 * The sheet ID is stored in Script Properties (not hardcoded) for portability.
 * Set via: File → Project Properties → Script Properties
 *   Key: LEADS_SHEET_ID
 *   Value: 1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ
 */

const CONFIG = {

  // ── Deployment ──────────────────────────────────────────────────────────────

  TITLE: 'Financial Pattern Assessment',
  BRAND: 'TruPath',
  LOGO_URL: 'https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw',

  // ── CTA ─────────────────────────────────────────────────────────────────────

  CTA_URL: 'https://www.trupathmastery.com/trupath',
  CTA_BUTTON_TEXT: 'Learn More About TruPath',

  // ── Email ───────────────────────────────────────────────────────────────────

  EMAIL_SENDER_NAME: 'TruPath',
  EMAIL_REPLY_TO: 'admin@trupathmastery.com',
  EMAIL_SUBJECT: 'Your Financial Pattern Assessment Results',

  // ── Sheet ───────────────────────────────────────────────────────────────────

  get SHEET_ID() {
    // Falls back to hardcoded ID if Script Property isn't set
    return PropertiesService.getScriptProperties().getProperty('LEADS_SHEET_ID')
      || '1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ';
  },

  SHEET_TAB: 'Leads',

  // ── Scoring ─────────────────────────────────────────────────────────────────

  PATTERN_NAMES: {
    FSV:       'False Self-View',
    ExVal:     'External Validation',
    Showing:   'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control:   'Control Leading to Isolation',
    Fear:      'Fear Leading to Isolation',
  },

  // ── UI ──────────────────────────────────────────────────────────────────────

  ACCENT_COLOR: '#ad9168',
  DARK_BG: '#1e192b',
  FONT_HEADING: "'Radley', Georgia, serif",
  FONT_BODY: "'Rubik', sans-serif",

};
