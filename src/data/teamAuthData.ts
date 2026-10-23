export interface TeamMember {
  name: string;
  role: string;
  rollNo?: string;
  phone?: string;
}

export interface RegisteredTeamProfile {
  teamId: string;
  accessCode: string; // Password / PIN
  teamName: string;
  institution: string;
  city: string;
  state: string;
  division: 'Class 40 (400mm)' | 'Class 20 (200mm)';
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  strikerPilot: string;
  goalkeeper: string;
  defender1: string;
  defender2: string;
  pitMechanic: string;
  droneModel: string;
  controlProtocol: string;
  vtxBand: string;
  failsafeAgreed: boolean;
  registeredAt: string;
  allocatedPit: string;
  scrutineeringStatus: 'PENDING_ON_SITE' | 'PRE_APPROVED';
  paymentInfo: {
    receiptNo: string;
    amount: string;
    status: 'PENDING' | 'PAID' | 'VERIFIED';
    transactionId: string;
    paymentMode: string;
    paidAt: string;
    currency: string;
  };
  attendanceData?: {
    facultyName: string;
    designation: string;
    department: string;
    collegeName: string;
    travelDatesIncluded: boolean;
    students: TeamMember[];
  };
}

export function getDivisionFee(division: string): {
  numeric: number;
  formatted: string;
  code: 'D-20' | 'D-40';
} {
  const isD20 = division.includes('20');
  return isD20
    ? { numeric: 1400, formatted: '₹1,400', code: 'D-20' }
    : { numeric: 4000, formatted: '₹4,000', code: 'D-40' };
}

function normalizeTeamFee(team: RegisteredTeamProfile): RegisteredTeamProfile {
  const expectedFee = getDivisionFee(team.division).formatted;
  if (team.paymentInfo.amount === '₹2,500' || !team.paymentInfo.amount) {
    return {
      ...team,
      paymentInfo: {
        ...team.paymentInfo,
        amount: expectedFee,
      },
    };
  }
  return team;
}

