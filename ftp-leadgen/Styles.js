'use strict';

/**
 * Styles.js — Lead Gen styles
 *
 * Foundation: FTP-v3 shared/styles.html design system (copied tokens, layout, components)
 * Brand palette: #1e192b bg, #4b4166 gradient, #ad9168 gold (FTP-v3 system)
 *                #361852 / #b39062 per Steve's brand brief — blended as appropriate
 *
 * Logo size: 120px height (matching GroundingReport.js standard)
 */

const Styles = {

  getBase() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Radley:wght@400&family=Rubik:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      :root {
        --bg:           #1e192b;
        --bg-gradient:  linear-gradient(135deg, #4b4166, #1e192b);
        --card:         rgba(20, 15, 35, 0.9);
        --muted:        #94a3b8;
        --text:         #ffffff;
        --gold:         #ad9168;
        --gold-light:   #c4a877;
        --border:       rgba(173, 145, 104, 0.2);
        --bad:          #ef4444;
        --ok:           #9ae6b4;
        --radius-card:  20px;
        --radius-btn:   50px;
        --radius-input: 50px;
      }

      html, body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        background: var(--bg-gradient);
        background-attachment: fixed;
        color: var(--text);
        font-family: 'Rubik', Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      /* Subtle TruPath watermark — matches main app */
      body::before {
        content: '';
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-image: url('https://lh3.googleusercontent.com/d/1FWWkcJ77rtbkLGstB1LHHGHEENaM5JZj');
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 90%;
        opacity: 0.04;
        z-index: -1;
        pointer-events: none;
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: 'Radley', serif;
        font-weight: 400;
        color: var(--text);
        margin-top: 0;
      }

      h1 { font-size: clamp(24px, 4vw, 35px); margin-bottom: 16px; letter-spacing: 0.5px; }
      h2 { font-size: clamp(20px, 3vw, 26px); margin-bottom: 20px; color: var(--gold); }
      h3 { font-size: 20px; margin-bottom: 14px; color: var(--gold); }

      p  { margin: 0 0 14px; }
      ul, ol { padding-left: 24px; margin-bottom: 14px; }
      li { margin-bottom: 6px; }
      a  { color: var(--gold); }

      /* ── Layout ── */
      .container {
        max-width: 760px;
        margin: 0 auto;
        padding: 20px 20px 60px;
      }

      /* ── Page header / logo ── */
      .page-header {
        text-align: center;
        padding: 32px 0 24px;
      }

      .page-header .logo {
        height: 120px;
        width: auto;
        margin: 0 auto 20px;
        display: block;
      }

      .tagline {
        font-family: 'Radley', serif;
        font-size: 18px;
        color: var(--gold);
        font-style: italic;
        margin: 0 0 6px;
        letter-spacing: 0.3px;
      }

      /* ── Card ── */
      .card {
        background: var(--card);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--border);
        border-radius: var(--radius-card);
        padding: 28px 32px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        margin-bottom: 20px;
        animation: zoomIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes zoomIn {
        0%   { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }

      /* ── Progress ── */
      .step-label {
        font-size: 13px;
        color: var(--muted);
        margin-bottom: 6px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        text-align: center;
      }

      .progress-bar {
        height: 8px;
        background: rgba(173, 145, 104, 0.15);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 28px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--gold), #188bf6);
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      /* ── Form elements ── */
      .form-group { margin-bottom: 20px; }

      .form-label {
        display: block;
        font-size: 14px;
        color: var(--text);
        font-weight: 500;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      select,
      input[type="text"],
      input[type="email"],
      input[type="number"] {
        width: 100%;
        padding: 12px 20px;
        border-radius: var(--radius-input);
        border: 1px solid var(--border);
        background: rgba(20, 15, 35, 0.6);
        color: var(--text);
        font-size: 14px;
        font-family: 'Rubik', Arial, sans-serif;
        transition: border-color 0.3s, background 0.3s;
        -webkit-appearance: none;
        appearance: none;
        outline: none;
      }

      select:focus,
      input:focus {
        border-color: var(--gold);
        background: rgba(20, 15, 35, 0.85);
        box-shadow: 0 0 0 3px rgba(173, 145, 104, 0.15);
      }

      select option { background: #1e192b; color: var(--text); }
      input::placeholder { color: var(--muted); }

      /* Disabled option in ranking selects */
      select option:disabled { color: rgba(148, 163, 184, 0.4); }

      /* Number ranking inputs — remove browser spinner, constrain width */
      input[type="number"].ranking-input {
        width: 100px;
        text-align: center;
        -moz-appearance: textfield;
      }
      input[type="number"].ranking-input::-webkit-inner-spin-button,
      input[type="number"].ranking-input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Ranking row — label left, input right */
      .ranking-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .ranking-row .form-label {
        flex: 1;
        margin-bottom: 0;
      }

      /* ── Buttons ── */
      .btn {
        appearance: none;
        -webkit-appearance: none;
        display: inline-block;
        padding: 12px 28px;
        border-radius: var(--radius-btn);
        font-family: 'Rubik', Arial, sans-serif;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        border: 2px solid var(--gold);
        background: transparent;
        color: var(--gold);
        text-align: center;
        text-decoration: none;
        letter-spacing: 0.3px;
        transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
                    background 250ms ease,
                    color 250ms ease;
        will-change: transform;
      }

      .btn:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }

      .btn:active:not(:disabled) {
        transform: translateY(0) scale(0.98);
      }

      .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none !important;
      }

      .btn-primary {
        background: var(--gold);
        color: #140f23;
        border-color: var(--gold);
        width: 100%;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--gold-light);
        border-color: var(--gold-light);
      }

      .btn-secondary {
        background: transparent;
        color: var(--gold);
        border: 2px solid var(--gold);
        width: auto;
      }

      .btn-secondary:hover:not(:disabled) {
        background: rgba(173, 145, 104, 0.15);
      }

      /* ── Alerts ── */
      .alert-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #fca5a5;
        border-radius: 12px;
        padding: 14px 20px;
        margin-bottom: 20px;
        display: none;
        font-size: 14px;
      }
      .alert-error.visible { display: block; }

      /* ── Section divider ── */
      .hr {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border), transparent);
        margin: 24px 0;
        border: none;
      }

      /* ── Utilities ── */
      .muted  { color: var(--muted); }
      .accent { color: var(--gold); }
      small   { font-size: 13px; color: var(--muted); }
      .text-center { text-align: center; }
      .mb-20  { margin-bottom: 20px; }

      /* ── Loading overlay ── */
      #loading-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(15, 10, 28, 0.88);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 20px;
        backdrop-filter: blur(4px);
      }
      #loading-overlay.visible { display: flex; }

      .spinner {
        width: 44px;
        height: 44px;
        border: 3px solid var(--border);
        border-top-color: var(--gold);
        border-radius: 50%;
        animation: rotate 0.8s linear infinite;
      }
      @keyframes rotate { to { transform: rotate(360deg); } }

      .spinner-text {
        color: var(--muted);
        font-size: 14px;
      }

      /* ── Report-specific ── */
      .report-header {
        text-align: center;
        padding: 32px 0 24px;
        border-bottom: 2px solid var(--gold);
        margin-bottom: 28px;
      }

      .report-header .logo {
        height: 120px;
        width: auto;
        margin: 0 auto 20px;
        display: block;
      }

      .report-header .main-title {
        font-family: 'Radley', serif;
        color: var(--gold);
        font-size: 32px;
        font-weight: 400;
        margin-bottom: 10px;
      }

      .report-header .student-info {
        font-size: 18px;
        color: var(--text);
        margin: 8px 0 4px;
      }

      .report-header .date {
        font-size: 14px;
        color: var(--muted);
        margin: 0;
      }

      .scores-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin: 20px 0;
      }

      .score-card {
        background: rgba(173, 145, 104, 0.05);
        border: 1px solid var(--border);
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s;
      }

      .score-card.winner {
        background: rgba(173, 145, 104, 0.15);
        border-color: var(--gold);
        box-shadow: 0 0 20px rgba(173, 145, 104, 0.3);
      }

      .score-label {
        font-size: 14px;
        color: var(--muted);
        margin-bottom: 10px;
      }

      .score-value {
        font-size: 36px;
        font-weight: 700;
        color: var(--gold);
      }

      .score-card.winner .score-value {
        color: var(--gold-light);
        font-size: 42px;
      }

      /* ── Disclaimer ── */
      .disclaimer {
        font-size: 12px;
        color: rgba(148, 163, 184, 0.6);
        text-align: center;
        margin-top: 12px;
        font-style: italic;
        line-height: 1.5;
      }

      @media (max-width: 768px) {
        body { padding: 0; }
        .container { padding: 16px 14px 60px; }
        .card { padding: 20px 16px; }
        .scores-grid { grid-template-columns: 1fr 1fr; }
        .page-header .logo { height: 80px; }
        .report-header .logo { height: 80px; }
        .btn-primary { font-size: 14px; padding: 12px 20px; }
      }

      @media (max-width: 480px) {
        .scores-grid { grid-template-columns: 1fr; }
      }
    `;
  },

};
