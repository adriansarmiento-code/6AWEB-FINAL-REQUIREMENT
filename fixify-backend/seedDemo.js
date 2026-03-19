/**
 * ═══════════════════════════════════════════════════════════
 *  Fixify — Demo Seed Script
 *  Simulates ~1 month of activity for demo / screenshots
 *
 *  Run from: C:\FINAL-PROJECT-AWEB\fixify-backend\
 *  Command:  node seedDemo.js
 * ═══════════════════════════════════════════════════════════
 */
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]); 

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ──────────────────────────────────────────────────
const User         = require('./src/models/User');
const Booking      = require('./src/models/Booking');
const Review       = require('./src/models/Review');
const Notification = require('./src/models/Notification');

// ── DB Connect ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌  No MONGO_URI found in .env');
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randF  = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

/** Return a Date that is `daysAgo` days in the past (±3h jitter) */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(rand(7, 18), rand(0, 59), 0, 0);
  return d;
};

const hashPw = async (pw) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
};

// ── Static data pools ────────────────────────────────────────

const AREAS = [
  'Angeles City Center',
  'Balibago',
  'Nepo Mall Area',
  'Marquee Mall Area',
  'Clark',
];

const TIME_SLOTS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
];

const ADDRESSES = [
  '123 Santos St., Balibago, Angeles City',
  '45 Rizal Ave., Angeles City Center',
  '78 MacArthur Hwy., Balibago, Angeles City',
  '12 Mabini St., Nepo Mall Area, Angeles City',
  '9 Sto. Rosario St., Angeles City Center',
  '33 Friendship Hwy., Clark, Angeles City',
  '67 Pampang Rd., Marquee Mall Area, Angeles City',
  '100 Hensonville Blvd., Angeles City',
  '22 Villa Gloria Subdivision, Balibago',
  '5 Pulung Maragul, Angeles City',
];

const REVIEW_COMMENTS = {
  5: [
    'Absolutely excellent work! Arrived on time, very professional, and finished the job perfectly. Will definitely book again.',
    'Outstanding service! Fixed the problem quickly and explained everything clearly. Highly recommended.',
    'Best home service experience I\'ve had. Neat, efficient, and reasonably priced.',
    'Very impressed! The provider was courteous and skilled. My issue was resolved same day.',
    'Five stars without hesitation. Great communication, great results.',
  ],
  4: [
    'Really good service overall. Minor delay but the work quality was excellent.',
    'Professional and knowledgeable. Would hire again.',
    'Good job done at a fair price. Happy with the results.',
    'Solid work, no complaints. Came prepared with all the right tools.',
    'Very satisfied. Quick response and clean work.',
  ],
  3: [
    'Decent work but took longer than expected. Still got the job done.',
    'Okay service. Nothing exceptional but no major complaints either.',
    'Average experience. The result was acceptable but communication could be better.',
    'Work was fine, just a bit pricey for what was done.',
  ],
  2: [
    'Was late by almost two hours with no update. Work was okay though.',
    'Not fully satisfied — had to follow up multiple times.',
  ],
};

const PROVIDER_RESPONSES = [
  'Thank you for your kind review! It was a pleasure working with you.',
  'Appreciate the feedback! Looking forward to serving you again.',
  'Thank you! We always aim for the highest quality. See you next time.',
  'We appreciate your honest review and will continue to improve our service.',
  'Thank you so much! Your satisfaction is our priority.',
];

// ── Provider definitions ──────────────────────────────────────

