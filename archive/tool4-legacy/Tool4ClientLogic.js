/**
 * Tool4ClientLogic.js
 * Client-side JavaScript for Tool 4 calculator (Week 2)
 *
 * This gets embedded in the HTML template
 */

// ==================================================================
// BASE WEIGHTS DATA (embedded from Tool4BaseWeights.js)
// ==================================================================
const BASE_WEIGHTS = {
  stabilize: { M: 5, E: 60, F: 30, J: 5 },
  reclaim: { M: 10, E: 45, F: 35, J: 10 },
  debt: { M: 15, E: 35, F: 40, J: 10 },
  secure: { M: 25, E: 35, F: 30, J: 10 },
  enjoy: { M: 15, E: 25, F: 25, J: 35 },
  reduce_hours: { M: 20, E: 30, F: 35, J: 15 },
  kids_education: { M: 25, E: 25, F: 40, J: 10 },
  wealth: { M: 40, E: 25, F: 20, J: 15 },
  lifestyle: { M: 20, E: 20, F: 15, J: 45 },
  generational: { M: 50, E: 20, F: 20, J: 10 }
};

// ==================================================================
// PRIORITIES DATA (embedded from Tool4ProgressiveUnlock.js)
// ==================================================================
const PRIORITIES = [
  {
    id: 'stabilize',
    name: 'Stabilize to Survive',
    icon: '🚨',
    tier: 1,
    checkUnlock: () => true
  },
  {
    id: 'reclaim',
    name: 'Reclaim Financial Control',
    icon: '🎯',
    tier: 1,
    checkUnlock: () => true
  },
  {
    id: 'debt',
    name: 'Get Out of Debt',
    icon: '💳',
    tier: 1,
    checkUnlock: (data) => data.debt > 0
  },
  {
    id: 'secure',
    name: 'Feel Financially Secure',
    icon: '🛡️',
    tier: 2,
    checkUnlock: (data) => data.emergencyFund >= 6000 || data.surplus >= 500
  },
  {
    id: 'enjoy',
    name: 'Enjoy Life More',
    icon: '🎉',
    tier: 2,
    checkUnlock: (data) => data.surplus >= 200
  },
  {
    id: 'reduce_hours',
    name: 'Reduce Working Hours',
    icon: '⏰',
    tier: 2,
    checkUnlock: (data) => data.emergencyFund >= 6000 && data.surplus >= 400
  },
  {
    id: 'kids_education',
    name: 'Save for Kids\' Education',
    icon: '🎓',
    tier: 3,
    checkUnlock: (data) => data.emergencyFund >= 12000 && data.surplus >= 600
  },
  {
    id: 'wealth',
    name: 'Build Long-Term Wealth',
    icon: '📈',
    tier: 3,
    checkUnlock: (data) => data.emergencyFund >= 18000 && data.surplus >= 800
  },
  {
    id: 'lifestyle',
    name: 'Upgrade My Lifestyle',
    icon: '✨',
    tier: 3,
    checkUnlock: (data) => data.emergencyFund >= 12000 && data.surplus >= 1000
  },
  {
    id: 'generational',
    name: 'Create Generational Wealth',
    icon: '👨‍👩‍👧‍👦',
    tier: 4,
    checkUnlock: (data) => data.emergencyFund >= 36000 && data.surplus >= 2000
  }
];

// ==================================================================
// CATEGORY LOGIC
// ==================================================================
function suggestCategorySplit(essentials) {
  return {
    rent: Math.round(essentials * 0.48),
    groceries: Math.round(essentials * 0.16),
    dining: Math.round(essentials * 0.06),
    transport: Math.round(essentials * 0.12),
    utilities: Math.round(essentials * 0.06),
    insurance: Math.round(essentials * 0.08),
    subscriptions: Math.round(essentials * 0.02),
    other: Math.round(essentials * 0.02)
  };
}

function fillSuggestedCategories() {
  const essentials = financialData.essentials;
  const suggested = suggestCategorySplit(essentials);

  Object.entries(suggested).forEach(([key, value]) => {
    document.getElementById(`cat_${key}`).value = value;
  });

  updateCategoryTotal();
}

function skipCategories() {
  calculatePriorities();
}

