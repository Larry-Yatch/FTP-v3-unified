'use strict';

/**
 * DataService.js — Lead storage + short-lived draft storage
 *
 * Anonymous GAS web apps cannot rely on UserProperties in a meaningful way,
 * so draft state is stored in Script Properties and keyed by a random session
 * token. Good enough for a lean lead magnet deployment.
 */

const DataService = {
  DRAFT_PREFIX: 'leadgen_draft_',
  _sheet: null,

  getSheet() {
    if (!this._sheet) {
      const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.SHEET_TAB);
      if (!sheet) {
        sheet = ss.getSheets()[0] || ss.insertSheet(CONFIG.SHEET_TAB);
        sheet.setName(CONFIG.SHEET_TAB);
      }
      this._sheet = sheet;
    }
    return this._sheet;
  },

  saveLead(name, email, winner, scores, formData, source) {
    try {
      const sheet = this.getSheet();
      const row = [[
        new Date().toISOString(),
        name,
        email,
        winner,
        scores.FSV,
        scores.ExVal,
        scores.Showing,
        scores.Receiving,
        scores.Control,
        scores.Fear,
        JSON.stringify(formData),
        source || '',
      ]];

      const nextRow = Math.max(sheet.getLastRow() + 1, 2);
      sheet.getRange(nextRow, 1, 1, row[0].length).setValues(row);
      return { success: true };
    } catch (error) {
      Logger.log('DataService.saveLead error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  getDraft(token) {
    try {
      if (!token) return null;
      const raw = PropertiesService.getScriptProperties().getProperty(this.DRAFT_PREFIX + token);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      Logger.log('DataService.getDraft error: ' + error);
      return null;
    }
  },

  saveDraft(token, patch) {
    try {
      if (!token) return false;
      const existing = this.getDraft(token) || {};
      const merged = Object.assign({}, existing, patch, {
        _lastUpdatedAt: new Date().toISOString(),
      });
      PropertiesService.getScriptProperties().setProperty(
        this.DRAFT_PREFIX + token,
        JSON.stringify(merged)
      );
      return true;
    } catch (error) {
      Logger.log('DataService.saveDraft error: ' + error);
      return false;
    }
  },

  clearDraft(token) {
    try {
      if (!token) return;
      PropertiesService.getScriptProperties().deleteProperty(this.DRAFT_PREFIX + token);
    } catch (error) {
      Logger.log('DataService.clearDraft error: ' + error);
    }
  },
};
