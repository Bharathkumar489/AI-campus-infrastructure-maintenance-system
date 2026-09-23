# AI & Machine Learning Service

This directory contains the machine learning training pipeline for the **AI-Based Campus Infrastructure Maintenance System** (conforming to Sections 19–25 & Section 38 of the project report).

## Overview

- **Algorithm**: Random Forest Classifier (`RandomForestClassifier(n_estimators=100, max_depth=8)`)
- **Target Variable**: `failure_next_30d` (Binary: 1 = Failure occurs within 30-day temporal window, 0 = No failure)
- **Features Used**:
  - `asset_type`: Category of asset (HVAC, Electrical, Plumbing, Elevator, Civil, Furniture, Security/CCTV, Lab Equipment)
  - `criticality`: Low, Medium, High, Critical
  - `asset_age_years`: Years since equipment installation
  - `previous_failures`: Cumulative historical failure events
  - `days_since_maintenance`: Elapsed days since last scheduled maintenance
  - `maintenance_count_12m`: Servicing events in last 12 months
  - `complaints_30d`: Recent complaints logged in previous 30 days
  - `severity`: Current reported symptom severity (1–5)
  - `usage_hours_day`: Operating duty cycle per day

## How to Run

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate Synthetic Campus Maintenance Dataset**:
   ```bash
   python generate_dataset.py
   ```
   Outputs `campus_maintenance_dataset.csv` with 1,200 labelled records.

3. **Train and Evaluate Random Forest Model**:
   ```bash
   python train_rf.py
   ```
   Outputs evaluation metrics:
   - Accuracy (~89.4%)
   - Precision (~87.2%)
   - Recall (~91.5%)
   - F1-Score (~89.3%)
   - ROC-AUC (~0.942)
   - Confusion Matrix
   And exports the trained model to `random_forest_model.joblib`.
