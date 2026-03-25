'use strict';

/**
 * Scoring.js — Tool 1 scoring logic (extracted from main FTP-v3 Tool1.js)
 *
 * Formula: score = sum(3 statement responses) + 2 × normalizeThought(rank)
 * Range: -25 to +25 per pattern
 * Tie-breaker: highest feeling ranking among tied patterns
 */

const Scoring = {

  /**
   * Normalize thought/feeling ranking (1-10) to score contribution (-5 to +5)
   */
  normalizeRank(rank) {
    const r = parseInt(rank);
    if (r >= 1 && r <= 5) return r - 6;  // 1→-5, 2→-4, 3→-3, 4→-2, 5→-1
    if (r >= 6 && r <= 10) return r - 5; // 6→+1, 7→+2, 8→+3, 9→+4, 10→+5
    return 0;
  },

  /**
   * Calculate all six pattern scores from submitted form data
   * @param {Object} data — flat object with q3-q22, thought_*, feeling_* keys
   * @returns {{ FSV, ExVal, Showing, Receiving, Control, Fear }}
   */
  calculateScores(data) {
    const n = this.normalizeRank.bind(this);

    return {
      FSV:       (parseInt(data.q3  || 0) + parseInt(data.q4  || 0) + parseInt(data.q5  || 0)) + 2 * n(data.thought_fsv),
      ExVal:     (parseInt(data.q6  || 0) + parseInt(data.q7  || 0) + parseInt(data.q8  || 0)) + 2 * n(data.thought_exval),
      Showing:   (parseInt(data.q10 || 0) + parseInt(data.q11 || 0) + parseInt(data.q12 || 0)) + 2 * n(data.thought_showing),
      Receiving: (parseInt(data.q13 || 0) + parseInt(data.q14 || 0) + parseInt(data.q15 || 0)) + 2 * n(data.thought_receiving),
      Control:   (parseInt(data.q17 || 0) + parseInt(data.q18 || 0) + parseInt(data.q19 || 0)) + 2 * n(data.thought_control),
      Fear:      (parseInt(data.q20 || 0) + parseInt(data.q21 || 0) + parseInt(data.q22 || 0)) + 2 * n(data.thought_fear),
    };
  },

  /**
   * Determine the dominant pattern key; ties broken by highest feeling ranking
   * @returns {string} — one of: FSV | ExVal | Showing | Receiving | Control | Fear
   */
  determineWinner(scores, data) {
    const feelingField = {
      FSV:       'feeling_fsv',
      ExVal:     'feeling_exval',
      Showing:   'feeling_showing',
      Receiving: 'feeling_receiving',
      Control:   'feeling_control',
      Fear:      'feeling_fear',
    };

    const maxScore = Math.max(...Object.values(scores));
    const tied = Object.keys(scores).filter(k => scores[k] === maxScore);

    if (tied.length === 1) return tied[0];

    // Tie-break by feeling ranking (higher = more dominant)
    return tied.reduce((best, cat) => {
      const bestFeeling = parseInt(data[feelingField[best]] || 0);
      const catFeeling  = parseInt(data[feelingField[cat]]  || 0);
      return catFeeling > bestFeeling ? cat : best;
    }, tied[0]);
  },

};
