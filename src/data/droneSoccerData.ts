export interface TeamRoster {
  id: string;
  name: string;
  institution: string;
  city: string;
  division: 'Class 20 (200mm)' | 'Class 40 (400mm)';
  captain: string;
  strikerPilot: string;
  goalkeeper: string;
  defenders: string[];
  pitCrew: string;
  droneModel: string;
  seed: number;
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
  accentColor: string;
  group: 'Alpha' | 'Beta' | 'Gamma' | 'Delta';
}

export interface MatchFixture {
  id: string;
  round: 'Group Stage' | 'Quarter-Final' | 'Semi-Final' | 'Grand Finale';
  teamA: string;
  teamB: string;
  scheduledTime: string;
  court: 'Arena Cage 1' | 'Arena Cage 2';
  status: 'Completed' | 'Live' | 'Upcoming';
  scores?: {
    teamA: number[];
    teamB: number[];
    winner?: string;
  };
}

export interface TournamentPhase {
  phase: string;
  date: string;
  time: string;
  title: string;
  location: string;
  description: string;
  badge: string;
}

export interface PrizeItem {
  place: string;
  amount: string;
  title: string;
  perks: string[];
  highlight?: boolean;
}

export const GDSL_TOURNAMENT_INFO = {
  name: 'Galgotias Drone Soccer League',
  shortName: 'GDSL 2026',
  edition: 'National Intercollegiate Championship',
  hostInstitution: 'Galgotias University',
  organizingBody: 'GCDIS (Galgotias Centre for Drone Intelligence & Simulation)',
  location: 'Indoor Sports Arena & Proving Ground, Galgotias University, Greater Noida, Uttar Pradesh, India',
  dates: 'December 08 – 09, 2026',
  totalPrizePool: '₹2,00,000',
  totalPrizePoolBreakdown: '₹2,00,000 (including trophy and cash prize)',
  cashPrizePool: '₹1,68,000',
  d20PrizePool: '₹74,000',
  d40PrizePool: '₹94,000',
  teamCapacity: 32,
  registeredTeamsCount: 28,
  matchFormat: '5 vs 5 & 3 vs 3 Caged Aerial Soccer',
  setDuration: '3 sets × 3 minutes each',
  regDeadline: 'December 03, 2026 · 23:59 IST',
  emergencyHelpline: '+91 94110 53011',
  helplines: [
    { label: 'Rajat Thakur', number: '+91 94110 53011', tel: '+919411053011' },
    { label: 'Ayush Sinha', number: '+91 97986 93029', tel: '+919798693029' },
    { label: 'Ayush Pandey', number: '+91 95696 96140', tel: '+919569696140' },
    { label: 'Vijay Prasad', number: '+91 76260 40216', tel: '+917626040216' },
  ],
  supportEmail: 'gdsl@galgotiasuniversity.edu.in',
  whatsappCommunityLink: 'https://chat.whatsapp.com/CX88lPqupkrGFjlq2VbWQ0',
  governingStandard: 'GCDIS (Galgotias Centre of Drone Intelligence & Simulation) 5th Revision',
};

export interface DivisionPrizePool {
  divisionCode: 'D-20' | 'D-40';
  divisionName: string;
  droneClass: string;
  arenaFormat: string;
  totalAmount: string;
  badge: string;
  prizes: PrizeItem[];
}

export const PRIZE_POOLS: { d20: DivisionPrizePool; d40: DivisionPrizePool } = {
  d40: {
    divisionCode: 'D-40',
    divisionName: 'Class 40 (400mm) Heavyweight Division',
    droneClass: 'D-40 Spherical Drone (≤1100g, 40cm)',
    arenaFormat: '5 vs 5 Full Arena (16m × 8m)',
    totalAmount: '₹94,000',
    badge: 'D-40 DIVISION · 5v5 ARENA',
    prizes: [
      {
        place: '1st Place',
        amount: '₹41,000',
        title: 'Champion',
        perks: [
          'Cash Prize and Certificate',
        ],
        highlight: true,
      },
      {
        place: '2nd Place',
        amount: '₹31,000',
        title: '1st Runner-Up',
        perks: [
          'Cash Prize and Certificate',
        ],
      },
      {
        place: '3rd Place',
        amount: '₹11,000',
        title: '2nd Runner-Up',
        perks: [
          'Cash Prize and Certificate',
        ],
      },
    ],
  },
  d20: {
    divisionCode: 'D-20',
    divisionName: 'Class 20 (200mm) High-Speed Division',
    droneClass: 'D-20 Spherical Drone (≤110g, 20cm)',
    arenaFormat: '3 vs 3 High-Agility Micro Arena (8m × 4m)',
    totalAmount: '₹74,000',
    badge: 'D-20 DIVISION · 3v3 ARENA',
    prizes: [
      {
        place: '1st Place',
        amount: '₹31,000',
        title: 'Champion',
        perks: [
          'Cash Prize and Certificate',
        ],
        highlight: true,
      },
      {
        place: '2nd Place',
        amount: '₹21,000',
        title: '1st Runner-Up',
        perks: [
          'Cash Prize and Certificate',
        ],
      },
      {
        place: '3rd Place',
        amount: '₹11,000',
        title: '2nd Runner-Up',
        perks: [
          'Cash Prize and Certificate',
        ],
      },
    ],
  },
};

export const SPECIAL_PRIZE_CATEGORIES: PrizeItem[] = [
  {
    place: 'MVP',
    amount: '₹11,000',
    title: 'MVP',
    perks: ['Cash Prize and Certificate'],
  },
  {
    place: 'MAX GOAL SCORER',
    amount: '₹11,000',
    title: 'Max Goal Scorer',
    perks: ['Cash Prize and Certificate'],
  },
  {
    place: 'BEST DEFENDER',
    amount: '₹11,000',
    title: 'Best Defender',
    perks: ['Cash Prize and Certificate'],
  },
];

