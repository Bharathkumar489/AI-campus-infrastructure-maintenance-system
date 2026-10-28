const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { all, get, run } = require('../backend/db/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const identifier = (req.body.username || req.body.login_id || req.body.email || req.body.name || req.body.registration_no || '').trim();
  const password = (req.body.password || '').trim();

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Registration No and password are required' });
  }

  // Lookup user by email, registration_no, name (case-insensitive), or user_id
  const user = get(
    `SELECT * FROM users WHERE 
      LOWER(email) = LOWER(?) OR 
      LOWER(registration_no) = LOWER(?) OR 
      LOWER(name) = LOWER(?) OR 
      LOWER(user_id) = LOWER(?) OR
      LOWER(name) LIKE LOWER(?) || '%' OR
      LOWER(name) LIKE '%' || LOWER(?) || '%'`, 
    [identifier, identifier, identifier, identifier, identifier, identifier]
  );

  if (!user) {
    return res.status(401).json({ 
      error: 'Access denied: User not found. Only authorized campus users (Students, Faculty, and Technicians) can log in.' 
    });
  }

  // Validate password against registration number (bcrypt hash or exact string)
  let isValid = false;
  try {
    isValid = bcrypt.compareSync(password, user.password_hash);
  } catch (e) {
    isValid = false;
  }

  if (!isValid && user.registration_no && password.toLowerCase() === user.registration_no.toLowerCase()) {
    isValid = true;
  }

  if (!isValid) {
    return res.status(401).json({ 
      error: `Invalid password for ${user.name}. Password is your institutional Registration Number (${user.registration_no}).` 
    });
  }

  // If technician, attach technician record
  let technician = null;
  if (user.role === 'technician') {
    technician = get('SELECT * FROM technicians WHERE user_id = ? OR name = ?', [user.user_id, user.name]);
  }

  const { password_hash, ...safeUser } = user;
  res.json({
    token: `jwt-token-${user.user_id}-${Date.now()}`,
    user: {
      ...safeUser,
      login_id: user.name, // Display User ID as their Name
      technician_id: technician ? technician.technician_id : null
    }
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'requester', department, phone, registration_no } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = get('SELECT user_id FROM users WHERE email = ? OR registration_no = ?', [email, registration_no || '']);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email or registration number already exists' });
  }

  const userId = name.replace(/\s+/g, '');
  const passwordHash = bcrypt.hashSync(password, 8);

  run(
    `INSERT INTO users (user_id, name, email, password_hash, role, department, phone, registration_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, email, passwordHash, role, department || 'General Campus', phone || '', registration_no || null]
  );

  const newUser = get('SELECT user_id, name, email, role, department, phone, registration_no, created_at FROM users WHERE user_id = ?', [userId]);
  res.status(201).json({
    token: `jwt-token-${userId}-${Date.now()}`,
    user: {
      ...newUser,
      login_id: newUser.name
    }
  });
});

// GET /api/auth/users
router.get('/users', (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT user_id, name, email, role, department, phone, registration_no FROM users';
  let params = [];
  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }
  const users = all(sql, params);
  res.json(users);
});

module.exports = router;
