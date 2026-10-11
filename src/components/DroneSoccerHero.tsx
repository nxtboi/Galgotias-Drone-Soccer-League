import React, { useState, useEffect } from 'react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import { RealDroneSoccerArena } from './RealDroneSoccerArena';

export interface DroneSoccerHeroProps {
  onRegisterClick: () => void;
  onBracketClick: () => void;
  onRulesClick: () => void;
}

export const DroneSoccerHero: React.FC<DroneSoccerHeroProps> = ({
  onRegisterClick,
  onBracketClick,
  onRulesClick,
}) => {
  // Live Tournament Countdown to Dec 02, 2026
  const [timeLeft, setTimeLeft] = useState({ days: 54, hours: 6, minutes: 15, seconds: 30 });

  useEffect(() => {
    const targetDate = new Date('2026-12-02T09:00:00+05:30').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full pt-2 sm:pt-3 pb-12 px-4 sm:px-6 lg:px-12 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Top Header Row with Event Brand & Badges - Matched heights */}
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 sm:gap-6 mt-1 sm:mt-2">
          {/* Official Circular Logo with Event Accreditation */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur-md border border-blue-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 pr-4 sm:pr-6 shadow-sm w-full lg:w-auto min-h-[72px] sm:min-h-[78px]">
            <GcdisLogo size="lg" showWordmark={false} />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  NATIONAL CHAMPIONSHIP
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="font-sans font-black text-blue-950 text-sm sm:text-base lg:text-lg leading-tight mt-0.5">
                GALGOTIAS DRONE SOCCER LEAGUE
              </h2>
              <p className="text-[10px] sm:text-[11px] text-blue-700 font-medium">
                Organized by GCDIS · Galgotias University
              </p>
            </div>
          </div>

          {/* Live Tournament Countdown Timer */}
          <div className="bg-white/95 backdrop-blur-md border border-blue-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 px-4 sm:px-6 shadow-sm flex items-center justify-between sm:justify-start gap-3 sm:gap-5 w-full lg:w-auto min-h-[72px] sm:min-h-[78px]">
            <div className="text-left">
              <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-blue-600">
                KICKOFF COUNTDOWN
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-blue-950">
                {GDSL_TOURNAMENT_INFO.dates}
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px]">
                <span className="block text-xs sm:text-sm md:text-base font-black text-blue-950 leading-none">
                  {timeLeft.days}
                </span>
                <span className="text-[7px] sm:text-[8px] font-semibold text-blue-600 uppercase">DAYS</span>
              </div>
              <span className="text-blue-400 font-black text-xs sm:text-sm">:</span>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px]">
                <span className="block text-xs sm:text-sm md:text-base font-black text-blue-950 leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[7px] sm:text-[8px] font-semibold text-blue-600 uppercase">HRS</span>
              </div>
              <span className="text-blue-400 font-black text-xs sm:text-sm">:</span>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px]">
                <span className="block text-xs sm:text-sm md:text-base font-black text-blue-950 leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[7px] sm:text-[8px] font-semibold text-blue-600 uppercase">MIN</span>
              </div>
              <span className="text-blue-400 font-black text-xs sm:text-sm">:</span>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px]">
                <span className="block text-xs sm:text-sm md:text-base font-black text-blue-950 leading-none">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[7px] sm:text-[8px] font-semibold text-blue-600 uppercase">SEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Title & Mission Statement */}
        <div className="text-center flex flex-col items-center space-y-4 max-w-4xl mx-auto pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-950 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wider border border-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span>REAL FIDA CLASS 40 &amp; 20 AERIAL E-SPORT</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-blue-950 uppercase leading-tight sm:leading-none text-balance">
            WHERE REAL ROBOTICS MEETS THE SOCCER PITCH
          </h1>

          <p className="text-sm sm:text-lg md:text-xl font-medium text-slate-700 max-w-2xl leading-relaxed">
            32 university teams. 5v5 supersonic aerial clashes. Enclosed in 40cm carbon-polycarbonate protective spheres, real pilots battle at 50 km/h in an electrified 3D netted cage arena.
          </p>

          {/* Quick CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto min-h-[46px] px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-blue-800"
            >
              <span>REGISTER SQUAD NOW</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              onClick={onBracketClick}
              className="w-full sm:w-auto min-h-[46px] px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-blue-50 text-blue-950 font-sans font-bold text-xs sm:text-sm tracking-wider uppercase shadow-sm border border-blue-200 hover:border-blue-300 transition-all flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>BRACKET &amp; FIXTURES</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                SOON
              </span>
            </button>

            <button
              onClick={onRulesClick}
              className="w-full sm:w-auto min-h-[46px] px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase border border-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <span>FIDA 5TH REVISION RULEBOOK</span>
            </button>
          </div>
        </div>

        {/* REAL DRONE SOCCER LIVE ARENA BROADCASTER (REPLACES ANIMATED MESH) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-mono text-xs font-bold text-blue-950 uppercase tracking-wider">
                LIVE ARENA BROADCAST · REAL MATCH FEEDS
              </span>
            </div>
            <span className="text-xs font-mono text-blue-700 font-semibold hidden sm:inline">
              FIDA / FAI SANCTIONED TOURNAMENT FOOTAGE
            </span>
          </div>

          <RealDroneSoccerArena
            onRegisterClick={onRegisterClick}
            onBracketClick={onBracketClick}
            onRulesClick={onRulesClick}
          />
        </div>

        {/* Bottom Bar: Key Tournament Metric Counters */}
        <div className="pt-6 border-t border-blue-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-left">
            <span className="text-[11px] sm:text-xs font-mono font-bold text-blue-800 uppercase">
              SANCTIONING BODY:
            </span>
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] sm:text-xs font-mono font-black text-blue-950">
              FIDA 5TH REVISION (OCT 2025)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-blue-200 bg-white/95 backdrop-blur-md border border-blue-200/80 rounded-2xl p-3 sm:px-5 sm:py-2.5 shadow-xs text-left w-full md:w-auto">
            <div className="pb-2.5 sm:pb-0 pr-3 sm:pr-6">
              <span className="block text-[10px] sm:text-xs font-mono font-bold text-blue-600 uppercase">TOTAL POOL</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-blue-950">{GDSL_TOURNAMENT_INFO.totalPrizePool}</span>
              <span className="block text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Trophy &amp; Cash</span>
            </div>
            <div className="pb-2.5 sm:pb-0 pl-3 sm:px-6">
              <span className="block text-[10px] sm:text-xs font-mono font-bold text-blue-600 uppercase">SLOTS</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-blue-950">32 TEAMS</span>
              <span className="block text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Collegiate</span>
            </div>
            <div className="pt-2.5 sm:pt-0 pr-3 sm:px-6">
              <span className="block text-[10px] sm:text-xs font-mono font-bold text-blue-600 uppercase">FORMAT</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-blue-950">5v5 AERIAL</span>
              <span className="block text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Skyfence</span>
            </div>
            <div className="pt-2.5 sm:pt-0 pl-3 sm:pl-6">
              <span className="block text-[10px] sm:text-xs font-mono font-bold text-blue-600 uppercase">BALL CLASS</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-blue-950">CLASS 40 &amp; 20</span>
              <span className="block text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase">Dual Tiers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DroneSoccerHero;
