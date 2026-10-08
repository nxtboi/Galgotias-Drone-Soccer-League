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
  dates: 'November 14 – 16, 2026',
  totalPrizePool: '₹1,00,000',
  teamCapacity: 32,
  registeredTeamsCount: 28,
  matchFormat: '5 vs 5 & 3 vs 3 Caged Aerial Soccer',
  setDuration: '3 sets × 3 minutes each',
  regDeadline: 'November 05, 2026 · 23:59 IST',
  emergencyHelpline: '+91 98712 34567',
  supportEmail: 'gcdis.dronesoccer@galgotiasuniversity.edu.in',
  governingStandard: 'FIDA (Federation of International Dronesoccer Association) 5th Revision',
};

export const PRIZE_POOL: PrizeItem[] = [
  {
    place: '1st Place',
    amount: '₹50,000',
    title: 'GDSL National Championship Trophy',
    perks: [
      'GDSL Grand Trophy + Individual Gold Medals',
      'FIDA-aligned National Drone Soccer Citation',
      'Exclusive GCDIS Aerospace Research Lab Fellowship',
      'Full Flight Kit & High-Performance Carbon Cage Spares',
    ],
    highlight: true,
  },
  {
    place: '2nd Place',
    amount: '₹25,000',
    title: 'Runners-Up Silver Cup',
    perks: [
      'Silver Trophy + Individual Silver Medals',
      'Official GDSL Silver Merit Certificates',
      'High-C LiPo Battery Packs & Rapid Charger Hub',
    ],
  },
  {
    place: '3rd Place',
    amount: '₹15,000',
    title: 'Bronze Plate Podium',
    perks: [
      'Bronze Trophy + Individual Bronze Medals',
      'Certificate of Sporting Distinction',
      'High-Speed Brushless Motor & Propeller Spares Kit',
    ],
  },
  {
    place: 'Special Awards',
    amount: '₹10,000',
    title: 'Pilot & Engineering Distinction',
    perks: [
      '₹5,000 · Golden Striker MVP (Top Scorer of the League)',
      '₹5,000 · Best Engineered Protective Cage (Aerodynamics & Strength)',
    ],
  },
];

