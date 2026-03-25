'use strict';

/**
 * Styles.js — Shared CSS for all pages
 *
 * Matches the TruPath brand from the main FTP-v3 program.
 * Dark theme, gold accent, Radley/Rubik typography.
 */

const Styles = {

  getBase() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Radley:ital@0;1&family=Rubik:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --accent:      #ad9168;
        --accent-dark: #8a7150;
        --gold:        #c4a877;
        --bg:          #1e192b;
        --bg-card:     rgba(255,255,255,0.04);
        --bg-card-hover: rgba(255,255,255,0.07);
        --text:        #e2e8f0;
        --muted:       #94a3b8;
        --border:      rgba(173,145,104,0.25);
        --error:       #ef4444;
        --radius:      12px;
      }

      html, body {
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: 'Rubik', sans-serif;
        font-size: 16px;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      h1, h2, h3 {
        font-family: 'Radley', Georgia, serif;
        color: var(--text);
        line-height: 1.25;
      }

      h1 { font-size: clamp(22px, 4vw, 32px); margin-bottom: 16px; }
      h2 { font-size: clamp(18px, 3vw, 24px); margin-bottom: 14px; }
      h3 { font-size: 18px; margin-bottom: 10px; color: var(--accent); }

      p { margin-bottom: 14px; color: var(--text); }
      ul, ol { padding-left: 24px; margin-bottom: 14px; }
      li { margin-bottom: 6px; }
      a { color: var(--accent); }

      .container {
        max-width: 720px;
        margin: 0 auto;
        padding: 20px 20px 60px;
      }

      /* ── Card ── */
      .card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 28px 32px;
        margin-bottom: 24px;
      }

      /* ── Form elements ── */
      .form-group { margin-bottom: 22px; }

      .form-label {
        display: block;
        font-size: 15px;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 8px;
        line-height: 1.4;
      }

      input[type="text"],
      input[type="email"],
      select {
        width: 100%;
        padding: 12px 14px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(173,145,104,0.35);
        border-radius: 8px;
        color: var(--text);
        font-family: 'Rubik', sans-serif;
        font-size: 15px;
        outline: none;
        transition: border-color 0.2s;
        -webkit-appearance: none;
      }
      input:focus, select:focus { border-color: var(--accent); }
      input::placeholder { color: var(--muted); }

      select option {
        background: #1e192b;
        color: var(--text);
      }

      /* ── Buttons ── */
      .btn {
        display: inline-block;
        padding: 14px 28px;
        border-radius: 8px;
        font-family: 'Rubik', sans-serif;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        text-decoration: none;
        text-align: center;
      }

      .btn-primary {
        background: var(--accent);
        color: #1e192b;
        width: 100%;
      }
      .btn-primary:hover { background: var(--gold); transform: translateY(-1px); }
      .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

      .btn-secondary {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--muted);
      }
      .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

      /* ── Progress bar ── */
      .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.08);
        border-radius: 4px;
        margin-bottom: 28px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-dark), var(--accent));
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      .step-label {
        font-size: 13px;
        color: var(--muted);
        margin-bottom: 6px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      /* ── Error ── */
      .error-msg {
        color: var(--error);
        font-size: 14px;
        margin-top: 6px;
        display: none;
      }
      .error-msg.visible { display: block; }

      .alert-error {
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.35);
        color: #fca5a5;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 20px;
        display: none;
      }
      .alert-error.visible { display: block; }

      /* ── Muted text ── */
      .muted { color: var(--muted); }
      .accent { color: var(--accent); }
      small { font-size: 13px; color: var(--muted); }

      /* ── Section divider ── */
      .section-divider {
        border: none;
        border-top: 1px solid var(--border);
        margin: 28px 0;
      }

      /* ── Header / Logo ── */
      .page-header {
        text-align: center;
        padding: 28px 0 20px;
      }
      .page-header .logo {
        height: 52px;
        width: auto;
        margin-bottom: 16px;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }

      /* ── Scale hint ── */
      .scale-hint {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--muted);
        margin-top: 6px;
      }

      /* ── Loading spinner ── */
      #loading-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(30,25,43,0.85);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 20px;
      }
      #loading-overlay.visible { display: flex; }
      .spinner {
        width: 48px; height: 48px;
        border: 4px solid rgba(173,145,104,0.2);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .spinner-text { color: var(--muted); font-size: 15px; }
      @keyframes spin { to { transform: rotate(360deg); } }

      @media (max-width: 480px) {
        .card { padding: 20px 16px; }
        .container { padding: 16px 14px 60px; }
      }
    `;
  },

};
