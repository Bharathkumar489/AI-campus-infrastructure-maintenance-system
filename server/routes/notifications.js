const express = require('express');
const router = express.Router();
const { all, get, run } = require('../db/database');

// GET /api/notifications
router.get('/', (req, res) => {
  const { user_id } = req.query;
  let sql = 'SELECT * FROM notifications';
  const params = [];

  if (user_id) {
    sql += ' WHERE user_id = ?';
    params.push(user_id);
  }

  sql += ' ORDER BY created_at DESC LIMIT 50';
  const notifications = all(sql, params);
  res.json(notifications);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res) => {
  run('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [req.params.id]);
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', (req, res) => {
  const { user_id } = req.body;
  if (user_id) {
    run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id]);
  } else {
    run('UPDATE notifications SET is_read = 1');
  }
  res.json({ success: true });
});

module.exports = router;
