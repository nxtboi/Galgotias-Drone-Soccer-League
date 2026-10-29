export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  category: 'management' | 'technical' | 'marketing' | 'social_media' | 'advisory';
  categoryLabel: string;
  phone: string;
  email?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  image: string;
  bio?: string;
}

export interface TeamCategory {
  id: 'management' | 'technical' | 'marketing' | 'social_media' | 'advisory';
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
}

export const TEAM_CATEGORIES: TeamCategory[] = [
  {
    id: 'management',
    label: 'Management & Secretariat',
    shortLabel: 'Management',
    badge: 'CORE LEADERSHIP',
    description: 'Tournament directors, operational coordinators, and collegiate secretariat steering GDSL 2026 execution.',
  },
  {
    id: 'technical',
    label: 'Technical & Avionics Wing',
    shortLabel: 'Technical',
    badge: 'AVIONICS & SCRUTINEERING',
    description: 'Sphere specification inspectors, electronic telemetry referees, arena safety marshals, and flight engineers.',
  },
  {
    id: 'marketing',
    label: 'Marketing & Sponsorships',
    shortLabel: 'Marketing',
    badge: 'PR & ALLIANCES',
    description: 'Corporate brand sponsors, industry liaisons, intercollegiate campus outreach, and press communications.',
  },
  {
    id: 'social_media',
    label: 'Social Media & Digital Media',
    shortLabel: 'Social Media',
    badge: 'BROADCAST & CONTENT',
    description: 'Live esports broadcast streamers, FPV drone cinematographers, digital content producers, and visual designers.',
  },
  {
    id: 'advisory',
    label: 'Patrons & Faculty Advisory',
    shortLabel: 'Advisory',
    badge: 'INSTITUTIONAL LEADERSHIP',
    description: 'Visionary leadership from Galgotias University and the Centre for Drone Intelligence & Simulation (GCDIS).',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  // ==========================================
  // 1. MANAGEMENT & SECRETARIAT
  // ==========================================
  {
    id: 'arjun-singhania',
    name: 'Arjun Singhania',
    role: 'Overall Festival Coordinator (GDSL 2026)',
    department: 'Robotics & Autonomous Systems, Final Year',
    category: 'management',
    categoryLabel: 'CONVENER',
    phone: '+91 99580 43210',
    email: 'coordinator@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    bio: 'Chief convenor steering overall tournament architecture, collegiate registration quotas, and nationwide squad outreach.',
  },
  {
    id: 'rhea-mehrotra',
    name: 'Rhea Mehrotra',
    role: 'Co-Convener & Head of Operations',
    department: 'Drone Avionics & Flight Control Lab',
    category: 'management',
    categoryLabel: 'CO-CONVENER',
    phone: '+91 98108 77654',
    email: 'operations@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Managing real-time arena match schedules, referee allocations, and cross-wing logistics coordination.',
  },
  {
    id: 'kabir-varma',
    name: 'Kabir Varma',
    role: 'Chief Secretariat Lead',
    department: 'School of Computing Sciences',
    category: 'management',
    categoryLabel: 'SECRETARIAT',
    phone: '+91 97115 88921',
    email: 'secretariat@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    bio: 'Supervising official team documentation, pilot security clearances, and score verification certificates.',
  },
  {
    id: 'aman-saxena',
    name: 'Aman Saxena',
    role: 'Arena Operations & Field Marshall',
    department: 'Industrial & Mechanical Engineering',
    category: 'management',
    categoryLabel: 'ARENA MARSHALL',
    phone: '+91 98711 23489',
    email: 'arena@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    bio: 'Directing the 16m × 8m ballistic cage rigging, LiPo rapid charging stations, and team pit allocations.',
  },

  // ==========================================
  // 2. TECHNICAL & AVIONICS WING
  // ==========================================
  {
    id: 'devansh-tripathi',
    name: 'Devansh Tripathi',
    role: 'Head of Technical Scrutineering',
    department: 'GCDIS Certified Aerospace Inspector',
    category: 'technical',
    categoryLabel: 'HEAD TECH',
    phone: '+91 98991 34567',
    email: 'scrutineering@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    bio: 'Leading Class 20 & Class 40 sphere dimension verification, motor spec validation, and fail-safe safety locks.',
  },
  {
    id: 'vijay-prasad',
    name: 'Vijay Prasad',
    role: 'Lead Electronic Referee & Telemetry Engineer',
    department: 'Sensors & Digital Systems Laboratory',
    category: 'technical',
    categoryLabel: 'TELEMETRY LEAD',
    phone: '+91 76260 40216',
    email: 'vk16122001@gmail.com',
    linkedin: 'https://www.linkedin.com/in/nxtboi',
    github: 'https://github.com/nxtboi',
    image: '/assets/aistudio/Vijay_139e0c2f.png',
    bio: 'In charge of optical goal hoop sensor grids, electronic scoring sync, and 10ms RF beacon tracking.',
  },
  {
    id: 'ayush-pandey',
    name: 'Ayush Pandey',
    role: 'Ballistic Sphere & Safety Marshall',
    department: 'Materials & Mechanical Dynamics Lab',
    category: 'technical',
    categoryLabel: 'SAFETY MARSHALL',
    phone: '+91 95696 96140',
    email: 'ayushpandey8726@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ayush-pandey-6a486b342',
    image: '/assets/aistudio/ayush_pandey_7129dc77.png',
    bio: 'Overseeing polycarbonate cage structural compliance, netting tensile tests, and pitch impact certifications.',
  },


  // ==========================================
  // 3. MARKETING & SPONSORSHIPS
  // ==========================================
  {
    id: 'vedanta-singh',
    name: 'Vedanta Singh',
    role: 'Head of Corporate Alliances & Sponsorships',
    department: 'Strategic Corporate Relations',
    category: 'marketing',
    categoryLabel: 'SPONSORSHIP HEAD',
    phone: '+91 76962 08871',
    email: 'Vedantasingh@hotmail.com',
    linkedin: 'https://www.linkedin.com/in/vedantasingh',
    github: 'https://github.com/Vedanta-Singh',
    image: '/assets/aistudio/WhatsApp_Image_2026-10-28_at_10.26.28_PM_7f45dca8.jpeg',
    bio: 'Liaising with drone hardware manufacturers, corporate brand alliances, and institutional festival sponsorships.',
  },
  {
    id: 'jay-biswas',
    name: 'Jay Biswas',
    role: 'Head of Public Relations & Media Relations',
    department: 'Mass Communication & Journalism',
    category: 'marketing',
    categoryLabel: 'MEDIA LEAD',
    phone: '+91 92440 45746',
    linkedin: 'https://www.linkedin.com/in/jay-biswas-68012439b',
    image: '/assets/aistudio/jay_5df35fad.png',
    bio: 'Facilitating national press correspondents, esports journalists, and live press conferences across Delhi-NCR.',
  },
  {
    id: 'meera-joshi',
    name: 'Meera Joshi',
    role: 'National Campus Ambassador Lead',
    department: 'Outreach & Intercollegiate Affairs',
    category: 'marketing',
    categoryLabel: 'AMBASSADOR LEAD',
    phone: '+91 98912 67834',
    email: 'ambassador@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80&fit=facearea&facepad=2',
    bio: 'Connecting with 80+ university robotics societies and aviation clubs across India for squad registrations.',
  },


  // ==========================================
  // 4. SOCIAL MEDIA & DIGITAL MEDIA
  // ==========================================
  {
    id: 'zoya-khan',
    name: 'Zoya Khan',
    role: 'Head of Social Media & Community',
    department: 'Digital Media & Communications',
    category: 'social_media',
    categoryLabel: 'SOCIAL LEAD',
    phone: '+91 98114 62091',
    email: 'social@gdsl2026.org',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Directing social media campaigns, viral reels, drone pilot spotlights, and tournament countdown engagement.',
  },
  {
    id: 'nikhil-kumar',
    name: 'Nikhil Kumar',
    role: 'Head of Esports Broadcast & Live Stream',
    department: 'BSc. Artificial Intelligence',
    category: 'social_media',
    categoryLabel: 'BROADCAST LEAD',
    phone: '+91 99580 01890',
    email: 'nikhilkumar9354005681@gmail.com',
    linkedin: 'https://www.linkedin.com/in/nikhil-kumar-824a32392/',
    image: '/assets/aistudio/WhatsApp_Image_2026-10-28_at_10.37.11_PM_d9524029.jpeg',
    bio: 'Architect of multi-camera drone feed switching, YouTube 4K 60fps esports live production, and HUD score overlays.',
  },


  // ==========================================
  // 5. PATRONS & FACULTY ADVISORY
  // ==========================================
  {
    id: 'meenakshi-awasthi',
    name: 'Dr. Meenakshi Awasthi',
    role: 'Faculty Advisor & Mentor',
    department: 'Galgotias University',
    category: 'advisory',
    categoryLabel: 'FACULTY ADVISOR',
    phone: '+91 99118 71195',
    email: 'awasthi.meenakshi@gmail.com',
    linkedin: 'https://linkedin.com/in/dr-meenakshi-awasthi-59a40537',
    image: '/assets/aistudio/meenakshi_ma_am_a53df79a.png',
    bio: 'Distinguished faculty mentor guiding student research, autonomous engineering innovations, and academic excellence.',
  },
  {
    id: 'puneet-saini',
    name: 'Dr. Puneet Saini',
    role: 'Chief Patron & CEO',
    department: 'Galgotias University',
    category: 'advisory',
    categoryLabel: 'PATRON',
    phone: '+91 98733 28878',
    email: 'puneetsaini2757@gmail.com',
    linkedin: 'https://linkedin.com/in/puneet-saini-ba7a72a9',
    image: '/assets/aistudio/puneet_sir_50b5577e.png',
    bio: 'Visionary behind establishing North India’s largest Drone Intelligence & Simulation facility at Galgotias.',
  },
  {
    id: 'paras-sharma',
    name: 'Paras Sharma',
    role: 'Faculty Advisor & Mentor',
    department: 'Galgotias University',
    category: 'advisory',
    categoryLabel: 'FACULTY ADVISOR',
    phone: '+91 63989 36899',
    linkedin: 'https://www.linkedin.com/in/paras-sharma-a571a521a/',
    image: '/assets/aistudio/paras_sir_706b87d5.png',
    bio: 'Faculty advisor and mentor guiding student flight teams, autonomous drone integration, and engineering excellence.',
  },
  {
    id: 'nitin-gaur',
    name: 'Dr. Nitin Gaur',
    role: 'Director, GCDIS & Faculty Advisor',
    department: 'Centre for Drone Intelligence & Simulation',
    category: 'advisory',
    categoryLabel: 'FACULTY ADVISOR',
    phone: '+91 98112 56780',
    email: 'director.gcdis@galgotiasuniversity.edu.in',
    linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    bio: 'Pioneering aerial robotics research and autonomous multirotor simulation programs at Galgotias.',
  },
  {
    id: 'ananya-sengupta',
    name: 'Prof. Ananya Sengupta',
    role: 'Dean, Aerospace & Robotics Engineering',
    department: 'School of Engineering, Galgotias University',
    category: 'advisory',
    categoryLabel: 'ADVISORY DEAN',
    phone: '+91 98734 11200',
    email: 'dean.aero@galgotiasuniversity.edu.in',
    linkedin: 'https://linkedin.com',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'Academic lead overseeing national intercollegiate engineering collaborations and aeronautical curriculum.',
  },
];
