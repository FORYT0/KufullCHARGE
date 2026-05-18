"use client";
import { CampConfig, CAMP_TYPES, LOCATIONS } from "@/lib/models";

interface Props { config: CampConfig; update: (p: Partial<CampConfig>) => void; }

export default function StepClient({ config, update }: Props) {
  return (
    <div className="flex flex-col gap-5 page-enter">
      <div className="glass-card p-5">
        <p className="section-label mb-4">Client Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Client / Company Name *</label>
            <input className="glass-input" placeholder="e.g. Safaricom PLC"
              value={config.clientName} onChange={e => update({ clientName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Camp Name</label>
            <input className="glass-input" placeholder="e.g. SAF Camp — Mara 2025"
              value={config.campName} onChange={e => update({ campName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Location</label>
            <select className="glass-input glass-select"
              value={config.location} onChange={e => update({ location: e.target.value })}>
              <option value="">Select location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              <option value="Custom">Custom Location</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Camp Type</label>
            <select className="glass-input glass-select"
              value={config.campType} onChange={e => update({ campType: e.target.value })}>
              {CAMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Start Date</label>
            <input className="glass-input" type="date"
              value={config.startDate} onChange={e => update({ startDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Duration (days) *</label>
            <input className="glass-input" type="number" min={1} max={90}
              value={config.days} onChange={e => update({ days: parseInt(e.target.value)||1 })} />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs text-white/50 mb-1 block">Notes</label>
          <textarea className="glass-input resize-none" rows={3}
            placeholder="Special requirements, dietary restrictions, access notes…"
            value={config.notes} onChange={e => update({ notes: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
