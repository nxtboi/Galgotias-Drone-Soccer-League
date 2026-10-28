import React, { useState, useMemo } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Cage Clashes' | 'Pit Lane & Tech' | 'Scrutineering' | 'Podium & Awards' | 'Pilot Dugout';
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  droneModel?: string;
  tags: string[];
}

export interface GalleryAlbum {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  coverImage: string;
  photosCount: number;
  date: string;
  location: string;
  photos: GalleryPhoto[];
}

const GDSL_PHOTOS: GalleryPhoto[] = [
  {
    id: 'p-clash-1',
    title: 'Striker Penetrating the 3M Elevated Goal Ring',
    category: 'Cage Clashes',
    date: 'Dec 03, 2026',
    location: 'Galgotias Arena Cage 1',
    imageUrl: '/drone-lab.jpg',
    description:
      'High-speed capture of the Galgotias Aero Hawks striker sphere flying cleanly through the illuminated 60cm hoop at 42 km/h.',
    droneModel: 'HawkSphere 400X Carbon',
    tags: ['Goal Strike', 'Class 40', 'Arena Cage 1', 'Night Lights'],
  },
  {
    id: 'p-clash-2',
    title: 'Mid-Air Geodesic Cage Collision Deflection',
    category: 'Cage Clashes',
    date: 'Dec 03, 2026',
    location: 'Galgotias Arena Cage 2',
    imageUrl: '/bg.jpg',
    description:
      'Goalkeeper sphere intercepts incoming striker in the neutral air corridor with zero structural fracture to either polycarbonate frame.',
    droneModel: 'VortexCage Pro V3',
    tags: ['Goalkeeper Block', 'Polycarbonate Ribs', 'Impact Survival'],
  },
  {
    id: 'p-clash-3',
    title: '5v5 Aerial Scrum in Mid-Court Corridor',
    category: 'Cage Clashes',
    date: 'Dec 02, 2026',
    location: 'Galgotias Arena Cage 1',
    imageUrl: '/storm-sky.jpg',
    description:
      'Full ten-drone engagement as defenders establish an escort formation to shield the blue striker towards the scoring plane.',
    droneModel: 'Phoenix Orb 4.2',
    tags: ['5v5 Aerial Battle', 'Tactical Escort', 'LED Ribbon'],
  },
  {
    id: 'p-pit-1',
    title: '3-Minute Pit Interval: Rapid LiPo Pack Swap',
    category: 'Pit Lane & Tech',
    date: 'Dec 03, 2026',
    location: 'GCDIS Pit Lane Bay 03',
    imageUrl: '/drone-lab.jpg',
    description:
      'Team technicians executing a 45-second battery change and telemetry check inside the fire-resistant pit bay before Set 2.',
    droneModel: 'FalconSphere 400',
    tags: ['Pit Stop', '4S LiPo', 'Balance Charge', 'Field Tooling'],
  },
  {
    id: 'p-pit-2',
    title: 'Brushless Motor Stator Diagnostic & Prop Rebalance',
    category: 'Pit Lane & Tech',
    date: 'Dec 02, 2026',
    location: 'GCDIS Precision Flight Lab',
    imageUrl: '/drone-lab.jpg',
    description:
      'Replacing bent propeller hubs after an intense quarter-final scrimmage using digital torque drivers.',
    droneModel: 'PulseShield 40',
    tags: ['Propeller Balancing', '2806.5 Brushless', 'High RPM'],
  },
  {
    id: 'p-scrut-1',
    title: 'Digital Scale Weigh-In: Class 40 Scrutineering',
    category: 'Scrutineering',
    date: 'Dec 02, 2026',
    location: 'GCDIS Scrutineering Bay',
    imageUrl: '/bg.jpg',
    description:
      'Official FAI chief technical scrutineer certifying total drone take-off weight of 1042g (within <1100g regulation limit).',
    droneModel: 'AeroDrift PolyOrb',
    tags: ['Scrutineering', 'Calibrated Scale', 'Weight Check', 'FAI F9A'],
  },
  {
    id: 'p-scrut-2',
    title: 'Radio Frequency Lockout & Failsafe Simulation',
    category: 'Scrutineering',
    date: 'Dec 02, 2026',
    location: 'RF Spectrum Chamber',
    imageUrl: '/storm-sky.jpg',
    description:
      'Verifying autonomous 0.8s throttle-cut failsafe upon loss of 2.4GHz control packet signal.',
    droneModel: 'StrikeOrb MK-2',
    tags: ['ELRS 2.4GHz', 'Failsafe Verification', 'Range Safety'],
  },
  {
    id: 'p-awards-1',
    title: 'Galgotias Aero Hawks Hoisting Championship Cup',
    category: 'Podium & Awards',
    date: 'Dec 03, 2026',
    location: 'Main Amphitheatre Stage',
    imageUrl: '/drone-lab.jpg',
    description:
      'The winning collegiate squad receiving the national championship trophy and official prize cheque (D-40 ₹31,000 / D-20 ₹21,000) amidst arena confetti.',
    droneModel: 'HawkSphere 400X',
    tags: ['Champions', 'Gold Cup', 'National Trophy', 'Podium'],
  },
  {
    id: 'p-dugout-1',
    title: 'Pilots in FPV Dugout During Sudden-Death Overtime',
    category: 'Pilot Dugout',
    date: 'Dec 03, 2026',
    location: 'Shielded Pilot Pod B',
    imageUrl: '/drone-lab.jpg',
    description:
      'Team captain and pilots locked in focus wearing low-latency HD video goggles behind the safety ballistic screen.',
    droneModel: 'HawkSphere 400X',
    tags: ['FPV Pilot Dugout', 'HDZero Goggles', 'Radio Telemetry'],
  },
];

