import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import UnsubscribeConfirm from "@/components/UnsubscribeConfirm";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe-token";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
  referrer: "no-referrer",
};

// Reached from the digest email, signed in or not. Opening the page changes
// nothing: only the button does (link scanners open every URL in an email).
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && verifyUnsubscribeToken(token) !== null;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 px-4 py-10 sm:py-16">
      <Link href="/" className="mb-10 rounded-sm focus-ring">
        <Image
          src="/assets/icons/logo.svg"
          alt="FinGenius home"
          width={140}
          height={32}
          className="h-8 w-auto"
        />
      </Link>
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 sm:p-8">
        {valid ? (
          <UnsubscribeConfirm token={token} />
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-100">This link doesn&apos;t work</h1>
            <p role="alert" className="text-gray-400">
              The unsubscribe link is incomplete or invalid. Sign in and turn the daily digest off
              in your settings.
            </p>
            <Link href="/settings" className="footer-link">
              Email settings
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
