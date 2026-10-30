import React, { useState } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

export interface ContactPageProps {
  onNavigate?: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    institution: '',
    topic: 'Team Registration Assistance',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative z-20 w-full min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="bg-[#161814] border border-white/20 p-8 sm:p-12 text-left space-y-4">
        <div className="flex items-center gap-4">
          <GcdisLogo size="md" showWordmark={false} />
          <div>
            <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
              GDSL TOURNAMENT SECRETARIAT
            </span>
            <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-wider mt-0.5">
              CONNECT WITH <span className="text-[#d0fe1d]">TOURNAMENT DIRECTORS</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-[#161814] border border-white/20 p-6 sm:p-10 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-orbitron font-black text-white uppercase tracking-wider border-b border-white/15 pb-3">
                SEND AN OFFICIAL INQUIRY
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-4 py-3 bg-[#111210] border border-white/20 text-white text-sm focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider mb-1.5">
                    Official Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="name@university.edu"
                    className="w-full px-4 py-3 bg-[#111210] border border-white/20 text-white text-sm focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider mb-1.5">
                    University / College / Club
                  </label>
                  <input
                    type="text"
                    value={formState.institution}
                    onChange={(e) => setFormState({ ...formState, institution: e.target.value })}
                    placeholder="Institution Name"
                    className="w-full px-4 py-3 bg-[#111210] border border-white/20 text-white text-sm focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    value={formState.topic}
                    onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111210] border border-white/20 text-white text-sm focus:outline-none focus:border-[#d0fe1d]"
                  >
                    <option value="Team Registration Assistance">Team Registration Assistance</option>
                    <option value="Technical Scrutineering & Cage Specs">Technical Scrutineering &amp; Cage Specs</option>
                    <option value="Outstation Accommodation & Transit">Outstation Accommodation &amp; Transit</option>
                    <option value="Corporate Sponsorship & Arena Stalls">Corporate Sponsorship &amp; Arena Stalls</option>
                    <option value="Media & Press Accreditation">Media &amp; Press Accreditation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  required
                  type="text"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  placeholder="Summary of inquiry"
                  className="w-full px-4 py-3 bg-[#111210] border border-white/20 text-white text-sm focus:outline-none focus:border-[#d0fe1d]"
                />
              </div>

              <div>
                <label className="block text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Provide team size, flight requirements, or specific questions..."
                  className="w-full px-4 py-3 bg-[#111210] border border-white/20 text-white text-sm focus:outline-none focus:border-[#d0fe1d]"
                />
              </div>

              <button
                type="submit"
                className="xotc-btn-lime w-full py-3.5 text-xs cursor-pointer"
              >
                Submit Official Message
              </button>
            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 xotc-icon-box flex items-center justify-center mx-auto text-2xl font-black">
                ✓
              </div>
              <h3 className="text-xl font-orbitron font-black text-white uppercase tracking-wider">
                INQUIRY DISPATCHED
              </h3>
              <p className="text-sm text-neutral-300 max-w-md mx-auto">
                Thank you, {formState.name}. A GDSL tournament official has been notified and will reply to {formState.email} within 12 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="xotc-btn-outline mt-4 px-6 py-2.5 text-xs cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* Contact Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#161814] border border-white/20 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-orbitron font-black text-white uppercase tracking-wider border-b border-white/15 pb-3">
              DIRECT DESK CHANNELS
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-rajdhani font-bold text-[#d0fe1d] tracking-widest block uppercase">EMERGENCY PILOT HELPLINES</span>
                <span className="mt-2.5 block space-y-2">
                  {[
                    { label: 'EVENT COORDINATOR', number: '9411053011', display: '+91 94110 53011' },
                    { label: 'EVENT COORDINATOR', number: '9798693029', display: '+91 97986 93029' },
                    { label: 'EVENT COORDINATOR', number: '9569696140', display: '+91 95696 96140' },
                    { label: 'EVENT COORDINATOR', number: '7626040216', display: '+91 76260 40216' },
                  ].map((item, idx) => (
                    <a
                      key={idx}
                      href={`tel:+91${item.number}`}
                      className="group flex items-center justify-between p-2.5 rounded bg-[#111210] border border-white/15 hover:border-[#d0fe1d] hover:bg-[#d0fe1d]/5 transition-all"
                      title={`Call ${item.label} at ${item.display}`}
                    >
                      <div>
                        <span className="block text-[10px] font-mono text-neutral-400 group-hover:text-[#d0fe1d] uppercase tracking-wider font-semibold">
                          {item.label}
                        </span>
                        <span className="text-sm sm:text-base font-orbitron font-bold text-white group-hover:text-[#d0fe1d] tracking-wide transition-colors">
                          {item.display}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-[#d0fe1d] border border-white/20 group-hover:border-[#d0fe1d] px-2.5 py-1 rounded transition-colors uppercase flex items-center gap-1 font-semibold">
                        Call ↗
                      </span>
                    </a>
                  ))}
                </span>
              </div>

              <div>
                <span className="font-rajdhani font-bold text-[#d0fe1d] tracking-widest block uppercase">SUPPORT EMAIL</span>
                <span className="text-sm font-mono font-bold text-neutral-200 mt-0.5 block">{GDSL_TOURNAMENT_INFO.supportEmail}</span>
              </div>

              <div>
                <span className="font-rajdhani font-bold text-[#d0fe1d] tracking-widest block uppercase">SCRUTINEERING HOURS</span>
                <span className="text-neutral-300 font-mono">Mon - Sat · 08:00 - 19:00 IST</span>
              </div>
            </div>
          </div>

          <div className="bg-[#161814] border border-[#d0fe1d]/50 p-6 space-y-3">
            <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.2em]">
              WHATSAPP PILOT COMMUNITY
            </span>
            <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-wider">
              JOIN GDSL 2026 PILOT DISCORD &amp; CHAT
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Connect with fellow team captains, arrange practice scrimmages in the indoor cage, and receive instant weather and schedule updates.
            </p>
            <a
              href={GDSL_TOURNAMENT_INFO.whatsappCommunityLink}
              target="_blank"
              rel="noopener noreferrer"
              className="xotc-btn-lime inline-block px-5 py-2.5 text-xs"
            >
              Open Pilot Community Chat ↗
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
export default ContactPage;
