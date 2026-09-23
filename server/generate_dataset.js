const fs = require('fs');
const path = require('path');

const ASSET_TYPES = ['HVAC', 'Electrical', 'Plumbing', 'Elevator', 'Civil', 'Furniture', 'Security/CCTV', 'Lab Equipment'];
const CRITICALITIES = ['Low', 'Medium', 'High', 'Critical'];
const BUILDINGS = ['Block A', 'Block B', 'Block C', 'Main Library', 'Boys Hostel', 'Girls Hostel', 'Auditorium', 'Science Block'];

function generateDataset() {
  const records = [];
  records.push('asset_id,asset_type,building,criticality,asset_age_years,previous_failures,days_since_maintenance,maintenance_count_12m,complaints_30d,severity,usage_hours_day,failure_next_30d');

  for (let i = 1; i <= 1200; i++) {
    const assetType = ASSET_TYPES[Math.floor(Math.random() * ASSET_TYPES.length)];
    const building = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
    const crit = CRITICALITIES[Math.floor(Math.random() * CRITICALITIES.length)];
    const age = parseFloat((0.5 + Math.random() * 9.5).toFixed(1));
    const prevFailures = Math.max(0, Math.floor(age * 0.5 + (Math.random() * 3 - 1)));
    const daysSinceMaint = Math.floor(10 + Math.random() * 350);
    const maintCount12m = Math.max(0, Math.floor(Math.random() * 5));
    const complaints30d = Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : Math.random() < 0.92 ? 2 : Math.floor(3 + Math.random() * 2);
    const severity = Math.floor(1 + Math.random() * 5);
    const usageHours = parseFloat((4 + Math.random() * 20).toFixed(1));

    // Calculate ground truth probability
    let risk = 0.15;
    if (['HVAC', 'Elevator', 'Lab Equipment'].includes(assetType)) risk += 0.12;
    if (age > 5.0) risk += 0.20;
    if (prevFailures >= 3) risk += 0.22;
    if (daysSinceMaint > 150) risk += 0.25;
    if (complaints30d >= 2) risk += 0.25;
    if (usageHours >= 12.0) risk += 0.12;
    if (['High', 'Critical'].includes(crit)) risk += 0.08;
    if (severity >= 4) risk += 0.15;

    const noise = (Math.random() - 0.5) * 0.2;
    const finalProb = Math.min(0.95, Math.max(0.05, risk + noise));
    const failure = Math.random() < finalProb ? 1 : 0;

    const assetId = `AST-${String(i).padStart(4, '0')}`;
    records.push(`${assetId},${assetType},${building},${crit},${age},${prevFailures},${daysSinceMaint},${maintCount12m},${complaints30d},${severity},${usageHours},${failure}`);
  }

  const outputPath = path.join(__dirname, '../ml-service/campus_maintenance_dataset.csv');
  fs.writeFileSync(outputPath, records.join('\n'), 'utf8');
  console.log(`Generated 1,200 records to ${outputPath}`);
}

generateDataset();
