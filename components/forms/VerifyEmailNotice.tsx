"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/actions/auth.actions";

type VerifyEmailNoticeProps = {
  email: string;
  title: string;
  description: string;
};

/** "Check your inbox" panel with a button to send a new verification link. */
const VerifyEmailNotice = ({ email, title, description }: VerifyEmailNoticeProps) => {
  const [isSending, setIsSending] = useState(false);

  const onResend = async () => {
    setIsSending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        toast.success("Verification email sent", {
          description: `If ${email} still needs to be verified, a new link is on its way.`,
        });
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not send the email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div role="status" className="space-y-3 rounded-lg border border-gray-600 bg-gray-800 p-4">
      <p className="font-semibold text-gray-100">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
      <Button
        type="button"
        variant="outline"
        onClick={onResend}
        disabled={isSending}
        className="w-full"
      >
        {isSending ? "Sending…" : "Resend verification email"}
      </Button>
    </div>
  );
};

export default VerifyEmailNotice;
