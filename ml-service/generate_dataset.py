"""
Campus Infrastructure Maintenance - Dataset Generator (Section 20 & 21)
Generates synthetic campus infrastructure failure dataset for 30-day failure risk prediction.
Label: failure_next_30d (Binary: 1 = Failure occurred within 30 days, 0 = No failure)
"""

import csv
import random
import os

ASSET_TYPES = ['HVAC', 'Electrical', 'Plumbing', 'Elevator', 'Civil', 'Furniture', 'Security/CCTV', 'Lab Equipment']
CRITICALITIES = ['Low', 'Medium', 'High', 'Critical']
BUILDINGS = ['Block A', 'Block B', 'Block C', 'Main Library', 'Boys Hostel', 'Girls Hostel', 'Auditorium', 'Science Block']

def generate_record(index):
    asset_type = random.choice(ASSET_TYPES)
    building = random.choice(BUILDINGS)
    criticality = random.choice(CRITICALITIES)
    
    # Realistic operational ranges
    age_years = round(random.uniform(0.5, 10.0), 1)
    
    # Previous failures correlate with age
    prev_failures = int(random.poisson(age_years * 0.6) if hasattr(random, 'poisson') else max(0, int(age_years * 0.5 + random.gauss(0, 1))))
    
    # Days since maintenance
    days_since_maint = random.randint(10, 365)
    
    # Maintenance count in 12m
    maint_count_12m = max(0, int(random.gauss(2, 1)))
    
    # Complaints in last 30d
    complaints_30d = random.choices([0, 1, 2, 3, 4], weights=[0.60, 0.22, 0.10, 0.05, 0.03])[0]
    
    # Operational severity
    severity = random.randint(1, 5)
    
    # Usage hours per day
    usage_hours = round(random.uniform(4.0, 24.0), 1)
    
    # Ground truth failure propensity calculation
    risk_score = 0.15
    if asset_type in ['HVAC', 'Elevator', 'Lab Equipment']:
        risk_score += 0.12
    if age_years > 5.0:
        risk_score += 0.20
    if prev_failures >= 3:
        risk_score += 0.22
    if days_since_maint > 150:
        risk_score += 0.25
    if complaints_30d >= 2:
        risk_score += 0.25
    if usage_hours >= 12.0:
        risk_score += 0.12
    if criticality in ['High', 'Critical']:
        risk_score += 0.08
    if severity >= 4:
        risk_score += 0.15

    # Random jitter
    noise = random.gauss(0, 0.10)
    final_prob = min(0.95, max(0.05, risk_score + noise))
    
    # Binary target
    failure_next_30d = 1 if random.random() < final_prob else 0

    return {
        'asset_id': f"AST-{index:04d}",
        'asset_type': asset_type,
        'building': building,
        'criticality': criticality,
        'asset_age_years': age_years,
        'previous_failures': prev_failures,
        'days_since_maintenance': days_since_maint,
        'maintenance_count_12m': maint_count_12m,
        'complaints_30d': complaints_30d,
        'severity': severity,
        'usage_hours_day': usage_hours,
        'failure_next_30d': failure_next_30d
    }

def main():
    num_records = 1200
    output_path = os.path.join(os.path.dirname(__file__), 'campus_maintenance_dataset.csv')
    
    fieldnames = [
        'asset_id', 'asset_type', 'building', 'criticality',
        'asset_age_years', 'previous_failures', 'days_since_maintenance',
        'maintenance_count_12m', 'complaints_30d', 'severity',
        'usage_hours_day', 'failure_next_30d'
    ]

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(1, num_records + 1):
            writer.writerow(generate_record(i))

    print(f"Successfully generated {num_records} records to: {output_path}")

if __name__ == '__main__':
    main()
