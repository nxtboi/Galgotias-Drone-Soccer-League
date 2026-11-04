export interface DroneathonTrack {
  id: string;
  title: string;
  category: string;
  tagline: string;
  prize: string;
  description: string;
  requirements: string[];
  techStack: string[];
}

export interface PastWinner {
  year: string;
  team: string;
  institution: string;
  project: string;
  track: string;
  award: string;
  image: string;
  summary: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Flight Trials' | 'Droneathons' | 'Proving Grounds' | 'Workshops' | 'Defense Demos';
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  altitude?: string;
  droneModel?: string;
  tags: string[];
  albumId?: string;
  driveFileId?: string;
  driveViewUrl?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  year: string;
  category: 'National Record' | 'Patent' | 'Certification' | 'Award';
  badge: string;
  description: string;
  metrics: { label: string; value: string }[];
  verifiedBy: string;
}

export interface UpdateItem {
  id: string;
  title: string;
  category: 'Press Release' | 'Flight Test Bulletin' | 'Strategic MoU' | 'Policy & Regulatory';
  date: string;
  summary: string;
  fullContent: string;
  readTime: string;
  author: string;
  tag: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  category: 'Aerodynamics' | 'Swarm Systems' | 'Edge AI' | 'Avionics & Power';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  keyTakeaways: string[];
}

// -------------------------------------------------------------
// Droneathon Data
// -------------------------------------------------------------
export const DRONEATHON_TRACKS: DroneathonTrack[] = [
  {
    id: 'swarm-intel',
    title: 'GPS-Denied Autonomous Swarm Navigation',
    category: 'Swarm Robotics',
    tagline: 'Orchestrate 10+ autonomous drones through obstructed tunnel networks without satellite positioning.',
    prize: '$15,000 / ₹12.5 Lakhs',
    description: 'Teams must deploy multi-agent decentralized consensus algorithms to coordinate decentralized LiDAR and optical flow mapping across subterranean conduits and damaged buildings.',
    requirements: [
      'Sub-20 millisecond inter-agent communication over 802.11ah mesh',
      'Zero collision tolerance in 1.8m cross-section tunnels',
      'Unified 3D point cloud generation upon landing',
    ],
    techStack: ['ROS2 Humble', 'PX4 Autopilot', 'Fast-DDS', 'OpenVINS', 'YOLOv10 Edge'],
  },
  {
    id: 'disaster-sar',
    title: 'Precision Thermal Search & Rescue at 80 km/h',
    category: 'Rapid Response',
    tagline: 'Autonomous survivor localization in wildfire smoke and night forest canopies.',
    prize: '$12,500 / ₹10 Lakhs',
    description: 'Design dynamic trajectory replanning algorithms capable of penetrating dense foliage and thermal occlusion to pinpoint simulated distress beacons and parachute payloads.',
    requirements: [
      'BVLOS autonomous flight envelope up to 12 km range',
      'Real-time edge neural inference for human thermal signature classification',
      'Automated payload drop accuracy within 0.75m radius',
    ],
    techStack: ['NVIDIA Jetson Orin Nano', 'ArduPilot', 'FLIR Boson SDK', 'PyTorch Mobile'],
  },
  {
    id: 'agro-payload',
    title: 'Clean Energy Heavy-Lift Agro Logistics',
    category: 'Green Avionics',
    tagline: 'High-payload precision dispensing with regenerative braking airfoils.',
    prize: '$12,500 / ₹10 Lakhs',
    description: 'Construct novel ducted rotor or tilt-rotor airframes supporting 15kg+ variable liquid or seed dispersal while sustaining 45+ minute hover endurance.',
    requirements: [
      'Total operational payload capacity > 15 kg',
      'Autonomous RTK centimeter-accurate boundary tracing',
      'Dynamic center-of-gravity compensation during liquid discharge',
    ],
    techStack: ['SolidWorks / Ansys Fluent', 'Custom ESC Firmware', 'CAN Bus Telemetry', 'RTK-GNSS'],
  },
  {
    id: 'fpv-evasion',
    title: 'Neuromorphic High-Speed Obstacle Evasion',
    category: 'Extreme Flight',
    tagline: 'Supersonic agility through moving dynamic obstacle corridors at 100+ km/h.',
    prize: '$10,000 / ₹8 Lakhs',
    description: 'Leverage bio-inspired event cameras and neuromorphic spiking neural networks to avoid unpredictable airborne projectiles in sub-millisecond reaction windows.',
    requirements: [
      'Reaction latency < 3 milliseconds from sensor excitation to motor thrust',
      'Minimum continuous air speed of 90 km/h in obstacle course',
      'Full autonomous flight without pilot radio override',
    ],
    techStack: ['Prophesee Event Sensor', 'SNN Spike-Torch', 'STM32H7 Flight Controller', 'Custom Carbon Shrouds'],
  },
];

