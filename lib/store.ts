// ── Store — Firestore-backed, mirrors Android CloudSync structure ─────────────
// Firestore path: users/{uid}/quotes/{refNum}  → { json: "...", updatedAt: number }
//                 users/{uid}/inventory/{id}   → { json: "...", updatedAt: number }
//                 users/{uid}/settings/app     → settings object

import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { ManifestResult, InventoryItem, CampConfig, ToBuyItem } from "./models";

// ── Firestore path helpers (same as FirebaseManager.kt) ──────────────────────

function uid(): string {
  return auth.currentUser?.uid ?? "anon";
}
function quotesCol()          { return collection(db, "users", uid(), "quotes"); }
function quoteDoc(ref: string){ return doc(db, "users", uid(), "quotes", ref); }
function inventoryCol()       { return collection(db, "users", uid(), "inventory"); }
function inventoryDoc(id: string){ return doc(db, "users", uid(), "inventory", id); }
function settingsDocRef()     { return doc(db, "users", uid(), "settings", "app"); }

// ── Quotes ────────────────────────────────────────────────────────────────────

export async function getAllQuotes(): Promise<ManifestResult[]> {
  try {
    const snap = await getDocs(quotesCol());
    return snap.docs
      .map(d => { try { return JSON.parse(d.data().json) as ManifestResult; } catch { return null; } })
      .filter(Boolean)
      .sort((a, b) => (b!.createdAt ?? 0) - (a!.createdAt ?? 0)) as ManifestResult[];
  } catch { return []; }
}

export async function saveQuote(result: ManifestResult): Promise<void> {
  try {
    await setDoc(quoteDoc(result.refNumber), {
      json: JSON.stringify(result),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) { console.warn("saveQuote failed:", e); }
}

export async function getQuote(ref: string): Promise<ManifestResult | undefined> {
  try {
    const d = await getDoc(quoteDoc(ref));
    if (!d.exists()) return undefined;
    return JSON.parse(d.data().json) as ManifestResult;
  } catch { return undefined; }
}

export async function deleteQuote(ref: string): Promise<void> {
  try { await deleteDoc(quoteDoc(ref)); }
  catch (e) { console.warn("deleteQuote failed:", e); }
}

export async function saveDraft(config: CampConfig, ref: string): Promise<void> {
  const existing = await getQuote(ref);
  const draft: ManifestResult = existing
    ? { ...existing, config, isDraft: true }
    : { config, categories: [], totalGuests: 0, totalTents: 0, totalBeds: 0,
        refNumber: ref, createdAt: Date.now(), status: "DRAFT", isDraft: true };
  await saveQuote(draft);
}

/** Real-time listener — calls back whenever the user's quotes change */
export function subscribeQuotes(cb: (quotes: ManifestResult[]) => void): Unsubscribe {
  return onSnapshot(quotesCol(), snap => {
    const quotes = snap.docs
      .map(d => { try { return JSON.parse(d.data().json) as ManifestResult; } catch { return null; } })
      .filter(Boolean)
      .sort((a, b) => (b!.createdAt ?? 0) - (a!.createdAt ?? 0)) as ManifestResult[];
    cb(quotes);
  }, err => { console.warn("subscribeQuotes error:", err); cb([]); });
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function getAllInventory(): Promise<InventoryItem[]> {
  try {
    const snap = await getDocs(inventoryCol());
    return snap.docs
      .map(d => { try { return JSON.parse(d.data().json) as InventoryItem; } catch { return null; } })
      .filter(Boolean) as InventoryItem[];
  } catch { return []; }
}

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const updated = { ...item, lastUpdated: Date.now() };
  try {
    await setDoc(inventoryDoc(item.id), {
      json: JSON.stringify(updated),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) { console.warn("saveInventoryItem failed:", e); }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try { await deleteDoc(inventoryDoc(id)); }
  catch (e) { console.warn("deleteInventoryItem failed:", e); }
}

export function newInventoryId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function subscribeInventory(cb: (items: InventoryItem[]) => void): Unsubscribe {
  return onSnapshot(inventoryCol(), snap => {
    const items = snap.docs
      .map(d => { try { return JSON.parse(d.data().json) as InventoryItem; } catch { return null; } })
      .filter(Boolean) as InventoryItem[];
    cb(items);
  }, err => { console.warn("subscribeInventory error:", err); cb([]); });
}

// ── Settings ──────────────────────────────────────────────────────────────────

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

const DEFAULT_SETTINGS: AppSettings = {
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

const SETTINGS_LS_KEY = "kufull_settings_local";

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(s: Partial<AppSettings>): void {
  const updated = { ...getSettings(), ...s };
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(updated));
  }
  // Also push to Firestore if logged in
  if (auth.currentUser) {
    setDoc(settingsDocRef(), updated, { merge: true }).catch(console.warn);
  }
}

// ── Ref number ────────────────────────────────────────────────────────────────

export function nextRefNumber(existingRefs: string[]): string {
  const nums = existingRefs
    .map(r => parseInt(r.replace(/\D/g, ""), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `KFC-${String(next).padStart(4, "0")}`;
}

// ── To-Buy calculator ─────────────────────────────────────────────────────────

export function calculateToBuy(result: ManifestResult, inventory: InventoryItem[]): ToBuyItem[] {
  const items: ToBuyItem[] = [];
  for (const cat of result.categories) {
    for (const eq of cat.items) {
      if (eq.quantity <= 0) continue;
      const inv = inventory.find(i =>
        i.name.toLowerCase() === eq.name.toLowerCase() ||
        i.name.toLowerCase().includes(eq.name.toLowerCase().slice(0, 12)) ||
        eq.name.toLowerCase().includes(i.name.toLowerCase().slice(0, 12))
      );
      const inStock  = inv?.quantityAvailable ?? 0;
      const shortfall = Math.max(0, eq.quantity - inStock);
      if (shortfall > 0) {
        items.push({
          name: eq.name, category: cat.name, categoryColor: cat.colorHex,
          needed: eq.quantity, inStock, shortfall,
          unitCost: inv?.unitCost ?? 0,
          estimatedTotal: shortfall * (inv?.unitCost ?? 0),
          supplier: inv?.supplier ?? "",
        });
      }
    }
  }
  return items;
}
