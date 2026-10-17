import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Send, 
  MessageSquare, 
  Linkedin, 
  Twitter, 
  Facebook,
  Award,
  Globe,
  Radio,
  Hash
} from 'lucide-react';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
  customHeading?: string;
}

interface PostTemplate {
  id: string;
  name: string;
  icon: string;
  badge: string;
  text: string;
}

export const OFFICIAL_HASHTAGS = [
  '#DroneSoccer',
  '#GDSL2026',
  '#GCDIS',
  '#GalgotiasUniversity',
  '#DroneRacing',
  '#FIDA',
  '#Robotics',
  '#AerialEsports',
  '#TechFest2026',
  '#DroneTech'
];

export const OFFICIAL_GCDIS_TAGS = {
  twitter: '@GCDIS_GU @GalgotiasUni',
  linkedin: 'Galgotias Centre for Drone Intelligence & Simulation (GCDIS)',
  instagram: '@gcdis.official @galgotiasuniversity',
  facebook: '@GCDISGalgotias'
};

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  customHeading = 'Share GDSL 2026 Event'
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('spectator');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gdsl2026.galgotias.edu';
  const shareUrl = baseUrl;

  const templates: PostTemplate[] = [
    {
      id: 'spectator',
      name: 'League Overview',
      icon: '🏆',
      badge: 'TRENDING',
      text: `Get ready for India's premier aerial e-sports tournament! 🚁⚽

The Galgotias Drone Soccer League (GDSL 2026) brings 32 top university squads to compete in supersonic 3D netted cage arenas at 50 km/h!

📅 Dec 02-03, 2026 | Galgotias University, Greater Noida
💰 ₹1,00,000 Prize Pool | FIDA Class 40 & Class 20

Organized by GCDIS (Galgotias Centre for Drone Intelligence & Simulation).`
    },
    {
      id: 'recruitment',
      name: 'Squad Callout',
      icon: '⚡',
      badge: 'PILOTS & TEAMS',
      text: `Calling all drone pilots, robotics engineers & university squads! 🚁🔥

Registrations are LIVE for Galgotias Drone Soccer League 2026! Assemble your 5-pilot crew and battle for national glory in high-octane drone soccer.

🏆 ₹1,00,000 Grand Prize | Free Hospitality & Technical Support
📍 Galgotias University Indoor Sports Arena`
    },
    {
      id: 'tech',
      name: 'GCDIS Tech & AI',
      icon: '🤖',
      badge: 'INNOVATION',
      text: `Real robotics meets high-speed aerial competition! 🚁✨

Exploring telemetry, crash resilience, carbon-polycarbonate protective spheres, and sub-10ms RC telemetry at Galgotias Drone Soccer League 2026.

Sanctioned under FIDA 5th Revision International Rules.`
    }
  ];

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const hashtagsString = includeHashtags ? `\n\n${OFFICIAL_HASHTAGS.join(' ')}` : '';
  const tagsString = includeTags ? `\n\nTagged: ${OFFICIAL_GCDIS_TAGS.twitter}` : '';
  const fullPostText = `${activeTemplate.text}${tagsString}${hashtagsString}\n\n🌐 Details & Registration: ${shareUrl}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullPostText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {}
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {}
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Galgotias Drone Soccer League (GDSL 2026)',
          text: fullPostText,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyText();
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullPostText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullPostText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullPostText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullPostText)}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#151713] border border-[#d0fe1d]/50 shadow-[0_0_60px_rgba(208,254,29,0.15)] overflow-hidden my-auto text-white"
        >
          {/* Header Bar */}
          <div className="bg-[#111210] border-b border-white/15 p-5 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-[#1a1d17] hover:border-[#d0fe1d] border border-white/20 text-white hover:text-[#d0fe1d] transition-colors cursor-pointer"
              aria-label="Close share modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-[10px] font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
              <span>OFFICIAL PROMOTION</span>
              <span>·</span>
              <span>GDSL 2026</span>
            </div>

            <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white uppercase tracking-wider flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-[#d0fe1d]" />
              <span>{customHeading}</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Spread the word about India&apos;s National Aerial E-Sports Championship &amp; GCDIS Innovation.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-rajdhani font-bold uppercase tracking-widest text-neutral-300 mb-2 flex items-center justify-between">
                <span>1. Select Post Preset Theme:</span>
                <span className="text-[10px] text-[#d0fe1d] font-mono">Auto-Formatted Text</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#d0fe1d]/10 border-[#d0fe1d] text-white'
                          : 'bg-[#111210] hover:border-white/40 border-white/15 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-orbitron font-bold text-white flex items-center gap-1.5">
                          <span>{tpl.icon}</span>
                          <span>{tpl.name}</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#d0fe1d]">
                        {tpl.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generated Text Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-rajdhani font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#d0fe1d]" />
                  <span>2. Generated Post Text &amp; Mentions:</span>
                </label>
                <button
                  onClick={handleCopyText}
                  className="text-xs font-mono font-bold text-black bg-[#d0fe1d] hover:bg-[#e2ff54] px-3 py-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Post!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#0d0e0c] text-neutral-200 p-4 border border-white/15 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {fullPostText}
              </div>
            </div>

            {/* Formatting Options Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111210] border border-white/15 p-3">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="w-4 h-4 accent-[#d0fe1d]"
                  />
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#d0fe1d]" /> Include Top Hashtags
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTags}
                    onChange={(e) => setIncludeTags(e.target.checked)}
                    className="w-4 h-4 accent-[#d0fe1d]"
                  />
                  <span>Tag @GCDIS_GU Pages</span>
                </label>
              </div>

              <button
                onClick={handleCopyUrl}
                className="text-xs font-mono font-bold text-[#d0fe1d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedUrl ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Link Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Copy Event URL
                  </span>
                )}
              </button>
            </div>

            {/* Direct Platform Share Buttons */}
            <div>
              <label className="block text-xs font-rajdhani font-bold uppercase tracking-widest text-neutral-300 mb-2.5">
                3. One-Click Social Media Launchers:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {typeof navigator !== 'undefined' && !!navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="col-span-2 sm:col-span-1 p-3 xotc-btn-lime text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>System Share</span>
                  </button>
                )}

                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111210] hover:border-[#d0fe1d] text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <Twitter className="w-4 h-4 text-[#d0fe1d]" />
                  <span>X (Twitter)</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111210] hover:border-[#d0fe1d] text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <Linkedin className="w-4 h-4 text-[#d0fe1d]" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111210] hover:border-[#d0fe1d] text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <MessageSquare className="w-4 h-4 text-[#d0fe1d]" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111210] hover:border-[#d0fe1d] text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <Facebook className="w-4 h-4 text-[#d0fe1d]" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111210] hover:border-[#d0fe1d] text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <Send className="w-4 h-4 text-[#d0fe1d]" />
                  <span>Telegram</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>
              </div>
            </div>

            {/* Official Handles Directory */}
            <div className="bg-[#111210] border border-white/15 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-[#d0fe1d]" />
                <span className="font-orbitron text-xs font-black text-white uppercase tracking-wider">
                  Official GCDIS Social Handles
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-neutral-300 mt-2">
                <div className="flex items-center gap-2 bg-[#171915] px-3 py-1.5 border border-white/10">
                  <span className="text-[#d0fe1d] font-bold">X (Twitter):</span>
                  <span className="text-white">@GCDIS_GU</span>
                </div>
                <div className="flex items-center gap-2 bg-[#171915] px-3 py-1.5 border border-white/10">
                  <span className="text-[#d0fe1d] font-bold">Instagram:</span>
                  <span className="text-white">@gcdis.official</span>
                </div>
                <div className="flex items-center gap-2 bg-[#171915] px-3 py-1.5 border border-white/10">
                  <span className="text-[#d0fe1d] font-bold">LinkedIn:</span>
                  <span className="text-white">GCDIS Galgotias</span>
                </div>
                <div className="flex items-center gap-2 bg-[#171915] px-3 py-1.5 border border-white/10">
                  <span className="text-[#d0fe1d] font-bold">University:</span>
                  <span className="text-white">@GalgotiasUni</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-[#0d0e0c] px-6 py-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-400">
            <span className="text-xs font-mono flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#d0fe1d] animate-pulse" />
              <span>GDSL 2026 Live Tournament Campaign</span>
            </span>
            <button
              onClick={onClose}
              className="xotc-btn-lime w-full sm:w-auto px-6 py-2 text-xs cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default SocialShareModal;
