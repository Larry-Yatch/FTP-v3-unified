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
    domain1Description: 'Self-imposed suffering through undercharging, not collecting, hoarding, and refusing to delegate',

    domain2Name: 'Fear Leading to Isolation',
    domain2Key: 'domain2',
    domain2Description: 'Creating disasters through lack of protection, self-sabotage at success, and trusting the wrong people',

    // Subdomain configurations (6 total: 3 per domain)
    subdomains: [
      // ========================================
      // DOMAIN 1: CONTROL LEADING TO ISOLATION
      // ========================================
      {
        key: 'subdomain_1_1',
        label: "I Undercharge and Give Away",
        description: 'Exploring patterns of not charging your worth, not collecting money owed, and giving away work for free',
        beliefBehaviorConnection: 'Believing it is dangerous to charge your worth or collect debts leads to chronic underearning and uncollected receivables',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Charging full price or collecting money owed to me feels dangerous or wrong',
            scale: [
              { value: -3, label: 'Strongly agree - Charging what I am worth or pursuing money owed feels deeply dangerous; I am certain something bad will happen if I do' },
              { value: -2, label: 'Agree - I firmly believe charging full price or collecting debts will cause problems or push people away' },
              { value: -1, label: 'Slightly agree - I often feel uncomfortable about charging or collecting, though I am starting to question why' },
              { value: 1, label: 'Slightly disagree - I am learning it is okay to charge fairly and collect what is owed, though discomfort lingers' },
              { value: 2, label: 'Disagree - I generally know fair pricing and collecting debts is appropriate, though occasional guilt surfaces' },
              { value: 3, label: 'Strongly disagree - I completely accept that charging my worth and collecting owed money is right and necessary' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I charge less than my work is worth, have uncollected money owed to me, or give away work for free',
            scale: [
              { value: -3, label: 'Always - I consistently undercharge, never collect debts, and regularly give away work that should be paid' },
              { value: -2, label: 'Very often - I frequently price below my value, let receivables pile up, and often work for free' },
              { value: -1, label: 'Often - I regularly undercharge or avoid collecting, giving away more than I should' },
              { value: 1, label: 'Occasionally - I sometimes undercharge or let debts slide, working on valuing my work appropriately' },
              { value: 2, label: 'Rarely - I occasionally give discounts, but generally charge fairly and collect what is owed' },
              { value: 3, label: 'Never - I consistently charge what I am worth, collect debts promptly, and only give away work intentionally' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxious or guilty about charging what I am worth or asking people to pay what they owe me',
            scale: [
              { value: -3, label: 'Always - Overwhelming anxiety and guilt about any pricing discussion or collection attempt; it feels wrong to ask' },
              { value: -2, label: 'Very often - Persistent guilt and anxiety when setting prices or requesting payment' },
              { value: -1, label: 'Often - Frequent discomfort and guilt around charging or collecting money' },
              { value: 1, label: 'Occasionally - Sometimes feel guilty about pricing, learning that fair compensation is appropriate' },
              { value: 2, label: 'Rarely - Occasional brief discomfort, but generally comfortable asking for fair payment' },
              { value: 3, label: 'Never - I feel no guilt about charging appropriately or collecting what is owed; it is simply business' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I have earned significantly less than I could have because I undercharge, do not collect what is owed, or give work away',
            scale: [
              { value: -3, label: 'Always - Massive income loss from chronic undercharging, uncollected debts, and constant free work' },
              { value: -2, label: 'Very often - Significant earnings lost regularly from underpricing and not collecting' },
              { value: -1, label: 'Often - Noticeable income reduction from undercharging or uncollected receivables' },
              { value: 1, label: 'Occasionally - Some lost income from undercharging, working on capturing my full value' },
              { value: 2, label: 'Rarely - Occasional minor losses, but generally earn what my work is worth' },
              { value: 3, label: 'Never - I consistently earn appropriately; no significant losses from undercharging or uncollected debts' }
            ]
          },
          // Open Response
          {
            text: 'What money is currently owed to you that you have not collected, and what stops you from pursuing it? Or describe a time you significantly undercharged or gave away work for free—what were you afraid would happen if you charged full price?'
          }
        ]
      },

      {
        key: 'subdomain_1_2',
        label: 'I Have Money But Will Not Use It',
        description: 'Exploring patterns of hoarding money while living in lack, refusing to invest, and living far below your means',
        beliefBehaviorConnection: 'Believing spending or investing will lead to loss causes hoarding while living in artificial scarcity',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'Spending or investing my savings feels too risky, even when I have enough and could benefit',
            scale: [
              { value: -3, label: 'Strongly agree - I am absolutely certain that spending or investing will lead to disaster; my savings must stay untouched no matter what' },
              { value: -2, label: 'Agree - I firmly believe using my savings is too dangerous, even when I clearly have enough' },
              { value: -1, label: 'Slightly agree - I often feel spending or investing is risky, though I am starting to question this fear' },
              { value: 1, label: 'Slightly disagree - I am learning that appropriate spending and investing can be safe, though fear lingers' },
              { value: 2, label: 'Disagree - I generally know using money wisely is fine, though occasional fear of loss surfaces' },
              { value: 3, label: 'Strongly disagree - I completely trust that thoughtful spending and investing are healthy uses of money' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I have money saved but will not spend it on things I need, or I refuse to invest because I cannot control what happens to it',
            scale: [
              { value: -3, label: 'Always - I consistently deny myself necessities despite having savings; I refuse all investing because I cannot control it' },
              { value: -2, label: 'Very often - I regularly go without things I need and avoid investing, keeping money locked away' },
              { value: -1, label: 'Often - I frequently skip needed purchases and shy away from investing despite having resources' },
              { value: 1, label: 'Occasionally - I sometimes hold back on spending or investing, working on using money appropriately' },
              { value: 2, label: 'Rarely - I occasionally hesitate on purchases, but generally spend on needs and invest reasonably' },
              { value: 3, label: 'Never - I consistently spend on necessities and invest appropriately; money serves my life, not just my fears' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxious spending money even when I have enough, as if any spending threatens my security',
            scale: [
              { value: -3, label: 'Always - Constant overwhelming anxiety about any spending; every purchase feels like a threat to my survival' },
              { value: -2, label: 'Very often - Persistent deep anxiety when spending, even on necessities, despite having adequate savings' },
              { value: -1, label: 'Often - Frequent anxiety about spending that feels disproportionate to my actual financial situation' },
              { value: 1, label: 'Occasionally - Sometimes anxious about spending, learning to trust that I have enough' },
              { value: 2, label: 'Rarely - Occasional brief spending anxiety, but generally feel secure when making purchases' },
              { value: 3, label: 'Never - I feel secure spending appropriately; no anxiety when I have adequate resources' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I have lived without things I needed or missed investment growth because I could not let go of controlling my money',
            scale: [
              { value: -3, label: 'Always - Severe deprivation and massive missed growth from refusing to spend or invest; I live in artificial poverty' },
              { value: -2, label: 'Very often - Regular denial of needs and significant missed opportunities from hoarding money' },
              { value: -1, label: 'Often - Noticeable sacrifice of needs and investment growth from inability to release control' },
              { value: 1, label: 'Occasionally - Some missed opportunities from holding too tight, working on appropriate use of resources' },
              { value: 2, label: 'Rarely - Occasional missed chances, but generally use money to meet needs and grow wealth' },
              { value: 3, label: 'Never - I consistently meet my needs and invest wisely; no deprivation from control issues' }
            ]
          },
          // Open Response
          {
            text: 'Describe something you need or want but will not spend money on despite having savings. What do you fear would happen if you spent it? Or describe your relationship with investing—what makes it feel unsafe?'
          }
        ]
      },

      {
        key: 'subdomain_1_3',
        label: 'Only I Can Do It Right',
        description: 'Exploring patterns of refusing to delegate, hire help, or scale because you do not trust anyone else to do things correctly',
        beliefBehaviorConnection: 'Believing no one else can do things right leads to exhaustion, stagnation, and isolation from refusing to delegate',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'If I do not personally handle every financial detail or task, it will not be done right',
            scale: [
              { value: -3, label: 'Strongly agree - I am absolutely certain no one else can do anything correctly; I must personally control every detail' },
              { value: -2, label: 'Agree - I firmly believe others will mess things up; delegating means accepting inferior results' },
              { value: -1, label: 'Slightly agree - I often feel only I can do things right, though I am questioning this belief' },
              { value: 1, label: 'Slightly disagree - I am learning others can handle tasks competently, though trusting their work is hard' },
              { value: 2, label: 'Disagree - I generally know others can do good work, though I sometimes doubt their capability' },
              { value: 3, label: 'Strongly disagree - I completely trust that others can handle tasks well; I do not need to do everything myself' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I refuse to delegate financial tasks or hire help because I do not trust anyone else to do them correctly',
            scale: [
              { value: -3, label: 'Always - I never delegate anything; I do every financial task myself regardless of the cost to me' },
              { value: -2, label: 'Very often - I rarely let anyone handle financial tasks; I insist on personal control of nearly everything' },
              { value: -1, label: 'Often - I frequently refuse to delegate, taking on far more than I should' },
              { value: 1, label: 'Occasionally - I sometimes refuse to delegate, working on trusting others with appropriate tasks' },
              { value: 2, label: 'Rarely - I occasionally hold onto tasks, but generally delegate appropriately' },
              { value: 3, label: 'Never - I consistently delegate tasks suited for others; I trust competent people to do good work' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel exhausted from handling everything myself but unable to let go of control',
            scale: [
              { value: -3, label: 'Always - Constant crushing exhaustion from doing everything myself, yet completely unable to release any control' },
              { value: -2, label: 'Very often - Persistent exhaustion from carrying all tasks, feeling trapped by my need to control' },
              { value: -1, label: 'Often - Frequent exhaustion and frustration at my inability to delegate' },
              { value: 1, label: 'Occasionally - Sometimes exhausted by control needs, learning to let go of appropriate tasks' },
              { value: 2, label: 'Rarely - Occasional tiredness from taking on too much, but generally delegate effectively' },
              { value: 3, label: 'Never - I feel energized by appropriate workload; I delegate freely and trust the results' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'My need to control every detail has kept me stuck, burned out, or created more chaos than it prevented',
            scale: [
              { value: -3, label: 'Always - Severe stagnation and burnout from controlling everything; my systems create constant chaos' },
              { value: -2, label: 'Very often - Regular burnout and stuckness from refusing to delegate; more problems than solutions' },
              { value: -1, label: 'Often - Noticeable limitations and exhaustion from needing to control everything' },
              { value: 1, label: 'Occasionally - Some stuckness from control needs, working on trusting others with tasks' },
              { value: 2, label: 'Rarely - Occasional issues from over-controlling, but generally maintain healthy delegation' },
              { value: 3, label: 'Never - I grow freely through delegation; my need for control never creates chaos or burnout' }
            ]
          },
          // Open Response
          {
            text: 'What financial tasks or responsibilities do you refuse to delegate, and what specifically do you fear would go wrong if someone else handled them? How has this need to control everything affected your growth or wellbeing?'
          }
        ]
      },

      // ========================================
      // DOMAIN 2: FEAR LEADING TO ISOLATION
      // ========================================
      {
        key: 'subdomain_2_1',
        label: 'I Do Not Protect Myself',
        description: 'Exploring patterns of entering agreements without contracts, not claiming benefits you qualify for, and skipping basic protective measures',
        beliefBehaviorConnection: 'Believing you would not know what protection to ask for or how to do it correctly leads to avoiding protection entirely',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I would not know what protection to ask for or whether I was doing it correctly, so I avoid it',
            scale: [
              { value: -3, label: 'Strongly agree - I have no idea what protection I need or how to get it; the whole process feels beyond me so I do not try' },
              { value: -2, label: 'Agree - I firmly believe I would not know the right questions to ask or if I was protecting myself properly' },
              { value: -1, label: 'Slightly agree - I often feel lost about what protection looks like, though I am starting to wonder if I could learn' },
              { value: 1, label: 'Slightly disagree - I am learning that I can figure out what protection I need, though uncertainty still stops me sometimes' },
              { value: 2, label: 'Disagree - I generally know how to ask for protection, though I occasionally feel unsure about the details' },
              { value: 3, label: 'Strongly disagree - I know how to identify what protection I need and confidently ask for it' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I enter financial agreements without contracts, do not claim benefits I qualify for, or skip basic protective measures',
            scale: [
              { value: -3, label: 'Always - I never get contracts, never claim benefits, and consistently enter deals completely unprotected' },
              { value: -2, label: 'Very often - I regularly skip contracts, rarely claim entitled benefits, and frequently go unprotected' },
              { value: -1, label: 'Often - I frequently enter agreements without protection and miss benefits I could claim' },
              { value: 1, label: 'Occasionally - I sometimes skip protection, working on claiming benefits and getting agreements in writing' },
              { value: 2, label: 'Rarely - I occasionally miss protective measures, but generally get contracts and claim what I am entitled to' },
              { value: 3, label: 'Never - I consistently protect myself with contracts, claim all benefits I qualify for, and never enter deals unprotected' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel overwhelmed or paralyzed when I think about protecting myself, so I avoid it',
            scale: [
              { value: -3, label: 'Always - Completely overwhelmed and paralyzed by the thought of protection; I shut down and avoid it entirely' },
              { value: -2, label: 'Very often - Persistent overwhelm when protection comes up; the complexity paralyzes me into inaction' },
              { value: -1, label: 'Often - Frequently feel overwhelmed by protection, though I am starting to take small steps' },
              { value: 1, label: 'Occasionally - Sometimes feel overwhelmed, but learning to break protection into manageable pieces' },
              { value: 2, label: 'Rarely - Occasional overwhelm, but generally able to work through it and take protective action' },
              { value: 3, label: 'Never - I feel capable of figuring out protection; complexity does not paralyze me' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I have lost money or opportunities because I did not have contracts, did not protect myself, or did not claim what I was entitled to',
            scale: [
              { value: -3, label: 'Always - Devastating losses from lack of contracts, repeated harm from no protection, countless missed benefits' },
              { value: -2, label: 'Very often - Significant financial losses and missed opportunities from failing to protect myself' },
              { value: -1, label: 'Often - Noticeable losses from inadequate protection and unclaimed benefits' },
              { value: 1, label: 'Occasionally - Some losses from insufficient protection, working on safeguarding myself' },
              { value: 2, label: 'Rarely - Occasional minor losses, but generally protected and claim what I deserve' },
              { value: 3, label: 'Never - I consistently avoid losses through protection and claim all benefits; no harm from lack of safeguards' }
            ]
          },
          // Open Response
          {
            text: 'Describe a financial situation where you knew you should have gotten something in writing or protected yourself but did not. What happened? Or what benefits, programs, or opportunities might you qualify for that you have not claimed—what stops you?'
          }
        ]
      },

      {
        key: 'subdomain_2_2',
        label: 'I Sabotage Success',
        description: 'Exploring patterns of creating problems when things go well, quitting before breakthrough, and refusing opportunities',
        beliefBehaviorConnection: 'Believing success is dangerous or undeserved leads to self-sabotage at the threshold of breakthrough',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'When things start going well financially, I feel like something bad is about to happen or I do not deserve it',
            scale: [
              { value: -3, label: 'Strongly agree - I am absolutely certain that success will be punished or taken away; I do not deserve good things' },
              { value: -2, label: 'Agree - I firmly believe success is dangerous and I am unworthy of financial wellbeing' },
              { value: -1, label: 'Slightly agree - I often feel dread when things go well, though I am questioning why' },
              { value: 1, label: 'Slightly disagree - I am learning I can have success, though fear and unworthiness still arise' },
              { value: 2, label: 'Disagree - I generally believe I can succeed and deserve it, though occasional doubts surface' },
              { value: 3, label: 'Strongly disagree - I completely believe I deserve success and good things can last' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I create problems when things are going well, quit projects before they succeed, or turn down opportunities that could help me',
            scale: [
              { value: -3, label: 'Always - I consistently sabotage success, quit at the threshold of breakthrough, and refuse every helpful opportunity' },
              { value: -2, label: 'Very often - I regularly derail progress, abandon projects near completion, and turn down chances to advance' },
              { value: -1, label: 'Often - I frequently create problems during good times or quit before seeing results' },
              { value: 1, label: 'Occasionally - I sometimes sabotage or quit early, working on following through to success' },
              { value: 2, label: 'Rarely - I occasionally hesitate at opportunities, but generally complete projects and accept help' },
              { value: 3, label: 'Never - I consistently see things through, accept opportunities, and allow success to continue' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel anxious, unworthy, or filled with dread when I am on the verge of financial success',
            scale: [
              { value: -3, label: 'Always - Overwhelming dread and unworthiness at any hint of success; success feels terrifying and wrong' },
              { value: -2, label: 'Very often - Persistent anxiety and deep unworthiness when approaching financial success' },
              { value: -1, label: 'Often - Frequent dread and discomfort when things start going well financially' },
              { value: 1, label: 'Occasionally - Sometimes feel unworthy near success, learning I deserve good outcomes' },
              { value: 2, label: 'Rarely - Occasional brief anxiety, but generally feel deserving when success approaches' },
              { value: 3, label: 'Never - I feel excited and worthy when success approaches; no dread or unworthiness' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I have a pattern of almost succeeding financially but sabotaging it, quitting too soon, or refusing chances that could have changed things',
            scale: [
              { value: -3, label: 'Always - A devastating pattern of near-misses; I have sabotaged, quit, or refused every major opportunity' },
              { value: -2, label: 'Very often - A clear pattern of snatching defeat from victory; significant chances lost to self-sabotage' },
              { value: -1, label: 'Often - A noticeable pattern of undermining my own success or refusing helpful opportunities' },
              { value: 1, label: 'Occasionally - Some instances of self-sabotage, working on allowing success to happen' },
              { value: 2, label: 'Rarely - A few missed chances, but generally follow through and accept opportunities' },
              { value: 3, label: 'Never - No pattern of self-sabotage; I consistently achieve success and accept opportunities' }
            ]
          },
          // Open Response
          {
            text: 'Describe a time you were close to a financial breakthrough or success but something went wrong—looking back, did you play any role in derailing it? Or describe an opportunity you turned down that could have helped you—what were you really afraid of?'
          }
        ]
      },

      {
        key: 'subdomain_2_3',
        label: 'I Trust the Wrong People',
        description: 'Exploring patterns of ignoring red flags, trusting people you knew better than to trust, and experiencing predictable betrayals',
        beliefBehaviorConnection: 'Believing betrayal is inevitable leads to ignoring red flags and trusting untrustworthy people',

        questions: [
          // Belief
          {
            aspect: 'Belief',
            text: 'I am destined to be betrayed financially; I always end up trusting people who hurt me',
            scale: [
              { value: -3, label: 'Strongly agree - I am absolutely certain betrayal is my fate; I will always trust the wrong people no matter what' },
              { value: -2, label: 'Agree - I firmly believe I am doomed to repeat this pattern; betrayal is inevitable for me' },
              { value: -1, label: 'Slightly agree - I often feel destined to be betrayed, though I am questioning this pattern' },
              { value: 1, label: 'Slightly disagree - I am learning I can choose trustworthy people, though past betrayals haunt me' },
              { value: 2, label: 'Disagree - I generally believe I can trust wisely, though I sometimes doubt my judgment' },
              { value: 3, label: 'Strongly disagree - I completely trust my ability to identify trustworthy people; I am not destined for betrayal' }
            ]
          },
          // Behavior
          {
            aspect: 'Behavior',
            text: 'I ignore red flags and trust people with money even when I have a bad feeling about them',
            scale: [
              { value: -3, label: 'Always - I consistently override my instincts and trust people I know are untrustworthy; I ignore every warning sign' },
              { value: -2, label: 'Very often - I regularly dismiss red flags and trust people despite clear warning signs' },
              { value: -1, label: 'Often - I frequently ignore my gut feelings and trust people I have doubts about' },
              { value: 1, label: 'Occasionally - I sometimes ignore red flags, working on honoring my instincts' },
              { value: 2, label: 'Rarely - I occasionally miss warning signs, but generally trust my judgment about people' },
              { value: 3, label: 'Never - I consistently honor red flags and trust my instincts; I do not override clear warnings' }
            ]
          },
          // Feeling
          {
            aspect: 'Feeling',
            text: 'I feel resigned to being betrayed—it always happens, so why try to prevent it',
            scale: [
              { value: -3, label: 'Always - Complete resignation and helplessness about betrayal; preventing it feels utterly impossible' },
              { value: -2, label: 'Very often - Deep resignation that betrayal will happen regardless of what I do' },
              { value: -1, label: 'Often - Frequent resignation about betrayal, as if my choices do not matter' },
              { value: 1, label: 'Occasionally - Sometimes feel resigned, learning that I can make different choices' },
              { value: 2, label: 'Rarely - Occasional resignation, but generally feel empowered to choose trustworthy people' },
              { value: 3, label: 'Never - I feel completely empowered to protect myself through wise trust; no resignation to betrayal' }
            ]
          },
          // Consequence
          {
            aspect: 'Consequence',
            text: 'I have been financially burned multiple times by people I knew had red flags but trusted anyway',
            scale: [
              { value: -3, label: 'Always - Devastating pattern of repeated betrayals from people I consciously knew were untrustworthy; massive financial and emotional toll' },
              { value: -2, label: 'Very often - Multiple significant betrayals from people I had clear warnings about; the pattern is undeniable' },
              { value: -1, label: 'Often - Several burns from people I suspected were not trustworthy; I am starting to see the pattern' },
              { value: 1, label: 'Occasionally - A few betrayals where I ignored red flags, working on trusting my instincts' },
              { value: 2, label: 'Rarely - One or two instances of ignoring warnings, but generally trust appropriately' },
              { value: 3, label: 'Never - No pattern of being burned by people I had warnings about; I honor red flags consistently' }
            ]
          },
          // Open Response
          {
            text: 'Describe a specific time you trusted someone with money despite warning signs you noticed. What were the red flags you ignored, and what happened? What made you override your instincts?'
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
          How self-imposed suffering through undercharging, not collecting, and refusing to use resources creates artificial scarcity—
          patterns like giving away work for free, hoarding money while living in lack, and refusing to delegate because only you can do it right.
        </p>
        <p style="line-height: 1.7; color: rgba(255, 255, 255, 0.85);">
          <strong>Domain 2: Fear Leading to Isolation</strong><br>
          How ensuring things go wrong creates the disasters you fear—patterns like entering agreements without protection,
          sabotaging success just before breakthrough, and trusting people you knew had red flags.
        </p>

        <h3 style="color: #ad9168; margin-top: 25px;">How it Works</h3>
        <ul style="line-height: 1.8; color: rgba(255, 255, 255, 0.85);">
          <li>You will complete <strong>6 sections</strong>, one at a time (about 20-25 minutes total)</li>
          <li>Each section has <strong>4 scale questions</strong> and <strong>1 reflection question</strong></li>
          <li>Answer based on your actual patterns, not how you wish things were</li>
          <li>There are no "right" answers—this is about self-discovery</li>
          <li>AI analysis will provide personalized insights based on your responses</li>
        </ul>

        <div style="background: rgba(173, 145, 104, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ad9168; margin-top: 25px;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
            <strong>Tip:</strong> This assessment may surface uncomfortable feelings about how you limit yourself financially.
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
      // EDIT MODE: Also update EDIT_DRAFT row to keep RESPONSES sheet in sync
      // This ensures data isn't lost if PropertiesService gets cleared mid-session
      Logger.log(`[Tool7] Updating EDIT_DRAFT with current data`);
      DataService.updateDraft(clientId, 'tool7', draftData);
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

      return data || null;

    } catch (error) {
      Logger.log(`[Tool7] Error getting existing data: ${error}`);
      return null;
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
            <button class="btn-primary" onclick="returnToDashboard()">
              Return to Dashboard →
            </button>
          </div>
        </div>
        <script>
          function returnToDashboard() {
            google.script.run
              .withSuccessHandler(function(dashboardHtml) {
                if (dashboardHtml) {
                  document.open();
                  document.write(dashboardHtml);
                  document.close();
                  window.scrollTo(0, 0);
                } else {
                  alert('Error loading dashboard');
                }
              })
              .withFailureHandler(function(error) {
                console.error('Navigation error:', error);
                alert('Error returning to dashboard: ' + error.message);
              })
              .getDashboardPage('${clientId}');
          }
        </script>
      </body>
      </html>
    `;
  }
};
