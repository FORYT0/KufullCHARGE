"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Save } from "lucide-react";
import { getSettings, saveSettings, AppSettings } from "@/lib/store";

interface ThemePreset {
  name: string;
  base: string;
  accent: string;
  dark: boolean;
  preview: string;
}

const THEMES: ThemePreset[] = [
  // Dark themes
  { name: "Forest Midnight",  base:"#0D1F1A", accent:"#C8922A", dark:true,  preview:"linear-gradient(135deg,#0D1F1A,#1A3A2C)" },
  { name: "Obsidian",         base:"#0A0A0F", accent:"#9B8EFF", dark:true,  preview:"linear-gradient(135deg,#0A0A0F,#1A1A2E)" },
  { name: "Savanna Dusk",     base:"#1A1208", accent:"#F2B055", dark:true,  preview:"linear-gradient(135deg,#1A1208,#2D1F0A)" },
  { name: "Deep Ocean",       base:"#071A2F", accent:"#52A8E8", dark:true,  preview:"linear-gradient(135deg,#071A2F,#0D2B4A)" },
  { name: "Crimson Night",    base:"#1A080A", accent:"#FF7A5A", dark:true,  preview:"linear-gradient(135deg,#1A080A,#2E0F12)" },
  { name: "Emerald Dark",     base:"#081A12", accent:"#52C788", dark:true,  preview:"linear-gradient(135deg,#081A12,#0F2E1F)" },
  { name: "Midnight Rose",    base:"#1A0814", accent:"#FF78B0", dark:true,  preview:"linear-gradient(135deg,#1A0814,#2E1022)" },
  { name: "Copper Forge",     base:"#12100A", accent:"#D4834A", dark:true,  preview:"linear-gradient(135deg,#12100A,#221C10)" },
  { name: "Nebula",           base:"#0D0A1A", accent:"#7B6FE8", dark:true,  preview:"linear-gradient(135deg,#0D0A1A,#1A1530)" },
  { name: "Matte Black",      base:"#111111", accent:"#EEEEEE", dark:true,  preview:"linear-gradient(135deg,#111111,#222222)" },
  { name: "Arctic Night",     base:"#0A1520", accent:"#88DDFF", dark:true,  preview:"linear-gradient(135deg,#0A1520,#102030)" },
  { name: "Volcanic",         base:"#1A0C08", accent:"#FF6B35", dark:true,  preview:"linear-gradient(135deg,#1A0C08,#301510)" },
  // Light themes
  { name: "Safari Parchment", base:"#F5EDD8", accent:"#C8922A", dark:false, preview:"linear-gradient(135deg,#F5EDD8,#EDE0C4)" },
  { name: "Clean White",      base:"#F8F8F6", accent:"#2D7A4F", dark:false, preview:"linear-gradient(135deg,#F8F8F6,#EEEEE8)" },
  { name: "Cream & Gold",     base:"#FDF8F0", accent:"#B8860B", dark:false, preview:"linear-gradient(135deg,#FDF8F0,#F5EDD8)" },
  { name: "Linen",            base:"#F2E8D8", accent:"#8B6914", dark:false, preview:"linear-gradient(135deg,#F2E8D8,#E8D8C4)" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [saved, setSaved] = useState(false);

  function upd(patch: Partial<AppSettings>) {
    setSettings(p => ({ ...p, ...patch }));
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function applyTheme(t: ThemePreset) {
    upd({ themeName: t.name, themeBase: t.base, themeAccent: t.accent });
  }

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="glass-btn p-2 rounded-xl">
              <ChevronLeft size={16}/>
            </button>
            <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"#F2D080" }}>Settings</p>
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

        {/* Defaults */}
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
              <select className="glass-input glass-select"
                value={settings.currency}
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
              <select className="glass-input glass-select"
                value={settings.defaultGuestType}
                onChange={e => upd({ defaultGuestType: e.target.value })}>
                <option value="NON_RESIDENT">Non-Resident</option>
                <option value="RESIDENT">Resident</option>
                <option value="CITIZEN">East African Citizen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme presets */}
        <div className="glass-card p-5">
          <p className="section-label mb-1">Theme</p>
          <p className="text-xs mb-4" style={{ color:"rgba(212,200,184,0.45)" }}>
            Currently: <span style={{ color:"#F2D080" }}>{settings.themeName}</span>
          </p>

          {/* Dark themes */}
          <p className="text-xs font-semibold mb-3" style={{ color:"rgba(212,200,184,0.5)" }}>DARK THEMES</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
            {THEMES.filter(t => t.dark).map(t => (
              <button key={t.name} onClick={() => applyTheme(t)}
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition-all"
                style={{
                  border: settings.themeName === t.name
                    ? `2px solid #C8922A`
                    : "2px solid rgba(255,255,255,0.08)",
                }}>
                <div className="w-full h-10 rounded-lg" style={{ background: t.preview }}/>
                {settings.themeName === t.name && (
                  <Check size={10} color="#C8922A"/>
                )}
                <p className="text-xs text-center leading-tight" style={{ color:"rgba(212,200,184,0.65)" }}>
                  {t.name}
                </p>
              </button>
            ))}
          </div>

          {/* Light themes */}
          <p className="text-xs font-semibold mb-3" style={{ color:"rgba(212,200,184,0.5)" }}>LIGHT THEMES</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {THEMES.filter(t => !t.dark).map(t => (
              <button key={t.name} onClick={() => applyTheme(t)}
                className="flex flex-col items-center gap-2 rounded-xl p-2 transition-all"
                style={{
                  border: settings.themeName === t.name
                    ? `2px solid #C8922A`
                    : "2px solid rgba(255,255,255,0.08)",
                }}>
                <div className="w-full h-10 rounded-lg" style={{ background: t.preview }}/>
                {settings.themeName === t.name && (
                  <Check size={10} color="#C8922A"/>
                )}
                <p className="text-xs text-center leading-tight" style={{ color:"rgba(212,200,184,0.65)" }}>
                  {t.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Display */}
        <div className="glass-card p-5">
          <p className="section-label mb-4">Display</p>
          <div className="flex flex-col gap-4">
            {[
              { key:"autoSaveQuotes",  label:"Auto-save quotes",        sub:"Save manifests automatically after generating" },
              { key:"compactCards",    label:"Compact card layout",     sub:"Use smaller cards in list views" },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white">{f.label}</p>
                  <p className="text-xs" style={{ color:"rgba(212,200,184,0.5)" }}>{f.sub}</p>
                </div>
                <button
                  onClick={() => upd({ [f.key]: !settings[f.key as keyof AppSettings] } as any)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ background: settings[f.key as keyof AppSettings] ? "#C8922A" : "rgba(255,255,255,0.12)" }}>
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: settings[f.key as keyof AppSettings] ? "translateX(24px)" : "translateX(0)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color:"rgba(212,200,184,0.25)" }}>KuFull CHARGE · Web v1.0</p>
        </div>
      </main>
    </div>
  );
}
