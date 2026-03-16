import {
  User,
  Vehicle,
  ServiceJob,
  ServiceStage,
  ServiceItem,
  StoreProduct,
  NewsArticle,
  ServiceHistoryRecord,
  MembershipPlan,
  NotificationItem,
} from '@/types';

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    userId: 'u1',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2023,
    color: 'Guards Red',
    licensePlate: 'WRPTR-01',
    vin: 'WP0AD2A93PS267801',
  },
  {
    id: 'v2',
    userId: 'u1',
    make: 'BMW',
    model: 'M5 Competition',
    year: 2022,
    color: 'Frozen Black',
    licensePlate: 'WRPTR-02',
    vin: 'WBSJF0C04NCB99204',
  },
  {
    id: 'v3',
    userId: 'u2',
    make: 'Mercedes-Benz',
    model: 'AMG GT 63 S',
    year: 2024,
    color: 'Obsidian Black',
    licensePlate: 'WRPTR-03',
  },
];

// ─── Mock User ─────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: 'u1',
  phone: '+1 (555) 901-0011',
  name: 'Alex Harrington',
  email: 'alex.harrington@example.com',
  membershipTier: 'gold',
  membershipExpiry: '2026-12-31',
  joinedAt: '2023-06-15',
  referralCode: 'WRPT-ALEX22',
  notificationPreferences: {
    serviceUpdates: true,
    promotions: true,
    news: false,
    emergencyAlerts: true,
  },
  vehicles: MOCK_VEHICLES.filter((v) => v.userId === 'u1'),
};

// ─── Service Stages Template ───────────────────────────────────────────────────

export const buildStages = (jobId: string, completedUntil: number): ServiceStage[] => {
  const stageData = [
    { order: 1, name: 'Vehicle Accepted', description: 'Vehicle received and paperwork completed', progressPercent: 10 },
    { order: 2, name: '120-Point Inspection', description: 'Full vehicle condition inspection documented', progressPercent: 15 },
    { order: 3, name: 'Wash & Clay Bar', description: 'Professional wash and paint decontamination', progressPercent: 25 },
    { order: 4, name: 'Disassembly', description: 'Removing panels and trim for precise installation', progressPercent: 45 },
    { order: 5, name: 'Wrap / PPF Installation', description: 'Core service being performed by master technicians', progressPercent: 75 },
    { order: 6, name: 'Re-assembly', description: 'Reinstalling all removed components', progressPercent: 85 },
    { order: 7, name: 'Full Inspection', description: 'Quality control check of completed work', progressPercent: 90 },
    { order: 8, name: 'Photos & Video Update', description: 'Final documentation and customer preview', progressPercent: 95 },
    { order: 9, name: 'Vehicle Delivery', description: 'Vehicle ready for owner pickup', progressPercent: 100 },
  ];

  return stageData.map((s) => ({
    id: `${jobId}-stage-${s.order}`,
    jobId,
    name: s.name,
    description: s.description,
    progressPercent: s.progressPercent,
    order: s.order,
    status:
      s.progressPercent < completedUntil
        ? 'completed'
        : s.progressPercent === completedUntil
        ? 'in_progress'
        : 'pending',
    completedAt:
      s.progressPercent < completedUntil
        ? new Date(Date.now() - (9 - s.order) * 3600000 * 8).toISOString()
        : undefined,
    technicianNote:
      s.progressPercent < completedUntil
        ? getStageMockNote(s.order)
        : s.progressPercent === completedUntil
        ? 'Currently in progress — technician is working on this stage.'
        : undefined,
    mediaPlaceholders:
      s.order === 5 || s.order === 8
        ? [
            { id: `mp-${s.order}-1`, type: 'photo', label: 'Progress photo 1' },
            { id: `mp-${s.order}-2`, type: 'photo', label: 'Progress photo 2' },
            { id: `mp-${s.order}-3`, type: 'video', label: 'Work-in-progress video' },
          ]
        : [{ id: `mp-${s.order}-1`, type: 'photo', label: 'Stage documentation' }],
  }));
};

