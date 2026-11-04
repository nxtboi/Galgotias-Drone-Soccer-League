import React, { useState, useEffect, useRef } from 'react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import { GALGOTIAS_UNIVERSITY_LOGO_DATA_URL, getHeroVideoBlobUrl } from '../data/logoAssets';

const HERO_VIDEO_SOURCE = '/assets/aistudio/hero-drone-soccer_0e9cca22.mp4';

export interface DroneSoccerHeroProps {
  onRegisterClick: () => void;
  onBracketClick: () => void;
  onRulesClick: () => void;
  onPracticeClick?: () => void;
  onShareClick?: () => void;
}

export const DroneSoccerHero: React.FC<DroneSoccerHeroProps> = ({
  onRegisterClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>(() => getHeroVideoBlobUrl());

  // Live Tournament Countdown to Dec 08, 2026
  const [timeLeft, setTimeLeft] = useState({ days: 41, hours: 6, minutes: 15, seconds: 30 });

  const handleVideoError = () => {
    const blobUrl = getHeroVideoBlobUrl();
    if (blobUrl && blobUrl !== videoSrc) {
      setVideoSrc(blobUrl);
    }
  };

  useEffect(() => {
    // Clear any legacy IndexedDB database
    try {
      indexedDB.deleteDatabase('gdsl_hero_media_db');
    } catch {
      // Ignore
    }

    const vid = videoRef.current;
    if (vid) {
      vid.defaultMuted = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.load();
      vid.play().catch(() => {});
    }
  }, [videoSrc]);

  useEffect(() => {
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

  const handleScrollToPrizePool = () => {
    const el = document.getElementById('prize-pool');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative w-full flex-1 flex flex-col pt-1.5 sm:pt-2 pb-3 sm:pb-5 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-white">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] flex-1 flex flex-col mx-auto">
        {/* XOTC Chamfered Technical Hero Frame - Responsive aspect & height across screen sizes */}
        <div
          className="relative w-full flex-1 min-h-[420px] sm:min-h-[520px] md:min-h-[600px] lg:min-h-[calc(100dvh-5.25rem)] border border-white/25 bg-black p-3.5 sm:p-5 md:p-7 lg:p-9 xl:p-12 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.75)] flex flex-col justify-between transition-all"
        >
          {/* Max Quality Drone Soccer Video - Seamless Continuous Looping, No Controls, No Reloading */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none">
            <video
              key={videoSrc}
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              controls={false}
              onError={handleVideoError}
              onCanPlay={(e) => {
                e.currentTarget.muted = true;
                e.currentTarget.play().catch(() => {});
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
            >
              <source src={videoSrc} type="video/mp4" onError={handleVideoError} />
            </video>
          </div>


          {/* Top-Left & Top-Right Corner Accent Lines */}
          <div className="absolute top-0 left-0 w-10 sm:w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 left-0 w-[2px] h-10 sm:h-16 bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-10 sm:w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-[2px] h-10 sm:h-16 bg-[#d0fe1d]" />

          {/* Bottom-Left Vertical Dot Matrix Pattern */}
          <div
            className="hidden sm:block absolute bottom-6 left-3 w-4 h-24 xotc-dots opacity-75 pointer-events-none"
            aria-hidden="true"
          />

          {/* Bottom-Right Glowing Acid-Lime Crosshair Reticle */}
          <div
            className="hidden sm:flex absolute bottom-5 right-5 items-center justify-center w-8 h-8 pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Bar Accreditation & Live Countdown */}
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3.5 pb-3.5 sm:pb-5 border-b border-white/20">
            <div className="flex items-center gap-2.5 sm:gap-3.5 bg-black/65 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 border border-white/15 shadow-xl">
              <GcdisLogo
                size="sm"
                showWordmark={false}
                logoSrc={GALGOTIAS_UNIVERSITY_LOGO_DATA_URL}
                logoAlt="Galgotias University Official Logo"
              />
              <div className="text-left min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-rajdhani font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#d0fe1d]">
                  <span>NATIONAL CHAMPIONSHIP</span>
                  <span aria-hidden="true">·</span>
                  <span>Class 40 &amp; 20</span>
                </div>
                <h2 className="font-orbitron font-black text-white text-xs sm:text-sm md:text-base xl:text-lg tracking-wider uppercase mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate">
                  GALGOTIAS DRONE SOCCER LEAGUE
                </h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-300 font-rajdhani tracking-wider uppercase truncate">
                  Organized by GCDIS · Galgotias University · {GDSL_TOURNAMENT_INFO.dates}
                </p>
              </div>
            </div>

            {/* Live Tournament Countdown Timer */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 bg-black/70 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-2 sm:py-2.5 w-full lg:w-auto shadow-xl">
              <div className="text-left">
                <div className="text-[9px] sm:text-[10px] font-rajdhani font-bold tracking-[0.2em] uppercase text-[#d0fe1d]">
                  KICKOFF COUNTDOWN
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-neutral-300">
                  {GDSL_TOURNAMENT_INFO.dates}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 font-orbitron tabular-nums text-center">
                <div className="bg-[#1a1d17] border border-white/15 px-1.5 sm:px-2.5 py-1 min-w-[34px] sm:min-w-[40px]">
                  <span className="block text-xs sm:text-sm font-black text-[#d0fe1d] leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">DAYS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-1.5 sm:px-2.5 py-1 min-w-[34px] sm:min-w-[40px]">
                  <span className="block text-xs sm:text-sm font-black text-white leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">HRS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-1.5 sm:px-2.5 py-1 min-w-[34px] sm:min-w-[40px]">
                  <span className="block text-xs sm:text-sm font-black text-white leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">MIN</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-1.5 sm:px-2.5 py-1 min-w-[34px] sm:min-w-[40px]">
                  <span className="block text-xs sm:text-sm font-black text-[#d0fe1d] leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[7px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="flex flex-col xs:flex-row sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={onRegisterClick}
                className="xotc-btn-lime min-h-[42px] sm:min-h-[46px] px-5 sm:px-8 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_20px_rgba(208,254,29,0.35)]"
              >
                <span>REGISTER SQUAD NOW</span>
                <span>→</span>
              </button>

              <button
                onClick={handleScrollToPrizePool}
                className="xotc-btn-glow min-h-[42px] sm:min-h-[46px] px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-orbitron font-extrabold uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 group"
                title="View ₹2,00,000 Championship Prize Pool Breakdown"
              >
                <span className="text-base sm:text-lg drop-shadow-[0_0_12px_rgba(255,215,0,0.9)] animate-pulse">🏆</span>
                <span className="font-black text-[#d0fe1d] group-hover:text-black drop-shadow-[0_0_14px_rgba(208,254,29,0.9)] tracking-wider">
                  ₹2,00,000 PRIZE POOL
                </span>
                <span className="text-xs font-bold text-white group-hover:text-black drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform group-hover:translate-y-0.5">↓</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DroneSoccerHero;