export const PAST_WINNERS: PastWinner[] = [
  {
    year: '2025',
    team: 'AeroSync Labs',
    institution: 'IIT Kanpur & Cranfield Aerospace',
    project: 'BioSwarm-X Subterranean Mapper',
    track: 'Autonomous Swarm Navigation',
    award: 'Grand Champion · National Trophy',
    image: '/drone-lab.jpg',
    summary: 'Successfully coordinated a 12-drone swarm through an abandoned mining shaft with 0% GPS connectivity, generating a millimeter-accurate 3D voxel map in 6 minutes.',
  },
  {
    year: '2025',
    team: 'FalconGuard Dynamics',
    institution: 'National Institute of Technology Surathkal',
    project: 'AeroMedic High-Velocity Drop',
    track: 'Disaster Search & Rescue',
    award: 'First Runner Up',
    image: '/drone-lab.jpg',
    summary: 'Deployed a hybrid fixed-wing quadcopter capable of autonomous 110 km/h cruising and vertical spot landing to deliver defibrillators in simulated flash floods.',
  },
  {
    year: '2024',
    team: 'VortexBio Systems',
    institution: 'BITS Pilani & MIT AeroAstro',
    project: 'VenturiClean Heavy Lifter',
    track: 'Clean Energy Logistics',
    award: 'Grand Champion 2024',
    image: '/drone-lab.jpg',
    summary: 'Pioneered an ultra-quiet carbon ducted quadcopter achieving 52 minutes of flight with a 12kg simulated medical payload using fuel-cell hybridization.',
  },
];

// -------------------------------------------------------------
// Public Activity Gallery Data
// -------------------------------------------------------------
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'High-Altitude Himalayan Flight Trials at 5,400m',
    category: 'Flight Trials',
    date: 'February 18, 2026',
    location: 'Leh-Ladakh Proving Range, India',
    imageUrl: '/storm-sky.jpg',
    description: 'Stress-testing the GCDIS AXI-Series carbon ducted airfoils under sub-zero temperatures (-24°C) and thin atmospheric densities.',
    altitude: '5,420 m MSL',
    droneModel: 'AXI-724 Arctic Variant',
    tags: ['High-Altitude', 'Cold Weather', 'BVLOS', 'Sub-Zero'],
    albumId: 'album-himalayan-trials',
  },
  {
    id: 'gal-2',
    title: 'National Droneathon 2025 Grand Finale Arena',
    category: 'Droneathons',
    date: 'November 12, 2025',
    location: 'GCDIS Indoor Aerodome, Galgotias University Campus',
    imageUrl: '/drone-lab.jpg',
    description: 'Over 64 shortlisted teams demonstrating real-time obstacle avoidance and swarm coordination across the 40,000 sq.ft netted testing cage.',
    droneModel: 'Swarm Mesh Multi-rotor 4X',
    tags: ['Hackathon', 'Competition', 'Live Swarm', 'Youth Innovators'],
    albumId: 'album-droneathon-2025',
  },
  {
    id: 'gal-3',
    title: 'Subterranean Tunnel LiDAR Mapping Expedition',
    category: 'Proving Grounds',
    date: 'January 24, 2026',
    location: 'Zojila Underground Test Facility',
    imageUrl: '/bg.jpg',
    description: 'Autonomous exploration of a 3.2-kilometer unlit tunnel using dual multi-beam LiDAR sensors and real-time edge SLAM algorithms.',
    droneModel: 'AXI-Stealth Sub-T',
    tags: ['GPS-Denied', 'LiDAR SLAM', 'Cave Exploration', 'Autonomous'],
    albumId: 'album-subterranean-lidar',
  },
  {
    id: 'gal-4',
    title: 'Youth Drone Academy & STEM Flight Workshop',
    category: 'Workshops',
    date: 'January 08, 2026',
    location: 'GCDIS Innovation Pavilion',
    imageUrl: '/drone-lab.jpg',
    description: 'Over 180 undergraduate aerospace engineering students receiving hands-on calibration training on PX4 flight controllers and ducted propulsion.',
    tags: ['STEM Education', 'Flight Controller', 'Avionics', 'Workshops'],
    albumId: 'album-students-workshop',
  },
  {
    id: 'gal-5',
    title: 'Coastal Maritime Patrol & Search Rescue Demo',
    category: 'Defense Demos',
    date: 'December 04, 2025',
    location: 'Arabian Sea Offshore Testbed',
    imageUrl: '/storm-sky.jpg',
    description: 'Demonstration of automated marine target acquisition and life-raft air-drop capabilities in 45-knot maritime gale force winds.',
    altitude: '280 m MSL',
    droneModel: 'AXI-Cine Pro Maritime',
    tags: ['Maritime', 'Search & Rescue', 'Wind Resistance', 'Defense'],
    albumId: 'album-maritime-defense',
  },
  {
    id: 'gal-6',
    title: 'Anechoic Acoustic Wind Tunnel Certification',
    category: 'Proving Grounds',
    date: 'October 19, 2025',
    location: 'GCDIS Aero Acoustics Lab',
    imageUrl: '/drone-lab.jpg',
    description: 'Acoustic array mapping demonstrating noise reduction down to 54 dB(A) for ducted venturi airfoils under 18,000 RPM full throttle.',
    tags: ['Acoustics', 'Wind Tunnel', 'Quiet Flight', 'Certification'],
    albumId: 'album-subterranean-lidar',
  },
];

