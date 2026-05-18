"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Trash2, Eye, Users, Tent, Calendar } from "lucide-react";
import { subscribeQuotes, deleteQuote } from "@/lib/store";
import { ManifestResult } from "@/lib/models";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     "#F2B055",
  CONFIRMED: "#52A8E8",
  DEPLOYED:  "#52C788",
  COMPLETED: "rgba(212,200,184,0.5)",
};

export default function HistoryPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<ManifestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<string>("ALL");

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = subscribeQuotes(qs => { setQuotes(qs); setLoading(false); });
    return unsub;
  }, []);

  const filtered = useMemo(() => quotes.filter(q => {
    const matchSearch =
      q.config.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.config.campName.toLowerCase().includes(search.toLowerCase()) ||
      q.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.config.location.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "ALL" || q.status === filter);
  }), [quotes, search, filter]);

  async function handleDelete(e: React.MouseEvent, ref: string) {
    e.stopPropagation();
    await deleteQuote(ref); // Firestore delete — listener auto-updates quotes
  }

  return (
    <div className="min-h-screen page-enter">
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.back()} className="glass-btn p-2 rounded-xl">
              <ChevronLeft size={16}/>
            </button>
            <div>
              <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"var(--gold-light)" }}>
                Quote History
              </p>
              <p className="text-xs" style={{ color:"rgba(200,146,42,0.6)" }}>{quotes.length} total quotes</p>
            </div>
          </div>

          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.3)" }}/>
            <input className="glass-input pl-9 text-sm py-2.5"
              placeholder="Search by client, camp, location…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {["ALL","DRAFT","CONFIRMED","DEPLOYED","COMPLETED"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
                style={{
                  background: filter === s ? "rgba(200,146,42,0.25)" : "rgba(255,255,255,0.06)",
                  color:      filter === s ? "var(--gold-light)"      : "rgba(255,255,255,0.45)",
                  border:     filter === s ? "1px solid rgba(200,146,42,0.35)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                {s === "ALL" ? "All" : s[0] + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-3">
        {loading ? (
          <div className="glass-card p-8 flex items-center justify-center gap-3">
            <div className="spinner"/>
            <p className="text-sm" style={{ color:"rgba(212,200,184,0.5)" }}>Loading from Firebase…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-4xl">🏕</p>
            <p className="text-white font-semibold">No quotes found</p>
            <p className="text-sm" style={{ color:"rgba(212,200,184,0.5)" }}>
              {search ? "Try a different search term." : "Create a new quote to get started."}
            </p>
            {!search && (
              <button onClick={() => router.push("/quote/new")} className="gold-btn mt-2">New Quote</button>
            )}
          </div>
        ) : filtered.map(q => {
          const sc = STATUS_COLORS[q.status] ?? "var(--gold)";
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
                  <span className="stat-pill text-xs gap-1"><Users    size={9}/>{q.totalGuests} guests</span>
                  <span className="stat-pill text-xs gap-1"><Tent     size={9}/>{q.totalTents} tents</span>
                  <span className="stat-pill text-xs gap-1"><Calendar size={9}/>{q.config.days}d</span>
                  {q.config.location && <span className="stat-pill text-xs">{q.config.location.split(",")[0]}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button onClick={e => handleDelete(e, q.refNumber)}
                  className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color:"rgba(255,100,100,0.6)", background:"rgba(255,100,100,0.08)" }}>
                  <Trash2 size={13}/>
                </button>
                <button onClick={e => { e.stopPropagation(); router.push(`/quote/${encodeURIComponent(q.refNumber)}`); }}
                  className="p-2 rounded-xl" style={{ color:"rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.06)" }}>
                  <Eye size={13}/>
                </button>
                <p className="text-xs" style={{ color:"rgba(212,200,184,0.35)" }}>
                  {new Date(q.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}
                </p>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
