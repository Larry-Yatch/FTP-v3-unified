/**
 * LogUtils.js - Centralized logging with debug toggle
 *
 * debug() calls are suppressed when DEBUG is false, eliminating
 * overhead from ~950 log statements across the codebase.
 *
 * Toggle via admin dashboard or call LogUtils.init() at request start
 * to read the persistent setting from PropertiesService.
 */
const LogUtils = {
  DEBUG: false,
  _initialized: false,

  /**
   * Read DEBUG flag from PropertiesService (call once per request)
   */
  init() {
    if (this._initialized) return;
    try {
      this.DEBUG = PropertiesService.getScriptProperties().getProperty('DEBUG_LOGGING') === 'true';
    } catch (e) {
      // PropertiesService unavailable — keep default (false)
    }
    this._initialized = true;
  },

  /**
   * Toggle DEBUG flag and persist to PropertiesService
   * @returns {Object} { enabled: boolean }
   */
  toggle() {
    try {
      const props = PropertiesService.getScriptProperties();
      const current = props.getProperty('DEBUG_LOGGING') === 'true';
      const next = !current;
      props.setProperty('DEBUG_LOGGING', String(next));
      this.DEBUG = next;
      return { success: true, enabled: next };
    } catch (e) {
      return { success: false, error: e.toString() };
    }
  },

  /**
   * Get current DEBUG status from PropertiesService
   * @returns {Object} { enabled: boolean }
   */
  getStatus() {
    try {
      const enabled = PropertiesService.getScriptProperties().getProperty('DEBUG_LOGGING') === 'true';
      return { success: true, enabled: enabled };
    } catch (e) {
      return { success: false, enabled: false, error: e.toString() };
    }
  },

  debug(msg) {
    if (this.DEBUG) console.log(msg);
  },

  info(msg) {
    console.log(msg);
  },

  warn(msg) {
    console.warn(msg);
  },

  error(msg) {
    console.error(msg);
  }
};
