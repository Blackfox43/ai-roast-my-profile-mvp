import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Skull, Loader2, Sparkles, ShieldCheck, FileText } from "lucide-react";
import { RoastForm } from "./components/RoastForm";
import { RoastResultView } from "./components/RoastResultView";
import { RecentRoasts } from "./components/RecentRoasts";
import { AdBanner } from "./components/AdBanner";
import { CreateRoastResponse, RoastRecord, RoastStyle } from "./types";
import { PoliciesPage } from "./pages/PoliciesPage";

type View = "main" | "policies";
type PolicyView = "privacy" | "terms" | null;

function saveDeleteToken(id: string, token: string) {
  try {
    const existing = JSON.parse(localStorage.getItem("roastDeleteTokens") || "{}");
    existing[id] = token;
    localStorage.setItem("roastDeleteTokens", JSON.stringify(existing));
  } catch {
    // Ignore storage failures in private browsing.
  }
}

function getDeleteToken(id: string): string | null {
  try {
    const existing = JSON.parse(localStorage.getItem("roastDeleteTokens") || "{}");
    return existing[id] || null;
  } catch {
    return null;
  }
}

function removeDeleteToken(id: string) {
  try {
    const existing = JSON.parse(localStorage.getItem("roastDeleteTokens") || "{}");
    delete existing[id];
    localStorage.setItem("roastDeleteTokens", JSON.stringify(existing));
  } catch {
    // Ignore storage failures.
  }
}

