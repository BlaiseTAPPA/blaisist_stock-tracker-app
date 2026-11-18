import type { Metadata } from "next";
import { Suspense } from "react";
import NewsTabs from "@/components/NewsTabs";
import { TopHeadlines } from "@/components/dashboard/NewsSection";
import { NewsSkeleton } from "@/components/dashboard/skeletons";

export const metadata: Metadata = {
  title: "News",
  description:
    "Top market headlines, and market news by industry: technology, finance, energy, healthcare and more.",
};

// Not async: the title and the tabs go out first, the headlines stream in.
export default function NewsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-100">Market news</h1>
      <NewsTabs
        headlines={
          <Suspense fallback={<NewsSkeleton />}>
            <TopHeadlines />
          </Suspense>
        }
      />
    </section>
  );
}
