import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Cpu, 
  Radio, 
  Award, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  FileText,
  Zap,
  Globe
} from 'lucide-react';

export interface SponsorsDivisionSectionProps {
  onNavigate: (tab: string) => void;
}

export interface SponsorPartner {
  id: string;
  name: string;
  tier: 'Title Partner' | 'Governing Standard' | 'Avionics & Hardware' | 'Institutional Partner' | 'Broadcast Partner';
  category: 'governing' | 'tech' | 'institutional' | 'media';
  role: string;
  description: string;
  contribution: string;
  tagline: string;
  accent: string;
  badge: string;
}

export const SPONSOR_PARTNERS: SponsorPartner[] = [
  {
    id: 'gcdis-galgotias',
    name: 'Galgotias University & GCDIS',
    tier: 'Title Partner',
    category: 'governing',
    role: 'Host University & Organizing Secretariat',
    description: 'Premier academic centre driving aeronautical innovation, autonomous drone testbeds, and pilot flight simulations across India.',
    contribution: 'Olympic-Standard Indoor Ballistic Caged Arena & Flight Testing Infrastructure',
    tagline: 'Leading Academic Aerospace Excellence',
    accent: '#d0fe1d',
    badge: 'TITLE HOST',
  },
  {
    id: 'fida-intl',
    name: 'FIDA (Federation of International Dronesoccer)',
    tier: 'Governing Standard',
    category: 'governing',
    role: 'Official Competition Standard & Rules Governance',
    description: 'Worldwide governing body defining standardized drone soccer regulations, 7-color LED role protocols, and referee accreditation.',
    contribution: 'Official FIDA 5th Revision Rulebook, VAR Verification & Technical Scrutineering',
    tagline: 'Global Drone Soccer Authority',
    accent: '#38bdf8',
    badge: 'GOVERNING BODY',
  },
  {
    id: 'radiomaster-elrs',
    name: 'RadioMaster & ExpressLRS Community',
    tier: 'Avionics & Hardware',
    category: 'tech',
    role: 'Official RC Radio & Telemetry Partner',
    description: 'Ultra-low-latency 2.4GHz packet-rate radio frequency controls engineered for instantaneous drone response under high RF noise.',
    contribution: 'Locked Frequency Scrutineering Stations & 500Hz Packet Rate Raceband Systems',
    tagline: 'Sub-Millisecond Radio Precision',
    accent: '#d0fe1d',
    badge: 'OFFICIAL AVIONICS',
  },
  {
    id: 'tmotor-propulsion',
    name: 'T-Motor Tiger Avionics',
    tier: 'Avionics & Hardware',
    category: 'tech',
    role: 'Propulsion & High-RPM Motors',
    description: 'Industry-standard brushless motors delivering 14,000+ RPM thrust output balanced for protective spherical exoskeletons.',
    contribution: 'Motor Dynamometer Testing & 4S/6S High-Discharge Battery Certification',
    tagline: 'High-Torque Aerial Dynamics',
    accent: '#f59e0b',
    badge: 'PROPULSION TECH',
  },
  {
    id: 'betafpv-sports',
    name: 'BetaFPV Robotics Lab',
    tier: 'Avionics & Hardware',
    category: 'tech',
    role: 'Class 20 Sphere Airframe Specialist',
    description: 'Ultralight polymer cage shells and digital flight controllers engineered for high-agility 200mm indoor soccer clashes.',
    contribution: 'D-20 Micro-Airframe Benchmarking & Replacement Propeller Supply Bay',
    tagline: 'Impact-Resilient Exoskeletons',
    accent: '#10b981',
    badge: 'AIRFRAME TECH',
  },
  {
    id: 'drone-fed-india',
    name: 'Drone Federation of India (DFI)',
    tier: 'Institutional Partner',
    category: 'institutional',
    role: 'Industry Ecosystem & Policy Endorsement',
    description: 'National non-profit promoting indigenous unmanned aerial vehicle manufacturing, collegiate research, and pilot certification.',
    contribution: 'Collegiate Talent Pipeline, Industry Recruitment Desk & Technical Guidance',
    tagline: 'Advancing National Drone Capabilities',
    accent: '#a855f7',
    badge: 'ECOSYSTEM ALLY',
  },
  {
    id: 'meity-innovation',
    name: 'MeitY Startup & Robotics Hub',
    tier: 'Institutional Partner',
    category: 'institutional',
    role: 'Innovation & Skill Mission Ally',
    description: 'Ministry of Electronics & IT initiative nurturing deep-tech student ventures, hardware incubation, and youth drone engineering.',
    contribution: 'National Robotics Hackathon Endorsement & Hardware Innovation Showcase',
    tagline: 'Empowering Student Deep-Tech',
    accent: '#ec4899',
    badge: 'GOVT SUPPORT',
  },
  {
    id: 'aerospace-india-press',
    name: 'Tech & Aerospace India',
    tier: 'Broadcast Partner',
    category: 'media',
    role: 'Official Print & Media Chronicle',
    description: 'Leading publication delivering in-depth coverage of unmanned flight systems, competitive robotics, and defense aerospace.',
    contribution: 'National Championship Press Dispatch, Feature Interviews & Photojournalism',
    tagline: 'National Aerospace Chronicle',
    accent: '#06b6d4',
    badge: 'OFFICIAL MEDIA',
  },
];