function PolicyModal({ view, onClose }: { view: PolicyView; onClose: () => void }) {
  if (!view) return null;

  const isPrivacy = view === "privacy";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isPrivacy ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5 text-red-400" />}
            <h2 className="font-display text-lg font-bold text-white">
              {isPrivacy ? "Privacy Summary" : "Terms Summary"}
            </h2>
          </div>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1.5">
            Close
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto">
          {isPrivacy ? (
            <>
              <p>
                AI Roast My Profile stores the redacted profile text you submit, the generated roast result, creation time, share count, and whether you chose to show it publicly.
              </p>
              <p>
                Emails, phone numbers, and links are automatically hidden before storage. You should still avoid pasting private, sensitive, or third-party information.
              </p>
              <p>
                Public Wall of Shame visibility is opt-in. Share links are accessible to anyone who has the link. A delete key is saved locally in your browser after generation so you can remove your roast anytime.
              </p>
              <p className="text-xs text-slate-500">
                <a href="/policies" className="text-red-400 hover:text-red-300 underline">Read full Privacy Policy →</a>
              </p>
            </>
          ) : (
            <>
              <p>
                This product is satirical parody. It is meant for entertainment and should not be used for harassment, bullying, employment decisions, mental-health judgments, or serious character attacks.
              </p>
              <p>
                Users are responsible for the text they submit and must not paste private information, protected-class attacks, threats, sexual content involving minors, or content they do not have permission to share.
              </p>
              <p>
                Generated results can be imperfect. Treat them as jokes, not facts.
              </p>
              <p className="text-xs text-slate-500">
                <a href="/policies" className="text-red-400 hover:text-red-300 underline">Read full Terms of Service →</a>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("main");
  const [activeRoast, setActiveRoast] = useState<RoastRecord | null>(null);
  const [recentRoasts, setRecentRoasts] = useState<RoastRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialRouteLoading, setInitialRouteLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [policyView, setPolicyView] = useState<PolicyView>(null);

  const fetchRecentRoasts = async () => {
    try {
      const response = await fetch("/api/roasts");
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        setRecentRoasts(data.roasts || []);
      }
    } catch (err) {
      console.error("Failed to load public wall.", err);
    }
  };

  useEffect(() => {
    const handleInitialLoad = async () => {
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get("r");

      if (sharedId) {
        try {
          const response = await fetch(`/api/roast/${sharedId}`);
          const contentType = response.headers.get("content-type") || "";
          if (response.ok && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.record) setActiveRoast(data.record);
          }
        } catch (err) {
          console.error("Failed to fetch shared roast", err);
        }
      }

      await fetchRecentRoasts();
      setInitialRouteLoading(false);
    };

    handleInitialLoad();
  }, []);

  const handleCreateRoast = async (rawInput: string, roastStyle: RoastStyle, publicOptIn: boolean) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput, roastStyle, publicOptIn }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("The backend did not return valid JSON. Check that the API function/server is deployed correctly.");
      }

      const data = (await response.json()) as Partial<CreateRoastResponse> & { error?: string; details?: string };
      if (!response.ok || !data.record) {
        throw new Error(data.error || data.details || "The roaster had a thermal shutdown.");
      }

      if (data.deleteToken) saveDeleteToken(data.record.id, data.deleteToken);
      setActiveRoast(data.record);
      const nextUrl = `${window.location.origin}${window.location.pathname}?r=${data.record.id}`;
      window.history.pushState({ path: nextUrl }, "", nextUrl);
      await fetchRecentRoasts();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during roasting.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveRoast(null);
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: cleanUrl }, "", cleanUrl);
    fetchRecentRoasts();
  };

  const handleSelectRoast = (roast: RoastRecord) => {
    setActiveRoast(roast);
    const nextUrl = `${window.location.origin}${window.location.pathname}?r=${roast.id}`;
    window.history.pushState({ path: nextUrl }, "", nextUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteActiveRoast = async () => {
    if (!activeRoast) return;
    const deleteToken = getDeleteToken(activeRoast.id);
    if (!deleteToken) {
      setErrorMsg("This browser does not have the delete key for that roast.");
      return;
    }

    try {
      const response = await fetch(`/api/roast/${activeRoast.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete the roast.");
      removeDeleteToken(activeRoast.id);
      handleReset();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not delete the roast.");
    }
  };

  if (initialRouteLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <span className="font-mono text-xs tracking-widest text-slate-500 uppercase animate-pulse">
            Preheating combustion chamber...
          </span>
        </div>
      </div>
    );
  }

  if (view === "policies") {
    return (
      <>
        <PoliciesPage />
        <button
          onClick={() => setView("main")}
          className="fixed bottom-6 right-6 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-4 py-2 bg-slate-900/50 hover:bg-slate-800/50 transition z-40"
        >
          ← Back to App
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-500 selection:text-white pb-16 flex flex-col relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-radial from-red-600/10 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />

      <main className="flex-grow w-full max-w-3xl mx-auto px-4 md:px-6 pt-10 md:pt-16 space-y-8 z-10">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-900/60 p-2 py-1.5 rounded-full px-4 shadow-inner">
            <Flame className="w-4 h-4 text-red-500 animate-bounce" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-red-400 font-black">
              Satirical AI Bio Critic
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-bold md:font-black tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI Roast My Profile
          </h1>
          
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Paste a social bio, choose a flavor, and get a shareable satirical profile roast with privacy-first MVP guardrails.
          </p>
        </header>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-950/60 border border-red-900 rounded-xl text-center text-xs text-red-200 font-mono space-y-2"
          >
            <p className="font-bold flex items-center justify-center gap-2">
              <Skull className="w-4 h-4 text-red-500" />
              COULD NOT SPIT FIRE
            </p>
            <p>{errorMsg}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeRoast ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <RoastResultView
                roast={activeRoast}
                onReset={handleReset}
                onDelete={getDeleteToken(activeRoast.id) ? handleDeleteActiveRoast : undefined}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              <RoastForm onSubmit={handleCreateRoast} loading={loading} />
              <RecentRoasts roasts={recentRoasts} onSelectRoast={handleSelectRoast} />
            </motion.div>
          )}
        </AnimatePresence>

        <AdBanner />
      </main>

      <footer className="mt-auto pt-16 text-center text-[11px] font-mono text-slate-600 flex flex-col items-center justify-center gap-2 px-4 w-full">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span>AI Roast My Profile</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-red-600">
            Powered by <Sparkles className="w-3 h-3 text-red-500 fill-current" /> Gemini
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <button onClick={() => setView("policies")} className="hover:text-slate-300 underline">Full Policies</button>
          <span>•</span>
          <button onClick={() => setPolicyView("privacy")} className="hover:text-slate-300">Privacy</button>
          <button onClick={() => setPolicyView("terms")} className="hover:text-slate-300">Terms</button>
        </div>
        <p className="text-[10px] text-slate-600 max-w-sm">
          Satirical parody only. Do not use this for harassment or serious judgment.
        </p>
      </footer>

      <PolicyModal view={policyView} onClose={() => setPolicyView(null)} />
    </div>
  );
}
