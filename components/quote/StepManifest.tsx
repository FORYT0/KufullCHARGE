"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Edit2, Check, X, Printer } from "lucide-react";
import { ManifestResult, EquipmentItem, EquipmentCategory } from "@/lib/models";
import { calculate } from "@/lib/camp-calculator";
import { fmt } from "@/lib/utils";

interface Props {
  result: ManifestResult;
  setResult: (r: ManifestResult) => void;
  refNumber: string;
}

const CAT_ICONS: Record<string, string> = {
  "Tents & Structures":    "⛺",
  "Sleeping & Bedding":    "🛏",
  "Furniture & Seating":   "🪑",
  "Washroom Equipment":    "🚿",
  "Toiletries & Supplies": "🧴",
  "Flooring & Decoration": "🪞",
  "Catering & Kitchen":    "🍽",
  "Power & Lighting":      "⚡",
  "Safety & Operations":   "🩺",
};

function CategoryCard({
  cat, onItemEdit,
}: {
  cat: EquipmentCategory;
  onItemEdit: (catName: string, idx: number, newQty: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  const totalItems = cat.items.reduce((s, i) => s + i.quantity, 0);

  function commitEdit(idx: number) {
    const n = parseInt(editVal);
    if (!isNaN(n) && n >= 0) onItemEdit(cat.name, idx, n);
    setEditIdx(null);
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(o => !o)}>
        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: cat.colorHex }} />
        <span className="text-lg">{CAT_ICONS[cat.name] ?? "📦"}</span>
        <div className="flex-1">
          <p className="font-semibold text-sm text-white">{cat.name}</p>
          <p className="text-xs" style={{ color: "rgba(212,200,184,0.5)" }}>
            {cat.items.length} item type{cat.items.length !== 1 ? "s" : ""} · {totalItems} total units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${cat.colorHex}22`, color: cat.colorHex, border: `1px solid ${cat.colorHex}44` }}>
            {totalItems}
          </span>
          {open ? <ChevronUp size={14} color="rgba(255,255,255,0.4)"/> : <ChevronDown size={14} color="rgba(255,255,255,0.4)"/>}
        </div>
      </button>

      {/* Items */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-1">
          {cat.items.map((item, idx) => (
            <div key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-sm" style={{ color: "rgba(212,200,184,0.8)" }}>{item.name}</p>
              {editIdx === idx ? (
                <div className="flex items-center gap-1">
                  <input
                    className="w-16 text-center text-sm rounded-lg px-2 py-1"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(200,146,42,0.4)", color: "#F2D080" }}
                    value={editVal} autoFocus
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commitEdit(idx); if (e.key === "Escape") setEditIdx(null); }}
                  />
                  <button onClick={() => commitEdit(idx)} className="p-1 rounded-lg" style={{ color: "#52C788" }}><Check size={13}/></button>
                  <button onClick={() => setEditIdx(null)} className="p-1 rounded-lg" style={{ color: "rgba(255,255,255,0.4)" }}><X size={13}/></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: cat.colorHex }}>{item.quantity}</span>
                  <button onClick={() => { setEditIdx(idx); setEditVal(String(item.quantity)); }}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Edit2 size={11}/>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepManifest({ result, setResult, refNumber }: Props) {
  const { categories, totalGuests, totalTents, totalBeds, config } = result;
  const grandTotal = categories.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.quantity, 0), 0);

  function handleItemEdit(catName: string, idx: number, newQty: number) {
    const updated = {
      ...result,
      categories: result.categories.map(c =>
        c.name !== catName ? c : {
          ...c,
          items: c.items.map((item, i) => i === idx ? { ...item, quantity: newQty } : item),
        }
      ),
    };
    setResult(updated);
  }

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Summary strip */}
      <div className="glass-card p-4"
        style={{ background: "rgba(200,146,42,0.06)", borderColor: "rgba(200,146,42,0.25)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-base" style={{ fontFamily: "var(--font-playfair)", color: "#F2D080" }}>
              {config.clientName || config.campName || "Untitled Camp"}
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(200,146,42,0.6)" }}>{refNumber}</p>
          </div>
          <button className="glass-btn text-xs py-1.5 px-3 gap-1.5">
            <Printer size={12}/> Export PDF
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Guests",     val: totalGuests,              color: "#52C788" },
            { label: "Tents",      val: totalTents,               color: "#9B8EFF" },
            { label: "Beds",       val: totalBeds,                color: "#52A8E8" },
            { label: "Total Items",val: grandTotal,               color: "#C8922A" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs" style={{ color: "rgba(212,200,184,0.5)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Camp details strip */}
      <div className="flex flex-wrap gap-2">
        {[
          config.location && { label: config.location },
          config.campType && { label: config.campType },
          { label: `${config.days} day${config.days !== 1 ? "s" : ""}` },
          config.startDate && { label: config.startDate },
          config.selfCatering && { label: "Self-Catering" },
          config.includePower && { label: "Generator" },
          config.includeSolar && { label: "Solar" },
          config.includeMedical && { label: "Medical Kit" },
        ].filter(Boolean).map((t: any, i) => (
          <span key={i} className="stat-pill text-xs">{t.label}</span>
        ))}
      </div>

      {/* Category cards */}
      {categories.map(cat => (
        <CategoryCard key={cat.name} cat={cat} onItemEdit={handleItemEdit} />
      ))}

      {/* Notes */}
      {config.notes && (
        <div className="glass-card p-4">
          <p className="section-label mb-2">Notes</p>
          <p className="text-sm" style={{ color: "rgba(212,200,184,0.7)" }}>{config.notes}</p>
        </div>
      )}
    </div>
  );
}