export const PRIZE_POOL: PrizeItem[] = [
  ...PRIZE_POOLS.d40.prizes,
  ...PRIZE_POOLS.d20.prizes,
  ...SPECIAL_PRIZE_CATEGORIES,
];

export const TOURNAMENT_TIMELINE: TournamentPhase[] = [
  {
    phase: 'Phase 01',
    date: 'Oct 01 – Dec 03, 2026',
    time: 'Online Registration',
    title: 'Squad Entry & Drone Spec Submission',
    location: 'Official GDSL Portal',
    description:
      'Collegiate squads submit pilot rosters, frequency bands (5.8GHz video/ELRS 2.4GHz control), and cage structural verification.',
    badge: 'ACTIVE NOW',
  },
  {
    phase: 'Phase 02',
    date: 'Dec 08, 2026',
    time: '08:00 – 12:00 IST',
    title: 'Technical Scrutineering & Calibration',
    location: 'GCDIS Flight Pit Hangar',
    description:
      'Mandatory weight check (<1100g Class 40 / <110g Class 20), fail-safe cut-off checks, cage impact tests, and practice flight slots.',
    badge: 'DAY 1 MORNING',
  },
  {
    phase: 'Phase 03',
    date: 'Dec 08, 2026',
    time: '13:00 – 20:00 IST',
    title: 'Group Stage 5v5 Aerial Clashes',
    location: 'Main Arena Cage 1 & 2',
    description:
      '32 squads compete across 4 groups (Alpha, Beta, Gamma, Delta). Round-robin matches of 3 sets of 3 minutes.',
    badge: 'DAY 1 AFTERNOON',
  },
  {
    phase: 'Phase 04',
    date: 'Dec 09, 2026',
    time: '09:00 – 12:30 IST',
    title: 'Knockout Round of 16 & Quarter-Finals',
    location: 'Main Arena Center Cage',
    description:
      'Sudden death elimination bracket. Top 2 teams from each group battle for semi-final spots under stadium lighting.',
    badge: 'DAY 2 MORNING',
  },
  {
    phase: 'Phase 05',
    date: 'Dec 09, 2026',
    time: '13:30 – 16:30 IST',
    title: 'Semi-Finals & Grand Championship Clash',
    location: 'Main Arena Center Cage',
    description:
      'High-stakes aerial clash for the D-40 (₹41,000) and D-20 (₹31,000) championship trophies, broadcasted live on arena LED video walls.',
    badge: 'DAY 2 FINALE',
  },
  {
    phase: 'Phase 06',
    date: 'Dec 09, 2026',
    time: '17:00 – 19:00 IST',
    title: 'Podium Ceremony & GCDIS Aerial Light Show',
    location: 'Indoor Amphitheatre',
    description:
      'Trophy presentation by university dignitaries, prize distribution, and autonomous swarm drone formation show by GCDIS researchers.',
    badge: 'DAY 2 AWARDS NIGHT',
  },
];

