"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // In production, Server Component errors arrive with a generic message and
    // a `digest` that matches the server log entry.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-raised p-10 text-center"
    >
      {/* Neutral title: this boundary catches every error under (root),
          database and session failures included, not only market data. */}
      <h2 className="empty-title">This page didn&apos;t load</h2>
      <p className="empty-description">
        Check your connection, then try again. If it keeps failing, market data may be briefly
        unavailable.
      </p>
      <button type="button" onClick={() => retry()} className="btn-primary px-6">
        Try again
      </button>
    </div>
  );
}
