import React from 'react';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';

export interface SponsorsDivisionSectionProps {
  onNavigate?: (tab: string) => void;
}

export interface SponsorLogo {
  id: string;
  name: string;
  logo: string;
}

export const SPONSOR_LOGOS: SponsorLogo[] = [
  {
    id: 'gcdis-galgotias',
    name: 'Galgotias University & GCDIS',
    logo: '/sponsors/galgotias-gcdis.svg',
  },
  {
    id: 'fida-intl',
    name: 'Federation of International Dronesoccer (FIDA)',
    logo: '/sponsors/fida-dronesoccer.svg',
  },
  {
    id: 'radiomaster-elrs',
    name: 'RadioMaster RC Avionics',
    logo: '/sponsors/radiomaster.svg',
  },
  {
    id: 'expresslrs',
    name: 'ExpressLRS Protocol',
    logo: '/sponsors/expresslrs.svg',
  },
  {
    id: 'tmotor-propulsion',
    name: 'T-Motor Tiger Avionics',
    logo: '/sponsors/tmotor.svg',
  },
  {
    id: 'betafpv-sports',
    name: 'BetaFPV Robotics Lab',
    logo: '/sponsors/betafpv.svg',
  },
  {
    id: 'drone-fed-india',
    name: 'Drone Federation of India (DFI)',
    logo: '/sponsors/dfi.svg',
  },
  {
    id: 'meity-innovation',
    name: 'MeitY Startup Hub, Govt. of India',
    logo: '/sponsors/meity.svg',
  },
  {
    id: 'dgca',
    name: 'Directorate General of Civil Aviation',
    logo: '/sponsors/dgca.svg',
  },
  {
    id: 'aerospace-india-press',
    name: 'Tech & Aerospace India',
    logo: '/sponsors/tech-aerospace.svg',
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

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
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

        {/* Pure Sponsor Logos Showcase (Inverse light theme with rounded cards & image-only presentation) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {SPONSOR_LOGOS.map((sponsor) => (
            <motion.div
              key={sponsor.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group relative flex items-center justify-center p-6 sm:p-7 rounded-2xl bg-white border border-white/20 shadow-lg hover:border-[#d0fe1d] hover:shadow-[0_0_30px_rgba(208,254,29,0.45)] transition-all duration-300 min-h-[110px] sm:min-h-[125px] cursor-pointer"
              title={sponsor.name}
              onClick={() => onNavigate && onNavigate('contact')}
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="max-h-12 sm:max-h-14 w-auto max-w-[85%] object-contain filter group-hover:scale-110 transition-transform duration-300 select-none pointer-events-none"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsDivisionSection;
