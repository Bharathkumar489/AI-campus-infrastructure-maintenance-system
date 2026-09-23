-- AI-Based Campus Infrastructure Maintenance System Schema
-- Conforming to System Specification Report (Table 6, Table 7, Appendix B)

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('requester', 'admin', 'technician', 'management')),
  department TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id TEXT PRIMARY KEY,
  asset_code TEXT UNIQUE NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  building TEXT NOT NULL,
  location TEXT NOT NULL,
  installation_date DATE NOT NULL,
  status TEXT DEFAULT 'Operational' CHECK (status IN ('Operational', 'Under Maintenance', 'Degraded', 'Out of Order')),
  last_maintenance DATE,
  usage_hours_day REAL DEFAULT 8.0,
  criticality TEXT DEFAULT 'Medium' CHECK (criticality IN ('Low', 'Medium', 'High', 'Critical')),
  previous_failures INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  request_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  asset_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  image_url TEXT,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN (
    'SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'ACCEPTED', 
    'IN PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED', 'REJECTED'
  )),
  failure_probability REAL DEFAULT 0.0,
  risk_level TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  priority_score REAL DEFAULT 0.0,
  priority_level TEXT DEFAULT 'LOW' CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  model_version TEXT DEFAULT 'v1.0.0-rf',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  closed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  prediction_id TEXT PRIMARY KEY,
  request_id TEXT,
  asset_id TEXT NOT NULL,
  failure_probability REAL NOT NULL,
  risk_level TEXT NOT NULL,
  priority_score REAL,
  feature_signals TEXT,
  model_version TEXT NOT NULL,
  predicted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(request_id),
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE IF NOT EXISTS technicians (
  technician_id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  skill TEXT NOT NULL,
  secondary_skills TEXT,
  availability TEXT DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'On Leave')),
  workload INTEGER DEFAULT 0,
  contact TEXT,
  rating REAL DEFAULT 4.8,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  assignment_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  technician_id TEXT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  remarks TEXT,
  evidence_image_url TEXT,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(request_id),
  FOREIGN KEY (technician_id) REFERENCES technicians(technician_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  request_id TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO',
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(request_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(request_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS maintenance_history (
  history_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  request_id TEXT,
  event_type TEXT NOT NULL,
  remarks TEXT,
  parts_replaced TEXT,
  technician_name TEXT,
  event_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(request_id)
);

CREATE TABLE IF NOT EXISTS model_versions (
  model_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  algorithm TEXT DEFAULT 'Random Forest Classifier',
  accuracy REAL,
  precision REAL,
  recall REAL,
  f1_score REAL,
  roc_auc REAL,
  dataset_version TEXT,
  training_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1
);
