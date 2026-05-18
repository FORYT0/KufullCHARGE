"use client";
import { useState, useMemo } from "react";
import { Check, Package, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { ManifestResult } from "@/lib/models";

interface Props { result: ManifestResult; }

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

export default function StepPacking({ result }: Props) {
  const allItemKeys = useMemo(() =>
    result.categories.flatMap(c => c.items.map(i => `${c.name}::${i.name}`)), [result]);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openCats, setOpenCats] = useState<Set<string>>(
    new Set(result.categories.map(c => c.name))
  );

  function toggleItem(key: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function toggleCat(name: string) {
    setOpenCats(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  function checkAll(catName: string) {
    const cat = result.categories.find(c => c.name === catName);
    if (!cat) return;
    const keys = cat.items.map(i => `${catName}::${i.name}`);
    setChecked(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.add(k));
      return next;
    });
  }

  const totalItems = allItemKeys.length;
  const doneCount  = allItemKeys.filter(k => checked.has(k)).length;
  const pct        = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Progress header */}
      <div className="glass-card p-4"
        style={{ background: pct === 100 ? "rgba(82,199,136,0.08)" : "rgba(200,146,42,0.06)",
                 borderColor: pct === 100 ? "rgba(82,199,136,0.3)" : "rgba(200,146,42,0.2)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-sm" style={{ color: pct === 100 ? "#52C788" : "#F2D080" }}>
              {pct === 100 ? "✦ All packed!" : "Packing Checklist"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(212,200,184,0.5)" }}>
              {doneCount} of {totalItems} items confirmed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: pct === 100 ? "#52C788" : "#F2D080" }}>
              {pct}%
            </span>
            {doneCount > 0 && (
              <button onClick={() => setChecked(new Set())}
                className="p-1.5 rounded-lg"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                <RotateCcw size={13}/>
              </button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#52C788" : "linear-gradient(90deg, #C8922A, #F2D080)",
            }} />
        </div>
      </div>

      {/* Categories */}
      {result.categories.map(cat => {
        const catKeys = cat.items.map(i => `${cat.name}::${i.name}`);
        const catDone = catKeys.filter(k => checked.has(k)).length;
        const allDone = catDone === catKeys.length;
        const isOpen  = openCats.has(cat.name);

        return (
          <div key={cat.name} className="glass-card overflow-hidden">
            {/* Cat header */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: isOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: cat.colorHex }} />
              <span className="text-base">{CAT_ICONS[cat.name] ?? "📦"}</span>
              <p className="font-semibold text-sm text-white flex-1">{cat.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: allDone ? "#52C788" : "rgba(212,200,184,0.4)" }}>
                  {catDone}/{catKeys.length}
                </span>
                {!allDone && (
                  <button onClick={() => checkAll(cat.name)}
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ background: "rgba(200,146,42,0.15)", color: "#C8922A", border: "1px solid rgba(200,146,42,0.2)" }}>
                    All
                  </button>
                )}
                <button onClick={() => toggleCat(cat.name)}>
                  {isOpen
                    ? <ChevronUp size={14} color="rgba(255,255,255,0.4)"/>
                    : <ChevronDown size={14} color="rgba(255,255,255,0.4)"/>}
                </button>
              </div>
            </div>

            {/* Items */}
            {isOpen && (
              <div className="px-4 py-3 flex flex-col gap-1.5">
                {cat.items.map((item, idx) => {
                  const key = `${cat.name}::${item.name}`;
                  const done = checked.has(key);
                  return (
                    <button key={idx} onClick={() => toggleItem(key)}
                      className="flex items-center gap-3 py-2 px-3 rounded-xl text-left transition-all"
                      style={{
                        background: done ? "rgba(82,199,136,0.08)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${done ? "rgba(82,199,136,0.2)" : "transparent"}`,
                      }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: done ? "#52C788" : "rgba(255,255,255,0.1)",
                          border: done ? "none" : "1px solid rgba(255,255,255,0.2)",
                        }}>
                        {done && <Check size={11} color="white" strokeWidth={3}/>}
                      </div>
                      <p className="flex-1 text-sm transition-all"
                        style={{ color: done ? "rgba(212,200,184,0.45)" : "rgba(212,200,184,0.85)",
                                 textDecoration: done ? "line-through" : "none" }}>
                        {item.name}
                      </p>
                      <span className="text-xs font-bold flex-shrink-0"
                        style={{ color: done ? "rgba(82,199,136,0.5)" : cat.colorHex }}>
                        ×{item.quantity}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
