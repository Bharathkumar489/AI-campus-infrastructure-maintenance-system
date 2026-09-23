/**
 * AI Complaint Analyzer: Equipment Detection & Criticality Assessment Engine
 * Fulfills core system goal:
 * 1. Automatically finds and identifies campus equipment and matches it to the assets database.
 * 2. Analyzes criticality & severity from description and/or image using NLP and computer vision signals.
 */

const { classifyProblem, CATEGORY_DEFINITIONS } = require('./textClassifier');
const { analyzeImage } = require('./imageAnalyzer');
const { predictFailureRisk } = require('./failurePredictor');
const { calculatePriority } = require('./priorityEngine');

// Hazard keywords mapping to Criticality Levels
const CRITICALITY_RULES = [
  {
    level: 'CRITICAL',
    severity: 5,
    keywords: [
      'spark', 'sparking', 'sparks', 'fire', 'smoke', 'burning', 'burn smell', 'burning smell',
      'gas leak', 'gas odor', 'electric shock', 'high voltage', 'live wire', 'short circuit',
      'elevator stuck with people', 'person trapped', 'trapped inside lift', 'total blackout',
      'explosion', 'hazardous', 'flooding lab', 'server room down', 'data center cooling failure'
    ],
    reasoningTemplate: (matches) => 
      `AI identified immediate life safety or catastrophic failure indicators (${matches.join(', ')}). Automatically elevated to CRITICAL (Severity 5/5) with emergency dispatch priority.`
  },
  {
    level: 'HIGH',
    severity: 4,
    keywords: [
      'water gushing', 'pipe burst', 'major leak', 'major leakage', 'heavy leak', 'overheating',
      'chiller trip', 'compressor breakdown', 'no cooling at all', 'breaker trip', 'tripping constantly',
      'lift stopped', 'elevator not working', 'power outage in room', 'exam hall', 'lab exam disrupted',
      'fume hood failed', 'chemical odor', 'structural crack', 'ceiling falling'
    ],
    reasoningTemplate: (matches) => 
      `AI detected severe operational disruption (${matches.join(', ')}). Classified as HIGH criticality (Severity 4/5) to prevent asset degradation and facility stoppage.`
  },
  {
    level: 'MEDIUM',
    severity: 3,
    keywords: [
      'warm air', 'not cooling properly', 'cooling slow', 'rattling', 'loud noise', 'strange noise',
      'vibration', 'water dripping', 'slow drain', 'flickering', 'flickering light', 'projector dim',
      'door lock jammed', 'sensor slow', 'low pressure', 'tap loose', 'remote not working', 'exhaust fan noisy'
    ],
    reasoningTemplate: (matches) => 
      `AI detected functional impairment (${matches.join(', ')}). Assessed as MEDIUM criticality (Severity 3/5) affecting comfort and operational readiness.`
  },
  {
    level: 'LOW',
    severity: 1,
    keywords: [
      'minor scratch', 'cosmetic', 'filter dirty', 'filter cleaning', 'dusty', 'aesthetic',
      'chair squeaking', 'loose screw', 'armrest loose', 'paint chip', 'indicator bulb dim', 'routine'
    ],
    reasoningTemplate: (matches) => 
      `AI assessed defect as minor / non-urgent maintenance (${matches.join(', ')}). Assigned LOW criticality (Severity 1-2/5).`
  }
];

// Equipment vocabulary dictionary
const EQUIPMENT_PATTERNS = [
  { type: 'HVAC', name: 'Air Conditioning Unit (Split/Cassette AC)', keywords: ['ac', 'air conditioner', 'split ac', 'cassette ac', 'chiller', 'cooling', 'compressor', 'blower', 'freon'] },
  { type: 'Elevator', name: 'Passenger Elevator / Lift', keywords: ['elevator', 'lift', 'elevator shaft', 'hoist', 'otis', 'lift door'] },
  { type: 'Electrical', name: 'Main Switchboard / Distribution Panel', keywords: ['switchboard', 'distribution board', 'panel', 'lt panel', 'circuit breaker', 'main switch', 'breaker box', 'db box'] },
  { type: 'Electrical', name: 'Ceiling Fan / Ventilation Blower', keywords: ['fan', 'ceiling fan', 'bldc fan', 'exhaust fan', 'exhaust blower'] },
  { type: 'Electrical', name: 'Backup Diesel Generator', keywords: ['generator', 'genset', 'dg set', 'diesel generator', 'backup power'] },
  { type: 'Plumbing', name: 'Water Booster Pump / Hydro System', keywords: ['pump', 'booster pump', 'hydro pump', 'water motor', 'kirloskar'] },
  { type: 'Plumbing', name: 'Plumbing Pipeline / Sanitary System', keywords: ['pipe', 'pipeline', 'drain', 'sewage', 'faucet', 'tap', 'flush', 'toilet', 'sink'] },
  { type: 'Security/CCTV', name: 'Surveillance Camera / CCTV System', keywords: ['cctv', 'camera', 'security camera', 'ptz', 'surveillance', 'hikvision'] },
  { type: 'Lab Equipment', name: 'Chemistry Fume Hood / Exhaust Enclosure', keywords: ['fume hood', 'hood', 'biobase', 'exhaust hood', 'lab hood', 'chemistry lab'] },
  { type: 'IT/Network', name: 'Classroom Projector / AV Display', keywords: ['projector', 'display', 'screen', 'laser projector', 'epson', 'benq', 'smartboard'] },
  { type: 'Civil', name: 'Doors, Windows & Structural Fixtures', keywords: ['door', 'window', 'hinge', 'wall', 'tile', 'plaster', 'glass', 'floor'] },
  { type: 'Furniture', name: 'Classroom / Office Furniture', keywords: ['chair', 'desk', 'bench', 'table', 'podium', 'cupboard'] }
];

