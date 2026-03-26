'use strict';

/**
 * Code.js - TruPath standalone lead-gen version of Tool 1
 *
 * Required flow:
 *   assessment → teaser → name/email gate → full report
 *
 * Navigation rule:
 *   NEVER use window.location after user interaction in GAS.
 *   All post-load transitions happen via google.script.run + document.write().
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  const token = params.token || generateToken();
  const initialTracking = extractTrackingFromParams(params);

  if (initialTracking.source) {
    DataService.saveDraft(token, { _source: initialTracking.source });
  }

  return buildHtmlOutput(renderAssessmentPage(token, 1));
}

function getLeadGenPageHtml(token, page) {
  return renderAssessmentPage(token, parseInt(page, 10) || 1);
}

function leadGenSaveTracking(token, tracking) {
  try {
    const draft = DataService.getDraft(token) || {};
    const mergedTracking = Object.assign({}, draft._tracking || {}, tracking || {});
    const source = buildSourceString(mergedTracking);
    DataService.saveDraft(token, {
      _tracking: mergedTracking,
      _source: source,
    });
    return { success: true };
  } catch (error) {
    Logger.log('leadGenSaveTracking error: ' + error);
    return { success: false, error: error.toString() };
  }
}

function leadGenSavePage(payload) {
  try {
    const token = payload && payload.token;
    const page = parseInt(payload && payload.page, 10);
    const data = (payload && payload.data) || {};

    if (!token || !page) {
      return { success: false, error: 'Missing token or page.' };
    }

    DataService.saveDraft(token, data);

    if (page >= 6) {
      const draft = DataService.getDraft(token) || {};
      const scores = Scoring.calculateScores(draft);
      const winner = Scoring.determineWinner(scores, draft);

      DataService.saveDraft(token, {
        _scores: scores,
        _winner: winner,
      });

      return {
        success: true,
        nextPageHtml: renderTeaserPage(token),
      };
    }

    return {
      success: true,
      nextPageHtml: renderAssessmentPage(token, page + 1),
    };
  } catch (error) {
    Logger.log('leadGenSavePage error: ' + error);
    return { success: false, error: error.toString() };
  }
}

function leadGenSubmitLead(payload) {
  try {
    const token = payload && payload.token;
    const name = sanitizeText(payload && payload.name);
    const email = sanitizeEmail(payload && payload.email);

    if (!token) {
      return { success: false, error: 'Missing session token.' };
    }
    if (!name) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const draft = DataService.getDraft(token);
    if (!draft) {
      return { success: false, error: 'Your assessment session expired. Please start again.' };
    }

    const scores = draft._scores || Scoring.calculateScores(draft);
    const winner = draft._winner || Scoring.determineWinner(scores, draft);
    const source = draft._source || buildSourceString(draft._tracking || {});

    const saveResult = DataService.saveLead(name, email, winner, scores, draft, source);
    if (!saveResult.success) {
      return saveResult;
    }

    DataService.saveDraft(token, {
      _name: name,
      _email: email,
      _submittedAt: new Date().toISOString(),
    });

    const emailResult = EmailService.sendReport(email, name, winner, scores);
    if (!emailResult.success) {
      Logger.log('Email send failed (non-fatal): ' + emailResult.error);
    }

    return {
      success: true,
      nextPageHtml: renderReportPage(token),
    };
  } catch (error) {
    Logger.log('leadGenSubmitLead error: ' + error);
    return { success: false, error: error.toString() };
  }
}

function renderAssessmentPage(token, page) {
  const draft = DataService.getDraft(token) || {};
  const step = Math.max(1, Math.min(page, 6));
  const totalSteps = 6;
  const progress = Math.round((step / totalSteps) * 100);

  const contentByPage = {
    1: renderIntroContent(),
    2: renderSectionOneContent(draft),
    3: renderSectionTwoContent(draft),
    4: renderSectionThreeContent(draft),
    5: renderThoughtsContent(draft),
    6: renderFeelingsContent(draft),
  };

  const nextLabel = step === 6 ? 'See My Results →' : step === 1 ? 'Begin Assessment →' : 'Next →';
  const backButton = step > 1
    ? `<button type="button" class="btn btn-secondary" onclick="loadLeadGenPage(${step - 1})">← Back</button>`
    : '';
  const primaryAction = `submitAssessmentPage(${step})`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(CONFIG.TITLE)}</title>
  <style>${Styles.getBase()}</style>
</head>
<body>
  ${getLoadingOverlayHtml()}
  <div class="container">
    <div class="page-header">
      <img src="${CONFIG.LOGO_URL}" alt="${escapeHtml(CONFIG.BRAND)}" class="logo">
      <p class="tagline">${escapeHtml(CONFIG.TAGLINE)}</p>
    </div>

    <div class="step-label">Step ${step} of ${totalSteps}</div>
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>

    <div id="global-error" class="alert-error"></div>

    <form id="assessment-form" onsubmit="return ${primaryAction};">
      <div class="card">
        ${contentByPage[step]}
      </div>

      <div style="display:flex; gap:12px; ${step > 1 ? '' : 'justify-content:flex-end;'}">
        ${backButton}
        <button type="submit" class="btn btn-primary" id="primary-btn">${nextLabel}</button>
      </div>
    </form>
  </div>

  <script>
    const LEADGEN_TOKEN = ${JSON.stringify(token)};
    const CURRENT_PAGE = ${step};
    ${getClientHelpersJs()}
    ${(step === 5 || step === 6) ? getRankingValidationJs() : ''}

    document.addEventListener('DOMContentLoaded', function() {
      saveTrackingOnce();
      ${step === 5 ? "updateGroupRankings('thought-ranking');" : ''}
      ${step === 6 ? "updateGroupRankings('feeling-ranking');" : ''}
    });
  </script>
</body>
</html>`;
}

function renderTeaserPage(token) {
  const draft = DataService.getDraft(token) || {};
  const scores = draft._scores || Scoring.calculateScores(draft);
  const winner = draft._winner || Scoring.determineWinner(scores, draft);
  const template = Templates.get(winner);
  const patternName = CONFIG.PATTERN_NAMES[winner] || winner;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Results - ${escapeHtml(CONFIG.BRAND)}</title>
  <style>${Styles.getBase()}</style>
</head>
<body>
  ${getLoadingOverlayHtml('Preparing your report…')}
  <div class="container">
    <div class="page-header">
      <img src="${CONFIG.LOGO_URL}" alt="${escapeHtml(CONFIG.BRAND)}" class="logo">
      <p class="tagline">${escapeHtml(CONFIG.TAGLINE)}</p>
      <h1>Your Assessment is Complete</h1>
    </div>

    <div id="global-error" class="alert-error"></div>

    <div class="card" style="text-align:center; border-color: rgba(179,144,98,0.5);">
      <p class="muted" style="font-size:13px; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:10px;">Your dominant financial pattern</p>
      <h2 style="color:#b39062; font-size:30px; margin-bottom:16px;">${escapeHtml(patternName)}</h2>
      <div style="font-size:16px; line-height:1.75;">${template.teaser}</div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:6px;">Get your full report</h3>
      <p class="muted" style="margin-bottom:20px;">Enter your name and email to unlock the full analysis on screen. We'll also send a copy to your inbox immediately.</p>

      <form id="gate-form" onsubmit="return submitLeadGate();">
        <div class="form-group">
          <label class="form-label">First and Last Name *</label>
          <input type="text" name="name" id="lead-name" placeholder="Your full name" required autocomplete="name">
        </div>

        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" name="email" id="lead-email" placeholder="you@example.com" required autocomplete="email">
          <small>We'll send your full report here. No spam. Life is already irritating enough.</small>
        </div>

        <div style="display:flex; gap:12px;">
          <button type="button" class="btn btn-secondary" onclick="loadLeadGenPage(6)">← Back</button>
          <button type="submit" class="btn btn-primary" id="primary-btn">See My Full Report →</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const LEADGEN_TOKEN = ${JSON.stringify(token)};
    ${getClientHelpersJs()}

    document.addEventListener('DOMContentLoaded', function() {
      saveTrackingOnce();
    });
  </script>
</body>
</html>`;
}

function renderReportPage(token) {
  const draft = DataService.getDraft(token);
  if (!draft) {
    return renderErrorPage('Your assessment session expired. Please start again.');
  }

  const scores = draft._scores || Scoring.calculateScores(draft);
  const winner = draft._winner || Scoring.determineWinner(scores, draft);
  const template = Templates.get(winner);
  const patternName = CONFIG.PATTERN_NAMES[winner] || winner;
  const name = draft._name || 'there';
  const ctaHtml = Templates.getCtaHtml(winner);

  const scoreCards = Object.keys(CONFIG.PATTERN_NAMES).map(function(key) {
    const isWinner = key === winner;
    const score = scores[key];
    return `
      <div class="score-card ${isWinner ? 'winner' : ''}">
        <div class="score-label">${escapeHtml(CONFIG.PATTERN_NAMES[key])}</div>
        <div class="score-value">${score > 0 ? '+' : ''}${score}</div>
      </div>
    `;
  }).join('');

  const profileHooks = {
    FSV:       { line1: "You\u2019re not living your life \u2014 a survival identity is living it for you.", line2: "That lens makes danger feel real when it isn\u2019t \u2014 and it\u2019s costing you decisions." },
    ExVal:     { line1: "Your financial decisions aren\u2019t yours \u2014 they\u2019re built around what others expect from you.", line2: "The cost of managing other people\u2019s perception is showing up in your bank account." },
    Showing:   { line1: "You give, provide, and support \u2014 but struggle to let money come back to you.", line2: "That one-way flow is bleeding wealth you could be building right now." },
    Receiving: { line1: "Emotional disconnection is the pattern shaping how \u2014 and whether \u2014 money reaches you.", line2: "That block has a price tag, and right now you\u2019re paying it every single month." },
    Control:   { line1: "You manage fear through financial control \u2014 and it\u2019s slowly cutting you off.", line2: "The wealth you\u2019re protecting with control is costing you the relationships that create more of it." },
    Fear:      { line1: "Fear is the engine running your financial life \u2014 and it\u2019s been there a long time.", line2: "Every opportunity you didn\u2019t take, every risk you couldn\u2019t hold \u2014 fear sent you that bill." }
  };
  const hook = profileHooks[winner] || { line1: '', line2: '' };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your TruPath Report</title>
  <style>${Styles.getBase()}</style>
</head>
<body>
  <div class="container">
    <div class="report-header">
      <img src="${CONFIG.LOGO_URL}" alt="${escapeHtml(CONFIG.BRAND)}" class="logo">
      <h1 class="main-title">Financial Pattern RESULTS</h1>
      <p class="student-info">${escapeHtml(name)}</p>
      <p class="date">${escapeHtml(formatLongDate(new Date()))}</p>
    </div>

    <div class="card">
      <h2>Thank you for completing the assessment.</h2>
      <p>${hook.line1}</p>
      <p>${hook.line2}</p>
      <div style="text-align:center; margin-top:24px;">
        <a href="${CONFIG.CTA_URL}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:14px 32px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:16px; font-weight:700;">
          Discover Your Financial Freedom Blueprint
        </a>
      </div>
    </div>

    <div class="card" style="border-color: rgba(179,144,98,0.5);">
      <p class="muted" style="font-size:13px; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:10px;">Your dominant financial pattern</p>
      <h2 style="color:#b39062; margin-bottom:20px;">${escapeHtml(patternName)}</h2>
      ${template.content}
    </div>

    ${ctaHtml}

    ${Templates.commonFooter}

    <div class="card">
      <h3>Raw Scores</h3>
      <p class="muted" style="font-size:14px; margin-bottom:8px;">Higher numbers indicate a stronger pattern. Range: -25 to +25.</p>
      <div class="scores-grid">${scoreCards}</div>
    </div>
  </div>
</body>
</html>`;
}

function renderIntroContent() {
  return `
    <h2>Financial Pattern Assessment</h2>
    <p class="muted" style="margin-bottom:24px;">This 6-step assessment takes about 10 minutes. Answer honestly. There are no right answers, only familiar survival patterns.</p>
    <p>You'll discover the financial pattern your subconscious relies on most heavily - the one shaping decisions about earning, spending, receiving, control, fear, and worth.</p>
    <p class="muted" style="font-size:14px; margin-top:18px;">Complete the assessment first. We'll ask for your name and email only after your results are ready.</p>
  `;
}

function renderSectionOneContent(draft) {
  return renderStatementSection(
    'Section 1 - Statement Relevance',
    [
      { name: 'q3', text: 'I am destined to fail because I am not good enough.' },
      { name: 'q4', text: 'I need to take on big things to prove that I am good enough.' },
      { name: 'q5', text: 'I often feel distant from others, which makes me question my worthiness.' },
      { name: 'q6', text: 'To feel safe, I must gain the approval of others and be accepted by them.' },
      { name: 'q7', text: 'When someone does not recognize my value, I feel like I have to retreat into myself to be safe.' },
      { name: 'q8', text: 'When I am not accepted by others I feel unsafe and question if I will be loved.' }
    ],
    draft
  );
}

function renderSectionTwoContent(draft) {
  return renderStatementSection(
    'Section 2 - Statement Relevance',
    [
      { name: 'q10', text: 'I will sacrifice my happiness to serve others.' },
      { name: 'q11', text: 'It is ok for me to do things for others, but I am uncomfortable receiving from them.' },
      { name: 'q12', text: 'I need to be valuable to others in order to be loved.' },
      { name: 'q13', text: 'I know that others will hurt me in some way, so I must keep my distance.' },
      { name: 'q14', text: 'Those around me are unable to express their love for me.' },
      { name: 'q15', text: 'The isolation I feel proves that I will never be loved.' }
    ],
    draft
  );
}

function renderSectionThreeContent(draft) {
  return renderStatementSection(
    'Section 3 - Statement Relevance',
    [
      { name: 'q17', text: 'If I do not control my world, I know I will suffer.' },
      { name: 'q18', text: 'To avoid emotions I do not like, I distract myself by staying busy.' },
      { name: 'q19', text: 'When I feel alone, I feel like I am out of control / not safe.' },
      { name: 'q20', text: 'I know that I will have experiences that will cause me pain, so I must act to protect myself.' },
      { name: 'q21', text: 'To be safe, I have to keep distance between myself and others, yet feel alone.' },
      { name: 'q22', text: 'I live in constant fear of things going wrong for me.' }
    ],
    draft
  );
}

function renderStatementSection(title, questions, draft) {
  let html = `
    <h2>${title}</h2>
    <p class="muted" style="margin-bottom:6px;">Rate each statement from <strong>-5</strong> (not relevant at all) to <strong>+5</strong> (very relevant).</p>
    <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8; margin-bottom:20px;"><span>-5 Not relevant</span><span>+5 Very relevant</span></div>
  `;

  questions.forEach(function(question) {
    html += `
      <div class="form-group">
        <label class="form-label">${question.text} *</label>
        <select name="${question.name}" required>
          ${renderScaleOptions(draft[question.name] || '')}
        </select>
      </div>
    `;
  });

  return html;
}

function renderThoughtsContent(draft) {
  const thoughts = [
    { name: 'thought_fsv', text: 'I have to do something / be someone better to be safe.' },
    { name: 'thought_exval', text: 'I need others to value me to be safe.' },
    { name: 'thought_showing', text: 'I need to suffer or sacrifice for others to be safe.' },
    { name: 'thought_receiving', text: 'I have to keep distance from others to be safe.' },
    { name: 'thought_control', text: 'I need to control my environment to be safe.' },
    { name: 'thought_fear', text: 'I need to protect myself to be safe.' }
  ];

  let html = `
    <h2>Ranking Your Thoughts</h2>
    <p class="muted" style="margin-bottom:8px;">Rank each statement from <strong>1</strong> (least relevant) to <strong>10</strong> (most relevant). Each rank must be unique.</p>
  `;

  thoughts.forEach(function(item) {
    html += `
      <div class="form-group">
        <label class="form-label">${item.text} *</label>
        <select name="${item.name}" class="thought-ranking" onchange="updateGroupRankings('thought-ranking')" required>
          ${renderRankOptions(draft[item.name] || '')}
        </select>
      </div>
    `;
  });

  html += `<div id="ranking-error" class="alert-error"></div>`;
  return html;
}

function renderFeelingsContent(draft) {
  const feelings = [
    { name: 'feeling_fsv', text: 'I feel insufficient.' },
    { name: 'feeling_exval', text: 'I feel like I am not good enough for them.' },
    { name: 'feeling_showing', text: 'I feel the need to sacrifice for others.' },
    { name: 'feeling_receiving', text: 'I feel like nobody loves me.' },
    { name: 'feeling_control', text: 'I feel out of control of my world.' },
    { name: 'feeling_fear', text: 'I feel like I am in danger.' }
  ];

  let html = `
    <h2>Ranking Your Feelings</h2>
    <p class="muted" style="margin-bottom:8px;">Rank each statement from <strong>1</strong> (least relevant) to <strong>10</strong> (most relevant). Each rank must be unique.</p>
  `;

  feelings.forEach(function(item) {
    html += `
      <div class="form-group">
        <label class="form-label">${item.text} *</label>
        <select name="${item.name}" class="feeling-ranking" onchange="updateGroupRankings('feeling-ranking')" required>
          ${renderRankOptions(draft[item.name] || '')}
        </select>
      </div>
    `;
  });

  html += `<div id="ranking-error" class="alert-error"></div>`;
  return html;
}

function renderScaleOptions(selected) {
  const options = [
    { value: '', label: 'Select a response' },
    { value: '-5', label: '-5 (Not relevant at all)' },
    { value: '-4', label: '-4' },
    { value: '-3', label: '-3' },
    { value: '-2', label: '-2' },
    { value: '-1', label: '-1' },
    { value: '1', label: '+1' },
    { value: '2', label: '+2' },
    { value: '3', label: '+3' },
    { value: '4', label: '+4' },
    { value: '5', label: '+5 (Very relevant)' }
  ];

  return options.map(function(option) {
    const selectedAttr = String(selected) === String(option.value) ? ' selected' : '';
    return `<option value="${option.value}"${selectedAttr}>${option.label}</option>`;
  }).join('');
}

function renderRankOptions(selected) {
  let html = '<option value="">Rank (1-10)</option>';
  for (let i = 1; i <= 10; i += 1) {
    html += `<option value="${i}"${String(selected) === String(i) ? ' selected' : ''}>${i}</option>`;
  }
  return html;
}

function getLoadingOverlayHtml(message) {
  return `
    <div id="loading-overlay">
      <div class="spinner"></div>
      <p class="spinner-text">${message || 'Saving…'}</p>
    </div>
  `;
}

function getClientHelpersJs() {
  return `
    function showLoading(message) {
      var overlay = document.getElementById('loading-overlay');
      if (overlay) {
        var text = overlay.querySelector('.spinner-text');
        if (text && message) text.textContent = message;
        overlay.classList.add('visible');
      }
      var btn = document.getElementById('primary-btn');
      if (btn) btn.disabled = true;
    }

    function hideLoading() {
      var overlay = document.getElementById('loading-overlay');
      if (overlay) overlay.classList.remove('visible');
      var btn = document.getElementById('primary-btn');
      if (btn) btn.disabled = false;
    }

    function showError(message) {
      hideLoading();
      var box = document.getElementById('global-error');
      if (box) {
        box.textContent = message || 'Something went wrong.';
        box.classList.add('visible');
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert(message || 'Something went wrong.');
      }
    }

    function writeServerHtml(result, fallbackMessage) {
      if (result && result.success === false) {
        showError(result.error || fallbackMessage || 'Request failed.');
        return;
      }
      if (!result || !result.nextPageHtml) {
        showError(fallbackMessage || 'Server did not return page HTML.');
        return;
      }
      document.open();
      document.write(result.nextPageHtml);
      document.close();
      window.scrollTo(0, 0);
    }

    function collectFormData(formId) {
      var form = document.getElementById(formId);
      if (!form) return {};
      return Object.fromEntries(new FormData(form).entries());
    }

    function saveTrackingOnce() {
      if (window.__leadgenTrackingSaved) return;
      window.__leadgenTrackingSaved = true;
      var params = new URLSearchParams(window.location.search || '');
      var tracking = {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || '',
        source: params.get('source') || '',
        referrer: document.referrer || '',
        landing_url: document.URL || ''
      };
      google.script.run.leadGenSaveTracking(LEADGEN_TOKEN, tracking);
    }

    function loadLeadGenPage(page) {
      showLoading('Loading…');
      google.script.run
        .withSuccessHandler(function(html) {
          document.open();
          document.write(html);
          document.close();
          window.scrollTo(0, 0);
        })
        .withFailureHandler(function(error) {
          showError(error && error.message ? error.message : 'Failed to load page.');
        })
        .getLeadGenPageHtml(LEADGEN_TOKEN, page);
      return false;
    }

    function submitAssessmentPage(page) {
      var form = document.getElementById('assessment-form');
      if (!form) {
        showError('Assessment form not found.');
        return false;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }
      if ((page === 5 || page === 6) && typeof validateRankings === 'function' && !validateRankings()) {
        return false;
      }
      showLoading(page === 6 ? 'Scoring your assessment…' : 'Saving your responses…');
      google.script.run
        .withSuccessHandler(function(result) {
          writeServerHtml(result, 'Failed to load the next step.');
        })
        .withFailureHandler(function(error) {
          showError(error && error.message ? error.message : 'Failed to save your responses.');
        })
        .leadGenSavePage({ token: LEADGEN_TOKEN, page: page, data: collectFormData('assessment-form') });
      return false;
    }

    function submitLeadGate() {
      var form = document.getElementById('gate-form');
      if (!form) {
        showError('Lead form not found.');
        return false;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }
      showLoading('Preparing your report…');
      var data = collectFormData('gate-form');
      google.script.run
        .withSuccessHandler(function(result) {
          writeServerHtml(result, 'Failed to load your report.');
        })
        .withFailureHandler(function(error) {
          showError(error && error.message ? error.message : 'Failed to submit your details.');
        })
        .leadGenSubmitLead({ token: LEADGEN_TOKEN, name: data.name, email: data.email });
      return false;
    }
  `;
}

function getRankingValidationJs() {
  return `
    /**
     * updateGroupRankings - called on every change within a ranking group.
     * Disables options that are already claimed by another select in the same group,
     * so a user literally cannot pick the same rank twice.
     *
     * @param {string} groupClass - CSS class shared by all selects in the group
     *                              ('thought-ranking' or 'feeling-ranking')
     */
    function updateGroupRankings(groupClass) {
      var selects = Array.prototype.slice.call(document.querySelectorAll('.' + groupClass));

      // Build set of currently claimed values (excluding the empty placeholder)
      var claimed = {};
      selects.forEach(function(select) {
        if (select.value !== '') {
          claimed[select.value] = true;
        }
      });

      // For each select: disable options taken by others, re-enable own current value
      selects.forEach(function(select) {
        var current = select.value;
        Array.prototype.slice.call(select.options).forEach(function(option) {
          if (!option.value) return; // skip the placeholder
          var isTakenByOther = claimed[option.value] && option.value !== current;
          option.disabled = isTakenByOther;
          // Visual feedback: dim taken options
          option.style.color = isTakenByOther ? 'rgba(148,163,184,0.35)' : '';
        });
      });
    }

    function validateRankings() {
      var errorBox = document.getElementById('ranking-error');

      if (CURRENT_PAGE === 5) {
        var thoughtSelects = Array.prototype.slice.call(document.querySelectorAll('.thought-ranking'));
        var thoughtValues = thoughtSelects.map(function(s) { return s.value; }).filter(Boolean);
        if (thoughtValues.length !== 6 || new Set(thoughtValues).size !== 6) {
          errorBox.textContent = 'Please give each thought a unique ranking (1–10). No duplicates allowed.';
          errorBox.classList.add('visible');
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return false;
        }
      }

      if (CURRENT_PAGE === 6) {
        var feelingSelects = Array.prototype.slice.call(document.querySelectorAll('.feeling-ranking'));
        var feelingValues = feelingSelects.map(function(s) { return s.value; }).filter(Boolean);
        if (feelingValues.length !== 6 || new Set(feelingValues).size !== 6) {
          errorBox.textContent = 'Please give each feeling a unique ranking (1–10). No duplicates allowed.';
          errorBox.classList.add('visible');
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return false;
        }
      }

      errorBox.textContent = '';
      errorBox.classList.remove('visible');
      return true;
    }
  `;
}

function buildHtmlOutput(html) {
  return HtmlService.createHtmlOutput(html)
    .setTitle(CONFIG.TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function renderErrorPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    body { background:#361852; color:#f0eaf7; font-family:Arial, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
    .box { max-width:520px; padding:32px; background:rgba(255,255,255,0.04); border:1px solid rgba(179,144,98,0.25); border-radius:12px; text-align:center; }
    h2 { color:#ef4444; margin-bottom:12px; }
    p { color:#b0a0c0; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Something went wrong</h2>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`;
}

function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i += 1) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function sanitizeText(value) {
  return String(value || '').trim();
}

function sanitizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLongDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'America/Denver', 'MMMM d, yyyy');
}

function extractTrackingFromParams(params) {
  const tracking = {
    utm_source: params.utm_source || '',
    utm_medium: params.utm_medium || '',
    utm_campaign: params.utm_campaign || '',
    utm_term: params.utm_term || '',
    utm_content: params.utm_content || '',
    source: params.source || '',
  };
  tracking.source = buildSourceString(tracking);
  return tracking;
}

function buildSourceString(tracking) {
  const t = tracking || {};
  const parts = [];
  if (t.source) parts.push('source=' + t.source);
  if (t.utm_source) parts.push('utm_source=' + t.utm_source);
  if (t.utm_medium) parts.push('utm_medium=' + t.utm_medium);
  if (t.utm_campaign) parts.push('utm_campaign=' + t.utm_campaign);
  if (t.utm_term) parts.push('utm_term=' + t.utm_term);
  if (t.utm_content) parts.push('utm_content=' + t.utm_content);
  if (t.referrer) parts.push('referrer=' + t.referrer);
  if (t.landing_url) parts.push('landing_url=' + t.landing_url);
  return parts.join(' | ');
}
