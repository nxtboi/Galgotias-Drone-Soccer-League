import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  Maximize2,
  Cpu,
  Flame,
  Grid,
  CheckCircle2
} from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  title: string;
  section: 'Lab' | 'Arena';
  category: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  droneModel?: string;
  tags: string[];
}

// -------------------------------------------------------------
// LAB PHOTOS: ONLY THE 6 AUTHENTIC PHOTOS PROVIDED BY USER
// -------------------------------------------------------------
const ARENA_PHOTOS: GalleryPhoto[] = [
  {
    id: 'arena-1',
    title: 'Spherical Striker Drone in Flight Over Center Circle',
    section: 'Arena',
    category: 'Arena Match Action',
    date: 'April 2026',
    location: 'Galgotias Drone Soccer Pro Arena Cage',
    imageUrl: '/assets/aistudio/DSC07219_8cfcf637.JPG',
    description:
      'Official competition spherical drone soccer quadrotor hovering over the green turf pitch with red striker identification ribbon, live electronic score clock, and pilots at radio controls.',
    droneModel: 'Class D-40 Spherical Carbon Airframe',
    tags: ['Pro Arena Cage', 'Striker Ribbon', 'Live Match', 'Radio Telemetry', 'Galgotias Pro Arena'],
  },
  {
    id: 'arena-2',
    title: 'Official Flight Squad & Pilot Lineup in Center Ring',
    section: 'Arena',
    category: 'Tournament Squads',
    date: 'April 2026',
    location: 'Galgotias Drone Soccer Pro Arena Cage',
    imageUrl: '/assets/aistudio/DSC07228_d31f6982.JPG',
    description:
      'Collegiate drone soccer pilots and flight operators positioned in the arena center circle holding transmitters, surrounded by official competition spherical drones and tournament electronic scoreboard.',
    droneModel: 'Class D-40 & D-20 Fleet',
    tags: ['Squad Lineup', 'Pro Arena', 'Collegiate Pilots', 'Scoreboard', 'Galgotias University'],
  },
  {
    id: 'arena-3',
    title: 'Pre-Match Drone Inspection & Geodesic Airframe Diagnostics',
    section: 'Arena',
    category: 'Flight Prep & Tech',
    date: 'April 2026',
    location: 'Galgotias Arena Technical Enclosure',
    imageUrl: '/assets/aistudio/DSC00064_3d8be257.JPG',
    description:
      'Engineers and pilots conducting pre-flight structural integrity checks, propeller clearance inspections, and transmitter binding ahead of regulation tournament sets.',
    droneModel: 'Competition Spherical Drone',
    tags: ['Tech Inspection', 'Airframe Check', 'Flight Ready', 'Arena Pit'],
  },
  {
    id: 'arena-4',
    title: 'Squad Flight Briefing & Aerial Tactics Alignment',
    section: 'Arena',
    category: 'Tactical Briefing',
    date: 'April 2026',
    location: 'Galgotias Drone Soccer Arena Complex',
    imageUrl: '/assets/aistudio/DSC00108_f7868eac.JPG',
    description:
      'Team captains and student pilots analyzing offensive goal approach routes, defensive escort rings, and mid-air perimeter intercept tactics inside the flight arena zone.',
    droneModel: 'Tactical Squad Formation',
    tags: ['Flight Strategy', 'Squad Pilots', 'Tactical Briefing', 'Galgotias Engineers'],
  },
  {
    id: 'arena-5',
    title: 'Arena Enclosure Deployment & Pilot Readiness Drills',
    section: 'Arena',
    category: 'Arena Flight Drills',
    date: 'April 2026',
    location: 'Galgotias Drone Soccer Pro Arena',
    imageUrl: '/assets/aistudio/DSC00115_cb8cfb0b.JPG',
    description:
      'Pilots testing 3D maneuverability, rapid vertical thrust climbs, and tight hovering precision inside the protective safety containment cage.',
    droneModel: 'Class D-40 Competition Sphere',
    tags: ['Cage Flight', 'Pilot Drills', 'Vertical Thrust', 'Containment Arena'],
  },
  {
    id: 'arena-6',
    title: 'Precision Flight Operations & Transmitter Control',
    section: 'Arena',
    category: 'Pilot Execution',
    date: 'April 2026',
    location: 'Galgotias Arena Pilot Flight Line',
    imageUrl: '/assets/aistudio/DSC00128_29519176.JPG',
    description:
      'High-focus radio transmitter piloting, stick calibration, and coordinated multi-drone synchronization in the caged tournament flight environment.',
    droneModel: 'Spherical Multi-Rotor System',
    tags: ['Precision Control', 'Radio Transmitter', 'Multi-Drone Sync', 'Arena Action'],
  },
];

