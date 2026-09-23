# AI-Based Campus Infrastructure Maintenance System
> **AI-Powered Predictive Campus Infrastructure Maintenance and Management System**  
> Department of Computer Science and Business Systems • Academic Year 2026–2027

---

## 📌 Project Overview

Large educational campuses contain hundreds or thousands of infrastructure assets such as air conditioners, electrical panels, water booster pumps, plumbing systems, passenger elevators, classroom projectors, CCTV security networks, and laboratory fume hoods. Conventional maintenance processes are largely **reactive**: equipment breaks down, a complaint is manually filed, and repairs are made only after operational disruption has occurred.

This system provides a centralized digital platform that links maintenance complaints to asset-level telemetry and historical records. It uses a **Random Forest Ensemble Model** to forecast the 30-day failure probability of infrastructure assets, combines predicted risk with severity and location criticality using an **Operational Priority Engine**, automatically matches work orders to qualified technicians via a **Smart Assignment Engine**, and tracks the full repair lifecycle through completion and verification.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                │
│       Student / Faculty        Admin Console        Field Technician   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST / Multipart API
┌────────────────────────────────────▼───────────────────────────────────┐
│                        APPLICATION LAYER (Express)                     │
│  Auth & RBAC • Request Lifecycle • Smart Dispatch • Evidence Storage   │
└───────────────┬────────────────────┬────────────────────┬──────────────┘
                │                    │                    │
┌───────────────▼────────┐  ┌────────▼─────────┐  ┌───────▼──────────────┐
│   AI & DECISION LAYER  │  │    DATA LAYER    │  │ ANALYTICS & REPORTS  │
│ • Random Forest 30d RF │  │ • Users & Roles  │  │ • MTTR & SLA Trends  │
│ • Priority Engine      │  │ • Assets & History│ │ • Risk Distribution  │
│ • NLP Problem Classif. │  │ • Work Orders    │  │ • Workload Heatmaps  │
│ • Technician Matcher   │  │ • Feedback & Proof│ │ • CSV / PDF Reports  │
└────────────────────────┘  └──────────────────┘  └──────────────────────┘
```

---

## 🚀 Quick Start Instructions

### 1. Requirements
- Node.js (v18 or higher)
- Web Browser (Chrome, Edge, Firefox)

### 2. Run the Application
Simply double-click **`run.bat`** or run in your terminal:
```bash
node server/index.js
```
Then open your browser at **[http://localhost:5000](http://localhost:5000)**.

*Both the REST backend API and the responsive React user interface are served together on port 5000.*

---

## 👥 Multi-Role User Personas & Test Credentials

The system includes a quick **Role Switcher** in the top navigation bar to test all personas with a single click:

| Role | User Account | Department | Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@campus.edu` | Facilities Office | Triage tickets, inspect AI failure risks, dispatch technicians, manage campus asset database. |
| **Student / Requester** | `student@campus.edu` | CSBS Student | Submit maintenance complaints, upload defect photos, track progress, verify repairs, provide ratings. |
| **Faculty / Staff** | `faculty@campus.edu` | CSE Faculty | Report classroom/lab equipment issues, view status alerts. |
| **Field Technician** | `tech.rajesh@campus.edu` | HVAC Services | View assigned work orders, accept tasks, update status to "In Progress", upload completion evidence. |
| **Campus Director** | `director@campus.edu` | Management | Review executive KPI dashboards, first-time fix rates, asset reliability, and export audit reports. |

*(Default password for all accounts is `campus123`)*

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
   - Click **Complete & Submit Evidence**, enter repair notes (e.g. *replaced defective run capacitor 45uF and recharged refrigerant*), upload proof, and submit.
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

---

## 🎓 Viva & Presentation Questions (Appendix D)

### 1. What problem does the system solve?
Conventional campus maintenance is reactive—problems are only addressed after equipment fails, resulting in classroom interruptions, high repair costs, repeated complaints, and uncoordinated technician scheduling. This system introduces predictive maintenance using AI to estimate failure probability before total breakdown occurs, while automating prioritization and technician dispatch.

### 2. Why is predictive maintenance useful for a campus?
Educational institutions operate on rigid academic calendars with high asset utilization (labs, lecture halls, hostels). Unexpected equipment downtime disrupts lectures, exams, and experiments. Predictive maintenance enables facilities teams to service degrading equipment during off-hours, extending equipment lifespans and reducing emergency repair costs.

### 3. What is the difference between failure risk and maintenance priority?
- **Failure Risk** is an objective statistical probability (0 to 1) estimating how likely an asset is to fail based on historical wear, age, and maintenance intervals.
- **Maintenance Priority** is an operational urgency score determining how rapidly technicians must respond. A high-risk air conditioner in an unoccupied storage room has lower priority than a moderately risky AC in a server room or active laboratory.

### 4. Why was Random Forest selected?
Random Forest handles nonlinear relationships between tabular features (age, duty cycle, days since service), is robust against overfitting compared to individual decision trees, works well with mixed numeric and categorical data, and exposes feature importances for explainable AI.

### 5. What is the target variable?
The target variable is binary: `failure_next_30d` ($1 = \text{asset experienced a qualifying failure within 30 days}$, $0 = \text{no failure occurred}$).

### 6. Which features are used for prediction?
`asset_age_years`, `previous_failures`, `days_since_maintenance`, `maintenance_count_12m`, `complaints_30d`, `severity`, `usage_hours_day`, `asset_type`, and `location_criticality`.

### 7. What is data leakage and how is it avoided?
Data leakage occurs when features containing information from *after* the failure event (such as final repair duration, cost, or replaced components) are accidentally fed into the model during training. It is avoided by using a strict temporal cut-off: only data available at the moment of prediction is included.

### 8. How is technician assignment performed?
Using a rule-based multi-factor optimization:
$$\text{Candidate Score} = 0.5 \times \text{Skill Match} + 0.3 \times \text{Availability} + 0.2 \times \text{Workload Capacity}$$
Eligible technicians with the required trade skill are ranked by availability and lowest active workload.

---

## 📊 Database Schema Summary

- `users`: User authentication, roles (`requester`, `admin`, `technician`, `management`), department, contact.
- `assets`: Physical infrastructure registry (`asset_code`, `building`, `location`, `installation_date`, `status`, `last_maintenance`, `usage_hours_day`, `criticality`, `previous_failures`).
- `maintenance_requests`: Work order tickets with AI failure probability, risk band, priority score, status lifecycle, and image uploads.
- `predictions`: Explainable AI diagnostic logs storing model version, probability, and feature contributions.
- `technicians`: Personnel database with primary trades, cross-skills, availability, active workload, and customer ratings.
- `assignments`: Dispatches linking requests to technicians with timestamps (`assigned_at`, `accepted_at`, `started_at`, `completed_at`) and completion evidence photos.
- `feedback`: Customer ratings (1–5 stars) and verification comments.
- `maintenance_history`: Immutable asset lifecycle log tracking past repairs, parts replaced, and technicians.
- `model_versions`: Registry tracking machine learning model versions, accuracy, F1-scores, and training dates.
