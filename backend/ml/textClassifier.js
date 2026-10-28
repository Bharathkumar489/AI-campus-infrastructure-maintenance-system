/**
 * Problem Classifier & Skill Router (Section 27 of System Specification)
 * Classifies complaints into categories and maps them to required technician skills.
 */

const CATEGORY_DEFINITIONS = {
  'HVAC': {
    keywords: ['ac', 'air conditioner', 'cooling', 'hvac', 'chiller', 'thermostat', 'compressor', 'ventilation', 'heating', 'blower', 'duct', 'freon', 'fan coil', 'cold air'],
    typical_skill: 'HVAC Maintenance',
    urgency_multiplier: 1.1
  },
  'Electrical': {
    keywords: ['spark', 'sparking', 'switch', 'outlet', 'socket', 'fuse', 'breaker', 'blackout', 'short circuit', 'power', 'light', 'bulb', 'wire', 'wiring', 'voltage', 'generator', 'ups', 'panel'],
    typical_skill: 'Electrical Maintenance',
    urgency_multiplier: 1.25 // Electrical carries immediate safety risk
  },
  'Plumbing': {
    keywords: ['leak', 'leaking', 'water', 'pipe', 'drain', 'clog', 'clogged', 'toilet', 'tap', 'faucet', 'flush', 'sewage', 'overflow', 'pressure', 'sink', 'geyser'],
    typical_skill: 'Plumbing & Water Systems',
    urgency_multiplier: 1.15
  },
  'Civil': {
    keywords: ['wall', 'crack', 'cracked', 'ceiling', 'plaster', 'roof', 'floor', 'tile', 'door', 'window', 'hinge', 'lock', 'glass', 'seepage', 'concrete', 'staircase', 'railing'],
    typical_skill: 'Civil Maintenance & Masonry',
    urgency_multiplier: 1.0
  },
  'Furniture': {
    keywords: ['chair', 'desk', 'bench', 'table', 'podium', 'board', 'cupboard', 'shelf', 'broken armrest', 'drawer', 'furniture'],
    typical_skill: 'Carpentry & General Maintenance',
    urgency_multiplier: 0.85
  },
  'Security/CCTV': {
    keywords: ['camera', 'cctv', 'dvr', 'nvr', 'surveillance', 'biometric', 'access control', 'turnstile', 'fire alarm', 'detector', 'siren', 'gate'],
    typical_skill: 'Security & Access Systems',
    urgency_multiplier: 1.1
  },
  'Lab Equipment': {
    keywords: ['fume hood', 'microscope', 'centrifuge', 'autoclave', 'incubator', 'analyzer', 'oscilloscope', 'lab bench', 'chemical', 'gas line'],
    typical_skill: 'Laboratory & Instrumentation',
    urgency_multiplier: 1.2
  },
  'IT/Network': {
    keywords: ['projector', 'router', 'wifi', 'ethernet', 'switch rack', 'lan', 'cable', 'display', 'smartboard', 'hdmi'],
    typical_skill: 'IT & Network Hardware',
    urgency_multiplier: 1.0
  }
};

function classifyProblem(text = '') {
  const clean = text.toLowerCase();
  let bestCategory = 'Other';
  let highestScore = 0;
  let matchedKeywords = [];

  for (const [category, meta] of Object.entries(CATEGORY_DEFINITIONS)) {
    let score = 0;
    const matches = [];

    for (const kw of meta.keywords) {
      // Regex word boundary matching
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(clean)) {
        score += kw.length > 5 ? 2 : 1; // Long phrases weighted higher
        matches.push(kw);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
      matchedKeywords = matches;
    }
  }

  // Fallback defaults
  if (highestScore === 0) {
    bestCategory = 'Civil'; // default general infrastructure
    matchedKeywords = ['general issue'];
  }

  const skill = CATEGORY_DEFINITIONS[bestCategory]?.typical_skill || 'General Maintenance';

  return {
    predicted_category: bestCategory,
    required_skill: skill,
    confidence: highestScore > 2 ? 0.92 : highestScore > 0 ? 0.78 : 0.50,
    matched_signals: matchedKeywords
  };
}

module.exports = {
  classifyProblem,
  CATEGORY_DEFINITIONS
};
