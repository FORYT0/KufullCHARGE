// ── Theme engine — ported from ThemeManager.kt ──────────────────────────────
// Design contract (same as Android):
//   · Only the BASE COLOR changes between dark themes
//   · Gold accent (#C8922A) is NEVER changed for dark themes
//   · Glass card transparency is always preserved
//   · Typography is never altered

const GOLD = "#C8922A";

export interface ThemePreset {
  name:   string;
  base:   string;
  accent: string;
  isDark: boolean;
}

// ── EXACT SAME PRESETS as ThemeManager.kt ────────────────────────────────────
export const THEME_PRESETS: ThemePreset[] = [
  // Dark — base color changes, gold stays gold
  { name: "Forest Midnight", base: "#0D1F1A", accent: GOLD, isDark: true  },
  { name: "Deep Ocean",      base: "#091628", accent: GOLD, isDark: true  },
  { name: "Volcanic Night",  base: "#1C0A08", accent: GOLD, isDark: true  },
  { name: "Royal Amethyst",  base: "#14082A", accent: GOLD, isDark: true  },
  { name: "Sahara Dusk",     base: "#1C1008", accent: GOLD, isDark: true  },
  { name: "Arctic Teal",     base: "#071820", accent: GOLD, isDark: true  },
  { name: "Obsidian Rose",   base: "#1A0814", accent: GOLD, isDark: true  },
  { name: "Copper Canyon",   base: "#1C0F07", accent: GOLD, isDark: true  },
  { name: "Midnight Cobalt", base: "#060F2A", accent: GOLD, isDark: true  },
  { name: "Jungle Green",    base: "#061A0E", accent: GOLD, isDark: true  },
  { name: "Smoky Quartz",    base: "#140F0F", accent: GOLD, isDark: true  },
  { name: "Eclipse Black",   base: "#080808", accent: GOLD, isDark: true  },
  // Light
  { name: "White Day",       base: "#E5E5E5", accent: "#B8860B", isDark: false },
  { name: "Ivory Coast",     base: "#FDF6EC", accent: "#8B5E1A", isDark: false },
  { name: "Sahara Sands",    base: "#F7EFE2", accent: "#96691D", isDark: false },
  { name: "Arctic White",    base: "#F0F6F8", accent: "#1A6A8A", isDark: false },
];

// ── Colour math (same as Kotlin ColorUtils equivalents) ──────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6;               break;
      case b: h = ((r - g) / d + 4) / 6;               break;
    }
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))) * 255);
  };
  return `#${[f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex(h, s, Math.min(1, l + amount));
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex(h, s, Math.max(0, l - amount));
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isColorDark(hex: string): boolean {
  return luminance(hex) < 0.35;
}

// ── Apply theme CSS variables to the document root ───────────────────────────
export function applyTheme(preset: ThemePreset): void {
  if (typeof document === "undefined") return;
  const { base, accent, isDark } = preset;
  const root = document.documentElement;

  const bgDark  = base;
  const bgMid   = isDark ? lighten(base, 0.05) : darken(base, 0.01);
  const bgLight = isDark ? lighten(base, 0.10) : darken(base, 0.03);

  const goldLight = lighten(accent, 0.18);
  const goldDark  = darken(accent, 0.15);

  const textPrimary   = isDark ? "#FFFFFF"  : "#1A1A1A";
  const textSecondary = isDark ? "rgba(212,200,184,0.8)" : "rgba(60,60,60,0.85)";
  const textMuted     = isDark ? "rgba(212,200,184,0.5)" : "rgba(100,100,100,0.7)";

  root.style.setProperty("--bg-dark",        bgDark);
  root.style.setProperty("--bg-mid",         bgMid);
  root.style.setProperty("--bg-light",       bgLight);
  root.style.setProperty("--gold",           accent);
  root.style.setProperty("--gold-light",     goldLight);
  root.style.setProperty("--gold-dark",      goldDark);
  root.style.setProperty("--text-primary",   textPrimary);
  root.style.setProperty("--text-secondary", textSecondary);
  root.style.setProperty("--text-muted",     textMuted);
  root.style.setProperty("--is-dark",        isDark ? "1" : "0");

  // Update body background gradient immediately
  document.body.style.background =
    `linear-gradient(135deg, ${bgDark} 0%, ${bgMid} 40%, ${bgLight} 70%, ${bgDark} 100%)`;
}

// ── Persistence (localStorage) ────────────────────────────────────────────────
const THEME_KEY = "kufull_theme_preset";

export function getSavedTheme(): ThemePreset {
  if (typeof window === "undefined") return THEME_PRESETS[0];
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return THEME_PRESETS[0];
    const saved = JSON.parse(raw);
    // Match by name to get canonical preset, fallback to saved values
    return THEME_PRESETS.find(p => p.name === saved.name) ?? saved ?? THEME_PRESETS[0];
  } catch {
    return THEME_PRESETS[0];
  }
}

export function saveTheme(preset: ThemePreset): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, JSON.stringify(preset));
  applyTheme(preset);
}
