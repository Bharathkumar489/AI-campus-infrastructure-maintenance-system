const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const { predictFailureRisk } = require('../ml/failurePredictor');
const { calculatePriority } = require('../ml/priorityEngine');
const { classifyProblem } = require('../ml/textClassifier');
const { analyzeImage } = require('../ml/imageAnalyzer');
const { analyzeComplaint } = require('../ml/complaintAnalyzer');
const { findDuplicateTicket } = require('../ml/duplicateDetector');
const { generateEquipmentRequirements } = require('../ml/equipmentRequirements');

// Setup Multer for upload storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `upload-${Date.now()}-${uuidv4().substring(0, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/requests
router.get('/', (req, res) => {
  const { user_id, role, status, category, risk_level, priority_level, search } = req.query;
  let sql = `
    SELECT r.*, a.asset_code, a.asset_name, a.building, u.name as requester_name, u.email as requester_email,
           t.name as technician_name, t.technician_id, asn.assignment_id, asn.remarks as technician_remarks, asn.evidence_image_url
    FROM maintenance_requests r
    LEFT JOIN assets a ON r.asset_id = a.asset_id
    LEFT JOIN users u ON r.user_id = u.user_id
    LEFT JOIN assignments asn ON r.request_id = asn.request_id
    LEFT JOIN technicians t ON asn.technician_id = t.technician_id
    WHERE 1=1
  `;
  const params = [];

  // Filter by user role if requester
  if (role === 'requester' && user_id) {
    sql += ' AND r.user_id = ?';
    params.push(user_id);
  }

  // Filter by technician if technician
  if (role === 'technician' && user_id) {
    // Find technician_id for user
    const tech = get('SELECT technician_id FROM technicians WHERE user_id = ?', [user_id]);
    if (tech) {
      sql += ' AND asn.technician_id = ?';
      params.push(tech.technician_id);
    }
  }

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  if (category) {
    sql += ' AND r.category = ?';
    params.push(category);
  }
  if (risk_level) {
    sql += ' AND r.risk_level = ?';
    params.push(risk_level);
  }
  if (priority_level) {
    sql += ' AND r.priority_level = ?';
    params.push(priority_level);
  }
  if (search) {
    sql += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR a.asset_code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY r.created_at DESC';
  const requests = all(sql, params);
  res.json(requests);
});

// GET /api/requests/check-duplicate
router.get('/check-duplicate', (req, res) => {
  try {
    const { asset_id, asset_code, location, title, category } = req.query;
    const activeRequests = all(`
      SELECT r.*, a.asset_code, a.asset_name
      FROM maintenance_requests r
      LEFT JOIN assets a ON r.asset_id = a.asset_id
      WHERE r.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')
    `);

    const result = findDuplicateTicket({
      asset_id,
      asset_code,
      location,
      title,
      category
    }, activeRequests);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Duplicate check failed', details: err.message });
  }
});

// POST /api/requests/:id/upvote
router.post('/:id/upvote', (req, res) => {
  try {
    const reqId = req.params.id;
    const { user_id } = req.body;
    const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [reqId]);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const currentUpvotes = (request.upvotes || 1) + 1;
    const effectiveComplaints = currentUpvotes + 1;

    // Recalculate Section 26 priority
    const priorityResult = calculatePriority({
      severity: request.severity,
      failure_probability: request.failure_probability || 0.5,
      complaints_30d: effectiveComplaints,
      location_criticality: request.priority_level === 'CRITICAL' ? 'Critical' : 'High'
    });

    run(`
      UPDATE maintenance_requests 
      SET upvotes = ?, priority_score = ?, priority_level = ?
      WHERE request_id = ?
    `, [currentUpvotes, priorityResult.priority_score, priorityResult.priority_level, reqId]);

    // Award reputation points
    if (user_id) {
      run('UPDATE users SET reputation_points = COALESCE(reputation_points, 150) + 5 WHERE user_id = ?', [user_id]);
    }

    res.json({
      success: true,
      request_id: reqId,
      upvotes: currentUpvotes,
      new_priority_score: priorityResult.priority_score,
      new_priority_level: priorityResult.priority_level,
      reputation_awarded: 5,
      message: `Upvote recorded! Priority elevated to ${priorityResult.priority_score.toFixed(1)} (${priorityResult.priority_level}).`
    });
  } catch (err) {
    res.status(500).json({ error: 'Upvote failed', details: err.message });
  }
});