export const TOURNAMENT_TIMELINE: TournamentPhase[] = [
  {
    phase: 'Phase 01',
    date: 'Oct 01 – Nov 05, 2026',
    time: 'Online Registration',
    title: 'Squad Entry & Drone Spec Submission',
    location: 'Official GDSL Portal',
    description:
      'Collegiate squads submit pilot rosters, frequency bands (5.8GHz video/ELRS 2.4GHz control), and cage structural verification.',
    badge: 'ACTIVE NOW',
  },
  {
    phase: 'Phase 02',
    date: 'Nov 14, 2026',
    time: '08:00 – 12:00 IST',
    title: 'Technical Scrutineering & Calibration',
    location: 'GCDIS Flight Pit Hangar',
    description:
      'Mandatory weight check (<1100g Class 40 / <110g Class 20), fail-safe cut-off checks, cage impact tests, and practice flight slots.',
    badge: 'DAY 1 MORNING',
  },
  {
    phase: 'Phase 03',
    date: 'Nov 14 – 15, 2026',
    time: '13:00 – 19:00 IST',
    title: 'Group Stage 5v5 Aerial Clashes',
    location: 'Main Arena Cage 1 & 2',
    description:
      '32 squads compete across 4 groups (Alpha, Beta, Gamma, Delta). Round-robin matches of 3 sets of 3 minutes.',
    badge: 'DAY 1-2',
  },
  {
    phase: 'Phase 04',
    date: 'Nov 15, 2026',
    time: '14:00 – 18:30 IST',
    title: 'Knockout Round of 16 & Quarter-Finals',
    location: 'Main Arena Center Cage',
    description:
      'Sudden death elimination bracket. Top 2 teams from each group battle for semi-final spots under stadium lighting.',
    badge: 'DAY 2 EVENING',
  },
  {
    phase: 'Phase 05',
    date: 'Nov 16, 2026',
    time: '10:00 – 15:30 IST',
    title: 'Semi-Finals & Grand Championship Clash',
    location: 'Main Arena Center Cage',
    description:
      'High-stakes 5v5 aerial clash for the ₹50,000 championship trophy, broadcasted live on arena LED video walls.',
    badge: 'DAY 3 FINALE',
  },
  {
    phase: 'Phase 06',
    date: 'Nov 16, 2026',
    time: '16:00 – 18:00 IST',
    title: 'Podium Ceremony & GCDIS Aerial Light Show',
    location: 'Indoor Amphitheatre',
    description:
      'Trophy presentation by university dignitaries, prize distribution, and autonomous swarm drone formation show by GCDIS researchers.',
    badge: 'AWARDS NIGHT',
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
    teamA: 'Galgotias Aero Hawks',
    teamB: 'BITS Pilani Falcons',
    scheduledTime: 'Nov 15 · 14:00 IST',
    court: 'Arena Cage 1',
    status: 'Completed',
    scores: {
      teamA: [9, 12, 11],
      teamB: [5, 7, 8],
      winner: 'Galgotias Aero Hawks',
    },
  },
  {
    id: 'QF-2',
    round: 'Quarter-Final',
    teamA: 'DTU Sky Phoenix',
    teamB: 'IIT Delhi AeroVortex',
    scheduledTime: 'Nov 15 · 15:15 IST',
    court: 'Arena Cage 1',
    status: 'Completed',
    scores: {
      teamA: [8, 10, 7],
      teamB: [9, 8, 11],
      winner: 'IIT Delhi AeroVortex',
    },
  },
  {
    id: 'QF-3',
    round: 'Quarter-Final',
    teamA: 'IIIT Hyderabad Pulse',
    teamB: 'Thapar Velocity',
    scheduledTime: 'Nov 15 · 16:30 IST',
    court: 'Arena Cage 2',
    status: 'Completed',
    scores: {
      teamA: [11, 9, 12],
      teamB: [6, 8, 7],
      winner: 'IIIT Hyderabad Pulse',
    },
  },
  {
    id: 'QF-4',
    round: 'Quarter-Final',
    teamA: 'SRM Air Drifters',
    teamB: 'NSUT Strike Wing',
    scheduledTime: 'Nov 15 · 17:45 IST',
    court: 'Arena Cage 2',
    status: 'Completed',
    scores: {
      teamA: [10, 8, 9],
      teamB: [5, 9, 6],
      winner: 'SRM Air Drifters',
    },
  },
  {
    id: 'SF-1',
    round: 'Semi-Final',
    teamA: 'Galgotias Aero Hawks',
    teamB: 'IIT Delhi AeroVortex',
    scheduledTime: 'Nov 16 · 10:30 IST',
    court: 'Arena Cage 1',
    status: 'Completed',
    scores: {
      teamA: [12, 11, 14],
      teamB: [9, 10, 11],
      winner: 'Galgotias Aero Hawks',
    },
  },
  {
    id: 'SF-2',
    round: 'Semi-Final',
    teamA: 'IIIT Hyderabad Pulse',
    teamB: 'SRM Air Drifters',
    scheduledTime: 'Nov 16 · 12:00 IST',
    court: 'Arena Cage 1',
    status: 'Completed',
    scores: {
      teamA: [13, 12, 10],
      teamB: [8, 9, 7],
      winner: 'IIIT Hyderabad Pulse',
    },
  },
  {
    id: 'GF-1',
    round: 'Grand Finale',
    teamA: 'Galgotias Aero Hawks',
    teamB: 'IIIT Hyderabad Pulse',
    scheduledTime: 'Nov 16 · 14:30 IST',
    court: 'Arena Cage 1',
    status: 'Live',
    scores: {
      teamA: [14, 13],
      teamB: [11, 12],
    },
  },
];

// FIDA Official Class 20 vs Class 40 Technical Comparison
export interface FidaClassSpec {
  classId: 'Class 20' | 'Class 40';
  targetCategory: string;
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

export const FIDA_CLASS_SPECS: Record<'class20' | 'class40', FidaClassSpec> = {
  class20: {
    classId: 'Class 20',
    targetCategory: 'Junior / Varsity / Educational (No modifications allowed)',
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

// 7 Official Colors for Position & Team Identification (FIDA Class 40 Rule 2-5)
export const FIDA_7_COLORS = [
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

// FIDA Referee Whistle & Visual Signals (Rules 5-7, 6-4)
export const FIDA_REFEREE_SIGNALS = [
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

// FIDA 5th Revision Key Updates (Oct 1, 2025 / Jan 1, 2026)
export const FIDA_5TH_REVISION_UPDATES = [
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

// FIDA Official Violations Hierarchy (Rule 11)
export const FIDA_VIOLATIONS = [
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
    a: 'Class 20 features 20cm (±1cm) drone balls weighing under 110g in a compact 8m × 4m × 3m Skyfence with 30cm goals, and equipment modifications are strictly prohibited. Class 40 is the premier 40cm (±2cm) division weighing under 1100g in a 16m × 8m × 4.5m Skyfence with 60cm inner goals weighing 10-15kg each, featuring FIDA 7-color LED role positions and in-game Striker substitution.',
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