// -------------------------------------------------------------
// Achievements Data
// -------------------------------------------------------------
export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'World Record: Highest Altitude Multi-Rotor Autonomous Hover',
    year: '2026',
    category: 'National Record',
    badge: 'GUINNESS & INDIA BOOK OF RECORDS',
    description: 'Successfully sustained 32 minutes of autonomous station-keeping hover at 5,420 meters (17,782 ft) above sea level in sub-zero thin atmospheric density.',
    metrics: [
      { label: 'Altitude', value: '5,420 m MSL' },
      { label: 'Temperature', value: '-24°C' },
      { label: 'Hover Drift', value: '< 4.2 cm' },
    ],
    verifiedBy: 'DGCA & Defense Aeronautical QA Board',
  },
  {
    id: 'ach-2',
    title: 'Patent Granted: Venturi Ducted Acoustic Shroud Geometry',
    year: '2025',
    category: 'Patent',
    badge: 'INDIAN PATENT #IN-482910',
    description: 'Novel aerodynamic duct architecture featuring variable-pitch stator vanes that reduce blade tip vortex noise by 18.4% while providing 12% extra static thrust.',
    metrics: [
      { label: 'Noise Reduction', value: '-14 dB' },
      { label: 'Thrust Gain', value: '+12%' },
      { label: 'Vortex Shear', value: '-42%' },
    ],
    verifiedBy: 'Controller General of Patents, Designs & Trademarks',
  },
  {
    id: 'ach-3',
    title: 'DGCA Type Certification for Autonomous BVLOS Systems',
    year: '2025',
    category: 'Certification',
    badge: 'DGCA TYPE CERT #TC-2025-081',
    description: 'Full regulatory certification permitting Beyond Visual Line of Sight autonomous commercial logistics and inspection operations across designated green corridors.',
    metrics: [
      { label: 'Test Flight Hours', value: '18,500+ hrs' },
      { label: 'Fail-Safe Score', value: '99.998%' },
      { label: 'Max BVLOS Radius', value: '45 km' },
    ],
    verifiedBy: 'Directorate General of Civil Aviation',
  },
  {
    id: 'ach-4',
    title: 'National Swarm Defense Technology Innovation Trophy',
    year: '2025',
    category: 'Award',
    badge: 'MINISTRY OF DEFENCE GOLD MEDAL',
    description: 'Awarded for pioneering decentralized peer-to-peer RF mesh communication enabling 100+ micro drones to navigate without central ground station dependency.',
    metrics: [
      { label: 'Swarm Size', value: '120 Units' },
      { label: 'Mesh Latency', value: '6.4 ms' },
      { label: 'Interference Jamming', value: 'Immune (AES-256)' },
    ],
    verifiedBy: 'DefTech National Council',
  },
  {
    id: 'ach-5',
    title: 'ISO 21384 & AS9100D Aerospace Systems Certification',
    year: '2024',
    category: 'Certification',
    badge: 'INTERNATIONAL AEROSPACE STANDARD',
    description: 'Comprehensive global certification for Unmanned Aircraft System flight safety, manufacturing quality assurance, and software verification.',
    metrics: [
      { label: 'Standard', value: 'AS9100 Rev D' },
      { label: 'Audit Score', value: '100% Zero Non-Conformity' },
    ],
    verifiedBy: 'Bureau Veritas Aerospace',
  },
];

