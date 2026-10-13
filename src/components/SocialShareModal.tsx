import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
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
      name: '🏆 League Overview',
      icon: '🔥',
      badge: 'TRENDING',
      text: `Get ready for India's premier aerial e-sports tournament! 🚁⚽

The Galgotias Drone Soccer League (GDSL 2026) brings 32 top university squads to compete in supersonic 3D netted cage arenas at 50 km/h!

📅 Dec 02-03, 2026 | Galgotias University, Greater Noida
💰 ₹2.5 Lakhs Prize Pool | FIDA Class 40 & Class 20

Organized by GCDIS (Galgotias Centre for Drone Intelligence & Simulation).`
    },
    {
      id: 'recruitment',
      name: '⚡ Squad Callout',
      icon: '🚀',
      badge: 'PILOTS & TEAMS',
      text: `Calling all drone pilots, robotics engineers & university squads! 🚁🔥

Registrations are LIVE for Galgotias Drone Soccer League 2026! Assemble your 5-pilot crew and battle for national glory in high-octane drone soccer.

🏆 ₹1,00,000 Grand Prize | Free Hospitality & Technical Support
📍 Galgotias University Indoor Sports Arena`
    },
    {
      id: 'tech',
      name: '🤖 GCDIS Tech & AI',
      icon: '🧠',
      badge: 'INNOVATION',
      text: `Real robotics meets high-speed aerial competition! 🚁✨

Exploring telemetry, crash resilience, carbon-polycarbonate protective spheres, and sub-10ms RC telemetry at Galgotias Drone Soccer League 2026.

Sanctioned under FIDA 5th Revision International Rules.`
    }
  ];

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Construct final formatted text
  const hashtagsString = includeHashtags ? `\n\n${OFFICIAL_HASHTAGS.join(' ')}` : '';
  const tagsString = includeTags ? `\n\nTagged: ${OFFICIAL_GCDIS_TAGS.twitter}` : '';
  const fullPostText = `${activeTemplate.text}${tagsString}${hashtagsString}\n\n🌐 Details & Registration: ${shareUrl}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullPostText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Galgotias Drone Soccer League (GDSL 2026)',
          text: fullPostText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share dismissed or failed:', err);
      }
    } else {
      handleCopyText();
    }
  };

  // Social direct link generators
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullPostText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullPostText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullPostText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullPostText)}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-200 overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-5 sm:p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close share modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> OFFICIAL PROMOTION
              </span>
              <span className="font-mono text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                GDSL 2026
              </span>
            </div>

            <h3 className="font-sans font-black text-xl sm:text-2xl text-white uppercase tracking-tight flex items-center gap-2">
              <Share2 className="w-6 h-6 text-blue-400" />
              <span>{customHeading}</span>
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
              Spread the word about India&apos;s National Aerial E-Sports Championship &amp; GCDIS Innovation!
            </p>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>1. Select Post Preset Theme:</span>
                <span className="text-[10px] text-blue-700 font-semibold">Auto-Formatted Text</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                          : 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5">
                          <span>{tpl.icon}</span>
                          <span>{tpl.name}</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
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
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>2. Generated Post Text &amp; Mentions:</span>
                </label>
                <button
                  onClick={handleCopyText}
                  className="text-xs font-mono font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-all cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied Post Text!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 border border-slate-800 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-500 selection:text-white max-h-48 overflow-y-auto">
                {fullPostText}
              </div>
            </div>

            {/* Formatting Options Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-blue-600" /> Include Top Hashtags
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTags}
                    onChange={(e) => setIncludeTags(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Tag @GCDIS_GU Pages</span>
                </label>
              </div>

              <button
                onClick={handleCopyUrl}
                className="text-xs font-mono font-bold text-slate-700 hover:text-blue-900 flex items-center gap-1"
              >
                {copiedUrl ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Link Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" /> Copy Event URL
                  </span>
                )}
              </button>
            </div>

            {/* Direct Platform Share Buttons */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                3. One-Click Social Media Launchers:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Native Share / Mobile Sheet */}
                {typeof navigator !== 'undefined' && !!navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>System Share Sheet</span>
                  </button>
                )}

                {/* X / Twitter */}
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-black hover:bg-slate-900 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
                >
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <span>X (Twitter)</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                {/* LinkedIn */}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-700"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-[#25D366] hover:bg-[#1fbd59] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-600"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-[#1877F2] hover:bg-[#125ebd] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-600"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>

                {/* Telegram */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-[#229ED9] hover:bg-[#1b81b3] text-white font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-500"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                  <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                </a>
              </div>
            </div>

            {/* Official Handles Directory */}
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-700" />
                <span className="font-mono text-xs font-black text-blue-950 uppercase tracking-wider">
                  Official GCDIS Social Handles
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Follow and tag official Galgotias Centre for Drone Intelligence &amp; Simulation handles on all posts:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-slate-800">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-bold">X (Twitter):</span>
                  <span className="font-semibold text-slate-900">@GCDIS_GU</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-bold">Instagram:</span>
                  <span className="font-semibold text-slate-900">@gcdis.official</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-bold">LinkedIn:</span>
                  <span className="font-semibold text-slate-900">GCDIS Galgotias</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-bold">University:</span>
                  <span className="font-semibold text-slate-900">@GalgotiasUni</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
            <span className="text-xs font-mono flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>GDSL 2026 Live Tournament Campaign</span>
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
