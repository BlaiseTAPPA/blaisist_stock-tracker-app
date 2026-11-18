// Navigation fallback for (root) pages that have no `loading.tsx` of their own
// (news, heatmap…). The layout (session check + Header) stays visible above
// it. Neutral on purpose: a page title and one block, never the shape of a
// specific page. The dashboard streams its own sections, the stock page and
// `/watchlist` have their own skeletons.

import { PageSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
  return <PageSkeleton />;
}