export const SAMPLE_TEAMS: TeamRoster[] = [
  {
    id: 'team-galgotias',
    name: 'Galgotias Aero Hawks',
    institution: 'Galgotias University',
    city: 'Greater Noida',
    division: 'Class 40 (400mm)',
    captain: 'Aarav Sharma',
    strikerPilot: 'Kabir Singhania',
    goalkeeper: 'Rohan Verma',
    defenders: ['Aditya Narayan', 'Vikas Mehra'],
    pitCrew: 'Isha Patel',
    droneModel: 'HawkSphere 400X Carbon',
    seed: 1,
    stats: {
      matchesPlayed: 4,
      wins: 4,
      losses: 0,
      goalsFor: 42,
      goalsAgainst: 14,
      points: 12,
    },
    accentColor: '#1d4ed8',
    group: 'Alpha',
  },
  {
    id: 'team-iitd',
    name: 'IIT Delhi AeroVortex',
    institution: 'IIT Delhi',
    city: 'New Delhi',
    division: 'Class 40 (400mm)',
    captain: 'Ananya Sen',
    strikerPilot: 'Kunal Roy',
    goalkeeper: 'Siddharth Bose',
    defenders: ['Tushar Gupta', 'Pooja Nair'],
    pitCrew: 'Rishi Kapoor',
    droneModel: 'VortexCage Pro V3',
    seed: 2,
    stats: {
      matchesPlayed: 4,
      wins: 3,
      losses: 1,
      goalsFor: 35,
      goalsAgainst: 19,
      points: 9,
    },
    accentColor: '#0284c7',
    group: 'Alpha',
  },
  {
    id: 'team-dtu',
    name: 'DTU Sky Phoenix',
    institution: 'Delhi Technological University',
    city: 'Delhi',
    division: 'Class 40 (400mm)',
    captain: 'Vikramaditya Rao',
    strikerPilot: 'Aryan Mathur',
    goalkeeper: 'Nitin Yadav',
    defenders: ['Sahil Chhabra', 'Ayush Mittal'],
    pitCrew: 'Divya Khurana',
    droneModel: 'Phoenix Orb 4.2',
    seed: 3,
    stats: {
      matchesPlayed: 4,
      wins: 3,
      losses: 1,
      goalsFor: 31,
      goalsAgainst: 22,
      points: 9,
    },
    accentColor: '#ea580c',
    group: 'Beta',
  },
  {
    id: 'team-bits',
    name: 'BITS Pilani Falcons',
    institution: 'BITS Pilani',
    city: 'Pilani',
    division: 'Class 40 (400mm)',
    captain: 'Raghav Joshi',
    strikerPilot: 'Dev Mehra',
    goalkeeper: 'Prateek Jain',
    defenders: ['Aniket Sengupta', 'Manav Desai'],
    pitCrew: 'Kavita Pillai',
    droneModel: 'FalconSphere 400',
    seed: 4,
    stats: {
      matchesPlayed: 4,
      wins: 2,
      losses: 2,
      goalsFor: 28,
      goalsAgainst: 26,
      points: 6,
    },
    accentColor: '#16a34a',
    group: 'Beta',
  },
  {
    id: 'team-iiith',
    name: 'IIIT Hyderabad Pulse',
    institution: 'IIIT Hyderabad',
    city: 'Hyderabad',
    division: 'Class 40 (400mm)',
    captain: 'Niharika Reddy',
    strikerPilot: 'Arjun Rao',
    goalkeeper: 'Tarun Varma',
    defenders: ['Kiran Kumar', 'Sandeep Chary'],
    pitCrew: 'Swathi Mohan',
    droneModel: 'PulseShield 40',
    seed: 5,
    stats: {
      matchesPlayed: 4,
      wins: 3,
      losses: 1,
      goalsFor: 38,
      goalsAgainst: 20,
      points: 9,
    },
    accentColor: '#7c3aed',
    group: 'Gamma',
  },
  {
    id: 'team-srm',
    name: 'SRM Air Drifters',
    institution: 'SRM Institute of Science & Tech',
    city: 'Chennai',
    division: 'Class 40 (400mm)',
    captain: 'Karthik Raja',
    strikerPilot: 'Vigneshwaran',
    goalkeeper: 'Dinesh Balan',
    defenders: ['Santhosh K', 'Gokul S'],
    pitCrew: 'Madhumitha R',
    droneModel: 'AeroDrift PolyOrb',
    seed: 6,
    stats: {
      matchesPlayed: 4,
      wins: 2,
      losses: 2,
      goalsFor: 24,
      goalsAgainst: 28,
      points: 6,
    },
    accentColor: '#059669',
    group: 'Gamma',
  },
  {
    id: 'team-nsut',
    name: 'NSUT Strike Wing',
    institution: 'Netaji Subhas University of Tech',
    city: 'New Delhi',
    division: 'Class 40 (400mm)',
    captain: 'Pranav Malik',
    strikerPilot: 'Tanmay Arora',
    goalkeeper: 'Bhavya Bansal',
    defenders: ['Varun Chadha', 'Chirag Goyal'],
    pitCrew: 'Ananya Saxena',
    droneModel: 'StrikeOrb MK-2',
    seed: 7,
    stats: {
      matchesPlayed: 4,
      wins: 1,
      losses: 3,
      goalsFor: 18,
      goalsAgainst: 34,
      points: 3,
    },
    accentColor: '#dc2626',
    group: 'Delta',
  },
  {
    id: 'team-thapar',
    name: 'Thapar Velocity',
    institution: 'Thapar Institute of Eng & Tech',
    city: 'Patiala',
    division: 'Class 40 (400mm)',
    captain: 'Harpreet Singh',
    strikerPilot: 'Amaninder Gill',
    goalkeeper: 'Gursharan Brar',
    defenders: ['Navjot Dhillon', 'Simranjeet'],
    pitCrew: 'Jasleen Kaur',
    droneModel: 'Velocity Sphere Titan',
    seed: 8,
    stats: {
      matchesPlayed: 4,
      wins: 2,
      losses: 2,
      goalsFor: 27,
      goalsAgainst: 29,
      points: 6,
    },
    accentColor: '#d97706',
    group: 'Delta',
  },
];

export const MATCH_FIXTURES: MatchFixture[] = [
  {
    id: 'QF-1',
    round: 'Quarter-Final',
    teamA: 'Quarter-Finalist 1',
    teamB: 'Quarter-Finalist 2',
    scheduledTime: 'Dec 09, 2026 · Morning',
    court: 'Arena Cage 1',
    status: 'Upcoming',
  },
  {
    id: 'QF-2',
    round: 'Quarter-Final',
    teamA: 'Quarter-Finalist 3',
    teamB: 'Quarter-Finalist 4',
    scheduledTime: 'Dec 09, 2026 · Morning',
    court: 'Arena Cage 1',
    status: 'Upcoming',
  },
  {
    id: 'QF-3',
    round: 'Quarter-Final',
    teamA: 'Quarter-Finalist 5',
    teamB: 'Quarter-Finalist 6',
    scheduledTime: 'Dec 09, 2026 · Morning',
    court: 'Arena Cage 2',
    status: 'Upcoming',
  },
  {
    id: 'QF-4',
    round: 'Quarter-Final',
    teamA: 'Quarter-Finalist 7',
    teamB: 'Quarter-Finalist 8',
    scheduledTime: 'Dec 09, 2026 · Midday',
    court: 'Arena Cage 2',
    status: 'Upcoming',
  },
  {
    id: 'SF-1',
    round: 'Semi-Final',
    teamA: 'Winner QF-1',
    teamB: 'Winner QF-2',
    scheduledTime: 'Dec 09, 2026 · Afternoon',
    court: 'Arena Cage 1',
    status: 'Upcoming',
  },
  {
    id: 'SF-2',
    round: 'Semi-Final',
    teamA: 'Winner QF-3',
    teamB: 'Winner QF-4',
    scheduledTime: 'Dec 09, 2026 · Afternoon',
    court: 'Arena Cage 1',
    status: 'Upcoming',
  },
  {
    id: 'GF-1',
    round: 'Grand Finale',
    teamA: 'Winner SF-1',
    teamB: 'Winner SF-2',
    scheduledTime: 'Dec 09, 2026 · Grand Championship',
    court: 'Arena Cage 1',
    status: 'Upcoming',
  },
];

