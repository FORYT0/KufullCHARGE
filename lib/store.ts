// ── Local store — mirrors Firebase Firestore structure using localStorage ──────
import { ManifestResult, InventoryItem, CampConfig } from "./models";

const KEYS = {
  QUOTES:    "kfc_quotes",
  INVENTORY: "kfc_inventory",
  SETTINGS:  "kfc_settings",
};

// ── Quotes ───────────────────────────────────────────────────────────────────

export function getAllQuotes(): ManifestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.QUOTES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveQuote(result: ManifestResult): void {
  const all = getAllQuotes();
  const idx = all.findIndex(q => q.refNumber === result.refNumber);
  if (idx >= 0) all[idx] = result;
  else all.unshift(result);
  localStorage.setItem(KEYS.QUOTES, JSON.stringify(all));
}

export function getQuote(ref: string): ManifestResult | undefined {
  return getAllQuotes().find(q => q.refNumber === ref);
}

export function deleteQuote(ref: string): void {
  const all = getAllQuotes().filter(q => q.refNumber !== ref);
  localStorage.setItem(KEYS.QUOTES, JSON.stringify(all));
}

export function saveDraft(config: CampConfig, ref: string): void {
  const existing = getQuote(ref);
  const draft: ManifestResult = existing
    ? { ...existing, config, isDraft: true }
    : {
        config,
        categories: [],
        totalGuests: 0,
        totalTents: 0,
        totalBeds: 0,
        refNumber: ref,
        createdAt: Date.now(),
        status: "DRAFT",
        isDraft: true,
      };
  saveQuote(draft);
}

// ── Inventory ────────────────────────────────────────────────────────────────

export function getAllInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.INVENTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveInventoryItem(item: InventoryItem): void {
  const all = getAllInventory();
  const idx = all.findIndex(i => i.id === item.id);
  if (idx >= 0) all[idx] = { ...item, lastUpdated: Date.now() };
  else all.push({ ...item, lastUpdated: Date.now() });
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(all));
}

export function deleteInventoryItem(id: string): void {
  const all = getAllInventory().filter(i => i.id !== id);
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(all));
}

export function newInventoryId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  companyName: string;
  companySubtitle: string;
  currency: string;
  defaultMarginPct: number;
  defaultFoodBuffer: number;
  defaultDays: number;
  autoSaveQuotes: boolean;
  compactCards: boolean;
  defaultGuestType: string;
  themeName: string;
  themeBase: string;
  themeAccent: string;
  fontChoice: string;
}

const defaultSettings: AppSettings = {
  companyName: "KuFull CHARGE",
  companySubtitle: "Safari Equipment Specialists",
  currency: "KES",
  defaultMarginPct: 20,
  defaultFoodBuffer: 15,
  defaultDays: 3,
  autoSaveQuotes: true,
  compactCards: false,
  defaultGuestType: "NON_RESIDENT",
  themeName: "Forest Midnight",
  themeBase: "#0D1F1A",
  themeAccent: "#C8922A",
  fontChoice: "playfair",
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch { return defaultSettings; }
}

export function saveSettings(s: Partial<AppSettings>): void {
  const current = getSettings();
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...s }));
}

// ── ToBuy calculator ─────────────────────────────────────────────────────────
import { ToBuyItem, InventoryItem as InvItem } from "./models";
import { inventoryStatus } from "./models";

export function calculateToBuy(result: ManifestResult, inventory: InvItem[]): ToBuyItem[] {
  const items: ToBuyItem[] = [];
  for (const cat of result.categories) {
    for (const eq of cat.items) {
      if (eq.name.startsWith("TOTAL") || eq.quantity <= 0) continue;
      const inv = inventory.find(i =>
        i.name.toLowerCase() === eq.name.toLowerCase() ||
        i.name.toLowerCase().includes(eq.name.toLowerCase().slice(0, 10)) ||
        eq.name.toLowerCase().includes(i.name.toLowerCase().slice(0, 10))
      );
      const inStock = inv?.quantityAvailable ?? 0;
      const shortfall = Math.max(0, eq.quantity - inStock);
      if (shortfall > 0) {
        items.push({
          name: eq.name,
          category: cat.name,
          categoryColor: cat.colorHex,
          needed: eq.quantity,
          inStock,
          shortfall,
          unitCost: inv?.unitCost ?? 0,
          estimatedTotal: shortfall * (inv?.unitCost ?? 0),
          supplier: inv?.supplier ?? "",
        });
      }
    }
  }
  return items;
}
