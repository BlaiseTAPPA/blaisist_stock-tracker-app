import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChartCandlestick, Mail, Star } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";

// What the app does today, nothing more: no testimonial, no promised feature.
const FEATURES = [
  {
    icon: Star,
    title: "Personal watchlist",
    text: "Keep the stocks you follow in one place, with their latest price and daily change.",
  },
  {
    icon: ChartCandlestick,
    title: "TradingView charts",
    text: "Interactive charts, technical analysis, company profiles and financials for each stock.",
  },
  {
    icon: Mail,
    title: "Daily email digest",
    text: "A summary of the market news for the stocks in your watchlist, once a day.",
  },
] as const;

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/");

  return (
    <main className="auth-layout">
      <section className="auth-left-section scrollbar-hide-default">
        <Link href="/" className="auth-logo w-fit rounded-sm focus-ring">
          <Image
            src="/assets/icons/logo.svg"
            alt="FinGenius home"
            width={175}
            height={96}
            className="h-24 w-auto"
          />
        </Link>
        <div className="flex-1 pb-6 lg:pb-8">
          {children}
          <Disclaimer className="mt-8" />
        </div>
      </section>
      <section className="auth-right-section">
        <div className="relative z-10 lg:mt-4 lg:mb-16">
          <h2 className="auth-tagline">Follow the market, your way.</h2>
          <ul className="auth-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                <p>
                  <span className="font-semibold text-fg">{title}.</span> {text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex-1">
          <Image
            src="/assets/images/dashboard.png"
            alt="FinGenius dashboard preview"
            width={1877}
            height={875}
            className="auth-dashboard-preview absolute top-0"
          />
        </div>
      </section>
    </main>
  );
};

export default layout;
