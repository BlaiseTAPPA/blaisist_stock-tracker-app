import { unsubscribeFromDigest } from "@/lib/email/unsubscribe";

/**
 * RFC 8058 one-click unsubscribe, the target of the digest's
 * `List-Unsubscribe` header. The mail client POSTs
 * `List-Unsubscribe=One-Click` to this URL; the signed token in the query
 * string names the user. There is no GET handler on purpose: link scanners
 * prefetch GET URLs and must not unsubscribe anyone. People clicking the link
 * in the email land on the /unsubscribe confirmation page instead.
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const result = await unsubscribeFromDigest(token);

  if (result === "invalid") return new Response("Invalid unsubscribe link", { status: 400 });
  if (result === "error") return new Response("Try again later", { status: 503 });
  return new Response("Unsubscribed", { status: 200 });
}