function getStageMockNote(order: number): string {
  const notes: Record<number, string> = {
    1: 'Vehicle arrived in excellent condition. All existing paint protection documented. Customer consent forms signed.',
    2: 'Inspection complete. Minor rock chip noted on front bumper — photographed and documented. No structural issues.',
    3: 'Paint surface decontaminated. Iron fallout removed. Clay bar treatment completed successfully. Surface ready for installation.',
    4: 'Front bumper, doors, and hood panels removed. All hardware bagged and labeled. No surprises.',
    5: 'Wrap installation 80% complete. Seams are clean and precise. Edges tucked to factory standard.',
    6: 'All panels re-installed. Torque specs verified. Panel gaps within OEM tolerance.',
    7: 'QC inspection passed. No lifting edges, bubbles, or contamination detected.',
    8: 'Full photo and video documentation complete. Pre-delivery walkthrough recorded.',
    9: 'Vehicle ready for customer pickup. Care instructions provided.',
  };
  return notes[order] ?? 'Stage completed successfully.';
}

// ─── Active Service Jobs ───────────────────────────────────────────────────────

export const MOCK_ACTIVE_JOBS: ServiceJob[] = [
  {
    id: 'job-001',
    userId: 'u1',
    vehicleId: 'v1',
    vehicle: MOCK_VEHICLES[0],
    serviceType: 'Full Color Change Wrap',
    serviceCategory: 'full_wrap',
    description: 'Complete color change from Guards Red to Satin Stealth Black with door jambs and engine bay.',
    status: 'in_progress',
    progressPercent: 75,
    currentStageName: 'Wrap / PPF Installation',
    estimatedCompletion: new Date(Date.now() + 2 * 86400000).toISOString(),
    startedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    technicianName: 'Marcus Webb',
    stages: buildStages('job-001', 75),
    notes: 'Customer requested matte black interior trim accents to be quoted separately.',
    totalCost: 4800,
  },
  {
    id: 'job-002',
    userId: 'u1',
    vehicleId: 'v2',
    vehicle: MOCK_VEHICLES[1],
    serviceType: 'Full Front PPF',
    serviceCategory: 'ppf',
    description: 'XPEL Ultimate Plus PPF on full front end: bumper, hood, fenders, mirrors, A-pillars.',
    status: 'in_progress',
    progressPercent: 45,
    currentStageName: 'Disassembly',
    estimatedCompletion: new Date(Date.now() + 4 * 86400000).toISOString(),
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    technicianName: 'Jordan Cole',
    stages: buildStages('job-002', 45),
    totalCost: 3200,
  },
];

// ─── Service History ───────────────────────────────────────────────────────────

export const MOCK_SERVICE_HISTORY: ServiceHistoryRecord[] = [
  {
    id: 'hist-001',
    jobId: 'job-prev-01',
    userId: 'u1',
    vehicle: MOCK_VEHICLES[1],
    serviceType: 'Ceramic Coating Pro',
    serviceCategory: 'ceramic_coating',
    completedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    finalStatus: 'completed',
    totalCost: 2200,
    technicianName: 'Marcus Webb',
    stages: buildStages('hist-001', 101),
    invoicePlaceholder: 'Invoice #WRP-2024-0891 — PDF available via email',
    nextServiceRecommendation: 'Ceramic top-up recommended in 12 months. Book your annual maintenance detail.',
    rating: 5,
  },
  {
    id: 'hist-002',
    jobId: 'job-prev-02',
    userId: 'u1',
    vehicle: MOCK_VEHICLES[0],
    serviceType: 'Chrome Delete & Gloss Black Accents',
    serviceCategory: 'chrome_delete',
    completedAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    finalStatus: 'completed',
    totalCost: 1400,
    technicianName: 'Tamara Singh',
    stages: buildStages('hist-002', 101),
    invoicePlaceholder: 'Invoice #WRP-2024-0412 — PDF available via email',
    nextServiceRecommendation: 'Vinyl chrome delete wrap typically lasts 5–7 years. Consider annual inspection.',
    rating: 5,
  },
  {
    id: 'hist-003',
    jobId: 'job-prev-03',
    userId: 'u1',
    vehicle: MOCK_VEHICLES[0],
    serviceType: 'Paint Correction + Ceramic Base',
    serviceCategory: 'ceramic_coating',
    completedAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    finalStatus: 'completed',
    totalCost: 3600,
    technicianName: 'Jordan Cole',
    stages: buildStages('hist-003', 101),
    invoicePlaceholder: 'Invoice #WRP-2023-0124 — PDF available via email',
    nextServiceRecommendation: 'Full repaint or respray in 2–3 years if used as a daily. Schedule a consultation.',
    rating: 4,
  },
];

