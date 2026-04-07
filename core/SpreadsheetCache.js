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
  _dataCache: {}, // Cache for sheet data to reduce getDataRange() calls
  _dirtySheets: {}, // Sheets that have been written to but not yet invalidated

  /**
   * Get cached spreadsheet instance
   * @returns {Spreadsheet} Cached spreadsheet object
   */
  getSpreadsheet() {
    // Check if we have a cached instance
    if (this._cache) {
      this._cacheHits++;
      LogUtils.debug(`SpreadsheetCache HIT (${this._cacheHits} hits, ${this._cacheMisses} misses)`);
      return this._cache;
    }

    // Cache miss - open spreadsheet and store it
    this._cacheMisses++;
    LogUtils.debug(`SpreadsheetCache MISS - Opening spreadsheet (${this._cacheHits} hits, ${this._cacheMisses} misses)`);

    try {
      this._cache = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
      return this._cache;
    } catch (error) {
      LogUtils.error('SpreadsheetCache: Error opening spreadsheet: ' + error);
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
   * Get cached sheet data (reduces getDataRange() calls)
   * @param {string} sheetName - Name of the sheet
   * @returns {Array} Sheet data as 2D array
   */
  getSheetData(sheetName) {
    // Check if we have cached data for this sheet
    if (this._dataCache[sheetName]) {
      LogUtils.debug(`SpreadsheetCache: Data cache HIT for ${sheetName}`);
      return this._dataCache[sheetName];
    }

    LogUtils.debug(`SpreadsheetCache: Data cache MISS for ${sheetName}`);
    const sheet = this.getSheet(sheetName);
    if (!sheet) {
      return null;
    }

    // Fetch and cache the data
    const data = sheet.getDataRange().getValues();
    this._dataCache[sheetName] = data;
    return data;
  },

  /**
   * Preload multiple sheets into cache in one call.
   * Use at the start of operations that need several sheets.
   * @param {Array<string>} sheetNames - Array of sheet names to preload
   */
  batchPreload(sheetNames) {
    sheetNames.forEach(name => {
      if (!this._dataCache[name]) {
        this.getSheetData(name);
      }
    });
  },

  /**
   * Invalidate data cache for a specific sheet (call after writes)
   * @param {string} sheetName - Name of the sheet
   */
  invalidateSheetData(sheetName) {
    LogUtils.debug(`SpreadsheetCache: Invalidating data cache for ${sheetName}`);
    delete this._dataCache[sheetName];
  },

  /**
   * Mark a sheet as dirty (written to) without immediately invalidating the cache.
   * The cached data becomes stale but remains usable for reads within the same
   * operation. Call flushDirty() when the operation is complete.
   * @param {string} sheetName - Name of the sheet
   */
  markDirty(sheetName) {
    this._dirtySheets[sheetName] = true;
  },

  /**
   * Invalidate all sheets that were marked dirty.
   * Call this at the end of a multi-step write operation.
   */
  flushDirty() {
    const dirtyNames = Object.keys(this._dirtySheets);
    if (dirtyNames.length > 0) {
      LogUtils.debug(`SpreadsheetCache: Flushing ${dirtyNames.length} dirty sheets: ${dirtyNames.join(', ')}`);
      dirtyNames.forEach(name => {
        delete this._dataCache[name];
      });
      this._dirtySheets = {};
    }
  },

  /**
   * Clear cache (called automatically at end of request, or manually for testing)
   */
  clearCache() {
    LogUtils.debug(`SpreadsheetCache: Clearing cache (${this._cacheHits} hits, ${this._cacheMisses} misses)`);
    this._cache = null;
    this._dataCache = {};
    this._dirtySheets = {};
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
      isCached: this._cache !== null,
      dirtySheets: Object.keys(this._dirtySheets)
    };
  }
};