// -------------------------------------------------------------
// Latest Updates Data
// -------------------------------------------------------------
export const LATEST_UPDATES: UpdateItem[] = [
  {
    id: 'up-1',
    title: 'GCDIS Inks Trilateral Aerospace R&D Accord for Hybrid Hydrogen Drones',
    category: 'Strategic MoU',
    date: 'March 14, 2026',
    readTime: '3 min read',
    author: 'Office of the Director General',
    tag: 'MoU & Partnerships',
    summary: 'A landmark partnership between GCDIS, National Aerospace Laboratories, and clean energy partners to build 4-hour endurance hydrogen fuel-cell surveillance drones.',
    fullContent: `GCDIS today finalized a historic trilateral research and development partnership to pioneer ultra-long-endurance clean hydrogen aerial propulsion. 

The agreement encompasses:
1. Joint development of 1kW proton-exchange membrane fuel cell power units tailored specifically to ducted UAV airframes.
2. Construction of a dedicated Cryogenic Hydrogen Flight Test Facility at the GCDIS Proving Grounds.
3. Rapid prototype evaluation with a target continuous flight endurance exceeding 240 minutes with 6kg payload.

"This milestone advances our vision of zero-emission, multi-hour autonomous flight for border patrol and disaster response," stated Dr. Vikramaditya Sen, Director General of GCDIS.`,
  },
  {
    id: 'up-2',
    title: 'Registration Portal Opens for National Droneathon 2026',
    category: 'Press Release',
    date: 'March 02, 2026',
    readTime: '4 min read',
    author: 'Droneathon Organizing Secretariat',
    tag: 'Droneathon 2026',
    summary: 'Innovators, universities, and aerospace startups from across the globe can now register for India’s flagship $50,000 autonomous drone hackathon.',
    fullContent: `The Galgotias Centre for Drone Intelligence & Simulation (GCDIS) has officially unlocked applications for National Droneathon 2026.

With challenges focusing on GPS-denied cave navigation, neuromorphic high-speed obstacle evasion, and clean energy logistics, the competition provides teams with state-of-the-art testing grounds, compute credits, and incubation seed grants.

Over 300 engineering universities and 90 drone startups have pre-registered. The 48-hour live finale will take place inside the GCDIS Indoor Aerodome in late October 2026.`,
  },
  {
    id: 'up-3',
    title: 'Flight Test Bulletin: Successful High-Altitude Arctic Testing of AXI-724',
    category: 'Flight Test Bulletin',
    date: 'February 20, 2026',
    readTime: '5 min read',
    author: 'Flight Test Directorate',
    tag: 'Flight Testing',
    summary: 'The AXI-724 ducted quadcopter achieved seamless station-keeping hover at 5,420m elevation in -24°C sub-zero conditions without blade icing.',
    fullContent: `GCDIS Flight Test Team has concluded Phase-IV high-altitude atmospheric trials in the western Himalayas.

Highlights:
- Battery chemistry heating jacket maintained cell temperature at +21°C despite -24°C external ambient freeze.
- Ducted carbon cowling prevented freezing fog and ice accumulation on propeller leading edges.
- Real-time RTK positioning maintained spatial error below 4.2cm in 48 km/h erratic mountain updrafts.`,
  },
  {
    id: 'up-4',
    title: 'GCDIS Submits Policy Recommendations for Beyond Visual Line of Sight (BVLOS)',
    category: 'Policy & Regulatory',
    date: 'January 16, 2026',
    readTime: '4 min read',
    author: 'Airspace Policy Taskforce',
    tag: 'Regulation',
    summary: 'Comprehensive 85-page whitepaper submitted to civil aviation regulators recommending standardized Remote ID protocols and low-altitude dynamic geofencing.',
    fullContent: `As unmanned traffic management (UTM) evolves, GCDIS has published its regulatory framework for high-density autonomous corridor management.

Key recommendations include mandatory dual-band ADS-B Out squawking for drones exceeding 4kg MTOW, automated cellular fail-safes, and standardized collision-risk matrices for populated zones.`,
  },
];