/**
 * Detect Equipment & Match against Campus Assets Database
 */
function findEquipmentAndMatch(text = '', locationHint = '', allAssets = []) {
  const clean = `${text} ${locationHint}`.toLowerCase();
  
  // 1. Identify primary equipment type
  let detectedEquipment = null;
  let highestKwScore = 0;
  let matchedEquipmentKws = [];

  for (const eq of EQUIPMENT_PATTERNS) {
    let score = 0;
    const matches = [];
    for (const kw of eq.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(clean)) {
        score += kw.length > 5 ? 3 : 2;
        matches.push(kw);
      }
    }
    if (score > highestKwScore) {
      highestKwScore = score;
      detectedEquipment = eq;
      matchedEquipmentKws = matches;
    }
  }

  // Fallback to NLP problem classification if keyword search is low
  if (!detectedEquipment) {
    const nlp = classifyProblem(clean);
    detectedEquipment = {
      type: nlp.predicted_category,
      name: `${nlp.predicted_category} Infrastructure Equipment`,
      keywords: nlp.matched_signals
    };
    matchedEquipmentKws = nlp.matched_signals;
  }

  // 2. Score and Match against Campus Assets Fleet
  let bestAsset = null;
  let bestAssetScore = 0;
  const scoredCandidates = [];

  for (const asset of allAssets) {
    let score = 0;
    const assetStr = `${asset.asset_code} ${asset.asset_name} ${asset.building} ${asset.location} ${asset.asset_type}`.toLowerCase();

    // Exact asset code match in text? Huge score!
    if (clean.includes(asset.asset_code.toLowerCase())) {
      score += 100;
    }

    // Equipment Category match
    if (detectedEquipment && asset.asset_type.toLowerCase() === detectedEquipment.type.toLowerCase()) {
      score += 35;
    }

    // Building match
    if (asset.building && clean.includes(asset.building.toLowerCase())) {
      score += 30;
    }

    // Room / Location match (e.g. "lab 1", "203", "seminar", "basement", "library")
    const locTerms = (asset.location || '').toLowerCase().split(/[\s\/\(\)]+/).filter(w => w.length > 2);
    for (const term of locTerms) {
      if (clean.includes(term)) {
        score += 15;
      }
    }

    // Equipment keyword overlap
    for (const kw of matchedEquipmentKws) {
      if (assetStr.includes(kw)) {
        score += 10;
      }
    }

    if (score > 25) {
      scoredCandidates.push({ asset, score });
    }

    if (score > bestAssetScore) {
      bestAssetScore = score;
      bestAsset = asset;
    }
  }

  // Sort candidates
  scoredCandidates.sort((a, b) => b.score - a.score);
  const topCandidates = scoredCandidates.slice(0, 3).map(c => c.asset);

  return {
    detected_equipment_name: detectedEquipment?.name || 'Campus Infrastructure Equipment',
    detected_category: detectedEquipment?.type || 'Other',
    matched_keywords: matchedEquipmentKws,
    matched_asset: bestAssetScore >= 35 ? bestAsset : null,
    candidate_assets: topCandidates,
    match_confidence: bestAssetScore >= 60 ? 0.96 : bestAssetScore >= 35 ? 0.82 : 0.50,
    has_exact_match: bestAssetScore >= 35
  };
}

/**
 * Analyze Criticality & Severity from Description and Image
 */
