'use strict';

/**
 * FollowUpService.js — Batch follow-up email sender
 *
 * Reads all leads from the Leads sheet and sends the appropriate
 * follow-up email (Email 2 or Email 3) to each one.
 *
 * Column mapping (1-indexed, matches DataService.saveLead):
 *   1  Timestamp
 *   2  Name
 *   3  Email
 *   4  Primary_Pattern (winner key, e.g. "FSV", "ExVal")
 *   5  Score: FSV
 *   6  Score: ExVal
 *   7  Score: Showing
 *   8  Score: Receiving
 *   9  Score: Control
 *   10 Score: Fear
 *   11 Responses JSON
 *   12 Source
 */

const FollowUpService = {

  // Column indices (1-based, matching DataService.saveLead row order)
  COL_NAME:    2,
  COL_EMAIL:   3,
  COL_PATTERN: 4,

  /**
   * Send follow-up email (2 or 3) to all leads in the sheet.
   * Safe to run multiple times — GAS MailApp quota will be the limiting factor.
   *
   * @param {number} emailNum  2 or 3
   */
  sendFollowUp(emailNum) {
    Logger.log('FollowUpService.sendFollowUp START — emailNum=' + emailNum);

    let sheet;
    try {
      sheet = DataService.getSheet();
    } catch (err) {
      Logger.log('FollowUpService: could not open sheet — ' + err);
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('FollowUpService: no leads found (sheet has ' + lastRow + ' rows).');
      return;
    }

    // Read all data rows at once (skip header row 1)
    const numRows = lastRow - 1;
    const numCols = 12;
    const data = sheet.getRange(2, 1, numRows, numCols).getValues();

    let sent = 0;
    let failed = 0;

    data.forEach(function(row, idx) {
      const rowNum = idx + 2; // actual sheet row for logging
      const name    = String(row[FollowUpService.COL_NAME    - 1] || '').trim();
      const email   = String(row[FollowUpService.COL_EMAIL   - 1] || '').trim();
      const pattern = String(row[FollowUpService.COL_PATTERN - 1] || '').trim();

      if (!email) {
        Logger.log('Row ' + rowNum + ': no email — skipping.');
        return;
      }

      try {
        const { subject, htmlBody } = FollowUpService.buildFollowUpEmail(emailNum, name, pattern);

        MailApp.sendEmail({
          to: email,
          subject: subject,
          htmlBody: htmlBody,
          name: CONFIG.EMAIL_SENDER_NAME,
          replyTo: CONFIG.EMAIL_REPLY_TO,
        });

        Logger.log('Row ' + rowNum + ': sent Email ' + emailNum + ' → ' + email + ' (' + pattern + ')');
        sent += 1;
      } catch (err) {
        Logger.log('Row ' + rowNum + ': FAILED to send Email ' + emailNum + ' → ' + email + ' — ' + err);
        failed += 1;
      }
    });

    Logger.log(
      'FollowUpService.sendFollowUp DONE — emailNum=' + emailNum +
      ' | sent=' + sent + ' | failed=' + failed
    );
  },

  /**
   * Build the subject + htmlBody for a follow-up email.
   *
   * Lookup order:
   *   1. CONFIG.FOLLOW_UP_EMAILS[emailNum][pattern]  — pattern-specific copy
   *   2. CONFIG.FOLLOW_UP_EMAILS[emailNum]['generic'] — generic fallback
   *   3. Hard-coded emergency fallback
   *
   * @param {number} emailNum  2 or 3
   * @param {string} name      Lead's name
   * @param {string} pattern   Primary_Pattern key (e.g. "FSV")
   * @returns {{ subject: string, htmlBody: string }}
   */
  buildFollowUpEmail(emailNum, name, pattern) {
    const emailsMap = (CONFIG.FOLLOW_UP_EMAILS || {})[emailNum] || {};

    // Prefer pattern-specific copy; fall back to generic
    // Values are HTML strings (not objects — subjects live in FOLLOW_UP_SUBJECT_2/3)
    const template = emailsMap[pattern] || emailsMap['generic'] || null;

    let subject;
    let body;

    if (template) {
      // Subjects are now pattern-keyed objects in CONFIG.FOLLOW_UP_SUBJECT_2/3
      const subjectKey = emailNum === 2 ? 'FOLLOW_UP_SUBJECT_2' : 'FOLLOW_UP_SUBJECT_3';
      const subjectMap = CONFIG[subjectKey] || {};
      subject = subjectMap[pattern] || subjectMap['generic'] || 'A message from TruPath';
      // Allow {name} placeholder in copy
      body = template.replace(/\{name\}/g, name || 'there');
    } else {
      // Emergency fallback
      const subjectKey = emailNum === 2 ? 'FOLLOW_UP_SUBJECT_2' : 'FOLLOW_UP_SUBJECT_3';
      const subjectMap = CONFIG[subjectKey] || {};
      subject = (typeof subjectMap === 'object' ? subjectMap['generic'] : subjectMap) || 'A message from TruPath';
      body = FollowUpService._fallbackBody(emailNum, name);
    }

    return { subject, htmlBody: body };
  },

  /**
   * Emergency plain fallback. Replace once real copy is ready.
   * @private
   */
  _fallbackBody(emailNum, name) {
    return `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:auto; color:#222;">
        <p>Hi ${name || 'there'},</p>
        <p>This is follow-up email ${emailNum} from TruPath.</p>
        <p>(Email copy coming soon — check back shortly!)</p>
        <p>— The TruPath Team</p>
      </div>
    `;
  },
};
