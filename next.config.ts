import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The end-to-end tests build into their own directory (set in
  // playwright.config.ts), so they never overwrite the regular `.next` build.
  ...(process.env.NEXT_DIST_DIR && { distDir: process.env.NEXT_DIST_DIR }),
  images: {
    // Hosts allowed for `next/image`. Company logos (SVG) and country flags
    // are rendered `unoptimized` (see StockLogo and CountrySelectField); the
    // allowlist keeps any optimized use limited to these paths.
    remotePatterns: [
      new URL("https://assets.parqet.com/logos/**"),
      new URL("https://flagcdn.com/**"),
    ],
  },
};

export default nextConfig;
