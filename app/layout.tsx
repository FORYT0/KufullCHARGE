import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KuFull CHARGE — Plan · Pack · Camp",
  description:
    "Your all-in-one safari camp equipment management platform. Calculate, organize, and deploy luxury camps with precision.",
  keywords: ["safari camp", "camp equipment", "camp manifest", "KuFull CHARGE", "safari logistics"],
  openGraph: {
    title: "KuFull CHARGE",
    description: "Plan · Pack · Camp — Safari equipment management platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
