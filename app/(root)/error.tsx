"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function DashboardError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    // In production, Server Component errors arrive with a generic message and
    // a `digest` that matches the server log entry.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-gray-600 bg-gray-800 p-10 text-center"
    >
      <h2 className="empty-title">Market data is temporarily unavailable</h2>
      <p className="empty-description">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <button type="button" onClick={() => retry()} className="yellow-btn px-6">
        Try again
      </button>
    </div>
  );
}
