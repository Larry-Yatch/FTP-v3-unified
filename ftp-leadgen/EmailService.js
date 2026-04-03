'use strict';

/**
 * EmailService.js — Auto-send full report email on lead capture
 */

const EmailService = {

  sendReport(toEmail, toName, winner, scores) {
    try {
      const template = Templates.get(winner);
      if (!template) {
        Logger.log('EmailService: no template for pattern ' + winner);
        return { success: false, error: 'Unknown pattern: ' + winner };
      }

      MailApp.sendEmail({
        to: toEmail,
        subject: CONFIG.EMAIL_SUBJECT,
        htmlBody: this.buildEmailHtml(toName, winner, template, scores),
        name: CONFIG.EMAIL_SENDER_NAME,
        replyTo: CONFIG.EMAIL_REPLY_TO,
      });

      return { success: true };
    } catch (error) {
      Logger.log('EmailService.sendReport error: ' + error);
      return { success: false, error: error.toString() };
    }
  },

  buildEmailHtml(name, winner, template, scores) {
    const patternName = CONFIG.PATTERN_NAMES[winner] || winner;
    const ctaHtml = Templates.getCtaHtml(winner);

    const scoreRows = Object.keys(CONFIG.PATTERN_NAMES).map(function(k) {
      const v = scores[k];
      const isWinner = k === winner;
      return `
        <tr style="${isWinner ? 'background:rgba(179,144,98,0.15);' : ''}">
          <td style="padding:8px 14px; color:${isWinner ? '#b39062' : '#b0a0c0'}; font-weight:${isWinner ? '600' : '400'};">
            ${CONFIG.PATTERN_NAMES[k]}${isWinner ? ' ✦' : ''}
          </td>
          <td style="padding:8px 14px; text-align:right; color:${isWinner ? '#b39062' : '#f0eaf7'}; font-weight:${isWinner ? '700' : '400'};">
            ${v > 0 ? '+' : ''}${v}
          </td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#26103d; font-family:Arial,Helvetica,sans-serif; color:#f0eaf7;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">

    <!-- Header -->
    <div style="text-align:center; padding:32px 0 24px;">
      <img src="${CONFIG.LOGO_URL}" alt="TruPath" style="height:52px; width:auto;">
      <h1 style="font-size:22px; color:#f0eaf7; margin:16px 0 6px; font-family:Georgia,serif;">
        ${CONFIG.TAGLINE}
      </h1>
      <p style="color:#b0a0c0; font-size:15px; margin:0;">Hi ${name},</p>
    </div>

    <!-- Pattern callout -->
    <div style="background:rgba(179,144,98,0.1); border:1px solid rgba(179,144,98,0.35); border-radius:12px; padding:24px 28px; margin-bottom:28px; text-align:center;">
      <p style="color:#b0a0c0; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; margin:0 0 8px;">Your dominant survival strategy</p>
      <h2 style="color:#b39062; font-size:24px; margin:0; font-family:Georgia,serif;">${patternName}</h2>
    </div>

    <!-- Intro -->
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:24px 28px; margin-bottom:24px; line-height:1.7; font-size:15px;">
      ${Templates.commonIntro}
    </div>

    <!-- Pattern detail -->
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:24px 28px; margin-bottom:24px; line-height:1.7; font-size:15px;">
      ${template.content}
    </div>

    <!-- Score table -->
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:24px 28px; margin-bottom:24px;">
      <h3 style="font-size:16px; color:#b39062; margin:0 0 12px;">Your Raw Scores</h3>
      <p style="color:#b0a0c0; font-size:13px; margin:0 0 14px;">Scores range from -25 to +25. Higher numbers indicate a stronger pattern.</p>
      <table style="width:100%; border-collapse:collapse;">
        ${scoreRows}
      </table>
    </div>

    <!-- CTA (inline-styled for email clients) -->
    ${ctaHtml
      .replace(/class="[^"]*"/g, '')
      .replace(/font-family:'Rubik',sans-serif;/g, 'font-family:Arial,Helvetica,sans-serif;')
    }

    <!-- Footer -->
    <div style="text-align:center; padding:24px 0; border-top:1px solid rgba(179,144,98,0.2); margin-top:36px;">
      <p style="color:#7a6a8a; font-size:13px; margin:0 0 6px;">
        Questions? <a href="mailto:${CONFIG.EMAIL_REPLY_TO}" style="color:#b39062;">${CONFIG.EMAIL_REPLY_TO}</a>
      </p>
      <p style="color:#6a5a7a; font-size:12px; margin:4px 0 0;">
        &copy; TruPath. All rights reserved.
      </p>
      <p style="color:#5a4a6a; font-size:11px; margin:6px 0 0; font-style:italic; line-height:1.5;">
        Financial TruPath assessments are for educational and self-awareness purposes only. This is not financial advice. For personalized financial guidance, please consult a qualified financial professional.
      </p>
    </div>

  </div>
</body>
</html>`;
  },

};
