/**
 * Proximity & Duplicate Complaint Detection Engine
 * Adapted from reference project (CivicPulse duplicate detector) for Campus Facilities.
 * Prevents redundant tickets and routes duplicate complaints into Upvotes to boost Section 26 priority.
 */

function checkKeywordOverlap(text1 = '', text2 = '') {
  const stopWords = new Set(['the', 'and', 'with', 'for', 'from', 'this', 'that', 'not', 'are', 'was', 'room', 'block']);
  const words1 = text1.toLowerCase().split(/[\s,./\-_()]+/).filter(w => w.length > 2 && !stopWords.has(w));
  const words2 = text2.toLowerCase().split(/[\s,./\-_()]+/).filter(w => w.length > 2 && !stopWords.has(w));

  const matched = words1.filter(w => words2.includes(w));
  return {
    overlapCount: matched.length,
    commonKeywords: matched
  };
}

/**
 * Checks active maintenance requests to see if a similar complaint is already open.
 */
function findDuplicateTicket(newTicket, activeRequests = []) {
  if (!newTicket || !activeRequests || activeRequests.length === 0) {
    return { isDuplicate: false, matchedRequest: null };
  }

  const newAssetId = newTicket.asset_id;
  const newAssetCode = (newTicket.asset_code || '').toLowerCase();
  const newLocation = (newTicket.location || '').toLowerCase();
  const newTitle = (newTicket.title || '').toLowerCase();
  const newCategory = (newTicket.category || '').toLowerCase();

  for (const existing of activeRequests) {
    // Only check unresolved requests
    if (['resolved', 'closed'].includes((existing.status || '').toLowerCase())) {
      continue;
    }

    const exAssetId = existing.asset_id;
    const exAssetCode = (existing.asset_code || '').toLowerCase();
    const exLocation = (existing.location || '').toLowerCase();
    const exTitle = (existing.title || '').toLowerCase();
    const exCategory = (existing.category || '').toLowerCase();

    // 1. Exact Asset Match: Strongest duplicate signal
    if (newAssetId && exAssetId && newAssetId === exAssetId) {
      return {
        isDuplicate: true,
        matchedRequest: existing,
        similarityScore: 0.98,
        matchType: 'EXACT_ASSET',
        reason: `An active ticket (${existing.request_id}) is already open for this equipment (${existing.asset_code || existing.title}).`
      };
    }

    // 2. Exact Asset Code Match
    if (newAssetCode && exAssetCode && newAssetCode === exAssetCode) {
      return {
        isDuplicate: true,
        matchedRequest: existing,
        similarityScore: 0.95,
        matchType: 'ASSET_CODE',
        reason: `An active ticket (${existing.request_id}) is already open for asset code ${existing.asset_code}.`
      };
    }

    // 3. Same Room & Same Category Match (e.g. both are HVAC complaints in Room 203)
    if (newLocation && exLocation && newCategory && exCategory && newCategory === exCategory) {
      const locationOverlap = checkKeywordOverlap(newLocation, exLocation);
      if (locationOverlap.overlapCount >= 2) {
        return {
          isDuplicate: true,
          matchedRequest: existing,
          similarityScore: 0.88,
          matchType: 'ROOM_CATEGORY',
          reason: `A ${existing.category} issue was already reported at "${existing.location}" (${existing.request_id}).`
        };
      }
    }

    // 4. Keyword Overlap in Title and Same Location
    if (newLocation && exLocation) {
      const titleOverlap = checkKeywordOverlap(newTitle, exTitle);
      const locOverlap = checkKeywordOverlap(newLocation, exLocation);

      if (titleOverlap.overlapCount >= 2 && locOverlap.overlapCount >= 1) {
        return {
          isDuplicate: true,
          matchedRequest: existing,
          similarityScore: 0.82,
          matchType: 'KEYWORD_OVERLAP',
          reason: `A similar complaint "${existing.title}" is already being resolved at this location.`
        };
      }
    }
  }

  return {
    isDuplicate: false,
    matchedRequest: null
  };
}

module.exports = {
  findDuplicateTicket,
  checkKeywordOverlap
};
