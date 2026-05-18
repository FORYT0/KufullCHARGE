"use client";
import { useEffect } from "react";
import { getSavedTheme, applyTheme } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved theme on every page load / mount
    applyTheme(getSavedTheme());
  }, []);

  return <>{children}</>;
}
