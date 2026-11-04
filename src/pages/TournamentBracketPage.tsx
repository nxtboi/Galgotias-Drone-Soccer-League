import React from 'react';

export interface TournamentBracketPageProps {
  onNavigate: (tab: string) => void;
  onOpenRegister?: () => void;
}

export const TournamentBracketPage: React.FC<TournamentBracketPageProps> = ({
  onNavigate,
  onOpenRegister,
}) => {
  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-transparent text-white">
      <div className="max-w-7xl mx-auto space-y-12 text-center">
        {/* Header Banner */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
            <span className="w-2 h-2 bg-[#d0fe1d] animate-ping" />
            <span>BRACKET &amp; FIXTURES STATUS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
            TOURNAMENT BRACKET &amp; <span className="text-[#d0fe1d]">MATCH FIXTURES</span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            The official knockout bracket tree, group seeding, court allocations, and match schedules will be generated and published once team registrations are finalized.
          </p>
        </div>

        {/* Main XOTC Chamfered Coming Soon Frame */}
        <div className="bg-[#161814] text-white p-6 sm:p-10 md:p-14 border border-[#d0fe1d]/50 shadow-[0_0_50px_rgba(208,254,29,0.1)] relative overflow-hidden text-left">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#d0fe1d]/10 blur-3xl pointer-events-none" />
          <div
            className="hidden sm:block absolute bottom-3 left-1/3 w-20 h-4 xotc-dots-lime opacity-80 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <span className="text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-[0.22em] block">
                  CHAMPIONSHIP SCHEDULING
                </span>
                <h2 className="text-2xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wider mt-1">
                  COMING SOON
                </h2>
              </div>
              <span className="self-start sm:self-auto px-4 py-1.5 text-xs font-orbitron font-black uppercase bg-[#d0fe1d] text-black">
                Seeding In Progress
              </span>
            </div>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Squad registrations are actively underway for both <span className="text-white font-bold">Class 40 (D-40 Heavyweight)</span> and <span className="text-white font-bold">Class 20 (D-20 High-Speed)</span> categories. As soon as all 32 collegiate squads complete technical scrutineering verification, the official tournament draw and live match bracket will unlock right here.
            </p>

            {/* Stages overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              <div className="xotc-card p-6 space-y-2.5">
                <div className="text-[#d0fe1d] font-mono text-xs font-bold uppercase tracking-widest">STAGE 01 · TEAMS</div>
                <h4 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Registration Lock</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Rosters, pilot licenses, and drone specs validated by GCDIS technical committee.
                </p>
              </div>

              <div className="xotc-card p-6 space-y-2.5">
                <div className="text-[#d0fe1d] font-mono text-xs font-bold uppercase tracking-widest">STAGE 02 · DRAW</div>
                <h4 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Official Live Draw</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Randomized double-blind pool draw for Groups Alpha, Beta, Gamma, and Delta.
                </p>
              </div>

              <div className="xotc-card p-6 space-y-2.5">
                <div className="text-[#d0fe1d] font-mono text-xs font-bold uppercase tracking-widest">STAGE 03 · ARENA</div>
                <h4 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Fixtures &amp; Live Bug</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Real-time cage court schedules, live set-by-set goals, and elimination tree.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/15">
              <div className="text-xs text-neutral-300 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 bg-[#d0fe1d]" />
                <span>Registrations are currently open for university squads.</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onOpenRegister ? onOpenRegister() : onNavigate('register')}
                  className="xotc-btn-lime w-full sm:w-auto min-h-[46px] px-7 py-3 text-xs text-center justify-center flex items-center cursor-pointer"
                >
                  Register Your Squad Now
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="xotc-btn-outline w-full sm:w-auto min-h-[46px] px-6 py-3 text-xs text-center justify-center flex items-center cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracketPage;
