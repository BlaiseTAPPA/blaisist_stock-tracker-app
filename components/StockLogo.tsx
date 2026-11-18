"use client";

import { useState } from "react";
import Image from "next/image";

type StockLogoProps = {
  symbol: string;
};

/**
 * Company logo from parqet, with the ticker's first letters as fallback.
 *
 * `unoptimized`: the logos are SVG, which the Image Optimization API never
 * processes (Next recommends `unoptimized` over `dangerouslyAllowSVG`), and
 * parqet answers server-side fetches without a browser user agent with 403.
 * `next/image` still sets the size, `loading="lazy"` and `decoding="async"`.
 * The logo is decorative: the company name and symbol are always shown next to it.
 */
const StockLogo = ({ symbol }: StockLogoProps) => {
  const src = `https://assets.parqet.com/logos/symbol/${encodeURIComponent(symbol)}?format=svg`;
  // Keyed by `src`, so a new symbol gets a fresh attempt without an effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
      {failedSrc === src ? (
        <span aria-hidden="true" className="text-xs font-bold text-gray-400">
          {symbol.slice(0, 2)}
        </span>
      ) : (
        <Image
          src={src}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="h-8 w-8 object-contain"
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
};

export default StockLogo;