export const SPONSOR_TIERS = [
  {
    name: 'Platinum Title Sponsor',
    slots: '1 Brand',
    investment: '₹5,00,000',
    perks: [
      'Naming rights on Arena Cage 1 & Cage 2',
      'Exclusive Center Circle logo placement on astroturf floor',
      'Prominent logo on official team jerseys and referee kit',
      'Keynote speech at opening & grand trophy ceremony',
      'Dedicated 6m × 4m Tech Exhibition Stall in Arena Foyer',
    ],
    highlight: true,
  },
  {
    name: 'Gold Aerospace Partner',
    slots: '3 Brands',
    investment: '₹2,50,000',
    perks: [
      'Perimeter banner branding along ballistic netting ring',
      'Logo on all live stream scorebug graphics & broadcasts',
      'Full-page feature in official GDSL 2026 Tournament Program',
      'Exclusive recruitment booth for engineering talent',
      '3m × 3m Arena Booth with electrical & display kit',
    ],
    highlight: false,
  },
  {
    name: 'Silver Tech Supporter',
    slots: '6 Brands',
    investment: '₹1,00,000',
    perks: [
      'Logo on participant badges & accreditation lanyards',
      'Branding on digital bracket & official live fixtures portal',
      'Product showcase in the Pit Bay repair area',
      'Social media feature across GCDIS and partner pages',
      'Certificate of National Championship Partnership',
    ],
    highlight: false,
  },
];