const PROVIDERS_DATA = [
  // ── PLUMBING (5) ────────────────────────────────────────────
  {
    name: 'Roberto Dela Cruz',
    email: 'roberto.delacruz@fixify.ph',
    phone: '09171234501',
    category: 'plumbing',
    area: 'Angeles City Center',
    years: 12,
    rate: 400,
    bio: 'Licensed master plumber with 12 years of experience serving Angeles City households. Specializes in pipe repairs, water heater installation, and emergency leak response.',
    skills: ['Pipe Repair', 'Leak Detection', 'Water Heater Installation', 'Drain Cleaning', 'Fixture Installation'],
    verified: true,
    services: [
      { name: 'Pipe Leak Repair',        price: 650,  description: 'Locate and repair pipe leaks including wall-embedded pipes.' },
      { name: 'Drain Cleaning',          price: 500,  description: 'Clear clogged drains using professional equipment.' },
      { name: 'Water Heater Installation', price: 1200, description: 'Install and commission water heaters (unit not included).' },
      { name: 'Toilet Repair / Replace', price: 800,  description: 'Repair or replace toilet bowl assemblies.' },
    ],
    rating: 4.8, reviewCount: 24, completedJobs: 31,
  },
  {
    name: 'Nestor Aquino',
    email: 'nestor.aquino@fixify.ph',
    phone: '09171234502',
    category: 'plumbing',
    area: 'Balibago',
    years: 8,
    rate: 350,
    bio: 'Experienced plumber covering Balibago and surrounding areas. Fast response time and transparent pricing.',
    skills: ['Leak Detection', 'Pipe Installation', 'Faucet Repair', 'Bathroom Renovation'],
    verified: true,
    services: [
      { name: 'Faucet Repair / Replace', price: 450,  description: 'Repair leaking or broken faucets.' },
      { name: 'Pipe Installation',       price: 900,  description: 'Install new water supply lines.' },
      { name: 'Bathroom Fixture Setup',  price: 1100, description: 'Complete bathroom fixture installation.' },
    ],
    rating: 4.5, reviewCount: 17, completedJobs: 22,
  },
  {
    name: 'Danilo Reyes',
    email: 'danilo.reyes@fixify.ph',
    phone: '09171234503',
    category: 'plumbing',
    area: 'Nepo Mall Area',
    years: 5,
    rate: 300,
    bio: 'Dependable plumber available 7 days a week. Handles residential and light commercial plumbing jobs.',
    skills: ['Residential Plumbing', 'Emergency Repairs', 'Water Line Repair'],
    verified: true,
    services: [
      { name: 'Emergency Leak Fix',      price: 700,  description: '24-hour emergency leak response.' },
      { name: 'Water Line Repair',       price: 850,  description: 'Repair main water supply lines.' },
      { name: 'General Plumbing Check',  price: 400,  description: 'Full inspection of home plumbing system.' },
    ],
    rating: 4.2, reviewCount: 11, completedJobs: 15,
  },
  {
    name: 'Armando Santos',
    email: 'armando.santos@fixify.ph',
    phone: '09171234504',
    category: 'plumbing',
    area: 'Clark',
    years: 15,
    rate: 500,
    bio: 'Senior plumber with 15 years of experience. Handles complex installations for residential and commercial properties in Clark.',
    skills: ['Commercial Plumbing', 'Pipe Rerouting', 'Pressure Testing', 'Water Heater', 'CCTV Drain Inspection'],
    verified: true,
    services: [
      { name: 'Full Plumbing Inspection', price: 1500, description: 'Comprehensive plumbing audit with written report.' },
      { name: 'Pipe Rerouting',           price: 2000, description: 'Reroute pipes for renovations or repairs.' },
      { name: 'Commercial Leak Repair',   price: 1800, description: 'Large-scale leak detection and repair.' },
    ],
    rating: 4.9, reviewCount: 38, completedJobs: 45,
  },
  {
    name: 'Mark Villanueva',
    email: 'mark.villanueva@fixify.ph',
    phone: '09171234505',
    category: 'plumbing',
    area: 'Marquee Mall Area',
    years: 3,
    rate: 280,
    bio: 'Young and dedicated plumber. Affordable rates, quality work, and always on time.',
    skills: ['Basic Plumbing', 'Faucet Repair', 'Toilet Repair', 'Drain Unclogging'],
    verified: false, // pending verification
    services: [
      { name: 'Basic Plumbing Repair',   price: 400,  description: 'General household plumbing repairs.' },
      { name: 'Toilet Unclogging',       price: 350,  description: 'Remove blockages from toilet systems.' },
    ],
    rating: 0, reviewCount: 0, completedJobs: 0,
  },

  // ── ELECTRICAL (5) ──────────────────────────────────────────
  {
    name: 'Edgar Mendoza',
    email: 'edgar.mendoza@fixify.ph',
    phone: '09181234501',
    category: 'electrical',
    area: 'Angeles City Center',
    years: 10,
    rate: 450,
    bio: 'Licensed electrician with 10 years of residential and commercial electrical work. PRC-licensed and fully insured.',
    skills: ['Wiring', 'Panel Upgrade', 'Outlet Installation', 'Circuit Breaker', 'LED Lighting'],
    verified: true,
    services: [
      { name: 'Outlet Installation',      price: 600,  description: 'Install new electrical outlets safely.' },
      { name: 'Circuit Breaker Repair',   price: 800,  description: 'Diagnose and repair circuit breaker issues.' },
      { name: 'Full House Rewiring',      price: 5000, description: 'Complete rewiring for residential properties.' },
      { name: 'LED Lighting Setup',       price: 700,  description: 'Install LED lighting fixtures and switches.' },
    ],
    rating: 4.7, reviewCount: 29, completedJobs: 36,
  },
  {
    name: 'Ronaldo Pascual',
    email: 'ronaldo.pascual@fixify.ph',
    phone: '09181234502',
    category: 'electrical',
    area: 'Balibago',
    years: 7,
    rate: 400,
    bio: 'Reliable electrician specializing in fault diagnosis and panel upgrades. Available for emergencies.',
    skills: ['Fault Diagnosis', 'Panel Upgrade', 'Generator Setup', 'Safety Inspection'],
    verified: true,
    services: [
      { name: 'Electrical Fault Diagnosis', price: 750,  description: 'Identify electrical faults and provide repair plan.' },
      { name: 'Panel Board Upgrade',        price: 2500, description: 'Upgrade old panel boards to modern standards.' },
      { name: 'Generator Connection',       price: 1500, description: 'Connect and test generator transfer switch.' },
    ],
    rating: 4.6, reviewCount: 21, completedJobs: 27,
  },
  {
    name: 'Ferdinand Cruz',
    email: 'ferdinand.cruz@fixify.ph',
    phone: '09181234503',
    category: 'electrical',
    area: 'Clark',
    years: 14,
    rate: 550,
    bio: 'Senior electrical engineer turned contractor. Handles large-scale residential and commercial electrical projects in Clark.',
    skills: ['Commercial Wiring', 'Load Calculation', 'Safety Audit', 'Solar Integration'],
    verified: true,
    services: [
      { name: 'Commercial Electrical Audit', price: 3000, description: 'Safety audit and compliance check.' },
      { name: 'New Construction Wiring',     price: 8000, description: 'Full electrical rough-in and finish for new builds.' },
      { name: 'Solar Panel Wiring',          price: 4000, description: 'Wire and integrate solar panel systems.' },
    ],
    rating: 4.9, reviewCount: 42, completedJobs: 51,
  },
  {
    name: 'Jerome Bautista',
    email: 'jerome.bautista@fixify.ph',
    phone: '09181234504',
    category: 'electrical',
    area: 'Nepo Mall Area',
    years: 4,
    rate: 350,
    bio: 'Affordable and skilled electrician for household repairs and installations.',
    skills: ['Outlet Repair', 'Switch Installation', 'Light Fixture', 'Basic Wiring'],
    verified: true,
    services: [
      { name: 'Switch & Outlet Repair',  price: 450,  description: 'Fix or replace faulty switches and outlets.' },
      { name: 'Ceiling Fan Installation', price: 600,  description: 'Install and wire ceiling fans.' },
      { name: 'Basic Home Wiring',       price: 1200, description: 'Wire new rooms or extensions.' },
    ],
    rating: 4.3, reviewCount: 14, completedJobs: 18,
  },
  {
    name: 'Jaypee Soriano',
    email: 'jaypee.soriano@fixify.ph',
    phone: '09181234505',
    category: 'electrical',
    area: 'Marquee Mall Area',
    years: 2,
    rate: 300,
    bio: 'New to Fixify but brings fresh technical training and dedication to every job.',
    skills: ['Basic Electrical', 'Outlet Installation', 'Light Repair'],
    verified: false, // pending
    services: [
      { name: 'Basic Electrical Repair', price: 400, description: 'General household electrical fixes.' },
      { name: 'Light Fixture Repair',    price: 350, description: 'Repair or replace light fixtures.' },
    ],
    rating: 0, reviewCount: 0, completedJobs: 0,
  },

  // ── CLEANING (5) ────────────────────────────────────────────
  {
    name: 'Maria Santos Cleaning Services',
    email: 'maria.santos@fixify.ph',
    phone: '09191234501',
    category: 'cleaning',
    area: 'Angeles City Center',
    years: 9,
    rate: 250,
    bio: 'Professional cleaning team led by Maria Santos. Specializes in deep cleaning, move-in/out, and post-construction cleanup for homes and offices.',
    skills: ['Deep Cleaning', 'Move-In/Out Cleaning', 'Post-Construction', 'Office Cleaning', 'Carpet Cleaning'],
    verified: true,
    services: [
      { name: 'Regular House Cleaning',    price: 800,  description: 'Standard cleaning of all rooms (up to 3BR).' },
      { name: 'Deep Cleaning',             price: 1500, description: 'Intensive top-to-bottom cleaning including appliances.' },
      { name: 'Move-In/Out Cleaning',      price: 2000, description: 'Thorough cleaning for property handover.' },
      { name: 'Post-Construction Cleanup', price: 2500, description: 'Remove construction debris and dust.' },
    ],
    rating: 4.8, reviewCount: 33, completedJobs: 42,
  },
  {
    name: 'CleanPro Angeles',
    email: 'cleanpro.angeles@fixify.ph',
    phone: '09191234502',
    category: 'cleaning',
    area: 'Balibago',
    years: 6,
    rate: 220,
    bio: 'Eco-friendly cleaning service using non-toxic products. Safe for children and pets.',
    skills: ['Eco-Friendly Cleaning', 'Sanitization', 'Upholstery Cleaning', 'Kitchen Deep Clean'],
    verified: true,
    services: [
      { name: 'Eco Home Cleaning',      price: 900,  description: 'Non-toxic cleaning solution for all surfaces.' },
      { name: 'Kitchen Deep Clean',     price: 1200, description: 'Full kitchen degreasing and sanitization.' },
      { name: 'Upholstery Cleaning',    price: 700,  description: 'Sofa and upholstered furniture cleaning.' },
    ],
    rating: 4.6, reviewCount: 19, completedJobs: 25,
  },
  {
    name: 'Quick Clean PH',
    email: 'quickclean.ph@fixify.ph',
    phone: '09191234503',
    category: 'cleaning',
    area: 'Nepo Mall Area',
    years: 4,
    rate: 200,
    bio: 'Fast and affordable cleaning services for busy households. Same-day bookings available.',
    skills: ['Speed Cleaning', 'Bathroom Sanitization', 'Bedroom Cleaning'],
    verified: true,
    services: [
      { name: 'Express House Clean',    price: 600,  description: 'Quick clean of main living areas (2-3 hours).' },
      { name: 'Bathroom Sanitization', price: 500,  description: 'Full bathroom deep sanitization.' },
    ],
    rating: 4.1, reviewCount: 12, completedJobs: 16,
  },
  {
    name: 'Sparkle Home Services',
    email: 'sparkle.home@fixify.ph',
    phone: '09191234504',
    category: 'cleaning',
    area: 'Clark',
    years: 8,
    rate: 300,
    bio: 'Premium cleaning service for Clark-area residences and expat homes. Trained staff and premium equipment.',
    skills: ['Premium Cleaning', 'Expat Home Service', 'Office Cleaning', 'Disinfection'],
    verified: true,
    services: [
      { name: 'Premium Home Cleaning',  price: 1800, description: 'White-glove standard cleaning service.' },
      { name: 'Office Cleaning',        price: 2200, description: 'Professional office space cleaning.' },
      { name: 'Disinfection Service',   price: 1500, description: 'Full property sanitization and disinfection.' },
    ],
    rating: 4.9, reviewCount: 28, completedJobs: 35,
  },
  {
    name: 'Juan\'s Janitorial Services',
    email: 'juans.janitorial@fixify.ph',
    phone: '09191234505',
    category: 'cleaning',
    area: 'Marquee Mall Area',
    years: 1,
    rate: 180,
    bio: 'New but hardworking. Offering competitive rates for quality cleaning services in Marquee Mall area.',
    skills: ['General Cleaning', 'Floor Mopping', 'Trash Collection'],
    verified: false, // pending
    services: [
      { name: 'Basic Home Cleaning',    price: 500,  description: 'Standard cleaning service for small homes.' },
    ],
    rating: 0, reviewCount: 0, completedJobs: 0,
  },
];

