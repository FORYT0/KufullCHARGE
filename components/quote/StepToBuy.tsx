"use client";
import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Package, AlertCircle } from "lucide-react";
import { ManifestResult, InventoryItem } from "@/lib/models";
import { calculateToBuy, subscribeInventory } from "@/lib/store";
import { fmt } from "@/lib/utils";

interface Props { result: ManifestResult; }

export default function StepToBuy({ result }: Props) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  useEffect(() => {
    const unsub = subscribeInventory(items => setInventory(items));
    return unsub;
  }, []);
  const toBuy = useMemo(() => calculateToBuy(result, inventory), [result, inventory]);

  const grandTotal = toBuy.reduce((s, t) => s + t.estimatedTotal, 0);
  const withCost   = toBuy.filter(t => t.unitCost > 0);
  const noCost     = toBuy.filter(t => t.unitCost <= 0);

  // Group by category
  const byCategory = toBuy.reduce<Record<string, typeof toBuy>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (toBuy.length === 0) {
    return (
      <div className="flex flex-col gap-5 page-enter">
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(82,199,136,0.15)", border: "1px solid rgba(82,199,136,0.3)" }}>
            <Package size={28} color="#52C788" />
          </div>
          <div>
            <p className="font-bold text-base text-white">All Items in Stock!</p>
            <p className="text-sm mt-1" style={{ color: "rgba(212,200,184,0.5)" }}>
              Your inventory covers all equipment for this camp. Nothing to buy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Summary */}
      <div className="glass-card p-4 flex items-center gap-4"
        style={{ background: "rgba(200,146,42,0.06)", borderColor: "rgba(200,146,42,0.25)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(200,146,42,0.2)" }}>
          <ShoppingCart size={18} color="#C8922A" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-white">{toBuy.length} item{toBuy.length !== 1 ? "s" : ""} to purchase</p>
          {grandTotal > 0 && (
            <p className="text-xs mt-0.5" style={{ color: "rgba(212,200,184,0.5)" }}>
              Estimated total: <span style={{ color: "#F2D080" }}>{fmt(grandTotal)}</span>
            </p>
          )}
        </div>
        {noCost.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(242,176,85,0.7)" }}>
            <AlertCircle size={12}/>
            {noCost.length} unpriced
          </div>
        )}
      </div>

      {/* By category */}
      {Object.entries(byCategory).map(([catName, items]) => {
        const catColor = items[0]?.categoryColor ?? "#C8922A";
        const catTotal = items.reduce((s, i) => s + i.estimatedTotal, 0);

        return (
          <div key={catName} className="glass-card overflow-hidden">
            {/* Category header */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: catColor }} />
              <p className="font-semibold text-sm text-white flex-1">{catName}</p>
              {catTotal > 0 && (
                <span className="text-xs font-bold" style={{ color: catColor }}>{fmt(catTotal)}</span>
              )}
            </div>

            {/* Items */}
            <div className="px-4 py-3 flex flex-col gap-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: "rgba(212,200,184,0.85)" }}>{item.name}</p>
                    {item.supplier && (
                      <p className="text-xs mt-0.5" style={{ color: "rgba(212,200,184,0.35)" }}>
                        {item.supplier}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs" style={{ color: "rgba(212,200,184,0.4)" }}>
                        have {item.inStock}
                      </span>
                      <span style={{ color: "rgba(212,200,184,0.3)" }}>·</span>
                      <span className="text-xs font-bold" style={{ color: "#FF7A5A" }}>
                        need {item.shortfall}
                      </span>
                    </div>
                    {item.estimatedTotal > 0 ? (
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "#F2D080" }}>
                        {fmt(item.estimatedTotal)}
                      </p>
                    ) : (
                      <p className="text-xs mt-0.5" style={{ color: "rgba(212,200,184,0.3)" }}>no price</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Grand total */}
      {grandTotal > 0 && (
        <div className="glass-card p-4 flex items-center justify-between"
          style={{ background: "rgba(200,146,42,0.08)", borderColor: "rgba(200,146,42,0.3)" }}>
          <p className="font-semibold text-sm text-white">Estimated Purchase Total</p>
          <p className="font-bold text-lg" style={{ color: "#F2D080" }}>{fmt(grandTotal)}</p>
        </div>
      )}

      {noCost.length > 0 && (
        <div className="glass-card p-4 flex items-start gap-3"
          style={{ background: "rgba(242,176,85,0.05)", borderColor: "rgba(242,176,85,0.2)" }}>
          <AlertCircle size={14} color="rgba(242,176,85,0.7)" className="mt-0.5 flex-shrink-0"/>
          <p className="text-xs" style={{ color: "rgba(212,200,184,0.5)" }}>
            {noCost.length} item{noCost.length !== 1 ? "s" : ""} have no unit cost recorded. Add prices in Inventory to get a complete estimate.
          </p>
        </div>
      )}
    </div>
  );
}
