// ── Store — Firestore-backed, mirrors Android CloudSync + FirebaseManager ──────
// Firestore path: users/{uid}/quotes/{refNum}  → { json: "...", updatedAt: number }
//                 users/{uid}/inventory/{id}   → { json: "...", updatedAt: number }
//                 users/{uid}/settings/app     → settings object
//
// KEY FIX: subscribeQuotes / subscribeInventory now wrap the Firestore listener
// inside onAuthStateChanged so they always use the correct UID even when called
// before Firebase Auth has restored the session from IndexedDB.

import {
  collection, doc, getDoc, setDoc, deleteDoc,
  onSnapshot, Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { ManifestResult, InventoryItem, CampConfig, ToBuyItem } from "./models";

// ── Firestore path helpers (same as FirebaseManager.kt) ──────────────────────

function uidNow(): string {
  return auth.currentUser?.uid ?? "anon";
}
function quotesCol(uid: string)          { return collection(db, "users", uid, "quotes"); }
function quoteDoc(uid: string, ref: string){ return doc(db, "users", uid, "quotes", ref); }
function inventoryCol(uid: string)       { return collection(db, "users", uid, "inventory"); }
function inventoryDoc(uid: string, id: string){ return doc(db, "users", uid, "inventory", id); }
function settingsDocRef(uid: string)     { return doc(db, "users", uid, "settings", "app"); }

// ── Quotes ────────────────────────────────────────────────────────────────────

export async function saveQuote(result: ManifestResult): Promise<void> {
  try {
    await setDoc(quoteDoc(uidNow(), result.refNumber), {
      json: JSON.stringify(result),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) { console.warn("saveQuote failed:", e); }
}

export async function getQuote(ref: string): Promise<ManifestResult | undefined> {
  try {
    const d = await getDoc(quoteDoc(uidNow(), ref));
    if (!d.exists()) return undefined;
    return JSON.parse(d.data().json) as ManifestResult;
  } catch { return undefined; }
}

export async function deleteQuote(ref: string): Promise<void> {
  try { await deleteDoc(quoteDoc(uidNow(), ref)); }
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

/**
 * Auth-aware real-time listener for quotes.
 * Waits for Firebase Auth to resolve before subscribing to Firestore,
 * so the correct UID is always used even on first page load.
 */
export function subscribeQuotes(cb: (quotes: ManifestResult[]) => void): Unsubscribe {
  let firestoreUnsub: Unsubscribe | null = null;

  const authUnsub = onAuthStateChanged(auth, user => {
    // Tear down any previous Firestore subscription
    if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }

    if (!user) { cb([]); return; }

    // User confirmed — subscribe with real UID
    firestoreUnsub = onSnapshot(
      quotesCol(user.uid),
      snap => {
        const quotes = snap.docs
          .map(d => {
            try { return JSON.parse(d.data().json) as ManifestResult; }
            catch { return null; }
          })
          .filter(Boolean)
          .sort((a, b) => (b!.createdAt ?? 0) - (a!.createdAt ?? 0)) as ManifestResult[];
        cb(quotes);
      },
      err => { console.warn("subscribeQuotes error:", err); cb([]); }
    );
  });

  return () => {
    authUnsub();
    if (firestoreUnsub) firestoreUnsub();
  };
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const updated = { ...item, lastUpdated: Date.now() };
  try {
    await setDoc(inventoryDoc(uidNow(), item.id), {
      json: JSON.stringify(updated),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) { console.warn("saveInventoryItem failed:", e); }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try { await deleteDoc(inventoryDoc(uidNow(), id)); }
  catch (e) { console.warn("deleteInventoryItem failed:", e); }
}

export function newInventoryId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Auth-aware real-time listener for inventory.
 */
export function subscribeInventory(cb: (items: InventoryItem[]) => void): Unsubscribe {
  let firestoreUnsub: Unsubscribe | null = null;

  const authUnsub = onAuthStateChanged(auth, user => {
    if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }

    if (!user) { cb([]); return; }

    firestoreUnsub = onSnapshot(
      inventoryCol(user.uid),
      snap => {
        const items = snap.docs
          .map(d => {
            try { return JSON.parse(d.data().json) as InventoryItem; }
            catch { return null; }
          })
          .filter(Boolean) as InventoryItem[];
        cb(items);
      },
      err => { console.warn("subscribeInventory error:", err); cb([]); }
    );
  });

  return () => {
    authUnsub();
    if (firestoreUnsub) firestoreUnsub();
  };
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
  if (auth.currentUser) {
    setDoc(settingsDocRef(auth.currentUser.uid), updated, { merge: true }).catch(console.warn);
  }
}

// ── Ref number — matches Android QuoteRepository.nextRefNumber() ──────────────
// Android format: "REF-%06d" e.g. REF-000001
// Web now matches so quotes created on either platform sort together.

export function nextRefNumber(existingRefs: string[]): string {
  const nums = existingRefs
    .map(r => {
      // Handle both "REF-000001" and old "KFC-0001" formats
      const m = r.match(/(\d+)$/);
      return m ? parseInt(m[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `REF-${String(next).padStart(6, "0")}`;
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
      const inStock   = inv?.quantityAvailable ?? 0;
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
