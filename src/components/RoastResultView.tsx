import { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, Check, Copy, Flame, Share2, Trash2, Twitter } from "lucide-react";
import { RoastRecord } from "../types";
import { ROAST_FLAVORS } from "./RoastForm";

interface RoastResultViewProps {
  roast: RoastRecord;
  onReset: () => void;
  onDelete?: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export function RoastResultView({ roast, onReset, onDelete }: RoastResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(roast.shareCount || 0);
  const activeFlavor = ROAST_FLAVORS.find((flavor) => flavor.id === roast.roastStyle) || ROAST_FLAVORS[0];
  const shareUrl = `${window.location.origin}${window.location.pathname}?r=${roast.id}`;

  const incrementShareCount = async () => {
    try {
      const response = await fetch(`/api/roast/${roast.id}/share`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (response.ok && typeof data?.shareCount === "number") {
        setShareCount(data.shareCount);
      }
    } catch {
      // Sharing should still work even if metrics fail.
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    incrementShareCount();
    setTimeout(() => setCopied(false), 2200);
  };

  const handleTwitterShare = () => {
    const text = `AI just roasted my profile: "${roast.result.summary5Words}"`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    incrementShareCount();
  };

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

        <div className="p-6 md:p-8 space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-slate-800/80 rounded-xl border border-slate-700/80">
                {activeFlavor.emoji}
              </span>
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-red-500 font-bold block">
                  {activeFlavor.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Roasted {new Date(roast.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block">
                  Ego Damage Level
                </span>
                <span className="text-lg font-mono font-black text-red-400">
                  {roast.result.roastScore}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-red-500/20 border-t-red-500 animate-pulse flex items-center justify-center">
                <Flame className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-slate-950/50 border border-slate-800/60 p-4 rounded-xl relative"
          >
            <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block mb-1">
              Redacted Input Preview
            </span>
            <p className="text-slate-300 text-xs italic line-clamp-3">“{roast.rawInput}”</p>
            {!roast.publicOptIn && (
              <p className="mt-2 text-[10px] text-emerald-400 font-mono uppercase tracking-widest">
                Private: not listed on the public wall
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              variants={itemVariants}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-red-500 rounded-full" />
                Vibe Check
              </h3>
              <p className="text-lg font-display font-medium text-white tracking-tight uppercase leading-relaxed font-mono">
                {roast.result.summary5Words}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1 h-3 bg-amber-500 rounded-full" />
                Biggest Red Flag
              </h3>
              <p className="text-sm font-sans font-medium text-amber-300 leading-normal">
                {roast.result.biggestRedFlag}
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden"
          >
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Internet Persona Breakdown
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {roast.result.personaBreakdown}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-red-950/20 border border-red-900/60 rounded-xl p-6 relative overflow-hidden text-center group"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block mb-2 font-bold">
              👑 Final Burn
            </span>
            <p className="text-base sm:text-lg font-display font-bold text-red-200 italic leading-snug px-3">
              “{roast.result.closingLine}”
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-slate-950 px-6 py-5 border-t border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Share2 className="w-3.5 h-3.5" />
            Shared <span className="font-bold text-slate-300">{shareCount} times</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 md:flex-none justify-center px-4 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-500 active:scale-95 text-slate-200 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={handleTwitterShare}
              className="flex-1 md:flex-none justify-center px-4 py-2.5 bg-sky-600 hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              Share on X
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onReset}
          className="px-5 py-2.5 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 text-slate-300 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Roast Another Profile
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-5 py-2.5 hover:bg-red-950/40 border border-red-900/60 hover:border-red-700 active:scale-95 text-red-300 text-xs font-mono font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete This Roast
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