const GDSL_ALBUMS: GalleryAlbum[] = [
  {
    id: 'album-clashes',
    title: 'Arena Cage Aerial Clashes',
    subtitle: '5v5 high-speed striker penetrations and 50 km/h protective cage collisions in the indoor arena.',
    category: 'Cage Clashes',
    coverImage: '/drone-lab.jpg',
    photosCount: 3,
    date: 'December 2026',
    location: 'Galgotias Arena Cage 1 & 2',
    photos: GDSL_PHOTOS.filter((p) => p.category === 'Cage Clashes'),
  },
  {
    id: 'album-pit-lane',
    title: 'Pit Lane & Rapid Battery Turnarounds',
    subtitle: 'Under-the-hood engineering, brushless motor swaps, and 45-second tactical pit stops.',
    category: 'Pit Lane & Tech',
    coverImage: '/drone-lab.jpg',
    photosCount: 2,
    date: 'December 2026',
    location: 'GCDIS Pit Bay Hangar',
    photos: GDSL_PHOTOS.filter((p) => p.category === 'Pit Lane & Tech'),
  },
  {
    id: 'album-scrutineering',
    title: 'Technical Scrutineering & Calibrations',
    subtitle: 'Precision weight checks, carbon cage caliper tests, and RF fail-safe lockouts.',
    category: 'Scrutineering',
    coverImage: '/bg.jpg',
    photosCount: 2,
    date: 'December 2026',
    location: 'GCDIS Proving Ground',
    photos: GDSL_PHOTOS.filter((p) => p.category === 'Scrutineering'),
  },
  {
    id: 'album-podium',
    title: 'Podium Trophies & Pilot Awards',
    subtitle: 'Total pool of ₹1,00,000 (including trophy and cash prize; D-40 ₹57K & D-20 ₹37K), MVP citations, and medals.',
    category: 'Podium & Awards',
    coverImage: '/drone-lab.jpg',
    photosCount: 2,
    date: 'December 2026',
    location: 'Indoor Amphitheatre',
    photos: GDSL_PHOTOS.filter((p) => p.category === 'Podium & Awards' || p.category === 'Pilot Dugout'),
  },
];

