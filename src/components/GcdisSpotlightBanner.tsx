import React from 'react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

export interface GcdisSpotlightBannerProps {
  onNavigate: (page: string) => void;
}

export const GcdisSpotlightBanner: React.FC<GcdisSpotlightBannerProps> = ({ onNavigate }) => {
  const handleJump = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative z-20 w-full px-4 sm:px-8 lg:px-16 my-16 space-y-12 pointer-events-auto text-slate-900">
      {/* Banner 1: Call for Teams */}
      <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-950 text-white p-8 md:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-blue-400/30">
        <div className="flex items-center gap-6 text-left">
          <GcdisLogo size="lg" showWordmark={false} />
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-800/80 border border-blue-600 text-sky-300 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL INVITATION · INTERCOLLEGIATE CUP</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-sans font-black tracking-tight uppercase text-white">
              REGISTER YOUR DRONE SOCCER SQUAD
            </h3>
            <p className="text-sm text-blue-200 max-w-xl font-medium leading-relaxed">
              32 team slots. Class 20 &amp; Class 40 divisions. FAI rules, live stream broadcasting, and ₹1,00,000 cash prizes at Galgotias University.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => handleJump('register')}
            className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95"
          >
            Register Squad (Free Entry) →
          </button>
        </div>
      </div>

      {/* Grid: 4 Tournament Pillars */}
      <div className="max-w-6xl mx-auto space-y-6 text-left">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest">
            TOURNAMENT DIRECTORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-blue-950 uppercase">
            EXPLORE THE LEAGUE HUBS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Bracket */}
          <div
            onClick={() => handleJump('bracket')}
            className="group cursor-pointer p-6 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 transition-all hover:shadow-md space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors mb-3 font-mono font-black text-sm">
                01
              </div>
              <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                Knockout Bracket
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Live match fixtures, group stage points tables, and interactive 3-minute set simulation.
              </p>
            </div>
            <div className="text-xs text-blue-700 font-bold flex items-center gap-1 uppercase tracking-wider pt-2">
              <span>View Bracket</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 2: Rules */}
          <div
            onClick={() => handleJump('rules')}
            className="group cursor-pointer p-6 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 transition-all hover:shadow-md space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors mb-3 font-mono font-black text-sm">
                02
              </div>
              <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                Rules &amp; Drone Specs
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                FAI Class F9A regulations, 400mm sphere cage tolerances, weight limits, and scoring hoops.
              </p>
            </div>
            <div className="text-xs text-blue-700 font-bold flex items-center gap-1 uppercase tracking-wider pt-2">
              <span>Read Rulebook</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 3: Action Gallery */}
          <div
            onClick={() => handleJump('gallery')}
            className="group cursor-pointer p-6 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 transition-all hover:shadow-md space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors mb-3 font-mono font-black text-sm">
                03
              </div>
              <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                Action Gallery &amp; Reels
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Official FIDA tournament match video streams, 50 km/h cage collision captures, and podium ceremonies.
              </p>
            </div>
            <div className="text-xs text-blue-700 font-bold flex items-center gap-1 uppercase tracking-wider pt-2">
              <span>View Match Action</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 4: Contact */}
          <div
            onClick={() => handleJump('contact')}
            className="group cursor-pointer p-6 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 transition-all hover:shadow-md space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors mb-3 font-mono font-black text-sm">
                04
              </div>
              <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                Pilot Helpline
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                24/7 tournament coordinators, outstation hostel booking, and technical scrutineering desk.
              </p>
            </div>
            <div className="text-xs text-blue-700 font-bold flex items-center gap-1 uppercase tracking-wider pt-2">
              <span>Connect Desk</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GcdisSpotlightBanner;
