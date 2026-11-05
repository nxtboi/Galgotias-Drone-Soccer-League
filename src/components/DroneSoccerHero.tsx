import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

const HERO_VIDEO_HD = '/hero-drone-soccer.mp4';
const HERO_VIDEO_MOBILE = '/hero-drone-soccer-mobile.mp4';
const HERO_POSTER = '/hero-drone-soccer-poster.jpg';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  // Default to uncropped 'contain' on mobile / tablets so the drone soccer match is 100% visible
  const [videoFit, setVideoFit] = useState<'contain' | 'cover'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'contain';
    }
    return 'cover';
  });

  // Live Tournament Countdown to Dec 08, 2026
  const [timeLeft, setTimeLeft] = useState({ days: 41, hours: 6, minutes: 15, seconds: 30 });

  useEffect(() => {
    // Clear legacy IndexedDB if present
    try {
      indexedDB.deleteDatabase('gdsl_hero_media_db');
    } catch {
      // Ignore
    }

    const video = videoRef.current;
    if (!video) return;

    // Hard-set HTML attributes and properties for cross-device mobile autoplay compatibility
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    video.setAttribute('x5-video-player-type', 'h5');

    const attemptPlay = () => {
      if (!video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser autoplay restricted (e.g. iOS low-power mode or user gesture requirement)
            setIsPlaying(false);
          });
      }
    };

    attemptPlay();

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      video.currentTime = 0;
      attemptPlay();
    };
    const onCanPlay = () => {
      if (video.paused) {
        attemptPlay();
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('canplay', onCanPlay);

    // Global listener on first user interaction to unlock autoplay on restricted mobile devices (iOS/Android)
    const handleFirstGesture = () => {
      if (video && video.paused) {
        attemptPlay();
      }
    };

    window.addEventListener('touchstart', handleFirstGesture, { passive: true, once: true });
    window.addEventListener('click', handleFirstGesture, { passive: true, once: true });
    window.addEventListener('scroll', handleFirstGesture, { passive: true, once: true });

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        attemptPlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('canplay', onCanPlay);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().catch(() => {});
    }
  };

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
        {/* XOTC Chamfered Technical Hero Frame - Uncropped on Mobile, Fully Responsive across screen sizes */}
        <div
          onClick={() => {
            if (videoRef.current?.paused) togglePlay();
          }}
          className="relative w-full flex-1 min-h-[440px] sm:min-h-[500px] md:min-h-[580px] lg:min-h-[calc(100dvh-5.25rem)] border border-white/25 bg-[#0b0d09] p-3 sm:p-5 md:p-7 lg:p-9 xl:p-12 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-all"
        >
          {/* Cross-Device Video Player - Uncropped on Mobile, Faststart, Web-Optimized, Looping */}
          <div className="absolute inset-0 w-full h-full overflow-hidden select-none flex items-center justify-center bg-[#090b07]">
            {/* Subtle background arena grid pattern for letterbox zones */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d0fe1d_1px,transparent_1px)] [background-size:20px_20px]" />

            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={HERO_POSTER}
              disablePictureInPicture
              disableRemotePlayback
              controls={false}
              className={`w-full h-full object-center pointer-events-none transition-all duration-300 ${
                videoFit === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            >
              {/* High-speed mobile 720p faststart stream for phones & tablets */}
              <source src={HERO_VIDEO_MOBILE} type="video/mp4" media="(max-width: 768px)" />
              {/* Full 1080p faststart stream for desktop */}
              <source src={HERO_VIDEO_HD} type="video/mp4" />
            </video>

            {/* Subtle atmospheric vignette gradient overlay for clean contrast without dimming center video */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/65 pointer-events-none" />
          </div>

          {/* Top-Left & Top-Right Corner Accent Lines */}
          <div className="absolute top-0 left-0 w-8 sm:w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 left-0 w-[2px] h-8 sm:h-16 bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-8 sm:w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-[2px] h-8 sm:h-16 bg-[#d0fe1d]" />

          {/* Bottom-Left Vertical Dot Matrix Pattern */}
          <div
            className="hidden sm:block absolute bottom-6 left-3 w-4 h-24 xotc-dots opacity-75 pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Bar Accreditation & Live Countdown */}
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-2.5 sm:gap-3.5 pb-3.5 sm:pb-5 border-b border-white/20">
            <div className="flex items-center gap-2.5 sm:gap-3.5 bg-black/75 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 border border-white/20 shadow-xl self-stretch min-h-[68px] sm:min-h-[74px]">
              <GcdisLogo
                size="sm"
                showWordmark={false}
                logoSrc="/assets/aistudio/Galgotias-University-Logo_6fa7e960.jpg"
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
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 bg-black/75 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-2 sm:py-2.5 w-full lg:w-auto shadow-xl self-stretch min-h-[68px] sm:min-h-[74px]">
              <div className="text-left">
                <div className="text-xs sm:text-sm md:text-base xl:text-lg font-rajdhani font-bold tracking-[0.18em] sm:tracking-[0.2em] uppercase text-[#d0fe1d] leading-tight">
                  KICKOFF COUNTDOWN
                </div>
                <div className="text-xs sm:text-sm md:text-base xl:text-lg font-mono text-neutral-300 leading-tight">
                  {GDSL_TOURNAMENT_INFO.dates}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 font-orbitron tabular-nums text-center">
                <div className="bg-[#1a1d17] border border-white/15 px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px] md:min-w-[46px] xl:min-w-[50px]">
                  <span className="block text-xs sm:text-sm md:text-base xl:text-lg font-black text-[#d0fe1d] leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">DAYS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs sm:text-sm md:text-base xl:text-lg">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px] md:min-w-[46px] xl:min-w-[50px]">
                  <span className="block text-xs sm:text-sm md:text-base xl:text-lg font-black text-white leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">HRS</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs sm:text-sm md:text-base xl:text-lg">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px] md:min-w-[46px] xl:min-w-[50px]">
                  <span className="block text-xs sm:text-sm md:text-base xl:text-lg font-black text-white leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">MIN</span>
                </div>
                <span className="text-[#d0fe1d] font-black text-xs sm:text-sm md:text-base xl:text-lg">:</span>
                <div className="bg-[#1a1d17] border border-white/15 px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[42px] md:min-w-[46px] xl:min-w-[50px]">
                  <span className="block text-xs sm:text-sm md:text-base xl:text-lg font-black text-[#d0fe1d] leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls & Video Playback Hub */}
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

            {/* Mute / Unmute Button */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 sm:p-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-neutral-300 hover:text-white hover:border-[#d0fe1d]/60 hover:bg-black transition-all cursor-pointer shadow-lg flex items-center justify-center group"
              title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
              aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#d0fe1d]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DroneSoccerHero;