// ── Customer definitions ──────────────────────────────────────

const CUSTOMERS_DATA = [
  { name: 'Adrian Sarmiento',   email: 'adrian.sarmiento@gmail.com',   phone: '09281234501' },
  { name: 'Lanie Shane Perez',  email: 'lanieshane.perez@gmail.com',   phone: '09281234502' },
  { name: 'Carlo Reyes',        email: 'carlo.reyes@gmail.com',        phone: '09281234503' },
  { name: 'Patricia Manalo',    email: 'patricia.manalo@gmail.com',    phone: '09281234504' },
  { name: 'Jose Dela Rosa',     email: 'jose.delarosa@gmail.com',      phone: '09281234505' },
  { name: 'Anna Marie Torres',  email: 'annamarie.torres@gmail.com',   phone: '09281234506' },
  { name: 'Rodel Ocampo',       email: 'rodel.ocampo@gmail.com',       phone: '09281234507' },
  { name: 'Christine Delos Santos', email: 'christine.delossantos@gmail.com', phone: '09281234508' },
  { name: 'Mark Anthony Lim',   email: 'markanthony.lim@gmail.com',    phone: '09281234509' },
  { name: 'Sheila Mae Garcia',  email: 'sheilamae.garcia@gmail.com',   phone: '09281234510' },
];