// GCDIS Official Class D20 vs Class D40 Technical Specifications (From Official Rule Book PDFs)
export interface GcdisClassSpec {
  classId: 'Class D20' | 'Class D40';
  targetCategory: string;
  prizePool: string;
  prizeBreakdown: string;
  registrationFee: string;
  securityDeposit: string;
  droneProvision: string;
  ballDiameter: string;
  ballWeightMax: string;
  exoskeletonOpenArea: string;
  ballModificationAllowed: boolean;
  arenaDimensions: string;
  arenaRatio: string;
  arenaClearCeiling: string;
  netDeflectionLimit: string;
  wireWallSpec: string;
  goalInnerDiameter: string;
  goalOuterDiameter: string;
  goalThickness: string;
  goalWeight: string;
  goalCenterHeight: string;
  takeoffPointDistance: string;
  pilotAreaWidth: string;
  repairTimeBetweenSets: string;
  setDuration: string;
  playersPerTeam: string;
  strikersAllowed: string;
  maxRosterMembers: string;
  maxCoaches: string;
  strikerSubDuringGame: string;
  pdfUrl: string;
}
export type FidaClassSpec = GcdisClassSpec;

export const GCDIS_CLASS_SPECS: Record<'class20' | 'class40', GcdisClassSpec> = {
  class20: {
    classId: 'Class D20',
    targetCategory: 'National Drone Soccer League · Class D20 Division',
    prizePool: '₹74,000 Total Pool',
    prizeBreakdown: '1st: ₹31,000 · 2nd: ₹21,000 · 3rd: ₹11,000',
    registrationFee: 'Rs. 1500/-',
    securityDeposit: 'None',
    droneProvision: 'Own drone allowed',
    ballDiameter: 'Ø 20 ± 1 cm',
    ballWeightMax: '150 g (max weight in play)',
    exoskeletonOpenArea: 'No single open surface > 70 cm²',
    ballModificationAllowed: false,
    arenaDimensions: '8 m long × 4 m wide × 3 m high (Custom-made cages allowed)',
    arenaRatio: '1 : 2 (8 m × 4 m)',
    arenaClearCeiling: '3 m high',
    netDeflectionLimit: '≤ 10 cm when hit at 3 m/s',
    wireWallSpec: 'Vertical wires 1–2 mm thick, 10 cm apart',
    goalInnerDiameter: 'Ø 30 ± 1 cm',
    goalOuterDiameter: 'Ø 50 ± 1 cm',
    goalThickness: '10 cm thick',
    goalWeight: 'Identical goals; hung from 1–2 points or fixed on posts',
    goalCenterHeight: '1.8–2.2 m above floor (placed 1.5 m from short side)',
    takeoffPointDistance: '1.5 m from each short side (a line or five dots)',
    pilotAreaWidth: '2 m wide at each short end (separated from repair area)',
    repairTimeBetweenSets: 'At least 5 minutes between sets',
    setDuration: '3 sets of 3 minutes (no time-outs)',
    playersPerTeam: '2–5 members (1 ball per pilot, max 5; at least 2 seated)',
    strikersAllowed: 'Maximum 2 Strikers per team; every other pilot defends',
    maxRosterMembers: '2–5 registered members',
    maxCoaches: 'Only registered pilots may stay in the pilot area',
    strikerSubDuringGame: 'Substitutions only between sets from the registered roster',
    pdfUrl: '/assets/aistudio/Drone_Soccer_League_Rule_Book_D20-1_be50f152.pdf',
  },
  class40: {
    classId: 'Class D40',
    targetCategory: 'National Drone Soccer League · Class D40 Division',
    prizePool: '₹94,000 Total Pool',
    prizeBreakdown: '1st: ₹41,000 · 2nd: ₹31,000 · 3rd: ₹11,000',
    registrationFee: 'To be announced (TBA)',
    securityDeposit: 'Rs. 3000/- deposit for GCDIS drone (refunded on return)',
    droneProvision: 'Own drone allowed OR use a GCDIS drone against Rs. 3000/- refundable deposit',
    ballDiameter: 'Ø 40 ± 2 cm',
    ballWeightMax: '1.2 kg (max weight in play)',
    exoskeletonOpenArea: 'No single open surface > 150 cm²',
    ballModificationAllowed: false,
    arenaDimensions: '16 m × 7 m × 4.5 m recommended (Short 5–10 m, Long 10–20 m, Height 4–5 m)',
    arenaRatio: 'About 1 : 2 (Short 5–10 m, Long 10–20 m)',
    arenaClearCeiling: '4–5 m (4.5 m recommended)',
    netDeflectionLimit: '≤ 20 cm when hit at 5 m/s',
    wireWallSpec: 'Vertical wires 2.3–3.2 mm thick, 10 cm apart',
    goalInnerDiameter: 'Ø 60 ± 1 cm',
    goalOuterDiameter: 'Ø 100 ± 1 cm',
    goalThickness: '20 cm thick',
    goalWeight: '10–15 kg (without cables); hung from ceiling by wires on both sides',
    goalCenterHeight: '3–3.5 m above floor (placed 1.5 m from short side)',
    takeoffPointDistance: '1.5 m from each short side (a line or five dots)',
    pilotAreaWidth: '2 m wide at each short end (separated from repair area)',
    repairTimeBetweenSets: 'At least 5 minutes between sets',
    setDuration: '3 sets of 3 minutes (no time-outs)',
    playersPerTeam: '2–3 members (1 ball per pilot, max 3; at least 2 seated)',
    strikersAllowed: 'Only 1 Striker per team can score; every other pilot defends',
    maxRosterMembers: '2–3 registered members',
    maxCoaches: 'Only registered pilots may stay in the pilot area',
    strikerSubDuringGame: 'Substitutions only between sets from the registered roster',
    pdfUrl: '/assets/aistudio/Drone_Soccer_League_Rule_Book_D40_b79d1f34.pdf',
  },
};

export interface RuleBookSection {
  number: string;
  title: string;
  d20Bullets: string[];
  d40Bullets: string[];
}

