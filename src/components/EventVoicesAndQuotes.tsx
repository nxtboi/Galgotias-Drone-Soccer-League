import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Award, Sparkles, ChevronLeft, ChevronRight, Volume2, ShieldCheck, Newspaper, Ticket } from 'lucide-react';

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
  avatar: string;
  category: 'Leadership' | 'Technical' | 'Pilot' | 'Media';
  badgeColor: string;
}

export const EVENT_QUOTES: TestimonialQuote[] = [
  {
    id: '1',
    quote: "Galgotias Drone Soccer League is engineered to push the boundaries of young mind robotics, high-speed telemetry, and tactical teamwork. It is where classroom engineering translates into real stadium glory.",
    author: "GCDIS Secretariat & League Leadership",
    role: "Patron & Event Organizer",
    organization: "Galgotias Centre for Drone Intelligence & Simulation",
    avatar: "🏆",
    category: "Leadership",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300"
  },
  {
    id: '2',
    quote: "Inside the 16-meter ballistic netting cage at 50 km/h, there are no second chances. Every 10-millisecond RC radio command and carbon sphere collision test pilot instincts to their absolute limit.",
    author: "FIDA Senior Technical Delegate",
    role: "Head of Technical Scrutineering",
    organization: "FIDA International Drone Soccer Standards",
    avatar: "🛡️",
    category: "Technical",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300"
  },
  {
    id: '3',
    quote: "When 10 caged drones clash simultaneously in mid-air at 12,000 RPM and the illuminated goal hoop flashes red, the energy in the arena is electric. This is true 3D aerial soccer.",
    author: "Captain A. Sharma",
    role: "Reigning Striker Pilot",
    organization: "Delhi NCR Flight Squad (GDSL Finalist)",
    avatar: "⚡",
    category: "Pilot",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300"
  },
  {
    id: '4',
    quote: "A groundbreaking national championship elevating student engineers into high-speed e-sports athletes. GDSL 2026 sets the standard for university robotics competitions nationwide.",
    author: "National Tech & Robotics Journal",
    role: "Featured Press Review",
    organization: "Tech & Aerospace India (Oct 2026 Issue)",
    avatar: "📰",
    category: "Media",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300"
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
    <section className="relative z-20 w-full py-16 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white overflow-hidden border-y border-blue-800/80 shadow-2xl">
      {/* Background Decorative Mesh & Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/80 border border-blue-600 text-blue-200 text-xs font-mono font-bold uppercase tracking-widest">
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            <span>CHAMPIONSHIP VOICES &amp; ENDORSEMENTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-sans font-black text-white uppercase tracking-tight">
            WHAT LEADERS &amp; PILOTS SAY ABOUT GDSL
          </h2>

          <p className="text-blue-200/90 text-sm sm:text-base leading-relaxed">
            Inspirational statements from tournament organizers, FIDA technical scrutineers, team captains, and press correspondents.
          </p>
        </div>

        {/* Featured Interactive Quote Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl text-left overflow-hidden">
            <Quote className="absolute top-6 right-6 w-20 h-20 text-white/5 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider border ${currentQuote.badgeColor}`}>
                    {currentQuote.category} KEYNOTE
                  </span>
                  <span className="text-xs font-mono text-blue-300">
                    Quote {activeQuoteIndex + 1} of {EVENT_QUOTES.length}
                  </span>
                </div>

                <blockquote className="text-lg sm:text-2xl md:text-3xl font-sans font-bold leading-relaxed text-white italic">
                  &ldquo;{currentQuote.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4 pt-4 border-t border-white/15">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {currentQuote.avatar}
                  </div>
                  <div>
                    <div className="font-sans font-black text-base sm:text-lg text-white uppercase tracking-tight">
                      {currentQuote.author}
                    </div>
                    <div className="text-xs sm:text-sm text-sky-300 font-semibold">
                      {currentQuote.role} · <span className="text-blue-200">{currentQuote.organization}</span>
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
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeQuoteIndex === idx ? 'w-8 bg-sky-400' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Jump to quote ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
                  aria-label="Previous quote"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
                  aria-label="Next quote"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Pillar Event Value Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-900/80 border border-blue-700 flex items-center justify-center text-blue-300 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-black text-lg text-white uppercase">
              FAI/FIDA Class Regulations
            </h3>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Full adherence to international 5th Revision standards for 400mm and 200mm protective sphere multirotors, fail-safe cutoffs, and frequency hopping.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-700 flex items-center justify-center text-amber-300 mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-black text-lg text-white uppercase">
              ₹1,00,000 Total Purse
            </h3>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Dedicated cash prizes, custom gold &amp; silver trophies, official flight certificates, and national ranking points for all top-performing squads.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-300 mb-4">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-black text-lg text-white uppercase">
              Free Spectator Access
            </h3>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Open to all university students, school robotics clubs, faculty, and tech enthusiasts. Experience live arena matches and pit-stop technical action!
            </p>
          </div>
        </div>

        {/* Action Callout Strip */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-2xl p-6 sm:p-8 border border-blue-700/80 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-300 uppercase">JOIN THE EVENT MOVEMENT</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-sans font-black text-white uppercase mt-1">
              Be Part of India&apos;s National Drone Soccer Championship
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Register your university squad or share event details with your tech network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            {onRegisterClick && (
              <button
                onClick={onRegisterClick}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-sans font-black text-xs uppercase tracking-wider shadow-lg transition-all text-center cursor-pointer"
              >
                Register Squad Now →
              </button>
            )}

            {onShareClick && (
              <button
                onClick={onShareClick}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans font-bold text-xs uppercase tracking-wider border border-white/20 transition-all text-center cursor-pointer"
              >
                📢 Share Event
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default EventVoicesAndQuotes;
