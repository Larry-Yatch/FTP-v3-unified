/**
 * PDFStyles.js - CSS style functions for PDF generation
 *
 * Extracted from PDFGenerator.js for maintainability.
 * Contains all CSS-returning functions used by the PDF pipeline.
 *
 * GAS loads this file before PDFGenerator.js (alphabetically).
 */

const PDFStyles = {

  /**
   * Common styles shared across all PDF reports
   */
  getCommonStyles() {
    return `
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
      h1 { color: ${CONFIG.UI.DARK_BG}; border-bottom: 3px solid ${CONFIG.UI.PRIMARY_COLOR}; padding-bottom: 10px; }
      h2 { color: ${CONFIG.UI.PRIMARY_COLOR}; margin-top: 25px; }
      h3 { color: #4b4166; margin-top: 20px; }
      p { line-height: 1.6; color: #333; margin: 10px 0; }
      ul, ol { margin: 15px 0 15px 25px; }
      li { margin: 8px 0; }
      .header { text-align: center; margin-bottom: 30px; }
      .intro { background: #f5f5f5; padding: 20px; border-left: 4px solid ${CONFIG.UI.PRIMARY_COLOR}; margin: 20px 0; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid ${CONFIG.UI.PRIMARY_COLOR}; font-size: 13px; color: #666; }
      @media print {
        body { padding: 20px; }
        .page-break { page-break-before: always; }
      }
    `;
  },

  /**
   * Tool 4 Financial Freedom Framework styles (purple scheme)
   */
  getTool4Styles() {
    var purple = '#5b4b8a';
    var purpleLight = 'rgba(91, 75, 138, 0.08)';
    var purpleBorder = 'rgba(91, 75, 138, 0.3)';
    var darkPurple = '#4b4166';

    return `
      body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
      h1 { color: #1e192b; border-bottom: 3px solid ${purple}; padding-bottom: 10px; }
      h2 { color: ${purple}; margin-top: 25px; }
      h3 { color: ${darkPurple}; margin-top: 20px; }
      p { line-height: 1.6; color: #333; margin: 10px 0; }
      ul, ol { margin: 15px 0 15px 25px; }
      li { margin: 8px 0; }
      .header { text-align: center; margin-bottom: 30px; }
      .intro { background: ${purpleLight}; padding: 12px 15px; border-left: 3px solid ${purple}; margin: 12px 0; border-radius: 6px; font-size: 13px; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid ${purple}; font-size: 13px; color: #666; }
      @media print {
        body { padding: 20px; }
        .page-break { page-break-before: always; }
      }
      .allocation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
      .allocation-card { background: ${purpleLight}; padding: 10px 12px; border-radius: 6px; border-left: 3px solid ${purple}; }
      .allocation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
      .allocation-name { font-size: 14px; font-weight: 600; color: #333; }
      .allocation-percentage { font-size: 22px; font-weight: 700; color: ${purple}; }
      .allocation-dollars { font-size: 13px; color: #666; margin-top: 2px; }
      .allocation-note { font-size: 12px; color: #555; margin-top: 6px; line-height: 1.4; }
      .priority-box { background: ${purpleLight}; border: 1px solid ${purpleBorder}; padding: 15px; text-align: center; margin: 15px 0; border-radius: 8px; }
      .priority-label { font-size: 12px; text-transform: uppercase; color: ${purple}; margin-bottom: 5px; letter-spacing: 0.5px; }
      .priority-value { font-size: 18px; font-weight: 700; color: ${darkPurple}; }
      .helper-card { background: #f9fafb; border-left: 4px solid ${purple}; padding: 20px; margin: 15px 0; border-radius: 8px; page-break-inside: avoid; }
      .helper-critical { background: #fef2f2; border-left-color: #ef4444; }
      .helper-suggestion { background: #eff6ff; border-left-color: #3b82f6; }
      .helper-title { font-weight: 600; font-size: 16px; margin-bottom: 10px; color: #333; }
      .helper-content { font-size: 14px; line-height: 1.6; color: #555; }
      .helper-action { background: rgba(79, 70, 229, 0.08); padding: 10px; margin-top: 10px; border-radius: 5px; font-weight: 500; color: ${darkPurple}; }
      .insight-section { background: ${purpleLight}; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${purple}; }
      .insight-title { font-size: 16px; font-weight: 600; color: ${purple}; margin-bottom: 15px; }
      .modifier-item { padding: 8px 0; border-bottom: 1px solid #eee; }
      .modifier-item:last-child { border-bottom: none; }
      .trauma-influence { background: ${purpleLight}; padding: 15px; margin: 15px 0; border-left: 3px solid ${purple}; border-radius: 5px; }
      .summary-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
      .summary-table th { background: ${purple}; color: white; padding: 8px 10px; text-align: left; font-size: 12px; }
      .summary-table td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
      .summary-table tr:nth-child(even) { background: ${purpleLight}; }
      .bottom-line-box { background: ${purpleLight}; border: 2px solid ${purpleBorder}; padding: 25px; margin: 25px 0; border-radius: 10px; }
      .bottom-line-box p { color: #333; font-size: 16px; line-height: 1.8; margin: 0; }
      .decision-section { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
      .decision-section h3 { color: ${purple}; margin-top: 0; }
      .decision-section ul { margin: 10px 0 20px 20px; }
      .remember-box { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; margin-top: 20px; }
      .gpt-section { margin: 10px 0; page-break-inside: avoid; }
      .gpt-overview { background: ${purpleLight}; padding: 10px 12px; border-radius: 6px; border-left: 3px solid ${purple}; margin-bottom: 8px; }
      .gpt-overview p { margin: 0 0 6px 0; line-height: 1.4; color: #333; font-size: 13px; }
      .gpt-overview p:last-child { margin-bottom: 0; }
      .strategic-insights { background: #f9fafb; padding: 8px 10px 8px 25px; border-radius: 4px; margin: 8px 0; }
      .strategic-insights li { margin: 5px 0; line-height: 1.4; color: #444; font-size: 13px; }
      .recommendation-box { background: linear-gradient(135deg, ${purpleLight} 0%, rgba(91, 75, 138, 0.12) 100%); padding: 10px 12px; border-radius: 6px; border: 1px solid ${purpleBorder}; margin-top: 8px; }
      .recommendation-box h3 { margin: 0 0 5px 0; font-size: 14px; }
      .recommendation-box p { margin: 0; line-height: 1.4; color: #333; font-size: 13px; }
      .gpt-comparison-synthesis { background: ${purpleLight}; padding: 15px 18px; border-radius: 8px; border-left: 4px solid ${purple}; margin-bottom: 12px; }
      .gpt-comparison-synthesis p { margin: 0 0 10px 0; line-height: 1.5; font-size: 14px; }
      .gpt-comparison-synthesis p:last-child { margin-bottom: 0; }
      .gpt-decision-guidance { background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); padding: 15px 18px; border-radius: 6px; border: 1px solid #c7d2fe; }
      .gpt-decision-guidance p { margin: 0; line-height: 1.5; color: #333; font-size: 14px; }
      .gpt-source-note { font-size: 10px; color: #999; text-align: right; margin-top: 6px; font-style: italic; }
    `;
  },

  /**
   * Integration Report styles (supplements getCommonStyles)
   */
  getIntegrationStyles() {
    return '\n' +
      '.profile-card { background: #f8f6f3; border: 2px solid #ad9168; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }\n' +
      '.profile-name { font-size: 22px; font-weight: 700; color: #ad9168; margin: 10px 0; }\n' +
      '.profile-desc { color: #555; line-height: 1.6; max-width: 600px; margin: 0 auto; }\n' +
      '.warning-box { padding: 12px 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid; }\n' +
      '.warning-critical { background: #fef2f2; border-color: #ef4444; }\n' +
      '.warning-high { background: #fffbeb; border-color: #f59e0b; }\n' +
      '.warning-medium { background: #f9fafb; border-color: #9ca3af; }\n' +
      '.lock-box { background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 15px; margin: 10px 0; }\n' +
      '.lock-belief { padding: 4px 0; font-size: 14px; }\n' +
      '.lock-impact { font-size: 13px; color: #666; margin-top: 8px; font-style: italic; }\n' +
      '.gap-visual { background: #f0f9ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin: 15px 0; }\n' +
      '.synthesis-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; font-size: 15px; line-height: 1.7; }\n' +
      '.action-list { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px 15px 15px 35px; margin: 15px 0; }\n' +
      '.action-list li { margin: 10px 0; line-height: 1.5; }\n' +
      '.source-tag { display: inline-block; background: #f3f4f6; padding: 3px 10px; border-radius: 10px; font-size: 11px; color: #6b7280; margin-top: 5px; }\n' +
      '.source-tag.gpt { background: #dcfce7; color: #16a34a; }\n' +
      '.section-divider { border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; }\n' +
      '.bb-gap-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0; }\n' +
      '.bb-gap-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; color: #555; font-size: 12px; }\n' +
      '.bb-gap-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; }\n' +
      '.missing-section-box { background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0; }\n' +
      '@media print { .page-break { page-break-before: always; } }\n';
  },

  /**
   * Capstone Report styles (supplements getIntegrationStyles)
   */
  getCapstoneStyles() {
    return '\n' +
      '.part-header { background: linear-gradient(135deg, #f8f6f3, #f0ebe3); border: 1px solid #d4c5a9; border-radius: 10px; padding: 20px; margin: 30px 0 15px 0; }\n' +
      '.part-header h2 { color: #ad9168; margin: 0 0 8px 0; font-size: 20px; }\n' +
      '.part-header p { color: #666; margin: 0; line-height: 1.6; font-size: 14px; }\n' +
      '.tool-section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; margin: 12px 0; }\n' +
      '.tool-section-header { font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }\n' +
      '.allocation-bar { display: flex; height: 28px; border-radius: 6px; overflow: hidden; margin: 10px 0; }\n' +
      '.allocation-segment { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 600; }\n' +
      '.tool-insight { background: #f9fafb; border-left: 3px solid #ad9168; padding: 10px 12px; margin: 10px 0; font-size: 13px; color: #555; line-height: 1.5; font-style: italic; }\n' +
      '.metric-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }\n' +
      '.metric-label { color: #555; }\n' +
      '.metric-value { font-weight: 600; color: #374151; }\n' +
      '.cover-page { text-align: center; padding: 40px 30px 20px 30px; }\n' +
      '.cover-completion { font-size: 14px; color: #888; margin-top: 10px; }\n' +
      '.t1-grid { width: 100%; border-collapse: collapse; }\n' +
      '.t1-grid td { width: 50%; padding: 6px 8px; vertical-align: top; }\n' +
      '.domain-row { display: flex; align-items: center; margin: 4px 0; }\n' +
      '.domain-label { width: 55%; font-size: 13px; color: #555; }\n' +
      '.domain-bar { width: 45%; }\n' +
      '.t2-layout { display: flex; gap: 15px; }\n' +
      '.t2-bars { flex: 3; }\n' +
      '.t2-card { flex: 2; background: #f8f6f3; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; font-size: 13px; }\n' +
      '.capstone-insights-list { margin: 12px 0; }\n' +
      '.capstone-insight-item { display: flex; gap: 12px; margin: 12px 0; padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }\n' +
      '.capstone-insight-number { min-width: 28px; height: 28px; background: #ad9168; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }\n' +
      '.capstone-insight-text { color: #374151; line-height: 1.6; font-size: 14px; }\n';
  }

};
