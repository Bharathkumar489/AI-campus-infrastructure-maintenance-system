const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initDB, run, all, exec } = require('./database');
const { predictFailureRisk } = require('../ml/failurePredictor');
const { calculatePriority } = require('../ml/priorityEngine');

async function seedDatabase() {
  await initDB();

  // Read schema.sql and execute
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  exec(schemaSql);

  console.log('Schema verified. Checking existing seed data...');

  const existingUsers = all('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  console.log('Seeding campus maintenance database...');

  const passwordHash = bcrypt.hashSync('campus123', 8);

  // 1. Seed Users
  const users = [
    { id: 'usr-admin-1', name: 'Dr. Sarah Jenkins', email: 'admin@campus.edu', role: 'admin', dept: 'Facilities & Estate Office', phone: '+91 98765 43210' },
    { id: 'usr-student-1', name: 'Rohan Sharma', email: 'student@campus.edu', role: 'requester', dept: 'Computer Science & Business Systems', phone: '+91 98765 11111' },
    { id: 'usr-faculty-1', name: 'Prof. Ananya Roy', email: 'faculty@campus.edu', role: 'requester', dept: 'Computer Science & Engineering', phone: '+91 98765 22222' },
    { id: 'usr-staff-1', name: 'Kavita Sundaram', email: 'staff@campus.edu', role: 'requester', dept: 'Library Administration', phone: '+91 98765 33333' },
    { id: 'usr-tech-1', name: 'Rajesh Kumar', email: 'tech.rajesh@campus.edu', role: 'technician', dept: 'HVAC Services', phone: '+91 98765 44441' },
    { id: 'usr-tech-2', name: 'Vikram Patel', email: 'tech.vikram@campus.edu', role: 'technician', dept: 'Electrical Engineering Division', phone: '+91 98765 44442' },
    { id: 'usr-tech-3', name: 'Suresh Reddy', email: 'tech.suresh@campus.edu', role: 'technician', dept: 'Plumbing & Water Works', phone: '+91 98765 44443' },
    { id: 'usr-tech-4', name: 'Anil Verma', email: 'tech.anil@campus.edu', role: 'technician', dept: 'Civil Infrastructure & Carpentry', phone: '+91 98765 44444' },
    { id: 'usr-tech-5', name: 'Deepak Joshi', email: 'tech.deepak@campus.edu', role: 'technician', dept: 'Security & CCTV Systems', phone: '+91 98765 44445' },
    { id: 'usr-mgmt-1', name: 'Dr. K. Ramanathan', email: 'director@campus.edu', role: 'management', dept: 'Office of the Director', phone: '+91 98765 99999' }
  ];

  for (const u of users) {
    run(
      `INSERT INTO users (user_id, name, email, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, passwordHash, u.role, u.dept, u.phone]
    );
  }

  // 2. Seed Technicians
  const technicians = [
    { id: 'T01', user_id: 'usr-tech-1', name: 'Rajesh Kumar', skill: 'HVAC Maintenance', sec: 'Electrical, Ventilation', avail: 'Available', workload: 1, contact: '+91 98765 44441', rating: 4.85 },
    { id: 'T02', user_id: 'usr-tech-2', name: 'Vikram Patel', skill: 'Electrical Maintenance', sec: 'Elevators, Panels, Generators', avail: 'Busy', workload: 3, contact: '+91 98765 44442', rating: 4.92 },
    { id: 'T03', user_id: 'usr-tech-3', name: 'Suresh Reddy', skill: 'Plumbing & Water Systems', sec: 'Sewage Pumps, Drainage', avail: 'Available', workload: 0, contact: '+91 98765 44443', rating: 4.78 },
    { id: 'T04', user_id: 'usr-tech-4', name: 'Anil Verma', skill: 'Civil Maintenance & Masonry', sec: 'Carpentry, Furniture Repair', avail: 'Available', workload: 1, contact: '+91 98765 44444', rating: 4.65 },
    { id: 'T05', user_id: 'usr-tech-5', name: 'Deepak Joshi', skill: 'Security & Access Systems', sec: 'CCTV, Biometrics, IT Networks', avail: 'Available', workload: 1, contact: '+91 98765 44445', rating: 4.90 }
  ];

  for (const t of technicians) {
    run(
      `INSERT INTO technicians (technician_id, user_id, name, skill, secondary_skills, availability, workload, contact, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.user_id, t.name, t.skill, t.sec, t.avail, t.workload, t.contact, t.rating]
    );
  }

  // 3. Seed Assets (conforming to sample scenario in Appendix C & typical campus assets)
  const assets = [
    {
      id: 'ast-001',
      code: 'AC-BLOCKA-203',
      name: 'Split AC 2.0 Ton (Daikin Inverter)',
      type: 'HVAC',
      building: 'Block A',
      location: 'Block A / Room 203 (Computing Lab 1)',
      installation_date: '2021-06-15',
      status: 'Operational',
      last_maintenance: '2026-01-12',
      usage_hours: 12.0,
      criticality: 'High',
      previous_failures: 4
    },
    {
      id: 'ast-002',
      code: 'AC-BLOCKB-101',
      name: 'Cassette AC 3.0 Ton (Voltas)',
      type: 'HVAC',
      building: 'Block B',
      location: 'Block B / Seminar Hall 1',
      installation_date: '2022-03-20',
      status: 'Operational',
      last_maintenance: '2026-07-10',
      usage_hours: 6.0,
      criticality: 'Medium',
      previous_failures: 1
    },
    {
      id: 'ast-003',
      code: 'PANEL-MAIN-A',
      name: 'Main 415V LT Distribution Switchboard',
      type: 'Electrical',
      building: 'Block A',
      location: 'Block A / Ground Floor Electrical Room',
      installation_date: '2019-08-10',
      status: 'Operational',
      last_maintenance: '2026-05-15',
      usage_hours: 24.0,
      criticality: 'Critical',
      previous_failures: 2
    },
    {
      id: 'ast-004',
      code: 'PUMP-HYDRO-01',
      name: 'High Pressure Water Booster Pump (Kirloskar 7.5HP)',
      type: 'Plumbing',
      building: 'Boys Hostel',
      location: 'Pump House 1 / Basement',
      installation_date: '2020-11-05',
      status: 'Operational',
      last_maintenance: '2025-11-20',
      usage_hours: 15.0,
      criticality: 'High',
      previous_failures: 5
    },
    {
      id: 'ast-005',
      code: 'ELEV-BLOCKC-01',
      name: 'Passenger Elevator 8-Person (Otis)',
      type: 'Elevator',
      building: 'Block C',
      location: 'Block C / Central Shaft',
      installation_date: '2022-01-10',
      status: 'Operational',
      last_maintenance: '2026-08-01',
      usage_hours: 14.0,
      criticality: 'High',
      previous_failures: 2
    },
    {
      id: 'ast-006',
      code: 'CCTV-MAIN-GATE',
      name: 'PTZ 4K Night Vision Security Camera (Hikvision)',
      type: 'Security/CCTV',
      building: 'Main Gate',
      location: 'Campus Security Station Gate 1',
      installation_date: '2023-04-12',
      status: 'Operational',
      last_maintenance: '2026-06-25',
      usage_hours: 24.0,
      criticality: 'Critical',
      previous_failures: 0
    },
    {
      id: 'ast-007',
      code: 'LAB-HOOD-CHEM-03',
      name: 'Exhaust Fume Hood System (Biobase 1500)',
      type: 'Lab Equipment',
      building: 'Block B',
      location: 'Block B / Chemistry Research Lab 304',
      installation_date: '2021-02-18',
      status: 'Operational',
      last_maintenance: '2026-02-14',
      usage_hours: 8.0,
      criticality: 'Critical',
      previous_failures: 3
    },
    {
      id: 'ast-008',
      code: 'FAN-LIBRARY-NORTH',
      name: 'Industrial BLDC High-Airflow Ceiling Fan',
      type: 'Electrical',
      building: 'Main Library',
      location: 'Central Library / North Reading Hall',
      installation_date: '2023-01-15',
      status: 'Operational',
      last_maintenance: '2026-05-10',
      usage_hours: 14.0,
      criticality: 'Low',
      previous_failures: 1
    },
    {
      id: 'ast-009',
      code: 'DESK-AUD-ROW-E',
      name: 'Integrated Auditorium Tiered Desks & Chairs',
      type: 'Furniture',
      building: 'Auditorium',
      location: 'Main Auditorium / Row E Seats 10-25',
      installation_date: '2022-07-01',
      status: 'Operational',
      last_maintenance: '2025-10-15',
      usage_hours: 6.0,
      criticality: 'Low',
      previous_failures: 2
    },
    {
      id: 'ast-010',
      code: 'ROOF-BLOCKB-TERRACE',
      name: 'Waterproofing Membrane & Rain Drainage Parapet',
      type: 'Civil',
      building: 'Block B',
      location: 'Block B / Terrace East Wing',
      installation_date: '2019-05-10',
      status: 'Degraded',
      last_maintenance: '2025-07-20',
      usage_hours: 24.0,
      criticality: 'Medium',
      previous_failures: 3
    }
  ];

  for (const a of assets) {
    run(
      `INSERT INTO assets (asset_id, asset_code, asset_name, asset_type, building, location, installation_date, status, last_maintenance, usage_hours_day, criticality, previous_failures)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.code, a.name, a.type, a.building, a.location, a.installation_date, a.status, a.last_maintenance, a.usage_hours, a.criticality, a.previous_failures]
    );
  }

  // 4. Seed Historical Maintenance Records
  const historyRecords = [
    { id: 'hst-001', asset_id: 'ast-001', event_type: 'Capacitor Replacement', remarks: 'Outdoor compressor fan capacitor replaced due to degraded cooling performance.', parts: 'Dual run capacitor 45+5 uF', tech: 'Rajesh Kumar', date: '2024-04-12 14:30:00' },
    { id: 'hst-002', asset_id: 'ast-001', event_type: 'Refrigerant Leak Repair', remarks: 'Braze flare nut connection leak and recharge 1.2kg R32 freon gas.', parts: 'R32 Refrigerant Gas, Copper Flare Joint', tech: 'Rajesh Kumar', date: '2024-10-05 11:15:00' },
    { id: 'hst-003', asset_id: 'ast-001', event_type: 'Filter & Coil Deep Clean', remarks: 'Cleaned choked indoor cooling evaporator coils and cleaned drain pan.', parts: 'Cleaning solvent spray', tech: 'Rajesh Kumar', date: '2025-05-18 09:40:00' },
    { id: 'hst-004', asset_id: 'ast-001', event_type: 'PCB Inverter Control Board Diagnostic', remarks: 'Reset error code E4 and replaced blower fan speed sensor.', parts: 'Hall sensor harness', tech: 'Rajesh Kumar', date: '2026-01-12 16:00:00' },
    { id: 'hst-005', asset_id: 'ast-004', event_type: 'Mechanical Seal Overhaul', remarks: 'Replaced leaking silicon carbide water seal and replaced bearings.', parts: 'Mechanical shaft seal, SKF 6205 bearing', tech: 'Suresh Reddy', date: '2025-11-20 15:20:00' },
    { id: 'hst-006', asset_id: 'ast-007', event_type: 'Exhaust Motor Replacement', remarks: 'Replaced burnt acid-resistant exhaust blower motor.', parts: '0.75kW Explosion-proof motor', tech: 'Vikram Patel', date: '2026-02-14 11:30:00' }
  ];

  for (const h of historyRecords) {
    run(
      `INSERT INTO maintenance_history (history_id, asset_id, event_type, remarks, parts_replaced, technician_name, event_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [h.id, h.asset_id, h.event_type, h.remarks, h.parts, h.tech, h.date]
    );
  }

  // 5. Seed Maintenance Requests
  // Request 1: The exact scenario from Appendix C!
  // "AC in Block A Room 203 is not cooling properly. The room is being used for a laboratory session. The unit has had two complaints in the last month."
  const req1Pred = predictFailureRisk({
    asset_age_years: 5.2,
    previous_failures: 4,
    days_since_maintenance: 210,
    maintenance_count_12m: 1,
    complaints_30d: 2,
    severity: 4,
    usage_hours_day: 12.0,
    asset_type: 'HVAC',
    criticality: 'High'
  });

  const req1Prio = calculatePriority({
    severity: 4,
    failure_probability: req1Pred.failure_probability,
    complaints_30d: 2,
    location_criticality: 'High'
  });

  run(
    `INSERT INTO maintenance_requests (request_id, user_id, asset_id, title, description, category, severity, image_url, location, status, failure_probability, risk_level, priority_score, priority_level, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'REQ-2026-001',
      'usr-student-1',
      'ast-001',
      'AC Not Cooling & High Compressor Vibration',
      'AC in Block A Room 203 is not cooling properly. The room is being used for an intensive laboratory session with 60 students. The unit has had repeated complaints in the last month.',
      'HVAC',
      4,
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60',
      'Block A / Room 203',
      'SUBMITTED',
      req1Pred.failure_probability,
      req1Pred.risk_level,
      req1Prio.priority_score,
      req1Prio.priority_level,
      '2026-09-12 10:15:00'
    ]
  );

  run(
    `INSERT INTO predictions (prediction_id, request_id, asset_id, failure_probability, risk_level, priority_score, feature_signals, model_version, predicted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'PRED-001',
      'REQ-2026-001',
      'ast-001',
      req1Pred.failure_probability,
      req1Pred.risk_level,
      req1Prio.priority_score,
      JSON.stringify(req1Pred.feature_signals),
      'v1.0.0-rf',
      '2026-09-12 10:15:02'
    ]
  );

  // Request 2: Plumbing Issue in Boys Hostel
  run(
    `INSERT INTO maintenance_requests (request_id, user_id, asset_id, title, description, category, severity, image_url, location, status, failure_probability, risk_level, priority_score, priority_level, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'REQ-2026-002',
      'usr-student-1',
      'ast-004',
      'Booster Pump Leaking Water in Basement',
      'Main water booster pump is heavily spraying water from the pump shaft gland. Risk of water pooling near the electrical conduit.',
      'Plumbing',
      5,
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=60',
      'Boys Hostel / Pump House Basement',
      'ASSIGNED',
      0.82,
      'HIGH',
      88.4,
      'CRITICAL',
      '2026-09-12 08:30:00'
    ]
  );

  run(
    `INSERT INTO assignments (assignment_id, request_id, technician_id, assigned_at, remarks)
     VALUES (?, ?, ?, ?, ?)`,
    ['ASN-001', 'REQ-2026-002', 'T03', '2026-09-12 09:00:00', 'Assigned to Suresh Reddy. Urgent containment of water leakage.']
  );

  // Request 3: Main Electrical Panel in Progress
  run(
    `INSERT INTO maintenance_requests (request_id, user_id, asset_id, title, description, category, severity, image_url, location, status, failure_probability, risk_level, priority_score, priority_level, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'REQ-2026-003',
      'usr-faculty-1',
      'ast-003',
      'Intermittent humming sound and burning odor from LT Panel',
      'Main distribution board in Block A ground floor is making an abnormal buzzing sound during peak lab hours.',
      'Electrical',
      4,
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60',
      'Block A / Ground Floor Electrical Room',
      'IN PROGRESS',
      0.74,
      'HIGH',
      81.2,
      'CRITICAL',
      '2026-09-11 14:00:00'
    ]
  );

  run(
    `INSERT INTO assignments (assignment_id, request_id, technician_id, assigned_at, accepted_at, started_at, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['ASN-002', 'REQ-2026-003', 'T02', '2026-09-11 14:15:00', '2026-09-11 14:20:00', '2026-09-11 14:30:00', 'Inspecting busbar connections with thermal imaging camera.']
  );

  // Request 4: Completed & Verified Request
  run(
    `INSERT INTO maintenance_requests (request_id, user_id, asset_id, title, description, category, severity, image_url, location, status, failure_probability, risk_level, priority_score, priority_level, created_at, completed_at, closed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'REQ-2026-004',
      'usr-staff-1',
      'ast-008',
      'Library Ceiling Fan Making Clicking Noise',
      'North reading hall ceiling fan regulator causes blade clicking noise disturbing students.',
      'Electrical',
      2,
      null,
      'Central Library / North Reading Hall',
      'CLOSED',
      0.22,
      'LOW',
      32.5,
      'LOW',
      '2026-09-08 11:00:00',
      '2026-09-08 15:30:00',
      '2026-09-08 16:45:00'
    ]
  );

  run(
    `INSERT INTO assignments (assignment_id, request_id, technician_id, assigned_at, accepted_at, started_at, completed_at, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['ASN-003', 'REQ-2026-004', 'T02', '2026-09-08 11:30:00', '2026-09-08 11:45:00', '2026-09-08 14:00:00', '2026-09-08 15:30:00', 'Tightened blade mount bracket bolts and balanced blades. Noise eliminated.']
  );

  run(
    `INSERT INTO feedback (feedback_id, request_id, user_id, rating, comments, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['FB-001', 'REQ-2026-004', 'usr-staff-1', 5, 'Quick response! The reading hall is quiet again. Excellent job by technician.', '2026-09-08 16:45:00']
  );

  // 6. Notifications
  const notifications = [
    { id: 'notif-001', user_id: 'usr-student-1', request_id: 'REQ-2026-001', msg: 'Your maintenance request for AC-BLOCKA-203 has been submitted. AI risk assessment: HIGH (87%).', type: 'INFO', read: 0 },
    { id: 'notif-002', user_id: 'usr-admin-1', request_id: 'REQ-2026-001', msg: 'New CRITICAL priority request submitted for AC-BLOCKA-203. Action recommended.', type: 'ALERT', read: 0 },
    { id: 'notif-003', user_id: 'usr-tech-3', request_id: 'REQ-2026-002', msg: 'You have been assigned to repair Booster Pump Leaking Water in Boys Hostel.', type: 'ASSIGNMENT', read: 0 }
  ];

  for (const n of notifications) {
    run(
      `INSERT INTO notifications (notification_id, user_id, request_id, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [n.id, n.user_id, n.request_id, n.msg, n.type, n.read]
    );
  }

  // 7. Seed Model Versions
  run(
    `INSERT INTO model_versions (model_id, version, algorithm, accuracy, precision, recall, f1_score, roc_auc, dataset_version, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'mod-v1',
      'v1.0.0-rf',
      'Random Forest Classifier (Ensemble 100 Trees)',
      0.894,
      0.872,
      0.915,
      0.893,
      0.942,
      'campus_maintenance_synthetic_v1',
      1
    ]
  );

  console.log('Database seeded successfully with realistic campus infrastructure records!');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Failed to seed database:', err);
    process.exit(1);
  });
}
