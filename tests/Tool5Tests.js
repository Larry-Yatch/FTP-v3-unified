/**
 * Tool5Tests.js
 * Google Apps Script test functions for Tool 5
 *
 * Deploy via Clasp, then run manually from Apps Script editor
 * Each function returns a test report object
 */

/**
 * TEST 1: Form Rendering Test
 * Tests that all 7 pages render correctly
 */
function test_Tool5_FormRendering() {
  const testClient = 'TEST_CLIENT_TOOL5_001';
  const results = {
    test: 'Form Rendering',
    passed: [],
    failed: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Test Page 1 (Intro)
    try {
      const page1 = Tool5.render(testClient, 1);
      if (!page1 || typeof page1.getContent !== 'function') {
        throw new Error('Page 1 did not return HtmlOutput');
      }
      const html1 = page1.getContent();
      if (!html1.includes('Love & Connection')) {
        throw new Error('Page 1 missing tool name');
      }
      if (!html1.includes('Issues Showing Love')) {
        throw new Error('Page 1 missing Domain 1 description');
      }
      if (!html1.includes('Issues Receiving Love')) {
        throw new Error('Page 1 missing Domain 2 description');
      }
      results.passed.push('Page 1 (Intro) renders correctly');
    } catch (error) {
      results.failed.push(`Page 1 failed: ${error.message}`);
    }

    // Test Pages 2-7 (Subdomains)
    for (let page = 2; page <= 7; page++) {
      try {
        const pageHtml = Tool5.render(testClient, page);
        if (!pageHtml || typeof pageHtml.getContent !== 'function') {
          throw new Error(`Page ${page} did not return HtmlOutput`);
        }
        const html = pageHtml.getContent();

        // Check for scale questions
        if (!html.includes('scale-container')) {
          throw new Error(`Page ${page} missing scale questions`);
        }

        // Check for open response
        if (!html.includes('open-response-textarea')) {
          throw new Error(`Page ${page} missing open response field`);
        }

        // Check for progress indicator
        if (!html.includes(`Page ${page} of 7`)) {
          throw new Error(`Page ${page} missing progress indicator`);
        }

        results.passed.push(`Page ${page} renders correctly`);
      } catch (error) {
        results.failed.push(`Page ${page} failed: ${error.message}`);
      }
    }

    // Test invalid page numbers
    try {
      Tool5.render(testClient, 0);
      results.failed.push('Should reject page 0');
    } catch (error) {
      if (error.message.includes('Invalid page')) {
        results.passed.push('Correctly rejects page 0');
      } else {
        results.failed.push(`Wrong error for page 0: ${error.message}`);
      }
    }

    try {
      Tool5.render(testClient, 8);
      results.failed.push('Should reject page 8');
    } catch (error) {
      if (error.message.includes('Invalid page')) {
        results.passed.push('Correctly rejects page 8');
      } else {
        results.failed.push(`Wrong error for page 8: ${error.message}`);
      }
    }

  } catch (error) {
    results.failed.push(`Test framework error: ${error.message}`);
  }

  results.summary = `${results.passed.length} passed, ${results.failed.length} failed`;
  Logger.log('=== FORM RENDERING TEST ===');
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * TEST 2: Scoring Calculation Test
 * Tests the full scoring hierarchy with mock data
 */
function test_Tool5_ScoringCalculations() {
  const results = {
    test: 'Scoring Calculations',
    passed: [],
    failed: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Create mock responses (all -2 for predictable testing)
    const mockResponses = {};
    Tool5.config.subdomains.forEach(subdomain => {
      ['belief', 'behavior', 'feeling', 'consequence'].forEach(aspect => {
        mockResponses[`${subdomain.key}_${aspect}`] = '-2';
      });
      mockResponses[`${subdomain.key}_open_response`] = 'Test response for testing purposes';
    });

    // Calculate scores
    const scoringResult = GroundingScoring.calculateScores(
      mockResponses,
      Tool5.config.subdomains
    );

    // Test 1: Structure completeness
    try {
      if (!scoringResult.aspectScores) throw new Error('Missing aspectScores');
      if (!scoringResult.subdomainQuotients) throw new Error('Missing subdomainQuotients');
      if (!scoringResult.domainQuotients) throw new Error('Missing domainQuotients');
      if (!scoringResult.overallQuotient) throw new Error('Missing overallQuotient');
      if (!scoringResult.domainGaps) throw new Error('Missing domainGaps');
      results.passed.push('Score structure is complete');
    } catch (error) {
      results.failed.push(`Structure test: ${error.message}`);
    }

    // Test 2: Normalization accuracy
    try {
      const expected = ((3 - (-2)) / 6) * 100; // Should be 83.33
      const actual = GroundingScoring.normalizeScore(-2);
      if (Math.abs(actual - expected) > 0.01) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
      results.passed.push('Score normalization is accurate');
    } catch (error) {
      results.failed.push(`Normalization test: ${error.message}`);
    }

    // Test 3: Subdomain quotients
    try {
      const expected = ((3 - (-2)) / 6) * 100;
      Object.entries(scoringResult.subdomainQuotients).forEach(([key, score]) => {
        if (Math.abs(score - expected) > 0.01) {
          throw new Error(`${key}: Expected ${expected}, got ${score}`);
        }
      });
      results.passed.push('All 6 subdomain quotients calculated correctly');
    } catch (error) {
      results.failed.push(`Subdomain quotients test: ${error.message}`);
    }

    // Test 4: Domain quotients
    try {
      const expected = ((3 - (-2)) / 6) * 100;
      if (Math.abs(scoringResult.domainQuotients.domain1 - expected) > 0.01) {
        throw new Error(`Domain 1: Expected ${expected}, got ${scoringResult.domainQuotients.domain1}`);
      }
      if (Math.abs(scoringResult.domainQuotients.domain2 - expected) > 0.01) {
        throw new Error(`Domain 2: Expected ${expected}, got ${scoringResult.domainQuotients.domain2}`);
      }
      results.passed.push('Both domain quotients calculated correctly');
    } catch (error) {
      results.failed.push(`Domain quotients test: ${error.message}`);
    }

    // Test 5: Overall quotient
    try {
      const expected = ((3 - (-2)) / 6) * 100;
      if (Math.abs(scoringResult.overallQuotient - expected) > 0.01) {
        throw new Error(`Expected ${expected}, got ${scoringResult.overallQuotient}`);
      }
      results.passed.push('Overall quotient calculated correctly');
    } catch (error) {
      results.failed.push(`Overall quotient test: ${error.message}`);
    }

    // Test 6: Gap analysis
    try {
      if (!scoringResult.domainGaps.domain1.classification) {
        throw new Error('Domain 1 gap classification missing');
      }
      if (!scoringResult.domainGaps.domain2.classification) {
        throw new Error('Domain 2 gap classification missing');
      }
      // All scores equal, so should be DIFFUSE
      if (scoringResult.domainGaps.domain1.classification !== 'DIFFUSE') {
        throw new Error(`Expected DIFFUSE, got ${scoringResult.domainGaps.domain1.classification}`);
      }
      results.passed.push('Gap analysis classification works correctly');
    } catch (error) {
      results.failed.push(`Gap analysis test: ${error.message}`);
    }

    // Test 7: Invalid score handling
    try {
      const badResponses = { ...mockResponses };
      badResponses['subdomain_1_1_belief'] = '0'; // Zero not allowed

      try {
        GroundingScoring.calculateScores(badResponses, Tool5.config.subdomains);
        results.failed.push('Should reject zero values');
      } catch (error) {
        if (error.message.includes('Invalid score')) {
          results.passed.push('Correctly rejects invalid scores (zero)');
        } else {
          results.failed.push(`Wrong error for zero: ${error.message}`);
        }
      }
    } catch (error) {
      results.failed.push(`Invalid score test: ${error.message}`);
    }

  } catch (error) {
    results.failed.push(`Test framework error: ${error.message}`);
  }

  results.summary = `${results.passed.length} passed, ${results.failed.length} failed`;
  Logger.log('=== SCORING CALCULATIONS TEST ===');
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * TEST 3: Fallback System Test
 * Tests that fallbacks work for all subdomains
 */
function test_Tool5_FallbackSystem() {
  const results = {
    test: 'Fallback System',
    passed: [],
    failed: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Test each subdomain's fallback
    Tool5.config.subdomains.forEach(subdomain => {
      try {
        // Test critical level (average -2.5)
        const criticalScores = {
          belief: -3,
          behavior: -2,
          feeling: -3,
          consequence: -2
        };
        const criticalFallback = GroundingFallbacks.getSubdomainFallback(
          'tool5',
          subdomain.key,
          criticalScores,
          {}
        );

        if (!criticalFallback.pattern || !criticalFallback.insight ||
            !criticalFallback.action || !criticalFallback.rootBelief) {
          throw new Error('Critical fallback incomplete');
        }

        // Test healthy level (average +2)
        const healthyScores = {
          belief: 2,
          behavior: 2,
          feeling: 2,
          consequence: 2
        };
        const healthyFallback = GroundingFallbacks.getSubdomainFallback(
          'tool5',
          subdomain.key,
          healthyScores,
          {}
        );

        if (!healthyFallback.pattern) {
          throw new Error('Healthy fallback incomplete');
        }

        results.passed.push(`${subdomain.key} fallbacks work`);
      } catch (error) {
        results.failed.push(`${subdomain.key}: ${error.message}`);
      }
    });

    // Test domain fallbacks
    try {
      const domain1Fallback = GroundingFallbacks.getDomainFallback(
        'tool5',
        { key: 'domain1', name: 'Issues Showing Love', description: 'Test' },
        {},
        80
      );
      if (!domain1Fallback.summary || !domain1Fallback.keyThemes || !domain1Fallback.priorityFocus) {
        throw new Error('Domain 1 fallback incomplete');
      }
      results.passed.push('Domain 1 fallback works');
    } catch (error) {
      results.failed.push(`Domain 1 fallback: ${error.message}`);
    }

    try {
      const domain2Fallback = GroundingFallbacks.getDomainFallback(
        'tool5',
        { key: 'domain2', name: 'Issues Receiving Love', description: 'Test' },
        {},
        70
      );
      if (!domain2Fallback.summary) {
        throw new Error('Domain 2 fallback incomplete');
      }
      results.passed.push('Domain 2 fallback works');
    } catch (error) {
      results.failed.push(`Domain 2 fallback: ${error.message}`);
    }

    // Test overall fallback
    try {
      const overallFallback = GroundingFallbacks.getOverallFallback(
        'tool5',
        Tool5.config,
        { overallQuotient: 75, domainQuotients: { domain1: 80, domain2: 70 } }
      );
      if (!overallFallback.overview || !overallFallback.integration ||
          !overallFallback.coreWork || !overallFallback.nextSteps) {
        throw new Error('Overall fallback incomplete');
      }
      results.passed.push('Overall fallback works');
    } catch (error) {
      results.failed.push(`Overall fallback: ${error.message}`);
    }

  } catch (error) {
    results.failed.push(`Test framework error: ${error.message}`);
  }

  results.summary = `${results.passed.length} passed, ${results.failed.length} failed`;
  Logger.log('=== FALLBACK SYSTEM TEST ===');
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * TEST 4: Data Flow Integration Test
 * Tests the complete flow from form submission to report generation
 * USES MOCK GPT - Does not make real API calls
 */
function test_Tool5_DataFlowIntegration() {
  const testClient = 'TEST_CLIENT_TOOL5_DATA_FLOW';
  const results = {
    test: 'Data Flow Integration',
    passed: [],
    failed: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Step 1: Create complete form submission data
    const formData = {
      client: testClient,
      page: '7',
      subdomain_index: '5',
      subdomain_key: 'subdomain_2_3'
    };

    // Add all responses
    Tool5.config.subdomains.forEach(subdomain => {
      ['belief', 'behavior', 'feeling', 'consequence'].forEach(aspect => {
        formData[`${subdomain.key}_${aspect}`] = '-2';
      });
      formData[`${subdomain.key}_open_response`] = `Test response for ${subdomain.label}. This is a longer response to ensure we have enough content for GPT analysis. I'm describing my experience with this pattern and how it shows up in my financial relationships with others.`;
    });

    try {
      results.passed.push('Step 1: Form data prepared');
    } catch (error) {
      results.failed.push(`Step 1: ${error.message}`);
    }

    // Step 2: Extract responses
    try {
      const responses = Tool5.extractResponses(formData);
      if (Object.keys(responses).length < 30) { // 24 scale + 6 open = 30
        throw new Error(`Only ${Object.keys(responses).length} responses extracted`);
      }
      results.passed.push('Step 2: Responses extracted correctly');
    } catch (error) {
      results.failed.push(`Step 2: ${error.message}`);
    }

    // Step 3: Calculate scoring
    try {
      const responses = Tool5.extractResponses(formData);
      const scoringResult = GroundingScoring.calculateScores(
        responses,
        Tool5.config.subdomains
      );
      if (!scoringResult.overallQuotient) {
        throw new Error('Scoring incomplete');
      }
      results.passed.push('Step 3: Scoring calculated successfully');
    } catch (error) {
      results.failed.push(`Step 3: ${error.message}`);
    }

    // Step 4: Mock GPT insights (skip actual GPT calls in testing)
    try {
      const mockInsights = {
        subdomains: {}
      };
      Tool5.config.subdomains.forEach(subdomain => {
        mockInsights.subdomains[subdomain.key] = {
          pattern: `Test pattern for ${subdomain.label}`,
          insight: `Test insight for ${subdomain.label}`,
          action: `Test action for ${subdomain.label}`,
          rootBelief: `Test root belief for ${subdomain.label}`,
          source: 'mock_for_testing'
        };
      });
      results.passed.push('Step 4: GPT insights mocked (skipped real API calls)');
    } catch (error) {
      results.failed.push(`Step 4: ${error.message}`);
    }

    // Step 5: Report generation
    try {
      const responses = Tool5.extractResponses(formData);
      const scoringResult = GroundingScoring.calculateScores(
        responses,
        Tool5.config.subdomains
      );

      const mockGPTInsights = {
        subdomains: {},
        domain1: {
          summary: 'Test domain 1 summary',
          keyThemes: ['Theme 1', 'Theme 2'],
          priorityFocus: 'Test priority'
        },
        domain2: {
          summary: 'Test domain 2 summary',
          keyThemes: ['Theme 3', 'Theme 4'],
          priorityFocus: 'Test priority 2'
        },
        overall: {
          overview: 'Test overview',
          integration: 'Test integration',
          coreWork: 'Test core work',
          nextSteps: ['Step 1', 'Step 2', 'Step 3']
        }
      };

      Tool5.config.subdomains.forEach(subdomain => {
        mockGPTInsights.subdomains[subdomain.key] = {
          pattern: `Pattern for ${subdomain.label}`,
          insight: `Insight for ${subdomain.label}`,
          action: `Action for ${subdomain.label}`,
          rootBelief: `Root belief for ${subdomain.label}`,
          source: 'mock'
        };
      });

      const reportHtml = Tool5.generateReport(testClient, scoringResult, mockGPTInsights);

      if (!reportHtml || typeof reportHtml.getContent !== 'function') {
        throw new Error('Report did not return HtmlOutput');
      }

      const html = reportHtml.getContent();
      if (!html.includes('Love & Connection')) {
        throw new Error('Report missing tool name');
      }
      if (!html.includes(scoringResult.overallQuotient.toString())) {
        throw new Error('Report missing overall score');
      }

      results.passed.push('Step 5: Report generated successfully');
    } catch (error) {
      results.failed.push(`Step 5: ${error.message}`);
    }

    // Step 6: Config integration
    try {
      if (CONFIG.TOOLS.TOOL5.ID !== 'tool5') {
        throw new Error('Config tool ID incorrect');
      }
      if (CONFIG.TOOLS.TOOL5.PAGES !== 7) {
        throw new Error('Config pages incorrect');
      }
      if (CONFIG.TOOLS.TOOL5.QUESTIONS !== 30) {
        throw new Error('Config questions incorrect');
      }
      results.passed.push('Step 6: Config integration verified');
    } catch (error) {
      results.failed.push(`Step 6: ${error.message}`);
    }

  } catch (error) {
    results.failed.push(`Test framework error: ${error.message}`);
  }

  results.summary = `${results.passed.length} passed, ${results.failed.length} failed`;
  Logger.log('=== DATA FLOW INTEGRATION TEST ===');
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * TEST 5: Content Accuracy Test
 * Verifies all subdomain content matches the content document
 */
function test_Tool5_ContentAccuracy() {
  const results = {
    test: 'Content Accuracy',
    passed: [],
    failed: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Test subdomain count
    try {
      if (Tool5.config.subdomains.length !== 6) {
        throw new Error(`Expected 6 subdomains, found ${Tool5.config.subdomains.length}`);
      }
      results.passed.push('Correct number of subdomains (6)');
    } catch (error) {
      results.failed.push(`Subdomain count: ${error.message}`);
    }

    // Test each subdomain has 5 questions
    Tool5.config.subdomains.forEach((subdomain, idx) => {
      try {
        if (!subdomain.questions || subdomain.questions.length !== 5) {
          throw new Error(`Expected 5 questions, found ${subdomain.questions ? subdomain.questions.length : 0}`);
        }
        results.passed.push(`${subdomain.key}: Has 5 questions`);
      } catch (error) {
        results.failed.push(`${subdomain.key}: ${error.message}`);
      }
    });

    // Test each subdomain has required fields
    Tool5.config.subdomains.forEach(subdomain => {
      try {
        if (!subdomain.key) throw new Error('Missing key');
        if (!subdomain.label) throw new Error('Missing label');
        if (!subdomain.description) throw new Error('Missing description');
        if (!subdomain.beliefBehaviorConnection) throw new Error('Missing beliefBehaviorConnection');
        results.passed.push(`${subdomain.key}: Has all required fields`);
      } catch (error) {
        results.failed.push(`${subdomain.key}: ${error.message}`);
      }
    });

    // Test domain names
    try {
      if (Tool5.config.domain1Name !== 'Issues Showing Love') {
        throw new Error('Domain 1 name incorrect');
      }
      if (Tool5.config.domain2Name !== 'Issues Receiving Love') {
        throw new Error('Domain 2 name incorrect');
      }
      results.passed.push('Domain names match content document');
    } catch (error) {
      results.failed.push(`Domain names: ${error.message}`);
    }

    // Test tool metadata
    try {
      if (Tool5.config.id !== 'tool5') throw new Error('Tool ID incorrect');
      if (!Tool5.config.name.includes('Love & Connection')) throw new Error('Tool name incorrect');
      if (!Tool5.config.scoreName) throw new Error('Score name missing');
      results.passed.push('Tool metadata correct');
    } catch (error) {
      results.failed.push(`Tool metadata: ${error.message}`);
    }

  } catch (error) {
    results.failed.push(`Test framework error: ${error.message}`);
  }

  results.summary = `${results.passed.length} passed, ${results.failed.length} failed`;
  Logger.log('=== CONTENT ACCURACY TEST ===');
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

/**
 * RUN ALL TESTS
 * Master function to run all tests and generate summary report
 */
function runAllTool5Tests() {
  Logger.log('\n\n🧪 ========================================');
  Logger.log('    TOOL 5 COMPREHENSIVE TEST SUITE');
  Logger.log('========================================\n');

  const allResults = [];

  // Run each test
  allResults.push(test_Tool5_FormRendering());
  allResults.push(test_Tool5_ScoringCalculations());
  allResults.push(test_Tool5_FallbackSystem());
  allResults.push(test_Tool5_DataFlowIntegration());
  allResults.push(test_Tool5_ContentAccuracy());

  // Generate summary
  const summary = {
    totalTests: allResults.length,
    allPassed: allResults.filter(r => r.failed.length === 0).length,
    allFailed: allResults.filter(r => r.failed.length > 0).length,
    totalAssertions: allResults.reduce((sum, r) => sum + r.passed.length + r.failed.length, 0),
    passedAssertions: allResults.reduce((sum, r) => sum + r.passed.length, 0),
    failedAssertions: allResults.reduce((sum, r) => sum + r.failed.length, 0),
    results: allResults
  };

  Logger.log('\n========================================');
  Logger.log('📊 FINAL SUMMARY');
  Logger.log('========================================');
  Logger.log(`Tests Run: ${summary.totalTests}`);
  Logger.log(`Tests Passed: ${summary.allPassed}`);
  Logger.log(`Tests Failed: ${summary.allFailed}`);
  Logger.log(`Total Assertions: ${summary.totalAssertions}`);
  Logger.log(`✅ Passed: ${summary.passedAssertions}`);
  Logger.log(`❌ Failed: ${summary.failedAssertions}`);
  Logger.log(`Success Rate: ${((summary.passedAssertions / summary.totalAssertions) * 100).toFixed(1)}%`);
  Logger.log('========================================\n\n');

  return summary;
}
