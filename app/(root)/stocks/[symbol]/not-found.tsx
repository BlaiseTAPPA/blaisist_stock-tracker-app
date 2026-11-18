import Link from "next/link";
import SearchTrigger from "@/components/search/SearchTrigger";

// Rendered inside the (root) layout, which already provides the <main> and the
// search palette that the trigger below opens.
export default function SymbolNotFound() {
  return (
    <section className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <p className="font-mono text-sm text-yellow-500">404</p>
      <h1 className="empty-title">Symbol not found</h1>
      <p className="empty-description">
        We couldn&apos;t find a stock with this symbol. Check the ticker or search for the company.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <SearchTrigger
          variant="link"
          label="Search stocks"
          className="yellow-btn inline-flex items-center px-6"
        />
        <Link href="/" className="text-sm text-gray-500 transition-colors hover:text-yellow-500">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