// -------------------------------------------------------------
// Blogs Data
// -------------------------------------------------------------
export const BLOG_POSTS: BlogItem[] = [
  {
    id: 'blog-1',
    title: 'Acoustic Attenuation in Ducted Micro-Airfoils: Physics of Venturi Shrouds',
    slug: 'acoustic-attenuation-ducted-micro-airfoils',
    category: 'Aerodynamics',
    author: {
      name: 'Dr. Aris Thorne',
      role: 'Principal Aerodynamicist, GCDIS Aero Lab',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
    date: 'March 10, 2026',
    readTime: '8 min read',
    excerpt: 'How ducted venturi cowlings eliminate tip vortex turbulence, resulting in whisper-quiet 54 dB flight and significant thrust multiplication.',
    content: [
      'In conventional open-propeller multi-rotors, the greatest source of acoustic discomfort stems from the vortex shedding at the blade tips. When high-pressure air beneath the spinning blade rolls violently over the tip into the low-pressure zone above, it produces characteristic high-frequency whistling and turbulent noise.',
      'By enclosing the rotor within an aerodynamically contoured ducted shroud, tip vortex formation is virtually eliminated. The clearance between blade tip and shroud wall is held to less than 0.8mm, creating an effective aerodynamic seal.',
      'Furthermore, the venturi-shaped duct accelerates incoming airflow, generating low static pressure over the duct lip that produces up to 18% additional axial thrust for identical electrical power input.',
      'Our acoustic wind tunnel experiments confirm an overall noise reduction of 14 dB(A), making the AXI series ideal for stealth reconnaissance, wildlife monitoring, and indoor industrial surveys.',
    ],
    keyTakeaways: [
      'Blade tip vortex suppression drops acoustic signature to 54 dB(A) at 10 meters.',
      'Venturi lip suction yields up to 18% additional static thrust.',
      'Tight 0.8mm tip clearance requires carbon-fiber dimensional stability under high G-loads.',
    ],
  },
  {
    id: 'blog-2',
    title: 'Decentralized Swarm Consensus in GPS-Denied Subterranean Mines',
    slug: 'decentralized-swarm-consensus-gps-denied',
    category: 'Swarm Systems',
    author: {
      name: 'Priya Narayanan',
      role: 'Head of Swarm Intelligence Systems',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    },
    date: 'February 26, 2026',
    readTime: '11 min read',
    excerpt: 'Deploying sub-GHz mesh radio networks and distributed SLAM to allow 20+ drones to map deep mines with zero ground station tethering.',
    content: [
      'Subterranean environments present the ultimate challenge for autonomous drones: zero GNSS satellite reception, pervasive RF multipath reflection, dense dust clouds, and complex 3D topology.',
      'Rather than relying on a single high-power drone, GCDIS deploys a heterogeneous swarm. Lead scout drones carry lightweight 360-degree LiDAR, while relay drones position themselves at tunnel junctions to sustain a peer-to-peer 802.11ah Sub-GHz mesh backhaul.',
      'Each drone runs an onboard distributed pose graph solver. When two drones come within radio proximity, they exchange loop-closure candidates and merge their local point clouds with sub-millisecond latency.',
      'In our latest field trial in an unmapped zinc mine, a swarm of 8 drones mapped 2.4 kilometers of shafts in under 7 minutes, identifying structural fractures and toxic gas pockets autonomously.',
    ],
    keyTakeaways: [
      'Peer-to-peer Sub-GHz mesh provides reliable telemetry through 30m of solid granite.',
      'Distributed loop closure prevents drift in extended subterranean corridors.',
      'Dynamic relay positioning guarantees high-bandwidth video feed back to mission control.',
    ],
  },
  {
    id: 'blog-3',
    title: 'Neuromorphic Event Cameras: Obstacle Avoidance at 120 km/h',
    slug: 'neuromorphic-event-cameras-obstacle-avoidance',
    category: 'Edge AI',
    author: {
      name: 'Capt. Siddharth Roy',
      role: 'Chief Avionics Test Pilot',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
    date: 'February 05, 2026',
    readTime: '7 min read',
    excerpt: 'Traditional 60 FPS cameras are too sluggish for high-speed obstacle evasion. Event sensors react in microseconds.',
    content: [
      'Standard digital cameras capture fixed frames at 30 to 120 times per second. At 120 km/h (33.3 m/s), a drone travels nearly 60 centimeters between frames—an eternity when maneuvering through branches or wires.',
      'Event-based neuromorphic sensors operate fundamentally differently. Each individual pixel responds asynchronously to changes in logarithmic brightness, outputting a continuous stream of timestamped microsecond spikes.',
      'By pairing event sensors with custom spiking neural networks (SNNs) running on ultra-low-power microcontrollers, we achieve latency below 2.8 milliseconds from physical light change to motor PWM correction.',
      'This technology forms the basis for the high-speed obstacle evasion track in our upcoming National Droneathon 2026.',
    ],
    keyTakeaways: [
      'Event pixels stream microsecond-precision temporal data with zero motion blur.',
      'Reduces latency by over 85% compared to standard CMOS image pipelines.',
      'Consumes less than 450mW of compute power, preserving flight battery longevity.',
    ],
  },
];

// -------------------------------------------------------------
// Flagship Event Data: GCDIS AERO-CON & DRONEATHON 2026
// -------------------------------------------------------------
export interface EventSpeaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatar: string;
  keynoteTitle: string;
  timeSlot: string;
  day: 'Day 1' | 'Day 2' | 'Day 3';
  bio: string;
  badges: string[];
}

export interface EventScheduleSession {
  id: string;
  day: 1 | 2 | 3;
  dateStr: string;
  time: string;
  title: string;
  track: 'Keynote' | 'Hackathon Arena' | 'Hands-on Workshop' | 'Flight Airshow' | 'Jury Pitch';
  location: string;
  speakerOrLead: string;
  description: string;
  isHighlight?: boolean;
}

export interface EventPassTier {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  targetAudience: string;
  badgeType: 'HACKER' | 'DELEGATE' | 'PROFESSIONAL' | 'VIP';
  perks: string[];
  isPopular?: boolean;
}

export const EVENT_SPEAKERS: EventSpeaker[] = [
  {
    id: 'spk-1',
    name: 'Air Marshal V. K. Saxena (Retd.)',
    role: 'Former Director General, Aeronautical Inspection',
    organization: 'Indian Air Force & Civil Aviation Advisory',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    keynoteTitle: 'Autonomous Airspace Integration & Resilient Unmanned Defense Architecture',
    timeSlot: 'Day 1 · 10:30 AM - 11:30 AM',
    day: 'Day 1',
    bio: 'Pioneered national drone corridors and BVLOS framework guidelines across Indian airspace. Recipient of Ati Vishisht Seva Medal for aeronautical advancements.',
    badges: ['Keynote', 'Defense Aviation', 'Airspace Policy'],
  },
  {
    id: 'spk-2',
    name: 'Dr. Sunita Ramanathan',
    role: 'Distinguished Scientist & Aerial Autonomy Lead',
    organization: 'DRDO Aeronautical Development Establishment',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    keynoteTitle: 'GPS-Denied Subterranean Swarm Navigation & Collaborative SLAM',
    timeSlot: 'Day 1 · 02:00 PM - 03:00 PM',
    day: 'Day 1',
    bio: 'Author of 40+ high-impact IEEE papers on decentralized robotic swarms and real-time point-cloud registration in GPS-deprived environments.',
    badges: ['Swarm Robotics', 'LiDAR SLAM', 'Defense R&D'],
  },
  {
    id: 'spk-3',
    name: 'Prof. Devendra Verma',
    role: 'Director, GCDIS & Simulation Labs',
    organization: 'Galgotias University',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    keynoteTitle: 'The Future of High-Fidelity Drone Simulation & Hardware-in-the-Loop Proving Grounds',
    timeSlot: 'Day 1 · 09:30 AM - 10:15 AM (Inaugural)',
    day: 'Day 1',
    bio: 'Chief Architect behind the 40,000 sq.ft netted Aerodome and high-speed wind simulation wind-tunnels at Galgotias University.',
    badges: ['Host & Convener', 'Aerodynamics', 'Simulation'],
  },
  {
    id: 'spk-4',
    name: 'Vikramaditya Roy',
    role: 'Founder & CEO',
    organization: 'AeroSwarm Defence Technologies',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
    keynoteTitle: 'Scaling Edge AI on Unmanned Aerial Systems: From Jetson Orin to Millisecond Actuation',
    timeSlot: 'Day 2 · 11:00 AM - 12:00 PM',
    day: 'Day 2',
    bio: 'Built India’s leading tactical swarm drone manufacturer with over 500+ systems deployed across border logistics and emergency disaster corridors.',
    badges: ['Industry Pioneer', 'Edge AI', 'Commercial Drones'],
  },
  {
    id: 'spk-5',
    name: 'Dr. Elena Rostova',
    role: 'Lead Flight Simulation Architect',
    organization: 'AirSim Core Robotics Initiative',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
    keynoteTitle: 'Photorealistic Synthetic Sensors & Sim-to-Real Drone Generalization',
    timeSlot: 'Day 2 · 03:30 PM - 04:30 PM',
    day: 'Day 2',
    bio: 'Pioneering synthetic environment physics for autonomous multi-rotor flight controllers, bridging the reality gap for deep reinforcement learning.',
    badges: ['Sim-to-Real', 'Deep RL', 'Unreal Engine 5'],
  },
  {
    id: 'spk-6',
    name: 'Capt. Aarav Sharma',
    role: 'Chief FPV Test Pilot & Operations Commander',
    organization: 'GCDIS Proving Grounds',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
    keynoteTitle: 'High-G Flight Dynamics, Propeller Shroud Aerodynamics & Extreme FPV Control',
    timeSlot: 'Day 3 · 10:00 AM - 11:00 AM',
    day: 'Day 3',
    bio: 'Logged over 18,500 flight hours across fixed-wing, cinewhoops, and high-velocity experimental multi-rotors.',
    badges: ['Test Pilot', 'High-G Aerobatics', 'Flight Safety'],
  },
];

export const EVENT_SCHEDULE: EventScheduleSession[] = [
  // Day 1
  {
    id: 'sch-101',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '08:30 AM - 09:30 AM',
    title: 'Delegate Registration & Security Air-Inspection',
    track: 'Keynote',
    location: 'GCDIS Grand Hangar Lobby',
    speakerOrLead: 'Organizing Directorate',
    description: 'Hardware safety inspections for hackathon teams, LiPo fire-safe bag checks, frequency badge assignments, and welcome kit distribution.',
  },
  {
    id: 'sch-102',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '09:30 AM - 10:15 AM',
    title: 'Inaugural Opening Ceremony & Flagship Address',
    track: 'Keynote',
    location: 'Main Aerospace Auditorium',
    speakerOrLead: 'Prof. Devendra Verma & Dignitaries',
    description: 'Official inauguration of GCDIS AERO-CON 2026 and opening remarks by Ministry of Civil Aviation representatives and Galgotias leadership.',
    isHighlight: true,
  },
  {
    id: 'sch-103',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '10:30 AM - 11:45 AM',
    title: 'Keynote: Autonomous Airspace Integration & Resilient Defense',
    track: 'Keynote',
    location: 'Main Aerospace Auditorium',
    speakerOrLead: 'Air Marshal V. K. Saxena (Retd.)',
    description: 'Strategic vision for sovereign unmanned aerial vehicle architectures, UTM airspace protocols, and next-gen defense avionics.',
    isHighlight: true,
  },
  {
    id: 'sch-104',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '12:00 PM - 01:15 PM',
    title: 'Workshop: Hardware-in-the-Loop Simulation with PX4 & ROS2',
    track: 'Hands-on Workshop',
    location: 'Simulation Cluster Lab (Room 304)',
    speakerOrLead: 'GCDIS Avionics Research Fellows',
    description: 'Hands-on tutorial for hackathon teams on deploying SITL/HITL environments, connecting MAVLink telemetry, and ROS2 micro-XRCE bridges.',
  },
  {
    id: 'sch-105',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '02:00 PM - 03:15 PM',
    title: 'Keynote: GPS-Denied Subterranean Swarm Navigation',
    track: 'Keynote',
    location: 'Main Aerospace Auditorium',
    speakerOrLead: 'Dr. Sunita Ramanathan (DRDO)',
    description: 'Deep dive into collaborative SLAM, ultra-wideband anchors, and optical flow estimation without external positioning aids.',
  },
  {
    id: 'sch-106',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '04:00 PM - 05:30 PM',
    title: 'Live Twilight Swarm Aerobatics & Flight Demonstration',
    track: 'Flight Airshow',
    location: '40,000 sq.ft Netted Aerodome Arena',
    speakerOrLead: 'GCDIS Display Pilots & Capt. Aarav Sharma',
    description: 'Breath-taking live flight demo featuring synchronized 30-drone illuminated swarm choreographies and high-speed FPV gap penetrations.',
    isHighlight: true,
  },
  {
    id: 'sch-107',
    day: 1,
    dateStr: 'Friday, Oct 24, 2026',
    time: '06:00 PM',
    title: '48-Hour National Droneathon HACKATHON CLOCK KICKOFF!',
    track: 'Hackathon Arena',
    location: 'GCDIS 24/7 Hacker Complex',
    speakerOrLead: 'Grand Jury & Problem Statement Authors',
    description: 'Problem statements unlocked, arena slots booked, hardware development kits dispensed, and continuous 48-hour development sprint begins!',
    isHighlight: true,
  },

  // Day 2
  {
    id: 'sch-201',
    day: 2,
    dateStr: 'Saturday, Oct 25, 2026',
    time: '09:00 AM - 10:30 AM',
    title: 'Hackathon Milestone 1: Simulation Voxel Verification',
    track: 'Hackathon Arena',
    location: 'GCDIS 24/7 Hacker Complex',
    speakerOrLead: 'Technical Review Jury',
    description: 'All 64 teams must validate algorithm stability inside the digital twin simulation container before physical flight cage clearance.',
  },
  {
    id: 'sch-202',
    day: 2,
    dateStr: 'Saturday, Oct 25, 2026',
    time: '11:00 AM - 12:15 PM',
    title: 'Industry Panel: High-Volume Drone Manufacturing in India',
    track: 'Keynote',
    location: 'Main Aerospace Auditorium',
    speakerOrLead: 'Vikramaditya Roy & Drone Industry CEOs',
    description: 'Evaluating supply chains for composite carbon airframes, brushless motors, and indigenous flight controllers under Make in India.',
  },
  {
    id: 'sch-203',
    day: 2,
    dateStr: 'Saturday, Oct 25, 2026',
    time: '01:30 PM - 06:00 PM',
    title: 'Droneathon Round 1 Arena Trials: Subterranean Maze Navigation',
    track: 'Hackathon Arena',
    location: 'Netted Aerodome & Subterranean Conduits',
    speakerOrLead: 'Live Track Judges',
    description: 'Live physical drone navigation through smoke-filled obstacle tunnels with active obstacle spawns and zero pilot override.',
    isHighlight: true,
  },
  {
    id: 'sch-204',
    day: 2,
    dateStr: 'Saturday, Oct 25, 2026',
    time: '03:30 PM - 04:30 PM',
    title: 'Masterclass: Sim-to-Real Transfer & Neural Radiance Fields',
    track: 'Hands-on Workshop',
    location: 'Simulation Cluster Lab (Room 304)',
    speakerOrLead: 'Dr. Elena Rostova',
    description: 'Deploying NeRF-based synthetic cameras for training robust drone vision classifiers with minimal real-world crash penalties.',
  },
  {
    id: 'sch-205',
    day: 2,
    dateStr: 'Saturday, Oct 25, 2026',
    time: '08:00 PM - Midnight',
    title: 'Overnight Code Sprint, Telemetry Tuning & Mentor Rounds',
    track: 'Hackathon Arena',
    location: 'GCDIS 24/7 Hacker Complex',
    speakerOrLead: 'Lead Mentors & DRDO Engineers',
    description: 'Midnight debugging sessions, telemetry calibrations, pizza fueling, and late-night bench testing for Sunday finals.',
  },

  // Day 3
  {
    id: 'sch-301',
    day: 3,
    dateStr: 'Sunday, Oct 26, 2026',
    time: '08:00 AM',
    title: 'Code Freeze & Autonomous Flight Firmware Lock',
    track: 'Hackathon Arena',
    location: 'GCDIS 24/7 Hacker Complex',
    speakerOrLead: 'Chief Technical Scrutineer',
    description: '48-hour development window officially closes. Final firmware binaries signed and cryptographic hashes submitted to the jury.',
    isHighlight: true,
  },
  {
    id: 'sch-302',
    day: 3,
    dateStr: 'Sunday, Oct 26, 2026',
    time: '09:30 AM - 01:00 PM',
    title: 'THE GRAND FINALS: Live Flight Arena Showdown',
    track: 'Hackathon Arena',
    location: '40,000 sq.ft Netted Aerodome Arena',
    speakerOrLead: 'Top 12 Finalist Teams & Grand Jury',
    description: 'Finalists battle head-to-head in speed, obstacle precision, emergency payload drops, and autonomous formation recovery.',
    isHighlight: true,
  },
  {
    id: 'sch-303',
    day: 3,
    dateStr: 'Sunday, Oct 26, 2026',
    time: '02:00 PM - 03:30 PM',
    title: 'Defense & Venture Incubation Pitch Battles',
    track: 'Jury Pitch',
    location: 'Aerospace Auditorium',
    speakerOrLead: 'Top 10 Teams & Venture Capital Partners',
    description: 'Top teams pitch to defense modernization officers, angel syndicates, and aerospace accelerator leads for up to ₹25 Lakhs seed grants.',
  },
  {
    id: 'sch-304',
    day: 3,
    dateStr: 'Sunday, Oct 26, 2026',
    time: '04:00 PM - 05:30 PM',
    title: 'Grand Valedictory Ceremony & ₹15 Lakhs Prize Distribution',
    track: 'Keynote',
    location: 'Main Aerospace Auditorium',
    speakerOrLead: 'Chief Guests, Air Marshals & University Leadership',
    description: 'Crowning the Grand Champions of Droneathon 2026, track trophy presentations, and announcement of permanent incubation fellowships.',
    isHighlight: true,
  },
];

export const EVENT_PASS_TIERS: EventPassTier[] = [
  {
    id: 'pass-hacker',
    name: 'Droneathon Competitor Pass',
    price: 'FREE',
    targetAudience: 'For Shortlisted 2-4 Member Student/Engineer Teams',
    badgeType: 'HACKER',
    perks: [
      'Full 48-Hour Aerodome flight cage testing access',
      'Complimentary Hardware Dev Kit (Sensors, Pixhawk & carbon frame)',
      'High-speed low-latency mesh Wi-Fi & 24/7 Hacker Bunk stay',
      'All meals, late-night refreshments & event swag kit',
      'Eligible for ₹15 Lakhs Grand Prize Pool & Incubation',
    ],
    isPopular: true,
  },
  {
    id: 'pass-student',
    name: 'Student Delegate Pass',
    price: '₹499',
    originalPrice: '₹999',
    targetAudience: 'Students & University Researchers',
    badgeType: 'DELEGATE',
    perks: [
      'Full 3-Day access to all Keynote sessions & Technical workshops',
      'Spectator viewing gallery for the 40,000 sq.ft live flight cage',
      'Hands-on participation in Simulation & ROS2 tutorials',
      'Official Certificate of Delegate Attendance from GCDIS',
      'Delegate kit, summit lanyard, and event lunch vouchers',
    ],
  },
  {
    id: 'pass-pro',
    name: 'Industry & Professional Pass',
    price: '₹2,499',
    originalPrice: '₹4,500',
    targetAudience: 'Drone Startups, Engineers & Corporate Delegates',
    badgeType: 'PROFESSIONAL',
    perks: [
      'Access to all Summit Keynotes, Masterclasses & Flight Arena',
      'Exclusive Entry to B2B Aerospace Exhibition & Tech Expo',
      'Access to Defense & VC Incubation Pitch Sessions',
      'VIP Networking Lunch & High-Tea with Keynote Dignitaries',
      'Access to talent pool resume database of hackathon finalists',
    ],
  },
  {
    id: 'pass-vip',
    name: 'VIP Flight Deck Pass',
    price: '₹4,999',
    originalPrice: '₹8,000',
    targetAudience: 'Investors, Executives & Distinguished Guests',
    badgeType: 'VIP',
    perks: [
      'Front-row VIP Reserved seating at all sessions & Airshows',
      'Exclusive Access to Flight Operations Command Deck',
      'Invitation to the Official Gala Dinner with Air Marshals & Speakers',
      'Complimentary VIP Campus Chauffeur Shuttle & Dedicated Parking',
      'Executive Commemorative Aerospace Memento from GCDIS',
    ],
  },
];

export const EVENT_SPONSORS = [
  { name: 'Galgotias University', category: 'Organizing Institution', logo: 'GU' },
  { name: 'Defence Research & Development Organisation (DRDO)', category: 'Strategic Partner', logo: 'DRDO' },
  { name: 'Directorate General of Civil Aviation (DGCA)', category: 'Regulatory Partner', logo: 'DGCA' },
  { name: 'Drone Federation of India (DFI)', category: 'Industry Association', logo: 'DFI' },
  { name: 'NVIDIA Robotics', category: 'Edge Compute Partner', logo: 'NVIDIA' },
  { name: 'Ministry of Electronics & Information Technology', category: 'Supporting Patron', logo: 'MeitY' },
  { name: 'Auterion / PX4 Autopilot', category: 'Open Source Avionics', logo: 'PX4' },
];

