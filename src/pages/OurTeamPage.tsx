import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Linkedin, 
  Instagram, 
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
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  
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

  const flipAllToBack = () => {
    const updated: Record<string, boolean> = {};
    TEAM_MEMBERS.forEach((m) => {
      updated[m.id] = true;
    });
    setFlippedCards(updated);
  };

  const flipAllToFront = () => {
    setFlippedCards({});
  };

  const areAllFlipped = useMemo(() => {
    return TEAM_MEMBERS.length > 0 && TEAM_MEMBERS.every((m) => flippedCards[m.id]);
  }, [flippedCards]);

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    if (sectionId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(`section-${sectionId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      <div key={member.id} className="techkriti-card-perspective h-[440px] w-full">
        <div
          className={`techkriti-card-inner cursor-pointer select-none ${
            isFlipped ? 'is-flipped' : ''
          }`}
          onClick={() => toggleFlip(member.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleFlip(member.id);
            }
          }}
          aria-label={`${member.name} flashcard. Click to ${
            isFlipped ? 'view portrait' : 'view contact details'
          }`}
        >
          {/* =========================================
              FRONT FACE: Portrait & Identity
              ========================================= */}
          <div className="techkriti-card-face bg-[#141612] border border-white/15 hover:border-[#d0fe1d]/70 flex flex-col justify-between shadow-xl transition-all duration-300 group overflow-hidden">
            {/* High-tech Top Bar */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black/85 backdrop-blur-md border border-[#d0fe1d]/50 text-[#d0fe1d] rounded">
                {member.categoryLabel}
              </span>

              <button
                type="button"
                onClick={(e) => toggleFlip(member.id, e)}
                className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] text-[10px] font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 shadow-md"
                title="Flip to contacts"
              >
                <span>Contacts</span>
                <RotateCw className="w-3 h-3 text-[#d0fe1d] group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Portrait Image with Tech Frame */}
            <div className="relative w-full h-full overflow-hidden bg-neutral-900">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                }}
              />

              {/* Gradient Vignette overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e100d] via-[#0e100d]/40 to-black/30 pointer-events-none" />

              {/* Tech Grid Pattern Lines */}
              <div 
                className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" 
              />
            </div>

            {/* Front Bottom Card Info (Name, Role, College & Flip CTA) */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-5 bg-gradient-to-t from-[#0e100d] via-[#0e100d]/90 to-transparent pt-10 text-left space-y-3">
              <div className="space-y-1">
                <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-[#d0fe1d] transition-colors leading-tight">
                  {member.name}
                </h3>
                <div className="font-rajdhani text-xs sm:text-sm font-bold text-[#d0fe1d] tracking-wide uppercase">
                  {member.role}
                </div>
                <div className="text-[11px] text-neutral-400 font-sans truncate">
                  {member.department}
                </div>
              </div>

              {/* Flip Prompt Affordance */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-neutral-400 text-[11px] font-mono group-hover:text-white transition-colors">
                <span className="flex items-center gap-1.5 text-neutral-400 group-hover:text-[#d0fe1d] transition-colors">
                  <RotateCw className="w-3 h-3 text-[#d0fe1d]" />
                  <span>Click to flip card</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  DIRECT COMM ↵
                </span>
              </div>
            </div>
          </div>

          {/* =========================================
              BACK FACE: Direct Contact Channels & Bio
              ========================================= */}
          <div className="techkriti-card-face techkriti-card-back bg-[#141612] border-2 border-[#d0fe1d]/50 p-5 flex flex-col justify-between shadow-2xl text-left overflow-hidden">
            {/* Background Cyber Texture */}
            <div 
              className="absolute inset-0 opacity-15 bg-[radial-gradient(#d0fe1d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" 
            />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0fe1d]/10 blur-2xl rounded-full pointer-events-none" />

            {/* Back Header: Member summary & Flip back trigger */}
            <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/15 pb-3">
              <div className="space-y-0.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#d0fe1d]">
                  {member.categoryLabel}
                </span>
                <h4 className="font-orbitron font-bold text-base text-white leading-tight">
                  {member.name}
                </h4>
                <p className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase">
                  {member.role}
                </p>
              </div>

              {/* Flip to Photo button */}
              <button
                type="button"
                onClick={(e) => toggleFlip(member.id, e)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/20 text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all cursor-pointer shrink-0"
                title="Flip back to photo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Back Center: Scope & Bio */}
            <div className="relative z-10 space-y-3 py-2">
              <div className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                <span className="text-neutral-500 block text-[10px] font-mono uppercase tracking-wider">Department / Unit:</span>
                <span className="text-white font-medium">{member.department}</span>
              </div>

              {member.bio && (
                <div className="p-2.5 bg-[#0e100d]/90 border border-white/10 rounded-xl">
                  <span className="text-[10px] font-mono text-[#d0fe1d] uppercase tracking-wider block mb-1">
                    Operational Scope:
                  </span>
                  <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Back Contacts List (Click to Call & Mail + 1-Tap Copy) */}
            <div className="relative z-10 space-y-2 pt-2 border-t border-white/15">
              {/* Phone Channel */}
              <div 
                className="flex items-center justify-between gap-2 p-2 bg-[#0e100d] border border-white/15 hover:border-[#d0fe1d]/60 rounded-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`tel:${member.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-neutral-200 hover:text-[#d0fe1d] transition-colors truncate flex-1"
                  title="Direct Phone Dial"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#d0fe1d]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-3 h-3 text-[#d0fe1d]" />
                  </div>
                  <span className="font-mono text-xs truncate tracking-wider font-semibold">
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
              <div 
                className="flex items-center justify-between gap-2 p-2 bg-[#0e100d] border border-white/15 hover:border-[#d0fe1d]/60 rounded-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-neutral-200 hover:text-[#d0fe1d] transition-colors truncate flex-1"
                  title="Send Email"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#d0fe1d]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-3 h-3 text-[#d0fe1d]" />
                  </div>
                  <span className="font-mono text-xs truncate tracking-wider font-semibold">
                    {member.email}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(member.email, `email-${member.id}`, e)}
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

              {/* Socials & Flip to Photo Bottom Button */}
              <div 
                className="flex items-center justify-between pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[#0e100d] border border-white/15 flex items-center justify-center text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[#0e100d] border border-white/15 flex items-center justify-center text-neutral-300 hover:text-black hover:bg-[#d0fe1d] hover:border-[#d0fe1d] transition-all"
                      title="Instagram Handle"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleFlip(member.id, e)}
                  className="inline-flex items-center gap-1 text-[10px] font-rajdhani font-bold uppercase text-neutral-400 hover:text-[#d0fe1d] transition-colors cursor-pointer py-1 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
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

          {/* Quick Flip-All Control Pill */}
          <div className="flex items-center gap-2 bg-[#141612] border border-white/15 p-1.5 rounded-xl self-start md:self-auto shrink-0 shadow-lg">
            <button
              onClick={flipAllToFront}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase transition-all cursor-pointer ${
                !areAllFlipped
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Show photos on all cards"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d0fe1d]" />
              <span>Photos View</span>
            </button>
            <button
              onClick={flipAllToBack}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase transition-all cursor-pointer ${
                areAllFlipped
                  ? 'bg-[#d0fe1d] text-black shadow-[0_0_12px_rgba(208,254,29,0.35)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Flip all cards to direct contacts"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Contacts View</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Jump Bar for Wings */}
        <div className="sticky top-20 z-30 bg-[#0e100d]/90 backdrop-blur-md py-3 border-y border-white/10 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mr-1 hidden sm:inline">
              Jump To Wing:
            </span>
            {TEAM_CATEGORIES.map((cat) => {
              const count = TEAM_MEMBERS.filter((m) => m.category === cat.id).length;
              const isActive = activeSectionId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#d0fe1d] text-black shadow-[0_0_12px_rgba(208,254,29,0.3)]'
                      : 'bg-[#141612] text-neutral-300 hover:text-white border border-white/10 hover:border-[#d0fe1d]/50'
                  }`}
                >
                  <span>{cat.shortLabel}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-neutral-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
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
