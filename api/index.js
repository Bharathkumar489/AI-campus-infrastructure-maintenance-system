const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const assetsRoutes = require('./assets');
const requestsRoutes = require('./requests');
const assignmentsRoutes = require('./assignments');
const techniciansRoutes = require('./technicians');
const feedbackRoutes = require('./feedback');
const notificationsRoutes = require('./notifications');
const analyticsRoutes = require('./analytics');
const mlRoutes = require('./ml');

// Mount individual domain API routers
router.use('/auth', authRoutes);
router.use('/assets', assetsRoutes);
router.use('/requests', requestsRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/technicians', techniciansRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', mlRoutes); // /classify, /priority, /model-info, /analyze-complaint

module.exports = router;
