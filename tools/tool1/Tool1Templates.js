/**
 * Tool1Templates.js
 * Report templates for Core Trauma Strategy Assessment
 *
 * Each template contains the full report content for one of the 6 trauma strategies
 */

const Tool1Templates = {

  /**
   * Get report template for a specific strategy
   * @param {string} strategy - Strategy key (FSV, ExVal, Showing, Receiving, Control, Fear)
   * @returns {Object} Template object with content
   */
  getTemplate(strategy) {
    const templates = {
      'FSV': this.falseSelfView,
      'ExVal': this.externalValidation,
      'Showing': this.issuesShowingLove,
      'Receiving': this.issuesReceivingLove,
      'Control': this.controlLeadingToIsolation,
      'Fear': this.fearLeadingToIsolation
    };

    return templates[strategy] || null;
  },

  /**
   * Common introduction (shared across all reports)
   */
  commonIntro: `
    <p>Where there is the experience of fear, there is no experience of love. Where there is the experience of love, there is no experience of fear.</p>

    <p>Trauma is always produced in fear. Therefore, it is always a strategy based on disconnection.</p>

    <p>In the distillation of thousands of traumatic strategies, they all regressed to 3 types of disconnection with a passive and active manifestation of each.</p>

    <div style="margin: 20px 0; padding: 15px; background: rgba(173, 145, 104, 0.1); border-left: 4px solid #ad9168;">
      <strong>Disconnection from Self</strong><br>
      False Self-View - Active<br>
      External Validation - Passive<br><br>

      <strong>Disconnection from Others</strong><br>
      Issues Showing Love - Active<br>
      Issues Receiving Love - Passive<br><br>

      <strong>Disconnection from All That is Greater Than Us</strong><br>
      Need for Control Leading to Isolation - Active<br>
      Living in Fear Leading to Isolation - Passive
    </div>

    <p>We each weave all 6 of these strategies together in our unique way, yet we also all have a primary driving strategy.</p>
  `,

  /**
   * FALSE SELF-VIEW Template
   */
  falseSelfView: {
    name: 'False Self-View',
    category: 'FSV',
    content: `
      <h2>Your Core Trauma Strategy is False Self-View:</h2>

      <p>The core strategy behind False Self-View is to use a "mask" to be safe.</p>

      <p>We do this by attaching to untrue (usually negative) views of ourselves, such as I am not worthy, I am flawed, I am not good enough.</p>

      <p>Another way we do this is by assuming identities to create a buffer between ourselves and others for protection, such as being an entrepreneur, a Navy SEAL, or being tough.</p>

      <h3>Questions to ask yourself:</h3>
      <ul>
        <li>Do I ever feel like I am the cause of failure or harm to others in my life?</li>
        <li>Do I ever feel like I have to "take on the weight of the world?"</li>
        <li>Do I ever feel like I have to put on "masks" for those around me?</li>
      </ul>

      <h3>There is hope!</h3>

      <p>The core driver of needing to adopt a false self-view is a lack of feeling loved, particularly self-love. This drives the need to "put on a mask" to be loved.</p>

      <p>We do this by taking on big obligations that end up creating distance from those who would show us love, because we are too busy or overwhelmed.</p>

      <p>What would be possible in your life if you learned how to work within the true nature of love (you currently have a backward view of love), you could create the experience of love in others on demand?</p>

      <p>Drawing them closer enables you to see that your Truth is perfect and you are worthy of love and support.</p>

      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 20px 0;">What would be true for me if every action I took was a clear expression of my best self?</p>
    `
  },

  /**
   * EXTERNAL VALIDATION Template
   */
  externalValidation: {
    name: 'External Validation',
    category: 'ExVal',
    content: `
      <h2>Your Core Trauma Strategy is External Validation:</h2>

      <p>The core strategy behind external validation is the need to be accepted, valued, or recognized to feel safe.</p>

      <p>In this one, we give up ourselves to be something, do what we think others value, or act in a way that we think others want.</p>

      <p>In this, we often feel underappreciated, unseen, or like we don't belong in the group.</p>

      <p>We often feel like we've lost ourselves by trying to be something we're not for those around us.</p>

      <h3>Questions</h3>
      <ul>
        <li>Where in my life do I seek to gain approval and acceptance from others?</li>
        <li>Where in my life do I feel a lack of recognition that has me pull back from others?</li>
        <li>When do I feel a fear that I will not be loved?</li>
      </ul>

      <h3>Hope</h3>

      <p>The core driver of this set of problems is an underlying lack of self-worth.</p>

      <p>Someone who truly and deeply loves themselves and knows that they are a perfect physical manifestation of love does not rely on the views of others to determine their worth.</p>

      <p>By creating a strong foundation through self-love, we enable ourselves to show love to others and receive love in return. Through the love of others, we feel connected to all that is greater than us.</p>

      <p>What would be possible in your life if you could create self-worth on demand?</p>

      <p>There is a formula for building self-worth, and through this formula, you can find your love of self.</p>

      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 20px 0;">What would be true for me if I were worthy of infinite, unconditional, non-judgmental love?</p>
    `
  },

  /**
   * ISSUES SHOWING LOVE Template
   */
  issuesShowingLove: {
    name: 'Issues Showing Love',
    category: 'Showing',
    content: `
      <h2>Your Core Trauma Strategy is Issues Showing Love:</h2>

      <p>The core strategy behind Issues with Showing Love is to suffer or sacrifice when showing love or care for another.</p>

      <p>Often, we feel like it's up to us to serve everyone around us, and if it's hard or painful for us, that sacrifice only makes it more valuable to those we serve.</p>

      <p>Another theme in this one is where we know that everyone around us deserves to be happy, fulfilled, and loved, but not us.</p>

      <p>This results in us being unable to receive from others. We have no problems giving to others, but if someone tries to give to us, we avoid it or feel uncomfortable.</p>

      <h3>Questions</h3>
      <ul>
        <li>Where in my life do I choose a path that results in my suffering in order to benefit another?</li>
        <li>Where in my life do I feel isolated?</li>
        <li>Where in my life do I isolate myself through my choices or obligations?</li>
      </ul>

      <h3>Hope</h3>

      <p>The core driver of this set of problems is the need to suffer or sacrifice in the showing of love. This creates a world where we always give to and support others, but do not receive love.</p>

      <p>To start living in love, you have to learn how to release the floodgates.</p>

      <p>You have spent so much of your life supporting others that an avalanche of love is waiting for you; all you need to do is let it in.</p>

      <p>What would be possible in your life if you could systematically create unbreakable circuits of love?</p>

      <p>The circuits of love enable you to create relationships of support and being supported.</p>

      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 20px 0;">What would be true for me if I had access to infinite unconditional love at all times?</p>
    `
  },

  /**
   * ISSUES RECEIVING LOVE Template
   */
  issuesReceivingLove: {
    name: 'Issues Receiving Love',
    category: 'Receiving',
    content: `
      <h2>Your Core Trauma Strategy is Issues Receiving Love:</h2>

      <p>The core strategy with issues receiving love is emotional disconnection, where we try to avoid experiencing our emotions or avoid emotional people.</p>

      <p>The core driver for this strategy is that we find it hard to accept love or care from others because we often think that love will cause pain, so it is easier just to avoid it.</p>

      <p>We create emotional disconnect (safety) by either avoiding our emotions, resulting in appearing distant to others, or by ensuring we surround ourselves with people who are either unable to show us love or even go so far as to hurt us.</p>

      <h3>Questions</h3>
      <ul>
        <li>Where in my life do I live in the fear that others will hurt me?</li>
        <li>Where in my life do I live in the fear that others will leave me?</li>
        <li>Where in my life do I have people who cannot express their feelings or emotions?</li>
      </ul>

      <h3>There is hope!</h3>

      <p>The core driver of this set of problems is the fear that if I expose myself to others by showing my love, I will be hurt.</p>

      <p>This requires us to choke off our emotions, creating distance between us and those around us. This distance then reinforces our felt isolation.</p>

      <p>When you learn to be vulnerable by showing love despite the perceived risks, you create the opportunity for others to receive your love.</p>

      <p>It is in their reception of your love that you get to experience the love that you desire.</p>

      <p>What would be possible in your life if you became the source of love for those around you?</p>

      <p>There are systematic ways to create these feelings of connection and safety.</p>

      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 20px 0;">What would be true for me if I were the source of infinite, unconditional love?</p>
    `
  },

  /**
   * CONTROL LEADING TO ISOLATION Template
   */
  controlLeadingToIsolation: {
    name: 'Control Leading to Isolation',
    category: 'Control',
    content: `
      <h2>Your Core Trauma Strategy is Control Leading to Isolation:</h2>

      <p>The core strategy behind the need for Control is that we must maintain control of our environment if we are going to stay safe.</p>

      <p>We can use the need to control everything from people, emotions, and tools.</p>

      <p>Think of an overly OCD person who needs everything to be in the exact right spot, and how this always leads to isolation.</p>

      <p>Often, the more we feel the need to control things in our lives, the more fear we live in that just reinforces our need for control.</p>

      <h3>Questions</h3>
      <ul>
        <li>Where in my life do I feel a need to control someone, something, or some feeling?</li>
        <li>Where in my life do I avoid doing something or feeling something by distracting myself?</li>
        <li>What do I use to distract myself?</li>
      </ul>

      <h3>There is hope!</h3>

      <p>The core driver of this set of problems is living in the lie that you can control anything in this world. As soon as you release your need for control, you experience true freedom.</p>

      <p>What is needed in order to give up your false need for the illusion of control is courage.</p>

      <p>Courage is not the absence of fear rather it is taking action despite fear.</p>

      <p>What would be possible in your life if you could develop courage in any situation on demand?</p>

      <p>There is a formula for courage, and when you know this formula, you have the ability to develop the power to influence any situation.</p>

      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 20px 0;">What would be true for me if I had unlimited access to infinite unconditional love?</p>
    `
  },

  /**
   * FEAR LEADING TO ISOLATION Template
   */
  fearLeadingToIsolation: {
    name: 'Fear Leading to Isolation',
    category: 'Fear',
    content: `
      <h2>Your Core Trauma Strategy is Fear Leading to Isolation:</h2>

      <p>The core strategy behind fear leading to isolation is the sense that we control nothing in our worlds, and in that, we are never safe.</p>

      <p>One of the actions we love to do is think of and worry about the worst-case scenarios.</p>

      <p>We often find ourselves stuck in inaction due to fear or overanalyzing.</p>

      <h3>Questions</h3>
      <ul>
        <li>Where in my life do I look for the worst-case scenarios, knowing I will suffer?</li>
        <li>Where in my life do I choose to create distance from others to be safe?</li>
        <li>What do I use loneliness to validate that I am not lovable?</li>
      </ul>

      <h3>There is hope!</h3>

      <p>The core driver of this set of problems is Fear, and a perceived loss of control always causes fear.</p>

      <p>We falsely believe that if we feel fear, we are weak and we want to avoid it, creating the opportunity for isolation.</p>

      <p>What is true, though, is that fear is a gift that either keeps us safe or creates the opportunity to act with courage.</p>

      <p>Courage is not the absence of fear; it is taking action despite fear.</p>

      <p>What would be possible in your life if you could create courage and confidence on demand?</p>

      <p>There are formulas for courage and confidence, and once you know these formulas you can look at any situation and come up with a plan to take it on with courage, acting despite your fear.</p>

      <p style="font-style: italic; color: #ad9168; font-size: 18px; margin: 20px 0;">What would be true for me if I could never be hurt?</p>
    `
  },

  /**
   * Common footer (shared across all reports)
   */
  commonFooter: `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ad9168;">
      <p>Thank you for trusting the TruPath team with your healing process. We are honored to serve you on your journey.</p>

      <p>Regards,<br>The TruPath Team</p>

      <p style="margin-top: 20px; font-size: 14px; color: #94a3b8;">
        <strong>PS:</strong> If you have any questions, contact your facilitator or The TruPath Team.<br>
        admin@trupathmastery.com
      </p>
    </div>
  `
};
