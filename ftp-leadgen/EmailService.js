'use strict';

/**
 * EmailService.js — Auto-send report to lead's email address
 *
 * Sends a formatted HTML email with the full report content
 * immediately after the lead submits their name + email.
 */

const EmailService = {

  /**
   * Send the full report email to the lead.
   * @param {string} toEmail
   * @param {string} toName
   * @param {string} winner — pattern key
   * @param {Object} scores
   */
  sendReport(toEmail, toName, winner, scores) {
    try {
      const template = Templates.get(winner);
      if (!template) {
        Logger.log('EmailService: no template for pattern ' + winner);
        return { success: false, error: 'Unknown pattern: ' + winner };
      }

      const subject = CONFIG.EMAIL_SUBJECT;
      const html = this.buildEmailHtml(toName, winner, template, scores);

      MailApp.sendEmail({
        to: toEmail,
        subject: subject,
        htmlBody: html,
        name: CONFIG.EMAIL_SENDER_NAME,
        replyTo: CONFIG.EMAIL_REPLY_TO,
      });

      return { success: true };
    } catch (e) {
      Logger.log('EmailService.sendReport error: ' + e);
      return { success: false, error: e.toString() };
    }
  },

  /**
   * Build the email HTML
   */
  buildEmailHtml(name, winner, template, scores) {
    const patternName = CONFIG.PATTERN_NAMES[winner] || winner;
    const ctaHtml = Templates.salesCta
      .replace(/\{\{CTA_URL\}\}/g, CONFIG.CTA_URL)
      .replace(/\{\{CTA_BUTTON_TEXT\}\}/g, CONFIG.CTA_BUTTON_TEXT);

    // Score rows
    const scoreRows = Object.entries(scores).map(([k, v]) => {
      const isWinner = k === winner;
      return `
        <tr style="${isWinner ? 'background: rgba(173,145,104,0.15);' : ''}">
          <td style="padding: 8px 14px; color: ${isWinner ? '#ad9168' : '#94a3b8'}; font-weight: ${isWinner ? '600' : '400'};">
            ${CONFIG.PATTERN_NAMES[k]}${isWinner ? ' ✦' : ''}
          </td>
          <td style="padding: 8px 14px; text-align: right; color: ${isWinner ? '#ad9168' : '#e2e8f0'}; font-weight: ${isWinner ? '700' : '400'};">
            ${v > 0 ? '+' : ''}${v}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background: #0f0d17; font-family: Arial, Helvetica, sans-serif; color: #e2e8f0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

          <!-- Header -->
          <div style="text-align: center; padding: 32px 0 24px;">
            <img src="${CONFIG.LOGO_URL}" alt="TruPath" style="height: 52px; width: auto;">
            <h1 style="font-size: 22px; color: #e2e8f0; margin: 16px 0 6px; font-family: Georgia, serif;">
              Your Financial Pattern Assessment Results
            </h1>
            <p style="color: #94a3b8; font-size: 15px; margin: 0;">Hi ${name},</p>
          </div>

          <!-- Primary pattern callout -->
          <div style="background: rgba(173,145,104,0.1); border: 1px solid rgba(173,145,104,0.3); border-radius: 12px; padding: 24px 28px; margin-bottom: 28px; text-align: center;">
            <p style="color: #94a3b8; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 8px;">Your dominant pattern</p>
            <h2 style="color: #ad9168; font-size: 24px; margin: 0; font-family: Georgia, serif;">${patternName}</h2>
          </div>

          <!-- Intro -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px 28px; margin-bottom: 24px; line-height: 1.7; font-size: 15px;">
            ${Templates.commonIntro}
          </div>

          <!-- Pattern detail -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px 28px; margin-bottom: 24px; line-height: 1.7; font-size: 15px;">
            ${template.content}
          </div>

          <!-- Score table -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px 28px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #ad9168; margin: 0 0 16px;">Your Raw Scores</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 14px;">Scores range from -25 to +25. Higher numbers indicate a stronger pattern.</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${scoreRows}
            </table>
          </div>

          <!-- CTA -->
          ${ctaHtml.replace(/class="btn btn-primary"/g, 'style="display: inline-block; background: #ad9168; color: #1e192b; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;"')}

          <!-- Footer -->
          <div style="text-align: center; padding: 24px 0; border-top: 1px solid rgba(173,145,104,0.2); margin-top: 36px;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 6px;">
              Questions? <a href="mailto:${CONFIG.EMAIL_REPLY_TO}" style="color: #ad9168;">${CONFIG.EMAIL_REPLY_TO}</a>
            </p>
            <p style="color: #475569; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} TruPath. All rights reserved.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  },

};
