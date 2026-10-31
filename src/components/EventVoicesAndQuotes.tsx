import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Quote, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Ticket,
  Phone,
  Mail,
  Copy,
  Check,
  Linkedin,
  Instagram,
  Github,
  RotateCw,
  RotateCcw
} from 'lucide-react';
import { Parallax3DSection, Tilt3DCard } from './Parallax3DSection';
import { TeamMember } from '../data/teamData';

export interface EventVoicesAndQuotesProps {
  onRegisterClick?: () => void;
  onShareClick?: () => void;
}

interface TestimonialQuote {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  category: string;
  member: TeamMember;
}

export const EVENT_QUOTES: TestimonialQuote[] = [
  {
    id: '1',
    quote: "Galgotias Drone Soccer League is engineered to push the boundaries of young mind robotics, high-speed telemetry, and tactical teamwork. It is where classroom engineering translates into real stadium glory.",
    author: "Shri. Suneel Galgotia",
    role: "Chancellor",
    organization: "Galgotias University",
    category: "CHANCELLOR",
    member: {
      id: 'suneel-galgotia',
      name: 'Shri. Suneel Galgotia',
      role: 'Chancellor',
      department: 'Galgotias University',
      category: 'advisory',
      categoryLabel: 'CHANCELLOR',
      phone: '+91 120 4370000',
      email: 'chancellor@galgotiasuniversity.edu.in',
      linkedin: 'https://www.linkedin.com/school/galgotias-university/',
      image: '/assets/aistudio/Suneel_Galgotia__Chancellor__G-x1800_f1634cb3.webp',
      bio: 'Visionary founder and Chancellor of Galgotias University, dedicated to fostering world-class innovation, research excellence, and next-generation technology leadership.'
    }
  },
  {
    id: '2',
    quote: "Inside the 16-meter ballistic netting cage at 50 km/h, there are no second chances. Every 10-millisecond RC radio command and carbon sphere collision test pilot instincts to their absolute limit.",
    author: "Dr. Dhruv Galgotia",
    role: "CEO",
    organization: "Galgotias University",
    category: "CEO",
    member: {
      id: 'dhruv-galgotia',
      name: 'Dr. Dhruv Galgotia',
      role: 'CEO',
      department: 'Galgotias University',
      category: 'advisory',
      categoryLabel: 'CEO',
      phone: '+91 120 4370000',
      email: 'ceo@galgotiasuniversity.edu.in',
      linkedin: 'https://www.linkedin.com/school/galgotias-university/',
      image: '/assets/aistudio/Galgotias_University_Corporate_Portrait_25e37b2b.png',
      bio: 'Chief Executive Officer spearheading global academic alliances, frontier technology hubs, and futuristic robotics and aerial sports ecosystems at Galgotias University.'
    }
  },
  {
    id: '3',
    quote: "Scrutineering is where championship integrity is won. Every 400mm and 200mm protective sphere, battery fail-safe cutoff, and frequency hopping channel is rigorously validated before launch.",
    author: "Aradhana Galgotia",
    role: "Director",
    organization: "Galgotias University",
    category: "DIRECTOR",
    member: {
      id: 'aradhana-galgotia',
      name: 'Aradhana Galgotia',
      role: 'Director',
      department: 'Galgotias University',
      category: 'advisory',
      categoryLabel: 'DIRECTOR',
      phone: '+91 120 4370000',
      email: 'director@galgotiasuniversity.edu.in',
      linkedin: 'https://www.linkedin.com/school/galgotias-university/',
      image: '/assets/aistudio/Confident_Professional_in_Modern_Atrium_3272d0e4.png',
      bio: 'Director at Galgotias University driving institutional excellence, student empowerment, and national-scale collegiate innovation championships.'
    }
  }
];

