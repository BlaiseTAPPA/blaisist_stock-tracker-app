import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// UI and data: IBM Plex Sans has true tabular figures (`tabular-nums`), so
// prices and percentages line up in columns.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
});

// Headings only (`text-display`, `text-title`, `text-section`).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Tickers only: a ticker is a code.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Absolute base for URL-based metadata (Open Graph, canonical). An unset or
// malformed variable must not break every page: fall back to the dev server.
function getMetadataBase(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: { default: "FinGenius", template: "%s | FinGenius" },
  description:
    "Follow stock prices and charts, keep a personal watchlist, explore company profiles and financials, and get a daily market news digest by email.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${bricolage.variable} ${plexMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