// ── Main seed function ────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB Atlas');

  // ── 1. Clear existing seed data (keep admin accounts) ──────
  console.log('\n🗑️   Clearing previous seed data...');
  await User.deleteMany({ email: { $regex: '@fixify.ph' } });
  await User.deleteMany({ email: { $regex: '@gmail.com' } });
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Notification.deleteMany({});
  console.log('✅  Cleared');

  // ── 2. Create providers ────────────────────────────────────
  console.log('\n👷  Creating providers...');
  const hashedPw = await hashPw('Fixify@2025');
  const providerDocs = [];

for (const p of PROVIDERS_DATA) {
  const doc = await User.create({
    name: p.name,
    email: p.email,
    phone: p.phone,
    password: 'Fixify@2025',  // plain text — let the pre-save hook hash it
    role: 'provider',
    isActive: true,
    providerInfo: {
      category: p.category,
      serviceArea: p.area,
      yearsExperience: p.years,
      hourlyRate: p.rate,
      bio: p.bio,
      skills: p.skills,
      services: p.services,
      verified: p.verified,
      completedJobs: p.completedJobs,
      rating: p.rating,
      reviewCount: p.reviewCount,
    },
  });
  // Update createdAt separately so it doesn't interfere with pre-save hook
  await User.findByIdAndUpdate(doc._id, { createdAt: daysAgo(rand(25, 35)) });
  providerDocs.push(doc);
  console.log(`   ✔ ${p.name} (${p.category}) — ${p.verified ? 'verified' : 'pending'}`);
}

  // ── 3. Create customers ────────────────────────────────────
  console.log('\n👤  Creating customers...');
  const customerDocs = [];