export const SponsorsDivisionSection: React.FC<SponsorsDivisionSectionProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'governing' | 'tech' | 'institutional' | 'media'>('all');
  const [prospectusDownloaded, setProspectusDownloaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPartners = activeCategory === 'all' 
    ? SPONSOR_PARTNERS 
    : SPONSOR_PARTNERS.filter((p) => p.category === activeCategory);

  const handleDownloadProspectus = () => {
    setProspectusDownloaded(true);
    setTimeout(() => setProspectusDownloaded(false), 4000);
  };

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

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
            <Award className="w-3.5 h-3.5" />
            <span>OFFICIAL INDUSTRY ALLIANCES &amp; SPONSORSHIPS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
            SPONSORS &amp; <span className="text-[#d0fe1d]">INDUSTRY PARTNERS</span>
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-sans">
            Backed by international drone athletics federations, aerospace propulsion manufacturers, and innovation agencies elevating student engineers to national prominence.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Partners (8)' },
            { id: 'governing', label: 'Title & Governing' },
            { id: 'tech', label: 'Avionics & Hardware' },
            { id: 'institutional', label: 'Institutional & Ecosystem' },
            { id: 'media', label: 'Media & Broadcast' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                className={`px-3.5 sm:px-4 py-2 min-h-[38px] text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#d0fe1d] text-[#0b0c0a] border-[#d0fe1d] shadow-[0_0_15px_rgba(208,254,29,0.3)]'
                    : 'bg-[#151713] text-neutral-300 border-white/15 hover:border-white/40 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredPartners.map((partner) => (
              <motion.div
                key={partner.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="xotc-card p-6 flex flex-col justify-between text-left relative overflow-hidden group hover:border-[#d0fe1d]/60"
              >
                {/* Top Badge & Tier */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span 
                      className="text-[10px] font-orbitron font-black px-2 py-0.5 rounded tracking-wider uppercase"
                      style={{ 
                        backgroundColor: `${partner.accent}20`, 
                        color: partner.accent,
                        border: `1px solid ${partner.accent}40`
                      }}
                    >
                      {partner.badge}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {partner.tier}
                    </span>
                  </div>

                  {/* Partner Name & Tagline */}
                  <div>
                    <h3 className="font-orbitron font-black text-white text-base group-hover:text-[#d0fe1d] transition-colors leading-snug uppercase">
                      {partner.name}
                    </h3>
                    <div className="text-[11px] font-rajdhani font-bold text-neutral-400 uppercase tracking-wider mt-1">
                      {partner.role}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {partner.description}
                  </p>
                </div>

                {/* Verified Technical Contribution Block */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#d0fe1d] font-bold block">
                    Tournament Contribution
                  </span>
                  <div className="text-xs text-neutral-300 font-sans leading-normal">
                    {partner.contribution}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sponsorship Tiers & Partner With Us Callout */}
        <div className="bg-[#141612] border border-[#d0fe1d]/40 p-6 sm:p-10 md:p-12 relative overflow-hidden">
          {/* Top-Right Neon Gradient Corner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d0fe1d]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/15 pb-6">
              <div className="space-y-1 text-left">
                <span className="text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-[0.22em] block">
                  CORPORATE &amp; INSTITUTIONAL PARTICIPATION
                </span>
                <h3 className="text-2xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wider">
                  BECOME A TOURNAMENT PARTNER
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-sans">
                  Showcase your brand directly to 32 university drone squads, 200+ certified pilots, and collegiate robotics talent in India’s leading drone soccer proving ground.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={handleDownloadProspectus}
                  className="px-4 py-2.5 min-h-[42px] bg-[#1a1d17] hover:bg-white/10 border border-white/20 hover:border-white text-xs font-rajdhani font-bold uppercase tracking-wider text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#d0fe1d]" />
                  <span>{prospectusDownloaded ? '✓ Prospectus Downloaded' : 'Download Prospectus (PDF)'}</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="xotc-btn-lime px-5 py-2.5 min-h-[42px] text-xs font-orbitron font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span>Sponsorship Tiers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick 3-Tier Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              {SPONSOR_TIERS.map((tier, idx) => (
                <div 
                  key={idx}
                  className={`p-6 border flex flex-col justify-between space-y-4 ${
                    tier.highlight 
                      ? 'bg-[#1b1f15] border-[#d0fe1d] shadow-[0_0_30px_rgba(208,254,29,0.12)]' 
                      : 'bg-[#121410] border-white/15'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase text-[#d0fe1d]">
                        {tier.slots}
                      </span>
                      {tier.highlight && (
                        <span className="text-[9px] font-orbitron font-black uppercase bg-[#d0fe1d] text-black px-2 py-0.5">
                          PREMIER TIER
                        </span>
                      )}
                    </div>
                    <h4 className="font-orbitron font-black text-white text-base uppercase">
                      {tier.name}
                    </h4>
                    <div className="font-mono text-xl sm:text-2xl font-black text-white">
                      {tier.investment}
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-300 font-sans pt-2 border-t border-white/10">
                      {tier.perks.map((perk, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#d0fe1d] shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('contact')}
                      className={`w-full py-2.5 text-xs font-rajdhani font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                        tier.highlight
                          ? 'bg-[#d0fe1d] text-black hover:bg-[#e2ff54]'
                          : 'bg-[#1a1d17] border border-white/20 text-white hover:border-[#d0fe1d] hover:text-[#d0fe1d]'
                      }`}
                    >
                      Inquire For {tier.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Secretariat Contact Bar */}
            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d0fe1d]" />
                <span>Sponsorship Desk: <strong>gcdis.dronesoccer@galgotiasuniversity.edu.in</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>Helpline: <strong>+91 98712 34567</strong></span>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-[#d0fe1d] underline hover:text-white cursor-pointer font-bold"
                >
                  Contact Secretariat →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsorship Prospectus Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#141612] border border-[#d0fe1d]/50 max-w-2xl w-full p-6 sm:p-8 space-y-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#d0fe1d] uppercase tracking-widest font-bold">
                  GDSL 2026 SPONSORSHIP DOSSIER
                </span>
                <h3 className="font-orbitron font-black text-xl text-white uppercase mt-0.5">
                  PARTNERSHIP PACKAGES
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              Connect your brand with high-skill aeronautical engineering talent. Each tier includes arena visibility, digital broadcast integration, and physical exhibition rights.
            </p>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 bg-[#1b1f15] border border-[#d0fe1d]/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-orbitron font-black text-white uppercase">Platinum Title (₹5,00,000)</span>
                  <span className="font-mono text-[#d0fe1d] font-bold">1 Exclusive Slot</span>
                </div>
                <p className="text-neutral-300">
                  Full naming rights (&quot;[Your Brand] Galgotias Drone Soccer League&quot;), arena floor logo, referee kits, and 1st prize trophy presentation.
                </p>
              </div>

              <div className="p-4 bg-[#121410] border border-white/15 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-orbitron font-black text-white uppercase">Gold Aerospace (₹2,50,000)</span>
                  <span className="font-mono text-neutral-300 font-bold">3 Slots Available</span>
                </div>
                <p className="text-neutral-300">
                  Ballistic netting court branding, live broadcast bug logo, recruitment desk, and high-impact arena display.
                </p>
              </div>

              <div className="p-4 bg-[#121410] border border-white/15 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-orbitron font-black text-white uppercase">Silver Technology (₹1,00,000)</span>
                  <span className="font-mono text-neutral-300 font-bold">6 Slots Available</span>
                </div>
                <p className="text-neutral-300">
                  Lanyard and credential branding, website and bracket digital ads, and Pit Bay product demonstration area.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/15">
              <span className="text-xs text-neutral-400 font-mono">
                Custom in-kind &amp; hardware sponsorships available
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    onNavigate('contact');
                  }}
                  className="xotc-btn-lime w-full sm:w-auto px-5 py-2.5 text-xs text-center justify-center flex items-center cursor-pointer"
                >
                  Send Inquiry Now
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-white/20 hover:border-white text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SponsorsDivisionSection;