// GET /api/requests/:id
router.get('/:id', (req, res) => {
  const reqId = req.params.id;
  const sql = `
    SELECT r.*, a.asset_code, a.asset_name, a.building, a.installation_date, a.last_maintenance, a.usage_hours_day, a.previous_failures, a.criticality,
           u.name as requester_name, u.email as requester_email, u.phone as requester_phone, u.department as requester_department,
           t.name as technician_name, t.skill as technician_skill, t.contact as technician_contact, t.technician_id,
           asn.assignment_id, asn.assigned_at, asn.accepted_at, asn.started_at, asn.completed_at as tech_completed_at,
           asn.remarks as technician_remarks, asn.evidence_image_url,
           fb.rating as feedback_rating, fb.comments as feedback_comments
    FROM maintenance_requests r
    LEFT JOIN assets a ON r.asset_id = a.asset_id
    LEFT JOIN users u ON r.user_id = u.user_id
    LEFT JOIN assignments asn ON r.request_id = asn.request_id
    LEFT JOIN technicians t ON asn.technician_id = t.technician_id
    LEFT JOIN feedback fb ON r.request_id = fb.request_id
    WHERE r.request_id = ?
  `;
  const request = get(sql, [reqId]);
  if (!request) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  // Get prediction details with feature contributions
  const pred = get('SELECT * FROM predictions WHERE request_id = ? ORDER BY predicted_at DESC LIMIT 1', [reqId]);
  let parsedSignals = [];
  if (pred && pred.feature_signals) {
    try {
      parsedSignals = JSON.parse(pred.feature_signals);
    } catch (e) {
      parsedSignals = [];
    }
  }

  // Get maintenance history for the associated asset
  let assetHistory = [];
  if (request.asset_id) {
    assetHistory = all('SELECT * FROM maintenance_history WHERE asset_id = ? ORDER BY event_date DESC', [request.asset_id]);
  }

  // Generate rich AI Equipment & Maintenance Requirements
  const equipmentRequirements = generateEquipmentRequirements(request);

  res.json({
    ...request,
    ai_equipment_requirements: equipmentRequirements,
    prediction_details: pred ? {
      ...pred,
      feature_signals: parsedSignals
    } : null,
    asset_history: assetHistory
  });
});