export const INITIAL_REGISTERED_TEAMS: RegisteredTeamProfile[] = [
  {
    teamId: 'GDSL-26-T101',
    accessCode: 'hawks2026',
    teamName: 'Galgotias Aero Hawks',
    institution: 'Galgotias University',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    division: 'Class 40 (400mm)',
    captainName: 'Aarav Sharma',
    captainEmail: 'aarav.hawks@galgotias.edu',
    captainPhone: '+91 98112 34567',
    strikerPilot: 'Kabir Singhania',
    goalkeeper: 'Rohan Verma',
    defender1: 'Aditya Narayan',
    defender2: 'Vikas Mehra',
    pitMechanic: 'Isha Patel',
    droneModel: 'HawkSphere 400X Carbon FAI',
    controlProtocol: 'ELRS 2.4GHz (Packet Rate 500Hz)',
    vtxBand: '5.8GHz Raceband (CH 3 - 5732MHz)',
    failsafeAgreed: true,
    registeredAt: 'Oct 02, 2026',
    allocatedPit: 'Arena Cage 1 · Scrutineering Bay 01',
    scrutineeringStatus: 'PRE_APPROVED',
    paymentInfo: {
      receiptNo: 'GDSL-REC-2026-901',
      amount: '₹4,000',
      status: 'VERIFIED',
      transactionId: 'UPI-HDFC-938210948',
      paymentMode: 'UPI / Net Banking',
      paidAt: '02 Oct 2026 · 14:32 IST',
      currency: 'INR',
    },
    attendanceData: {
      facultyName: 'Dr. V. K. Singh',
      designation: 'Dean, School of Mechanical & Aerospace Engineering',
      department: 'Department of Aerospace Engineering',
      collegeName: 'Galgotias University, Greater Noida',
      travelDatesIncluded: true,
      students: [
        { name: 'Aarav Sharma', role: 'Captain & Telemetry Lead', rollNo: '23BTE094', phone: '+91 98112 34567' },
        { name: 'Kabir Singhania', role: 'Designated Striker Pilot', rollNo: '23BTE108', phone: '+91 98112 34568' },
        { name: 'Rohan Verma', role: 'Goalkeeper Pilot', rollNo: '23BTE112', phone: '+91 98112 34569' },
        { name: 'Aditya Narayan', role: 'Defender 1 (Libero)', rollNo: '23BTE115', phone: '+91 98112 34570' },
        { name: 'Vikas Mehra', role: 'Defender 2 (Sweeper)', rollNo: '23BTE121', phone: '+91 98112 34571' },
        { name: 'Isha Patel', role: 'Pit Engineer & Safety', rollNo: '23BTE130', phone: '+91 98112 34572' },
      ],
    },
  },
  {
    teamId: 'GDSL-26-T102',
    accessCode: 'vortex2026',
    teamName: 'IIT Delhi AeroVortex',
    institution: 'Indian Institute of Technology Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    division: 'Class 40 (400mm)',
    captainName: 'Ananya Sen',
    captainEmail: 'ananya.vortex@iitd.ac.in',
    captainPhone: '+91 98710 43210',
    strikerPilot: 'Kunal Roy',
    goalkeeper: 'Siddharth Bose',
    defender1: 'Tushar Gupta',
    defender2: 'Pooja Nair',
    pitMechanic: 'Rishi Kapoor',
    droneModel: 'VortexCage Pro V3 (Toray 3K)',
    controlProtocol: 'TBS Crossfire 868MHz',
    vtxBand: '5.8GHz Raceband (CH 6 - 5866MHz)',
    failsafeAgreed: true,
    registeredAt: 'Oct 04, 2026',
    allocatedPit: 'Arena Cage 1 · Scrutineering Bay 02',
    scrutineeringStatus: 'PRE_APPROVED',
    paymentInfo: {
      receiptNo: 'GDSL-REC-2026-902',
      amount: '₹4,000',
      status: 'VERIFIED',
      transactionId: 'SBI-NEFT-88492019',
      paymentMode: 'NEFT / Institutional Transfer',
      paidAt: '04 Oct 2026 · 11:15 IST',
      currency: 'INR',
    },
    attendanceData: {
      facultyName: 'Prof. Alok Ranjan',
      designation: 'Head, Robotics & Aeromodelling Society',
      department: 'Department of Mechanical Engineering',
      collegeName: 'Indian Institute of Technology Delhi (IIT Delhi)',
      travelDatesIncluded: true,
      students: [
        { name: 'Ananya Sen', role: 'Captain & Strategist', rollNo: '2023ME10450', phone: '+91 98710 43210' },
        { name: 'Kunal Roy', role: 'Striker Pilot', rollNo: '2023ME10488', phone: '+91 98710 43211' },
        { name: 'Siddharth Bose', role: 'Goalkeeper Pilot', rollNo: '2023EE10312', phone: '+91 98710 43212' },
        { name: 'Tushar Gupta', role: 'Defender (Libero)', rollNo: '2023CS10190', phone: '+91 98710 43213' },
        { name: 'Pooja Nair', role: 'Defender (Sweeper)', rollNo: '2023ME10499', phone: '+91 98710 43214' },
        { name: 'Rishi Kapoor', role: 'Hardware & Battery Lead', rollNo: '2023ME10512', phone: '+91 98710 43215' },
      ],
    },
  },
  {
    teamId: 'GDSL-26-T103',
    accessCode: 'phoenix2026',
    teamName: 'DTU Sky Phoenix',
    institution: 'Delhi Technological University',
    city: 'New Delhi',
    state: 'Delhi',
    division: 'Class 40 (400mm)',
    captainName: 'Vikramaditya Rao',
    captainEmail: 'vikram.phoenix@dtu.ac.in',
    captainPhone: '+91 99100 87654',
    strikerPilot: 'Aryan Mathur',
    goalkeeper: 'Nitin Yadav',
    defender1: 'Sahil Chhabra',
    defender2: 'Ayush Mittal',
    pitMechanic: 'Divya Khurana',
    droneModel: 'Phoenix Orb 4.2 Polycarbonate',
    controlProtocol: 'ELRS 2.4GHz',
    vtxBand: '5.8GHz Raceband (CH 1 - 5658MHz)',
    failsafeAgreed: true,
    registeredAt: 'Oct 05, 2026',
    allocatedPit: 'Arena Cage 2 · Scrutineering Bay 01',
    scrutineeringStatus: 'PRE_APPROVED',
    paymentInfo: {
      receiptNo: 'GDSL-REC-2026-903',
      amount: '₹4,000',
      status: 'VERIFIED',
      transactionId: 'UPI-ICICI-449102831',
      paymentMode: 'UPI',
      paidAt: '05 Oct 2026 · 16:40 IST',
      currency: 'INR',
    },
  },
  {
    teamId: 'GDSL-26-T104',
    accessCode: 'hyper2026',
    teamName: 'BITS Pilani HyperDrones',
    institution: 'BITS Pilani, Pilani Campus',
    city: 'Pilani',
    state: 'Rajasthan',
    division: 'Class 20 (200mm)',
    captainName: 'Tanvi Joshi',
    captainEmail: 'tanvi.hyper@pilani.bits-pilani.ac.in',
    captainPhone: '+91 97200 11223',
    strikerPilot: 'Rhea Deshmukh',
    goalkeeper: 'Kavita Menon',
    defender1: 'Kunal Varma',
    defender2: 'Dhruv Singhal',
    pitMechanic: 'Sameer Joshi',
    droneModel: 'NanoStrike 200 Junior FAI',
    controlProtocol: 'ELRS 2.4GHz',
    vtxBand: '5.8GHz Raceband (CH 7 - 5880MHz)',
    failsafeAgreed: true,
    registeredAt: 'Oct 06, 2026',
    allocatedPit: 'Arena Cage 3 · Scrutineering Bay 04',
    scrutineeringStatus: 'PRE_APPROVED',
    paymentInfo: {
      receiptNo: 'GDSL-REC-2026-904',
      amount: '₹1,400',
      status: 'VERIFIED',
      transactionId: 'UPI-PAYTM-671029384',
      paymentMode: 'UPI',
      paidAt: '06 Oct 2026 · 09:20 IST',
      currency: 'INR',
    },
  },
];

