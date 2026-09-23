const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');
const { predictFailureRisk } = require('../ml/failurePredictor');

// GET /api/assets
router.get('/', (req, res) => {
  const { building, type, status, search } = req.query;
  let sql = 'SELECT * FROM assets WHERE 1=1';
  const params = [];

  if (building) {
    sql += ' AND building = ?';
    params.push(building);
  }
  if (type) {
    sql += ' AND asset_type = ?';
    params.push(type);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (asset_name LIKE ? OR asset_code LIKE ? OR location LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY asset_code ASC';
  const assets = all(sql, params);

  // Compute live failure risk for each asset for display
  const enriched = assets.map(a => {
    const installDate = new Date(a.installation_date || '2022-01-01');
    const ageYears = Math.max(0.5, (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25));

    const lastMaintDate = new Date(a.last_maintenance || '2025-01-01');
    const daysSinceMaint = Math.max(0, Math.floor((new Date() - lastMaintDate) / (1000 * 60 * 60 * 24)));

    const pred = predictFailureRisk({
      asset_age_years: ageYears,
      previous_failures: a.previous_failures || 0,
      days_since_maintenance: daysSinceMaint,
      usage_hours_day: a.usage_hours_day || 8.0,
      asset_type: a.asset_type,
      criticality: a.criticality
    });

    return {
      ...a,
      age_years: parseFloat(ageYears.toFixed(1)),
      days_since_maintenance: daysSinceMaint,
      predicted_failure_risk: pred.failure_probability,
      risk_level: pred.risk_level
    };
  });

  res.json(enriched);
});

// GET /api/assets/:id
router.get('/:id', (req, res) => {
  const asset = get('SELECT * FROM assets WHERE asset_id = ? OR asset_code = ?', [req.params.id, req.params.id]);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // Get historical maintenance records
  const history = all('SELECT * FROM maintenance_history WHERE asset_id = ? ORDER BY event_date DESC', [asset.asset_id]);

  // Get past and current requests
  const requests = all('SELECT * FROM maintenance_requests WHERE asset_id = ? ORDER BY created_at DESC', [asset.asset_id]);

  // Compute prediction
  const installDate = new Date(asset.installation_date || '2022-01-01');
  const ageYears = Math.max(0.5, (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25));

  const lastMaintDate = new Date(asset.last_maintenance || '2025-01-01');
  const daysSinceMaint = Math.max(0, Math.floor((new Date() - lastMaintDate) / (1000 * 60 * 60 * 24)));

  const complaints30d = requests.filter(r => {
    const diffDays = (new Date() - new Date(r.created_at)) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  const prediction = predictFailureRisk({
    asset_age_years: ageYears,
    previous_failures: asset.previous_failures || 0,
    days_since_maintenance: daysSinceMaint,
    complaints_30d: complaints30d,
    usage_hours_day: asset.usage_hours_day || 8.0,
    asset_type: asset.asset_type,
    criticality: asset.criticality
  });

  res.json({
    ...asset,
    age_years: parseFloat(ageYears.toFixed(1)),
    days_since_maintenance: daysSinceMaint,
    complaints_30d: complaints30d,
    prediction,
    history,
    requests
  });
});

// GET /api/assets/:id/predict
router.get('/:id/predict', (req, res) => {
  const asset = get('SELECT * FROM assets WHERE asset_id = ?', [req.params.id]);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  const installDate = new Date(asset.installation_date || '2022-01-01');
  const ageYears = Math.max(0.5, (new Date() - installDate) / (1000 * 60 * 60 * 24 * 365.25));

  const lastMaintDate = new Date(asset.last_maintenance || '2025-01-01');
  const daysSinceMaint = Math.max(0, Math.floor((new Date() - lastMaintDate) / (1000 * 60 * 60 * 24)));

  const prediction = predictFailureRisk({
    asset_age_years: ageYears,
    previous_failures: asset.previous_failures || 0,
    days_since_maintenance: daysSinceMaint,
    usage_hours_day: asset.usage_hours_day || 8.0,
    asset_type: asset.asset_type,
    criticality: asset.criticality
  });

  res.json(prediction);
});

// POST /api/assets
router.post('/', (req, res) => {
  const {
    asset_code,
    asset_name,
    asset_type,
    building,
    location,
    installation_date,
    status = 'Operational',
    last_maintenance,
    usage_hours_day = 8.0,
    criticality = 'Medium',
    previous_failures = 0
  } = req.body;

  if (!asset_code || !asset_name || !asset_type || !building || !location) {
    return res.status(400).json({ error: 'Missing required asset fields' });
  }

  const existing = get('SELECT asset_id FROM assets WHERE asset_code = ?', [asset_code]);
  if (existing) {
    return res.status(409).json({ error: 'Asset code already exists' });
  }

  const assetId = `ast-${uuidv4().substring(0, 8)}`;
  run(
    `INSERT INTO assets (asset_id, asset_code, asset_name, asset_type, building, location, installation_date, status, last_maintenance, usage_hours_day, criticality, previous_failures)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [assetId, asset_code, asset_name, asset_type, building, location, installation_date || '2024-01-01', status, last_maintenance || '2024-01-01', usage_hours_day, criticality, previous_failures]
  );

  const newAsset = get('SELECT * FROM assets WHERE asset_id = ?', [assetId]);
  res.status(201).json(newAsset);
});

// PUT /api/assets/:id
router.put('/:id', (req, res) => {
  const {
    asset_name,
    asset_type,
    building,
    location,
    status,
    last_maintenance,
    usage_hours_day,
    criticality,
    previous_failures
  } = req.body;

  const asset = get('SELECT * FROM assets WHERE asset_id = ?', [req.params.id]);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  run(
    `UPDATE assets SET 
      asset_name = COALESCE(?, asset_name),
      asset_type = COALESCE(?, asset_type),
      building = COALESCE(?, building),
      location = COALESCE(?, location),
      status = COALESCE(?, status),
      last_maintenance = COALESCE(?, last_maintenance),
      usage_hours_day = COALESCE(?, usage_hours_day),
      criticality = COALESCE(?, criticality),
      previous_failures = COALESCE(?, previous_failures)
     WHERE asset_id = ?`,
    [asset_name, asset_type, building, location, status, last_maintenance, usage_hours_day, criticality, previous_failures, req.params.id]
  );

  const updated = get('SELECT * FROM assets WHERE asset_id = ?', [req.params.id]);
  res.json(updated);
});

module.exports = router;
