// Dynamic AI Equipment & Work Requirements Intelligence Engine
// Dynamically classifies defects and generates specific replacement parts, tools, SOPs, and safety protocols

export const DEFECT_SPECIFICATIONS = {
  // 1. Ceiling Fan & Appliance Defects
  CEILING_FAN: {
    category: "Electrical",
    equipment_name: "Industrial BLDC High-Airflow Ceiling Fan",
    model_spec: "Atomberg Renesa 1200mm / BLDC Energy-Efficient Motor",
    target_component: "BLDC Motor Capacitor & Rotor Bearing Assembly",
    operating_cycle: "High Continuous Duty • 10-14 hrs/day in lecture halls",
    trade_specialization: "Campus Appliance & Electrical Specialist",
    estimated_duration: "20 - 35 Minutes",
    crew_allocation: "1 Appliance Technician",
    tools: [
      { name: "Three-Jaw Mini Bearing Puller", purpose: "Safely extract tight motor bearings without shaft damage", type: "Mechanical" },
      { name: "Digital Non-Contact Tachometer", purpose: "Measure blade RPM and check governor calibration", type: "Diagnostic" },
      { name: "1000V Insulated Screwdriver Set", purpose: "Tighten blade mounts and ceiling rose shackle bolts", type: "Safety Tool" },
      { name: "Step Ladder with Safety Rail", purpose: "Stable elevated access up to 3.5m ceiling height", type: "Access" }
    ],
    parts: [
      { part_name: "2.5μF / 440VAC Metallized Polypropylene Capacitor", spec: "Epoxy encapsulated fan run capacitor (EPCOS/TDK)", qty: "1 unit" },
      { part_name: "Aerodynamic Aluminum Fan Blade Set (1200mm)", spec: "Matched weight triple-blade set to eliminate wobble", qty: "1 set (3 blades)" },
      { part_name: "M6 High-Tensile Cotter Pin & Shackle Bolt Set", spec: "Zinc-plated grade 8.8 anti-vibration locking bolt", qty: "1 set" },
      { part_name: "Electronic 5-Step Fan Regulator Module", spec: "Capacitive hum-free speed controller socket", qty: "1 unit" }
    ],
    sop: [
      "Isolate dedicated fan switch and trip branch MCB on room sub-distribution board.",
      "Inspect ceiling hook, shackle insulator, and safety downrod split-pin.",
      "Check blade pitch angle and replace worn 2.5μF motor capacitor.",
      "Clean dust build-up from stator housing and torque blade mounting screws to 3.0 N·m.",
      "Power on at step 1 and verify quiet operation through step 5 with zero clicking or wobble."
    ],
    safety: {
      hazard_class: "Elevated Fall Hazard & 230V Electrical Shock",
      isolation: "Lockout room circuit breaker. Stabilize step ladder on even ground.",
      ppe: [
        { name: "Dielectric Grip Work Gloves", standard: "EN 388 / ASTM D120" },
        { name: "Impact-Resistant Safety Eyewear", standard: "ANSI Z87.1" },
        { name: "Non-Slip Rubber Sole Safety Shoes", standard: "EN ISO 20345" },
        { name: "Lightweight High-Impact Hard Hat", standard: "EN 397 Type 1" }
      ],
      environmental_guideline: "Recycle exhausted capacitors and metal blades in dedicated campus electrical salvage bin."
    }
  },

  // 2. High-Voltage LT Panel & Switchgear Defects
  ELECTRICAL_PANEL: {
    category: "Electrical",
    equipment_name: "Main 415V LT Distribution Switchboard",
    model_spec: "Schneider Electric Acti9 / 63A 4-Pole 10kA Icu Sub-Panel",
    target_component: "63A 4-Pole MCCB & Electrolytic Copper Busbar Section",
    operating_cycle: "Continuous 24x7 Critical Campus Power Grid Load",
    trade_specialization: "Licensed Master Electrician / High-Voltage Certified",
    estimated_duration: "30 - 45 Minutes",
    crew_allocation: "1 Licensed Electrician + 1 Safety Spotter",
    tools: [
      { name: "Fluke 87V Industrial Multimeter", purpose: "AC/DC True-RMS voltage, frequency, and continuity check", type: "Diagnostic" },
      { name: "FLIR Thermal Imaging Camera", purpose: "Scan for hot spots, loose lugs, and phase imbalance", type: "Inspection" },
      { name: "1000V Insulated VDE Screwdriver Set", purpose: "Safe terminal screw torquing inside panel perimeter", type: "Safety Tool" },
      { name: "Hydraulic Cable Lug Crimper", purpose: "High-integrity cold-weld crimping of 16-25 sq mm copper cables", type: "Mechanical" }
    ],
    parts: [
      { part_name: "63A 4-Pole 10kA Industrial MCCB", spec: "IEC/EN 60947-2 Certified Molded Case Circuit Breaker", qty: "1 unit" },
      { part_name: "4.0 sq mm Fire-Retardant (FR) Copper Wire", spec: "IS:694 Multi-strand PVC insulated flexible wire (Red/Black)", qty: "5 meters" },
      { part_name: "Heavy-Duty Electrolytic Copper Lugs", spec: "Tin-plated 25-10 lug connectors with heat-shrink tubing", qty: "4 units" },
      { part_name: "Polyamide 6.6 Din-Rail Terminal End Blocks", spec: "Finger-safe high-temp industrial terminal blocks", qty: "2 units" }
    ],
    sop: [
      "Notify Building Facility Operations Desk prior to feeder disruption.",
      "Open upstream breaker and apply master padlock with LOTO tag.",
      "Verify zero electrical potential across all phases (L1, L2, L3, N) using calibrated tester.",
      "Replace fatigued circuit breaker, dress cabling with fire-retardant sleeves, and torque to 2.5 N·m.",
      "Re-energize line, perform thermal scan under load, and verify harmonic distortion <3%."
    ],
    safety: {
      hazard_class: "Arc-Flash & High-Energy Electrocution Hazard",
      isolation: "Mandatory LOTO on Main Feeder Breaker. Treat all conductors as live until verified.",
      ppe: [
        { name: "1000V Dielectric Insulated Gloves (Class 0)", standard: "ASTM D120 / IEC 60903" },
        { name: "Arc-Flash Face Shield (8 cal/cm²)", standard: "NFPA 70E Arc-Rated" },
        { name: "Dielectric Safety Boots (18kV rated)", standard: "ASTM F2413 EH Approved" },
        { name: "100% Flame-Resistant Cotton Workwear", standard: "NFPA 2112 Certified" }
      ],
      environmental_guideline: "Segregate and safely dispose of heat-degraded PVC insulation and copper scrap at certified campus recycling depot."
    }
  },

  // 3. Lighting & Troffer Fixtures
  LIGHTING: {
    category: "Electrical",
    equipment_name: "Commercial LED Recessed Troffer Light Fitting",
    model_spec: "Philips SmartBright 36W LED 2x2 Troffer / 4000K Neutral White",
    target_component: "Constant Current LED Driver & Diffuser Lens",
    operating_cycle: "High Duty • 14 hrs/day academic lighting cycle",
    trade_specialization: "Campus Lighting & Building Electrical Technician",
    estimated_duration: "15 - 30 Minutes",
    crew_allocation: "1 Electrical Technician",
    tools: [
      { name: "Digital Lux / Illuminance Meter", purpose: "Measure work surface lumen output against 300 lux standard", type: "Diagnostic" },
      { name: "Non-Contact AC Voltage Detector Pen", purpose: "Safely verify live voltage in ceiling cavity junction boxes", type: "Safety" },
      { name: "Automatic Wire Stripper & Crimper", purpose: "Rapid wire stripping without nicking inner conductors", type: "Mechanical" },
      { name: "A-Frame Aluminum Step Ladder", purpose: "Access false ceiling grid safely", type: "Access" }
    ],
    parts: [
      { part_name: "36W Constant Current LED Driver (900mA)", spec: "TÜV Rheinland certified flicker-free electronic driver", qty: "1 unit" },
      { part_name: "WAGO 221 Compact Lever Wire Connectors", spec: "Reusable 3-conductor quick-splice terminal blocks", qty: "3 units" },
      { part_name: "Prismatic Acrylic Light Diffuser Panel (600x600mm)", spec: "UV-stabilized anti-glare micro-prismatic lens", qty: "1 unit" },
      { part_name: "Fast-Blow Glass Cartridge Fuse (2A / 250V)", spec: "Ceramic body 5x20mm driver protection fuse", qty: "2 units" }
    ],
    sop: [
      "Switch off dedicated lighting loop at wall switch and distribution board.",
      "Gently displace adjacent false ceiling acoustic tile to inspect junction box.",
      "Test input wire for zero voltage using non-contact detector.",
      "Replace defective LED driver module and connect line/neutral using Wago lever blocks.",
      "Clip troffer diffuser securely into grid and verify even, flicker-free illumination."
    ],
    safety: {
      hazard_class: "Ceiling Grid Fall Risk & 230V Electrical Shock",
      isolation: "Switch off lighting loop circuit breaker on floor DB.",
      ppe: [
        { name: "Precision Electrician Gloves", standard: "EN 388 Level 1" },
        { name: "Safety Glasses with Clear Lenses", standard: "ANSI Z87.1" },
        { name: "Slip-Resistant Rubber Work Shoes", standard: "EN ISO 20345" },
        { name: "Lightweight Bump Cap", standard: "EN 812" }
      ],
      environmental_guideline: "Collect burnt-out drivers and LED arrays for specialized campus electronic waste e-recycling."
    }
  },

  // 4. AC Cooling & Compressor Failures
  AC_COOLING: {
    category: "HVAC",
    equipment_name: "Split AC 2.0 Ton (Daikin Inverter)",
    model_spec: "Daikin FTKF60 Inverter Split AC / R-32 Eco Refrigerant",
    target_component: "Hermetic Inverter Rotary Compressor & Run Capacitor",
    operating_cycle: "Continuous High Load • 12-14 hrs/day in computer labs",
    trade_specialization: "Lead HVAC Refrigeration Specialist",
    estimated_duration: "45 - 60 Minutes",
    crew_allocation: "1 Lead HVAC Tech + 1 Assistant",
    tools: [
      { name: "Digital Dual-Port Manifold Pressure Gauge", purpose: "Measure high/low side refrigerant pressures and subcooling", type: "Diagnostic" },
      { name: "Fluke True-RMS Current Clamp Meter", purpose: "Measure compressor starting torque and running amperage", type: "Electrical" },
      { name: "Ultrasonic Electronic Refrigerant Leak Detector", purpose: "Pinpoint micro-leaks in copper piping flare joints", type: "Inspection" },
      { name: "Two-Stage Rotary Vane Vacuum Pump", purpose: "Evacuate moisture down to 500 microns before refrigerant top-up", type: "Mechanical" }
    ],
    parts: [
      { part_name: "45μF / 450VAC Heavy-Duty Run Capacitor", spec: "Metallized polypropylene dual motor capacitor (CBB65)", qty: "1 unit" },
      { part_name: "R-32 High-Purity Eco Refrigerant Gas", spec: "Virgin cylinder zero-ozone depletion refrigerant", qty: "1.2 kg" },
      { part_name: "Anti-Vibration Neoprene Compressor Mount Pads", spec: "Molded heavy-density vibration isolator bushes", qty: "4 units" },
      { part_name: "Brass Schrader Service Access Valve Core", spec: "High-temperature fluorocarbon seal valve core", qty: "2 units" }
    ],
    sop: [
      "Disconnect 230V outdoor isolator switch and apply LOTO padlock.",
      "Measure resistance across compressor terminal pins (C-S, C-R, S-R) to check windings.",
      "Replace fatigued 45μF start/run capacitor and install new vibration dampeners.",
      "Check suction and discharge pressures with digital manifold; top-up refrigerant if delta-T <8°C.",
      "Run unit for 15 minutes and confirm supply airflow temperature drops below 16°C."
    ],
    safety: {
      hazard_class: "High-Pressure Refrigerant Gas & 230V Electrical Shock",
      isolation: "Mandatory LOTO at outdoor unit local rotary isolator switch.",
      ppe: [
        { name: "Cryogenic Thermal Handling Gloves", standard: "EN 511 Thermal Protection" },
        { name: "Safety Goggles with Splash Guard", standard: "ANSI Z87.1" },
        { name: "Dielectric Work Boots", standard: "ASTM F2413 EH" },
        { name: "Class 2 High-Visibility Vest", standard: "EN ISO 20471" }
      ],
      environmental_guideline: "Zero atmospheric venting: Recover any contaminated gas into certified recovery cylinders."
    }
  },

  // 5. AC Water Leakage & Drainage
  AC_LEAKAGE: {
    category: "HVAC",
    equipment_name: "Split AC 2.0 Ton (Daikin Inverter)",
    model_spec: "Daikin Indoor Wall-Mounted Evaporator Unit",
    target_component: "Condensate Drain Pan & Evaporator Drainage Tube",
    operating_cycle: "High Condensation Generation (3-5 Liters/hr) during summer",
    trade_specialization: "HVAC Drainage & Mechanical Technician",
    estimated_duration: "25 - 40 Minutes",
    crew_allocation: "1 HVAC Technician",
    tools: [
      { name: "CO2 Cartridge Condensate Drain Gun", purpose: "Clear stubborn sludge and slime blockages with pressurized CO2", type: "Clearing" },
      { name: "Wet/Dry Vacuum Suction Machine", purpose: "Evacuate accumulated water from indoor drip tray", type: "Mechanical" },
      { name: "Flexible Drain Snake Cleanout Wire (3m)", purpose: "Mechanically snake tight 90-degree drain elbows", type: "Manual" },
      { name: "Electronic Laser Inclinometer", purpose: "Verify 2-degree negative slope on indoor mounting plate", type: "Inspection" }
    ],
    parts: [
      { part_name: "Flexible PVC Corrugated Condensate Drain Hose (16mm)", spec: "Anti-kink UV-resistant flexible drainage line", qty: "3 meters" },
      { part_name: "Condensate Pan Anti-Bacterial Treatment Tablets", spec: "Slow-release quaternary ammonium biocide tablets", qty: "1 pack (6 tabs)" },
      { part_name: "Molded Rubber Drain Hose Coupler Adaptor", spec: "Watertight barbed push-fit connection collar", qty: "2 units" },
      { part_name: "Closed-Cell Foam Thermal Insulation Tape", spec: "Self-adhesive anti-condensation pipe wrap (50mm wide)", qty: "1 roll" }
    ],
    sop: [
      "Power off indoor AC unit at cordless remote and wall isolator.",
      "Remove indoor casing fascia and clean evaporator drip pan of microbial slime.",
      "Clear condensate line using pressurized drain blaster; flush with warm biocide water.",
      "Verify indoor evaporator bracket has a 2-degree downward slope toward drain outlet.",
      "Test by pouring 1.5L of water into tray; verify rapid, uninhibited gravity discharge outside."
    ],
    safety: {
      hazard_class: "Water Overflow near Electrical Outlets & Slip Hazard",
      isolation: "Switch off AC wall power; cover electronic equipment underneath with plastic sheeting.",
      ppe: [
        { name: "Waterproof Nitrile Work Gloves", standard: "EN 374" },
        { name: "Clear Protective Safety Glasses", standard: "ANSI Z87.1" },
        { name: "Anti-Slip Rubber Sole Shoes", standard: "SRC Slip Certified" },
        { name: "Absorbent Floor Spill Mat", standard: "Industrial Absorbent" }
      ],
      environmental_guideline: "Drain condensate overflow into sanitary drain lines rather than exterior walkways."
    }
  },

  // 6. High-Pressure Water Pump & Piping Burst
  WATER_PUMP: {
    category: "Plumbing",
    equipment_name: "High Pressure Water Booster Pump (Kirloskar 7.5HP)",
    model_spec: "Kirloskar KS4-0808 Multi-Stage Centrifugal Booster / 3-Phase 415V",
    target_component: "Mechanical Rotary Shaft Seal & Flange Coupling Gasket",
    operating_cycle: "Intermittent High Surge Pressure (4.5 - 6.0 Bar) to overhead tanks",
    trade_specialization: "Senior Hydraulic Pump & Mechanical Specialist",
    estimated_duration: "40 - 60 Minutes",
    crew_allocation: "1 Lead Hydraulic Plumber + 1 Assistant",
    tools: [
      { name: "18-Inch Heavy-Duty Cast Iron Pipe Wrench", purpose: "Loosen and torque high-pressure flanged union nuts", type: "Mechanical" },
      { name: "Hydrostatic Digital Pressure Test Kit", purpose: "Verify leak-free pump casing under 8 bar test pressure", type: "Diagnostic" },
      { name: "Flange Spreader & Gasket Scraper", purpose: "Safely separate mating flanges without gouging sealing faces", type: "Mechanical" },
      { name: "Submersible De-Watering Sump Pump", purpose: "Rapidly clear standing water from basement pump pit", type: "Drainage" }
    ],
    parts: [
      { part_name: "Mechanical Rotary Carbon-Silicon Shaft Seal Kit (32mm)", spec: "High-temperature corrosion-resistant elastomeric bellows seal", qty: "1 set" },
      { part_name: "Schedule 80 CPVC 50mm Flanged Full-Face Gaskets", spec: "EPDM reinforced 3mm industrial pressure gaskets", qty: "2 units" },
      { part_name: "Grade 316 Stainless Steel Flange Bolts (M16x75mm)", spec: "Corrosion-proof high-tensile bolt, nut & washer set", qty: "8 sets" },
      { part_name: "High-Strength CPVC Heavy-Bodied Solvent Cement", spec: "NSF-61 certified pressure-rated pipe cement (500ml)", qty: "1 can" }
    ],
    sop: [
      "Immediately trip electrical control panel starter for Booster Pump 1 and tag LOTO.",
      "Close suction and discharge gate valves to isolate damaged pump chamber.",
      "Deploy sump pump to evacuate basement standing water away from electrical conduits.",
      "Unbolt flanged coupling, extract worn mechanical shaft seal, and install new silicon-carbide seal.",
      "Tighten flange bolts in cross-diagonal star pattern to 45 N·m; pressurize and inspect."
    ],
    safety: {
      hazard_class: "High-Pressure Water Spray near Electrical Panels & Flooding",
      isolation: "Mandatory LOTO at pump motor control center (MCC) & gate valve shutoff.",
      ppe: [
        { name: "Heavy-Duty Chemical & Water Resistant Gloves", standard: "EN 374" },
        { name: "Steel-Toe Waterproof Wellingtons", standard: "EN ISO 20345 S5 SRC" },
        { name: "Impact Splash Face Shield", standard: "ANSI Z87.1" },
        { name: "High-Visibility Waterproof Overalls", standard: "EN 343 / EN ISO 20471" }
      ],
      environmental_guideline: "Divert pump room runoff to campus rainwater harvesting collection channels."
    }
  },

  // 7. General Sanitary, Tap & Restroom Leaks
  SANITARY_TAP: {
    category: "Plumbing",
    equipment_name: "Campus Restroom Potable Supply & Sanitary Fixture",
    model_spec: "Jaquar Commercial Pillar Tap & CPVC Concealed Supply Line",
    target_component: "Quarter-Turn Ceramic Disc Spindle & Braided Flexible Hose",
    operating_cycle: "High Frequency Public Restroom Usage (>600 cycles/day)",
    trade_specialization: "Campus Sanitary Plumbing Technician",
    estimated_duration: "15 - 30 Minutes",
    crew_allocation: "1 Plumber",
    tools: [
      { name: "Telescopic Adjustable Basin Wrench", purpose: "Reach recessed faucet mounting nuts behind porcelain basins", type: "Mechanical" },
      { name: "Smooth-Jaw Plier Wrench (Chrome Safe)", purpose: "Grip polished chrome fittings without marring surface finish", type: "Mechanical" },
      { name: "Rothenberger Plastic Pipe Cutter (25mm)", purpose: "Make clean burr-free perpendicular cuts on CPVC line", type: "Cutting" },
      { name: "Drain Unclogger Hand Augur (15ft)", purpose: "Clear trapped hair and debris from bottle trap and P-trap", type: "Sanitation" }
    ],
    parts: [
      { part_name: "35mm Brass Ceramic Disc Faucet Cartridge", spec: "Quarter-turn ceramic headwork cartridge with silicone seals", qty: "1 unit" },
      { part_name: "Stainless Steel Braided Flexible Connector (450mm)", spec: "Grade 304 braided EPDM hose with 1/2-inch brass nuts", qty: "2 units" },
      { part_name: "High-Density PTFE Thread Seal Tape (19mm)", spec: "0.1mm thickness heavy Teflon sealing tape for pipe threads", qty: "2 rolls" },
      { part_name: "Heavy-Duty Neoperl Cascade Aerator (6 LPM)", spec: "Lime-resistant water-saving faucet aerator insert", qty: "1 unit" }
    ],
    sop: [
      "Shut off dedicated angle stop-cock under the sink fixture.",
      "Remove tap handle indexing cap, loosen retaining grub screw, and remove ceramic spindle.",
      "Inspect brass valve seating for lime scaling; dress seat with emery cloth.",
      "Install replacement quarter-turn cartridge, apply PTFE tape, and reinstall chrome lever.",
      "Re-open stop-cock; verify zero drip under 3.5 bar mains pressure and smooth aeration."
    ],
    safety: {
      hazard_class: "Slip Hazard & Potential Biohazard in Sanitary Trap",
      isolation: "Close localized angle stop-cock valve before disassembling faucet body.",
      ppe: [
        { name: "Nitrile Disposable Plumbing Gloves", standard: "EN 455 Medical Grade" },
        { name: "Safety Glasses with Clear Anti-Fog Coating", standard: "ANSI Z87.1" },
        { name: "Slip-Resistant Work Shoes", standard: "SRC Certified" }
      ],
      environmental_guideline: "Collect discarded brass spindles for metal recovery; verify water flow rate does not exceed 6 LPM."
    }
  },

  // 8. Classroom Furniture, Desks & Chairs
  FURNITURE: {
    category: "Furniture",
    equipment_name: "Integrated Auditorium Tiered Desks & Student Chairs",
    model_spec: "Godrej Interio Premium Classroom Ergonomic Mesh Chair & Metal Desk",
    target_component: "Armrest Pivot Bracket, M6 Hex Socket Screws & Base Swivel",
    operating_cycle: "Heavy Continuous Cyclic Load (60 students per class, 8 sessions/day)",
    trade_specialization: "Campus Ergonomic Furniture & Carpentry Technician",
    estimated_duration: "15 - 25 Minutes",
    crew_allocation: "1 Furniture Specialist",
    tools: [
      { name: "Metric T-Handle Hex / Allen Wrench Set (4-8mm)", purpose: "High-leverage torquing of recessed furniture bolts", type: "Mechanical" },
      { name: "Cordless 12V Compact Impact Driver with Bit Set", purpose: "Fast disassembly and re-assembly of armrest fixing plates", type: "Power Tool" },
      { name: "Dead-Blow Rubber Mallet", purpose: "Seat chair casters and plastic bushings without surface cracking", type: "Mechanical" },
      { name: "Digital Vernier Caliper (150mm)", purpose: "Measure thread pitch and bolt diameter accurately", type: "Precision" }
    ],
    parts: [
      { part_name: "M6 x 35mm High-Tensile Socket Head Cap Screws", spec: "Grade 10.9 black-oxide steel Allen bolts with spring washers", qty: "6 units" },
      { part_name: "Reinforced Polyurethane 3D Chair Armrest Pad", spec: "Soft-touch scratch-resistant ergonomic molded armrest", qty: "1 unit" },
      { part_name: "Thread-Locking Liquid Adhesive (Loctite 242)", spec: "Medium-strength removable blue threadlocker (10ml)", qty: "1 bottle" },
      { part_name: "Heavy-Duty Twin-Wheel Nylon Chair Casters (50mm)", spec: "Steel stem 11mm friction ring universal casters", qty: "2 units" }
    ],
    sop: [
      "Inspect student chair frame, welded tubular steel joints, and armrest swivel plate.",
      "Remove loose screw, inspect tapped steel thread for stripped grooves.",
      "Apply 2 drops of Loctite 242 medium-strength threadlocker to new M6x35mm Allen bolt.",
      "Tighten all 4 armrest bolts evenly using T-handle hex wrench to 8.5 N·m torque.",
      "Apply 50kg downward test load on armrest; verify 100% rigid stability with zero wobble."
    ],
    safety: {
      hazard_class: "Pinch Point & Repetitive Strain Hazard",
      isolation: "Clear surrounding student desk area; support chair base firmly on floor.",
      ppe: [
        { name: "Mechanic Grip Padded Work Gloves", standard: "EN 388 Level 2" },
        { name: "Impact Safety Glasses", standard: "ANSI Z87.1" },
        { name: "Protective Steel-Toe Shoes", standard: "EN ISO 20345" }
      ],
      environmental_guideline: "Sort worn steel bolts and unrepairable plastic armrest pads into recyclable materials bin."
    }
  },

  // 9. Heavy Doors, Closers & Architectural Enclosures
  DOORS_CIVIL: {
    category: "Civil",
    equipment_name: "Commercial Hydraulic Overhead Door Closer & Sash",
    model_spec: "Dorma TS-68 Commercial Hydraulic Door Closer & Timber Flush Door",
    target_component: "Hydraulic Sweep/Latch Speed Valves & Ball Bearing Hinges",
    operating_cycle: "High Frequency Cycle (>800 door openings/day in main corridors)",
    trade_specialization: "Campus Facilities Carpentry & Civil Maintenance Specialist",
    estimated_duration: "25 - 40 Minutes",
    crew_allocation: "1 Civil / Carpentry Technician",
    tools: [
      { name: "Brushless SDS-Plus Rotary Hammer Drill", purpose: "Drill clean anchor holes in reinforced masonry door frame", type: "Power Tool" },
      { name: "Digital Bubble Inclinometer / Spirit Level", purpose: "Verify plumb line and horizontal door alignment", type: "Inspection" },
      { name: "Metric Hex Key L-Wrench Set (2-10mm)", purpose: "Fine-tune hydraulic sweep and latch speed valves", type: "Mechanical" },
      { name: "Hand Wood Surface Chisel & Plane Set", purpose: "Trim binding door margins to eliminate floor friction", type: "Carpentry" }
    ],
    parts: [
      { part_name: "Heavy-Duty Grade 304 Stainless Steel Butt Hinges (102x76mm)", spec: "Twin ball-bearing hinges with non-removable security pin", qty: "3 units" },
      { part_name: "M8 Rawlplug Expansion Anchors & Screws", spec: "Zinc-plated carbon steel anchors for concrete door frames", qty: "6 units" },
      { part_name: "Multi-Purpose Neutral Cure Silicone Sealant (Clear)", spec: "Architectural acoustic & draft sealant with anti-fungal agent", qty: "1 tube" },
      { part_name: "Hydraulic Closer Valve Adjustment Screw", spec: "OEM factory seal damping regulation screw with O-ring", qty: "1 set" }
    ],
    sop: [
      "Place safety warning cones in hallway to direct pedestrian traffic to adjacent door.",
      "Support door leaf on wedge blocks and inspect hinge pivot pins for sag.",
      "Remove loose screws, plug frame with polymer anchors, and secure new heavy-duty hinges.",
      "Calibrate door closer sweep speed (valve 1) and latch speed (valve 2) for smooth latching.",
      "Test emergency latch operation 5 consecutive times to ensure 100% compliance with fire egress code."
    ],
    safety: {
      hazard_class: "Heavy Object Pinch Point & Acoustic Noise",
      isolation: "Prop door securely during service; maintain clear corridor clearance.",
      ppe: [
        { name: "Cut-Resistant Grip Gloves (Level 5)", standard: "EN 388 Cut Level 5" },
        { name: "Steel-Toe Safety Shoes", standard: "EN ISO 20345 (200J Impact)" },
        { name: "Safety Glasses with Side Shields", standard: "ANSI Z87.1" },
        { name: "Particulate Dust Mask (N95)", standard: "NIOSH Approved" }
      ],
      environmental_guideline: "Sort wood shavings, metal fasteners, and packaging into campus solid waste recovery bins."
    }
  },

  // 10. Elevators & Vertical Transit
  ELEVATOR: {
    category: "Elevator",
    equipment_name: "High-Speed Traction Passenger Elevator (13-Passenger)",
    model_spec: "Otis Gen2 Geared Passenger Elevator / 884kg SWL / 1.5 m/s",
    target_component: "Door Interlock Sensor & Landing Door Hanger Rollers",
    operating_cycle: "Constant 16 hrs/day multi-floor student transit load",
    trade_specialization: "Certified Vertical Transportation & Lift Engineer",
    estimated_duration: "60 - 90 Minutes",
    crew_allocation: "2 Certified Elevator Engineers (Mandatory Pair)",
    tools: [
      { name: "Elevator Handheld Diagnostic Terminal", purpose: "Interface with CPU controller to read fault codes and door timings", type: "Diagnostic" },
      { name: "Dial Indicator & Cable Tension Gauge", purpose: "Measure hoistway wire rope tension differential across sheaves", type: "Precision" },
      { name: "Laser Alignment Tachometer", purpose: "Measure linear door operator velocity and motor RPM", type: "Electronic" },
      { name: "Pit & Car Top Inspection Control Pendant", purpose: "Operate elevator cabin safely under slow inspection crawl speed", type: "Control" }
    ],
    parts: [
      { part_name: "Infrared Multi-Beam Door Curtain Sensor (40 Beams)", spec: "Dynamic cross-hatch light curtain set (Tx + Rx)", qty: "1 set" },
      { part_name: "Polyurethane Landing Door Hanger Rollers (75mm)", spec: "High-density quiet glide bearing wheels with eccentric bush", qty: "4 units" },
      { part_name: "Safety Interlock Contact Blocks", spec: "Double break positive opening safety contacts (IP65)", qty: "2 units" },
      { part_name: "Door Operator Toothed Drive Belt (HTD-8M)", spec: "Steel-cord reinforced polyurethane synchronous timing belt", qty: "1 unit" }
    ],
    sop: [
      "Place 'ELEVATOR UNDER MAINTENANCE' physical barricades at every floor landing entrance.",
      "Switch controller from 'Normal' to 'Inspection' mode; verify landing call buttons are inhibited.",
      "Access car top from landing door using emergency key following strict EN 81 safety step rules.",
      "Inspect door operator belt, align infrared curtain detectors, and torque hanger roller eccentric bolts.",
      "Perform full-travel test run, verify door reversal sensitivity, and clear fault logs from controller memory."
    ],
    safety: {
      hazard_class: "High-Elevation Fall, Moving Mechanical Pinch & High Voltage",
      isolation: "Dual-key Lockout/Tagout at machine room main switchboard. Safety harness mandatory inside hoistway.",
      ppe: [
        { name: "Full Body Safety Harness with Double Lanyard", standard: "EN 361 Fall Arrest" },
        { name: "Industrial Hard Hat with Chin Strap", standard: "EN 397 High Impact" },
        { name: "Oil-Resistant Non-Slip Safety Boots", standard: "ASTM F2413 Oil & Acid Resistant" },
        { name: "Precision Mechanical Dexterity Gloves", standard: "EN 388 High Dexterity" }
      ],
      environmental_guideline: "Clean hoistway pit of grease accumulation; dispose of contaminated cleaning rags in hazardous waste barrels."
    }
  }
};

