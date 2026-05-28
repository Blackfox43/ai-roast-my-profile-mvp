import { useState } from "react";
import { DollarSign, ShieldAlert, X } from "lucide-react";

export function AdBanner() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="relative bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-4 overflow-hidden my-6">
      <button
        onClick={() => setClosed(true)}
        className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
        title="Dismiss sponsored placeholder"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col items-center justify-center text-center space-y-2 py-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/40 border border-amber-900/60 text-[9px] font-mono text-amber-400 uppercase font-black tracking-wider">
          <DollarSign className="w-3 h-3" /> Sponsored Space
        </div>

        <div className="text-xs text-slate-400 font-sans max-w-md">
          <p className="font-semibold text-slate-300 mb-1">Monetization-ready placeholder</p>
          <p className="text-[11px] text-slate-500">
            Replace this card with AdSense or a sponsor block after your policies, moderation, and domain approval are ready.
          </p>
        </div>

        <div className="mt-3 w-full bg-slate-950/80 rounded-lg p-2.5 text-left border border-slate-800">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
            <ShieldAlert className="w-3 h-3 text-red-500" /> Production note
          </p>
          <code className="block text-[10px] font-mono text-slate-400 bg-slate-950 p-1.5 rounded overflow-x-auto leading-normal">
            Use ad networks only after adding full Terms, Privacy Policy, reporting, and content moderation rules.
          </code>
        </div>
      </div>
    </div>
  );
}
