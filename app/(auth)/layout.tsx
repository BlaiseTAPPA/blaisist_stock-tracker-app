import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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
            width={140}
            height={32}
            className="h-auto w-auto"
          />
        </Link>
        <div className="flex-1 pb-6 lg:pb-8">{children}</div>
      </section>
      <section className="auth-right-section">
        <div className="relative z-10 lg:mt-4 lg:mb-16">
          <blockquote className="auth-blockquote">
            FinGenius turned my watchlist into a winning list. The alerts are spot-on, and I feel
            more confident making moves in the market
          </blockquote>
          <div className="flex items-center justify-between">
            <div>
              <cite className="auth-testimonial-author">- Blaise TAPPA</cite>
              <p className="text-gray-500 max-md:text-xs">Trusted Investor</p>
            </div>{" "}
            <div role="img" aria-label="5 out of 5 stars" className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  src="/assets/icons/star.svg"
                  alt=""
                  key={star}
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <Image
            src="/assets/images/dashboard.png"
            alt="FinGenius dashboard preview"
            width={1440}
            height={1150}
            className="auth-dashboard-preview absolute top-0"
          />
        </div>
      </section>
    </main>
  );
};

export default layout;
