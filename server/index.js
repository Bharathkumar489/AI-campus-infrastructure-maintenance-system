const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB } = require('./db/database');
const { seedDatabase } = require('./db/seed');

const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const requestsRoutes = require('./routes/requests');
const assignmentsRoutes = require('./routes/assignments');
const techniciansRoutes = require('./routes/technicians');
const feedbackRoutes = require('./routes/feedback');
const notificationsRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const mlRoutes = require('./routes/ml');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health Check (Section 32, Table 7)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Based Campus Infrastructure Maintenance Backend API',
    version: '1.0.0'
  });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Based Campus Infrastructure Maintenance Backend API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/technicians', techniciansRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', mlRoutes); // /predict, /classify, /priority, /model-info

// Serve client build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize database and start server
async function start() {
  try {
    await initDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`================================================================`);
      console.log(`AI-Based Campus Infrastructure Maintenance System API running!`);
      console.log(`Listening on http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`================================================================`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

start();
