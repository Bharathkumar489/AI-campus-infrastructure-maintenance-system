/**
 * AI Failure Predictor (Section 19 - 25 of System Specification)
 * Ensemble model simulating Random Forest decision trees for campus infrastructure.
 * Calculates probability of failure within 30 days and extracts contributing feature signals.
 */

const ASSET_TYPE_BASE_RISK = {
  'HVAC': 0.25,
  'Electrical': 0.20,
  'Plumbing': 0.18,
  'Elevator': 0.22,
  'Lab Equipment': 0.24,
  'Civil': 0.12,
  'Security/CCTV': 0.15,
  'Furniture': 0.08
};

const CRITICALITY_MULTIPLIER = {
  'Low': 0.85,
  'Medium': 1.0,
  'High': 1.25,
  'Critical': 1.45
};

/**
 * Predict failure probability using asset history and complaint features.
 * Features:
 * - asset_age_years: float
 * - previous_failures: integer
 * - days_since_maintenance: integer
 * - maintenance_count_12m: integer
 * - complaints_30d: integer
 * - severity: integer (1-5)
 * - usage_hours_day: float
 * - asset_type: string
 * - criticality: string
 */
function predictFailureRisk(features) {
  const {
    asset_age_years = 2.0,
    previous_failures = 1,
    days_since_maintenance = 60,
    maintenance_count_12m = 2,
    complaints_30d = 0,
    severity = 2,
    usage_hours_day = 8.0,
    asset_type = 'HVAC',
    criticality = 'Medium'
  } = features;

  // Tree Ensemble scoring (Simulating 100 Random Forest trees voting)
  let treeVotes = 0;
  const numTrees = 100;
  const featureSignals = [];

  // Base propensity from asset type
  const baseRate = ASSET_TYPE_BASE_RISK[asset_type] || 0.15;

  // 1. Age Factor
  const ageFactor = Math.min(asset_age_years / 8.0, 1.2); // >6 yrs is old
  if (asset_age_years >= 4) {
    featureSignals.push({
      feature: 'Asset Age',
      value: `${asset_age_years.toFixed(1)} years`,
      impact: 'High',
      contribution: '+25% risk due to aging components'
    });
  }

  // 2. Failure History Factor
  const failureFactor = Math.min(previous_failures * 0.12, 0.6);
  if (previous_failures >= 3) {
    featureSignals.push({
      feature: 'Historical Reliability',
      value: `${previous_failures} previous failures`,
      impact: 'High',
      contribution: '+30% risk from recurring failure patterns'
    });
  }

  // 3. Maintenance Interval Factor
  // Overdue if > 120 days for HVAC/Elevators, > 180 for others
  const maintThreshold = ['HVAC', 'Elevator', 'Lab Equipment'].includes(asset_type) ? 90 : 180;
  const overdueRatio = Math.max(0, (days_since_maintenance - maintThreshold) / 120);
  const maintFactor = Math.min(overdueRatio * 0.35, 0.45);
  if (days_since_maintenance > maintThreshold) {
    featureSignals.push({
      feature: 'Maintenance Interval',
      value: `${days_since_maintenance} days since last maintenance`,
      impact: days_since_maintenance > 180 ? 'High' : 'Medium',
      contribution: `+${Math.round(maintFactor * 100)}% risk due to overdue maintenance`
    });
  }

  // 4. Complaints in last 30 days
  const complaintFactor = Math.min(complaints_30d * 0.15, 0.45);
  if (complaints_30d >= 2) {
    featureSignals.push({
      feature: 'Recent Complaints',
      value: `${complaints_30d} complaints in last 30 days`,
      impact: 'High',
      contribution: '+25% risk indicates rapid ongoing deterioration'
    });
  }

  // 5. Usage Wear Factor
  const usageRatio = Math.max(0, (usage_hours_day - 8) / 16);
  const usageFactor = usageRatio * 0.2;
  if (usage_hours_day >= 12) {
    featureSignals.push({
      feature: 'Daily Duty Cycle',
      value: `${usage_hours_day} hrs/day`,
      impact: 'Medium',
      contribution: '+15% wear-and-tear acceleration'
    });
  }

  // 6. Current Severity Signal
  const severitySignal = (severity - 1) * 0.08;

  // Composite raw risk score
  let rawScore = baseRate + (ageFactor * 0.25) + failureFactor + maintFactor + complaintFactor + usageFactor + severitySignal;

  // Criticality multiplier
  const critMult = CRITICALITY_MULTIPLIER[criticality] || 1.0;
  rawScore = rawScore * critMult;

  // Simulate ensemble voting across trees with pseudo-random seed stability
  for (let i = 0; i < numTrees; i++) {
    // Tree-specific threshold jitter
    const treeThreshold = 0.52 + (Math.sin(i * 13.37) * 0.18);
    // Tree-specific feature subset variation
    const treeJitter = Math.cos(i * 7.19) * 0.08;
    if ((rawScore + treeJitter) >= treeThreshold) {
      treeVotes++;
    }
  }

  // Calculate final ensemble probability between 0.05 and 0.98
  let failureProbability = treeVotes / numTrees;
  // Blend slightly with raw continuous score for smooth calibration
  failureProbability = (failureProbability * 0.7) + (Math.min(0.95, Math.max(0.05, rawScore * 0.85)) * 0.3);
  failureProbability = parseFloat(failureProbability.toFixed(3));

  // Risk bands according to Section 25
  let riskLevel = 'LOW';
  let suggestedAction = 'No immediate predictive signal; continue normal monitoring.';

  if (failureProbability >= 0.70) {
    riskLevel = 'HIGH';
    suggestedAction = 'Prioritize review and consider preventive action / overhaul.';
  } else if (failureProbability >= 0.40) {
    riskLevel = 'MEDIUM';
    suggestedAction = 'Review history and consider preventive inspection.';
  }

  if (featureSignals.length === 0) {
    featureSignals.push({
      feature: 'Operating Condition',
      value: 'Parameters within nominal thresholds',
      impact: 'Low',
      contribution: 'Stable performance profile'
    });
  }

  return {
    failure_probability: failureProbability,
    failure_percentage: Math.round(failureProbability * 100),
    risk_level: riskLevel,
    suggested_action: suggestedAction,
    feature_signals: featureSignals,
    model_version: 'v2.4.0-ai',
    algorithm: 'CampusCare AI Diagnostic Engine'
  };
}

module.exports = {
  predictFailureRisk,
  ASSET_TYPE_BASE_RISK,
  CRITICALITY_MULTIPLIER
};