// POST /api/requests
router.post('/', upload.single('image'), (req, res) => {
  try {
    let {
      user_id,
      asset_id,
      asset_code,
      title,
      description,
      category,
      severity = 3,
      location,
      image_url
    } = req.body;

    if (!user_id || !title || !description || !location) {
      return res.status(400).json({ error: 'User ID, title, description, and location are required' });
    }

    // Process uploaded file if present
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    // Optional NLP Problem Classification if category not provided or auto requested
    let nlpClassification = null;
    if (!category || category === 'Auto' || category === 'Other') {
      nlpClassification = classifyProblem(`${title} ${description}`);
      category = nlpClassification.predicted_category;
    }

    // Optional Image Analysis if image provided
    let imageAnalysis = null;
    if (req.file) {
      imageAnalysis = analyzeImage(req.file.path, req.file.originalname, category);
    }

    // Core AI Analysis: Automatically detect equipment and analyze criticality
    const allAssets = all('SELECT * FROM assets');
    const autoAnalysis = analyzeComplaint({
      text: `${title} ${description}`,
      location,
      imageAnalysis,
      allAssets
    });

    // Resolve Asset if code provided, or use AI-detected equipment asset
    let asset = null;
    if (asset_id) {
      asset = get('SELECT * FROM assets WHERE asset_id = ?', [asset_id]);
    } else if (asset_code) {
      asset = get('SELECT * FROM assets WHERE asset_code = ?', [asset_code]);
      if (asset) asset_id = asset.asset_id;
    } else if (autoAnalysis.equipment && autoAnalysis.equipment.matched_asset) {
      asset = autoAnalysis.equipment.matched_asset;
      asset_id = asset.asset_id;
      asset_code = asset.asset_code;
    }

    if (!category || category === 'Auto' || category === 'Other') {
      category = autoAnalysis.equipment.category || 'General';
    }

    // If severity is not manually specified or set to auto, use AI-assessed severity
    if (!req.body.severity || req.body.severity === 'auto') {
      severity = autoAnalysis.criticality.severity;
    }

    // Compute failure prediction features
    let assetAgeYears = 2.0;
    let prevFailures = 1;
    let daysSinceMaint = 60;
    let maintCount12m = 1;
    let usageHours = 8.0;
    let criticality = 'Medium';

    if (asset) {
      const installDate = new Date(asset.installation_date || '2022-01-01');
      assetAgeYears = Math.max(0.5, (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25));

      const lastMaintDate = new Date(asset.last_maintenance || '2025-01-01');
      daysSinceMaint = Math.max(0, Math.floor((new Date() - lastMaintDate) / (1000 * 60 * 60 * 24)));

      prevFailures = asset.previous_failures || 0;
      usageHours = asset.usage_hours_day || 8.0;
      criticality = asset.criticality || 'Medium';

      const recentMaint = all(`SELECT COUNT(*) as count FROM maintenance_history WHERE asset_id = ? AND event_date >= date('now', '-1 year')`, [asset.asset_id]);
      if (recentMaint.length > 0) maintCount12m = recentMaint[0].count;
    }

    // Count complaints for this asset in last 30 days
    let complaints30d = 1;
    if (asset_id) {
      const pastReqs = all(`SELECT COUNT(*) as count FROM maintenance_requests WHERE asset_id = ? AND created_at >= datetime('now', '-30 days')`, [asset_id]);
      if (pastReqs.length > 0) complaints30d = pastReqs[0].count + 1;
    }

    const sevNum = parseInt(severity, 10) || 3;

    // Run AI Failure Prediction (Section 24 - 25)
    const prediction = predictFailureRisk({
      asset_age_years: assetAgeYears,
      previous_failures: prevFailures,
      days_since_maintenance: daysSinceMaint,
      maintenance_count_12m: maintCount12m,
      complaints_30d: complaints30d,
      severity: sevNum,
      usage_hours_day: usageHours,
      asset_type: category || (asset ? asset.asset_type : 'HVAC'),
      criticality
    });

    // Run Priority Engine (Section 26)
    const priorityResult = calculatePriority({
      severity: sevNum,
      failure_probability: prediction.failure_probability,
      complaints_30d: complaints30d,
      location_criticality: criticality
    });

    const requestId = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    run(
      `INSERT INTO maintenance_requests (
        request_id, user_id, asset_id, title, description, category, severity,
        image_url, location, status, failure_probability, risk_level, priority_score, priority_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, datetime('now', 'localtime'))`,
      [
        requestId,
        user_id,
        asset_id || null,
        title,
        description,
        category,
        sevNum,
        image_url || null,
        location,
        prediction.failure_probability,
        prediction.risk_level,
        priorityResult.priority_score,
        priorityResult.priority_level
      ]
    );

    // Save Prediction record
    const predictionId = `PRED-${uuidv4().substring(0, 8)}`;
    run(
      `INSERT INTO predictions (
        prediction_id, request_id, asset_id, failure_probability, risk_level,
        priority_score, feature_signals, model_version, predicted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
      [
        predictionId,
        requestId,
        asset_id || 'unassigned',
        prediction.failure_probability,
        prediction.risk_level,
        priorityResult.priority_score,
        JSON.stringify(prediction.feature_signals),
        'v1.0.0-rf'
      ]
    );

    // Create Notification for User
    run(
      `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `notif-${uuidv4().substring(0, 8)}`,
        user_id,
        requestId,
        `Request "${title}" created successfully. AI Risk: ${prediction.risk_level} (${Math.round(prediction.failure_probability * 100)}%), Priority: ${priorityResult.priority_level}.`,
        'INFO'
      ]
    );

    // Notify all administrators if priority is CRITICAL or HIGH
    if (['CRITICAL', 'HIGH'].includes(priorityResult.priority_level)) {
      const admins = all('SELECT user_id FROM users WHERE role = "admin"');
      for (const adm of admins) {
        run(
          `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
           VALUES (?, ?, ?, ?, ?)`,
          [
            `notif-${uuidv4().substring(0, 8)}`,
            adm.user_id,
            requestId,
            `High priority alert: Request "${title}" in ${location} requires attention (${priorityResult.priority_level} Priority, Score: ${priorityResult.priority_score}).`,
            'ALERT'
          ]
        );
      }
    }

    const createdReq = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);

    res.status(201).json({
      request: createdReq,
      ai_assessment: {
        prediction,
        priority: priorityResult,
        nlp_classification: nlpClassification,
        image_analysis: imageAnalysis
      }
    });
  } catch (err) {
    console.error('Request creation error:', err);
    res.status(500).json({ error: 'Failed to create maintenance request', details: err.message });
  }
});