export interface GalleryPageProps {
  onNavigate?: (page: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  // Primary section view: 'all' | 'lab' | 'arena'
  const [activeSection, setActiveSection] = useState<'all' | 'lab' | 'arena'>('all');
  // Sub-view inside Arena: 'photos' | 'videos'
  const [arenaSubView, setArenaSubView] = useState<'photos' | 'videos'>('photos');
  // Lightbox selection
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const realMatchVideos = [
    {
      id: 'v-1',
      title: 'GCDIS International Cup: Live 5v5 Aerial Soccer Clash',
      source: 'GCDIS Official Championship',
      videoId: 'vfyZZAgXipA',
      badge: 'OFFICIAL MATCH',
      description: 'Full regulation set play between collegiate squads demonstrating high-speed goal entries and tactical escort.',
    },
    {
      id: 'v-2',
      title: 'The Most Chaotic Drone Sport: Real Crashes & Mechanics',
      source: 'GCDIS In-Depth Feature',
      videoId: '4S9OA1rtFn4',
      badge: 'ACTION HIGHLIGHTS',
      description: 'Close-up analysis of 50 km/h defensive body checks, keeper saves, and geodesic cage durability.',
    },
    {
      id: 'v-3',
      title: 'FAI World Drone Soccer Championships Final Day',
      source: 'FAI World Air Sports',
      videoId: 'dAIhdSUbXBE',
      badge: 'WORLD CHAMPIONSHIP',
      description: 'Championship final match coverage featuring elite collegiate pilots and illuminated scoring hoops.',
    },
    {
      id: 'v-4',
      title: 'Drone Soccer National Exhibition & Hardware',
      source: 'GCDIS Arena Broadcast',
      videoId: '3UG-b0J8j38',
      badge: 'EXHIBITION',
      description: 'Live arena demonstration of Class 40 and Class 20 sphere drones in action.',
    },
  ];

  // Combined photo list for lightbox navigation
  const allCurrentPhotos = useMemo(() => {
    if (activeSection === 'lab') return LAB_PHOTOS;
    if (activeSection === 'arena') return ARENA_PHOTOS;
    return [...LAB_PHOTOS, ...ARENA_PHOTOS];
  }, [activeSection]);

  const activePhotoIndex = useMemo(() => {
    if (!activePhoto) return -1;
    return allCurrentPhotos.findIndex((p) => p.id === activePhoto.id);
  }, [activePhoto, allCurrentPhotos]);

  const handlePrevPhoto = useCallback(() => {
    if (activePhotoIndex === -1) return;
    const nextIdx = activePhotoIndex > 0 ? activePhotoIndex - 1 : allCurrentPhotos.length - 1;
    setActivePhoto(allCurrentPhotos[nextIdx]);
  }, [activePhotoIndex, allCurrentPhotos]);

  const handleNextPhoto = useCallback(() => {
    if (activePhotoIndex === -1) return;
    const nextIdx = activePhotoIndex < allCurrentPhotos.length - 1 ? activePhotoIndex + 1 : 0;
    setActivePhoto(allCurrentPhotos[nextIdx]);
  }, [activePhotoIndex, allCurrentPhotos]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activePhoto) return;
      if (e.key === 'Escape') setActivePhoto(null);
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, handlePrevPhoto, handleNextPhoto]);

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-[#111210] text-white">
      {/* Ambient background glows */}
      <div 
        className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#d0fe1d]/5 blur-[160px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[#38bdf8]/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <button 
            onClick={() => onNavigate?.('home')} 
            className="hover:text-[#d0fe1d] transition-colors cursor-pointer"
          >
            HOME
          </button>
          <span>/</span>
          <span className="text-[#d0fe1d] font-bold">GALLERY</span>
        </div>

        {/* Hero Header */}
        <div className="pb-6 border-b border-white/10 text-left space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
            <Camera className="w-4 h-4" />
            <span>OFFICIAL LEAGUE PHOTO ARCHIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-orbitron font-black text-white uppercase tracking-wider leading-tight">
            LEAGUE GALLERY: <span className="text-[#d0fe1d]">LAB &amp; ARENA</span>
          </h1>
        </div>

        {/* ========================================================
            PRIMARY SECTION SELECTOR: LAB | ARENA | ALL
            ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-[#141612] border border-white/15 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-rajdhani font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-white text-black shadow-lg font-black'
                  : 'text-neutral-400 hover:text-white bg-[#1a1d17]'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>All Sections</span>
            </button>

            <button
              onClick={() => setActiveSection('lab')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-rajdhani font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'lab'
                  ? 'bg-[#d0fe1d] text-black shadow-[0_0_20px_rgba(208,254,29,0.35)] font-black'
                  : 'text-neutral-400 hover:text-white bg-[#1a1d17]'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>GCDIS Lab Section</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeSection === 'lab' ? 'bg-black text-[#d0fe1d]' : 'bg-black/50 text-[#d0fe1d]'
              }`}>
                {LAB_PHOTOS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('arena')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-rajdhani font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'arena'
                  ? 'bg-[#d0fe1d] text-black shadow-[0_0_20px_rgba(208,254,29,0.35)] font-black'
                  : 'text-neutral-400 hover:text-white bg-[#1a1d17]'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Tournament Arena Section</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeSection === 'arena' ? 'bg-black text-[#d0fe1d]' : 'bg-black/50 text-neutral-300'
              }`}>
                {ARENA_PHOTOS.length}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================
            SECTION 1: GCDIS LAB (CONTAINS ONLY USER'S 6 PHOTOS)
            ======================================================== */}
        {(activeSection === 'all' || activeSection === 'lab') && (
          <section id="gallery-lab-section" className="space-y-6 text-left">
            {/* Lab Section Header Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#171b13] via-[#141612] to-[#161a12] border border-[#d0fe1d]/50 shadow-[0_0_40px_rgba(208,254,29,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#d0fe1d]/5 blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d0fe1d] text-black">
                      LAB SECTION
                    </span>
                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d0fe1d]" />
                      Authentic GCDIS Laboratory Captures
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
                    GCDIS <span className="text-[#d0fe1d]">DRONE LAB</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* Lab Photos Grid (Only These 6 Photos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LAB_PHOTOS.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setActivePhoto(photo)}
                  className="group cursor-pointer bg-[#141612] border border-white/15 hover:border-[#d0fe1d] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(208,254,29,0.15)]"
                >
                  {/* Photo Container (Image Only) */}
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-black">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100"
                      loading="lazy"
                    />

                    {/* Expand Icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-[#d0fe1d]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Divider between sections if viewing all */}
        {activeSection === 'all' && (
          <div className="relative py-4" aria-hidden="true">
            <div className="border-t border-white/15" />
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 px-4 bg-[#111210] text-[#d0fe1d] font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <span>✦</span>
              <span>ARENA DIVISION</span>
              <span>✦</span>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 2: ARENA SECTION (CAGE CLASHES & MATCHES)
            ======================================================== */}
        {(activeSection === 'all' || activeSection === 'arena') && (
          <section id="gallery-arena-section" className="space-y-6 text-left">
            {/* Arena Section Header Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#171614] via-[#141612] to-[#1c1a14] border border-white/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d0fe1d] text-black">
                      ARENA SECTION
                    </span>
                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d0fe1d]" />
                      Authentic Galgotias Drone Soccer Pro Arena Captures
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
                    GALGOTIAS <span className="text-[#d0fe1d]">PRO ARENA</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* Arena Content: Photos (Image Only Cards) */}
            {arenaSubView === 'photos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ARENA_PHOTOS.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="group cursor-pointer bg-[#141612] border border-white/15 hover:border-[#d0fe1d]/70 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(208,254,29,0.15)]"
                  >
                    <div className="relative h-64 sm:h-72 overflow-hidden bg-black">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100"
                        loading="lazy"
                      />

                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5 text-[#d0fe1d]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Arena Content: Match Videos */}
            {arenaSubView === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {realMatchVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="bg-[#141612] border border-white/15 hover:border-[#d0fe1d]/70 rounded-2xl overflow-hidden shadow-2xl text-white flex flex-col justify-between transition-colors"
                  >
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        className="w-full h-full border-0"
                        src={`https://www.youtube-nocookie.com/embed/${vid.videoId}?controls=1&modestbranding=1&rel=0&playsinline=1`}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-red-600/90 text-white uppercase tracking-wider">
                          {vid.badge}
                        </span>
                        <span className="text-xs font-mono text-[#d0fe1d]">{vid.source}</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-orbitron font-bold text-white uppercase leading-snug">
                        {vid.title}
                      </h4>

                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                        {vid.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Squad Call To Action Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#171a14] via-[#141612] to-[#1a1f15] border border-[#d0fe1d]/40 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-[0_0_50px_rgba(208,254,29,0.06)]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#d0fe1d] uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>READY FOR THE NATIONAL ARENA?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wider">
              ENTER YOUR SQUAD IN THE CAGE
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              Register your collegiate flight team for the ₹2,00,000 national championship purse in Class D-20 and Class D-40 categories before arena slots fill up.
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('register')}
            className="xotc-btn-lime px-6 py-3.5 text-sm whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>REGISTER YOUR SQUAD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            LIGHTBOX MODAL (Full Obsidian HUD Style)
            ======================================================== */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141612] border border-[#d0fe1d]/60 rounded-2xl max-w-4xl w-full overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] text-left flex flex-col relative"
            >
              {/* Image Frame with Navigation Arrows */}
              <div className="relative h-72 sm:h-96 md:h-[480px] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  className="w-full h-full object-contain"
                />

                {/* Close Button */}
                <button
                  onClick={() => setActivePhoto(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:bg-[#d0fe1d] hover:text-black hover:border-[#d0fe1d] transition-all cursor-pointer z-10"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left/Right Prev/Next Buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-[#d0fe1d] hover:text-black hover:border-[#d0fe1d] transition-all cursor-pointer"
                  title="Previous Photo (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-[#d0fe1d] hover:text-black hover:border-[#d0fe1d] transition-all cursor-pointer"
                  title="Next Photo (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default GalleryPage;
