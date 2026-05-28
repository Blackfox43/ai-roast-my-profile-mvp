import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Terminal, Flame, Info, ShieldCheck } from "lucide-react";
import { RoastStyle, RoastFlavorDefinition } from "../types";

export const ROAST_FLAVORS: RoastFlavorDefinition[] = [
  {
    id: "corporate",
    name: "LinkedIn Buzzword Overlord",
    emoji: "👔",
    description: "For synergy addicts, keynote warriors, and hustle-culture prophets."
  },
  {
    id: "influencer",
    name: "Aesthetic Influencer",
    emoji: "✨",
    description: "For perfect grids, vague gratitude captions, and collab energy."
  },
  {
    id: "chronically_online",
    name: "Chronically Online Doomposter",
    emoji: "🦖",
    description: "For terminally active hot takes and comment-section warfare."
  },
  {
    id: "crypto_bro",
    name: "Web3 Hype Bro",
    emoji: "🚀",
    description: "For diamond hands, NFT destiny, and imaginary utility."
  },
  {
    id: "main_character",
    name: "Main Character Syndrome",
    emoji: "👑",
    description: "For people turning grocery runs into cinematic plot arcs."
  }
];

const SAMPLE_BIOS = [
  {
    style: "corporate" as RoastStyle,
    text: "Passionate disruptor, agile certified operator, and VP of global synergy. Leveraging paradigm shifts daily. Coffee is my fuel. Let's make an impact together."
  },
  {
    style: "influencer" as RoastStyle,
    text: "Just a small-town traveler discovering herself in Bali. Manifesting my reality with matcha latte walks. Live. Love. Collab. DM to create magic."
  },
  {
    style: "chronically_online" as RoastStyle,
    text: "Muted. Blocked. Reported. Professional hot-take machine. Spent 14 hours arguing whether soup is technically cereal. Standard media enjoyer."
  },
  {
    style: "crypto_bro" as RoastStyle,
    text: "Decentralized evangelist. Founder of MoonCoin and NFT Apes. Passive yield farmer. Building the new paradigm of digital identity. HODL or stay poor."
  },
  {
    style: "main_character" as RoastStyle,
    text: "I am a chaotic neutral storm of thoughts. You either get my energy or stand outside my orbit. Writing my autobiographical pilot script in my head."
  }
];

const loadingTexts = [
  "Analyzing internet persona...",
  "Removing private details before ignition...",
  "Consulting the satire engine...",
  "Measuring main character pressure...",
  "Translating buzzwords into reality...",
  "Preparing a roast that can still pass policy...",
  "Polishing the final burn..."
];

interface RoastFormProps {
  onSubmit: (input: string, style: RoastStyle, publicOptIn: boolean) => void;
  loading: boolean;
}

export function RoastForm({ onSubmit, loading }: RoastFormProps) {
  const [input, setInput] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<RoastStyle>("corporate");
  const [publicOptIn, setPublicOptIn] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  React.useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSubmit(input, selectedStyle, publicOptIn);
  };

  const loadRandomBio = () => {
    const matched = SAMPLE_BIOS.filter((bio) => bio.style === selectedStyle);
    const randomBio = matched[Math.floor(Math.random() * matched.length)];
    setInput(randomBio.text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3 flex gap-2 text-xs text-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            MVP safety upgrade: emails, links, and phone numbers are hidden before storage. Public wall sharing is now optional.
          </p>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-500" />
              Social Media Bio / Profile Text
            </label>
            <button
              type="button"
              onClick={loadRandomBio}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 bg-red-950/35 border border-red-900/40 px-2.5 py-1 rounded-md w-fit"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-fill Bad Bio
            </button>
          </div>

          <div className="relative">
            <textarea
              className="w-full h-40 bg-slate-950/80 border border-slate-800 focus:border-red-500 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono text-sm leading-relaxed transition-all resize-none"
              placeholder="Paste a LinkedIn tagline, X bio, Instagram profile, or dating app prompt. Avoid private info."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              maxLength={1000}
            />
            <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500">
              {input.length}/1000 chars
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 block mb-3">
            Choose Your Roast Flavor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ROAST_FLAVORS.map((flavor) => {
              const isSelected = selectedStyle === flavor.id;
              return (
                <button
                  type="button"
                  key={flavor.id}
                  onClick={() => setSelectedStyle(flavor.id)}
                  disabled={loading}
                  className={`text-left p-4 rounded-xl border transition-all relative ${
                    isSelected
                      ? "border-red-500 bg-slate-800 text-white shadow-lg"
                      : "border-slate-800/70 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/40 hover:text-slate-200"
                  }`}
                >
                  <div className="flex gap-2.5 items-center">
                    <span className="text-2xl">{flavor.emoji}</span>
                    <span className="font-display font-medium text-[13px] leading-tight">
                      {flavor.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {flavor.description}
                  </p>
                  {isSelected && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 border-2 rounded-xl border-red-500 pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={publicOptIn}
            disabled={loading}
            onChange={(e) => setPublicOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 accent-red-600"
          />
          <span className="space-y-1">
            <span className="block text-sm text-slate-200 font-medium">Show this anonymously on the Wall of Shame</span>
            <span className="block text-xs text-slate-500 leading-relaxed">
              Off by default for privacy. Your share link will still work either way.
            </span>
          </span>
        </label>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 flex gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            This app creates satirical parody. Do not paste private, sensitive, or third-party information.
          </p>
        </div>

        <div className="pt-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center justify-center p-6 bg-slate-950/90 border border-red-900/40 rounded-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-950/5 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 border-4 border-red-500/25 border-t-red-500 rounded-full animate-spin" />
                    <Flame className="w-5 h-5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                  <motion.p
                    key={loadingTextIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-sm font-mono text-red-400 h-5 text-center"
                  >
                    {loadingTexts[loadingTextIndex]}
                  </motion.p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 w-full text-center">
                    AI generation may take a few seconds.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="submit-button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!input.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-display font-bold py-4 rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2"
              >
                <Flame className="w-5 h-5" />
                Roast This Profile
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
}
