/**
 * ReportStyles - Shared CSS for web reports (Tool1, Tool2, Grounding reports)
 *
 * Reports build HTML as strings via HtmlService.createHtmlOutput(), so they
 * cannot use <?!= include() ?> template directives. These methods return CSS
 * strings for embedding in template literals.
 *
 * Pattern matches PDFGenerator.getCommonStyles() for PDF-specific CSS.
 */

const ReportStyles = {

  /**
   * Base CSS shared by all web reports.
   * Includes: font import, reset, body, report container, header, student info,
   * content typography, footer, action buttons, spinner, print/responsive media queries.
   */
  getBaseCSS() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Rubik', Arial, sans-serif;
        background: linear-gradient(135deg, #4b4166, #1e192b);
        background-attachment: fixed;
        min-height: 100vh;
        padding: 20px;
        color: #fff;
      }

      .report-container {
        max-width: 900px;
        margin: 0 auto;
        background: rgba(20, 15, 35, 0.95);
        border: 1px solid rgba(173, 145, 104, 0.2);
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      }

      .report-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 2px solid #ad9168;
      }

      .logo {
        height: 120px;
        width: auto;
        margin-bottom: 20px;
      }

      .main-title {
        font-family: 'Radley', serif;
        color: #ad9168;
        font-size: 32px;
        margin-bottom: 15px;
        font-weight: 400;
      }

      .student-info {
        font-size: 20px;
        color: #fff;
        margin: 10px 0;
      }

      .student-email {
        font-size: 16px;
        color: #94a3b8;
        margin: 5px 0;
      }

      .date {
        font-size: 14px;
        color: #94a3b8;
        margin-top: 10px;
      }

      .report-content {
        line-height: 1.8;
      }

      .report-content h2 {
        color: #ad9168;
        margin: 30px 0 15px 0;
        font-size: 24px;
      }

      .report-content h3 {
        color: #c4a877;
        margin: 25px 0 12px 0;
        font-size: 20px;
      }

      .report-content p {
        margin: 15px 0;
        color: #e2e8f0;
      }

      .report-content ul {
        margin: 15px 0 15px 30px;
        color: #e2e8f0;
      }

      .report-content li {
        margin: 8px 0;
      }

      .intro-section {
        margin-bottom: 30px;
      }

      .footer-section {
        margin-top: 40px;
        padding-top: 30px;
        border-top: 2px solid rgba(173, 145, 104, 0.3);
        color: #94a3b8;
      }

      .action-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 40px;
        flex-wrap: wrap;
      }

      .btn-primary, .btn-secondary {
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        font-family: 'Rubik', sans-serif;
      }

      .btn-primary {
        background: #ad9168;
        color: #1e192b;
      }

      .btn-primary:hover {
        background: #c4a877;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(173, 145, 104, 0.3);
      }

      .btn-secondary {
        background: transparent;
        color: #ad9168;
        border: 2px solid #ad9168;
      }

      .btn-secondary:hover {
        background: rgba(173, 145, 104, 0.1);
        transform: translateY(-2px);
      }

      .spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid rgba(173, 145, 104, 0.3);
        border-radius: 50%;
        border-top-color: #ad9168;
        animation: reportSpin 1s ease-in-out infinite;
      }

      @keyframes reportSpin {
        to { transform: rotate(360deg); }
      }

      @media print {
        body {
          background: #fff;
          color: #000;
        }
        .report-container {
          background: #fff;
          border: none;
          box-shadow: none;
        }
        .action-buttons {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .report-container {
          padding: 20px;
        }
        .main-title {
          font-size: 24px;
        }
      }
    `;
  },

  /**
   * Loading overlay CSS (full-screen spinner with dots animation).
   * Used by Tool1Report, Tool2Report, and GroundingReport.
   */
  getLoadingCSS() {
    return `
      .loading-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #4b4166, #1e192b);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }

      .loading-overlay.active {
        display: flex;
      }

      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(173, 145, 104, 0.2);
        border-top-color: #ad9168;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .loading-text {
        color: #ad9168;
        font-size: 18px;
        font-weight: 500;
        margin-top: 20px;
        text-align: center;
      }

      .loading-dots {
        display: inline-block;
        width: 20px;
      }

      .loading-dots::after {
        content: '';
        animation: dots 1.5s steps(4, end) infinite;
      }

      @keyframes dots {
        0%, 20% { content: ''; }
        40% { content: '.'; }
        60% { content: '..'; }
        80%, 100% { content: '...'; }
      }
    `;
  },

  /**
   * Loading overlay HTML markup.
   * Returns the <div id="loadingOverlay"> structure for embedding in report HTML.
   */
  getLoadingHTML() {
    return `
      <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          Loading<span class="loading-dots"></span>
        </div>
      </div>
    `;
  }
};