// ─── Service Catalog ───────────────────────────────────────────────────────────

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'svc-1',
    category: 'full_wrap',
    name: 'Full Color Change Wrap',
    tagline: 'Transform your vehicle entirely',
    description:
      'A complete vehicle color change using premium cast vinyl. Our master installers deliver factory-level finish on every panel, edge, and seam. Choose from thousands of colors, textures, and finishes.',
    benefits: [
      'Protects OEM paint value',
      'Fully reversible',
      '3M, Avery or KPMF premium films',
      'All edges and door jambs included',
      'Lifetime workmanship warranty',
    ],
    priceRange: '$3,500 – $7,500',
    estimatedDays: '5–7 days',
    popular: true,
  },
  {
    id: 'svc-2',
    category: 'ppf',
    name: 'Paint Protection Film (PPF)',
    tagline: 'Invisible armor for your paint',
    description:
      'XPEL Ultimate Plus self-healing PPF shields your paint from rock chips, road debris, and fine scratches. Available in full vehicle or targeted coverage packages.',
    benefits: [
      'Self-healing technology',
      'Hydrophobic top coat',
      'XPEL Ultimate Plus film',
      'Invisible protection',
      '10-year manufacturer warranty',
    ],
    priceRange: '$2,200 – $9,000',
    estimatedDays: '3–6 days',
    popular: true,
  },
  {
    id: 'svc-3',
    category: 'ceramic_coating',
    name: 'Ceramic Coating',
    tagline: 'Permanent gloss and protection',
    description:
      'Professional-grade ceramic nano-coating that bonds permanently to your paint. Creates a hydrophobic surface with extreme gloss and chemical resistance.',
    benefits: [
      '9H hardness rating',
      'Extreme hydrophobic effect',
      'UV oxidation protection',
      'Enhanced gloss depth',
      '5-year warranty',
    ],
    priceRange: '$1,200 – $3,500',
    estimatedDays: '2–4 days',
    popular: true,
  },
  {
    id: 'svc-4',
    category: 'chrome_delete',
    name: 'Chrome Delete',
    tagline: 'Sleek, blacked-out elegance',
    description:
      'Replace chrome and bright trim with gloss, satin, or matte black vinyl for a more aggressive, contemporary look. Clean, precise, and fully reversible.',
    benefits: [
      'Gloss, satin, or matte finishes',
      'Protects underlying chrome',
      'Fully reversible',
      'Same-day service available',
      'Pairs perfectly with wraps',
    ],
    priceRange: '$400 – $1,800',
    estimatedDays: '1–2 days',
    popular: false,
  },
  {
    id: 'svc-5',
    category: 'tint',
    name: 'Window Tint',
    tagline: 'Privacy, UV protection, style',
    description:
      'Premium ceramic window film installation. Blocks up to 99% of UV rays and reduces heat up to 60%. All local compliance options available.',
    benefits: [
      'Ceramic film technology',
      '99% UV rejection',
      'Heat rejection up to 60%',
      'No signal interference',
      'Lifetime warranty',
    ],
    priceRange: '$350 – $900',
    estimatedDays: '1 day',
    popular: false,
  },
  {
    id: 'svc-6',
    category: 'detailing',
    name: 'Premium Detail Package',
    tagline: 'Showroom perfection, every time',
    description:
      'Multi-stage paint correction followed by hand polish and interior deep clean. Your vehicle leaves looking better than the day you picked it up.',
    benefits: [
      'Multi-stage paint correction',
      'Hand polish & wax',
      'Interior deep clean',
      'Glass polish',
      'Tire shine & dressing',
    ],
    priceRange: '$450 – $1,200',
    estimatedDays: '1–2 days',
    popular: false,
  },
  {
    id: 'svc-7',
    category: 'custom',
    name: 'Custom Design & Graphics',
    tagline: 'Art meets automotive',
    description:
      'Bespoke design work including race stripes, custom graphics, livery designs, and one-off artistic applications. We work with your vision.',
    benefits: [
      'In-house design team',
      'Digital mockup before install',
      'Racing livery specialists',
      'Full vehicle or partial',
      'Custom colour matching',
    ],
    priceRange: '$800 – $15,000+',
    estimatedDays: '3–14 days',
    popular: false,
  },
];