const STORAGE_KEY_TEAMS = 'gdsl_registered_teams_v1';
const STORAGE_KEY_SESSION = 'gdsl_current_team_session_v1';

export function getRegisteredTeams(): RegisteredTeamProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(INITIAL_REGISTERED_TEAMS));
      return INITIAL_REGISTERED_TEAMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = parsed.map(normalizeTeamFee);
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(normalized));
      return normalized;
    }
  } catch {
    // fallback
  }
  return INITIAL_REGISTERED_TEAMS;
}

export function saveRegisteredTeam(team: RegisteredTeamProfile): void {
  try {
    const current = getRegisteredTeams();
    const existingIndex = current.findIndex((t) => t.teamId === team.teamId);
    let updated: RegisteredTeamProfile[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = team;
    } else {
      updated = [team, ...current];
    }
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save team profile in local storage', err);
  }
}

export function authenticateTeam(
  identifier: string,
  passcode: string
): { success: boolean; team?: RegisteredTeamProfile; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passcode.trim().toLowerCase();

  if (!cleanId) {
    return { success: false, error: 'Please enter your Team ID or registered Captain Email.' };
  }

  const teams = getRegisteredTeams();

  const matched = teams.find((t) => {
    const matchesId = t.teamId.toLowerCase() === cleanId;
    const matchesEmail = t.captainEmail.toLowerCase() === cleanId;
    const matchesName = t.teamName.toLowerCase() === cleanId;
    return matchesId || matchesEmail || matchesName;
  });

  if (!matched) {
    return {
      success: false,
      error: `No registered squad found matching "${identifier}". Please verify your Team ID (e.g. GDSL-26-T101) or Captain Email.`,
    };
  }

  if (!cleanPass) {
    return {
      success: false,
      error: 'Please enter your squad password to sign in.',
    };
  }

  if (
    matched.accessCode &&
    matched.accessCode.toLowerCase() !== cleanPass &&
    matched.accessCode !== passcode.trim()
  ) {
    return {
      success: false,
      error: `Incorrect password for ${matched.teamName}. Please verify your password and try again.`,
    };
  }

  setCurrentSession(matched);
  return { success: true, team: matched };
}

export function getCurrentSession(): RegisteredTeamProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeTeamFee(parsed);
  } catch {
    return null;
  }
}

export function setCurrentSession(team: RegisteredTeamProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(team));
  } catch (err) {
    console.error('Failed to set current session', err);
  }
}

export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}
