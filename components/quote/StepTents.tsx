"use client";
import { CampConfig } from "@/lib/models";

interface Props { config: CampConfig; update: (p: Partial<CampConfig>) => void; }

function TentCounter({ label, sub, count, onDec, onInc, color }: {
  label: string; sub: string; count: number; onDec: ()=>void; onInc: ()=>void; color: string;
}) {
  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-3 h-10 rounded-full" style={{ background: color }} />
        <div>
          <p className="font-semibold text-sm text-white">{label}</p>
          <p className="text-xs" style={{ color:"rgba(212,200,184,0.5)" }}>{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onDec} disabled={count<=0}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold transition-all"
          style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color: count>0?"white":"rgba(255,255,255,0.2)" }}>−</button>
        <span className="w-8 text-center font-bold text-xl" style={{ color:"#F2D080" }}>{count}</span>
        <button onClick={onInc}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold transition-all"
          style={{ background:"rgba(200,146,42,0.2)", border:"1px solid rgba(200,146,42,0.35)", color:"#C8922A" }}>+</button>
      </div>
    </div>
  );
}

function OccSelect({ label, value, onChange, options }: {
  label: string; value: number; onChange: (n:number)=>void; options: {label:string;val:number}[];
}) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1 block">{label}</label>
      <select className="glass-input glass-select text-sm"
        value={value} onChange={e => onChange(parseInt(e.target.value))}>
        {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function StepTents({ config, update }: Props) {
  const totalGuests = config.vipTents * config.vipOccupancy + config.stdTents * config.stdOccupancy + config.staffTents * config.staffOccupancy;
  const totalTents  = config.vipTents + config.stdTents + config.staffTents;
  const totalBeds   = config.vipTents + config.stdTents * 2 + config.staffTents * 2;

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          {l:"Total Guests", v:totalGuests, c:"#52C788"},
          {l:"Total Tents",  v:totalTents,  c:"#C8922A"},
          {l:"Total Beds",   v:totalBeds,   c:"#52A8E8"},
        ].map(s => (
          <div key={s.l} className="stat-pill gap-2">
            <span className="text-lg font-bold" style={{color:s.c}}>{s.v}</span>
            <span className="text-xs text-white/50">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Tent counters */}
      <div className="flex flex-col gap-3">
        <TentCounter label="VIP Ensuite Tents" sub="1 large 5×6 bed · flushing toilet · ensuite"
          count={config.vipTents} color="#9B8EFF"
          onDec={() => update({ vipTents: Math.max(0, config.vipTents-1) })}
          onInc={() => update({ vipTents: config.vipTents+1 })} />
        <TentCounter label="Standard Tents" sub="2 single 3×6 beds · flushing toilet"
          count={config.stdTents} color="#52C788"
          onDec={() => update({ stdTents: Math.max(0, config.stdTents-1) })}
          onInc={() => update({ stdTents: config.stdTents+1 })} />
        <TentCounter label="Staff / Crew Tents" sub="2 single 3×6 beds · detached washroom"
          count={config.staffTents} color="#F2B055"
          onDec={() => update({ staffTents: Math.max(0, config.staffTents-1) })}
          onInc={() => update({ staffTents: config.staffTents+1 })} />
      </div>

      {/* Occupancy */}
      <div className="glass-card p-5">
        <p className="section-label mb-4">Occupancy Settings</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OccSelect label="VIP Tent Occupancy" value={config.vipOccupancy}
            onChange={v => update({ vipOccupancy: v })}
            options={[{label:"Single (1)",val:1},{label:"Double (2)",val:2}]} />
          <OccSelect label="Standard Tent Occupancy" value={config.stdOccupancy}
            onChange={v => update({ stdOccupancy: v })}
            options={[{label:"Single (1)",val:1},{label:"Double (2)",val:2}]} />
          <OccSelect label="Staff Tent Occupancy" value={config.staffOccupancy}
            onChange={v => update({ staffOccupancy: v })}
            options={[{label:"Double (2)",val:2},{label:"Triple (3)",val:3},{label:"Quad (4)",val:4}]} />
        </div>
      </div>

      {/* Staff mode toggle */}
      {config.staffTents > 0 && (
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-white">Staff-only mode for Crew tents</p>
            <p className="text-xs" style={{color:"rgba(212,200,184,0.5)"}}>Excludes luxury items (slippers, face towels, etc.)</p>
          </div>
          <button onClick={() => update({ naivashaIsStaff: !config.naivashaIsStaff })}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: config.naivashaIsStaff ? "#C8922A" : "rgba(255,255,255,0.12)" }}>
            <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: config.naivashaIsStaff ? "translateX(24px)" : "translateX(0)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