function updateCategoryTotal() {
  const categories = ['rent', 'groceries', 'dining', 'transport', 'utilities', 'insurance', 'subscriptions', 'other'];
  let total = 0;

  categories.forEach(cat => {
    const val = parseFloat(document.getElementById(`cat_${cat}`).value) || 0;
    total += val;
  });

  document.getElementById('categoryTotal').textContent = `$${total.toLocaleString()}`;
  document.getElementById('essentialsDisplay').textContent = `$${financialData.essentials.toLocaleString()}`;

  // Validate
  const tolerance = Math.max(50, financialData.essentials * 0.02);
  const difference = Math.abs(total - financialData.essentials);

  const diffElement = document.getElementById('categoryDifference');
  const warningElement = document.getElementById('categoryWarning');

  if (difference <= tolerance) {
    diffElement.innerHTML = '<span style="color: #34d399;">✓ Match</span>';
    warningElement.style.display = 'none';
  } else {
    diffElement.innerHTML = `<span style="color: #fbbf24;">⚠ Diff: $${Math.round(difference)}</span>`;
    warningElement.style.display = 'block';
    warningElement.innerHTML = `
      <div style="padding: 12px; background: rgba(251, 191, 36, 0.1); border-left: 3px solid #fbbf24; border-radius: 4px;">
        <strong>⚠ Category total doesn't match:</strong><br>
        Categories: $${total.toLocaleString()} | Essentials: $${financialData.essentials.toLocaleString()} | Difference: $${Math.round(difference)}<br>
        <button class="btn btn-secondary" style="margin-top: 10px;" onclick="autoDistributeCategories()">Auto-Fix Difference</button>
      </div>
    `;
  }
}

function autoDistributeCategories() {
  const categories = ['rent', 'groceries', 'dining', 'transport', 'utilities', 'insurance', 'subscriptions', 'other'];
  let total = 0;
  const values = {};

  categories.forEach(cat => {
    const val = parseFloat(document.getElementById(`cat_${cat}`).value) || 0;
    values[cat] = val;
    total += val;
  });

  const difference = financialData.essentials - total;
  const nonZeroCategories = Object.entries(values).filter(([k, v]) => v > 0);
  const totalNonZero = nonZeroCategories.reduce((sum, [k, v]) => sum + v, 0);

  if (totalNonZero > 0) {
    nonZeroCategories.forEach(([key, value]) => {
      const proportion = value / totalNonZero;
      const newValue = Math.round(value + (difference * proportion));
      document.getElementById(`cat_${key}`).value = newValue;
    });
  }

  updateCategoryTotal();
}

// ==================================================================
// NAVIGATION FUNCTIONS
// ==================================================================
function showCategoryBreakdown() {
  const income = parseFloat(document.getElementById('income').value) || 0;
  const essentials = parseFloat(document.getElementById('essentials').value) || 0;
  const debt = parseFloat(document.getElementById('debt').value) || 0;
  const emergencyFund = parseFloat(document.getElementById('emergencyFund').value) || 0;

  if (income <= 0) {
    alert('Please enter your monthly income');
    return;
  }

  if (essentials < 0) {
    alert('Essentials cannot be negative');
    return;
  }

  // Save to financial data
  financialData.income = income;
  financialData.essentials = essentials;
  financialData.debt = debt;
  financialData.emergencyFund = emergencyFund;
  financialData.surplus = income - essentials;

  // Show category section
  document.getElementById('categorySection').style.display = 'block';
  document.getElementById('categorySection').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('essentialsDisplay').textContent = `$${essentials.toLocaleString()}`;
}

