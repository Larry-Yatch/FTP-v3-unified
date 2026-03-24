/**
 * Diagnostic Script: Tool 2 GPT Integration Issues
 *
 * Run this script to diagnose why GPT insights are showing up empty
 *
 * Usage:
 * 1. Open Apps Script Editor
 * 2. Select diagnoseTool2GPT function
 * 3. Click Run
 * 4. Check execution log (View → Logs)
 */

function diagnoseTool2GPT() {
  const testClientId = 'Test0'; // Replace with actual student ID showing the problem

  console.log('=== TOOL 2 GPT DIAGNOSTIC ===');
  console.log('');

  // Step 1: Check if API key exists
  console.log('Step 1: Checking OpenAI API Key...');
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in Script Properties!');
    console.log('Fix: Go to Project Settings → Script Properties → Add OPENAI_API_KEY');
    return;
  }
  console.log(`✓ API Key found (length: ${apiKey.length})`);
  console.log('');

  // Step 2: Get the student's response data
  console.log('Step 2: Fetching student response...');
  const response = DataService.getLatestResponse(testClientId, 'tool2');

  if (!response) {
    console.error(`❌ No response found for ${testClientId}`);
    return;
  }

  console.log(`✓ Response found: ${response.timestamp}`);
  console.log(`Status: ${response.status}`);
  console.log('');

  // Step 3: Check what's in the response
  console.log('Step 3: Analyzing response structure...');
  const data = response.data;

  if (data.gptInsights) {
    console.log('GPT Insights keys:', Object.keys(data.gptInsights));
    console.log('Sample insight:', JSON.stringify(data.gptInsights[Object.keys(data.gptInsights)[0]], null, 2));
  } else {
    console.log('❌ No gptInsights found in response');
  }

  if (data.overallInsight) {
    console.log('Overall Insight source:', data.overallInsight.source);
    console.log('Overview length:', data.overallInsight.overview?.length || 0);
    console.log('Top Patterns length:', data.overallInsight.topPatterns?.length || 0);
    console.log('Priority Actions length:', data.overallInsight.priorityActions?.length || 0);

    if (data.overallInsight.overview?.length === 0) {
      console.error('❌ EMPTY OVERVIEW - GPT call likely failed silently');
    }
  } else {
    console.log('❌ No overallInsight found in response');
  }
  console.log('');

  // Step 4: Test a simple GPT call
  console.log('Step 4: Testing direct GPT API call...');
  try {
    const testResponse = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {role: 'system', content: 'You are a helpful assistant.'},
          {role: 'user', content: 'Say "API is working" if you can read this.'}
        ],
        temperature: 0.2,
        max_tokens: 50
      }),
      muteHttpExceptions: true
    });

    const json = JSON.parse(testResponse.getContentText());

    if (json.error) {
      console.error('❌ OpenAI API Error:', json.error.message);
      if (json.error.code === 'invalid_api_key') {
        console.log('Fix: Your API key is invalid. Check Script Properties.');
      } else if (json.error.code === 'insufficient_quota') {
        console.log('Fix: Your OpenAI account is out of credits.');
      }
    } else {
      console.log('✓ GPT API Response:', json.choices[0].message.content);
    }
  } catch (error) {
    console.error('❌ GPT API call failed:', error.message);
  }
  console.log('');

  // Step 5: Check execution logs
  console.log('Step 5: Recommendations');
  console.log('');
  console.log('To see detailed logs from actual submissions:');
  console.log('1. View → Executions');
  console.log('2. Find a recent Tool 2 submission');
  console.log('3. Look for messages starting with [SYNTHESIS] or [TIER 1]');
  console.log('');
  console.log('Common issues:');
  console.log('- Empty responses: API key invalid or quota exceeded');
  console.log('- Missing gptInsights: Background calls failed during form');
  console.log('- Empty overallInsight: synthesizeOverall() failed, but fallback also failed');
  console.log('');
  console.log('=== END DIAGNOSTIC ===');
}

/**
 * Quick check for a specific student
 */
function checkStudentGPT(studentId) {
  const response = DataService.getLatestResponse(studentId, 'tool2');

  if (!response) {
    console.log(`No response found for ${studentId}`);
    return;
  }

  const data = response.data;

  console.log(`Student: ${studentId}`);
  console.log(`Response date: ${response.timestamp}`);
  console.log(`Has gptInsights: ${!!data.gptInsights}`);
  console.log(`GPT insights count: ${data.gptInsights ? Object.keys(data.gptInsights).length : 0}`);
  console.log(`Has overallInsight: ${!!data.overallInsight}`);
  console.log(`Overall insight source: ${data.overallInsight?.source || 'none'}`);
  console.log(`Overview length: ${data.overallInsight?.overview?.length || 0} chars`);

  if (data.overallInsight?.overview?.length === 0) {
    console.log('⚠️ WARNING: Empty overview detected - GPT synthesis failed');
  }
}
