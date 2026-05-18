"use client";
import { CampConfig } from "@/lib/models";

interface Props { config: CampConfig; update: (p: Partial<CampConfig>) => void; }

function NumField({ label, sub, value, onChange, min, max, step }: {
  label: string; sub?: string; value: number; onChange: (n: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1 block">{label}</label>
      <input className="glass-input" type="number"
        min={min ?? 0} max={max} step={step ?? 1}
        value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} />
      {sub && <p className="text-xs mt-1" style={{ color: "rgba(212,200,184,0.4)" }}>{sub}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string | number; onChange: (v: string) => void;
  options: { label: string; val: string | number }[];
}) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1 block">{label}</label>
      <select className="glass-input glass-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={String(o.val)} value={o.val}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-sm text-white">{label}</p>
        {sub && <p className="text-xs" style={{ color: "rgba(212,200,184,0.5)" }}>{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "#C8922A" : "rgba(255,255,255,0.12)" }}>
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: value ? "translateX(24px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

export default function StepLogistics({ config, update }: Props) {
  const totalGuests = config.vipTents * config.vipOccupancy + config.stdTents * config.stdOccupancy + config.staffTents * config.staffOccupancy;

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* Mess & Dining */}
      <div className="glass-card p-5">
        <p className="section-label mb-4">Mess & Dining Setup</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Mess Tent Size"
            value={config.messTentSize}
            onChange={v => update({ messTentSize: v })}
            options={[
              { label: "Small (6×9 m)", val: "small" },
              { label: "Medium (9×12 m)", val: "medium" },
              { label: "Large (12×15 m)", val: "large" },
              { label: "Extra Large (15×18 m)", val: "xlarge" },
            ]} />
          <NumField label="Mess Tent Seats"
            sub="Leave 0 to auto-calculate from guests"
            value={config.messSeats}
            onChange={v => update({ messSeats: Math.round(v) })}
            min={0} max={500} />
          <NumField label="Chairs Per Guest"
            sub="Dining chairs allocated per guest"
            value={config.outsideChairsPerGuest}
            onChange={v => update({ outsideChairsPerGuest: v })}
            min={1} max={4} step={0.5} />
          <NumField label="Guests Per Table"
            sub="Seats allocated per dining table"
            value={config.guestsPerOutsideTable}
            onChange={v => update({ guestsPerOutsideTable: Math.round(v) })}
            min={2} max={12} />
        </div>
      </div>

      {/* Washroom Configuration */}
      <div className="glass-card p-5">
        <p className="section-label mb-4">Washroom Configuration</p>
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Shared Washrooms (Naivasha Style)"
            sub="Central washroom block instead of individual tent washrooms"
            value={config.sharedNaivashaWashrooms}
            onChange={v => update({ sharedNaivashaWashrooms: v })} />
          {config.sharedNaivashaWashrooms ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <NumField label="Shared Showers"
                sub="Number of shower units in the central block"
                value={config.naivashaShowerCount}
                onChange={v => update({ naivashaShowerCount: Math.round(v) })}
                min={1} max={20} />
              <NumField label="Shared Toilets"
                sub="Number of toilet units in the central block"
                value={config.naivashaToiletCount}
                onChange={v => update({ naivashaToiletCount: Math.round(v) })}
                min={1} max={20} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <NumField label="Guests Per Shower"
                sub="Individual guests sharing one shower"
                value={config.guestsPerShower}
                onChange={v => update({ guestsPerShower: Math.round(v) })}
                min={1} max={20} />
              <NumField label="Guests Per Toilet"
                sub="Individual guests sharing one toilet"
                value={config.guestsPerToilet}
                onChange={v => update({ guestsPerToilet: Math.round(v) })}
                min={1} max={20} />
            </div>
          )}
        </div>
      </div>

      {/* Furniture Ratios */}
      <div className="glass-card p-5">
        <p className="section-label mb-4">Furniture Ratios</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumField label="Bedside Tables — VIP Tents"
            sub="Bedside pedestal units per VIP tent"
            value={config.bedTablesVip}
            onChange={v => update({ bedTablesVip: Math.round(v) })}
            min={0} max={4} />
          <NumField label="Bedside Tables — Standard Tents"
            sub="Bedside pedestal units per Standard tent"
            value={config.bedTablesStd}
            onChange={v => update({ bedTablesStd: Math.round(v) })}
            min={0} max={4} />
          <NumField label="Vehicles / Safari Cars"
            sub="Number of game drive vehicles"
            value={config.numVehicles}
            onChange={v => update({ numVehicles: Math.round(v) })}
            min={0} max={50} />
        </div>
      </div>

      {/* Extras & Fees */}
      <div className="glass-card p-5">
        <p className="section-label mb-4">Extras & Fees</p>
        <div className="flex flex-col gap-4">
          <ToggleRow
            label="Include Park / Conservancy Fees"
            sub="Adds park entry fees to the cost estimate"
            value={config.includeParkFees}
            onChange={v => update({ includeParkFees: v })} />
          {config.includeParkFees && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Guest Type"
                value={config.guestType}
                onChange={v => update({ guestType: v })}
                options={[
                  { label: "Non-Resident", val: "NON_RESIDENT" },
                  { label: "Resident", val: "RESIDENT" },
                  { label: "East African Citizen", val: "CITIZEN" },
                ]} />
              <NumField label="Park Fee Per Person / Day (KES)"
                sub="Daily conservancy or park entry fee"
                value={config.parkFeePerPersonPerDay ?? 0}
                onChange={v => update({ parkFeePerPersonPerDay: Math.round(v) })}
                min={0} max={50000} step={500} />
            </div>
          )}
          <div className="border-t border-white/5 pt-4">
            <ToggleRow
              label="Generator Fuel Allowance"
              sub="Includes daily fuel cost for generator in pricing"
              value={config.includeFuelCost ?? false}
              onChange={v => update({ includeFuelCost: v })} />
          </div>
          {config.includeFuelCost && (
            <NumField label="Daily Fuel Cost (KES)"
              sub="Estimated daily fuel spend for the generator"
              value={config.dailyFuelCost ?? 0}
              onChange={v => update({ dailyFuelCost: Math.round(v) })}
              min={0} max={100000} step={500} />
          )}
          <div className="border-t border-white/5 pt-4">
            <ToggleRow
              label="Transport / Logistics Cost"
              sub="Adds transport to the total estimate"
              value={config.includeTransport ?? false}
              onChange={v => update({ includeTransport: v })} />
          </div>
          {config.includeTransport && (
            <NumField label="Transport Cost — Total (KES)"
              sub="One-way or round-trip total transport"
              value={config.transportCost ?? 0}
              onChange={v => update({ transportCost: Math.round(v) })}
              min={0} max={2000000} step={5000} />
          )}
        </div>
      </div>

      {/* Summary hint */}
      <div className="glass-card p-4 flex items-start gap-3"
        style={{ background: "rgba(200,146,42,0.06)", borderColor: "rgba(200,146,42,0.2)" }}>
        <span style={{ fontSize: 20 }}>✦</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#F2D080" }}>Ready to generate</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(212,200,184,0.55)" }}>
            {totalGuests} guests · {config.vipTents + config.stdTents + config.staffTents} tents · {config.days} day{config.days !== 1 ? "s" : ""}
            {config.sharedNaivashaWashrooms ? " · Shared washrooms" : " · Individual washrooms"}
            {config.includePower ? " · Generator" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
