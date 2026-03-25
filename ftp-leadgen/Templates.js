'use strict';

/**
 * Templates.js — Strategy report content (all 6 patterns)
 *
 * Each template has:
 *   name        — display name
 *   teaser      — 2-3 sentence hook shown BEFORE email gate
 *   content     — full HTML shown in the report (post-gate)
 *
 * Copy source: main FTP-v3 Tool1Templates.js, adapted for cold lead context.
 * The commonIntro, commonFooter, and sales_cta blocks are shared.
 */

const Templates = {

  // ── Shared blocks ──────────────────────────────────────────────────────────

  commonIntro: `
    <p>Where there is the experience of fear, there is no experience of love. Where there is the experience of love, there is no experience of fear.</p>
    <p>Trauma is always produced in fear — and it always creates a strategy based on disconnection.</p>
    <p>In the distillation of thousands of traumatic strategies, they all regress to three types of disconnection, each with an active and passive expression:</p>

    <div style="margin: 20px 0; padding: 18px 22px; background: rgba(173,145,104,0.08); border-left: 4px solid #ad9168; border-radius: 0 8px 8px 0;">
      <strong style="color: #ad9168;">Disconnection from Self</strong><br>
      False Self-View — Active &nbsp;|&nbsp; External Validation — Passive<br><br>
      <strong style="color: #ad9168;">Disconnection from Others</strong><br>
      Issues Showing Love — Active &nbsp;|&nbsp; Issues Receiving Love — Passive<br><br>
      <strong style="color: #ad9168;">Disconnection from All That is Greater</strong><br>
      Need for Control Leading to Isolation — Active &nbsp;|&nbsp; Living in Fear Leading to Isolation — Passive
    </div>

    <p>We each weave all six of these strategies together in our unique way — yet we also have a primary driving strategy. Yours is identified below.</p>
  `,

  // ── PLACEHOLDER: Russel's sales copy drops in here ─────────────────────────
  //
  // Replace the content inside <!-- SALES_COPY_START --> / <!-- SALES_COPY_END -->
  // with Russel's copy. The CTA button URL is set in Config.js.
  //
  salesCta: `
    <!-- SALES_COPY_START -->
    <div class="sales-block" style="text-align: center; padding: 32px; background: rgba(173,145,104,0.08); border: 1px solid rgba(173,145,104,0.3); border-radius: 12px; margin: 40px 0;">
      <h3 style="font-size: 22px; margin-bottom: 12px;">[PLACEHOLDER: RUSSEL'S HEADLINE]</h3>
      <p style="color: #94a3b8; margin-bottom: 8px;">[PLACEHOLDER: Russel's 2-3 sentence sales copy goes here. Describe the transformation TruPath delivers and why now is the moment to act.]</p>
      <p style="color: #94a3b8; margin-bottom: 24px;">[PLACEHOLDER: Optional second paragraph — social proof, urgency, or what they'll specifically get.]</p>
      <a href="{{CTA_URL}}" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 16px 36px; font-size: 17px; max-width: 360px;">
        {{CTA_BUTTON_TEXT}}
      </a>
    </div>
    <!-- SALES_COPY_END -->
  `,

  commonFooter: `
    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(173,145,104,0.25); text-align: center;">
      <p style="color: #94a3b8; font-size: 14px;">
        Questions? Reach us at <a href="mailto:admin@trupathmastery.com" style="color: #ad9168;">admin@trupathmastery.com</a>
      </p>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">
        &copy; ${new Date().getFullYear()} TruPath. All rights reserved.
      </p>
    </div>
  `,

  // ── Pattern Templates ──────────────────────────────────────────────────────

  FSV: {
    name: 'False Self-View',
    teaser: `Your assessment reveals <strong>False Self-View</strong> as your dominant financial pattern. This means your subconscious is running a strategy of using a "mask" to stay safe — and it's directly affecting your financial decisions in ways you may not have recognized.`,
    content: `
      <h2 style="color: #ad9168; margin-bottom: 20px;">Your Core Pattern: False Self-View</h2>

      <p>The core strategy behind False Self-View is to use a "mask" to be safe.</p>
      <p>We do this by attaching to untrue — usually negative — views of ourselves: <em>I am not worthy. I am flawed. I am not good enough.</em></p>
      <p>Another way this shows up is by assuming identities to create a buffer between ourselves and others for protection — being the entrepreneur, the provider, the tough one. The mask keeps us safe. It also keeps us isolated.</p>

      <h3 style="margin-top: 28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Undercharging for your work or accepting less than you're worth</li>
        <li>Taking on overwhelming obligations to prove you're enough</li>
        <li>Financial avoidance — not looking at accounts, scattering resources</li>
        <li>Self-sabotaging just before success because some part of you believes you don't deserve it</li>
      </ul>

      <h3 style="margin-top: 28px;">Questions to reflect on:</h3>
      <ul>
        <li>Do you ever feel like you're the cause of failure or harm to others?</li>
        <li>Do you feel like you have to "take on the weight of the world?"</li>
        <li>Do you put on different masks for different people — and feel exhausted by it?</li>
      </ul>

      <h3 style="margin-top: 28px;">There is hope.</h3>
      <p>The core driver of False Self-View is a lack of self-love. When you learn to work within the true nature of love — rather than the backward version your subconscious learned — you can draw people closer. And in that closeness, you discover that your truth is perfect and you are worthy of love and support.</p>
      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 24px 0; padding: 16px; border-left: 3px solid #ad9168;">
        "What would be true for me if every action I took was a clear expression of my best self?"
      </p>
    `,
  },

  ExVal: {
    name: 'External Validation',
    teaser: `Your assessment reveals <strong>External Validation</strong> as your dominant financial pattern. Your subconscious has learned that acceptance and recognition from others is the key to safety — and that belief is shaping your financial decisions in ways that may be costing you.`,
    content: `
      <h2 style="color: #ad9168; margin-bottom: 20px;">Your Core Pattern: External Validation</h2>

      <p>The core strategy behind External Validation is the need to be accepted, valued, or recognized to feel safe.</p>
      <p>In this pattern, we give up ourselves — doing what we think others value, acting in ways we think others want. We often feel underappreciated, unseen, or like we don't belong.</p>

      <h3 style="margin-top: 28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Spending to impress others — purchases driven by how they'll look, not what you actually want</li>
        <li>Financial people-pleasing — lending money you can't afford, covering others' expenses to be liked</li>
        <li>Tying your financial self-worth to others' opinions of your success</li>
        <li>Underearning because you haven't received external validation that you deserve more</li>
      </ul>

      <h3 style="margin-top: 28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you seek approval and acceptance from others, even when it costs you something?</li>
        <li>Where do you feel a lack of recognition that causes you to pull back or self-limit?</li>
        <li>When do you make financial decisions based on how they'll look to others?</li>
      </ul>

      <h3 style="margin-top: 28px;">There is hope.</h3>
      <p>The core driver of External Validation is an underlying lack of self-worth. Someone who truly loves themselves does not rely on others' views to determine their value. By building a strong foundation of self-worth, you stop making financial decisions for an audience — and start making them for yourself.</p>
      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 24px 0; padding: 16px; border-left: 3px solid #ad9168;">
        "What would be true for me if I were worthy of infinite, unconditional, non-judgmental love?"
      </p>
    `,
  },

  Showing: {
    name: 'Issues Showing Love',
    teaser: `Your assessment reveals <strong>Issues Showing Love</strong> as your dominant financial pattern. Your subconscious has learned that love requires suffering or sacrifice — and that belief is driving financial choices that leave you giving everything while receiving very little.`,
    content: `
      <h2 style="color: #ad9168; margin-bottom: 20px;">Your Core Pattern: Issues Showing Love</h2>

      <p>The core strategy behind Issues with Showing Love is to suffer or sacrifice when showing love or care for another.</p>
      <p>Often, we feel like it's up to us to serve everyone around us — and if it's hard or painful for us, that sacrifice makes it more valuable to those we serve. We know everyone around us deserves happiness, fulfillment, and love. But not us.</p>

      <h3 style="margin-top: 28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Giving money to others when you can't afford to — and feeling guilty when you don't</li>
        <li>Financial self-sacrifice that enables others' dysfunction</li>
        <li>Difficulty receiving financial support, gifts, or help from others</li>
        <li>A pattern of building others up financially while neglecting your own security</li>
      </ul>

      <h3 style="margin-top: 28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you choose a path that results in your own suffering in order to benefit another?</li>
        <li>Where do you feel isolated despite giving so much to others?</li>
        <li>When someone tries to give to you, do you feel uncomfortable or find ways to deflect it?</li>
      </ul>

      <h3 style="margin-top: 28px;">There is hope.</h3>
      <p>You have spent so much of your life supporting others that an avalanche of love is waiting for you — all you need to do is let it in. Learning to receive is not weakness. It's what closes the loop that allows love to flow both ways.</p>
      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 24px 0; padding: 16px; border-left: 3px solid #ad9168;">
        "What would be true for me if I had access to infinite unconditional love at all times?"
      </p>
    `,
  },

  Receiving: {
    name: 'Issues Receiving Love',
    teaser: `Your assessment reveals <strong>Issues Receiving Love</strong> as your dominant financial pattern. Your subconscious has learned that receiving love leads to pain — so it protects you through emotional disconnection. That protection is costing you financially in ways that are worth understanding.`,
    content: `
      <h2 style="color: #ad9168; margin-bottom: 20px;">Your Core Pattern: Issues Receiving Love</h2>

      <p>The core strategy with Issues Receiving Love is emotional disconnection — avoiding emotions, or surrounding ourselves with people who are unable (or unwilling) to show us love.</p>
      <p>The core driver is a deep-seated belief that love leads to pain, so it's safer to avoid it. We create distance to stay safe. That distance then confirms our felt isolation.</p>

      <h3 style="margin-top: 28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Financial isolation — handling money entirely alone, refusing help even when it would benefit you</li>
        <li>Rejecting windfalls, gifts, or favorable opportunities (they must have strings attached)</li>
        <li>Surrounding yourself with people who take financially rather than build with you</li>
        <li>A pattern of self-sufficiency that tips into self-sabotage</li>
      </ul>

      <h3 style="margin-top: 28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you live in the fear that others will hurt or leave you if you show vulnerability?</li>
        <li>Do you have people around you who cannot or will not express genuine care for you?</li>
        <li>When someone offers you genuine financial support or partnership, what happens inside you?</li>
      </ul>

      <h3 style="margin-top: 28px;">There is hope.</h3>
      <p>When you learn to be vulnerable by showing love despite the perceived risks, you create the opportunity for others to receive your love. It is in that reception that you finally get to experience the connection you've been protecting yourself from.</p>
      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 24px 0; padding: 16px; border-left: 3px solid #ad9168;">
        "What would be true for me if I were the source of infinite, unconditional love?"
      </p>
    `,
  },

  Control: {
    name: 'Control Leading to Isolation',
    teaser: `Your assessment reveals <strong>Control Leading to Isolation</strong> as your dominant financial pattern. Your subconscious believes that maintaining control of your environment is the only path to safety — and that belief is creating isolation in your financial life.`,
    content: `
      <h2 style="color: #ad9168; margin-bottom: 20px;">Your Core Pattern: Control Leading to Isolation</h2>

      <p>The core strategy behind the need for Control is that we must maintain control of our environment to stay safe.</p>
      <p>The more we feel the need to control things, the more fear we live in — which reinforces the need for control. It's a self-tightening loop that always leads to isolation.</p>

      <h3 style="margin-top: 28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Hoarding money or resources — having it but refusing to deploy it</li>
        <li>Undercharging because charging your full worth feels dangerous</li>
        <li>Refusing to delegate or share financial control with partners, accountants, or advisors</li>
        <li>Micromanaging every financial decision to the point of inaction</li>
      </ul>

      <h3 style="margin-top: 28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you feel a need to control someone, something, or some feeling?</li>
        <li>What do you use to distract yourself from uncomfortable emotions about money?</li>
        <li>Where has the need for control cost you a financial relationship or opportunity?</li>
      </ul>

      <h3 style="margin-top: 28px;">There is hope.</h3>
      <p>The core driver is living in the lie that you can control anything in this world. As soon as you release the need for control, you experience true freedom. What's required is courage — not the absence of fear, but taking action despite it.</p>
      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 24px 0; padding: 16px; border-left: 3px solid #ad9168;">
        "What would be true for me if I had unlimited access to infinite unconditional love?"
      </p>
    `,
  },

  Fear: {
    name: 'Fear Leading to Isolation',
    teaser: `Your assessment reveals <strong>Fear Leading to Isolation</strong> as your dominant financial pattern. Your subconscious lives with a constant sense that nothing is safe and the worst is coming — and that belief is producing very predictable financial behaviors worth examining.`,
    content: `
      <h2 style="color: #ad9168; margin-bottom: 20px;">Your Core Pattern: Fear Leading to Isolation</h2>

      <p>The core strategy behind Fear Leading to Isolation is the sense that we control nothing in our world — and in that, we are never safe.</p>
      <p>We love to think about and worry about worst-case scenarios. We find ourselves stuck in inaction or overanalysis. We create distance from others to stay safe, and that distance confirms our belief that we are not lovable.</p>

      <h3 style="margin-top: 28px;">How this pattern shows up in your finances:</h3>
      <ul>
        <li>Financial paralysis — knowing what to do but being unable to act</li>
        <li>Catastrophizing around money decisions, even small ones</li>
        <li>Lack of financial protection (insurance, savings, legal structures) because planning feels pointless</li>
        <li>Trusting the wrong people financially because they represent familiar chaos</li>
      </ul>

      <h3 style="margin-top: 28px;">Questions to reflect on:</h3>
      <ul>
        <li>Where do you default to worst-case thinking about money?</li>
        <li>Where does inaction or overanalysis show up in your financial life?</li>
        <li>Where has distance and isolation prevented financial partnership or growth?</li>
      </ul>

      <h3 style="margin-top: 28px;">There is hope.</h3>
      <p>Fear is a gift — it either keeps us safe or creates the opportunity for courage. What's true is that courage is not the absence of fear; it's taking action despite fear. There are formulas for courage and confidence that let you look at any situation and take it on, regardless of the fear present.</p>
      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 24px 0; padding: 16px; border-left: 3px solid #ad9168;">
        "What would be true for me if I could never be hurt?"
      </p>
    `,
  },

  /**
   * Get the template for a given pattern key
   */
  get(patternKey) {
    return this[patternKey] || null;
  },

};