export const EventVoicesAndQuotes: React.FC<EventVoicesAndQuotesProps> = () => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Automatically advance both the team member card and quote card every 2 seconds
  useEffect(() => {
    if (isPaused || isCardFlipped) return;

    const interval = setInterval(() => {
      setIsCardFlipped(false);
      setActiveQuoteIndex((prev) => (prev + 1) % EVENT_QUOTES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, isCardFlipped]);

  const copyToClipboard = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleNext = () => {
    setIsCardFlipped(false);
    setActiveQuoteIndex((prev) => (prev + 1) % EVENT_QUOTES.length);
  };

  const handlePrev = () => {
    setIsCardFlipped(false);
    setActiveQuoteIndex((prev) => (prev - 1 + EVENT_QUOTES.length) % EVENT_QUOTES.length);
  };

  const handleSelectQuote = (idx: number) => {
    setIsCardFlipped(false);
    setActiveQuoteIndex(idx);
  };

  const currentQuote = EVENT_QUOTES[activeQuoteIndex];
  const currentMember: TeamMember = currentQuote.member;

  return (
    <section className="relative z-20 w-full py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-[#141612] text-white overflow-hidden border-y border-white/15">
      <Parallax3DSection
        offsetY={60}
        rotateXRange={[8, 0, -7]}
        scaleRange={[0.95, 1, 0.96]}
        className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto space-y-10 sm:space-y-12 lg:space-y-14 relative z-10"
      >
        <div className="space-y-10 sm:space-y-12 lg:space-y-14">
          {/* Section Title */}
          <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 px-2">
            <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
              CHAMPIONSHIP VOICES &amp; ENDORSEMENTS
            </span>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
              VOICES OF THE <span className="text-[#d0fe1d]">LEAGUE</span>
            </h2>
          </div>

          {/* Interactive Division: Team Member Card on Left + Quote Division on Right */}
          <div 
            className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 xl:gap-10 items-stretch w-full mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* LEFT: Leadership Portrait Card — Responsive aspect ratio & height matched to Quote Division */}
            <div className="md:col-span-5 lg:col-span-4 xl:col-span-4 flex flex-col justify-center items-center">
              <div className="techkriti-card-perspective w-full max-w-[330px] sm:max-w-[360px] md:max-w-none h-[380px] sm:h-[410px] md:h-full md:min-h-[410px] lg:min-h-[440px] xl:min-h-[460px]">
                <div
                  className={`techkriti-card-inner ${
                    isCardFlipped ? 'is-flipped' : ''
                  }`}
                >
                  {/* FRONT FACE: Portrait & Identity */}
                  <div
                    className={`techkriti-card-face bg-[#141612] border border-white/15 hover:border-[#d0fe1d]/70 flex flex-col justify-between shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer select-none ${
                      isCardFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                    }`}
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    role="button"
                    tabIndex={isCardFlipped ? -1 : 0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsCardFlipped(!isCardFlipped);
                      }
                    }}
                    aria-label={`${currentMember.name}. Click to view contact details`}
                  >
                    {/* Top Bar */}
                    <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black/85 backdrop-blur-md border border-[#d0fe1d]/50 text-[#d0fe1d] rounded">
                        {currentMember.categoryLabel}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCardFlipped(!isCardFlipped);
                        }}
                        className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] text-[10px] font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer"
                        title="Flip to contacts"
                      >
                        <span>Contacts</span>
                        <RotateCw className="w-3 h-3 text-[#d0fe1d] group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>

                    {/* Portrait Image with Tech Frame */}
                    <div className="relative w-full h-full overflow-hidden bg-neutral-900">
                      <img
                        src={currentMember.image}
                        alt={currentMember.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e100d] via-[#0e100d]/40 to-black/30 pointer-events-none" />
                    </div>

                    {/* Front Bottom Card Info */}
                    <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-5 bg-gradient-to-t from-[#0e100d] via-[#0e100d]/90 to-transparent pt-8 sm:pt-10 text-left space-y-2.5 sm:space-y-3">
                      <div className="space-y-0.5 sm:space-y-1">
                        <h3 className="font-orbitron font-bold text-base sm:text-lg text-white group-hover:text-[#d0fe1d] transition-colors leading-tight">
                          {currentMember.name}
                        </h3>
                        <div className="font-rajdhani text-xs sm:text-sm font-bold text-[#d0fe1d] tracking-wide uppercase">
                          {currentMember.role}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-sans truncate">
                          {currentMember.department}
                        </div>
                      </div>

                      {/* Flip Prompt */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-neutral-400 text-[11px] font-mono group-hover:text-white transition-colors">
                        <span className="flex items-center gap-1.5 text-neutral-400 group-hover:text-[#d0fe1d] transition-colors">
                          <RotateCw className="w-3 h-3 text-[#d0fe1d]" />
                          <span>Click to flip card</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          DIRECT COMM ↵
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE: Direct Contact Channels & Bio */}
                  <div
                    className={`techkriti-card-face techkriti-card-back bg-[#141612] border-2 border-[#d0fe1d]/50 p-4 sm:p-5 flex flex-col justify-between shadow-2xl text-left overflow-hidden select-text cursor-default ${
                      isCardFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0fe1d]/10 blur-2xl rounded-full pointer-events-none" />

                    {/* Back Header */}
                    <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/15 pb-2.5 sm:pb-3">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#d0fe1d]">
                          {currentMember.categoryLabel}
                        </span>
                        <h4 className="font-orbitron font-bold text-sm sm:text-base text-white leading-tight">
                          {currentMember.name}
                        </h4>
                        <p className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase">
                          {currentMember.role}
                        </p>
                      </div>

                      {/* Flip back to photo */}
                      <button
                        type="button"
                        onClick={() => setIsCardFlipped(false)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/20 text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all cursor-pointer shrink-0 text-[10px] font-rajdhani font-bold uppercase tracking-wider"
                        title="Flip back to portrait photo"
                      >
                        <span>Photo</span>
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Back Center: Scope & Bio */}
                    <div className="relative z-10 space-y-2.5 py-2 select-text">
                      <div className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                        <span className="text-neutral-500 block text-[10px] font-mono uppercase tracking-wider">
                          Department / Unit:
                        </span>
                        <span className="text-white font-medium select-text">
                          {currentMember.department}
                        </span>
                      </div>

                      {currentMember.bio && (
                        <div className="p-2.5 bg-[#0e100d]/90 border border-white/10 rounded-xl select-text">
                          <span className="text-[10px] font-mono text-[#d0fe1d] uppercase tracking-wider block mb-1">
                            Operational Scope:
                          </span>
                          <p className="text-[11px] text-neutral-300 font-sans leading-relaxed select-text">
                            {currentMember.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Back Contacts List */}
                    <div className="relative z-10 space-y-2 pt-2 border-t border-white/15">
                      {/* Phone */}
                      <div className="flex items-center justify-between gap-2 p-1.5 bg-[#0e100d] border border-white/10 rounded-lg">
                        <a
                          href={`tel:${currentMember.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center gap-2 text-xs font-mono text-neutral-300 hover:text-[#d0fe1d] transition-colors truncate"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#d0fe1d] shrink-0" />
                          <span className="truncate">{currentMember.phone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={(e) =>
                            copyToClipboard(currentMember.phone, `phone-${currentMember.id}`, e)
                          }
                          className="p-1 text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedId === `phone-${currentMember.id}` ? (
                            <Check className="w-3.5 h-3.5 text-[#d0fe1d]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Email */}
                      {currentMember.email && (
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-[#0e100d] border border-white/10 rounded-lg">
                          <a
                            href={`mailto:${currentMember.email}`}
                            className="flex items-center gap-2 text-xs font-mono text-neutral-300 hover:text-[#d0fe1d] transition-colors truncate"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#d0fe1d] shrink-0" />
                            <span className="truncate">{currentMember.email}</span>
                          </a>
                          <button
                            type="button"
                            onClick={(e) =>
                              copyToClipboard(currentMember.email!, `email-${currentMember.id}`, e)
                            }
                            className="p-1 text-neutral-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedId === `email-${currentMember.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#d0fe1d]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Socials */}
                      <div className="flex items-center gap-2 pt-1">
                        {currentMember.linkedin && (
                          <a
                            href={currentMember.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#0e100d] border border-white/10 hover:border-[#d0fe1d] text-neutral-400 hover:text-[#d0fe1d] rounded-lg transition-colors cursor-pointer"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {currentMember.github && (
                          <a
                            href={currentMember.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#0e100d] border border-white/10 hover:border-[#d0fe1d] text-neutral-400 hover:text-[#d0fe1d] rounded-lg transition-colors cursor-pointer"
                            title="GitHub Profile"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {currentMember.instagram && (
                          <a
                            href={currentMember.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#0e100d] border border-white/10 hover:border-[#d0fe1d] text-neutral-400 hover:text-[#d0fe1d] rounded-lg transition-colors cursor-pointer"
                            title="Instagram Profile"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Featured Interactive Quote Card — Fluidly scaled to match portrait card height */}
            <div className="md:col-span-7 lg:col-span-8 xl:col-span-8 flex flex-col justify-center w-full">
              <Tilt3DCard maxTilt={5} scrollOffsetY={30} className="w-full h-full">
                <div className="relative w-full bg-[#111210] border border-[#d0fe1d]/40 p-5 sm:p-8 md:p-9 lg:p-11 xl:p-12 shadow-[0_24px_60px_rgba(0,0,0,0.65)] text-left overflow-hidden h-full md:min-h-[410px] lg:min-h-[440px] xl:min-h-[460px] flex flex-col justify-between">
                  <Quote className="absolute top-4 right-4 sm:top-6 sm:right-6 w-14 h-14 sm:w-20 sm:h-20 text-[#d0fe1d]/10 pointer-events-none" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuote.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#d0fe1d]">
                          {currentQuote.category}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          0{activeQuoteIndex + 1} / 0{EVENT_QUOTES.length}
                        </span>
                      </div>

                      <blockquote className="text-sm sm:text-lg md:text-xl lg:text-2xl font-sans font-bold leading-relaxed text-white">
                        &ldquo;{currentQuote.quote}&rdquo;
                      </blockquote>

                      <div className="flex items-center gap-3.5 sm:gap-4 pt-3.5 sm:pt-4 border-t border-white/15">
                        <img
                          src={currentMember.image}
                          alt={currentMember.name}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover object-top border-2 border-[#d0fe1d]/50 shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-orbitron font-black text-xs sm:text-sm md:text-base text-white uppercase tracking-wider truncate">
                            {currentQuote.author}
                          </div>
                          <div className="text-xs font-mono text-[#d0fe1d] truncate">
                            {currentQuote.role} · <span className="text-neutral-400">{currentQuote.organization}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {EVENT_QUOTES.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectQuote(idx)}
                          className={`h-1.5 transition-all cursor-pointer relative overflow-hidden rounded-full ${
                            activeQuoteIndex === idx ? 'w-10 bg-white/20' : 'w-2 bg-white/25 hover:bg-white/50'
                          }`}
                          aria-label={`Jump to quote ${idx + 1}`}
                        >
                          {activeQuoteIndex === idx && !isPaused && !isCardFlipped && (
                            <motion.span
                              key={`progress-${activeQuoteIndex}`}
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 2, ease: 'linear' }}
                              className="absolute inset-0 bg-[#d0fe1d]"
                            />
                          )}
                          {activeQuoteIndex === idx && (isPaused || isCardFlipped) && (
                            <span className="absolute inset-0 bg-[#d0fe1d]" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        className="p-2 sm:p-2.5 bg-[#171915] hover:border-[#d0fe1d] text-white hover:text-[#d0fe1d] transition-colors cursor-pointer border border-white/20"
                        aria-label="Previous quote"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-2 sm:p-2.5 bg-[#171915] hover:border-[#d0fe1d] text-white hover:text-[#d0fe1d] transition-colors cursor-pointer border border-white/20"
                        aria-label="Next quote"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Tilt3DCard>
            </div>
          </div>

          {/* 3-Pillar Event Value Cards with Responsive Grid Sizing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 pt-2 text-left items-stretch">
            <Tilt3DCard maxTilt={7} scrollOffsetY={20}>
              <div className="xotc-card p-5 sm:p-6 lg:p-7 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-orbitron font-black text-sm sm:text-base text-white uppercase tracking-wider">
                    GDSL CLASS REGULATIONS
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                    Full adherence to international 5th Revision standards for 400mm and 200mm protective sphere multirotors, fail-safe cutoffs, and frequency hopping.
                  </p>
                </div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard maxTilt={7} scrollOffsetY={38}>
              <div className="xotc-card p-5 sm:p-6 lg:p-7 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-orbitron font-black text-sm sm:text-base text-white uppercase tracking-wider">
                    ₹2,00,000 Total Purse
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                    Dedicated cash prizes, trophies, medals, official certificates, and national ranking points for all top-performing squads.
                  </p>
                </div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard maxTilt={7} scrollOffsetY={24} className="sm:col-span-2 lg:col-span-1">
              <div className="xotc-card p-5 sm:p-6 lg:p-7 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <h3 className="font-orbitron font-black text-sm sm:text-base text-white uppercase tracking-wider">
                    Free Spectator Access
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                    Open to all university students, school robotics clubs, faculty, and tech enthusiasts. Experience live arena matches and pit-stop technical action.
                  </p>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </Parallax3DSection>
    </section>
  );
};
export default EventVoicesAndQuotes;
