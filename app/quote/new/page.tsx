"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Save, Loader2, Tent, Users, Bed, Calendar } from "lucide-react";
import { CampConfig, defaultCampConfig, CAMP_TYPES, LOCATIONS } from "@/lib/models";
import { calculate } from "@/lib/camp-calculator";
import { saveQuote, saveDraft, nextRefNumber } from "@/lib/store";
import StepClient     from "@/components/quote/StepClient";
import StepTents      from "@/components/quote/StepTents";
import StepServices   from "@/components/quote/StepServices";
import StepLogistics  from "@/components/quote/StepLogistics";
import StepManifest   from "@/components/quote/StepManifest";
import StepToBuy      from "@/components/quote/StepToBuy";
import StepPacking    from "@/components/quote/StepPacking";

const STEPS = [
  { id: 0, label: "Client",    short: "1" },
  { id: 1, label: "Tents",     short: "2" },
  { id: 2, label: "Services",  short: "3" },
  { id: 3, label: "Logistics", short: "4" },
  { id: 4, label: "Manifest",  short: "5" },
  { id: 5, label: "To-Buy",   short: "6" },
  { id: 6, label: "Packing",  short: "7" },
];

export default function NewQuotePage() {
  const router  = useRouter();
  const [step,        setStep]        = useState(0);
  const [config,      setConfig]      = useState<CampConfig>(defaultCampConfig());
  const [generating,  setGenerating]  = useState(false);
  const [result,      setResult]      = useState<ReturnType<typeof calculate> | null>(null);
  const [refNumber]                   = useState(() => nextRefNumber([]));

  const update = useCallback((patch: Partial<CampConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  // Computed header stats
  const totalGuests = config.vipTents * config.vipOccupancy + config.stdTents * config.stdOccupancy + config.staffTents * config.staffOccupancy;
  const totalTents  = config.vipTents + config.stdTents + config.staffTents;
  const totalBeds   = config.vipTents + config.stdTents * 2 + config.staffTents * 2;

  function goTo(s: number) {
    if (s < 0) { router.back(); return; }
    if (s >= 4 && !result) return; // can't jump to manifest before generating
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function generateManifest() {
    if (!config.clientName && !config.campName) {
      alert("Please enter a client name or camp name.");
      return setStep(0);
    }
    if (totalTents === 0) {
      alert("Please add at least one tent.");
      return setStep(1);
    }
    if (config.days < 1) {
      alert("Duration must be at least 1 day.");
      return setStep(0);
    }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 400));
    const r = calculate(config, refNumber);
    await saveQuote(r);
    setResult(r);
    setGenerating(false);
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDraft() {
    await saveDraft(config, refNumber);
    router.push("/dashboard");
  }

  async function handleFinish() {
    if (result) await saveQuote({ ...result, status: "CONFIRMED" });
    router.push("/dashboard");
  }

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
                  {step === 0 ? "New Quote" : (config.clientName || config.campName || "New Quote")}
                </p>
                <p className="text-xs font-mono" style={{ color:"rgba(200,146,42,0.6)" }}>{refNumber}</p>
              </div>
            </div>
            <button onClick={handleDraft} className="glass-btn text-xs py-1.5 px-3 gap-1.5">
              <Save size={13}/> Save Draft
            </button>
          </div>

          {/* Animated stats strip — shown from step 1 onwards */}
          {step > 0 && (
            <div className="flex items-center gap-2 pb-1 overflow-x-auto">
              <span className="stat-pill text-xs whitespace-nowrap"><Users size={11}/> {totalGuests} guests</span>
              <span className="stat-pill text-xs whitespace-nowrap"><Tent  size={11}/> {totalTents} tents</span>
              <span className="stat-pill text-xs whitespace-nowrap"><Bed   size={11}/> {totalBeds} beds</span>
              <span className="stat-pill text-xs whitespace-nowrap"><Calendar size={11}/> {config.days} days</span>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex overflow-x-auto gap-0 mt-1 -mx-1">
            {STEPS.map(s => (
              <button key={s.id}
                onClick={() => (s.id <= step || (result && s.id >= 4)) ? goTo(s.id) : undefined}
                className={`step-tab ${step === s.id ? "active" : ""}`}
                style={{ color: step === s.id ? "#F2D080" : "rgba(255,255,255,0.35)" }}>
                <span className="step-num">{s.short}</span>
                <span className="text-[10px] leading-none whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {step === 0 && <StepClient   config={config} update={update} />}
        {step === 1 && <StepTents    config={config} update={update} />}
        {step === 2 && <StepServices config={config} update={update} />}
        {step === 3 && <StepLogistics config={config} update={update} />}
        {step === 4 && result && <StepManifest result={result} setResult={setResult} refNumber={refNumber} />}
        {step === 5 && result && <StepToBuy    result={result} />}
        {step === 6 && result && <StepPacking  result={result} />}
      </main>

      {/* Bottom nav — hidden on manifest+ steps */}
      {step < 4 && (
        <div className="glass-sheet sticky bottom-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} className="glass-btn flex-1">
                <ChevronLeft size={16}/> Previous
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => goTo(step + 1)} className="gold-btn flex-1">
                Next Step <ChevronRight size={16}/>
              </button>
            ) : (
              <button onClick={generateManifest} className="gold-btn flex-1" disabled={generating}>
                {generating ? <><Loader2 size={16} className="animate-spin"/> Generating…</> : "Generate Manifest ✦"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manifest+ footer */}
      {step >= 4 && (
        <div className="glass-sheet sticky bottom-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3">
            <button onClick={() => goTo(step - 1)} className="glass-btn">
              <ChevronLeft size={16}/>
            </button>
            {step < 6 && (
              <button onClick={() => goTo(step + 1)} className="glass-btn flex-1">
                {STEPS[step + 1]?.label} <ChevronRight size={16}/>
              </button>
            )}
            <button onClick={handleFinish} className="gold-btn flex-shrink-0">
              Save & Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
