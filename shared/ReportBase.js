/**
 * ReportBase - Shared utility for report data retrieval
 * Provides common methods for fetching and processing tool results from the RESPONSES sheet
 */

const ReportBase = {
  /**
   * Get the spreadsheet and RESPONSES sheet
   * @returns {Object} { ss, responseSheet }
   */
  getSheet() {
    const ss = SpreadsheetCache.getSpreadsheet();
    const responseSheet = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    return { ss, responseSheet };
  },

  /**
   * Get headers and column indexes from sheet
   * @param {Sheet} responseSheet - The RESPONSES sheet
   * @returns {Object} Headers array and column indexes
   */
  getHeaders(responseSheet) {
    const data = responseSheet.getDataRange().getValues();
    const headers = data[0];

    return {
      data: data,
      headers: headers,
      clientIdCol: headers.indexOf('Client_ID'),
      toolIdCol: headers.indexOf('Tool_ID'),
      dataCol: headers.indexOf('Data') !== -1 ? headers.indexOf('Data') : headers.indexOf('Version'),
      isLatestCol: headers.indexOf('Is_Latest'),
      timestampCol: headers.indexOf('Timestamp')
    };
  },

  /**
   * Find the latest row for a specific client and tool
   * @param {Array} data - Sheet data
   * @param {Object} columnIndexes - Column indexes
   * @param {string} clientId - Client ID to search for
   * @param {string} toolId - Tool ID to search for
   * @param {boolean} checkIsLatest - Whether to check the Is_Latest flag
   * @returns {Array|null} The row data or null if not found
   */
  findLatestRow(data, columnIndexes, clientId, toolId, checkIsLatest = false) {
    const { clientIdCol, toolIdCol, isLatestCol } = columnIndexes;

    // Search backward from end to find most recent
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const clientMatch = row[clientIdCol] === clientId;
      const toolMatch = row[toolIdCol] === toolId;
      const isLatestMatch = !checkIsLatest || row[isLatestCol] === true;

      if (clientMatch && toolMatch && isLatestMatch) {
        return row;
      }
    }

    return null;
  },

  /**
   * Generic method to get results for a tool
   * @param {string} clientId - Client ID
   * @param {string} toolId - Tool ID
   * @param {Function} parseFunction - Function to parse the row data into result object
   * @param {boolean} checkIsLatest - Whether to check Is_Latest flag (default: false)
   * @returns {Object|null} Parsed results or null
   */
  getResults(clientId, toolId, parseFunction, checkIsLatest = false) {
    try {
      const { responseSheet } = this.getSheet();
      const columnIndexes = this.getHeaders(responseSheet);
      const { data, dataCol } = columnIndexes;

      const row = this.findLatestRow(data, columnIndexes, clientId, toolId, checkIsLatest);

      if (row) {
        const resultData = JSON.parse(row[dataCol]);
        return parseFunction(resultData, clientId);
      }

      return null;
    } catch (error) {
      Logger.log(`Error getting results for ${toolId}: ${error}`);
      return null;
    }
  },

  /**
   * Get all results for a client (all tools)
   * @param {string} clientId - Client ID
   * @returns {Array} Array of result objects with toolId
   */
  getAllResults(clientId) {
    try {
      const { responseSheet } = this.getSheet();
      const columnIndexes = this.getHeaders(responseSheet);
      const { data, clientIdCol, toolIdCol, dataCol, isLatestCol } = columnIndexes;

      const results = [];

      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        if (row[clientIdCol] === clientId && row[isLatestCol] === true) {
          try {
            const resultData = JSON.parse(row[dataCol]);
            results.push({
              toolId: row[toolIdCol],
              data: resultData
            });
          } catch (parseError) {
            Logger.log(`Error parsing row ${i}: ${parseError}`);
          }
        }
      }

      return results;
    } catch (error) {
      Logger.log(`Error getting all results: ${error}`);
      return [];
    }
  }
};
