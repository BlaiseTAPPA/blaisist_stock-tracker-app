"use client"; // Error boundaries must be Client Components

// Catches errors in the root layout and in segment layouts that no error.tsx
// wraps, e.g. app/(root)/layout.tsx when the session/database check fails.
// It replaces the root layout, so it renders its own <html>/<body> and imports
// the global styles itself.
import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center gap-2 p-10 text-center text-gray-400 antialiased">
        <title>Something went wrong</title>
        <div role="alert" className="flex flex-col items-center">
          <h1 className="empty-title">Something went wrong</h1>
          <p className="empty-description">
            The app couldn&apos;t load. Please try again in a moment.
          </p>
          <button type="button" onClick={() => retry()} className="yellow-btn px-6">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
