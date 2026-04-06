/**
 * Tool1Constants.js
 * Data-driven thresholds for Tool 1 score classification
 *
 * Thresholds derived from cohort dataset (n=70, Tool 1 completed, Is_Latest=TRUE).
 * Each pattern has a LOW and HIGH threshold:
 *   - Score > high  = HIGH (pattern strongly active)
 *   - Score < low   = LOW  (pattern largely absent — healthy signal)
 *   - Otherwise     = MODERATE (present but not dominant)
 *
 * Receiving note: This pattern is structurally skewed negative in the cohort
 * (mean -3.3, only 39% score positive). A score > 3 is genuinely top-quartile.
 * This does NOT mean Receiving is less important — it means the cohort
 * (primarily entrepreneurs and business owners) skews toward Showing over Receiving.
 */

const TOOL1_PATTERN_THRESHOLDS = {
  FSV:       { low: -5,  high: 11 },
  ExVal:     { low: -7,  high: 12 },
  Showing:   { low: -4,  high: 16 },
  Receiving: { low: -10, high: 3  },
  Control:   { low: -5,  high: 12 },
  Fear:      { low: -10, high: 14 }
};
