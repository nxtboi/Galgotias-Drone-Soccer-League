import React, { useState, useEffect, useRef } from 'react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Live Tournament Countdown to Dec 08, 2026
  const [timeLeft, setTimeLeft] = useState({ days: 41, hours: 6, minutes: 15, seconds: 30 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay handled by browser policies
      });
    }

    const targetDate = new Date('2026-12-08T09:00:00+05:30').getTime();

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
    <div className="relative w-full pt-1 sm:pt-2 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-12 text-white">
      <div className="max-w-7xl mx-auto">
        {/* XOTC Chamfered Technical Hero Frame - Dynamically scaled to screen size */}
        <div className="relative w-full min-h-[580px] sm:min-h-[660px] md:min-h-[720px] lg:min-h-[calc(100vh-6.5rem)] max-h-[960px] border border-white/25 bg-black/40 backdrop-blur-[2px] p-4 sm:p-7 lg:p-10 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.75)] flex flex-col justify-between">
          {/* Looping Hero Background Video - Highly Visible */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <video
              ref={videoRef}
              src="/assets/aistudio/gemini_generated_video_da0879cf_97babbf2.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center opacity-85 sm:opacity-90 filter brightness-100 contrast-105"
            />
            {/* Soft gradient scrims for text readability without obscuring arena action */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/15 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Top-Left & Top-Right Corner Accent Lines */}
          <div className="absolute top-0 left-0 w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 left-0 w-[2px] h-16 bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-[2px] h-16 bg-[#d0fe1d]" />

          {/* Bottom-Left Vertical Dot Matrix Pattern */}
          <div
            className="hidden sm:block absolute bottom-6 left-3 w-4 h-24 xotc-dots opacity-75 pointer-events-none"
            aria-hidden="true"
          />

          {/* Bottom-Right Glowing Acid-Lime Crosshair Reticle */}
          <div
            className="hidden sm:flex absolute bottom-5 right-5 items-center justify-center w-8 h-8 pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-4 h-4 rounded-full border border-[#d0fe1d]/80" />
            <div className="absolute w-8 h-[1px] bg-[#d0fe1d]/80" />
            <div className="absolute h-8 w-[1px] bg-[#d0fe1d]/80" />
          </div>

          {/* Ambient Acid-Lime Vertical Light Pillar */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-96 bg-gradient-to-b from-[#d0fe1d]/25 via-[#d0fe1d]/5 to-transparent blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Bar Accreditation & Live Countdown - Compact */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/15">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm px-3 py-1.5 border border-white/10">
              <GcdisLogo size="sm" showWordmark={false} />
              <div className="text-left">
                <div className="flex items-center gap-2 text-[11px] font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  <span>NATIONAL CHAMPIONSHIP</span>
                  <span aria-hidden="true">·</span>
                  <span>Class 40 &amp; 20</span>
                </div>
                <h2 className="font-orbitron font-black text-white text-xs sm:text-sm lg:text-base tracking-wider uppercase mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  GALGOTIAS DRONE SOCCER LEAGUE
                </h2>
                <p className="text-[11px] text-neutral-300 font-rajdhani tracking-wider uppercase">
                  Organized by GCDIS · Galgotias University · {GDSL_TOURNAMENT_INFO.dates}
                </p>
              </div>
            </div>

            {/* Live Tournament Countdown Timer - Compact */}
            <div className="flex flex-wrap items-center gap-3 bg-[#111210]/95 backdrop-blur-md border border-white/20 px-3 py-2 w-full lg:w-auto justify-between sm:justify-start shadow-xl">
              <div className="text-left">
                <div className="text-[9px] font-rajdhani font-bold tracking-[0.2em] uppercase text-[#d0fe1d]">
                  KICKOFF COUNTDOWN
                </div>
                <div className="text-[11px] font-mono text-neutral-300">
                  {GDSL_TOURNAMENT_INFO.dates}
                </div>
              </div>
              <div className="flex items-center gap-1.5 font-orbitron tabular-nums text-center">
                <div className="bg-[#1a1d17] border border-white/15 px-2 py-1 min-w-[38px]">
                  <span className="block text-xs sm:text-sm font-black text-[#d0fe1d] leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">DAYS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2 py-1 min-w-[38px]">
                  <span className="block text-xs sm:text-sm font-black text-white leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">HRS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2 py-1 min-w-[38px]">
                  <span className="block text-xs sm:text-sm font-black text-white leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">MIN</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2 py-1 min-w-[38px]">
                  <span className="block text-xs sm:text-sm font-black text-[#d0fe1d] leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Main Title & Mission Statement - Reduced Vertical Height */}
          <div className="relative z-10 py-4 sm:py-6 max-w-4xl text-left space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-rajdhani font-bold tracking-[0.22em] uppercase text-[#d0fe1d] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="w-1.5 h-1.5 bg-[#d0fe1d] inline-block shadow-[0_0_8px_#d0fe1d]" />
              <span>REAL FIDA CLASS 40 &amp; 20 AERIAL E-SPORT · GALGOTIAS INDOOR ARENA</span>
            </div>

            <h1 className="font-orbitron font-black text-2xl sm:text-4xl md:text-5xl lg:text-[46px] tracking-wider text-white uppercase leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              WHERE REAL ROBOTICS MEETS THE <span className="text-[#d0fe1d]">SOCCER PITCH</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base font-sans text-neutral-100 max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              32 university teams. 5v5 supersonic aerial clashes. Enclosed in 40cm carbon-polycarbonate protective spheres, real pilots battle at 50 km/h in an electrified 3D netted cage arena.
            </p>

            {/* XOTC Chamfered Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={onRegisterClick}
                className="xotc-btn-lime min-h-[42px] px-6 sm:px-8 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>REGISTER SQUAD NOW</span>
                <span>→</span>
              </button>

              <button
                onClick={onRulesClick}
                className="xotc-btn-outline min-h-[42px] px-4 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>FIDA 5TH REVISION RULEBOOK</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DroneSoccerHero;
