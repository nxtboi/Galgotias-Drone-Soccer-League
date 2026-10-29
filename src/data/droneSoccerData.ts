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
    { label: 'Pilot Desk 1', number: '+91 94110 53011', tel: '+919411053011' },
    { label: 'Pilot Desk 2', number: '+91 97986 93029', tel: '+919798693029' },
    { label: 'Safety & Scrutineering', number: '+91 95696 96140', tel: '+919569696140' },
    { label: 'Telemetry & Ref Desk', number: '+91 76260 40216', tel: '+917626040216' },
  ],
  supportEmail: 'gcdis.dronesoccer@galgotiasuniversity.edu.in',
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
          'Trophy and Medals',
        ],
        highlight: true,
      },
      {
        place: '2nd Place',
        amount: '₹31,000',
        title: '1st Runner-Up',
        perks: [
          'Trophy and Medals',
        ],
      },
      {
        place: '3rd Place',
        amount: '₹11,000',
        title: '2nd Runner-Up',
        perks: [
          'Trophy and Medals',
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
          'Trophy and Medals',
        ],
        highlight: true,
      },
      {
        place: '2nd Place',
        amount: '₹21,000',
        title: '1st Runner-Up',
        perks: [
          'Trophy and Medals',
        ],
      },
      {
        place: '3rd Place',
        amount: '₹11,000',
        title: '2nd Runner-Up',
        perks: [
          'Trophy and Medals',
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
    perks: ['Trophy and Medals'],
  },
  {
    place: 'MAX GOAL SCORER',
    amount: '₹11,000',
    title: 'Max Goal Scorer',
    perks: ['Trophy and Medals'],
  },
  {
    place: 'BEST DEFENDER',
    amount: '₹11,000',
    title: 'Best Defender',
    perks: ['Trophy and Medals'],
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

// GCDIS Official Class 20 vs Class 40 Technical Comparison
export interface GcdisClassSpec {
  classId: 'Class 20' | 'Class 40';
  targetCategory: string;
  prizePool: string;
  prizeBreakdown: string;
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
  maxRosterMembers: string;
  maxCoaches: string;
  strikerSubDuringGame: string;
}
export type FidaClassSpec = GcdisClassSpec;

export const GCDIS_CLASS_SPECS: Record<'class20' | 'class40', GcdisClassSpec> = {
  class20: {
    classId: 'Class 20',
    targetCategory: 'Junior / Varsity / Educational (No modifications allowed)',
    prizePool: '₹74,000 Total Pool',
    prizeBreakdown: '1st: ₹31,000 · 2nd: ₹21,000 · 3rd: ₹11,000 · Special: ₹11,000',
    ballDiameter: '20 cm ± 1 cm',
    ballWeightMax: '110 grams (max during play)',
    exoskeletonOpenArea: '≤ 70 cm² per single surface',
    ballModificationAllowed: false,
    arenaDimensions: '4 m wide (short side) × 8 m long × 3 m high',
    arenaRatio: '1 : 2',
    arenaClearCeiling: '3.0 meters',
    netDeflectionLimit: '≤ 10 cm when hit at 3 m/s',
    wireWallSpec: '1–2 mm vertical wires spaced 10 cm apart',
    goalInnerDiameter: '30 cm ± 1 cm',
    goalOuterDiameter: '50 cm ± 1 cm',
    goalThickness: '10 cm',
    goalWeight: 'Identical size & weight across both goals',
    goalCenterHeight: '1.8 m to 2.2 m above floor',
    takeoffPointDistance: '1.5 m from short side (line or 5 dots below goal)',
    pilotAreaWidth: '2.0 m wide along both short sides',
    repairTimeBetweenSets: '5 minutes guaranteed (+3 min for 3+ repairs)',
    setDuration: '3 sets × 3 minutes each',
    playersPerTeam: '5 players (min 3 required to play)',
    maxRosterMembers: '10 members',
    maxCoaches: '3 coaches',
    strikerSubDuringGame: 'Substitution permitted before set start only',
  },
  class40: {
    classId: 'Class 40',
    targetCategory: 'Standard Collegiate / Professional Championship Division',
    prizePool: '₹94,000 Total Pool',
    prizeBreakdown: '1st: ₹41,000 · 2nd: ₹31,000 · 3rd: ₹11,000 · Special: ₹11,000',
    ballDiameter: '40 cm ± 2 cm',
    ballWeightMax: '1,100 grams (max during play)',
    exoskeletonOpenArea: '≤ 150 cm² per single surface',
    ballModificationAllowed: true,
    arenaDimensions: '16 m long × 7 m or 8 m wide × 4.5 m high (Standard)',
    arenaRatio: '1 : 2 (Short 5–10m, Long 10–20m)',
    arenaClearCeiling: '4.0 m to 5.0 m (4.5 m standard)',
    netDeflectionLimit: '≤ 20 cm when hit at 5 m/s',
    wireWallSpec: '2.3–3.2 mm vertical wires spaced 10 cm apart',
    goalInnerDiameter: '60 cm ± 1 cm',
    goalOuterDiameter: '100 cm ± 1 cm',
    goalThickness: '20 cm',
    goalWeight: '10 to 15 kg each (excluding cables)',
    goalCenterHeight: '3.0 m to 3.5 m above floor',
    takeoffPointDistance: '1.5 m from short side (line or 5 dots below goal)',
    pilotAreaWidth: '2.0 m wide along both short sides',
    repairTimeBetweenSets: '5 minutes guaranteed (+3 min for 3+ repairs)',
    setDuration: '3 sets × 3 minutes each',
    playersPerTeam: '5 players (min 3 required to play)',
    maxRosterMembers: '10 members',
    maxCoaches: '3 coaches',
    strikerSubDuringGame: 'Allowed: Guide may substitute Striker by ball contact',
  },
};

// 7 Official Colors for Position & Team Identification (GCDIS Class 40 Rule 2-5)
export const GCDIS_7_COLORS = [
  {
    role: 'Team Color',
    color: 'Red',
    hex: '#dc2626',
    user: 'All Players on Team A',
    method: '360° Circular LED Strip (≥6 LEDs/10cm)',
  },
  {
    role: 'Team Color',
    color: 'Blue',
    hex: '#2563eb',
    user: 'All Players on Team B',
    method: '360° Circular LED Strip (≥6 LEDs/10cm)',
  },
  {
    role: 'No.1 Striker (Attacker)',
    color: 'Green',
    hex: '#16a34a',
    user: 'Only Player Who Can Score',
    method: 'Position LED + Visible Striker Tag',
  },
  {
    role: 'No.2 Guide (Attacker)',
    color: 'Pink',
    hex: '#ec4899',
    user: 'Escorts Striker / In-game Striker Substitute',
    method: 'Position LED + Visible Guide Tag',
  },
  {
    role: 'No.3 Libero (Front Defender)',
    color: 'SkyBlue',
    hex: '#0284c7',
    user: 'Disrupts Opponent Guide & Striker in Front',
    method: 'Position LED Strip',
  },
  {
    role: 'No.4 Sweeper (Rear Defender)',
    color: 'Yellow',
    hex: '#eab308',
    user: 'Blocks Opponent Striker Goal Approach',
    method: 'Position LED Strip',
  },
  {
    role: 'No.5 Keeper (Goal Defender)',
    color: 'White',
    hex: '#ffffff',
    user: 'Blocks Aerial Goal Hoop',
    method: 'Position LED Strip',
  },
];

// GCDIS Referee Whistle & Visual Signals (Rules 5-7, 6-4)
export const GCDIS_REFEREE_SIGNALS = [
  {
    category: '10 Secs to Start',
    handSignal: 'Both arms extended horizontally',
    whistle: 'Long 1 time',
    goalLed: 'WHITE (Normal state)',
    meaning: 'All players must be at control stations; countdown initiated.',
  },
  {
    category: 'Start of Set',
    handSignal: 'One arm raised forward/upward',
    whistle: 'Short 1 time',
    goalLed: 'WHITE',
    meaning: 'Unpredictable signal starting the 3-minute set.',
  },
  {
    category: 'Striker Substitution Completed',
    handSignal: 'One arm raised high with open palm',
    whistle: 'Short 2 times',
    goalLed: 'WHITE',
    meaning: 'Guide successfully contacted withdrawn Striker ball; now designated Striker.',
  },
  {
    category: 'Score Approved',
    handSignal: 'Single arm raised pointing vertically up',
    whistle: 'Whistle by Assistant Referee',
    goalLed: 'Turn RED',
    meaning: 'Striker cleanly penetrated hoop front-to-back; team enters offside.',
  },
  {
    category: 'Score Disapproved',
    handSignal: 'Arms crossed in front of chest (X signal)',
    whistle: 'Short blow',
    goalLed: 'Remain WHITE',
    meaning: 'Rebounded, non-striker entered, or offside violation.',
  },
  {
    category: 'Return Declared (Offside)',
    handSignal: 'Signal toward half-line corridor',
    whistle: 'Whistle signal',
    goalLed: 'Remain RED',
    meaning: 'Scoring team must return all drones behind center half line.',
  },
  {
    category: 'Return Completed (Offside Cleared)',
    handSignal: 'Arm dropped to side at 45 degrees',
    whistle: 'Clearance confirmation',
    goalLed: 'Turn WHITE',
    meaning: 'Offside cleared. Scoring team is authorized to attack again.',
  },
  {
    category: 'End of Set',
    handSignal: 'Both arms extended horizontally',
    whistle: 'Short 1 time, Long 1 time',
    goalLed: 'WHITE',
    meaning: '3 minutes elapsed; 5-minute repair period begins immediately.',
  },
];

// GCDIS 5th Revision Key Updates (Oct 1, 2025 / Jan 1, 2026)
export const GCDIS_5TH_REVISION_UPDATES = [
  {
    rule: 'Rule 5-2-n & Addendum 2',
    title: 'Addition of VAR (Video Assistant Referee) System',
    description:
      'Head Referees can use multi-camera VAR (1080/60p synchronized replay) for goal reviews, buzzer-beaters, and penalty corrections.',
  },
  {
    rule: 'Rule 10-1, 10-2',
    title: 'Match Result Criteria Update',
    description:
      'In addition to winning two sets first, a team with 1 win and 2 draws is now officially recognized as the match winner.',
  },
  {
    rule: 'Rule 9-4-f',
    title: 'Standardized Stage Terminology',
    description:
      'Official competition terminology formally revised from "League" and "Tournament" to "Group Stage" and "Knockout Stage".',
  },
  {
    rule: 'Rule 6-1',
    title: 'Assistant Referee Specialization',
    description:
      'Referees subdivided into dedicated Score Referees (striker goals & fouls) and Penalty Referees (goalmouth defense infractions).',
  },
  {
    rule: 'Rule 3-4 (Class 40)',
    title: 'In-Game Striker Substitution by Guide',
    description:
      'If the Striker withdraws mid-set, the Guide may substitute Striker if the Guide’s ball contacts the withdrawn Striker ball.',
  },
];

// GCDIS Official Violations Hierarchy (Rule 11)
export const GCDIS_VIOLATIONS = [
  {
    level: 'Warning',
    consequence: '2 Warnings accumulated = 1 Penalty Kick awarded to opponent. Carries over to next set.',
    triggers: [
      'Person who is not a player/coach remaining in pilot area.',
      'Minor act of unsportsmanlike behavior toward referees or opponents.',
      'Modifying or moving arena equipment without referee permission.',
      'Moving drone ball before game start signal.',
      'Failing to comply with a legitimate referee instruction.',
    ],
  },
  {
    level: 'Set Loss',
    consequence: 'Team forfeits the active set; 5-minute repair time commences immediately.',
    triggers: [
      'Person not participating in the set intentionally manipulating a ball in play.',
      'Intentionally altering the team color LEDs used to distinguish teams.',
      'Moving a drone ball using physical force (hands, feet, equipment) instead of radio control.',
      'Receiving the same warning repeatedly with intent to delay or protest.',
    ],
  },
  {
    level: 'Game Loss (Disqualification)',
    consequence: 'Team immediately forfeits the entire match.',
    triggers: [
      'Intentionally using a drone ball to threaten or endanger others.',
      'Serious unsportsmanlike conduct or aggression toward referees/spectators.',
      'Fielding a player not registered on the official participant list.',
    ],
  },
];

export const FREQUENT_QUESTIONS = [
  {
    q: 'What is the exact difference between Class 20 and Class 40?',
    a: 'Class 20 features 20cm (±1cm) drone balls weighing under 110g in a compact 8m × 4m × 3m Skyfence with 30cm goals, and equipment modifications are strictly prohibited. Class 40 is the premier 40cm (±2cm) division weighing under 1100g in a 16m × 8m × 4.5m Skyfence with 60cm inner goals weighing 10-15kg each, featuring GCDIS 7-color LED role positions and in-game Striker substitution.',
  },
  {
    q: 'How does the Offside rule work in Drone Soccer?',
    a: 'When a Striker passes through the opponent’s goal in any direction, the scoring team enters an offside state. To clear offside, ALL drone balls belonging to the scoring team inside the opponent’s half must return behind the center half line. Only once the assistant referee signals return completed (Goal LED turns WHITE) may another goal be attempted.',
  },
  {
    q: 'What constitutes an illegal Reverse Entry during defense?',
    a: 'While defenders may pass through their own goal from front to back, reverse entry (back to front) is strictly prohibited. If more than half the drone ball enters from front and comes back out, or enters from the back side even slightly, it is an illegal reverse entry and awards a 1-on-1 penalty kick to the opposing striker.',
  },
  {
    q: 'How does the 5-second Penalty Kick operate?',
    a: 'After set completion, the Striker starts at the half line and the Keeper starts below the goal. Upon referee signal, the Striker has 5 seconds to score. Multiple goals can be scored in those 5 seconds if offside is cleared each time. Penalties are offset between teams or converted directly into points.',
  },
  {
    q: 'How is Video Assistant Referee (VAR) used under the 5th Revision?',
    a: 'The Head Referee can utilize multi-camera synchronized replay (minimum 5 cameras: both goals, both pilot areas, whole arena at 1080/60p) to review clear and obvious errors in goal validity (including buzzer-beater goals), penalty infractions, or score discrepancies. Coaches receive Challenge Tickets to request reviews.',
  },
];
