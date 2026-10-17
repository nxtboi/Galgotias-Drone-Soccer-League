import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Award, ChevronLeft, ChevronRight, ShieldCheck, Ticket } from 'lucide-react';

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
}

export const EVENT_QUOTES: TestimonialQuote[] = [
  {
    id: '1',
    quote: "Galgotias Drone Soccer League is engineered to push the boundaries of young mind robotics, high-speed telemetry, and tactical teamwork. It is where classroom engineering translates into real stadium glory.",
    author: "GCDIS Secretariat & League Leadership",
    role: "Patron & Event Organizer",
    organization: "Galgotias Centre for Drone Intelligence & Simulation",
    category: "LEADERSHIP KEYNOTE"
  },
  {
    id: '2',
    quote: "Inside the 16-meter ballistic netting cage at 50 km/h, there are no second chances. Every 10-millisecond RC radio command and carbon sphere collision test pilot instincts to their absolute limit.",
    author: "FIDA Senior Technical Delegate",
    role: "Head of Technical Scrutineering",
    organization: "FIDA International Drone Soccer Standards",
    category: "TECHNICAL DELEGATE"
  },
  {
    id: '3',
    quote: "When 10 caged drones clash simultaneously in mid-air at 12,000 RPM and the illuminated goal hoop flashes red, the energy in the arena is electric. This is true 3D aerial soccer.",
    author: "Captain A. Sharma",
    role: "Reigning Striker Pilot",
    organization: "Delhi NCR Flight Squad (GDSL Finalist)",
    category: "SQUAD CAPTAIN"
  },
  {
    id: '4',
    quote: "A groundbreaking national championship elevating student engineers into high-speed e-sports athletes. GDSL 2026 sets the standard for university robotics competitions nationwide.",
    author: "National Tech & Robotics Journal",
    role: "Featured Press Review",
    organization: "Tech & Aerospace India (Oct 2026 Issue)",
    category: "MEDIA ENDORSEMENT"
  }
];

export const EventVoicesAndQuotes: React.FC<EventVoicesAndQuotesProps> = ({
  onRegisterClick,
  onShareClick,
}) => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const handleNext = () => {
    setActiveQuoteIndex((prev) => (prev + 1) % EVENT_QUOTES.length);
  };

  const handlePrev = () => {
    setActiveQuoteIndex((prev) => (prev - 1 + EVENT_QUOTES.length) % EVENT_QUOTES.length);
  };

  const currentQuote = EVENT_QUOTES[activeQuoteIndex];

  return (
    <section className="relative z-20 w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#141612] text-white overflow-hidden border-y border-white/15">
      <div className="max-w-7xl mx-auto space-y-14 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
            CHAMPIONSHIP VOICES &amp; ENDORSEMENTS
          </span>

          <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
            VOICES OF THE <span className="text-[#d0fe1d]">LEAGUE</span>
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Statements from tournament organizers, FIDA technical scrutineers, team captains, and press correspondents.
          </p>
        </div>

        {/* Featured Interactive Quote Card (XOTC Chamfered Frame) */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[#111210] border border-[#d0fe1d]/40 p-6 sm:p-10 md:p-12 shadow-[0_0_40px_rgba(208,254,29,0.08)] text-left overflow-hidden">
            <Quote className="absolute top-6 right-6 w-20 h-20 text-[#d0fe1d]/10 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#d0fe1d]">
                    {currentQuote.category}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    0{activeQuoteIndex + 1} / 0{EVENT_QUOTES.length}
                  </span>
                </div>

                <blockquote className="text-lg sm:text-2xl md:text-3xl font-sans font-bold leading-relaxed text-white">
                  &ldquo;{currentQuote.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4 pt-4 border-t border-white/15">
                  <div className="w-11 h-11 xotc-icon-box flex items-center justify-center font-orbitron font-black text-sm shrink-0">
                    0{activeQuoteIndex + 1}
                  </div>
                  <div>
                    <div className="font-orbitron font-black text-sm sm:text-base text-white uppercase tracking-wider">
                      {currentQuote.author}
                    </div>
                    <div className="text-xs font-mono text-[#d0fe1d]">
                      {currentQuote.role} · <span className="text-neutral-400">{currentQuote.organization}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                {EVENT_QUOTES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQuoteIndex(idx)}
                    className={`h-1.5 transition-all cursor-pointer ${
                      activeQuoteIndex === idx ? 'w-8 bg-[#d0fe1d]' : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                    aria-label={`Jump to quote ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 bg-[#171915] hover:border-[#d0fe1d] text-white hover:text-[#d0fe1d] transition-colors cursor-pointer border border-white/20"
                  aria-label="Previous quote"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 bg-[#171915] hover:border-[#d0fe1d] text-white hover:text-[#d0fe1d] transition-colors cursor-pointer border border-white/20"
                  aria-label="Next quote"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Pillar Event Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-left">
          <div className="xotc-card p-6">
            <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-black text-base text-white uppercase tracking-wider">
              FAI/FIDA Class Regulations
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Full adherence to international 5th Revision standards for 400mm and 200mm protective sphere multirotors, fail-safe cutoffs, and frequency hopping.
            </p>
          </div>

          <div className="xotc-card p-6">
            <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-black text-base text-white uppercase tracking-wider">
              ₹1,00,000 Total Purse
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Dedicated cash prizes, custom gold &amp; silver trophies, official flight certificates, and national ranking points for all top-performing squads.
            </p>
          </div>

          <div className="xotc-card p-6">
            <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-black text-base text-white uppercase tracking-wider">
              Free Spectator Access
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Open to all university students, school robotics clubs, faculty, and tech enthusiasts. Experience live arena matches and pit-stop technical action.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default EventVoicesAndQuotes;
