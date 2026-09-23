const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../db/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // If technician, attach technician record
  let technician = null;
  if (user.role === 'technician') {
    technician = get('SELECT * FROM technicians WHERE user_id = ?', [user.user_id]);
  }

  const { password_hash, ...safeUser } = user;
  res.json({
    token: `jwt-token-${user.user_id}-${Date.now()}`,
    user: {
      ...safeUser,
      technician_id: technician ? technician.technician_id : null
    }
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'requester', department, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = get('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const userId = `usr-${uuidv4().substring(0, 8)}`;
  const passwordHash = bcrypt.hashSync(password, 8);

  run(
    `INSERT INTO users (user_id, name, email, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, email, passwordHash, role, department || 'General Campus', phone || '']
  );

  const newUser = get('SELECT user_id, name, email, role, department, phone, created_at FROM users WHERE user_id = ?', [userId]);
  res.status(201).json({
    token: `jwt-token-${userId}-${Date.now()}`,
    user: newUser
  });
});

// GET /api/auth/users
router.get('/users', (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT user_id, name, email, role, department, phone FROM users';
  const params = [];
  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }
  const users = all(sql, params);
  res.json(users);
});

module.exports = router;
