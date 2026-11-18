import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-10 text-center text-fg-secondary">
      <p className="text-caption font-semibold tracking-widest text-brand">404</p>
      <h1 className="empty-title">Page not found</h1>
      <p className="empty-description">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary inline-flex items-center px-6">
        Back to dashboard
      </Link>
    </main>
  );
}
