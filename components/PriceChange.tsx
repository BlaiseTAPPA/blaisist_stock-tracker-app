import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type PriceChangeProps = {
  /** Percent change (e.g. `1.23` for +1.23 %); `undefined` when no quote. */
  value?: number;
  className?: string;
};

type Direction = "up" | "down" | "flat" | "unknown";

function getDirection(value: number | undefined): Direction {
  if (typeof value !== "number" || !Number.isFinite(value)) return "unknown";
  // Same rounding as formatPercent: "0.00%" is shown as flat, never as a gain.
  if (Math.round(Math.abs(value) * 100) === 0) return "flat";
  return value > 0 ? "up" : "down";
}

const COLOR: Record<Direction, string> = {
  up: "text-gain",
  down: "text-loss",
  flat: "text-fg-muted",
  unknown: "text-fg-muted",
};

/**
 * Signed percent change. Direction is conveyed by colour, sign and arrow; the
 * arrow is decorative and screen readers get "up" / "down" instead.
 */
const PriceChange = ({ value, className }: PriceChangeProps) => {
  const direction = getDirection(value);

  return (
    <span
      className={cn("inline-flex items-center gap-1 tabular-nums", COLOR[direction], className)}
    >
      {direction === "up" && (
        <>
          <span aria-hidden="true">▲</span>
          <span className="sr-only">up</span>
        </>
      )}
      {direction === "down" && (
        <>
          <span aria-hidden="true">▼</span>
          <span className="sr-only">down</span>
        </>
      )}
      {direction === "unknown" && <span className="sr-only">change not available</span>}
      <span aria-hidden={direction === "unknown" ? true : undefined}>{formatPercent(value)}</span>
    </span>
  );
};

export default PriceChange;
