/**
 * Tool7.js
 * Security & Control Grounding Tool
 *
 * Addresses: Disconnection from All That's Greater
 * Domains: Control Leading to Isolation (CLI) / Fear Leading to Isolation (FLI)
 * Core Question: "Do you trust that life can work out, or do you feel you must control everything or protect yourself from inevitable disaster?"
 *
 * Uses: All 5 grounding utilities from core/grounding/
 */

const Tool7 = {

  // ============================================================
  // TOOL CONFIGURATION
  // ============================================================

  config: {
    id: 'tool7',
    name: 'Tool 7: Security & Control',
    shortName: 'Security & Control',
    scoreName: 'Disconnection from All That\'s Greater Quotient',
    purpose: 'Reveals patterns of disconnection from trust in life through control and fear-based isolation',

    // Domain configuration
    domain1Name: 'Control Leading to Isolation',
    domain1Key: 'domain1',
    domain1Description: 'Self-imposed suffering through rejection of help and systems',

    domain2Name: 'Fear Leading to Isolation',
    domain2Key: 'domain2',
    domain2Description: 'Creating disasters through catastrophic thinking and self-sabotage',

    // Subdomain configurations (6 total: 3 per domain)
    subdomains: [
      // ========================================
      // DOMAIN 1: CONTROL LEADING TO ISOLATION
      // ========================================
      {
        key: 'subdomain_1_1',
        label: "I Must Control Everything",
        description: 'Exploring patterns of needing total control that lead to exhaustion and isolation',
        beliefBehaviorConnection: 'Believing you must control everything leads to rejection of help and systems',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'If I don\'t personally control every financial detail, things will fall apart',
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain everything will collapse without my total control of every detail' },
              { value: -2, label: 'Agree - I firmly believe I must control all financial details; trusting anything else means failure' },
              { value: -1, label: 'Slightly agree - I often feel I must control everything, though I\'m questioning this need' },
              { value: 1, label: 'Slightly disagree - I\'m learning I can share control, though letting go feels dangerous' },
              { value: 2, label: 'Disagree - I generally know shared responsibility works, though occasional control urges emerge' },
              { value: 3, label: 'Strongly disagree - I completely trust that I don\'t need to control everything; collaboration and systems work' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I reject systems, tools, or help because I don\'t trust anything I don\'t personally manage',
            scale: [
              { value: -3, label: 'Always - I constantly reject all help and systems; everything must go through me personally' },
              { value: -2, label: 'Very often - I regularly refuse systems and help, maintaining total personal control' },
              { value: -1, label: 'Often - I frequently reject assistance and tools, unable to trust anything I don\'t control' },
              { value: 1, label: 'Occasionally - I sometimes reject help, working on trusting systems and others' },
              { value: 2, label: 'Rarely - I occasionally resist help, but generally embrace useful systems and support' },
              { value: 3, label: 'Never - I consistently use helpful systems and accept assistance; trust in collaboration' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxious and unsafe when I\'m not personally managing every financial detail',
            scale: [
              { value: -3, label: 'Always - Constant overwhelming anxiety and terror when I\'m not controlling everything' },
              { value: -2, label: 'Very often - Persistent severe anxiety about not being in complete control' },
              { value: -1, label: 'Often - Frequent anxiety and feeling unsafe when not personally managing everything' },
              { value: 1, label: 'Occasionally - Sometimes anxious about control, learning to trust others and systems' },
              { value: 2, label: 'Rarely - Occasional brief anxiety, but generally comfortable with shared responsibility' },
              { value: 3, label: 'Never - I feel completely safe with appropriate delegation; no anxiety about control' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'My need for control has exhausted me and prevented me from achieving financial goals',
            scale: [
              { value: -3, label: 'Always - Complete exhaustion and massive goal failure from trying to control everything' },
              { value: -2, label: 'Very often - Regular severe exhaustion and significant goal failure from control needs' },
              { value: -1, label: 'Often - Frequent exhaustion and goal sabotage due to control requirements' },
              { value: 1, label: 'Occasionally - Sometimes exhausted by control needs, working toward balance' },
              { value: 2, label: 'Rarely - Occasional tiredness from control, but generally maintain healthy balance' },
              { value: 3, label: 'Never - I maintain energy and achieve goals through healthy delegation and trust' }
            ]
          },
          // Open Response
          {
            text: 'What has your need for total control cost you specifically in terms of energy, opportunities, or relationships?'
          }
        ]
      },

      {
        key: 'subdomain_1_2',
        label: 'I Can\'t Trust Others',
        description: 'Exploring patterns of distrust that lead to isolated self-reliance',
        beliefBehaviorConnection: 'Believing others will fail you leads to isolated self-reliance',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'People will inevitably let me down financially; I can only count on myself',
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain everyone will fail me; only I am reliable' },
              { value: -2, label: 'Agree - I firmly believe others will let me down; trusting anyone is foolish' },
              { value: -1, label: 'Slightly agree - I often feel others will fail me, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning some people are trustworthy, though suspicion lingers' },
              { value: 2, label: 'Disagree - I generally believe most people are trustworthy, though occasional wariness appears' },
              { value: 3, label: 'Strongly disagree - I completely trust that many people are reliable and won\'t fail me' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I refuse to rely on anyone financially, even when I\'m struggling and they\'re reliable',
            scale: [
              { value: -3, label: 'Always - I absolutely never rely on anyone regardless of struggle; complete isolation' },
              { value: -2, label: 'Very often - I regularly refuse all financial reliance even when struggling severely' },
              { value: -1, label: 'Often - I frequently reject reliance on others despite need and their reliability' },
              { value: 1, label: 'Occasionally - I sometimes refuse help, working on accepting appropriate support' },
              { value: 2, label: 'Rarely - I occasionally resist reliance, but generally accept help when needed' },
              { value: 3, label: 'Never - I consistently accept appropriate help from reliable people; healthy interdependence' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel isolated and alone with my financial struggles because I can\'t let anyone help',
            scale: [
              { value: -3, label: 'Always - Constant crushing isolation and loneliness; completely alone with all financial burdens' },
              { value: -2, label: 'Very often - Persistent deep isolation from carrying everything alone' },
              { value: -1, label: 'Often - Frequent isolation and loneliness from refusing to let others in' },
              { value: 1, label: 'Occasionally - Sometimes feel isolated, learning to accept connection and support' },
              { value: 2, label: 'Rarely - Occasional loneliness, but generally feel connected and supported' },
              { value: 3, label: 'Never - I feel connected and supported; share burdens appropriately' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve stayed stuck financially and emotionally isolated by refusing to trust anyone, even when they were reliable',
            scale: [
              { value: -3, label: 'Always - Complete stagnation and crushing isolation from never trusting anyone, regardless of their reliability' },
              { value: -2, label: 'Very often - Regular pattern of staying stuck and isolated by refusing to trust reliable people' },
              { value: -1, label: 'Often - Frequently remain stuck and isolated from my refusal to trust' },
              { value: 1, label: 'Occasionally - I\'ve stayed stuck at times, working on trusting reliable people' },
              { value: 2, label: 'Rarely - Occasional stuckness from trust issues, but generally open to reliable help' },
              { value: 3, label: 'Never - I consistently trust reliable people and grow through collaboration; no isolation' }
            ]
          },
          // Open Response
          {
            text: 'Who in your life has proven themselves reliable with money, and what specifically stops you from trusting them?'
          }
        ]
      },

      {
        key: 'subdomain_1_3',
        label: 'Asking for Help Is Weakness',
        description: 'Exploring patterns of viewing help as failure that lead to martyr suffering',
        beliefBehaviorConnection: 'Believing help is weakness leads to martyr suffering',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Asking for help means I\'ve failed; I should be able to handle everything myself',
            scale: [
              { value: -3, label: 'Strongly agree - Asking for help absolutely means failure; I\'m worthless if I can\'t handle everything alone' },
              { value: -2, label: 'Agree - I firmly believe asking for help proves weakness and personal failure' },
              { value: -1, label: 'Slightly agree - I often feel asking for help is weakness, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning asking for help is strength, though it still feels like failure' },
              { value: 2, label: 'Disagree - I generally know asking for help is wise, though occasional shame surfaces' },
              { value: 3, label: 'Strongly disagree - I completely know asking for help is strength and wisdom, not weakness' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I struggle in silence rather than ask for help, support, or guidance',
            scale: [
              { value: -3, label: 'Always - I always suffer alone in complete silence; asking for help is impossible' },
              { value: -2, label: 'Very often - I regularly endure severe struggle alone rather than ask for support' },
              { value: -1, label: 'Often - I frequently suffer silently instead of seeking available help' },
              { value: 1, label: 'Occasionally - I sometimes struggle alone, working on reaching out for support' },
              { value: 2, label: 'Rarely - I occasionally resist asking, but generally seek help when needed' },
              { value: 3, label: 'Never - I consistently ask for help, support, and guidance when needed; no silent suffering' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel shame and inadequacy about needing help; I should be self-sufficient',
            scale: [
              { value: -3, label: 'Always - Overwhelming constant shame about any need; profound inadequacy about not being completely self-sufficient' },
              { value: -2, label: 'Very often - Deep persistent shame about needing anything; heavy inadequacy' },
              { value: -1, label: 'Often - Frequent shame and inadequacy feelings about needing help' },
              { value: 1, label: 'Occasionally - Sometimes feel ashamed about need, learning it\'s human not weakness' },
              { value: 2, label: 'Rarely - Occasional brief shame, but generally comfortable with interdependence' },
              { value: 3, label: 'Never - I feel no shame about appropriate need; understand interdependence is healthy' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve suffered unnecessarily by not asking for help that was readily available',
            scale: [
              { value: -3, label: 'Always - Severe repeated unnecessary suffering from never asking for readily available help' },
              { value: -2, label: 'Very often - Regular significant hardship refusing to ask for available support' },
              { value: -1, label: 'Often - Frequent unnecessary suffering by not seeking help that existed' },
              { value: 1, label: 'Occasionally - I\'ve suffered at times not asking, working on reaching out' },
              { value: 2, label: 'Rarely - Occasional unnecessary difficulty, but generally ask when needed' },
              { value: 3, label: 'Never - I consistently ask for available help; no unnecessary suffering from pride' }
            ]
          },
          // Open Response
          {
            text: 'What help is available to you right now that you haven\'t asked for, and what specifically stops you?'
          }
        ]
      },

      // ========================================
      // DOMAIN 2: FEAR LEADING TO ISOLATION
      // ========================================
      {
        key: 'subdomain_2_1',
        label: 'Everything Will Go Wrong',
        description: 'Exploring patterns of catastrophic thinking that lead to self-sabotage',
        beliefBehaviorConnection: 'Believing disaster is inevitable leads to catastrophic thinking and protective sabotage',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Bad things always happen financially; disaster is inevitable no matter what I do',
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain financial disaster is guaranteed; nothing works out ever' },
              { value: -2, label: 'Agree - I firmly believe bad financial outcomes are inevitable; hope is foolish' },
              { value: -1, label: 'Slightly agree - I often feel disaster is coming, though I\'m questioning this expectation' },
              { value: 1, label: 'Slightly disagree - I\'m learning things can work out, though catastrophic thinking persists' },
              { value: 2, label: 'Disagree - I generally believe positive outcomes are possible, though occasional fear surfaces' },
              { value: 3, label: 'Strongly disagree - I completely trust that things can and do work out; disaster isn\'t inevitable' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I create financial problems when things start going well, or stop projects right before they succeed',
            scale: [
              { value: -3, label: 'Always - I consistently sabotage success; every time things go well, I create problems or quit before completion' },
              { value: -2, label: 'Very often - I regularly derail progress when things start working or abandon projects near completion' },
              { value: -1, label: 'Often - I frequently create problems during success or stop projects before breakthrough' },
              { value: 1, label: 'Occasionally - I sometimes sabotage success or quit early, working on following through' },
              { value: 2, label: 'Rarely - I occasionally self-sabotage, but generally see things through to completion' },
              { value: 3, label: 'Never - I consistently complete projects and allow success to continue; no self-sabotage' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel constant anxiety and dread about financial catastrophe',
            scale: [
              { value: -3, label: 'Always - Unrelenting overwhelming anxiety and dread; catastrophe feels imminent constantly' },
              { value: -2, label: 'Very often - Persistent severe anxiety and heavy dread about financial disaster' },
              { value: -1, label: 'Often - Frequent anxiety and dread that something terrible will happen' },
              { value: 1, label: 'Occasionally - Sometimes anxious about disasters, learning to distinguish real from imagined threats' },
              { value: 2, label: 'Rarely - Occasional worry, but generally feel calm and grounded' },
              { value: 3, label: 'Never - I feel peaceful and secure; no constant dread or catastrophic anxiety' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'My catastrophic thinking has caused me to make fear-based decisions that created actual problems',
            scale: [
              { value: -3, label: 'Always - My catastrophic thinking has repeatedly created severe real problems through fear-based decisions' },
              { value: -2, label: 'Very often - I regularly create actual problems through fear-driven choices' },
              { value: -1, label: 'Often - I frequently cause real difficulties with catastrophic thinking and fear decisions' },
              { value: 1, label: 'Occasionally - I\'ve created some problems with fear-thinking, working on realistic assessment' },
              { value: 2, label: 'Rarely - I\'ve had occasional fear-based missteps, but generally make sound decisions' },
              { value: 3, label: 'Never - I consistently make grounded decisions; no self-created problems from catastrophizing' }
            ]
          },
          // Open Response
          {
            text: 'What financial disaster do you most fear, and describe a specific fear-based decision you made to prevent disaster—what was the actual result?'
          }
        ]
      },

      {
        key: 'subdomain_2_2',
        label: 'Better the Devil I Know',
        description: 'Exploring patterns of fearing change more than current dysfunction',
        beliefBehaviorConnection: 'Believing change is dangerous leads to staying in dysfunction',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Changing my financial situation is more dangerous than staying in my current dysfunction',
            scale: [
              { value: -3, label: 'Strongly agree - I\'m certain change is terrifying and dangerous; staying stuck is definitely safer' },
              { value: -2, label: 'Agree - I firmly believe my current dysfunction is safer than risking change' },
              { value: -1, label: 'Slightly agree - I often feel change is too dangerous, though I\'m questioning this belief' },
              { value: 1, label: 'Slightly disagree - I\'m learning change can be positive, though fear of the unknown persists' },
              { value: 2, label: 'Disagree - I generally know healthy change is good, though occasional fear of change surfaces' },
              { value: 3, label: 'Strongly disagree - I completely trust that positive change is safe and beneficial' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I stay in financial dysfunction because it\'s familiar, even though it\'s harming me',
            scale: [
              { value: -3, label: 'Always - I absolutely stay stuck in harmful patterns; familiar dysfunction feels safer than change' },
              { value: -2, label: 'Very often - I regularly choose harmful familiar patterns over healthier unknown alternatives' },
              { value: -1, label: 'Often - I frequently maintain dysfunction because change feels too threatening' },
              { value: 1, label: 'Occasionally - I sometimes stay stuck, working on embracing healthy change' },
              { value: 2, label: 'Rarely - I occasionally resist change, but generally move toward healthier patterns' },
              { value: 3, label: 'Never - I consistently embrace positive change; don\'t stay in harmful patterns from fear' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel trapped between the pain of my current situation and terror of change',
            scale: [
              { value: -3, label: 'Always - Constant paralysis between current pain and overwhelming terror of anything different' },
              { value: -2, label: 'Very often - Persistent feeling of being trapped; change feels impossible despite pain' },
              { value: -1, label: 'Often - Frequently feel stuck between suffering and fear of the unknown' },
              { value: 1, label: 'Occasionally - Sometimes feel trapped, learning that change can be safe and gradual' },
              { value: 2, label: 'Rarely - Occasional fear of change, but generally feel empowered to make shifts' },
              { value: 3, label: 'Never - I feel free to make positive changes; no paralysis or terror' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve stayed in harmful financial situations for years because fear of change kept me stuck',
            scale: [
              { value: -3, label: 'Always - I\'ve remained in severely damaging situations for many years; fear has completely paralyzed positive change' },
              { value: -2, label: 'Very often - I regularly stay in harmful situations far too long due to fear of change' },
              { value: -1, label: 'Often - I frequently remain stuck in dysfunction longer than necessary from fear' },
              { value: 1, label: 'Occasionally - I\'ve stayed too long at times, working on embracing healthy change' },
              { value: 2, label: 'Rarely - I\'ve occasionally delayed positive change, but generally make needed shifts' },
              { value: 3, label: 'Never - I consistently make positive changes when needed; no staying stuck from fear' }
            ]
          },
          // Open Response
          {
            text: 'What financial situation are you staying in right now that you know isn\'t working, and what specifically makes leaving it feel scarier than staying?'
          }
        ]
      },

      {
        key: 'subdomain_2_3',
        label: 'I Always Trust the Wrong People',
        description: 'Exploring patterns of expecting betrayal that lead to choosing untrustworthy people',
        beliefBehaviorConnection: 'Believing you\'ll be betrayed leads to choosing untrustworthy people',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I\'m destined to be betrayed financially; I always end up trusting people who hurt me',
            scale: [
              { value: -3, label: 'Strongly agree - I\'m absolutely certain betrayal is my destiny; I\'ll always trust wrong people' },
              { value: -2, label: 'Agree - I firmly believe I\'m doomed to trust untrustworthy people; betrayal is inevitable' },
              { value: -1, label: 'Slightly agree - I often feel I\'ll be betrayed again, though I\'m questioning this pattern' },
              { value: 1, label: 'Slightly disagree - I\'m learning I can identify trustworthy people, though past betrayals echo' },
              { value: 2, label: 'Disagree - I generally know I can trust wisely, though occasional fear of betrayal surfaces' },
              { value: 3, label: 'Strongly disagree - I completely trust my judgment about trustworthiness; not destined for betrayal' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I ignore red flags and trust people I suspect aren\'t trustworthy, then feel betrayed',
            scale: [
              { value: -3, label: 'Always - I constantly ignore obvious red flags and trust clearly untrustworthy people; betrayal is guaranteed' },
              { value: -2, label: 'Very often - I regularly ignore warning signs and trust suspicious people, experiencing repeated betrayal' },
              { value: -1, label: 'Often - I frequently trust people despite red flags, creating predictable betrayals' },
              { value: 1, label: 'Occasionally - I sometimes ignore warnings, working on trusting my instincts about trustworthiness' },
              { value: 2, label: 'Rarely - I occasionally miss red flags, but generally trust wisely' },
              { value: 3, label: 'Never - I consistently honor red flags and trust appropriate people; no pattern of betrayal' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel resigned to being betrayed and hurt; it always happens so why try to prevent it',
            scale: [
              { value: -3, label: 'Always - Complete resignation and helplessness; betrayal is inevitable so why even try' },
              { value: -2, label: 'Very often - Deep resignation about betrayal; feel powerless to choose differently' },
              { value: -1, label: 'Often - Frequent resignation that betrayal will happen regardless of my choices' },
              { value: 1, label: 'Occasionally - Sometimes feel resigned, learning I can make different choices' },
              { value: 2, label: 'Rarely - Occasional resignation, but generally feel empowered to trust wisely' },
              { value: 3, label: 'Never - I feel empowered to trust wisely and protect myself; no resignation to betrayal' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I\'ve been financially betrayed multiple times by people I knew had red flags',
            scale: [
              { value: -3, label: 'Always - I have a devastating pattern of repeated betrayals and financial losses from people I consciously knew were untrustworthy; the emotional and financial toll has been catastrophic' },
              { value: -2, label: 'Agree - I\'ve experienced significant financial betrayals multiple times from people I knew had red flags; the pattern is clear and the cost has been substantial' },
              { value: -1, label: 'Often - I\'ve been burned financially by people I suspected weren\'t trustworthy, and I\'m starting to recognize this as a pattern I keep repeating' },
              { value: 1, label: 'Occasionally - I\'ve had some betrayals where I missed or ignored red flags, working on trusting my instincts' },
              { value: 2, label: 'Rarely - I\'ve had occasional betrayals, but generally trust appropriate people and honor warnings' },
              { value: 3, label: 'Never - I consistently trust people who prove trustworthy; no pattern of ignoring red flags and experiencing betrayal' }
            ]
          },
          // Open Response
          {
            text: 'Describe a specific time when you knew you shouldn\'t trust someone but did anyway—what were the warning signs you ignored, and what happened?'
          }
        ]
      }
    ]
  },

  // ============================================================
  // CORE METHODS
  // ============================================================

  /**
   * Main entry point - called by Router
   * @param {Object} params - Render parameters from Router
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // Handle URL parameters for immediate navigation (preserves user gesture)
    const editMode = params.editMode === 'true' || params.editMode === true;
    const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

    // Page validation
    const totalPages = 7; // 1 intro + 6 subdomains
    if (page < 1 || page > totalPages) {
      throw new Error(`Invalid page number: ${page}. Must be 1-${totalPages}`);
    }

    // Execute actions on page load (after navigation completes with user gesture)
    if (editMode && page === 1) {
      Logger.log(`[Tool7] Edit mode detected for ${clientId} - creating EDIT_DRAFT`);
      DataService.loadResponseForEditing(clientId, 'tool7');
    }

    if (clearDraft && page === 1) {
      Logger.log(`[Tool7] Clear draft triggered for ${clientId}`);
      DataService.startFreshAttempt(clientId, 'tool7');
    }

    try {
      // Get existing data if resuming
      const existingData = this.getExistingData(clientId);

      // Get page content (just the form fields, not full HTML)
      let pageContent = GroundingFormBuilder.renderPageContent({
        toolId: this.config.id,
        pageNum: page,
        clientId: clientId,
        subdomains: this.config.subdomains,
        intro: this.getIntroContent(),
        existingData: existingData
      });

      // Add edit mode banner if editing previous response
      if (existingData && existingData._editMode) {
        const originalDate = existingData._originalTimestamp ?
          new Date(existingData._originalTimestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'previous submission';

        pageContent = EditModeBanner.render(originalDate, clientId, 'tool7') + pageContent;
      }

      // Use FormUtils to build standard page (like Tool 1 and Tool 2)
      const template = HtmlService.createTemplate(
        FormUtils.buildStandardPage({
          toolName: this.config.name,
          toolId: this.config.id,
          page: page,
          totalPages: totalPages,
          clientId: clientId,
          baseUrl: baseUrl,
          pageContent: pageContent,
          isFinalPage: (page === 7)
        })
      );

      return template.evaluate()
        .setTitle(`TruPath - ${this.config.name}`)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      Logger.log(`[Tool7] Error rendering page ${page}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get custom intro content for Tool 7
   */
  getIntroContent() {
    return `
      <div class="card">
        <h2>Welcome to the Security & Control Assessment</h2>
        <p class="muted" style="margin-bottom: 20px;">
          This assessment explores your relationship with control and fear in financial decision-making.
          It reveals patterns of disconnection from trust in life and a sense that things can work out.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">What This Assessment Explores</h3>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 1: Control Leading to Isolation</strong><br>
          How needing total control creates suffering—patterns like rejecting help and systems,
          refusing to trust others, and viewing asking for support as weakness that exhausts you and keeps you stuck.
        </p>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 2: Fear Leading to Isolation</strong><br>
          How fear creates the disasters you're trying to prevent—patterns like catastrophic thinking,
          staying in dysfunction from fear of change, and trusting untrustworthy people that become self-fulfilling prophecies.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">How it Works</h3>
        <ul style="line-height: 1.8; color: rgba(255, 255, 255, 0.85);">
          <li>You'll complete <strong>6 sections</strong>, one at a time (about 20-25 minutes total)</li>
          <li>Each section has <strong>4 scale questions</strong> and <strong>1 reflection question</strong></li>
          <li>Answer based on your actual patterns, not how you wish things were</li>
          <li>There are no "right" answers—this is about self-discovery</li>
          <li>AI analysis will provide personalized insights based on your responses</li>
        </ul>

        <div style="background: rgba(173, 145, 104, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ad9168; margin-top: 25px;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
            💡 <strong>Tip:</strong> This assessment may surface uncomfortable feelings about control and trust.
            Be compassionate with yourself as you explore these patterns.
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Save page data (called after each page submission)
   * Required by Code.js saveToolPageData()
   */
  savePageData(clientId, page, formData) {
    // Save to PropertiesService for fast page-to-page navigation
    DraftService.saveDraft('tool7', clientId, page, formData);

    // Get the complete merged data (includes all pages)
    const draftData = DraftService.getDraft('tool7', clientId);

    // Also save/update RESPONSES sheet for dashboard detection
    // BUT: Don't create/update if we're in edit mode (EDIT_DRAFT already exists)
    const activeDraft = DataService.getActiveDraft(clientId, 'tool7');
    const isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

    if (!isEditMode) {
      // Use complete draft data so RESPONSES sheet has ALL pages
      if (page === 1) {
        // Page 1: Create new DRAFT row with complete data
        DataService.saveDraft(clientId, 'tool7', draftData);
      } else {
        // Page 2+: Update existing DRAFT row with complete merged data
        DataService.updateDraft(clientId, 'tool7', draftData);
      }
    } else {
      Logger.log(`[Tool7] Skipping DRAFT save/update - already in edit mode with EDIT_DRAFT`);
    }

    // ============================================================
    // BACKGROUND GPT ANALYSIS (Server-Side)
    // Trigger GPT analysis for subdomain pages (2-7) after save
    // ============================================================
    if (page >= 2 && page <= 7) {
      const subdomainIndex = page - 2; // 0-5
      const subdomain = this.config.subdomains[subdomainIndex];

      try {
        // Extract responses for this subdomain
        const openResponseKey = `${subdomain.key}_open_response`;
        const openResponse = formData[openResponseKey];

        // Check if we have enough data for GPT analysis
        if (openResponse && openResponse.trim().length >= 10) {
          Logger.log(`[Tool7] Triggering GPT analysis for ${subdomain.key}`);

          // Extract aspect scores for GPT context
          const aspects = ['belief', 'behavior', 'feeling', 'consequence'];
          const responses = {};
          const aspectScores = {};

          aspects.forEach(aspect => {
            const fieldName = `${subdomain.key}_${aspect}`;
            const score = parseInt(formData[fieldName]);
            responses[fieldName] = score;
            responses[`${fieldName}_label`] = formData[`${fieldName}_label`] || '';
            aspectScores[aspect] = score;
          });
          responses[openResponseKey] = openResponse;

          // Check for duplicate (prevent redundant API calls on back/forward navigation)
          const existingInsight = GroundingGPT.getCachedInsight(this.config.id, clientId, subdomain.key);

          if (existingInsight) {
            Logger.log(`[Tool7] GPT insight already cached for ${subdomain.key} - skipping`);
          } else {
            // Trigger GPT analysis (non-blocking - uses try-catch internally)
            GroundingGPT.analyzeSubdomain({
              toolId: this.config.id,
              clientId: clientId,
              subdomainKey: subdomain.key,
              subdomainConfig: subdomain,
              responses: responses,
              aspectScores: aspectScores,
              previousInsights: {} // No cross-subdomain context for now
            });

            Logger.log(`[Tool7] GPT analysis completed for ${subdomain.key}`);
          }
        } else {
          Logger.log(`[Tool7] Skipping GPT - insufficient open response for ${subdomain.key} (length: ${openResponse ? openResponse.length : 0})`);
        }
      } catch (error) {
        // Don't let GPT failures block navigation
        Logger.log(`[Tool7] GPT trigger failed (non-blocking): ${error.message}`);
        Logger.log(error.stack);
      }
    }

    return { success: true };
  },

  /**
   * Get existing data for a client
   * Checks both EDIT_DRAFT (from RESPONSES sheet) and PropertiesService drafts
   */
  getExistingData(clientId) {
    try {
      let data = null;

      // First check if there's an active draft in RESPONSES sheet
      if (typeof DataService !== 'undefined') {
        const activeDraft = DataService.getActiveDraft(clientId, 'tool7');

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          Logger.log(`[Tool7] Found active draft with status: ${activeDraft.status}`);
          data = activeDraft.data;
        }
      }

      // Also check PropertiesService and merge
      const propData = DraftService.getDraft('tool7', clientId);

      if (propData) {
        if (data) {
          // Merge: PropertiesService takes precedence for newer page data
          data = {...data, ...propData};
        } else {
          data = propData;
        }
      }

      return data || {};

    } catch (error) {
      Logger.log(`[Tool7] Error getting existing data: ${error}`);
      return {};
    }
  },

  /**
   * Process final submission (called by Code.js completeToolSubmission)
   * CRITICAL: Method name must match Code.js expectation
   * CRITICAL: Signature must be (clientId) not (clientId, formData)
   */
  processFinalSubmission(clientId) {
    try {
      Logger.log(`[Tool7] Processing final submission for ${clientId}`);

      // Get all data from draft storage (like Tool 1/2)
      const allData = this.getExistingData(clientId);

      if (!allData) {
        throw new Error('No data found. Please start the assessment again.');
      }

      // Extract all responses (24 scale + 6 open responses = 30 total)
      const responses = this.extractResponses(allData);

      // Calculate scores using GroundingScoring
      const scoringResult = GroundingScoring.calculateScores(
        responses,
        this.config.subdomains
      );

      Logger.log(`[Tool7] Scoring complete: Overall=${scoringResult.overallQuotient}`);

      // Collect all GPT insights (from cache)
      const gptInsights = this.collectGPTInsights(clientId);

      // Run final 3 synthesis calls
      const syntheses = this.runFinalSyntheses(clientId, scoringResult, gptInsights);

      Logger.log(`[Tool7] GPT syntheses complete`);

      // Save complete assessment data
      this.saveAssessmentData(clientId, {
        responses,
        scoringResult,
        gptInsights,
        syntheses
      });

      Logger.log(`[Tool7] Assessment data saved`);

      // Return success (Code.js will handle report generation)
      return { success: true };

    } catch (error) {
      Logger.log(`[Tool7] Error processing submission: ${error.message}`);
      throw error;
    }
  },

  /**
   * Extract responses from form data
   */
  extractResponses(formData) {
    const responses = {};

    // Extract all fields from formData
    Object.keys(formData).forEach(key => {
      // Skip metadata fields
      if (['client', 'page', 'subdomain_index', 'subdomain_key'].includes(key)) {
        return;
      }

      // Skip label fields (used for GPT context, not scoring)
      // Labels are like: subdomain_1_1_belief_label
      if (key.endsWith('_label')) {
        return;
      }

      responses[key] = formData[key];
    });

    return responses;
  },

  /**
   * Collect GPT insights from cache (created during form)
   */
  collectGPTInsights(clientId) {
    const insights = {
      subdomains: {}
    };

    this.config.subdomains.forEach(subdomain => {
      const cached = GroundingGPT.getCachedInsight(this.config.id, clientId, subdomain.key);
      if (cached) {
        insights.subdomains[subdomain.key] = cached;
      } else {
        Logger.log(`⚠️ No cached insight for ${subdomain.key}, will use fallback`);
      }
    });

    return insights;
  },

  /**
   * Run final 3 synthesis calls (2 domain + 1 overall)
   */
  runFinalSyntheses(clientId, scoringResult, gptInsights) {
    const syntheses = {};

    // Domain 1 synthesis
    syntheses.domain1 = GroundingGPT.synthesizeDomain({
      toolId: this.config.id,
      clientId: clientId,
      domainConfig: {
        key: this.config.domain1Key,
        name: this.config.domain1Name,
        description: this.config.domain1Description
      },
      subdomainInsights: this.extractDomainInsights(gptInsights.subdomains, 0, 3),
      subdomainScores: this.extractDomainScores(scoringResult.subdomainQuotients, 0, 3),
      domainScore: scoringResult.domainQuotients.domain1,
      subdomainConfigs: this.config.subdomains.slice(0, 3)  // Pass first 3 subdomain configs
    });

    // Domain 2 synthesis
    syntheses.domain2 = GroundingGPT.synthesizeDomain({
      toolId: this.config.id,
      clientId: clientId,
      domainConfig: {
        key: this.config.domain2Key,
        name: this.config.domain2Name,
        description: this.config.domain2Description
      },
      subdomainInsights: this.extractDomainInsights(gptInsights.subdomains, 3, 6),
      subdomainScores: this.extractDomainScores(scoringResult.subdomainQuotients, 3, 6),
      domainScore: scoringResult.domainQuotients.domain2,
      subdomainConfigs: this.config.subdomains.slice(3, 6)  // Pass last 3 subdomain configs
    });

    // Overall synthesis
    syntheses.overall = GroundingGPT.synthesizeOverall({
      toolId: this.config.id,
      clientId: clientId,
      toolConfig: this.config,
      domainSyntheses: {
        [this.config.domain1Name]: syntheses.domain1,
        [this.config.domain2Name]: syntheses.domain2
      },
      allScores: scoringResult,
      subdomainInsights: gptInsights.subdomains  // ADD: Pass subdomain insights for context
    });

    return syntheses;
  },

  /**
   * Extract insights for a specific domain
   */
  extractDomainInsights(allInsights, startIdx, endIdx) {
    const domainInsights = {};
    const subdomains = this.config.subdomains.slice(startIdx, endIdx);

    subdomains.forEach(subdomain => {
      if (allInsights[subdomain.key]) {
        domainInsights[subdomain.key] = allInsights[subdomain.key];
      }
    });

    return domainInsights;
  },

  /**
   * Extract scores for a specific domain
   */
  extractDomainScores(allScores, startIdx, endIdx) {
    const domainScores = {};
    const subdomains = this.config.subdomains.slice(startIdx, endIdx);

    subdomains.forEach(subdomain => {
      domainScores[subdomain.key] = allScores[subdomain.key];
    });

    return domainScores;
  },

  /**
   * Save assessment data to RESPONSES sheet
   */
  saveAssessmentData(clientId, data) {
    const dataToSave = {
      responses: data.responses,
      scoring: data.scoringResult,
      gpt_insights: data.gptInsights,
      syntheses: data.syntheses,
      timestamp: new Date().toISOString(),
      tool_version: '1.0.0'
    };

    // Use DataService to save
    DataService.saveToolResponse(
      clientId,
      this.config.id,
      dataToSave
    );

    // Clear draft data from PropertiesService
    DraftService.clearDraft(this.config.id, clientId);

    // Clear GPT cache
    GroundingGPT.clearCache(this.config.id, clientId);
  },

  /**
   * Generate report HTML
   */
  generateReport(clientId, scoringResult, gptInsights) {
    const baseUrl = ScriptApp.getService().getUrl();

    const htmlString = GroundingReport.generateReport({
      toolId: this.config.id,
      toolConfig: this.config,
      clientId: clientId,
      baseUrl: baseUrl,
      scoringResult: scoringResult,
      gptInsights: gptInsights
    });

    return HtmlService.createHtmlOutput(htmlString);
  },

  /**
   * Render error page
   */
  renderErrorPage(error, clientId, baseUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TruPath - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <?!= include('shared/styles') ?>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1 style="color: #dc3545;">Error</h1>
            <p>An error occurred while loading this assessment:</p>
            <p style="background: rgba(220, 53, 69, 0.1); padding: 15px; border-radius: 8px; font-family: monospace;">
              ${error.message}
            </p>
            <button class="btn-primary" onclick="window.location.href='${baseUrl}?route=dashboard&client=${clientId}'">
              Return to Dashboard →
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
