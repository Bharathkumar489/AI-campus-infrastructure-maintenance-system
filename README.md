# AI-Based Campus Infrastructure Maintenance System
> **AI-Powered Predictive Campus Infrastructure Maintenance and Management System**  
> Department of Computer Science and Business Systems • Academic Year 2026–2027

---

## 📌 Project Overview

Large educational campuses contain hundreds or thousands of infrastructure assets such as air conditioners, electrical panels, water booster pumps, plumbing systems, passenger elevators, classroom projectors, CCTV security networks, and laboratory fume hoods. Conventional maintenance processes are largely **reactive**: equipment breaks down, a complaint is manually filed, and repairs are made only after operational disruption has occurred.

This system provides a centralized digital platform that links maintenance complaints to asset-level telemetry and historical records. It uses a **Random Forest Ensemble Model** to forecast the 30-day failure probability of infrastructure assets, combines predicted risk with severity and location criticality using an **Operational Priority Engine**, automatically matches work orders to qualified technicians via a **Smart Assignment Engine**, and tracks the full repair lifecycle through completion and verification.

---

## 📂 Multi-Tier Folder Architecture

The project is structured into 4 decoupled, easy-to-visualize architectural tiers:

```
UM/
├── frontend/               # 🎨 1. Presentation Tier (React 18, Vite, Tailwind CSS)
│   ├── src/                # VTOP Portal, Login, Views, Context, Components
│   ├── public/             # Static institutional assets, logos
│   └── package.json        # Frontend dependencies & build scripts
│
├── middle/                 # ⚙️ 2. Middleware Pipeline (Request security & processing)
│   ├── authMiddleware.js   # JWT token verification & Role-Based Access Control
│   ├── uploadMiddleware.js # Multer image sanitization & 10MB limit enforcement
│   ├── validateMiddleware.js # Input payload verification (tickets, ratings)
│   ├── errorMiddleware.js  # Centralized error handler & JSON formatting
│   ├── loggerMiddleware.js # HTTP request telemetry & timing logger
│   └── index.js            # Combined middleware export
│
├── api/                    # 🔌 3. API Tier (REST Controllers & Route Definitions)
│   ├── auth.js             # User authentication (/api/auth/login, /register)
│   ├── requests.js         # Maintenance tickets (create, update, delete, upvote)
│   ├── assets.js           # Campus equipment inventory & health telemetry
│   ├── assignments.js      # Technician work order dispatch
│   ├── technicians.js      # Field staff roster & availability management
│   ├── feedback.js         # 5-star ratings & user verification feedback
│   ├── notifications.js    # System alert notifications
│   ├── analytics.js        # KPI summary metrics & failure charts
│   ├── ml.js               # ML predictions & NLP category classification
│   └── index.js            # Master Express router mounting all /api endpoints
│
└── backend/                # 🖥️ 4. Backend Server Tier (Server setup, DB & ML Engine)
    ├── db/                 # SQLite database (sql.js), schema.sql, seed.js
    ├── ml/                 # Random Forest failure models & priority engine
    ├── uploads/            # Defect photos & work order completion evidence
    ├── server.js           # Express application configuration & tier binding
    ├── index.js            # Main backend server entry point (Port 5000)
    └── test_all.js         # Automated 16/16 test case verification suite
```

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. FRONTEND TIER (frontend/)                    │
│       Student / Faculty        Admin Console        Field Technician   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST / Multipart HTTP
┌────────────────────────────────────▼───────────────────────────────────┐
│                        2. MIDDLE TIER (middle/)                        │
│   Request Logger • JWT & RBAC Auth • Multer Image Upload • Validation  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Filtered & Verified Requests
┌────────────────────────────────────▼───────────────────────────────────┐
│                        3. API TIER (api/)                              │
│   Auth • Requests • Assets • Assignments • Technicians • Feedback • ML │
└───────────────┬────────────────────┬────────────────────┬──────────────┘
                │                    │                    │
┌───────────────▼────────┐  ┌────────▼─────────┐  ┌───────▼──────────────┐
│  4. BACKEND & ML TIER  │  │    DATA LAYER    │  │ ANALYTICS & REPORTS  │
│ • Random Forest 30d RF │  │ • Users & Roles  │  │ • MTTR & SLA Trends  │
│ • Priority Engine      │  │ • Assets & History│ │ • Risk Distribution  │
│ • NLP Problem Classif. │  │ • Work Orders    │  │ • Workload Heatmaps  │
│ • Technician Matcher   │  │ • SQLite DB file │  │ • CSV / PDF Reports  │
└────────────────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## 🚀 Quick Start Instructions

### 1. Requirements
- Node.js (v18 or higher)
- Web Browser (Chrome, Edge, Firefox)