/**
 * Intelligently classify the defect from the complaint title, description, and category
 * to return 100% specific, non-generic replacement parts, tools, and protocols.
 */
export function getEquipmentRequirements(request = {}) {
  const title = (request.title || '').toLowerCase();
  const desc = (request.description || '').toLowerCase();
  const category = (request.category || '').toLowerCase();
  const rawAssetCode = (request.asset_code || '').toUpperCase();
  const text = `${title} ${desc} ${category} ${rawAssetCode}`.toLowerCase();

  const testWords = (str, words) => {
    return words.some(w => {
      const rx = new RegExp('\\b' + w + '\\b', 'i');
      return rx.test(str);
    });
  };

  let spec = null;

  // 1. Elevators & Vertical Transit
  if (testWords(title, ['elevator', 'elevators', 'lift', 'lifts', 'hoist', 'hoistway', 'cabin']) || category === 'elevator' || testWords(text, ['stuck between floors', 'elevator hoistway', 'elevator cabin'])) {
    spec = DEFECT_SPECIFICATIONS.ELEVATOR;
  }
  // 2. Ceiling Fans & Regulators
  else if (testWords(title, ['fan', 'fans', 'regulator', 'ceiling fan']) || (category === 'electrical' && testWords(text, ['fan', 'fans', 'regulator', 'ceiling fan']))) {
    spec = DEFECT_SPECIFICATIONS.CEILING_FAN;
  }
  // 3. Air Conditioning & HVAC Systems
  else if (testWords(title, ['ac', 'aircon', 'air conditioner', 'split ac', 'chiller', 'hvac', 'cooling', 'compressor']) || category === 'hvac') {
    if (testWords(text, ['leak', 'leaking', 'drip', 'dripping', 'drain', 'drainage', 'condensate', 'water'])) {
      spec = DEFECT_SPECIFICATIONS.AC_LEAKAGE;
    } else {
      spec = DEFECT_SPECIFICATIONS.AC_COOLING;
    }
  }
  // 4. Pumps & Hydro Systems
  else if (testWords(title, ['pump', 'pumps', 'booster', 'motor', 'hydro', 'submersible']) || (category === 'plumbing' && testWords(text, ['pump', 'booster', 'hydro', 'flooding']))) {
    spec = DEFECT_SPECIFICATIONS.WATER_PUMP;
  }
  // 5. Restroom Taps, Sinks & Plumbing Fixtures
  else if (testWords(title, ['tap', 'taps', 'faucet', 'faucets', 'sink', 'toilet', 'flush', 'washbasin', 'pipe', 'plumbing', 'drainage']) || category === 'plumbing') {
    spec = DEFECT_SPECIFICATIONS.SANITARY_TAP;
  }
  // 6. Classroom Chairs, Desks & Furniture
  else if (testWords(title, ['chair', 'chairs', 'desk', 'desks', 'table', 'bench', 'furniture', 'armrest', 'seat']) || category === 'furniture' || testWords(text, ['armrest', 'wobbly chair', 'casters', 'desk screw'])) {
    spec = DEFECT_SPECIFICATIONS.FURNITURE;
  }
  // 7. Lighting & Troffer Fixtures
  else if (testWords(title, ['light', 'lights', 'lighting', 'troffer', 'bulb', 'led', 'tube', 'tubelight']) || (category === 'electrical' && testWords(text, ['light', 'lights', 'troffer', 'bulb', 'flicker', 'led', 'tube']))) {
    spec = DEFECT_SPECIFICATIONS.LIGHTING;
  }
  // 8. Heavy Doors, Closers & Civil Carpentry
  else if (testWords(title, ['door', 'doors', 'closer', 'hinge', 'hinges', 'lock', 'locks', 'window', 'civil', 'carpentry']) || category === 'civil' || testWords(text, ['door closer', 'exit door', 'door lock'])) {
    spec = DEFECT_SPECIFICATIONS.DOORS_CIVIL;
  }
  // 9. High-Voltage Electrical Panels, Switchgear & Power
  else if (testWords(title, ['panel', 'spark', 'sparking', 'mcb', 'mccb', 'switchboard', 'breaker', 'distribution', 'busbar', 'short circuit', 'burning odor']) || category === 'electrical') {
    spec = DEFECT_SPECIFICATIONS.ELECTRICAL_PANEL;
  }
  // 10. Fallback by Category
  else if (category.includes('elect')) {
    spec = DEFECT_SPECIFICATIONS.ELECTRICAL_PANEL;
  } else if (category.includes('plumb')) {
    spec = DEFECT_SPECIFICATIONS.SANITARY_TAP;
  } else if (category.includes('furn')) {
    spec = DEFECT_SPECIFICATIONS.FURNITURE;
  } else if (category.includes('civil')) {
    spec = DEFECT_SPECIFICATIONS.DOORS_CIVIL;
  } else {
    spec = DEFECT_SPECIFICATIONS.AC_COOLING;
  }

  const assetName = request.asset_name || spec.equipment_name;
  const assetCode = request.asset_code || (
    spec === DEFECT_SPECIFICATIONS.CEILING_FAN ? 'FAN-LIBRARY-NORTH' :
    spec === DEFECT_SPECIFICATIONS.ELECTRICAL_PANEL ? 'PANEL-MAIN-A' :
    spec === DEFECT_SPECIFICATIONS.LIGHTING ? 'LIGHT-CORR-01' :
    spec === DEFECT_SPECIFICATIONS.AC_COOLING ? 'AC-BLOCKA-203' :
    spec === DEFECT_SPECIFICATIONS.AC_LEAKAGE ? 'AC-BLOCKA-203' :
    spec === DEFECT_SPECIFICATIONS.WATER_PUMP ? 'PUMP-HYDRO-01' :
    spec === DEFECT_SPECIFICATIONS.SANITARY_TAP ? 'PLUMB-WASH-04' :
    spec === DEFECT_SPECIFICATIONS.FURNITURE ? 'DESK-AUD-ROW-E' :
    spec === DEFECT_SPECIFICATIONS.DOORS_CIVIL ? 'DOOR-AUD-EXIT' :
    'EQ-CAMPUS-701'
  );

  return {
    equipment_profile: {
      asset_name: assetName,
      asset_code: assetCode,
      category: spec.category,
      model_spec: spec.model_spec,
      operating_cycle: spec.operating_cycle,
      installed_year: request.installation_date || "2021 (Lifespan: 5.2 yrs)",
      criticality_band: request.priority_level === 'CRITICAL' ? 'Class A Critical Infrastructure' : 'Class B Operational Asset',
      target_component: spec.target_component,
      location: request.location || request.building || "Campus Facility"
    },
    work_requirements: {
      trade_specialization: spec.trade_specialization,
      estimated_duration: spec.estimated_duration,
      crew_allocation: spec.crew_allocation,
      required_tools: spec.tools,
      replacement_parts: spec.parts,
      standard_operating_procedure: spec.sop
    },
    safety_protocols: spec.safety
  };
}
