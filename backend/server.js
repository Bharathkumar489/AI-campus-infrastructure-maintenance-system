const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

// Middle tier imports from ../middle
const { requestLogger, errorHandler } = require('../middle');

// API tier router from ../api
const apiRouter = require('../api');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve uploaded static assets (defect photos, technician proof of work)
const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Health Checks (Section 32, Table 7)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Based Campus Infrastructure Maintenance Backend API',
    tier: 'Backend Server',
    version: '1.0.0'
  });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Based Campus Infrastructure Maintenance Backend API',
    tier: 'Backend Server',
    version: '1.0.0'
  });
});

// Mount Entire API Tier (/api/*)
app.use('/api', apiRouter);

// Serve Frontend client build if available
const frontendDistPath = fs.existsSync(path.resolve(__dirname, '../frontend/dist'))
  ? path.resolve(__dirname, '../frontend/dist')
  : path.resolve(__dirname, '../client/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// Error Handling Middlewares
app.use(errorHandler);

module.exports = app;
