"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Save } from "lucide-react";
import { getSettings, saveSettings, AppSettings } from "@/lib/store";
import { THEME_PRESETS, ThemePreset, getSavedTheme, saveTheme } from "@/lib/theme";

export default function SettingsPage() {
  const router  = useRouter();
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(() => getSavedTheme());
  const [saved, setSaved] = useState(false);

  function upd(patch: Partial<AppSettings>) {
    setSettings(p => ({ ...p, ...patch }));
    setSaved(false);
  }

  function handleSave() {
    saveSettings({ ...settings, themeName: activeTheme.name, themeBase: activeTheme.base, themeAccent: activeTheme.accent });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleTheme(preset: ThemePreset) {
    setActiveTheme(preset);
    saveTheme(preset); // applies CSS vars immediately + persists
    setSaved(false);
  }

  const darkPresets  = THEME_PRESETS.filter(t => t.isDark);
  const lightPresets = THEME_PRESETS.filter(t => !t.isDark);

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="glass-btn p-2 rounded-xl">
              <ChevronLeft size={16}/>
            </button>
            <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"var(--gold-light)" }}>
              Settings
            </p>
          </div>
          <button onClick={handleSave} className="gold-btn text-xs py-1.5 px-3 gap-1.5">
            {saved ? <Check size={12}/> : <Save size={12}/>}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Company */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Company Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Company Name</label>
              <input className="glass-input" value={settings.companyName}
                onChange={e => upd({ companyName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Subtitle / Tagline</label>
              <input className="glass-input" value={settings.companySubtitle}
                onChange={e => upd({ companySubtitle: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Quote defaults */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Quote Defaults</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Default Duration (days)</label>
              <input className="glass-input" type="number" min={1} max={90}
                value={settings.defaultDays}
                onChange={e => upd({ defaultDays: parseInt(e.target.value) || 3 })} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Default Food Buffer %</label>
              <input className="glass-input" type="number" min={0} max={50}
                value={settings.defaultFoodBuffer}
                onChange={e => upd({ defaultFoodBuffer: parseInt(e.target.value) || 15 })} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Default Margin %</label>
              <input className="glass-input" type="number" min={0} max={100}
                value={settings.defaultMarginPct}
                onChange={e => upd({ defaultMarginPct: parseInt(e.target.value) || 20 })} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Currency</label>
              <select className="glass-input glass-select" value={settings.currency}
                onChange={e => upd({ currency: e.target.value })}>
                <option value="KES">KES — Kenya Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="TZS">TZS — Tanzania Shilling</option>
                <option value="UGX">UGX — Uganda Shilling</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Default Guest Type</label>
              <select className="glass-input glass-select" value={settings.defaultGuestType}
                onChange={e => upd({ defaultGuestType: e.target.value })}>
                <option value="NON_RESIDENT">Non-Resident</option>
                <option value="RESIDENT">Resident</option>
                <option value="CITIZEN">East African Citizen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="glass-card p-5">
          <p className="section-label mb-1">Theme</p>
          <p className="text-xs mb-4" style={{ color:"rgba(212,200,184,0.45)" }}>
            Active: <span style={{ color:"var(--gold-light)" }}>{activeTheme.name}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{ background: activeTheme.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                       color: activeTheme.isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              {activeTheme.isDark ? "Dark" : "Light"}
            </span>
          </p>

          <p className="text-xs font-semibold mb-3" style={{ color:"rgba(212,200,184,0.5)" }}>DARK THEMES</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
            {darkPresets.map(t => {
              const isActive = activeTheme.name === t.name;
              return (
                <button key={t.name} onClick={() => handleTheme(t)}
                  className="flex flex-col items-center gap-2 rounded-xl p-2 transition-all"
                  style={{ border: isActive ? `2px solid var(--gold)` : "2px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-full h-10 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${t.base}, ${t.base}cc)`,
                             border: "1px solid rgba(255,255,255,0.1)" }}/>
                  <p className="text-xs text-center leading-tight" style={{ color: isActive ? "var(--gold-light)" : "rgba(212,200,184,0.65)" }}>
                    {t.name}
                  </p>
                  {isActive && <Check size={10} color="var(--gold)"/>}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold mb-3" style={{ color:"rgba(212,200,184,0.5)" }}>LIGHT THEMES</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {lightPresets.map(t => {
              const isActive = activeTheme.name === t.name;
              return (
                <button key={t.name} onClick={() => handleTheme(t)}
                  className="flex flex-col items-center gap-2 rounded-xl p-2 transition-all"
                  style={{ border: isActive ? `2px solid var(--gold)` : "2px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-full h-10 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${t.base}, ${t.base}cc)`,
                             border: "1px solid rgba(0,0,0,0.1)" }}/>
                  <p className="text-xs text-center leading-tight" style={{ color: isActive ? "var(--gold)" : "rgba(212,200,184,0.65)" }}>
                    {t.name}
                  </p>
                  {isActive && <Check size={10} color="var(--gold)"/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display toggles */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Display</p>
          <div className="flex flex-col gap-4">
            {[
              { key:"autoSaveQuotes", label:"Auto-save quotes",    sub:"Save manifests automatically after generating" },
              { key:"compactCards",   label:"Compact card layout", sub:"Use smaller cards in list views" },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white">{f.label}</p>
                  <p className="text-xs" style={{ color:"rgba(212,200,184,0.5)" }}>{f.sub}</p>
                </div>
                <button onClick={() => upd({ [f.key]: !settings[f.key as keyof AppSettings] } as any)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ background: settings[f.key as keyof AppSettings] ? "var(--gold)" : "rgba(255,255,255,0.12)" }}>
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: settings[f.key as keyof AppSettings] ? "translateX(24px)" : "translateX(0)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-xs" style={{ color:"rgba(212,200,184,0.25)" }}>KuFull CHARGE · Web v1.0</p>
        </div>
      </main>
    </div>
  );
}
