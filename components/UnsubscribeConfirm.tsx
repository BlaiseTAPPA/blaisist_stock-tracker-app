"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { confirmDigestUnsubscribe } from "@/lib/actions/email.actions";
import type { UnsubscribeResult } from "@/lib/email/unsubscribe";

const UnsubscribeConfirm = ({ token }: { token: string }) => {
  const [result, setResult] = useState<UnsubscribeResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () =>
    startTransition(async () => {
      try {
        setResult(await confirmDigestUnsubscribe(token));
      } catch (e) {
        console.error(e);
        setResult("error");
      }
    });

  if (result === "unsubscribed") {
    return (
      <div role="status" className="space-y-4">
        <h1 className="text-title">You&apos;re unsubscribed</h1>
        <p className="text-fg-secondary">
          You won&apos;t receive the daily news digest any more. You can turn it back on at any time
          in your settings.
        </p>
        <Link href="/settings" className="footer-link">
          Email settings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-title">Unsubscribe from the daily digest?</h1>
      <p className="text-fg-secondary">
        You&apos;ll stop receiving the daily news summary for your watchlist. Account emails, like
        password resets, are not affected.
      </p>
      {result === "invalid" && (
        <p role="alert" className="text-sm text-danger">
          This unsubscribe link is invalid. Turn the digest off in your settings instead.
        </p>
      )}
      {result === "error" && (
        <p role="alert" className="text-sm text-danger">
          Something went wrong. Try again in a moment.
        </p>
      )}
      <Button type="button" onClick={onConfirm} disabled={isPending} className="btn-primary w-full">
        {isPending ? "Unsubscribing…" : "Unsubscribe"}
      </Button>
      <p className="text-center text-sm text-fg-muted">Changed your mind? Just close this page.</p>
    </div>
  );
};

export default UnsubscribeConfirm;
