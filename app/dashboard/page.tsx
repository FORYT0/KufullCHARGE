"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllQuotes, deleteQuote } from "@/lib/store";
import { ManifestResult } from "@/lib/models";
import { fmtDate, statusClass, statusLabel } from "@/lib/utils";
import {
  Tent, History, Package, Settings, Plus, BrainCircuit,
  Trash2, ChevronRight, BarChart3, Users, Calendar, Star,
} from "lucide-react";
import AIChatPanel from "@/components/ai/AIChatPanel";

export default function DashboardPage() {
  const router = useRouter();
  const [quotes,   setQuotes]   = useState<ManifestResult[]>([]);
  const [showAI,   setShowAI]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setQuotes(getAllQuotes());
  }, []);

  const saved    = quotes.filter(q => !q.isDraft);
  const deployed = quotes.filter(q => q.status === "DEPLOYED" || q.status === "COMPLETED").length;
  const uniqueClients = [...new Set(quotes.map(q => q.config.clientName.trim().toLowerCase()).filter(Boolean))].length;

  function handleDelete(ref: string) {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    deleteQuote(ref);
    setQuotes(getAllQuotes());
  }

  function openQuote(q: ManifestResult) {
    router.push(`/quote/${q.refNumber}`);
  }

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(200,146,42,0.2)", border: "1px solid rgba(200,146,42,0.3)" }}>
              <Tent size={18} color="#C8922A" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-playfair)", color: "#F2D080" }}>
                KuFull CHARGE
              </h1>
              <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(200,146,42,0.6)" }}>
                Plan · Pack · Camp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/history")}   className="glass-btn text-xs py-1.5 px-3 gap-1.5"><History size={14}/> History</button>
            <button onClick={() => router.push("/inventory")} className="glass-btn text-xs py-1.5 px-3 gap-1.5"><Package size={14}/> Inventory</button>
            <button onClick={() => router.push("/settings")}  className="glass-btn p-2 rounded-xl"><Settings size={16}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Quotes",   value: saved.length,         icon: <BarChart3 size={18} color="#C8922A"/>, color: "#C8922A" },
            { label: "Deployed Camps", value: deployed || uniqueClients, icon: <Tent size={18} color="#52C788"/>, color: "#52C788" },
            { label: "Total Clients",  value: uniqueClients,        icon: <Users size={18} color="#52A8E8"/>,    color: "#52A8E8" },
            { label: "Active Drafts",  value: quotes.filter(q=>q.isDraft).length, icon: <Calendar size={18} color="#F2B055"/>, color: "#F2B055" },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(${hexToRgb(s.color)},0.15)`, border: `1px solid rgba(${hexToRgb(s.color)},0.25)` }}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: "rgba(212,200,184,0.6)" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* New Quote CTA */}
        <div className="glass-card-elevated p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #C8922A 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="flex items-center justify-between">
            <div>
              <div className="section-label mb-1">Ready to plan?</div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)", color: "#F2D080" }}>
                New Camp Quote
              </h2>
              <p className="text-sm" style={{ color: "rgba(212,200,184,0.65)" }}>
                Build a complete equipment manifest in minutes
              </p>
            </div>
            <button onClick={() => router.push("/quote/new")} className="gold-btn flex-shrink-0">
              <Plus size={18}/> New Quote
            </button>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: "rgba(200,146,42,0.8)" }}>
            Recent Quotes
          </h3>
          {quotes.length > 5 && (
            <button onClick={() => router.push("/history")} className="text-xs flex items-center gap-1" style={{ color: "#C8922A" }}>
              View all <ChevronRight size={12}/>
            </button>
          )}
        </div>

        {quotes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Tent size={48} color="rgba(200,146,42,0.3)" className="mx-auto mb-4" />
            <p className="text-lg font-semibold mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>No quotes yet</p>
            <p className="text-sm" style={{ color: "rgba(212,200,184,0.4)" }}>
              Tap &quot;New Quote&quot; above to create your first camp manifest
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {quotes.slice(0, 6).map(q => (
              <div key={q.refNumber}
                className="glass-card p-4 flex items-center gap-4 cursor-pointer group transition-all duration-200 hover:border-gold/30"
                onClick={() => openQuote(q)}>
                {/* Color accent */}
                <div className="w-1 h-14 rounded-full flex-shrink-0"
                  style={{ background: q.isDraft ? "rgba(255,255,255,0.2)" : "#C8922A" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm truncate" style={{ color: "#F2D080" }}>
                      {q.config.clientName || q.config.campName || "Unnamed"}
                    </span>
                    <span className={statusClass(q.status)}>{statusLabel(q.status)}</span>
                    {q.isDraft && <span className="badge-draft text-xs">Draft</span>}
                  </div>
                  <p className="text-xs truncate" style={{ color: "rgba(212,200,184,0.6)" }}>
                    {q.config.campName || q.config.location || "—"} · {q.config.campType}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="stat-pill text-xs">{q.totalGuests} guests</span>
                    <span className="stat-pill text-xs">{q.totalTents} tents</span>
                    <span className="stat-pill text-xs">{q.config.days} days</span>
                    <span className="text-xs" style={{ color: "rgba(212,200,184,0.4)" }}>{fmtDate(q.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs font-mono" style={{ color: "rgba(200,146,42,0.6)" }}>{q.refNumber}</span>
                  <button onClick={e => { e.stopPropagation(); handleDelete(q.refNumber); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    style={{ color: "#FF7A5A" }}>
                    <Trash2 size={14}/>
                  </button>
                  <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* KuFull AI Floating Button */}
      <button onClick={() => setShowAI(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl ai-pulse flex items-center justify-center z-30 transition-transform hover:scale-110"
        style={{ background: "linear-gradient(135deg, #C8922A, #A07320)", boxShadow: "0 8px 24px rgba(200,146,42,0.5)" }}>
        <BrainCircuit size={24} color="white" />
      </button>

      {showAI && <AIChatPanel onClose={() => setShowAI(false)} />}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
