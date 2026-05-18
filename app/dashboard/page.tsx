"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Tent, Users, Calendar, Plus, History, Package, Settings, LogOut, Trash2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { subscribeQuotes, deleteQuote, nextRefNumber } from "@/lib/store";
import { ManifestResult } from "@/lib/models";
import AIChatPanel from "@/components/ai/AIChatPanel";

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#F2B055", CONFIRMED: "#52A8E8", DEPLOYED: "#52C788", COMPLETED: "rgba(212,200,184,0.5)",
};

export default function DashboardPage() {
  const router = useRouter();
  const [quotes,    setQuotes]    = useState<ManifestResult[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [aiOpen,    setAiOpen]    = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) { router.replace("/auth"); return; }
      setUserEmail(user.email ?? "");
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeQuotes(qs => { setQuotes(qs); setLoading(false); });
    return unsub;
  }, []);

  async function handleDelete(e: React.MouseEvent, ref: string) {
    e.stopPropagation();
    await deleteQuote(ref);
  }

  const totalQuotes = quotes.length;
  const deployed    = quotes.filter(q => q.status === "DEPLOYED").length;
  const clients     = new Set(quotes.map(q => q.config.clientName).filter(Boolean)).size;
  const drafts      = quotes.filter(q => q.isDraft || q.status === "DRAFT").length;
  const recent      = quotes.slice(0, 8);
  const newRef      = nextRefNumber(quotes.map(q => q.refNumber));

  return (
    <div className="min-h-screen page-enter">
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,var(--gold),var(--gold-dark))" }}>
              <Tent size={16} color="white"/>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"var(--gold-light)" }}>
                KuFull CHARGE
              </p>
              <p className="text-xs" style={{ color:"rgba(200,146,42,0.6)" }}>{userEmail || "Camp Platform"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/history")}   className="glass-btn p-2 rounded-xl"><History  size={15}/></button>
            <button onClick={() => router.push("/inventory")} className="glass-btn p-2 rounded-xl"><Package  size={15}/></button>
            <button onClick={() => router.push("/settings")}  className="glass-btn p-2 rounded-xl"><Settings size={15}/></button>
            <button onClick={() => signOut(auth).then(() => router.replace("/auth"))}
              className="glass-btn p-2 rounded-xl" style={{ color:"rgba(255,100,100,0.7)" }}><LogOut size={15}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:"Total Quotes",   val:totalQuotes, color:"var(--gold)",  icon:"📋" },
            { label:"Deployed Camps", val:deployed,    color:"#52C788",      icon:"⛺" },
            { label:"Total Clients",  val:clients,     color:"#52A8E8",      icon:"👥" },
            { label:"Active Drafts",  val:drafts,      color:"#F2B055",      icon:"✏️" },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xl">{s.icon}</span>
                <p className="font-bold text-2xl" style={{ color:s.color }}>{s.val}</p>
              </div>
              <p className="text-xs" style={{ color:"rgba(212,200,184,0.5)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card-elevated p-6 relative overflow-hidden cursor-pointer"
          onClick={() => router.push("/quote/new")}
          style={{ background:"linear-gradient(135deg,rgba(200,146,42,0.12),rgba(200,146,42,0.04))", borderColor:"rgba(200,146,42,0.3)" }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
            style={{ background:"radial-gradient(circle, #C8922A, transparent)" }}/>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="font-bold text-lg mb-1" style={{ fontFamily:"var(--font-playfair)", color:"var(--gold-light)" }}>
                New Quote
              </p>
              <p className="text-sm" style={{ color:"rgba(212,200,184,0.6)" }}>
                7-step wizard · Auto manifest · {newRef}
              </p>
            </div>
            <button className="gold-btn text-sm gap-2"><Plus size={16}/> Create</button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Recent Quotes</p>
            {quotes.length > 8 && (
              <button onClick={() => router.push("/history")} className="text-xs" style={{ color:"rgba(200,146,42,0.7)" }}>
                View all →
              </button>
            )}
          </div>
          {loading ? (
            <div className="glass-card p-8 flex items-center justify-center gap-3">
              <div className="spinner"/>
              <p className="text-sm" style={{ color:"rgba(212,200,184,0.5)" }}>Loading from Firebase…</p>
            </div>
          ) : recent.length === 0 ? (
            <div className="glass-card p-10 flex flex-col items-center gap-4 text-center">
              <p className="text-4xl">🏕</p>
              <p className="font-semibold text-white">No quotes yet</p>
              <p className="text-sm" style={{ color:"rgba(212,200,184,0.5)" }}>Create your first quote to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map(q => {
                const sc = STATUS_COLOR[q.status] ?? "var(--gold)";
                return (
                  <div key={q.refNumber}
                    className="glass-card p-4 flex items-center gap-4 group cursor-pointer"
                    onClick={() => router.push(`/quote/${encodeURIComponent(q.refNumber)}`)}>
                    <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ background:sc }}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-white truncate">
                          {q.config.clientName || q.config.campName || "Untitled"}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background:`${sc}22`, color:sc, border:`1px solid ${sc}44` }}>
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs mb-2 font-mono" style={{ color:"rgba(200,146,42,0.6)" }}>{q.refNumber}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="stat-pill text-xs gap-1"><Users size={9}/>{q.totalGuests}</span>
                        <span className="stat-pill text-xs gap-1"><Tent  size={9}/>{q.totalTents}</span>
                        <span className="stat-pill text-xs gap-1"><Calendar size={9}/>{q.config.days}d</span>
                        {q.config.location && <span className="stat-pill text-xs">{q.config.location.split(",")[0]}</span>}
                      </div>
                    </div>
                    <button onClick={e => handleDelete(e, q.refNumber)}
                      className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ color:"rgba(255,100,100,0.6)", background:"rgba(255,100,100,0.08)" }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <button onClick={() => setAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center ai-pulse z-30"
        style={{ background:"linear-gradient(135deg,var(--gold),var(--gold-dark))", boxShadow:"0 8px 32px rgba(200,146,42,0.45)" }}>
        <span className="text-2xl">✦</span>
      </button>

      {aiOpen && <AIChatPanel onClose={() => setAiOpen(false)}/>}
    </div>
  );
}
