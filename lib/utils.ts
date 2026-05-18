export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function fmt(n: number): string {
  return n.toLocaleString("en-KE");
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function statusLabel(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");
}

export function statusClass(s: string): string {
  switch (s) {
    case "CONFIRMED": return "badge-confirmed";
    case "DEPLOYED":  return "badge-deployed";
    case "COMPLETED": return "badge-completed";
    default:          return "badge-draft";
  }
}

export function catColorStyle(hex: string, alpha = 0.15) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return {
    background: `rgba(${r},${g},${b},${alpha})`,
    borderColor: `rgba(${r},${g},${b},0.35)`,
    color: hex,
  };
}