function analyzeCriticality({ text = '', imageAnalysis = null, matchedAsset = null }) {
  const clean = text.toLowerCase();

  let assessedLevel = 'MEDIUM';
  let severity = 3;
  let matchedHazards = [];
  let reasoning = 'Routine operational issue detected. Standard priority maintenance recommended.';

  // Check from highest severity down to lowest
  for (const rule of CRITICALITY_RULES) {
    const matched = [];
    for (const kw of rule.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(clean)) {
        matched.push(kw);
      }
    }

    if (matched.length > 0) {
      assessedLevel = rule.level;
      severity = rule.severity;
      matchedHazards = matched;
      reasoning = rule.reasoningTemplate(matched);
      break;
    }
  }

  // Factor in Image Analysis if available
  if (imageAnalysis) {
    if (imageAnalysis.detected_class && imageAnalysis.detected_class.includes('Electrical')) {
      assessedLevel = 'CRITICAL';
      severity = Math.max(severity, 5);
      reasoning = `Visual evidence confirms electrical wiring / scorch damage. Critical safety hazard confirmed by computer vision.`;
      matchedHazards.push('visual spark/burn evidence');
    } else if (imageAnalysis.detected_class && imageAnalysis.detected_class.includes('Leakage')) {
      severity = Math.max(severity, 4);
      if (assessedLevel !== 'CRITICAL') assessedLevel = 'HIGH';
      reasoning += ` Computer vision confirms active fluid leakage patterns.`;
      matchedHazards.push('visual fluid leak');
    } else if (imageAnalysis.severity_recommendation_delta) {
      severity = Math.min(5, Math.max(1, severity + imageAnalysis.severity_recommendation_delta));
    }
  }

  // Factor in Asset Criticality from Database if high-value asset
  if (matchedAsset && matchedAsset.criticality === 'Critical' && severity < 4) {
    severity = 4;
    assessedLevel = 'HIGH';
    reasoning += ` Elevated to HIGH due to asset location criticality (${matchedAsset.name} in ${matchedAsset.building}).`;
  }

  return {
    criticality_level: assessedLevel,
    severity,
    matched_hazards: matchedHazards,
    ai_reasoning: reasoning
  };
}

/**
 * Unified Comprehensive Complaint Analysis
 */
function analyzeComplaint({ text = '', location = '', imageAnalysis = null, allAssets = [] }) {
  // 1. Detect equipment and match asset
  const equipmentResult = findEquipmentAndMatch(text, location, allAssets);

  // 2. Analyze criticality and severity
  const criticalityResult = analyzeCriticality({
    text,
    imageAnalysis,
    matchedAsset: equipmentResult.matched_asset
  });

  // 3. Compute Failure Risk Probability using RF Predictor
  const asset = equipmentResult.matched_asset;
  let failureRisk = 0.55;
  let riskBand = 'MEDIUM';

  if (asset) {
    const installDate = new Date(asset.installation_date || '2022-01-01');
    const assetAgeYears = Math.max(0.5, (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25));
    const lastMaintDate = new Date(asset.last_maintenance || '2025-01-01');
    const daysSinceMaint = Math.max(0, Math.floor((new Date() - lastMaintDate) / (1000 * 60 * 60 * 24)));

    const pred = predictFailureRisk({
      asset_age_years: assetAgeYears,
      previous_failures: asset.previous_failures || 1,
      days_since_maintenance: daysSinceMaint,
      maintenance_count_12m: 2,
      complaints_30d: 2,
      severity: criticalityResult.severity,
      usage_hours_day: asset.usage_hours_day || 8.0,
      asset_type: asset.asset_type,
      criticality: asset.criticality || 'Medium'
    });
    failureRisk = pred.failure_risk_score;
    riskBand = pred.risk_level;
  } else {
    // Estimate failure risk based on severity
    failureRisk = criticalityResult.severity === 5 ? 0.94 : criticalityResult.severity === 4 ? 0.78 : criticalityResult.severity === 3 ? 0.52 : 0.25;
    riskBand = failureRisk >= 0.7 ? 'HIGH' : failureRisk >= 0.4 ? 'MEDIUM' : 'LOW';
  }

  // 4. Calculate Priority Score using Section 26 formula
  const priority = calculatePriority({
    severity: criticalityResult.severity,
    failure_probability: failureRisk,
    complaints_30d: asset ? 2 : 1,
    location_criticality: asset?.criticality || (criticalityResult.severity >= 4 ? 'High' : 'Medium')
  });

  // 5. Determine Recommended Technician Skill
  const nlp = classifyProblem(text);

  return {
    equipment: {
      detected_name: equipmentResult.detected_equipment_name,
      category: equipmentResult.detected_category,
      matched_asset: equipmentResult.matched_asset,
      candidate_assets: equipmentResult.candidate_assets,
      confidence: equipmentResult.match_confidence,
      has_match: equipmentResult.has_exact_match,
      keywords: equipmentResult.matched_keywords
    },
    criticality: {
      level: criticalityResult.criticality_level,
      severity: criticalityResult.severity,
      priority_score: priority.priority_score,
      priority_level: priority.priority_level,
      failure_risk: failureRisk,
      risk_band: riskBand,
      reasoning: criticalityResult.ai_reasoning,
      hazard_signals: criticalityResult.matched_hazards
    },
    routing: {
      recommended_skill: nlp.required_skill,
      urgency_status: criticalityResult.criticality_level === 'CRITICAL' ? 'EMERGENCY_DISPATCH' : 'STANDARD_QUEUE',
      estimated_hours: criticalityResult.severity === 5 ? 1.5 : criticalityResult.severity === 4 ? 3.0 : 6.0
    }
  };
}

module.exports = {
  analyzeComplaint,
  findEquipmentAndMatch,
  analyzeCriticality,
  CRITICALITY_RULES,
  EQUIPMENT_PATTERNS
};
