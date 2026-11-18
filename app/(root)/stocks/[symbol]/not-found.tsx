import Link from "next/link";
import SearchTrigger from "@/components/search/SearchTrigger";

// Rendered inside the (root) layout, which already provides the <main> and the
// search palette that the trigger below opens.
export default function SymbolNotFound() {
  return (
    <section className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <p className="text-caption font-semibold tracking-widest text-brand">404</p>
      <h1 className="empty-title">Symbol not found</h1>
      <p className="empty-description">
        No stock matches this symbol. Check the ticker or search by company name.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <SearchTrigger
          variant="link"
          label="Search stocks"
          className="btn-primary inline-flex items-center px-6"
        />
        <Link
          href="/"
          className="rounded-sm text-sm text-fg-muted focus-ring transition-colors hover:text-brand"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