// PATCH /api/requests/:id/status
router.patch('/:id/status', (req, res) => {
  const { status, remarks } = req.body;
  const requestId = req.params.id;

  const validStatuses = ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'ACCEPTED', 'IN PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const existing = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);
  if (!existing) {
    return res.status(404).json({ error: 'Request not found' });
  }

  let completedAtUpdate = '';
  let closedAtUpdate = '';
  if (status === 'COMPLETED' && !existing.completed_at) {
    completedAtUpdate = `, completed_at = datetime('now', 'localtime')`;
  }
  if (status === 'CLOSED' || status === 'VERIFIED') {
    closedAtUpdate = `, closed_at = datetime('now', 'localtime')`;
  }

  run(
    `UPDATE maintenance_requests SET status = ? ${completedAtUpdate} ${closedAtUpdate} WHERE request_id = ?`,
    [status, requestId]
  );

  // Notify requester of status transition
  run(
    `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
     VALUES (?, ?, ?, ?, ?)`,
    [
      `notif-${uuidv4().substring(0, 8)}`,
      existing.user_id,
      requestId,
      `Your request status has been updated to ${status}.${remarks ? ` Note: ${remarks}` : ''}`,
      'STATUS_CHANGE'
    ]
  );

  const updated = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);
  res.json(updated);
});

// POST /api/requests/:id/evidence
router.post('/:id/evidence', upload.single('evidence'), (req, res) => {
  const requestId = req.params.id;
  const { remarks, parts_replaced, technician_id } = req.body;

  const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const evidenceUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Update assignment
  run(
    `UPDATE assignments SET 
      completed_at = datetime('now', 'localtime'),
      remarks = COALESCE(?, remarks),
      evidence_image_url = COALESCE(?, evidence_image_url)
     WHERE request_id = ?`,
    [remarks, evidenceUrl, requestId]
  );

  // Update request status to COMPLETED
  run(
    `UPDATE maintenance_requests SET status = 'COMPLETED', completed_at = datetime('now', 'localtime') WHERE request_id = ?`,
    [requestId]
  );

  // Free technician workload
  const assignment = get('SELECT technician_id FROM assignments WHERE request_id = ?', [requestId]);
  if (assignment) {
    run(`UPDATE technicians SET workload = MAX(0, workload - 1) WHERE technician_id = ?`, [assignment.technician_id]);
  }

  // Append to Asset Maintenance History
  if (request.asset_id) {
    const tech = assignment ? get('SELECT name FROM technicians WHERE technician_id = ?', [assignment.technician_id]) : null;
    run(
      `INSERT INTO maintenance_history (history_id, asset_id, request_id, event_type, remarks, parts_replaced, technician_name, event_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
      [
        `hst-${uuidv4().substring(0, 8)}`,
        request.asset_id,
        requestId,
        'Repair Completed',
        remarks || 'Repair executed and completion evidence submitted.',
        parts_replaced || 'None specified',
        tech ? tech.name : 'Service Technician'
      ]
    );

    // Update asset last_maintenance date to today and status to Operational
    run(
      `UPDATE assets SET last_maintenance = date('now'), status = 'Operational' WHERE asset_id = ?`,
      [request.asset_id]
    );
  }

  // Notify requester to verify work and provide feedback
  run(
    `INSERT INTO notifications (notification_id, user_id, request_id, message, type)
     VALUES (?, ?, ?, ?, ?)`,
    [
      `notif-${uuidv4().substring(0, 8)}`,
      request.user_id,
      requestId,
      `Work on your request "${request.title}" has been completed! Please verify the repair and submit your feedback.`,
      'VERIFY_REQUEST'
    ]
  );

  res.json({ success: true, message: 'Completion evidence recorded and request marked as COMPLETED.' });
});

// DELETE /api/requests/:id
router.delete('/:id', (req, res) => {
  try {
    const requestId = req.params.id;
    const { user_id, role } = req.body || {};

    const request = get('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Permission check: Requesters can delete their own requests; admins can delete any
    if (role !== 'admin' && user_id && request.user_id !== user_id) {
      return res.status(403).json({ error: 'You are only authorized to delete your own maintenance complaints' });
    }

    // Free technician workload if an active assignment existed
    const assignment = get('SELECT technician_id FROM assignments WHERE request_id = ?', [requestId]);
    if (assignment) {
      run(`UPDATE technicians SET workload = MAX(0, workload - 1) WHERE technician_id = ?`, [assignment.technician_id]);
    }

    // Clean up dependent child records
    run('DELETE FROM assignments WHERE request_id = ?', [requestId]);
    run('DELETE FROM feedback WHERE request_id = ?', [requestId]);
    run('DELETE FROM notifications WHERE request_id = ?', [requestId]);
    run('DELETE FROM predictions WHERE request_id = ?', [requestId]);
    run('DELETE FROM maintenance_requests WHERE request_id = ?', [requestId]);

    res.json({
      success: true,
      message: `Complaint ${requestId} has been successfully deleted/withdrawn.`,
      request_id: requestId
    });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Failed to delete request', details: err.message });
  }
});

module.exports = router;