### 2. Available Commands
```bash
# Start the full application backend server & interface
npm start

# Run the backend server directly
npm run backend

# Run the frontend development server
npm run frontend

# Build production bundle
npm run build

# Run automated system verification test suite (16/16 Test Cases)
npm test
```

### 3. One-Click Windows Launch
Simply double-click **`run.bat`** to start the backend server and automatically open the application at **[http://localhost:5000](http://localhost:5000)**.

---

## 👥 Multi-Role User Personas & Test Credentials

The system includes pre-registered student and administrator accounts with one-click quick selection on the login page:

| Role | Name (User Name) | Registration No. (Password) | User ID | Responsibilities |
|---|---|---|---|---|
| **Student** | **Bharath** | **`24bcb7220`** | `usr-stu-24bcb7220` | Submit complaints, upload defect photos, track tickets, rate repairs. |
| **Student** | **Abhiram** | **`24bcb7251`** | `usr-stu-24bcb7251` | Submit complaints, view status, upvote campus defects. |
| **Student** | **Aaron** | **`24bcb7053`** | `usr-stu-24bcb7053` | Departmental defect reporting, track resolution times. |
| **Student** | **Balaji** | **`24bcb7266`** | `usr-stu-24bcb7266` | Classroom & lab equipment issue reporting. |
| **Admin & Student** | **Koushik** | **`24bcb7230`** | `usr-admin-24bcb7230` | Triage queue, AI failure inspection, technician dispatch desk. |

*(Demo faculty `STF8820` and technician `TECH01` passwords are `password123`)*

---

## 🧪 Appendix C: End-to-End Walkthrough Scenario

You can test the exact benchmark scenario described in **Appendix C** of the project report:

1. **Submit Request**:
   - Switch role to **Student / Requester**.
   - Navigate to **Submit Complaint**.
   - Click the **"Autofill Scenario"** button at the top (or select asset `AC-BLOCKA-203`).
   - Notice the AI text assistant automatically flags category as **HVAC** and recommends an **HVAC Technician**.
   - Submit the ticket.
2. **AI Failure & Priority Calculation**:
   - The Random Forest engine evaluates the asset telemetry: 5.2 years old, 4 previous failure events, 210 days since last service, daily duty cycle of 12 hrs/day.
   - The model computes an **87% failure probability** (`HIGH` risk band).
   - The Priority Engine calculates the operational priority score:
     $$\text{Priority} = 0.4(80) + 0.3(87) + 0.2(70) + 0.1(80) = 80.1 \implies \text{CRITICAL}$$
3. **Smart Technician Dispatch**:
   - Switch role to **Administrator** and open **Request Queue**.
   - Click **Assign** on the critical request.
   - The Smart Matcher evaluates skills, availability, and active workload, recommending **Rajesh Kumar (HVAC Lead)** with a 100/100 match score. Confirm dispatch.
4. **Technician Repair Execution**:
   - Switch role to **Field Technician**.
   - View the new task under **Assigned Tasks**.
   - Click **Accept Work Order** $\rightarrow$ Click **Begin Work (On-Site)**.
   - Click **Complete & Submit Evidence**, enter repair notes, upload proof, and submit.
5. **Requester Verification & Feedback**:
   - Switch back to **Student / Requester**.
   - Open the ticket under **My Requests**.
   - Verify the repair and submit a **5-star rating** with comments.
   - The ticket transitions to `CLOSED` and is preserved in the asset's permanent maintenance history.

---

## 🧮 Mathematical Formulations

### 1. Operational Priority Score Formula (Section 26)
$$\text{Priority Score} = 0.4 \times \text{Severity} + 0.3 \times \text{Failure Risk} + 0.2 \times \text{Complaint Frequency} + 0.1 \times \text{Location Criticality}$$
- **Severity (0–100)**: Normalized from reported 1–5 scale ($S \times 20$).
- **Failure Risk (0–100)**: Probability output from the Random Forest model ($P \times 100$).
- **Complaint Frequency (0–100)**: Frequency of complaints regarding the asset in the past 30 days ($0 \rightarrow 10, 1 \rightarrow 40, 2 \rightarrow 70, \ge 3 \rightarrow 95$).
- **Location Criticality (0–100)**: $\text{Low} = 25, \text{Medium} = 50, \text{High} = 80, \text{Critical} = 100$.

### 2. Risk Level Bands (Section 25)
- **LOW Risk**: $0\% - 39\%$ (Nominal state; standard monitoring)
- **MEDIUM Risk**: $40\% - 69\%$ (Inspect history; schedule preventive servicing)
- **HIGH Risk**: $70\% - 100\%$ (Immediate review and corrective maintenance required)