// ─── Store Products ────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-1',
    name: 'Wraptors Care Kit',
    category: 'care_kit',
    description:
      'Everything you need to maintain your wrap or PPF at home. Professionally curated by our technicians.',
    price: 89.99,
    inStock: true,
    featured: true,
    tags: ['wrap', 'maintenance', 'kit'],
    rating: 4.9,
    reviewCount: 142,
  },
  {
    id: 'prod-2',
    name: 'Ceramic Maintenance Spray',
    category: 'care_kit',
    description:
      'Top up and refresh your ceramic coating between professional services. Boosts hydrophobics and gloss instantly.',
    price: 34.99,
    inStock: true,
    featured: true,
    tags: ['ceramic', 'maintenance', 'spray'],
    rating: 4.8,
    reviewCount: 98,
  },
  {
    id: 'prod-3',
    name: 'PPF-Safe Wash Soap',
    category: 'care_kit',
    description:
      'pH-neutral, PPF-safe formula that cleans without lifting film edges or stripping coatings. 1L concentrate.',
    price: 24.99,
    inStock: true,
    featured: false,
    tags: ['ppf', 'wash', 'soap'],
    rating: 4.7,
    reviewCount: 74,
  },
  {
    id: 'prod-4',
    name: 'Premium Microfiber Set (6-Pack)',
    category: 'accessories',
    description:
      'Ultra-plush 1200 GSM microfiber towels safe for coated and wrapped surfaces. Lint-free and scratch-proof.',
    price: 39.99,
    inStock: true,
    featured: false,
    tags: ['microfiber', 'detailing', 'accessories'],
    rating: 4.8,
    reviewCount: 211,
  },
  {
    id: 'prod-5',
    name: 'Wraptors Logo Tee — Black/Gold',
    category: 'apparel',
    description: 'Premium heavyweight cotton t-shirt with embroidered Wraptors Inc. logo. Black with gold detailing.',
    price: 44.99,
    inStock: true,
    featured: true,
    tags: ['apparel', 'branded'],
    rating: 4.6,
    reviewCount: 53,
  },
  {
    id: 'prod-6',
    name: 'Wraptors Snapback Cap',
    category: 'apparel',
    description: 'Structured snapback in all-black with gold Wraptors embroidered logo. One size fits most.',
    price: 34.99,
    inStock: true,
    featured: false,
    tags: ['apparel', 'branded'],
    rating: 4.5,
    reviewCount: 37,
  },
  {
    id: 'prod-7',
    name: 'Iron Decontamination Spray',
    category: 'tools',
    description:
      'Professional-grade iron fallout remover for pre-coating and pre-wrap paint prep. Visually reacts to contamination.',
    price: 19.99,
    inStock: true,
    featured: false,
    tags: ['iron', 'decontamination', 'prep'],
    rating: 4.7,
    reviewCount: 66,
  },
  {
    id: 'prod-8',
    name: 'Wrap Squeegee Pro Kit',
    category: 'tools',
    description:
      'Hard card, felt squeegee, and micro-tipped application tools for DIY touch-ups on your wrap.',
    price: 29.99,
    inStock: false,
    featured: false,
    tags: ['wrap', 'tools', 'diy'],
    rating: 4.4,
    reviewCount: 29,
  },
];

