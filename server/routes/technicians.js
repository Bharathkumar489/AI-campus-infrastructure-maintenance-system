const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');
const { recommendTechnicians } = require('../ml/technicianMatcher');
const { CATEGORY_DEFINITIONS } = require('../ml/textClassifier');

// GET /api/technicians
router.get('/', (req, res) => {
  const sql = `
    SELECT t.*, u.email, u.department,
           (SELECT COUNT(*) FROM assignments a JOIN maintenance_requests r ON a.request_id = r.request_id 
            WHERE a.technician_id = t.technician_id AND r.status IN ('ASSIGNED', 'ACCEPTED', 'IN PROGRESS')) as live_workload
    FROM technicians t
    LEFT JOIN users u ON t.user_id = u.user_id
    ORDER BY t.technician_id ASC
  `;
  const technicians = all(sql);

  // Sync stored workload with actual open assignments
  for (const t of technicians) {
    if (t.workload !== t.live_workload) {
      run('UPDATE technicians SET workload = ? WHERE technician_id = ?', [t.live_workload, t.technician_id]);
      t.workload = t.live_workload;
    }
  }

  res.json(technicians);
});

// PATCH /api/technicians/:id/availability
router.patch('/:id/availability', (req, res) => {
  const { availability } = req.body;
  if (!['Available', 'Busy', 'On Leave'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability state' });
  }

  run('UPDATE technicians SET availability = ? WHERE technician_id = ?', [availability, req.params.id]);
  const updated = get('SELECT * FROM technicians WHERE technician_id = ?', [req.params.id]);
  res.json(updated);
});

// GET /api/technicians/recommend/:requestId
router.get('/recommend/:requestId', (req, res) => {
  const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [req.params.requestId]);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const allTechs = all(`
    SELECT t.*, u.email, u.department,
           (SELECT COUNT(*) FROM assignments a JOIN maintenance_requests r ON a.request_id = r.request_id 
            WHERE a.technician_id = t.technician_id AND r.status IN ('ASSIGNED', 'ACCEPTED', 'IN PROGRESS')) as workload
    FROM technicians t
    LEFT JOIN users u ON t.user_id = u.user_id
  `);

  const categoryDef = CATEGORY_DEFINITIONS[request.category] || {};
  const requiredSkill = categoryDef.typical_skill || 'General Maintenance';

  const rankedCandidates = recommendTechnicians(allTechs, requiredSkill, request.category);

  res.json({
    request_id: request.request_id,
    problem_category: request.category,
    required_skill: requiredSkill,
    recommended_technician: rankedCandidates.length > 0 ? rankedCandidates[0] : null,
    candidates: rankedCandidates
  });
});

module.exports = router;
