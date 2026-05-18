// ── Models — mirroring the Android app's data classes ─────────────────────────

export type QuoteStatus = "DRAFT" | "CONFIRMED" | "DEPLOYED" | "COMPLETED";
export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";

export interface CampConfig {
  clientName: string;
  campName: string;
  location: string;
  campType: string;
  startDate: string;
  days: number;
  notes: string;

  vipTents: number;
  stdTents: number;
  staffTents: number;

  vipOccupancy: number;
  stdOccupancy: number;
  staffOccupancy: number;

  mealsPerDay: number;
  foodBufferPct: number;
  selfCatering: boolean;

  messTentSize: string;
  messSeats: number;

  outsideChairsPerGuest: number;
  guestsPerOutsideTable: number;
  bedTablesVip: number;
  bedTablesStd: number;

  guestsPerShower: number;
  guestsPerToilet: number;
  sharedNaivashaWashrooms: boolean;
  naivashaShowerCount: number;
  naivashaToiletCount: number;
  naivashaIsStaff: boolean;
  staffExclusions: string;

  includeMedical: boolean;
  includePower: boolean;
  includeWelcome: boolean;
  includeSolar: boolean;

  parkKey: string;
  guestType: string;
  parkStartMonth: number;
  numVehicles: number;
  includeParkFees: boolean;
  parkFeePerPersonPerDay?: number;

  includeFuelCost?: boolean;
  dailyFuelCost?: number;
  includeTransport?: boolean;
  transportCost?: number;
}

export const defaultCampConfig = (): CampConfig => ({
  clientName: "",
  campName: "",
  location: "",
  campType: "Safari / Wildlife",
  startDate: "",
  days: 3,
  notes: "",
  vipTents: 0,
  stdTents: 0,
  staffTents: 0,
  vipOccupancy: 2,
  stdOccupancy: 2,
  staffOccupancy: 2,
  mealsPerDay: 3,
  foodBufferPct: 15,
  selfCatering: false,
  messTentSize: "6x9",
  messSeats: 8,
  outsideChairsPerGuest: 2,
  guestsPerOutsideTable: 4,
  bedTablesVip: 2,
  bedTablesStd: 1,
  guestsPerShower: 6,
  guestsPerToilet: 5,
  sharedNaivashaWashrooms: false,
  naivashaShowerCount: 1,
  naivashaToiletCount: 1,
  naivashaIsStaff: false,
  staffExclusions: "",
  includeMedical: true,
  includePower: true,
  includeWelcome: true,
  includeSolar: true,
  parkKey: "NONE",
  guestType: "NON_RESIDENT",
  parkStartMonth: new Date().getMonth() + 1,
  numVehicles: 1,
  includeParkFees: false,
});

export interface EquipmentItem {
  name: string;
  quantity: number;
}

export interface EquipmentCategory {
  name: string;
  colorHex: string;
  items: EquipmentItem[];
}

export interface ParkFeeSummary {
  parkName: string;
  guestType: string;
  entryFeePerPersonKes: number;
  campingFeePerPersonPerNightKes: number;
  numGuests: number;
  numDays: number;
  numNights: number;
  totalEntryFeesKes: number;
  totalCampingFeesKes: number;
  vehicleFeesKes: number;
  grandTotalKes: number;
}

export interface ManifestResult {
  config: CampConfig;
  categories: EquipmentCategory[];
  totalGuests: number;
  totalTents: number;
  totalBeds: number;
  refNumber: string;
  createdAt: number;
  parkFees?: ParkFeeSummary;
  status: QuoteStatus;
  isDraft: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  totalOwned: number;
  quantityAvailable: number;
  quantityDeployed: number;
  reorderThreshold: number;
  unitCost: number;
  supplier: string;
  notes: string;
  lastUpdated: number;
}

export function inventoryStatus(item: InventoryItem): InventoryStatus {
  if (item.quantityAvailable <= 0) return "OUT_OF_STOCK";
  if (item.quantityAvailable <= item.reorderThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export interface ToBuyItem {
  name: string;
  category: string;
  categoryColor: string;
  needed: number;
  inStock: number;
  shortfall: number;
  unitCost: number;
  estimatedTotal: number;
  supplier: string;
}

export const CAMP_TYPES = [
  "Safari / Wildlife",
  "Corporate Retreat",
  "Wedding / Events",
  "Family Group Safari",
  "School / Youth",
  "Military / Security",
  "Medical / Humanitarian",
  "Film & Media Production",
  "NGO / Community",
  "Other",
];

export const LOCATIONS = [
  "Maasai Mara, Kenya",
  "Laikipia, Kenya",
  "Amboseli, Kenya",
  "Naivasha, Kenya",
  "Samburu, Kenya",
  "Tsavo, Kenya",
  "Lamu, Kenya",
  "Kilimanjaro, Tanzania",
  "Serengeti, Tanzania",
  "Ngorongoro, Tanzania",
  "Kidepo, Uganda",
  "Bwindi, Uganda",
];
