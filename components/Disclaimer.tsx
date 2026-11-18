import { cn } from "@/lib/utils";

/** "Not financial advice" notice, shown on every signed-in page and on the auth pages. */
const Disclaimer = ({ className }: { className?: string }) => (
  <p className={cn("text-xs leading-relaxed text-fg-muted", className)}>
    FinGenius provides market information for educational purposes only. It is not financial advice.
    Data may be delayed.
  </p>
);

export default Disclaimer;