export const OFFICIAL_RULEBOOK_SECTIONS: RuleBookSection[] = [
  {
    number: '01',
    title: 'Teams & Registration',
    d20Bullets: [
      'Each team registers 2–5 members. Every member pilots one drone ball, so a team flies one ball per pilot (maximum 5).',
      'Registration fee: Rs. 1500/-. There is no security deposit.',
      'At least 2 pilots must be seated before a game, otherwise the game is forfeited. Fewer than 2 before set 2 or 3 means that set is lost.',
      'Substitutions only between sets, from the registered roster. Tell the referee before the ball enters the cage; the substitute’s ball is inspected.',
      'Only registered pilots may stay in the pilot area.',
    ],
    d40Bullets: [
      'Each team registers 2–3 members. Every member pilots one drone ball, so a team flies one ball per pilot (maximum 3).',
      'Registration fee: To be announced. Teams may fly their own drones or use a GCDIS drone against a Rs. 3000/- security deposit, refunded when the drone is returned.',
      'At least 2 pilots must be seated before a game, otherwise the game is forfeited. Fewer than 2 before set 2 or 3 means that set is lost.',
      'Substitutions only between sets, from the registered roster. Tell the referee before the ball enters the cage; the substitute’s ball is inspected.',
      'Only registered pilots may stay in the pilot area.',
    ],
  },
  {
    number: '02',
    title: 'Arena (Cage)',
    d20Bullets: [
      'Custom-made cages are allowed, provided their dimensions match the specification: 8 m long × 4 m wide × 3 m high.',
      'Floor flat, free of obstacles and preferably not hard. Mark a half line across the middle of the long side, and takeoff points (a line or five dots) 1.5 m from each short side.',
      'A 2 m wide pilot area sits at each short end, separated from the repair area by a boundary marker.',
      'Walls of net or wire so the game stays visible. A net must not deflect more than 10 cm when hit at 3 m/s; wires run vertically, 1–2 mm thick, 10 cm apart. A ball must never leave the cage.',
    ],
    d40Bullets: [
      'Custom-made cages are allowed, provided their dimensions match the specification: short side 5–10 m, long side 10–20 m (about 1 : 2) and height 4–5 m. Recommended standard: 16 m × 7 m × 4.5 m.',
      'Floor flat, free of obstacles and preferably not hard. Mark a half line across the middle of the long side, and takeoff points (a line or five dots) 1.5 m from each short side.',
      'A 2 m wide pilot area sits at each short end, separated from the repair area by a boundary marker.',
      'Walls of net or wire so the game stays visible. A net must not deflect more than 20 cm when hit at 5 m/s; wires run vertically, 2.3–3.2 mm thick, 10 cm apart. A ball must never leave the cage.',
    ],
  },
  {
    number: '03',
    title: 'Goal',
    d20Bullets: [
      'Ring: inner Ø 30 ± 1 cm, outer Ø 50 ± 1 cm, 10 cm thick. Both goals must be identical.',
      'Placed 1.5 m in from the centre of each short side towards the half line, with the ring centre 1.8–2.2 m above the floor. Hung from one or two attachment points or fixed on posts, facing the centre without swaying, and secured so it cannot fall or change shape.',
      'White and red LEDs, switched manually from outside the cage. The ring turns red for an approved goal and back to white afterwards.',
    ],
    d40Bullets: [
      'Ring: inner Ø 60 ± 1 cm, outer Ø 100 ± 1 cm, 20 cm thick, weight 10–15 kg (without cables). Both goals must be identical.',
      'Placed 1.5 m in from the centre of each short side towards the half line, centre height 3–3.5 m. Hung from the ceiling by wires on both sides, facing the centre without swaying, and fixed so it cannot fall or change shape.',
      'White and red LEDs, switched manually from outside the cage. The ring turns red for an approved goal and back to white afterwards.',
    ],
  },
  {
    number: '04',
    title: 'Drone Ball & Equipment',
    d20Bullets: [
      'Round exoskeleton, Ø 20 ± 1 cm. Maximum weight 150 g in play for every drone ball. No single open surface larger than 70 cm²; the shell must not break in a way that endangers people.',
      'Every ball is weighed and inspected before the first match, and the referee may re-check at any time.',
      'Team LED ring in red or blue, visible from all sides. The Striker also carries a green tag and LED. No other colours that confuse team or position. If the Striker’s tag falls off and opponents cannot identify it, goals scored afterwards do not count.',
      'One controller per pilot, bound to that pilot’s ball. Spare batteries and spare balls are allowed (spare-ball batteries removed and stored apart). FPV is optional.',
      'Radio frequencies must follow local law and must never disturb another team’s control.',
      'Banned: lights that dazzle opponents, jammers or transmitters, distracting audio devices, and modifications made only to gain an unfair advantage.',
    ],
    d40Bullets: [
      'Round exoskeleton, Ø 40 ± 2 cm. Maximum weight 1.2 kg in play for every drone ball. No single open surface larger than 150 cm²; the shell must not break in a way that endangers people.',
      'Every ball is weighed and inspected before the first match, and the referee may re-check at any time.',
      'Team LED ring in red or blue, visible from all sides. The Striker also carries a green tag and LED. No other colours that confuse team or position. If the Striker’s tag falls off and opponents cannot identify it, goals scored afterwards do not count.',
      'One controller per pilot, bound to that pilot’s ball. Spare batteries and spare balls are allowed (spare-ball batteries removed and stored apart). FPV is optional.',
      'Radio frequencies must follow local law and must never disturb another team’s control.',
      'Banned: lights that dazzle opponents, jammers or transmitters, distracting audio devices, and modifications made only to gain an unfair advantage.',
    ],
  },
  {
    number: '05',
    title: 'Match Format',
    d20Bullets: [
      'A game is 3 sets of 3 minutes. No time-outs. The coin-toss winner picks the pilot area (left or right), fixed for all sets unless the referee rules it unfair.',
      'Balls wait at the takeoff points and pilots stand in the pilot area. Whistle: 1 long = ready (at least 10 s before start), 1 short = start (given unpredictably), short + long = end of set. Moving a ball before the start signal earns a warning.',
      'Repair time: at least 5 minutes between sets, counted from when all pilots and balls have left the cage. It is not extended just because a team is not ready; LED and tag fixes may be made at the referee’s request.',
      'The referee may pause play for safety or arena faults; score and time are restored on resume. A set is void if the cage is badly damaged or play cannot resume within one hour.',
      'Abandoning a game or deliberately delaying it is a game loss.',
    ],
    d40Bullets: [
      'A game is 3 sets of 3 minutes. No time-outs. The coin-toss winner picks the pilot area (left or right), fixed for all sets unless the referee rules it unfair.',
      'Balls wait at the takeoff points and pilots stand in the pilot area. Whistle: 1 long = ready (at least 10 s before start), 1 short = start (given unpredictably), short + long = end of set. Moving a ball before the start signal earns a warning.',
      'Repair time: at least 5 minutes between sets, counted from when all pilots and balls have left the cage. It is not extended just because a team is not ready; LED and tag fixes may be made at the referee’s request.',
      'The referee may pause play for safety or arena faults; score and time are restored on resume. A set is void if the cage is badly damaged or play cannot resume within one hour.',
      'Abandoning a game or deliberately delaying it is a game loss.',
    ],
  },
  {
    number: '06',
    title: 'Scoring, Offside & Defence',
    d20Bullets: [
      'Goal: the Striker’s ball passes completely through the opponent’s goal from front to back. Only Strikers (maximum two per team) can score; every other pilot defends.',
      'No goal if the ball rebounds without clearing the ring, passes back to front, or the team is offside.',
      'Offside: after a Striker passes through the opponent’s goal in either direction, the team cannot score again until every one of its balls in the opponent’s half has returned behind the half line. If a ball there is uncontrollable, offside stays until its pilot gives up the set and puts the controller down.',
      'Defence: defenders may fly through their own goal from front to back only. Entering from the back, even slightly, or entering from the front with more than half the ball and coming back out, is a reverse entry. A ball that pokes past the back of the goal must retreat to its defending position.',
    ],
    d40Bullets: [
      'Goal: the Striker’s ball passes completely through the opponent’s goal from front to back. Only the Striker (one per team) can score; every other pilot defends.',
      'No goal if the ball rebounds without clearing the ring, passes back to front, or the team is offside.',
      'Offside: after a Striker passes through the opponent’s goal in either direction, the team cannot score again until every one of its balls in the opponent’s half has returned behind the half line. If a ball there is uncontrollable, offside stays until its pilot gives up the set and puts the controller down.',
      'Defence: defenders may fly through their own goal from front to back only. Entering from the back, even slightly, or entering from the front with more than half the ball and coming back out, is a reverse entry. A ball that pokes past the back of the goal must retreat to its defending position.',
    ],
  },
  {
    number: '07',
    title: 'Penalty Kicks',
    d20Bullets: [
      'A penalty kick is awarded for: consecutive goals scored while offside, a reverse entry into a team’s own goal, or two accumulated warnings (they carry across sets and reset every game).',
      'After each set, penalties of both teams are offset and the difference is awarded to the other team. All penalties are still recorded.',
      'A kick is one-on-one, Striker vs Keeper, for 5 seconds from the referee’s signal. The Striker starts at the half line, the Keeper (one defender) below its goal. Several goals may be scored in the 5 seconds; offside rules still apply.',
      'Group stage: every awarded kick must be taken (it counts for goal difference). Knockout stage: the awarded team may waive it. The set ends after the kick, followed by 5 minutes of repair time.',
    ],
    d40Bullets: [
      'A penalty kick is awarded for: consecutive goals scored while offside, a reverse entry into a team’s own goal, or two accumulated warnings (they carry across sets and reset every game).',
      'After each set, penalties of both teams are offset and the difference is awarded to the other team. All penalties are still recorded.',
      'A kick is one-on-one, Striker vs Keeper, for 5 seconds from the referee’s signal. The Striker starts at the half line, the Keeper (one defender) below its goal. Several goals may be scored in the 5 seconds; offside rules still apply.',
      'Group stage: every awarded kick must be taken (it counts for goal difference). Knockout stage: the awarded team may waive it. The set ends after the kick, followed by 5 minutes of repair time.',
    ],
  },
  {
    number: '08',
    title: 'Winning',
    d20Bullets: [
      'More goals in a set wins the set; equal goals (including 0–0) is a drawn set.',
      'After three sets the team with more set wins is the winner: two wins, or one win and two draws.',
      'Still level: one overtime set in the same format, then a penalty shoot-out of 3 kicks per team (pilots may repeat in small teams) in a fixed order, then sudden death: the first team to score while the other misses wins. If a competition allows draws, there is no overtime or shoot-out.',
    ],
    d40Bullets: [
      'More goals in a set wins the set; equal goals (including 0–0) is a drawn set.',
      'After three sets the team with more set wins is the winner: two wins, or one win and two draws.',
      'Still level: one overtime set in the same format, then a penalty shoot-out of 3 kicks per team (pilots may repeat in small teams) in a fixed order, then sudden death: the first team to score while the other misses wins. If a competition allows draws, there is no overtime or shoot-out.',
    ],
  },
  {
    number: '09',
    title: 'Violations',
    d20Bullets: [
      'Warning: a non-pilot staying in the pilot area; minor unsportsmanlike behaviour; moving arena equipment without permission to gain an advantage; moving a ball before the start signal; ignoring a legitimate referee instruction.',
      'Set loss: someone outside the set controlling a ball in play; deliberately changing ball colours; moving a ball by hand, foot or equipment instead of radio control; repeating the same warning to delay or protest; banned equipment that affected play.',
      'Game loss: using a drone to threaten or endanger anyone; serious unsportsmanlike conduct towards officials, opponents or spectators; an unregistered person flying or being included.',
    ],
    d40Bullets: [
      'Warning: a non-pilot staying in the pilot area; minor unsportsmanlike behaviour; moving arena equipment without permission to gain an advantage; moving a ball before the start signal; ignoring a legitimate referee instruction.',
      'Set loss: someone outside the set controlling a ball in play; deliberately changing ball colours; moving a ball by hand, foot or equipment instead of radio control; repeating the same warning to delay or protest; banned equipment that affected play.',
      'Game loss: using a drone to threaten or endanger anyone; serious unsportsmanlike conduct towards officials, opponents or spectators; an unregistered person flying or being included.',
    ],
  },
  {
    number: '10',
    title: 'Officials & Decisions',
    d20Bullets: [
      'Every game has one head referee and two assistant referees (up to four: score referees and penalty referees). Assistants judge goals, offside and penalties; if they disagree, the head referee decides. Head referee decisions are final.',
      'The head referee may stop the game, remove a pilot for safety, and review the official recording to correct a decision before play resumes. Private footage is never accepted.',
      'Assistant signals: flag raised and goal ring turns red = goal approved; flags raised in a V and ring stays white = goal disapproved; flag held out sideways = offside return declared; flag lowered and ring back to white = return completed.',
    ],
    d40Bullets: [
      'Every game has one head referee and two assistant referees (up to four: score referees and penalty referees). Assistants judge goals, offside and penalties; if they disagree, the head referee decides. Head referee decisions are final.',
      'The head referee may stop the game, remove a pilot for safety, and review the official recording to correct a decision before play resumes. Private footage is never accepted.',
      'Assistant signals: flag raised and goal ring turns red = goal approved; flags raised in a V and ring stays white = goal disapproved; flag held out sideways = offside return declared; flag lowered and ring back to white = return completed.',
    ],
  },
];

