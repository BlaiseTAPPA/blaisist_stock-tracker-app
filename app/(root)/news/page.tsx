import type { Metadata } from "next";
import NewsTabs from "@/components/NewsTabs";

export const metadata: Metadata = {
  title: "News",
  description: "Market news by industry: technology, finance, energy, healthcare and more.",
};

export default function NewsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-100">Market News</h1>
      <NewsTabs />
    </section>
  );
}
