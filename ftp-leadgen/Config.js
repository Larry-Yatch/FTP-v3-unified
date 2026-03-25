'use strict';

/**
 * Config.js — Lead Gen Tool 1 Configuration
 *
 * All environment-specific values live here.
 * Sheet ID is also stored in Script Properties for portability:
 *   Key: LEADS_SHEET_ID
 *   Value: 1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ
 */

const CONFIG = {

  // ── Brand ────────────────────────────────────────────────────────────────────

  TITLE: 'Discover Your Financial Freedom Blueprint',
  BRAND: 'TruPath',
  TAGLINE: 'Discover Your Financial Freedom Blueprint',
  LOGO_URL: 'https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw',
  DISCLAIMER: 'Financial TruPath assessments are for educational and self-awareness purposes only. This is not financial advice. For personalized financial guidance, please consult a qualified financial professional.',

  // ── CTA ──────────────────────────────────────────────────────────────────────

  CTA_URL: 'https://www.trupathmastery.com/trupath',
  CTA_BUTTON_TEXT: 'Discover Your Financial Freedom Blueprint →',

  // ── Course deadline (used for urgency copy) ───────────────────────────────

  DEADLINE: 'April 1st',

  // ── Email ────────────────────────────────────────────────────────────────────

  EMAIL_SENDER_NAME: 'TruPath',
  EMAIL_REPLY_TO: 'admin@trupathmastery.com',
  EMAIL_SUBJECT: 'Your Financial Freedom Blueprint Assessment Results',

  // ── Sheet ────────────────────────────────────────────────────────────────────

  get SHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('LEADS_SHEET_ID')
      || '1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ';
  },

  SHEET_TAB: 'Leads',

  // ── Scoring ──────────────────────────────────────────────────────────────────

  PATTERN_NAMES: {
    FSV:       'False Self-View',
    ExVal:     'External Validation',
    Showing:   'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control:   'Control Leading to Isolation',
    Fear:      'Fear Leading to Isolation',
  },

  // ── Brand palette ────────────────────────────────────────────────────────────

  COLOR_PURPLE: '#361852',
  COLOR_GOLD:   '#b39062',
  COLOR_BLACK:  '#000000',
  COLOR_WHITE:  '#ffffff',

};
