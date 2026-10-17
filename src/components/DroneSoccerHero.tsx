import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import { RealDroneSoccerArena } from './RealDroneSoccerArena';

export interface DroneSoccerHeroProps {
  onRegisterClick: () => void;
  onBracketClick: () => void;
  onRulesClick: () => void;
  onPracticeClick?: () => void;
  onShareClick?: () => void;
}

export const DroneSoccerHero: React.FC<DroneSoccerHeroProps> = ({
  onRegisterClick,
  onBracketClick,
  onRulesClick,
  onPracticeClick,
  onShareClick,
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
    <div className="relative w-full pt-4 sm:pt-6 pb-16 px-4 sm:px-6 lg:px-12 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* XOTC Chamfered Technical Hero Frame */}
        <div className="relative border border-white/25 bg-[#141612]/80 backdrop-blur-md p-5 sm:p-8 lg:p-12 overflow-hidden">
          {/* Top-Left & Top-Right Corner Accent Lines */}
          <div className="absolute top-0 left-0 w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 left-0 w-[2px] h-16 bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-[2px] h-16 bg-[#d0fe1d]" />

          {/* Bottom-Left Vertical Dot Matrix Pattern (from XOTC reference) */}
          <div
            className="hidden sm:block absolute bottom-6 left-3 w-4 h-24 xotc-dots opacity-75 pointer-events-none"
            aria-hidden="true"
          />

          {/* Bottom-Right Glowing Acid-Lime Crosshair Reticle (from XOTC reference) */}
          <div
            className="hidden sm:flex absolute bottom-5 right-5 items-center justify-center w-8 h-8 pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-4 h-4 rounded-full border border-[#d0fe1d]/80" />
            <div className="absolute w-8 h-[1px] bg-[#d0fe1d]/80" />
            <div className="absolute h-8 w-[1px] bg-[#d0fe1d]/80" />
          </div>

          {/* Ambient Acid-Lime Vertical Light Pillar (inspired by XOTC hero beam) */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-96 bg-gradient-to-b from-[#d0fe1d]/25 via-[#d0fe1d]/5 to-transparent blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Bar: Accreditation & Live Countdown */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-8 border-b border-white/15">
            <div className="flex items-center gap-3.5">
              <GcdisLogo size="md" showWordmark={false} />
              <div className="text-left">
                <div className="flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  <span>NATIONAL CHAMPIONSHIP</span>
                  <span aria-hidden="true">·</span>
                  <span>FIDA CLASS 40 &amp; 20</span>
                </div>
                <h2 className="font-orbitron font-black text-white text-sm sm:text-base lg:text-lg tracking-wider uppercase mt-0.5">
                  GALGOTIAS DRONE SOCCER LEAGUE
                </h2>
                <p className="text-xs text-neutral-400 font-rajdhani tracking-wider uppercase">
                  Organized by GCDIS · Galgotias University · {GDSL_TOURNAMENT_INFO.dates}
                </p>
              </div>
            </div>

            {/* Live Tournament Countdown Timer */}
            <div className="flex flex-wrap items-center gap-4 bg-[#111210] border border-white/15 px-4 py-2.5 w-full lg:w-auto justify-between sm:justify-start">
              <div className="text-left">
                <div className="text-[10px] font-rajdhani font-bold tracking-[0.2em] uppercase text-[#d0fe1d]">
                  KICKOFF COUNTDOWN
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  {GDSL_TOURNAMENT_INFO.dates}
                </div>
              </div>
              <div className="flex items-center gap-2 font-orbitron tabular-nums text-center">
                <div className="bg-[#1a1d17] border border-white/15 px-2.5 py-1.5 min-w-[44px]">
                  <span className="block text-sm sm:text-base font-black text-[#d0fe1d] leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="text-[8px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">DAYS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2.5 py-1.5 min-w-[44px]">
                  <span className="block text-sm sm:text-base font-black text-white leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">HRS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2.5 py-1.5 min-w-[44px]">
                  <span className="block text-sm sm:text-base font-black text-white leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">MIN</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2.5 py-1.5 min-w-[44px]">
                  <span className="block text-sm sm:text-base font-black text-[#d0fe1d] leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Main Title & Mission Statement (XOTC Left-Aligned Wide Display Aesthetic) */}
          <div className="relative z-10 py-8 sm:py-12 max-w-5xl text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 text-xs font-rajdhani font-bold tracking-[0.22em] uppercase text-[#d0fe1d]"
            >
              <span className="w-2 h-2 bg-[#d0fe1d] inline-block shadow-[0_0_8px_#d0fe1d]" />
              <span>REAL FIDA CLASS 40 &amp; 20 AERIAL E-SPORT · GALGOTIAS INDOOR ARENA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
              className="font-orbitron font-black text-3xl sm:text-5xl md:text-6xl lg:text-[64px] tracking-wider text-white uppercase leading-[1.06]"
            >
              WHERE REAL ROBOTICS MEETS THE <span className="text-[#d0fe1d]">SOCCER PITCH</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
              className="text-sm sm:text-base md:text-lg font-sans text-neutral-300 max-w-2xl leading-relaxed"
            >
              32 university teams. 5v5 supersonic aerial clashes. Enclosed in 40cm carbon-polycarbonate protective spheres, real pilots battle at 50 km/h in an electrified 3D netted cage arena.
            </motion.p>

            {/* XOTC Chamfered Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24, ease: 'easeOut' }}
              className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <button
                onClick={onRegisterClick}
                className="xotc-btn-lime min-h-[48px] px-7 sm:px-9 py-3.5 text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>REGISTER SQUAD NOW</span>
                <span>→</span>
              </button>

              {onPracticeClick && (
                <button
                  onClick={onPracticeClick}
                  className="xotc-btn-outline min-h-[48px] px-6 py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer border-[#d0fe1d]/50 text-[#d0fe1d]"
                >
                  <span>3D PRACTICE ARENA</span>
                </button>
              )}

              <button
                onClick={onBracketClick}
                className="xotc-btn-outline min-h-[48px] px-6 py-3.5 text-xs flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>BRACKET &amp; FIXTURES</span>
              </button>

              <button
                onClick={onRulesClick}
                className="xotc-btn-outline min-h-[48px] px-5 py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>FIDA 5TH REVISION RULEBOOK</span>
              </button>

              {onShareClick && (
                <button
                  onClick={onShareClick}
                  className="xotc-btn-outline min-h-[48px] px-5 py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SHARE EVENT</span>
                </button>
              )}
            </motion.div>
          </div>

          {/* REAL DRONE SOCCER LIVE ARENA BROADCASTER */}
          <div className="relative z-10 pt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d0fe1d] animate-ping" />
                <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.2em]">
                  LIVE ARENA BROADCAST · REAL MATCH FEEDS
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
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
          <div className="relative z-10 mt-8 pt-6 border-t border-white/15 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-left">
              <span className="text-xs font-rajdhani font-bold text-neutral-400 uppercase tracking-widest">
                SANCTIONING BODY:
              </span>
              <span className="text-xs font-orbitron font-bold text-[#d0fe1d] uppercase tracking-wider">
                FIDA 5TH REVISION (OCT 2025)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/15 bg-[#111210] border border-white/15 p-3 sm:px-6 sm:py-3 text-left">
              <div className="pb-2.5 sm:pb-0 pr-4 sm:pr-6">
                <span className="block text-[10px] font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-widest">TOTAL POOL</span>
                <span className="font-orbitron text-sm sm:text-base md:text-lg font-black text-white">{GDSL_TOURNAMENT_INFO.totalPrizePool}</span>
                <span className="block text-[10px] font-mono text-neutral-400 uppercase">Trophy &amp; Cash</span>
              </div>
              <div className="pb-2.5 sm:pb-0 pl-4 sm:px-6">
                <span className="block text-[10px] font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-widest">SLOTS</span>
                <span className="font-orbitron text-sm sm:text-base md:text-lg font-black text-white">32 TEAMS</span>
                <span className="block text-[10px] font-mono text-neutral-400 uppercase">Collegiate</span>
              </div>
              <div className="pt-2.5 sm:pt-0 pr-4 sm:px-6">
                <span className="block text-[10px] font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-widest">FORMAT</span>
                <span className="font-orbitron text-sm sm:text-base md:text-lg font-black text-white">5v5 AERIAL</span>
                <span className="block text-[10px] font-mono text-neutral-400 uppercase">Skyfence</span>
              </div>
              <div className="pt-2.5 sm:pt-0 pl-4 sm:pl-6">
                <span className="block text-[10px] font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-widest">BALL CLASS</span>
                <span className="font-orbitron text-sm sm:text-base md:text-lg font-black text-white">CLASS 40 &amp; 20</span>
                <span className="block text-[10px] font-mono text-neutral-400 uppercase">Dual Tiers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DroneSoccerHero;
