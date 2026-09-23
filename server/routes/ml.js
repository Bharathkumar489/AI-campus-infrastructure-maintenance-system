const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { get, all } = require('../db/database');
const { predictFailureRisk } = require('../ml/failurePredictor');
const { calculatePriority } = require('../ml/priorityEngine');
const { classifyProblem } = require('../ml/textClassifier');
const { analyzeImage } = require('../ml/imageAnalyzer');
const { analyzeComplaint } = require('../ml/complaintAnalyzer');

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/analyze-complaint (Core AI: Find Equipment & Analyze Criticality from Text/Image)
router.post('/analyze-complaint', upload.single('image'), (req, res) => {
  try {
    const { title = '', description = '', location = '' } = req.body;
    const combinedText = `${title} ${description}`.trim();

    // Fetch all active campus assets for equipment matching
    const assets = all('SELECT * FROM assets');

    // Optional image defect analysis
    let imageAnalysis = null;
    if (req.file) {
      imageAnalysis = analyzeImage(req.file.path, req.file.originalname);
    }

    const analysis = analyzeComplaint({
      text: combinedText,
      location,
      imageAnalysis,
      allAssets: assets
    });

    res.json({
      success: true,
      ...analysis,
      image_analysis: imageAnalysis
    });
  } catch (err) {
    console.error('Complaint analysis error:', err);
    res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
});

// POST /api/predict
router.post('/predict', (req, res) => {
  try {
    const result = predictFailureRisk(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Prediction calculation failed', details: err.message });
  }
});

// POST /api/classify
router.post('/classify', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for classification' });
  }
  const result = classifyProblem(text);
  res.json(result);
});

// POST /api/priority
router.post('/priority', (req, res) => {
  try {
    const result = calculatePriority(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Priority calculation failed', details: err.message });
  }
});

// POST /api/analyze-image
router.post('/analyze-image', upload.single('image'), (req, res) => {
  const { category } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const result = analyzeImage(req.file.path, req.file.originalname, category);
  res.json(result);
});

// GET /api/model-info
router.get('/model-info', (req, res) => {
  const activeModel = get('SELECT * FROM model_versions WHERE active = 1 ORDER BY training_date DESC LIMIT 1');
  const allModels = all('SELECT * FROM model_versions ORDER BY training_date DESC');

  res.json({
    active_model: activeModel,
    all_models: allModels,
    architecture: {
      framework: 'CampusCare Deep Neural & Telemetry Engine',
      n_estimators: 100,
      criterion: 'gini',
      max_depth: 8,
      min_samples_split: 5,
      features: [
        'asset_age_years',
        'previous_failures',
        'days_since_maintenance',
        'maintenance_count_12m',
        'complaints_30d',
        'severity',
        'usage_hours_day',
        'asset_type',
        'criticality'
      ],
      target: 'failure_in_next_30_days (Binary: 0 or 1)'
    }
  });
});

module.exports = router;
