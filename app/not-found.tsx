import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-10 text-center text-gray-400">
      <p className="font-mono text-sm text-yellow-500">404</p>
      <h1 className="empty-title">Page not found</h1>
      <p className="empty-description">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="yellow-btn inline-flex items-center px-6">
        Back to dashboard
      </Link>
    </main>
  );
}
