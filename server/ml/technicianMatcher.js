/**
 * Technician Smart Matcher (Section 29 of System Specification)
 * Matches problem category/required skill against the technician database,
 * checks availability, ranks by active workload, and recommends the best assignment.
 */

function recommendTechnicians(allTechnicians, requiredSkill, category) {
  if (!allTechnicians || allTechnicians.length === 0) return [];

  const candidates = allTechnicians.map(tech => {
    let skillMatch = 0;
    const primary = (tech.skill || '').toLowerCase();
    const secondary = (tech.secondary_skills || '').toLowerCase();
    const req = (requiredSkill || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // Primary skill exact or partial match
    if (primary === req || primary.includes(cat) || req.includes(primary)) {
      skillMatch = 1.0;
    } else if (secondary.includes(cat) || secondary.includes(req)) {
      skillMatch = 0.75;
    } else if (primary.includes('general') || secondary.includes('general')) {
      skillMatch = 0.40;
    }

    // Availability score
    let availScore = 0;
    if (tech.availability === 'Available') availScore = 1.0;
    else if (tech.availability === 'Busy') availScore = 0.4;
    else availScore = 0.0; // On Leave

    // Workload penalty (0-1: 0 tasks = 1.0, 5+ tasks = 0.1)
    const activeTasks = parseInt(tech.workload, 10) || 0;
    const workloadScore = Math.max(0.1, 1.0 - (activeTasks * 0.18));

    // Composite match score (0 - 100)
    // 50% Skill Match + 30% Availability + 20% Workload Capacity
    const matchScore = (skillMatch * 50) + (availScore * 30) + (workloadScore * 20);

    let matchReason = '';
    if (skillMatch === 1.0 && tech.availability === 'Available') {
      matchReason = `Primary skill match (${tech.skill}), available, active workload: ${activeTasks} task(s)`;
    } else if (skillMatch >= 0.75) {
      matchReason = `Cross-skilled in ${category}, active workload: ${activeTasks} task(s)`;
    } else if (tech.availability !== 'Available') {
      matchReason = `Skill match but currently ${tech.availability} (${activeTasks} ongoing tasks)`;
    } else {
      matchReason = `General technician backup`;
    }

    return {
      ...tech,
      skill_match: skillMatch,
      match_score: Math.round(matchScore),
      active_workload: activeTasks,
      match_reason: matchReason,
      is_eligible: skillMatch > 0 && tech.availability !== 'On Leave'
    };
  });

  // Sort descending by match_score
  candidates.sort((a, b) => b.match_score - a.match_score);

  return candidates;
}

module.exports = {
  recommendTechnicians
};
