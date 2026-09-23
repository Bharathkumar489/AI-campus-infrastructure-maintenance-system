const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');

// POST /api/assignments
router.post('/', (req, res) => {
  const { request_id, technician_id, remarks } = req.body;

  if (!request_id || !technician_id) {
    return res.status(400).json({ error: 'Request ID and Technician ID are required' });
  }

  const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [request_id]);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const technician = get('SELECT * FROM technicians WHERE technician_id = ?', [technician_id]);
  if (!technician) {
    return res.status(404).json({ error: 'Technician not found' });
  }

  // Check if existing assignment exists
  const existing = get('SELECT * FROM assignments WHERE request_id = ?', [request_id]);
  const assignmentId = existing ? existing.assignment_id : `asn-${uuidv4().substring(0, 8)}`;

  if (existing) {
    run(
      `UPDATE assignments SET technician_id = ?, remarks = ?, assigned_at = datetime('now', 'localtime') WHERE assignment_id = ?`,
      [technician_id, remarks || 'Reassigned by Admin', existing.assignment_id]
    );
  } else {
    run(
      `INSERT INTO assignments (assignment_id, request_id, technician_id, assigned_at, remarks)
       VALUES (?, ?, ?, datetime('now', 'localtime'), ?)`,
      [assignmentId, request_id, technician_id, remarks || 'Assigned by Administrator']
    );
  }

  // Update request status to ASSIGNED
  run(
    `UPDATE maintenance_requests SET status = 'ASSIGNED' WHERE request_id = ?`,
    [request_id]
  );

  // Increment technician workload
  run(
    `UPDATE technicians SET workload = workload + 1 WHERE technician_id = ?`,
    [technician_id]
  );

  // Notify technician
  if (technician.user_id) {
    run(
      `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        technician.user_id,
        request_id,
        `New Assignment: You have been assigned to repair "${request.title}" at ${request.location}. Priority: ${request.priority_level}.`,
        'ASSIGNMENT'
      ]
    );
  }

  // Notify requester
  run(
    `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
     VALUES (?, ?, ?, ?, ?)`,
    [
      `notif-${uuidv4().substring(0, 8)}`,
      request.user_id,
      request_id,
      `Technician ${technician.name} (${technician.skill}) has been assigned to your request "${request.title}".`,
      'STATUS_CHANGE'
    ]
  );

  const updatedAssignment = get('SELECT * FROM assignments WHERE assignment_id = ?', [assignmentId]);
  res.status(201).json(updatedAssignment);
});

// PATCH /api/assignments/:id/action (accept, start)
router.patch('/:id/action', (req, res) => {
  const { action, remarks } = req.body;
  const assignmentId = req.params.id;

  const assignment = get('SELECT * FROM assignments WHERE assignment_id = ?', [assignmentId]);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [assignment.request_id]);

  if (action === 'accept') {
    run(
      `UPDATE assignments SET accepted_at = datetime('now', 'localtime'), remarks = COALESCE(?, remarks) WHERE assignment_id = ?`,
      [remarks, assignmentId]
    );
    run(
      `UPDATE maintenance_requests SET status = 'ACCEPTED' WHERE request_id = ?`,
      [assignment.request_id]
    );
    run(
      `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        request.user_id,
        assignment.request_id,
        `Technician has accepted your maintenance request and is preparing tools.`,
        'STATUS_CHANGE'
      ]
    );
  } else if (action === 'start') {
    run(
      `UPDATE assignments SET started_at = datetime('now', 'localtime'), remarks = COALESCE(?, remarks) WHERE assignment_id = ?`,
      [remarks, assignmentId]
    );
    run(
      `UPDATE maintenance_requests SET status = 'IN PROGRESS' WHERE request_id = ?`,
      [assignment.request_id]
    );
    run(
      `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        request.user_id,
        assignment.request_id,
        `Technician is now on-site working on "${request.title}". Status is IN PROGRESS.`,
        'STATUS_CHANGE'
      ]
    );
  } else {
    return res.status(400).json({ error: 'Invalid action. Must be "accept" or "start".' });
  }

  const updated = get('SELECT * FROM assignments WHERE assignment_id = ?', [assignmentId]);
  res.json(updated);
});

module.exports = router;
