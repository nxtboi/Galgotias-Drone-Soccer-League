import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Linkedin, 
  Instagram, 
  Search, 
  Users, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Building,
  HeartHandshake,
  Globe
} from 'lucide-react';
import { TEAM_CATEGORIES, TEAM_MEMBERS, TeamMember } from '../data/teamData';
import { GcdisLogo } from '../components/GcdisLogo';

export interface OurTeamPageProps {
  onNavigate: (page: string) => void;
}

export const OurTeamPage: React.FC<OurTeamPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter((member) => {
      const matchesCategory =
        selectedCategory === 'all' || member.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.department.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return TEAM_MEMBERS.length;
    return TEAM_MEMBERS.filter((m) => m.category === catId).length;
  };

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 bg-[#0e100d] text-white overflow-hidden">
      {/* Background Ambient Lighting */}
      <div 
        className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#d0fe1d]/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[#38bdf8]/5 blur-[140px] rounded-full pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Breadcrumb & Navigation */}
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

        {/* Page Hero Header */}
        <div className="text-left space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.22em] text-[#d0fe1d]">
            <Users className="w-3.5 h-3.5" />
            <span>GCDIS SECRETARIAT &amp; STEERING COMMITTEE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-orbitron font-black text-white uppercase tracking-wider leading-tight">
            MEET THE <span className="text-[#d0fe1d]">ORGANIZING TEAM</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans max-w-3xl">
            The steering committee, flight scrutineers, drone intelligence researchers, and student leaders behind the Galgotias Drone Soccer League 2026. Reach out directly to any vertical lead below for tournament inquiries, scrutineering support, or outstation pilot logistics.
          </p>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-pulse" />
              <span>17 Core Coordinators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/20">|</span>
              <span>6 Specialized Wings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/20">|</span>
              <span>Direct Phone &amp; Email Directory</span>
            </div>
          </div>
        </div>

        {/* Search & Department Filters (Segmented Controls inspired by Techkriti) */}
        <div className="space-y-6 bg-[#141612] border border-white/10 p-5 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, role, department, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#0e100d] border border-white/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#d0fe1d] focus:ring-1 focus:ring-[#d0fe1d] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-neutral-400">
              Showing <span className="text-[#d0fe1d] font-bold">{filteredMembers.length}</span> of {TEAM_MEMBERS.length} members
            </div>
          </div>

          {/* Department Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TEAM_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              const count = getCategoryCount(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#d0fe1d] text-black shadow-[0_0_15px_rgba(208,254,29,0.35)]'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{category.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-black/20 text-black font-black'
                        : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Member Cards Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between bg-[#141612] border border-white/10 hover:border-[#d0fe1d]/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_10px_35px_rgba(208,254,29,0.18)] transition-all duration-300"
                >
                  {/* Top Photo & Badge */}
                  <div className="relative aspect-[4/3.8] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback in case of broken image URL
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    {/* Dark gradient overlay for bottom text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141612] via-transparent to-black/30 pointer-events-none" />

                    {/* Category Label Tag on top-left */}
                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black/75 backdrop-blur-md border border-[#d0fe1d]/50 text-[#d0fe1d] rounded">
                        {member.categoryLabel}
                      </span>
                    </div>

                    {/* Social handles on top-right */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-[#d0fe1d] hover:border-[#d0fe1d] transition-all"
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
                          className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-[#d0fe1d] hover:border-[#d0fe1d] transition-all"
                          title="Instagram Profile"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-1.5">
                      <h3 className="font-orbitron font-bold text-base sm:text-lg text-white group-hover:text-[#d0fe1d] transition-colors leading-snug">
                        {member.name}
                      </h3>
                      <div className="font-rajdhani text-xs sm:text-sm font-bold text-[#d0fe1d] leading-snug">
                        {member.role}
                      </div>
                      <div className="text-xs text-neutral-400 font-sans leading-relaxed">
                        {member.department}
                      </div>
                      {member.bio && (
                        <p className="text-[11px] text-neutral-500 font-sans leading-relaxed pt-1 line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    {/* Contact Channels (Phone & Email with instant click-to-copy) */}
                    <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                      {/* Phone Channel */}
                      <div className="flex items-center justify-between gap-2 p-2 bg-[#0e100d] border border-white/10 rounded-lg group/phone">
                        <a
                          href={`tel:${member.phone.replace(/\s+/g, '')}`}
                          className="flex items-center gap-2 text-neutral-300 hover:text-[#d0fe1d] transition-colors truncate"
                          title="Call directly"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#d0fe1d] shrink-0" />
                          <span className="font-mono text-[11px] truncate">{member.phone}</span>
                        </a>
                        <button
                          onClick={() => copyToClipboard(member.phone, `phone-${member.id}`)}
                          className="text-neutral-400 hover:text-white transition-colors p-1"
                          title="Copy phone number"
                        >
                          {copiedId === `phone-${member.id}` ? (
                            <Check className="w-3.5 h-3.5 text-[#d0fe1d]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Email Channel */}
                      <div className="flex items-center justify-between gap-2 p-2 bg-[#0e100d] border border-white/10 rounded-lg group/email">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-neutral-300 hover:text-[#d0fe1d] transition-colors truncate"
                          title="Send email"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#d0fe1d] shrink-0" />
                          <span className="font-mono text-[11px] truncate">{member.email}</span>
                        </a>
                        <button
                          onClick={() => copyToClipboard(member.email, `email-${member.id}`)}
                          className="text-neutral-400 hover:text-white transition-colors p-1"
                          title="Copy email address"
                        >
                          {copiedId === `email-${member.id}` ? (
                            <Check className="w-3.5 h-3.5 text-[#d0fe1d]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#141612] border border-white/10 rounded-2xl space-y-4 max-w-xl mx-auto">
            <Search className="w-8 h-8 text-neutral-500 mx-auto" />
            <h3 className="font-orbitron font-bold text-lg text-white">No Team Members Found</h3>
            <p className="text-xs text-neutral-400">
              No coordinators match your current filter or search query. Try clearing the search or selecting &ldquo;All Wings&rdquo;.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="xotc-btn-outline px-4 py-2 text-xs cursor-pointer inline-flex items-center gap-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Vertical Specific Direct Inquiries (Inspired by Techkriti Direct Contact Blocks) */}
        <div className="space-y-6 pt-10 border-t border-white/15">
          <div className="text-left space-y-2">
            <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
              DIRECT COMMUNICATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
              SPECIFIC DESK INQUIRIES
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Need assistance with a specific operational area? Contact the dedicated vertical mailboxes directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Sponsorships */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Corporate Alliances</h4>
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

            {/* Box 2: Scrutineering */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Avionics &amp; Tech Specs</h4>
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

            {/* Box 3: Hospitality */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <Building className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Outstation Hospitality</h4>
                <p className="text-xs text-neutral-400">Campus hostel suites, shuttle transfers &amp; pilot pit arrangements.</p>
              </div>
              <a
                href="mailto:hospitality@gdsl2026.org"
                className="text-xs font-mono text-[#d0fe1d] hover:underline flex items-center gap-1.5"
              >
                <span>hospitality@gdsl2026.org</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Box 4: General Helpline */}
            <div className="p-6 bg-[#141612] border border-white/10 rounded-2xl text-left space-y-4 hover:border-[#d0fe1d] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-[#d0fe1d]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-orbitron font-bold text-sm text-white uppercase">Main Secretariat</h4>
                <p className="text-xs text-neutral-400">Collegiate registrations, certificate validation &amp; event draw.</p>
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
                North India&apos;s biggest intercollegiate drone soccer arena at Galgotias University. 32 team slots · ₹2,00,000 prize purse · Dec 08–09, 2026.
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
