/**
 * SpreadsheetCache.js - Caching layer for Google Sheets access
 *
 * PROBLEM SOLVED:
 * - HTTP 429 (Too Many Requests) errors caused by excessive SpreadsheetApp.openById() calls
 * - Each request was opening the spreadsheet 5-10+ times for different operations
 * - Google has strict rate limits on these API calls
 *
 * SOLUTION:
 * - Cache the Spreadsheet object in script properties (per execution context)
 * - Reuse the same spreadsheet instance throughout a single request
 * - Automatically flushes cache at end of request
 *
 * USAGE:
 * Replace: SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID)
 * With:    SpreadsheetCache.getSpreadsheet()
 */

const SpreadsheetCache = {

  _cache: null,
  _cacheHits: 0,
  _cacheMisses: 0,

  /**
   * Get cached spreadsheet instance
   * @returns {Spreadsheet} Cached spreadsheet object
   */
  getSpreadsheet() {
    // Check if we have a cached instance
    if (this._cache) {
      this._cacheHits++;
      console.log(`SpreadsheetCache HIT (${this._cacheHits} hits, ${this._cacheMisses} misses)`);
      return this._cache;
    }

    // Cache miss - open spreadsheet and store it
    this._cacheMisses++;
    console.log(`SpreadsheetCache MISS - Opening spreadsheet (${this._cacheHits} hits, ${this._cacheMisses} misses)`);

    try {
      this._cache = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      return this._cache;
    } catch (error) {
      console.error('SpreadsheetCache: Error opening spreadsheet:', error);
      throw error;
    }
  },

  /**
   * Get a specific sheet by name (convenience method)
   * @param {string} sheetName - Name of the sheet
   * @returns {Sheet|null} Sheet object or null if not found
   */
  getSheet(sheetName) {
    const ss = this.getSpreadsheet();
    return ss.getSheetByName(sheetName);
  },

  /**
   * Clear cache (called automatically at end of request, or manually for testing)
   */
  clearCache() {
    console.log(`SpreadsheetCache: Clearing cache (${this._cacheHits} hits, ${this._cacheMisses} misses)`);
    this._cache = null;
    this._cacheHits = 0;
    this._cacheMisses = 0;
  },

  /**
   * Get cache statistics (for debugging)
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      hits: this._cacheHits,
      misses: this._cacheMisses,
      hitRate: this._cacheMisses === 0 ? 0 : (this._cacheHits / (this._cacheHits + this._cacheMisses) * 100).toFixed(1) + '%',
      isCached: this._cache !== null
    };
  }
};
