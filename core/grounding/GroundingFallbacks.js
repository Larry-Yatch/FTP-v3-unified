/**
 * GroundingFallbacks.js
 * Fallback insights for grounding tools when GPT analysis fails
 *
 * Structure:
 * - 18 subdomain-specific fallbacks (6 per tool)
 * - 6 domain-specific fallbacks (2 per tool)
 * - 3 tool-specific overall fallbacks (1 per tool)
 *
 * Fallbacks are score-aware and provide actionable guidance based on:
 * - Subdomain aspect scores (belief, behavior, feeling, consequence)
 * - Domain quotients
 * - Overall quotient
 */

const GroundingFallbacks = {

  /**
   * Get subdomain-specific fallback insight
   *
   * @param {string} toolId - Tool identifier (tool3, tool5, tool7)
   * @param {string} subdomainKey - Subdomain key
   * @param {Object} aspectScores - Raw aspect scores {belief, behavior, feeling, consequence}
   * @param {Object} responses - Form responses (optional, for context)
   * @returns {Object} Fallback insight
   */
  getSubdomainFallback(toolId, subdomainKey, aspectScores, responses) {
    const fallbackKey = `${toolId}_${subdomainKey}`;
    const fallback = this.subdomainFallbacks[fallbackKey];

    if (!fallback) {
      LogUtils.warn(`No fallback found for ${fallbackKey}, using generic`);
      return this.getGenericSubdomainFallback(aspectScores);
    }

    // Get score-aware variation
    const avgScore = (
      aspectScores.belief +
      aspectScores.behavior +
      aspectScores.feeling +
      aspectScores.consequence
    ) / 4;

    // Select variation based on score severity
    let variation;
    if (avgScore <= -2) {
      variation = fallback.critical; // Highly problematic
    } else if (avgScore <= 0) {
      variation = fallback.moderate; // Moderately problematic
    } else {
      variation = fallback.healthy; // Relatively healthy
    }

    return {
      pattern: variation.pattern,
      insight: variation.insight,
      action: variation.action,
      rootBelief: variation.rootBelief
    };
  },

  /**
   * Get domain-specific fallback synthesis
   */
  getDomainFallback(toolId, domainConfig, subdomainScores, domainScore) {
    const fallbackKey = `${toolId}_${domainConfig.key}`;
    const fallback = this.domainFallbacks[fallbackKey];

    if (!fallback) {
      return this.getGenericDomainFallback(domainConfig, domainScore);
    }

    return {
      summary: fallback.summary,
      keyThemes: fallback.keyThemes,
      priorityFocus: fallback.priorityFocus
    };
  },

  /**
   * Get overall tool fallback synthesis
   */
  getOverallFallback(toolId, toolConfig, allScores) {
    const fallback = this.overallFallbacks[toolId];

    if (!fallback) {
      return this.getGenericOverallFallback(toolConfig, allScores);
    }

    return {
      overview: fallback.overview,
      integration: fallback.integration,
      coreWork: fallback.coreWork,
      nextSteps: fallback.nextSteps
    };
  },

  // ============================================================
  // SUBDOMAIN FALLBACKS (18 total: 6 per tool)
  // ============================================================

  subdomainFallbacks: {

    // ========================================
    // TOOL 3: Identity & Validation
    // ========================================

    'tool3_subdomain_1_1': {
      // "I'm Not Worthy of Financial Freedom"
      critical: {
        pattern: "Deep unworthiness around money shows up as self-sabotage and financial limitation",
        insight: "Your belief that you're not worthy of financial freedom actively prevents you from building stability",
        action: "Identify one way you've limited your finances based on unworthiness, and take one small contrary action this week",
        rootBelief: "I don't deserve financial security or success"
      },
      moderate: {
        pattern: "Worthiness struggles occasionally interfere with financial progress",
        insight: "You sometimes undermine your financial success because part of you doesn't feel deserving",
        action: "Notice when unworthiness thoughts arise around money and challenge them with evidence of your competence",
        rootBelief: "I'm not sure if I deserve financial stability"
      },
      healthy: {
        pattern: "Generally healthy sense of worth, with occasional doubts around financial success",
        insight: "You mostly believe you deserve financial wellbeing, with minor self-worth wobbles",
        action: "Reinforce your worthiness by acknowledging three ways you've managed money responsibly",
        rootBelief: "I deserve financial stability and am learning to fully own it"
      }
    },

    'tool3_subdomain_1_2': {
      // "I'll Never Have Enough"
      critical: {
        pattern: "Chronic scarcity mindset drives compulsive behaviors and prevents satisfaction",
        insight: "Your belief in perpetual scarcity makes it impossible to feel financially secure, no matter how much you have",
        action: "Track what you actually have (not what you lack) for one week - write it down daily",
        rootBelief: "There will never be enough, no matter what I do"
      },
      moderate: {
        pattern: "Scarcity fear occasionally overrides financial reality",
        insight: "You sometimes can't see what you have because you're focused on what's missing",
        action: "Practice gratitude for one financial resource you currently have - notice its adequacy",
        rootBelief: "I worry there won't be enough"
      },
      healthy: {
        pattern: "Generally balanced view of resources with occasional scarcity anxiety",
        insight: "You mostly recognize your resources, with normal concerns about the future",
        action: "Continue building your 'enoughness' awareness by noting when you have what you need",
        rootBelief: "I generally have enough and am learning to trust that"
      }
    },

    'tool3_subdomain_1_3': {
      // "I Can't See My Financial Reality"
      critical: {
        pattern: "Severe financial avoidance and denial prevent any accurate assessment of reality",
        insight: "You actively avoid knowing your true financial situation, which makes managing money impossible",
        action: "Look at ONE financial fact you've been avoiding (one account balance, one bill) - just look, don't fix yet",
        rootBelief: "Seeing my financial reality would be too overwhelming"
      },
      moderate: {
        pattern: "Selective blindness around uncomfortable financial facts",
        insight: "You can see parts of your financial picture but avoid the parts that cause anxiety",
        action: "Identify one financial area you've been avoiding and schedule 15 minutes to review it this week",
        rootBelief: "I'm afraid of what I'll find if I look too closely"
      },
      healthy: {
        pattern: "Generally clear financial vision with occasional blind spots",
        insight: "You mostly see your financial reality clearly, with normal human avoidance of discomfort",
        action: "Maintain your financial clarity by doing monthly check-ins on all accounts",
        rootBelief: "I can handle seeing my financial reality"
      }
    },

    'tool3_subdomain_2_1': {
      // "Money Shows My Worth"
      critical: {
        pattern: "Complete equation of net worth with self-worth drives desperate and destructive financial behaviors",
        insight: "You believe your value as a person is determined by money, creating constant shame and striving",
        action: "Write down three things that make you valuable that have nothing to do with money",
        rootBelief: "I am only as valuable as my financial status"
      },
      moderate: {
        pattern: "Significant conflation of financial success with personal value",
        insight: "You sometimes measure your worth by financial metrics, creating unnecessary pressure",
        action: "Notice when you judge yourself based on money and consciously separate the two",
        rootBelief: "My worth is connected to my money, even though I know it shouldn't be"
      },
      healthy: {
        pattern: "Mostly separate sense of self-worth from financial status",
        insight: "You generally know your value isn't determined by money, with occasional comparison moments",
        action: "Continue separating identity from finances by noticing when you conflate them",
        rootBelief: "My worth is inherent, not financial"
      }
    },

    'tool3_subdomain_2_2': {
      // "What Will They Think?"
      critical: {
        pattern: "Constant external validation seeking drives every financial decision, creating chaos",
        insight: "You can't make any money decision without worrying what others think, paralyzing your autonomy",
        action: "Make one small financial choice based solely on what YOU want, not what others might think",
        rootBelief: "Others' opinions of my finances matter more than my own needs"
      },
      moderate: {
        pattern: "Frequent concern about others' judgment of financial choices",
        insight: "You often factor in others' potential opinions when making money decisions",
        action: "Before your next financial decision, ask 'What do I think?' before 'What will they think?'",
        rootBelief: "I care too much about financial appearances"
      },
      healthy: {
        pattern: "Generally autonomous financial decisions with normal social awareness",
        insight: "You mostly make decisions based on your values, with healthy consideration of context",
        action: "Continue strengthening financial autonomy by noticing whose opinion you're considering and why",
        rootBelief: "My financial decisions are mine to make"
      }
    },

    'tool3_subdomain_2_3': {
      // "I Need to Prove Myself"
      critical: {
        pattern: "Desperate proving through money drives compulsive earning, spending, and comparison",
        insight: "You're trying to prove your value through financial achievement, which can never satisfy",
        action: "Identify one way you're trying to prove yourself with money and pause that behavior for one week",
        rootBelief: "I must prove my worth through financial success"
      },
      moderate: {
        pattern: "Regular use of money to demonstrate competence or value",
        insight: "You sometimes use financial achievement to feel or show that you're 'enough'",
        action: "Notice when you're trying to prove something with money and ask what you're really seeking",
        rootBelief: "I often feel I need to prove myself financially"
      },
      healthy: {
        pattern: "Mostly internally-motivated financial goals with occasional proving impulses",
        insight: "You generally pursue financial goals for your own reasons, not to prove anything",
        action: "Continue building intrinsic motivation by checking: 'Am I doing this for me or to prove something?'",
        rootBelief: "I don't need to prove anything - my worth is inherent"
      }
    },

    // ========================================
    // TOOL 5: Love & Connection
    // ========================================

    'tool5_subdomain_1_1': {
      // "I Must Give to Be Loved"
      critical: {
        pattern: "Compulsive financial giving driven by fear of abandonment is depleting you",
        insight: "You believe love must be purchased through giving money, creating financial crisis and enabling dysfunction",
        action: "Say 'no' to one financial request this week and notice that the relationship survives",
        rootBelief: "If I don't give money, I won't be loved"
      },
      moderate: {
        pattern: "Frequent over-giving with money to maintain connection",
        insight: "You often give beyond your means because you're afraid of losing love if you stop",
        action: "Set one financial boundary with someone you care about and observe the outcome",
        rootBelief: "Giving money helps secure love and connection"
      },
      healthy: {
        pattern: "Generally healthy giving with occasional fear-based over-giving",
        insight: "You mostly give from abundance and choice, with occasional lapses into fear-based giving",
        action: "Continue noticing the difference between generous giving and fearful giving",
        rootBelief: "Love doesn't require financial transactions"
      }
    },

    'tool5_subdomain_1_2': {
      // "Their Needs > My Needs"
      critical: {
        pattern: "Complete self-abandonment around finances - others' needs always come first",
        insight: "You believe you don't matter and everyone else's financial needs are more important than yours",
        action: "Spend money on ONE thing you need (not want - need) before giving to someone else this week",
        rootBelief: "My needs don't matter as much as others' needs"
      },
      moderate: {
        pattern: "Regular prioritization of others' financial needs over your own",
        insight: "You often neglect your financial needs to take care of others",
        action: "List your top three financial needs and commit to addressing one before helping anyone else",
        rootBelief: "Taking care of myself feels selfish"
      },
      healthy: {
        pattern: "Generally balanced attention to own and others' needs",
        insight: "You mostly maintain healthy self-care while also caring for others",
        action: "Continue checking: 'Have I taken care of myself before trying to care for them?'",
        rootBelief: "My needs matter too"
      }
    },

    'tool5_subdomain_1_3': {
      // "I Can't Accept Help"
      critical: {
        pattern: "Complete refusal of help creates financial isolation and crisis",
        insight: "You cannot allow anyone to help you financially, leaving you struggling alone unnecessarily",
        action: "Accept one small offer of help this week - let someone buy you coffee or help with a task",
        rootBelief: "Accepting help means I'm weak or indebted"
      },
      moderate: {
        pattern: "Significant difficulty receiving financial support or help",
        insight: "You struggle to accept help even when you need it, creating unnecessary hardship",
        action: "Notice what happens when someone offers help - can you say yes once?",
        rootBelief: "I should handle everything myself"
      },
      healthy: {
        pattern: "Generally able to receive help with some discomfort",
        insight: "You can accept help when needed, though it might feel uncomfortable",
        action: "Continue practicing gracious receiving - it's a gift to the giver",
        rootBelief: "It's okay to accept help"
      }
    },

    'tool5_subdomain_2_1': {
      // "I Can't Make It Alone"
      critical: {
        pattern: "Complete financial dependence on others prevents autonomy and traps you",
        insight: "You believe you cannot survive financially without someone else, creating dangerous dependence",
        action: "Take one small step toward financial independence - open your own account, make one decision alone",
        rootBelief: "I cannot survive financially without someone else"
      },
      moderate: {
        pattern: "Significant reliance on others for financial security",
        insight: "You depend on others financially more than necessary, limiting your freedom",
        action: "Identify one area where you could build more financial independence and take one step there",
        rootBelief: "I'm not sure I can manage money on my own"
      },
      healthy: {
        pattern: "Generally financially autonomous with healthy interdependence",
        insight: "You maintain your own financial footing while also valuing connection and support",
        action: "Continue building skills and confidence in financial self-sufficiency",
        rootBelief: "I can handle my finances with or without help"
      }
    },

    'tool5_subdomain_2_2': {
      // "I Owe Them Everything"
      critical: {
        pattern: "Crushing sense of obligation controls all financial decisions",
        insight: "You believe you owe everything to those who've helped you, surrendering your financial autonomy",
        action: "Identify one financial decision you've avoided because of obligation and reclaim it",
        rootBelief: "I owe them everything and can never repay them"
      },
      moderate: {
        pattern: "Significant sense of financial obligation limiting freedom",
        insight: "You feel indebted to those who've helped you and let that control your choices",
        action: "Separate gratitude from obligation - can you be thankful without being trapped?",
        rootBelief: "Help creates debt that must be repaid"
      },
      healthy: {
        pattern: "Gratitude without obligation - healthy appreciation",
        insight: "You're grateful for help received without feeling controlled by it",
        action: "Continue practicing: 'Thank you' doesn't mean 'I owe you'",
        rootBelief: "Gratitude and freedom can coexist"
      }
    },

    'tool5_subdomain_2_3': {
      // "I Stay in Debt"
      critical: {
        pattern: "Chronic debt accumulation keeps you trapped in financial instability and dependence",
        insight: "You believe you will never escape debt, so you continue patterns that keep you in a financial hole",
        action: "List all your debts in one place - seeing the full picture is the first step to changing the pattern",
        rootBelief: "I will always be in debt; getting ahead is impossible for someone like me"
      },
      moderate: {
        pattern: "Recurring debt patterns prevent financial stability",
        insight: "You often take on debt or spend beyond your means, keeping yourself financially behind",
        action: "Identify one debt pattern (credit cards, borrowing, overspending) and commit to one small change this week",
        rootBelief: "No matter what I try, I end up back in debt"
      },
      healthy: {
        pattern: "Generally managing debt with occasional setbacks",
        insight: "You mostly live within your means, with some room to strengthen your relationship with debt",
        action: "Continue building your debt-free habits and notice what triggers any slips into old patterns",
        rootBelief: "I am capable of managing my finances and staying out of unnecessary debt"
      }
    },

    // ========================================
    // TOOL 7: Security & Control
    // ========================================
    // NOTE: Tool 7 fallbacks will be implemented when Tool 7 content is finalized
    // Placeholders included for completeness

    'tool7_subdomain_1_1': {
      critical: {
        pattern: "Severe control patterns around money create rigidity and anxiety",
        insight: "Your need for financial control is actually increasing your stress and limiting possibilities",
        action: "Allow one small financial variable this week - notice you can handle it",
        rootBelief: "If I don't control everything, it will all fall apart"
      },
      moderate: {
        pattern: "Significant need for financial control interfering with flexibility",
        insight: "You try to control financial outcomes tightly, which sometimes backfires",
        action: "Practice tolerating one area of financial uncertainty this week",
        rootBelief: "Control keeps me safe"
      },
      healthy: {
        pattern: "Healthy planning with flexibility when needed",
        insight: "You manage finances responsibly without needing to control every detail",
        action: "Continue balancing planning with flexibility",
        rootBelief: "I can plan without needing total control"
      }
    },

    'tool7_subdomain_1_2': {
      critical: {
        pattern: "Compulsive financial preparation never creates enough security",
        insight: "No amount of preparation feels sufficient - you're chasing a feeling that won't come from money",
        action: "Notice: At what point would it be 'enough'? That's your real work",
        rootBelief: "I can never be prepared enough"
      },
      moderate: {
        pattern: "Over-preparation around finances creates stress",
        insight: "Your preparation sometimes crosses into anxiety-driven over-planning",
        action: "Set a 'good enough' threshold for one financial area - stop there",
        rootBelief: "More preparation = more safety"
      },
      healthy: {
        pattern: "Healthy preparation without compulsion",
        insight: "You prepare responsibly and can stop when it's sufficient",
        action: "Continue trusting your judgment about 'enough preparation'",
        rootBelief: "I can prepare adequately without overdoing it"
      }
    },

    'tool7_subdomain_1_3': {
      critical: {
        pattern: "Severe rigidity in financial systems prevents adaptation",
        insight: "Your financial systems are so rigid that normal life changes feel catastrophic",
        action: "Allow yourself to deviate from one financial 'rule' this week - notice you survive",
        rootBelief: "The system must never change or everything fails"
      },
      moderate: {
        pattern: "Strong preference for financial structure with difficulty adapting",
        insight: "You have good systems but struggle when they need to flex",
        action: "Practice adapting one financial routine this week - build flexibility",
        rootBelief: "Structure keeps me safe, change feels dangerous"
      },
      healthy: {
        pattern: "Healthy structure with adaptive capacity",
        insight: "You have good systems and can adjust them when needed",
        action: "Continue balancing structure with flexibility",
        rootBelief: "Structure serves me; I'm not enslaved by it"
      }
    },

    'tool7_subdomain_2_1': {
      critical: {
        pattern: "Catastrophic thinking paralyzes all financial action",
        insight: "You imagine the worst possible outcomes for every financial decision, preventing movement",
        action: "Take one small financial action despite the catastrophic thoughts - prove them wrong",
        rootBelief: "The worst will definitely happen"
      },
      moderate: {
        pattern: "Frequent catastrophizing about financial outcomes",
        insight: "Your mind goes to worst-case scenarios readily, creating unnecessary anxiety",
        action: "When catastrophizing starts, ask: 'What's most LIKELY to happen?' - reality-test it",
        rootBelief: "Things usually go badly"
      },
      healthy: {
        pattern: "Realistic assessment of financial risks",
        insight: "You can assess risks without jumping to catastrophe",
        action: "Continue realistic risk assessment without catastrophizing",
        rootBelief: "Most outcomes are neutral or manageable"
      }
    },

    'tool7_subdomain_2_2': {
      critical: {
        pattern: "Pervasive fear of financial disaster prevents any risk-taking",
        insight: "You're so afraid of losing everything that you can't make progress",
        action: "Take one tiny calculated financial risk this week - smallest possible step forward",
        rootBelief: "I will lose everything"
      },
      moderate: {
        pattern: "Significant fear of financial loss limits opportunities",
        insight: "Your fear of loss is preventing reasonable growth opportunities",
        action: "Identify one 'safe enough' growth move and take it",
        rootBelief: "Loss is always lurking"
      },
      healthy: {
        pattern: "Healthy caution without paralysis",
        insight: "You're appropriately careful without letting fear prevent growth",
        action: "Continue balancing caution with opportunity",
        rootBelief: "I can manage reasonable risks"
      }
    },

    'tool7_subdomain_2_3': {
      critical: {
        pattern: "Complete avoidance of financial decisions due to terror",
        insight: "You're so afraid of making wrong financial decisions that you make no decisions",
        action: "Make one small reversible financial decision this week - prove you can",
        rootBelief: "Any decision will be the wrong one"
      },
      moderate: {
        pattern: "Significant decision paralysis around finances",
        insight: "You struggle to make financial decisions due to fear of mistakes",
        action: "Practice making small financial decisions quickly - build decision muscle",
        rootBelief: "I might make the wrong choice"
      },
      healthy: {
        pattern: "Healthy decision-making with normal uncertainty",
        insight: "You can make financial decisions despite not having perfect information",
        action: "Continue trusting your judgment in financial decisions",
        rootBelief: "I can make good-enough decisions"
      }
    }
  },

  // ============================================================
  // DOMAIN FALLBACKS (6 total: 2 per tool)
  // ============================================================

  domainFallbacks: {
    'tool3_domain1': {
      summary: "Your False Self-View patterns show disconnection from your authentic financial reality. These patterns create a distorted lens through which you see your relationship with money.",
      keyThemes: [
        "Difficulty seeing yourself and your financial situation accurately",
        "Protective distortions that keep you from seeing the truth",
        "Opportunity to build genuine self-awareness and financial clarity"
      ],
      priorityFocus: "Start with the subdomain showing the strongest pattern - this is where the distortion is most pronounced and where clarity will have the greatest impact."
    },
    'tool3_domain2': {
      summary: "Your External Validation patterns show dependence on others' opinions for financial decisions. This creates instability as your financial life is driven by external rather than internal guidance.",
      keyThemes: [
        "Difficulty trusting your own financial judgment",
        "Over-reliance on others' approval for money decisions",
        "Need to develop internal financial authority"
      ],
      priorityFocus: "Focus on the subdomain with the highest score - this is where external validation has the strongest grip on your financial autonomy."
    },
    'tool5_domain1': {
      summary: "Your Issues Showing Love patterns reveal how you use money to secure connection, often at the expense of your own financial wellbeing. These patterns can deplete your resources and enable unhealthy dynamics.",
      keyThemes: [
        "Using money as a tool to maintain relationships",
        "Difficulty setting financial boundaries in relationships",
        "Opportunity to separate love from financial transactions"
      ],
      priorityFocus: "Begin with the subdomain showing the most intense pattern - this is where financial boundary-setting will be most important."
    },
    'tool5_domain2': {
      summary: "Your Issues Receiving Love patterns show difficulty accepting help and maintaining financial independence. These patterns can trap you in unhealthy dependence or isolating self-sufficiency.",
      keyThemes: [
        "Struggles with healthy financial interdependence",
        "Either excessive dependence or refusal of support",
        "Need to develop balanced giving and receiving"
      ],
      priorityFocus: "Target the highest subdomain - this reveals where receiving patterns are most problematic and where growth will create the most freedom."
    },
    'tool7_domain1': {
      summary: "Your Need for Control patterns show how you try to manage anxiety through rigid financial systems. While structure is helpful, excessive control creates its own stress and limits flexibility.",
      keyThemes: [
        "Anxiety management through financial control",
        "Rigidity that prevents adaptive responses",
        "Opportunity to build trust in flexibility"
      ],
      priorityFocus: "Work with the subdomain scoring highest - this is where control is tightest and where loosening will reduce the most stress."
    },
    'tool7_domain2': {
      summary: "Your Fear & Catastrophizing patterns reveal how anxiety about financial disaster shapes your decisions. This hypervigilance can prevent reasonable risk-taking and growth.",
      keyThemes: [
        "Worst-case thinking driving financial decisions",
        "Fear preventing growth opportunities",
        "Need to develop realistic risk assessment"
      ],
      priorityFocus: "Start with your highest subdomain - this shows where catastrophic thinking has the strongest hold and where reality-testing will help most."
    }
  },

  // ============================================================
  // OVERALL FALLBACKS (3 total: 1 per tool)
  // ============================================================

  overallFallbacks: {
    'tool3': {
      overview: "Your assessment reveals patterns of disconnection from yourself in your financial life. These patterns show up as distortions in how you see your financial reality and over-reliance on external validation for financial decisions. When you can't see yourself or your finances clearly, and when you need others' approval to make decisions, you remain stuck in patterns that don't serve you.",
      integration: "False Self-View and External Validation work together to create a double disconnection: You can't see yourself clearly AND you don't trust your own judgment. This leaves you vulnerable to others' agendas and unable to build authentic financial stability based on your true needs and values.",
      coreWork: "The fundamental shift needed is developing internal authority based on clear self-knowledge. This means learning to see yourself and your finances accurately (removing the distortions) and trusting your own judgment about financial decisions (releasing the need for external validation).",
      nextSteps: [
        "Work with your highest domain first - this is where disconnection from self is most pronounced",
        "Within that domain, focus on the highest subdomain",
        "Practice the specific action step provided for that area",
        "Begin building the habit of checking in with yourself ('What do I actually see?' and 'What do I think?') before seeking external input",
        "Track your progress over 30 days - notice when you can see more clearly and trust yourself more"
      ]
    },
    'tool5': {
      overview: "Your assessment reveals patterns of disconnection from others in your financial life. These patterns show up either as over-giving (using money to secure love) or unhealthy dependence/isolation (struggling with receiving). When money becomes entangled with love and connection, you can't have healthy financial relationships or maintain your own financial wellbeing.",
      integration: "Issues Showing Love and Issues Receiving Love create a push-pull dynamic in your financial relationships. You might deplete yourself trying to buy love, or trap yourself in dependence on others' financial support, or isolate yourself refusing all help. All of these patterns keep you from healthy financial interdependence.",
      coreWork: "The fundamental shift needed is separating money from love - learning that connection doesn't require financial transactions. This means developing the ability to give from choice rather than fear, and receive from openness rather than neediness or resistance.",
      nextSteps: [
        "Focus on your highest domain - this shows whether your primary pattern is giving or receiving",
        "Within that domain, address the highest subdomain first",
        "Practice the specific boundary or receiving action provided",
        "Begin noticing when you're using money to manage relationship anxiety rather than addressing the relationship directly",
        "Over the next 30 days, practice one act of healthy financial boundary-setting or receiving"
      ]
    },
    'tool7': {
      overview: "Your assessment reveals patterns of disconnection from trust and flow in your financial life. These patterns show up as excessive control (trying to manage every variable) and catastrophic thinking (always expecting disaster). When you can't trust the process or tolerate uncertainty, you create rigidity and anxiety that limit your financial possibilities.",
      integration: "Need for Control and Fear & Catastrophizing reinforce each other: The more you fear disaster, the more you try to control. The more you try to control, the more anxious you become about variables outside your control. This creates an exhausting cycle that never produces the security you seek.",
      coreWork: "The fundamental shift needed is developing trust in your ability to handle uncertainty and adapt to change. This means loosening rigid control patterns and building resilience through realistic risk assessment rather than catastrophic thinking.",
      nextSteps: [
        "Address your highest domain first - this reveals whether control or fear is your primary pattern",
        "Within that domain, work with the highest subdomain",
        "Practice the flexibility or reality-testing action provided",
        "Begin noticing when you're controlling or catastrophizing and ask: 'What's really happening right now?' vs 'What am I afraid might happen?'",
        "Over 30 days, practice tolerating one area of financial uncertainty - prove to yourself you can handle it"
      ]
    }
  },

  // ============================================================
  // GENERIC FALLBACKS (when no specific fallback exists)
  // ============================================================

  getGenericSubdomainFallback(aspectScores) {
    const avgScore = (
      aspectScores.belief +
      aspectScores.behavior +
      aspectScores.feeling +
      aspectScores.consequence
    ) / 4;

    if (avgScore <= -2) {
      return {
        pattern: "This area shows a significant pattern that impacts your financial wellbeing",
        insight: "Your scores indicate this pattern is affecting multiple aspects of your financial life",
        action: "Focus on bringing awareness to this pattern - notice when it shows up in your daily financial decisions",
        rootBelief: "There's an underlying belief here that's worth exploring with reflection or support"
      };
    } else if (avgScore <= 0) {
      return {
        pattern: "This area shows a moderate pattern with room for growth",
        insight: "Your scores suggest this pattern sometimes interferes with your financial clarity",
        action: "Notice when this pattern appears and experiment with a different response",
        rootBelief: "Explore what belief might be driving this pattern"
      };
    } else {
      return {
        pattern: "This area shows relative health with continued growth possible",
        insight: "Your scores indicate you have some awareness and healthy practices here",
        action: "Continue building on your strengths in this area",
        rootBelief: "You have some healthy beliefs supporting this area"
      };
    }
  },

  getGenericDomainFallback(domainConfig, domainScore) {
    return {
      summary: `Your ${domainConfig.name} domain shows patterns worth exploring. The subdomains reveal specific areas where disconnection shows up in your financial life.`,
      keyThemes: [
        "Patterns that interfere with financial clarity and wellbeing",
        "Opportunities for growth and healing",
        "Starting points for building new patterns"
      ],
      priorityFocus: "Focus on the subdomain with the highest score - this is where the pattern is most pronounced and where initial work will have the greatest impact."
    };
  },

  getGenericOverallFallback(toolConfig, allScores) {
    return {
      overview: `Your ${toolConfig.name} assessment reveals patterns of disconnection that affect your financial life. These patterns show up in varying degrees across different areas, creating opportunities for targeted growth and healing.`,
      integration: "The domains interact to create your overall pattern. Understanding how they influence each other helps you see the bigger picture and make more effective changes.",
      coreWork: "The fundamental work is building awareness of these patterns and practicing new responses when they arise. Change happens through consistent small actions, not dramatic overhauls.",
      nextSteps: [
        "Focus on your highest domain - this is where patterns are most pronounced",
        "Within that domain, address the highest subdomain first",
        "Take the specific action recommended for that area",
        "Track your observations and progress over 30 days",
        "Celebrate small shifts - they compound over time"
      ]
    };
  }
};
