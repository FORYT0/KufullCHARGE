"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Search, Trash2, Edit2, X, Package } from "lucide-react";
import { subscribeInventory, saveInventoryItem, deleteInventoryItem, newInventoryId } from "@/lib/store";
import { InventoryItem, inventoryStatus } from "@/lib/models";
import { fmt } from "@/lib/utils";

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  IN_STOCK:    { color: "#52C788", label: "In Stock" },
  LOW_STOCK:   { color: "#F2B055", label: "Low Stock" },
  OUT_OF_STOCK:{ color: "#FF7A5A", label: "Out of Stock" },
  ON_ORDER:    { color: "#52A8E8", label: "On Order" },
};

const BLANK: Omit<InventoryItem, "id" | "lastUpdated"> = {
  name: "", category: "", totalOwned: 0, quantityAvailable: 0,
  quantityDeployed: 0, reorderThreshold: 5, unitCost: 0, supplier: "", notes: "",
};

function InventoryModal({ item, onSave, onClose }: {
  item: Partial<InventoryItem> & { id?: string };
  onSave: (i: InventoryItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK, ...item });
  const upd = (k: keyof typeof form, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  function save() {
    if (!form.name.trim()) return;
    onSave({ ...form, id: item.id ?? newInventoryId(), lastUpdated: Date.now() } as InventoryItem);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background:"rgba(10,21,16,0.97)", border:"1px solid rgba(255,255,255,0.12)", maxHeight:"90vh", overflowY:"auto" }}>
        <div className="flex items-center gap-3 px-4 py-3.5"
          style={{ background:"rgba(200,146,42,0.1)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <Package size={16} color="var(--gold)"/>
          <p className="font-bold text-sm flex-1" style={{ color:"var(--gold-light)" }}>
            {item.id ? "Edit Item" : "Add Inventory Item"}
          </p>
          <button onClick={onClose} style={{ color:"rgba(255,255,255,0.5)" }}><X size={16}/></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {(["name","category","supplier"] as const).map(k => (
            <div key={k}>
              <label className="text-xs text-white/50 mb-1 block capitalize">{k}{k === "name" ? " *" : ""}</label>
              <input className="glass-input text-sm" value={String(form[k] ?? "")}
                onChange={e => upd(k, e.target.value)}/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {([
              ["totalOwned","Total Owned"],["quantityAvailable","Available"],
              ["quantityDeployed","Deployed"],["reorderThreshold","Reorder At"],
              ["unitCost","Unit Cost (KES)"],
            ] as [keyof typeof form, string][]).map(([k, label]) => (
              <div key={k}>
                <label className="text-xs text-white/50 mb-1 block">{label}</label>
                <input className="glass-input text-sm" type="number" min={0}
                  value={Number(form[k] ?? 0)} onChange={e => upd(k, parseFloat(e.target.value)||0)}/>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Notes</label>
            <textarea className="glass-input resize-none text-sm" rows={2}
              value={form.notes} onChange={e => upd("notes", e.target.value)}/>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="glass-btn flex-1">Cancel</button>
            <button onClick={save} disabled={!form.name.trim()} className="gold-btn flex-1">
              {item.id ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [items,  setItems]  = useState<InventoryItem[]>([]);
  const [loading,setLoading]= useState(true);
  const [search, setSearch] = useState("");
  const [modal,  setModal]  = useState<Partial<InventoryItem> & { id?: string } | null>(null);

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = subscribeInventory(inv => { setItems(inv); setLoading(false); });
    return unsub;
  }, []);

  const filtered = useMemo(() =>
    items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier.toLowerCase().includes(search.toLowerCase())
    ), [items, search]);

  async function handleSave(item: InventoryItem) {
    await saveInventoryItem(item); // Firestore write — listener auto-updates
    setModal(null);
  }

  async function handleDelete(id: string) {
    await deleteInventoryItem(id);
  }

  const totalValue = items.reduce((s, i) => s + i.quantityAvailable * i.unitCost, 0);

  return (
    <div className="min-h-screen page-enter">
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.back()} className="glass-btn p-2 rounded-xl">
              <ChevronLeft size={16}/>
            </button>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ fontFamily:"var(--font-playfair)", color:"var(--gold-light)" }}>
                Inventory
              </p>
              <p className="text-xs" style={{ color:"rgba(200,146,42,0.6)" }}>
                {items.length} items{totalValue > 0 ? ` · ${fmt(totalValue)} est. value` : ""}
              </p>
            </div>
            <button onClick={() => setModal({ ...BLANK })} className="gold-btn py-1.5 px-3 text-xs gap-1.5">
              <Plus size={13}/> Add Item
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.3)" }}/>
            <input className="glass-input pl-9 text-sm py-2.5"
              placeholder="Search items, categories, suppliers…"
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-3">
        {loading ? (
          <div className="glass-card p-8 flex items-center justify-center gap-3">
            <div className="spinner"/>
            <p className="text-sm" style={{ color:"rgba(212,200,184,0.5)" }}>Loading from Firebase…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center gap-4 text-center">
            <Package size={36} color="rgba(200,146,42,0.5)"/>
            <p className="text-white font-semibold">{search ? "No matching items" : "No inventory yet"}</p>
            <p className="text-sm" style={{ color:"rgba(212,200,184,0.5)" }}>
              {search ? "Try a different search term." : "Add items to track what equipment you own."}
            </p>
            {!search && (
              <button onClick={() => setModal({ ...BLANK })} className="gold-btn mt-2">Add First Item</button>
            )}
          </div>
        ) : filtered.map(item => {
          const st = inventoryStatus(item);
          const { color, label } = STATUS_STYLE[st];
          return (
            <div key={item.id} className="glass-card p-4 flex items-center gap-4 group">
              <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ background:color }}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:`${color}22`, color, border:`1px solid ${color}44` }}>
                    {label}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color:"rgba(200,146,42,0.6)" }}>
                  {item.category}{item.supplier ? ` · ${item.supplier}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="stat-pill text-xs">Owned: {item.totalOwned}</span>
                  <span className="stat-pill text-xs" style={{ color }}>Available: {item.quantityAvailable}</span>
                  {item.quantityDeployed > 0 && <span className="stat-pill text-xs">Deployed: {item.quantityDeployed}</span>}
                  {item.unitCost > 0 && <span className="stat-pill text-xs">{fmt(item.unitCost)} ea.</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(item)}
                  className="p-2 rounded-xl" style={{ color:"rgba(200,146,42,0.7)", background:"rgba(200,146,42,0.1)" }}>
                  <Edit2 size={13}/>
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl" style={{ color:"rgba(255,100,100,0.6)", background:"rgba(255,100,100,0.08)" }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {modal && <InventoryModal item={modal} onSave={handleSave} onClose={() => setModal(null)}/>}
    </div>
  );
}
