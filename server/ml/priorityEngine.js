/**
 * Priority Engine (Section 26 of System Specification Report)
 *
 * Implements the operational priority formula:
 * Priority Score = 40% Severity + 30% Failure Risk + 20% Complaint Frequency + 10% Location Criticality
 *
 * All components normalized to a 0–100 scale:
 * - Severity: 1->20, 2->40, 3->60, 4->80, 5->100
 * - Failure Risk: probability * 100
 * - Complaint Frequency: normalized based on past 30 days complaints
 * - Location Criticality: Low->25, Medium->50, High->80, Critical->100
 */

const LOCATION_CRITICALITY_SCORES = {
  'Low': 25,
  'Medium': 50,
  'High': 80,
  'Critical': 100
};

function calculatePriority(params) {
  const {
    severity = 3,                 // 1-5 scale
    failure_probability = 0.5,    // 0.0 - 1.0
    complaints_30d = 0,           // Count
    location_criticality = 'Medium'
  } = params;

  // 1. Normalized Severity (0-100)
  const normSeverity = Math.min(100, Math.max(0, severity * 20));

  // 2. Normalized Failure Risk (0-100)
  const normFailureRisk = Math.min(100, Math.max(0, failure_probability * 100));

  // 3. Normalized Complaint Frequency (0-100)
  // 0 complaints = 10; 1 = 40; 2 = 70; 3+ = 95
  let normComplaintFreq = 10;
  if (complaints_30d === 1) normComplaintFreq = 40;
  else if (complaints_30d === 2) normComplaintFreq = 70;
  else if (complaints_30d >= 3) normComplaintFreq = Math.min(100, 70 + ((complaints_30d - 2) * 10));

  // 4. Normalized Location Criticality (0-100)
  const normLocationCrit = LOCATION_CRITICALITY_SCORES[location_criticality] || 50;

  // Exact formula from Section 26:
  // Priority Score = 0.4*Severity + 0.3*FailureRisk + 0.2*ComplaintFreq + 0.1*LocationCrit
  const priorityScore = (0.4 * normSeverity) +
                        (0.3 * normFailureRisk) +
                        (0.2 * normComplaintFreq) +
                        (0.1 * normLocationCrit);

  const roundedScore = parseFloat(priorityScore.toFixed(1));

  // Operational priority classification
  let priorityLevel = 'LOW';
  let targetResponseHours = 48;

  if (roundedScore >= 75) {
    priorityLevel = 'CRITICAL';
    targetResponseHours = 2;
  } else if (roundedScore >= 55) {
    priorityLevel = 'HIGH';
    targetResponseHours = 8;
  } else if (roundedScore >= 35) {
    priorityLevel = 'MEDIUM';
    targetResponseHours = 24;
  }

  return {
    priority_score: roundedScore,
    priority_level: priorityLevel,
    target_response_hours: targetResponseHours,
    components: {
      severity: { raw: severity, normalized: normSeverity, weight: '40%', weighted_value: parseFloat((0.4 * normSeverity).toFixed(1)) },
      failure_risk: { raw: `${Math.round(normFailureRisk)}%`, normalized: normFailureRisk, weight: '30%', weighted_value: parseFloat((0.3 * normFailureRisk).toFixed(1)) },
      complaint_frequency: { raw: complaints_30d, normalized: normComplaintFreq, weight: '20%', weighted_value: parseFloat((0.2 * normComplaintFreq).toFixed(1)) },
      location_criticality: { raw: location_criticality, normalized: normLocationCrit, weight: '10%', weighted_value: parseFloat((0.1 * normLocationCrit).toFixed(1)) }
    }
  };
}

module.exports = {
  calculatePriority,
  LOCATION_CRITICALITY_SCORES
};