// Official LED & Tag Identification (Rule 3 & Rule 4)
export const GCDIS_7_COLORS = [
  {
    role: 'Team A LED Ring',
    color: 'Red',
    hex: '#dc2626',
    user: 'All Drones on Team A',
    method: 'Team LED ring visible from all sides',
  },
  {
    role: 'Team B LED Ring',
    color: 'Blue',
    hex: '#2563eb',
    user: 'All Drones on Team B',
    method: 'Team LED ring visible from all sides',
  },
  {
    role: 'Designated Striker',
    color: 'Green Tag & LED',
    hex: '#16a34a',
    user: 'Only Striker(s) Can Score (1 in D40, max 2 in D20)',
    method: 'Green tag + LED (if tag falls off & cannot be identified, goals do not count)',
  },
  {
    role: 'Goal Ring · Normal / Cleared',
    color: 'White Goal LED',
    hex: '#ffffff',
    user: 'Goal Hoop Default & Offside Cleared State',
    method: 'Manual outside switch (stays white on disapproved goal or after offside return)',
  },
  {
    role: 'Goal Ring · Goal Approved',
    color: 'Red Goal LED',
    hex: '#ef4444',
    user: 'Approved Goal & Active Offside State',
    method: 'Manual outside switch (turns red for an approved goal and back to white afterwards)',
  },
];

