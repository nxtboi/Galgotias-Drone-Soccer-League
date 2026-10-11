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
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-4xl mx-auto space-y-10 text-center">
        {/* Header Banner */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>BRACKET &amp; FIXTURES STATUS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            Tournament Bracket &amp; Match Fixtures
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
            The official knockout bracket tree, group seeding, court allocations, and match schedules will be generated and published once team registrations are finalized.
          </p>
        </div>

        {/* Main Coming Soon Card */}
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-5 sm:p-10 md:p-14 border border-blue-800 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                  CHAMPIONSHIP SCHEDULING
                </span>
                <h2 className="text-2xl sm:text-3xl font-sans font-black text-white uppercase mt-1">
                  COMING SOON
                </h2>
              </div>
              <span className="self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-amber-400 text-slate-950">
                Seeding In Progress
              </span>
            </div>

            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              Squad registrations are actively underway for both <span className="text-white font-bold">Class 40 (D-40 Heavyweight)</span> and <span className="text-white font-bold">Class 20 (D-20 High-Speed)</span> categories. As soon as all 32 collegiate squads complete technical scrutineering verification, the official tournament draw and live match bracket will unlock right here.
            </p>

            {/* Stages overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="text-amber-400 font-mono text-xs font-bold uppercase">STAGE 1: TEAMS</div>
                <h4 className="text-sm font-bold text-white uppercase">Registration Lock</h4>
                <p className="text-xs text-blue-300">
                  Rosters, pilot licenses, and drone specs validated by GCDIS technical committee.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="text-sky-400 font-mono text-xs font-bold uppercase">STAGE 2: DRAW</div>
                <h4 className="text-sm font-bold text-white uppercase">Official Live Draw</h4>
                <p className="text-xs text-blue-300">
                  Randomized double-blind pool draw for Groups Alpha, Beta, Gamma, and Delta.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="text-emerald-400 font-mono text-xs font-bold uppercase">STAGE 3: ARENA</div>
                <h4 className="text-sm font-bold text-white uppercase">Fixtures &amp; Live Bug</h4>
                <p className="text-xs text-blue-300">
                  Real-time cage court schedules, live set-by-set goals, and elimination tree.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/10">
              <div className="text-xs text-blue-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Registrations are currently open for university squads.</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onOpenRegister ? onOpenRegister() : onNavigate('register')}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-black text-xs uppercase tracking-wider shadow-md transition-all text-center justify-center flex items-center"
                >
                  Register Your Squad Now
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all border border-white/20 text-center justify-center flex items-center"
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
