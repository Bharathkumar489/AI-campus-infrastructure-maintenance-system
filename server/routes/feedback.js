const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');

// POST /api/feedback
router.post('/', (req, res) => {
  const { request_id, user_id, rating, comments } = req.body;

  if (!request_id || !user_id || !rating) {
    return res.status(400).json({ error: 'Request ID, User ID, and Rating (1-5) are required' });
  }

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [request_id]);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const feedbackId = `FB-${uuidv4().substring(0, 8)}`;
  run(
    `INSERT INTO feedback (feedback_id, request_id, user_id, rating, comments, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [feedbackId, request_id, user_id, numRating, comments || '']
  );

  // Advance request lifecycle: Mark VERIFIED and CLOSED
  run(
    `UPDATE maintenance_requests SET status = 'CLOSED', closed_at = datetime('now', 'localtime') WHERE request_id = ?`,
    [request_id]
  );

  // Update technician rating if assigned
  const assignment = get('SELECT technician_id FROM assignments WHERE request_id = ?', [request_id]);
  if (assignment) {
    const avgRatingRow = get(`
      SELECT AVG(fb.rating) as avg_rating 
      FROM feedback fb 
      JOIN assignments a ON fb.request_id = a.request_id 
      WHERE a.technician_id = ?
    `, [assignment.technician_id]);

    if (avgRatingRow && avgRatingRow.avg_rating) {
      const rounded = parseFloat(avgRatingRow.avg_rating.toFixed(2));
      run('UPDATE technicians SET rating = ? WHERE technician_id = ?', [rounded, assignment.technician_id]);
    }
  }

  // Record closure event in asset history
  if (request.asset_id) {
    run(
      `INSERT INTO maintenance_history (history_id, asset_id, request_id, event_type, remarks, event_date)
       VALUES (?, ?, ?, 'Repair Verified & Closed', ?, datetime('now', 'localtime'))`,
      [
        `hst-${uuidv4().substring(0, 8)}`,
        request.asset_id,
        request_id,
        `Requester verified resolution with ${numRating}/5 star rating. Feedback: "${comments || 'Satisfactory repair'}"`
      ]
    );
  }

  // Award +15 reputation points for verifying repair
  try {
    run('UPDATE users SET reputation_points = COALESCE(reputation_points, 150) + 15 WHERE user_id = ?', [user_id]);
  } catch (e) {}

  res.status(201).json({
    success: true,
    message: 'Feedback submitted, +15 reputation points awarded, and ticket successfully closed.',
    feedback_id: feedbackId,
    reputation_awarded: 15
  });
});

// GET /api/feedback/:requestId
router.get('/:requestId', (req, res) => {
  const fb = get('SELECT * FROM feedback WHERE request_id = ?', [req.params.requestId]);
  res.json(fb || null);
});

module.exports = router;
