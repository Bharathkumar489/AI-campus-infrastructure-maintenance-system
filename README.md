# AI-Based Campus Infrastructure Maintenance System
> **AI-Powered Predictive Campus Infrastructure Maintenance and Management System**  
> Department of Computer Science and Business Systems • Academic Year 2026–2027

---

## 📌 Project Overview

Large educational campuses contain hundreds or thousands of infrastructure assets such as air conditioners, electrical panels, water booster pumps, plumbing systems, passenger elevators, classroom projectors, CCTV security networks, and laboratory fume hoods. Conventional maintenance processes are largely **reactive**: equipment breaks down, a complaint is manually filed, and repairs are made only after operational disruption has occurred.

This system provides a centralized digital platform that links maintenance complaints to asset-level telemetry and historical records. It uses a **Random Forest Ensemble Model** to forecast the 30-day failure probability of infrastructure assets, combines predicted risk with severity and location criticality using an **Operational Priority Engine**, automatically matches work orders to qualified technicians via a **Smart Assignment Engine**, and tracks the full repair lifecycle through completion and verification.

---

## 👥 Authorized Login Accounts (User ID = Name)

**Only the following 11 registered accounts can log into the system:**

| Category | Role | User ID (Username) | Registration No. (Password) | Department / Specialization |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Student Requester | **`Bharath`** | **`24bcb7220`** | Computer Science & Engineering |
| **Student** | Student Requester | **`Abhiram`** | **`24bcb7251`** | Computer Science & Engineering |
| **Student** | Student Requester | **`Aaron`** | **`24bcb7053`** | Computer Science & Engineering |
| **Student** | Student Requester | **`Balaji`** | **`24bcb7266`** | Computer Science & Engineering |
| **Admin** | Campus Administrator | **`Koushik`** | **`24bcb7230`** | Facilities & Estate Office / Dispatch Desk |
| **Faculty** | Faculty Requester | **`Ananya`** | **`FAC10482`** | Computer Science & Engineering |
| **Faculty** | Faculty Requester | **`Arvind`** | **`FAC10835`** | Electronics & Communication Engineering |
| **Faculty** | Faculty Requester | **`Meera`** | **`FAC10964`** | Mechanical Engineering & Design |
| **Technician** | Field Technician (T01)| **`Rajesh`** | **`TECH2041`** | HVAC Services (AC / Ventilation) |
| **Technician** | Field Technician (T02)| **`Vikram`** | **`TECH2052`** | Electrical Engineering (Panels / Power) |
| **Technician** | Field Technician (T03)| **`Suresh`** | **`TECH2063`** | Plumbing & Water Works (Pumps / Pipes) |

*(All old dummy demo accounts have been deleted. Login is strictly restricted to the above 11 users.)*

---

## 📂 Multi-Tier Folder Architecture

The project is structured into 4 decoupled architectural layers:

```
UM/
├── frontend/                 # 🎨 1. Presentation Tier (React 18, Vite, Tailwind CSS)
│   ├── src/                  # VTOP Portal, Login, Views, Context, Components
│   └── package.json          # Frontend dependencies & build commands
│
├── middle/                   # ⚙️ 2. Middleware Pipeline (Request security & processing)
│   ├── authMiddleware.js     # JWT token verification & Role-Based Access Control
│   ├── uploadMiddleware.js   # Multer defect image sanitization & 10MB limit enforcement
│   ├── validateMiddleware.js # Input payload verification (tickets, ratings, assignments)
│   ├── errorMiddleware.js    # Centralized JSON error handling & 404 router
│   ├── loggerMiddleware.js   # HTTP request timing & telemetry logger
│   └── index.js              # Aggregated export of all middlewares
│
├── api/                      # 🔌 3. API Tier (REST Controllers & Route Definitions)
│   ├── auth.js               # POST /api/auth/login, /register, GET /users
│   ├── requests.js           # Maintenance complaints (CRUD, upvote, delete)
│   ├── assets.js             # Campus equipment inventory & health telemetry
│   ├── assignments.js        # Technician work order dispatch
│   ├── technicians.js        # Field staff roster & availability management
│   ├── feedback.js           # 5-star ratings & user verification feedback
│   ├── notifications.js      # System alert notifications
│   ├── analytics.js          # Executive KPI summary metrics & failure charts
│   ├── ml.js                 # ML predictions & NLP category classification
│   └── index.js              # Master router mounting all endpoints under /api
│
└── backend/                  # 🖥️ 4. Backend Server Tier (Server setup, DB & ML Engine)
    ├── db/                   # SQLite database (campus_maintenance.sqlite), schema, seed
    ├── ml/                   # Random Forest failure models & priority engine
    ├── uploads/              # Storage directory for defect evidence photos
    ├── server.js             # Express application configuration & tier binding
    ├── index.js              # Main backend server entry point (Port 5000)
    └── test_all.js           # Automated 16/16 test case verification suite
```

---

## 🚀 Quick Start Instructions

```bash
# Start backend server & frontend interface
npm start

# Run verification test suite (16/16 Test Cases)
npm test

# Build production bundle
npm run build
```

---

## 🧮 Mathematical Formulations

### Operational Priority Score Formula (Section 26)
$$\text{Priority Score} = 0.4 \times \text{Severity} + 0.3 \times \text{Failure Risk} + 0.2 \times \text{Complaint Frequency} + 0.1 \times \text{Location Criticality}$$
- **Severity (0–100)**: Normalized from reported 1–5 scale ($S \times 20$).
- **Failure Risk (0–100)**: Probability output from the Random Forest model ($P \times 100$).
- **Complaint Frequency (0–100)**: Frequency of complaints regarding the asset in the past 30 days ($0 \rightarrow 10, 1 \rightarrow 40, 2 \rightarrow 70, \ge 3 \rightarrow 95$).
- **Location Criticality (0–100)**: $\text{Low} = 25, \text{Medium} = 50, \text{High} = 80, \text{Critical} = 100$.
