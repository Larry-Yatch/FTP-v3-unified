'use strict';

/**
 * Templates.js — Pattern report content
 *
 * Copy: Russel (CI CMO), finalized 2026-03-24
 * Brand palette: #361852 purple / #b39062 gold
 *
 * Structure per pattern:
 *   name    — display name
 *   teaser  — teaser page (shown before email gate)
 *   cta     — CTA block (shown at bottom of report + in email)
 *   content — full report body
 */

const Templates = {

  // ── Shared intro ───────────────────────────────────────────────────────────

  commonIntro: `
    <p>Where there is the experience of fear, there is no experience of love. Where there is the experience of love, there is no experience of fear.</p>
    <p>Trauma is always produced in fear — and it always creates a strategy based on disconnection.</p>
    <p>In the distillation of thousands of traumatic strategies, they all regress to three types of disconnection, each with an active and passive expression:</p>

    <div style="margin:20px 0; padding:18px 22px; background:rgba(179,144,98,0.08); border-left:4px solid #b39062; border-radius:0 8px 8px 0;">
      <strong style="color:#b39062;">Disconnection from Self</strong><br>
      False Self-View — Active &nbsp;|&nbsp; External Validation — Passive<br><br>
      <strong style="color:#b39062;">Disconnection from Others</strong><br>
      Issues Showing Love — Active &nbsp;|&nbsp; Issues Receiving Love — Passive<br><br>
      <strong style="color:#b39062;">Disconnection from All That is Greater</strong><br>
      Need for Control Leading to Isolation — Active &nbsp;|&nbsp; Living in Fear Leading to Isolation — Passive
    </div>

    <p>We each weave all six of these strategies together in our unique way — yet we also have a primary driving strategy. Yours is identified below.</p>
  `,

  // ── Shared footer (with full disclaimer per Russel's DELIVERABLE D) ────────

  commonFooter: `
    <div style="margin-top:48px; padding-top:24px; border-top:1px solid rgba(179,144,98,0.25); text-align:center;">
      <p style="color:#b0a0c0; font-size:14px;">
        Questions? <a href="mailto:admin@trupathmastery.com" style="color:#b39062;">admin@trupathmastery.com</a>
      </p>
      <p style="color:#b0a0c0; font-size:13px; margin-top:8px;">
        &copy; TruPath Mastery. All rights reserved.
      </p>
      <p style="color:#7a6a8a; font-size:12px; margin-top:12px; font-style:italic; max-width:520px; margin-left:auto; margin-right:auto; line-height:1.6;">
        Financial TruPath assessments are for educational and self-awareness purposes only. This is not financial advice. For personalized financial guidance, please consult a qualified financial professional.
      </p>
    </div>
  `,

  // ── Pattern templates ──────────────────────────────────────────────────────

  FSV: {
    name: 'False Self-View',

    teaser: `
      <p style="font-weight:600; color:#f0eaf7; margin-bottom:10px;">Your dominant pattern: False Self-View</p>
      <p style="font-size:16px; line-height:1.75; margin-bottom:10px;">You've built the income — and something keeps making sure it never quite feels secure. Your full report reveals why, and what to do about it.</p>
      <p style="color:#b0a0c0; font-size:14px; font-style:italic;">Enter your email to receive your personalized Financial TruPath report.</p>
    `,

    cta: `
      <div style="text-align:center; padding:36px 32px; background:rgba(179,144,98,0.08); border:1px solid rgba(179,144,98,0.35); border-radius:14px; margin:40px 0;">
        <p style="font-size:13px; color:#b0a0c0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px;">Ready to break the pattern?</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">You've spent years building your Financial IQ — the strategies, the plans, the knowledge. What this assessment just revealed is something different: a pattern underneath the knowledge that keeps quietly working against it.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">The stress you carry around money isn't about what you don't know. It's about a belief, running in the background, that turns clarity into confusion and resources into something that always feels just out of reach.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:28px; text-align:left;">Financial TruPath is the 12-week program built to close that gap — not with more strategy, but with the work that makes every strategy you already have finally stick.</p>
        <p style="color:#b39062; font-weight:600; margin-bottom:24px;">⚡ The course starts April 1st — enrollment is open now.</p>
        <a href="{{CTA_URL}}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:16px 36px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:17px; font-weight:700; max-width:420px; width:100%;">
          {{CTA_BUTTON_TEXT}}
        </a>
      </div>
    `,

    content: `
      <h2 style="color:#b39062; margin-bottom:20px;">Your Core Pattern: False Self-View</h2>

      <p>The core strategy behind False Self-View is to use a "mask" to be safe.</p>
      <p>We do this by attaching to untrue — usually negative — views of ourselves: <em>I am not worthy. I am flawed. I am not good enough.</em></p>
      <p>Another way this shows up is by assuming identities to create a buffer between ourselves and others for protection — being the entrepreneur, the provider, the tough one. The mask keeps us safe. It also keeps us isolated.</p>

      <p style="background:rgba(179,144,98,0.07); border-left:3px solid #b39062; padding:14px 18px; border-radius:0 8px 8px 0; font-style:italic; line-height:1.75;">This pattern didn't start with money. It started much earlier — as a strategy your younger self developed to stay safe in a world that felt uncertain. That strategy made sense then. It's been running on autopilot ever since, quietly shaping every financial decision you've made as an adult.</p>

      <h3 style="margin-top:28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Undercharging for your work or accepting less than you're worth</li>
        <li>Taking on overwhelming obligations to prove you're enough</li>
        <li>Financial avoidance — not looking at accounts, scattering resources</li>
        <li>Self-sabotaging just before success because some part of you believes you don't deserve it</li>
      </ul>

      <h3 style="margin-top:28px;">Questions to reflect on:</h3>
      <ul>
        <li>Do you ever feel like you're the cause of failure or harm to others?</li>
        <li>Do you feel like you have to "take on the weight of the world?"</li>
        <li>Do you put on different masks for different people — and feel exhausted by it?</li>
      </ul>

      <h3 style="margin-top:28px;">There is hope.</h3>
      <p>The core driver of False Self-View is a lack of self-love. When you learn to work within the true nature of love — rather than the backward version your subconscious learned — you can draw people closer. And in that closeness, you discover that your truth is perfect and you are worthy of love and support.</p>
      <p style="font-style:italic; color:#b39062; font-size:18px; margin:24px 0; padding:16px; border-left:3px solid #b39062;">
        "What would be true for me if every action I took was a clear expression of my best self?"
      </p>
    `,
  },

  ExVal: {
    name: 'External Validation',

    teaser: `
      <p style="font-weight:600; color:#f0eaf7; margin-bottom:10px;">Your dominant pattern: External Validation</p>
      <p style="font-size:16px; line-height:1.75; margin-bottom:10px;">Your financial decisions are being shaped by an audience that isn't in the room. Your full report reveals exactly how — and what financial freedom looks like when you stop performing for them.</p>
      <p style="color:#b0a0c0; font-size:14px; font-style:italic;">Enter your email to receive your personalized Financial TruPath report.</p>
    `,

    cta: `
      <div style="text-align:center; padding:36px 32px; background:rgba(179,144,98,0.08); border:1px solid rgba(179,144,98,0.35); border-radius:14px; margin:40px 0;">
        <p style="font-size:13px; color:#b0a0c0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px;">Ready to break the pattern?</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">You understand how money works. What this assessment just surfaced is something the spreadsheets can't see: every financial decision you make passes through a filter of how it will land with others — and that filter is costing you more than you realize.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">Real financial freedom isn't just about building wealth. It's about building it for the right reasons — not as proof of anything, not for anyone's approval, but for yours.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:28px; text-align:left;">Financial TruPath is the 12-week program that bridges Financial IQ into Financial EQ — so the decisions you already know how to make start coming from a place that actually serves you.</p>
        <p style="color:#b39062; font-weight:600; margin-bottom:24px;">⚡ The course starts April 1st — enrollment is open now.</p>
        <a href="{{CTA_URL}}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:16px 36px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:17px; font-weight:700; max-width:420px; width:100%;">
          {{CTA_BUTTON_TEXT}}
        </a>
      </div>
    `,

    content: `
      <h2 style="color:#b39062; margin-bottom:20px;">Your Core Pattern: External Validation</h2>

      <p>The core strategy behind External Validation is the need to be accepted, valued, or recognized to feel safe.</p>
      <p>In this pattern, we give up ourselves — doing what we think others value, acting in ways we think others want. We often feel underappreciated, unseen, or like we don't belong.</p>

      <p style="background:rgba(179,144,98,0.07); border-left:3px solid #b39062; padding:14px 18px; border-radius:0 8px 8px 0; font-style:italic; line-height:1.75;">This pattern didn't start with money. It started much earlier — as a strategy your younger self developed to stay safe in a world that felt uncertain. That strategy made sense then. It's been running on autopilot ever since, quietly shaping every financial decision you've made as an adult.</p>

      <h3 style="margin-top:28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Spending to impress others — purchases driven by how they'll look, not what you actually want</li>
        <li>Financial people-pleasing — lending money you can't afford, covering others' expenses to be liked</li>
        <li>Tying your financial self-worth to others' opinions of your success</li>
        <li>Underearning because you haven't received external validation that you deserve more</li>
      </ul>

      <h3 style="margin-top:28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you seek approval and acceptance from others, even when it costs you something?</li>
        <li>Where do you feel a lack of recognition that causes you to pull back or self-limit?</li>
        <li>When do you make financial decisions based on how they'll look to others?</li>
      </ul>

      <h3 style="margin-top:28px;">There is hope.</h3>
      <p>The core driver of External Validation is an underlying lack of self-worth. Someone who truly loves themselves does not rely on others' views to determine their value. By building a strong foundation of self-worth, you stop making financial decisions for an audience — and start making them for yourself.</p>
      <p style="font-style:italic; color:#b39062; font-size:18px; margin:24px 0; padding:16px; border-left:3px solid #b39062;">
        "What would be true for me if I were worthy of infinite, unconditional, non-judgmental love?"
      </p>
    `,
  },

  Showing: {
    name: 'Issues Showing Love',

    teaser: `
      <p style="font-weight:600; color:#f0eaf7; margin-bottom:10px;">Your dominant pattern: Issues Showing Love</p>
      <p style="font-size:16px; line-height:1.75; margin-bottom:10px;">Your generosity is real. So is the pattern underneath it that's been funding everyone's goals but yours. Your full report shows you where the line is — and how to stop paying for it.</p>
      <p style="color:#b0a0c0; font-size:14px; font-style:italic;">Enter your email to receive your personalized Financial TruPath report.</p>
    `,

    cta: `
      <div style="text-align:center; padding:36px 32px; background:rgba(179,144,98,0.08); border:1px solid rgba(179,144,98,0.35); border-radius:14px; margin:40px 0;">
        <p style="font-size:13px; color:#b0a0c0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px;">Ready to break the pattern?</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">You know how to create, keep, and multiply money. What this assessment just revealed is a pattern that keeps redirecting it — to obligations that weren't yours to carry, to people who needed rescuing, to a version of love that costs you your own financial security.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">The stress isn't about the giving. It's about what got wired underneath it: the belief that your sacrifice is what proves you care.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:28px; text-align:left;">Financial TruPath is the 12-week program that rewires that belief at the source — so you can be genuinely generous and genuinely financially free, without one costing you the other.</p>
        <p style="color:#b39062; font-weight:600; margin-bottom:24px;">⚡ The course starts April 1st — enrollment is open now.</p>
        <a href="{{CTA_URL}}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:16px 36px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:17px; font-weight:700; max-width:420px; width:100%;">
          {{CTA_BUTTON_TEXT}}
        </a>
      </div>
    `,

    content: `
      <h2 style="color:#b39062; margin-bottom:20px;">Your Core Pattern: Issues Showing Love</h2>

      <p>The core strategy behind Issues with Showing Love is to suffer or sacrifice when showing love or care for another.</p>
      <p>Often, we feel like it's up to us to serve everyone around us — and if it's hard or painful for us, that sacrifice makes it more valuable to those we serve. We know everyone around us deserves happiness, fulfillment, and love. But not us.</p>

      <p style="background:rgba(179,144,98,0.07); border-left:3px solid #b39062; padding:14px 18px; border-radius:0 8px 8px 0; font-style:italic; line-height:1.75;">This pattern didn't start with money. It started much earlier — as a strategy your younger self developed to stay safe in a world that felt uncertain. That strategy made sense then. It's been running on autopilot ever since, quietly shaping every financial decision you've made as an adult.</p>

      <h3 style="margin-top:28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Giving money to others when you can't afford to — and feeling guilty when you don't</li>
        <li>Financial self-sacrifice that enables others' dysfunction</li>
        <li>Difficulty receiving financial support, gifts, or help from others</li>
        <li>A pattern of building others up financially while neglecting your own security</li>
      </ul>

      <h3 style="margin-top:28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you choose a path that results in your own suffering in order to benefit another?</li>
        <li>Where do you feel isolated despite giving so much to others?</li>
        <li>When someone tries to give to you, do you feel uncomfortable or find ways to deflect it?</li>
      </ul>

      <h3 style="margin-top:28px;">There is hope.</h3>
      <p>You have spent so much of your life supporting others that an avalanche of love is waiting for you — all you need to do is let it in. Learning to receive is not weakness. It's what closes the loop that allows love to flow both ways.</p>
      <p style="font-style:italic; color:#b39062; font-size:18px; margin:24px 0; padding:16px; border-left:3px solid #b39062;">
        "What would be true for me if I had access to infinite unconditional love at all times?"
      </p>
    `,
  },

  Receiving: {
    name: 'Issues Receiving Love',

    teaser: `
      <p style="font-weight:600; color:#f0eaf7; margin-bottom:10px;">Your dominant pattern: Issues Receiving Love</p>
      <p style="font-size:16px; line-height:1.75; margin-bottom:10px;">There's a quiet belief running underneath your finances that having money changes things in ways you don't want. Your full report names it clearly — and shows you what financial independence actually looks like on the other side of it.</p>
      <p style="color:#b0a0c0; font-size:14px; font-style:italic;">Enter your email to receive your personalized Financial TruPath report.</p>
    `,

    cta: `
      <div style="text-align:center; padding:36px 32px; background:rgba(179,144,98,0.08); border:1px solid rgba(179,144,98,0.35); border-radius:14px; margin:40px 0;">
        <p style="font-size:13px; color:#b0a0c0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px;">Ready to break the pattern?</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">You understand money intellectually. What this assessment just uncovered is something quieter — a belief running underneath the surface that financial independence creates debt, obligation, or moral compromise.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">That belief doesn't announce itself. It just keeps making sure you stay more dependent than you need to be, more reliant on others' resources than your own, more disconnected from the freedom you've been working toward.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:28px; text-align:left;">Financial TruPath is the 12-week program built for exactly this: the gap between knowing how money works and actually allowing it to work for you.</p>
        <p style="color:#b39062; font-weight:600; margin-bottom:24px;">⚡ The course starts April 1st — enrollment is open now.</p>
        <a href="{{CTA_URL}}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:16px 36px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:17px; font-weight:700; max-width:420px; width:100%;">
          {{CTA_BUTTON_TEXT}}
        </a>
      </div>
    `,

    content: `
      <h2 style="color:#b39062; margin-bottom:20px;">Your Core Pattern: Issues Receiving Love</h2>

      <p>The core strategy with Issues Receiving Love is emotional disconnection — avoiding emotions, or surrounding ourselves with people who are unable (or unwilling) to show us love.</p>
      <p>The core driver is a deep-seated belief that love leads to pain, so it's safer to avoid it. We create distance to stay safe. That distance then confirms our felt isolation.</p>

      <p style="background:rgba(179,144,98,0.07); border-left:3px solid #b39062; padding:14px 18px; border-radius:0 8px 8px 0; font-style:italic; line-height:1.75;">This pattern didn't start with money. It started much earlier — as a strategy your younger self developed to stay safe in a world that felt uncertain. That strategy made sense then. It's been running on autopilot ever since, quietly shaping every financial decision you've made as an adult.</p>

      <h3 style="margin-top:28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Financial isolation — handling money entirely alone, refusing help even when it would benefit you</li>
        <li>Rejecting windfalls, gifts, or favorable opportunities (they must have strings attached)</li>
        <li>Surrounding yourself with people who take financially rather than build with you</li>
        <li>A pattern of self-sufficiency that tips into self-sabotage</li>
      </ul>

      <h3 style="margin-top:28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you live in the fear that others will hurt or leave you if you show vulnerability?</li>
        <li>Do you have people around you who cannot or will not express genuine care for you?</li>
        <li>When someone offers you genuine financial support or partnership, what happens inside you?</li>
      </ul>

      <h3 style="margin-top:28px;">There is hope.</h3>
      <p>When you learn to be vulnerable by showing love despite the perceived risks, you create the opportunity for others to receive your love. It is in that reception that you finally get to experience the connection you've been protecting yourself from.</p>
      <p style="font-style:italic; color:#b39062; font-size:18px; margin:24px 0; padding:16px; border-left:3px solid #b39062;">
        "What would be true for me if I were the source of infinite, unconditional love?"
      </p>
    `,
  },

  Control: {
    name: 'Control Leading to Isolation',

    teaser: `
      <p style="font-weight:600; color:#f0eaf7; margin-bottom:10px;">Your dominant pattern: Control Leading to Isolation</p>
      <p style="font-size:16px; line-height:1.75; margin-bottom:10px;">Your discipline is real. So is the pattern that's been using it to keep you going without. Your full report reveals exactly how — and what it looks like to have control without the scarcity it's been buying.</p>
      <p style="color:#b0a0c0; font-size:14px; font-style:italic;">Enter your email to receive your personalized Financial TruPath report.</p>
    `,

    cta: `
      <div style="text-align:center; padding:36px 32px; background:rgba(179,144,98,0.08); border:1px solid rgba(179,144,98,0.35); border-radius:14px; margin:40px 0;">
        <p style="font-size:13px; color:#b0a0c0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px;">Ready to break the pattern?</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">You're disciplined. You track, you plan, you know more than most people in the room about how money is supposed to work. What this assessment just revealed is where all of that discipline is turning against you.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">The stress you feel isn't from lack of control. It's from a pattern that channels your control into going without — undercharging, under-collecting, holding resources you won't use — because somewhere underneath it, scarcity feels safer than trust.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:28px; text-align:left;">Financial TruPath is the 12-week program that addresses the belief that's been making your financial intelligence work against your financial freedom.</p>
        <p style="color:#b39062; font-weight:600; margin-bottom:24px;">⚡ The course starts April 1st — enrollment is open now.</p>
        <a href="{{CTA_URL}}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:16px 36px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:17px; font-weight:700; max-width:420px; width:100%;">
          {{CTA_BUTTON_TEXT}}
        </a>
      </div>
    `,

    content: `
      <h2 style="color:#b39062; margin-bottom:20px;">Your Core Pattern: Control Leading to Isolation</h2>

      <p>The core strategy behind the need for Control is that we must maintain control of our environment to stay safe.</p>
      <p>The more we feel the need to control things, the more fear we live in — which reinforces the need for control. It's a self-tightening loop that always leads to isolation.</p>

      <p style="background:rgba(179,144,98,0.07); border-left:3px solid #b39062; padding:14px 18px; border-radius:0 8px 8px 0; font-style:italic; line-height:1.75;">This pattern didn't start with money. It started much earlier — as a strategy your younger self developed to stay safe in a world that felt uncertain. That strategy made sense then. It's been running on autopilot ever since, quietly shaping every financial decision you've made as an adult.</p>

      <h3 style="margin-top:28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Hoarding money or resources — having it but refusing to deploy it</li>
        <li>Undercharging because charging your full worth feels dangerous</li>
        <li>Refusing to delegate or share financial control with partners, accountants, or advisors</li>
        <li>Micromanaging every financial decision to the point of inaction</li>
      </ul>

      <h3 style="margin-top:28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you feel a need to control someone, something, or some feeling?</li>
        <li>What do you use to distract yourself from uncomfortable emotions about money?</li>
        <li>Where has the need for control cost you a financial relationship or opportunity?</li>
      </ul>

      <h3 style="margin-top:28px;">There is hope.</h3>
      <p>The core driver is living in the lie that you can control anything in this world. As soon as you release the need for control, you experience true freedom. What's required is courage — not the absence of fear, but taking action despite it.</p>
      <p style="font-style:italic; color:#b39062; font-size:18px; margin:24px 0; padding:16px; border-left:3px solid #b39062;">
        "What would be true for me if I had unlimited access to infinite unconditional love?"
      </p>
    `,
  },

  Fear: {
    name: 'Fear Leading to Isolation',

    teaser: `
      <p style="font-weight:600; color:#f0eaf7; margin-bottom:10px;">Your dominant pattern: Fear Leading to Isolation</p>
      <p style="font-size:16px; line-height:1.75; margin-bottom:10px;">You've been here before — close to a real breakthrough — and something intercepted it. Your full report names the pattern that's been doing that, and what it takes to finally stop it.</p>
      <p style="color:#b0a0c0; font-size:14px; font-style:italic;">Enter your email to receive your personalized Financial TruPath report.</p>
    `,

    cta: `
      <div style="text-align:center; padding:36px 32px; background:rgba(179,144,98,0.08); border:1px solid rgba(179,144,98,0.35); border-radius:14px; margin:40px 0;">
        <p style="font-size:13px; color:#b0a0c0; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px;">Ready to break the pattern?</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">You can see the strategies. You know what to do. What this assessment just named is the pattern that keeps intercepting the execution — the wrong trust, the missing protection, the project that stops just before the breakthrough.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:14px; text-align:left;">From the outside it can look like bad luck. From the inside, you may already know it isn't.</p>
        <p style="color:#f0eaf7; font-size:16px; line-height:1.75; margin-bottom:28px; text-align:left;">Financial TruPath is the 12-week program that goes to the source of that pattern — so the financial knowledge you've already built stops running into the same invisible wall, and real momentum becomes possible.</p>
        <p style="color:#b39062; font-weight:600; margin-bottom:24px;">⚡ The course starts April 1st — enrollment is open now.</p>
        <a href="{{CTA_URL}}" target="_blank"
           style="display:inline-block; background:#b39062; color:#26103d; padding:16px 36px; border-radius:8px; text-decoration:none; font-family:'Rubik',Arial,sans-serif; font-size:17px; font-weight:700; max-width:420px; width:100%;">
          {{CTA_BUTTON_TEXT}}
        </a>
      </div>
    `,

    content: `
      <h2 style="color:#b39062; margin-bottom:20px;">Your Core Pattern: Fear Leading to Isolation</h2>

      <p>The core strategy behind Fear Leading to Isolation is the sense that we control nothing in our world — and in that, we are never safe.</p>
      <p>We love to think about and worry about worst-case scenarios. We find ourselves stuck in inaction or overanalysis. We create distance from others to stay safe, and that distance confirms our belief that we are not lovable.</p>

      <p style="background:rgba(179,144,98,0.07); border-left:3px solid #b39062; padding:14px 18px; border-radius:0 8px 8px 0; font-style:italic; line-height:1.75;">This pattern didn't start with money. It started much earlier — as a strategy your younger self developed to stay safe in a world that felt uncertain. That strategy made sense then. It's been running on autopilot ever since, quietly shaping every financial decision you've made as an adult.</p>

      <h3 style="margin-top:28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Financial paralysis — knowing what to do but being unable to act</li>
        <li>Catastrophizing around money decisions, even small ones</li>
        <li>Lack of financial protection (insurance, savings, legal structures) because planning feels pointless</li>
        <li>Trusting the wrong people financially because they represent familiar chaos</li>
      </ul>

      <h3 style="margin-top:28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you default to worst-case thinking about money?</li>
        <li>Where does inaction or overanalysis show up in your financial life?</li>
        <li>Where has distance and isolation prevented financial partnership or growth?</li>
      </ul>

      <h3 style="margin-top:28px;">There is hope.</h3>
      <p>Fear is a gift — it either keeps us safe or creates the opportunity for courage. What's true is that courage is not the absence of fear; it's taking action despite fear. There are formulas for courage and confidence that let you look at any situation and take it on, regardless of the fear present.</p>
      <p style="font-style:italic; color:#b39062; font-size:18px; margin:24px 0; padding:16px; border-left:3px solid #b39062;">
        "What would be true for me if I could never be hurt?"
      </p>
    `,
  },

  get(patternKey) {
    return this[patternKey] || null;
  },

  getCtaHtml(patternKey) {
    const template = this.get(patternKey);
    if (!template || !template.cta) return '';
    return template.cta
      .replace(/\{\{CTA_URL\}\}/g, CONFIG.CTA_URL)
      .replace(/\{\{CTA_BUTTON_TEXT\}\}/g, CONFIG.CTA_BUTTON_TEXT);
  },

};
