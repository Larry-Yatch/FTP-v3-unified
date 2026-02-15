/**
 * FormatUtils.js - Shared formatting utilities (server-side)
 *
 * Provides consistent currency, percentage, and HTML escaping
 * across all server-side code (reports, narratives, data processing).
 *
 * Client-side code in <script> blocks cannot access this directly —
 * each tool maintains its own client-side formatters.
 */
const FormatUtils = {
  /**
   * Format a number as USD currency string
   * @param {number} amount - The amount to format
   * @returns {string} e.g. "$1,250" or "$0"
   */
  currency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    return '$' + Math.round(amount).toLocaleString();
  },

  /**
   * Format a number as a percentage string
   * @param {number} value - The value to format (e.g. 25 for 25%)
   * @param {number} [decimals=0] - Decimal places
   * @returns {string} e.g. "25%" or "3.5%"
   */
  percentage(value, decimals) {
    decimals = decimals || 0;
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    return (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)) + '%';
  },

  /**
   * Escape HTML entities to prevent XSS
   * @param {string} text - Raw text to escape
   * @returns {string} Escaped HTML-safe string
   */
  escapeHtml(text) {
    if (!text) return '';
    var str = String(text);
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
};
