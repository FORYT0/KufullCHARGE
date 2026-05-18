// ── CampCalculator — ported from Android CampCalculator.kt ────────────────────
import { CampConfig, EquipmentCategory, EquipmentItem, ManifestResult } from "./models";

function item(name: string, qty: number): EquipmentItem {
  return { name, quantity: qty };
}
function cat(name: string, color: string, items: EquipmentItem[]): EquipmentCategory {
  return { name, colorHex: color, items };
}

function ceil(n: number) { return Math.ceil(n); }
function maxN(a: number, b: number) { return Math.max(a, b); }

export function calculate(c: CampConfig, ref: string): ManifestResult {

  const STAFF_DEFAULT_EXCLUSIONS = new Set([
    "Bed pockets", "Small closable dustbins (tents)", "Vanity basins (ensuite)",
    "Bed slippers (waffle)", "Face towels", "Bath mats", "Plastic Mkeka - Big (verandah)",
    "Outdoor folding chairs (tents)", "Verandah metal tables", "Bedside wooden folding stools",
    "Dining chairs (mess tent)", "Plastic Mkeka (Naivasha bedroom)",
  ]);

  function isExcluded(name: string): boolean {
    if (!c.naivashaIsStaff) return false;
    if (c.staffExclusions === "NONE") return false;
    const set = c.staffExclusions.trim()
      ? new Set(c.staffExclusions.split(",").map(s => s.trim()))
      : STAFF_DEFAULT_EXCLUSIONS;
    return set.has(name);
  }

  const vipG   = c.vipTents   * c.vipOccupancy;
  const stdG   = c.stdTents   * c.stdOccupancy;
  const naiG   = c.staffTents * c.staffOccupancy;
  const totalG = vipG + stdG + naiG;

  const messG = isExcluded("Dining chairs (mess tent)") ? vipG + stdG : totalG;

  const vipBeds   = c.vipTents;
  const stdBeds   = c.stdTents * 2;
  const naiBeds   = c.staffTents * 2;
  const totalBeds = vipBeds + stdBeds + naiBeds;
  const totalTents = c.vipTents + c.stdTents + c.staffTents;

  const messTents = messG === 0 ? 0 : Math.max(1, ceil(messG / c.messSeats));

  const naiShowers = c.staffTents === 0 ? 0
    : c.sharedNaivashaWashrooms ? 1
    : Math.max(1, c.naivashaShowerCount);
  const naiToilets = c.staffTents === 0 ? 0
    : c.sharedNaivashaWashrooms ? 1
    : Math.max(1, c.naivashaToiletCount);

  const buf = 1 + c.foodBufferPct / 100;
  const b  = (n: number) => ceil(n * buf);
  const bd = (n: number) => ceil(n * buf);

  const totalTissueRolls = b(ceil(totalG * c.days));
  const totalGuestSoaps  = b(ceil(totalG * c.days));
  const totalHandWash    = Math.max(1, b(ceil(totalG * c.days * 0.1)));
  const generators = c.includePower ? Math.max(1, ceil(totalTents / 15)) : 0;

  const vipPalettes   = c.vipTents;
  const stdPalettes   = c.stdTents;
  const naiPalettes   = c.staffTents * 2;
  const totalPalettes = vipPalettes + stdPalettes + naiPalettes;

  const bedPocketTents = c.vipTents + c.stdTents + (isExcluded("Bed pockets") ? 0 : c.staffTents);
  const dustbinTents   = c.vipTents + c.stdTents + (isExcluded("Small closable dustbins (tents)") ? 0 : c.staffTents);
  const vanityCount    = c.vipTents + c.stdTents + (isExcluded("Vanity basins (ensuite)") ? 0 : c.staffTents);
  const slipperCount   = vipG + stdG + (isExcluded("Bed slippers (waffle)") ? 0 : naiG);
  const faceTowelCount = vipG + stdG + (isExcluded("Face towels") ? 0 : naiG);
  const bathMatCount   = c.vipTents + c.stdTents + (isExcluded("Bath mats") ? 0 : c.staffTents);

  const mkekasBig   = c.vipTents + c.stdTents + (isExcluded("Plastic Mkeka - Big (verandah)") ? 0 : c.staffTents);
  const mkekasSmall = c.vipTents + c.stdTents;

  const vipLampShades = c.vipTents * 2;
  const stdLampShades = c.stdTents * c.stdOccupancy;
  const totalLampShades = vipLampShades + stdLampShades;

  const washBags = c.vipTents + c.stdTents;
  const diningChairs = messG;
  const diningTables = messG === 0 ? 0 : ceil(messG / 6);

  const categories: EquipmentCategory[] = [
    // 1. Tents & Structures
    cat("Tents & Structures", "#534AB7", (() => {
      const items: EquipmentItem[] = [];
      if (c.vipTents   > 0) items.push(item("VVIP ensuite tents", c.vipTents));
      if (c.stdTents   > 0) items.push(item("Jaspal Type (Std) ensuite tents", c.stdTents));
      if (c.staffTents > 0) items.push(item("SA Naivasha (Detached) tents", c.staffTents));
      if (messTents    > 0) items.push(item(`Mess / dining tent (${c.messTentSize})`, messTents));
      if (!c.selfCatering) {
        items.push(item("Kitchen tent", 1));
        items.push(item("Store tent", 1));
      }
      if (naiShowers > 0) items.push(item("Shower cubicles (Naivasha detached)", naiShowers));
      if (naiToilets > 0) items.push(item("Toilet cubicles (Naivasha detached)", naiToilets));
      const structureTotal = totalTents + messTents + naiShowers + naiToilets + (c.selfCatering ? 0 : 2);
      items.push(item("TOTAL structures", structureTotal));
      return items;
    })()),

    // 2. Sleeping & Bedding
    cat("Sleeping & Bedding", "#2D6A4F", (() => {
      const items: EquipmentItem[] = [];
      if (c.vipTents   > 0) items.push(item("VVIP 5×6 Beds", vipBeds));
      if (c.stdTents   > 0) items.push(item("Jaspal 3×6 Single Beds", stdBeds));
      if (c.staffTents > 0) items.push(item("SA Naivasha 3×6 Beds", naiBeds));
      items.push(item("TOTAL beds", totalBeds));
      if (c.vipTents   > 0) items.push(item("Mattresses (VVIP 5×6)", vipBeds));
      const singleMattresses = stdBeds + naiBeds;
      if (singleMattresses > 0) items.push(item("Mattresses (Single 3×6)", singleMattresses));
      items.push(item("Pillows", b(totalG)));
      if (c.vipTents > 0) items.push(item("Bed sheets (VVIP Sets)", b(vipBeds * c.days)));
      const singleSheets = stdBeds + naiBeds;
      if (singleSheets > 0) items.push(item("Bed sheets (Single Sets)", b(singleSheets * c.days)));
      items.push(item("Bed throws / duvets", b(totalBeds)));
      if (bedPocketTents > 0) items.push(item("Bed pockets", bedPocketTents));
      if (vanityCount    > 0) items.push(item("Vanity basins (ensuite)", vanityCount));
      if (slipperCount   > 0) items.push(item("Bed slippers (waffle)", slipperCount));
      if (washBags       > 0) items.push(item("Wash bags (VIP + Jaspal)", washBags));
      items.push(item("Shower curtains", c.vipTents + c.stdTents + naiShowers));
      if (bathMatCount   > 0) items.push(item("Bath mats", bathMatCount));
      return items;
    })()),

    // 3. Furniture & Seating
    cat("Furniture & Seating", "#1A6FA8", (() => {
      const items: EquipmentItem[] = [];
      const foldingChairTents = c.vipTents + c.stdTents + (isExcluded("Outdoor folding chairs (tents)") ? 0 : c.staffTents);
      if (foldingChairTents > 0) items.push(item("Outdoor folding chairs (tents)", foldingChairTents * 2));
      const metalTableTents = c.vipTents + c.stdTents + (isExcluded("Verandah metal tables") ? 0 : c.staffTents);
      if (metalTableTents   > 0) items.push(item("Verandah metal tables", metalTableTents));
      if (diningChairs > 0) items.push(item("Dining chairs (mess tent)", diningChairs));
      if (diningTables > 0) items.push(item("Dining tables (mess)", diningTables));
      const bedsideStoolTents = c.vipTents + c.stdTents + (isExcluded("Bedside wooden folding stools") ? 0 : c.staffTents);
      if (bedsideStoolTents > 0) items.push(item("Bedside wooden folding stools", bedsideStoolTents * 2));
      if (totalTents      > 0) items.push(item("Mirrors (1 per tent)", totalTents));
      if (dustbinTents    > 0) items.push(item("Small closable dustbins (tents)", dustbinTents));
      if (totalLampShades > 0) items.push(item("Lamp shades (VVIP + Jaspal)", totalLampShades));
      if (messTents       > 0) items.push(item("Dust bins / baskets (mess+store)", messTents + 2));
      if (c.vipTents      > 0) items.push(item("Trays wooden (welcome)", c.vipTents));
      return items;
    })()),

    // 4. Washroom Equipment
    cat("Washroom Equipment", "#993C1D", (() => {
      const items: EquipmentItem[] = [];
      const flushingTents = c.vipTents + c.stdTents;
      if (flushingTents > 0) items.push(item("Flushing toilets (ensuite VIP + Jaspal)", flushingTents));
      if (naiToilets    > 0) items.push(item("Chemical toilets (Naivasha)", naiToilets));
      const showerBuckets = c.vipTents + c.stdTents + naiShowers;
      if (showerBuckets > 0) items.push(item("Shower buckets", showerBuckets));
      if (totalPalettes > 0) {
        if (c.vipTents   > 0) items.push(item("Wood palettes (VVIP — shower only)", vipPalettes));
        if (c.stdTents   > 0) items.push(item("Wood palettes (Jaspal — shower only)", stdPalettes));
        if (c.staffTents > 0) items.push(item("Wood palettes (Naivasha — shower+toilet)", naiPalettes));
      }
      const bathTowels = bd(totalG * 1.2);
      if (bathTowels     > 0) items.push(item("Bath towels grey 70×140", bathTowels));
      if (faceTowelCount > 0) items.push(item("Face towels", b(faceTowelCount)));
      return items;
    })()),

    // 5. Toiletries & Supplies
    cat("Toiletries & Supplies", "#FF7A5A", (() => {
      const items: EquipmentItem[] = [];
      if (totalTissueRolls > 0) items.push(item("Toilet tissue rolls (1/day/person)", totalTissueRolls));
      if (totalGuestSoaps  > 0) items.push(item("Small guest soaps (1/day/person)", totalGuestSoaps));
      if (totalHandWash    > 0) items.push(item("Hand wash bottles (liquid)", totalHandWash));
      if (totalG           > 0) items.push(item("Amenity / toiletries kits", totalG));
      if (totalTents       > 0) items.push(item("Sanitary bags (packs)", b(totalTents)));
      if (totalG           > 0) items.push(item("Laundry bags (cotton)", totalG));
      return items;
    })()),

    // 6. Flooring & Decoration
    cat("Flooring & Decoration", "#52A8E8", (() => {
      const items: EquipmentItem[] = [];
      if (mkekasBig   > 0) items.push(item("Plastic Mkeka - Big (verandah)", mkekasBig));
      if (mkekasSmall > 0) items.push(item("Plastic Mkeka - Small (closet)", mkekasSmall));
      const sisalMkekas = c.vipTents + c.stdTents;
      if (sisalMkekas > 0) items.push(item("Sisal Mkeka (bedroom area)", sisalMkekas));
      if (!isExcluded("Plastic Mkeka (Naivasha bedroom)") && c.staffTents > 0)
        items.push(item("Plastic Mkeka (Naivasha bedroom)", c.staffTents));
      return items;
    })()),

    // 7. Catering & Kitchen
    cat("Catering & Kitchen", "#C8922A", c.selfCatering
      ? [item("Mess tent provided (client caters)", messTents)]
      : (() => {
        const items: EquipmentItem[] = [];
        if (totalG > 0) {
          items.push(item("Dinner plates white", b(totalG)));
          items.push(item("Side plates", b(totalG)));
          items.push(item("Soup bowls", b(totalG)));
          items.push(item("Dessert bowls", b(totalG)));
          items.push(item("Mugs / cups", b(totalG * 2)));
          items.push(item("Glasses water", b(totalG)));
          items.push(item("Serving dishes / platters", ceil(totalG / 5)));
          items.push(item("Sufurias / cooking pots", ceil(totalG / 10) + 2));
          items.push(item("High pressure burner (double)", maxN(1, ceil(totalG / 30))));
          items.push(item("Coolers / ice boxes", ceil(totalG / 20) + 1));
          items.push(item("Drinking water bottles (metal)", totalG));
        }
        return items;
      })()
    ),

    // 8. Power & Lighting
    cat("Power & Lighting", "#993356", (() => {
      const items: EquipmentItem[] = [];
      if (c.includePower) items.push(item("Generator 4KVA silent", generators));
      items.push(item("Solar D-lights (tent lights)", totalTents + messTents));
      items.push(item("Kerosene lanterns (paths)", ceil(totalTents * 2)));
      if (c.includeSolar) items.push(item("Solar spike lights (paths)", ceil(totalTents * 1.5)));
      items.push(item("Power charging bars", ceil(totalTents / 4) + 2));
      return items;
    })()),

    // 9. Safety & Operations
    cat("Safety & Operations", "#5F5E5A", (() => {
      const items: EquipmentItem[] = [];
      items.push(item("Trash bags (daily ×2)", totalG * c.days * 2));
      if (c.includeMedical) items.push(item("First aid kits", maxN(1, ceil(totalG / 20))));
      items.push(item("Fire extinguishers", maxN(2, ceil(totalTents / 8))));
      items.push(item("Tent markers", totalTents));
      items.push(item("Njembes", maxN(1, ceil(totalTents / 10))));
      return items;
    })()),
  ];

  return {
    config: c,
    categories,
    totalGuests: totalG,
    totalTents,
    totalBeds,
    refNumber: ref,
    createdAt: Date.now(),
    status: "DRAFT",
    isDraft: false,
  };
}

export function nextRefNumber(existing: string[]): string {
  const nums = existing
    .map(r => parseInt(r.replace(/[^0-9]/g, ""), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `KFC-${String(next).padStart(4, "0")}`;
}
