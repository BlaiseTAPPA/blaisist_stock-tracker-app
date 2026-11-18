import RetryButton from "@/components/dashboard/RetryButton";

// Server component: only the Retry button ships to the client.
const MarketDataUnavailable = () => (
  <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
    <p role="status">Prices are unavailable right now.</p>
    <RetryButton />
  </div>
);

export default MarketDataUnavailable;
