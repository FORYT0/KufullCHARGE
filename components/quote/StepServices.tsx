"use client";
import { CampConfig } from "@/lib/models";
import { Zap, Heart, Sun, Gift, UtensilsCrossed } from "lucide-react";

interface Props { config: CampConfig; update: (p: Partial<CampConfig>) => void; }

function Toggle({ label, sub, value, onChange, icon, color }: {
  label:string; sub:string; value:boolean; onChange:(v:boolean)=>void; icon:React.ReactNode; color:string;
}) {
  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `rgba(${hexRgb(color)},0.15)`, border: `1px solid rgba(${hexRgb(color)},0.3)` }}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-sm text-white">{label}</p>
          <p className="text-xs" style={{color:"rgba(212,200,184,0.5)"}}>{sub}</p>
        </div>
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{ background: value ? color : "rgba(255,255,255,0.12)" }}>
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: value ? "translateX(24px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

function hexRgb(hex:string){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`${r},${g},${b}`}

export default function StepServices({ config, update }: Props) {
  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Optional services */}
      <div>
        <p className="section-label mb-3">Optional Services</p>
        <div className="flex flex-col gap-3">
          <Toggle label="Power & Generator" sub="4KVA silent generator, lighting, charging bars"
            value={config.includePower} onChange={v=>update({includePower:v})}
            icon={<Zap size={16} color="#FF78B0"/>} color="#FF78B0" />
          <Toggle label="Medical Kit" sub="First aid kits based on group size"
            value={config.includeMedical} onChange={v=>update({includeMedical:v})}
            icon={<Heart size={16} color="#FF7A5A"/>} color="#FF7A5A" />
          <Toggle label="Solar Lighting" sub="Solar spike path lights included"
            value={config.includeSolar} onChange={v=>update({includeSolar:v})}
            icon={<Sun size={16} color="#F2D080"/>} color="#C8922A" />
          <Toggle label="Welcome Pack" sub="Guest welcome kits, trays, amenities"
            value={config.includeWelcome} onChange={v=>update({includeWelcome:v})}
            icon={<Gift size={16} color="#52C788"/>} color="#52C788" />
          <Toggle label="Self-Catering" sub="Client provides own catering — only mess tents included"
            value={config.selfCatering} onChange={v=>update({selfCatering:v})}
            icon={<UtensilsCrossed size={16} color="#F2B055"/>} color="#F2B055" />
        </div>
      </div>

      {/* Meals config */}
      {!config.selfCatering && (
        <div className="glass-card p-5">
          <p className="section-label mb-4">Catering Settings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Meals Per Day</label>
              <select className="glass-input glass-select" value={config.mealsPerDay}
                onChange={e=>update({mealsPerDay:parseInt(e.target.value)})}>
                <option value={2}>2 — Breakfast + Dinner</option>
                <option value={3}>3 — Breakfast, Lunch, Dinner</option>
                <option value={4}>4 — Three meals + Afternoon tea</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Food Buffer %</label>
              <input className="glass-input" type="number" min={5} max={50}
                value={config.foodBufferPct} onChange={e=>update({foodBufferPct:parseInt(e.target.value)||15})} />
              <p className="text-xs mt-1" style={{color:"rgba(212,200,184,0.4)"}}>Overage for waste/breakage. 15% recommended.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