// ─── News Articles ─────────────────────────────────────────────────────────────

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Customer Spotlight: Marcus\'s Lamborghini Huracán Full Wrap',
    category: 'delivery',
    excerpt: 'See how we transformed a Grigio Telesto Huracán into a jaw-dropping satin military green masterpiece.',
    body: `Last month we had the privilege of working on one of our most memorable projects yet — a 2021 Lamborghini Huracán EVO brought in by long-time member Marcus R.\n\nThe brief: full color change from factory Grigio Telesto to a custom KPMF Satin Military Green, with gloss black accents on all the carbon fiber trim.\n\nOur team spent 6 days meticulously applying the film, starting with the complex front bumper contours and working panel by panel to ensure zero seam mismatches. The result? A show-stopper that turned heads at the car meet the very next weekend.\n\nMarcus gave us 5 stars and said it best: "Wraptors doesn't just wrap cars — they transform them."\n\nBook your transformation today.`,
    publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    author: 'The Wraptors Team',
    readTimeMinutes: 3,
    featured: true,
  },
  {
    id: 'news-2',
    title: 'New: XPEL Stealth PPF Now Available',
    category: 'new_service',
    excerpt: 'We\'re now installing XPEL Stealth PPF — the ultimate matte paint protection film for your exotic or luxury vehicle.',
    body: `We're thrilled to announce that Wraptors Inc. is now a certified XPEL Stealth installer.\n\nXPEL Stealth is the industry's most premium matte-finish PPF. It provides the same rock chip and abrasion protection as XPEL Ultimate Plus but with a stunning satin finish that enhances factory matte paintwork and adds depth to gloss finishes.\n\nKey highlights:\n• Self-healing top coat\n• Uniform matte appearance across all panels\n• Hydrophobic and stain resistant\n• Available in full-vehicle coverage\n• 10-year manufacturer warranty\n\nWe're now taking bookings. Space is limited — get your consultation in today.`,
    publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    author: 'Marcus Webb, Lead Installer',
    readTimeMinutes: 2,
    featured: true,
  },
  {
    id: 'news-3',
    title: '5 Wrap Care Mistakes That Could Void Your Warranty',
    category: 'care_tips',
    excerpt: 'Are you making these common mistakes with your wrap? Avoid them to keep your film looking flawless for years.',
    body: `Investing in a premium wrap is a significant decision. Keeping it looking its best long-term comes down to proper care habits. Here are 5 mistakes that can shorten your wrap's life or void your warranty:\n\n1. **Automatic car washes** — Brush washes can lift edges and create micro-tears. Always hand wash or touchless only.\n\n2. **Pressure washing seams directly** — High pressure at close range can force water under the edges. Keep your pressure washer at a distance and angle.\n\n3. **Waxing with carnauba wax** — Traditional waxes can leave residue on textured films. Use a wrap-safe spray detailer like our Ceramic Maintenance Spray.\n\n4. **Letting bird droppings sit** — Bird waste is highly acidic. On wraps and PPF, it can permanently stain or etch if left more than 24-48 hours.\n\n5. **Parking in direct UV exposure daily** — While our films are UV-stabilized, prolonged exposure degrades them faster. Garage park or use a quality car cover.\n\nNeed a top-up service? We offer maintenance detail packages for wrapped and coated vehicles year-round.`,
    publishedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    author: 'Jordan Cole, Head Technician',
    readTimeMinutes: 4,
    featured: false,
  },
  {
    id: 'news-4',
    title: 'Shop Expansion: New Detail Bay Coming Q2',
    category: 'shop_update',
    excerpt: 'We\'re growing! Our new dedicated detail bay will allow us to take on more vehicles with faster turnaround.',
    body: `We have exciting news to share with our community — Wraptors Inc. is expanding.\n\nStarting Q2, we will be opening a dedicated detail and ceramic coating bay separate from our wrap installation studio. This means:\n\n• More appointments available each week\n• Faster turnaround on coating-only jobs\n• Simultaneous wrap + coating packages\n• A new wash station for client vehicle pick-up prep\n\nWe've been overwhelmed by demand and this expansion is our commitment to serving our growing membership without compromise on quality.\n\nStay tuned for the official opening — Gold and Platinum members will get first access to the new appointment slots.`,
    publishedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    author: 'The Wraptors Team',
    readTimeMinutes: 2,
    featured: false,
  },
];

// ─── Membership Plans ──────────────────────────────────────────────────────────

export const MOCK_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-standard',
    tier: 'standard',
    name: 'Standard Member',
    price: 99,
    color: '#888888',
    benefits: [
      'Member pricing on all services',
      'Service tracking dashboard',
      'Service history access',
      'Priority booking',
      'Monthly newsletter',
    ],
  },
  {
    id: 'plan-gold',
    tier: 'gold',
    name: 'Gold Member',
    price: 249,
    color: '#C9A84C',
    benefits: [
      'All Standard benefits',
      'Annual complimentary detail',
      'VIP booking slots',
      '10% discount on store products',
      'Exclusive members content',
      'Referral rewards program',
      'Early access to new services',
    ],
  },
  {
    id: 'plan-platinum',
    tier: 'platinum',
    name: 'Platinum Member',
    price: 499,
    color: '#E8E8E8',
    benefits: [
      'All Gold benefits',
      'Dedicated account manager',
      'Free annual maintenance service',
      '20% discount on all services',
      'Loaner vehicle option',
      'Concierge pickup & delivery',
      'Lifetime workmanship guarantee',
      'Private members events',
    ],
  },
];