// Official Referee Whistle, Flag & Goal Ring Signals (Rules 3, 5 & 10)
export const GCDIS_REFEREE_SIGNALS = [
  {
    category: 'Ready Signal (≥10s Before Start)',
    handSignal: 'Balls at takeoff points; pilots stand in pilot area',
    whistle: '1 Long Whistle',
    goalLed: 'WHITE',
    meaning: 'Ready signal given at least 10 seconds before start. Moving a ball before start earns a warning.',
  },
  {
    category: 'Start of Set',
    handSignal: 'Set timer begins (3 minutes)',
    whistle: '1 Short Whistle (Unpredictable)',
    goalLed: 'WHITE',
    meaning: 'Unpredictable short whistle starts the 3-minute set.',
  },
  {
    category: 'End of Set',
    handSignal: 'All pilots & balls leave the cage',
    whistle: '1 Short + 1 Long Whistle',
    goalLed: 'WHITE',
    meaning: 'Set concludes; at least 5 minutes of repair time begins once all pilots and balls leave the cage.',
  },
  {
    category: 'Goal Approved',
    handSignal: 'Assistant referee flag raised',
    whistle: 'Score Referee confirmation',
    goalLed: 'Turns RED',
    meaning: 'Striker ball passed completely through opponent goal from front to back.',
  },
  {
    category: 'Goal Disapproved',
    handSignal: 'Assistant flags raised in a V',
    whistle: 'No-goal indication',
    goalLed: 'Stays WHITE',
    meaning: 'Ball rebounded without clearing ring, passed back to front, or team was offside.',
  },
  {
    category: 'Offside Return Declared',
    handSignal: 'Assistant flag held out sideways',
    whistle: 'Offside active',
    goalLed: 'RED (Until Cleared)',
    meaning: 'Every ball of the scoring team in the opponent’s half must return behind the half line.',
  },
  {
    category: 'Offside Return Completed',
    handSignal: 'Assistant flag lowered',
    whistle: 'Clearance confirmed',
    goalLed: 'Back to WHITE',
    meaning: 'All balls in opponent’s half returned behind half line; team can score again.',
  },
];

