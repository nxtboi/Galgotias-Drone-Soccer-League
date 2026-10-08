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
    <div className="relative z-20 w-full min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto space-y-12 text-blue-950">
      {/* Header Banner */}
      <div className="bg-white/95 border border-blue-200/80 rounded-3xl p-8 sm:p-12 shadow-sm text-left space-y-4">
        <div className="flex items-center gap-3">
          <GcdisLogo size="md" showWordmark={false} />
          <div>
            <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest">
              GDSL TOURNAMENT SECRETARIAT
            </span>
            <h1 className="text-2xl sm:text-4xl font-sans font-black text-blue-950 uppercase tracking-tight">
              CONNECT WITH TOURNAMENT DIRECTORS
            </h1>
          </div>
        </div>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Questions regarding squad eligibility, FAI drone cage scrutineering, travel accommodation for outstation teams, or tournament sponsorship? Our organizing committee is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-white border border-blue-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-sans font-black text-blue-950 uppercase border-b border-blue-100 pb-3">
                SEND AN OFFICIAL INQUIRY
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Official Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="name@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    University / College / Club
                  </label>
                  <input
                    type="text"
                    value={formState.institution}
                    onChange={(e) => setFormState({ ...formState, institution: e.target.value })}
                    placeholder="Institution Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={formState.topic}
                    onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Subject *
                </label>
                <input
                  required
                  type="text"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  placeholder="Summary of inquiry"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Provide team size, flight requirements, or specific questions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                Submit Official Message
              </button>
            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl font-black">
                ✓
              </div>
              <h3 className="text-xl font-sans font-black text-blue-950 uppercase">
                INQUIRY DISPATCHED
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you, {formState.name}. A GDSL tournament official has been notified and will reply to {formState.email} within 12 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-full border border-blue-300 text-blue-900 text-xs font-bold uppercase"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* Contact Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-sans font-black text-blue-950 uppercase border-b border-blue-100 pb-3">
              DIRECT DESK CHANNELS
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-mono font-bold text-slate-500 block uppercase">EMERGENCY PILOT HELPLINE</span>
                <span className="text-base font-bold text-blue-950">{GDSL_TOURNAMENT_INFO.emergencyHelpline}</span>
              </div>

              <div>
                <span className="font-mono font-bold text-slate-500 block uppercase">SUPPORT EMAIL</span>
                <span className="text-sm font-bold text-blue-700">{GDSL_TOURNAMENT_INFO.supportEmail}</span>
              </div>

              <div>
                <span className="font-mono font-bold text-slate-500 block uppercase">HOST FACILITY</span>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  Galgotias Centre for Drone Intelligence &amp; Simulation (GCDIS)<br />
                  Galgotias University, Sector 17A, Yamuna Expressway<br />
                  Greater Noida, Gautam Buddha Nagar, UP – 203201
                </p>
              </div>

              <div>
                <span className="font-mono font-bold text-slate-500 block uppercase">SCRUTINEERING HOURS</span>
                <span className="text-slate-700">Mon - Sat · 08:00 - 19:00 IST</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 space-y-3">
            <span className="font-mono text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
              WHATSAPP PILOT COMMUNITY
            </span>
            <h4 className="font-sans font-black text-sm text-blue-950 uppercase">
              JOIN GDSL 2026 PILOT DISCORD &amp; CHAT
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with fellow team captains, arrange practice scrimmages in the indoor cage, and receive instant weather and schedule updates.
            </p>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-sans font-bold text-xs uppercase tracking-wider"
            >
              Open Pilot Community Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
