import { StockPageSkeleton } from "@/components/dashboard/skeletons";

// Same shape as the stock page: the header (logo, name, price, watchlist
// button), the chart tabs and the chart.
export default function Loading() {
  return <StockPageSkeleton />;
}
