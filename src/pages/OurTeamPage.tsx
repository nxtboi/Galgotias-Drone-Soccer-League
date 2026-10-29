import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Linkedin, 
  Instagram, 
  Github, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Building,
  HeartHandshake,
  RotateCw,
  RotateCcw,
  Sparkles,
  Share2,
  Megaphone,
  Briefcase,
  Award,
  Video
} from 'lucide-react';
import { TEAM_CATEGORIES, TEAM_MEMBERS, TeamMember, TeamCategory } from '../data/teamData';
import { GcdisLogo } from '../components/GcdisLogo';

export interface OurTeamPageProps {
  onNavigate: (page: string) => void;
}

export const OurTeamPage: React.FC<OurTeamPageProps> = ({ onNavigate }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Track individual flipped card IDs
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const toggleFlip = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper icons for categories
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'management':
        return <Briefcase className="w-5 h-5 text-[#d0fe1d]" />;
      case 'technical':
        return <Cpu className="w-5 h-5 text-[#d0fe1d]" />;
      case 'marketing':
        return <Megaphone className="w-5 h-5 text-[#d0fe1d]" />;
      case 'social_media':
        return <Share2 className="w-5 h-5 text-[#d0fe1d]" />;
      case 'advisory':
        return <Award className="w-5 h-5 text-[#d0fe1d]" />;
      default:
        return <Users className="w-5 h-5 text-[#d0fe1d]" />;
    }
  };

  // Render individual member card
  const renderMemberCard = (member: TeamMember) => {
    const isFlipped = !!flippedCards[member.id];
    return (
      <div key={member.id} className="techkriti-card-perspective h-[475px] w-full">
        <div
          className={`techkriti-card-inner ${
            isFlipped ? 'is-flipped' : ''
          }`}
        >
          {/* =========================================
              FRONT FACE: Portrait & Identity
              ========================================= */}
          <div 
            className={`techkriti-card-face bg-[#141612] border border-white/15 hover:border-[#d0fe1d]/70 flex flex-col justify-between shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer select-none ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            onClick={() => toggleFlip(member.id)}
            role="button"
            tabIndex={isFlipped ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFlip(member.id);
              }
            }}
            aria-label={`${member.name}. Click to view contact details`}
          >
            {/* High-tech Top Bar */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-black/85 backdrop-blur-md border border-[#d0fe1d]/50 text-[#d0fe1d] rounded truncate">
                {member.categoryLabel}
              </span>

              <button
                type="button"
                onClick={(e) => toggleFlip(member.id, e)}
                className="pointer-events-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-neutral-200 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] text-[10px] font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 shadow-md"
                title="Flip to contacts"
              >
                <span>Contacts</span>
                <RotateCw className="w-3 h-3 text-[#d0fe1d] group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Portrait Image Area */}
            <div className="relative w-full h-[305px] shrink-0 overflow-hidden bg-neutral-900">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Subtle bottom blend into card info panel */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#11130f] via-[#11130f]/60 to-transparent pointer-events-none" />
            </div>

            {/* Dedicated Front Bottom Info Panel (Name, Role, Department & Flip CTA) */}
            <div className="relative z-20 flex-1 bg-[#11130f] px-5 pt-2 pb-4 flex flex-col justify-between text-left border-t border-white/10">
              <div className="space-y-1">
                <h3 className="font-orbitron font-bold text-base sm:text-lg text-white group-hover:text-[#d0fe1d] transition-colors leading-snug line-clamp-1">
                  {member.name}
                </h3>
                <div className="font-rajdhani text-xs sm:text-sm font-bold text-[#d0fe1d] tracking-wide uppercase leading-snug line-clamp-2">
                  {member.role}
                </div>
                <div className="text-xs text-neutral-400 font-sans leading-snug line-clamp-1">
                  {member.department}
                </div>
              </div>

              {/* Flip Prompt Affordance */}
              <div className="pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between text-neutral-400 text-[11px] font-mono group-hover:text-white transition-colors">
                <span className="flex items-center gap-1.5 text-neutral-300 group-hover:text-[#d0fe1d] transition-colors">
                  <RotateCw className="w-3 h-3 text-[#d0fe1d] shrink-0" />
                  <span>Click to flip card</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                  DIRECT COMM ↵
                </span>
              </div>
            </div>
          </div>

          {/* =========================================
              BACK FACE: Direct Contact Channels & Bio
              ========================================= */}
          <div 
            className={`techkriti-card-face techkriti-card-back bg-[#141612] border-2 border-[#d0fe1d]/50 p-5 flex flex-col justify-between shadow-2xl text-left overflow-hidden select-text cursor-default ${
              isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0fe1d]/10 blur-2xl rounded-full pointer-events-none" />

            {/* Back Header: Member summary & Flip back trigger */}
            <div className="relative z-10 flex items-start justify-between gap-2.5 border-b border-white/15 pb-2.5">
              <div className="space-y-0.5 min-w-0">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#d0fe1d] block">
                  {member.categoryLabel}
                </span>
                <h4 className="font-orbitron font-bold text-sm sm:text-base text-white leading-snug truncate">
                  {member.name}
                </h4>
                <p className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase leading-snug line-clamp-2">
                  {member.role}
                </p>
              </div>

              {/* Flip to Photo button */}
              <button
                type="button"
                onClick={(e) => toggleFlip(member.id, e)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/20 text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all cursor-pointer shrink-0 text-[10px] font-rajdhani font-bold uppercase tracking-wider"
                title="Flip back to portrait photo"
              >
                <span>Photo</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Back Center: Scope & Bio */}
            <div className="relative z-10 space-y-2.5 py-2 flex-1 flex flex-col justify-center select-text min-h-0">
              <div className="text-xs text-neutral-300 font-sans leading-snug">
                <span className="text-neutral-500 block text-[10px] font-mono uppercase tracking-wider mb-0.5">Department / Unit:</span>
                <span className="text-white font-medium select-text line-clamp-1">{member.department}</span>
              </div>

              {member.bio && (
                <div className="p-2.5 bg-[#0e100d]/90 border border-white/10 rounded-xl select-text">
                  <span className="text-[10px] font-mono text-[#d0fe1d] uppercase tracking-wider block mb-0.5">
                    Operational Scope:
                  </span>
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed select-text line-clamp-3">
                    {member.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Back Contacts List (Click to Call & Mail + 1-Tap Copy) */}
            <div className="relative z-10 space-y-2 pt-2.5 border-t border-white/15">
              {/* Phone Channel */}
              <div 
                className="flex items-center justify-between gap-2 p-2 bg-[#0e100d] border border-white/15 hover:border-[#d0fe1d]/60 rounded-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`tel:${member.phone.replace(/\s+/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-neutral-200 hover:text-[#d0fe1d] transition-colors min-w-0 flex-1"
                  title="Direct Phone Dial"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#d0fe1d]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-3 h-3 text-[#d0fe1d]" />
                  </div>
                  <span className="font-mono text-xs truncate tracking-wider font-semibold select-text">
                    {member.phone}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(member.phone, `phone-${member.id}`, e)}
                  className="text-neutral-400 hover:text-[#d0fe1d] transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
                  title="Copy Phone Number"
                >
                  {copiedId === `phone-${member.id}` ? (
                    <Check className="w-3.5 h-3.5 text-[#d0fe1d]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Email Channel */}
              {member.email && (
                <div 
                  className="flex items-center justify-between gap-2 p-2 bg-[#0e100d] border border-white/15 hover:border-[#d0fe1d]/60 rounded-xl transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`mailto:${member.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-neutral-200 hover:text-[#d0fe1d] transition-colors min-w-0 flex-1"
                    title="Send Email"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#d0fe1d]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-3 h-3 text-[#d0fe1d]" />
                    </div>
                    <span className="font-mono text-[11px] truncate tracking-wide font-semibold select-text">
                      {member.email}
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(member.email!, `email-${member.id}`, e)}
                    className="text-neutral-400 hover:text-[#d0fe1d] transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
                    title="Copy Email"
                  >
                    {copiedId === `email-${member.id}` ? (
                      <Check className="w-3.5 h-3.5 text-[#d0fe1d]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Socials & Flip to Photo Bottom Button */}
              <div 
                className="flex items-center justify-between pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  {member.linkedin && (
                    <a
                      href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-lg bg-[#0e100d] border border-white/20 flex items-center justify-center text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all cursor-pointer"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github.startsWith('http') ? member.github : `https://${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-lg bg-[#0e100d] border border-white/20 flex items-center justify-center text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all cursor-pointer"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.instagram && (
                    <a
                      href={member.instagram.startsWith('http') ? member.instagram : `https://${member.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 rounded-lg bg-[#0e100d] border border-white/20 flex items-center justify-center text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all cursor-pointer"
                      title="Instagram Handle"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleFlip(member.id, e)}
                  className="inline-flex items-center gap-1.5 text-xs font-rajdhani font-bold uppercase text-neutral-300 hover:text-black hover:bg-[#d0fe1d] bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Flip to Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 bg-[#0e100d] text-white overflow-hidden">
      {/* Background Ambient Cyber Lighting */}
      <div 
        className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#d0fe1d]/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[#38bdf8]/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <button 
            onClick={() => onNavigate('home')} 
            className="hover:text-[#d0fe1d] transition-colors cursor-pointer"
          >
            HOME
          </button>
          <span>/</span>
          <span className="text-[#d0fe1d] font-bold">OUR TEAM</span>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
          <div className="text-left space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
              <Users className="w-4 h-4" />
              <span>GCDIS SECRETARIAT &amp; ORGANIZING COMMITTEE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-orbitron font-black text-white uppercase tracking-wider leading-tight">
              MEET THE <span className="text-[#d0fe1d]">ORGANIZERS</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
              Connect directly with festival coordinators, avionics scrutineers, marketing liaisons, social media creators, and university leadership behind GDSL 2026.
              <span className="hidden sm:inline text-neutral-400"> Click or tap any card to flip and reveal verified direct phone and email channels.</span>
            </p>
          </div>
        </div>

        {/* ========================================================
            DISTINCT CATEGORIZED SECTIONS
            (Management, Technical, Marketing, Social Media, Advisory)
            ======================================================== */}
        <div className="space-y-20">
          {TEAM_CATEGORIES.map((category) => {
            const members = TEAM_MEMBERS.filter((m) => m.category === category.id);
            if (members.length === 0) return null;

            return (
              <section 
                key={category.id} 
                id={`section-${category.id}`}
                className="space-y-8 scroll-mt-36"
              >
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/15 relative">
                  <div className="text-left space-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
                      {getCategoryIcon(category.id)}
                      <span>{category.badge}</span>
                      <span className="text-neutral-500 font-mono">/</span>
                      <span className="text-neutral-400 font-mono">{members.length} Coordinators</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
                      {category.label}
                    </h2>

                    <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-sans leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Corner Accent Graphic */}
                  <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-pulse" />
                    <span>STATUS: ACTIVE PROTOCOL</span>
                  </div>
                </div>

                {/* Section Grid of 3D Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {members.map(renderMemberCard)}
                </div>
              </section>
            );
          })}
        </div>

        {/* Dedicated Desk Inquiries */}
        <div className="space-y-6 pt-10 border-t border-white/15">
          <div className="text-left space-y-2">
            <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
              DIRECT COMMUNICATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
              SPECIFIC DESK INQUIRIES
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Need immediate assistance with a specific operational area? Contact the dedicated vertical mailboxes directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Sponsorships & Marketing */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Marketing &amp; Sponsors</h4>
                <p className="text-xs text-neutral-400">Brand sponsorships, tech booth exhibits &amp; prize partnerships.</p>
              </div>
              <a
                href="mailto:sponsorships@gdsl2026.org"
                className="text-xs font-mono text-[#d0fe1d] hover:underline flex items-center gap-1.5"
              >
                <span>sponsorships@gdsl2026.org</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Box 2: Scrutineering & Technical */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Technical &amp; Avionics</h4>
                <p className="text-xs text-neutral-400">Sphere diameter tolerances, motor kv scrutiny &amp; fail-safe queries.</p>
              </div>
              <a
                href="mailto:scrutineering@gdsl2026.org"
                className="text-xs font-mono text-[#d0fe1d] hover:underline flex items-center gap-1.5"
              >
                <span>scrutineering@gdsl2026.org</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Box 3: Social Media & Broadcast */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <Video className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Media &amp; Live Stream</h4>
                <p className="text-xs text-neutral-400">Esports 4K broadcast feeds, press accreditations &amp; interview desk.</p>
              </div>
              <a
                href="mailto:broadcast@gdsl2026.org"
                className="text-xs font-mono text-[#d0fe1d] hover:underline flex items-center gap-1.5"
              >
                <span>broadcast@gdsl2026.org</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Box 4: Management & Secretariat */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Management Secretariat</h4>
                <p className="text-xs text-neutral-400">Collegiate registrations, certificate validation &amp; event schedule.</p>
              </div>
              <a
                href="mailto:coordinator@gdsl2026.org"
                className="text-xs font-mono text-[#d0fe1d] hover:underline flex items-center gap-1.5"
              >
                <span>coordinator@gdsl2026.org</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#151713] border border-[#d0fe1d]/50 p-8 sm:p-10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left shadow-2xl">
          <div className="flex items-center gap-4">
            <GcdisLogo size="md" showWordmark={false} />
            <div>
              <h3 className="font-orbitron font-black text-lg sm:text-2xl text-white uppercase">
                GALGOTIAS DRONE SOCCER LEAGUE 2026
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                North India&apos;s premier collegiate drone soccer tournament at Galgotias University. 32 team slots · ₹2,00,000 prize purse · Dec 08–09, 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('contact')}
              className="xotc-btn-outline px-6 py-3 text-xs w-full sm:w-auto text-center cursor-pointer"
            >
              SECRETARIAT HELPDESK
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="xotc-btn-lime px-6 py-3 text-xs w-full sm:w-auto text-center cursor-pointer"
            >
              REGISTER SQUAD NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurTeamPage;
