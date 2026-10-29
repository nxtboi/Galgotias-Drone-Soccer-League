import React from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Building2, Radio, Trophy, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export interface SponsorsDivisionSectionProps {
  onNavigate?: (tab: string) => void;
}

export interface SponsorTierPreview {
  id: string;
  category: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const UPCOMING_TIERS: SponsorTierPreview[] = [
  {
    id: 'tier-title',
    category: 'TIER 01',
    label: 'Title Sponsor',
    icon: Trophy,
    description: 'Headline branding across the central high-voltage arena cage & official broadcast.',
  },
  {
    id: 'tier-avionics',
    category: 'TIER 02',
    label: 'Avionics & Tech Partner',
    icon: Radio,
    description: 'Providing official flight controllers, telemetry stations, and battery charging hubs.',
  },
  {
    id: 'tier-broadcast',
    category: 'TIER 03',
    label: 'Arena Broadcast Partner',
    icon: Sparkles,
    description: 'Live multicam streaming, pilot FPV HUD graphics, and nationwide esports coverage.',
  },
  {
    id: 'tier-ecosystem',
    category: 'TIER 04',
    label: 'Institutional Partner',
    icon: ShieldCheck,
    description: 'Aerospace innovation grants, university research alliances, and pilot certifications.',
  },
];

export const SponsorsDivisionSection: React.FC<SponsorsDivisionSectionProps> = ({ onNavigate }) => {
  return (
    <section id="sponsors" className="relative z-20 w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#0e100d] text-white border-t border-white/15 overflow-hidden">
      {/* Background Ambient Lighting */}
      <div 
        className="absolute top-1/4 -left-32 w-96 h-96 bg-[#d0fe1d]/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-10 right-0 w-96 h-96 bg-[#38bdf8]/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true" 
      />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
            <Award className="w-3.5 h-3.5" />
            <span>OFFICIAL INDUSTRY ALLIANCES &amp; SPONSORSHIPS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
            SPONSORS &amp; <span className="text-[#d0fe1d]">INDUSTRY PARTNERS</span>
          </h2>
        </div>

        {/* Coming Soon Main Hero Block */}
        <div className="relative rounded-2xl bg-[#141612] border border-[#d0fe1d]/30 p-8 sm:p-12 md:p-14 overflow-hidden shadow-[0_0_50px_rgba(208,254,29,0.08)]">
          {/* Subtle neon corner accents */}
          <div className="absolute top-0 left-0 w-20 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 left-0 h-20 w-[2px] bg-[#d0fe1d]" />
          <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute bottom-0 right-0 h-20 w-[2px] bg-[#d0fe1d]" />
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#d0fe1d]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto">
            {/* Status Beacon */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#d0fe1d]/10 border border-[#d0fe1d]/40 text-[#d0fe1d] text-xs font-rajdhani font-bold uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d0fe1d] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d0fe1d]" />
              </span>
              <span>ANNOUNCEMENTS IN PROGRESS</span>
            </div>

            {/* Prominent Coming Soon Heading */}
            <div className="space-y-2">
              <h3 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-black text-white tracking-widest uppercase">
                COMING SOON<span className="text-[#d0fe1d]">...</span>
              </h3>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-rajdhani font-medium">
                Official tournament sponsors, aerospace industry partners, and tech booth exhibitors for Galgotias Drone Soccer League 2026 are currently being finalized and will be unveiled soon.
              </p>
            </div>

            {/* Tier Teaser Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-left">
              {UPCOMING_TIERS.map((tier) => {
                const IconComponent = tier.icon;
                return (
                  <motion.div
                    key={tier.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="relative p-5 rounded-xl bg-[#0e100d]/90 border border-white/10 hover:border-[#d0fe1d]/50 transition-colors group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#d0fe1d] uppercase tracking-widest">
                          {tier.category}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70 group-hover:text-[#d0fe1d] group-hover:bg-[#d0fe1d]/10 transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-orbitron font-bold text-sm text-white group-hover:text-[#d0fe1d] transition-colors">
                          {tier.label}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-rajdhani font-medium">
                          {tier.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-orbitron font-black text-[#d0fe1d] tracking-wider uppercase">
                        Coming soon...
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d0fe1d]/80 animate-pulse" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Sponsorship Inquiries & Partnership Deck CTA */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 bg-white/[0.02] p-5 sm:p-6 rounded-xl border border-white/5">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2 text-white font-orbitron font-bold text-sm uppercase">
                  <Building2 className="w-4 h-4 text-[#d0fe1d]" />
                  <span>Interested in Sponsoring GDSL 2026?</span>
                </div>
                <p className="text-xs text-neutral-400 font-rajdhani font-medium">
                  Connect with the GCDIS Organizing Committee to explore brand placement, exhibit stalls, and pilot prize sponsorships.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#d0fe1d] text-black font-orbitron font-black text-xs uppercase tracking-wider hover:bg-[#b8e214] hover:shadow-[0_0_20px_rgba(208,254,29,0.4)] transition-all cursor-pointer"
                >
                  <span>Become a Sponsor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="mailto:sponsorships@gdsl2026.org"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-neutral-300 border border-white/15 hover:border-white/40 hover:text-white font-rajdhani font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#d0fe1d]" />
                  <span>sponsorships@gdsl2026.org</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsDivisionSection;
