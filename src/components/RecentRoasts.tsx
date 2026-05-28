import { motion } from "motion/react";
import { Flame, Lock, Share2 } from "lucide-react";
import { RoastRecord } from "../types";
import { ROAST_FLAVORS } from "./RoastForm";

interface RecentRoastsProps {
  roasts: RoastRecord[];
  onSelectRoast: (roast: RoastRecord) => void;
}

export function RecentRoasts({ roasts, onSelectRoast }: RecentRoastsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            Wall of Shame
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Recent public roasts only. Private roasts stay off this wall.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500 border border-slate-800 rounded-full px-2 py-1">
          Opt-in public
        </span>
      </div>

      {roasts.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-6 text-center space-y-2">
          <Lock className="w-6 h-6 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No public roasts yet.</p>
          <p className="text-xs text-slate-600">Be the first brave soul to opt into the public wall.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roasts.map((roast, index) => {
            const flavor = ROAST_FLAVORS.find((item) => item.id === roast.roastStyle);
            return (
              <motion.button
                key={roast.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                type="button"
                onClick={() => onSelectRoast(roast)}
                className="text-left rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-red-900/60 p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 font-mono font-bold mb-2">
                      <span>{flavor?.emoji || "🔥"}</span>
                      <span className="truncate">{flavor?.name || roast.roastStyle}</span>
                    </div>
                    <p className="text-sm text-slate-200 font-display font-semibold line-clamp-2 group-hover:text-white">
                      {roast.result.summary5Words}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-mono font-black text-red-400">{roast.result.roastScore}%</span>
                    <span className="block text-[9px] text-slate-600 uppercase font-mono">damage</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-2 italic">
                  “{roast.result.closingLine}”
                </p>

                <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>{new Date(roast.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> {roast.shareCount || 0}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}