// ─── Notifications ─────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  // ── Unread ──────────────────────────────────────────────────────────────────
  {
    id: 'notif-1',
    userId: 'u1',
    type: 'service_update',
    title: 'Wrap installation in progress',
    body: 'Your Porsche 911 is now in the wrap installation phase. Estimated completion in 2 days.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    linkTo: '/tracking/job-001',
    ctaLabel: 'View Progress',
    metadata: { jobId: 'job-001', vehicleId: 'v1' },
  },
  {
    id: 'notif-2',
    userId: 'u1',
    type: 'service_update',
    title: 'BMW M5 disassembly complete',
    body: 'Disassembly of your BMW M5 is done. PPF installation begins tomorrow morning.',
    read: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    linkTo: '/tracking/job-002',
    ctaLabel: 'View Progress',
    metadata: { jobId: 'job-002', vehicleId: 'v2' },
  },
  {
    id: 'notif-4',
    userId: 'u1',
    type: 'recommendation',
    title: 'Protect your new wrap — Care Kit inside',
    body: 'Your Porsche wrap is finishing up. Our Wraptors Care Kit has everything you need to keep it looking factory-fresh for years.',
    read: false,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    linkTo: '/store/prod-1',
    ctaLabel: 'Shop Now',
    metadata: { productId: 'prod-1', jobId: 'job-001' },
  },
  {
    id: 'notif-5',
    userId: 'u1',
    type: 'recommendation',
    title: 'Keep your ceramic coating performing',
    body: 'It\'s been 90 days since your Ceramic Coating service. Time to recharge with our Ceramic Maintenance Spray — just 2 minutes a wash.',
    read: false,
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    linkTo: '/store/prod-2',
    ctaLabel: 'Add to Cart',
    metadata: { productId: 'prod-2' },
  },
  {
    id: 'notif-6',
    userId: 'u1',
    type: 'media',
    title: 'New photos added to your Porsche job',
    body: 'Marcus Webb uploaded 6 progress photos from today\'s wrap installation session. Take a look!',
    read: false,
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    linkTo: '/tracking/job-001',
    ctaLabel: 'See Photos',
    metadata: { jobId: 'job-001' },
  },
  // ── Read ────────────────────────────────────────────────────────────────────
  {
    id: 'notif-3',
    userId: 'u1',
    type: 'promotion',
    title: 'Gold Member Offer — 15% off Ceramic',
    body: 'Exclusive for Gold members this month: 15% off any ceramic coating package. Book by end of month.',
    read: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    linkTo: '/quote/',
    ctaLabel: 'Get a Quote',
  },
  {
    id: 'notif-7',
    userId: 'u1',
    type: 'service_update',
    title: 'Paint correction complete — coating next',
    body: 'Paint correction on your Porsche 911 passed quality inspection. Ceramic coating begins in the morning.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    linkTo: '/tracking/job-001',
    ctaLabel: 'View Timeline',
    metadata: { jobId: 'job-001' },
  },
  {
    id: 'notif-8',
    userId: 'u1',
    type: 'quote',
    title: 'Your quote is ready',
    body: 'We\'ve reviewed your request for Chrome Delete on the BMW M5. Your personalized quote is waiting.',
    read: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    linkTo: '/quote/',
    ctaLabel: 'Review Quote',
  },
  {
    id: 'notif-9',
    userId: 'u1',
    type: 'recommendation',
    title: 'PPF-Safe Wash Soap — don\'t risk your film',
    body: 'Your BMW M5 PPF is almost done. Regular car wash soaps can degrade film edges over time. Our PPF-Safe formula won\'t.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    linkTo: '/store/prod-3',
    ctaLabel: 'Shop Now',
    metadata: { productId: 'prod-3', jobId: 'job-002' },
  },
  {
    id: 'notif-10',
    userId: 'u1',
    type: 'promotion',
    title: 'Refer a friend — earn $100 credit',
    body: 'Your referral code ALEX100 gives your friends $50 off their first service. You earn $100 in store credit when they book.',
    read: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    linkTo: '/(tabs)/profile',
    ctaLabel: 'Share Code',
  },
  {
    id: 'notif-11',
    userId: 'u1',
    type: 'recommendation',
    title: 'Detail-quality microfiber — the right tool matters',
    body: 'Using the wrong cloth on a wrapped or ceramic-coated car causes micro-scratches. Our professional microfiber set is safe for every finish.',
    read: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    linkTo: '/store/prod-4',
    ctaLabel: 'Shop Now',
    metadata: { productId: 'prod-4' },
  },
  {
    id: 'notif-12',
    userId: 'u1',
    type: 'service_update',
    title: 'Your vehicle is ready for pickup',
    body: 'The Chrome Delete on your BMW M5 is complete and has passed final inspection. Ready when you are!',
    read: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    linkTo: '/(tabs)/tracking',
    ctaLabel: 'View Details',
    metadata: { vehicleId: 'v2' },
  },
];