export interface GalleryPageProps {
  onNavigate?: (page: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  const [activeView, setActiveView] = useState<'albums' | 'photos' | 'videos'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const realMatchVideos = [
    {
      id: 'v-1',
      title: 'FIDA International Cup: Live 5v5 Aerial Soccer Clash',
      source: 'FIDA Official Championship',
      videoId: 'vfyZZAgXipA',
      badge: 'OFFICIAL MATCH',
      description: 'Full regulation set play between Taiwan and Malaysia demonstrating high-speed goal entries and tactical escort.',
    },
    {
      id: 'v-2',
      title: 'The Most Chaotic Drone Sport: Real Crashes & Mechanics',
      source: 'FIDA In-Depth Feature',
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
      source: 'FIDA USA',
      videoId: '3UG-b0J8j38',
      badge: 'EXHIBITION',
      description: 'Live arena demonstration of Class 40 and Class 20 sphere drones in action.',
    },
  ];

  const categories = ['All', 'Cage Clashes', 'Pit Lane & Tech', 'Scrutineering', 'Podium & Awards', 'Pilot Dugout'];

  const displayedPhotos = useMemo(() => {
    let list = GDSL_PHOTOS;
    if (selectedAlbumId) {
      const album = GDSL_ALBUMS.find((a) => a.id === selectedAlbumId);
      list = album ? album.photos : GDSL_PHOTOS;
    }
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    return list;
  }, [selectedAlbumId, selectedCategory]);

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
            <span>OFFICIAL LEAGUE PHOTO ARCHIVE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            ARENA ACTION &amp; FLIGHT GALLERY
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            High-speed photographic captures of caged sphere drone collisions, stadium goal strikes, pit bay mechanics, and podium triumphs.
          </p>

          {/* View Toggles */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setActiveView('albums');
                setSelectedAlbumId(null);
              }}
              className={`px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeView === 'albums'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Curated Albums
            </button>
            <button
              onClick={() => {
                setActiveView('photos');
                setSelectedAlbumId(null);
              }}
              className={`px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeView === 'photos'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              All Arena Photos
            </button>
            <button
              onClick={() => {
                setActiveView('videos');
                setSelectedAlbumId(null);
              }}
              className={`px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeView === 'videos'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>Match Videos (Reels)</span>
            </button>
          </div>
        </div>

        {/* Category Filters (when viewing all photos) */}
        {activeView === 'photos' && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-950 text-white'
                    : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ALBUMS VIEW */}
        {activeView === 'albums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {GDSL_ALBUMS.map((album) => (
              <div
                key={album.id}
                onClick={() => {
                  setSelectedAlbumId(album.id);
                  setActiveView('photos');
                }}
                className="group cursor-pointer bg-white border border-blue-200 rounded-3xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                    <span className="text-xs font-mono font-bold bg-blue-600/80 px-2.5 py-1 rounded-full uppercase backdrop-blur-md">
                      {album.category}
                    </span>
                    <span className="text-xs font-mono">{album.photosCount} Photos</span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-sans font-black text-blue-950 uppercase group-hover:text-blue-700 transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {album.subtitle}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-blue-700">
                    <span>{album.location}</span>
                    <span className="font-bold uppercase group-hover:translate-x-1 transition-transform">
                      View Shots →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PHOTOS GRID VIEW */}
        {activeView === 'photos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {displayedPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightboxPhoto(photo)}
                className="group cursor-pointer bg-white border border-blue-200 rounded-3xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-blue-950/80 text-white text-[10px] font-mono px-2.5 py-1 rounded-full backdrop-blur-md">
                    {photo.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="font-sans font-black text-sm text-blue-950 uppercase group-hover:text-blue-700 transition-colors">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-100">
                    <span>{photo.droneModel || 'Class 40 Sphere'}</span>
                    <span>{photo.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REAL MATCH VIDEOS GRID VIEW */}
        {activeView === 'videos' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {realMatchVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-slate-950 border border-blue-900/60 rounded-3xl overflow-hidden shadow-xl text-white flex flex-col justify-between"
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

                  <div className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-600/90 text-white">
                        {vid.badge}
                      </span>
                      <span className="text-xs font-mono text-sky-400">{vid.source}</span>
                    </div>

                    <h4 className="text-base font-sans font-black text-white uppercase leading-snug">
                      {vid.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIGHTBOX MODAL */}
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-left border border-blue-300"
            >
              <div className="relative h-80 sm:h-96 bg-slate-950">
                <img
                  src={lightboxPhoto.imageUrl}
                  alt={lightboxPhoto.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/70 text-white flex items-center justify-center hover:bg-slate-950 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                    {lightboxPhoto.category} · {lightboxPhoto.location}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{lightboxPhoto.date}</span>
                </div>
                <h3 className="text-xl font-sans font-black text-blue-950 uppercase">
                  {lightboxPhoto.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {lightboxPhoto.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {lightboxPhoto.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default GalleryPage;