for (const c of CUSTOMERS_DATA) {
  const doc = await User.create({
    name: c.name,
    email: c.email,
    phone: c.phone,
    password: 'Fixify@2025',  // plain text
    role: 'customer',
    isActive: true,
  });
  await User.findByIdAndUpdate(doc._id, { createdAt: daysAgo(rand(20, 30)) });
  customerDocs.push(doc);
  console.log(`   ✔ ${c.name}`);
}

  // ── 4. Create bookings ─────────────────────────────────────
  console.log('\n📋  Creating bookings...');

  // Only use verified providers for bookings
  const verifiedProviders = providerDocs.filter(p => p.providerInfo.verified);
  const bookingDocs = [];

  // Helper to create one booking
  const makeBooking = async (customer, provider, status, payStatus, daysBack, serviceIdx = 0) => {
    const svc = provider.providerInfo.services[serviceIdx] || provider.providerInfo.services[0];
    const platformFee = Math.round(svc.price * 0.1);
    const totalAmount = svc.price + platformFee;
    const scheduledDate = daysAgo(daysBack);

    const booking = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      hasReview: false,
      service: { name: svc.name, price: svc.price },
      scheduledDate,
      scheduledTime: pick(TIME_SLOTS),
      address: pick(ADDRESSES),
      contactPhone: customer.phone,
      notes: pick([
        'Please call 30 minutes before arriving.',
        'Gate code is 1234.',
        'Please bring your own tools.',
        '',
        'Second floor bathroom.',
        'Please wear shoe covers inside.',
      ]),
      status,
      paymentStatus: payStatus,
      platformFee,
      totalAmount,
      createdAt: new Date(scheduledDate.getTime() - rand(1, 3) * 86400000),
    });
    bookingDocs.push(booking);
    return booking;
  };

  // ── COMPLETED bookings (with reviews) ──────────────────────
  // Spread across the last 30 days
  const completedPairs = [
    // [customerIdx, providerIdx, serviceIdx, daysBack]
    [0, 0, 0, 28], [1, 5, 0, 27], [2, 8, 0, 26],
    [3, 0, 1, 25], [4, 6, 1, 24], [5, 1, 0, 23],
    [6, 8, 1, 22], [7, 0, 2, 21], [8, 5, 2, 20],
    [9, 9, 0, 19], [0, 3, 0, 18], [1, 6, 0, 17],
    [2, 1, 1, 16], [3, 5, 0, 15], [4, 9, 1, 14],
    [5, 3, 1, 13], [6, 0, 0, 12], [7, 8, 0, 11],
    [8, 6, 1, 10], [9, 1, 0,  9],
  ];

  const completedBookings = [];
  for (const [ci, pi, si, db] of completedPairs) {
    const b = await makeBooking(
      customerDocs[ci],
      verifiedProviders[pi],
      'completed',
      'released',
      db,
      si
    );
    completedBookings.push({ booking: b, customer: customerDocs[ci], provider: verifiedProviders[pi] });
  }
  console.log(`   ✔ ${completedBookings.length} completed bookings`);

  // ── IN-PROGRESS bookings ────────────────────────────────────
  const inProgressPairs = [
    [0, 2, 0, 1], [1, 7, 0, 1], [2, 4, 0, 0],
    [3, 2, 1, 1], [4, 7, 1, 0],
  ];
  const inProgressBookings = [];
  for (const [ci, pi, si, db] of inProgressPairs) {
    const b = await makeBooking(
      customerDocs[ci],
      verifiedProviders[pi],
      'in-progress',
      'held-in-escrow',
      db,
      si
    );
    inProgressBookings.push(b);
  }
  console.log(`   ✔ ${inProgressBookings.length} in-progress bookings`);

  // ── CONFIRMED bookings (upcoming) ──────────────────────────
  const confirmedPairs = [
    [5, 0, 0, -2], [6, 5, 0, -3], [7, 8, 0, -1],
    [8, 3, 0, -4], [9, 6, 1, -2],
  ];
  const confirmedBookings = [];
  for (const [ci, pi, si, db] of confirmedPairs) {
    const b = await makeBooking(
      customerDocs[ci],
      verifiedProviders[pi],
      'confirmed',
      'held-in-escrow',
      db,
      si
    );
    confirmedBookings.push(b);
  }
  console.log(`   ✔ ${confirmedBookings.length} confirmed (upcoming) bookings`);

  // ── PENDING bookings ────────────────────────────────────────
  const pendingPairs = [
    [0, 1, 0, -1], [1, 2, 0, -2], [2, 0, 0, -3],
    [3, 4, 0, -1],
  ];
  const pendingBookings = [];
  for (const [ci, pi, si, db] of pendingPairs) {
    const b = await makeBooking(
      customerDocs[ci],
      verifiedProviders[pi],
      'pending',
      'pending',
      db,
      si
    );
    pendingBookings.push(b);
  }
  console.log(`   ✔ ${pendingBookings.length} pending bookings`);

  // ── CANCELLED bookings ──────────────────────────────────────
  const cancelledPairs = [
    [4, 3, 0, 8], [5, 7, 1, 12], [6, 2, 0, 15],
  ];
  const cancelledBookings = [];
  for (const [ci, pi, si, db] of cancelledPairs) {
    const b = await makeBooking(
      customerDocs[ci],
      verifiedProviders[pi],
      'cancelled',
      'refunded',
      db,
      si
    );
    cancelledBookings.push(b);
  }
  console.log(`   ✔ ${cancelledBookings.length} cancelled bookings`);

  // ── 5. Create reviews ──────────────────────────────────────
  console.log('\n⭐  Creating reviews...');
  let reviewCount = 0;

  // Create reviews for ~80% of completed bookings
  const reviewablePairs = completedBookings.slice(0, 16);

  for (const { booking, customer, provider } of reviewablePairs) {
    // Weight ratings toward 4-5
    const rating = pick([5, 5, 5, 4, 4, 4, 3, 5, 4, 5]);
    const comment = pick(REVIEW_COMMENTS[rating] || REVIEW_COMMENTS[4]);
    const hasResponse = Math.random() > 0.4;

    const review = await Review.create({
      booking: booking._id,
      customer: customer._id,
      provider: provider._id,
      rating,
      comment,
      response: hasResponse ? {
        text: pick(PROVIDER_RESPONSES),
        date: new Date(booking.scheduledDate.getTime() + rand(1, 3) * 86400000),
      } : undefined,
      status: 'approved',
      createdAt: new Date(booking.scheduledDate.getTime() + rand(1, 2) * 86400000),
    });

    // Mark booking as reviewed
    await Booking.findByIdAndUpdate(booking._id, { hasReview: true });
    reviewCount++;
  }
  console.log(`   ✔ ${reviewCount} reviews created`);

  // ── 6. Create notifications ────────────────────────────────
  console.log('\n🔔  Creating notifications...');
  let notifCount = 0;

  const createNotif = async (userId, type, title, message, link, daysBack) => {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      read: Math.random() > 0.4,
      link,
      createdAt: daysAgo(daysBack),
    });
    notifCount++;
  };

  // Customer notifications
  for (const customer of customerDocs.slice(0, 7)) {
    await createNotif(customer._id, 'booking', 'Booking Confirmed!', 'Your service booking has been confirmed by the provider.', '/dashboard', rand(1, 5));
    await createNotif(customer._id, 'payment', 'Payment Held in Escrow', 'Your payment is safely held and will be released after job completion.', '/dashboard', rand(3, 8));
    await createNotif(customer._id, 'booking', 'Job Completed', 'Your service has been marked as complete. Please confirm to release payment.', '/dashboard', rand(1, 3));
    await createNotif(customer._id, 'review', 'Leave a Review', 'How was your recent service? Share your experience.', '/dashboard', rand(1, 2));
  }

  // Provider notifications
  for (const provider of verifiedProviders.slice(0, 8)) {
    await createNotif(provider._id, 'booking', 'New Booking Request!', 'You have received a new service booking request. Review and confirm.', '/provider-dashboard', rand(1, 5));
    await createNotif(provider._id, 'payment', 'Payment Released!', 'The customer has confirmed job completion. Payment has been released to your account.', '/provider-dashboard', rand(2, 7));
    await createNotif(provider._id, 'review', 'New Review Received', 'A customer has left a review for your recent service.', '/provider-dashboard', rand(1, 4));
  }

  console.log(`   ✔ ${notifCount} notifications created`);

  // ── 7. Final summary ───────────────────────────────────────
  console.log('\n════════════════════════════════════════════════');
  console.log('🎉  SEED COMPLETE — Fixify Demo Data');
  console.log('════════════════════════════════════════════════');
  console.log(`👷  Providers    : ${providerDocs.length} (${providerDocs.filter(p => p.providerInfo.verified).length} verified, ${providerDocs.filter(p => !p.providerInfo.verified).length} pending)`);
  console.log(`👤  Customers    : ${customerDocs.length}`);
  console.log(`📋  Bookings     : ${bookingDocs.length} total`);
  console.log(`       completed : ${completedBookings.length}`);
  console.log(`       in-progress: ${inProgressBookings.length}`);
  console.log(`       confirmed : ${confirmedBookings.length}`);
  console.log(`       pending   : ${pendingBookings.length}`);
  console.log(`       cancelled : ${cancelledBookings.length}`);
  console.log(`⭐  Reviews      : ${reviewCount}`);
  console.log(`🔔  Notifications: ${notifCount}`);
  console.log('────────────────────────────────────────────────');
  console.log('🔑  All accounts use password: Fixify@2025');
  console.log('────────────────────────────────────────────────');
  console.log('📧  Sample logins:');
  console.log('    Customer : adrian.sarmiento@gmail.com');
  console.log('    Provider : roberto.delacruz@fixify.ph');
  console.log('    Provider : edgar.mendoza@fixify.ph');
  console.log('    Provider : maria.santos@fixify.ph');
  console.log('════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
