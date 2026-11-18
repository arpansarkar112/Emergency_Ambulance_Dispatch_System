import "dotenv/config";
import { Role, AmbulanceType, AmbulanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const demoPassword = await bcrypt.hash("password123", 10);

  // 1. Ensure Demo Accounts exist
  const admin = await prisma.user.upsert({
    where: { email: "admin@ambulance.com" },
    update: {},
    create: {
      email: "admin@ambulance.com",
      password: adminPassword,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          firstName: "Dr. Elena",
          lastName: "Vance",
          phone: "+1-800-911-0100",
          address: "Central Medical Dispatch HQ, Suite 400",
        },
      },
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: "driver@ambulance.com" },
    update: {},
    create: {
      email: "driver@ambulance.com",
      password: demoPassword,
      role: Role.DRIVER,
      isVerified: true,
      profile: {
        create: {
          firstName: "Marcus",
          lastName: "Chen",
          phone: "+1-555-019-2834",
          address: "Station 04 — Midtown Trauma Hub",
        },
      },
    },
  });

  const driver2 = await prisma.user.upsert({
    where: { email: "sarah.paramedic@ambulance.com" },
    update: {},
    create: {
      email: "sarah.paramedic@ambulance.com",
      password: demoPassword,
      role: Role.DRIVER,
      isVerified: true,
      profile: {
        create: {
          firstName: "Sarah",
          lastName: "Jenkins",
          phone: "+1-555-019-4410",
          address: "Station 02 — Riverside General Bay",
        },
      },
    },
  });

  const patient = await prisma.user.upsert({
    where: { email: "arpansarkar112@gmail.com" },
    update: {},
    create: {
      email: "arpansarkar112@gmail.com",
      password: demoPassword,
      role: Role.PATIENT,
      isVerified: true,
      profile: {
        create: {
          firstName: "Arpan",
          lastName: "Sarkar",
          phone: "+1-555-014-8821",
          address: "742 Parkview Avenue, Metro City",
        },
      },
    },
  });

  // 2. Seed Fleet Categories
  const categoryData = [
    {
      name: "Mobile ICU & Critical Care",
      slug: "mobile-icu",
      ambulanceType: AmbulanceType.ICU,
      description:
        "Hospital-grade mobile intensive care units staffed with critical care paramedics, transport ventilators, and 12-lead cardiac telemetry for High and Critical emergencies.",
      basePriceRange: "$180 – $300",
      responseSla: "5–8 mins",
      imageUrl: "/images/icu-ambulance-exterior.jpg",
    },
    {
      name: "Basic Life Support (BLS)",
      slug: "basic-life-support",
      ambulanceType: AmbulanceType.BASIC,
      description:
        "Rapid-response emergency transport equipped with AED defibrillators, medical oxygen delivery, spinal immobilization, and continuous vital monitoring for Medium and Low priority calls.",
      basePriceRange: "$75 – $130",
      responseSla: "7–10 mins",
      imageUrl: "/images/bls-ambulance-exterior.jpg",
    },
    {
      name: "Pediatric & Neonatal Care",
      slug: "pediatric-neonatal",
      ambulanceType: AmbulanceType.PEDIATRIC,
      description:
        "Purpose-built neonatal and pediatric transport units featuring temperature-controlled incubators, air-ride stabilization suspension, and child-calibrated airway resuscitation gear.",
      basePriceRange: "$160 – $240",
      responseSla: "6–9 mins",
      imageUrl: "/images/pediatric-ambulance.jpg",
    },
    {
      name: "Inter-Hospital Cardiac Transfer",
      slug: "cardiac-transfer",
      ambulanceType: AmbulanceType.ICU,
      description:
        "Dedicated bed-to-bed telemetry transport coordinating directly between trauma centers, cath labs, and specialty cardiac hospitals with multi-channel infusion pumps.",
      basePriceRange: "$210 – $320",
      responseSla: "Scheduled / 8 mins",
      imageUrl: "/images/icu-ambulance-interior.jpg",
    },
  ];

  const categoriesBySlug: Record<string, any> = {};
  for (const cat of categoryData) {
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        ambulanceType: cat.ambulanceType,
        description: cat.description,
        basePriceRange: cat.basePriceRange,
        responseSla: cat.responseSla,
        imageUrl: cat.imageUrl,
      },
      create: cat,
    });
    categoriesBySlug[cat.slug] = saved;
  }

  // 3. Seed & Enrich Fleet Ambulances (10 units across all tiers)
  const fleetSeed = [
    {
      vehicleNumber: "MED-ICU-101",
      title: "Apex Mobile ICU Unit 101",
      description:
        "Flagship critical care unit stationed at Midtown Trauma Hub with Hamilton transport ventilator, Zoll X-Series cardiac defibrillator, and dual-paramedic ICU crew.",
      type: AmbulanceType.ICU,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 225,
      capacity: 3,
      responseTime: "5-7 mins",
      featured: true,
      currentAddress: "Midtown Trauma Hub, 410 Medical Plaza",
      categoryId: categoriesBySlug["mobile-icu"].id,
      driverId: driver.id,
      images: [
        "/images/icu-ambulance-exterior.jpg",
        "/images/icu-ambulance-interior.jpg",
        "/images/paramedic-team.jpg",
      ],
      specifications: [
        "Hamilton-T1 Transport Mechanical Ventilator",
        "12-Lead Cardiac Defibrillator & Telemetry",
        "4-Channel Smart Infusion Syringe Pumps",
        "Dual 3,000L Medical Oxygen Manifolds",
        "Advanced Intubation & Trauma Stabilization Kit",
        "Real-Time Hospital ER Pre-Alert Link",
      ],
    },
    {
      vehicleNumber: "MED-BLS-204",
      title: "Metro Rapid BLS Unit 204",
      description:
        "Agile urban Basic Life Support unit built for rapid neighborhood navigation, emergency stabilization, oxygen therapy, and comfortable patient transport.",
      type: AmbulanceType.BASIC,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 95,
      capacity: 2,
      responseTime: "6-9 mins",
      featured: true,
      currentAddress: "Northgate Clinic Bay, 128 Elm Street",
      categoryId: categoriesBySlug["basic-life-support"].id,
      driverId: driver2.id,
      images: [
        "/images/bls-ambulance-exterior.jpg",
        "/images/bls-ambulance-interior.jpg",
        "/images/paramedic-team.jpg",
      ],
      specifications: [
        "Automated External Defibrillator (AED)",
        "Stryker Power-PRO XT Hydraulic Stretcher",
        "Continuous Pulse Oximetry & BP Monitoring",
        "Portable Medical Oxygen & Nebulizer Kit",
        "Full Spinal & Fracture Immobilization Pack",
        "HEPA Negative-Pressure Cabin Filtration",
      ],
    },
    {
      vehicleNumber: "MED-PED-301",
      title: "Guardian Pediatric & NICU Unit 301",
      description:
        "Specialized pediatric and neonatal intensive transport unit featuring an active thermal incubator, gentle hydraulic air suspension, and dedicated parent companion seating.",
      type: AmbulanceType.PEDIATRIC,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 195,
      capacity: 3,
      responseTime: "6-8 mins",
      featured: true,
      currentAddress: "St. Jude Children's Wing, 88 Harbor Road",
      categoryId: categoriesBySlug["pediatric-neonatal"].id,
      driverId: driver2.id,
      images: [
        "/images/pediatric-ambulance.jpg",
        "/images/icu-ambulance-interior.jpg",
        "/images/paramedic-team.jpg",
      ],
      specifications: [
        "Airborne Voyager Neonatal Transport Incubator",
        "Pediatric-Calibrated Cardiac & SpO2 Monitor",
        "Heated Humidified High-Flow Oxygen",
        "Low-Vibration Air-Ride Suspension System",
        "Child & Infant Airway Resuscitation Suite",
        "Dedicated Parent Safety Seat Inside Cabin",
      ],
    },
    {
      vehicleNumber: "MED-ICU-108",
      title: "Cardiac Cath-Lab Express 108",
      description:
        "Dedicated STEMI and inter-hospital cardiac transfer ambulance transmitting live 12-lead ECG traces directly to receiving cardiologists en route.",
      type: AmbulanceType.ICU,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 260,
      capacity: 3,
      responseTime: "5-8 mins",
      featured: true,
      currentAddress: "Heart & Vascular Institute, 900 Westside Blvd",
      categoryId: categoriesBySlug["cardiac-transfer"].id,
      driverId: driver.id,
      images: [
        "/images/icu-ambulance-interior.jpg",
        "/images/icu-ambulance-exterior.jpg",
        "/images/blog-cardiac-response.jpg",
      ],
      specifications: [
        "Live 5G 12-Lead ECG Hospital Telemetry",
        "Biphasic Defibrillator with External Pacing",
        "Portable Blood Gas & Troponin Analyzer",
        "Invasive Arterial Line Monitoring Module",
        "Dual-Battery Redundant Medical Power",
        "Critical Care Nurse & Paramedic Crew",
      ],
    },
    {
      vehicleNumber: "MED-BLS-212",
      title: "Eastside Community BLS 212",
      description:
        "Reliable daytime and overnight BLS dispatch vehicle serving residential eastside neighborhoods and urgent care clinics with fast arrival times.",
      type: AmbulanceType.BASIC,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 85,
      capacity: 2,
      responseTime: "7-10 mins",
      featured: false,
      currentAddress: "Eastside Urgent Care Station, 55 Oakwood Dr",
      categoryId: categoriesBySlug["basic-life-support"].id,
      driverId: driver.id,
      images: [
        "/images/bls-ambulance-interior.jpg",
        "/images/bls-ambulance-exterior.jpg",
      ],
      specifications: [
        "Automated External Defibrillator (AED)",
        "Dual-Cylinder Oxygen Supply",
        "Ergonomic Multi-Position Patient Cot",
        "Trauma Bandaging & Burn Care Kit",
        "GPS Route Optimization Terminal",
      ],
    },
    {
      vehicleNumber: "MED-ICU-115",
      title: "Trauma Command ICU 115",
      description:
        "Heavy-duty highway and industrial trauma response Mobile ICU equipped for multi-injury stabilization, hemorrhage control, and ventilator-assisted transit.",
      type: AmbulanceType.ICU,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 245,
      capacity: 3,
      responseTime: "6-9 mins",
      featured: false,
      currentAddress: "Metro Highway Patrol Hub, Exit 14",
      categoryId: categoriesBySlug["mobile-icu"].id,
      driverId: driver2.id,
      images: [
        "/images/icu-ambulance-exterior.jpg",
        "/images/paramedic-team.jpg",
        "/images/icu-ambulance-interior.jpg",
      ],
      specifications: [
        "Portable Ultrasound (POCUS) FAST Scanner",
        "Rapid Fluid Warmer & IV Infuser",
        "Transport Mechanical Ventilator",
        "Pelvic Binders & Junctional Tourniquet Suite",
        "360-Degree Emergency Scene Floodlighting",
      ],
    },
    {
      vehicleNumber: "MED-PED-309",
      title: "Sunrise Pediatric Transport 309",
      description:
        "Calm, reassuring pediatric emergency ambulance with ambient cabin lighting, infant respiratory support, and certified pediatric EMT specialists.",
      type: AmbulanceType.PEDIATRIC,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 175,
      capacity: 3,
      responseTime: "7-10 mins",
      featured: false,
      currentAddress: "Westbrook Family Hospital, 230 Cedar Ln",
      categoryId: categoriesBySlug["pediatric-neonatal"].id,
      driverId: driver.id,
      images: [
        "/images/pediatric-ambulance.jpg",
        "/images/bls-ambulance-interior.jpg",
      ],
      specifications: [
        "Pediatric Stretcher Harness & Restraint System",
        "Infant & Child Nebulizer Respiratory Station",
        "Non-Invasive Capnography & SpO2 Sensor",
        "Acoustic Cabin Dampening for Patient Comfort",
        "Dedicated Family Attendant Seat",
      ],
    },
    {
      vehicleNumber: "MED-BLS-219",
      title: "Harbor Inter-Clinic Transfer 219",
      description:
        "Scheduled and urgent non-critical transfer ambulance engineered for dialysis, post-operative discharge, and diagnostic imaging transfers.",
      type: AmbulanceType.BASIC,
      status: AmbulanceStatus.AVAILABLE,
      basePrice: 75,
      capacity: 2,
      responseTime: "8-12 mins",
      featured: false,
      currentAddress: "Harbor View Medical Annex, 14 Pier Way",
      categoryId: categoriesBySlug["basic-life-support"].id,
      driverId: driver2.id,
      images: [
        "/images/bls-ambulance-exterior.jpg",
        "/images/bls-ambulance-interior.jpg",
      ],
      specifications: [
        "Bariatric-Rated Hydraulic Stretcher",
        "Continuous Oxygen & Vital Monitoring",
        "Wheelchair Lock-In Transfer Bay",
        "Climate-Controlled Quiet Suspension Cabin",
      ],
    },
  ];

  const seededAmbulances: any[] = [];
  for (const unit of fleetSeed) {
    const saved = await prisma.ambulance.upsert({
      where: { vehicleNumber: unit.vehicleNumber },
      update: {
        title: unit.title,
        description: unit.description,
        basePrice: unit.basePrice,
        capacity: unit.capacity,
        responseTime: unit.responseTime,
        featured: unit.featured,
        categoryId: unit.categoryId,
        images: unit.images,
        specifications: unit.specifications,
      },
      create: unit,
    });
    seededAmbulances.push(saved);
  }

  // Enrich any pre-existing ambulances missing titles/images
  const legacyUnits = await prisma.ambulance.findMany({
    where: { deletedAt: null, OR: [{ title: null }, { images: { isEmpty: true } }] },
  });
  for (const unit of legacyUnits) {
    const isIcu = unit.type === "ICU";
    const isPed = unit.type === "PEDIATRIC";
    await prisma.ambulance.update({
      where: { id: unit.id },
      data: {
        title:
          unit.title ||
          (isIcu
            ? `Mobile ICU Unit ${unit.vehicleNumber}`
            : isPed
              ? `Pediatric Care Unit ${unit.vehicleNumber}`
              : `BLS Response Unit ${unit.vehicleNumber}`),
        description:
          unit.description ||
          (isIcu
            ? "Critical care Mobile ICU equipped with mechanical ventilation, cardiac monitoring, and ICU paramedics."
            : isPed
              ? "Specialized Pediatric & Neonatal ambulance configured for gentle, temperature-controlled child transport."
              : "Certified Basic Life Support ambulance for urgent medical response and hospital transfers."),
        basePrice: unit.basePrice || (isIcu ? 210 : isPed ? 180 : 95),
        categoryId:
          unit.categoryId ||
          (isIcu
            ? categoriesBySlug["mobile-icu"].id
            : isPed
              ? categoriesBySlug["pediatric-neonatal"].id
              : categoriesBySlug["basic-life-support"].id),
        images:
          unit.images.length > 0
            ? unit.images
            : isIcu
              ? ["/images/icu-ambulance-exterior.jpg", "/images/icu-ambulance-interior.jpg"]
              : isPed
                ? ["/images/pediatric-ambulance.jpg", "/images/icu-ambulance-interior.jpg"]
                : ["/images/bls-ambulance-exterior.jpg", "/images/bls-ambulance-interior.jpg"],
        specifications:
          unit.specifications.length > 0
            ? unit.specifications
            : isIcu
              ? ["Transport Ventilator", "12-Lead Cardiac Defibrillator", "Dual Oxygen Manifolds", "4-Channel Infusion Pumps"]
              : ["AED Defibrillator", "Hydraulic Stretcher", "Medical Oxygen Supply", "Vital Signs Monitor"],
      },
    });
  }

  // 4. Seed Verified Reviews (only if none exist yet)
  const existingReviewCount = await prisma.review.count();
  if (existingReviewCount === 0 && seededAmbulances.length >= 4) {
    const reviewsData = [
      {
        ambulanceId: seededAmbulances[0].id,
        userId: patient.id,
        rating: 5,
        title: "Life-saving cardiac response in 6 minutes",
        comment:
          "When my father experienced acute chest pain, CallAmbulance matched us immediately with Apex Mobile ICU 101. The paramedics started 12-lead ECG monitoring inside our living room and alerted the ER before we even arrived.",
      },
      {
        ambulanceId: seededAmbulances[1].id,
        userId: patient.id,
        rating: 5,
        title: "Calm, spotless, and transparent billing",
        comment:
          "Booked BLS Unit 204 for a post-surgical emergency transfer. Seeing live driver status updates took away so much anxiety, and the Stripe invoice arrived clearly itemized only after hospital admission.",
      },
      {
        ambulanceId: seededAmbulances[2].id,
        userId: driver.id,
        rating: 5,
        title: "Best pediatric transport cabin in the city",
        comment:
          "Guardian Pediatric Unit 301 kept our infant daughter warm and calm throughout the entire transfer to St. Jude. Having a dedicated seat right beside her made all the difference.",
      },
      {
        ambulanceId: seededAmbulances[3].id,
        userId: patient.id,
        rating: 5,
        title: "Seamless cath-lab handover",
        comment:
          "Our cardiology clinic relies on Cath-Lab Express 108 for urgent inter-facility transfers. Zero handover friction and consistently punctual paramedic crews.",
      },
      {
        ambulanceId: seededAmbulances[0].id,
        userId: driver2.id,
        rating: 4,
        title: "Well-maintained ventilator & telemetry setup",
        comment:
          "Cabin layout is ergonomic even in dense traffic. Every critical medication and airway supply is clearly labeled and restocked after each dispatch.",
      },
    ];

    for (const r of reviewsData) {
      await prisma.review.create({ data: r });
    }

    // Recalculate unit ratings
    for (const amb of seededAmbulances) {
      const agg = await prisma.review.aggregate({
        where: { ambulanceId: amb.id },
        _avg: { rating: true },
        _count: { id: true },
      });
      if (agg._count.id > 0) {
        await prisma.ambulance.update({
          where: { id: amb.id },
          data: {
            rating: Number((agg._avg.rating || 4.9).toFixed(1)),
            reviewCount: agg._count.id,
          },
        });
      }
    }
  }

  // 5. Seed Emergency Medical Blog Posts
  const blogPosts = [
    {
      slug: "understanding-the-golden-hour-in-cardiac-emergencies",
      title: "Understanding the Golden Hour in Acute Cardiac Emergencies",
      excerpt:
        "Why criticality-matched Mobile ICU dispatch and pre-hospital 12-lead ECG telemetry dramatically improve survival rates during cardiac events.",
      category: "Critical Care",
      authorName: "Dr. Elena Vance, MD",
      authorRole: "Chief Medical Dispatch Officer",
      coverImage: "/images/blog-cardiac-response.jpg",
      readTime: "6 min read",
      content: `In emergency medicine, the first 60 minutes following the onset of a severe cardiac or trauma event are widely known as the "Golden Hour." Every minute of delayed stabilization increases myocardial damage and raises the likelihood of secondary complications.

Traditional ambulance dispatch often suffers from two avoidable bottlenecks: ambiguous phone triage and dispatching the closest available vehicle regardless of whether it carries intensive-care instrumentation. When a Basic Life Support van arrives at a critical STEMI call, paramedics must request secondary ALS backup—costing precious minutes.

### How Criticality-Matched Allocation Changes Outcomes
At CallAmbulance, every incoming emergency request is triaged into four clear urgency tiers (CRITICAL, HIGH, MEDIUM, and LOW). High and Critical requests automatically enforce strict Mobile ICU allocation—guaranteeing that a transport ventilator, biphasic defibrillator, infusion pumps, and ICU-certified crew arrive on the very first dispatch.

### Pre-Hospital Telemetry and ER Pre-Alert
Once paramedics place 12-lead ECG leads on the patient, real-time tracings are transmitted directly to the destination hospital's emergency department. This enables catheterization teams to scrub in and prepare the bay before the ambulance doors open, trimming door-to-balloon times by up to 22 minutes.

### What Families Should Do While Waiting
1. Keep the patient seated or lying comfortably and loosen tight clothing around the chest and neck.
2. Unlock exterior doors and turn on porch or hallway lights so the crew can locate the entrance rapidly.
3. Gather current prescription lists, allergy notes, and recent discharge papers into one folder.
4. Keep your registered phone line clear in case the assigned driver calls for building access.`,
    },
    {
      slug: "icu-vs-bls-ambulance-how-to-choose-the-right-care-tier",
      title: "Mobile ICU vs. Basic Life Support: Choosing the Right Care Tier",
      excerpt:
        "A practical guide for patients, caregivers, and clinic coordinators on matching symptoms and transfer needs to the appropriate ambulance configuration.",
      category: "Triage Guide",
      authorName: "Marcus Chen, NRP",
      authorRole: "Lead Critical Care Paramedic",
      coverImage: "/images/icu-ambulance-interior.jpg",
      readTime: "5 min read",
      content: `Choosing the right level of medical transport ensures patients receive the exact clinical support they need without unnecessary delays or costs. While our dispatch coordinators verify every booking before unit allocation, understanding the difference between Basic Life Support (BLS), Mobile ICU (ALS), and Pediatric Care units helps caregivers request help faster.

### When to Request a Basic Life Support (BLS) Unit
BLS ambulances are ideal for Low and Medium priority medical situations where the patient is breathing independently and hemodynamically stable. Common scenarios include:
- Suspected limb fractures, sprains, or controlled minor trauma
- Scheduled inter-hospital transfers or post-operative hospital discharges
- Non-acute respiratory discomfort requiring supplemental low-flow oxygen
- Diagnostic imaging or dialysis transport for non-ambulatory patients

### When a Mobile ICU Unit Is Essential
High and Critical requests strictly require a Mobile ICU unit equipped with advanced airway management, continuous cardiac telemetry, IV vasoactive infusions, and ventilator support:
- Chest pain, sudden shortness of breath, or suspected stroke symptoms
- Loss of consciousness, active seizures, or severe allergic reactions (anaphylaxis)
- Major accident trauma or uncontrolled bleeding
- Critically ill ICU-to-ICU hospital transfers

### Pediatric & Neonatal Specialists
Children are not small adults—their airways, thermal regulation, and medication dosages require specialized pediatric instrumentation and air-ride shock absorption. Our Pediatric Care fleet carries thermal incubators and child-sized monitors alongside dedicated parent seating.`,
    },
    {
      slug: "how-live-dispatch-telemetry-reduces-arrival-anxiety",
      title: "How Live Dispatch Telemetry Reduces Arrival Times and Family Anxiety",
      excerpt:
        "Inside our 24/7 digital dispatch workflow—from instant ambulance allocation and live driver checkpoints to transparent post-trip digital billing.",
      category: "Dispatch Operations",
      authorName: "Sarah Jenkins, EMT-P",
      authorRole: "Fleet Readiness Supervisor",
      coverImage: "/images/dispatch-command.jpg",
      readTime: "4 min read",
      content: `Waiting for an ambulance without knowing whether a vehicle has been assigned or how close it is feels like an eternity. Modern digital dispatch replaces guesswork with real-time operational clarity for patients, drivers, and dispatch administrators alike.

### Four Clear Status Checkpoints
Rather than leaving patients wondering after placing a call, CallAmbulance surfaces live status milestones directly in the Patient Dashboard:
- **ASSIGNED:** A certified, criticality-matched unit and named driver have accepted the mission.
- **EN_ROUTE:** The ambulance is actively navigating toward the pickup address with one-tap phone contact enabled.
- **PICKED_UP:** The patient is stabilized onboard and en route to the receiving hospital.
- **COMPLETED:** Safe handover at the destination ER is logged, automatically releasing the unit back into the available pool.

### Zero Financial Friction During an Emergency
No patient or caregiver should ever have to enter a credit card during a medical crisis. CallAmbulance intentionally separates emergency response from billing: units are dispatched immediately with zero upfront deposit, and itemized Stripe invoices are issued only after safe hospital delivery.`,
    },
    {
      slug: "home-emergency-readiness-checklist-for-families-and-seniors",
      title: "Home Emergency Readiness Checklist for Families and Older Adults",
      excerpt:
        "Five simple preparations you can complete in 15 minutes today so emergency responders have instant access to vital medical details when seconds count.",
      category: "Preparedness",
      authorName: "Dr. Priya Nair, MD",
      authorRole: "Emergency Medicine Advisor",
      coverImage: "/images/paramedic-team.jpg",
      readTime: "5 min read",
      content: `Most medical emergencies happen at home—and often when family members are panicked or alone. Taking 15 minutes on a calm afternoon to organize your household's medical profile can save crucial time during an urgent dispatch.

### 1. Keep Your Digital Profile Complete
In your CallAmbulance Profile settings, save your exact residential pickup address (including gate codes or apartment floor), primary phone number, blood group, and an emergency contact. Having accurate contact details lets drivers reach building security immediately upon arrival.

### 2. Maintain an Updated Medication Card
List every prescription medication, dosage, chronic condition (such as diabetes, atrial fibrillation, or asthma), and known drug allergies. Keep a printed copy near the refrigerator and update it after every doctor visit.

### 3. Ensure House Numbers Are Visible at Night
Reflective address numbers clearly visible from the street help emergency crews find your residence quickly in rain, fog, or darkness.

### 4. Know Your Nearest Specialty Trauma & Cardiac Centers
While paramedics always follow regional hospital diversion guidelines, knowing which nearby facility holds stroke or cardiac certification helps streamline destination decisions during booking.`,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        authorName: post.authorName,
        authorRole: post.authorRole,
        coverImage: post.coverImage,
        readTime: post.readTime,
      },
      create: post,
    });
  }

  console.log("Seed complete:", {
    admin: admin.email,
    driver: driver.email,
    patient: patient.email,
    categories: Object.keys(categoriesBySlug).length,
    ambulancesSeeded: seededAmbulances.length,
    blogPosts: blogPosts.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
