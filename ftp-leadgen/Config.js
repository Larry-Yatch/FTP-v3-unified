'use strict';

/**
 * Config.js — Lead Gen Tool 1 Configuration
 *
 * All environment-specific values live here.
 * Sheet ID is also stored in Script Properties for portability:
 *   Key: LEADS_SHEET_ID
 *   Value: 1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ
 */

const CONFIG = {

  // ── Brand ────────────────────────────────────────────────────────────────────

  TITLE: 'Discover Your Financial Freedom Blueprint',
  BRAND: 'TruPath',
  TAGLINE: 'Discover Your Financial Freedom Blueprint',
  LOGO_URL: 'https://lh3.googleusercontent.com/d/1fXEp_y6Wj8nlMUbEERCNIbW9si_3v0Uw',
  DISCLAIMER: 'Financial TruPath assessments are for educational and self-awareness purposes only. This is not financial advice. For personalized financial guidance, please consult a qualified financial professional.',

  // ── CTA ──────────────────────────────────────────────────────────────────────

  CTA_URL: 'https://www.trupathmastery.com/trupath',
  CTA_BUTTON_TEXT: 'Discover Your Financial Freedom Blueprint →',

  // ── Course deadline (used for urgency copy) ───────────────────────────────

  DEADLINE: 'April 1st',

  // ── Email ────────────────────────────────────────────────────────────────────

  EMAIL_SENDER_NAME: 'TruPath',
  EMAIL_REPLY_TO: 'admin@trupathmastery.com',
  EMAIL_SUBJECT: 'Your Financial Freedom Blueprint Assessment Results',

  // ── Sheet ────────────────────────────────────────────────────────────────────

  get SHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('LEADS_SHEET_ID')
      || '1qZC8h-AHnmqSXCyGhfsMXRYpX6n4JbB37Qq48piAIpQ';
  },

  SHEET_TAB: 'Leads',

  // ── Follow-up email subjects — pattern-keyed (updated TASK-031, Steve-revised) ────────────

  FOLLOW_UP_SUBJECT_2: {
    FSV:       'What it\'s actually costing you',
    ExVal:     'The cost of building for the room',
    Showing:   'This isn\'t girl math or boy math. This is real math',
    Receiving: 'Why the money doesn\'t stay',
    Control:   'Is discipline actually the problem?',
    Fear:      'The pattern that looks like bad luck',
    generic:   'A note on your Financial TruPath assessment',
  },

  FOLLOW_UP_SUBJECT_3: {
    FSV:       'Tomorrow we start',
    ExVal:     'We Start Tomorrow',
    Showing:   'Generous AND Free',
    Receiving: 'You\'ve already done the hard part',
    Control:   'What discipline looks like without the ceiling',
    Fear:      'When the wall comes down',
    generic:   'Financial TruPath starts tomorrow',
  },

  /**
   * FOLLOW_UP_EMAILS — HTML body copy for each follow-up, keyed by email number → pattern.
   *
   * Supported keys: FSV | ExVal | Showing | Receiving | Control | Fear | generic
   * 'generic' is the fallback if no pattern-specific copy exists.
   * Use {name} as the first-name placeholder — FollowUpService replaces it at send time.
   *
   * Copy revised by Steve Najib (71 suggestions applied, TASK-029/TASK-031).
   * Subjects live in FOLLOW_UP_SUBJECT_2/3 above.
   */
  FOLLOW_UP_EMAILS: {
    2: {

      FSV: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Your Financial TruPath assessment identified a False Self-View pattern. Here's what that means in English…</p>
<p>You know the knowledge. The strategies. You've created the money. Then why aren't we where we want to be yet?</p>
<p>That False Self-View intercepting your hard work before it can compound.</p>
<p>It works like this: every financial decision you make passes through a filter — not a strategy filter, but an identity filter.</p>
<p>The result looks different for different people:</p>
<ul>
<li>Income that rises but doesn't build</li>
<li>Decisions made from a version of yourself that's smaller than your actual capacity</li>
<li>Money created, then redirected — not toward goals, but away from a ceiling you can't quite name</li>
</ul>
<p>This isn't about motivation. You're not undisciplined. You're running a financial identity that doesn't match your financial reality — and the gap between them is what creates the stress.</p>
<p>The Financial TruPath experience is built to close that gap, using the identity work that makes your existing strategies finally compound.</p>
<p>We start April 1st.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      ExVal: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Your Financial TruPath assessment identified an External Validation pattern. Here's what that looks like in practice.</p>
<p>You know how money works. The problem isn't knowledge — it's the filter every financial decision runs through before you make it.</p>
<p>That filter is: <em>How will they judge me?</em></p>
<p>Not always consciously. But persistently. What will this say about me? Will they think I've made it? Is this enough? Is this too much?</p>
<p>The cost of that filter is specific:</p>
<ul>
<li>Wealth redirected toward signals instead of security</li>
<li>Income that builds image faster than assets</li>
<li>Financial decisions made from the outside in — shaped by perception instead of actual goals</li>
</ul>
<p>And underneath all of it: financial exhaustion. Because you're not just managing your money. You're managing what your money says about you to everyone who might be watching.</p>
<p>Financial TruPath is the 12-week experience that takes you from knowing how money works to building it for yourself. Not for the other person in the room.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Showing: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Your Financial TruPath assessment identified an Issues Showing Love pattern. That's worth looking at directly.</p>
<p>You know how to create money. The assessment surfaced something different: a pattern that keeps redirecting it.</p>
<p>Not toward bad investments. Not toward poor planning. Toward people. Obligations that weren't yours to take on. Situations that needed rescuing. A version of love and care that gets expressed through financial sacrifice.</p>
<p>Here's the math most people in this pattern won't let themselves do:</p>
<ul>
<li>Every time you carry someone else's financial weight, you're using resources built to carry yours</li>
<li>Every obligation you absorb costs you the compounding that money would have created</li>
<li>Every rescue delays the financial security you've been working toward</li>
</ul>
<p>This isn't about being less generous. It's about recognizing that the belief underneath this pattern — that sacrifice is what proves you care.</p>
<p>The people around you don't need you to be financially insecure. They need you to be strong. Those are different things.</p>
<p>Financial TruPath is the 12-week experience that rewires that belief at the source. So you can be genuinely generous AND genuinely financially free — without one costing you the other.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Receiving: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Your Financial TruPath assessment identified an Issues Receiving Love pattern. Here's what that means for your finances specifically.</p>
<p>You understand how money works. What the assessment surfaced is a quieter layer. A belief running underneath the surface that financial independence creates obligation. Or signals something morally compromised. Or puts distance between you and the people you care about.</p>
<p>That belief doesn't announce itself as a belief. It feels like awareness. Like caution. Like being realistic about what money does to people.</p>
<p>But watch what it produces:</p>
<ul>
<li>Money that comes in but doesn't accumulate</li>
<li>A persistent underuse of your own financial capacity</li>
<li>A gap between the income you've created and the assets you've kept</li>
</ul>
<p>You've been working toward financial freedom. And something underneath that work has been quietly making sure you don't fully arrive.</p>
<p>There's a gap.</p>
<p>Financial TruPath is the 12-week experience built to close the gap between knowing how money works and actually allowing it to work for you.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Control: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Your Financial TruPath assessment identified a Control Leading to Isolation pattern. Here's what that pattern actually costs.</p>
<p>You track everything. You plan carefully. You know more than most people in the room about how money is supposed to work. That discipline is real — and it's not the problem.</p>
<p>The problem is what your discipline is being used for.</p>
<p>The Control pattern redirects all of that precision toward protection. Not growth. Not leverage. Protection. Things that look like undercharging. Under-collecting on what you've already earned. Holding resources you've built but won't deploy. Keeping yourself isolated in financial decisions because trusting others has felt riskier than going it alone.</p>
<p>Scarcity feels safer than trust. That's the belief at the center of this pattern.</p>
<p>And here's what it produces: a ceiling. Not from lack of knowledge. Not from lack of discipline. From a financial operating system optimized to prevent loss — not to create freedom.</p>
<p>You've been working harder than almost anyone you know. And the ceiling keeps appearing at the same threshold.</p>
<p>That's not strategy. That's pattern.</p>
<p>Financial TruPath is the 12-week experience that addresses the belief that's been making your financial intelligence work against your financial freedom.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Fear: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Your Financial TruPath assessment identified a Fear Leading to Isolation pattern. Here's what that looks like from the outside — and from the inside.</p>
<p>From the outside: bad luck. Deals that don't close. Partnerships that go sideways. Projects that get close to breakthrough and then stop.</p>
<p>From the inside: you already know it isn't luck.</p>
<p>The Fear pattern intercepts execution. Not randomly — at specific thresholds. The moments right before things compound. It shows up as:</p>
<ul>
<li>Trust extended to the wrong people</li>
<li>Protection skipped at the critical moment</li>
<li>Momentum that builds and then, for reasons that are hard to explain, doesn't convert</li>
</ul>
<p>Here's the cost in real terms:</p>
<p>Every intercepted breakthrough is a compounding cycle that didn't start. Every time this pattern redirected your execution, the financial distance between where you are and where your knowledge says you should be got a little wider.</p>
<p>You're not missing strategy. You're not missing work ethic. You're running a pattern that keeps the finish line moving.</p>
<p>Financial TruPath is the 12-week experience that goes to the source of that pattern — so the financial knowledge you've already built stops running into the same invisible wall.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      generic: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>You took the Financial TruPath assessment recently. We wanted to follow up with more context on your pattern before we start on April 1st.</p>
<p>The assessment surfaced a financial pattern — a belief running underneath your decisions that's been shaping how money moves through your life. Not a strategy problem. A pattern problem. And the gap between the two is what creates the stress.</p>
<p>Financial TruPath is the 12-week LIVE experience built to address that pattern at the source — so your financial knowledge can finally compound the way it should.</p>
<p>We start April 1st. That's four days from now.</p>
<p>→ Join Financial TruPath: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

    },
    3: {

      FSV: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Financial TruPath starts tomorrow.</p>
<p>You took the Financial Pattern Assessment. Your results: False Self-View. This means you have a belief running underneath your financial knowledge that's been quietly working against it.</p>
<p>Here's what changes when you close that gap:</p>
<ul>
<li>The financial decisions you already know how to make start compounding the way they should</li>
<li>The ceiling you've been hitting — the one that has nothing to do with strategy — comes down</li>
<li>Your financial identity catches up to your financial capability</li>
</ul>
<p>That's not a small shift. That's the shift that makes everything else work.</p>
<p>12 weeks. LIVE. Starting tomorrow.</p>
<p>→ Enroll: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>We fill based on enrollment. If you're in, now is the time.</p>
<p>— The TruPath Team</p>
<p>P.S. Questions? Reply to this email. We'll answer directly.</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      ExVal: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>This work doesn't make you stop caring what people think. That's not the goal and that's not realistic.</p>
<p>What changes: the financial filter gets quieter. Financial decisions stop running through external approval and start running through your actual values and goals. Wealth builds in one direction instead of scattered across signals.</p>
<p>The difference between building wealth and building the appearance of wealth is compounding. One of those actually works over time.</p>
<p>12 weeks. LIVE experience. We start tomorrow.</p>
<p>→ Enroll: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Showing: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Financial TruPath starts tomorrow.</p>
<p>You took the Financial Pattern Assessment recently and recognized the Issues Showing Love pattern. I want to say one thing clearly before we start:</p>
<p>This work doesn't make you less caring. It doesn't make you less generous. It doesn't turn you into someone who closes their fist around every dollar.</p>
<p>It does the opposite.</p>
<p>When the belief underneath this pattern — that sacrifice is what proves care — gets addressed, something specific happens. You stop bleeding. You can give freely, without it costing you your own financial security. You stop carrying obligations that were never yours to carry.</p>
<p>That's not selfishness. That's what it actually looks like to be in a position to help.</p>
<p>12 weeks. LIVE. Starting tomorrow.</p>
<p>→ Enroll: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Receiving: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Financial TruPath starts tomorrow.</p>
<p>You took the Financial Pattern Assessment recently and recognized the Issues Receiving Love pattern — you've already done something most people never do. You named the thing that's been working underneath the surface.</p>
<p>Here's what changes on the other side of this work:</p>
<p>The money you've been earning can finally stay. Build. Compound. The financial independence you've been working toward stops feeling like a threat and starts feeling like what it actually is: freedom.</p>
<p>You've spent years building the knowledge and the income. The missing piece isn't more strategy. It's removing the unconscious brake that's been keeping you more dependent than you need to be.</p>
<p>We start tomorrow.</p>
<p>→ Enroll: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p>P.S. If you have questions about whether this experience is right for you, reply to this email. We'll answer directly.</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Control: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Financial TruPath starts tomorrow.</p>
<p>You took the Financial Pattern Assessment recently and recognized the Control Leading to Isolation pattern — here's what I want you to hold onto before we start.</p>
<p>Your discipline isn't the enemy. It never was.</p>
<p>What this work does is redirect it. Away from defense mode. Toward intentional trust, strategic leverage, and a financial system built for growth — not just protection.</p>
<p>When this pattern is addressed, something specific changes: the ceiling breaks. Not because you work harder. Because you stop using your energy to protect yourself from your own success.</p>
<p>The control becomes a tool instead of a trap. You can deploy resources instead of holding them. You can build the partnerships and leverage you've been avoiding. The financial intelligence you've spent years developing starts working in your direction.</p>
<p>12 weeks. We start tomorrow.</p>
<p>→ Enroll: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      Fear: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Financial TruPath starts tomorrow.</p>
<p>You took the Financial Pattern Assessment recently and recognized the Fear Leading to Isolation pattern — you've already identified what most people spend decades explaining away as bad timing or bad luck.</p>
<p>Here's what changes on the other side of this work:</p>
<ul>
<li>The intercept stops</li>
<li>The momentum you build doesn't disappear at the threshold</li>
<li>Trust lands where it's deserved</li>
<li>Protection is in place when it matters</li>
<li>The project gets to breakthrough instead of stopping just before it</li>
</ul>
<p>You stop burning cycles on the same wall. And the financial knowledge you've already built — the strategies, the skills, the track record — starts converting into what it was always capable of producing.</p>
<p>That's not a small shift. That's the difference between a career of almost and a career of actually.</p>
<p>12 weeks. LIVE. We start tomorrow.</p>
<p>→ Enroll: <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p>P.S. The work ahead is real. But you already took the first step when you named the pattern. Reply if you have questions — we'll answer you directly.</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

      generic: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;color:#222;line-height:1.7;font-size:15px;">
<p>Hi {name},</p>
<p>Financial TruPath starts tomorrow — April 1st. If you're ready to address the pattern underneath your financial decisions, now is the time.</p>
<p>12 weeks. LIVE experience. Everything changes when the pattern does.</p>
<p>→ <a href="https://www.trupathmastery.com/trupath">https://www.trupathmastery.com/trupath</a></p>
<p>— The TruPath Team</p>
<p style="color:#888;font-size:11px;border-top:1px solid #eee;padding-top:12px;margin-top:24px;">For educational purposes only. This is not financial advice.</p>
</div>`,

    },
  },

  // ── Scoring ──────────────────────────────────────────────────────────────────

  PATTERN_NAMES: {
    FSV:       'False Self-View',
    ExVal:     'External Validation',
    Showing:   'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control:   'Control Leading to Isolation',
    Fear:      'Fear Leading to Isolation',
  },

  // ── Brand palette ────────────────────────────────────────────────────────────

  COLOR_PURPLE: '#361852',
  COLOR_GOLD:   '#b39062',
  COLOR_BLACK:  '#000000',
  COLOR_WHITE:  '#ffffff',

};
