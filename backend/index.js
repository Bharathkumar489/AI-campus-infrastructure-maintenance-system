const app = require('./server');
const { initDB } = require('./db/database');
const { seedDatabase } = require('./db/seed');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    console.log('[Backend Server] Initializing SQLite database...');
    await initDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log('================================================================');
      console.log('  CAMPUS MAINTENANCE SYSTEM — MULTI-TIER ARCHITECTURE');
      console.log('================================================================');
      console.log(`  Frontend:        http://localhost:${PORT}`);
      console.log(`  API Endpoints:   http://localhost:${PORT}/api`);
      console.log(`  Health Check:    http://localhost:${PORT}/api/health`);
      console.log(`  Middle Tier:     Active (Auth, Upload, Validation, Logger)`);
      console.log(`  Backend Server:  Listening on Port ${PORT}`);
      console.log('================================================================');
    });
  } catch (err) {
    console.error('[Backend Server] Fatal startup error:', err);
    process.exit(1);
  }
}

start();