// Official Match Workflow Steps (Page 1 of Rule Books)
export const GCDIS_5TH_REVISION_UPDATES = [
  {
    rule: 'Step 01 · Register',
    title: 'Team & Pilot Roster Registration',
    description:
      'Register 2–5 members in Class D20 (Rs. 1500/- fee, no deposit) or 2–3 members in Class D40 (own drone or GCDIS drone with Rs. 3000/- refundable deposit).',
  },
  {
    rule: 'Step 02 · Inspect Drones',
    title: 'Pre-Match Weight & Exoskeleton Inspection',
    description:
      'Every ball is weighed and inspected before the first match (D20: Ø 20±1 cm, ≤150 g, ≤70 cm² opening; D40: Ø 40±2 cm, ≤1.2 kg, ≤150 cm² opening). Referee may re-check anytime.',
  },
  {
    rule: 'Step 03 · Toss & Ready',
    title: 'Coin Toss & Takeoff Positioning',
    description:
      'Coin-toss winner picks the pilot area (left or right) for all sets. Balls wait at the 1.5 m takeoff points; 1 long whistle signals Ready (≥10 s before start).',
  },
  {
    rule: 'Step 04 · Play 3 Sets',
    title: '3 Sets × 3 Minutes with 5-Min Repair',
    description:
      '1 short unpredictable whistle starts each 3-minute set (no time-outs). At least 5 minutes of repair time is provided between sets once all pilots and balls leave the cage.',
  },
  {
    rule: 'Step 05 · Penalty Kicks',
    title: '5-Second 1-on-1 Striker vs Keeper Kicks',
    description:
      'Awarded for consecutive offside goals, reverse entry into own goal, or 2 accumulated warnings. Penalties are offset after each set and taken 1-on-1 for 5 seconds.',
  },
  {
    rule: 'Step 06 · Winner',
    title: 'Set Wins, Overtime Set & Shoot-Out',
    description:
      'Team with more set wins (2 wins, or 1 win & 2 draws) wins. If level: 1 overtime set, then a 3-kick penalty shoot-out in fixed order, then sudden death.',
  },
];

// Official Violations Hierarchy (Rule 9)
export const GCDIS_VIOLATIONS = [
  {
    level: 'Warning',
    consequence: '2 accumulated warnings = 1 Penalty Kick awarded to opponent (carry across sets and reset every game).',
    triggers: [
      'A non-pilot staying in the pilot area.',
      'Minor unsportsmanlike behaviour.',
      'Moving arena equipment without permission to gain an advantage.',
      'Moving a ball before the start signal.',
      'Ignoring a legitimate referee instruction.',
    ],
  },
  {
    level: 'Set Loss',
    consequence: 'Team immediately loses the set (also triggered if fewer than 2 pilots are seated before set 2 or 3).',
    triggers: [
      'Someone outside the set controlling a ball in play.',
      'Deliberately changing ball colours.',
      'Moving a ball by hand, foot or equipment instead of radio control.',
      'Repeating the same warning to delay or protest.',
      'Banned equipment that affected play.',
    ],
  },
  {
    level: 'Game Loss',
    consequence: 'Team forfeits the entire game (also triggered if fewer than 2 pilots are seated before a game, or abandoning/deliberately delaying a game).',
    triggers: [
      'Using a drone to threaten or endanger anyone.',
      'Serious unsportsmanlike conduct towards officials, opponents or spectators.',
      'An unregistered person flying or being included.',
    ],
  },
];

export const FREQUENT_QUESTIONS = [
  {
    q: 'What are the key differences between Class D20 and Class D40?',
    a: 'Class D20 is for teams of 2–5 members flying Ø 20 ± 1 cm drone balls (max weight 150 g, open surface ≤ 70 cm²) inside an 8 × 4 × 3 m cage with Ø 30 cm goals and up to 2 Strikers per team (Registration fee: Rs. 1500/-, no deposit). Class D40 is for teams of 2–3 members flying Ø 40 ± 2 cm drone balls (max weight 1.2 kg, open surface ≤ 150 cm²) inside a 16 × 7 × 4.5 m cage with Ø 60 cm goals (10–15 kg) and 1 Striker per team (Own drone allowed or GCDIS drone with Rs. 3000/- refundable deposit).',
  },
  {
    q: 'How does the Offside rule work in the Rule Book (Rule 6)?',
    a: 'After a Striker passes through the opponent’s goal in either direction, the team cannot score again until every one of its balls in the opponent’s half has returned behind the half line. If a ball there is uncontrollable, offside stays until its pilot gives up the set and puts the controller down.',
  },
  {
    q: 'What is a Reverse Entry in defence and what is the penalty (Rule 6 & 7)?',
    a: 'Defenders may fly through their own goal from front to back only. Entering from the back, even slightly, or entering from the front with more than half the ball and coming back out, is a reverse entry. A ball that pokes past the back of the goal must retreat to its defending position. A reverse entry into a team’s own goal awards a penalty kick to the opponent.',
  },
  {
    q: 'How do Penalty Kicks work after a set (Rule 7)?',
    a: 'A penalty kick is awarded for consecutive goals scored while offside, a reverse entry into a team’s own goal, or two accumulated warnings. After each set, penalties of both teams are offset and the difference is awarded to the other team. Each kick is one-on-one, Striker vs Keeper, for 5 seconds from the referee’s signal (Striker starts at the half line, Keeper below its goal). Several goals may be scored in the 5 seconds; offside rules still apply. In the group stage every awarded kick must be taken; in the knockout stage the awarded team may waive it.',
  },
  {
    q: 'How is a match won if teams are tied after 3 sets (Rule 8)?',
    a: 'After three sets, the team with more set wins is the winner (two wins, or one win and two draws). If still level: one overtime set is played in the same format, followed by a penalty shoot-out of 3 kicks per team (pilots may repeat in small teams) in a fixed order, and then sudden death where the first team to score while the other misses wins.',
  },
  {
    q: 'Can the Head Referee review video footage during a game (Rule 10)?',
    a: 'Yes. Every game has one head referee and two assistant referees (up to four: score referees and penalty referees). The head referee may stop the game, remove a pilot for safety, and review the official recording to correct a decision before play resumes. Private footage is never accepted, and head referee decisions are final.',
  },
];