function calculatePriorities() {
  // Evaluate all priorities
  const evaluatedPriorities = PRIORITIES.map(priority => {
    const unlocked = priority.checkUnlock(financialData);

    let hint, lockReason;
    if (unlocked) {
      if (priority.id === 'debt') {
        hint = financialData.debt > 0 ? `Debt: $${financialData.debt.toLocaleString()}` : 'No debt';
      } else if (priority.id === 'secure' || priority.id === 'enjoy' || priority.tier >= 2) {
        hint = `Emergency fund: $${financialData.emergencyFund.toLocaleString()}, Surplus: $${financialData.surplus.toLocaleString()}`;
      } else {
        hint = priority.id === 'stabilize' ? 'Focus on immediate stability' : 'Trauma recovery focus';
      }
    } else {
      if (priority.id === 'debt') {
        lockReason = 'Need debt balance > $0';
      } else if (priority.id === 'secure') {
        lockReason = `Need: $6,000 emergency fund OR $500 surplus | You have: $${financialData.emergencyFund.toLocaleString()} fund, $${financialData.surplus.toLocaleString()} surplus`;
      } else {
        lockReason = `Requires higher emergency fund and surplus`;
      }
    }

    return { ...priority, unlocked, hint, lockReason };
  });

  // Recommend best priority
  const recommended = recommendPriority(evaluatedPriorities, financialData);

  // Render priority grid
  const prioritiesGrid = document.getElementById('prioritiesGrid');
  let html = '';

  evaluatedPriorities.forEach(priority => {
    const isRecommended = recommended && priority.id === recommended.id;
    const cssClass = priority.unlocked ? 'priority-card available' : 'priority-card locked';

    html += `
      <div class="${cssClass}" ${priority.unlocked ? `onclick="selectPriority('${priority.id}')"` : ''}>
        <div class="priority-icon">${priority.unlocked ? '✅' : '🔒'} ${priority.icon}</div>
        <div class="priority-title">
          ${priority.name}
          ${isRecommended ? '<div style="font-size: 0.75rem; color: #fbbf24; margin-top: 4px;">⭐ Recommended</div>' : ''}
        </div>
        <div class="${priority.unlocked ? 'priority-hint' : 'unlock-requirement'}">
          ${priority.unlocked ? priority.hint : priority.lockReason}
        </div>
      </div>
    `;
  });

  prioritiesGrid.innerHTML = html;
  document.getElementById('prioritiesSection').style.display = 'block';
  document.getElementById('prioritiesSection').scrollIntoView({ behavior: 'smooth' });
}

function recommendPriority(priorities, data) {
  const unlocked = priorities.filter(p => p.unlocked);
  if (unlocked.length === 0) return null;

  // Recommendation logic
  if (data.surplus < 0) return unlocked.find(p => p.id === 'stabilize');
  if (data.debt > data.income * 0.5) return unlocked.find(p => p.id === 'debt');
  if (data.emergencyFund < data.income * 3) return unlocked.find(p => p.id === 'secure');
  if (data.emergencyFund >= data.income * 6 && data.surplus >= 800) return unlocked.find(p => p.id === 'wealth');
  if (data.emergencyFund >= data.income * 12 && data.surplus >= 2000) return unlocked.find(p => p.id === 'generational');

  return unlocked.sort((a, b) => b.tier - a.tier)[0];
}

function selectPriority(priorityId) {
  console.log('Selected priority:', priorityId);

  // Get base weights for this priority
  const weights = BASE_WEIGHTS[priorityId];
  if (!weights) {
    alert('Error: Priority weights not found');
    return;
  }

  // Calculate dollar amounts
  const dollars = {
    M: Math.round((weights.M / 100) * financialData.income),
    E: Math.round((weights.E / 100) * financialData.income),
    F: Math.round((weights.F / 100) * financialData.income),
    J: Math.round((weights.J / 100) * financialData.income)
  };

  // Render allocation
  const allocationBars = document.getElementById('allocationBars');
  allocationBars.innerHTML = `
    <div class="allocation-bar multiply">
      <div class="bar-content">
        <span class="bar-label">💰 Multiply</span>
        <div style="text-align: right;">
          <div class="bar-percent">${weights.M}%</div>
          <div class="bar-dollars">$${dollars.M.toLocaleString()}/mo</div>
        </div>
      </div>
    </div>

    <div class="allocation-bar essentials">
      <div class="bar-content">
        <span class="bar-label">🏠 Essentials</span>
        <div style="text-align: right;">
          <div class="bar-percent">${weights.E}%</div>
          <div class="bar-dollars">$${dollars.E.toLocaleString()}/mo</div>
        </div>
      </div>
    </div>

    <div class="allocation-bar freedom">
      <div class="bar-content">
        <span class="bar-label">🦅 Freedom</span>
        <div style="text-align: right;">
          <div class="bar-percent">${weights.F}%</div>
          <div class="bar-dollars">$${dollars.F.toLocaleString()}/mo</div>
        </div>
      </div>
    </div>

    <div class="allocation-bar enjoyment">
      <div class="bar-content">
        <span class="bar-label">🎉 Enjoyment</span>
        <div style="text-align: right;">
          <div class="bar-percent">${weights.J}%</div>
          <div class="bar-dollars">$${dollars.J.toLocaleString()}/mo</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('allocationSection').style.display = 'block';
  document.getElementById('allocationSection').scrollIntoView({ behavior: 'smooth' });
}

function customizeAllocation() {
  alert('Custom allocation feature coming in Week 6!');
}

function saveScenario() {
  alert('Save scenario feature coming in Week 6!');
}
