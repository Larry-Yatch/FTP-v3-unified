/**
 * CollectiveResultsMetadata.js - Static metadata for CollectiveResults
 *
 * Extracted from CollectiveResults.js for maintainability.
 * Contains tool labels, strategy definitions, grounding config,
 * gap interpretations, integration profiles, and domain labels.
 *
 * Referenced by CollectiveResults.js via property aliases.
 * GAS loads this file first (alphabetically before CollectiveResults.js).
 */

const CollectiveResultsMetadata = {

  TOOL_META: {
    tool1: { name: 'Core Trauma Strategy Assessment', shortName: 'Trauma Strategy', icon: '🧠' },
    tool2: { name: 'Financial Clarity & Values', shortName: 'Financial Clarity', icon: '📊' },
    tool3: { name: 'Identity & Validation', shortName: 'Identity & Validation', icon: '🪞' },
    tool4: { name: 'Financial Freedom Framework', shortName: 'Budget Framework', icon: '💰' },
    tool5: { name: 'Love & Connection', shortName: 'Love & Connection', icon: '❤️' },
    tool6: { name: 'Retirement Blueprint', shortName: 'Retirement Blueprint', icon: '🏦' },
    tool7: { name: 'Security & Control', shortName: 'Security & Control', icon: '🛡️' },
    tool8: { name: 'Investment Planning', shortName: 'Investment Planning', icon: '📈' }
  },

  STRATEGY_LABELS: {
    FSV: 'False Self-View',
    ExVal: 'External Validation',
    Showing: 'Issues Showing Love',
    Receiving: 'Issues Receiving Love',
    Control: 'Control Leading to Isolation',
    Fear: 'Fear Leading to Isolation'
  },

  // Brief insight text per strategy (extracted from Tool1Templates first paragraphs)
  STRATEGY_INSIGHTS: {
    FSV: 'The core strategy behind False Self-View is to use a "mask" to be safe — attaching to untrue, usually negative views of ourselves such as I am not worthy or I am not good enough.',
    ExVal: 'The core strategy behind External Validation is the need to be accepted, valued, or recognized to feel safe — giving up ourselves to be something we think others value.',
    Showing: 'The core strategy behind Issues Showing Love is to suffer or sacrifice when showing love or care for another — feeling like everyone deserves to be happy except us.',
    Receiving: 'The core strategy behind Issues Receiving Love is emotional disconnection — avoiding our emotions or emotional people because we believe love will cause pain.',
    Control: 'The core strategy behind Control is that we must maintain control of our environment to stay safe — the more we control, the more fear reinforces the need for control.',
    Fear: 'The core strategy behind Fear Leading to Isolation is the sense that we control nothing and are never safe — defaulting to worst-case scenarios and inaction.'
  },

  // Priority order for incomplete tool cards — tools that unlock the most integration value first
  TOOL_PRIORITY: [
    {
      toolKey: 'tool1',
      priority: 1,
      unlocks: 'Your Integration Profile + all pattern warnings',
      cta: 'This is the foundation — everything else builds on it.'
    },
    {
      toolKey: 'tool3',
      priority: 2,
      unlocks: 'Identity beliefs, Pipeline A + B, belief locks',
      cta: 'See how your identity beliefs drive your financial decisions.'
    },
    {
      toolKey: 'tool2',
      priority: 3,
      unlocks: 'Awareness Gap calculation + financial stress analysis',
      cta: 'Find out if you are seeing the full picture of your financial stress.'
    },
    {
      toolKey: 'tool5',
      priority: 4,
      unlocks: 'Caretaking patterns, Pipeline B, belief locks',
      cta: 'Discover how your relationships shape your spending.'
    },
    {
      toolKey: 'tool7',
      priority: 5,
      unlocks: 'Control patterns, Pipeline A, belief locks',
      cta: 'Understand the security behaviors driving your financial choices.'
    },
    {
      toolKey: 'tool4',
      priority: 6,
      unlocks: 'Budget allocation data for GPT report',
      cta: 'Map your ideal spending across the four financial categories.'
    },
    {
      toolKey: 'tool6',
      priority: 7,
      unlocks: 'Retirement vehicle analysis for GPT report',
      cta: 'Build your long-term financial blueprint.'
    },
    {
      toolKey: 'tool8',
      priority: 8,
      unlocks: 'Investment planning data for GPT report',
      cta: 'Define your investment strategy and risk tolerance.'
    }
  ],

  GROUNDING_CONFIG: {
    tool3: {
      domain1Name: 'False Self-View (FSV)',
      domain2Name: 'External Validation (ExVal)',
      subdomains: {
        subdomain_1_1: "I am Not Worthy of Financial Freedom",
        subdomain_1_2: "I will Never Have Enough",
        subdomain_1_3: "I Cannot See My Financial Reality",
        subdomain_2_1: "Money Shows My Worth",
        subdomain_2_2: "What Will They Think?",
        subdomain_2_3: "I Need to Prove I am Successful"
      }
    },
    tool5: {
      domain1Name: 'Issues Showing Love (ISL)',
      domain2Name: 'Issues Receiving Love (IRL)',
      subdomains: {
        subdomain_1_1: "I Must Give to Be Loved",
        subdomain_1_2: "Their Needs Are Greater Than My Needs",
        subdomain_1_3: "I Cannot Accept Help",
        subdomain_2_1: "I Cannot Make It Alone",
        subdomain_2_2: "I Owe Them Everything",
        subdomain_2_3: "I Will Always Be in Debt"
      }
    },
    tool7: {
      domain1Name: 'Control Leading to Isolation (CLI)',
      domain2Name: 'Fear Leading to Isolation (FLI)',
      subdomains: {
        subdomain_1_1: "I Undercharge and Give Away",
        subdomain_1_2: "I Have Money But Will Not Use It",
        subdomain_1_3: "Only I Can Do It Right",
        subdomain_2_1: "I Do Not Protect Myself",
        subdomain_2_2: "I Sabotage Success",
        subdomain_2_3: "I Am Destined to Be Betrayed"
      }
    }
  },

  // Subdomain-specific belief-behavior gap interpretations
  // Each subdomain gets two interpretations depending on gap direction
  GAP_INTERPRETATIONS: {
    tool3: {
      // Domain 1: False Self-View (FSV) — Active Disconnection from Self
      subdomain_1_1: {
        // "I am Not Worthy of Financial Freedom"
        beliefExceedsAction: 'You hold a deep belief that you are not worthy of financial freedom, but your behavior has not fully surrendered to that story. Part of you is still reaching for something better — that resistance to your own unworthiness narrative is worth noticing.',
        actionExceedsBelief: 'You are living as though you do not deserve financial freedom more than you consciously believe it. You may tell yourself you want abundance, but your choices — scattered money, manufactured crises, avoided opportunities — are quietly proving a story of inadequacy you have not yet named.'
      },
      subdomain_1_2: {
        // "I will Never Have Enough"
        beliefExceedsAction: 'You strongly believe you will never have enough, but your actual financial behavior does not fully match that scarcity mindset. The gap suggests part of you knows better — your actions are more capable than your fear allows you to see.',
        actionExceedsBelief: 'Your financial behavior is creating scarcity that you do not consciously intend. You may not think you believe in "never enough," but your pattern of selective financial blindness — attending to spending when scared, ignoring it when comfortable — is manufacturing the very shortage you fear.'
      },
      subdomain_1_3: {
        // "I Cannot See My Financial Reality"
        beliefExceedsAction: 'You believe you cannot see your financial reality clearly, yet your behavior shows more clarity than you give yourself credit for. This gap suggests your self-image as financially confused is more rigid than your actual capabilities.',
        actionExceedsBelief: 'You are avoiding your financial reality more than you realize. You may think you have a handle on things, but the pattern of ignoring statements, avoiding account balances, and maintaining a fog around your money is running deeper than your conscious awareness.'
      },
      // Domain 2: External Validation (ExVal) — Passive Disconnection from Self
      subdomain_2_1: {
        // "Money Shows My Worth"
        beliefExceedsAction: 'You deeply believe your financial status reflects your personal worth, but your behavior has not fully committed to that equation. Something in you resists reducing yourself to a number — that resistance is a sign of deeper self-knowledge.',
        actionExceedsBelief: 'You are letting money define your worth more than you consciously realize. You may say money is not everything, but your emotional reactions to financial setbacks and your drive for financial achievement reveal a deeper equation: net worth equals self-worth.'
      },
      subdomain_2_2: {
        // "What Will They Think?"
        beliefExceedsAction: "You deeply believe that others' opinions determine your financial worth, but your behavior has not fully surrendered to that performance. Part of you resists curating your image — pay attention to what holds you back, because that resistance is healthy.",
        actionExceedsBelief: 'You are managing your financial image more than you realize. You may not think you care what others think, but your spending patterns tell a different story — purchases made for perception, lifestyle choices driven by audience. This facade is running on autopilot.'
      },
      subdomain_2_3: {
        // "I Need to Prove I am Successful"
        beliefExceedsAction: 'You carry a strong need to prove your success financially, but your behavior has not fully committed to the performance. The gap suggests you are exhausted by the proving — part of you is ready to stop performing and start living.',
        actionExceedsBelief: 'You are spending energy proving your financial success more than you consciously intend. The lifestyle inflation, the status purchases, the curated image — these are costing you more than money. The performance is running itself, even when you think you have stopped caring.'
      }
    },
    tool5: {
      // Domain 1: Issues Showing Love (ISL) — Active Disconnection from Others
      subdomain_1_1: {
        // "I Must Give to Be Loved"
        beliefExceedsAction: 'You hold a deep conviction that love requires financial sacrifice, but your behavior has not fully followed that belief. Something in you resists the compulsive giving — that internal brake is worth understanding, not overriding.',
        actionExceedsBelief: 'You are giving, paying, and financially sacrificing for others more than you consciously believe you need to. The martyrdom pattern is operating below your awareness — you may deny being a people-pleaser while your bank account tells the truth.'
      },
      subdomain_1_2: {
        // "Their Needs Are Greater Than My Needs"
        beliefExceedsAction: "You believe other people's financial needs outweigh your own, but your behavior has not fully surrendered to that hierarchy. Part of you still protects your own resources — that self-preservation instinct is not selfish, it is necessary.",
        actionExceedsBelief: "You are prioritizing others' financial needs over your own more than you realize. You may think you maintain healthy boundaries, but the pattern of always paying, always covering, always being the financial safety net is eroding your own stability without your conscious permission."
      },
      subdomain_1_3: {
        // "I Cannot Accept Help"
        beliefExceedsAction: 'You strongly believe you should not accept financial help, but your behavior shows more flexibility than your belief allows. You have accepted help in ways you may not recognize as help — this capacity to receive is a strength, not a weakness.',
        actionExceedsBelief: 'You are refusing financial support and assistance more than you consciously intend. You may think you are just independent, but the reflexive rejection of help — even when you need it — is isolating you financially and ensuring you carry burdens alone that were never meant for one person.'
      },
      // Domain 2: Issues Receiving Love (IRL) — Passive Disconnection from Others
      subdomain_2_1: {
        // "I Cannot Make It Alone"
        beliefExceedsAction: 'You believe you cannot handle your finances independently, but your behavior shows more capability than you give yourself credit for. The gap suggests learned helplessness — you have more financial competence than your fear-based identity allows you to access.',
        actionExceedsBelief: 'You are relying on others financially more than you consciously believe you need to. You may tell yourself you are just accepting help temporarily, but the pattern of dependency has become structural — others make decisions, pay bills, and manage money that you are capable of handling yourself.'
      },
      subdomain_2_2: {
        // "I Owe Them Everything"
        beliefExceedsAction: 'You carry a heavy sense of financial obligation to others, but your behavior has not fully surrendered to that debt. Part of you recognizes that love and obligation are different currencies — the gap between what you feel you owe and how you act reveals a quiet boundary you have not yet named.',
        actionExceedsBelief: 'You are behaving as though you owe others financially more than you consciously believe. The pattern of accepting strings-attached support, staying in situations because of felt obligation, and being unable to receive freely is running deeper than you realize. Every transaction is creating invisible debt.'
      },
      subdomain_2_3: {
        // "I Will Always Be in Debt"
        beliefExceedsAction: 'You believe you will always carry financial debt to others, but your behavior shows more independence than that belief predicts. The gap suggests your identity as someone in debt is more stubborn than your actual financial relationships — you may be freer than you feel.',
        actionExceedsBelief: 'You are living in a cycle of financial indebtedness — to people, institutions, and relationships — more than you consciously intend. You may not see yourself as chronically indebted, but the pattern of borrowing, owing, and feeling trapped by financial obligation is shaping your life more than you realize.'
      }
    },
    tool7: {
      // Domain 1: Control Leading to Isolation (CLI) — Active Disconnection from All That Is Greater
      subdomain_1_1: {
        // "I Undercharge and Give Away"
        beliefExceedsAction: 'You believe you undercharge and give your work away, and you see the pattern — but your behavior has not fully corrected it. The awareness is there; what is missing is the felt permission to charge what you are worth without guilt.',
        actionExceedsBelief: 'You are undercharging and giving away your financial value more than you realize. You may think your pricing is reasonable, but the pattern of discounting, doing free work, and letting invoices slide is systematically depriving you of income you have earned.'
      },
      subdomain_1_2: {
        // "I Have Money But Will Not Use It"
        beliefExceedsAction: 'You recognize that you hoard money and will not use it, but your behavior shows moments of spending that your scarcity identity discounts. The gap suggests you are more capable of trusting abundance than your fear-based belief system admits.',
        actionExceedsBelief: 'You are hoarding and restricting your use of money more than you consciously intend. You may think you are just being careful, but living in artificial scarcity while having resources is a control strategy that keeps you suffering unnecessarily. The money exists to be used — not just guarded.'
      },
      subdomain_1_3: {
        // "Only I Can Do It Right"
        beliefExceedsAction: 'You strongly believe no one else can handle money as well as you, but your behavior shows some capacity to delegate or trust others. That willingness to occasionally let go — even reluctantly — is the edge of growth worth expanding.',
        actionExceedsBelief: 'You are controlling financial decisions and refusing to delegate more than you consciously realize. You may think you are just thorough, but the refusal to hire help, share responsibility, or trust others with financial tasks is isolating you and capping your capacity.'
      },
      // Domain 2: Fear Leading to Isolation (FLI) — Passive Disconnection from All That Is Greater
      subdomain_2_1: {
        // "I Do Not Protect Myself"
        beliefExceedsAction: 'You recognize that you fail to protect yourself financially, and that awareness has started to change your behavior. The gap between knowing and doing is narrowing — you are beginning to act on what you see, even if it feels uncomfortable.',
        actionExceedsBelief: 'You are leaving yourself financially unprotected more than you realize. You may not think of yourself as reckless, but the pattern of entering deals without contracts, ignoring red flags, and not securing your interests is systematic. The vulnerability you are creating is not bad luck — it is a pattern.'
      },
      subdomain_2_2: {
        // "I Sabotage Success"
        beliefExceedsAction: 'You recognize a pattern of undermining your own financial success, but your recent behavior has not fully acted on it. This awareness is significant — the gap suggests you can see the pattern, which is the first step toward interrupting it.',
        actionExceedsBelief: 'You are undermining your own financial success more than you realize. You may think you are just unlucky or that things keep going wrong, but the pattern of stopping just before breakthrough is systematic and unconscious.'
      },
      subdomain_2_3: {
        // "I Am Destined to Be Betrayed"
        beliefExceedsAction: 'You carry a belief that financial betrayal is inevitable, but your behavior shows more trust than that belief would predict. The gap suggests your lived experience has not been as universally hostile as your fear insists — some relationships have held.',
        actionExceedsBelief: 'You are setting yourself up for financial betrayal more than you consciously realize. You may think others are simply untrustworthy, but the pattern of choosing the wrong partners, ignoring clear warnings, and not protecting your interests is creating the very betrayals you fear.'
      }
    }
  },

  DOMAIN_LABELS: {
    moneyFlow: 'Money Flow',
    obligations: 'Obligations',
    liquidity: 'Liquidity',
    growth: 'Growth',
    protection: 'Protection'
  },

  // Integration profile archetypes — triggered by Tool 1 winner + grounding tool subdomain scores
  INTEGRATION_PROFILES: {
    guardian: {
      name: 'The Guardian',
      icon: '🛡️',
      triggers: { tool1Winner: 'Control', groundingKey: 'tool7', subdomainKey: 'subdomain_1_3', threshold: 50 },
      description: 'You take full responsibility for your financial world. That strength becomes a wall when it blocks you from accepting help or delegating financial decisions.',
      financialSignature: 'Low obligation spending, high self-reliance, growth may stagnate from isolation.'
    },
    provider: {
      name: 'The Provider',
      icon: '❤️',
      triggers: { tool1Winner: 'Showing', groundingKey: 'tool5', subdomainKey: 'subdomain_1_1', threshold: 50 },
      description: 'You pour your financial energy into others. Your budgets often prioritize everyone else before they prioritize you.',
      financialSignature: 'High essentials allocation, low personal savings, freedom category underfunded.'
    },
    achiever: {
      name: 'The Achiever',
      icon: '🏆',
      triggers: { tool1Winner: 'FSV', groundingKey: 'tool3', subdomainKey: 'subdomain_2_1', threshold: 50 },
      description: 'You build wealth to prove something. Your financial engine runs hot, but the fuel is shame rather than strategy.',
      financialSignature: 'Growth-focused allocation, but motivation is compensatory rather than strategic.'
    },
    protector: {
      name: 'The Protector',
      icon: '🔒',
      triggers: { tool1Winner: 'Fear', groundingKey: 'tool7', subdomainKey: 'subdomain_2_2', threshold: 50 },
      description: 'You know the dangers but cannot bring yourself to build real protection. The fear that should motivate you has become the thing that freezes you.',
      financialSignature: 'Protection domain underserved, growth paralyzed, sabotage risk elevated.'
    },
    connector: {
      name: 'The Connector',
      icon: '🔗',
      triggers: { tool1Winner: 'Receiving', groundingKey: 'tool5', subdomainKey: 'subdomain_2_2', threshold: 50 },
      description: 'You experience money as a relationship currency. Financial obligations feel like emotional obligations, and both keep growing.',
      financialSignature: 'Obligation spending elevated, debt patterns, essentials include perceived debts to others.'
    },
    seeker: {
      name: 'The Seeker',
      icon: '🔍',
      triggers: null,
      description: 'Your patterns do not point to a single dominant strategy. You are navigating multiple influences at once, which means broad awareness matters more than any single fix.',
      financialSignature: 'Mixed financial indicators, no single pattern dominates.'
    }
  },

  // Tools with dedicated report pages vs calculator tools
  REPORT_TOOLS: ['tool1', 'tool2', 'tool3', 'tool5', 'tool7', 'tool8'],
  CALCULATOR_TOOLS: ['tool4', 'tool6']

};
