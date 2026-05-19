"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Tent, Users, Bed, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { ManifestResult } from "@/lib/models";
import { getQuote, saveQuote } from "@/lib/store";
import StepManifest from "@/components/quote/StepManifest";
import StepToBuy    from "@/components/quote/StepToBuy";
import StepPacking  from "@/components/quote/StepPacking";

const TABS = [
  { id: 0, label: "Manifest" },
  { id: 1, label: "To-Buy" },
  { id: 2, label: "Packing" },
];

const STATUS_NEXT: Record<string, string> = {
  DRAFT: "CONFIRMED", CONFIRMED: "DEPLOYED", DEPLOYED: "COMPLETED",
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Mark Confirmed", CONFIRMED: "Mark Deployed", DEPLOYED: "Mark Completed",
};

export default function QuoteViewPage() {
  const router  = useRouter();
  const params  = useParams();
  const id      = params.id as string;
  const [tab,    setTab]    = useState(0);
  const [result, setResult] = useState<ManifestResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getQuote(decodeURIComponent(id)).then(q => {
      if (q) setResult(q);
      else router.replace("/history");
    });
  }, [id]);

  function updateResult(r: ManifestResult) {
    setResult(r);
    saveQuote(r);
  }

  async function advanceStatus() {
    if (!result) return;
    const next = STATUS_NEXT[result.status];
    if (!next) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    const updated = { ...result, status: next as ManifestResult["status"] };
    updateResult(updated);
    setSaving(false);
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "#C8922A" }}/>
      </div>
    );
  }

  const totalGuests = result.totalGuests;
  const totalTents  = result.totalTents;
  const totalBeds   = result.totalBeds;

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="glass-btn p-2 rounded-xl">
                <ChevronLeft size={16}/>
              </button>
              <div>
                <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"#F2D080" }}>
                  {result.config.clientName || result.config.campName || "Untitled Quote"}
                </p>
                <p className="text-xs font-mono" style={{ color:"rgba(200,146,42,0.6)" }}>{result.refNumber}</p>
              </div>
            </div>
            {STATUS_NEXT[result.status] && (
              <button onClick={advanceStatus} disabled={saving} className="gold-btn text-xs py-1.5 px-3 gap-1.5">
                {saving
                  ? <Loader2 size={12} className="animate-spin"/>
                  : <CheckCircle size={12}/>}
                {STATUS_LABEL[result.status]}
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-2 pb-1 overflow-x-auto">
            <span className="stat-pill text-xs whitespace-nowrap"><Users size={11}/> {totalGuests} guests</span>
            <span className="stat-pill text-xs whitespace-nowrap"><Tent  size={11}/> {totalTents} tents</span>
            <span className="stat-pill text-xs whitespace-nowrap"><Bed   size={11}/> {totalBeds} beds</span>
            <span className="stat-pill text-xs whitespace-nowrap"><Calendar size={11}/> {result.config.days} days</span>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-0 mt-1 -mx-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`step-tab ${tab === t.id ? "active" : ""}`}
                style={{ color: tab === t.id ? "#F2D080" : "rgba(255,255,255,0.35)" }}>
                <span className="text-[10px] leading-none whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === 0 && <StepManifest result={result} setResult={updateResult} refNumber={result.refNumber}/>}
        {tab === 1 && <StepToBuy result={result}/>}
        {tab === 2 && <StepPacking result={result}/>}
      </main>
    </div>
  );
}
