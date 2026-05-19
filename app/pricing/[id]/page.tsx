"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Loader2, TrendingUp } from "lucide-react";
import { ManifestResult, EquipmentCategory } from "@/lib/models";
import { getQuote } from "@/lib/store";
import { fmt } from "@/lib/utils";

// Category base costs (KES per unit) — rough market estimates
const CAT_COST_PER_UNIT: Record<string, number> = {
  "Tents & Structures":    4500,
  "Sleeping & Bedding":    800,
  "Furniture & Seating":   1200,
  "Washroom Equipment":    2000,
  "Toiletries & Supplies": 350,
  "Flooring & Decoration": 600,
  "Catering & Kitchen":    1500,
  "Power & Lighting":      3500,
  "Safety & Operations":   900,
};

function estimateCategoryCost(cat: EquipmentCategory): number {
  const base = CAT_COST_PER_UNIT[cat.name] ?? 1000;
  const totalUnits = cat.items.reduce((s, i) => s + i.quantity, 0);
  return base * totalUnits;
}

export default function PricingPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params.id as string;

  const [result,     setResult]     = useState<ManifestResult | null>(null);
  const [marginPct,  setMarginPct]  = useState(20);
  const [laborPct,   setLaborPct]   = useState(15);
  const [miscPct,    setMiscPct]    = useState(8);

  useEffect(() => {
    getQuote(decodeURIComponent(id)).then(q => {
      if (q) setResult(q);
      else router.replace("/history");
    });
  }, [id]);

  const baseCosts = useMemo(() => {
    if (!result) return [];
    return result.categories.map(cat => ({
      cat,
      base: estimateCategoryCost(cat),
    }));
  }, [result]);

  const equipmentTotal = baseCosts.reduce((s, c) => s + c.base, 0);
  const laborCost      = Math.round(equipmentTotal * (laborPct / 100));
  const miscCost       = Math.round(equipmentTotal * (miscPct  / 100));
  const subtotal       = equipmentTotal + laborCost + miscCost;

  // Park fees
  const parkFees = result?.config.includeParkFees
    ? (result.config.parkFeePerPersonPerDay ?? 0) * result.totalGuests * result.config.days
    : 0;
  // Fuel
  const fuelTotal = result?.config.includeFuelCost
    ? (result.config.dailyFuelCost ?? 0) * (result?.config.days ?? 1)
    : 0;
  // Transport
  const transport = result?.config.includeTransport
    ? (result.config.transportCost ?? 0)
    : 0;

  const preMargin  = subtotal + parkFees + fuelTotal + transport;
  const margin     = Math.round(preMargin * (marginPct / 100));
  const grandTotal = preMargin + margin;
  const perGuest   = result && result.totalGuests > 0
    ? Math.round(grandTotal / result.totalGuests)
    : 0;
  const perGuestPerDay = result && result.totalGuests > 0 && result.config.days > 0
    ? Math.round(grandTotal / result.totalGuests / result.config.days)
    : 0;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "#C8922A" }}/>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="glass-btn p-2 rounded-xl">
            <ChevronLeft size={16}/>
          </button>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"#F2D080" }}>
              Pricing — {result.config.clientName || result.config.campName}
            </p>
            <p className="text-xs font-mono" style={{ color:"rgba(200,146,42,0.6)" }}>{result.refNumber}</p>
          </div>
          <TrendingUp size={16} color="#C8922A"/>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Grand total hero */}
        <div className="glass-card p-6 text-center"
          style={{ background:"rgba(200,146,42,0.07)", borderColor:"rgba(200,146,42,0.3)" }}>
          <p className="text-xs mb-1" style={{ color:"rgba(212,200,184,0.5)" }}>Total Quote Value</p>
          <p className="font-bold text-4xl mb-2" style={{ fontFamily:"var(--font-playfair)", color:"#F2D080" }}>
            {fmt(grandTotal)}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div>
              <p className="text-xs" style={{ color:"rgba(212,200,184,0.4)" }}>Per Guest</p>
              <p className="font-bold text-lg" style={{ color:"#C8922A" }}>{fmt(perGuest)}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color:"rgba(212,200,184,0.4)" }}>Per Guest / Day</p>
              <p className="font-bold text-lg" style={{ color:"#C8922A" }}>{fmt(perGuestPerDay)}</p>
            </div>
          </div>
        </div>

        {/* Margin sliders */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Pricing Adjustments</p>
          <div className="flex flex-col gap-5">
            {[
              { label:"Profit Margin",   value:marginPct, set:setMarginPct, color:"#52C788",  max:100 },
              { label:"Labour & Setup",  value:laborPct,  set:setLaborPct,  color:"#52A8E8",  max:50  },
              { label:"Miscellaneous",   value:miscPct,   set:setMiscPct,   color:"#F2B055",  max:30  },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color:"rgba(212,200,184,0.7)" }}>{s.label}</label>
                  <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}%</span>
                </div>
                <input type="range" min={0} max={s.max} step={1} value={s.value}
                  onChange={e => s.set(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${s.color} ${(s.value/s.max)*100}%, rgba(255,255,255,0.12) ${(s.value/s.max)*100}%)`,
                  }} />
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Equipment Cost Breakdown</p>
          <div className="flex flex-col gap-2">
            {baseCosts.map(({ cat, base }) => (
              <div key={cat.name} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                style={{ background:"rgba(255,255,255,0.04)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.colorHex }}/>
                <p className="text-sm flex-1" style={{ color:"rgba(212,200,184,0.8)" }}>{cat.name}</p>
                <p className="text-sm font-semibold" style={{ color: cat.colorHex }}>{fmt(base)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost summary */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Cost Summary</p>
          <div className="flex flex-col gap-2">
            {[
              { label:"Equipment (estimated)",  val:equipmentTotal, color:"rgba(212,200,184,0.8)" },
              { label:`Labour & Setup (${laborPct}%)`, val:laborCost, color:"#52A8E8" },
              { label:`Miscellaneous (${miscPct}%)`,   val:miscCost,  color:"#F2B055" },
              ...(parkFees > 0   ? [{ label:"Park / Conservancy Fees", val:parkFees,  color:"#52C788" }] : []),
              ...(fuelTotal > 0  ? [{ label:"Generator Fuel",          val:fuelTotal, color:"#FF78B0" }] : []),
              ...(transport > 0  ? [{ label:"Transport",               val:transport, color:"#9B8EFF" }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1">
                <p className="text-sm" style={{ color:"rgba(212,200,184,0.6)" }}>{row.label}</p>
                <p className="text-sm font-semibold" style={{ color: row.color }}>{fmt(row.val)}</p>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 mt-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Subtotal</p>
              <p className="text-sm font-bold" style={{ color:"rgba(212,200,184,0.8)" }}>{fmt(preMargin)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Margin ({marginPct}%)</p>
              <p className="text-sm font-bold" style={{ color:"#52C788" }}>{fmt(margin)}</p>
            </div>
            <div className="border-t border-white/10 pt-3 mt-1 flex items-center justify-between">
              <p className="font-bold text-base text-white">Grand Total</p>
              <p className="font-bold text-lg" style={{ color:"#F2D080" }}>{fmt(grandTotal)}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center pb-4" style={{ color:"rgba(212,200,184,0.3)" }}>
          Cost estimates are indicative. Adjust unit costs in Inventory for precise figures.
        </p>
      </main>
    </div>
  );
}
